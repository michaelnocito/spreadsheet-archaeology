"""CMS Timely & Effective Care -> Tableau-ready patient-flow model.

    python clean.py                     # uses raw/timely_care.csv

Writes to clean/:
    fact_measures.csv    long format, typed, suppression reason preserved
    facility_flow.csv    one row per facility, measures pivoted wide
    dim_benchmark.csv    state averages, separated out of the facility rows
    audit.csv            what was dropped or changed, and why

The two traps in this file:
  1. State benchmark rows sit in the same table as facility rows. Aggregate
     without excluding them and every state is counted into its own average.
  2. 'Not Available' is not one thing. The Footnote column says whether a value
     is missing because too few patients qualified (fine) or because the
     facility didn't submit (a finding worth reporting).
"""

import argparse
from pathlib import Path

import pandas as pd

AUDIT: list[dict] = []

# CMS footnote codes, abridged to the ones that appear in these measures.
# Collapsing these to a single "missing" throws away the useful distinction.
FOOTNOTES = {
    "1": "Not available — measure not reported",
    "3": "Results based on fewer than 100 cases",
    "5": "Too few cases to report reliably",
    "25": "Facility did not submit data",
}

# Unit matters: you cannot average minutes and percentages into one number.
MEASURE_UNITS = {
    "OP_18b": "minutes", "OP_18c": "minutes", "ED_2b": "minutes",
    "OP_22": "percent", "OP_23": "percent",
}

SHORT_NAMES = {
    "OP_18b": "ed_median_minutes",
    "OP_18c": "ed_psych_median_minutes",
    "ED_2b": "admit_boarding_minutes",
    "OP_22": "left_without_being_seen_pct",
    "OP_23": "stroke_scan_45min_pct",
}


