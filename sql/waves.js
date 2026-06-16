/* ============================================================================
 * Getting It Wrong Gets You There Faster (SQL) — WAVE DATA (on the job)
 * ----------------------------------------------------------------------------
 * The engine (engine.js) is GENERIC. All game content lives here as pure data.
 * To add a wave: push another object to WAVES. No engine changes required.
 *
 * The whole narrative arc — the Predecessor's tone shifting from mocking to
 * proud, ending in the reveal that they were YOU on day one — lives entirely
 * in `scenario.intro` and `feedback.win` / `feedback.fail`.
 *
 * Every wave reuses an Academy skill under the Predecessor's mess. Their queries
 * all RUN. They all lie anyway — a casing bug here, a missing GROUP BY there, a
 * NULL silently dropped, a join that double-counts. The job is to spot the lie.
 *
 * DOMAIN NOTE — interaction is kind:"select_option" over a kind:"query" artifact
 * (rendered by core.js renderQuery): you read the Predecessor's actual query and
 * its (wrong) result, then pick the fix. fail_check = the Predecessor's own
 * blunder, so choosing it earns the confession, not just a buzzer.
 *
 * SCHEMA (per wave)
 *   wave_id        number
 *   concept        { id, name, prereqs[] }
 *   ask            the stakeholder request driving the whole file (north star) —
 *                  constant, always visible above the per-step directive
 *   callbacks      [] ids of earlier concepts this wave makes you reuse
 *   scenario       { intro (Predecessor voice), artifact_ref }
 *   artifact       { kind:"query", title, sql, result, resultNote, caption }
 *   task           { kind, directive, prompt, checklist, options[], success_check,
 *                    fail_check, status:{win,fail,miss} }
 *   help           { tier1, tier2, tier3 }   <- pull-only, revealed one at a time
 *   feedback       { win, fail, miss }
 *   sets_up        [] ids of concepts this wave foreshadows
 *
 * CHECK EXPRESSIONS — tiny safe comparison strings ("selected_option == 'a'"),
 * evaluated against interaction state by a minimal tokenizer (no eval()).
 *
 * Database (same toy schema the Academy used):
 *   customers(customer_id, name, region, status, signup_date)
 *   orders(order_id, customer_id, amount, region, order_date)
 * ========================================================================== */

