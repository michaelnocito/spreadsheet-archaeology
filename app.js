/* ============================================================================
 * Getting It Wrong Gets You Good — FLOW CONTROLLER
 * ----------------------------------------------------------------------------
 * Owns the three screens of the experience and the navigation between them:
 *   1. WELCOME  — premise, meet Sam, syllabus, "Start Day 1 →"   (welcome.js)
 *   2. ACADEMY  — Sam teaches the skill                            (academy.js)
 *   3. JOB      — apply it under the Predecessor's mess            (engine.js)
 *
 * Also wires the Curriculum panel (curriculum.js) — beta-nav AND dev controls.
 * Curriculum can jump straight to any built lesson or wave from any screen.
 * ========================================================================== */

(function () {
  "use strict";

  let phase = "welcome"; // welcome | academy | job

  function show(screen) {
    phase = screen === "welcome-screen" ? "welcome"
          : screen === "academy-screen" ? "academy"
          : "job";
    document.getElementById("welcome-screen").hidden = screen !== "welcome-screen";
    document.getElementById("academy-screen").hidden = screen !== "academy-screen";
    document.getElementById("job-screen").hidden = screen !== "job-screen";
    // Top-bar orientation chips are noise on the welcome screen.
    document.querySelector(".orient").classList.toggle("on-welcome", phase === "welcome");
  }

  function goWelcome() {
    Welcome.render(document.getElementById("welcome-screen"), {
      onStart: () => startAcademy(0),
      onJumpLesson: (i) => startAcademy(i),
      onJumpWave: (i) => startJob(i)
    });
    show("welcome-screen");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startAcademy(idx) {
    show("academy-screen");
    Academy.start({
      initialLesson: idx || 0,
      onGraduate: () => startJob(0)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startJob(idx) {
    show("job-screen");
    Job.start(idx || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("DOMContentLoaded", () => {
    // Welcome first.
    goWelcome();

    // Curriculum / dev panel (visible from every screen)
    Curriculum.init({
      onJumpLesson: (i) => startAcademy(i),
      onJumpWave: (i) => startJob(i),
      onReveal: () => {
        if (phase === "academy") Academy.dev.reveal();
        else if (phase === "job") Job.dev.reveal();
      },
      onAutoRevealToggle: () => {
        // No-op now: the new value is read on each step render.
      },
      onRestart: () => goWelcome()
    });
  });
})();
