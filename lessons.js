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
 *   mentor_intro                       Sam's warm setup
 *   teach   { explain, example:{sheet…, highlight_row, callout} }
 *   practice[]  { mode:"guided"|"solo", task, prompt, hint?, artifact, success_check, praise }
 *               task = the one crisp directive (brief headline); prompt = context
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
  { week: 2, day: 6,  name: "Source vs. copy",       teaches_for: "work_on_copy",  built: false },
  { week: 2, day: 7,  name: "Sane file names",       teaches_for: "document",      built: false },
  { week: 2, day: 8,  name: "The data dictionary",   teaches_for: "document",      built: false },
  { week: 2, day: 9,  name: "The ask",               teaches_for: "clarify",       built: false },
  { week: 2, day: 10, name: "Sanity-check & say it", teaches_for: "clarify",       built: false }
];

const LESSONS = [
  {
    id: "the_grid",
    week: 1,
    day: 1,
    concept: { name: "The grid" },
    teaches_for: "—",

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
      "Nice — \"Active,\" \"active,\" \"ACTIVE\" will never slip into one of your pivot tables again. …Okay. That's enough onboarding to get you dangerous. The analyst who had this desk before you? Let's just say they weren't big on consistency — or types, or headers. Their drive is waiting. Time to use what you know."
  }
];

if (typeof module !== "undefined" && module.exports)
  module.exports = { MENTOR, ACADEMY_PLAN, LESSONS };
