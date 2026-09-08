# Changelog

All changes to T&L@Biomed, newest first. Each entry names the abbreviated
commit hash — full history via `git log`. Test counts refer to `npm test`
(64 at HEAD).

## 2026-09-09

- **eafbc3d** — UX round: quiz intro is now bilingual (copy lives in `LANGS["quiz.intro"]`, i18n 163 → 164 keys per language); switching language mid-quiz re-renders the running question (counter, topic·difficulty tag, answer feedback) and the results review; grades “All years” shows the aggregate modal band across all selected years instead of the first year’s; docs synced (paper i18n mechanics note, dev metrics, README, footprint).

## 2026-09-08

- **9813f75** — Docs expansion round 2: paper adds startup sequence, verbatim deploy.yml and an access-model figure; dev guide adds an artifact-footprint chart and three PowerShell quirks.
- **f008c29** — Docs expansion: paper adds quiz-taxonomy (topic×difficulty) and difficulty figures plus a deployment-migration callout; dev guide adds ADR-07–11, a difficulty-dimension section and a deployment postmortem.
- **1485931** — Fix Pages artifact: upload the site root (single path); deploy goes green.
- **7e78938** — Enable Pages (source: GitHub Actions); retrigger deploy.
- **74e89d0** — Deploy all three site pages (index / paper / development) via the Pages artifact.
- **f9b59a8** — Round 4: quiz 40 → 45 questions (musculoskeletal, clinical chemistry, cell biology, biochemistry, genetics); difficulty dimension (`basic` / `intermediate` / `advanced`) on every question, shown as a live topic·difficulty tag during the quiz; i18n 160 → 163 keys per language; docs and smoke test synced.
- **4f79c5f** — Docs sync: commit graphs/tables in paper + dev guide, metrics (2,522 lines / 53 functions), smoke 14 → 18, content-growth figure (17 notes / 40 quiz / 5 years).
- **98b88f6** — Quiz topic filter: subject chip row, topic tags on all questions, quiz 35 → 40 (physiology, neuroscience, statistics, infectious, reproductive); i18n 157 keys per language; smoke covers `quiz-topic-filter`.
- **d75a98e** — Content round 2: quiz 25 → 35 (respiratory, reproductive, musculoskeletal, clinical chemistry), 3 reference notes (lab values, abbreviations, writing guide), Medical Statistics tutorial group.
- **ece24c7** — Content expansion: 14 notes (Weeks 1–14), 25 quiz questions across 14 subjects, 10 tutorial groups (Anatomy, Genetics & Genomics, Endocrinology), 6 study-guide cards; i18n 136 keys per language.

## 2026-09-07

- **75c04fe** — Docs sync: 5 tabs, 56 tests, 127 i18n keys, 8 commits (paper + dev-guide figures, tables, footers).
- **15302ec** — Study Guide tab with bilingual educational instruction (workflow, evidence-based methods, quiz & grade guidance); 24 new i18n keys per language; smoke updated to five routes; 56/56.

## 2026-09-06

- **f008aca** — Footer links to paper and dev guide (EN + zh); smoke allows same-deploy `.html` links; 56/56.
- **0348f6b** — Development guide (`development.html`): workflow diagrams, commit timeline, test evolution, code metrics, ADRs; 4 new smoke tests (56/56).
- **170660b** — Content expansion (10 notes, 15 quiz Qs, 5 grade years); site-wide search, quiz retry-wrong-only, grade print/PDF; paper updated; 52/52.
- **0cd9612** — Technical paper (`paper.html`): architecture, test, grade, i18n and deployment graphs; 4 new smoke tests (52/52).
- **cb85dec** — Sample subjects expanded (8 notes, 7 tutorial topics, 10 quiz questions); full English / 繁體中文 i18n with auto-detect.
- **0abd8fe** — Interactivity: shuffled quiz options, timer, keyboard shortcuts, attempt history, notes/tutorials filters, grade chart/table + counts/percent toggles, dark mode, toasts, copy-link.
- **a8cdd7b** — Initial course hub: notes, mock quiz, grade distribution, tutorials; 48 tests.
