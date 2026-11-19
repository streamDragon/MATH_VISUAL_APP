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

## 3. Algebra module "מפרקים כדי לצמצם" is readable (pushed)

Problem 2 of the status review.
- Dark text on dark panels: the shell rule `body.vizy-consolidated #coreFlow` (white card, dark text) beat the module's `.aw-lesson`. The module now restates its own surface with higher specificity, and headings and formulas inherit the light text. Contrast of the exercise, the question and the title is now at least 4.5:1 (tested).
- The play-time badge floated over an answer button. It now sits in the lesson header next to "✦ תובנה".
- "בית" appeared twice. The header link is hidden on this route, as on the inquiry pages; the bottom navigation keeps it.
- Grade label changed from "כיתה ט׳" to "כיתה י״א", following `GENERAL_PARTICULAR_MAP.md` (algebraic fractions are grade 11). **Haggai can reverse this** in `public/vizy-algebra-worlds.js` and `public/ability-picker.js`.
- The four hint texts that stated the answers were no longer shown on screen but were still in the data. Removed.
- `tests/vizy-algebra-worlds.spec.ts`: the walkthrough test already failed on `main`, because it followed the module's order before 18 November. Rewritten to the current order; two new tests for contrast and badge placement. 3/3 pass.
- Not changed: the module still opens with the big compound exercise and a domain question. The review says this is the opposite of "experience, decision, why". That is a redesign, not a fix; listed under open items.

## 4. Home: the journey says what it is; teacher link out of the student drawer (pushed)

Problems 3 and 5 of the status review.
- "המסע שלי" showed a lone "1" and a "0:00" with no words. It now shows the real path for the chosen grade: the home lesson, then the grade's next three open challenges. The next stop glows, later stops are outlines, finished ones get a star. A caption beside the heading says "הושלמו X מתוך Y", and the clock is labelled "זמן משחק".
- "תור המורה" is no longer in the student's tools drawer. Opening `learn.html?teacher=1` once shows it on that device from then on.
- Fits the smallest phone (320×568): the drawer stays above the bottom navigation (tested).
- Tests fixed that already failed on `main`: both journey tests in `vizy-visual.spec.ts`; `student-next-step.spec.ts` and `unified-mobile.spec.ts`, which looked for the "buddy" figure and four tool cards removed on 16 November (now the mascot and the drawer). `unified-home.spec.ts` drawer count 9 → 8 (teacher link moved). New tests for the captions and teacher mode.

## 5. Clean-up: heading order, retired buddy, green test suite (pushed)

- Problem 4 of the status review (hidden old lesson read by screen readers) was already fixed on `main`. The one leftover: headings jumped from h1 to h3. The prompt and "מה הבנתי?" headings are now h2, with the same look.
- The purple talking "buddy" (`student-buddy.js`) was still loaded on the skill lab and guided practice, hidden by CSS. It speaks tips, which the agreed spec and design rule 8 rule out, and the lime mascot replaced it on 16 November. Removed from both pages and from the offline cache; its test now guards that no talking buddy comes back.
- `mobile-polish.spec.ts` looked for the four tool cards removed on 16 November; now checks the drawer.
- Graphify code map regenerated (last refresh was 13 November): 196 files, 213 links.
- **Full mobile browser suite: 139 of 139 pass** (two tests needed a re-run because the test browser failed to start; both pass alone). Unit tests 70/70, question check and build pass. On 16 November about 27 tests failed.

## Open items found while working

- The algebra module opens with a large compound exercise and the domain question. Rebuilding it on the inquiry engine, starting from one small experience, is a design task for an agent.

- Guided practice still has a typed answer box (`#answerInput` in `classroom-practice.html`), against the no-typing rule. `practice-page-agent-instructions-4.md` has the full plan to replace it with a draggable point.
- Haggai's decisions still open from the status review: sound on by default; whether earned play time and the game stay; the grade of the algebra module (now grade 11).
- Not checked from here: a real phone, Android, the real photo backend and teacher inbox.
