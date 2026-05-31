# Getting It Wrong Gets You There Faster

*A day-in-the-life data-analyst job sim. Setting: **Week One** on the job.*

**Getting it wrong gets you there faster.** This is the job, not a textbook. You dive in,
you type, you screw up — and every screw-up teaches you something, with backup
right when you need it.

## The premise

You've inherited a drive full of cursed spreadsheets from **the Predecessor** —
the analyst who had this job before you. Chaotic, smug, left zero documentation.
Your job is to de-curse their files and, in doing so, learn the real habits of a
working analyst: **leave it better than you found it.**

Every wrong move, the Predecessor confesses they made the same mistake — and
points you forward. Every right move warms them up. (The reveal, by season's end:
they're *you on day one*.)

## Week One — the arc

| Wave | Skill | Habit |
|---|---|---|
| 1 ✅ | Find the true header / data boundaries | **Orient before you touch** |
| 2 | Column type integrity (numbers-as-text, dates) | Verify, don't assume |
| 3 | Work on a copy, name it sanely | Never mutate the source |
| 4 | Rename files + build a data dictionary | Document as you go |
| 5 (boss) | Answer a stakeholder's real question, cleanly | Clarify the ask + communicate |

**Wave 1 is built end-to-end** — the full loop, the three-tier pull-only help,
the Predecessor's tone, and the data schema, all in one cheap experiment.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

Runs fully client-side — hosts free on GitHub Pages, works on a phone.

## How it's built

- **`engine.js`** — the *generic* engine. Renders the Predecessor's voice, the
  clickable spreadsheet, pull-only help, and win/fail feedback. Knows nothing
  about any specific wave.
- **`waves.js`** — all game content as **pure JSON data**. To add a wave, push
  another object. No engine changes.
- **`index.html` / `styles.css`** — a calm analyst-workstation shell.

The entire narrative arc lives in each wave's `scenario.intro` and
`feedback.win` / `feedback.fail` copy — the engine just plays it back.

### Authoring a wave

Each wave declares a task with **safe check expressions** (no `eval`) evaluated
against the player's interaction state:

```js
task: {
  kind: "select_row",
  prompt: "Click the row where the real data labels begin.",
  success_check: "selected_header_row == 4",
  fail_check:    "selected_header_row == 1"
}
```

Help is **pull-only** — the player asks for it, one tier at a time — to protect
the "figure it out" feel of a real job.

---

*Built by [Michael Nocito](https://michaelnocito.github.io).*
