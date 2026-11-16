# Vizy continuation audit / 2026-11-16

Status: **PARTIAL**. Source of truth: `docs/teaching/AGREED_SPEC_2026-11-13.md`.

## Baseline and ownership

- Confirmed connected Windows repository `C:\Users\nlpis\wkspaces\MATH_VISUAL_APP` on `main`. At start local HEAD was `7fa5430` (Agent 2 glide/playtime), while remote `origin/main` was `8084117` (Claude architect ownership registration). Fetched and merged the remote docs with local game work (merge `96d8eac`); no new branch created.
- Read AGENTS, README, approved spec, phone review, general-particular map, inquiry implementation/QA, work split, and the earlier handoff. The approved spec overrides older documents.
- Existing inquiry: shared `vizy-inquiry-core.js`, increasing-vs-positive graph, difference-of-squares U map, first-decision overlay and pinned given, fast/investigation routes, local progress, Playwright journeys. The triangle of knowledge remains explicitly unimplemented and requires Haggai's design agreement.
- Current owner **Claude architect (in progress)** owns inquiry core, graph, map, feedback, entry, and related scripts. Agent 3 owns home/theming; Agent 2 owns glide/playtime. No edits to those owned source files were retained.

## Verified checks and interpretation

- **VERIFIED COMPLETE**: baseline `npm test`: 64/64 passed, including glide/playtime and both inquiry engines. Follow-up run with temporary test (later reverted to avoid the in-progress Claude-owned files): 65/65 passed.
- **VERIFIED COMPLETE**: `npm run check:questions`: 21 authored questions validated.
- **VERIFIED COMPLETE**: `npm run build`: Vite build completed at baseline; rerun recorded separately after the final changes.
- **VERIFIED COMPLETE**: Windows `py -3 tests/question_import_test.py`: 4/4 passed. Previous `npm run test:import` called `python3`, resolving to the Windows Store app alias and did not actually run tests despite exit status 0. Fixed with `scripts/run-python-tests.mjs` and updated `package.json`. **Verified** new `npm run test:import` executes 4 actual Python tests on Windows. Re-run on Unix in CI remains advisable.
- **PARTIAL**: baseline 18 targeted Playwright cases: 9/9 mobile-iphone13 passed (Chromium/Edge emulating an iPhone 13); 9/9 desktop-chromium failed **before test launch** because Playwright's bundled Chromium is not installed at the expected path. Thus none of those 9 failures establish a product regression. Physical iPhone/Safari and Android/Poco F6 were **not** tested.
- **PARTIAL**: broad mobile suite (103 tests) exposed at least two failures in `tests/focused-home.spec.ts`, at 320 and 390 px: test attempts to click hidden `.library-toggle`; this appears an outdated assumption after the consolidated optional library was hidden, in Agent 3's home scope. Run stopped before completing the whole suite to avoid long, repeated timeouts. Do not claim the other 101 passed.
- **PARTIAL**: Playwright captured baseline QA images `test-results/vizy-investigation-first-320.png`, `-390.png`, `-412.png`, and `test-results/vizy-live-audit-320x568.png`, `-390x844.png`, `-904x407.png`, `-1366x768.png` locally during targeted tests. Screenshots are browser emulation, not physical-phone QA. No reliable complete before/after **design** comparison exists because the protected visual files were not edited.
- **PARTIAL**: Vercel project `math-visual-app` latest observed production deployment `dpl_J97ntVELfNMiiTFYKFqBRYchTG7W` READY on GitHub `main` commit `8084117`. Local glide `7fa5430` and this pass were not published. READY alone does not prove student learning or photo intake.

## Observed defects and handoff to active owners

1. **BLOCKED by architect ownership**: `public/vizy-inquiry-core.js` `summary()` counts transfer records named `transfer`, `temperature`, `linear` but the map writes `transfer:parts` and `transfer:result`. Successful difference-of-squares transfer may be reported as `0 / 0`. Fix should count a completed two-part transfer, mark it independent only when both steps passed on the first try without help. This was prototyped and unit-tested, then reverted because architect has active exclusive ownership.
2. **BLOCKED by architect ownership**: `public/vizy-inquiry-map.js` `stage()` displays `בדיקה אינה הוכחה` in the check strip **before** the student answers whether checking x=0 constitutes proof. This cues the answer. Show numeric evidence and ask what follows, reveal the conclusion only after response. Temporary fix and browser regression assertion were reverted to respect the architect's file ownership.
3. **PARTIAL**: `tests/focused-home.spec.ts` clicks a hidden `.library-toggle` at mobile widths, likely superseded by the current single-home drawer. Ask Agent 3 to confirm intended accessible route, then update tests or product accordingly. Do not remove useful library functionality merely to pass stale tests.
4. **PARTIAL**: desktop Chromium runner is missing, while mobile-iphone13 Playwright is actually configured to run Chromium via Edge on this machine when `PLAYWRIGHT_CHROMIUM_PATH` is set. Add/install supported Chromium or explicitly use browser executable; distinguish emulation from Safari.
5. **BLOCKED**: real photo submission, private upload, moderator receipt, cross-account authorization and publication loop were not executed with real Supabase test identities. No receipt or email delivery claims.
6. **PARTIAL**: Graphify generator was documented as stale with hard-coded SHA and incomplete reasoning flow; still requires refresh and assertion coverage.
7. **PARTIAL**: graph's later `x³` derivative distinction and separate knowledge triangle have not been implemented/verified here. Existing core shows accurate increasing-vs-positive examples and U-path, not proof of full contract compliance.

## Files changed in this pass

- `package.json`: portability fix to make `npm run test:import` invoke actual Python on Windows.
- `scripts/run-python-tests.mjs` (new): Windows `py -3` fallback and cross-platform Python runner.
- This report: `docs/teaching/VIZY_AGENT_CONTINUATION_2026-11-16.md`.
- `docs/teaching/WORK_SPLIT.md`: ownership ledger entry, if applied with this commit.
- Merge commit `96d8eac` reconciles previously divergent `main` histories. Final patch commit recorded by `git log`.

## Next work / acceptance

1. Claude architect: correct map transfer scoring and premature proof disclosure on owned `public/vizy-inquiry-core.js` and `public/vizy-inquiry-map.js`, add unit + Playwright assertions, verify before/after at 320/390/412. Acceptance: completed first-try transfer reports 1/1, assisted transfer reports 0/1, check-stage does not pre-disclose conclusion.
2. Agent 3: own `learn.html`, `learning-app.js`, styling and `tests/focused-home.spec.ts`; resolve hidden library toggle and verify one prominent CTA, stable RTL nav at 320/390/412 and desktop.
3. Agent 2: independently certify glide/playtime navigation and persistent bank as part of the full mobile suite, without changing the reasoning paths.
4. Available unowned QA files: correct Playwright browser environment, re-run `npm run test:e2e -- --workers=1` and classify each actual failure with reproducible traces.
5. Before publishing: complete physical Android photo/editorial receipt and moderator permission tests with synthetic media and real private backend, plus full production-route QA. Verify Git SHA and Vercel deployment before release.

**No release performed.** This is a verified partial engineering pass, not a claim that Vizy's full educational contract is complete.
