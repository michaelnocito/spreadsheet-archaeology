#!/usr/bin/env node
/* ============================================================================
 * Guidebook builder — renders every Academy lesson into one printable book.
 * ----------------------------------------------------------------------------
 *   node tools/build-guidebook.js            → dist/guidebook.html + .pdf
 *   node tools/build-guidebook.js --html     → HTML only (no Chromium needed)
 *
 * Vanilla in the same spirit as the site: zero npm dependencies. The PDF step
 * shells out to a headless Chromium that is already on the box (Playwright's,
 * or any system Chrome) — see findChromium().
 *
 * The interactive site asks you to click the answer. Paper can't, so each
 * practice step prints its task, its hint, and the answer with the mentor's
 * response — the book is a reference you read, not a broken game.
 * ========================================================================== */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadAll } = require("./guidebook-data.js");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "dist");
const TITLE = "Getting It Wrong Gets You There Faster";
const SUBTITLE = "The Complete Academy Guidebook — Excel · SQL · Tableau";

/* -- helpers ---------------------------------------------------------------- */

/* Lesson copy is authored with inline HTML (<b>, <i>, <code>) and is ours, not
 * user input — so it passes through. Everything else gets escaped. */
const rich = (s) => String(s == null ? "" : s);
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const colLetter = (i) => String.fromCharCode(65 + i);

/* success_check reads like `selected_cell == 'C2'` — pull the expected value so
 * the page can print an answer instead of a comparison expression. */
function expectedAnswer(check) {
  const m = /==\s*['"]([^'"]+)['"]/.exec(String(check || ""));
  return m ? m[1] : null;
}

function answerLine(step) {
  const want = expectedAnswer(step.success_check);
  if (!want) return "";
  if (step.kind === "select_option") {
    const opt = (step.options || []).find((o) => o.id === want);
    return opt ? `${esc(opt.label)}` : esc(want);
  }
  const label = { select_cell: "cell", select_row: "row", select_column: "column" }[step.kind] || "";
  return label ? `${label} <b>${esc(want)}</b>` : esc(want);
}

/* -- artifact renderers ------------------------------------------------------
 * Three shapes appear across the tracks: a spreadsheet, a query + its result,
 * and a Tableau workbook. Each prints as a static picture of the thing. */

function renderSheet(a) {
  const rows = a.rows || [];
  const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
  const hlCell = a.highlight_cell ? /^([A-Z]+)(\d+)$/.exec(a.highlight_cell) : null;
  const hlCol = hlCell ? hlCell[1].charCodeAt(0) - 65 : a.highlight_col ? a.highlight_col.charCodeAt(0) - 65 : -1;
  const hlRow = hlCell ? +hlCell[2] : a.highlight_row || -1;
  const markers = new Set(a.marker_cells || []);

  const head =
    `<tr><th class="corner"></th>` +
    Array.from({ length: width }, (_, i) =>
      `<th class="${!hlCell && hlCol === i ? "hl" : ""}">${colLetter(i)}</th>`).join("") +
    `</tr>`;

  const body = rows.map((r, ri) => {
    const n = ri + 1;
    const rowHl = !hlCell && hlRow === n;
    const cells = Array.from({ length: width }, (_, ci) => {
      const addr = colLetter(ci) + n;
      const isCell = hlCell && hlCol === ci && hlRow === n;
      const cls = [
        isCell || rowHl || (!hlCell && hlCol === ci) ? "hl" : "",
        markers.has(addr) ? "marked" : "",
        a.merged_title_row === n ? "merged" : "",
      ].filter(Boolean).join(" ");
      if (a.merged_title_row === n && ci > 0) return "";
      const span = a.merged_title_row === n && ci === 0 ? ` colspan="${width}"` : "";
      return `<td class="${cls}"${span}>${esc(r[ci] || "")}</td>`;
    }).join("");
    return `<tr class="${(a.blank_rows || []).includes(n) ? "blankrow" : ""}"><th class="rownum ${rowHl ? "hl" : ""}">${n}</th>${cells}</tr>`;
  }).join("");

  return `<div class="artifact sheetwrap"><table class="sheet">${head}${body}</table></div>`;
}

