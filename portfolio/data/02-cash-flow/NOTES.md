# Cleaning decisions — Cash Flow & AR Aging

> **Synthetic data.** There is no public accounts-receivable dataset, so this
> piece uses generated invoices. The *shape* is not invented: it reproduces a
> QuickBooks "Open Invoices" report export exactly. This label appears on the
> case study page too. Never present generated data as a real client's.

Grain: one row per invoice. As-of date drives all aging.

---

## The core problem: it's a report, not a table

QuickBooks does not export data. It exports a **report**, and the difference is
where the money goes missing:

```
Bright Fork Services LLC              <- company name
Open Invoices                         <- report name
As of July 29, 2026                   <- as-of line
                                      <- blank
Num, Customer, Date, ...              <- the actual header, line 5
10501, Blue Harbor Auto Group, ...    <- detail
10502, Blue Harbor Auto Group, ...    <- detail
     , Total Blue Harbor Auto Group   <- SUBTOTAL, sitting inside the data
                                      <- blank spacer
```

**Sum the Amount column as-is and you get roughly double the truth**, because
every invoice is counted once as a detail row and again inside its customer
subtotal. This is the most common single error in hand-built AR reporting, and
it is invisible — the number looks plausible, it's just wrong.

---

## Decisions, and the reasoning

**Header located by content, never by position.**
The preamble is 4 rows here, but it varies with the report, the QB version, and
whether someone added a filter line. `find_header()` scans for the row
containing both `Num` and `Customer`. Hardcoding `skiprows=4` works until the
client sends next month's export, and then it fails silently rather than loudly.

**Scaffolding removed by one structural test: is `Num` numeric?**
Real invoices have a document number. Subtotals, spacers, and the grand total
do not. That single test removes every non-data row without pattern-matching on
the word "Total" — which would also delete a customer legitimately named
"Total Comfort HVAC."

**Accounting parentheses parsed as negatives.**
`(1,250.00)` is **negative** 1,250. Read as text it becomes null; read with a
naive numeric cast it becomes positive 1,250. Either way the AR total is wrong
by twice the credit memo. Credit memos are kept — they genuinely reduce AR.

**Only the open balance ages, never the original amount.**
On a partly-paid invoice, the aged figure is what's still outstanding. Aging the
original amount overstates old AR and makes collections chase money that has
already arrived. `aged_balance` is derived from `open_balance` for this reason.

**Missing due dates are *derived*, not guessed.**
Due date is the aging key. Where it's blank but terms and invoice date are
present, it is rebuilt as `invoice_date + terms`. That's recovery from a known
business rule, not imputation. Rows carry `due_date_estimated = TRUE` so the
dashboard can show how much of the aging rests on a derived date. Where terms
are *also* missing, the row is flagged and excluded from aging rather than
assigned a default.

**Job sub-customers rolled up to the parent.**
QuickBooks writes `Cedar Ridge Dental:02` for a job under a customer. Risk is
meaningful at the customer level — one chronically late payer with four jobs is
one collections conversation, not four. Names are also case- and
whitespace-normalised.

---

## What is deliberately *not* modelled

- **Cost of the float.** Turning DSO into a dollar cost needs the client's
  actual line-of-credit rate. The dashboard leaves a parameter for it rather
  than inventing a number.
- **Disputes and write-offs.** Not in this export. Some "chronic" payers are
  disputing, not stalling, and that distinction needs a conversation with the
  owner before anyone is sent to collections.
- **Seasonality of billing.** One export is a snapshot. Trend needs several.

---

## Reproduce

```bash
python make_sample.py --customers 40
python clean.py --asof 2026-07-29     # pin the as-of date for reproducibility
```

Pin `--asof` when publishing. Otherwise every re-run shifts the aging buckets
and the case-study screenshots stop matching the workbook.
