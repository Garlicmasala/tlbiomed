# T&L@Biomed — course hub

A free, static course site for **Teaching & Learning @ Biomedicine**. One
self-contained `index.html` — no server, no database, no build step, no cost.

**Live at <https://garlicmasala.github.io/tlbiomed/>** — every push to `main`
deploys automatically via GitHub Actions.

**Tabs**

| Tab | What it is | Visibility |
|---|---|---|
| Notes | Link cards to lecture notes and readings | Private (passcode) |
| Mock Quiz | Interactive multiple choice, instant correct/wrong feedback, score + review | Public |
| Grade Distribution | Past years as an interactive bar chart (ECharts) | Private (passcode) |
| Structured Tutorials | Tutorial links grouped by topic | Private (passcode) |
| Study Guide | Bilingual study guidance: workflow, evidence-based methods, quiz & grade tips | Public |

**Interactive features**

- Mock quiz: instant correct/wrong feedback, per-question explanations, progress bar, timer, keyboard shortcuts (keys 1–4 to answer, Enter to continue), optional question/answer shuffling, and a score ring with full answer review.
- Topic filter: a chip row filters the question pool by subject (19 subjects); every question carries a topic tag and a difficulty tag (basic / intermediate / advanced).
- Retry-wrong-only: after an attempt, re-attempt just the missed questions.
- Site-wide search: one box finds matching notes and tutorial items, grouped by section.
- Attempt history: best score and attempt count are stored on the student's own device (localStorage) — nothing leaves the browser.
- Grade distribution: chart/table view toggle, counts/percent toggle, year selector (single / all), one-click print/PDF.
- Dark mode: footer toggle, remembered per device.
- Multilingual: English and 繁體中文 (163 UI keys per language), auto-detected from the browser and switchable in the footer (remembered per device).
- Toasts and a "Copy link" button in the footer for sharing the site.

## Project layout

```
tlbiomed-site/
  index.html            the whole site (config + markup + logic)
  paper.html            technical report with architecture, test & grade graphs
  development.html      development guide: workflow, commit history, ADRs, metrics
  CHANGELOG.md          every change, in order
  package.json          test runner only
  tests/                BDD / TDD / smoke test suite (Node built-in, zero deps)
  .github/workflows/deploy.yml   GitHub Pages deploy on push
  README.md             this file
```

## Editing your content

Everything you publish lives in `SITE_CONFIG` at the top of `index.html`.
Edit that one block and redeploy — no code changes needed.

- **Notes** — `SITE_CONFIG.notes`: a list of `{ title, desc, url, tags, sample }`.
- **Tutorials** — `SITE_CONFIG.tutorials`: groups of `{ topic, note, items: [{ title, desc, url, sample }] }`.
- **Mock quiz** — `SITE_CONFIG.quiz.questions`: `{ id, topic, difficulty, prompt, options[2–6], answerIndex, explanation }`. `answerIndex` counts from 0; `topic` feeds the filter chips and the topic tag; `difficulty` is one of `basic` / `intermediate` / `advanced`. `shuffle` reorders questions, `shuffleOptions` reorders answers within each question (correctness is tracked automatically). Set `quiz.sample` to `false` when you publish real questions.
- **Grade distribution** — `SITE_CONFIG.grades.years`: one entry per past year, `{ year, cohort, distribution: { "A+": 8, "A": 21, ... } }`. Counts must sum to `cohort`. `failBands` lists the failing bands (default `["F"]`). Set `grades.sample` to `false` when you publish real figures.
- **Passcode** — `SITE_CONFIG.passcode`. Empty string `""` opens the private sections to everyone.
- **Language** — `SITE_CONFIG.language`: `{ default: "en", detect: true }`. `detect` auto-picks 中文 for Chinese browsers first; students can always switch from the footer. UI strings live in the `LANGS` dictionary in `index.html` — add a language by appending a dictionary with the same 163 keys.

### Validate after every edit

```bash
npm test
```

The suite (64 tests) checks: every question is well-formed with a valid
answer and a known topic + difficulty band; grade counts sum to their cohorts; links are real `http(s)` URLs; the
page stays a single self-contained file; dependencies stay on the locked
whitelist (ECharts via jsDelivr + SRI, fonts via the mirror). If a test
fails, fix the data before deploying — a typo cannot reach students.

## Deploying (free)

1. **GitHub Pages (recommended — live now).** The included workflow
   (`.github/workflows/deploy.yml`) deploys on every push to `main`; no build
   step. Source must be set to **GitHub Actions** in Settings → Pages.
   Live at https://garlicmasala.github.io/tlbiomed/.
2. **Cloudflare Pages / Vercel** — direct upload or Git connect. Free.
   (Netlify Drop is no longer usable: anonymous deploys were suspended in
   September 2026 and the upload page is CAPTCHA-gated.)

### Custom domain later

The code is domain-agnostic — point any domain at the host whenever you
want. On GitHub Pages add a `CNAME` file or set the custom domain in
Settings.

## Notes & limitations

- **The passcode is a light gate, not real security.** It stops casual
  browsers, but anyone who opens the page source can read the passcode.
  Fine for sharing materials with a class; don't put truly sensitive data
  behind it.
- **Sample data** — the shipped quiz (45 questions), grade figures (5
  years), notes (17 cards) and tutorial links (11 topics, 23 items) are
  marked `sample: true` and show a banner. Replace them and delete the
  flags.
- Chart years: the colour ramp supports up to 5 years before it cycles;
  keep past years ≤ 5 per chart view (the "All years" view shows them all).

## Documentation

- `paper.html` — technical report: architecture, feature catalogue, data
  model, i18n, testing strategy (with graphs), sample grade data, deployment
  pipeline, security & limitations, roadmap.
- `development.html` — development guide: philosophy, stack, BDD/TDD/smoke
  workflow, full commit history, test evolution, code metrics, ADRs,
  environment quirks, extension guide.
- `CHANGELOG.md` — chronological change log.

## Development

- Node ≥ 18 is needed only to run the tests; the site itself is plain
  HTML/CSS/JS with no build step.
- `tests/helpers/extract.js` loads the page's core script into a sandbox
  and exposes the pure logic (`evaluateQuestion`, `computeScore`,
  `gradeStats`, `bandSort`, `shuffleArray`, `formatDuration`, `t`, `fmt`) —
  the same functions the page runs.
