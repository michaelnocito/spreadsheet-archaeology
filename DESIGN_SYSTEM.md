# Nocito Web Design System

A reusable design system extracted from **Getting It Wrong Gets You There Faster**
(github.com/michaelnocito/spreadsheet-archaeology). Use this to give Michael
Nocito's portfolio web projects (landing page, prep kits, browser games,
documentation sites) a consistent calm-analyst look-and-feel.

The system is intentionally **vanilla HTML + CSS + plain JS** — zero build step,
GitHub-Pages-ready, runs on a phone, no framework lock-in.

---

## How to use this doc in another Claude session

Paste this at the start of the session:

> Read https://raw.githubusercontent.com/michaelnocito/spreadsheet-archaeology/main/DESIGN_SYSTEM.md
> and apply this design system to this project. Adapt — don't blindly copy
> components that don't fit the project's purpose. Preserve existing
> functionality; only change look-and-feel + add components from the system
> where they improve the experience. Follow the "What NOT to copy" section.

---

## In scope for this design system

Apply to:
- `michaelnocito.github.io` (main landing page)
- `analyst-prep-kit` (consolidated prep kits)
- `sql-quest` (web game — adapt where it fits the game UI)
- `nexus-sql-mystery` (eligible for full re-skin in this style)
- `spreadsheet-cleaner` docs page
- `recordforge` Pages landing (if one exists)
- Any other portfolio web pages / documentation Mike publishes

**Do NOT apply** to: `camelot-hills`, `inconnu-heretic`, `dance-combat-lab`,
`codekeys` (these are games and desktop apps with their own aesthetic).

---

## Design principles (the why — refer to these when in doubt)

1. **Calm analyst workstation feel.** Light theme, soft shadows, generous
   whitespace, restrained color. NEVER chiptune / arcade / dark cyberpunk.
2. **Top-down reading order.** Directive content (what to do) first, then
   context/explanation, then the work surface. On mobile, this means the
   "brief / task / call to action" stacks at the TOP, not the bottom.
3. **Action always visible.** The primary call-to-action button and the
   work surface (table, editor, etc.) must never be covered by feedback,
   toasts, or stacked secondary content.
4. **Where you've been / are / going.** Every screen should make orientation
   obvious — top-bar phase chip + a progress indicator + a per-section
   stepper if there are sub-steps.
5. **Push tutorial, pull help.** When teaching, show hints freely. When
   exercising the skill, hide them behind a "Need a hand?" button — protects
   the figure-it-out feel.
6. **Earned celebrations, no dark patterns.** Predictable rewards (warm
   chime + green pulse) on every correct move; bigger celebrations on
   milestones. NO streak-anxiety, time pressure, loot boxes, or variable
   jackpots. Passes the "regret test."
7. **Vanilla everything.** No build step, no framework, no npm install for
   end users. Hosts free on GitHub Pages.

---

## Color palette

CSS variables on `:root`. Copy verbatim into any new project's stylesheet.

```css
:root {
  /* Surfaces */
  --bg:         #eef1f5;   /* page background — soft cool gray */
  --panel:      #ffffff;   /* card surface */
  --line:       #d6dce4;   /* border / divider */
  --shadow:     0 1px 2px rgba(20,30,50,.06), 0 6px 20px rgba(20,30,50,.06);

  /* Text */
  --ink:        #1f2328;   /* primary text */
  --dim:        #5b6470;   /* secondary text, labels */

  /* Accent (primary action / focus) */
  --accent:     #2f6df0;   /* primary blue */
  --accent-d:   #1f4fc4;   /* hover / strong link */

  /* Semantic */
  --good:       #1a7f37;   /* success */
  --good-bg:    #e7f6ec;   /* success surface */
  --bad:        #cf222e;   /* error */
  --bad-bg:     #fdecee;   /* error surface */
  --warm:       #9a6700;   /* pro-tip / warning copy */

  /* Optional secondary phase (if your project has a "mode switch") */
  --phase-2:    #6639ba;   /* purple — used here for the "On the Job" phase */
  --phase-2-bg: #f3eefb;
  --phase-2-bd: #ddccf3;

  /* Spreadsheet-specific (skip if not rendering a sheet) */
  --sheet-head: #f3f5f8;
  --sel:        #fff4cf;
  --sel-line:   #e0a200;
}
```

