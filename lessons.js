/* ============================================================================
 * Getting It Wrong Gets You Good — ACADEMY DATA (the two-week boot camp)
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
  { week: 1, day: 1,  name: "The grid",              teaches_for: "—",            built: false },
  { week: 1, day: 2,  name: "Find the real header",  teaches_for: "orient_header", built: true  },
  { week: 1, day: 3,  name: "Data types",            teaches_for: "type_integrity", built: false },
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
    id: "header_row",
    week: 1,
    day: 2,
    concept: { name: "Find the real header row" },
    teaches_for: "orient_header", // → Job Wave 1

    mentor_intro:
      "Morning! Day two. Before you ever <i>clean</i> a file, you have to <i>read</i> it — and step one is finding the <b>header row</b>: the single row where every cell is a column's name. Sounds obvious. It's the #1 thing people get wrong, because row 1 is usually a title, a logo, or just… nothing.",

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
        prompt: "Your turn — with a hand. Click the <b>header row</b>. I've highlighted it so you can see the shape.",
        hint: "Skip the title banner and the blank row. Find where the column names start.",
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
        prompt: "No highlight this time. Find the <b>header row</b> on your own.",
        hint: "Same idea — logo, blanks, then the row of column names.",
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
      "That's it. You'll be amazed how often row 1 <i>isn't</i> the answer. …Okay. Fair warning before I let you loose: the analyst who had this desk before you? Never learned this. Their drive is — a lot. Let's open one and you'll see exactly what I mean."
  }
];

if (typeof module !== "undefined" && module.exports)
  module.exports = { MENTOR, ACADEMY_PLAN, LESSONS };
