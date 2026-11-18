# Vizy: status review, 18 November 2026 (Claude)

Basis: `main` at `c8236c0` (18 Nov 06:01), run locally in Chrome at iPhone 13 size with the service worker off; code read; 68 unit tests and the build pass. Not checked: a real phone, the real photo backend, Android, and whether the live Vercel site is on this commit. Compared with `AGREED_SPEC_2026-11-13.md`.

## Verdict

A big step forward since 13 November. The home screen and the "increasing vs positive" activity now follow the agreed spec closely. But the app is growing sideways again: in five days it gained a game, a play-time bank, a journey strip, a mascot and a new algebra module, while the classroom trial and the general–particular map activity (activity 2 of the spec) have not happened. The newest module (`algebra-worlds`, added this morning) breaks several agreed rules. One display bug is live on the main grade 9 path.

## What is good

1. **The home is consolidated.** One main action ("בואו נבדוק"), a grade switch, one "כלים ועוד" drawer, one bottom navigation (בית / שאלה / כלים), one theme. This was the first item of the phone review.
2. **The increasing activity matches the spec.** The first decision is asked in an overlay with no giveaway ("איזו פונקציה עולה?", no "כשמתקדמים ימינה", no captions on the curves). The curves are a true mirror pair (below and rising / above and falling, both levelling off at the axis). Verdict buttons are "חייב להיות / תלוי / לא יכול להיות". There is predict-before-act, building cases, and a criterion record.
3. **Process is healthy.** A shared work-split file, honest QA notes that say PARTIAL when something was not verified, and no release while broad QA is unfinished.
4. **Tests:** 68 unit tests pass and the build succeeds.

## Problems, in order of importance

1. **Live display bug on the main grade 9 path.** In the difference-of-squares lesson, the answer `(A−B)²` is displayed as `²(A−B)`, and the expression `(x+1)² − 9` is drawn with gaps (`( x+1 ) ² − 9`). This is the first screen behind the home's main button for grade 9.
2. **The new module "מפרקים כדי לצמצם" (`algebra-worlds`) breaks agreed rules:**
   - The big exercise and the question heading ("מה אסור להציב?") are drawn in dark grey on dark blue and are almost unreadable, yet the first question is about that exercise.
   - The play-time badge (0:00) floats on top of an answer button.
   - Hints give the answer ("מחפשים שני מספרים שמכפלתם −8 וסכומם 2. אלה 4 ו־−2"). Together with four factorizations in a row, this is the full algebraic solution path that Haggai ruled out.
   - It opens with a large compound exercise and a domain question, the opposite of "experience → decision → why".
   - It is labelled "כיתה ט׳", but dividing algebraic fractions with a non-monic trinomial and domain restrictions is grade 11 material in Haggai's own lesson list.
   - "בית" appears twice (header and bottom navigation).
   - Good part to keep: it uses Haggai's own terms "עולם הועודים / עולם הכפולים".
3. **Teacher pages are in the student's drawer.** "תור המורה" and "ניהול הבנק" are listed with the student's tools.
4. **The old lesson is hidden inside the new pages.** The inquiry pages still contain the whole old extremum lesson, invisible: a second `h1` and about 15 more headings. Screen readers read it; the page heading outline jumps from `h1` to `h3`.
5. **Unlabelled numbers on the home.** "המסע שלי" shows a "1" and a "0:00" with no word saying what they are. A student will not know that 0:00 is earned play time.
6. **Sound is on by default** ("צלילים פעילים"). In a class with 30 phones this may be a problem. This is Haggai's decision.
7. **The game and play-time bank are not in the agreed spec.** They may be a good idea, but they were not discussed with Haggai in the spec and they shift the reward from thinking to playing. Haggai should decide whether they stay.
8. **Not verified:** real photo sending and the teacher inbox, Android, and which commit the live site runs.

## Status of my own task (Prompt 1)

My feedback code was not pushed. Commit `c8236c0` added its own `vizy-sound.js` and removed the old progress bridge, so I will not push my sound or celebration files. What is still needed from Prompt 1 is the formula left-to-right helper (fixes problem 1) and the heading fix (problem 4). Both are small and ready.

## Recommended next steps

1. Fix problem 1 now (formula direction). Claude can push this.
2. Fix the algebra module's contrast and the overlapping badge; remove hints that state answers; correct the grade label. Or pause the module until it is rebuilt on the inquiry engine and the spec.
3. Move teacher links out of the student drawer.
4. **Freeze new features and run the classroom trial** with the two spec activities. This is still the most important step, and it has not happened.
5. Haggai to decide: sound default, whether earned play time stays, and the grade of the algebra module.