**Hex quick-reference:** `#2f6df0` (blue) · `#1a7f37` (green) · `#9a6700` (warm)
· `#6639ba` (secondary purple) · `#cf222e` (error) · `#eef1f5` (page bg) ·
`#ffffff` (panels) · `#d6dce4` (borders).

---

## Typography

```css
body {
  font: 15px/1.55 -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
code, .filename { font-family: "Consolas", ui-monospace, monospace; }
```

- Body: 15px, line-height 1.55, system-ui stack (never load Google Fonts
  unless absolutely required — keeps it instant + offline-capable).
- Headings: 18–24px, weight 600–700, line-height 1.2–1.25.
- Eyebrows (small uppercase labels): 10–11px, weight 800,
  letter-spacing .06–.09em, uppercase, in `--accent-d` or `--dim`.
- Pills/chips: 11–12.5px, weight 600–700, 5–7px padding, 999px radius.
- Code/filenames: Consolas / ui-monospace, never mix into prose lines unless
  inside a `<code>` chip.

---

## Layout

### Top orientation bar (sticky)

```html
<header class="topbar">
  <div class="brand">
    <span class="logo">▦</span>
    <div class="brand-text">
      <strong>Project Name</strong>
      <span class="sub">Subtitle / tagline</span>
    </div>
  </div>
  <div class="orient">
    <span class="phase-chip phase-academy">PHASE NAME</span>
    <span class="habit-chip">🎯 <span>What you're learning / doing</span></span>
    <div class="progress-wrap">
      <span class="wave-count">Step 1 of 10</span>
      <span class="progress"><!-- dots --></span>
    </div>
  </div>
  <button class="curriculum-btn">📋 Curriculum</button>
</header>
```

```css
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 10px 18px;
  background: var(--panel); border-bottom: 1px solid var(--line);
  position: sticky; top: 0; z-index: 5;
}
.logo {
  font-size: 22px; color: var(--accent);
  background: linear-gradient(135deg, #eaf1ff, #dbe7ff);
  width: 38px; height: 38px; display: grid; place-items: center; border-radius: 9px;
}
```

### Two-column stage (rail + work)

```css
.stage {
  max-width: 1180px; margin: 22px auto; padding: 0 18px;
  display: grid; grid-template-columns: 280px 1fr; gap: 18px; align-items: start;
}

.rail {
  display: flex; flex-direction: column; gap: 14px;
  position: sticky; top: 72px;
  align-self: start;
  max-height: calc(100vh - 92px);
  overflow-y: auto;
  padding-right: 4px;
}

/* Mobile: rail collapses ABOVE work (directive first) */
@media (max-width: 720px) {
  .stage { grid-template-columns: 1fr; }
  .rail {
    position: static; order: 1;
    max-height: none; overflow-y: visible; padding-right: 0;
  }
  .work { order: 2; }
}
```

**Important breakpoints:**
- `≥720px` — side-by-side 280px rail + 1fr work area
- `<720px` — stacked, rail above work (Brief first, file second)

The 720 breakpoint catches almost all desktop zoom levels (1080p @ 125–200%
all stay in 2-col).

---

## Components

### 1. Phase chip (top-bar mode indicator)

```css
.phase-chip {
  font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase;
  padding: 5px 10px; border-radius: 6px; white-space: nowrap;
}
.phase-chip.phase-academy { background: #eaf3ee; color: #1a7f37; border: 1px solid #bfe5ca; }
.phase-chip.phase-job     { background: var(--phase-2-bg); color: var(--phase-2); border: 1px solid var(--phase-2-bd); }
```

Use to indicate the user's current mode (e.g., LEARNING / PRACTICING /
ON THE JOB / BROWSE / EDIT). Green for "neutral / learning," purple for
"applying / advanced," blue accent for default.

### 2. Habit chip (currently focused concept)

```css
.habit-chip {
  background: #eef4ff; color: var(--accent-d); border: 1px solid #d4e1ff;
  padding: 5px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600;
  white-space: nowrap;
}
```

### 3. Progress dots

```css
.progress { display: flex; gap: 6px; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--line); }
.dot.active { background: var(--accent); box-shadow: 0 0 0 3px #d8e4ff; }
.dot.done { background: var(--good); }
```

### 4. Generic card (panel)

```css
.card, .voice, .work, .brief-card {
  background: var(--panel);
  border: 1px solid var(--line); border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 16px;
}
```

### 5. Brief card (the "what to do" card — the most distinctive component)

The brief card is the system's signature. **Always at the top of the rail.**
It tells the user what to do, how to do it, and why it matters — in that order.

