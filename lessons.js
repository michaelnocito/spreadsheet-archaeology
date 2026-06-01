/* ============================================================================
 * Getting It Wrong Gets You There Faster — ACADEMY DATA (the two-week boot camp)
 * ----------------------------------------------------------------------------
 * Before you're handed the Predecessor's cursed drive, you train. Your mentor,
 * SAM, walks you through the basics calm and clean. Each lesson follows
 * "gradual release of responsibility":
 *
 *     TEACH  (I do)  — Sam shows a worked example, annotated
 *     GUIDED (we do) — you try it, hints shown, the answer softly highlighted
 *     SOLO   (you do)— you do it cold, no scaffold
 *
 * Help here is PUSHED (offered freely) — the opposite of the pull-only
 * "figure it out" help on the job. Novices need the worked example first.
 *
 * Each lesson `teaches_for` a job wave: the Academy teaches the skill; the Job
 * tests it under mess. Mentor name is data — rename SAM anywhere by editing it.
 *
 * SCHEMA (per lesson)
 *   id, week, day, concept:{name}, teaches_for
 *   ask        the standing GOAL for the whole module (north star) — constant
 *              across every step, always visible above the per-step directive
 *   mentor_intro                       Sam's warm setup
 *   teach   { explain, example:{sheet…, highlight_row, callout} }
 *   practice[]  { mode:"guided"|"solo", kind, task, prompt, hint?, artifact, success_check, praise }
 *               task = the one crisp directive (brief headline); prompt = context
 *               kind: "select_row" | "select_cell" | "select_column" | "select_option"
 *               select_option adds options:[{id,label,note?}] (+ optional artifact
 *               sheet for reference). teach.example may carry options + `answer`.
 *   mentor_outro
 * ========================================================================== */

const MENTOR = {
  name: "Sam",
  role: "your onboarding mentor · senior analyst",
  avatar: "☕"
};

/* ---- Full two-week syllabus (overview screen reads this) -------------------
 * `built: true` lessons are playable now. The rest are authored next, to this
 * same schema — the curriculum is real and visible so nothing feels stubbed. */
const ACADEMY_PLAN = [
  { week: 1, day: 1,  name: "The grid",              teaches_for: "—",            built: true  },
  { week: 1, day: 2,  name: "Find the real header",  teaches_for: "orient_header", built: true  },
  { week: 1, day: 3,  name: "Data types",            teaches_for: "type_integrity", built: true  },
  { week: 1, day: 4,  name: "Numbers stored as text", teaches_for: "type_integrity", built: true  },
  { week: 1, day: 5,  name: "Consistency gremlins",  teaches_for: "type_integrity", built: true  },
  { week: 2, day: 6,  name: "Source vs. copy",       teaches_for: "work_on_copy",  built: true  },
  { week: 2, day: 7,  name: "Sane file names",       teaches_for: "document",      built: true  },
  { week: 2, day: 8,  name: "The data dictionary",   teaches_for: "document",      built: true  },
  { week: 2, day: 9,  name: "The ask",               teaches_for: "clarify",       built: true  },
  { week: 2, day: 10, name: "Sanity-check & say it", teaches_for: "clarify",       built: true  }
];

