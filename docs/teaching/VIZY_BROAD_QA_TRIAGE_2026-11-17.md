# Vizy broad QA triage — 2026-11-17

Status: **PARTIAL**, production release still held.

## Source and Git baseline
- Reconnected to `DESKTOP-5J7HT7C`; live repository `C:\Users\nlpis\wkspaces\MATH_VISUAL_APP`, branch `main`.
- Local HEAD before this QA pass: `97d69b5`, 16 commits ahead of `origin/main`; `git fetch origin main` found no newer remote change, whose HEAD remains `e188034`.
- Preserve all untracked Agent 1 screenshots and agent test outputs. They are not release code and are deliberately not staged.

## Broad Playwright attempt
- Started mobile-iphone13 full suite with `VIZY_TEST_PORT=4217`, `--workers=2`, `--timeout=25000`, isolated artifacts in `test-results-full-integration`.
- **PARTIAL**: the long historical suite was stopped before completion because the shared Windows host had many browser/node processes, and the run was consuming substantial time. A zero-length redirected JSON report does **not** imply zero tests, nor prove the suite passed. Do not claim a final pass/fail count for the full suite.
- Captured reproducible failure artifacts among earlier cases in `grade-next-mobile`, `investigation-mobile`, `learning-flow`, and `mobile-polish`. A failed artifact in a concurrent full run is not sufficient by itself to diagnose a bug. Classify with isolated reproduction.

## Isolated findings and fixes
- **VERIFIED COMPLETE:** `grade-next-mobile.spec.ts` (grade 9 and grade 11) passed **2/2** on an isolated port. Grade selection persists across reload; lesson URLs lead to the intended inquiry. Earlier broad suite errors are not proven product regressions.
- **VERIFIED COMPLETE:** two updated `learning-flow.spec.ts` cases passed **2/2** on isolated port 4231. The tests were stale:
  1. Previous bank test clicked a deliberately hidden `#library-toggle`. Updated it to check the **single primary meaning CTA**, then open `Tools → Vizy challenges` before filtering grade.
  2. Previous English test relied on the retired `One small challenge` heading and hidden `.ability-extra`. Updated it to expect `One idea to explore`, inspect LTR, and enter a named lesson using the public URL.
- Both changes affect **tests only**, not teaching code or learner progress.
- **PARTIAL:** `learning-flow` prerecorded audio mute case and other broad-suite failures still require isolated reproduction and classification. Missing audio or an inaccessible hidden legacy control must not be called a product failure without checking approved UX.
- **PARTIAL:** full production backend upload, teacher inbox/receipt, physical Android, and browsers other than the tested emulation are not verified.

## Next
1. **VERIFIED COMPLETE:** focused home (3 viewports) + grade next (2 grades) passed **5/5** on isolated port 4233 after the triage. The same command subsequently passed **67/67** unit tests and the Vite production build.
2. Re-run or segment the remaining historical tests using one worker and dedicated ports, and identify reproducible errors.
3. Ask Claude architect to finish source delivery for `vizy:progress`, feedback, and LTR/math drawing; reserve the inquiry files meanwhile.
4. Only after broad QA and backend verification consider pushing local main, which automatically deploys to production Vercel.

**No push, production deployment or physical phone test was carried out in this pass.**
