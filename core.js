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
  //   opts.locked           : ignore clicks
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
    for (let c = 0; c < nCols; c++) hr.appendChild(cell("th", colLetter(c), "colhead"));
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
          const addr = colLetter(c) + rnum;
          td.dataset.addr = addr;
          if (opts.highlightCell === addr) td.classList.add("cell-highlight");
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

  window.SACore = { evalCheck, colLetter, renderSheet, rhsValue };
})();
