"""Generate a messy sample in the exact shape of the Iowa Liquor Sales export.

Why this exists: the case study runs on real data (see fetch.py). But a repo
that only works after a 400 MB download is a repo nobody evaluates. This makes
a small stand-in with the *same schema and the same defects* so clean.py can be
run and reviewed in ten seconds.

The defects injected here are not invented — they are the ones that actually
appear in this feed, plus the ones that appear once a human has opened the file
in Excel and saved it back.

    python make_sample.py --rows 4000
"""

import argparse
import csv
import random
from datetime import date, timedelta

FIELDS = [
    "invoice_line_no", "date", "store", "name", "city", "zipcode", "county",
    "category", "category_name", "vendor_name", "itemno", "im_desc", "pack",
    "bottle_volume_ml", "state_bottle_cost", "state_bottle_retail",
    "sale_bottles", "sale_dollars", "sale_liters",
]

STORES = [
    (2190, "Central City Liquor, Inc.", "DES MOINES", "50310", "POLK"),
    (2501, "Hy-Vee #3 / BDI / Des Moines", "DES MOINES", "50313", "POLK"),
    (2633, "Hometown Foods", "CEDAR RAPIDS", "52402", "LINN"),
    (4829, "Casey's General Store #2879", "ANKENY", "50021", "POLK"),
    (3385, "Sam's Club 8162", "DAVENPORT", "52807", "SCOTT"),
    (2648, "Wilkie Liquors", "IOWA CITY", "52240", "JOHNSON"),
    (5102, "Corner Tap & Bottle", "AMES", "50010", "STORY"),
]

ITEMS = [
    (11788, "Black Velvet", "1031080", "CANADIAN WHISKIES", "Heaven Hill Brands", 12, 1750, 9.75, 14.63),
    (36308, "Mr Boston Vodka", "1031200", "AMERICAN VODKAS", "Sazerac Company Inc", 12, 1000, 4.50, 6.75),
    (26827, "Tito's Handmade Vodka", "1031200", "AMERICAN VODKAS", "Fifth Generation Inc", 12, 750, 12.50, 18.75),
    (19067, "Jameson", "1032080", "IRISH WHISKIES", "Pernod Ricard USA", 12, 750, 17.99, 26.99),
    (43336, "Fireball Cinnamon Whiskey", "1081900", "WHISKEY LIQUEUR", "Sazerac Company Inc", 12, 750, 8.25, 12.38),
    (35918, "Five O'clock Gin", "1041100", "AMERICAN DRY GINS", "Luxco Inc", 12, 1750, 8.99, 13.49),
    (64866, "Hennessy VS", "1051010", "IMPORTED BRANDIES", "Moet Hennessy USA", 12, 750, 24.99, 37.49),
    (77779, "Dusty Shelf Cordial", "1081600", None, "Regional Spirits Co", 6, 375, 11.00, 12.10),
]


def money(value: float, style: int) -> str:
    """Currency arrives three different ways depending on who touched the file."""
    if style == 0:
        return f"{value:.2f}"
    if style == 1:
        return f"${value:,.2f}"
    return f"{value:.2f} "        # trailing space from a spreadsheet round-trip


def datestr(d: date, style: int) -> str:
    if style == 0:
        return d.isoformat()
    if style == 1:
        return d.strftime("%m/%d/%Y")
    return d.strftime("%d-%b-%Y")


def dirty_store_name(name: str, rng: random.Random) -> str:
    """The same store, spelled six ways. This is the whole reason dim_store exists."""
    roll = rng.random()
    if roll < 0.15:
        return name.upper()
    if roll < 0.25:
        return f"  {name}"
    if roll < 0.32:
        return name.replace(", Inc.", " INC").replace(" & ", " and ")
    if roll < 0.36:
        return name + " "
    return name


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", type=int, default=4000)
    ap.add_argument("--out", default="raw/sales_raw.csv")
    ap.add_argument("--seed", type=int, default=11)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    start = date.today() - timedelta(days=180)
    rows: list[dict] = []

    for i in range(args.rows):
        store_no, store_name, city, zipc, county = rng.choice(STORES)
        itemno, desc, cat, cat_name, vendor, pack, ml, cost, retail = rng.choice(ITEMS)

        # Seasonality — December is roughly double a normal week.
        day = start + timedelta(days=rng.randint(0, 179))
        seasonal = 2.0 if day.month == 12 else 1.0
        bottles = max(1, int(rng.lognormvariate(1.1, 0.9) * seasonal))

        # ~1.5% are returns booked as negative lines. Averaging over these
        # without noticing is the classic way to overstate margin.
        if rng.random() < 0.015:
            bottles = -bottles

        dollars = bottles * retail
        liters = bottles * (ml / 1000.0)
        dstyle = rng.choice([0, 0, 0, 1, 1, 2])
        mstyle = rng.choice([0, 0, 0, 1, 2])

        row = {
            "invoice_line_no": f"INV-{200000 + i}",
            "date": datestr(day, dstyle),
            "store": store_no,
            "name": dirty_store_name(store_name, rng),
            "city": city if rng.random() > 0.08 else city.title(),
            # Excel turns a zip column numeric and hands back 50310.0
            "zipcode": zipc if rng.random() > 0.12 else f"{int(zipc)}.0",
            "county": county if rng.random() > 0.05 else "",
            "category": cat,
            "category_name": cat_name if cat_name else rng.choice(["", "N/A", "-"]),
            "vendor_name": vendor,
            "itemno": itemno,
            "im_desc": desc,
            "pack": pack,
            "bottle_volume_ml": ml,
            "state_bottle_cost": money(cost, mstyle),
            "state_bottle_retail": money(retail, mstyle),
            "sale_bottles": bottles,
            "sale_dollars": money(dollars, mstyle),
            "sale_liters": f"{liters:.2f}",
        }
        rows.append(row)

        # ~1% of lines are exact duplicates — a re-run of a nightly load.
        if rng.random() < 0.01:
            rows.append(dict(row))

    # A handful of rows lost their cost basis entirely.
    for row in rng.sample(rows, k=max(1, len(rows) // 60)):
        row["state_bottle_cost"] = rng.choice(["", "N/A"])

    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows):,} messy rows to {args.out}")
    print("Next: python clean.py")


if __name__ == "__main__":
    main()