```html
<section class="brief-card">
  <div class="brief-eyebrow">📋 Task brief</div>
  <h2 class="brief-title">Module 3 · Data types</h2>
  <div class="brief-stage">Try it — guided (we do)</div>
  <p class="brief-prompt">Click the column that holds <b>dates</b>.</p>
  <div class="brief-sublabel">Your checklist</div>
  <ol class="brief-checklist">
    <li>Skim each column top to bottom</li>
    <li>Find the one with calendar values</li>
    <li>Click its letter, then Confirm</li>
  </ol>
  <div class="brief-tip">
    <span class="tip-icon">💡</span>
    <span class="tip-body">
      <span class="tip-label">Pro tip:</span> Know each column's type before you touch a formula.
    </span>
  </div>
</section>
```

```css
.brief-card {
  background: #ffffff;
  border: 1px solid var(--line); border-radius: 14px;
  box-shadow: var(--shadow);
  border-left: 5px solid var(--accent);   /* accent rail on the left edge */
  padding: 16px 18px 14px;
}
.brief-eyebrow {
  font-size: 10.5px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
  color: var(--accent-d); margin-bottom: 6px;
}
.brief-title { margin: 0 0 4px; font-size: 18px; line-height: 1.25; color: var(--ink); }
.brief-stage {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--accent-d); background: #eef4ff; border: 1px solid #d4e1ff;
  padding: 3px 9px; border-radius: 999px; margin-bottom: 10px;
}
.brief-prompt { margin: 0 0 12px; font-size: 14.5px; line-height: 1.5; color: var(--ink); }
.brief-prompt b { color: var(--accent-d); }
.brief-sublabel {
  font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  color: var(--dim); margin-bottom: 6px;
}

/* Numbered checklist with circle counters */
.brief-checklist {
  list-style: none; counter-reset: brief-step; padding: 0; margin: 0 0 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.brief-checklist li {
  counter-increment: brief-step;
  position: relative; padding: 7px 10px 7px 34px;
  font-size: 13.5px; line-height: 1.45; color: #2b3240;
  background: #f7faff; border: 1px solid #dde6f5; border-radius: 8px;
}
.brief-checklist li::before {
  content: counter(brief-step);
  position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: grid; place-items: center;
  font-size: 11px; font-weight: 700;
}

/* Pro-tip callout (warm yellow) */
.brief-tip {
  margin: 10px 0 0; padding: 9px 11px; border-radius: 8px;
  background: #fbf7ec; border: 1px solid #e3d7a5; color: #3b2f10;
  font-size: 13px; line-height: 1.45;
  display: flex; gap: 8px; align-items: flex-start;
}
.tip-icon { flex: 0 0 auto; font-size: 14px; line-height: 1.45; }
.tip-body { flex: 1 1 auto; min-width: 0; }
.tip-label { font-weight: 700; color: var(--warm); margin-right: 2px; }
```

**Variant — purple accent for a secondary phase:**

```css
.brief-card.brief-job { border-left-color: var(--phase-2); }
.brief-card.brief-job .brief-eyebrow { color: var(--phase-2); }
.brief-card.brief-job .brief-stage   { color: var(--phase-2); background: var(--phase-2-bg); border-color: var(--phase-2-bd); }
.brief-card.brief-job .brief-checklist li { background: #f9f5ff; border-color: #e7dcf6; }
.brief-card.brief-job .brief-checklist li::before { background: var(--phase-2); }
```

### 6. Voice card (mentor / narrator / friendly explainer)

Used for any character voice — a mentor, a narrator, even a "system" tip block.

```html
<section class="voice">
  <div class="voice-head">
    <span class="avatar">☕</span>
    <div><strong>Sam</strong><span class="role">your onboarding mentor</span></div>
  </div>
  <div class="voice-body mood-mentor">
    Lesson text goes here. Sam can use <b>bold</b> and <i>italic</i> freely.
  </div>
</section>
```

```css
.voice { padding: 16px; }
.voice-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.voice-head .avatar { font-size: 26px; }
.voice-head strong { display: block; font-size: 14px; }
.voice-head .role { font-size: 11.5px; color: var(--dim); }
.voice-body {
  font-size: 14.5px; line-height: 1.6; color: #2b3240;
  border-left: 3px solid var(--line); padding: 4px 0 4px 12px;
  transition: border-color .25s ease;
}
.voice-body.mood-mentor { border-color: var(--good); }   /* warm/friendly  */
.voice-body.mood-intro  { border-color: #b8c2d0; }       /* neutral        */
.voice-body.mood-win    { border-color: var(--good); }   /* success        */
.voice-body.mood-fail   { border-color: var(--warm); }   /* gentle warning */
.voice-body b { color: var(--accent-d); }
```

