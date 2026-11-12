# Vizy meaning weave: implementation, November 12, 2026

## Scope and authorship
This is a focused development increment inside the existing `problem-map.html` assessed route. It does not add a second home page, remove the original graph workspace, turn on generative AI, or require a full algebraic solution.

Haggai's classroom observation is that students confused an increasing graph with a positive graph. The other two examples, slope -4 at a point and a complete expression in a difference of squares, are authored teaching cases. These have not yet been tested on real students.

## What is implemented
- Grade 11 `problem-map.html?lesson=increasing`: words, several example graphs (possible graphs, not equivalent functions), classification of necessary/sufficient/equivalent/compatible/contradictory relations, and an unseen x^3 transfer. Positive derivative everywhere is sufficient, not necessary, for strict increase of a differentiable function.
- Grade 11 `problem-map.html?lesson=slope-minus-four`: at some point c the tangent has slope -4. Tangent rise/run is numerical and local. Height f(c) is not -4 by implication; a curved function need not fall by four over a full unit. Includes changed-function transfer.
- Grade 9 `problem-map.html?lesson=difference-squares`: whole subexpression as a unit in (x+1)^2-9, multiple equivalent expressions, two-part factor building without typing, relation classification, changed-example transfer.
- Updated `ability-picker.js` points the current home CTA at these grade-appropriate meanings, while existing practice and the full original graph workspace remain.
- Independent completion, completion with help/retry and independent transfer are separately recorded in local browser state. Retained layers are available in an expandable panel. These are interaction signals, NOT evidence of durable mastery.
- New JS modules are deliberately small and loaded by the existing `problem-map.html` and `problem-map-flow.js`; the old assessed extremum and error card routes still work.

## Photo/request pipeline and limits
`learn.html#requests` has both choose-file and camera-capture inputs. The existing private Supabase Storage upload must complete before `learning_submit_request` can return a UUID. No acknowledgement is shown before the RPC returns a UUID. Successful receipts show the UUID. Unsent drafts explicitly say they were NOT sent. Previous promises of a response in 24 hours are removed. Moderator UI shows ID, signed private image link and any linked published activity.

**Live operation not yet verified:** real camera permission and capture on a physical Poco F6, sign-in email, schema migration in the actual Supabase project, actual Storage/RLS cross-user isolation, real submission receipt, moderator sign-in, queue visibility, publishing and linked learner access. The existing SQL migration/seed and `docs/REMOTE_BACKEND_SETUP.md` remain prerequisites. No production request or privileged DB change was attempted.

## Verification
Tests: `npm test`, `npm run check:questions`, `py -3 tests/question_import_test.py`, `npm run build` and selected desktop/mobile Chromium Playwright routes. Check actual results recorded in the latest commit report, rather than assuming local browser emulation equals a real iPhone or Android camera. Chrome iPhone13 viewport emulation is not WebKit.

## Graphify
`scripts/generate-graphify.mjs` now derives the branch/SHA rather than embedding an obsolete fixed SHA. Legacy fake feature nodes are removed. New meanings are labeled as implemented in the findings, while the Supabase production validation gap remains explicit. Regenerate after staging files with `node scripts/generate-graphify.mjs`.

## Scope not claimed
No objective transfer study, classroom success data, external review of all math content, audited running live backend, Android APK, billing, cohorts or real device camera verification.
