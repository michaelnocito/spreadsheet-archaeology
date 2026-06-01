/* ============================================================================
 * Getting It Wrong Gets You There Faster — THE JOB (generic on-the-job engine)
 * ----------------------------------------------------------------------------
 * Where you APPLY what the Academy taught — under the Predecessor's mess.
 * Knows nothing about any specific wave; renders whatever WAVES[] hands it:
 *   - the Predecessor's scenario intro
 *   - the artifact (clickable sheet, via SACore)
 *   - the task + pull-only 3-tier help (player asks; nothing is pushed)
 *   - win / fail / miss feedback, driven by the wave's check expressions
 *
 * Add content by editing waves.js. Controlled by app.js (starts after the
 * Academy graduates the player). Call Job.start() to begin.
 * ========================================================================== */

(function () {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);

  const state = { index: 0, interaction: {}, helpTier: 0, solved: false };
  let WAVE = null;

  function start(idx) {
    state.index = idx || 0;
    boot();
  }

  function boot() {
    WAVE = WAVES[state.index];
    state.interaction = {};
    state.helpTier = 0;
    state.solved = false;

    setOrientation();
    renderPredecessor(WAVE.scenario.intro, "intro");
    $("#job-brief-title").textContent = `File ${state.index + 1} · ${WAVE.concept.name}`;
    $("#job-brief-stage").textContent = "On the job — apply what you learned";
    // THE ASK — the stakeholder request driving this whole file; the north star.
    const askEl = $("#job-brief-ask");
    if (WAVE.ask) {
      askEl.innerHTML =
        `<span class="ask-eyebrow">🧭 The ask</span><span class="ask-body">${WAVE.ask}</span>`;
      askEl.hidden = false;
    } else {
      askEl.hidden = true; askEl.innerHTML = "";
    }
    // Steps & context: open on desktop, collapsed on narrow screens.
    const more = $("#job-brief-more");
    if (more) more.open = !(typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 720px)").matches);
    if (WAVE.task && WAVE.task.directive) {
      $("#job-brief-task").innerHTML =
        `<span class="task-icon">🎯</span><span class="task-do">${WAVE.task.directive}</span>`;
      $("#job-brief-task").hidden = false;
    } else {
      $("#job-brief-task").hidden = true;
    }
    $("#task-prompt").innerHTML = WAVE.task.prompt;
    renderRecall();
    const fname = WAVE.artifact ? WAVE.artifact.title : "";
    $("#filename").textContent = fname;
    $(".tab-name").textContent = fname || WAVE.concept.name;
    // File line only makes sense when there's a file to open.
    const fileLine = document.querySelector("#job-brief-more .file-line");
    if (fileLine) fileLine.hidden = !WAVE.artifact;
    // Work-head hint matches this wave's interaction kind.
    const kindHint = {
      select_row: "Click a row number",
      select_column: "Click a column letter",
      select_cell: "Click a cell",
      select_option: "Pick the best answer below"
    };
    $("#job-work-hint").textContent = kindHint[taskKind()] || "";
    const checklist = WAVE.task && WAVE.task.checklist;
    if (checklist && checklist.length) {
      $("#job-brief-checklist").innerHTML = checklist.map((c) => `<li>${c}</li>`).join("");
      $("#job-brief-checklist-wrap").hidden = false;
    } else {
      $("#job-brief-checklist-wrap").hidden = true;
    }
    if (WAVE.best_practice) {
      $("#job-brief-tip").innerHTML = `<span class="tip-icon">💡</span><span class="tip-body"><span class="tip-label">Pro tip:</span> ${WAVE.best_practice}</span>`;
      $("#job-brief-tip").hidden = false;
    } else {
      $("#job-brief-tip").hidden = true;
    }
    renderArtifact();
    renderHelp();
    clearFeedback();
    $("#sheet").classList.remove("locked");
    $("#slice-note").hidden = true;
    setPrimary("Confirm →", false);
    if (window.DEV_AUTOREVEAL) devReveal();
  }

  function setOrientation() {
    $("#phase-chip").textContent = "ON THE JOB";
    $("#phase-chip").className = "phase-chip phase-job";
    $("#habit").textContent = WAVE.concept.name;
    const dots = WAVES.length;
    const wrap = $("#progress");
    wrap.innerHTML = "";
    for (let i = 0; i < dots; i++) {
      const d = document.createElement("span");
      d.className = "dot" + (i < state.index ? " done" : i === state.index ? " active" : "");
      wrap.appendChild(d);
    }
    $("#wave-count").textContent = `File ${state.index + 1} of ${dots}`;
  }

  function renderPredecessor(text, mood) {
    const box = $("#predecessor-body");
    box.className = "voice-body is-clamped mood-" + (mood || "intro");
    box.innerHTML = text;
    const toggle = $("#predecessor-toggle");
    if (toggle) {
      toggle.textContent = "Show more ▾";
      requestAnimationFrame(() => {
        toggle.hidden = box.scrollHeight <= box.clientHeight + 2;
      });
    }
  }

  // Resolve a concept id (e.g. "orient_header") to its display name by scanning
  // the waves. Falls back to a humanized id so the chip never shows a raw key.
  function conceptName(id) {
    const hit = WAVES.find((w) => w.concept && w.concept.id === id);
    if (hit) return hit.concept.name;
    return String(id).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Spaced-retrieval recall chip: surfaces the earlier skills this file makes
  // the player reuse (the dormant `callbacks` data). Seeing it = the point.
  function renderRecall() {
    const chip = $("#job-brief-recall");
    const ids = (WAVE.callbacks || []).filter(Boolean);
    if (!ids.length) { chip.hidden = true; chip.innerHTML = ""; return; }
    const names = ids.map(conceptName).join(", ");
    chip.innerHTML =
      `<span class="recall-icon">🔁</span>` +
      `<span class="recall-body"><b>Reusing what you learned:</b> ${names}</span>`;
    chip.hidden = false;
  }

  const taskKind = () => (WAVE.task && WAVE.task.kind) || "select_row";

  function renderArtifact() {
    const host = $("#sheet");
    const kind = taskKind();
    if (kind === "select_column") {
      SACore.renderSheet(host, WAVE.artifact, {
        selectableCols: true,
        onSelectCol: (letter) => {
          if (state.solved) return;
          state.interaction.selected_column = letter;
          setPrimary("Confirm →", true);
          setFeedback(`Column ${letter} marked. Confirm when you're sure.`, "neutral");
        }
      });
    } else if (kind === "select_cell") {
      SACore.renderSheet(host, WAVE.artifact, {
        selectableCells: true,
        onSelectCell: (addr) => {
          if (state.solved) return;
          state.interaction.selected_cell = addr;
          setPrimary("Confirm →", true);
          setFeedback(`Cell ${addr} marked. Confirm when you're sure.`, "neutral");
        }
      });
    } else if (kind === "select_option") {
      host.innerHTML = "";
      if (WAVE.artifact) SACore.renderSheet(host, WAVE.artifact, { selectable: false });
      SACore.renderOptions(host, WAVE.task.options, {
        onSelect: (id) => {
          if (state.solved) return;
          state.interaction.selected_option = id;
          setPrimary("Confirm →", true);
          setFeedback("Answer marked. Confirm when you're sure.", "neutral");
        }
      });
    } else {
      SACore.renderSheet(host, WAVE.artifact, {
        selectable: true,
        onSelectRow: (rnum) => {
          if (state.solved) return;
          state.interaction.selected_header_row = rnum;
          setPrimary("Confirm →", true);
          setFeedback(`Row ${rnum} marked as the header. Confirm when you're sure.`, "neutral");
        }
      });
    }
  }

  // ----- Pull-only help -------------------------------------------------------
  function renderHelp() {
    const tiers = [WAVE.help.tier1, WAVE.help.tier2, WAVE.help.tier3].filter(Boolean);
    const list = $("#help-list");
    list.innerHTML = "";
    for (let i = 0; i < state.helpTier; i++) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="tier-tag">Backup ${i + 1}</span> ${tiers[i]}`;
      list.appendChild(li);
    }
    const btn = $("#help-btn");
    if (state.helpTier >= tiers.length) {
      btn.disabled = true; btn.textContent = "That's all I've got";
    } else {
      btn.disabled = false;
      btn.textContent = state.helpTier === 0
        ? "🆘 Ask the Predecessor for backup" : "Ask for another hint";
    }
  }
  function askForHelp() {
    const tiers = [WAVE.help.tier1, WAVE.help.tier2, WAVE.help.tier3].filter(Boolean);
    if (state.helpTier < tiers.length) state.helpTier++;
    renderHelp();
  }

  // ----- Submit / outcomes ----------------------------------------------------
  function setPrimary(label, enabled) {
    const b = $("#primary"); b.textContent = label; b.disabled = !enabled;
  }

  // Whatever the player has picked this wave, regardless of interaction kind.
  function currentPick() {
    const kind = taskKind();
    if (kind === "select_column") return state.interaction.selected_column;
    if (kind === "select_cell") return state.interaction.selected_cell;
    if (kind === "select_option") return state.interaction.selected_option;
    return state.interaction.selected_header_row;
  }

  function submit() {
    if (state.solved) { advance(); return; }
    if (currentPick() == null) return;

    // Per-wave status pills (the small inline line); the Predecessor voice
    // carries the real narrative. Fall back to generic wording if unset.
    const status = (WAVE.task && WAVE.task.status) || {};
    const kind = taskKind();

    if (SACore.evalCheck(WAVE.task.success_check, state.interaction)) {
      state.solved = true;
      // 🎉 Tier 1: warm chime + pulse on the thing they nailed
      const target =
        kind === "select_column" ? $("#sheet").querySelector("th.col-selected") :
        kind === "select_cell"   ? $("#sheet").querySelector("td.cell-selected") :
        kind === "select_option" ? $("#sheet").querySelector(".option-card.option-selected") :
                                   $("#sheet").querySelector("tr.selected");
      Celebrate.tap(target);
      renderPredecessor(WAVE.feedback.win, "win");
      setFeedback(status.win || "✅ Nailed it.", "good");
      $("#sheet").classList.add("locked");
      const isLast = state.index + 1 >= WAVES.length;
      setPrimary(isLast ? "🎉 Sim complete" : "Next file →", true);
      $("#slice-note").hidden = !isLast;
      // 🎉 Tier 3: every cleared file is a real moment — banner each time
      Celebrate.moduleDone(`💼 File cleared — ${WAVE.concept.name}`);
    } else if (WAVE.task.fail_check && SACore.evalCheck(WAVE.task.fail_check, state.interaction)) {
      Celebrate.wrong();
      renderPredecessor(WAVE.feedback.fail, "fail");
      setFeedback(status.fail || "Not that one — but now you know why. Try again.", "bad");
      clearSelection();
    } else {
      Celebrate.wrong();
      renderPredecessor(WAVE.feedback.miss ||
        "Not quite — take another look, or ask for backup.", "miss");
      setFeedback(status.miss || "Not quite. Take another look, or ask for backup.", "bad");
      clearSelection();
    }
  }

  function clearSelection() {
    state.interaction.selected_header_row = null;
    state.interaction.selected_column = null;
    state.interaction.selected_cell = null;
    state.interaction.selected_option = null;
    const sheet = $("#sheet");
    sheet.querySelectorAll("tr.selected").forEach((tr) => tr.classList.remove("selected"));
    sheet.querySelectorAll(".col-selected").forEach((el) => el.classList.remove("col-selected"));
    sheet.querySelectorAll("td.cell-selected").forEach((td) => td.classList.remove("cell-selected"));
    sheet.querySelectorAll(".option-card.option-selected").forEach((el) => el.classList.remove("option-selected"));
    setPrimary("Confirm →", false);
  }

  function advance() {
    if (state.index + 1 < WAVES.length) {
      state.index++;
      boot();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function setFeedback(text, kind) {
    const f = $("#feedback"); f.textContent = text; f.className = "feedback " + (kind || "neutral"); f.hidden = false;
  }
  function clearFeedback() { const f = $("#feedback"); f.hidden = true; f.textContent = ""; }

  // wire the static job-screen controls once
  window.addEventListener("DOMContentLoaded", () => {
    $("#help-btn").addEventListener("click", askForHelp);
    $("#primary").addEventListener("click", submit);
    const toggle = $("#predecessor-toggle");
    if (toggle) toggle.addEventListener("click", () => {
      const box = $("#predecessor-body");
      const clamped = box.classList.toggle("is-clamped");
      toggle.textContent = clamped ? "Show more ▾" : "Show less ▴";
    });
  });

  // ----- Dev controls ---------------------------------------------------------
  function devReveal() {
    if (state.solved) return;
    const kind = taskKind();
    const answer = SACore.rhsValue(WAVE.task.success_check);
    if (answer == null) return;
    const sheet = $("#sheet");
    if (kind === "select_column") {
      const th = sheet.querySelector(`th[data-col="${answer}"]`);
      if (th) { th.classList.add("col-highlight"); th.click(); }
      setFeedback(`🛠 Dev: the answer is column ${answer}.`, "neutral");
    } else if (kind === "select_cell") {
      const td = sheet.querySelector(`td[data-addr="${answer}"]`);
      if (td) { td.classList.add("cell-highlight"); td.click(); }
      setFeedback(`🛠 Dev: the answer is cell ${answer}.`, "neutral");
    } else if (kind === "select_option") {
      const btn = sheet.querySelector(`.option-card[data-opt="${answer}"]`);
      if (btn) { btn.classList.add("option-highlight"); btn.click(); }
      setFeedback(`🛠 Dev: the answer is option "${answer}".`, "neutral");
    } else {
      const tr = sheet.querySelector(`tr[data-row="${answer}"]`);
      if (tr) {
        tr.classList.add("highlight");
        const rh = tr.querySelector(".rowhead");
        if (rh) rh.click();
      }
      setFeedback(`🛠 Dev: the header is row ${answer}.`, "neutral");
    }
  }

  window.Job = { start, dev: { reveal: devReveal } };
})();
