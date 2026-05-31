/* ============================================================================
 * Getting It Wrong Gets You There Faster — WAVE DATA
 * ----------------------------------------------------------------------------
 * The engine (engine.js) is GENERIC. All game content lives here as pure data.
 * To add a wave: push another object to WAVES. No engine changes required.
 *
 * The whole narrative arc — the Predecessor's tone shifting from mocking to
 * proud — lives entirely in `scenario.intro` and `feedback.win`/`feedback.fail`.
 *
 * Artifacts (the messy inherited spreadsheets) are inlined under each wave's
 * `artifact` field. They could live in separate JSON files (see `artifact_ref`),
 * but inlining keeps the game working from file:// and GitHub Pages with no
 * fetch/CORS friction — the same call SQL Quest made for its wave data.
 *
 * SCHEMA (per wave)
 *   wave_id        number
 *   concept        { id, name, prereqs[] }
 *   callbacks      [] ids of earlier concepts this wave makes you reuse
 *   scenario       { intro (Predecessor voice), artifact_ref }
 *   artifact       { kind:"sheet", title, rows[][], merged_title_row, blank_rows[] }
 *   task           { kind, directive, prompt, success_check, fail_check, status? }
 *                  directive = crisp brief headline ("do this"); prompt = context
 *                  kind: "select_row" | "select_column" | "select_cell"
 *                  status = {win,fail,miss} small inline pills (Predecessor voice
 *                  carries the real narrative); engine falls back to generic text
 *   help           { tier1, tier2, tier3 }   <- pull-only, revealed one at a time
 *   feedback       { win, fail, miss? }       <- miss = chosen, but neither win nor the named blunder
 *   sets_up        [] ids of concepts this wave foreshadows
 *
 * CHECK EXPRESSIONS
 *   `success_check` / `fail_check` are tiny, safe comparison strings evaluated
 *   against the interaction state (e.g. "selected_header_row == 4"). The engine
 *   parses them with a minimal tokenizer — no eval(). Supported: == != >= <= > <
 * ========================================================================== */

