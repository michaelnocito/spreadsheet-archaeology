"""QuickBooks 'Open Invoices' report export -> Tableau-ready AR aging model.

    python clean.py                     # uses raw/ar_export.csv

Writes to clean/:
    fact_invoices.csv   one row per real invoice, typed, aged, bucketed
    dim_customer.csv    one row per customer, with risk profile
    kpi_summary.csv     DSO and aging totals, so the dashboard can't drift
    audit.csv           what was dropped or changed, and why

The hard part here is not the arithmetic. It is that the file is a *report*,
not a table: title rows above the header, subtotal rows inside the data, and a
grand total at the bottom. Sum the Amount column naively and you get roughly
double the truth, because every invoice is counted once as detail and again in
its customer subtotal.
"""

import argparse
import re
from pathlib import Path

import pandas as pd

AUDIT: list[dict] = []
BUCKETS = ["Current", "1-30", "31-60", "61-90", "90+"]


def note(step: str, rows: int, detail: str) -> None:
    AUDIT.append({"step": step, "rows_affected": rows, "detail": detail})
    print(f"  {step:<22} {rows:>7,}  {detail}")


def find_header(path: str) -> int:
    """Locate the real header row. Never assume it is row 0.

    QuickBooks puts the company name, report name, and date range above it, and
    the number of preamble rows changes with the report and the QB version.
    Anchor on a column name that is always present instead of hardcoding 4.
    """
    probe = pd.read_csv(path, header=None, nrows=25, dtype="string",
                        keep_default_na=False)
    for i, row in probe.iterrows():
        values = {str(v).strip().lower() for v in row.tolist()}
        if {"num", "customer"} <= values:
            return int(i)
    raise SystemExit("Could not find the header row — inspect the export by hand.")


def to_amount(series: pd.Series) -> pd.Series:
    """Accounting format -> float. '(1,250.00)' is NEGATIVE 1250, not 1250."""
    s = series.astype("string").str.strip().str.replace(r"[$,]", "", regex=True)
    negative = s.str.match(r"^\(.*\)$", na=False)
    s = s.str.replace(r"^\((.*)\)$", r"\1", regex=True)
    out = pd.to_numeric(s.replace("", pd.NA), errors="coerce")
    return out.mask(negative, -out)


def to_date(series: pd.Series) -> pd.Series:
    raw = series.astype("string").str.strip().replace("", pd.NA)
    out = pd.Series(pd.NaT, index=raw.index, dtype="datetime64[ns]")
    for fmt in ("%m/%d/%Y", "%b %d, %Y", "%Y-%m-%d"):
        todo = out.isna() & raw.notna()
        if not todo.any():
            break
        out.loc[todo] = pd.to_datetime(raw[todo], format=fmt, errors="coerce")
    return out