const LESSONS = [
  {
    id: "the_grid",
    week: 1,
    day: 1,
    concept: { name: "The grid" },
    teaches_for: "—",
    ask: "Pinpoint a specific cell using its address — column letter, then row number.",

    best_practice:
      "Before you touch a single cell, learn how to <i>read</i> what's in front of you. Every analyst habit downstream depends on this one.",

    mentor_intro:
      "Hey — Sam. Welcome to the team. We start with the foundation: <b>how to read a spreadsheet</b>. Sounds like nothing. It's the thing every other module stands on. Five minutes. Let's go.",

    teach: {
      explain:
        "A spreadsheet is a <b>grid</b>. <b>Columns</b> run top-to-bottom — labeled A, B, C, D… <b>Rows</b> run left-to-right — numbered 1, 2, 3… A single cell is named by its column letter, then its row number. The cell I've highlighted is <b>B3</b> — column B, row 3. That's how you point at any cell in any spreadsheet ever.",
      example: {
        kind: "sheet",
        highlight_cell: "B3",
        rows: [
          ["alpha", "north", "100"],
          ["beta",  "south", "200"],
          ["gamma", "east",  "300"],
          ["delta", "west",  "400"]
        ]
      },
      callout: "B3 = column B, row 3. Every cell has an address like this."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_cell",
        task: "Click cell <b>C2</b>.",
        prompt: "It's highlighted so you can see exactly where to look.",
        hint: "Column C is the third column from the left. Row 2.",
        checklist: [
          "Find column <b>C</b> (third column across the top)",
          "Find row <b>2</b> (down the left side)",
          "Click where they meet",
          "Hit <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          highlight_cell: "C2",
          rows: [
            ["apple",  "red",    "12"],
            ["banana", "yellow", "8"],
            ["cherry", "red",    "20"],
            ["date",   "brown",  "5"]
          ]
        },
        success_check: "selected_cell == 'C2'",
        praise: "C2 — column C, row 2. Exactly."
      },
      {
        mode: "solo",
        kind: "select_cell",
        task: "Click cell <b>D3</b>.",
        prompt: "No highlight this time — you've got this.",
        hint: "D is the fourth column. Row 3.",
        checklist: [
          "Find column <b>D</b>",
          "Find row <b>3</b>",
          "Click where they meet",
          "Hit <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          rows: [
            ["Mon", "Sales", "100", "West"],
            ["Tue", "Sales", "120", "East"],
            ["Wed", "Sales", "145", "North"],
            ["Thu", "Sales", "98",  "South"]
          ]
        },
        success_check: "selected_cell == 'D3'",
        praise: "D3 — cold, no hints. You can read a cell address now. Every other module rides on this."
      }
    ],

    mentor_outro:
      "That's it. You can read a sheet now — column letter + row number, any cell, anywhere. Next: figuring out which row actually <i>matters</i>."
  },
  {
    id: "header_row",
    week: 1,
    day: 2,
    concept: { name: "Find the real header row" },
    teaches_for: "orient_header", // → Job Wave 1
    ask: "Find the real header row — the one row where every cell is a column's name.",

    best_practice:
      "Never assume row 1 is the header. <b>Verify before you edit</b> — every analyst gets burned by this once. Once is enough.",

    mentor_intro:
      "Morning. Before you ever <i>clean</i> a file, you have to <i>read</i> it — and step one is finding the <b>header row</b>: the single row where every cell is a column's name. Sounds obvious. It's the #1 thing people get wrong, because row 1 is usually a title, a logo, or just… nothing.",

    teach: {
      explain:
        "Here's a tidy little export. Watch: <b>row 1</b> is a title banner, <b>row 2</b> is blank, and <b>row 3</b> is where the real labels start — <i>Order ID, Date, Amount</i>. <b>That's</b> the header row. Everything under it is data. The move: scan down to the first row where <i>every</i> cell names a column.",
      example: {
        kind: "sheet",
        merged_title_row: 1,
        blank_rows: [2],
        highlight_row: 3,
        rows: [
          ["WIDGET SALES — Regional Export", "", ""],
          ["", "", ""],
          ["Order ID", "Date", "Amount"],
          ["A-100", "2024-07-01", "240"],
          ["A-101", "2024-07-02", "180"]
        ]
      },
      callout: "Row 3 is the header — every cell names a column. Rows above are noise."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_row",
        task: "Click the <b>header row</b> — the row where every cell is a column name.",
        prompt: "It's highlighted so you can see the shape you're hunting for.",
        hint: "Skip the title banner and the blank row. Find where the column names start.",
        checklist: [
          "Scan the file top to bottom",
          "Skip any title banner (usually row 1)",
          "Skip any blank rows",
          "Find the first row where <i>every</i> cell is a column name",
          "Click that row's number on the left, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          merged_title_row: 1,
          blank_rows: [2, 3],
          highlight_row: 4,
          rows: [
            ["MONTHLY SIGNUPS (export)", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["User ID", "Email", "Plan", "Joined"],
            ["U-01", "a@co.com", "Pro", "2024-06-02"],
            ["U-02", "b@co.com", "Free", "2024-06-04"]
          ]
        },
        success_check: "selected_header_row == 4",
        praise: "Exactly. You stepped past the noise and found the labels. That's the whole skill."
      },
      {
        mode: "solo",
        kind: "select_row",
        task: "Click the <b>header row</b>.",
        prompt: "No highlight this time — find it on your own.",
        hint: "Same idea — logo, blanks, then the row of column names.",
        checklist: [
          "Scan the file top to bottom",
          "Skip the logo / title banner",
          "Skip blank rows",
          "Find the row of column names",
          "Click its row number, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          merged_title_row: 1,
          blank_rows: [2, 3, 4],
          rows: [
            ["▦ NORTHWIND LOGISTICS", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["Shipment", "Origin", "Destination", "Weight (kg)"],
            ["S-900", "Denver", "Austin", "120"],
            ["S-901", "Reno", "Boise", "85"]
          ]
        },
        success_check: "selected_header_row == 5",
        praise: "Cold, no hints — nailed it. You can read a sheet now. That puts you ahead of half the building."
      }
    ],

    mentor_outro:
      "That's it. You'll be amazed how often row 1 <i>isn't</i> the answer. Next up: once you've found the labels, you need to know what <i>kind</i> of stuff lives in each column."
  },

  /* ------------------------------------------------------------------------
   * MODULE 3 — Data types
   * Teaches: every column holds a TYPE (text / number / date). Knowing the
   * type is upstream of every formula, sort, and filter.
   * New interaction: kind: "select_column" — clicking a column header.
   * Feeds: Job Wave 2 (type integrity).
   * ---------------------------------------------------------------------- */
  {
    id: "data_types",
    week: 1,
    day: 3,
    concept: { name: "Data types" },
    teaches_for: "type_integrity",
    ask: "Read each column and identify its data type: text, number, or date.",

    best_practice:
      "Know each column's <b>type</b> before you touch a formula. Excel can't <code>SUM</code> text and can't sort dates correctly if they're stored as text. Type is upstream of everything.",

    mentor_intro:
      "Okay — next thing. Every column in a sheet holds a <b>type</b>. The three you'll see daily: <b>text</b> (names, codes, words), <b>numbers</b> (counts, amounts, anything you'd math on), and <b>dates</b> (when something happened). Knowing which is which is what stops Excel from sorting your dates as text or summing your IDs.",

    teach: {
      explain:
        "Here's a clean little export. Look at it column by column. <b>A</b> = customer names (<i>text</i>). <b>B</b> = order amounts (<i>numbers</i> — Excel can sum these). <b>C</b> = order dates (<i>dates</i>). <b>D</b> = status labels (<i>text</i>). I've highlighted the <b>amounts</b> column — that's the one you'd run <code>SUM</code> or <code>AVERAGE</code> on. The others? Different tools.",
      example: {
        kind: "sheet",
        highlight_col: "B",
        rows: [
          ["Customer",    "Amount", "Order date",  "Status"],
          ["Acme",        "240",    "2024-07-01",  "Paid"],
          ["Globex",      "180",    "2024-07-02",  "Paid"],
          ["Initech",     "95",     "2024-07-04",  "Refunded"],
          ["Umbrella",    "420",    "2024-07-05",  "Paid"]
        ]
      },
      callout: "Column B holds NUMBERS — sum, average, sort low-to-high all work. Different type = different tools."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_column",
        task: "Click the column that holds <b>dates</b>.",
        prompt: "It's highlighted so you can see the shape you're after.",
        hint: "Dates look like calendar values — year-month-day, slashes, or month names.",
        checklist: [
          "Skim each column top to bottom",
          "Find the one whose values look like <b>calendar dates</b>",
          "Ignore amounts (numbers) and names (text)",
          "Click that column's letter at the top, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          highlight_col: "C",
          rows: [
            ["Product",  "Price",  "Launched",    "Region"],
            ["Widget A", "29.99",  "2023-04-12",  "West"],
            ["Widget B", "39.99",  "2023-09-30",  "East"],
            ["Widget C", "19.99",  "2024-01-15",  "North"],
            ["Widget D", "49.99",  "2024-06-08",  "South"]
          ]
        },
        success_check: "selected_column == 'C'",
        praise: "Column C — dates. Year-month-day, every row. You'd never want Excel sorting these alphabetically."
      },
      {
        mode: "solo",
        kind: "select_column",
        task: "Click the column that holds <b>numbers</b> — the kind you'd do math on.",
        prompt: "No highlight this time. Watch out for IDs and codes that only look numeric.",
        hint: "Look past IDs and codes — find the column you'd reach for if someone asked you to <code>SUM</code> it.",
        checklist: [
          "Scan each column's values",
          "Skip text columns (names, labels)",
          "Skip dates",
          "Find the column of <b>mathable</b> values — counts, amounts, measurements",
          "Click its column letter, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          rows: [
            ["Order ID", "Customer",   "Order date",  "Total"],
            ["O-1001",   "Acme",       "2024-08-02",  "240"],
            ["O-1002",   "Globex",     "2024-08-05",  "1180"],
            ["O-1003",   "Initech",    "2024-08-09",  "95"],
            ["O-1004",   "Stark Ind.", "2024-08-12",  "640"]
          ]
        },
        success_check: "selected_column == 'D'",
        praise: "Column D — totals. Those are the numbers you'd sum. Order IDs <i>look</i> like numbers but they're really identifiers (text) — Excel shouldn't be doing math on them."
      }
    ],

    mentor_outro:
      "Solid. Text, number, date — three types, three different toolkits. But here's the nasty one nobody warns you about: sometimes a column <i>looks</i> like numbers and <i>isn't</i>. Next module — the green-triangle trap that quietly breaks every total you'll ever build."
  },

  /* ------------------------------------------------------------------------
   * MODULE 4 — Numbers stored as text
   * Teaches: a column can LOOK numeric but be stored as text — Excel flags it
   * with a tiny green corner triangle. Text-numbers won't SUM, won't sort, and
   * silently break formulas. The skill: spot the flag on sight.
   * Interaction: reuses kind: "select_column". New VISUAL: artifact.marker_cells
   * draws the green corner flag (core.js renderSheet + .tn-flag in styles.css).
   * Feeds: Job Wave 2 (type integrity). Last built module → hands off to the Job.
   * ---------------------------------------------------------------------- */
  {
    id: "numbers_as_text",
    week: 1,
    day: 4,
    concept: { name: "Numbers stored as text" },
    teaches_for: "type_integrity",
    ask: "Catch the column whose numbers are secretly stored as text.",
    reinforces: ["Data types"], // spotting text-numbers reuses reading a column's type

    best_practice:
      "The tell is a tiny <b>green triangle</b> in the corner of a cell — Excel flagging <i>“this number is stored as text.”</i> Text-numbers won't <code>SUM</code>, won't sort right, and break formulas without an error. Spot them first; convert before you trust any math.",

    mentor_intro:
      "Last module you learned the three types. Here's the trap that burns <i>everyone</i> at least once: a column that looks like clean numbers — right values, nothing obviously wrong — but Excel is secretly storing them as <b>text</b>. You <code>SUM</code> it and get <b>0</b>. The tell? A little <b>green triangle</b> in the corner of each cell. Once you see it, you can't unsee it.",

    teach: {
      explain:
        "Same kind of export as before. Look closely. <b>B</b> is real numbers — <i>In stock</i> counts, Excel can math on them. <b>C</b> is <i>Unit price</i>… and every cell has a tiny <b>green triangle</b> in its top-left corner. That's Excel telling you these aren't numbers — they're <b>text that looks like numbers</b>. <code>SUM(C2:C5)</code> would come back <b>0</b>. The flag is the whole tell.",
      example: {
        kind: "sheet",
        highlight_col: "C",
        marker_cells: ["C2", "C3", "C4", "C5"],
        rows: [
          ["Item",      "In stock", "Unit price"],
          ["Bolt M4",   "120",      "0.45"],
          ["Washer",    "340",      "0.12"],
          ["Bracket",   "58",       "3.20"],
          ["Hinge",     "76",       "1.95"]
        ]
      },
      callout: "See the green corners in column C? Each one means \"stored as text.\" SUM(C2:C5) would return 0 — not the total you'd expect."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_column",
        task: "Click the column whose numbers are <b>stored as text</b>.",
        prompt: "It's highlighted — look for the green corner flags on every cell.",
        hint: "Real numbers are clean. The text-numbers wear a tiny green triangle in the corner of every cell.",
        checklist: [
          "Skim each column of values",
          "Look for the cells wearing a <b>green corner triangle</b>",
          "That's the column Excel can't do math on",
          "Click that column's letter at the top, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          highlight_col: "B",
          marker_cells: ["B2", "B3", "B4", "B5"],
          rows: [
            ["Region",  "Revenue",  "Orders",  "Quarter"],
            ["West",    "12400",    "310",     "Q1"],
            ["East",    "9800",     "245",     "Q1"],
            ["North",   "15200",    "402",     "Q1"],
            ["South",   "7600",     "190",     "Q1"]
          ]
        },
        success_check: "selected_column == 'B'",
        praise: "Column B — Revenue. Looks like money, but every cell is flagged text. SUM would've handed you a zero and a very confused meeting."
      },
      {
        mode: "solo",
        kind: "select_column",
        task: "Click the column that's <b>stored as text</b>.",
        prompt: "No highlight this time. Two columns look numeric — only one is actually text.",
        hint: "Ignore the values themselves. Hunt for the green corner flags — that's the column with the problem.",
        checklist: [
          "Find every column that <i>looks</i> like numbers",
          "Check which cells carry the <b>green corner triangle</b>",
          "Skip the clean numeric column",
          "Click the flagged column's letter, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          marker_cells: ["D2", "D3", "D4", "D5"],
          rows: [
            ["Product",   "Units",  "In stock",  "List price"],
            ["Widget A",  "1200",   "84",        "29.99"],
            ["Widget B",  "950",    "0",         "39.99"],
            ["Widget C",  "1740",   "61",        "19.99"],
            ["Widget D",  "880",    "27",        "49.99"]
          ]
        },
        success_check: "selected_column == 'D'",
        praise: "Column D — List price. Units and In stock are real numbers; the prices are text in disguise. Cold catch — that's the instinct that saves you in the wild."
      }
    ],

    mentor_outro:
      "That's the one that'll save you over and over. A number that won't add up isn't a mystery anymore — it's a green triangle you already know to look for. One more gremlin before we open the drive: values that look fine on their own but don't <i>agree</i> with each other. That's next."
  },

  /* ------------------------------------------------------------------------
   * MODULE 5 — Consistency gremlins
   * Teaches: the same category recorded several ways ("Active"/"active"/
   * "ACTIVE") is several values to a computer — it splits counts, pivots, and
   * filters. The skill: spot the column that's inconsistent (vs. one that
   * merely holds different legit categories). Interaction: select_column.
   * Last built module → carries the handoff to the Job.
   * ---------------------------------------------------------------------- */
  {
    id: "consistency_gremlins",
    week: 1,
    day: 5,
    concept: { name: "Consistency gremlins" },
    teaches_for: "type_integrity",
    ask: "Find the column where one category is written several inconsistent ways.",
    reinforces: ["Data types"], // judging a category column reuses reading column types

    best_practice:
      "The same thing written two ways is <b>two things</b> to a computer. <code>Active</code>, <code>active</code>, and <code>ACTIVE</code> won't count, filter, or group together. Standardize your categories <i>before</i> you summarize anything.",

    mentor_intro:
      "Last one. You can spot a number that's secretly text — here's its sneakier cousin. Values that look fine one at a time but don't <i>agree</i>: <code>Active</code>, <code>active</code>, <code>ACTIVE</code>. To you, same status. To Excel, <b>three different groups</b>. Build a pivot and your count splits into three rows, all wrong. We call these <b>consistency gremlins</b>.",

    teach: {
      explain:
        "Look at the <b>Status</b> column. Every value <i>means</i> \"open\" or \"closed\" — but read them literally: <code>Open</code>, <code>open</code>, <code>OPEN</code>. Three spellings of one thing. The moment you count tickets by status, Excel gives you three separate \"open\" buckets. Note the difference from a column like <b>Owner</b>: different names there are <i>supposed</i> to be different. Inconsistency is the same thing written differently — not different things.",
      example: {
        kind: "sheet",
        highlight_col: "B",
        rows: [
          ["Ticket", "Status",  "Owner"],
          ["T-01",   "Open",    "Dana"],
          ["T-02",   "open",    "Raj"],
          ["T-03",   "OPEN",    "Dana"],
          ["T-04",   "Closed",  "Mei"],
          ["T-05",   "open",    "Raj"]
        ]
      },
      callout: "Column B is one status in three costumes — Open / open / OPEN. Count by status and you'd get three \"open\" rows instead of one."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_column",
        task: "Click the column whose values are <b>inconsistent</b> — the same thing written several ways.",
        prompt: "It's highlighted. Notice one category showing up in a few different spellings.",
        hint: "You're not looking for different things — you're looking for one thing recorded inconsistently (case, abbreviations).",
        checklist: [
          "Read down each column's values",
          "Find the column where one category appears in <b>multiple spellings</b>",
          "Ignore columns where the values are genuinely different things",
          "Click that column's letter at the top, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          highlight_col: "C",
          rows: [
            ["Rep",    "Region",  "Priority"],
            ["Alvarez", "West",   "High"],
            ["Bso",     "East",   "high"],
            ["Chen",    "West",   "HIGH"],
            ["Diaz",    "North",  "Low"],
            ["Eze",     "East",   "high"]
          ]
        },
        success_check: "selected_column == 'C'",
        praise: "Column C — Priority. High / high / HIGH is one priority written three ways. Region's fine: West, East, North are genuinely different places."
      },
      {
        mode: "solo",
        kind: "select_column",
        task: "Click the column with <b>inconsistent</b> categories.",
        prompt: "No highlight this time. Two columns hold categories — only one is written inconsistently.",
        hint: "One column varies for a good reason (real, distinct values). The other repeats one category in different spellings — that's the gremlin.",
        checklist: [
          "Spot the two columns that hold <b>categories</b> (not IDs, not numbers)",
          "One holds genuinely different values — leave it",
          "One repeats a single category in mixed case or spellings",
          "Click that column's letter, then <b>Confirm</b>"
        ],
        artifact: {
          kind: "sheet",
          rows: [
            ["Store", "Region",  "Segment"],
            ["S-1",   "North",   "Retail"],
            ["S-2",   "South",   "retail"],
            ["S-3",   "North",   "Wholesale"],
            ["S-4",   "East",    "RETAIL"],
            ["S-5",   "South",   "Retail"]
          ]
        },
        success_check: "selected_column == 'C'",
        praise: "Column C — Segment. Retail / retail / RETAIL is the gremlin. Region looked busy too, but North/South/East are real distinct values — that one's clean. Cold catch."
      }
    ],

    mentor_outro:
      "Nice — \"Active,\" \"active,\" \"ACTIVE\" will never slip into one of your pivot tables again. That's the foundation done: you can <i>read</i> a file and <i>trust</i> what's in it. The next stretch is a different muscle — the habits that stop you from <i>creating</i> the next cursed file. First one's a big one."
  },

  /* ========================================================================
   * WEEK 2 — the habits that keep you from creating the next cursed file.
   * These are judgment lessons, not click-the-grid lessons, so they use the
   * select_option interaction (multiple-choice). Each still follows gradual
   * release: a worked example (right answer shown), then guided, then solo.
   * ====================================================================== */

  /* ---- MODULE 6 — Source vs. copy (→ Job Wave 3) ----------------------- */
  {
    id: "source_vs_copy",
    week: 2,
    day: 6,
    concept: { name: "Source vs. copy" },
    teaches_for: "work_on_copy",
    ask: "Decide how to change an important file without risking the original.",

    best_practice:
      "Never edit the only copy. Before you touch an inherited or shared file, <b>duplicate it and work on the copy</b> — the untouched original is your undo button when something goes sideways.",

    mentor_intro:
      "Onto the second half. This one's a habit that'll save your job someday. When you're handed an important file — a master list, the source of truth — the instinct is to just start cleaning. Don't. <b>Work on a copy.</b> Duplicate it first, edit the duplicate. Wreck something? The original's still sitting there. Pros do this <i>every single time</i>.",

    teach: {
      explain:
        "You're handed <code>customers_master.xlsx</code> — the company's one true customer list. Marketing wants cleanup. Here's the move a careful analyst makes versus the one that ends careers. I've marked the right call — notice <i>why</i> it's safe.",
      example: {
        answer: "b",
        options: [
          { id: "a", label: "Open the master and start editing", note: "One slip and there's no clean original left to fall back on." },
          { id: "b", label: "Save a copy first, then edit the copy", note: "The original stays pristine — your safety net." },
          { id: "c", label: "Delete the rows that look wrong", note: "Destructive and irreversible on a shared file." }
        ]
      },
      callout: "Always (b): duplicate first, edit the copy. The untouched master is your undo button."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Pick the <b>safe first move</b>.",
        prompt: "You've been handed the company's only sales master. Finance asked for some cleanup.",
        hint: "Which option still leaves you a clean original if you make a mistake?",
        options: [
          { id: "a", label: "Start editing the master right away", note: "Fast — until you need an undo that doesn't exist." },
          { id: "b", label: "Duplicate it, then work on the copy", note: "Original untouched and safe." },
          { id: "c", label: "Sort and delete what looks off", note: "Irreversible on the real file." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Exactly. Copy first, edit the copy. If the cleanup goes wrong, the master is right where you left it."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Choose the right move.",
        prompt: "A shared budget file lives on the team drive — everyone pulls from it. Your manager asks you to \"fix the formatting.\"",
        hint: "It's shared and it's the only copy. Protect the original before you change anything.",
        options: [
          { id: "a", label: "Email everyone to stop using it, then edit live", note: "Still editing the only copy." },
          { id: "b", label: "Reformat it in place — it's just formatting", note: "\"Just formatting\" is how originals die." },
          { id: "c", label: "Save your own copy, format that, share it back", note: "Original safe; your work is reviewable." }
        ],
        success_check: "selected_option == 'c'",
        praise: "Right — your own copy, formatted, shared back for review. The shared original never took the risk. That's the habit."
      }
    ],

    mentor_outro:
      "Good. \"Work on a copy\" is muscle memory for every analyst worth trusting. Naming that copy is the next thing — because a safety net called <code>FINAL_final_v2</code> isn't much of a safety net."
  },

  /* ---- MODULE 7 — Sane file names (→ Job Wave 4) ---------------------- */
  {
    id: "sane_file_names",
    week: 2,
    day: 7,
    concept: { name: "Sane file names" },
    teaches_for: "document",
    ask: "Pick a file name your future self — and your teammates — can actually understand.",

    best_practice:
      "A good file name reads itself: <b>what it is, when, which version</b>. <code>sales_2024-Q3_v2.xlsx</code> beats <code>FINAL_final_v2 (use this one).xlsx</code> every time. Dates as <code>YYYY-MM-DD</code> so they sort; no mystery acronyms.",

    mentor_intro:
      "You've already met <code>Q3_FINAL_final_v2.xlsx</code>. You know the pain. A file name is a tiny act of documentation — done right, anyone (you in six months included) knows what's inside without opening it. Done wrong, you get a drive full of \"final\"s. Let's learn the difference.",

    teach: {
      explain:
        "Three names for the same monthly sales export. One of them you could find, trust, and sort a year from now. The other two start the next \"which file is real?\" crisis. I've marked the one a pro would save.",
      example: {
        answer: "b",
        options: [
          { id: "a", label: "<code>report FINAL (1) copy.xlsx</code>", note: "Which final? Whose copy? Useless within a month." },
          { id: "b", label: "<code>sales_2024-07_v2.xlsx</code>", note: "What it is, when, which version — and it sorts itself." },
          { id: "c", label: "<code>stuff_new.xlsx</code>", note: "Tells you nothing. \"New\" expires immediately." }
        ]
      },
      callout: "(b) wins: subject, date as YYYY-MM, version. Reads itself, sorts itself, survives the handoff."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Pick the <b>best file name</b>.",
        prompt: "You just built the Q3 regional revenue summary. Time to save it.",
        hint: "What it is, when, which version — and dates that sort in order.",
        options: [
          { id: "a", label: "<code>revenue_2024-Q3_regional_v1.xlsx</code>", note: "Subject, period, detail, version. Clean." },
          { id: "b", label: "<code>FINAL revenue (newest).xlsx</code>", note: "\"Final\" and \"newest\" never stay true." },
          { id: "c", label: "<code>rev.xlsx</code>", note: "Which revenue? When? No idea." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Yes — anyone reads that and knows exactly what it is and when it's from. And it sorts next to its siblings."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Choose the name that'll still make sense next year.",
        prompt: "You're saving a daily snapshot of signups, one file per day, into a shared folder.",
        hint: "It's one of many dated files. Which naming makes the folder sort cleanly by date?",
        options: [
          { id: "a", label: "<code>signups today.xlsx</code>", note: "\"Today\" is wrong tomorrow; spaces invite chaos." },
          { id: "b", label: "<code>signups_2024-08-14.xlsx</code>", note: "ISO date sorts perfectly; unambiguous." },
          { id: "c", label: "<code>8-14 signups FINAL.xlsx</code>", note: "M-D dates sort wrong; \"final\" means nothing daily." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Right — <code>YYYY-MM-DD</code> means the folder sorts itself in true date order. Future-you says thank you."
      }
    ],

    mentor_outro:
      "Nice. Naming the <i>file</i> is step one of documenting. Step two: naming what's <i>inside</i> it — so nobody has to guess what column <code>val</code> means. That's next."
  },

  /* ---- MODULE 8 — The data dictionary (→ Job Wave 4) ------------------ */
  {
    id: "data_dictionary",
    week: 2,
    day: 8,
    concept: { name: "The data dictionary" },
    teaches_for: "document",
    ask: "Make sure every column's meaning is written down, so no one has to guess.",
    reinforces: ["Data types"], // documenting a column means knowing its type + units

    best_practice:
      "A <b>data dictionary</b> is a short note saying what each column means, its units, and its valid values. <code>amt</code> = ? Dollars or units? Net or gross? Write it once and save everyone — including future-you — the guessing.",

    mentor_intro:
      "Ever opened a file with a column called <code>val</code> or <code>flag2</code> and had no clue what it meant? That's a missing <b>data dictionary</b>. It's just a short note: column name, what it means, units, valid values. Boring — and the single kindest thing you can leave the next analyst. Who, plot twist, is sometimes you.",

    teach: {
      explain:
        "Here's a column literally named <code>amt</code>. Three ways to document it. Two of them leave the reader exactly as lost as before. One actually answers the questions a reader would have — units, sign, precision. I've marked it.",
      example: {
        answer: "b",
        options: [
          { id: "a", label: "<code>amt</code> — \"the amount\"", note: "Circular. Amount of what? In what units?" },
          { id: "b", label: "<code>amt</code> — order total in USD, pre-tax, 2 decimals", note: "Answers the real questions: what, units, sign, precision." },
          { id: "c", label: "<code>amt</code> — \"a number\"", note: "Technically true, totally useless." }
        ]
      },
      callout: "(b): meaning + units + precision. A reader never has to guess or ask."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Pick the <b>most useful dictionary entry</b>.",
        prompt: "A column is named <code>status</code>. You're documenting it for the next person.",
        hint: "The best entry tells a reader the meaning AND the exact allowed values.",
        options: [
          { id: "a", label: "<code>status</code> — the status", note: "Says nothing new." },
          { id: "b", label: "<code>status</code> — account state; one of: Active, Churned, Trial", note: "Meaning plus the exact valid values." },
          { id: "c", label: "<code>status</code> — text", note: "That's a data type, not a definition." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Exactly — meaning plus the allowed values. Now nobody invents a fourth spelling of \"Active.\" (You'd catch it anyway.)"
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Choose the best documentation move.",
        prompt: "You're handing off a file with columns <code>q</code>, <code>p</code>, and <code>tot</code>. The next analyst has never seen it.",
        hint: "What single thing saves them the most guessing across the whole file?",
        options: [
          { id: "a", label: "Add a small tab defining each column, its units, and valid values", note: "One note, every column explained." },
          { id: "b", label: "Rename the file to <code>important.xlsx</code>", note: "Doesn't explain a single column." },
          { id: "c", label: "Assume they'll figure out q × p = tot", note: "Maybe. Or they'll guess wrong and report it." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — a tiny data-dictionary tab. <code>q</code> = quantity, <code>p</code> = unit price (USD), <code>tot</code> = line total. Five minutes, hours saved."
      }
    ],

    mentor_outro:
      "Solid. File named, columns documented — you leave files better than you find them now. Last two are about the <i>humans</i>: getting the question right, and saying the answer well. First, the question."
  },

  /* ---- MODULE 9 — The ask (→ Job Wave 5) ------------------------------ */
  {
    id: "the_ask",
    week: 2,
    day: 9,
    concept: { name: "The ask" },
    teaches_for: "clarify",
    ask: "Pin down what the stakeholder actually wants before you touch the data.",

    best_practice:
      "Before you build anything, <b>clarify the ask</b>. \"Send me the sales numbers\" — which sales? which period? total or by region? Five minutes of questions up front beats a day rebuilding the wrong thing. Restating the ask back is how pros avoid rework.",

    mentor_intro:
      "Here's where analysts waste the most time: answering the wrong question, <i>beautifully</i>. Someone says \"just send me the numbers.\" Which numbers? What period? For what decision? The skill isn't the spreadsheet — it's <b>clarifying the ask</b> before you open one. Let's practice.",

    teach: {
      explain:
        "Your manager messages: \"Can you get me the customer numbers by end of day?\" Three ways to respond. Two of them guarantee you build the wrong thing. One takes thirty seconds and saves the whole afternoon. Marked it.",
      example: {
        answer: "b",
        options: [
          { id: "a", label: "\"Sure!\" — then guess what they meant", note: "A coin flip on a deadline." },
          { id: "b", label: "\"Happy to — total customers, new this quarter, or active? And which regions?\"", note: "Thirty seconds now; zero rework later." },
          { id: "c", label: "Send every customer report you have", note: "Now they have to find the answer in your dump." }
        ]
      },
      callout: "(b): a quick clarifying question. Confirm the ask, then build once."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Pick the best <b>clarifying response</b>.",
        prompt: "A stakeholder emails: \"Need the revenue figures for the meeting.\"",
        hint: "Which reply nails down what \"revenue figures\" actually means before you build?",
        options: [
          { id: "a", label: "Reply: \"Which period, which products, and is this total or by region?\"", note: "Locks the scope before any work." },
          { id: "b", label: "Build last year's full revenue workbook to be safe", note: "Probably the wrong period, definitely too much." },
          { id: "c", label: "Reply \"On it!\" and start pulling everything", note: "On... what, exactly?" }
        ],
        success_check: "selected_option == 'a'",
        praise: "Exactly. Pin down period, scope, and grain first. Now whatever you build is the thing they actually needed."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Choose the right first step.",
        prompt: "\"Can you make me a dashboard of how we're doing?\" — no other detail.",
        hint: "\"How we're doing\" could mean ten different things. What do you do before building anything?",
        options: [
          { id: "a", label: "Pick metrics you think matter and build it", note: "Guessing at the goal on their behalf." },
          { id: "b", label: "Ask what decision it informs and which 2–3 metrics matter most", note: "Anchors the build to the real purpose." },
          { id: "c", label: "Build the biggest dashboard possible to cover everything", note: "Noise, not an answer." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Right — anchor to the decision and the few metrics that drive it. A focused answer beats a giant guess every time."
      }
    ],

    mentor_outro:
      "That's the one that separates the trusted analysts from the busy ones. Last lesson: you've got an answer — now don't blow it at the finish line. Sanity-check it, then say it like a human."
  },

  /* ---- MODULE 10 — Sanity-check & say it (LAST → hands off to the Job) - */
  {
    id: "sanity_check",
    week: 2,
    day: 10,
    concept: { name: "Sanity-check & say it" },
    teaches_for: "clarify",
    ask: "Before you hit send, sanity-check the result and communicate it with its caveats.",
    reinforces: ["Numbers stored as text"], // a too-low total often = text-numbers/blanks

    best_practice:
      "A number with no gut-check is a liability. Before you report it: does the total look <i>roughly right</i>? Any blanks, dupes, or text-numbers skewing it? Then <b>say it plainly</b> — the figure, the caveat, the next step.",

    mentor_intro:
      "Last one. You've cleaned the file, you've got a number. <b>Don't just send it.</b> Sanity-check: is it in the right ballpark? Did a text-number or a blank throw it off? Then communicate like a person — the number, the caveat, the recommendation. That's the gap between \"someone who makes spreadsheets\" and \"an analyst people trust.\"",

    teach: {
      explain:
        "You were asked for Q3 revenue. Your formula returns <b>$40</b>. Forty dollars, for a quarter. Three reactions. Two of them put a wrong number in front of the board. One of them is what a careful analyst does on reflex. Marked it.",
      example: {
        answer: "b",
        options: [
          { id: "a", label: "Send it: \"Q3 revenue is $40.\"", note: "$40 for a quarter? That's a red flag you ignored." },
          { id: "b", label: "Pause — $40 is impossibly low; check for text-numbers or blanks first", note: "The gut-check that saves your reputation." },
          { id: "c", label: "Round it to $0 and move on", note: "Now it's wrong AND lazy." }
        ]
      },
      callout: "(b): the number failed the smell test — so you investigate (hello, text-numbers) before anyone sees it."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Pick the right move when a result <b>looks off</b>.",
        prompt: "You sum a 5,000-row orders file and get 12. Twelve.",
        hint: "Twelve orders' worth for 5,000 rows is impossible — what does that usually mean?",
        options: [
          { id: "a", label: "Report 12 — the formula said so", note: "The formula trusted text-numbers; you shouldn't." },
          { id: "b", label: "Investigate: the amount column is likely text, not numbers", note: "A too-low SUM screams text-numbers or blanks." },
          { id: "c", label: "Multiply by 1,000 so it looks right", note: "Inventing a number is worse than a wrong one." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Exactly — a SUM that low almost always means text-numbers (those green flags) or blanks. Fix the cause, then report."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Choose the best way to <b>communicate</b> the result.",
        prompt: "Revenue came to ~$1.2M, but two of the eight regions are missing from the file.",
        hint: "Say the number, name the caveat, offer the next step — don't bury the gap or over-explain.",
        options: [
          { id: "a", label: "\"Revenue is $1,200,000.\"", note: "Hides that two regions are missing — that's misleading." },
          { id: "b", label: "\"~$1.2M so far, but 2 of 8 regions are missing — want me to chase them before we finalize?\"", note: "Number, caveat, next step. Trustworthy." },
          { id: "c", label: "Send the raw file and let them add it up", note: "That's not an answer, that's homework." }
        ],
        success_check: "selected_option == 'b'",
        praise: "That's the whole craft in one sentence: the figure, the caveat, and the next step. People trust an analyst who talks like that."
      }
    ],

    mentor_outro:
      "That's it — the whole craft. Read it, trust it, work on a copy, document it, clarify the ask, sanity-check, then say it. …Okay. You're ready. The analyst who had this desk before you left a drive full of exactly these mistakes. Time to clean it up — for real."
  }
];

if (typeof module !== "undefined" && module.exports)
  module.exports = { MENTOR, ACADEMY_PLAN, LESSONS };
