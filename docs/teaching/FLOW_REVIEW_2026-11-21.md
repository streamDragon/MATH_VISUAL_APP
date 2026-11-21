# Flow review: how clear, simple, beautiful and flowing the lessons are (21 Nov 2026)

Walked on iPhone 13 profile at 390×664 (a short phone), plus 360×640, 390×844 and 430×932. Both inquiry lessons: difference of squares (grade 9, the U map) and increasing functions (grade 11). Main at 5693c22 plus the fixes below.

## Fixed in this pass

| Problem | What the learner saw | Fix |
|---|---|---|
| Pinned stage on short phones | The question arrived at the bottom edge with no answers visible. On scrolling, everything slid under the pinned picture; only about 230px was left for a 330px prompt. | On phones (≤700px wide) the stage stays in the page. Each new step, and each answer, scrolls so the whole prompt (or the feedback and "ממשיכים") sits above the bottom bar, never pushing the question off the top. Tablets and desktop keep the pinned stage. |
| Stage capped at 54dvh with its own scroller | In the slot step, the slots were cut off inside the picture box: two scrollers, and the task hidden. | No inner scrolling on phones; the stage is compacted instead. |
| Play chip inside the picture | A large "0:20 לשחק" pill sat in the middle of the map on every step. | Moved to its own row under the lesson header, outside the picture. |
| Slot step | Four bare `__` boxes: the rule's shape was invisible. | It now shows `( A − B )( A + B )`, and empty places show their letter. |
| Triple brackets | `(((x+1)) − (3))(((x+1)) + (3))` | `((x+1)−3)((x+1)+3)`. For B=−3: `((x+1)−(−3))((x+1)+(−3))`, the same in the map node, the feedback and the tidy step. |
| Formulas inside Hebrew sentences | The bidi algorithm reordered the maths: `(x+4)(x−2)` instead of `(x−2)(x+4)`, `25 − ²(x−2)`, and the slot feedback as `(3+(x+1))(3−(x+1))`. | `VizyLtr.mixed()` isolates each formula run in the lesson after every paint. |
| Hints that gave the answer | A wrong tidy step said `(x+1)−3=x−2, (x+1)+3=x+4`. | It now asks "כמה זה (x+1)−3? ומה בסוגר השני?", following the chosen B. |
| Sticky hover on touch | After tapping a wrong first answer, it stayed lime, the "right" colour. | Hover colour only on devices that really hover. |

Tests: `tests/inquiry-short-phone.spec.ts` checks that at 390×664 and 360×640 every step arrives with the question and all prompt buttons on screen, not covered, with no clipped stage. It also checks the bracket forms and that the tidy hint doesn't give the answer.

## How it is now, on Haggai's five questions

**מובן (understandable): good, with two gaps.**
- One short question per screen, and the map always shows where we are (general ↔ our case).
- Gap 1: the map's six small grey labels (התבנית הכללית, הזהות הכללית, המקרה שלנו, מציבים במקרה שלנו, מזהים מבנה, חוזרים לפרט) are at about 10px. A 9th grader will not read them, and the meaning of the U lives in them. Show only the active place's label large, and the others as one word.
- Gap 2: "מהו A? געו בביטוי השלם" asks the learner to touch, but the answer is also a button below. Two ways to answer one question; pick one (touching the chip in the map is the better one).

**פשוט (simple): the step is simple, the screen is not.**
- Each step is one question, two or three answers, and one continue button.
- But one phone screen carries about 12 regions: app header, lesson header, play chip, given strip, the 4-place map with arrow labels, an A/B note, "עוד דרך לראות", the question, answers, help link, trail and restart, plus the bottom bar.
- Remove from the lesson screen:
  - the A/B note, which repeats the chips;
  - "עוד דרך לראות", which belongs in the trail or the end screen;
  - the app header, since the lesson header is enough.

**ברור (clear): now clear.**
- Formulas read left to right everywhere, the slot step shows the rule's shape, and progress reads "6 / 10".
- One remaining point: the check step states the result for the learner ("בשני הצדדים נקבל −8"). Ask them to compute one side instead; it costs one tap and makes the check theirs.

**יפה (beautiful): consistent, but lime is overused.**
- Cards, type and the dark ground hold together.
- Lime appears on three things at once: the "ממשיכים" button, the active "כלים" tab in the bottom bar and the "לשחק" chip. Lime should mean only "your next action". Use a neutral active tab inside lessons, and an outline chip for play time.

**זורם (flowing): fixed for phones, one rhythm issue left.**
- Every step now lands with its work in view.
- The rhythm is: tap an answer, read the feedback, then tap "ממשיכים", about 20 taps per lesson.
  - For a wrong answer the stop is right: it is the moment to think.
  - For a right answer, the feedback could fold into the next question (shown above it as the trail line) without a second tap.
- In the increasing lesson's verdict step, the learner builds two examples on the graph and then answers. "שתי הדוגמאות מוכנות" sits below the fold until they scroll, which is acceptable because it is a two-part step.
- The end screen ("מה הבנת?") shows counts ("הצלחות בניסיון ראשון 9"). It should show what was discovered: the general form, our case and the new case on one line. That is the meaning, not a score.

## Next, in order
1. Map labels: the active place's label large, the others as one word.
2. One way to answer "מהו A?".
3. Lime only for the next action.
4. Right answers advance without a second tap.
5. The end screen shows the discovery, not counts.
6. The check step asks the learner to compute one side.
