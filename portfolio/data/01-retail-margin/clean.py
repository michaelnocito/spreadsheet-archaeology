"""Iowa Liquor Sales: messy transaction export -> Tableau-ready star schema.

    python clean.py                      # uses raw/sales_raw.csv
    python clean.py --in raw/other.csv

Writes to clean/:
    fact_sales.csv   one row per invoice line, typed, deduped, margin computed
    dim_store.csv    one row per store, canonical name
    dim_item.csv     one row per item, with category filled or flagged
    audit.csv        what was dropped or changed, and why

Every judgment call is logged to audit.csv and explained in NOTES.md. If a
client ever asks "why is this number different from my POS report," that file
is the answer.
"""

import argparse
import re
from pathlib import Path

import pandas as pd

NULLS = {"", "n/a", "N/A", "na", "-", "--", "none", "NULL", "null"}
AUDIT: list[dict] = []


def note(step: str, rows: int, detail: str) -> None:
    AUDIT.append({"step": step, "rows_affected": rows, "detail": detail})
    print(f"  {step:<22} {rows:>7,}  {detail}")


def to_money(series: pd.Series) -> pd.Series:
    """'$12.34' / '12.34 ' / '' / 'N/A' -> float. Never silently zero-fills."""
    cleaned = (
        series.astype("string")
        .str.strip()
        .str.replace(r"[$,]", "", regex=True)
        .replace(list(NULLS), pd.NA)
    )
    return pd.to_numeric(cleaned, errors="coerce")


def to_date(series: pd.Series) -> pd.Series:
    """Three formats live in this column: ISO, US slash, and dd-Mon-yyyy.

    Parsed format-by-format rather than with a single loose parser, because a
    loose parser silently reads 03/04 as either March 4th or April 3rd and you
    never find out which.
    """
    raw = series.astype("string").str.strip()
    out = pd.Series(pd.NaT, index=raw.index, dtype="datetime64[ns]")
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%b-%Y"):
        todo = out.isna() & raw.notna()
        if not todo.any():
            break
        out.loc[todo] = pd.to_datetime(raw[todo], format=fmt, errors="coerce")
    return out