def canon_customer(name: str) -> str:
    """Strip QuickBooks job suffixes and normalise drift.

    'Cedar Ridge Dental:02' is a *job* under the customer 'Cedar Ridge Dental'.
    Rolling jobs up to the parent is what makes customer-level risk meaningful.
    """
    if not isinstance(name, str):
        return ""
    s = name.split(":")[0]
    s = " ".join(s.split())
    return s.title()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", default="raw/ar_export.csv")
    ap.add_argument("--outdir", default="clean")
    ap.add_argument("--asof", default=None, help="YYYY-MM-DD; defaults to today")
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    hdr = find_header(args.src)
    note("header_located", hdr, f"real header found at line {hdr + 1}, not line 1")

    df = pd.read_csv(args.src, header=hdr, dtype="string", keep_default_na=False)
    start_rows = len(df)
    print(f"\nLoaded {start_rows:,} lines below the header\n")

    # ---- 1. Strip the report scaffolding --------------------------------
    # A real invoice line has a numeric document number. Subtotal rows, spacer
    # rows and the grand total all have a blank Num. That single test removes
    # every non-data row without guessing at text patterns.
    df["Num"] = df["Num"].astype("string").str.strip()
    is_detail = df["Num"].str.fullmatch(r"\d+", na=False)

    subtotals = int(df["Customer"].astype("string").str.strip()
                    .str.match(r"^(Total|TOTAL)", na=False).sum())
    note("subtotal_rows", subtotals, "customer subtotals + grand total removed")
    note("spacer_rows", int((~is_detail).sum()) - subtotals, "blank separator rows removed")

    df = df[is_detail].copy()
    note("detail_rows", len(df), "real invoices retained")

    # ---- 2. Types --------------------------------------------------------
    df["amount"] = to_amount(df["Amount"])
    df["open_balance"] = to_amount(df["Open Balance"])
    df["invoice_date"] = to_date(df["Date"])
    df["due_date"] = to_date(df["Due Date"])
    df["last_payment"] = to_date(df["Last Payment"])
    df["terms"] = df["Terms"].astype("string").str.strip()
    df["status"] = df["Status"].astype("string").str.strip()

    credits = int((df["amount"] < 0).sum())
    note("credit_memos", credits, "negative lines kept — they reduce AR, not noise")

    # ---- 3. Recover missing due dates from terms -------------------------
    # Due date is the aging key. It can be *derived* from invoice date + terms,
    # which is recovery from a known rule, not a guess. Rows where terms are
    # also missing get flagged rather than invented.
    term_days = {"Net 15": 15, "Net 30": 30, "Net 45": 45, "Net 60": 60,
                 "Due on receipt": 0}
    missing_due = df["due_date"].isna()
    derivable = missing_due & df["terms"].isin(term_days) & df["invoice_date"].notna()
    df.loc[derivable, "due_date"] = (
        df.loc[derivable, "invoice_date"]
        + pd.to_timedelta(df.loc[derivable, "terms"].map(term_days), unit="D")
    )
    note("due_date_derived", int(derivable.sum()), "rebuilt from invoice date + terms")

    df["due_date_estimated"] = derivable
    unresolved = int(df["due_date"].isna().sum())
    if unresolved:
        note("due_date_unresolved", unresolved, "flagged, excluded from aging")

    # ---- 4. Customer roll-up ---------------------------------------------
    df["customer"] = df["Customer"].map(canon_customer)
    raw_names = df["Customer"].astype("string").str.strip().nunique()
    note("customer_dedupe", raw_names - df["customer"].nunique(),
         "name variants + job sub-customers collapsed to parent")

    # ---- 5. Aging ---------------------------------------------------------
    asof = pd.Timestamp(args.asof) if args.asof else pd.Timestamp.today().normalize()
    df["days_past_due"] = (asof - df["due_date"]).dt.days

    df["aging_bucket"] = pd.cut(
        df["days_past_due"],
        bins=[-10**6, 0, 30, 60, 90, 10**6],
        labels=BUCKETS,
        right=True,
    ).astype("string")
    df.loc[df["due_date"].isna(), "aging_bucket"] = "Unknown"

    # Only OPEN money ages. Aging the original amount on a partly-paid invoice
    # is the single most common error in a hand-built aging report.
    df["aged_balance"] = df["open_balance"].where(df["open_balance"] != 0)

    # ---- 6. KPIs ----------------------------------------------------------
    open_ar = float(df["open_balance"].sum())
    billed = float(df["amount"].sum())
    window_days = max((asof - df["invoice_date"].min()).days, 1)
    dso = open_ar / (billed / window_days) if billed else float("nan")

    over_90 = float(df.loc[df["aging_bucket"] == "90+", "open_balance"].sum())

    kpi = pd.DataFrame([
        {"metric": "Open AR", "value": round(open_ar, 2)},
        {"metric": "Total Billed", "value": round(billed, 2)},
        {"metric": "DSO (days)", "value": round(dso, 1)},
        {"metric": "Over 90 days", "value": round(over_90, 2)},
        {"metric": "Over 90 as % of AR", "value": round(over_90 / open_ar, 4) if open_ar else None},
        {"metric": "As-of date", "value": asof.date().isoformat()},
    ])

    dim_customer = (
        df.groupby("customer", as_index=False)
        .agg(open_balance=("open_balance", "sum"),
             total_billed=("amount", "sum"),
             invoices=("Num", "count"),
             avg_days_past_due=("days_past_due", "mean"),
             worst_days_past_due=("days_past_due", "max"))
        .sort_values("open_balance", ascending=False)
    )
    dim_customer["risk"] = pd.cut(
        dim_customer["avg_days_past_due"],
        bins=[-10**6, 0, 30, 60, 10**6],
        labels=["On time", "Slow", "Late", "Chronic"],
    ).astype("string")

    fact = df[[
        "Num", "customer", "invoice_date", "due_date", "terms", "amount",
        "open_balance", "aged_balance", "status", "days_past_due",
        "aging_bucket", "due_date_estimated", "last_payment",
    ]].rename(columns={"Num": "invoice_no"})

    fact.to_csv(outdir / "fact_invoices.csv", index=False)
    dim_customer.to_csv(outdir / "dim_customer.csv", index=False)
    kpi.to_csv(outdir / "kpi_summary.csv", index=False)
    pd.DataFrame(AUDIT).to_csv(outdir / "audit.csv", index=False)

    print(f"\n  {start_rows:,} lines -> {len(fact):,} invoices")
    print(f"  open AR      ${open_ar:,.0f}")
    print(f"  DSO          {dso:.1f} days")
    print(f"  over 90 days ${over_90:,.0f}  ({over_90 / open_ar:.1%} of AR)")
    print(f"  customers    {len(dim_customer)}  "
          f"({int((dim_customer['risk'] == 'Chronic').sum())} chronic late payers)")
    print(f"\nWrote 4 files to {outdir}/.\n")


if __name__ == "__main__":
    main()
