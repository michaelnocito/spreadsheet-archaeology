/* ============================================================================
 * Getting It Wrong Gets You There Faster (Tableau) — WAVE DATA (the job)
 * ----------------------------------------------------------------------------
 * The engine (engine.js) is GENERIC. All game content lives here as pure data.
 * To add a wave: push another object to WAVES. No engine changes required.
 *
 * The whole narrative arc — the Predecessor's tone shifting from mocking to
 * proud — lives entirely in `scenario.intro` and `feedback.win`/`feedback.fail`.
 * Artifacts are inlined (no fetch) so the game runs from file:// and GH-Pages.
 *
 * FULL 5-wave arc (ALL BUILT — the Predecessor's tone shifts mocking → proud):
 *   W1 Orient the inherited workbook  — which sheet/source is the real one
 *   W2 Fix the aggregation            — SUM(Order ID) nonsense (M2 + M4)
 *   W3 Fix the misleading chart       — truncated y-axis manufactured growth (M6)
 *   W4 De-clutter the dashboard       — 40 sheets, over-stuffed Marks (M5 + M8)
 *   W5 The board ask                  — clarify + verify → THE REVEAL (M9 + M10)
 *
 * SCHEMA (per wave)
 *   wave_id        number
 *   concept        { id, name, prereqs[] }
 *   ask            the stakeholder request driving the whole file (north star)
 *   callbacks      [] ids of earlier concepts this wave makes you reuse
 *   scenario       { intro (Predecessor voice) }
 *   artifact       optional — { kind:"sheet"|"viz", … } read-only reference
 *   task           { kind, directive, prompt, options?, success_check,
 *                    fail_check?, status?{win,fail,miss} }
 *                  kind: "select_option" | "select_row" | "select_column" | "select_cell"
 *   help           { tier1, tier2, tier3 }   <- pull-only, revealed one at a time
 *   feedback       { win, fail, miss? }
 *   sets_up        [] ids of concepts this wave foreshadows
 *
 * CHECK EXPRESSIONS — tiny safe comparisons (no eval): == != >= <= > <
 * ========================================================================== */

