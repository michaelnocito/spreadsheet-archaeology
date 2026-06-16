/* ============================================================================
 * Getting It Wrong Gets You There Faster (SQL) — ACADEMY DATA (the boot camp)
 * ----------------------------------------------------------------------------
 * Before you're handed the Predecessor's cursed queries, you train. Your
 * mentor, SAM, walks you through SQL calm and clean. Each lesson follows
 * "gradual release of responsibility":
 *
 *     TEACH  (I do)  — Sam shows a worked example, annotated
 *     GUIDED (we do) — you try it, hint shown, the answer softly highlighted
 *     SOLO   (you do)— you do it cold, no scaffold
 *
 * Help here is PUSHED (offered freely) — the opposite of the pull-only
 * "figure it out" help on the job. Novices need the worked example first.
 *
 * DOMAIN NOTE — why multiple-choice, not a real query box: SQL's real "doing"
 * is typing a query. Faithfully grading free-typed SQL needs a database engine
 * and is not what teaches the *concepts* early on. The skill that matters first
 * is READING SQL — knowing what each clause does, predicting what a query
 * returns, and spotting where a query quietly lies. So lessons SHOW a real
 * query + its result (artifact kind:"query", rendered by core.js renderQuery)
 * and ask the player to make the call (kind:"select_option"). Recognition
 * before recall: read fluently first, write later.
 *
 * SCHEMA (per lesson)
 *   id, week, day, concept:{name}, teaches_for
 *   ask        the standing GOAL for the whole module (north star) — constant
 *              across every step, always visible above the per-step directive
 *   reinforces []  ready-to-show names of earlier skills this module builds on
 *   best_practice  one durable habit (the 💡 Pro tip)
 *   mentor_intro
 *   teach   { explain, example:{ kind:"query"|"sheet", …, highlight }, callout }
 *           example may also carry options:[{id,label,note?}] + answer to walk
 *           through the reasoning with the right choice pre-highlighted+locked.
 *   practice[]  { mode:"guided"|"solo", kind, task, prompt, hint?, artifact?,
 *                 options, success_check, praise }
 *               task = the one crisp directive (brief headline); prompt = context
 *               kind: "select_option" (also supports row/cell/column from core)
 *               artifact (optional) renders read-only ABOVE the choices; for a
 *               query, artifact.highlight glows a region ("sql"|"result").
 *   mentor_outro
 *
 * The toy database the whole boot camp uses:
 *   customers(customer_id, name, region, status, signup_date)
 *   orders(order_id, customer_id, amount, order_date)
 * ========================================================================== */

const MENTOR = {
  name: "Sam",
  role: "your onboarding mentor · senior analyst",
  avatar: "☕"
};

/* ---- Full syllabus (overview screen reads this) ---------------------------
 * Every module below is BUILT and playable, in order. M1–M5 = literacy /
 * fundamentals.  M6–M10 = judgment / communication. Each `teaches_for` maps to
 * a Job wave the Academy is preparing you for. */
const ACADEMY_PLAN = [
  { week: 1, day: 1,  name: "Reading a query",        teaches_for: "orient_query", built: true },
  { week: 1, day: 2,  name: "Pick your columns",      teaches_for: "orient_query", built: true },
  { week: 1, day: 3,  name: "Filtering with WHERE",   teaches_for: "filter",       built: true },
  { week: 1, day: 4,  name: "Sort & top-N",           teaches_for: "filter",       built: true },
  { week: 1, day: 5,  name: "Aggregates",             teaches_for: "aggregate",    built: true },
  { week: 2, day: 6,  name: "GROUP BY",               teaches_for: "aggregate",    built: true },
  { week: 2, day: 7,  name: "Mind the NULLs",         teaches_for: "nulls",        built: true },
  { week: 2, day: 8,  name: "Joining two tables",     teaches_for: "join",         built: true },
  { week: 2, day: 9,  name: "The ask",                teaches_for: "the_ask",      built: true },
  { week: 2, day: 10, name: "Sanity-check & say it",  teaches_for: "the_ask",      built: true }
];

