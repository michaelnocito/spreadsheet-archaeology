/* ============================================================================
 * Getting It Wrong Gets You Good — THE JOB (generic on-the-job engine)
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
    $("#task-prompt").innerHTML = WAVE.task.prompt;
    $("#filename").textContent = WAVE.artifact ? WAVE.artifact.title : "";
    $(".tab-name").textContent = WAVE.artifact ? WAVE.artifact.title : "";
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
    $("#wave-count").textContent = `Week One · File ${state.index + 1} of ${dots}`;
  }

  function renderPredecessor(text, mood) {
    const box = $("#predecessor-body");
    box.className = "voice-body mood-" + (mood || "intro");
    box.innerHTML = text;
  }

  function renderArtifact() {
    SACore.renderSheet($("#sheet"), WAVE.artifact, {
      selectable: true,
      onSelectRow: (rnum) => {
        if (state.solved) return;
        state.interaction.selected_header_row = rnum;
        setPrimary("Confirm →", true);
        setFeedback(`Row ${rnum} marked as the header. Confirm when you're sure.`, "neutral");
      }
    });
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

  function submit() {
    if (state.solved) { advance(); return; }
    if (state.interaction.selected_header_row == null) return;

    if (SACore.evalCheck(WAVE.task.success_check, state.interaction)) {
      state.solved = true;
      renderPredecessor(WAVE.feedback.win, "win");
      setFeedback("✅ Right call. You oriented before you touched anything.", "good");
      $("#sheet").classList.add("locked");
      setPrimary(state.index + 1 < WAVES.length ? "Next file →" : "Week 1 — slice complete", true);
      if (state.index + 1 >= WAVES.length) $("#slice-note").hidden = false;
    } else if (SACore.evalCheck(WAVE.task.fail_check, state.interaction)) {
      renderPredecessor(WAVE.feedback.fail, "fail");
      setFeedback("Not the headers — but now you know why. Try again.", "bad");
      clearSelection();
    } else {
      renderPredecessor(WAVE.feedback.miss ||
        "Not quite — that's not the header band. Look for the row of column names, or ask for backup.", "miss");
      setFeedback("Not quite. Look for the row of column names.", "bad");
      clearSelection();
    }
  }

  function clearSelection() {
    state.interaction.selected_header_row = null;
    $("#sheet").querySelectorAll("tr.selected").forEach((tr) => tr.classList.remove("selected"));
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
  });

  // ----- Dev controls ---------------------------------------------------------
  function devReveal() {
    if (state.solved) return;
    const answer = SACore.rhsValue(WAVE.task.success_check);
    if (answer == null) return;
    const tr = $("#sheet").querySelector(`tr[data-row="${answer}"]`);
    if (tr) {
      tr.classList.add("highlight");
      const rh = tr.querySelector(".rowhead");
      if (rh) rh.click();
    }
    setFeedback(`🛠 Dev: the header is row ${answer}.`, "neutral");
  }

  window.Job = { start, dev: { reveal: devReveal } };
})();
