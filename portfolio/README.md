# Dashboard Portfolio — case studies for freelance work

Three targeted case-study pieces built to land freelance dashboard work in SMB
operations and clinic operations. Read [`STRATEGY.md`](STRATEGY.md) first — it
explains why these three and not others.

**Live site:** `https://michaelnocito.github.io/spreadsheet-archaeology/portfolio/site/`

---

## The premise

A gallery of charts proves you can use Tableau. A case study proves you can take
a client's garbage export and hand back a decision. Only the second one closes.

So each piece leads with **the mess** — three date formats in one column,
subtotal rows wedged into the data, `Not Available` meaning four different
things — and ends with **one stated recommendation**. The dashboard sits in the
middle, where it belongs.

---

## The three pieces

| # | Piece | Niche | Source | Question it answers |
|---|---|---|---|---|
| 01 | Where the Margin Went | SMB retail | Iowa Liquor Sales (real) | Which products take shelf space without earning it? |
| 02 | The Money You Already Earned | SMB services | QuickBooks export shape (**synthetic**) | Who owes us, how late, what's it costing? |
| 03 | Where the Wait Actually Is | Healthcare ops | CMS Timely & Effective Care (real) | Where does patient time actually go? |

Piece 02 uses generated data and is labeled as such on the case-study page, in
its `NOTES.md`, and on the dashboard itself. Keep it that way.

---

## Layout

```
portfolio/
├── STRATEGY.md              positioning, timeline, outreach angle
├── data/
│   ├── 01-retail-margin/
│   │   ├── fetch.py         real source download (run on your machine)
│   │   ├── make_sample.py   messy stand-in so the repo runs offline
│   │   ├── clean.py         messy -> star schema + audit trail
│   │   ├── NOTES.md         every judgment call, written down
│   │   ├── raw/             input
│   │   └── clean/           Tableau-ready output + audit.csv
│   ├── 02-cash-flow/        (same shape; synthetic source)
│   └── 03-clinic-flow/      (same shape)
├── specs/                   Tableau build sheets — fields, layout, checklist
└── site/                    the case-study site (vanilla HTML/CSS, Zinc & Sky)
```

---

## Running a pipeline

```bash
cd portfolio/data/01-retail-margin

python make_sample.py          # messy stand-in — works anywhere
# or
python fetch.py --months 6     # the real thing (needs outbound access)

python clean.py                # -> clean/*.csv
```

Requires `pandas`. Every `clean.py` prints its decisions as it goes and writes
the same log to `clean/audit.csv`.

---

## Building the dashboards

The `.twbx` workbooks are **not** in this repo — they're built in Tableau
Desktop and published to Tableau Public. `specs/` has a build sheet per piece
with the calculated fields written out, a sheet-by-sheet layout, the dashboard
arrangement, and a pre-publish checklist.

Work order: **01 → 02 → 03**. Piece 01 is the most conventional build, so it's
the fastest way to get the first one finished. Piece 02 gets the most replies
from SMB prospects. Piece 03 is the one that opens the higher-rate niche.

Once a workbook is published, replace the `.embed` placeholder block on its
case-study page with the Tableau Public embed code.

---

## Rules these pieces follow

Each of these is a decision that makes a dashboard look worse and be worth more:

- **Never fill a missing value with a plausible one.** Exclude it and say so.
- **Never zero-fill a suppressed measure.** It inverts the ranking.
- **Never average an average.** Aggregate the numerator and denominator.
- **State coverage.** "Margin computed on 98.3% of revenue" belongs on the
  dashboard, not in a footnote nobody opens.
- **Resolve every attribute to one value per entity key** before grouping or
  pivoting. See piece 03 for what happens when you don't.
- **Say "associated with," never "causes."**
- **Title every dashboard with the takeaway**, never the dataset.

---

## Before sending any of these to a prospect

- [ ] The workbook is published and the embed replaces the placeholder
- [ ] Dashboard totals tie to the `clean.py` console output
- [ ] Every caveat in `NOTES.md` that affects a headline number is on the dashboard
- [ ] Synthetic data is labeled on piece 02's dashboard, not just its page
- [ ] Tested at 1366×768
- [ ] Send the *one* case study closest to their business, not all three
