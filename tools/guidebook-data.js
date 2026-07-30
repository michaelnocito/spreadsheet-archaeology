/* ============================================================================
 * Guidebook data loader — reads the three tracks' lesson files as plain data.
 * ----------------------------------------------------------------------------
 * The lesson files are browser scripts (top-level `const MENTOR / ACADEMY_PLAN
 * / LESSONS`), not modules — only the Excel track bothers with a CommonJS tail.
 * Rather than edit three shipped files to suit a build tool, we evaluate each
 * one in a throwaway VM context and read the globals back out. The site stays
 * the single source of truth: edit a lesson, rebuild, the PDF follows.
 *
 * Nothing here renders. Keeping extraction separate from layout is what lets a
 * second render target (an audio script, say) reuse the same load.
 * ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

/* The three tracks, in the order a reader should meet them: the grid first,
 * then the query, then the picture you build from both. */
const TRACKS = [
  {
    key: "excel",
    name: "Excel",
    file: "lessons.js",
    blurb: "Reading a sheet before you trust it — addresses, headers, types, and the tells that a number isn't one.",
  },
  {
    key: "sql",
    name: "SQL",
    file: "sql/lessons.js",
    blurb: "Asking a database a question you can defend — SELECT, FROM, and the habits that keep the answer honest.",
  },
  {
    key: "tableau",
    name: "Tableau",
    file: "tableau/lessons.js",
    blurb: "Turning a defensible answer into a picture that survives being looked at by someone skeptical.",
  },
];

function loadTrack(track) {
  const src = fs.readFileSync(path.join(ROOT, track.file), "utf8");
  // The trailing expression is the VM's completion value — how we get the data
  // back out without the lesson files needing to know a build exists.
  const data = vm.runInNewContext(
    src + "\n;({ MENTOR, ACADEMY_PLAN, LESSONS })",
    {},
    { filename: track.file }
  );
  if (!Array.isArray(data.LESSONS) || !data.LESSONS.length)
    throw new Error(`${track.file}: no LESSONS found — did the file's shape change?`);
  return { ...track, mentor: data.MENTOR, plan: data.ACADEMY_PLAN || [], lessons: data.LESSONS };
}

function loadAll() {
  return TRACKS.map(loadTrack);
}

module.exports = { TRACKS, loadTrack, loadAll };
