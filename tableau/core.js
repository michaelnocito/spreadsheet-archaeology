/* ============================================================================
 * Getting It Wrong Gets You There Faster — SHARED CORE
 * ----------------------------------------------------------------------------
 * Pieces used by BOTH game modes:
 *   - the Academy (academy.js)  — teach the skill, calm and clean
 *   - the Job     (engine.js)   — apply the skill under the Predecessor's mess
 *
 * Keeping these in one place means a spreadsheet renders identically whether
 * the mentor is walking you through it or you're sweating over a cursed file.
 * ========================================================================== */

(function () {
  "use strict";

  // ----- Safe check evaluator (NO eval) --------------------------------------
  // Evaluates "selected_header_row == 4" against a state object.
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
    if (!m) { console.warn("Unparseable check:", expr); return false; }
    const [, varName, op, rawRight] = m;
    let left = state[varName];
    let right = rawRight.replace(/^["']|["']$/g, "");
    if (left !== null && left !== undefined && right !== "" &&
        !isNaN(Number(left)) && !isNaN(Number(right))) {
      left = Number(left); right = Number(right);
    }
    return OPS[op](left, right);
  }

  const colLetter = (i) => String.fromCharCode(65 + i);

  // Pull the expected answer out of a check like "selected_header_row == 4"
  // or "selected_cell == 'C2'". Used by the dev controls to reveal / auto-solve.
  function rhsValue(expr) {
    const m = String(expr || "").match(/(?:==|>=|<=|>|<)\s*(.+?)\s*$/);
    if (!m) return null;
    const raw = m[1].replace(/^["']|["']$/g, "");
    return raw !== "" && !isNaN(Number(raw)) ? Number(raw) : raw;
  }

  // ----- Spreadsheet renderer -------------------------------------------------
  // renderSheet(host, artifact, opts)
  //   opts.selectable       : clickable row gutter (calls opts.onSelectRow(rowNum))
  //   opts.onSelectRow      : callback(rowNum)
  //   opts.highlightRow     : draw a soft "look here" highlight on this row
  //   opts.selectableCells  : every cell is clickable (calls opts.onSelectCell(addr))
  //   opts.onSelectCell     : callback("B3")
  //   opts.highlightCell    : "B3" — soft glow on a single cell (teach mode)
  //   opts.selectableCols   : column headers (A,B,C…) are clickable
  //   opts.onSelectCol      : callback("B")
  //   opts.highlightCol     : "B" — soft glow on a whole column (teach mode)
  //   opts.locked           : ignore clicks
  // Artifact-intrinsic visuals (read off `a`, not opts): merged_title_row,
  //   blank_rows[], and marker_cells[] (e.g. ["C2","C3"]) — the green corner
  //   flag marking numbers stored as text (Module 4).
  function renderSheet(host, a, opts) {
    opts = opts || {};
    host.innerHTML = "";
    if (!a || a.kind !== "sheet") return;

    const nCols = a.rows.reduce((m, r) => Math.max(m, r.length), 0);
    const table = document.createElement("table");
    table.className = "sheet-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    hr.appendChild(cell("th", "", "corner"));
    for (let c = 0; c < nCols; c++) {
      const letter = colLetter(c);
      const th = cell("th", letter, "colhead");
      th.dataset.col = letter;
      if (opts.highlightCol === letter) th.classList.add("col-highlight");
      if (opts.selectableCols) {
        th.classList.add("clickable-col");
        th.tabIndex = 0;
        th.setAttribute("role", "button");
        th.setAttribute("aria-label", `Select column ${letter}`);
        th.addEventListener("click", () => selectCol(letter));
        th.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCol(letter); }
        });
      }
      hr.appendChild(th);
    }
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    function select(rnum) {
      if (opts.locked) return;
      tbody.querySelectorAll("tr").forEach((tr) =>
        tr.classList.toggle("selected", Number(tr.dataset.row) === rnum));
      if (opts.onSelectRow) opts.onSelectRow(rnum);
    }

    function selectCell(addr, td) {
      if (opts.locked) return;
      tbody.querySelectorAll("td.cell-selected").forEach((c) => c.classList.remove("cell-selected"));
      td.classList.add("cell-selected");
      if (opts.onSelectCell) opts.onSelectCell(addr);
    }

    function selectCol(letter) {
      if (opts.locked) return;
      // Clear any prior column selection (header + cells).
      thead.querySelectorAll("th.col-selected").forEach((c) => c.classList.remove("col-selected"));
      tbody.querySelectorAll("td.col-selected").forEach((c) => c.classList.remove("col-selected"));
      // Apply to this column's header AND every td in the column.
      const head = thead.querySelector(`th[data-col="${letter}"]`);
      if (head) head.classList.add("col-selected");
      tbody.querySelectorAll(`td[data-col="${letter}"]`).forEach((c) => c.classList.add("col-selected"));
      if (opts.onSelectCol) opts.onSelectCol(letter);
    }

    a.rows.forEach((row, ri) => {
      const rnum = ri + 1;
      const tr = document.createElement("tr");
      tr.dataset.row = rnum;

      const rh = cell("th", String(rnum), "rowhead");
      if (opts.selectable) {
        rh.tabIndex = 0;
        rh.setAttribute("role", "button");
        rh.setAttribute("aria-label", `Select row ${rnum} as the header row`);
        rh.addEventListener("click", () => select(rnum));
        rh.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(rnum); }
        });
      }
      tr.appendChild(rh);

      const isBlank = (a.blank_rows || []).includes(rnum);
      if (rnum === a.merged_title_row) {
        const td = cell("td", row[0], "merged-title");
        td.colSpan = nCols;
        tr.appendChild(td);
        tr.classList.add("is-title");
      } else {
        for (let c = 0; c < nCols; c++) {
          const td = cell("td", row[c] != null ? row[c] : "", isBlank ? "blank" : "");
          const colL = colLetter(c);
          const addr = colL + rnum;
          td.dataset.addr = addr;
          td.dataset.col = colL;
          // "Numbers stored as text" marker — Excel's little green corner flag.
          // Intrinsic to the file's data (like blank_rows), so it travels with
          // the artifact and renders identically in Academy and Job.
          if ((a.marker_cells || []).includes(addr)) {
            td.classList.add("text-number");
            const flag = document.createElement("span");
            flag.className = "tn-flag";
            flag.setAttribute("aria-hidden", "true");
            td.appendChild(flag);
          }
          if (opts.highlightCell === addr) td.classList.add("cell-highlight");
          if (opts.highlightCol === colL) td.classList.add("col-highlight");
          if (opts.selectableCells) {
            td.classList.add("clickable-cell");
            td.tabIndex = 0;
            td.setAttribute("role", "button");
            td.setAttribute("aria-label", `Select cell ${addr}`);
            td.addEventListener("click", (e) => { e.stopPropagation(); selectCell(addr, td); });
            td.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCell(addr, td); }
            });
          }
          tr.appendChild(td);
        }
        if (isBlank) tr.classList.add("is-blank");
      }

      if (opts.highlightRow === rnum) tr.classList.add("highlight");
      if (opts.selectable) tr.addEventListener("click", () => select(rnum));
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

  // ----- Multiple-choice renderer --------------------------------------------
  // renderOptions(host, options, opts)
  //   options          : [{ id, label, note? }]
  //   opts.onSelect    : callback(id)
  //   opts.highlight   : id to softly pre-highlight (guided / teach modes)
  //   opts.locked      : ignore clicks
  // Appends to host (so a reference sheet can be rendered above it first).
  function renderOptions(host, options, opts) {
    opts = opts || {};
    const wrap = document.createElement("div");
    wrap.className = "options" + (opts.locked ? " options-locked" : "");
    (options || []).forEach((o) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-card";
      btn.dataset.opt = o.id;
      if (opts.highlight === o.id) btn.classList.add("option-highlight");
      btn.innerHTML =
        `<span class="option-label">${o.label}</span>` +
        (o.note ? `<span class="option-note">${o.note}</span>` : "");
      btn.addEventListener("click", () => {
        if (opts.locked) return;
        wrap.querySelectorAll(".option-card.option-selected")
          .forEach((c) => c.classList.remove("option-selected"));
        btn.classList.add("option-selected");
        if (opts.onSelect) opts.onSelect(o.id);
      });
      wrap.appendChild(btn);
    });
    host.appendChild(wrap);
  }

  // ----- Tableau workspace mockup (display-only) -----------------------------
  // renderViz(host, artifact, opts) — a styled, NON-interactive picture of a
  // Tableau worksheet. Tableau's real "doing" is drag-and-drop; for *learning*
  // the concepts (workspace literacy, dimensions vs measures, chart choice) a
  // faithful mockup + multiple-choice judgment teaches the idea and ships fast.
  // The actual interaction is always renderOptions() below this picture.
  //
  // artifact (all sections optional — only present ones render):
  //   kind:"viz", title
  //   dimensions:[name…]   blue/discrete pills in the Data pane
  //   measures:[name…]     green/continuous pills in the Data pane
  //   filters:[pill…] columns:[pill…] rows:[pill…]   shelf contents
  //       a pill is a string, or {name, role:"dim"|"measure"}
  //   marks:{ type:"Bar", fields:[{name, role, on:"Color"|"Size"|"Label"|"Detail"}] }
  //   chart:{ type:"bar"|"line", cats:[…], vals:[…], axis:"SUM(Sales)" }
  //   highlight: region to glow — "pane"|"dimensions"|"measures"|
  //              "filters"|"columns"|"rows"|"marks"|"canvas"
  // opts.highlight overrides artifact.highlight (teach/guided "look here").
  function renderViz(host, a, opts) {
    opts = opts || {};
    host.innerHTML = "";
    if (!a || a.kind !== "viz") return;
    const hi = opts.highlight || a.highlight || null;
    const on = (region) => (hi === region ? " viz-hi" : "");

    const pill = (p) => {
      const name = typeof p === "string" ? p : p.name;
      const role = (typeof p === "object" && p.role) ||
        (/^(SUM|AVG|MIN|MAX|CNT|COUNT|MEDIAN)\(/i.test(name) ? "measure" : "dim");
      return `<span class="viz-pill viz-pill-${role}">${name}</span>`;
    };
    const pills = (list) => (list || []).map(pill).join("");

    const wb = document.createElement("div");
    wb.className = "viz";

    let html = `<div class="viz-titlebar"><span class="viz-dot"></span>${a.title || "Workbook"}</div>`;
    html += `<div class="viz-body">`;

    // ---- Data pane (left) ----
    if (a.dimensions || a.measures) {
      html += `<div class="viz-pane${on("pane")}">
        <div class="viz-pane-head">Data</div>`;
      if (a.dimensions) {
        html += `<div class="viz-pane-group${on("dimensions")}">
          <div class="viz-pane-label">Dimensions</div>
          ${a.dimensions.map((d) => `<div class="viz-field">${pill({ name: d, role: "dim" })}</div>`).join("")}
        </div>`;
      }
      if (a.measures) {
        html += `<div class="viz-pane-group${on("measures")}">
          <div class="viz-pane-label">Measures</div>
          ${a.measures.map((m) => `<div class="viz-field">${pill({ name: m, role: "measure" })}</div>`).join("")}
        </div>`;
      }
      html += `</div>`;
    }

    // ---- Worksheet (right): shelves + marks + canvas ----
    const hasSheet = a.filters || a.columns || a.rows || a.marks || a.chart;
    if (hasSheet) {
      html += `<div class="viz-sheet">`;
      if (a.filters || a.columns || a.rows) {
        html += `<div class="viz-shelves">`;
        html += shelfRow("Filters", pills(a.filters), on("filters"));
        html += shelfRow("Columns", pills(a.columns), on("columns"));
        html += shelfRow("Rows", pills(a.rows), on("rows"));
        html += `</div>`;
      }
      html += `<div class="viz-lower">`;
      if (a.marks) {
        const f = (a.marks.fields || [])
          .map((m) => `<div class="viz-mark-pill">${pill(m)}${m.on ? `<span class="viz-mark-on">${m.on}</span>` : ""}</div>`)
          .join("");
        html += `<div class="viz-marks${on("marks")}">
          <div class="viz-marks-head">Marks</div>
          <div class="viz-marks-type">▾ ${a.marks.type || "Automatic"}</div>
          <div class="viz-marks-btns"><span>Color</span><span>Size</span><span>Label</span><span>Detail</span></div>
          ${f}
        </div>`;
      }
      html += `<div class="viz-canvas${on("canvas")}">${chartHtml(a.chart)}</div>`;
      html += `</div></div>`;
    }

    html += `</div>`;
    wb.innerHTML = html;
    host.appendChild(wb);
  }

  function shelfRow(label, pillsHtml, hiCls) {
    return `<div class="viz-shelf${hiCls}">
      <span class="viz-shelf-label">${label}</span>
      <span class="viz-shelf-well">${pillsHtml || ""}</span>
    </div>`;
  }

  function chartHtml(chart) {
    if (!chart || !chart.cats) return `<div class="viz-empty">Drop a field to build a view</div>`;
    const max = Math.max(1, ...chart.vals);
    if (chart.type === "line") {
      const n = chart.cats.length;
      const pts = chart.vals.map((v, i) =>
        `${(i / Math.max(1, n - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
      return `<div class="viz-axis-y">${chart.axis || ""}</div>
        <svg class="viz-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="viz-cats">${chart.cats.map((c) => `<span>${c}</span>`).join("")}</div>`;
    }
    // default: bars
    const bars = chart.cats.map((c, i) =>
      `<div class="viz-bar-col"><div class="viz-bar" style="height:${(chart.vals[i] / max) * 100}%"></div><span>${c}</span></div>`
    ).join("");
    return `<div class="viz-axis-y">${chart.axis || ""}</div><div class="viz-bars">${bars}</div>`;
  }

  // Dispatch a read-only reference artifact to the right renderer by kind.
  // Used by teach examples and the select_option reference area in both modes.
  function renderRef(host, artifact, opts) {
    if (artifact && artifact.kind === "viz") return renderViz(host, artifact, opts);
    return renderSheet(host, artifact, opts);
  }

  window.SACore = { evalCheck, colLetter, renderSheet, renderOptions, renderViz, renderRef, rhsValue };
})();
