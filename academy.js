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
    setOrientation();
    render();
  }

  // ----- One-time shell -------------------------------------------------------
  function buildShell() {
    $(SCREEN).innerHTML = `
      <main class="stage">
        <aside class="rail">
          <section class="voice">
            <div class="voice-head">
              <span class="avatar">${MENTOR.avatar}</span>
              <div><strong>${MENTOR.name}</strong><span class="role">${MENTOR.role}</span></div>
            </div>
            <div id="a-voice" class="voice-body mood-mentor"></div>
          </section>
          <section class="task-card">
            <h2 id="a-stage-label">Lesson</h2>
            <p id="a-prompt" class="task-prompt"></p>
            <p class="file-line">🎓 <span id="a-daylabel"></span></p>
          </section>
          <section class="help" id="a-help" hidden>
            <button id="a-help-btn" class="help-btn">🙋 Need a hand?</button>
            <ul id="a-help-list" class="help-list"></ul>
          </section>
        </aside>
        <section class="work">
          <div class="work-head">
            <span class="tab">🎓 <span class="tab-name">Training file</span></span>
            <span id="a-work-hint" class="hint-muted"></span>
          </div>
          <div id="a-sheet" class="sheet"></div>
          <div id="a-feedback" class="feedback" hidden></div>
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
    $("#phase-chip").textContent = "ACADEMY";
    $("#phase-chip").className = "phase-chip phase-academy";
    $("#habit").textContent = lesson.concept.name;
    $("#wave-count").textContent = `Week ${lesson.week} · Day ${lesson.day}`;
    const wrap = $("#progress");
    wrap.innerHTML = "";
    ACADEMY_PLAN.forEach((d) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (d.day < lesson.day ? " done" : d.day === lesson.day ? " active" : "");
      wrap.appendChild(dot);
    });
    $("#a-daylabel").textContent = `Week ${lesson.week}, Day ${lesson.day} — ${lesson.concept.name}`;
  }

  const currentRep = () => lesson.practice[repIndex];

  // ----- Render the active stage ---------------------------------------------
  function render() {
    clearFeedback();
    $("#a-sheet").classList.remove("locked");
    $("#a-help").hidden = true;
    helpShown = false;

    if (stage === "intro") {
      voice(lesson.mentor_intro);
      label("Lesson", "Day " + lesson.day);
      $("#a-prompt").innerHTML = "Sam's about to show you how this works. No pressure — just watch first.";
      $("#a-sheet").innerHTML = "";
      workHint("");
      primary("Show me →");
      return;
    }

    if (stage === "teach") {
      voice(lesson.teach.explain);
      label("Watch — worked example", "I do");
      $("#a-prompt").innerHTML = "Sam's walking through a quick example. Just watch.";
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
      label(guided ? "Try it — guided" : "Try it — solo", guided ? "We do" : "You do");
      $("#a-prompt").innerHTML = rep.prompt;

      if (kind === "select_cell") {
        SACore.renderSheet($("#a-sheet"), rep.artifact, {
          selectableCells: true,
          highlightCell: guided ? rep.artifact.highlight_cell : null,
          onSelectCell: (addr) => {
            picked = addr;
            primary("Lock it in →", true);
            feedback(`Cell ${addr} marked. Lock it in when you're ready.`, "neutral");
          }
        });
        workHint("click a cell");
      } else {
        SACore.renderSheet($("#a-sheet"), rep.artifact, {
          selectable: true,
          highlightRow: guided ? rep.artifact.highlight_row : null,
          onSelectRow: (r) => {
            picked = r;
            primary("Lock it in →", true);
            feedback(`Row ${r} marked. Lock it in when you're ready.`, "neutral");
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
      primary("Lock it in →", false);
      if (window.DEV_AUTOREVEAL) devReveal();
      return;
    }

    if (stage === "outro") {
      const hasNextLesson = lessonIdx + 1 < LESSONS.length;
      voice(lesson.mentor_outro);
      label("Lesson complete", "✓");
      $("#a-prompt").innerHTML = hasNextLesson
        ? "Skill banked. One more before we open the cursed drive."
        : "You've got the skill. Time to use it for real.";
      $("#a-sheet").innerHTML = "";
      workHint("");
      feedback("🎓 Skill learned: " + lesson.concept.name, "good");
      primary(hasNextLesson ? "Next lesson →" : "Head to the job →");
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
        lockSheet();
        voice(rep.praise);
        feedback("✅ " + rep.praise, "good");
        if (repIndex + 1 < lesson.practice.length) {
          primary("Next one →"); stage = "practice-advance";
        } else {
          primary("Finish lesson →"); stage = "outro-advance";
        }
      } else {
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
      if (lessonIdx + 1 < LESSONS.length) jumpToLesson(lessonIdx + 1);
      else onGraduate();
      return;
    }
  }

  // ----- Small helpers --------------------------------------------------------
  function voice(html) { const v = $("#a-voice"); v.innerHTML = html; }
  function label(main, tag) {
    $("#a-stage-label").innerHTML = `${main} <span class="stage-tag">${tag}</span>`;
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
    primary("Lock it in →", false);
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
