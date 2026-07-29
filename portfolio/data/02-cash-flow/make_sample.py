"""Generate a synthetic QuickBooks-style 'Invoice List' export.

SYNTHETIC DATA — clearly labeled everywhere it surfaces. There is no public
accounts-receivable dataset, and inventing one is the honest option as long as
you say so. Never present generated data as a real client's.

What is *not* synthetic is the file's shape. QuickBooks Desktop and Online both
export reports rather than tables, and that means:

  - three title/subtitle rows above the header
  - the header row is not row 1
  - customer subtotal rows interleaved with detail rows
  - blank spacer rows between customer groups
  - a grand TOTAL row at the bottom
  - negatives in accounting parentheses: (1,250.00)
  - dates as text, in whatever the workstation locale was

Anyone who has opened a real QuickBooks export recognises this instantly. That
recognition is the hook of the case study.

    python make_sample.py --customers 40
"""

import argparse
import csv
import random
from datetime import date, timedelta

COLUMNS = ["Num", "Customer", "Date", "Due Date", "Terms", "Amount",
           "Open Balance", "Status", "Last Payment"]

FIRST = ["Northwind", "Cedar Ridge", "Blue Harbor", "Ironside", "Meadowlark",
         "Copper Creek", "Fairview", "Stonebridge", "Willow Park", "Granite",
         "Harborview", "Elmwood", "Redstone", "Lakeshore", "Brightwater"]
LAST = ["Dental", "Contracting", "Property Mgmt", "Clinic", "Landscaping",
        "HVAC", "Consulting", "Auto Group", "Family Practice", "Builders"]

TERMS = ["Net 15", "Net 30", "Net 30", "Net 30", "Net 45", "Net 60", "Due on receipt"]
TERM_DAYS = {"Net 15": 15, "Net 30": 30, "Net 45": 45, "Net 60": 60,
             "Due on receipt": 0}


def acct(value: float) -> str:
    """Accounting format: negatives in parentheses, thousands separated."""
    if value < 0:
        return f"({abs(value):,.2f})"
    return f"{value:,.2f}"


def datestr(d: date, rng: random.Random) -> str:
    return d.strftime(rng.choice(["%m/%d/%Y", "%m/%d/%Y", "%m/%d/%Y", "%b %d, %Y"]))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--customers", type=int, default=40)
    ap.add_argument("--out", default="raw/ar_export.csv")
    ap.add_argument("--seed", type=int, default=7)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    today = date.today()

    names = []
    while len(names) < args.customers:
        n = f"{rng.choice(FIRST)} {rng.choice(LAST)}"
        if n not in names:
            names.append(n)

    rows: list[list[str]] = []

    # --- The report preamble QuickBooks insists on -----------------------
    rows.append(["Bright Fork Services LLC"] + [""] * 8)
    rows.append(["Open Invoices"] + [""] * 8)
    rows.append([f"As of {today.strftime('%B %d, %Y')}"] + [""] * 8)
    rows.append([""] * 9)
    rows.append(COLUMNS)

    invoice_no = 10500
    grand_amount = 0.0
    grand_open = 0.0

    for name in sorted(names):
        # Some customers are chronically late; that clustering is the finding.
        lateness_bias = rng.choice([0, 0, 0, 1, 1, 2, 3])
        cust_amount = 0.0
        cust_open = 0.0

        for _ in range(rng.randint(1, 6)):
            invoice_no += 1
            terms = rng.choice(TERMS)
            age = rng.randint(0, 40) + lateness_bias * rng.randint(15, 45)
            issued = today - timedelta(days=age)
            due = issued + timedelta(days=TERM_DAYS[terms])

            amount = round(rng.lognormvariate(7.4, 0.8), 2)

            # Partial payments are common and are where naive aging goes wrong:
            # the *open balance* ages, not the original amount.
            roll = rng.random()
            if roll < 0.18:
                open_bal = 0.0
                status = "Paid"
                last_pay = datestr(issued + timedelta(days=rng.randint(1, 40)), rng)
            elif roll < 0.38:
                open_bal = round(amount * rng.uniform(0.2, 0.8), 2)
                status = "Partial"
                last_pay = datestr(issued + timedelta(days=rng.randint(1, 30)), rng)
            else:
                open_bal = amount
                status = "Open"
                last_pay = ""

            # ~2% credit memos, booked negative
            if rng.random() < 0.02:
                amount, open_bal = -amount, -open_bal
                status = "Credit Memo"

            # A few rows lost their due date — the aging key
            due_str = "" if rng.random() < 0.03 else datestr(due, rng)

            # Customer name drifts: trailing spaces, case, an appended code
            display = name
            r = rng.random()
            if r < 0.10:
                display = name.upper()
            elif r < 0.16:
                display = name + " "
            elif r < 0.20:
                display = f"{name}:{rng.randint(1, 3):02d}"   # QB job sub-customer

            rows.append([
                str(invoice_no), display, datestr(issued, rng), due_str, terms,
                acct(amount), acct(open_bal), status, last_pay,
            ])
            cust_amount += amount
            cust_open += open_bal

        # --- The subtotal row, wedged right into the data ----------------
        rows.append(["", f"Total {name}", "", "", "",
                     acct(cust_amount), acct(cust_open), "", ""])
        rows.append([""] * 9)          # spacer

        grand_amount += cust_amount
        grand_open += cust_open

    rows.append(["", "TOTAL", "", "", "", acct(grand_amount), acct(grand_open), "", ""])

    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        csv.writer(fh).writerows(rows)

    detail = sum(1 for r in rows if r[0].isdigit())
    print(f"Wrote {len(rows):,} lines to {args.out} ({detail:,} are real invoices)")
    print("Next: python clean.py")


if __name__ == "__main__":
    main()
