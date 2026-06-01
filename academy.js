/* ============================================================================
 * Getting It Wrong Gets You There Faster — THE ACADEMY (boot-camp player)
 * ----------------------------------------------------------------------------
 * Runs LESSONS through gradual release: Teach (worked example) → Guided (hints
 * shown + answer softly highlighted) → Solo (cold). Mentor SAM narrates. Help
 * is PUSHED — offered freely — because novices need the example before the rep.
 *
 * When the last built lesson finishes, calls opts.onGraduate() to hand the
 * player to the Job (engine.js), where the same skill gets tested under mess.
 * ========================================================================== */

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const SCREEN = "#academy-screen";
  let onGraduate = null;
  let lessonIdx = 0;
  let lesson = null;
  let repIndex = 0;        // which practice rep
  let stage = "intro";     // intro | teach | practice | outro
  let picked = null;       // selected row in current rep
  let helpShown = false;
  let lastStepIndex = -1;  // for stepper-advance chime

  function start(opts) {
    opts = opts || {};
    onGraduate = opts.onGraduate || function () {};
    buildShell();
    jumpToLesson(opts.initialLesson || 0);
  }

  // Dev / navigation: jump straight to any built lesson.
  function jumpToLesson(idx) {
    lessonIdx = Math.max(0, Math.min(idx, LESSONS.length - 1));
    lesson = LESSONS[lessonIdx];
    repIndex = 0;
    stage = "intro";
    lastStepIndex = -1; // suppress the welcome chime on the first render
    setOrientation();
    render();
  }

  // ----- One-time shell -------------------------------------------------------
  function buildShell() {
    $(SCREEN).innerHTML = `
      <main class="stage">
        <aside class="rail">
          <!-- BRIEF first. Orientation backbone (the ask + the directive) stays
               always visible; everything else collapses behind a disclosure. -->
          <section class="brief-card">
            <div class="brief-eyebrow">📋 Task brief</div>
            <h2 id="a-brief-title" class="brief-title">Module</h2>
            <div id="a-brief-stage" class="brief-stage"></div>
            <!-- ALWAYS VISIBLE: the directive (what now). The ask now leads the
                 work area, directly under the training-file tab. -->
            <p id="a-brief-task" class="brief-task" hidden></p>
            <!-- COLLAPSIBLE: steps & context (open on desktop, closed on mobile) -->
            <details id="a-brief-more" class="brief-more">
              <summary class="brief-more-summary"><span class="more-label">Steps &amp; context</span></summary>
              <div class="brief-more-body">
                <p id="a-prompt" class="brief-prompt"></p>
                <p id="a-brief-recall" class="brief-recall" hidden></p>
                <div id="a-brief-checklist-wrap" hidden>
                  <div class="brief-sublabel">Your checklist</div>
                  <ol id="a-brief-checklist" class="brief-checklist"></ol>
                </div>
                <div id="a-brief-tip" class="brief-tip" hidden></div>
              </div>
            </details>
          </section>
        </aside>
        <section class="work">
          <!-- Sam's guidance sits full-width directly above the workbook so it's
               easy to reference while working (was cramped in the left rail). -->
          <section class="voice voice-lead">
            <div class="voice-head">
              <span class="avatar">${MENTOR.avatar}</span>
              <div><strong>${MENTOR.name}</strong><span class="role">${MENTOR.role}</span></div>
            </div>
            <div id="a-voice" class="voice-body mood-mentor is-clamped"></div>
            <button id="a-voice-toggle" class="voice-toggle" type="button" hidden>Show more ▾</button>
          </section>
          <div class="work-head">
            <span class="tab">🎓 <span class="tab-name">Training file</span></span>
            <span id="a-work-hint" class="hint-muted"></span>
          </div>
          <!-- THE ASK — the standing goal, first line under the training-file tab
               so it stays in view while you work (was in the left rail). -->
          <div id="a-brief-ask" class="brief-ask brief-ask-lead" hidden></div>
          <ol id="a-stepper" class="stepper" aria-label="Module progress"></ol>
          <div id="a-sheet" class="sheet"></div>
          <div id="a-feedback" class="feedback" hidden></div>
          <!-- Help (button + hint) sits below the table where there's natural
               space, contextual to where the player is actually working. -->
          <section class="help help-inline" id="a-help" hidden>
            <button id="a-help-btn" class="help-btn">🙋 Need a hand?</button>
            <ul id="a-help-list" class="help-list"></ul>
          </section>
          <div class="action-row"><button id="a-primary" class="primary"></button></div>
        </section>
      </main>`;

    $("#a-primary").addEventListener("click", onPrimary);
    $("#a-help-btn").addEventListener("click", () => {
      const list = $("#a-help-list");
      list.innerHTML = `<li><span class="tier-tag">Hint</span> ${currentRep().hint || lesson.teach.callout}</li>`;
      helpShown = true;
      $("#a-help-btn").disabled = true;
      $("#a-help-btn").textContent = "There you go 👍";
    });
    // Steps & context disclosure: open on desktop, collapsed on narrow screens
    // so the rail isn't a wall of text on mobile. The ask + directive stay out.
    const more = $("#a-brief-more");
    if (more) more.open = !isNarrow();
    // Sam's voice clamps to a few lines with a "Show more" toggle.
    $("#a-voice-toggle").addEventListener("click", () => {
      const v = $("#a-voice");
      const clamped = v.classList.toggle("is-clamped");
      $("#a-voice-toggle").textContent = clamped ? "Show more ▾" : "Show less ▴";
    });
  }

  const isNarrow = () =>
    typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches;

  function setOrientation() {
    $("#phase-chip").textContent = "ONBOARDING";
    $("#phase-chip").className = "phase-chip phase-academy";
    $("#habit").textContent = lesson.concept.name;
    $("#wave-count").textContent = `Module ${lesson.day} of ${ACADEMY_PLAN.length}`;
    const wrap = $("#progress");
    wrap.innerHTML = "";
    ACADEMY_PLAN.forEach((d) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (d.day < lesson.day ? " done" : d.day === lesson.day ? " active" : "");
      wrap.appendChild(dot);
    });
    $("#a-brief-title").textContent = `Module ${lesson.day} · ${lesson.concept.name}`;
    // THE ASK — the standing goal for the whole module (the player's north star).
    // Constant across every step; always visible above the per-step directive.
    const ask = $("#a-brief-ask");
    if (lesson.ask) {
      ask.innerHTML =
        `<span class="ask-eyebrow">🧭 The ask</span>` +
        `<span class="ask-body">${lesson.ask}</span>`;
      ask.hidden = false;
    } else {
      ask.hidden = true; ask.innerHTML = "";
    }
    // Spaced-retrieval recall chip — per-lesson constant, render once on load.
    // `reinforces` holds ready-to-show skill names (decoupled from concept ids).
    const recall = $("#a-brief-recall");
    const names = (lesson.reinforces || []).filter(Boolean);
    if (names.length) {
      recall.innerHTML =
        `<span class="recall-icon">🔁</span>` +
        `<span class="recall-body"><b>Builds on:</b> ${names.join(", ")}</span>`;
      recall.hidden = false;
    } else {
      recall.hidden = true; recall.innerHTML = "";
    }
    // Best-practice tip is a per-lesson constant — render once when the lesson loads.
    if (lesson.best_practice) {
      $("#a-brief-tip").innerHTML = `<span class="tip-icon">💡</span><span class="tip-body"><span class="tip-label">Pro tip:</span> ${lesson.best_practice}</span>`;
      $("#a-brief-tip").hidden = false;
    } else {
      $("#a-brief-tip").hidden = true;
    }
  }

  // Set the brief's stage-specific contents: subhead, prompt, optional checklist.
  function setBrief(stage, opts) {
    opts = opts || {};
    $("#a-brief-stage").textContent = stage || "";
    // The crisp directive — the one thing to do right now, scannable at a glance.
    const taskEl = $("#a-brief-task");
    if (opts.task) {
      taskEl.innerHTML =
        `<span class="task-icon">${opts.taskIcon || "🎯"}</span>` +
        `<span class="task-do">${opts.task}</span>`;
      taskEl.hidden = false;
    } else {
      taskEl.hidden = true;
    }
    $("#a-prompt").innerHTML = opts.prompt || "";
    const wrap = $("#a-brief-checklist-wrap");
    if (opts.checklist && opts.checklist.length) {
      $("#a-brief-checklist").innerHTML = opts.checklist
        .map((c) => `<li>${c}</li>`).join("");
      wrap.hidden = false;
    } else {
      $("#a-brief-checklist").innerHTML = "";
      wrap.hidden = true;
    }
  }

  const currentRep = () => lesson.practice[repIndex];

  // ----- Lesson-arc stepper (where you've been / are / going) ----------------
  // Data-driven: works for any lesson regardless of how many practice reps it has.
  function lessonSteps() {
    return [
      { key: "intro", label: "Intro" },
      { key: "teach", label: "Study" },
      ...lesson.practice.map((p, i) => ({
        key: "p" + i,
        label: p.mode === "guided" ? "Try (guided)" : "Try (solo)"
      })),
      { key: "done", label: "Done" }
    ];
  }

  function currentStepIndex() {
    if (stage === "intro") return 0;
    if (stage === "teach") return 1;
    if (stage === "practice" || stage === "practice-advance") return 2 + repIndex;
    return 2 + lesson.practice.length; // outro-advance or outro
  }

  function renderStepper() {
    const list = lessonSteps();
    const cur = currentStepIndex();
    $("#a-stepper").innerHTML = list.map((s, i) => {
      const cls = i < cur ? "step is-done" : i === cur ? "step is-active" : "step";
      const icon = i < cur ? "✓" : String(i + 1);
      return `<li class="${cls}" aria-current="${i === cur ? "step" : "false"}">
        <span class="step-num">${icon}</span>
        <span class="step-label">${s.label}</span>
      </li>`;
    }).join("");
    // Tier 2: subtle blip whenever the user moves forward (but not when a
    // module resets or jumps backward via Curriculum).
    if (cur > lastStepIndex && lastStepIndex >= 0 && cur !== list.length - 1) {
      Celebrate.stepDone();
    }
    lastStepIndex = cur;
  }

  // ----- Render the active stage ---------------------------------------------
  function render() {
    clearFeedback();
    $("#a-sheet").classList.remove("locked");
    $("#a-help").hidden = true;
    helpShown = false;
    renderStepper();

    if (stage === "intro") {
      voice(lesson.mentor_intro);
      setBrief("Intro — listen to Sam", {
        taskIcon: "▶️",
        task: "Press <b>Show me</b> to watch Sam's worked example.",
        prompt: "Sam will introduce this module first — read it on the left, then start when you're ready."
      });
      $("#a-sheet").innerHTML = "";
      workHint("");
      primary("Show me →");
      return;
    }

    if (stage === "teach") {
      voice(lesson.teach.explain);
      setBrief("Study — worked example", {
        taskIcon: "📖",
        task: "Read Sam's example below, then press <b>Got it</b>.",
        prompt: "Sam's walking through a clean example. Nothing to click yet — follow what they point at.",
        checklist: [
          "Read Sam's explanation",
          "Notice what's highlighted in the file below",
          "When it makes sense, click <b>Got it</b>"
        ]
      });
      const ex = lesson.teach.example || {};
      SACore.renderSheet($("#a-sheet"), ex, {
        highlightRow: ex.highlight_row,
        highlightCell: ex.highlight_cell,
        highlightCol: ex.highlight_col,
        selectable: false
      });
      // Judgment lessons teach with multiple-choice: show the options with the
      // right one highlighted, locked, so Sam can walk through the reasoning.
      if (ex.options) {
        SACore.renderOptions($("#a-sheet"), ex.options, { locked: true, highlight: ex.answer });
      }
      workHint("👀 just look — nothing to click yet");
      feedback(lesson.teach.callout, "neutral");
      primary("Got it — let me try →");
      return;
    }

    if (stage === "practice") {
      const rep = currentRep();
      picked = null;
      const guided = rep.mode === "guided";
      const kind = rep.kind || "select_row";
      voice(guided
        ? "Go ahead — I'll leave the answer highlighted and a hint up while you get the feel."
        : "Now without the training wheels. Take your time. Backup's right there if you want it.");
      setBrief(guided ? "Try it — guided (we do)" : "Try it — solo (you do)", {
        task: rep.task,
        prompt: rep.prompt,
        checklist: rep.checklist
      });

      if (kind === "select_cell") {
        SACore.renderSheet($("#a-sheet"), rep.artifact, {
          selectableCells: true,
          highlightCell: guided ? rep.artifact.highlight_cell : null,
          onSelectCell: (addr) => {
            picked = addr;
            primary("Confirm →", true);
            feedback(`Cell ${addr} marked. Confirm when you're ready.`, "neutral");
          }
        });
        workHint("click a cell");
      } else if (kind === "select_column") {
        SACore.renderSheet($("#a-sheet"), rep.artifact, {
          selectableCols: true,
          highlightCol: guided ? rep.artifact.highlight_col : null,
          onSelectCol: (letter) => {
            picked = letter;
            primary("Confirm →", true);
            feedback(`Column ${letter} marked. Confirm when you're ready.`, "neutral");
          }
        });
        workHint("click a column letter");
      } else if (kind === "select_option") {
        $("#a-sheet").innerHTML = "";
        // Optional reference sheet above the choices (read-only context).
        if (rep.artifact) SACore.renderSheet($("#a-sheet"), rep.artifact, { selectable: false });
        SACore.renderOptions($("#a-sheet"), rep.options, {
          highlight: guided ? SACore.rhsValue(rep.success_check) : null,
          onSelect: (id) => {
            picked = id;
            primary("Confirm →", true);
            feedback("Answer marked. Confirm when you're ready.", "neutral");
          }
        });
        workHint("pick the best answer");
      } else {
        SACore.renderSheet($("#a-sheet"), rep.artifact, {
          selectable: true,
          highlightRow: guided ? rep.artifact.highlight_row : null,
          onSelectRow: (r) => {
            picked = r;
            primary("Confirm →", true);
            feedback(`Row ${r} marked. Confirm when you're ready.`, "neutral");
          }
        });
        workHint("click a row number");
      }

      // Push help: in guided the hint is shown for free; in solo it's offered.
      $("#a-help").hidden = false;
      const list = $("#a-help-list");
      if (guided) {
        list.innerHTML = `<li><span class="tier-tag">Hint</span> ${rep.hint}</li>`;
        $("#a-help-btn").hidden = true;
      } else {
        list.innerHTML = "";
        $("#a-help-btn").hidden = false;
        $("#a-help-btn").disabled = false;
        $("#a-help-btn").textContent = "🙋 Need a hand?";
      }
      primary("Confirm →", false);
      if (window.DEV_AUTOREVEAL) devReveal();
      return;
    }

    if (stage === "outro") {
      const hasNextLesson = lessonIdx + 1 < LESSONS.length;
      voice(lesson.mentor_outro);
      setBrief("Module complete ✓", {
        taskIcon: "✅",
        task: hasNextLesson
          ? "Press <b>Next module</b> to keep going."
          : "Press <b>Head to the job</b> to start for real.",
        prompt: hasNextLesson
          ? "Skill banked. One more before we open the cursed drive."
          : "You've got the skill. Time to use it for real."
      });
      $("#a-sheet").innerHTML = "";
      workHint("");
      feedback("🎓 Skill learned: " + lesson.concept.name, "good");
      primary(hasNextLesson ? "Next module →" : "Head to the job →");
      // 🎉 Tier 3: module-complete chime + toast + soft confetti.
      Celebrate.moduleDone(`🎓 Module ${lesson.day} cleared — ${lesson.concept.name}`);
      return;
    }
  }

  // ----- Primary button per stage --------------------------------------------
  function onPrimary() {
    if (stage === "intro") { stage = "teach"; render(); return; }
    if (stage === "teach") { repIndex = 0; stage = "practice"; render(); return; }

    if (stage === "practice") {
      const rep = currentRep();
      if (picked == null) return;
      const kind = rep.kind || "select_row";
      const interaction =
        kind === "select_cell"   ? { selected_cell: picked }   :
        kind === "select_column" ? { selected_column: picked } :
        kind === "select_option" ? { selected_option: picked } :
                                   { selected_header_row: picked };
      if (SACore.evalCheck(rep.success_check, interaction)) {
        // 🎉 Tier 1: warm chime + pulse on the thing they clicked
        const target =
          kind === "select_cell"   ? $("#a-sheet").querySelector("td.cell-selected") :
          kind === "select_column" ? $("#a-sheet").querySelector("th.col-selected")  :
          kind === "select_option" ? $("#a-sheet").querySelector(".option-card.option-selected") :
                                     $("#a-sheet").querySelector("tr.selected");
        Celebrate.tap(target);
        lockSheet();
        voice(rep.praise);
        feedback("✅ " + rep.praise, "good");
        if (repIndex + 1 < lesson.practice.length) {
          primary("Next one →"); stage = "practice-advance";
        } else {
          primary("Finish lesson →"); stage = "outro-advance";
        }
      } else {
        Celebrate.wrong();
        const wrongMsg =
          kind === "select_cell"   ? "Not that cell. Remember — column letter first, then row number. Try again." :
          kind === "select_column" ? "Not that column. Read down each column's values — which one fits what the task is asking for? Try again." :
          kind === "select_option" ? "Not the best call here. Re-read the choices against the ask — which one would a careful analyst pick? Try again." :
                                     "Not that one — that's data, or a blank, or the title. Look for the row where <i>every</i> cell is a column name. Try again.";
        voice(wrongMsg);
        const fb =
          kind === "select_cell"   ? "Not that cell. Try again." :
          kind === "select_column" ? "Not that column. Try again." :
          kind === "select_option" ? "Not the best answer. Try again." :
                                     "Not the header row. Find the row of column names.";
        feedback(fb, "bad");
        clearSelection();
      }
      return;
    }

    if (stage === "practice-advance") { repIndex++; stage = "practice"; render(); return; }
    if (stage === "outro-advance") { stage = "outro"; render(); return; }
    if (stage === "outro") {
      if (lessonIdx + 1 < LESSONS.length) {
        jumpToLesson(lessonIdx + 1);
      } else {
        // 🎉 Tier 4: graduation fanfare BEFORE handing off to the Job.
        Celebrate.graduate("🎉 Onboarding complete — welcome to the job");
        onGraduate();
      }
      return;
    }
  }

  // ----- Small helpers --------------------------------------------------------
  function voice(html) {
    const v = $("#a-voice");
    v.innerHTML = html;
    // Re-clamp on each new line, then reveal the toggle only if it overflows.
    v.classList.add("is-clamped");
    const toggle = $("#a-voice-toggle");
    toggle.textContent = "Show more ▾";
    // Measure after layout: scrollHeight > clientHeight means there's hidden text.
    requestAnimationFrame(() => {
      toggle.hidden = v.scrollHeight <= v.clientHeight + 2;
    });
  }
  function workHint(t) { $("#a-work-hint").textContent = t; }
  function primary(text, enabled) {
    const b = $("#a-primary");
    b.textContent = text;
    b.disabled = enabled === false;
  }
  function feedback(text, kind) {
    const f = $("#a-feedback");
    f.textContent = text; f.className = "feedback " + (kind || "neutral"); f.hidden = false;
  }
  function clearFeedback() { const f = $("#a-feedback"); f.hidden = true; f.textContent = ""; }
  function lockSheet() { $("#a-sheet").classList.add("locked"); }
  function clearSelection() {
    picked = null;
    $("#a-sheet").classList.remove("locked");
    $("#a-sheet").querySelectorAll("tr.selected").forEach((tr) => tr.classList.remove("selected"));
    $("#a-sheet").querySelectorAll("td.cell-selected").forEach((td) => td.classList.remove("cell-selected"));
    $("#a-sheet").querySelectorAll(".col-selected").forEach((el) => el.classList.remove("col-selected"));
    $("#a-sheet").querySelectorAll(".option-card.option-selected").forEach((el) => el.classList.remove("option-selected"));
    primary("Confirm →", false);
  }

  // ----- Dev controls ---------------------------------------------------------
  function devReveal() {
    if (stage !== "practice") return;
    const rep = currentRep();
    const kind = rep.kind || "select_row";
    const answer = SACore.rhsValue(rep.success_check);
    if (answer == null) return;
    if (kind === "select_cell") {
      const td = $("#a-sheet").querySelector(`td[data-addr="${answer}"]`);
      if (td) { td.classList.add("cell-highlight"); td.click(); }
      feedback(`🛠 Dev: the answer is cell ${answer}.`, "neutral");
    } else if (kind === "select_column") {
      const th = $("#a-sheet").querySelector(`th[data-col="${answer}"]`);
      if (th) { th.classList.add("col-highlight"); th.click(); }
      feedback(`🛠 Dev: the answer is column ${answer}.`, "neutral");
    } else if (kind === "select_option") {
      const btn = $("#a-sheet").querySelector(`.option-card[data-opt="${answer}"]`);
      if (btn) { btn.classList.add("option-highlight"); btn.click(); }
      feedback(`🛠 Dev: the answer is option "${answer}".`, "neutral");
    } else {
      const tr = $("#a-sheet").querySelector(`tr[data-row="${answer}"]`);
      if (tr) {
        tr.classList.add("highlight");
        const rh = tr.querySelector(".rowhead");
        if (rh) rh.click();
      }
      feedback(`🛠 Dev: the answer is row ${answer}.`, "neutral");
    }
  }

  function devSolveStep() {
    if (stage === "practice") picked = SACore.rhsValue(currentRep().success_check);
    onPrimary();
  }

  window.Academy = { start, jumpToLesson, dev: { reveal: devReveal, solveStep: devSolveStep } };
})();
