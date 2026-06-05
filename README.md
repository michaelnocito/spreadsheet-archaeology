# Analyst Job Simulator — *Getting It Wrong Gets You There Faster*

A day-in-the-life **data-analyst job simulator**. You don't read about the job — you *do* it: train with a mentor, then de-curse the messy files left behind by **the Predecessor** (the analyst before you). One reusable engine, **two skill tracks**, more on the way.

| Track | Play it | You learn |
|---|---|---|
| 📊 **Excel** | **[▶ Live](https://michaelnocito.github.io/spreadsheet-archaeology/)** | Reading a sheet, header/type integrity, working on a copy, documenting, answering a stakeholder ask |
| 📈 **Tableau** | **[▶ Live](https://michaelnocito.github.io/spreadsheet-archaeology/tableau/)** | Dimensions vs measures, aggregation, the Marks card, choosing the right chart, honest dashboards |

> *SQL and Python tracks are planned — they reuse the same engine; only the content data changes.*

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
- **`lessons.js` / `waves.js`** — all content as **pure JSON data**. To add a lesson, push an object — no engine changes. The Tableau track lives in `/tableau/` and reuses the same engine with its own content + the `renderViz` view.

The whole narrative lives in each lesson's copy; the engine just plays it back.

## Run it locally

```bash
python -m http.server 8000   # then open http://localhost:8000  (Excel)  ·  /tableau/  (Tableau)
```

`DESIGN_SYSTEM.md` documents the reusable calm-analyst design system.

---

*Built by [Michael Nocito](https://michaelnocito.github.io).*
