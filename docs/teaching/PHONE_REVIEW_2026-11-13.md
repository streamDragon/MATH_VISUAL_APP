# MATH VISUAL (Vizy): review of the app on Haggai's phone, 13 November 02:36

Basis: 12 screenshots from Haggai's phone, matching `main` at `ca0dd0a` (story corner added). Compared with `AGREED_SPEC_2026-11-13.md`.

## Verdict

Each piece is reasonable on its own, and some are good. Together it is not one app: it is five or six separate products with different looks, different navigation and different ideas of what a step is. The student is offered a menu of systems instead of one next thing to think about. Stop adding modules and consolidate.

## What is wrong, from the screens

1. **No single next step.** The home asks "במה מתאמנים היום?" and shows five equal tiles (story corner, graph lab, skill training, guided practice, Vizy challenges), a "למפת השאלה" button, "הצגת כל האתגרים" (24), and a robot saying "בוחרים משהו אחד קטן ומתחילים" next to five choices. The meaning lessons (increasing, slope −4) are not visible on the home screens shown.
2. **Three different bottom navigations.** Home: אתגרים / המסלול שלי / בקשת שאלה / מסלולים. Skill lab and practice: בית / גרפים / יכולת / תרגול. Problem map: בית / תרגול / יכולות / מפה. Two visual themes: dark for most pages, light for the problem map.
3. **Guided practice is still the old drill, and its graph contradicts the question.** "נתונה f(x)=x²−4. מהו f(0)? מציבים x=0. מה מתקבל?" with a typed answer: the action is given before the meaning. The graph under it shows a different parabola, vertex (−3, −4), with a note that "the question refers to x²−4". A student is shown the wrong function.
4. **Skill lab is a naming quiz.** "x² − 16 · איזה כלי מתאים כצעד ראשון?" with "הפרש ריבועים" among the options: the student matches a name, not a structure, and "דוגמה 1 מתוך 8" repeats the same surface form. The strip "זיהוי ← מבנה ← כלי ← פתרון" ends in "פתרון", which the app does not do.
5. **The problem map page is one long scroll of several systems:** error cards with four tabs, the word-tapping step, the "נקודת עצירה" block, the draggable parabola, and a footer saying "המשך העמוד: כלי התנסות נוספים". Each screen has several competing buttons (hint, restart, continue, previous, hide, share, reset).
6. **Too much explaining text.** Headers explain the method ("כאן מאמנים יכולת אחת: לזהות..."), footers explain privacy and AI ("ללא חשבון או AI בזמן התרגול"). Students do not need either to start.
7. **The story corner tells the moral instead of asking for it.** The kettle story fits "connect a new problem to a path already solved", but its question has two options, one of which states the moral. Better: give a new problem and ask which solved problem it reduces to.

## What is good and should stay

- Error card verdicts ("יש כאן טעות / נכון אבל חסר תנאי או שלב / נכון כפי שנכתב") and "לא כל קטע מכיל טעות".
- The word-tapping step "מה נתון ומה מחפשים?" and the four unknowns (x, y, f′(x), a: "?", "לא זוהה").
- "הנתונים קובעים: פונקציה אחת מתוך אינסוף / הסקנו עד כה: עוד כלום": the determined vs derived distinction.
- "אנחנו עדיין לא בטוחים, וזה בסדר" as a legitimate stopping point.
- The draggable parabola family for the extremum lesson.
- The story corner itself, as optional content.

## What to do: stop adding, consolidate

1. **One home, one next step.** The first screen shows one activity: the next meaning activity for the chosen grade. Everything else (graph lab, skill lab, guided practice, challenges, stories) goes into one "כלים ועוד" drawer.
2. **One navigation, one theme** across all pages.
3. **Park the old drill:** remove guided practice and the skill-lab naming quiz from the main path until rebuilt on the spec. Fix the mismatched graph in guided practice now, since it shows students the wrong function.
4. **One activity per page.** Split the problem map into separate activities reached from the home; no long scroll.
5. **Cut method explanations and disclaimers** from student screens; keep one line where it helps the student act.
6. **Then build activity 1 of the spec** (increasing vs positive) in the single-environment form.