def note(step: str, rows: int, detail: str) -> None:
    AUDIT.append({"step": step, "rows_affected": rows, "detail": detail})
    print(f"  {step:<24} {rows:>7,}  {detail}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", default="raw/timely_care.csv")
    ap.add_argument("--outdir", default="clean")
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(args.src, dtype="string", keep_default_na=False)
    df.columns = [c.strip() for c in df.columns]
    start_rows = len(df)
    print(f"\nLoaded {start_rows:,} long-format rows from {args.src}\n")

    df["facility_id"] = df["Facility ID"].astype("string").str.strip()
    df["measure_id"] = df["Measure ID"].astype("string").str.strip()
    df["state"] = df["State"].astype("string").str.strip().str.upper()

    # ---- 1. Split benchmarks out of the facility rows --------------------
    is_benchmark = (df["facility_id"] == "") | df["Facility Name"].str.contains(
        "STATE AVERAGE", case=False, na=False
    )
    note("benchmark_rows", int(is_benchmark.sum()),
         "state averages separated — they are not facilities")

    bench = df[is_benchmark].copy()
    df = df[~is_benchmark].copy()

    # ---- 2. Score: numeric where reportable, reason where not ------------
    def parse_score(frame: pd.DataFrame) -> pd.Series:
        s = frame["Score"].astype("string").str.strip()
        s = s.replace(["Not Available", "Not Applicable", "N/A", ""], pd.NA)
        return pd.to_numeric(s, errors="coerce")

    df["score"] = parse_score(df)
    bench["score"] = parse_score(bench)

    df["footnote_code"] = df["Footnote"].astype("string").str.strip()
    df["suppression_reason"] = df["footnote_code"].map(FOOTNOTES)

    missing = df["score"].isna()
    note("suppressed_values", int(missing.sum()),
         "no reportable score — reason preserved, not blanked")

    # The distinction that is worth a slide: too-few-cases is a small facility,
    # did-not-submit is a compliance problem.
    not_submitted = int((df["footnote_code"] == "25").sum())
    too_few = int(df["footnote_code"].isin(["3", "5"]).sum())
    note("did_not_submit", not_submitted, "facility/measure pairs — a finding, not noise")
    note("too_few_cases", too_few, "small-volume suppression — expected, not a problem")

    # A missing score with no footnote is unexplained. Flag it rather than
    # assuming it belongs in either bucket.
    unexplained = int((missing & (df["footnote_code"] == "")).sum())
    if unexplained:
        note("unexplained_missing", unexplained, "no score and no footnote — flagged")

    df["sample_size"] = pd.to_numeric(
        df["Sample"].astype("string").str.replace(",", "", regex=False).replace("", pd.NA),
        errors="coerce",
    )
    df["unit"] = df["measure_id"].map(MEASURE_UNITS)

    # ---- 3. Facility identity: resolve on ID, never on name --------------
    df["facility_name"] = (
        df["Facility Name"].astype("string")
        .str.replace(r"\s+", " ", regex=True).str.strip().str.title()
        .str.replace("Med Ctr", "Medical Center", regex=False)
    )
    name_variants = df.groupby("facility_id")["Facility Name"].nunique()
    note("facility_name_variants", int((name_variants > 1).sum()),
         "facilities whose name was spelled more than one way")

    df["city"] = df["City/Town"].astype("string").str.strip().str.title()
    df["county"] = df["County/Parish"].astype("string").str.strip().str.title()
    df["zip_code"] = (
        df["ZIP Code"].astype("string").str.replace(r"\.0$", "", regex=True).str.zfill(5)
    )

    # Every facility attribute is resolved to one value per facility ID before
    # anything is grouped or pivoted. The address fields drift between rows just
    # like the name does, and if they are left as-is a single hospital splits
    # into one pivot row per spelling — which looks like more facilities, each
    # reporting fewer measures. Silent, and it corrupts every per-facility rate.
    for col in ("facility_name", "city", "county", "zip_code", "state"):
        canonical = df.groupby("facility_id")[col].agg(
            lambda s: s.mode().iat[0] if not s.mode().empty else pd.NA
        )
        df[col] = df["facility_id"].map(canonical)

    fact = df[[
        "facility_id", "facility_name", "city", "state", "county", "zip_code",
        "Condition", "measure_id", "Measure Name", "unit", "score", "sample_size",
        "footnote_code", "suppression_reason", "Start Date", "End Date",
    ]].rename(columns={"Condition": "condition", "Measure Name": "measure_name",
                       "Start Date": "period_start", "End Date": "period_end"})

    # ---- 4. Pivot to one row per facility --------------------------------
    # Long format is right for a measure-agnostic view, but the flow analysis
    # needs throughput and LWBS side by side on one mark. Both are written.
    wide = (
        fact.pivot_table(index=["facility_id", "facility_name", "city", "state",
                                "county", "zip_code"],
                         columns="measure_id", values="score", aggfunc="first")
        .rename(columns=SHORT_NAMES)
        .reset_index()
    )

    # Measure completeness per facility — how much of this row is real.
    measure_cols = [c for c in SHORT_NAMES.values() if c in wide.columns]
    wide["measures_reported"] = wide[measure_cols].notna().sum(axis=1)
    wide["measures_possible"] = len(measure_cols)

    # Derived: how much of an admitted patient's stay is boarding after the
    # decision to admit. This is the number that reframes the conversation from
    # "the ED is slow" to "we have no inpatient beds."
    if {"ed_median_minutes", "admit_boarding_minutes"} <= set(wide.columns):
        wide["boarding_share"] = (
            wide["admit_boarding_minutes"]
            / (wide["ed_median_minutes"] + wide["admit_boarding_minutes"])
        )

    # ---- 5. State benchmarks ---------------------------------------------
    dim_bench = (
        bench[["state", "measure_id", "score"]]
        .rename(columns={"score": "state_average"})
        .dropna(subset=["state_average"])
        .drop_duplicates(subset=["state", "measure_id"])
        .sort_values(["state", "measure_id"])
    )

    fact.to_csv(outdir / "fact_measures.csv", index=False)
    wide.to_csv(outdir / "facility_flow.csv", index=False)
    dim_bench.to_csv(outdir / "dim_benchmark.csv", index=False)
    pd.DataFrame(AUDIT).to_csv(outdir / "audit.csv", index=False)

    reported = int(fact["score"].notna().sum())
    print(f"\n  {start_rows:,} raw rows -> {len(fact):,} facility measures "
          f"({reported:,} reportable, {reported / len(fact):.1%})")
    print(f"  facilities   {wide['facility_id'].nunique()}")
    if "ed_median_minutes" in wide:
        print(f"  median ED stay      {wide['ed_median_minutes'].median():.0f} min")
    if "left_without_being_seen_pct" in wide:
        print(f"  median LWBS         {wide['left_without_being_seen_pct'].median():.1f}%")
    if "boarding_share" in wide:
        print(f"  median boarding share {wide['boarding_share'].median():.0%} of admitted stay")
    print(f"  state benchmarks {len(dim_bench)} rows")
    print(f"\nWrote 4 files to {outdir}/.\n")


if __name__ == "__main__":
    main()
