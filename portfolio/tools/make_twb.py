"""Generate Tableau .twb workbooks with the data sources and calculated fields
from portfolio/specs/ already built.

A .twb is plain XML, so the tedious half of the build — wiring the CSVs, typing
out every calculated field without a typo, defining the parameter — can be
generated. The sheets themselves are not: hand-written worksheet XML is fragile
and Tableau is unforgiving about it. You drag the pills; this saves you the
setup and the calc-editor typing.

Run this on the machine where Tableau Desktop is installed:

    python make_twb.py --data-root "C:/Users/Mike/Projects/spreadsheet-archaeology/portfolio/data"
    python make_twb.py                      # defaults to ../data next to this script

Writes one .twb per piece into --outdir (default: portfolio/tools/workbooks).
Open in Tableau Desktop, confirm the data source is green, then build the
sheets following portfolio/specs/.

Tableau writes absolute paths into a .twb, so regenerate rather than moving the
file between machines.
"""

import argparse
import xml.etree.ElementTree as ET
from pathlib import Path
from xml.dom import minidom

VERSION = "18.1"          # workbook schema — read by Tableau 2021.4 and later
SOURCE_BUILD = "2021.4.0"


# --------------------------------------------------------------------------
# Piece definitions: which CSVs, how they join, and every calculated field.
# Formulas are copied from portfolio/specs/ — keep the two in sync.
# --------------------------------------------------------------------------

PIECES = {
    "01-where-the-margin-went": {
        "dir": "01-retail-margin",
        "caption": "Sales",
        "tables": ["fact_sales", "dim_store", "dim_item"],
        # (left_table, left_col, right_table, right_col)
        "joins": [
            ("fact_sales", "store_id", "dim_store", "store"),
            ("fact_sales", "item_id", "dim_item", "itemno"),
        ],
        "params": [],
        "calcs": [
            ("Margin %", "real", "measure", "quantitative",
             "SUM([gross_margin]) / SUM([sale_dollars])"),
            ("Units Sold (Net)", "integer", "measure", "quantitative",
             "SUM([sale_bottles])"),
            ("Units Sold (Gross)", "integer", "measure", "quantitative",
             "SUM(IF NOT [is_return] THEN [sale_bottles] END)"),
            ("Weeks In Window", "real", "measure", "quantitative",
             "(MAX([date]) - MIN([date])) / 7"),
            ("Units Per Week", "real", "measure", "quantitative",
             "[Units Sold (Net)] / [Weeks In Window]"),
            ("Dead Stock Flag", "string", "dimension", "nominal",
             'IF [Units Per Week] < 2 AND [Margin %] < 0.20 THEN "Cut candidate"\n'
             'ELSEIF [Units Per Week] < 2 THEN "Slow mover"\n'
             'ELSEIF [Margin %] < 0.20 THEN "Thin margin"\n'
             'ELSE "Healthy"\nEND'),
            ("Margin Coverage", "real", "measure", "quantitative",
             "SUM(IF [has_cost] THEN [sale_dollars] END) / SUM([sale_dollars])"),
        ],
    },

    "02-the-money-you-already-earned": {
        "dir": "02-cash-flow",
        "caption": "Invoices",
        "tables": ["fact_invoices", "dim_customer"],
        "joins": [("fact_invoices", "customer", "dim_customer", "customer")],
        "params": [
            # (caption, datatype, default, min, max, step)
            ("Interest Rate", "real", 0.09, 0.0, 0.30, 0.01),
        ],
        "calcs": [
            ("Aging Bucket (sorted)", "integer", "dimension", "ordinal",
             'CASE [aging_bucket]\n'
             '  WHEN "Current" THEN 1 WHEN "1-30" THEN 2 WHEN "31-60" THEN 3\n'
             '  WHEN "61-90" THEN 4 WHEN "90+" THEN 5 ELSE 6 END'),
            ("Aged AR", "real", "measure", "quantitative",
             "SUM([open_balance])"),
            ("% of Open AR", "real", "measure", "quantitative",
             "SUM([open_balance]) / TOTAL(SUM([open_balance]))"),
            ("Cost of Float (annual)", "real", "measure", "quantitative",
             "SUM([open_balance]) * [Interest Rate] * (AVG([days_past_due]) / 365)"),
            ("Estimated Due Date Share", "real", "measure", "quantitative",
             "SUM(IF [due_date_estimated] THEN [open_balance] END) / SUM([open_balance])"),
        ],
    },

    "03-where-the-wait-actually-is": {
        "dir": "03-clinic-flow",
        "caption": "Facility Flow",
        # facility_flow is already pivoted wide. dim_benchmark is keyed on
        # state + measure_id, which has no counterpart in the wide table — so
        # it is NOT joined here. Build the benchmark-deviation sheet against
        # fact_measures.csv as a second data source (see the spec).
        "tables": ["facility_flow"],
        "joins": [],
        "params": [],
        "calcs": [
            ("Boarding Share", "real", "measure", "quantitative",
             "AVG([boarding_share])"),
            ("Flow Status", "string", "dimension", "nominal",
             'IF [Boarding Share] > 0.40 AND AVG([left_without_being_seen_pct]) > 3\n'
             '    THEN "Capacity-constrained"\n'
             'ELSEIF AVG([left_without_being_seen_pct]) > 3\n'
             '    THEN "Losing patients to wait"\n'
             'ELSEIF [Boarding Share] > 0.40\n'
             '    THEN "Boarding pressure"\n'
             'ELSE "Within range"\nEND'),
            ("Reporting Completeness", "real", "measure", "quantitative",
             "SUM([measures_reported]) / SUM([measures_possible])"),
            ("Has LWBS", "boolean", "dimension", "nominal",
             "NOT ISNULL([left_without_being_seen_pct])"),
        ],
    },
}


