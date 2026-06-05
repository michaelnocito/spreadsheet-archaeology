/* ============================================================================
 * Getting It Wrong Gets You There Faster (Tableau) — ACADEMY DATA (boot camp)
 * ----------------------------------------------------------------------------
 * Before you're handed the Predecessor's cursed workbook, you train. Your
 * mentor, SAM, walks you through Tableau calm and clean. Each lesson follows
 * "gradual release of responsibility":
 *
 *     TEACH  (I do)  — Sam shows a worked example, annotated
 *     GUIDED (we do) — you try it, hint shown, the answer softly highlighted
 *     SOLO   (you do)— you do it cold, no scaffold
 *
 * Help here is PUSHED (offered freely) — the opposite of the pull-only
 * "figure it out" help on the job. Novices need the worked example first.
 *
 * Lessons chain automatically: each module's outro links to the next, and the
 * LAST module hands the player off to the Job (engine.js). The chain is driven
 * purely by the order of LESSONS[] — no per-module "next" wiring needed.
 *
 * DOMAIN NOTE — why multiple-choice, not drag-and-drop: Tableau's real "doing"
 * is dragging pills onto shelves. Faithfully cloning that is costly and not
 * what teaches the *concepts*. For Tableau the skill that matters early is
 * judgment + workspace literacy (what goes where, dimension vs measure, which
 * chart) — so lessons SHOW a styled Tableau mockup (artifact kind:"viz") and
 * ask the player to make the call (kind:"select_option"). Recognition over
 * recall is more defensible here than it was for spreadsheets.
 *
 * SCHEMA (per lesson)
 *   id, week, day, concept:{name}, teaches_for
 *   ask        the standing GOAL for the whole module (north star) — constant
 *              across every step, always visible above the per-step directive
 *   reinforces []  ready-to-show names of earlier skills this module builds on
 *   best_practice  one durable habit (the 💡 Pro tip)
 *   mentor_intro
 *   teach   { explain, example:{ kind:"viz"|"sheet", …, highlight }, callout }
 *           example may also carry options:[{id,label,note?}] + answer to walk
 *           through the reasoning with the right choice pre-highlighted+locked.
 *   practice[]  { mode:"guided"|"solo", kind, task, prompt, hint?, artifact?,
 *                 options, success_check, praise }
 *               task = the one crisp directive (brief headline); prompt = context
 *               kind: "select_option" (also supports row/cell/column from core)
 *               artifact (optional) renders as read-only reference ABOVE the
 *               choices; for viz, artifact.highlight glows in guided mode.
 *   mentor_outro
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
  { week: 1, day: 1,  name: "The canvas",               teaches_for: "orient_workbook",  built: true },
  { week: 1, day: 2,  name: "Dimensions vs Measures",   teaches_for: "fix_aggregation",  built: true },
  { week: 1, day: 3,  name: "Your first chart",         teaches_for: "orient_workbook",  built: true },
  { week: 1, day: 4,  name: "Aggregation",              teaches_for: "fix_aggregation",  built: true },
  { week: 1, day: 5,  name: "The Marks card",           teaches_for: "declutter",        built: true },
  { week: 2, day: 6,  name: "Choosing the right chart", teaches_for: "misleading_chart", built: true },
  { week: 2, day: 7,  name: "Filters",                  teaches_for: "orient_workbook",  built: true },
  { week: 2, day: 8,  name: "Tidy the viz",             teaches_for: "declutter",        built: true },
  { week: 2, day: 9,  name: "The ask",                  teaches_for: "the_board_ask",    built: true },
  { week: 2, day: 10, name: "Dashboard & say it",       teaches_for: "the_board_ask",    built: true }
];

const LESSONS = [
  /* ======================================================================== *
   * M1 — The canvas  (the Tableau keystone, like "the grid" was for sheets)
   * ======================================================================== */
  {
    id: "the_canvas",
    week: 1,
    day: 1,
    concept: { name: "The canvas" },
    teaches_for: "orient_workbook",
    ask: "Learn the Tableau workspace — know which part of the screen builds which part of a chart.",

    best_practice:
      "Before you build anything, learn the <b>map of the screen</b>. In Tableau you don't type a chart — you drag fields onto <i>shelves</i>, and which shelf you pick is the whole game.",

    mentor_intro:
      "Hey — Sam. Welcome to the team. First thing in Tableau isn't a chart, it's the <b>workspace</b>. Four regions do all the work: your <b>Data pane</b> on the left, and three shelves — <b>Columns</b>, <b>Rows</b>, and the <b>Marks</b> card. Learn what each one does and everything else clicks. Five minutes. Let's go.",

    teach: {
      explain:
        "Here's a finished view. On the <b>left</b> is the <b>Data pane</b> — every field from your data lives here. Across the top is the <b>Columns</b> shelf (it controls the <i>horizontal</i> axis) and below it the <b>Rows</b> shelf (the <i>vertical</i> axis). I dragged <b>Region</b> to Columns and <b>SUM(Sales)</b> to Rows — that's what makes one bar per region, height = sales. The <b>Marks</b> card (bottom-left of the sheet) controls how the marks <i>look</i> — color, size, label. That's the entire canvas.",
      example: {
        kind: "viz",
        title: "Sales by Region — Superstore",
        dimensions: ["Region", "Category", "Segment", "Order Date"],
        measures: ["Sales", "Profit", "Quantity"],
        columns: [{ name: "Region", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        filters: [],
        marks: { type: "Bar", fields: [] },
        chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" }
      },
      callout: "Columns = horizontal axis. Rows = vertical axis. Marks = how it looks. Data pane = your fields."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Which shelf makes the bars get <b>taller or shorter</b> based on a number?",
        prompt: "You want bar height to reflect SUM(Sales). The answer is highlighted below so you can see where it lives.",
        hint: "Bar height is the <i>vertical</i> axis. Which shelf controls vertical?",
        artifact: {
          kind: "viz",
          title: "Sales by Region — Superstore",
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
          highlight: "rows"
        },
        options: [
          { id: "a", label: "Columns shelf", note: "Controls the horizontal axis (left–right)." },
          { id: "b", label: "Rows shelf", note: "Controls the vertical axis (up–down) — bar height." },
          { id: "c", label: "Filters shelf", note: "Limits what's shown; doesn't size the bars." },
          { id: "d", label: "Marks card", note: "Controls look — color, size, label — not the axis." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Rows shelf — the vertical axis. Put a measure there and its value becomes bar height."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "You want to <b>color each bar by Region</b>. Which part of the canvas does that?",
        prompt: "No highlight this time. Think about what changes the <i>look</i> of a mark versus what changes an axis.",
        hint: "Color isn't an axis — it's how a mark looks. Which region controls how marks look?",
        artifact: {
          kind: "viz",
          title: "Sales by Region — Superstore",
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" }
        },
        options: [
          { id: "a", label: "Drop Region on the Rows shelf", note: "That changes the vertical axis, not the color." },
          { id: "b", label: "Drop Region on Color in the Marks card", note: "The Marks card controls look — color, size, label." },
          { id: "c", label: "Drop Region on the Filters shelf", note: "That hides regions; it doesn't color them." },
          { id: "d", label: "Retype the chart title", note: "A title is just text — it changes nothing about the marks." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Exactly — Color lives on the Marks card. Axes go on shelves; looks go on Marks. You can read the canvas now."
      }
    ],

    mentor_outro:
      "That's the whole workspace. Data pane holds your fields; Columns and Rows are your two axes; Marks is how it looks. Next: the one distinction Tableau cares about more than any other — <b>dimensions vs measures</b>."
  },

  /* ======================================================================== *
   * M2 — Dimensions vs Measures  (blue/discrete vs green/continuous)
   * ======================================================================== */
  {
    id: "dims_vs_measures",
    week: 1,
    day: 2,
    concept: { name: "Dimensions vs Measures" },
    teaches_for: "fix_aggregation",
    ask: "Tell dimensions from measures on sight — the blue/green split that decides every chart.",
    reinforces: ["The canvas"],

    best_practice:
      "<b>Blue = dimension</b> (a category that slices your data). <b>Green = measure</b> (a number you add up). Tableau colors every field for you — trust the color, and sanity-check anything it got wrong.",

    mentor_intro:
      "Morning. Tableau splits every field into two buckets, and the color tells you which: <b>blue dimensions</b> are categories — Region, Category, Customer — they <i>slice</i> the data. <b>Green measures</b> are numbers you aggregate — Sales, Profit, Quantity — they get summed, averaged, counted. Get this and you'll predict what any chart will do before you build it.",

    teach: {
      explain:
        "Look at the Data pane. Everything <b>above</b> the line is <b>blue</b> — those are <b>Dimensions</b>: Region, Category, Segment, Order Date. They answer <i>\"by what?\"</i> — they break a number into groups. Everything <b>below</b> the line is <b>green</b> — <b>Measures</b>: Sales, Profit, Quantity. They answer <i>\"how much?\"</i> — Tableau aggregates them (SUM by default). Rule of thumb: if you'd add it up, it's a measure; if you'd group by it, it's a dimension.",
      example: {
        kind: "viz",
        title: "Superstore — Data pane",
        dimensions: ["Region", "Category", "Segment", "Order Date", "Customer Name"],
        measures: ["Sales", "Profit", "Quantity", "Discount"],
        highlight: "measures"
      },
      callout: "Blue = dimension (group by it). Green = measure (add it up). The color is Tableau telling you the type."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Which of these fields is a <b>measure</b> (a number you'd add up)?",
        prompt: "Use the colors in the Data pane below — the answer is highlighted so you can connect color to type.",
        hint: "A measure is green and gets aggregated. Which of these is a quantity you'd sum, not a category you'd group by?",
        artifact: {
          kind: "viz",
          title: "Superstore — Data pane",
          dimensions: ["Region", "Order Date", "Ship Mode"],
          measures: ["Profit"],
          highlight: "measures"
        },
        options: [
          { id: "a", label: "Region", note: "A category — you group by it. Blue dimension." },
          { id: "b", label: "Order Date", note: "A date used as a label/grouping here. Blue dimension." },
          { id: "c", label: "Profit", note: "A number you add up. Green measure." },
          { id: "d", label: "Ship Mode", note: "A category (Standard, Same Day…). Blue dimension." }
        ],
        success_check: "selected_option == 'c'",
        praise: "Profit — green, a number you aggregate. That's a measure. The other three slice the data; they're dimensions."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Tableau is showing <b>SUM(Order ID)</b> on the Rows shelf. What's the problem?",
        prompt: "Order ID is a number, so Tableau treated it as a green measure and summed it. No highlight — make the call.",
        hint: "Ask what the number <i>means</i>. Is adding up ID numbers a real total, or nonsense?",
        artifact: {
          kind: "viz",
          title: "Orders — by something?",
          dimensions: ["Region", "Customer Name"],
          measures: ["Sales", "Profit"],
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Order ID)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [70, 64, 58, 66], axis: "SUM(Order ID)" }
        },
        options: [
          { id: "a", label: "Nothing — bigger SUM(Order ID) means more sales", note: "No. Order ID is an identifier; its sum is meaningless." },
          { id: "b", label: "Order ID is really a dimension (an ID label); summing it is meaningless — convert it to a dimension", note: "Right. It's a number by accident, not a quantity to total." },
          { id: "c", label: "Switch the chart to a pie", note: "Chart type doesn't fix a nonsense measure." },
          { id: "d", label: "Add Order ID to Filters too", note: "Filtering nonsense still leaves it nonsense." }
        ],
        success_check: "selected_option == 'b'",
        praise: "Yes. An ID is a label that happens to be numeric — a dimension. Summing it produces a number that means nothing. Trust the color, but sanity-check the meaning."
      }
    ],

    mentor_outro:
      "That's the distinction the whole tool is built on. Blue groups, green aggregates — and when Tableau guesses wrong (like an ID), you catch it. Now let's put a dimension and a measure together and actually <b>build your first chart</b>."
  },

  /* ======================================================================== *
   * M3 — Your first chart  (field → shelf → bar)
   * ======================================================================== */
  {
    id: "first_chart",
    week: 1,
    day: 3,
    concept: { name: "Your first chart" },
    teaches_for: "orient_workbook",
    ask: "Build a basic bar chart from scratch — one dimension on Columns, one measure on Rows.",
    reinforces: ["The canvas", "Dimensions vs Measures"],

    best_practice:
      "A bar chart is just <b>one dimension + one measure</b>. Category on Columns, the number on Rows — Tableau draws the bars for you. Master this and you can build 80% of business charts.",

    mentor_intro:
      "You know the canvas and you know field types. Time to combine them. Almost every chart is a <b>dimension</b> (what you're comparing) crossed with a <b>measure</b> (the number). Let's build the most common one in the building: sales by category.",

    teach: {
      explain:
        "Here's the recipe. I dragged the dimension <b>Category</b> to <b>Columns</b> — that gives me one column per category. Then I dragged the measure <b>Sales</b> to <b>Rows</b> — Tableau aggregated it to <b>SUM(Sales)</b> and turned each into a bar whose height is total sales. Dimension across the bottom, measure up the side. That's a bar chart.",
      example: {
        kind: "viz",
        title: "Sales by Category — Superstore",
        dimensions: ["Category", "Region", "Segment"],
        measures: ["Sales", "Profit", "Quantity"],
        columns: [{ name: "Category", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        marks: { type: "Bar", fields: [] },
        chart: { type: "bar", cats: ["Furniture", "Office Supplies", "Technology"], vals: [72, 64, 88], axis: "SUM(Sales)" }
      },
      callout: "Dimension on Columns → bars across. Measure on Rows → bar height. That's the whole recipe."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "To get <b>one bar per Category</b>, where does the <b>Category</b> field go?",
        prompt: "You want categories spread across the bottom. The shelf that does that is highlighted below.",
        hint: "Categories across the bottom = the horizontal axis. Which shelf is that?",
        artifact: {
          kind: "viz",
          title: "Sales by Category — Superstore",
          columns: [{ name: "Category", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Furniture", "Office Supplies", "Technology"], vals: [72, 64, 88], axis: "SUM(Sales)" },
          highlight: "columns"
        },
        options: [
          { id: "a", label: "The Columns shelf", note: "Horizontal axis — one column (one bar) per category." },
          { id: "b", label: "The Rows shelf", note: "That's for the measure / bar height, not the category." },
          { id: "c", label: "The Filters shelf", note: "That would hide categories, not lay them out." },
          { id: "d", label: "The Marks card → Color", note: "That colors marks; it won't spread categories across." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Category on Columns — one bar per category, side by side. Now it needs a height."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Category is on Columns. What do you drop on <b>Rows</b> to set each bar's height to total sales?",
        prompt: "No highlight. Pick the field — and notice what Tableau will do to it.",
        hint: "Bar height = a number you total. Which field is the measure here, and how does Tableau aggregate it?",
        artifact: {
          kind: "viz",
          title: "Sales by Category — Superstore",
          dimensions: ["Category", "Region"],
          measures: ["Sales", "Profit"],
          columns: [{ name: "Category", role: "dim" }],
          rows: [],
          marks: { type: "Bar", fields: [] }
        },
        options: [
          { id: "a", label: "Sales (Tableau makes it SUM(Sales))", note: "A measure on Rows becomes the bar height, summed by default." },
          { id: "b", label: "Region", note: "Another dimension — that splits the view, it doesn't set height." },
          { id: "c", label: "Category again", note: "It's already on Columns; repeating it does nothing useful." },
          { id: "d", label: "Order Date", note: "A dimension — it would slice by date, not set bar height." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Sales on Rows → SUM(Sales) → bar height. You just built a chart from scratch: dimension across, measure up."
      }
    ],

    mentor_outro:
      "That's the core move you'll repeat a hundred times. One thing tripped you up already and it trips up everyone: that <b>SUM</b> Tableau slapped on Sales. Let's make sure you understand <b>aggregation</b> before it bites you."
  },

  /* ======================================================================== *
   * M4 — Aggregation  (SUM by default; reading SUM(Sales))
   * ======================================================================== */
  {
    id: "aggregation",
    week: 1,
    day: 4,
    concept: { name: "Aggregation" },
    teaches_for: "fix_aggregation",
    ask: "Understand that Tableau aggregates every measure — SUM by default — and know how to change it.",
    reinforces: ["Dimensions vs Measures", "Your first chart"],

    best_practice:
      "Drop a measure on a shelf and Tableau wraps it in an aggregation — <b>SUM by default</b>. <b>SUM(Sales)</b> means \"total sales for this slice.\" If you need an average or a count, change it on the pill — don't eyeball it.",

    mentor_intro:
      "Every time you put a measure on a shelf, Tableau quietly does math to it. By default it <b>sums</b>. That's why your pill read <b>SUM(Sales)</b>, not just Sales. Usually that's what you want — but when it isn't, getting it wrong here is how reports end up flat wrong. Let's read it correctly.",

    teach: {
      explain:
        "Look at the pill on Rows: <b>SUM(Sales)</b>. With <b>Region</b> on Columns, each bar is the <i>total</i> of every sale in that region added together. If I clicked that pill and switched it to <b>Average</b>, it would become <b>AVG(Sales)</b> — the typical order size, a totally different (and usually much smaller) number. Same field, different question. Always read the aggregation, not just the field name.",
      example: {
        kind: "viz",
        title: "Sales by Region — note the SUM",
        columns: [{ name: "Region", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        marks: { type: "Bar", fields: [] },
        chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
        highlight: "rows"
      },
      callout: "SUM(Sales) = all sales added up per region. AVG(Sales) would be the typical order. Read the wrapper."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "The Rows pill reads <b>SUM(Sales)</b>. What does each bar's height represent?",
        prompt: "Read the pill on the highlighted shelf and say what the height means.",
        hint: "SUM = added together. Added together across what — one order, or all of them in the region?",
        artifact: {
          kind: "viz",
          title: "Sales by Region — note the SUM",
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
          highlight: "rows"
        },
        options: [
          { id: "a", label: "The total of all sales in that region", note: "Correct — SUM adds every sale in the region together." },
          { id: "b", label: "The average order size in that region", note: "That would be AVG(Sales), a different pill." },
          { id: "c", label: "The number of orders in that region", note: "That would be COUNT, not SUM." },
          { id: "d", label: "The single biggest sale in that region", note: "That would be MAX(Sales)." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — SUM(Sales) is the regional total. The wrapper tells you the math, every time."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Your boss wants <b>average order value</b> by region, but the pill says <b>SUM(Sales)</b>. What do you do?",
        prompt: "No highlight. The fix is one click on the right thing — pick it.",
        hint: "You don't need a different field — you need a different aggregation on the same one.",
        artifact: {
          kind: "viz",
          title: "Sales by Region — needs to be an average",
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" }
        },
        options: [
          { id: "a", label: "Click the SUM(Sales) pill and change the aggregation to Average", note: "Same field, switch SUM → AVG. Exactly right." },
          { id: "b", label: "Divide the chart's numbers by 4 in your head", note: "That's not the average of anything — just wrong." },
          { id: "c", label: "Swap Sales for Profit", note: "Different field, still the wrong question." },
          { id: "d", label: "Add Region to Rows as well", note: "That restructures the view; it doesn't change the math." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Change the aggregation on the pill: SUM → Average. Same field, right question. This exact mix-up is waiting for you on the job."
      }
    ],

    mentor_outro:
      "Aggregation is where quiet mistakes live — summing something that should be averaged, or vice versa. You'll meet that on the job. Next, something more fun: making the chart actually <i>look</i> like something with the <b>Marks card</b>."
  },

  /* ======================================================================== *
   * M5 — The Marks card  (color / size / label / detail)
   * ======================================================================== */
  {
    id: "marks_card",
    week: 1,
    day: 5,
    concept: { name: "The Marks card" },
    teaches_for: "declutter",
    ask: "Use the Marks card to control how marks look — color, size, label, and detail.",
    reinforces: ["The canvas"],

    best_practice:
      "Shelves set the axes; the <b>Marks card</b> sets the look. Drop a field on <b>Color</b> to encode a category, on <b>Label</b> to print values on the marks, on <b>Size</b> to scale them. Encode meaning, not decoration.",

    mentor_intro:
      "Your axes are handled by Columns and Rows. Everything <i>else</i> about how a chart looks lives on the <b>Marks card</b>: Color, Size, Label, Detail. This is where a plain chart becomes a readable one — or an over-decorated mess. Let's use it on purpose.",

    teach: {
      explain:
        "Same bar chart, but now I dropped <b>Region</b> on <b>Color</b> in the Marks card — each bar is colored by its region, and Tableau adds a legend. I could drop <b>SUM(Sales)</b> on <b>Label</b> to print the number on each bar, or a measure on <b>Size</b> to scale marks (great for scatter plots and maps). Each Marks target answers a different \"how should this look?\" question.",
      example: {
        kind: "viz",
        title: "Sales by Region, colored by Region",
        columns: [{ name: "Region", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        marks: { type: "Bar", fields: [{ name: "Region", role: "dim", on: "Color" }] },
        chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
        highlight: "marks"
      },
      callout: "Color = encode a category. Label = print the value. Size = scale the mark. All on the Marks card."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "You want each bar's <b>sales value printed on the bar</b>. Which Marks target?",
        prompt: "It's one of the buttons on the highlighted Marks card. Pick the one that prints values.",
        hint: "You're not coloring or resizing — you're adding text that shows the number.",
        artifact: {
          kind: "viz",
          title: "Sales by Region",
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
          highlight: "marks"
        },
        options: [
          { id: "a", label: "Color", note: "Encodes a category by hue; doesn't print numbers." },
          { id: "b", label: "Size", note: "Scales the mark; doesn't print numbers." },
          { id: "c", label: "Label", note: "Prints the field's value right on each mark. Yes." },
          { id: "d", label: "Detail", note: "Adds granularity without color/size/label — no visible text." }
        ],
        success_check: "selected_option == 'c'",
        praise: "Label — drop SUM(Sales) there and the totals print on the bars."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "In a scatter plot you want each dot <b>sized by Profit</b>. Which Marks target?",
        prompt: "No highlight. Match the visual job to the Marks button.",
        hint: "Bigger profit → bigger dot. That's scaling, not coloring or labeling.",
        options: [
          { id: "a", label: "Size", note: "Scales each mark by the field's value. Bigger profit, bigger dot." },
          { id: "b", label: "Color", note: "Would tint dots, not scale them." },
          { id: "c", label: "Label", note: "Would print the number, not change the dot size." },
          { id: "d", label: "The Rows shelf", note: "That's an axis, not a Marks property." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Size — Profit on Size scales every dot. Color, Size, Label, Detail: four different jobs, all on the Marks card."
      }
    ],

    mentor_outro:
      "That's week one: the canvas, field types, building a chart, aggregation, and the Marks card. You can <i>make</i> charts now. Week two is about making the <b>right</b> ones — starting with <b>which chart to even use</b>."
  },

  /* ======================================================================== *
   * M6 — Choosing the right chart  (bar / line / scatter; when NOT to pie)
   * ======================================================================== */
  {
    id: "chart_choice",
    week: 2,
    day: 6,
    concept: { name: "Choosing the right chart" },
    teaches_for: "misleading_chart",
    ask: "Pick the chart type that fits the question — and know when a pie chart hurts more than helps.",
    reinforces: ["Your first chart"],

    best_practice:
      "<b>Bars</b> compare categories. <b>Lines</b> show change over time. <b>Scatter</b> shows the relationship between two measures. <b>Pies</b> only work for 2–3 slices — past that, a bar is clearer every time.",

    mentor_intro:
      "Tableau will happily build a terrible chart if you ask for one. The skill now isn't <i>can</i> you build it — it's <i>should</i> you. Match the chart to the question: comparing categories, tracking time, or relating two numbers. And about pie charts… we need to talk.",

    teach: {
      explain:
        "Three workhorses. <b>Comparing categories?</b> Bar chart — the eye reads bar length precisely. <b>Tracking something over time?</b> Line chart — it shows the trend at a glance. <b>Relating two measures</b> (say Sales vs Profit)? Scatter plot. The pie chart? Humans are bad at comparing angles, so a 12-slice pie is unreadable. Two or three slices, fine. More than that — use a bar.",
      example: {
        kind: "viz",
        title: "Right tool: bar to compare categories",
        columns: [{ name: "Category", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        marks: { type: "Bar", fields: [] },
        chart: { type: "bar", cats: ["Furniture", "Office Supplies", "Technology"], vals: [72, 64, 88], axis: "SUM(Sales)" }
      },
      callout: "Bars compare. Lines trend over time. Scatter relates two measures. Pies: 2–3 slices max."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "You're comparing total sales across <b>8 product categories</b>. Pie or bar?",
        prompt: "Think about what the eye can actually read. The reference below shows the cleaner option.",
        hint: "Eight slices of a pie means comparing eight angles. Eight bars means comparing eight lengths. Which is easier?",
        artifact: {
          kind: "viz",
          title: "8 categories compared",
          columns: [{ name: "Sub-Category", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Chairs", "Phones", "Tables", "Binders", "Copiers", "Paper", "Storage", "Art"], vals: [88, 80, 64, 58, 70, 40, 52, 30], axis: "SUM(Sales)" }
        },
        options: [
          { id: "a", label: "Bar chart", note: "Eight lengths are easy to compare and rank." },
          { id: "b", label: "Pie chart", note: "Eight angles are nearly impossible to compare accurately." },
          { id: "c", label: "A single big number", note: "That hides the comparison entirely." },
          { id: "d", label: "A line chart", note: "Lines are for time/order, not unordered categories." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Bar chart. Beyond a few slices, pies fall apart — bars let the eye compare lengths and rank instantly."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "You're showing <b>monthly sales over two years</b>. Which chart?",
        prompt: "No reference this time. Match the question — change over time — to the chart.",
        hint: "What shows a trend across a continuous timeline best?",
        options: [
          { id: "a", label: "Line chart", note: "Time on the axis, a line shows the trend and seasonality." },
          { id: "b", label: "Pie chart", note: "A pie can't show change over time at all." },
          { id: "c", label: "A bar per month (24 bars)", note: "Workable, but a line reads the trend far better over time." },
          { id: "d", label: "Scatter plot", note: "Scatter relates two measures; it's not for a timeline." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Line chart — built for change over time. You're now choosing charts, not just making them."
      }
    ],

    mentor_outro:
      "Good instincts. The Predecessor never had them — there's a 12-slice pie on the drive that'll make you wince. Next: stop showing everything at once. Let's talk <b>filters</b>."
  },

  /* ======================================================================== *
   * M7 — Filters  (and what a filter does / doesn't change)
   * ======================================================================== */
  {
    id: "filters",
    week: 2,
    day: 7,
    concept: { name: "Filters" },
    teaches_for: "orient_workbook",
    ask: "Limit what a view shows with filters — and understand what a filter does and doesn't change.",
    reinforces: ["The canvas"],

    best_practice:
      "Drag a field to the <b>Filters shelf</b> to limit what's shown. A filter changes <i>which rows appear in the view</i> — it never edits or deletes the underlying data. Remove the filter and everything's back.",

    mentor_intro:
      "Most real questions are about a <i>slice</i> — this region, this year, this segment. That's what the <b>Filters shelf</b> is for. It's powerful and safe: it changes the view, not the data. But people panic the first time, thinking they deleted something — so let's get it straight.",

    teach: {
      explain:
        "I dragged <b>Region</b> to the <b>Filters</b> shelf and kept only <b>West</b>. Now the view shows just West — the other regions are hidden, not gone. The data source still has every region; I've just narrowed what this sheet displays. Clear the filter and Central, East, and South reappear instantly. Filters shape the question; they don't touch the data.",
      example: {
        kind: "viz",
        title: "Sales — filtered to West only",
        filters: [{ name: "Region: West", role: "dim" }],
        columns: [{ name: "Region", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        marks: { type: "Bar", fields: [] },
        chart: { type: "bar", cats: ["West"], vals: [96], axis: "SUM(Sales)" },
        highlight: "filters"
      },
      callout: "Filters shelf = limit what's shown. The data source is untouched — clear the filter and it's all back."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "You only want the view to show the <b>West</b> region. Where does Region go?",
        prompt: "The shelf that limits what's shown is highlighted below.",
        hint: "You're not setting an axis or a color — you're choosing which rows are allowed into the view.",
        artifact: {
          kind: "viz",
          title: "Show West only",
          filters: [],
          columns: [{ name: "Region", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
          highlight: "filters"
        },
        options: [
          { id: "a", label: "The Filters shelf (keep only West)", note: "Limits the view to the West region. Exactly." },
          { id: "b", label: "The Columns shelf", note: "That lays regions out as an axis; it won't drop the others." },
          { id: "c", label: "The Marks card → Color", note: "That tints regions; all four still show." },
          { id: "d", label: "Delete the other regions from the data", note: "Never — and unnecessary. A filter does this safely." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Region on Filters, keep West — the view narrows, the data stays whole."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "After filtering to West, a teammate asks: <b>did we delete the other regions' data?</b>",
        prompt: "No reference. Answer what a filter actually does.",
        hint: "A filter limits the <i>view</i>. Did anything happen to the source?",
        options: [
          { id: "a", label: "No — a filter only hides them from this view; the data is untouched", note: "Correct. Clear the filter and every region returns." },
          { id: "b", label: "Yes — filtering removes those rows from the data source", note: "No. Filters never edit or delete source data." },
          { id: "c", label: "Yes, but only until you save", note: "No — there's no deletion happening at all." },
          { id: "d", label: "Only if you used a context filter", note: "No — no filter type deletes source data." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — filters are safe. They shape what a sheet shows; the data source is never harmed."
      }
    ],

    mentor_outro:
      "Now you can focus a view on exactly the slice that answers the question. Two left. Next: making a finished view <b>clean</b> — titles, labels, and killing the clutter."
  },

  /* ======================================================================== *
   * M8 — Tidy the viz  (titles, labels, kill chartjunk)
   * ======================================================================== */
  {
    id: "tidy_viz",
    week: 2,
    day: 8,
    concept: { name: "Tidy the viz" },
    teaches_for: "declutter",
    ask: "Make a view readable on its own — a plain-language title, clear labels, and no chartjunk.",
    reinforces: ["The Marks card"],

    best_practice:
      "A good viz explains itself: a <b>plain-language title</b> that states the takeaway, labeled axes, and <b>nothing decorative</b> fighting the data. If an element doesn't help someone read it, remove it.",

    mentor_intro:
      "A chart that's correct but confusing still fails. The last 10% — a real title, sensible labels, no clutter — is what separates a working analyst from someone who just makes charts. Tableau's defaults are okay, not great. Let's tidy.",

    teach: {
      explain:
        "Two versions of the same chart. The messy one is titled <b>\"Sheet 1\"</b>, has heavy gridlines, a drop shadow, and a rainbow of colors that mean nothing. The clean one is titled <b>\"Technology leads Q3 sales\"</b> — a plain-language takeaway — with light gridlines and one accent color. Same data, but the clean one a stakeholder can read in two seconds. Decoration that doesn't carry meaning is <b>chartjunk</b>; cut it.",
      example: {
        kind: "viz",
        title: "Technology leads Q3 sales",
        columns: [{ name: "Category", role: "dim" }],
        rows: [{ name: "SUM(Sales)", role: "measure" }],
        marks: { type: "Bar", fields: [] },
        chart: { type: "bar", cats: ["Furniture", "Office Supplies", "Technology"], vals: [72, 64, 88], axis: "SUM(Sales)" }
      },
      callout: "Title states the takeaway. Labels are clear. No decoration competes with the data. That's a clean viz."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Your chart is titled <b>\"Sheet 1\"</b>. What's the best fix?",
        prompt: "The reference below shows what a good title looks like. Pick the same approach.",
        hint: "A title should tell the reader what they're looking at — ideally the takeaway, in plain words.",
        artifact: {
          kind: "viz",
          title: "Technology leads Q3 sales",
          columns: [{ name: "Category", role: "dim" }],
          rows: [{ name: "SUM(Sales)", role: "measure" }],
          marks: { type: "Bar", fields: [] },
          chart: { type: "bar", cats: ["Furniture", "Office Supplies", "Technology"], vals: [72, 64, 88], axis: "SUM(Sales)" }
        },
        options: [
          { id: "a", label: "Rename it to a plain-language takeaway, e.g. \"Technology leads Q3 sales\"", note: "A title that states what the chart shows. Yes." },
          { id: "b", label: "Leave it — \"Sheet 1\" is fine internally", note: "It tells the reader nothing; always retitle." },
          { id: "c", label: "Delete the title entirely", note: "Better than 'Sheet 1', but a good title adds real value." },
          { id: "d", label: "Make the title huge and bright red", note: "Loud isn't clear — that's just more noise." }
        ],
        success_check: "selected_option == 'a'",
        praise: "A plain-language title doing the explaining for you. That's the habit."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Which of these makes a chart <b>harder</b> to read?",
        prompt: "No reference. Spot the chartjunk.",
        hint: "Which choice adds decoration that carries no meaning?",
        options: [
          { id: "a", label: "A rainbow of colors and a 3-D drop shadow on the bars", note: "Pure chartjunk — decoration with no meaning, fighting the data." },
          { id: "b", label: "A clear axis label", note: "That helps readability." },
          { id: "c", label: "A plain-language title", note: "That helps readability." },
          { id: "d", label: "Sorting the bars largest to smallest", note: "That helps — it makes the ranking obvious." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Right — gratuitous color and 3-D are chartjunk. Cut anything that doesn't help someone read the data."
      }
    ],

    mentor_outro:
      "You can build clean, correct, well-chosen views now. The last skill is the one that makes all the others matter: <b>getting the ask right</b> and saying what you found. Final module."
  },

  /* ======================================================================== *
   * M9 — The ask  (clarify a vague request before building)
   * ======================================================================== */
  {
    id: "the_ask",
    week: 2,
    day: 9,
    concept: { name: "The ask" },
    teaches_for: "the_board_ask",
    ask: "Turn a vague stakeholder request into a precise, buildable question before you touch Tableau.",
    reinforces: ["Choosing the right chart"],

    best_practice:
      "Before building, restate the ask as a precise question: <b>which measure, which dimension, what time frame, compared to what.</b> Most wrong dashboards come from a vague ask nobody clarified.",

    mentor_intro:
      "Here's the secret the tooltips won't tell you: the hardest part of this job isn't Tableau, it's figuring out what people actually want. \"Show me how sales are doing\" can mean ten different charts. Build the wrong one and you've wasted a day. So before you build — <b>clarify</b>.",

    teach: {
      explain:
        "A stakeholder says: <b>\"Show me how sales are doing.\"</b> That's not buildable yet. Doing compared to <i>what</i> — last year? Target? Total sales or profit? Which time frame, which region? The move is to turn it into one precise sentence first, e.g. <b>\"Monthly total sales for 2024 vs 2023, by region.\"</b> Now you know exactly what to build — measure, dimension, time frame, comparison, all pinned down.",
      callout: "Vague ask → precise question (measure + dimension + time frame + comparison) → then build."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "Your boss says \"<b>show me how sales are doing.</b>\" What's the best first move?",
        prompt: "There's no chart to build yet. Pick the move a careful analyst makes first.",
        hint: "\"Doing\" is undefined. Before building anything, what should you pin down?",
        options: [
          { id: "a", label: "Ask a clarifying question — which measure, time frame, and comparison?", note: "Pin the ask down before building. Exactly right." },
          { id: "b", label: "Build total sales by month and hope it's what they meant", note: "Guessing — this is how the wrong dashboard gets made." },
          { id: "c", label: "Build all twelve possible charts and let them choose", note: "Wastes a day and still dodges the real question." },
          { id: "d", label: "Reply that the request is too vague to do", note: "Clarifying is the job; refusing isn't." }
        ],
        success_check: "selected_option == 'a'",
        praise: "Clarify first. One good question saves a day of building the wrong thing."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Which restatement is <b>precise enough to build from</b>?",
        prompt: "No hint card. Pick the one with measure, dimension, time frame, and comparison all nailed down.",
        hint: "A buildable ask leaves no \"compared to what?\" or \"over what period?\" unanswered.",
        options: [
          { id: "a", label: "\"Monthly total sales for 2024 vs 2023, broken out by region.\"", note: "Measure, time frame, comparison, and dimension — all pinned. Buildable." },
          { id: "b", label: "\"How are sales trending lately?\"", note: "\"Lately\" and \"trending\" are still undefined." },
          { id: "c", label: "\"Are we doing better than before?\"", note: "Better at what, vs when? Still vague." },
          { id: "d", label: "\"Give me the sales picture.\"", note: "No measure, no time frame, no comparison — not buildable." }
        ],
        success_check: "selected_option == 'a'",
        praise: "That one you could build without a single follow-up. A precise ask is half the work done."
      }
    ],

    mentor_outro:
      "Clarify the ask, build the right view, say it plainly — that's the whole job. One more module and you're off the training wheels: putting it together in a <b>dashboard</b> and communicating it honestly."
  },

  /* ======================================================================== *
   * M10 — Dashboard & say it  (assemble + communicate with caveats) — LAST
   * ======================================================================== */
  {
    id: "dashboard_say_it",
    week: 2,
    day: 10,
    concept: { name: "Dashboard & say it" },
    teaches_for: "the_board_ask",
    ask: "Combine sheets into one dashboard and state the takeaway honestly — caveats included.",
    reinforces: ["The ask", "Tidy the viz"],

    best_practice:
      "A dashboard is a few sheets answering <b>one question</b>, led by a headline takeaway. Always say what it shows <i>and</i> what it doesn't — naming the caveat is what makes stakeholders trust you.",

    mentor_intro:
      "Last one. A dashboard isn't \"all my charts on one screen\" — it's a small set that answers a single question, with a clear headline. And the real pro move isn't the charts; it's how you <i>talk</i> about them. Honest caveats beat confident spin every time. Let's finish.",

    teach: {
      explain:
        "A good dashboard leads with a <b>headline takeaway</b> — \"Sales up 18% YoY, driven by Technology\" — then a couple of supporting views (the trend line, the regional breakdown), all answering one question. And when you present it, you flag the catch: if this month's data is partial, you <i>say so</i>. \"Sales look up 20%, but note March is only half-reported.\" That sentence is the difference between a trusted analyst and a burned one.",
      callout: "Dashboard = a few views, one question, a headline takeaway. Saying it = the finding PLUS the caveat."
    },

    practice: [
      {
        mode: "guided",
        kind: "select_option",
        task: "What belongs <b>at the top</b> of a dashboard?",
        prompt: "Think about what a busy executive should read first. Pick the lead element.",
        hint: "Before any chart, what's the one thing the reader should get in two seconds?",
        options: [
          { id: "a", label: "A clear headline takeaway in plain language", note: "Lead with the answer; the charts back it up. Yes." },
          { id: "b", label: "The biggest, most colorful chart", note: "Visual weight isn't the message — start with the takeaway." },
          { id: "c", label: "A legend and a filter panel", note: "Useful, but not the first thing the reader needs." },
          { id: "d", label: "The data source connection details", note: "That's metadata, not what the audience came for." }
        ],
        success_check: "selected_option == 'a'",
        praise: "A headline takeaway up top — the reader gets the point, then the charts prove it."
      },
      {
        mode: "solo",
        kind: "select_option",
        task: "Your dashboard shows sales <b>up 20%</b>, but the latest month is only half-reported. What do you tell the board?",
        prompt: "No hint. This is the moment that defines whether they trust you.",
        hint: "The honest move names the catch up front, even though it makes the number look less shiny.",
        options: [
          { id: "a", label: "\"Sales are up 20%, but note the latest month is only half-reported, so the real figure will be lower.\"", note: "Finding plus caveat. This is exactly the trusted-analyst move." },
          { id: "b", label: "\"Sales are up 20%!\" — and leave it there", note: "Technically from the chart, but it misleads. You'll get burned." },
          { id: "c", label: "Quietly drop the partial month so the trend looks clean", note: "Hiding the caveat is how the Predecessor's reports went wrong." },
          { id: "d", label: "Wait until the month is complete and say nothing now", note: "Stalling isn't communicating; flag the caveat and report." }
        ],
        success_check: "selected_option == 'a'",
        praise: "The finding AND the caveat. That honesty is the whole job — and it's exactly what the analyst before you never learned."
      }
    ],

    mentor_outro:
      "That's onboarding — ten skills, start to finish. You can read the canvas, build the right chart cleanly, and say what's true. Now the part I can't train you for: the <b>Predecessor's drive</b>. It's a mess, and it's waiting. Go leave it better than you found it."
  }
];
