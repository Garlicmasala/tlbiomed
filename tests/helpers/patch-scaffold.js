"use strict";

/* One-shot patch script: applies the sample-scaffolding edits to
   index.html. Verifies every replacement landed before writing. */

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "..", "index.html");

const OLD_CONFIG = [
  "  /* Notes: a plain list of link cards. Add as many as you like. */",
  "  notes: [",
  "    /* Example shape:",
  '    { title: "Lecture 1 — Cell structure", desc: "Slides and reading list.", url: "https://example.com/lecture1", tags: ["lecture", "cell"] },',
  "    */",
  "  ],",
  "",
  "  /* Structured tutorials: grouped by topic, each item is a link. */",
  "  tutorials: [",
  "    /* Example shape:",
  '    { topic: "Biochemistry", note: "6 steps", items: [',
  '      { title: "Glycolysis walkthrough", desc: "Step-by-step with diagrams.", url: "https://example.com/glycolysis" }',
  "    ] },",
  "    */",
  "  ],"
].join("\n");

const NEW_CONFIG = [
  "  /* Notes: a plain list of link cards. Add as many as you like.",
  "     The rows below are sample scaffolding (sample: true) — replace",
  "     the titles, urls and tags with your own and delete the flag. */",
  "  notes: [",
  '    { title: "Week 1 — Cell structure & function", desc: "Lecture slides and reading list.", url: "https://example.com/tlb-notes-week1", tags: ["week-1", "cell-bio"], sample: true },',
  '    { title: "Week 2 — Biomolecules & metabolism", desc: "Slides plus worked examples.", url: "https://example.com/tlb-notes-week2", tags: ["week-2", "biochem"], sample: true },',
  '    { title: "Week 3 — Cardiovascular physiology", desc: "Lecture notes and lab sheet.", url: "https://example.com/tlb-notes-week3", tags: ["week-3", "physiology"], sample: true },',
  '    { title: "Week 4 — Bacterial pathogens", desc: "Microbiology slides and revision questions.", url: "https://example.com/tlb-notes-week4", tags: ["week-4", "micro"], sample: true }',
  "  ],",
  "",
  "  /* Structured tutorials: grouped by topic, each item is a link.",
  "     Sample scaffolding below — replace with your real tutorials. */",
  "  tutorials: [",
  '    { topic: "Biochemistry", note: "3 steps", items: [',
  '      { title: "Glycolysis walkthrough", desc: "Step-by-step with diagrams.", url: "https://example.com/tut-glycolysis", sample: true },',
  '      { title: "Krebs cycle — the key intermediates", desc: "Mnemonics and exam-style questions.", url: "https://example.com/tut-krebs", sample: true },',
  '      { title: "Enzyme kinetics basics", desc: "Michaelis-Menten in plain language.", url: "https://example.com/tut-kinetics", sample: true }',
  "    ] },",
  '    { topic: "Physiology", note: "2 steps", items: [',
  '      { title: "Reading a 12-lead ECG", desc: "The P-QRS-T sequence in 10 minutes.", url: "https://example.com/tut-ecg", sample: true },',
  '      { title: "Respiratory physiology essentials", desc: "Pressures, volumes and gas exchange.", url: "https://example.com/tut-resp", sample: true }',
  "    ] },",
  '    { topic: "Microbiology", note: "2 steps", items: [',
  '      { title: "Gram staining — practical guide", desc: "What the colours mean and why.", url: "https://example.com/tut-gram", sample: true },',
  '      { title: "Antimicrobial mechanisms", desc: "How the major drug classes act.", url: "https://example.com/tut-antibiotics", sample: true }',
  "    ] }",
  "  ],"
].join("\n");

const OLD_NOTES_BANNER = '    <div class="notes-grid" id="notes-list"></div>\n  </section>';

const NEW_NOTES_BANNER = [
  '    <div class="banner hidden" id="notes-sample-banner">',
  '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></svg>',
  "      <span><strong>Sample links.</strong> Replace the <code>notes</code> entries in <code>SITE_CONFIG</code> with your own, then delete the <code>sample: true</code> flags.</span>",
  "    </div>",
  '    <div class="notes-grid" id="notes-list"></div>',
  "  </section>"
].join("\n");

const OLD_TUT_BANNER = '    <div id="tutorial-groups"></div>\n  </section>';

const NEW_TUT_BANNER = [
  '    <div class="banner hidden" id="tutorials-sample-banner">',
  '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></svg>',
  "      <span><strong>Sample links.</strong> Replace the <code>tutorials</code> entries in <code>SITE_CONFIG</code> with your own, then delete the <code>sample: true</code> flags.</span>",
  "    </div>",
  '    <div id="tutorial-groups"></div>',
  "  </section>"
].join("\n");

const OLD_CSS_TAG = [
  ".tag {",
  "  font-family: var(--font-mono);",
  "  font-size: 11px;",
  "  color: var(--primary);",
  "  background: var(--primary-soft);",
  "  border-radius: 999px;",
  "  padding: 3px 9px;",
  "}"
].join("\n");

const NEW_CSS_TAG = OLD_CSS_TAG + "\n.tag.sample { background: var(--accent-soft); color: #6B4A10; }";