function renderQuery(a) {
  const res = a.result || {};
  const table = res.columns
    ? `<table class="result"><tr>${res.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>` +
      (res.rows || []).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("") +
      `</table>`
    : "";
  return `<div class="artifact">
    ${a.title ? `<div class="artifact-title">${esc(a.title)}</div>` : ""}
    ${a.caption ? `<div class="artifact-cap">${rich(a.caption)}</div>` : ""}
    <pre class="sql">${esc(a.sql || "")}</pre>
    ${table}
    ${a.resultNote ? `<div class="artifact-note">${rich(a.resultNote)}</div>` : ""}
  </div>`;
}

function renderViz(a) {
  const shelf = (label, fields, key) =>
    `<div class="shelf ${a.highlight === key ? "hl" : ""}"><span class="shelf-l">${label}</span>` +
    `<span class="shelf-f">${(fields || []).map((f) =>
      `<em class="pill ${f.role || ""}">${esc(f.name || f)}</em>`).join("") || "&nbsp;"}</span></div>`;

  const c = a.chart || {};
  const max = Math.max(1, ...(c.vals || [1]));
  const bars = (c.cats || []).map((cat, i) => {
    const v = (c.vals || [])[i] || 0;
    return `<div class="bar"><span class="bar-fill" style="height:${Math.round((v / max) * 100)}%"></span>
      <span class="bar-cat">${esc(cat)}</span></div>`;
  }).join("");

  return `<div class="artifact viz">
    ${a.title ? `<div class="artifact-title">${esc(a.title)}</div>` : ""}
    <div class="shelves">
      ${shelf("Columns", a.columns, "columns")}
      ${shelf("Rows", a.rows, "rows")}
      ${a.filters && a.filters.length ? shelf("Filters", a.filters, "filters") : ""}
      ${a.marks ? `<div class="shelf ${a.highlight === "marks" ? "hl" : ""}"><span class="shelf-l">Marks</span>
        <span class="shelf-f"><em class="pill">${esc(a.marks.type || "Automatic")}</em>
        ${(a.marks.fields || []).map((f) => `<em class="pill">${esc(f.name || f)}</em>`).join("")}</span></div>` : ""}
    </div>
    ${(c.cats || []).length ? `<div class="chart"><div class="chart-axis">${esc(c.axis || "")}</div>
      <div class="bars">${bars}</div></div>` : ""}
  </div>`;
}

function renderArtifact(a) {
  if (!a) return "";
  if (a.kind === "sheet") return renderSheet(a);
  if (a.kind === "query") return renderQuery(a);
  if (a.kind === "viz") return renderViz(a);
  return "";
}

/* -- lesson + book ---------------------------------------------------------- */

function renderStep(step, i) {
  const ans = answerLine(step);
  const opts = (step.options || []).map((o) =>
    `<li><b>${esc(o.label)}</b>${o.note ? ` — ${rich(o.note)}` : ""}</li>`).join("");
  return `<section class="step ${step.mode}">
    <div class="step-h"><span class="mode">${step.mode === "guided" ? "We do" : "You do"}</span>
      <span class="step-n">Practice ${i + 1}</span></div>
    <div class="task">${rich(step.task)}</div>
    ${step.prompt ? `<p class="prompt">${rich(step.prompt)}</p>` : ""}
    ${renderArtifact(step.artifact)}
    ${opts ? `<ol class="options">${opts}</ol>` : ""}
    ${(step.checklist || []).length ? `<ul class="checklist">${step.checklist.map((c) => `<li>${rich(c)}</li>`).join("")}</ul>` : ""}
    ${step.hint ? `<p class="hint"><b>Hint.</b> ${rich(step.hint)}</p>` : ""}
    ${ans ? `<p class="answer"><b>Answer.</b> ${ans}${step.praise ? `<span class="praise">${rich(step.praise)}</span>` : ""}</p>` : ""}
  </section>`;
}

