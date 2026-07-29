# Build spec — "Where the Wait Actually Is"

Clinic / ED patient flow · healthcare ops · target build time **~3 hours**

The piece that gets you into a higher-rate niche. Healthcare buyers screen hard
for domain literacy — the vocabulary on this dashboard matters as much as the
charts.

---

## Data source

Primary: `clean/facility_flow.csv` (one row per facility, measures pivoted).
Add `clean/dim_benchmark.csv`, LEFT JOIN on `state` + `measure_id`, for the
reference lines.

Keep `clean/fact_measures.csv` as a second source for the measure-browser sheet.
Don't try to serve both shapes from one connection.

---

## Calculated fields

```
// Boarding share — already derived in clean.py, but restate the framing in
// the tooltip: this is time AFTER the decision to admit.
Boarding Share
    AVG([Boarding Share])

// Congestion flag. Thresholds anchored to the CMS national median, not
// invented. Cite the source on the dashboard.
Flow Status
    IF [Boarding Share] > 0.40 AND [Left Without Being Seen Pct] > 3
        THEN "Capacity-constrained"
    ELSEIF [Left Without Being Seen Pct] > 3
        THEN "Losing patients to wait"
    ELSEIF [Boarding Share] > 0.40
        THEN "Boarding pressure"
    ELSE "Within range"
    END

// vs state benchmark — the comparison a practice manager actually wants
Minutes vs State
    AVG([Ed Median Minutes]) - AVG([State Average])

// Reporting completeness — drives the honesty band
Reporting Completeness
    SUM([Measures Reported]) / SUM([Measures Possible])

// Never zero-fill a suppressed measure. Make absence visible instead.
Has LWBS
    NOT ISNULL([Left Without Being Seen Pct])
```

---

## Sheets

**1 · KPI row** — Median ED stay (min), Median LWBS %, Median boarding share,
Facilities reporting all 5 measures. Caption under the last one: "N facilities
did not submit at least one measure."

**2 · The flow scatter** — the centrepiece.
- Columns: `Ed Median Minutes`
- Rows: `Left Without Being Seen Pct`
- Detail: `facility_name`
- Color: `Flow Status`
- Size: reported sample volume
- Reference lines: state median on both axes

The upper-right quadrant is "long waits *and* patients leaving." Annotate it on
the viz. This one chart is the entire pitch.

**3 · Boarding breakdown** — stacked horizontal bar per facility: time to
departure vs boarding time after admit decision. Sort by boarding share
descending, top 20. This is the sheet that moves the conversation off the ED.

**4 · Benchmark deviation** — `facility_name` on rows, `Minutes vs State` on
columns, diverging palette centered at zero. Bars right of zero are slower than
their state. Instantly readable by a non-analyst.

**5 · Measure browser** — from `fact_measures.csv`. Facility on rows, measure on
columns, score as text. Where a score is null, display the
`suppression_reason` string, **not** a blank and never a zero. This sheet is
where you demonstrate that you understand CMS suppression, and healthcare
buyers notice.

---

## Dashboard layout

Fixed 1200×950, tiled.

```
┌──────────────────────────────────────────────┐
│  Where the Wait Actually Is       [state ▾]  │
│  Subtitle = the finding.                     │
├──────────────────────────────────────────────┤
│  [ED stay] [LWBS %] [Boarding %] [Reporting] │
├───────────────────────┬──────────────────────┤
│  Flow scatter         │  Benchmark deviation │
│  (largest element)    │                      │
├───────────────────────┴──────────────────────┤
│  Boarding breakdown  (top 20)                │
├──────────────────────────────────────────────┤
│  Footer: suppression + causality note        │
└──────────────────────────────────────────────┘
```

Subtitle carries the finding: *"At the 18 most congested sites, 45% of an
admitted patient's time is spent waiting for a bed — not being treated."*

**Footer text, non-negotiable:**

> Measures with too few cases are shown as "not reported," never as zero.
> N facility-measure pairs were not submitted. Congestion and walk-out rates
> are *associated*; this data cannot establish cause.

That paragraph is worth more than another sheet. Healthcare clients have been
burned by dashboards that zero-filled suppressed measures, and saying so
unprompted marks you as someone who has handled this data before.

---

## Before you publish

- [ ] No suppressed measure renders as 0 anywhere
- [ ] Minutes and percentages never share an axis
- [ ] State benchmarks excluded from every facility aggregate
- [ ] Thresholds cited to CMS, not asserted
- [ ] Causality language checked — "associated with," never "causes"
- [ ] Footer note present
- [ ] Facility count ties to `clean.py` output (120)
- [ ] Tested at 1366×768