const OLD_RENDER_NOTES_TOP = [
  "function renderNotes() {",
  '  var list = $("notes-list");',
  "  emptyNode(list);",
  "  var notes = SITE_CONFIG.notes || [];",
  "",
  "  if (!notes.length) {"
].join("\n");

const NEW_RENDER_NOTES_TOP = [
  "function renderNotes() {",
  '  var list = $("notes-list");',
  "  emptyNode(list);",
  "  var notes = SITE_CONFIG.notes || [];",
  '  show("notes-sample-banner", notes.some(function (n) { return !!n.sample; }));',
  "",
  "  if (!notes.length) {"
].join("\n");

const OLD_RENDER_NOTES_TAGS = [
  '    var tags = (n.tags || []).map(function (t) {',
  '      return \'<span class="tag">\' + escapeHtml(t) + "</span>";',
  "    }).join(\"\");",
  "    a.innerHTML =",
  '      \'<span class="nc-title">\' + ICONS.ext + "<span>" + escapeHtml(n.title) + "</span></span>" +',
  '      \'<div class="nc-desc">\' + escapeHtml(n.desc || "") + "</div>" +',
  '      (tags ? \'<div class="nc-tags">\' + tags + "</div>" : "");',
  "    list.appendChild(a);"
].join("\n");

const NEW_RENDER_NOTES_TAGS = [
  '    var sampleBadge = n.sample ? \'<span class="tag sample">sample</span>\' : "";',
  '    var tags = (n.tags || []).map(function (t) {',
  '      return \'<span class="tag">\' + escapeHtml(t) + "</span>";',
  "    }).join(\"\");",
  "    a.innerHTML =",
  '      \'<span class="nc-title">\' + ICONS.ext + "<span>" + escapeHtml(n.title) + "</span></span>" +',
  '      \'<div class="nc-desc">\' + escapeHtml(n.desc || "") + "</div>" +',
  '      \'<div class="nc-tags">\' + tags + sampleBadge + "</div>";',
  "    list.appendChild(a);"
].join("\n");

const OLD_RENDER_TUT_TOP = [
  "function renderTutorials() {",
  '  var wrap = $("tutorial-groups");',
  "  emptyNode(wrap);",
  "  var groups = SITE_CONFIG.tutorials || [];",
  "",
  "  if (!groups.length) {"
].join("\n");

const NEW_RENDER_TUT_TOP = [
  "function renderTutorials() {",
  '  var wrap = $("tutorial-groups");',
  "  emptyNode(wrap);",
  "  var groups = SITE_CONFIG.tutorials || [];",
  '  show("tutorials-sample-banner", groups.some(function (g) {',
  "    return (g.items || []).some(function (i) { return !!i.sample; });",
  "  }));",
  "",
  "  if (!groups.length) {"
].join("\n");

const OLD_RENDER_TUT_TITLE = [
  "      a.innerHTML =",
  '        \'<span class="tr-main"><span class="tr-title">\' + escapeHtml(item.title) + "</span>" +'
].join("\n");

const NEW_RENDER_TUT_TITLE = [
  "      a.innerHTML =",
  '        \'<span class="tr-main"><span class="tr-title">\' + escapeHtml(item.title) +',
  '        (item.sample ? \' <span class="tag sample">sample</span>\' : "") + "</span>" +'
].join("\n");

const README_FILE = path.join(__dirname, "..", "..", "README.md");
const OLD_README_SAMPLE = "- **Sample data** — the shipped quiz questions and grade figures are\n  clearly marked `sample: true` and show a banner. Replace them and flip\n  the flags to `false`.";
const NEW_README_SAMPLE = "- **Sample data** — the shipped quiz questions, grade figures, notes and\n  tutorial links are marked `sample: true` and show a banner. Replace them\n  and delete the flags.";

const edits = [
  ["config block", OLD_CONFIG, NEW_CONFIG, FILE],
  ["notes banner", OLD_NOTES_BANNER, NEW_NOTES_BANNER, FILE],
  ["tutorials banner", OLD_TUT_BANNER, NEW_TUT_BANNER, FILE],
  ["css .tag.sample", OLD_CSS_TAG, NEW_CSS_TAG, FILE],
  ["renderNotes banner toggle", OLD_RENDER_NOTES_TOP, NEW_RENDER_NOTES_TOP, FILE],
  ["renderNotes sample badge", OLD_RENDER_NOTES_TAGS, NEW_RENDER_NOTES_TAGS, FILE],
  ["renderTutorials banner toggle", OLD_RENDER_TUT_TOP, NEW_RENDER_TUT_TOP, FILE],
  ["renderTutorials sample badge", OLD_RENDER_TUT_TITLE, NEW_RENDER_TUT_TITLE, FILE],
  ["README sample note", OLD_README_SAMPLE, NEW_README_SAMPLE, README_FILE]
];

let failures = [];
for (const [name, oldS, newS, file] of edits) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes(oldS)) {
    failures.push(name + " (old text not found)");
    continue;
  }
  content = content.replace(oldS, newS);
  fs.writeFileSync(file, content, "utf8");
  console.log("applied:", name);
}

if (failures.length) {
  console.error("FAILURES:\n" + failures.join("\n"));
  process.exit(1);
}
console.log("All edits applied cleanly.");