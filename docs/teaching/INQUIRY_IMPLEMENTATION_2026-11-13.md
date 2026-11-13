# Vizy inquiry implementation — 13 November 2026

Source of truth: `AGREED_SPEC_2026-11-13.md`. This pass follows consolidation and replaces the **default** grade 11 increasing-vs-positive and grade 9 difference-of-squares experiences with one inquiry environment. Older meaning-weave activities remain accessible using `?lesson=increasing&legacy=1` and `?lesson=difference-squares&legacy=1`.

## Implemented

- Shared learning state machine: `public/vizy-inquiry-core.js` tracks phase, attempts, helped vs first-try, discoveries, independent transfer and criterion before/after.
- Shared one-stage UI `public/vizy-inquiry.js` and `vizy-inquiry.css`: stable stage, one active question, collapsible discovery trail, local resumption, mobile-first layout. No new home.
- Grade 11 graph adapter `vizy-inquiry-graph.js`: global examples A strictly increasing and strictly negative, B strictly decreasing and strictly positive; initial diagnosis without hints; fast/investigation routes; predictions before vertical shift, reflection, moving point; concept comparison, example construction, 3 verdicts with a separate help link, two counterexamples for depends; image-free temperature and linear transfer.
- Grade 9 map adapter `vizy-inquiry-map.js`: specific → general → identity → substitution → simplification → check, including B=−3 as valid and the difference between numerical check and proof; initial shortcut with required evidence; optional area illustration; independent transfer.
- App entry remains `learn.html`; same `problem-map.html?lesson=...` links used by grade picker. Service-worker precaches inquiry files.
- No live photo submission, phone hardware verification, or deployment confirmation is claimed by this pass.

## QA evidence

- `npm test`: 58 tests passed.
- `npm run check:questions`: 21 questions validated.
- `npm run build`: succeeded.
- `py -3 tests/question_import_test.py`: 4 tests passed.
- `tests/investigation-mobile.spec.ts`, `tests/meaning-weave.spec.ts`, `tests/unified-home.spec.ts`: 18 tests passed in Chromium via Edge at iPhone 13 viewport, with responsive widths 320, 390 and 412.
- Browser runtime used Chromium/Edge fallback because WebKit was not installed. Safari and actual Poco F6 remain unverified.

## Design discipline

The U is a **path of action**, not the same as Haggai's hierarchy triangle of knowledge. The triangle remains an open design decision and is not silently substituted by the U.
The app reports *likely* decision criteria, inferred from taps, not the child's thoughts.


## Second pass: task-first entry (13 November, later continuation)

Presentation rule 2a is now implemented using `public/vizy-inquiry-entry.js`. The first activity decision is offered in a large, accessible modal with the graph or mathematical expression. It reuses the existing answer event handlers rather than duplicating the lesson engine. On the first decision, the modal animates into a sticky given strip at the top of the stage, and that strip can reopen the given. The modal traps keyboard focus, Escape closes a reopened given, and reduced-motion preference avoids the transition. Resuming past the first decision skips the initial modal. Desktop question and answer typography is enlarged without changing the maths engine.

Checks: 58 unit tests, 21 authored questions, production build, 29 Playwright Chromium/Edge tests at iPhone-13 profile, including 320/390/412 CSS px and 1366px desktop, all passing. WebKit and a physical phone are not covered. Keep the triangle knowledge view separate from this path-of-action work.