const WAVES = [
  {
    wave_id: 1,
    concept: { id: "orient_workbook", name: "Orient the inherited workbook", prereqs: [] },
    callbacks: [],
    ask: "Before you trust a single number, find which sheet is the real source you should build from.",

    scenario: {
      intro:
        "Welcome to the team! Your predecessor — me — left in a hurry. This is the workbook everything ran on: Q3_dashboard_FINAL_v4 (use this one).twbx. It's got… a few tabs. Okay, eleven tabs. Before you build anything on top of it: which sheet is the <b>actual data source</b>, not a copy or a dashboard or one of my notes-to-self?"
    },

    best_practice:
      "<b>Orient before you build.</b> In an inherited workbook, find the sheet wired to the live data <i>source</i> first — dashboards and stray duplicates are built on top of it, and any of them can be stale.",

    task: {
      kind: "select_option",
      directive: "Pick the sheet that's the <b>real data source</b> to build from.",
      prompt:
        "The tabs along the bottom: 「Dashboard FINAL v3」 · 「Sheet1 (2)」 · 「Orders (Superstore extract)」 · 「use this one!!」. Which one is the source the rest should be built on?",
      options: [
        { id: "a", label: "Dashboard FINAL v3", note: "A dashboard — it's assembled FROM other sheets, not a source itself." },
        { id: "b", label: "Sheet1 (2)", note: "A stray duplicate Tableau auto-named. No telling what's in it." },
        { id: "c", label: "Orders (Superstore extract)", note: "The sheet wired to the actual data extract — the real source." },
        { id: "d", label: "use this one!!", note: "My sticky-note tab. Trust me: past-me's confidence is not a data source." }
      ],
      success_check: "selected_option == 'c'",
      fail_check: "selected_option == 'd'",
      status: {
        win: "✅ Right call — you found the live source before trusting anything built on it.",
        fail: "Not that one — but now you know why. Try again.",
        miss: "Not quite. Find the sheet tied to the actual data extract."
      }
    },

    help: {
      tier1: "A dashboard isn't a source — it's a display built from other sheets. And a tab named after my mood isn't one either.",
      tier2: "The real source is the sheet connected to the data <i>extract</i> — the one with the actual Orders rows behind it.",
      tier3: "Look at the tab names. 'Dashboard FINAL v3' is a display. 'Sheet1 (2)' is a duplicate. 'use this one!!' is me yelling. 'Orders (Superstore extract)' is the one wired to real data — pick that."
    },

    feedback: {
      win:
        "…Huh. You went straight to the extract instead of the tab I literally labeled 'use this one'. Smart. That sticky-note tab? Stale since spring. I built three reports on it and never noticed. Maybe you'll actually fix this place. Next file.",
      fail:
        "'use this one!!' — yeah, that was me, very sure of myself. It was a copy I forgot to update. Whole Q3 number was off because of it. Good news: now you know not to trust a confident tab name. Find the sheet with real data behind it.",
      miss:
        "Close, but that's not the source. A dashboard or a duplicate isn't where the data lives. Want backup? Ask me."
    },

    sets_up: ["fix_aggregation"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 2 — Fix the aggregation (applies Academy M2 "Dimensions vs Measures"
   * + M4 "Aggregation"). Judgment call → select_option over a viz mockup.
   * The Predecessor dropped Order ID on Rows, Tableau summed the ID numbers
   * (green measure by accident), and they shipped that giant nonsense number
   * as "order volume." Named blunder (fail_check) = trusting bigger-SUM.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 2,
    concept: { id: "fix_aggregation", name: "Fix the aggregation", prereqs: ["orient_workbook"] },
    callbacks: ["orient_workbook"], // orient the workbook first, then fix the math
    ask: "The board wants order counts by region — make the number actually mean something.",

    scenario: {
      intro:
        "File two. The 'Order Volume by Region' view — the one in every board deck. Confession: I dragged <b>Order ID</b> onto Rows, Tableau turned it green and showed <b>SUM(Order ID)</b>, and the bars were <i>huge</i>. Looked great. I called it order volume and nobody blinked. …It was summing the ID numbers. Order #5,000,001 plus #5,000,002 and so on. The 'volume' was nonsense. One of these pills is lying to the board — what's the fix?"
    },

    best_practice:
      "Before you trust a measure, read what Tableau is <b>aggregating</b> and whether that math means anything. An <b>ID is a dimension wearing a number costume</b> — <code>SUM</code> of it is meaningless. Counting orders is <code>COUNT</code>, not <code>SUM</code> of the ID.",

    artifact: {
      kind: "viz",
      title: "Order Volume by Region — Q3 (board deck)",
      dimensions: ["Region", "Customer Name", "Order Date"],
      measures: ["Sales", "Profit", "Quantity"],
      columns: [{ name: "Region", role: "dim" }],
      rows: [{ name: "SUM(Order ID)", role: "measure" }],
      marks: { type: "Bar", fields: [] },
      chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [98, 91, 84, 95], axis: "SUM(Order ID)" },
      highlight: "rows"
    },

    task: {
      kind: "select_option",
      directive: "Pick the fix that makes the 'order volume' number <b>real</b>.",
      prompt:
        "The Rows pill reads <b>SUM(Order ID)</b> and the bars are enormous. The board thinks that's how many orders each region placed. What do you do?",
      options: [
        { id: "a", label: "Order ID is an identifier — make it a dimension and use COUNT (distinct) of orders, not SUM", note: "An ID is a label that happens to be numeric. Counting orders is COUNT, not a sum of ID numbers." },
        { id: "b", label: "Leave it — a bigger SUM(Order ID) means more orders", note: "No. Summing ID numbers produces a giant number that means nothing about volume." },
        { id: "c", label: "Switch the chart to a pie so the numbers look smaller", note: "Chart type can't fix a measure that's nonsense." },
        { id: "d", label: "Divide SUM(Order ID) by a million to make it readable", note: "A tidier nonsense number is still nonsense." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ You read the aggregation and caught it — an ID isn't a quantity.",
        fail: "That's the exact pill that fooled the board. Try again.",
        miss: "That doesn't fix the math. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "Read the pill, not the bar height. <b>SUM(Order ID)</b> — does adding ID numbers together describe anything real?",
      tier2: "Tableau made Order ID green and summed it because it's stored as a number. But it's an <i>identifier</i> — a dimension. To count orders you want <code>COUNT</code>, not <code>SUM</code>.",
      tier3: "Convert Order ID to a dimension and count it (distinct count of orders) instead of summing the ID numbers. Option a."
    },

    feedback: {
      win:
        "…COUNT, not SUM. Of course. Tableau saw a number and summed it, and I never asked whether the math meant anything. The board spent a quarter thinking 'East does 91 million orders.' You caught in one read what I missed in twelve decks. Okay. You're better at this than I was. Next file.",
      fail:
        "Bigger SUM = more orders — yeah, that's exactly what I told myself. It's adding up ID numbers. #5000001 + #5000002… the total is meaningless. Read the aggregation: it's a count of orders you want, not a sum of an ID.",
      miss:
        "Nope — that leaves the nonsense in place. The trick is what Tableau is <i>aggregating</i>: an ID shouldn't be summed at all. Want backup? Ask me."
    },

    sets_up: ["misleading_chart"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 3 — Fix the misleading chart (applies Academy M6 "Choosing the right
   * chart"). select_option over a viz mockup. The Predecessor truncated the
   * y-axis so a 2% rise looked like sales tripled. Named blunder (fail_check)
   * = keeping the dramatic truncated version because it "looks impressive."
   * The viz deliberately renders two wildly different bars — that's the lie.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 3,
    concept: { id: "misleading_chart", name: "Fix the misleading chart", prereqs: ["orient_workbook"] },
    callbacks: [],
    ask: "The sales-growth chart is going to the board — make it tell the truth.",

    scenario: {
      intro:
        "File three: the growth chart everyone loved. Confession — I started the y-axis at <b>$480K</b> instead of zero. A real 2% bump turned into a bar that towered over last year's. \"Sales exploding!\" Looked incredible on the screen. Then someone checked the actual numbers and… it was 2%. That's the chart. What do you do with it?"
    },

    best_practice:
      "A bar chart's axis <b>must start at zero</b> — bar length is the message, and a truncated axis manufactures a story the data doesn't support. Choose the honest chart, and let a small real change look small.",

    artifact: {
      kind: "viz",
      title: "Sales EXPLODING 📈 (board version)",
      columns: [{ name: "Year", role: "dim" }],
      rows: [{ name: "SUM(Sales)", role: "measure" }],
      marks: { type: "Bar", fields: [] },
      chart: { type: "bar", cats: ["Last Year", "This Year"], vals: [10, 100], axis: "SUM(Sales) — axis starts at $480K" },
      highlight: "canvas"
    },

    task: {
      kind: "select_option",
      directive: "Pick the fix that makes the growth chart <b>honest</b>.",
      prompt:
        "Real numbers: last year ≈ $500K, this year ≈ $510K — about 2% up. The chart's y-axis starts at $480K, so this year's bar looks roughly ten times taller. What's the right move before the board sees it?",
      options: [
        { id: "a", label: "Start the y-axis at zero so the real (small) change is shown honestly", note: "Bar length should map to the value. Zero baseline = the truth." },
        { id: "b", label: "Leave it — the truncated axis makes our growth look impressive", note: "That's manufacturing a story the data doesn't support. The named blunder." },
        { id: "c", label: "Turn it into a 12-slice pie of monthly sales instead", note: "Swapping one bad chart for an unreadable one isn't a fix." },
        { id: "d", label: "Keep the axis, just add a bright arrow pointing up", note: "Decoration on a distorted chart only sells the distortion harder." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ Zero baseline. The chart now shows the real story.",
        fail: "That's the trick that misled the board the first time. Try again.",
        miss: "That doesn't make it honest. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "Look at the axis label, not the bars. Where does this y-axis start — and where <i>should</i> a bar-chart axis start?",
      tier2: "Bar length is supposed to equal the value. If the axis starts at $480K instead of 0, a tiny change looks enormous. Fix the baseline.",
      tier3: "Set the y-axis to start at zero. A 2% rise will look like a 2% rise — honest. Option a."
    },

    feedback: {
      win:
        "Zero baseline. The 'explosion' shrinks back to the 2% it always was. I knew the axis trick made it look better — that's why I did it. You just… refused to. A chart that tells the truth even when the truth is boring. That's the whole job, isn't it. Next file.",
      fail:
        "\"Looks impressive\" — that was my exact defense, right up until someone did the math in the meeting and my credibility went with it. A truncated axis isn't a style choice, it's a lie with nice colors. Start it at zero.",
      miss:
        "That doesn't fix the distortion. The problem is the axis baseline, not the chart type or the decoration. Want backup? Ask."
    },

    sets_up: ["declutter"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 4 — De-clutter the dashboard (applies Academy M5 "The Marks card" +
   * M8 "Tidy the viz"). select_option over an over-encoded viz mockup (every
   * Marks target stuffed, titled "Sheet 1"). Named blunder (fail_check) =
   * keeping all 40 sheets because "more data = more thorough."
   * ---------------------------------------------------------------------- */
  {
    wave_id: 4,
    concept: { id: "declutter", name: "De-clutter the dashboard", prereqs: ["orient_workbook"] },
    callbacks: ["fix_aggregation"], // the numbers are fixed — now make them legible
    ask: "Turn this dashboard into something an exec can read in ten seconds.",

    scenario: {
      intro:
        "File four: the Q3 dashboard. I was… proud of this one. Forty sheets. Every Marks card maxed out — Color, Size, Label, Detail, all firing at once. A rainbow. Three fonts. The title still says <b>Sheet 1</b>. Leadership called it 'thorough' and never opened it twice. You've got the same dashboard. What's the move?"
    },

    best_practice:
      "A dashboard answers <b>one question</b> with a few clean views and a <b>plain-language headline</b>. Encode meaning on the Marks card, not decoration — and cut anything that doesn't help someone read it. Less, but legible, beats more.",

    artifact: {
      kind: "viz",
      title: "Sheet 1",
      columns: [{ name: "Region", role: "dim" }],
      rows: [{ name: "SUM(Sales)", role: "measure" }],
      marks: {
        type: "Bar",
        fields: [
          { name: "Region", role: "dim", on: "Color" },
          { name: "SUM(Sales)", role: "measure", on: "Size" },
          { name: "SUM(Profit)", role: "measure", on: "Label" },
          { name: "Segment", role: "dim", on: "Detail" }
        ]
      },
      chart: { type: "bar", cats: ["Central", "East", "South", "West"], vals: [103, 92, 47, 96], axis: "SUM(Sales)" },
      highlight: "marks"
    },

    task: {
      kind: "select_option",
      directive: "Pick the move that makes the dashboard <b>readable</b>.",
      prompt:
        "Forty sheets, every Marks target in use, rainbow colors, titled <code>Sheet 1</code>. An exec has ten seconds. What do you do?",
      options: [
        { id: "a", label: "Cut to the few views that answer the question, add a plain-language headline, and strip the chartjunk", note: "One question, a clear takeaway, no decoration fighting the data. Yes." },
        { id: "b", label: "Keep all 40 sheets — more data means more thorough", note: "Volume isn't clarity. This is exactly why nobody read it twice." },
        { id: "c", label: "Make the title bigger and add a few more colors to liven it up", note: "Louder and busier is the opposite of readable." },
        { id: "d", label: "Add the company logo as a watermark behind every chart", note: "Pure chartjunk — it competes with the data for attention." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ One question, a headline, no clutter. Now it reads in seconds.",
        fail: "That's the 40-sheet wall nobody could read. Try again.",
        miss: "That adds noise, not clarity. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "An exec has ten seconds. What does a dashboard need to give them in that time — and what's just in the way?",
      tier2: "A dashboard answers one question with a few views and a headline. Every extra sheet, color, and Marks encoding that doesn't carry meaning is clutter — cut it.",
      tier3: "Trim to the few views that answer the question, write a plain-language headline (e.g. \"Central leads Q3 sales\"), and remove the chartjunk. Option a."
    },

    feedback: {
      win:
        "You cut it down. One question, a headline that says the answer, the noise gone. I always thought more sheets meant I'd worked harder. Turns out nobody could find the point in forty tabs — including me. Leaving it cleaner than I left it… yeah. That's the job. Last file.",
      fail:
        "\"Thorough.\" That's the word I used too, right before it got filed and forgotten. Forty sheets isn't thorough, it's forty places to hide the answer. Trim it to the views that answer the question and lead with the takeaway.",
      miss:
        "That makes it busier, not clearer. The fix is fewer views, a real headline, and less decoration. Want backup? Ask."
    },

    sets_up: ["the_board_ask"]
  },

  /* ------------------------------------------------------------------------
   * WAVE 5 — The board ask (applies Academy M9 "The ask" + M10 "Dashboard &
   * say it"). FINALE. Pure judgment, artifact: null. The board request that
   * broke the Predecessor. Win triggers THE REVEAL: the Predecessor is you,
   * on day one. Named blunder (fail_check) = the panic dump-everything move.
   * ---------------------------------------------------------------------- */
  {
    wave_id: 5,
    concept: { id: "the_board_ask", name: "The board ask", prereqs: ["fix_aggregation", "misleading_chart", "declutter"] },
    callbacks: ["misleading_chart"],
    ask: "The boss sent a one-line request for the board — figure out the right first move.",

    scenario: {
      intro:
        "Last file. This is the one that broke me. The email just says: <i>\"Need the Q3 dashboard for the board by 5. Thx.\"</i> I panicked, threw every sheet I had into one 40-tab workbook with a truncated growth chart on top, published it at 4:59 — and it was built on the <b>wrong quarter's extract</b>. Nobody trusted me with the board again. Here's the same email, sitting in your inbox. What do you do?"
    },

    artifact: null,

    best_practice:
      "Two skills, one breath: <b>clarify the ask</b> (which metrics, which period, for what decision) and <b>sanity-check before you publish</b> (right data source? honest axes? does the headline match the numbers?). Confirm, verify, then say it — finding, caveat, next step.",

    task: {
      kind: "select_option",
      directive: "Pick your <b>first move</b> on the board request.",
      prompt:
        "The email: <i>\"Need the Q3 dashboard for the board by 5. Thx.\"</i> It's 1pm. What's the right first move?",
      options: [
        { id: "a", label: "Reply to confirm exactly which metrics, period, and decision it informs — and note you'll verify the source and sanity-check before publishing", note: "Clarify the ask, promise a checked answer." },
        { id: "b", label: "Throw every sheet into one big workbook and publish it early", note: "The Predecessor's exact move. Volume isn't an answer." },
        { id: "c", label: "Duplicate last quarter's dashboard — close enough, saves time", note: "Wrong quarter, unverified. The way trust dies." }
      ],
      success_check: "selected_option == 'a'",
      fail_check: "selected_option == 'b'",
      status: {
        win: "✅ Clarified the ask, promised a checked answer. That's the whole craft.",
        fail: "That's the panic-dump that put the wrong quarter in front of the board. Try again.",
        miss: "Close enough isn't an answer for a board meeting. Look again, or ask for backup."
      }
    },

    help: {
      tier1: "\"The Q3 dashboard\" could mean ten different views. What do you owe the board before you build anything?",
      tier2: "Clarify first (which metrics, which period, for what decision), then verify the source and the chart honesty before you publish. Never guess and dump.",
      tier3: "Reply and pin the ask down — which metrics, which period, what decision it informs — and say you'll check the data source and the axes before it goes out. Option a."
    },

    feedback: {
      win:
        "You asked the question first. Clarified it, said you'd verify the source and check the chart before it went out. Calm. …I keep watching you do every single thing I didn't, and it's like watching a tape of myself with all the mistakes edited out. <br><br>Open the drawer. Read the name on the offer letter. …Yeah. The analyst before you was <b>me</b> — and I was <b>you</b>, on day one, before any of this stuck. This was always day one. Go be the one who gets it right. You already are.",
      fail:
        "The 40-tab dump. I know it feels like progress — look how much I published! It isn't. It's noise with a deadline, built on the wrong quarter. Ask what they actually need first.",
      miss:
        "Not for the board, not unverified. The move is to clarify the ask, then check the source and the charts before you publish. Want backup? Ask."
    },

    sets_up: []
  }
];
