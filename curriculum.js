/* ============================================================================
 * Getting It Wrong Gets You Good — CURRICULUM / BETA-NAV PANEL
 * ----------------------------------------------------------------------------
 * A side drawer the player can open anytime (📋 Curriculum button, top right):
 *   - See where they are
 *   - Jump straight to any built lesson or wave (live-beta navigation)
 *   - Reveal the answer to the current step
 *   - Toggle "Auto-reveal" so every step opens with the answer (persisted)
 *
 * This doubles as the dev-cheat panel — same code path for the dev jumping
 * around in tests and the beta player exploring the build.
 *
 * Calls back to the controller via opts:
 *   opts.onJumpLesson(idx)
 *   opts.onJumpWave(idx)
 *   opts.onReveal()           — context-aware (Academy or Job)
 *   opts.onAutoRevealToggle(on)
 *   opts.onRestart()
 * ========================================================================== */

(function () {
  "use strict";

  const LS_KEY = "sa.autoreveal";
  let opts = null;
  let openState = false;

  function init(o) {
    opts = o;
    // restore auto-reveal toggle
    window.DEV_AUTOREVEAL = localStorage.getItem(LS_KEY) === "1";
    buildButton();
    buildDrawer();
    refresh();
  }

  function buildButton() {
    const btn = document.createElement("button");
    btn.id = "curriculum-btn";
    btn.className = "curriculum-btn";
    btn.type = "button";
    btn.innerHTML = "📋 <span>Curriculum</span>";
    btn.addEventListener("click", toggle);
    document.querySelector(".topbar").appendChild(btn);
  }

  function buildDrawer() {
    const d = document.createElement("aside");
    d.id = "curriculum-drawer";
    d.className = "curriculum-drawer";
    d.hidden = true;
    d.innerHTML = `
      <div class="cur-head">
        <strong>📋 Curriculum & dev controls</strong>
        <button id="cur-close" class="icon-btn" aria-label="Close">✕</button>
      </div>
      <div class="cur-meta">Live beta — jump anywhere, or cheat your way through. No judgment.</div>

      <div class="cur-controls">
        <button id="cur-reveal" class="primary primary-sm">🔓 Reveal answer (current step)</button>
        <label class="cur-toggle">
          <input type="checkbox" id="cur-autoreveal" />
          <span>Auto-reveal answer on every step</span>
        </label>
        <button id="cur-restart" class="ghost-btn">↺ Back to welcome screen</button>
      </div>

      <div class="cur-section">
        <h4>🎓 The Academy <span class="cur-count" id="cur-count-academy"></span></h4>
        <ol id="cur-lesson-list" class="cur-list"></ol>
      </div>

      <div class="cur-section">
        <h4>💼 On the Job <span class="cur-count" id="cur-count-waves"></span></h4>
        <ol id="cur-wave-list" class="cur-list"></ol>
      </div>
    `;
    document.body.appendChild(d);

    d.querySelector("#cur-close").addEventListener("click", close);
    d.querySelector("#cur-reveal").addEventListener("click", () => { opts.onReveal(); });
    const cb = d.querySelector("#cur-autoreveal");
    cb.checked = !!window.DEV_AUTOREVEAL;
    cb.addEventListener("change", (e) => {
      window.DEV_AUTOREVEAL = e.target.checked;
      localStorage.setItem(LS_KEY, e.target.checked ? "1" : "0");
      if (opts.onAutoRevealToggle) opts.onAutoRevealToggle(e.target.checked);
    });
    d.querySelector("#cur-restart").addEventListener("click", () => { close(); opts.onRestart(); });

    // Click-outside to close
    document.addEventListener("click", (e) => {
      if (!openState) return;
      if (d.contains(e.target)) return;
      if (e.target.closest("#curriculum-btn")) return;
      close();
    });
  }

  function refresh() {
    const lessonList = document.getElementById("cur-lesson-list");
    const waveList = document.getElementById("cur-wave-list");
    lessonList.innerHTML = ACADEMY_PLAN.map((d) => {
      const idx = LESSONS.findIndex((l) => l.day === d.day);
      const built = d.built && idx >= 0;
      return `<li class="cur-item ${built ? "is-built" : "is-locked"}"
                  data-kind="lesson" data-idx="${idx}">
        <span class="cur-icon">${built ? "✅" : "🔒"}</span>
        <span class="cur-week">W${d.week} D${d.day}</span>
        <span class="cur-name">${d.name}</span>
      </li>`;
    }).join("");
    waveList.innerHTML = WAVES.map((w, i) =>
      `<li class="cur-item is-built" data-kind="wave" data-idx="${i}">
        <span class="cur-icon">✅</span>
        <span class="cur-week">W${i + 1}</span>
        <span class="cur-name">${w.concept.name}</span>
      </li>`
    ).join("");

    document.getElementById("cur-count-academy").textContent =
      `(${ACADEMY_PLAN.filter(d => d.built).length}/${ACADEMY_PLAN.length} built)`;
    document.getElementById("cur-count-waves").textContent =
      `(${WAVES.length}/5 built)`;

    document.querySelectorAll("#cur-lesson-list .cur-item.is-built").forEach((el) => {
      el.addEventListener("click", () => { close(); opts.onJumpLesson(Number(el.dataset.idx)); });
    });
    document.querySelectorAll("#cur-wave-list .cur-item.is-built").forEach((el) => {
      el.addEventListener("click", () => { close(); opts.onJumpWave(Number(el.dataset.idx)); });
    });
  }

  function toggle() { openState ? close() : open(); }
  function open() {
    refresh();
    document.getElementById("curriculum-drawer").hidden = false;
    openState = true;
  }
  function close() {
    document.getElementById("curriculum-drawer").hidden = true;
    openState = false;
  }

  window.Curriculum = { init, refresh, open, close };
})();
