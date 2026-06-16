/* ============================================================================
 * Getting It Wrong Gets You There Faster — CELEBRATE (juice / micro-feedback)
 * ----------------------------------------------------------------------------
 * Research-backed micro-celebrations for skill learning (Duolingo-warm tier,
 * not arcade / not slot-machine):
 *   - Predictable rewards (every success rewarded; no random jackpots)
 *   - Multisensory: warm chime + a soft visual flourish on every correct move
 *   - Sounds are sine/triangle waves — explicitly NOT chiptune square waves
 *     (Mike rejected the "doh doh doh" feel in SQL Quest's audio pass)
 *   - Juice "echoes core gameplay" (Vlambeer): this is workplace satisfaction,
 *     not explosions. Soft pulses, gentle confetti, ascending major arpeggios.
 *
 * Public API (all no-ops if audio/anim off or unsupported):
 *   Celebrate.armAudio()                     — unlock AudioContext (user gesture)
 *   Celebrate.tap(el?)                       — Tier 1: tiny chime + pulse on el
 *   Celebrate.wrong()                        — soft low chime, no flourish
 *   Celebrate.stepDone()                     — Tier 2: subtle blip
 *   Celebrate.moduleDone(text)               — Tier 3: chime + toast + confetti
 *   Celebrate.graduate(text)                 — Tier 4: bigger arpeggio + banner
 *   Celebrate.setSoundOn(bool)               — persist + apply
 *   Celebrate.isSoundOn(): boolean
 * ========================================================================== */

(function () {
  "use strict";

  const LS_KEY = "sa.sound";
  // default ON — user-gesture gate is handled by armAudio() on first click
  if (localStorage.getItem(LS_KEY) === null) localStorage.setItem(LS_KEY, "1");

  let ac = null;
  let armed = false;

  function isSoundOn() { return localStorage.getItem(LS_KEY) !== "0"; }
  function setSoundOn(on) { localStorage.setItem(LS_KEY, on ? "1" : "0"); }

  function armAudio() {
    if (armed) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ac = new Ctx();
      // Some browsers create the ctx in 'suspended' until a gesture resumes it.
      if (ac.state === "suspended") ac.resume();
      armed = true;
    } catch (_) { /* audio unavailable; degrade silently */ }
  }

  // Schedule a single warm tone. type: 'sine' | 'triangle'.
  function tone(freq, durSec, opts) {
    if (!ac || !isSoundOn()) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = (opts && opts.type) || "sine";
    o.frequency.value = freq;
    const t0 = ac.currentTime + ((opts && opts.delay) || 0);
    const peak = (opts && opts.gain) != null ? opts.gain : 0.12;
    // Short attack / soft decay envelope — never harsh.
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);
    o.connect(g).connect(ac.destination);
    o.start(t0);
    o.stop(t0 + durSec + 0.02);
  }

  // ----- Chimes ---------------------------------------------------------------
  // Tier 1: a major-third dyad — warm, brief, "filed!" feel.
  function chimeTap() {
    tone(659.25, 0.18, { gain: 0.10 });             // E5
    tone(523.25, 0.20, { gain: 0.08, delay: 0.01 });// C5 (soft fundamental)
  }
  // Tier 2: single short blip when a stepper step turns done.
  function chimeStep() {
    tone(880, 0.10, { gain: 0.07, type: "triangle" }); // A5
  }
  // Tier 3: ascending C-E-G arpeggio (Duolingo-ish "ding-ding-ding").
  function chimeModule() {
    tone(523.25, 0.16, { gain: 0.10, delay: 0.00 });           // C5
    tone(659.25, 0.16, { gain: 0.10, delay: 0.10 });           // E5
    tone(783.99, 0.32, { gain: 0.12, delay: 0.22 });           // G5
  }
  // Tier 4: a slower celestial chord — sustains, octave cap.
  function chimeGraduate() {
    tone(523.25, 0.30, { gain: 0.09, delay: 0.00 });   // C5
    tone(659.25, 0.30, { gain: 0.09, delay: 0.18 });   // E5
    tone(783.99, 0.30, { gain: 0.10, delay: 0.36 });   // G5
    tone(1046.50, 0.70, { gain: 0.10, delay: 0.54 }); // C6 (lift)
  }
  // Wrong: low gentle tone — feedback, not punishment.
  function chimeWrong() {
    tone(196.00, 0.22, { gain: 0.08, type: "triangle" }); // G3
  }

  // ----- Visuals --------------------------------------------------------------
  // Soft green pulse ring on an element (rect-shaped).
  function pulse(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ring = document.createElement("div");
    ring.className = "fx-pulse";
    ring.style.left = (window.scrollX + r.left - 4) + "px";
    ring.style.top = (window.scrollY + r.top - 4) + "px";
    ring.style.width = (r.width + 8) + "px";
    ring.style.height = (r.height + 8) + "px";
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  }

  // Toast banner: slides from top, holds, fades.
  function toast(text, kind) {
    const t = document.createElement("div");
    t.className = "fx-toast " + (kind || "good");
    t.innerHTML = text;
    document.body.appendChild(t);
    // double-rAF to ensure CSS picks up the initial state before transitioning
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 350);
    }, kind === "big" ? 3200 : 2100);
  }

  // Soft confetti: ~N small colored squares fall + drift + fade.
  function confetti(level) {
    const N = level === "big" ? 60 : 28;
    const COLORS = ["#2f6df0", "#1a7f37", "#e3b97a", "#9a6700", "#6639ba", "#cf222e"];
    const W = window.innerWidth;
    const root = document.createElement("div");
    root.className = "fx-confetti-root";
    document.body.appendChild(root);
    for (let i = 0; i < N; i++) {
      const p = document.createElement("div");
      p.className = "fx-confetto";
      p.style.left = (Math.random() * W) + "px";
      p.style.background = COLORS[i % COLORS.length];
      p.style.setProperty("--dx", (Math.random() * 220 - 110) + "px");
      p.style.setProperty("--dur", (1.6 + Math.random() * 1.4).toFixed(2) + "s");
      p.style.animationDelay = (Math.random() * 0.4).toFixed(2) + "s";
      root.appendChild(p);
    }
    setTimeout(() => root.remove(), 3500);
  }

  // ----- Public composed actions ---------------------------------------------
  function tap(el) {
    armAudio();
    chimeTap();
    pulse(el);
  }
  function wrong() { armAudio(); chimeWrong(); }
  function stepDone() { armAudio(); chimeStep(); }
  function moduleDone(text) {
    armAudio();
    chimeModule();
    toast(text || "🎓 Module cleared", "good");
    confetti("soft");
  }
  function graduate(text) {
    armAudio();
    chimeGraduate();
    toast(text || "🎉 Onboarding complete — welcome to the job", "big");
    confetti("big");
  }

  window.Celebrate = {
    armAudio, tap, wrong, stepDone, moduleDone, graduate,
    setSoundOn, isSoundOn
  };
})();
