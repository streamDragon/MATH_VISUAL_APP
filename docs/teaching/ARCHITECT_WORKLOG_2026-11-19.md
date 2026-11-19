# Architect work log, 19 November 2026 (Claude)

Haggai asked for one final product, improved, with a report written while working.
This file is updated with every push.

## 1. One product: merge check (20:55)

- GitHub has one branch, `main`. No open branches to merge.
- Haggai's computer (`C:\Users\nlpis\wkspaces\MATH_VISUAL_APP`): on `main`, clean, no other branches, no stash, one docs commit behind GitHub. Only untracked QA screenshots, which are not code.
- `MATH_VISUAL_BRANCH_ARCHIVE_20261112`: saved patches from the branches deleted on 12–13 November. Every code file they touch has been rewritten since, so applying them would undo newer work. Left in place as history, not merged.
- `MATH_VISUAL_SHARE_FEEDBACK_20261110`: only `node_modules`, no code.
- My own unpushed feedback code from 15 November overlapped with code another agent pushed on 18 November (`vizy-sound.js`, `vizy:progress`). Set aside; only the formula part was still missing.

**Result: `main` is the single final product.**

## 2. Formulas read correctly (pushed)

Problem 1 of `STATUS_REVIEW_2026-11-18.md`, live on the first grade 9 screen:
- The answer `(A−B)²` showed as `²(A−B)`. Cause: a formula inside a right-to-left button. Fix: `public/vizy-ltr.js` marks formula-only buttons and the formula part of "label: formula" lines as left-to-right.
- The expression showed as `( x+1 ) ² − 9`. Cause: Rubik draws brackets with wide side spacing, and the minus sign was outside the font's declared range. Fix: formulas use a tight maths font stack (`--vizy-math-font`); U+2212 added to the Rubik Latin range.
- Tests: `tests/vizy-math-ltr.test.mjs` (2), `tests/vizy-math-ltr.spec.ts` (4); `tests/vizy-visual.spec.ts` font rule updated to "Hebrew in Rubik, formulas in the maths stack".
- Checked: unit tests 70/70; the four inquiry, integration and visual spec files pass except two journey tests that already fail on `main` (see open items).

## Open items found while working

- `tests/vizy-visual.spec.ts` "journey starts with the actual home lesson" fails on `main` before any change: the journey row shows only one stop.