const LESSONS = [
  /* ======================================================================== *
   * M1 — Reading a query  (the SQL keystone, like "the grid" was for sheets)
   * ======================================================================== */
  {
    id: "reading_a_query",
    week: 1,
    day: 1,
    concept: { name: "Reading a query" },
    teaches_for: "orient_query",
    ask: "Read a SELECT statement — know which part picks the columns and which part picks the table.",

    best_practice:
      "Before you ever <i>write</i> SQL, learn to <b>read</b> it. A query is a sentence: <b>SELECT</b> the columns <b>FROM</b> a table, maybe <b>WHERE</b> some condition holds. Read it left to right and it tells you exactly what it'll do.",

    mentor_intro:
      "Hey — Sam. Welcome to the team. We start with the one skill everything else rides on: <b>reading a query</b>. Not writing — reading. Every clause has a job. Learn the shape and you'll know what any query returns before you ever run it. Five minutes. Let's go.",

    teach: {
      explain:
        "Here's the simplest real query. <b>SELECT</b> says <i>which columns</i> I want — here, <code>name</code> and <code>region</code>. <b>FROM</b> says <i>which table</i> they live in — <code>customers</code>. That's it: pick columns, pick a table. The result is a smaller table with just those two columns, one row per customer. Read top to bottom: SELECT → what, FROM → where.",
      example: {
        kind: "query",
        title: "customers.sql",
        caption: "A query and exactly what it returns:",
        sql: "SELECT name, region\nFROM customers",
        result: {
          columns: ["name", "region"],
          rows: [["Acme Corp", "West"], ["Globex", "East"], ["Initech", "West"]]
        },
        resultNote: "Two columns — the two you asked for. One row per customer.",
        highlight: "sql"
      },
      callout: "SELECT = which columns. FROM = which table. The result has exactly the columns you named."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Which part of the query names the <b>table</b> the data comes from?",
        prompt: "Read the query below. The answer is highlighted so you can connect the word to the job it does.",
        hint: "One clause picks columns, one picks the table. Which keyword means \"from this table\"?",
        artifact: {
          kind: "query",
          title: "customers.sql",
          sql: "SELECT name, status\nFROM customers",
          highlight: "sql"
        },
        options: [
          { id: "a", label: "FROM customers", note: "FROM names the table the rows come from." },
          { id: "b", label: "SELECT name, status", note: "That's the column list — what, not where." },
          { id: "c", label: "name", note: "That's one column, not the table." },
          { id: "d", label: "status", note: "Also just a column." }
        ],
        success_check: "selected_option == 'a'",
        praise: "FROM names the table. SELECT picks columns; FROM picks where they live."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "How many <b>columns</b> will this result have?",
        prompt: "No highlight this time. Count what's between SELECT and FROM.",
        hint: "The result has exactly the columns you SELECT — count the comma-separated names.",
        artifact: {
          kind: "query",
          title: "orders.sql",
          sql: "SELECT order_id, amount, order_date\nFROM orders"
        },
        options: [
          { id: "a", label: "1", note: "There's more than one name after SELECT." },
          { id: "b", label: "3", note: "order_id, amount, order_date — three named columns." },
          { id: "c", label: "Every column in orders", note: "That would be SELECT * — this query names specific columns." },
          { id: "d", label: "Depends on how many rows there are", note: "Rows are the height; columns are what you SELECT." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Three — one per name in the SELECT list. You can read the shape of a query now. Everything else builds on this."
      }
    ],

    mentor_outro:
      "That's the foundation: SELECT picks columns, FROM picks the table, and the result is just a smaller table. Next: how to choose <i>which</i> columns — and why <code>SELECT *</code> is a trap."
  },

  /* ======================================================================== *
   * M2 — Pick your columns  (SELECT col list vs SELECT *)
   * ======================================================================== */
  {
    id: "pick_columns",
    week: 1,
    day: 2,
    concept: { name: "Pick your columns" },
    teaches_for: "orient_query",
    ask: "Choose exactly the columns the question needs — and know what SELECT * really does.",
    reinforces: ["Reading a query"],

    best_practice:
      "<b>Name the columns you need.</b> <code>SELECT *</code> grabs everything — handy for a peek, noisy for a report. Naming columns is clearer, faster, and survives the table changing under you.",

    mentor_intro:
      "Morning. Two ways to pick columns: name them, or use <code>*</code> to grab them all. <code>SELECT *</code> is fine when you're poking around, but when you're answering a real question you name <i>just</i> what you need. Let me show you the difference.",

    teach: {
      explain:
        "Same table, two queries. <code>SELECT *</code> returns <b>every column</b> — id, name, region, status, signup_date — even the ones nobody asked for. <code>SELECT name, region</code> returns <b>just those two</b>, in that order. When a stakeholder asks \"which region is each customer in?\", the second query <i>is</i> the answer; the first makes them hunt for it.",
      example: {
        kind: "query",
        title: "customers.sql",
        caption: "Name the columns you actually need:",
        sql: "SELECT name, region\nFROM customers",
        result: {
          columns: ["name", "region"],
          rows: [["Acme Corp", "West"], ["Globex", "East"]]
        },
        resultNote: "SELECT * would also drag along customer_id, status, signup_date — noise here.",
        highlight: "sql"
      },
      callout: "Name the columns → a clean, intentional result. SELECT * → everything, including the noise."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "A stakeholder wants <b>just each customer's name and signup date</b>. Which query?",
        prompt: "The right answer is highlighted. Notice it names exactly the two columns asked for — nothing else.",
        hint: "Name only the two columns the stakeholder asked for, from the customers table.",
        options: [
          { id: "a", label: "SELECT name, signup_date FROM customers", note: "Exactly the two columns asked for." },
          { id: "b", label: "SELECT * FROM customers", note: "Returns every column — they'd have to hunt for the two they wanted." },
          { id: "c", label: "SELECT name, signup_date", note: "No FROM — SQL won't know which table." },
          { id: "d", label: "SELECT customers FROM name, signup_date", note: "Table and columns are swapped." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Exactly — name the two columns, FROM customers. Clean answer, no hunting."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "What does <code>SELECT * FROM orders</code> return?",
        prompt: "No highlight. Think about what the star means.",
        hint: "The * is a wildcard for \"all columns\".",
        artifact: {
          kind: "query",
          title: "orders.sql",
          sql: "SELECT *\nFROM orders"
        },
        options: [
          { id: "a", label: "Only the first column of orders", note: "* means all columns, not the first." },
          { id: "b", label: "Every column of every row in orders", note: "* = all columns; no WHERE = all rows." },
          { id: "c", label: "A single total of the orders", note: "That would need an aggregate like SUM or COUNT." },
          { id: "d", label: "An error — * isn't valid SQL", note: "* is valid; it's the all-columns wildcard." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Right — every column, every row. Great for a quick peek; too noisy for an actual deliverable."
      }
    ],

    mentor_outro:
      "Good. Name your columns when you mean business; save <code>*</code> for poking around. Next: cutting the rows down to just the ones that matter — <b>WHERE</b>."
  },

  /* ======================================================================== *
   * M3 — Filtering with WHERE
   * ======================================================================== */
  {
    id: "filtering_where",
    week: 1,
    day: 3,
    concept: { name: "Filtering with WHERE" },
    teaches_for: "filter",
    ask: "Keep only the rows that match a condition — and quote text values exactly.",
    reinforces: ["Reading a query"],

    best_practice:
      "<b>WHERE filters rows, not columns.</b> Text goes in <i>single quotes</i> and is usually case-sensitive — <code>'Active'</code> ≠ <code>'active'</code>. Get the quoting and the casing right or you'll silently keep the wrong rows.",

    mentor_intro:
      "Now we trim. <b>WHERE</b> keeps only the rows where a condition is true — region is West, amount over 100, status is Active. Two things people fumble: text needs <i>single quotes</i>, and the spelling has to match the data exactly. Watch.",

    teach: {
      explain:
        "Here's the whole customers table filtered down. <code>WHERE region = 'West'</code> keeps only the rows where region is exactly the text <code>West</code>. Note the single quotes — that's how SQL knows <code>West</code> is a <i>value</i>, not a column name. The result is the same columns, just fewer rows: only the Western customers survive.",
      example: {
        kind: "query",
        title: "west_customers.sql",
        caption: "WHERE keeps only the matching rows:",
        sql: "SELECT name, region\nFROM customers\nWHERE region = 'West'",
        result: {
          columns: ["name", "region"],
          rows: [["Acme Corp", "West"], ["Initech", "West"]]
        },
        resultNote: "Globex (East) and the rest are filtered out — they didn't match.",
        highlight: "sql"
      },
      callout: "WHERE <condition> = keep rows where it's true. Text in 'single quotes'. Spelling & case must match the data."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Keep only customers whose status is <b>Active</b> (stored exactly as <code>Active</code>). Which WHERE?",
        prompt: "The right answer is highlighted. Watch the quotes and the capital A.",
        hint: "Text value → single quotes, exact spelling and case. The data stores it as 'Active'.",
        options: [
          { id: "a", label: "WHERE status = 'Active'", note: "Quoted text, exact case — matches the data." },
          { id: "b", label: "WHERE status = Active", note: "No quotes — SQL reads Active as a column name and errors." },
          { id: "c", label: "WHERE status = 'active'", note: "Lowercase won't match 'Active' — you'd silently get zero rows." },
          { id: "d", label: "WHERE 'Active'", note: "No column and no comparison — not a valid condition." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Yes — quoted, exact case. 'Active' matches the data; 'active' would quietly return nothing."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Given the table below, how many rows does <code>WHERE amount &gt; 100</code> return?",
        prompt: "No highlight. Read the amounts and count the ones strictly greater than 100.",
        hint: "\"Greater than\" is strict — exactly 100 does NOT pass > 100.",
        artifact: {
          kind: "query",
          title: "big_orders.sql",
          sql: "SELECT order_id, amount\nFROM orders\nWHERE amount > 100",
          result: {
            columns: ["order_id", "amount"],
            rows: [["O-1", 240], ["O-2", 80], ["O-3", 100], ["O-4", 150], ["O-5", 95]]
          },
          resultNote: "↑ This is the FULL orders table (before the WHERE). Count what passes amount > 100."
        },
        options: [
          { id: "a", label: "2 rows", note: "240 and 150 — the only two strictly above 100." },
          { id: "b", label: "3 rows", note: "100 itself does not pass > 100 (it's not greater)." },
          { id: "c", label: "5 rows", note: "That's the whole table — the filter removes some." },
          { id: "d", label: "4 rows", note: "80 and 95 are below 100, and 100 isn't > 100." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Two — 240 and 150. The 100 is a classic trap: > 100 is strict, so 100 itself is out."
      }
    ],

    mentor_outro:
      "You can cut a table down to the rows that matter now. Watch the quotes and the casing — that bites everyone once. Next: putting rows in order and grabbing the top few."
  },

  /* ======================================================================== *
   * M4 — Sort & top-N  (ORDER BY / LIMIT)
   * ======================================================================== */
  {
    id: "sort_top_n",
    week: 1,
    day: 4,
    concept: { name: "Sort & top-N" },
    teaches_for: "filter",
    ask: "Put rows in order and grab the top few — ORDER BY plus LIMIT.",
    reinforces: ["Reading a query", "Filtering with WHERE"],

    best_practice:
      "<b>ORDER BY sorts; LIMIT caps.</b> Default order is ascending (smallest first) — add <code>DESC</code> for largest first. \"Top 10\" almost always means <code>ORDER BY &lt;measure&gt; DESC LIMIT 10</code>.",

    mentor_intro:
      "\"Show me the biggest customers.\" \"Top 5 orders.\" Those are sort-and-cap questions. <b>ORDER BY</b> arranges the rows; <b>DESC</b> flips it to high-first; <b>LIMIT</b> keeps just the top however-many. Let me show you the move.",

    teach: {
      explain:
        "Here's the top three orders by size. <code>ORDER BY amount DESC</code> sorts biggest-first; <code>LIMIT 3</code> keeps only the first three rows after sorting. Drop the <code>DESC</code> and you'd get the <i>smallest</i> three instead — ascending is the default. Order first, then cap.",
      example: {
        kind: "query",
        title: "top_orders.sql",
        caption: "Sort biggest-first, then keep the top 3:",
        sql: "SELECT order_id, amount\nFROM orders\nORDER BY amount DESC\nLIMIT 3",
        result: {
          columns: ["order_id", "amount"],
          rows: [["O-1", 240], ["O-4", 150], ["O-3", 100]]
        },
        resultNote: "Sorted high → low, then cut to 3 rows.",
        highlight: "sql"
      },
      callout: "ORDER BY <col> sorts (ASC by default). DESC = high first. LIMIT n = keep the top n."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "You want the orders listed <b>biggest amount first</b>. Which clause does that?",
        prompt: "The answer is highlighted. \"Biggest first\" means descending.",
        hint: "Ascending is the default (small → large). You need the opposite.",
        options: [
          { id: "a", label: "ORDER BY amount DESC", note: "Sorts by amount, largest first." },
          { id: "b", label: "ORDER BY amount", note: "Sorts ascending — smallest first, the opposite of what's asked." },
          { id: "c", label: "WHERE amount DESC", note: "WHERE filters rows; it doesn't sort them." },
          { id: "d", label: "LIMIT amount", note: "LIMIT caps the row count; it doesn't sort." }
        ],
        success_check: "selected_option == 'a'",
        praise: "ORDER BY amount DESC — biggest first. DESC is the flip from the default ascending."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "The 5 <b>most recently signed-up</b> customers. Which query?",
        prompt: "No highlight. \"Most recent\" = latest date first, then keep 5.",
        hint: "Later dates are larger values — newest-first is DESC. Then cap at 5.",
        options: [
          { id: "a", label: "... ORDER BY signup_date DESC LIMIT 5", note: "Newest first, then the top 5 — exactly the ask." },
          { id: "b", label: "... ORDER BY signup_date LIMIT 5", note: "Ascending gives the 5 OLDEST customers." },
          { id: "c", label: "... WHERE signup_date = 5", note: "That filters to a nonsensical date, not a top-5." },
          { id: "d", label: "... LIMIT 5", note: "Caps to 5 rows but in no particular order — not 'most recent'." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — ORDER BY signup_date DESC then LIMIT 5. Sort to newest-first, then grab the top five."
      }
    ],

    mentor_outro:
      "Sort, then cap — that's most \"top N\" questions handled. Next we stop listing rows and start <i>summarizing</i> them: counts, sums, averages."
  },

  /* ======================================================================== *
   * M5 — Aggregates  (COUNT / SUM / AVG)
   * ======================================================================== */
  {
    id: "aggregates",
    week: 1,
    day: 5,
    concept: { name: "Aggregates" },
    teaches_for: "aggregate",
    ask: "Collapse many rows into one number — COUNT, SUM, AVG.",
    reinforces: ["Reading a query", "Filtering with WHERE"],

    best_practice:
      "<b>Aggregates turn many rows into one number.</b> <code>COUNT(*)</code> = how many rows. <code>SUM(x)</code> = total. <code>AVG(x)</code> = mean. Pair them with WHERE to summarize just a slice (\"total revenue in the West\").",

    mentor_intro:
      "Up to now every query listed rows. Now we <i>summarize</i> them. <b>COUNT</b> tells you how many, <b>SUM</b> adds a column up, <b>AVG</b> averages it. One query, one number out. This is most of what stakeholders actually want.",

    teach: {
      explain:
        "Look what happens: instead of a row per order, we get <b>one row, one number</b>. <code>SUM(amount)</code> adds up the amount column across every order — total revenue. Swap in <code>COUNT(*)</code> and you'd get the number of orders; <code>AVG(amount)</code> the average order size. The table goes in, a single summary comes out.",
      example: {
        kind: "query",
        title: "revenue.sql",
        caption: "Many rows in, one number out:",
        sql: "SELECT SUM(amount)\nFROM orders",
        result: {
          columns: ["SUM(amount)"],
          rows: [[665]]
        },
        resultNote: "Every order's amount, added into a single total.",
        highlight: "result"
      },
      callout: "COUNT(*) = how many rows. SUM(col) = total. AVG(col) = mean. One number out."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "A stakeholder asks for <b>total revenue across all orders</b>. Which query?",
        prompt: "The answer is highlighted. \"Total\" of a number column = SUM.",
        hint: "You want the amounts added together — which function totals a column?",
        options: [
          { id: "a", label: "SELECT SUM(amount) FROM orders", note: "Adds every amount into one total — revenue." },
          { id: "b", label: "SELECT COUNT(amount) FROM orders", note: "Counts how many orders, not how much money." },
          { id: "c", label: "SELECT amount FROM orders", note: "Lists every amount — doesn't total them." },
          { id: "d", label: "SELECT AVG(amount) FROM orders", note: "Gives the average order, not the total." }
        ],
        success_check: "selected_option == 'a'",
        praise: "SUM(amount) — total revenue in one number. COUNT would've answered a different question."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Which query answers <b>\"how many customers do we have?\"</b>",
        prompt: "No highlight. \"How many rows\" is the giveaway.",
        hint: "Counting rows, not adding a number column.",
        options: [
          { id: "a", label: "SELECT COUNT(*) FROM customers", note: "Counts the rows — one per customer." },
          { id: "b", label: "SELECT SUM(customer_id) FROM customers", note: "Adds up the id numbers — a meaningless total." },
          { id: "c", label: "SELECT * FROM customers", note: "Lists every customer; you'd have to count by hand." },
          { id: "d", label: "SELECT AVG(customer_id) FROM customers", note: "Averages the ids — nonsense." }
        ],
        success_check: "selected_option == 'a'",
        praise: "COUNT(*) — one row per customer, counted. Never SUM an id; the number would be meaningless."
      }
    ],

    mentor_outro:
      "One number out of a whole table — that's an aggregate. But stakeholders rarely want <i>one</i> number; they want it <b>per region, per month, per segment</b>. That's GROUP BY, and it's next."
  },

  /* ======================================================================== *
   * M6 — GROUP BY  (per-category aggregates) — judgment-heavy
   * ======================================================================== */
  {
    id: "group_by",
    week: 2,
    day: 6,
    concept: { name: "GROUP BY" },
    teaches_for: "aggregate",
    ask: "Compute an aggregate per category — one row per group, with GROUP BY.",
    reinforces: ["Aggregates", "Filtering with WHERE"],

    best_practice:
      "<b>GROUP BY = one row per group.</b> Every column in your SELECT must either be in the GROUP BY or wrapped in an aggregate. The shape of the answer is \"one row per &lt;the thing you grouped by&gt;\".",

    mentor_intro:
      "\"Revenue\" is one number. \"Revenue <i>by region</i>\" is one number <i>per region</i> — that's <b>GROUP BY</b>. You name the category to slice by, and the aggregate runs once inside each slice. The rule that trips people: anything you SELECT that isn't aggregated has to be in the GROUP BY.",

    teach: {
      explain:
        "Watch the shape change. <code>GROUP BY region</code> splits the customers into one bucket per region, and <code>COUNT(*)</code> runs <i>inside each bucket</i>. So instead of one grand total, you get <b>one row per region</b> with its own count. The columns: the thing you grouped by (region) plus the aggregate. That's the whole pattern.",
      example: {
        kind: "query",
        title: "by_region.sql",
        caption: "One row per region, each with its own count:",
        sql: "SELECT region, COUNT(*)\nFROM customers\nGROUP BY region",
        result: {
          columns: ["region", "COUNT(*)"],
          rows: [["West", 3], ["East", 2], ["North", 1]]
        },
        resultNote: "Three regions in → three rows out. The count is per region, not overall.",
        highlight: "sql"
      },
      callout: "GROUP BY <col> → one row per value of that column. SELECT the group column + an aggregate."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Stakeholder wants <b>total revenue for each region</b>. Which query?",
        prompt: "The answer is highlighted. \"For each region\" is the GROUP BY signal.",
        hint: "You need SUM(amount) computed once per region — so group by region.",
        options: [
          { id: "a", label: "SELECT region, SUM(amount) FROM orders GROUP BY region", note: "One row per region, each with its own revenue total." },
          { id: "b", label: "SELECT SUM(amount) FROM orders", note: "One grand total — loses the per-region breakdown." },
          { id: "c", label: "SELECT region, amount FROM orders", note: "Lists raw rows; nothing is summed per region." },
          { id: "d", label: "SELECT region, SUM(amount) FROM orders", note: "Missing GROUP BY — you can't mix a plain column with an aggregate like this." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Exactly — group by region, SUM inside each group. One honest row per region."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "There are exactly <b>4 distinct regions</b>. How many rows does <code>SELECT region, COUNT(*) FROM customers GROUP BY region</code> return?",
        prompt: "No highlight. GROUP BY produces one row per group.",
        hint: "One row per distinct value of the grouped column.",
        options: [
          { id: "a", label: "4 rows", note: "One row per distinct region — and there are four." },
          { id: "b", label: "1 row", note: "That's what you'd get with no GROUP BY (a grand total)." },
          { id: "c", label: "One row per customer", note: "GROUP BY collapses customers into region buckets." },
          { id: "d", label: "Can't tell without running it", note: "You can — it's one row per distinct group value: 4." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Four — one row per region. The result's height is always \"how many distinct groups.\""
      }
    ],

    mentor_outro:
      "GROUP BY is the workhorse of analytics: per region, per month, per segment. Next, a quieter danger — the value that <i>isn't there</i>. <b>NULLs</b>."
  },

  /* ======================================================================== *
   * M7 — Mind the NULLs
   * ======================================================================== */
  {
    id: "nulls",
    week: 2,
    day: 7,
    concept: { name: "Mind the NULLs" },
    teaches_for: "nulls",
    ask: "Handle missing values correctly — NULL means \"unknown\", and = never matches it.",
    reinforces: ["Filtering with WHERE", "Aggregates"],

    best_practice:
      "<b>NULL is \"unknown,\" not zero or blank.</b> Nothing equals NULL — not even NULL — so <code>= NULL</code> returns no rows. Use <code>IS NULL</code> / <code>IS NOT NULL</code>. And remember: <code>!=</code> filters silently drop NULL rows too.",

    mentor_intro:
      "Here's the bug that's burned every analyst alive: <b>NULL</b>. It means \"we don't know\" — missing, not zero, not empty text. The kicker: <code>region = NULL</code> never matches <i>anything</i>, because nothing equals an unknown. You have to ask <code>IS NULL</code>. Let me show you the trap.",

    teach: {
      explain:
        "Some customers have no region on file — that cell is <b>NULL</b>. You'd reach for <code>WHERE region = NULL</code> to find them… and get <b>zero rows</b>, every time. NULL means \"unknown,\" and SQL refuses to say an unknown equals anything. The correct test is <code>WHERE region IS NULL</code>. Same idea in reverse: <code>IS NOT NULL</code> finds the ones that <i>do</i> have a region.",
      example: {
        kind: "query",
        title: "no_region.sql",
        caption: "The trap — = NULL silently returns nothing:",
        sql: "SELECT name, region\nFROM customers\nWHERE region = NULL",
        result: { columns: ["name", "region"], rows: [] },
        resultNote: "0 rows — not because nobody's missing a region, but because = can't match NULL. Use IS NULL.",
        highlight: "result"
      },
      callout: "Nothing = NULL. Use IS NULL / IS NOT NULL. And col != 'X' quietly drops NULL rows."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Find every customer with <b>no region on file</b>. Which WHERE?",
        prompt: "The answer is highlighted. Remember — you can't equal an unknown.",
        hint: "= NULL never matches. There's a dedicated keyword for testing missingness.",
        options: [
          { id: "a", label: "WHERE region IS NULL", note: "The correct test for a missing value." },
          { id: "b", label: "WHERE region = NULL", note: "Always returns 0 rows — nothing equals NULL." },
          { id: "c", label: "WHERE region = ''", note: "Matches empty TEXT, not a NULL (unknown) — different thing." },
          { id: "d", label: "WHERE region = 'NULL'", note: "Matches the literal text \"NULL\", not a missing value." }
        ],
        success_check: "selected_option == 'a'",
        praise: "IS NULL — the only thing that finds missing values. = NULL would've quietly returned nothing."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Three of five orders have an amount; two are NULL. What does <code>AVG(amount)</code> average over?",
        prompt: "No highlight. Think about which rows an aggregate can even see.",
        hint: "Aggregates skip NULLs — they average only the values that exist.",
        artifact: {
          kind: "query",
          title: "avg_trap.sql",
          sql: "SELECT AVG(amount)\nFROM orders",
          result: {
            columns: ["order_id", "amount"],
            rows: [["O-1", 240], ["O-2", null], ["O-3", 120], ["O-4", null], ["O-5", 90]]
          },
          resultNote: "↑ The underlying rows. Two amounts are NULL (missing)."
        },
        options: [
          { id: "a", label: "Only the 3 non-NULL amounts (÷ 3)", note: "AVG ignores NULLs entirely — it divides by 3, not 5." },
          { id: "b", label: "All 5 rows, treating NULL as 0 (÷ 5)", note: "NULL is not 0 — AVG skips those rows, it doesn't zero them." },
          { id: "c", label: "It returns NULL because some values are missing", note: "AVG tolerates NULLs; it just averages the ones present." },
          { id: "d", label: "It errors out", note: "No error — NULLs are simply excluded from the average." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — AVG divides by 3, the count of real values. If you wanted NULL treated as 0, you'd have to say so."
      }
    ],

    mentor_outro:
      "NULL is \"unknown,\" never zero — test it with IS NULL, and watch how != and aggregates treat it. Last technical skill: pulling two tables together with a <b>JOIN</b>."
  },

  /* ======================================================================== *
   * M8 — Joining two tables
   * ======================================================================== */
  {
    id: "joins",
    week: 2,
    day: 8,
    concept: { name: "Joining two tables" },
    teaches_for: "join",
    ask: "Combine two tables on a shared key — and know which rows a JOIN keeps or drops.",
    reinforces: ["Reading a query", "GROUP BY"],

    best_practice:
      "<b>A JOIN stitches two tables on a matching key.</b> <code>INNER JOIN</code> keeps only rows that match in <i>both</i> tables — so unmatched rows silently disappear. <code>LEFT JOIN</code> keeps every row from the left table even when there's no match.",

    mentor_intro:
      "Real questions span tables. Customer names live in <code>customers</code>; what they spent lives in <code>orders</code>. To say \"how much did <i>Acme</i> spend,\" you <b>JOIN</b> them on the key they share — <code>customer_id</code>. The thing to respect: an INNER JOIN drops anything that doesn't match on both sides.",

    teach: {
      explain:
        "Two tables, one shared key. <code>JOIN orders ON customers.customer_id = orders.customer_id</code> lines each order up with the customer it belongs to, so you can put <code>name</code> (from customers) next to <code>amount</code> (from orders) in one result. The <code>ON</code> clause is the hinge — it says <i>how</i> the rows match. Get the key wrong and the whole thing falls apart.",
      example: {
        kind: "query",
        title: "customer_orders.sql",
        caption: "Stitch names to amounts on the shared key:",
        sql: "SELECT c.name, o.amount\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id",
        result: {
          columns: ["name", "amount"],
          rows: [["Acme Corp", 240], ["Acme Corp", 90], ["Globex", 150]]
        },
        resultNote: "Each order now carries its customer's name. Acme has two orders → two rows.",
        highlight: "sql"
      },
      callout: "JOIN … ON <key> = <key> stitches two tables. INNER JOIN keeps only matches in both."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "To attach each order's <b>customer name</b>, what should the <code>ON</code> clause match?",
        prompt: "The answer is highlighted. Match the column the two tables share.",
        hint: "Both tables have a customer_id — that's the hinge they join on.",
        options: [
          { id: "a", label: "ON customers.customer_id = orders.customer_id", note: "The shared key — each order finds its customer." },
          { id: "b", label: "ON customers.name = orders.amount", note: "Matches a name to a dollar amount — meaningless." },
          { id: "c", label: "ON customers.region = orders.order_id", note: "Unrelated columns; the join would be garbage." },
          { id: "d", label: "ON customers.customer_id = orders.amount", note: "Matches an id to a dollar amount — not the same thing." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Yes — join on the shared customer_id. The ON clause is what makes the rows line up correctly."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "A customer signed up but has <b>never ordered</b>. With an <code>INNER JOIN</code> of customers to orders, what happens to them?",
        prompt: "No highlight. INNER keeps only rows that match on both sides.",
        hint: "No matching order = no match on the orders side. What does INNER do with non-matches?",
        options: [
          { id: "a", label: "They're dropped from the result entirely", note: "INNER JOIN keeps only rows that match in BOTH tables." },
          { id: "b", label: "They appear with amount = 0", note: "INNER doesn't invent a zero row — it omits the customer. (A LEFT JOIN would show them, with NULL amount.)" },
          { id: "c", label: "They appear once with every column NULL", note: "That's closer to a LEFT JOIN's behavior, not INNER." },
          { id: "d", label: "The query errors", note: "No error — the unmatched customer is just silently excluded." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — INNER JOIN silently drops them. That's exactly how a 'customer count' can come out too low. (LEFT JOIN keeps them.)"
      }
    ],

    mentor_outro:
      "You can pull tables together now — and you know an INNER JOIN can quietly shrink your data. That's the last clause. The final two modules aren't syntax — they're the habits that keep you employed: <b>nailing the ask</b>, and <b>sanity-checking before you say it</b>."
  },

  /* ======================================================================== *
   * M9 — The ask  (clarify before you query) — judgment
   * ======================================================================== */
  {
    id: "the_ask",
    week: 2,
    day: 9,
    concept: { name: "The ask" },
    teaches_for: "the_ask",
    ask: "Turn a vague stakeholder request into the precise query it actually means.",
    reinforces: ["Filtering with WHERE", "GROUP BY"],

    best_practice:
      "<b>The hardest part of SQL isn't SQL — it's the question.</b> \"How are we doing?\" isn't a query. Pin down the metric, the table, the filter, and the grain <i>before</i> you write a line. A right answer to the wrong question is still wrong.",

    mentor_intro:
      "Here's what nobody warns you about: most SQL mistakes aren't syntax — they're answering the wrong question. A stakeholder says \"send me our active customers,\" and there are five ways to read that. Your job is to translate fuzzy English into one precise query. Let's practice the translation.",

    teach: {
      explain:
        "\"Give me our active customers in the West.\" Unpack it like an analyst: the <i>metric</i> is a list of customers; the <i>table</i> is customers; the <i>filters</i> are status = 'Active' AND region = 'West'. Each English phrase becomes a clause. The skill is hearing \"active customers in the West\" and seeing the WHERE before you type it.",
      example: {
        kind: "query",
        title: "the_ask.sql",
        caption: "\"Active customers in the West\" → two filters, AND-ed:",
        sql: "SELECT name\nFROM customers\nWHERE status = 'Active'\n  AND region = 'West'",
        result: { columns: ["name"], rows: [["Acme Corp"], ["Initech"]] },
        resultNote: "Each phrase in the ask maps to a clause: 'active' and 'West' both have to hold.",
        highlight: "sql"
      },
      callout: "Translate the ask: metric → SELECT, source → FROM, conditions → WHERE, \"per X\" → GROUP BY."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Stakeholder: <i>\"How many active customers do we have in each region?\"</i> Which query matches the ask?",
        prompt: "The answer is highlighted. Catch all three pieces: count, active-only, per region.",
        hint: "\"How many\" → COUNT. \"Active\" → WHERE. \"In each region\" → GROUP BY.",
        options: [
          { id: "a", label: "SELECT region, COUNT(*) FROM customers WHERE status = 'Active' GROUP BY region", note: "Count, filtered to active, one row per region — all three phrases honored." },
          { id: "b", label: "SELECT COUNT(*) FROM customers WHERE status = 'Active'", note: "Counts active customers, but as one grand total — misses 'each region'." },
          { id: "c", label: "SELECT region, COUNT(*) FROM customers GROUP BY region", note: "Per region, but counts ALL customers — ignores 'active'." },
          { id: "d", label: "SELECT * FROM customers WHERE region = 'Active'", note: "Misreads 'active' as a region and forgets the count entirely." }
        ],
        success_check: "selected_option == 'a'",
        praise: "All three pieces: COUNT, WHERE active, GROUP BY region. You translated the whole sentence."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "A manager asks for <i>\"our top customers.\"</i> What's the right <b>first move</b>?",
        prompt: "No highlight. This one's about judgment, not syntax.",
        hint: "\"Top\" by what? How many? The query can't be right until the question is.",
        options: [
          { id: "a", label: "Ask what \"top\" means — by revenue? by order count? how many?", note: "Pin the metric and the cutoff before writing anything." },
          { id: "b", label: "Run SELECT * FROM customers and send the whole list", note: "That's not 'top' anything — it dodges the actual question." },
          { id: "c", label: "Guess they mean top 10 by revenue and send it silently", note: "Might be right, might be wrong — and they'll never know which. Confirm first." },
          { id: "d", label: "Reply that the request is too vague to do", note: "It's answerable — you just need one clarifying question, not a refusal." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Exactly — one clarifying question saves an hour of building the wrong report. Nail the ask first."
      }
    ],

    mentor_outro:
      "Get the question right and the SQL is almost easy. One last habit — maybe the most important — before I cut you loose on the Predecessor's mess: never trust your own result until you've <b>sanity-checked</b> it."
  },

  /* ======================================================================== *
   * M10 — Sanity-check & say it
   * ======================================================================== */
  {
    id: "sanity_check",
    week: 2,
    day: 10,
    concept: { name: "Sanity-check & say it" },
    teaches_for: "the_ask",
    ask: "Read your own result with suspicion before you send it — then say it in one plain sentence.",
    reinforces: ["Aggregates", "Joining two tables", "The ask"],

    best_practice:
      "<b>A query that runs is not a query that's right.</b> Before you send a number, gut-check it: does the row count make sense? Did a join inflate the total? Could a NULL or a casing bug have dropped rows? Then say the answer in one sentence a human can repeat.",

    mentor_intro:
      "Last one, and it's the habit that separates analysts from query-typers: <b>distrust your own output</b>. SQL will happily hand you a confident, wrong number. Your job is to catch it before your stakeholder does — and then say what's true in plain English. Let me show you a result that looks fine and isn't.",

    teach: {
      explain:
        "Yesterday total revenue was about $665. Today you added a JOIN to bring in customer names, and suddenly it's <b>$1,180</b> — nearly double, with no new orders. That's not growth; that's a <b>fan-out</b>: the join matched some orders to multiple rows and counted their amounts twice. The number <i>ran</i>. It's still wrong. Sanity-check caught it; a careful analyst always asks \"does this size make sense?\"",
      example: {
        kind: "query",
        title: "revenue_after_join.sql",
        caption: "Looks like a great week. It isn't — the join double-counted:",
        sql: "SELECT SUM(o.amount)\nFROM orders AS o\nJOIN customers AS c\n  ON c.region = o.region",
        result: { columns: ["SUM(o.amount)"], rows: [[1180]] },
        resultNote: "≈ Double yesterday's $665, with zero new orders. Joining on region (not the unique key) fanned the rows out.",
        highlight: "result"
      },
      callout: "Gut-check every result: right row count? join inflation? dropped NULLs? Then say it in one plain sentence."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Your \"total revenue\" <b>doubled</b> right after you added a JOIN — no new orders. Most likely cause?",
        prompt: "The answer is highlighted. A clean total that suddenly inflates after a join has a classic culprit.",
        hint: "If a join matches one order to several rows, its amount gets added more than once.",
        options: [
          { id: "a", label: "The join fanned out — it matched rows on a non-unique key and double-counted amounts", note: "Classic fan-out: join on the wrong key duplicates rows and inflates SUM." },
          { id: "b", label: "Revenue genuinely doubled overnight", note: "With zero new orders? The data didn't change — the query did." },
          { id: "c", label: "SUM is unreliable and rounds up", note: "SUM is exact; the inflation came from duplicated rows, not the function." },
          { id: "d", label: "Adding any JOIN always doubles totals", note: "Only a bad join key does. A join on the unique key wouldn't inflate it." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Fan-out — the join matched on a non-unique column and counted amounts twice. You caught it before it shipped."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Your query returned <b>one row: region = West, customers = 3</b>. What's the honest way to <b>say it</b>?",
        prompt: "No highlight. Pick the sentence that states exactly what the result shows — no more.",
        hint: "Say only what the single row supports — not a trend, not a cause, not the other regions.",
        artifact: {
          kind: "query",
          title: "say_it.sql",
          sql: "SELECT region, COUNT(*) AS customers\nFROM customers\nWHERE region = 'West'\nGROUP BY region",
          result: { columns: ["region", "customers"], rows: [["West", 3]] }
        },
        options: [
          { id: "a", label: "\"We have 3 customers in the West region.\"", note: "States exactly what the row shows — nothing more, nothing inflated." },
          { id: "b", label: "\"The West is our biggest region with 3 customers.\"", note: "'Biggest' isn't supported — you only queried the West." },
          { id: "c", label: "\"Customers in the West are growing.\"", note: "Nothing here shows a trend over time." },
          { id: "d", label: "\"We have 3 customers total.\"", note: "That drops the WHERE — it's only the West, not the whole company." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Clean — you said exactly what the result supports and not a word more. That's how trust gets built."
      }
    ],

    mentor_outro:
      "That's the boot camp. You can read a query, filter, sort, aggregate, group, dodge NULLs, join — and, most of all, <b>distrust a number until it's earned your trust</b>. Now the real test: the Predecessor's drive. Every query they left runs clean and lies anyway. Go find out how. 🫥"
  }
];
