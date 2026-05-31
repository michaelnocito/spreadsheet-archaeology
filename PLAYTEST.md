# Playtest guide — the 2-minute smoke test

The quick "does the whole thing still work, start to finish?" run.
Open the live site (or `index.html`) and go. No code, no setup.

> **Rule for this run:** if an idea hits you mid-playtest, write it on the
> Parking Lot at the bottom of this file in ONE line and keep moving. Finishing
> the run is the job. Ideas are for after. (See "Why" at the end.)

---

## Mode A — Fast smoke test (~2 min)  ← use this when you keep getting sidetracked

Goal: confirm every screen loads, every step accepts an answer, and you reach the end.

1. Open the site. You should land on the **Welcome** screen.
2. Click **📋 Curriculum** (top right) → tick **"Auto-reveal answer on every step."**
   - This pre-selects the correct answer on every Try step, so you only click Confirm.
3. Close the drawer. Click **Start Module 1 →**.
4. Now just keep clicking the **big primary button** (bottom right): it walks you
   `Show me → Got it → Confirm → Confirm → Next…` through all 5 modules.
5. After Module 5 you graduate to the **Job**. Keep clicking through **Wave 1** and **Wave 2**.
6. You're done when you see **"Week 1 — slice complete."**

If you got there without a dead button, a blank screen, or a console error → **smoke test passed.** ✅

---

## Mode B — Real playthrough (~10–15 min)  ← use this to feel the teaching

Same path, but **Auto-reveal OFF** — actually solve each step yourself.

Walk it in order (Welcome → M1 → … → M5 → Job W1 → W2). Don't jump around;
the point is the first-time-player experience.

### What to glance at on each screen (the "happy path" checklist)

**Welcome**
- [ ] Premise + Sam intro read clearly; syllabus shows 5 modules built, rest 🔒.

**Every module (M1–M5)**
- [ ] The 🎯 **task directive** is the first thing your eye lands on in the brief.
- [ ] Stepper shows where you are (Intro · Watch · Try · Try · Done).
- [ ] Right answer → warm chime + green pulse. Wrong answer → low tone + a "try again".
- [ ] Module-complete chime + confetti on "Done".

**Module-specific spot-checks**
- [ ] **M1** grid — clicking a *cell* works (C2, then D3).
- [ ] **M2** header — clicking a *row number* works.
- [ ] **M3** types — clicking a *column letter* works.
- [ ] **M4** numbers-as-text — the **green corner flags** show on the text column.
- [ ] **M5** consistency — solo step: Region is clean, **Segment** is the gremlin.

**Job (W1, W2)** — phase chip flips to **ON THE JOB** (purple)
- [ ] **W1** orient — pick row 4 = win. Try row 1 on purpose → Predecessor confession.
- [ ] **W2** type integrity — the Revenue column wears **green flags**; pick column D = win.
      Try column B (Units) on purpose → "I blamed Units too" confession.
- [ ] **🆘 Ask the Predecessor for backup** reveals hints one tier at a time.

---

## Handy dev controls (📋 Curriculum drawer)

- **🔓 Reveal answer (current step)** — highlights + selects the answer for the step you're on.
- **☑ Auto-reveal answer on every step** — does that automatically, every step (persists).
- **🔔 Sound** — mute/unmute chimes + celebrations (persists).
- **Jump list** — click any built module or wave to teleport straight to it.
- **↺ Back to welcome screen** — reset to the top.

> Turn **Auto-reveal OFF** before a real playthrough, or you'll "win" without playing.

---

## Parking Lot (dump ideas here mid-run, then keep going)

- _e.g. "M3 praise text feels long" — fix later_
-
-
