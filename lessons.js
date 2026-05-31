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
 *   practice[]  { mode:"guided"|"solo", prompt, hint?, artifact, success_check, praise }
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
  { week: 1, day: 4,  name: "Numbers stored as text", teaches_for: "type_integrity", built: false },
  { week: 1, day: 5,  name: "Consistency gremlins",  teaches_for: "type_integrity", built: false },
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
        prompt: "Click cell <b>C2</b>. I've highlighted it so you can see it.",
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
        prompt: "No highlight this time. Click cell <b>D3</b>.",
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
        prompt: "Click the <b>header row</b>. I've highlighted it so you can see the shape.",
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
        prompt: "No highlight this time. Find the <b>header row</b> on your own.",
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
        prompt: "Click the column that holds <b>dates</b>. I've highlighted it so you can see the shape.",
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
        prompt: "No highlight this time. Click the column that holds <b>numbers</b> (the kind you'd actually do math on).",
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
      "Solid. Text, number, date — three types, three different toolkits. …Okay. That's enough onboarding to get you dangerous. The analyst who had this desk before you? Let's just say they didn't always get types right. Their drive is waiting. Time to use what you know."
  }
];

if (typeof module !== "undefined" && module.exports)
  module.exports = { MENTOR, ACADEMY_PLAN, LESSONS };
