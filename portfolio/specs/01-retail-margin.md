# Build spec — "Where the Margin Went"

Retail margin & dead stock · SMB retail · target build time **~3 hours**

Title the workbook with the takeaway, not the dataset. Never "Iowa Liquor Sales
Analysis."

---

## Data source

Connect `clean/fact_sales.csv`, then add:

- `dim_store.csv` — LEFT JOIN on `store_id`
- `dim_item.csv` — LEFT JOIN on `item_id`

Left joins, not inner. An inner join silently drops fact rows whose dimension
key is missing, and you find out three weeks later when the totals don't tie.

Extract, not live. It's a CSV; the extract is faster and the workbook stays
portable when you publish to Tableau Public.

---

## Calculated fields

```
// Margin % — aggregate-level, NOT an average of row-level percentages.
// AVG([margin_pct]) weights a $6 bottle the same as a $600 case. Wrong.
Margin %
    SUM([Gross Margin]) / SUM([Sale Dollars])

// Net of returns, for volume analysis
Units Sold (Net)
    SUM([Sale Bottles])

Units Sold (Gross)
    SUM(IF NOT [Is Return] THEN [Sale Bottles] END)

// Velocity — units per week over the loaded window
Weeks In Window
    (MAX([Date]) - MIN([Date])) / 7

Units Per Week
    [Units Sold (Net)] / [Weeks In Window]

// The dead-stock test: slow AND thin.
// Thresholds are placeholders — tune them with the client, don't invent them.
Dead Stock Flag
    IF [Units Per Week] < 2 AND [Margin %] < 0.20 THEN "Cut candidate"
    ELSEIF [Units Per Week] < 2 THEN "Slow mover"
    ELSEIF [Margin %] < 0.20 THEN "Thin margin"
    ELSE "Healthy"
    END

// Honesty measure — surface the coverage caveat on the dashboard
Margin Coverage
    SUM(IF [Has Cost] THEN [Sale Dollars] END) / SUM([Sale Dollars])
```

---

## Sheets

**1 · KPI row** — four BANs: Revenue, Gross Margin $, Margin %, Cut Candidates
(count of distinct items flagged). Put `Margin Coverage` as a caption under
Margin %, formatted "Margin computed on 98.3% of revenue."

**2 · Margin waterfall by category** — `category_name` on rows, `Gross Margin`
on columns, sorted descending, colored by `Margin %`. Diverging palette
centered on the overall margin rate, so below-average categories read red
without needing a legend lookup.

**3 · The quadrant** — the centrepiece. Scatter:
- Columns: `Units Per Week`
- Rows: `Margin %`
- Detail: `item_desc`
- Color: `Dead Stock Flag`
- Size: `SUM([Sale Dollars])`
- Reference lines at the two thresholds, splitting it into four quadrants.

Bottom-left is the recommendation. Annotate that quadrant directly on the
viz — "Cut candidates: slow *and* thin" — rather than relying on the legend.

**4 · Store scorecard** — `store_name` on rows; Revenue, Margin %, Units/Week
as columns. Do **not** rank a club store against a corner shop; label the format
and let the viewer compare like with like.

**5 · Cut list** — a plain text table of flagged items with Revenue, Margin %,
Units/Week, sorted by revenue descending. This is the sheet the owner prints.

---

## Dashboard layout

Fixed size 1200×900, tiled (not floating — floating breaks on every other
screen).

```
┌──────────────────────────────────────────────┐
│  Where the Margin Went          [date range] │
│  One sentence: the recommendation.           │
├──────────────────────────────────────────────┤
│  [Revenue] [Margin $] [Margin %] [Cut items] │
├───────────────────────┬──────────────────────┤
│  The quadrant         │  Margin by category  │
│  (largest element)    │                      │
├───────────────────────┴──────────────────────┤
│  Cut list  (scrollable)                      │
└──────────────────────────────────────────────┘
```

Subtitle carries the actual finding, e.g. *"14 SKUs are 6% of revenue and under
20% margin. Cutting them frees shelf for the top quartile."* A dashboard whose
title is a conclusion gets read; one whose title is a noun gets skimmed.

Actions: selecting a category filters the quadrant and the cut list. Selecting
a store filters everything. Add "Show me" reset on every filter — the number one
usability complaint on client dashboards is getting stuck in a filtered state.

---

## Before you publish

- [ ] Totals tie to `clean.py` console output (revenue, margin $, margin %)
- [ ] Margin coverage caveat visible on the dashboard, not just in NOTES
- [ ] Tooltips rewritten in plain English — no `SUM(Sale Dollars)` visible anywhere
- [ ] Every filter has a visible reset
- [ ] Tested at 1366×768, the most common client laptop
- [ ] Color checked for red/green colorblindness (the margin diverging scale)
- [ ] Data source tab renamed from `fact_sales.csv` to `Sales`