const WAVES = [
  /* ------------------------------------------------------------------------
   * WAVE 1 — Read before you run (applies M1 "Reading a query"). The
   * Predecessor's query is captioned "all our customers" — but a WHERE clause
   * quietly limits it to active ones. Interaction: select_option. The named
   * blunder (fail_check) = believing the caption instead of reading the query.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 1,
    concept: { id: "orient_query", name: "Read before you run", prereqs: [] },
    callbacks: [],
    ask: "Before you trust anything the Predecessor left, read their query and say what it ACTUALLY returns.",

    scenario: {
      intro:
        "Welcome to the team! Your predecessor — me — left in a hurry. Every query I ever ran is on this drive, helpfully named. First one: <code>all_customers.sql</code>. The comment says \"our full customer list.\" It's fine. Probably. …You're not going to just read the comment, are you. You're going to read the query. Ugh. Fine. Read it.",
      artifact_ref: "query_01.sql"
    },

    artifact: {
      kind: "query",
      title: "all_customers.sql",
      caption: "-- our full customer list (every customer we've got)",
      sql: "SELECT name, region, status\nFROM customers\nWHERE status = 'Active'",
      result: {
        columns: ["name", "region", "status"],
        rows: [["Acme Corp", "West", "Active"], ["Globex", "East", "Active"], ["Soylent", "North", "Active"]]
      },
      resultNote: "The Predecessor built three reports on top of this, calling it \"all customers.\""
    },

    best_practice:
      "<b>Read the whole query before you trust the label.</b> A WHERE clause five lines down can quietly change what \"all\" means. The comment is what someone hoped it did; the query is what it does.",

    task: {
      kind: "select_option",
      directive: "Read the query. What does it <b>actually</b> return — regardless of the comment?",
      prompt:
        "The comment claims it's \"every customer we've got.\" But there's a WHERE clause. Read top to bottom and say what really comes back.",
      checklist: [
        "Read every line — don't stop at the comment",
        "Find the WHERE clause and see what it filters on",
        "Decide what the result set really contains",
        "Pick the honest description, then <b>Confirm</b>"
      ],
      options: [
        { id: "a", label: "Only ACTIVE customers — churned ones are excluded", note: "The WHERE status = 'Active' silently drops everyone who churned." },
        { id: "b", label: "All customers, active and churned alike", note: "That's the comment's claim — but the WHERE clause says otherwise." },
        { id: "c", label: "Only customers in the West", note: "Region isn't filtered here — status is." },
        { id: "d", label: "One row per order", note: "This query is over customers, not orders." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ You read the query, not the comment. It's active customers only.",
        fail: "That's what the comment claims — but read the WHERE clause again.",
        miss: "Not quite. Look at what the WHERE clause filters on."
      }
    },

    help: {
      tier1: "Don't trust the green comment. What does the actual WHERE line restrict the rows to?",
      tier2: "<code>WHERE status = 'Active'</code> means churned customers never make it into the result — no matter what the label says.",
      tier3: "The comment says \"all customers,\" but the query only keeps rows where status is 'Active'. So it's active customers only. Pick that one."
    },

    feedback: {
      win:
        "…Huh. You read past my comment. I never did — I labeled this \"all customers\" and built a churn report on it that, ironically, couldn't see a single churned customer. Took me a quarter to notice. Okay. Maybe you'll actually fix this place. Next file.",
      fail:
        "\"All customers,\" right? That's what I wrote on it too. Then someone asked why our churned-customer count was zero. Turns out my \"all\" had a WHERE clause hiding underneath. The comment lied; the query never did. Read it again — what does that WHERE actually keep?",
      miss:
        "Close, but look again — the filter isn't on region or orders. It's on status. Want backup? Ask me."
    },

    sets_up: ["filter"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 2 — Filter honestly (applies M3 "Filtering with WHERE"). The
   * Predecessor filtered status = 'active' (lowercase) but the data stores it
   * as 'Active' — so the count came back 0 and they hand-typed a number into a
   * comment. Named blunder = the lowercase, case-mismatched predicate.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 2,
    concept: { id: "filter", name: "Filter honestly", prereqs: ["orient_query"] },
    callbacks: ["orient_query"],
    ask: "Sales wants a count of active customers. The Predecessor's query returns 0 — fix the filter so it tells the truth.",

    scenario: {
      intro:
        "Okay, you can read. Try this: <code>active_count.sql</code>. Sales wanted the number of active customers. My query came back <b>0</b>, which can't be right — so I, uh, typed \"~40\" into the comment and moved on. Don't look at me like that. Just figure out why it's zero.",
      artifact_ref: "query_02.sql"
    },

    artifact: {
      kind: "query",
      title: "active_count.sql",
      caption: "-- active customers ≈ 40 (query says 0, that's obviously wrong, using 40)",
      sql: "SELECT COUNT(*)\nFROM customers\nWHERE status = 'active'",
      result: { columns: ["COUNT(*)"], rows: [[0]] },
      resultNote: "0 rows — yet the customers table is full of Active accounts. The data stores status as 'Active' (capital A)."
    },

    best_practice:
      "<b>Match the data's exact casing.</b> Text comparisons are case-sensitive: <code>'active'</code> never matches <code>'Active'</code>. When a filter returns a suspiciously round 0, suspect a casing or spelling mismatch first.",

    task: {
      kind: "select_option",
      directive: "The count is <b>0</b> but it shouldn't be. Pick the fix that makes the filter match the data.",
      prompt:
        "The customers table stores status as <code>'Active'</code> with a capital A. The Predecessor searched for <code>'active'</code>. Which fix returns the real count?",
      checklist: [
        "Notice the result is 0 — a red flag, not a real answer",
        "Compare the WHERE value to how the data is actually stored",
        "Pick the predicate whose casing matches the data",
        "Confirm — and never hand-type a number again"
      ],
      options: [
        { id: "a", label: "WHERE status = 'Active'", note: "Matches the data's exact casing — the count comes back real." },
        { id: "b", label: "WHERE status = 'active'", note: "The Predecessor's bug: lowercase never matches 'Active' → 0 rows." },
        { id: "c", label: "WHERE status IS NULL", note: "Finds customers with NO status — the opposite of active." },
        { id: "d", label: "WHERE status = Active", note: "No quotes — SQL reads Active as a column name and errors out." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ Casing fixed. 'Active' matches the data — real count, no hand-typing.",
        fail: "That's the exact bug that returned 0. Lowercase 'active' can't match 'Active'.",
        miss: "Not quite — the fix is about matching how the data is actually stored."
      }
    },

    help: {
      tier1: "A filter that returns a clean 0 on a full table is almost always a mismatch, not an empty result.",
      tier2: "Look at the data: status is stored as <code>'Active'</code>. The query searched for <code>'active'</code>. SQL treats those as different strings.",
      tier3: "Capitalize it to match the data: <code>WHERE status = 'Active'</code>. That's the only option whose casing lines up with what's actually stored."
    },

    feedback: {
      win:
        "Capital A. Of course. I stared at that zero for an hour and then just… invented \"~40\" rather than question my own query. You questioned it in ten seconds. That's the whole difference, isn't it. On to the next.",
      fail:
        "Yeah, that's mine — lowercase 'active'. Looks fine, returns nothing, because the data says 'Active' and SQL is a stickler. The lesson cost me a credibility hit in a sales meeting. Match the casing the data actually uses.",
      miss:
        "Not that one — IS NULL finds customers with no status at all, and dropping the quotes just errors. You want the one that matches 'Active' exactly."
    },

    sets_up: ["aggregate"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 3 — Aggregate at the right grain (applies M5/M6). The Predecessor's
   * "revenue by region" has no GROUP BY, so the engine returns ONE row with the
   * grand total pinned to an arbitrary region — and they reported it as if the
   * West earned everything. Named blunder = leaving it as-is.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 3,
    concept: { id: "aggregate", name: "Aggregate at the right grain", prereqs: ["filter"] },
    callbacks: ["filter"],
    ask: "Finance wants revenue broken out by region. The Predecessor's query gives one number — make it one row per region.",

    scenario: {
      intro:
        "Finance asked for revenue <i>by region</i>. Here's what I sent them: <code>region_revenue.sql</code>. It returned one row — West, $665 — so I told them the West is carrying the whole company. They were… concerned. Something feels off but I couldn't tell you what. You probably can.",
      artifact_ref: "query_03.sql"
    },

    artifact: {
      kind: "query",
      title: "region_revenue.sql",
      caption: "-- revenue by region (West is crushing it??)",
      sql: "SELECT region, SUM(amount)\nFROM orders",
      result: { columns: ["region", "SUM(amount)"], rows: [["West", 665]] },
      resultNote: "$665 is the total across ALL regions — but it's mislabeled as West, because there's no GROUP BY to split it."
    },

    best_practice:
      "<b>\"By X\" means GROUP BY X.</b> Pairing a plain column with an aggregate but no GROUP BY collapses everything into one row and slaps an arbitrary label on it. The grand total isn't the West's total.",

    task: {
      kind: "select_option",
      directive: "Make this return revenue <b>per region</b> — one honest row for each region.",
      prompt:
        "Finance asked for revenue by region, but the query has no GROUP BY — so the $665 grand total got pinned to a single arbitrary region. Pick the fix.",
      checklist: [
        "Spot that the ask is \"by region\" — one row per region",
        "Notice there's no GROUP BY, so everything collapsed to one row",
        "Pick the clause that splits the total per region",
        "Confirm"
      ],
      options: [
        { id: "a", label: "Add GROUP BY region", note: "Splits the SUM into one row per region — the real breakdown." },
        { id: "b", label: "Leave it — West really did earn $665", note: "The Predecessor's blunder: $665 is the company total, not the West's." },
        { id: "c", label: "Add ORDER BY amount DESC", note: "Sorting one row does nothing — you still only have one row." },
        { id: "d", label: "Wrap it in COUNT(*)", note: "Counts rows; doesn't break revenue out by region." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ GROUP BY region added — now it's one true row per region.",
        fail: "That's the misread that worried Finance — $665 is the whole company, not the West.",
        miss: "Not quite — sorting or counting won't split the total by region."
      }
    },

    help: {
      tier1: "The ask says \"by region.\" How many rows should a real \"by region\" answer have — one, or one per region?",
      tier2: "There's no GROUP BY. With an aggregate and a plain column but no grouping, you get a single collapsed row with a meaningless label.",
      tier3: "Add <code>GROUP BY region</code>. That runs SUM(amount) once inside each region and returns one row per region — the breakdown Finance actually wanted."
    },

    feedback: {
      win:
        "There it is — GROUP BY. I sent Finance a 'West earns everything' chart built on a missing line of SQL. You'd have caught it before it left your outbox. I'm starting to think the problem with this drive was never the data.",
      fail:
        "I believed that $665 was the West too. It's the whole company's revenue, collapsed into one row because I forgot to GROUP BY — SQL just stapled the first region label it saw onto the grand total. \"By region\" needs a GROUP BY. Try again.",
      miss:
        "Sorting a single row sorts nothing; counting changes the question. You need the clause that splits the sum out per region."
    },

    sets_up: ["nulls"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 4 — Mind the NULLs (applies M7). The Predecessor's "customers outside
   * the West" used region != 'West', which silently drops customers whose
   * region is NULL — so the count is too low. Named blunder = the bare != .
   * ---------------------------------------------------------------------- */
  {
    wave_id: 4,
    concept: { id: "nulls", name: "Mind the NULLs", prereqs: ["aggregate"] },
    callbacks: ["filter", "aggregate"],
    ask: "Marketing wants every customer NOT confirmed to be in the West. The Predecessor's list is missing people — find out why.",

    scenario: {
      intro:
        "Marketing wanted everyone outside the West for a campaign. I ran <code>not_west.sql</code> — <code>region != 'West'</code>, easy. But the list came up short. A few accounts I KNOW exist just… aren't in it. I assumed the data was wrong. It's probably not the data, is it.",
      artifact_ref: "query_04.sql"
    },

    artifact: {
      kind: "query",
      title: "not_west.sql",
      caption: "-- everyone outside the West (list looks short?)",
      sql: "SELECT name, region\nFROM customers\nWHERE region != 'West'",
      result: {
        columns: ["name", "region"],
        rows: [["Globex", "East"], ["Soylent", "North"]]
      },
      resultNote: "Initech and Hooli have region = NULL (unknown). != 'West' silently drops them — NULL isn't 'not West', it's 'unknown'."
    },

    best_practice:
      "<b>A <code>!=</code> filter silently drops NULLs.</b> NULL means \"unknown,\" so SQL can't say it's <i>not</i> West either — those rows vanish. If unknowns should count, ask for them explicitly with <code>OR region IS NULL</code>.",

    task: {
      kind: "select_option",
      directive: "The list is missing customers whose region is <b>unknown (NULL)</b>. Pick the query that includes them.",
      prompt:
        "Marketing wants everyone not confirmed to be in the West — including customers whose region is blank. But <code>region != 'West'</code> drops NULL rows. Which fix brings them back?",
      checklist: [
        "Notice known accounts are missing from the result",
        "Recall that NULL ('unknown') fails a != comparison",
        "Pick the query that also pulls in the NULL-region rows",
        "Confirm"
      ],
      options: [
        { id: "a", label: "WHERE region != 'West' OR region IS NULL", note: "Keeps non-West rows AND the unknown-region rows the != dropped." },
        { id: "b", label: "WHERE region != 'West'", note: "The Predecessor's bug: != silently excludes every NULL-region customer." },
        { id: "c", label: "WHERE region = NULL", note: "Returns 0 rows — nothing equals NULL, ever." },
        { id: "d", label: "WHERE region IS NOT NULL", note: "Keeps only customers WITH a region — drops the unknowns and keeps the West. Wrong direction." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ NULLs included — the unknown-region customers are back in the list.",
        fail: "That's the bug — != 'West' silently drops every NULL-region row.",
        miss: "Not quite — think about what happens to the unknown (NULL) regions."
      }
    },

    help: {
      tier1: "Which customers are missing? Look at the ones whose region you can't see — what value is in that cell?",
      tier2: "Their region is NULL (unknown). <code>region != 'West'</code> can't return true for an unknown, so SQL drops those rows entirely.",
      tier3: "Spell out that unknowns count too: <code>WHERE region != 'West' OR region IS NULL</code>. That keeps the non-West rows and the NULL-region rows."
    },

    feedback: {
      win:
        "Of course — the NULLs. They weren't 'not West,' they were 'who knows,' and my != quietly threw them away. Marketing emailed half the list they should have. You added six characters and fixed it. I really did leave this place worse than I found it, huh.",
      fail:
        "Yeah — <code>region != 'West'</code>. Reads perfectly. Drops every customer whose region is NULL, because SQL won't claim an unknown is 'not West.' That's how my campaign list came up short. Bring the NULLs back in.",
      miss:
        "<code>= NULL</code> returns nothing and <code>IS NOT NULL</code> drops the wrong rows. You want the one that keeps non-West customers AND the unknown-region ones."
    },

    sets_up: ["join"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 5 — Join without lying (applies M8/M10) + THE REVEAL. The Predecessor's
   * quarterly revenue doubled because they joined orders to customers on region
   * (non-unique) instead of customer_id — a fan-out that double-counts amounts.
   * Named blunder = the region join. The win delivers the reveal.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 5,
    concept: { id: "join", name: "Join without lying", prereqs: ["nulls"] },
    callbacks: ["aggregate", "nulls"],
    ask: "The board needs Q3 revenue with customer names attached. The Predecessor's total is nearly double reality — find the bad join.",

    scenario: {
      intro:
        "Last one. The big one. The board wanted Q3 revenue <i>with customer names</i>, so I joined orders to customers and summed it up: <code>q3_revenue.sql</code>. Came out to <b>$1,180</b>. I was thrilled — best quarter ever! I sent it to the board. …Revenue did not actually double. Find out what I did. I think I need to know.",
      artifact_ref: "query_05.sql"
    },

    artifact: {
      kind: "query",
      title: "q3_revenue.sql",
      caption: "-- Q3 revenue w/ customer names — BEST QUARTER EVER 🎉",
      sql: "SELECT SUM(o.amount)\nFROM orders AS o\nJOIN customers AS c\n  ON c.region = o.region",
      result: { columns: ["SUM(o.amount)"], rows: [[1180]] },
      resultNote: "Real Q3 revenue is $665. Joining on region (many customers share a region) matched each order to several customers — counting its amount multiple times."
    },

    best_practice:
      "<b>Join on a unique key, or you'll double-count.</b> Joining on a column many rows share (like region) fans each row out into several — and any SUM after that is inflated. When a total jumps after adding a join, suspect the join key first.",

    task: {
      kind: "select_option",
      directive: "Revenue \"doubled\" the moment a JOIN was added. Pick the fix that stops the double-counting.",
      prompt:
        "Real Q3 revenue is $665; this query reports $1,180. The join is on <code>region</code> — which many customers share — so each order got matched to several rows and its amount summed more than once. What's the correct join?",
      checklist: [
        "Notice the total nearly doubled after a join — with no new orders",
        "Find the ON clause and check whether its key is unique",
        "Pick the join on the key that uniquely links an order to its customer",
        "Confirm"
      ],
      options: [
        { id: "a", label: "JOIN ... ON c.customer_id = o.customer_id", note: "The unique key — one order matches exactly one customer. No fan-out, real total." },
        { id: "b", label: "JOIN ... ON c.region = o.region", note: "The Predecessor's bug: many customers per region → each order counted several times." },
        { id: "c", label: "Drop the JOIN entirely", note: "Gets the right total, but loses the customer names the board asked for." },
        { id: "d", label: "LEFT JOIN ... ON c.region = o.region", note: "Still joins on region — still fans out and inflates the SUM." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ Joined on customer_id — one order, one customer. The total is honest again: $665.",
        fail: "That's the fan-out that doubled it — region isn't unique, so amounts got counted twice.",
        miss: "Not quite — the fix is about joining on a key that's unique per order."
      }
    },

    help: {
      tier1: "The total jumped with no new orders. That's not growth — a join multiplied your rows. Look at the ON clause.",
      tier2: "<code>ON c.region = o.region</code> matches every order to <i>every</i> customer in the same region. One order, several matches, its amount summed each time.",
      tier3: "Join on the key that's unique per order: <code>ON c.customer_id = o.customer_id</code>. One order links to exactly one customer, so nothing gets double-counted."
    },

    feedback: {
      win:
        "$665. There it is. I joined on region — region! — and turned a flat quarter into a fake record, then walked it into the boardroom. <br><br>…You want to know the worst part? I wasn't lazy. I was <i>you</i>. First week, eager, no one to check my work, certain my query was right because it ran. Every cursed file on this drive is just a mistake I made before anyone taught me to read my own SQL. <br><br>You taught yourself in two weeks. So here's the desk — it's yours now. Leave it better than I did. You already have. 🫥→🙂",
      fail:
        "Region. I joined on <i>region</i>. Every order matched every customer in that region and SQL dutifully summed each amount over and over. That's my $1,180 'record quarter' — a fan-out I marched into the boardroom. Join on the key that's actually unique per order.",
      miss:
        "Dropping the join loses the names the board wanted, and a LEFT JOIN on region still fans out. Find the join key that's unique to each order."
    },

    sets_up: []
  }
];