function renderLesson(lesson, track, n) {
  return `<article class="lesson" id="${track.key}-${esc(lesson.id)}">
    <header class="lesson-h">
      <div class="crumb">${esc(track.name)} · Week ${lesson.week} · Day ${lesson.day}</div>
      <h2>${n}. ${esc((lesson.concept || {}).name || lesson.id)}</h2>
      ${lesson.ask ? `<p class="ask"><span>The goal</span> ${rich(lesson.ask)}</p>` : ""}
    </header>
    ${lesson.best_practice ? `<p class="bestpractice">${rich(lesson.best_practice)}</p>` : ""}
    ${lesson.mentor_intro ? `<p class="mentor">${rich(lesson.mentor_intro)}</p>` : ""}
    ${lesson.teach ? `<section class="teach">
      <div class="step-h"><span class="mode teach-mode">I do</span><span class="step-n">Worked example</span></div>
      <p>${rich(lesson.teach.explain)}</p>
      ${renderArtifact(lesson.teach.example)}
      ${lesson.teach.callout ? `<p class="callout">${rich(lesson.teach.callout)}</p>` : ""}
    </section>` : ""}
    ${(lesson.practice || []).map(renderStep).join("")}
    ${lesson.mentor_outro ? `<p class="mentor outro">${rich(lesson.mentor_outro)}</p>` : ""}
  </article>`;
}

function renderBook(tracks, builtOn) {
  let n = 0;
  const numbered = tracks.map((t) => ({ t, lessons: t.lessons.map((l) => ({ l, n: ++n })) }));
  const total = n;

  const toc = numbered.map(({ t, lessons }) => `
    <div class="toc-track">
      <h3>${esc(t.name)}</h3>
      <p class="toc-blurb">${esc(t.blurb)}</p>
      <ol>${lessons.map(({ l, n }) =>
        `<li><a href="#${t.key}-${esc(l.id)}"><span class="tn">${n}</span>${esc((l.concept || {}).name || l.id)}</a></li>`).join("")}</ol>
    </div>`).join("");

  const body = numbered.map(({ t, lessons }) => `
    <div class="divider" id="track-${t.key}">
      <div class="divider-in"><span class="kicker">Track</span><h2>${esc(t.name)}</h2><p>${esc(t.blurb)}</p></div>
    </div>
    ${lessons.map(({ l, n }) => renderLesson(l, t, n)).join("")}`).join("");

  return `<!doctype html>
<meta charset="utf-8">
<title>${esc(TITLE)} — Guidebook</title>
<style>${CSS}</style>
<div class="cover">
  <div class="cover-in">
    <div class="kicker">Complete guidebook</div>
    <h1>${esc(TITLE)}</h1>
    <p class="sub">${esc(SUBTITLE)}</p>
    <p class="meta">${total} guides · ${tracks.length} tracks · built ${esc(builtOn)}</p>
  </div>
</div>
<div class="toc">
  <h2>What's inside</h2>
  <p class="lede">Every Academy module, in reading order. On the site you click the
  answer; on paper each practice step prints its task, its hint, and the answer —
  so this works as a reference you keep, not a game with the buttons removed.</p>
  ${toc}
</div>
${body}
<div class="colophon">
  <p><b>${esc(TITLE)}</b> — ${total} guides, generated from the same lesson data that
  runs the site, so the book and the app can't drift.</p>
  <p class="dim">Built ${esc(builtOn)} · github.com/michaelnocito/spreadsheet-archaeology</p>
</div>`;
}

/* -- styles ------------------------------------------------------------------
 * Zinc & Sky (DESIGN_SYSTEM.md), tuned for paper: white page, no shadows, ink
 * that stays readable at 11pt. Light-only by design — a PDF has no theme. */