The accent border on the left changes color with mood — subtle emotional
signal without a heavy frame.

### 7. Stepper (multi-step sub-arc indicator)

```html
<ol class="stepper" aria-label="Section progress">
  <li class="step is-done">    <span class="step-num">✓</span><span class="step-label">Intro</span></li>
  <li class="step is-active">  <span class="step-num">2</span><span class="step-label">Watch</span></li>
  <li class="step">            <span class="step-num">3</span><span class="step-label">Try</span></li>
  <li class="step">            <span class="step-num">4</span><span class="step-label">Done</span></li>
</ol>
```

```css
.stepper {
  list-style: none; margin: 0 0 14px; padding: 0;
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.stepper .step {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px 5px 6px; border-radius: 999px;
  font-size: 12px; color: var(--dim);
  background: #f3f5f8; border: 1px solid var(--line);
}
.stepper .step:not(:last-child)::after {
  content: ""; display: inline-block; width: 8px; height: 1px;
  background: var(--line); margin-left: 4px; margin-right: -8px;
}
.stepper .step-num {
  display: inline-grid; place-items: center;
  width: 18px; height: 18px; border-radius: 50%;
  font-size: 11px; font-weight: 700;
  background: #ffffff; color: var(--dim); border: 1px solid var(--line);
}
.stepper .step.is-active {
  background: #eef4ff; border-color: #b6c8ee; color: var(--accent-d);
}
.stepper .step.is-active .step-num {
  background: var(--accent); color: #fff; border-color: var(--accent);
  box-shadow: 0 0 0 3px #d8e4ff;
}
.stepper .step.is-active .step-label { font-weight: 700; }
.stepper .step.is-done {
  background: var(--good-bg); border-color: #bfe5ca; color: var(--good);
}
.stepper .step.is-done .step-num {
  background: var(--good); color: #fff; border-color: var(--good);
}
```

### 8. Help (pull-only hint)

```html
<section class="help help-inline">
  <button class="help-btn">🙋 Need a hand?</button>
  <ul class="help-list"></ul>
</section>
```

```css
.help-btn {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1px dashed #c3ccd8; background: #f7f9fc; color: var(--accent-d);
  font-weight: 600; font-size: 13.5px; cursor: pointer;
}
.help-btn:disabled { opacity: .55; cursor: default; }
.help-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.help-list li {
  font-size: 13.5px; line-height: 1.55; color: #36404f;
  background: #f7f9fc; border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px;
}
.tier-tag {
  display: inline-block; font-size: 10.5px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase; color: var(--accent-d); background: #e6eefe;
  padding: 1px 7px; border-radius: 999px; margin-right: 6px;
}
.help.help-inline { background: transparent; border: 0; box-shadow: none; padding: 14px 0 4px; }
```

Default behavior: help is **pull-only** (user clicks to reveal). In tutorial /
guided modes you can show it pre-revealed (push mode).

### 9. Primary action button

```css
.primary {
  background: var(--accent); color: #fff; border: 0; border-radius: 10px;
  padding: 11px 22px; font-size: 14.5px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 8px rgba(47,109,240,.35);
  transition: background .15s, transform .05s;
}
.primary:hover:not(:disabled) { background: var(--accent-d); }
.primary:active:not(:disabled) { transform: translateY(1px); }
.primary:disabled { background: #b9c4d4; box-shadow: none; cursor: default; }
.primary.primary-xl { padding: 14px 32px; font-size: 16px; border-radius: 12px; }
.primary.primary-sm { padding: 7px 14px; font-size: 12.5px; border-radius: 8px; }
.ghost-btn {
  background: transparent; border: 1px solid var(--line); color: var(--dim);
  padding: 6px 10px; border-radius: 8px; font-size: 12.5px; cursor: pointer;
}
.ghost-btn:hover { background: #f3f5f8; color: var(--ink); }
```

Action button copy: prefer real verbs in title case. `Confirm →`, `Continue →`,
`Save →`, `Next →`. NEVER use game-show phrasing ("Lock it in"), arcade
phrasing, or vague generics ("OK", "Submit").

### 10. Feedback line (inline status — never covers the action)