def canon_store(name: str) -> str:
    """Collapse the spelling variants of one store into a single label."""
    if not isinstance(name, str):
        return ""
    s = " ".join(name.split())                       # collapse internal + edge whitespace
    s = re.sub(r"\b(INC|INCORPORATED)\.?\b", "Inc.", s, flags=re.I)
    s = re.sub(r"\band\b", "&", s, flags=re.I)
    s = re.sub(r"\s*,\s*Inc\.", ", Inc.", s, flags=re.I)
    return s.title().replace("Bdi", "BDI").replace("Hy-Vee", "Hy-Vee")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", default="raw/sales_raw.csv")
    ap.add_argument("--outdir", default="clean")
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(args.src, dtype="string", keep_default_na=False)
    start_rows = len(df)
    print(f"\nLoaded {start_rows:,} raw rows from {args.src}\n")

    # ---- 1. Exact duplicate invoice lines -------------------------------
    # A nightly load re-run doubles a day's revenue. Dedupe on the full row,
    # not just the invoice number, so a legitimately corrected line survives.
    before = len(df)
    df = df.drop_duplicates()
    note("dedupe", before - len(df), "exact duplicate rows removed")

    # ---- 2. Types -------------------------------------------------------
    df["date"] = to_date(df["date"])
    bad_dates = int(df["date"].isna().sum())
    if bad_dates:
        note("unparseable_dates", bad_dates, "dropped — no defensible guess")
        df = df[df["date"].notna()]

    for col in ("state_bottle_cost", "state_bottle_retail", "sale_dollars"):
        df[col] = to_money(df[col])
    for col in ("sale_bottles", "pack", "bottle_volume_ml"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["sale_liters"] = pd.to_numeric(df["sale_liters"], errors="coerce")

    # ---- 3. Returns are real; keep them, flag them ----------------------
    # Dropping negative lines overstates revenue. Averaging over them without
    # a flag makes "units per transaction" meaningless. So: keep and mark.
    df["is_return"] = df["sale_bottles"] < 0
    note("returns_flagged", int(df["is_return"].sum()), "negative lines kept, flagged")

    # ---- 4. Missing cost basis ------------------------------------------
    # Cost drives the entire margin model. Imputing it would invent the answer,
    # so these rows are kept for revenue but excluded from margin.
    df["has_cost"] = df["state_bottle_cost"].notna()
    note("missing_cost", int((~df["has_cost"]).sum()), "kept for revenue, excluded from margin")

    # ---- 5. Margin ------------------------------------------------------
    df["cogs"] = (df["state_bottle_cost"] * df["sale_bottles"]).where(df["has_cost"])
    df["gross_margin"] = (df["sale_dollars"] - df["cogs"]).where(df["has_cost"])
    df["margin_pct"] = (df["gross_margin"] / df["sale_dollars"]).where(
        df["has_cost"] & (df["sale_dollars"] != 0)
    )

    # ---- 6. Store dimension ---------------------------------------------
    df["store"] = pd.to_numeric(df["store"], errors="coerce").astype("Int64")
    df["store_name"] = df["name"].map(canon_store)
    df["zipcode"] = (
        df["zipcode"].astype("string").str.replace(r"\.0$", "", regex=True).str.zfill(5)
    )
    df["city"] = df["city"].astype("string").str.strip().str.title()
    df["county"] = df["county"].astype("string").str.strip().str.title().replace("", pd.NA)

    variants = df.groupby("store")["name"].nunique()
    note("store_name_variants", int((variants > 1).sum()),
         "stores whose name was spelled more than one way")

    dim_store = (
        df.groupby("store", as_index=False)
        .agg(store_name=("store_name", lambda s: s.mode().iat[0]),
             city=("city", "first"), county=("county", "first"), zipcode=("zipcode", "first"))
        .sort_values("store")
    )

    # ---- 7. Item dimension ----------------------------------------------
    df["itemno"] = pd.to_numeric(df["itemno"], errors="coerce").astype("Int64")
    df["category_name"] = (
        df["category_name"].astype("string").str.strip().replace(list(NULLS), pd.NA)
    )
    # Category is missing on some lines but present on others for the same item —
    # backfill within the item before giving up on it.
    df["category_name"] = df.groupby("itemno")["category_name"].transform(
        lambda s: s.ffill().bfill()
    )
    still_missing = int(df["category_name"].isna().sum())
    df["category_name"] = df["category_name"].fillna("Uncategorized")
    note("category_backfill", still_missing,
         "left as 'Uncategorized' — visible in the dashboard, not hidden")

    dim_item = (
        df.groupby("itemno", as_index=False)
        .agg(item_desc=("im_desc", "first"), category_name=("category_name", "first"),
             vendor_name=("vendor_name", "first"), bottle_volume_ml=("bottle_volume_ml", "first"))
        .sort_values("itemno")
    )

    # ---- 8. Fact table ---------------------------------------------------
    fact = df[[
        "invoice_line_no", "date", "store", "itemno", "sale_bottles", "sale_liters",
        "sale_dollars", "state_bottle_cost", "state_bottle_retail", "cogs",
        "gross_margin", "margin_pct", "is_return", "has_cost",
    ]].rename(columns={"store": "store_id", "itemno": "item_id"})

    fact.to_csv(outdir / "fact_sales.csv", index=False)
    dim_store.to_csv(outdir / "dim_store.csv", index=False)
    dim_item.to_csv(outdir / "dim_item.csv", index=False)
    pd.DataFrame(AUDIT).to_csv(outdir / "audit.csv", index=False)

    rev = float(fact["sale_dollars"].sum())
    gm = float(fact["gross_margin"].sum(skipna=True))
    print(f"\n  {start_rows:,} raw -> {len(fact):,} clean rows")
    print(f"  revenue      ${rev:,.0f}")
    print(f"  gross margin ${gm:,.0f}  ({gm / rev:.1%} of revenue)")
    print(f"  stores {len(dim_store)}  ·  items {len(dim_item)}")
    print(f"\nWrote 4 files to {outdir}/. Connect fact_sales.csv in Tableau,")
    print("then join dim_store on store_id and dim_item on item_id.\n")


if __name__ == "__main__":
    main()
