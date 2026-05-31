/* ============================================================================
 * Getting It Wrong Gets You Good — GENERIC ENGINE
 * ----------------------------------------------------------------------------
 * Knows nothing about any specific wave. It renders whatever WAVES[] hands it:
 *   - the Predecessor's scenario intro
 *   - the artifact (currently: a clickable Excel-like sheet)
 *   - the task prompt + the interaction it implies
 *   - pull-only 3-tier help (player asks; nothing is pushed)
 *   - win / fail / miss feedback, driven by the wave's check expressions
 *
 * Add content by editing waves.js. Do not put wave-specific logic here.
 * ========================================================================== */

(function () {
  "use strict";

  // ----- Tiny, safe check evaluator -----------------------------------------
  // Evaluates strings like "selected_header_row == 4" against a state object.
  // No eval(); just a single comparison per expression.
  const OPS = {
    "==": (a, b) => a == b, // eslint-disable-line eqeqeq
    "!=": (a, b) => a != b, // eslint-disable-line eqeqeq
    ">=": (a, b) => a >= b,
    "<=": (a, b) => a <= b,
    ">": (a, b) => a > b,
    "<": (a, b) => a < b
  };

  function evalCheck(expr, state) {
    if (!expr) return false;
    const m = String(expr).match(/^\s*([A-Za-z_]\w*)\s*(==|!=|>=|<=|>|<)\s*(.+?)\s*$/);
    if (!m) {
      console.warn("Unparseable check:", expr);
      return false;
    }
    const [, varName, op, rawRight] = m;
    let left = state[varName];
    let right = rawRight.replace(/^["']|["']$/g, "");
    // numeric compare when both sides look numeric
    if (left !== null && left !== undefined && right !== "" &&
        !isNaN(Number(left)) && !isNaN(Number(right))) {
      left = Number(left);
      right = Number(right);
    }
    return OPS[op](left, right);
  }

  // ----- DOM helpers ---------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const colLetter = (i) => String.fromCharCode(65 + i); // 0 -> A

  // ----- Game state ----------------------------------------------------------
  const state = {
    index: 0,           // which wave
    interaction: {},    // values checked against (e.g. selected_header_row)
    helpTier: 0,        // how many backup tiers revealed
    solved: false
  };

  let WAVE = null;

  // ----- Boot ----------------------------------------------------------------
  function boot() {
    WAVE = WAVES[state.index];
    state.interaction = {};
    state.helpTier = 0;
    state.solved = false;

    renderOrientation();
    renderPredecessor(WAVE.scenario.intro, "intro");
    renderTask();
    renderArtifact();
    renderHelp();
    clearFeedback();
    setPrimary("Lock it in →", false); // disabled until a row is picked
  }

  // ----- Orientation bar (always know where you are) -------------------------
  function renderOrientation() {
    $("#habit").textContent = WAVE.concept.name;
    $("#filename").textContent = WAVE.artifact ? WAVE.artifact.title : "";
    const dots = WAVES.length > 1 ? WAVES.length : 5; // slice shows the full Week 1 of 5
    const wrap = $("#progress");
    wrap.innerHTML = "";
    for (let i = 0; i < dots; i++) {
      const d = document.createElement("span");
      d.className = "dot" + (i < state.index ? " done" : i === state.index ? " active" : "");
      wrap.appendChild(d);
    }
    $("#wave-count").textContent = `File ${state.index + 1} of ${dots}`;
  }

  // ----- Predecessor voice ----------------------------------------------------
  function renderPredecessor(text, mood) {
    const box = $("#predecessor-body");
    box.className = "voice-body mood-" + (mood || "intro");
    box.innerHTML = text; // wave copy is trusted, authored content
  }

  // ----- Task prompt ----------------------------------------------------------
  function renderTask() {
    $("#task-prompt").innerHTML = WAVE.task.prompt;
  }

  // ----- Artifact: clickable Excel-like sheet ---------------------------------
  function renderArtifact() {
    const a = WAVE.artifact;
    const host = $("#sheet");
    host.innerHTML = "";
    if (!a || a.kind !== "sheet") return;

    const nCols = a.rows.reduce((m, r) => Math.max(m, r.length), 0);
    const table = document.createElement("table");
    table.className = "sheet-table";

    // Column-letter header (Excel chrome)
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    hr.appendChild(cell("th", "", "corner"));
    for (let c = 0; c < nCols; c++) hr.appendChild(cell("th", colLetter(c), "colhead"));
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    a.rows.forEach((row, ri) => {
      const rnum = ri + 1; // 1-indexed
      const tr = document.createElement("tr");
      tr.dataset.row = rnum;

      // clickable row-number gutter
      const rh = cell("th", String(rnum), "rowhead");
      rh.tabIndex = 0;
      rh.setAttribute("role", "button");
      rh.setAttribute("aria-label", `Select row ${rnum} as the header row`);
      rh.addEventListener("click", () => selectRow(rnum));
      rh.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectRow(rnum); }
      });
      tr.appendChild(rh);

      const isBlank = (a.blank_rows || []).includes(rnum);
      if (rnum === a.merged_title_row) {
        const td = cell("td", row[0], "merged-title");
        td.colSpan = nCols;
        tr.appendChild(td);
        tr.classList.add("is-title");
      } else {
        for (let c = 0; c < nCols; c++) {
          tr.appendChild(cell("td", row[c] != null ? row[c] : "", isBlank ? "blank" : ""));
        }
        if (isBlank) tr.classList.add("is-blank");
      }

      // whole-row click also selects (forgiving target)
      tr.addEventListener("click", () => selectRow(rnum));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    host.appendChild(table);
  }

  function cell(tag, text, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = text;
    return el;
  }

  function selectRow(rnum) {
    if (state.solved) return;
    state.interaction.selected_header_row = rnum;
    document.querySelectorAll(".sheet-table tr").forEach((tr) => {
      tr.classList.toggle("selected", Number(tr.dataset.row) === rnum);
    });
    setPrimary("Lock it in →", true);
    // soft, non-blocking note that doesn't cover the grid
    setFeedback(`Row ${rnum} marked as the header. Lock it in when you're sure.`, "neutral");
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
      btn.disabled = true;
      btn.textContent = "That's all I've got";
    } else {
      btn.disabled = false;
      btn.textContent = state.helpTier === 0 ? "🆘 Ask the Predecessor for backup"
                                             : "Ask for another hint";
    }
  }

  function askForHelp() {
    const tiers = [WAVE.help.tier1, WAVE.help.tier2, WAVE.help.tier3].filter(Boolean);
    if (state.helpTier < tiers.length) state.helpTier++;
    renderHelp();
  }

  // ----- Primary action -------------------------------------------------------
  function setPrimary(label, enabled) {
    const b = $("#primary");
    b.textContent = label;
    b.disabled = !enabled;
  }

  function submit() {
    if (state.solved) { advance(); return; }
    if (state.interaction.selected_header_row == null) return;

    if (evalCheck(WAVE.task.success_check, state.interaction)) {
      state.solved = true;
      renderPredecessor(WAVE.feedback.win, "win");
      setFeedback("✅ Right call. You oriented before you touched anything.", "good");
      lockGrid();
      setPrimary(state.index + 1 < WAVES.length ? "Next file →" : "Week 1 — slice complete", true);
      if (state.index + 1 >= WAVES.length) showSliceComplete();
    } else if (evalCheck(WAVE.task.fail_check, state.interaction)) {
      renderPredecessor(WAVE.feedback.fail, "fail");
      setFeedback("Not the headers — but now you know why. Try again.", "bad");
      clearSelection();
    } else {
      const miss = WAVE.feedback.miss ||
        "Not quite — that's not the header band. Look for the row of column names, or ask for backup.";
      renderPredecessor(miss, "miss");
      setFeedback("Not quite. Look for the row of column names.", "bad");
      clearSelection();
    }
  }

  function clearSelection() {
    state.interaction.selected_header_row = null;
    document.querySelectorAll(".sheet-table tr.selected").forEach((tr) => tr.classList.remove("selected"));
    setPrimary("Lock it in →", false);
  }

  function lockGrid() {
    $("#sheet").classList.add("locked");
  }

  function advance() {
    if (state.index + 1 < WAVES.length) {
      state.index++;
      $("#sheet").classList.remove("locked");
      boot();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function showSliceComplete() {
    const note = $("#slice-note");
    note.hidden = false;
  }

  // ----- Feedback line (never covers the action) ------------------------------
  function setFeedback(text, kind) {
    const f = $("#feedback");
    f.textContent = text;
    f.className = "feedback " + (kind || "neutral");
    f.hidden = false;
  }
  function clearFeedback() {
    const f = $("#feedback");
    f.hidden = true;
    f.textContent = "";
  }

  // ----- Wire up --------------------------------------------------------------
  window.addEventListener("DOMContentLoaded", () => {
    $("#help-btn").addEventListener("click", askForHelp);
    $("#primary").addEventListener("click", submit);
    boot();
  });
})();