```css
.feedback {
  margin: 12px 0 0; padding: 9px 13px; border-radius: 9px;
  font-size: 13.5px; font-weight: 500;
}
.feedback.neutral { background: #eef2f7; color: var(--dim); }
.feedback.good    { background: var(--good-bg); color: var(--good); }
.feedback.bad     { background: var(--bad-bg); color: var(--bad); }
```

### 11. Welcome / landing screen

Pattern for a project's index page. Use it to set premise + show the road ahead.

```html
<div class="welcome">
  <div class="welcome-card">
    <div class="welcome-title">
      <span class="logo welcome-logo">▦</span>
      <div>
        <h1>You just got hired.</h1>
        <p class="welcome-sub">One-line tagline.</p>
      </div>
    </div>
    <div class="welcome-premise">
      <p><b>Here's the deal.</b> 2–4 sentences of premise.</p>
      <p class="welcome-taglineline">Short emotional tagline.</p>
    </div>
    <!-- visible road-ahead syllabus -->
    <div class="syllabus">
      <h3>Your training path <span class="syl-note">(2/10 built — live beta)</span></h3>
      <div class="syl-stack">
        <div class="syl-section">
          <h4>📚 Section name <span class="syl-progress">2/10</span></h4>
          <ol class="syl-list">
            <li class="syl-item is-built"><span class="syl-icon">✅</span><span>Module 1 — Name</span></li>
            <li class="syl-item is-locked"><span class="syl-icon">🔒</span><span>Module 2 — Name</span></li>
          </ol>
        </div>
      </div>
    </div>
    <div class="welcome-cta">
      <button class="primary primary-xl">Start →</button>
    </div>
  </div>
</div>
```

(Full CSS is in `spreadsheet-archaeology/styles.css` under "Welcome / landing"
— copy as-is.)

### 12. Curriculum / nav drawer (right-side slide-out panel)

Useful any time the user benefits from a persistent "jump anywhere" panel
plus power-user controls (theme toggle, reveal-answer, restart). Component
includes a 📋 button in the top-bar that toggles a side drawer.

```css
.curriculum-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: 360px; max-width: 92vw;
  background: #ffffff; border-left: 1px solid var(--line);
  box-shadow: -8px 0 24px rgba(20,30,50,.10);
  display: flex; flex-direction: column; z-index: 30;
}
.curriculum-drawer[hidden] { display: none; }  /* override flex */
```

(Full CSS in `styles.css` under "Curriculum drawer.")

### 13. Celebration FX (micro-rewards)

Use sparingly — only on genuine accomplishments. **Never** as ambient/background
chrome. NEVER chiptune; sine + triangle waves only.

- **`Celebrate.tap(el)`** — warm major-third dyad + green pulse ring on `el`
  (every correct action)
- **`Celebrate.stepDone()`** — single soft blip (each step forward)
- **`Celebrate.moduleDone(text)`** — C-E-G arpeggio + toast banner + soft confetti
- **`Celebrate.graduate(text)`** — C-E-G-C lift + larger banner + heavier confetti
- **`Celebrate.wrong()`** — single soft low G3 triangle (feedback, not punishment)

Audio is gated to the first user gesture (e.g., a "Start →" button click).
Toggle persists to `localStorage`. Respect `prefers-reduced-motion`.

Reference impl: `spreadsheet-archaeology/celebrate.js`.

---

## Interaction patterns

### Gradual release ("I do → We do → You do")

When teaching a skill: show a worked example first (push help freely), then a
guided rep (hints shown, answer softly highlighted), then a solo rep (no
highlight, help on demand only). This is from Atul Gawande's *Checklist
Manifesto* and educational research on worked examples.

### Pull-only help on real tasks

On real tasks (vs. teaching mode), help is pull-only — user clicks to reveal,
one tier at a time. Protects the "figure it out" feel.

### Always show: been / are / going

Three layers of orientation everywhere:
1. **Top bar** — phase chip + dots → "where am I in the whole product?"
2. **Brief card** — stage pill → "what am I doing right now?"
3. **Stepper** (if multi-step) → "what's next in this section?"

### Predictable, earned rewards

Every correct answer rewarded the same way (Tier 1). Bigger reward on
milestone (Tier 3). Biggest on graduation (Tier 4). NO random jackpots, NO
streak-anxiety, NO time pressure. Passes the regret test.

---

## File structure pattern

Recommended split for any non-trivial web project:

