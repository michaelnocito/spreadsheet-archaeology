/* ============================================================================
 * Getting It Wrong Gets You There Faster — PLAYER PROGRESS (local, per-game)
 * ----------------------------------------------------------------------------
 * Tracks which modules + waves the player has actually COMPLETED, so the
 * syllabus can show ✅ for done vs ○ for "available, not played yet" — and so
 * "Start over" has something real to reset.
 *
 * Persisted in localStorage. IMPORTANT: both archaeology games are served from
 * the same origin (michaelnocito.github.io), which means they SHARE localStorage.
 * The key below MUST be unique per game or completing one would mark the other:
 *     Spreadsheet → "ss.progress"
 *     Tableau     → "ta.progress"
 *     SQL         → "sq.progress"
 *
 * Completion is recorded by the players: academy.js marks a module done when the
 * player reaches its outro; engine.js marks a wave done on a win.
 * ========================================================================== */
(function () {
  "use strict";

  const LS_KEY = "sq.progress"; // ← per-game; Excel="ss.progress", Tableau="ta.progress"

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY));
      if (d && Array.isArray(d.lessons) && Array.isArray(d.waves)) return d;
    } catch (e) { /* corrupt or unavailable — fall through to empty */ }
    return { lessons: [], waves: [] };
  }
  function save(d) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) { /* ignore quota/private-mode */ }
  }

  function markLesson(id) { const d = load(); if (id && !d.lessons.includes(id)) { d.lessons.push(id); save(d); } }
  function markWave(id) { const d = load(); if (id && !d.waves.includes(id)) { d.waves.push(id); save(d); } }
  function isLessonDone(id) { return load().lessons.includes(id); }
  function isWaveDone(id) { return load().waves.includes(id); }
  function counts() { const d = load(); return { lessons: d.lessons.length, waves: d.waves.length }; }
  function reset() { try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ } }

  window.Progress = { markLesson, markWave, isLessonDone, isWaveDone, counts, reset };
})();
