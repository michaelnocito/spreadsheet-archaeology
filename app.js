/* ============================================================================
 * Getting It Wrong Gets You Good — FLOW CONTROLLER
 * ----------------------------------------------------------------------------
 * The shape of the whole experience: train, then work.
 *   1. THE ACADEMY  — Sam teaches the skill, calm and clean (academy.js)
 *   2. graduate     — swap screens
 *   3. THE JOB      — apply it under the Predecessor's mess (engine.js)
 * ========================================================================== */

(function () {
  "use strict";

  function show(id) {
    document.getElementById("academy-screen").hidden = id !== "academy-screen";
    document.getElementById("job-screen").hidden = id !== "job-screen";
  }

  window.addEventListener("DOMContentLoaded", () => {
    show("academy-screen");
    Academy.start({
      onGraduate: () => {
        show("job-screen");
        window.scrollTo({ top: 0, behavior: "smooth" });
        Job.start();
      }
    });
  });
})();
