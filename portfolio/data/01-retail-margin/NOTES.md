# Cleaning decisions — Retail Margin & Dead Stock

Source: Iowa Liquor Sales, `data.iowa.gov` dataset `m3tr-qhgy` (Socrata).
Grain: one row per invoice line. Public, updated monthly.

This file is the deliverable a client is actually paying for. The dashboard is
what they look at; this is why they can trust it.

---

## What was wrong with the file

| Defect | Why it matters |
|---|---|
| Three date formats in one column (`2026-07-01`, `05/25/2026`, `14-Jun-2026`) | A loose parser reads `03/04` as March 4 **or** April 3 and never tells you which |
| Currency as `$12.34`, `12.34`, and `12.34 ` (trailing space) | Any one of these silently becomes text, and the measure sums to zero |
| Same store spelled up to 6 ways (`Wilkie Liquors`, `WILKIE LIQUORS`, `  Wilkie Liquors`) | Store-level totals split across phantom stores |
| Zip codes as `50310.0` | Excel typed the column numeric on a round-trip; kills any map join |
| ~1% exact duplicate rows | A re-run nightly load. Doubles that day's revenue |
| ~1.5% negative-quantity lines | Returns. Dropping them overstates revenue |
| Missing `state_bottle_cost` on ~1.7% of lines | Cost drives the whole margin model |
| `category_name` blank / `N/A` / `-` | Three spellings of null in one column |

---

## Decisions, and the reasoning

**Duplicates — dropped on the full row, not the invoice number.**
Deduping on `invoice_line_no` alone would delete legitimately corrected lines
that share an invoice number with the original. Full-row equality is the
conservative choice: it only removes rows that are genuinely identical.

**Dates — parsed format-by-format, unparseable rows dropped.**
Each of the three known formats is tried explicitly. Anything that survives all
three is dropped rather than guessed at, and the count is logged. Dropping a
row you can't date is honest; assigning it a plausible date is fabrication.

**Returns — kept and flagged, never dropped.**
Negative lines are real business events. They're retained so revenue is correct,
and carry an `is_return` flag so units-per-transaction analysis can exclude them
deliberately. This is the single most common way a retail dashboard ends up
overstating revenue by 1–2%.

**Missing cost — excluded from margin, retained for revenue.**
There is no defensible way to impute a cost basis. Using the item's average cost
would smooth over exactly the pricing errors the dashboard exists to find. Those
rows carry `has_cost = FALSE`; every margin measure is null for them, so Tableau
excludes them from margin aggregates automatically while still counting the
revenue. **Margin % is therefore computed over ~98.3% of lines, not 100%.** That
caveat belongs on the dashboard, not buried here.

**Store names — canonicalised, then resolved by mode.**
Whitespace collapsed, `INC`/`Incorporated` normalised, `and` → `&`, title-cased.
Then each store number takes its most frequent spelling. Store *number* is the
real key — the name is a label, and labels are where humans introduce variance.

**Category — backfilled within item, then surfaced as `Uncategorized`.**
If an item has a category on any line, it gets it on every line. Items with no
category anywhere become `Uncategorized` rather than being hidden or dropped.
An empty bar labeled "Uncategorized" prompts the owner to fix their POS. A
silently dropped row does not.

---

## What is deliberately *not* modelled

- **Shelf/carrying cost.** Not in the data. The dead-stock recommendation uses
  velocity and gross margin only, and says so.
- **Promotions and discounts.** Not in this feed. Realised margin may be lower
  than reported margin.
- **Store size / square footage.** Not in the data, so revenue-per-store is not
  normalised. A club store and a corner shop are not directly comparable, and
  the dashboard labels them by format rather than ranking them against each other.

Naming these limits is not a weakness in the case study — it is the part that
signals you've done this before.

---

## Reproduce

```bash
python fetch.py --months 6       # real data (needs data.iowa.gov access)
# or
python make_sample.py --rows 4000   # messy stand-in, runs offline

python clean.py                  # -> clean/fact_sales.csv + dims + audit.csv
```

`clean/audit.csv` records every row count changed at every step.
