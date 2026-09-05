# T&L@Biomed — course hub

A free, static course site for **Teaching & Learning @ Biomedicine**. One
self-contained `index.html` — no server, no database, no cost. Put it on any
static host (GitHub Pages, Netlify, Cloudflare Pages) and it works.

**Tabs**

| Tab | What it is | Visibility |
|---|---|---|
| Notes | Link cards to lecture notes and readings | Private (passcode) |
| Mock Quiz | Interactive multiple choice, instant correct/wrong feedback, score + review | Public |
| Grade Distribution | Past years as an interactive bar chart (ECharts) | Private (passcode) |
| Structured Tutorials | Tutorial links grouped by topic | Private (passcode) |

**Interactive features**

- Mock quiz: instant correct/wrong feedback, per-question explanations, progress bar, timer, keyboard shortcuts (keys 1–4 to answer, Enter to continue), optional question/answer shuffling, and a score ring with full answer review.
- Attempt history: best score and attempt count are stored on the student's own device (localStorage) — nothing leaves the browser.
- Notes & tutorials: live filter boxes — type to narrow note cards and tutorial groups.
- Grade distribution: chart/table view toggle, plus counts/percent toggle for fair cross-year comparison.
- Dark mode: footer toggle, remembered per device.
- Toasts and a "Copy link" button in the footer for sharing the site.

## Project layout

```
tlbiomed-site/
  index.html        the whole site (config + markup + logic)
  package.json      test runner only
  tests/            BDD / TDD / smoke test suite (Node built-in, zero deps)
  README.md         this file
```

## Editing your content

Everything you publish lives in `SITE_CONFIG` at the top of `index.html`.
Edit that one block and redeploy — no code changes needed.

- **Notes** — `SITE_CONFIG.notes`: a list of `{ title, desc, url, tags }`.
- **Tutorials** — `SITE_CONFIG.tutorials`: groups of `{ topic, note, items: [{ title, desc, url }] }`.
- **Mock quiz** — `SITE_CONFIG.quiz.questions`: `{ id, prompt, options[2–6], answerIndex, explanation }`. `answerIndex` counts from 0. `shuffle` reorders questions, `shuffleOptions` reorders answers within each question (correctness is tracked automatically). Set `quiz.sample` to `false` when you publish real questions.
- **Grade distribution** — `SITE_CONFIG.grades.years`: one entry per past year, `{ year, cohort, distribution: { "A+": 8, "A": 21, ... } }`. Counts must sum to `cohort`. `failBands` lists the failing bands (default `["F"]`). Set `grades.sample` to `false` when you publish real figures.
- **Passcode** — `SITE_CONFIG.passcode`. Empty string `""` opens the private sections to everyone.

### Validate after every edit

```bash
npm test
```

The suite checks: every question is well-formed and has a valid answer;
grade counts sum to their cohorts; links are real `http(s)` URLs; the page
stays a single self-contained file; dependencies stay on the locked
whitelist (ECharts via jsDelivr + SRI, fonts via the mirror). If a test
fails, fix the data before deploying — a typo cannot reach students.

## Deploying (free)

The site is fully static. Cheapest paths:

1\.\ \*\*GitHub\ Pages\ \(auto\)\*\*\ -\ a\ ready-made\ workflow\ is\ included\ \(`\.github/workflows/deploy\.yml`\)\.\ Create\ a\ repo,\ push\ this\ folder\ \(default\ branch\ `main`\),\ then\ in\ Settings\ ->\ Pages\ set\ Source\ to\ \*\*GitHub\ Actions\*\*\.\ Every\ push\ after\ that\ deploys\ automatically\.\ Free\ at\ https://<you>\.github\.io/<repo>/\.
2. **Netlify Drop** — drag the folder onto `app.netlify.com/drop`. Free.
3. **Cloudflare Pages** — direct upload or Git connect. Free.

### Custom domain later

The code is domain-agnostic — point any domain at the host whenever you
want. On GitHub Pages add a `CNAME` file or set the custom domain in
Settings. (If `whiteboard.com` is the name you have in mind, check whether
it is registered to you first — otherwise grab a close free variant and
attach it later.)

## Notes & limitations

- **The passcode is a light gate, not real security.** It stops casual
  browsers, but anyone who opens the page source can read the passcode.
  Fine for sharing materials with a class; don't put truly sensitive data
  behind it.
- **Sample data** — the shipped quiz questions, grade figures, notes and
  tutorial links are marked `sample: true` and show a banner. Replace them
  and delete the flags.
- Chart years: the colour ramp supports up to 5 years before it cycles;
  keep past years ≤ 5 per chart view (the "All years" view shows them all).

## Development

- Node ≥ 18 is needed only to run the tests; the site itself is plain
  HTML/CSS/JS with no build step.
- `tests/helpers/extract.js` loads the page's core script into a sandbox
  and exposes the pure logic (`evaluateQuestion`, `computeScore`,
  `gradeStats`, `bandSort`) — the same functions the page runs.