const CSS = `
:root{
  --bg:#F5F7F8; --panel:#fff; --line:#E4E7EA; --ink:#09090B; --dim:#52525B;
  --accent:#0E7490; --accent-d:#0B5E75; --good:#059669; --good-bg:#ECFDF5;
  --warm:#D97706; --info:#4F46E5; --phase2-bg:#EEF2FF; --phase2-bd:#C7D2FE;
  --sel:#E0F2F7; --sel-line:#0E7490; --sheet-head:#F5F7F8;
}
@page{ size:letter; margin:16mm 15mm; }
/* The HTML is a deliverable too — readable on screen, paginated on paper. */
@media screen{
  body{max-width:190mm;margin:0 auto;padding:0 10mm 20mm}
  .cover{margin:0 -10mm;height:auto;padding:40mm 0}
  .divider{margin-left:-10mm;margin-right:-10mm}
}
*{box-sizing:border-box}
body{margin:0;font:11pt/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink);background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3{line-height:1.2;margin:0}
p{margin:.6em 0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em;
  background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:.05em .35em}

/* cover + section dividers ------------------------------------------------ */
.cover{height:245mm;display:flex;align-items:center;justify-content:center;text-align:center;
  background:var(--bg);border-bottom:3px solid var(--accent);break-after:page}
.cover-in{max-width:150mm;padding:0 12mm}
.kicker{font-size:9.5pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.cover h1{font-size:34pt;letter-spacing:-.02em;margin:.35em 0 .1em}
.cover .sub{font-size:14pt;color:var(--dim);margin:.2em 0 1.6em}
.cover .meta{font-size:10pt;color:var(--dim);border-top:1px solid var(--line);padding-top:1em;display:inline-block}
.divider{break-before:page;background:var(--bg);border-left:4px solid var(--accent);padding:14mm 10mm;margin:0 0 8mm}
.divider h2{font-size:26pt;letter-spacing:-.02em;margin:.15em 0 .25em}
.divider p{color:var(--dim);margin:0;max-width:130mm}

/* contents ---------------------------------------------------------------- */
.toc{break-after:page;padding:0 0 6mm}
.toc h2{font-size:20pt;margin-bottom:.3em}
.lede{color:var(--dim);max-width:135mm}
.toc-track{margin-top:9mm;break-inside:avoid}
.toc-track h3{font-size:13pt;color:var(--accent);text-transform:uppercase;letter-spacing:.08em}
.toc-blurb{color:var(--dim);font-size:10pt;margin:.2em 0 .5em;max-width:135mm}
.toc ol{list-style:none;padding:0;margin:0;column-count:2;column-gap:10mm}
.toc li{break-inside:avoid;margin:.18em 0}
.toc a{color:var(--ink);text-decoration:none;display:flex;gap:.6em;font-size:10pt}
.tn{color:var(--accent);font-weight:700;min-width:1.6em;text-align:right}

/* lesson ------------------------------------------------------------------ */
.lesson{break-before:page}
.lesson-h{border-bottom:2px solid var(--line);padding-bottom:.6em;margin-bottom:.9em}
.crumb{font-size:9pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.lesson-h h2{font-size:21pt;letter-spacing:-.015em;margin:.15em 0 .3em}
.ask{background:var(--sel);border-left:3px solid var(--sel-line);padding:.55em .8em;margin:0;font-size:10.5pt}
.ask span{font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:8.5pt;color:var(--accent-d);
  display:block;margin-bottom:.15em}
.bestpractice{color:var(--dim);font-size:10.5pt}
.mentor{border-left:3px solid var(--line);padding-left:.9em;color:var(--dim);font-style:italic}
.mentor.outro{border-left-color:var(--good);color:var(--ink);font-style:normal;margin-top:1.2em}

/* steps ------------------------------------------------------------------- */
.teach,.step{break-inside:avoid;margin:1.1em 0;padding:.9em 1em;border:1px solid var(--line);
  border-radius:8px;background:var(--panel)}
.teach{background:var(--bg)}
.step-h{display:flex;align-items:center;gap:.7em;margin-bottom:.5em}
.mode{font-size:8.5pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;
  background:var(--accent);border-radius:99px;padding:.2em .8em}
.step.solo .mode{background:var(--info)}
.teach-mode{background:var(--dim)}
.step-n{font-size:9pt;color:var(--dim);letter-spacing:.06em;text-transform:uppercase}
.task{font-size:12pt;font-weight:600}
.prompt{color:var(--dim);margin-top:.25em}
.callout{background:var(--phase2-bg);border:1px solid var(--phase2-bd);border-radius:6px;
  padding:.5em .8em;margin-top:.8em;font-size:10.5pt}
.checklist{margin:.5em 0;padding-left:1.2em;color:var(--dim);font-size:10pt}
.options{margin:.6em 0;padding-left:1.4em;font-size:10.5pt}
.options li{margin:.25em 0}
.hint{font-size:10pt;color:var(--warm)}
.answer{background:var(--good-bg);border-left:3px solid var(--good);padding:.5em .8em;font-size:10.5pt}
.praise{color:var(--dim);display:block;margin-top:.2em;font-size:10pt}

/* artifacts --------------------------------------------------------------- */
.artifact{margin:.8em 0;break-inside:avoid}
.artifact-title{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5pt;color:var(--dim);margin-bottom:.3em}
.artifact-cap,.artifact-note{font-size:10pt;color:var(--dim);margin:.35em 0}
table{border-collapse:collapse;font-size:9.5pt;width:100%}
.sheet{table-layout:fixed}
.sheet th,.sheet td{border:1px solid var(--line);padding:.3em .5em;text-align:left}
.sheet th{background:var(--sheet-head);color:var(--dim);font-weight:600;text-align:center;width:auto}
.sheet .corner,.sheet .rownum{width:2.2em;text-align:center}
.sheet .hl{background:var(--sel);outline:1.5px solid var(--sel-line);outline-offset:-1.5px}
.sheet th.hl{background:var(--sel);color:var(--accent-d)}
.sheet .marked{background:#FEF2F2}
.sheet .merged{font-weight:700;text-align:center;color:var(--dim)}
.sheet .blankrow td{height:1.5em}
pre.sql{background:#0B1220;color:#E6EDF3;border-radius:6px;padding:.7em .9em;font-size:9.5pt;
  font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;margin:.3em 0}
table.result{margin-top:.4em}
table.result th,table.result td{border:1px solid var(--line);padding:.3em .5em}
table.result th{background:var(--sheet-head);color:var(--dim);text-align:left}
.shelves{border:1px solid var(--line);border-radius:6px;overflow:hidden}
.shelf{display:flex;gap:.6em;align-items:center;border-bottom:1px solid var(--line);padding:.3em .5em;font-size:9.5pt}
.shelf:last-child{border-bottom:0}
.shelf.hl{background:var(--sel)}
.shelf-l{width:5.5em;color:var(--dim);font-weight:600;text-transform:uppercase;letter-spacing:.06em;font-size:8.5pt}
.pill{font-style:normal;background:var(--bg);border:1px solid var(--line);border-radius:99px;padding:.1em .7em;margin-right:.35em}
.pill.dim{background:var(--phase2-bg);border-color:var(--phase2-bd)}
.pill.measure{background:var(--good-bg);border-color:#A7F3D0}
.chart{margin-top:.6em;display:flex;gap:.6em;align-items:flex-end}
.chart-axis{writing-mode:vertical-rl;transform:rotate(180deg);font-size:8.5pt;color:var(--dim)}
.bars{display:flex;gap:.8em;align-items:flex-end;height:32mm;flex:1;border-bottom:1px solid var(--line)}
.bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}
.bar-fill{width:100%;background:var(--accent);border-radius:3px 3px 0 0;display:block}
.bar-cat{font-size:8.5pt;color:var(--dim);margin-top:.25em}

.colophon{break-before:page;padding-top:20mm;text-align:center;color:var(--ink)}
.colophon .dim{color:var(--dim);font-size:9.5pt}
`;