const WAVES = [
  {
    wave_id: 1,
    concept: { id: "orient_header", name: "Orient before you edit", prereqs: [] },
    callbacks: [],

    scenario: {
      intro:
        "Welcome to the team! Your predecessor — me — left in a hurry. Everything I touched is on this drive. First file: Q3_FINAL_final_v2.xlsx. It's fine. Probably. Before you change a single cell: where does the actual data even start?",
      artifact_ref: "sheet_01.json"
    },

    // The cursed inherited file. 1-indexed rows.
    //  Row 1  -> merged title banner (the Predecessor's "headers")
    //  Rows 2-3 -> blank spacers
    //  Row 4  -> the REAL headers
    //  Rows 5+ -> data
    artifact: {
      kind: "sheet",
      title: "Q3_FINAL_final_v2.xlsx",
      merged_title_row: 1,
      blank_rows: [2, 3],
      rows: [
        ["Q3 CUSTOMER EXPORT — pulled by me, do NOT touch (jk lol) 🙃", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["Customer ID", "Customer Name", "Signup Date", "Status", "Last Order", "Region"],
        ["1001", "Acme Corp", "2023-01-14", "Active", "2024-08-02", "West"],
        ["1002", "Globex", "2023-03-22", "active", "2024-07-19", "East"],
        ["1003", "Initech", "2022-11-09", "ACTIVE", "2024-06-30", "West"],
        ["1004", "Umbrella", "2024-02-01", "Churned", "2024-03-11", "South"],
        ["1005", "Soylent", "2023-09-17", "Active", "2024-08-14", "North"],
        ["1006", "Hooli", "2024-05-05", "active", "2024-08-21", "East"],
        ["1007", "Stark Ind.", "2023-06-28", "Churned", "2024-01-02", "West"],
        ["1008", "Wayne Ent.", "2022-08-30", "Active", "2024-07-07", "North"]
      ]
    },

    best_practice:
      "<b>Orient before you touch.</b> On a real file, this 30-second scan saves hours of debugging later.",

    task: {
      kind: "select_row",
      directive: "Click the row where the <b>real column labels</b> begin — before you edit anything.",
      prompt:
        "Row 1 is a merged title cell and rows 2–3 are blank. The real labels are buried below — find where they actually start.",
      checklist: [
        "Open the file but <b>don't edit yet</b>",
        "Scan top to bottom — note the title banner and blank rows",
        "Find the first row where every cell names a column",
        "Click that row's number, then <b>Confirm</b>",
        "Only <i>now</i> are you allowed to touch the data"
      ],
      success_check: "selected_header_row == 4",
      fail_check: "selected_header_row == 1",
      status: {
        win: "✅ Right call. You oriented before you touched anything.",
        fail: "Not the headers — but now you know why. Try again.",
        miss: "Not quite. Look for the row of column names."
      }
    },

    help: {
      tier1: "Row 1 is rarely the truth. Where's the first row where <i>every</i> column actually means something?",
      tier2: "Headers drift — logos, merged titles, spacer rows push the real labels down. Find where the labels start, not where the file starts.",
      tier3: "Look at it like a table: \"Customer ID\", \"Customer Name\", \"Signup Date\"… that band of column names is your header. It's sitting in row 4 here, because row 1 is my title banner and rows 2–3 are empty. Click row 4."
    },

    feedback: {
      win:
        "…Huh. You found row 4 without me. I worked here two years and never looked past row 1. Okay. Maybe you'll actually fix this place. Next file.",
      fail:
        "Row 1, huh? Bold. …Yeah, I did that too. Declared the title bar my headers and built three reports on top of it. That's how 'Q3' happened. Good news: now you know. Scroll down — find where the real labels live.",
      miss:
        "Close, but look again — that's data, not the labels. The header row is the one band where every cell names a column. Want backup? Ask me."
    },

    sets_up: ["type_integrity"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 2 — Type integrity (applies Academy M3 "Data types" + M4 "Numbers
   * stored as text" under the Predecessor's mess).
   * Interaction: select_column. The Revenue column LOOKS numeric but every
   * cell is stored as text (green corner flag via artifact.marker_cells) — so
   * the Predecessor's SUM came back 0 and they hand-typed the total. The named
   * blunder (fail_check) = blaming Units, a column that's actually fine.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 2,
    concept: { id: "type_integrity", name: "Trust your number columns", prereqs: ["orient_header"] },
    callbacks: ["orient_header"], // headers are pushed down again — orient first

    scenario: {
      intro:
        "File two. The Q3 revenue sheet — the one finance keeps asking about. Confession: I built a SUM at the bottom of the Revenue column and it kept coming back <b>0</b>. Zero! So I just… typed the total in by hand and moved on. Worked fine for the board deck. Anyway — one of these number columns isn't behaving. Bet you can't tell which.",
      artifact_ref: "sheet_02.json"
    },

    // Cursed file. Title banner row 1, headers row 2, data rows 3-8.
    // Revenue (col D) is stored as TEXT — flagged with the green corner marker.
    // Revenue == Units × Unit price, so the values look perfectly legit.
    artifact: {
      kind: "sheet",
      title: "Q3_revenue_DONOTSEND_v4.xlsx",
      merged_title_row: 1,
      marker_cells: ["D3", "D4", "D5", "D6", "D7", "D8"],
      rows: [
        ["Q3 REVENUE — numbers are FINE, I checked (mostly) 💸", "", "", ""],
        ["Account",   "Units", "Unit price", "Revenue"],
        ["ACME-01",   "120",   "45.00",      "5400.00"],
        ["GLOBEX-2",  "340",   "12.50",      "4250.00"],
        ["INITECH",   "58",    "30.00",      "1740.00"],
        ["UMBRELLA",  "76",    "19.95",      "1516.20"],
        ["SOYLENT",   "210",   "8.00",       "1680.00"],
        ["HOOLI-X",   "95",    "22.40",      "2128.00"]
      ]
    },

    best_practice:
      "Before you trust a total, confirm the column is actually <b>numeric</b>. Text-numbers (the green corner flag) silently break <code>SUM</code>, sorting, and charts — convert them <i>before</i> you report a single figure.",

    task: {
      kind: "select_column",
      directive: "Click the column whose numbers are secretly <b>stored as text</b>.",
      prompt:
        "One of these columns looks like clean money but won't <code>SUM</code>. Find the one Excel is quietly treating as text — that's why the total came back zero.",
      checklist: [
        "Orient first — the real headers are in row 2",
        "Scan the columns that look numeric",
        "Spot the cells wearing a <b>green corner flag</b>",
        "That's the column Excel can't add up — click its letter, then <b>Confirm</b>"
      ],
      success_check: "selected_column == 'D'",
      fail_check: "selected_column == 'B'",
      status: {
        win: "✅ Found it — the column that won't add up.",
        fail: "Not that one — Units is already numeric. Look again.",
        miss: "Not quite. Hunt for the green-flagged column, or ask for backup."
      }
    },

    help: {
      tier1: "A column that won't <code>SUM</code> is usually text wearing a number costume. Which one looks numeric but isn't behaving?",
      tier2: "Excel flags it for you — a tiny <b>green triangle</b> in the corner of each cell means \"stored as text.\" Find the column wearing those.",
      tier3: "Look at <b>Revenue</b> (column D): every cell has a green corner flag. That's text, not numbers — <code>SUM</code> ignores it and returns 0. Click column D."
    },

    feedback: {
      win:
        "…Column D. Yeah. Excel was storing those as <i>text</i> — that's why my SUM kept spitting out zero and I 'fixed' it by typing the total in by hand. You found in ten seconds what cost me a quarter of wrong numbers in front of finance. Okay. You're better at this than I was. Next file.",
      fail:
        "Units? I blamed Units too — reformatted the whole column, felt productive, fixed nothing, because that one was always fine. The broken column is the one wearing the little green flags. Look again.",
      miss:
        "Nope — that column's behaving. Hunt for the green corner flags; that's the one Excel won't add up. Want backup? Ask me."
    },

    sets_up: ["consistency"]
  }
];

// Make available to the engine whether loaded as a module or a plain script tag.
if (typeof module !== "undefined" && module.exports) module.exports = { WAVES };
