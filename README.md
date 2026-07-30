# Analyst Job Simulator — *Getting It Wrong Gets You There Faster*

A day-in-the-life **data-analyst job simulator**. You don't read about the job — you *do* it: train with a mentor, then de-curse the messy files left behind by **the Predecessor** (the analyst before you). One reusable engine, **three skill tracks**, more on the way.

| Track | Play it | You learn |
|---|---|---|
| 📊 **Excel** | **[▶ Live](https://michaelnocito.github.io/spreadsheet-archaeology/)** | Reading a sheet, header/type integrity, working on a copy, documenting, answering a stakeholder ask |
| 📈 **Tableau** | **[▶ Live](https://michaelnocito.github.io/spreadsheet-archaeology/tableau/)** | Dimensions vs measures, aggregation, the Marks card, choosing the right chart, honest dashboards |
| 🗄️ **SQL** | **[▶ Live](https://michaelnocito.github.io/spreadsheet-archaeology/sql/)** | Reading a query, WHERE/ORDER BY, aggregates & GROUP BY, NULL traps, joins, and sanity-checking a result before you send it |

> *A Python track is planned — it reuses the same engine; only the content data changes.*

---

## The premise

You've inherited a drive of cursed files from **the Predecessor** — chaotic, smug, zero documentation. First you train with your mentor **Sam** ☕ (clean files, one skill at a time, gradual release). Then you're **on the job**: the same skills, under the Predecessor's mess. The moral engine throughout: **leave it better than you found it.**

Every wrong move, the Predecessor confesses they made the same mistake and points you forward. Every right move warms them up. The reveal, by the end: *they're you on day one.*

## Structure (each track)

- **Academy** — 10 teaching modules, gradual release (worked example → guided → solo), with pushed help and spaced-retrieval recall chips.
- **On the job** — 5 waves applying those skills under the mess, with pull-only tiered help and the Predecessor's narration. The final wave triggers the reveal.

Both tracks are **feature-complete** (all 10 modules + all 5 waves) and covered by a headless Playwright smoke suite.

## How it's built

- **100% client-side, no build step.** Vanilla HTML/CSS/JS. Hosts free on GitHub Pages, runs on a phone.
- **`engine.js` / `academy.js`** — generic players that know no specific lesson; they dispatch on an interaction `kind` (`select_row` / `select_cell` / `select_column` / `select_option`).
- **`core.js`** — the safe (no-`eval`) check evaluator plus `renderSheet` (Excel grid) and `renderViz` (Tableau workspace mockup).
- **`lessons.js` / `waves.js`** — all content as **pure JSON data**. To add a lesson, push an object — no engine changes. The Tableau track lives in `/tableau/` and reuses the same engine with its own content + the `renderViz` view; the SQL track lives in `/sql/` with its own content + a `renderQuery` view (a read-only SQL console + result grid). Each track is a sibling folder that swaps in its data and one display renderer.

The whole narrative lives in each lesson's copy; the engine just plays it back.

## Run it locally

```bash
python -m http.server 8000   # open http://localhost:8000 (Excel) · /tableau/ (Tableau) · /sql/ (SQL)
```

`DESIGN_SYSTEM.md` documents the reusable calm-analyst design system.

## The guidebook (PDF)

```bash
npm run guidebook          # → dist/guidebook.html + dist/guidebook.pdf
node tools/build-guidebook.js --html   # HTML only, no Chromium needed
```

All 30 Academy guides — Excel, SQL, Tableau — as one printable book. It reads
the same `lessons.js` files the site plays, so the book can't drift from the
app: edit a lesson, rebuild, the PDF follows. Where the site asks you to click
the answer, the book prints the task, the hint, and the answer with Sam's
response.

Zero npm dependencies. The PDF step drives a headless Chromium already on the
machine (Playwright's, or any system Chrome — set `CHROME_PATH` to override).
`dist/` is a build artifact and is gitignored.

---

*Built by [Michael Nocito](https://michaelnocito.github.io).*
