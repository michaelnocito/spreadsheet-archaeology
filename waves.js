/* ============================================================================
 * Getting It Wrong Gets You Good — WAVE DATA
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
 *   task           { kind, prompt, success_check, fail_check }
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

    task: {
      kind: "select_row",
      prompt:
        "Row 1 is a merged title cell. Rows 2–3 are blank. Click the row number where the <b>real data labels</b> begin — before you touch a single cell.",
      success_check: "selected_header_row == 4",
      fail_check: "selected_header_row == 1"
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
  }
];

// Make available to the engine whether loaded as a module or a plain script tag.
if (typeof module !== "undefined" && module.exports) module.exports = { WAVES };
