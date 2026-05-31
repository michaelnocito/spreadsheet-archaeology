/* ============================================================================
 * Getting It Wrong Gets You Good — WELCOME / LANDING
 * ----------------------------------------------------------------------------
 * The first thing a brand-new player sees. Sets the premise, introduces the
 * mentor, shows the full Two-Week Academy + 5-wave Job syllabus so they know
 * what they're signing up for, then drops them into Day 1.
 *
 * Locked / unbuilt items show a 🔒 so the road ahead is visible but honest.
 *
 * Reads:  MENTOR, ACADEMY_PLAN (lessons.js), WAVES (waves.js)
 * Calls:  opts.onStart(idx)   when "Start Day 1 →" is clicked
 *         opts.onJumpLesson   when user clicks any built lesson in the list
 *         opts.onJumpWave     when user clicks any built wave in the list
 * ========================================================================== */

(function () {
  "use strict";

  function render(host, opts) {
    const lessonsHtml = `
      <div class="syl-section">
        <h4>🎓 Onboarding packet
          <span class="syl-progress">${ACADEMY_PLAN.filter(d=>d.built).length}/${ACADEMY_PLAN.length} built</span>
        </h4>
        <ol class="syl-list">
          ${ACADEMY_PLAN.map((d) => syllabusItem("lesson", d)).join("")}
        </ol>
      </div>`;

    const wavesHtml = `
      <div class="syl-section">
        <h4>💼 On the job
          <span class="syl-progress">${WAVES.length}/5 built</span>
        </h4>
        <ol class="syl-list">
          ${WAVES.map((w, i) => syllabusItem("wave", {
            day: i + 1, name: w.concept.name, built: true, idx: i
          })).join("")}
          ${Array.from({ length: Math.max(0, 5 - WAVES.length) }, (_, i) =>
            syllabusItem("wave", { day: WAVES.length + i + 1, name: futureWaveName(WAVES.length + i), built: false })
          ).join("")}
        </ol>
      </div>`;

    host.innerHTML = `
      <div class="welcome">
        <div class="welcome-card">
          <div class="welcome-head">
            <div class="welcome-title">
              <span class="logo welcome-logo">▦</span>
              <div>
                <h1>You just got hired.</h1>
                <p class="welcome-sub">Junior data analyst, day one. <i>Getting It Wrong Gets You Good</i> — a job sim.</p>
              </div>
            </div>
          </div>

          <div class="welcome-premise">
            <p><b>Here's the deal.</b> The analyst who had this desk before you — the Predecessor — left in a hurry, and their drive is a mess. Cursed spreadsheets, mystery files, no documentation. You're going to inherit it.</p>
            <p><b>First, you train.</b> Two weeks with <b>${MENTOR.name}</b>, your mentor ${MENTOR.avatar} — calm files, one skill at a time. <b>Then you're on the job</b> — same skills, but under the Predecessor's mess. Help is right there when you want it.</p>
            <p class="welcome-taglineline">Failing is the curriculum. <b>Getting it wrong gets you good.</b></p>
          </div>

          <div class="syllabus">
            <h3>Your training path <span class="syl-note">(live beta — build in progress)</span></h3>
            <div class="syl-stack">
              ${lessonsHtml}
              ${wavesHtml}
            </div>
          </div>

          <div class="welcome-cta">
            <button id="welcome-start" class="primary primary-xl">Start Module 1 →</button>
            <p class="welcome-foot">Tip: the <b>📋 Curriculum</b> button up top lets you jump to any built lesson or wave anytime. It's live beta — feel free to explore.</p>
          </div>
        </div>
      </div>`;

    // Start button
    host.querySelector("#welcome-start").addEventListener("click", () => {
      opts.onStart(0);
    });

    // Built syllabus items are clickable
    host.querySelectorAll(".syl-item.is-built").forEach((el) => {
      el.addEventListener("click", () => {
        if (el.dataset.type === "lesson") opts.onJumpLesson(Number(el.dataset.idx));
        else opts.onJumpWave(Number(el.dataset.idx));
      });
    });
  }

  // Render one syllabus row. Lessons map by day → LESSONS index; waves come with idx.
  function syllabusItem(type, item) {
    let idx = -1;
    if (type === "lesson") {
      idx = LESSONS.findIndex((l) => l.day === item.day);
    } else {
      idx = item.idx != null ? item.idx : -1;
    }
    const clickable = item.built && idx >= 0;
    const cls = "syl-item" + (clickable ? " is-built" : " is-locked");
    const icon = clickable ? "✅" : "🔒";
    const label = type === "lesson" ? `Module ${item.day} — ${item.name}` : `Wave ${item.day} — ${item.name}`;
    return `<li class="${cls}" data-type="${type}" data-idx="${idx}">
      <span class="syl-icon">${icon}</span><span class="syl-label">${label}</span>
    </li>`;
  }

  function futureWaveName(i) {
    return ["Type integrity", "Work on a copy", "Document as you go", "The stakeholder ask"][i] || "TBD";
  }

  window.Welcome = { render };
})();
