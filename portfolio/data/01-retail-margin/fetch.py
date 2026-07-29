"""Pull real Iowa Liquor Sales transactions from the state's Socrata API.

Run this on your own machine — it needs outbound access to data.iowa.gov.
The repo also ships a generated messy sample (make_sample.py) so the pipeline
runs offline; fetch.py is what makes the case study use *real* data.

    python fetch.py --months 6 --out raw/sales_raw.csv

No API token is required for modest volumes. If you get rate limited, register
a free Socrata app token and pass --token.
"""

import argparse
import csv
import sys
import urllib.parse
import urllib.request
from datetime import date, timedelta

ENDPOINT = "https://data.iowa.gov/resource/m3tr-qhgy.json"
PAGE = 50_000

# Only the columns the dashboard actually needs. Pulling all 24 triples the
# download for fields we never model.
FIELDS = [
    "invoice_line_no", "date", "store", "name", "city", "zipcode", "county",
    "category", "category_name", "vendor_name", "itemno", "im_desc", "pack",
    "bottle_volume_ml", "state_bottle_cost", "state_bottle_retail",
    "sale_bottles", "sale_dollars", "sale_liters",
]


def fetch(months: int, token: str | None) -> list[dict]:
    since = (date.today() - timedelta(days=30 * months)).isoformat()
    rows: list[dict] = []
    offset = 0

    while True:
        query = {
            "$select": ",".join(FIELDS),
            "$where": f"date >= '{since}'",
            "$order": "invoice_line_no",
            "$limit": PAGE,
            "$offset": offset,
        }
        url = f"{ENDPOINT}?{urllib.parse.urlencode(query)}"
        req = urllib.request.Request(url)
        if token:
            req.add_header("X-App-Token", token)

        print(f"  fetching offset {offset:,}…", file=sys.stderr)
        with urllib.request.urlopen(req, timeout=120) as resp:
            import json
            batch = json.load(resp)

        rows.extend(batch)
        if len(batch) < PAGE:
            break
        offset += PAGE

    return rows


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--months", type=int, default=6)
    ap.add_argument("--out", default="raw/sales_raw.csv")
    ap.add_argument("--token", default=None, help="Socrata app token (optional)")
    args = ap.parse_args()

    rows = fetch(args.months, args.token)
    if not rows:
        sys.exit("No rows returned — check the date window.")

    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows):,} rows to {args.out}")
    print("Next: python clean.py --in", args.out)


if __name__ == "__main__":
    main()
