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
 *   ask            the stakeholder request driving the whole file (north star) —
 *                  constant, always visible above the per-step directive
 *   callbacks      [] ids of earlier concepts this wave makes you reuse
 *   scenario       { intro (Predecessor voice), artifact_ref }
 *   artifact       { kind:"sheet", title, rows[][], merged_title_row, blank_rows[] }
 *   task           { kind, directive, prompt, success_check, fail_check, status? }
 *                  directive = crisp brief headline ("do this"); prompt = context
 *                  kind: "select_row" | "select_column" | "select_cell" | "select_option"
 *                  select_option adds task.options:[{id,label,note?}] (+ optional artifact)
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
    ask: "Before you change anything in this inherited file, find where the real data actually starts.",

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
    ask: "Finance needs the Q3 revenue total — but first make sure these numbers can actually be trusted.",

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
  },

  /* ------------------------------------------------------------------------
   * WAVE 3 — Work on a copy (applies Academy M6). Judgment call, so it's a
   * select_option. The Predecessor saved over the master once and lost years
   * of history. Named blunder (fail_check) = editing the master directly.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 3,
    concept: { id: "work_on_copy", name: "Work on a copy", prereqs: ["orient_header"] },
    callbacks: [],
    ask: "Sales wants edits to the customer master — make the change without risking the original.",

    scenario: {
      intro:
        "File three: the customer master. The <i>real</i> one — everything downstream pulls from it. Confession: last time Sales wanted edits, I just opened it and started deleting. Saved right over the original. We lost three years of history and I told everyone the system \"glitched.\" …Sales wants edits again. What's your first move?",
      artifact_ref: "sheet_03.json"
    },

    artifact: {
      kind: "sheet",
      title: "customers_master.xlsx",
      rows: [
        ["Customer ID", "Customer Name", "Tier", "Signup Date"],
        ["1001", "Acme Corp", "Gold", "2021-01-14"],
        ["1002", "Globex", "Silver", "2021-03-22"],
        ["1003", "Initech", "Gold", "2020-11-09"],
        ["1004", "Umbrella", "Bronze", "2022-02-01"]
      ]
    },

    best_practice:
      "<b>Work on a copy.</b> On a shared source-of-truth file, duplicate it first and edit the duplicate — the untouched original is the only undo button that always works.",

    task: {
      kind: "select_option",
      directive: "Choose your <b>first move</b> before changing the master.",
      prompt:
        "<code>customers_master.xlsx</code> is the company's only customer list. Sales flagged some rows to update. What do you do before editing?",
      options: [
        { id: "a", label: "Open the master and make Sales' edits directly", note: "One slip and there's no clean original — ask the Predecessor how that goes." },
        { id: "b", label: "Save a copy, edit the copy, share it back for review", note: "Original untouched; your changes are reviewable." },
        { id: "c", label: "Delete the rows Sales flagged, then re-add them clean", note: "Destructive on the source of truth." }
      ],
      success_check: "selected_option == 'b'",
      fail_check: "selected_option == 'a'",
      status: {
        win: "✅ Copy first. The master never took the risk.",
        fail: "That's editing the only original — exactly the move that cost the last analyst. Try again.",
        miss: "Not the safest move on a source-of-truth file. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "It's the <i>only</i> copy and everyone depends on it. What protects the original if your edit goes wrong?",
      tier2: "You never edit a source-of-truth file in place. You duplicate it, change the duplicate, and let someone review before it replaces anything.",
      tier3: "Save a copy first, edit the copy, share it back (option b). The master stays pristine. That's the habit that would've saved my three years of history."
    },

    feedback: {
      win:
        "A copy. Of course. You make a backup before you breathe on it — so when something breaks, and it always does, the original's still there. I learned that the expensive way. You just… knew. Next file.",
      fail:
        "Yeah. Straight into the master. That's the exact move — I did it, hit save, and watched three years evaporate. \"Glitch,\" I called it. Do it the safe way: copy first, edit the copy.",
      miss:
        "Careful — that's still risky on the one file everyone relies on. The safe play protects the original no matter what. Want backup? Ask."
    },

    sets_up: ["document"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 4 — Document as you go (applies Academy M7 + M8). select_option.
   * The Predecessor is *trying* to leave it better: cryptic columns + a bad
   * name. Best move = rename sanely + add a data dictionary.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 4,
    concept: { id: "document", name: "Document as you go", prereqs: [] },
    callbacks: ["type_integrity"],
    ask: "You're handing this file off — make it understandable to whoever opens it next.",

    scenario: {
      intro:
        "File four. I'm… actually trying to leave this one better than I found it. Baby steps. Problem is I named it <code>newnew_USE THIS.xlsx</code> and the columns are <code>q</code>, <code>p</code>, <code>tot</code>, <code>flag2</code>. Made sense to me at 2am. What's the most useful thing you can do before passing it to the next person?",
      artifact_ref: "sheet_04.json"
    },

    artifact: {
      kind: "sheet",
      title: "newnew_USE THIS.xlsx",
      rows: [
        ["q", "p", "tot", "flag2"],
        ["12", "45.00", "540.00", "Y"],
        ["8", "12.50", "100.00", "N"],
        ["20", "30.00", "600.00", "Y"],
        ["5", "19.95", "99.75", "N"]
      ]
    },

    best_practice:
      "Documenting is two moves: a <b>sane file name</b> (what / when / version) and a <b>data dictionary</b> (what each column means, its units, valid values). Together they let the next person understand the file without opening your inbox.",

    task: {
      kind: "select_option",
      directive: "Pick the most useful thing to do <b>before handing it off</b>.",
      prompt:
        "The file is named <code>newnew_USE THIS.xlsx</code> with columns <code>q</code>, <code>p</code>, <code>tot</code>, <code>flag2</code>. The next analyst has never seen it.",
      options: [
        { id: "a", label: "Rename it sanely and add a small data-dictionary tab", note: "Both documentation moves — name + meanings." },
        { id: "b", label: "Add a sticky note that says \"ask me if confused\"", note: "You won't be here. That's the whole point." },
        { id: "c", label: "Send it as-is — q × p = tot is obvious enough", note: "Obvious to you. A guess for them — and flag2 is anyone's guess." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'c'",
      status: {
        win: "✅ Named + documented. The next person never has to guess.",
        fail: "\"Obvious\" only to the person who built it. Try again.",
        miss: "That doesn't actually explain the file. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "The next analyst can't read your mind. What makes the file explain <i>itself</i>?",
      tier2: "Two moves leave a file better than you found it: a name that says what/when/version, and a note defining every column.",
      tier3: "Rename it (e.g. <code>orders_2024-Q3_v1.xlsx</code>) and add a tab: <code>q</code> = quantity, <code>p</code> = unit price USD, <code>tot</code> = line total, <code>flag2</code> = whatever it actually means. Option a."
    },

    feedback: {
      win:
        "You documented it. A real name, a note explaining every column. I never did that once — figured if <i>I</i> knew what <code>flag2</code> meant, that was enough. It wasn't. Leaving it better than you found it… yeah. That's the job. Next file.",
      fail:
        "\"Obvious enough\" — that's what I always said, right before someone built a report on <code>flag2</code> meaning the opposite of what I meant. Spell it out. Rename it, define the columns.",
      miss:
        "That won't save the next person any guessing. Documentation is a name plus column meanings. Want backup? Ask."
    },

    sets_up: ["clarify"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 5 — The stakeholder ask (applies M9 + M10). FINALE. select_option.
   * The board request that broke the Predecessor. Win triggers the reveal:
   * the Predecessor is you, on day one. Named blunder = dump-everything panic.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 5,
    concept: { id: "clarify", name: "The stakeholder ask", prereqs: [] },
    callbacks: ["type_integrity"],
    ask: "The boss sent a one-line request for the board — figure out the right first move.",

    scenario: {
      intro:
        "Last file. This is the one that broke me. The email just says: <i>\"Need the Q3 numbers for the board by 5. Thx.\"</i> I panicked, dumped every number I had into a 40-tab workbook, sent it at 4:59 — and it was the <b>wrong quarter</b>. Nobody trusted me with the board again. Here's the same email, sitting in your inbox. What do you do?",
      artifact_ref: null
    },

    // No sheet — this one is pure judgment, like the real moment.
    artifact: null,

    best_practice:
      "Two skills, one breath: <b>clarify the ask</b> (which numbers, which period, for what decision) and <b>sanity-check before you send</b> (does it look right? any caveats?). Confirm, verify, then communicate — number, caveat, next step.",

    task: {
      kind: "select_option",
      directive: "Pick your <b>first move</b> on the board request.",
      prompt:
        "The email: <i>\"Need the Q3 numbers for the board by 5. Thx.\"</i> It's 1pm. What's the right first move?",
      options: [
        { id: "a", label: "Reply to confirm exactly which metrics, which segments, and the decision — and note you'll sanity-check before sending", note: "Clarify the ask, promise a checked answer." },
        { id: "b", label: "Pull every number you have into one big workbook and send it early", note: "The Predecessor's exact move. Volume isn't an answer." },
        { id: "c", label: "Forward last quarter's deck — close enough, saves time", note: "Wrong quarter, unchecked. The way trust dies." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ Clarified the ask, promised a checked answer. That's the whole craft.",
        fail: "That's the panic-dump that sent the wrong quarter to the board. Try again.",
        miss: "Close enough isn't an answer for a board meeting. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "\"The Q3 numbers\" could mean ten things. What do you owe the board before you build anything?",
      tier2: "Clarify first (which metrics, which segments, for what decision), then verify before you send. Never guess and dump.",
      tier3: "Reply and pin the ask down — which metrics, which segments, what decision it informs — and say you'll sanity-check the figures before they go out. Option a."
    },

    feedback: {
      win:
        "You asked the question first. Clarified it, said you'd check the numbers before they went out. Calm. …I keep watching you do every single thing I didn't, and it's like watching a tape of myself with all the mistakes edited out. <br><br>Open the drawer. Read the name on the offer letter. …Yeah. The analyst before you was <b>me</b> — and I was <b>you</b>, on day one, before any of this stuck. This was always day one. Go be the one who gets it right. You already are.",
      fail:
        "The 40-tab dump. I know it feels like progress — look how much I sent! It isn't. It's noise with a deadline, and mine was the wrong quarter. Ask what they actually need first.",
      miss:
        "Not for the board, not unchecked. The move is to clarify the ask, then verify before you send. Want backup? Ask."
    },

    sets_up: []
  }
];

// Make available to the engine whether loaded as a module or a plain script tag.
if (typeof module !== "undefined" && module.exports) module.exports = { WAVES };