```
/
├── index.html          — single-page shell
├── styles.css          — all styles (CSS variables on :root)
├── core.js             — shared utilities (DOM helpers, safe evaluators)
├── celebrate.js        — celebrations / juice (optional, for interactive apps)
├── <content>.js        — pure data (lessons, articles, items, etc.)
├── <engine>.js         — generic engine that renders <content>.js
├── app.js              — top-level flow controller
└── README.md
```

The split: **content is data, engine is code.** Adding a new lesson/article/
item is editing a data file, not the engine. This makes future maintenance
(by Mike, by a collaborator, by Claude) much cheaper.

---

## What NOT to copy

Don't blindly port these — they're specific to *Getting It Wrong Gets You
There Faster* and won't fit other projects:

- **The "Sam" mentor character** — names + personality are project-specific.
  Other projects might not have a narrator at all.
- **The "Predecessor" narrator** — story-specific. Same caveat.
- **Module / Wave structure** — that's a learning-game pattern. A landing
  page or a doc site doesn't have modules.
- **Two-phase "Onboarding → Job"** — game-specific narrative arc.
- **The exact Pro Tip copy** — those are analyst-data-cleaning tips.
  Write fresh ones that match each project's domain.

What DOES transfer to almost any project:
- Color palette, type stack, top bar, generic card, voice card pattern,
  primary button, feedback line, layout grid, breakpoints, dark patterns
  to avoid, vanilla tech stack.

What transfers to interactive/educational projects:
- Brief card, stepper, help block, celebration FX, gradual-release pattern,
  curriculum drawer.

What transfers to landing pages / doc sites:
- Welcome card, syllabus list pattern, top-bar logo + brand, ghost button,
  feedback line for inline status.

---

## Per-project adaptation notes

### `michaelnocito.github.io` (main landing page)
- Apply: top bar, hero "welcome card" pattern, syllabus list (re-purposed as
  "Projects" list with the same `.syl-item.is-built` style for live projects),
  color palette, type stack.
- Add a `.phase-chip` at the top set to e.g. `LOOKING FOR WORK` or `PORTFOLIO`.
- Cross-link to each project using the syllabus item style.
- DROP: brief card, stepper, celebrations (overkill for a landing page).

### `analyst-prep-kit` (consolidated prep kits)
- Apply: full system. Each kit (SQL / Excel / Python / Tableau / Stats)
  becomes a "section" in the syllabus on the index. Drilling into a kit
  shows the brief-card + stepper pattern. Each chapter has its own progress.
- Use the **phase chip** to distinguish kits: e.g. `SQL` (blue accent),
  `EXCEL` (green), `PYTHON` (warm), `TABLEAU` (purple).
- Pro tips for each chapter — golden opportunity (these ARE analyst tips).
- Pull-only "Reveal solution" matches the existing prep-kit pattern.

### `sql-quest` (browser game)
- Selectively apply: color palette already overlaps. Adopt the top-bar with
  phase chip + Curriculum-style drawer pattern (your existing dev controls
  could move into the system's curriculum drawer pattern). Brief card could
  replace the current "intel sheet" if you want consistency.
- DO NOT remove the celestial / psychedelic art aesthetic on the battlefield —
  that's the game's identity. The system is for the chrome / shell only.
- Stepper pattern works for the wave-1-to-wave-N progress band.

### `nexus-sql-mystery` (full re-skin)
- Apply: full system. The mystery cards become brief-card variants.
  Each clue / objective gets a checklist. NEXUS's existing celebrations get
  upgraded to the Celebrate.* tiers. The codex panel becomes a curriculum
  drawer.
- The current PySide6 NEXUS desktop app is OUT of scope; this re-skin is
  for the web version if/when there is one. If NEXUS stays desktop-only,
  skip it from this batch.

### `spreadsheet-cleaner` (docs landing page at `docs/index.html`)
- Apply: lightweight version — top bar + welcome card + syllabus list
  re-purposed as feature list. Cross-link to other projects in your portfolio.

### `recordforge` (if it has a Pages landing)
- If applicable: same lightweight treatment as spreadsheet-cleaner.

---

## Versioning + updating this doc

When the live system in `spreadsheet-archaeology` evolves (new component,
changed pattern), update this doc in the same commit. Don't let it drift.

The canonical URL future Claude sessions should fetch:
**https://raw.githubusercontent.com/michaelnocito/spreadsheet-archaeology/main/DESIGN_SYSTEM.md**

---

*Maintained alongside Getting It Wrong Gets You There Faster.*