def conn_name(table: str) -> str:
    return f"textscan.{abs(hash(table)) % 10**9:09d}"


def build_relation(tables: list[str], joins: list, names: dict) -> ET.Element:
    """Build the relation tree — a single table, or a left-join chain."""
    def table_rel(t: str) -> ET.Element:
        el = ET.Element("relation", {
            "connection": names[t], "name": f"{t}.csv",
            "table": f"[{t}#csv]", "type": "table",
        })
        return el

    if not joins:
        return table_rel(tables[0])

    # LEFT joins, chained. Left, not inner: an inner join silently drops fact
    # rows whose dimension key is missing, and the totals stop tying.
    current = table_rel(tables[0])
    for left_t, left_c, right_t, right_c in joins:
        join_el = ET.Element("relation", {"join": "left", "type": "join"})
        clause = ET.SubElement(join_el, "clause", {"type": "join"})
        expr = ET.SubElement(clause, "expression", {"op": "="})
        ET.SubElement(expr, "expression", {"op": f"[{left_t}].[{left_c}]"})
        ET.SubElement(expr, "expression", {"op": f"[{right_t}].[{right_c}]"})
        join_el.append(current)
        join_el.append(table_rel(right_t))
        current = join_el
    return current


def build_workbook(key: str, spec: dict, data_root: Path) -> ET.ElementTree:
    piece_dir = (data_root / spec["dir"] / "clean").resolve()

    wb = ET.Element("workbook", {
        "source-build": SOURCE_BUILD, "source-platform": "win",
        "version": VERSION,
        "xmlns:user": "http://www.tableausoftware.com/xml/user",
    })
    ET.SubElement(wb, "preferences")
    datasources = ET.SubElement(wb, "datasources")

    # ---- parameters live in their own pseudo-datasource -----------------
    if spec["params"]:
        pds = ET.SubElement(datasources, "datasource", {
            "hasconnection": "false", "inline": "true",
            "name": "Parameters", "version": VERSION,
        })
        ET.SubElement(pds, "aliases", {"enabled": "yes"})
        for caption, dtype, default, lo, hi, step in spec["params"]:
            col = ET.SubElement(pds, "column", {
                "caption": caption, "datatype": dtype,
                "name": f"[{caption}]", "param-domain-type": "range",
                "role": "measure", "type": "quantitative", "value": str(default),
            })
            ET.SubElement(col, "calculation", {"class": "tableau",
                                               "formula": str(default)})
            ET.SubElement(col, "range", {"granularity": str(step),
                                         "max": str(hi), "min": str(lo)})

    # ---- the CSV datasource ---------------------------------------------
    ds = ET.SubElement(datasources, "datasource", {
        "caption": spec["caption"], "inline": "true",
        "name": f"federated.{abs(hash(key)) % 10**9:09d}", "version": VERSION,
    })
    connection = ET.SubElement(ds, "connection", {"class": "federated"})
    named = ET.SubElement(connection, "named-connections")

    names = {t: conn_name(t) for t in spec["tables"]}
    for t in spec["tables"]:
        nc = ET.SubElement(named, "named-connection",
                           {"caption": t, "name": names[t]})
        ET.SubElement(nc, "connection", {
            "class": "textscan",
            "directory": str(piece_dir).replace("\\", "/"),
            "filename": f"{t}.csv",
            "password": "", "server": "",
        })

    connection.append(build_relation(spec["tables"], spec["joins"], names))

    # ---- calculated fields ------------------------------------------------
    for caption, dtype, role, ctype, formula in spec["calcs"]:
        col = ET.SubElement(ds, "column", {
            "caption": caption, "datatype": dtype,
            "name": f"[{caption}]", "role": role, "type": ctype,
        })
        ET.SubElement(col, "calculation", {"class": "tableau", "formula": formula})

    ET.SubElement(wb, "worksheets")
    ET.SubElement(wb, "dashboards")
    ET.SubElement(wb, "windows")

    return ET.ElementTree(wb)


def main() -> None:
    here = Path(__file__).resolve().parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-root", default=str(here.parent / "data"),
                    help="portfolio/data directory holding the piece folders")
    ap.add_argument("--outdir", default=str(here / "workbooks"))
    args = ap.parse_args()

    data_root = Path(args.data_root)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    for key, spec in PIECES.items():
        clean_dir = data_root / spec["dir"] / "clean"
        missing = [t for t in spec["tables"] if not (clean_dir / f"{t}.csv").exists()]
        if missing:
            print(f"  ! {key}: missing {', '.join(m + '.csv' for m in missing)} "
                  f"— run clean.py in {spec['dir']} first")
            continue

        tree = build_workbook(key, spec, data_root)
        raw = ET.tostring(tree.getroot(), encoding="utf-8")
        pretty = minidom.parseString(raw).toprettyxml(indent="  ", encoding="utf-8")

        out = outdir / f"{key}.twb"
        out.write_bytes(pretty)
        print(f"  ✓ {out.name}  "
              f"({len(spec['calcs'])} calcs, {len(spec['params'])} params, "
              f"{len(spec['tables'])} table(s))")

    print(f"\nWorkbooks in {outdir}/")
    print("Open in Tableau Desktop, confirm the data source connects, then")
    print("build the sheets following portfolio/specs/.")


if __name__ == "__main__":
    main()