/* -- chromium --------------------------------------------------------------- */

function findChromium() {
  const fromEnv = process.env.CHROME_PATH;
  const globbed = [];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (fs.existsSync(pw)) {
    for (const d of fs.readdirSync(pw)) {
      if (d.startsWith("chromium-")) globbed.push(path.join(pw, d, "chrome-linux", "chrome"));
      if (d.startsWith("chromium_headless_shell-")) globbed.push(path.join(pw, d, "chrome-linux", "headless_shell"));
    }
  }
  const candidates = [
    fromEnv,
    ...globbed,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  return candidates.find((c) => fs.existsSync(c)) || null;
}

function printPdf(htmlPath, pdfPath) {
  const chrome = findChromium();
  if (!chrome) {
    console.warn("  ! No Chromium found — skipping PDF. Set CHROME_PATH, or run with --html.");
    return false;
  }
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    "--generate-pdf-document-outline",
    `--print-to-pdf=${pdfPath}`,
    "file://" + htmlPath,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  return true;
}

/* -- main ------------------------------------------------------------------- */

function main() {
  const htmlOnly = process.argv.includes("--html");
  const tracks = loadAll();
  const count = tracks.reduce((n, t) => n + t.lessons.length, 0);
  const builtOn = new Date().toISOString().slice(0, 10);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const htmlPath = path.join(OUT_DIR, "guidebook.html");
  fs.writeFileSync(htmlPath, renderBook(tracks, builtOn));
  console.log(`  ✓ ${count} guides → ${path.relative(ROOT, htmlPath)}`);

  if (htmlOnly) return;
  const pdfPath = path.join(OUT_DIR, "guidebook.pdf");
  if (printPdf(htmlPath, pdfPath)) {
    const kb = Math.round(fs.statSync(pdfPath).size / 1024);
    console.log(`  ✓ ${path.relative(ROOT, pdfPath)} (${kb} KB)`);
  }
}

main();
