# Cleaning decisions — Clinic Patient Flow

Source: CMS *Timely and Effective Care – Hospital*, `data.cms.gov` provider-data
catalog (dataset `yv7e-xc69`). Public, facility-level, updated quarterly.
Grain: one row per facility **per measure** — long format.

---

## What was wrong with the file

| Defect | Why it matters |
|---|---|
| **Long format** — one row per facility/measure | Throughput and walk-out rate live on different rows; you can't plot them against each other until you pivot |
| State benchmark rows mixed into facility rows | They have no Facility ID. Aggregate without excluding them and every state is counted into its own average |
| `Score` is text: numbers, `Not Available`, and blanks | Cast naively and the whole column goes null |
| Footnote codes carry the *reason* a value is missing | `5` (too few cases) and `25` (didn't submit) mean opposite things |
| Mixed units in one column — minutes and percent | Averaging across measures produces a number with no meaning |
| Facility name drifts (`Med Ctr` / `MEDICAL CENTER` / trailing space) | The ID is the only stable key |
| Address fields also drift between rows for the same facility | See the bug below — this one is genuinely dangerous |

---

## The bug worth showing a client

First run of this pipeline reported 120 facilities but produced **334 rows** in
the pivoted output, and the derived boarding-share metric came out null.

Cause: the pivot was keyed on `facility_id` **plus** city, county, and ZIP. Those
address fields drift between rows the same way the name does. So one hospital
with three ZIP spellings became three pivot rows, each holding a fraction of its
measures — which reads as *more facilities, each reporting less data*.

Nothing errored. The row count looked plausible. Every per-facility rate would
have been quietly wrong.

The fix is the general rule this whole portfolio is built on: **resolve every
attribute to one value per entity key before you group or pivot anything.**
Not just the label you happened to notice was dirty.

This is in the case study on purpose. Showing a bug you caught in your own
pipeline is more persuasive than a clean narrative, because it demonstrates the
thing the client is actually buying — that you check.

---

## Decisions, and the reasoning

**Benchmarks separated, not deleted.**
State averages go to `dim_benchmark.csv` and are joined back for comparison.
Deleting them loses the reference line; leaving them in corrupts the aggregate.

**Suppressed values keep their reason.**
`Not Available` is not one thing. The footnote is mapped to plain English and
retained on every row. The split matters:

- **Too few cases (codes 3, 5)** — a small rural facility. Expected. Not a
  finding. Shows on the dashboard as "not reported," never as zero.
- **Did not submit (code 25)** — a compliance gap. This *is* a finding, and
  in a client engagement it's usually the first thing the ops director wants.

Collapsing both to "missing" throws away the only interesting part.

**Missing scores are never zero-filled.**
A suppressed LWBS rate is not a 0% walk-out rate. Zero-filling would rank the
facilities with the worst reporting as the best performers — the exact inversion
that destroys trust in a dashboard on first read.

**Units kept explicit.**
A `unit` column travels with every measure. Minutes and percentages never share
an axis, and no aggregate is ever computed across measures of different units.

**Both shapes written.**
`fact_measures.csv` stays long — right for a measure-agnostic browser and for
adding measures later without changing the schema. `facility_flow.csv` is
pivoted wide — needed to put throughput and LWBS on the same mark. Shipping both
costs nothing and saves an hour of reshaping in Tableau.

**Derived: boarding share.**
`admit_boarding_minutes / (ed_median_minutes + admit_boarding_minutes)` — how
much of an admitted patient's time is spent waiting *after* the decision to
admit. This is the number that reframes the conversation from "the ED is slow"
to "there are no inpatient beds," which is a different problem with a different
owner and a different budget. Derived metrics that change who owns the problem
are what makes a dashboard worth paying for.

---

## What is deliberately *not* modelled

- **Case mix and acuity.** A trauma centre and a rural ED are not comparable on
  raw minutes. The dashboard groups by reported volume rather than ranking all
  facilities against each other.
- **Staffing.** Not in this data, and it is usually the actual driver.
- **Seasonality.** The file is an annual rollup. Surge patterns need internal data.
- **Causality.** Congestion and walk-outs correlate here. The dashboard says
  *associated with*, never *causes*.

---

## Reproduce

```bash
python fetch.py                        # real CMS file (needs data.cms.gov access)
# or
python make_sample.py --facilities 120 # messy stand-in, runs offline

python clean.py
```
