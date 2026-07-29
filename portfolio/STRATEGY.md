# Freelance Dashboard Portfolio — Strategy

**Goal:** land the first paid dashboard contract. Not "show that I know Tableau."

Those are different goals and they need different portfolio pieces. A gallery of
charts proves tool familiarity. A case study proves you can take a client's
garbage export and hand back a decision. Only the second one closes.

---

## The positioning

> *I turn the messy export you already have into a dashboard that answers one
> question you actually ask every week.*

Not "Tableau developer." Every bootcamp grad is a Tableau developer. The scarce
skill — and the one this repo is already named after — is **spreadsheet
archaeology**: taking a file with merged headers, three date formats, and
subtotal rows wedged into the data, and getting a trustworthy number out of it.

Lead with the mess. The dashboard is the payoff, not the pitch.

---

## The three pieces

Each targets a niche you can actually reach, and each proves a *different*
thing. Three pieces that prove the same thing is one piece.

### 01 — Retail Margin & Dead Stock  ·  SMB retail

- **Source:** Iowa Liquor Sales (Iowa open data, Socrata API) — real, public,
  millions of transaction rows, genuinely messy.
- **Question:** *Which products and stores are quietly destroying margin, and
  what should we stop stocking?*
- **Proves:** you can handle transaction-grain data at volume, build a margin
  model the owner didn't have, and make a stocking recommendation.
- **Sells to:** liquor stores, convenience, boutiques, any Shopify/Square shop.
  The client sees their own business in it immediately.

### 02 — Cash Flow & AR Aging  ·  SMB services

- **Source:** synthetic, shaped exactly like a QuickBooks "Invoice List" export
  (labeled as synthetic — never pass generated data off as real).
- **Question:** *Who owes us, how late, and what is the float costing us?*
- **Proves:** you can survive a real accounting export — report title rows above
  the header, subtotal rows interleaved, parenthesised negatives — and produce
  DSO and an aging model.
- **Sells to:** contractors, agencies, clinics, any business that invoices.
  This is the single most viscerally recognized pain in small business.

### 03 — Clinic Patient Flow  ·  Healthcare ops

- **Source:** CMS *Timely and Effective Care* (data.cms.gov) — real, public
  facility-level ED throughput and left-without-being-seen measures.
- **Question:** *Where does patient time actually go, and which sites are losing
  patients to the wait?*
- **Proves:** domain credibility in a niche that pays above market, plus
  comfort with suppressed values, footnote columns, and benchmark comparison.
- **Sells to:** urgent care groups, multi-site clinics, practice managers.

---

## What every case study must contain

A dashboard link alone converts badly. Each piece ships with:

1. **The mess, shown.** A before screenshot or sample of the raw rows. This is
   the hook — it is the part a non-analyst client understands instantly.
2. **The cleaning decisions, logged.** `NOTES.md` per piece. Every judgment call
   written down: what you dropped, what you imputed, what you refused to guess.
   This is what a client is actually buying, and almost nobody shows it.
3. **One stated recommendation.** Not "here are the numbers." *"Stop stocking
   these 14 SKUs; they are 6% of revenue and negative margin after shelf cost."*
4. **Scope and time.** "Eight hours, start to finish." Clients price by fear of
   the unknown. Removing that fear is worth more than another chart.

Title every dashboard with the takeaway, never the dataset. "Where the Margin
Went," not "Iowa Liquor Sales Analysis."

---

## Honest expectations

Building three good pieces this week does **not** produce a paid contract next
week. It produces the thing that makes the outreach work. Rough shape:

| Window | What realistically happens |
|---|---|
| Week 1 | Pieces built and published, profile live, 15–20 warm messages out |
| Weeks 2–4 | First free or discounted job → testimonial + real-data case study |
| Weeks 4–8 | First real paid contract, likely $30–60/hr |
| Month 3+ | $60–100/hr once 2–3 reviews exist |

The portfolio is necessary and not sufficient. Outreach volume is the variable
that actually moves the date, and it is the one most people skip because
building is more comfortable than asking.

---

## The outreach angle these pieces unlock

Warm network first — people who already trust you don't need reviews.

> "I've been building dashboards. If you've got a report someone rebuilds by
> hand every month, I'll turn it into a live dashboard cheap so I can get a
> portfolio piece and a testimonial out of it."

Then send the one case study closest to their business. Piece 02 for anyone who
invoices, 01 for anyone who holds inventory, 03 for anyone in care delivery.

Deliberately take one free or near-free job. It buys the testimonial and the
real-data case study, and those unlock the rate.
