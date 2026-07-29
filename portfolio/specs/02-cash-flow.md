# Build spec — "The Money You Already Earned"

Cash flow & AR aging · SMB services · target build time **~2.5 hours**

This is the piece that gets replies. Every business that invoices recognises the
problem in one glance.

---

## Data source

Connect `clean/fact_invoices.csv`, LEFT JOIN `dim_customer.csv` on `customer`.

`kpi_summary.csv` is a separate source used only to cross-check your BANs. If a
KPI on the dashboard disagrees with that file, the dashboard is wrong — fix it
before publishing.

---

## Calculated fields

```
// Bucket ordering — pd.cut writes strings; Tableau sorts them alphabetically,
// which puts "1-30" after "90+". Set an explicit sort on this field.
Aging Bucket (sorted)
    CASE [Aging Bucket]
      WHEN "Current" THEN 1 WHEN "1-30" THEN 2 WHEN "31-60" THEN 3
      WHEN "61-90"  THEN 4 WHEN "90+"  THEN 5 ELSE 6 END

// Only open money ages
Aged AR
    SUM([Open Balance])

// Collection risk concentration — the finding is usually "3 customers are 60%
// of the problem," and this is what proves it.
% of Open AR
    SUM([Open Balance]) / TOTAL(SUM([Open Balance]))

// Cost of the float. Rate is a PARAMETER, not a hardcode — you do not know
// the client's line-of-credit rate, and pretending you do is malpractice.
Cost of Float (annual)
    SUM([Open Balance]) * [p_Interest Rate] * (AVG([Days Past Due]) / 365)

// Honesty measure: how much aging rests on a derived due date
Estimated Due Date Share
    SUM(IF [Due Date Estimated] THEN [Open Balance] END) / SUM([Open Balance])
```

**Parameter** `p_Interest Rate` — float, default 0.09, display as percentage.
Put it on the dashboard with a visible label. Letting the owner move it is the
moment they start trusting the number.

---

## Sheets

**1 · KPI row** — Open AR, DSO, Over-90 $, Over-90 as % of AR. Under Over-90 %,
a caption in muted text: "Industry rule of thumb: over 5% signals a collections
problem." Give the number a reference point or it means nothing.

**2 · The aging bar** — `Aging Bucket (sorted)` on columns, `Aged AR` on rows.
Sequential palette darkening with age. This is the shape everyone recognises;
put it top-left where the eye lands first.

**3 · Customer risk table** — the actionable sheet. Rows: `customer`. Columns:
Open Balance, Avg Days Past Due, Worst Days Past Due, Invoice count. Color the
row background by `risk`. Sort by Open Balance descending. Add a running-total
`% of Open AR` column so concentration is visible without arithmetic.

**4 · Aging waterfall by customer** — stacked bar, `customer` on rows (top 15
by open balance), `Aged AR` on columns, stacked by aging bucket. The chronic
payers are the ones whose bars are mostly dark. No explanation needed.

**5 · Invoice detail** — filtered text table, appears on drill-down from the
customer table. Invoice no, dates, terms, amount, open balance, days past due.
This is what gets pasted into the collections email.

---

## Dashboard layout

Fixed 1200×900, tiled.

```
┌──────────────────────────────────────────────┐
│  The Money You Already Earned    [as-of date]│
│  Subtitle = the finding, in dollars.         │
├──────────────────────────────────────────────┤
│  [Open AR] [DSO] [Over 90 $] [Over 90 %]     │
├─────────────────────┬────────────────────────┤
│  Aging bar          │  Cost of float         │
│                     │  + rate parameter      │
├─────────────────────┴────────────────────────┤
│  Customer risk table  (sortable, drill-down) │
├──────────────────────────────────────────────┤
│  Invoice detail (appears on selection)       │
└──────────────────────────────────────────────┘
```

Subtitle carries the finding: *"$8,232 is over 90 days out. Seven customers
account for most of it."*

Add a footer note: *"Aging computed on open balances as of 2026-07-29. X% of
aged balance uses a due date derived from payment terms."* Showing your own
uncertainty is what separates you from a template.

---

## Before you publish

- [ ] Every KPI ties to `clean/kpi_summary.csv`
- [ ] Aging buckets sort Current → 90+, not alphabetically
- [ ] "Synthetic data" label on the dashboard itself, not only the case study
- [ ] Rate parameter visible and labeled
- [ ] Estimated-due-date caveat in the footer
- [ ] Customer table sortable by every column
- [ ] Drill-down has a visible way back
- [ ] Tested at 1366×768
