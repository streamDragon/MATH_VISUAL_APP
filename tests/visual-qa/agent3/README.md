# Vizy visual QA: Agent 3 (16 November 2026)

## Scope
- Shared deep-navy/lime/coral/sky/violet tokens, accessible text colours, three radii and soft shadows
- Offline Rubik (Hebrew and Latin, 400 / 500 / 700) under local fonts with OFL license
- Inline SVG navigation icons, quiet four-mood Vizy mascot, single CTA and grade-based journey
- Playtime and sound slots (filled by separate agents), matching inquiry and Story Corner styling
- No mathematical problem, answer, verdict, lane or teaching sequence changed

## Browser evidence
Screenshots were captured in Playwright WebKit from the local Vite server after loading the application:
- [Home, 320 × 568](home-320.png) and [Home, 390 × 844](home-390.png)
- [Increasing function, 320](increasing-320.png) and [390](increasing-390.png)
- [Difference of squares, 320](difference-squares-320.png) and [390](difference-squares-390.png)

Direct browser QA found no horizontal page overflow in those sizes, Rubik loaded from local origin only, 3 SVG navigation icons, main CTA in viewport, journey and tool-drawer handle above fixed navigation at 320 × 568.

## Tests
- `npm test`: 67 / 67 pass (at visual implementation time)
- `npm run check:questions`: 21 validated
- `npm run build`: passed
- `npx playwright test tests/vizy-visual.spec.ts --project=mobile-iphone13`: 5 / 5 pass
- Entire mobile suite: **72 passed / 37 failed** across 109 tests. The 5 Agent 3 visual tests all passed in this same full run. Most failures concern legacy screens and deprecated expectations. Do not publish until these are triaged.
- No runtime AI, tracking, new npm dependencies or text input added.

## Known external blockers
- Supabase `learning_catalog` is blocked during isolated localhost browser QA without the required network/backend setup.
- The older home tests assume an accessible challenge library and .ability-extra while the existing consolidated UI deliberately hides those under the tools system.
- Prompt 1 owns the sound switch and progress events; this visual layer only provides the sound and playtime slots and listens for events.

## Follow-up audit: Agent 3 (16 November 2026, evening)
- Fixed navigation accessibility: the Tools control now has `aria-controls="vizy-tools-drawer"` and keeps `aria-expanded` in sync with actual drawer state.
- Opening the optional challenge bank now moves keyboard focus to its visible toggle. Screen readers no longer remain at the now-distant drawer button.
- Verified real WebKit interactions independently on an isolated Vite port (4193) at widths 320 and 390: Tools open/close, URL hash and active tab, library 24 cards, English navigation, no horizontal overflow.
- All **7 / 7** visual regression tests passed on a separate test runner and output directory, without touching another agent's concurrent Playwright run.
- External localhost Supabase `learning_catalog` request still emits an access-control error; this is not cured by visual styling.

### Historical full-suite failure classification (from earlier 109-test run)
The 37 failures must not all be called product defects or all be waived as obsolete. They group as: home/focused routes (3 focused, 2 grade-next, 3 learning-flow, 4 mobile-polish, 2 student-next, 3 unified-home, 1 unified-mobile, 3 mobile-navigation: 21); seven legacy problem-map assertions; two shared-graph tests; three story tests; three buddy tests; one investigation-entry test (16). Prioritize checks for actual user-visible breakage and migrate truly obsolete assertions to the agreed one-home/one-CTA interface.

In particular, `tests/focused-home.spec.ts` tries to click `.library-toggle` while `#challenges` is intentionally hidden and accessible only from `#vizy-open-bank`. `tests/grade-next-mobile.spec.ts` tries to click `.ability-extra`, explicitly removed by the unified first-screen design. Such test failures do not by themselves prove the newer interaction is broken. The independent WebKit run confirmed that the actual Tools → Challenge bank path works, and the new regression test protects it.

Release gate remains **on hold** pending full cross-agent QA; no deployment or remote Git push was performed by Agent 3 in this follow-up.

## Journey correction: 16 November 2026
- Identified an actual UX mismatch: grade 9 home opened the difference-of-squares inquiry but the journey started with an unrelated challenge-bank card; grade 11 had the analogous increasing-functions mismatch.
- The first stop is now the exact lesson and label of the main CTA. Available challenge-bank tasks appear afterwards, filtered by the selected grade. Locked items are not represented as playable tasks.
- Completion of the primary stop reads the existing saved inquiry state, checking that the saved route is at `done`. No new learning state or fabricated completion events.
- Completed primary and completed optional tasks can be revisited; unfinished future tasks remain decorative, not clickable.
- Verified in WebKit screenshots: [Grade 9 / 390](journey-grade9-390.png) and [Grade 11 / 390](journey-grade11-390.png).
- Isolated visual tests: **11 / 11 passed**. Unit tests: **67 / 67 passed**. Question bank: **21 validated**. Production build: **passed**.
- Only `public/vizy-unified-shell.js`, `tests/vizy-visual.spec.ts` and QA evidence were changed. No teaching prompt, grading verdict or activity sequence changed.
- Whole-app release hold remains in effect until cross-agent QA failures are reconciled.
