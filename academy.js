/* ============================================================================
 * Getting It Wrong Gets You Good — THE ACADEMY (boot-camp player)
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
          <!-- BRIEF first: it's the directive. Reads top-down before voice + work. -->
          <section class="brief-card">
            <div class="brief-eyebrow">📋 Task brief</div>
            <h2 id="a-brief-title" class="brief-title">Module</h2>
            <div id="a-brief-stage" class="brief-stage"></div>
            <p id="a-prompt" class="brief-prompt"></p>
            <div id="a-brief-checklist-wrap" hidden>
              <div class="brief-sublabel">Your checklist</div>
              <ol id="a-brief-checklist" class="brief-checklist"></ol>
            </div>
            <div id="a-brief-tip" class="brief-tip" hidden></div>
          </section>
          <section class="voice">
            <div class="voice-head">
              <span class="avatar">${MENTOR.avatar}</span>
              <div><strong>${MENTOR.name}</strong><span class="role">${MENTOR.role}</span></div>
            </div>
            <div id="a-voice" class="voice-body mood-mentor"></div>
          </section>
        </aside>
        <section class="work">
          <div class="work-head">
            <span class="tab">🎓 <span class="tab-name">Training file</span></span>
            <span id="a-work-hint" class="hint-muted"></span>
          </div>
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
  }

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
      { key: "teach", label: "Watch" },
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
        prompt: "Sam will introduce this module. When you're ready, click <b>Show me</b> to see the worked example."
      });
      $("#a-sheet").innerHTML = "";
      workHint("");
      primary("Show me →");
      return;
    }

    if (stage === "teach") {
      voice(lesson.teach.explain);
      setBrief("Watch — worked example", {
        prompt: "Sam's walking through a clean example. Just watch and follow what they're pointing at.",
        checklist: [
          "Read Sam's explanation",
          "Notice what's highlighted in the file below",
          "When it makes sense, click <b>Got it</b>"
        ]
      });
      SACore.renderSheet($("#a-sheet"), lesson.teach.example, {
        highlightRow: lesson.teach.example.highlight_row,
        highlightCell: lesson.teach.example.highlight_cell,
        selectable: false
      });
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
      const interaction = kind === "select_cell"
        ? { selected_cell: picked }
        : { selected_header_row: picked };
      if (SACore.evalCheck(rep.success_check, interaction)) {
        // 🎉 Tier 1: warm chime + pulse on the thing they clicked
        const target = kind === "select_cell"
          ? $("#a-sheet").querySelector("td.cell-selected")
          : $("#a-sheet").querySelector("tr.selected");
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
        const wrongMsg = kind === "select_cell"
          ? "Not that cell. Remember — column letter first, then row number. Try again."
          : "Not that one — that's data, or a blank, or the title. Look for the row where <i>every</i> cell is a column name. Try again.";
        voice(wrongMsg);
        feedback(kind === "select_cell" ? "Not that cell. Try again." : "Not the header row. Find the row of column names.", "bad");
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
  function voice(html) { const v = $("#a-voice"); v.innerHTML = html; }
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
