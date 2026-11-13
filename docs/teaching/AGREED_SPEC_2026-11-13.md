# MATH VISUAL (Vizy): agreed interaction spec for the next build

Date: 2026-11-13. Agreed with Haggai. **This is the source of truth for the next build.** Where it conflicts with older docs in this repo (including `docs/APP_AUDIT_AND_TEACHING_HANDOFF_2026-11-12.md` and `docs/VIZY_MEANING_IMPLEMENTATION_2026-11-12.md`), this document wins. Button wording is still to be settled in a classroom trial.

Companion documents in this folder:
- `PHONE_REVIEW_2026-11-13.md`: what is wrong with the current app on a real phone, and the consolidation to do first.
- `GENERAL_PARTICULAR_MAP.md`: the full design of the general–particular map used in activity 2.

## 0. Do this first: consolidate before adding

See `PHONE_REVIEW_2026-11-13.md`. Do not add new modules until the app has one home with one next step, one navigation and one theme. The story corner, graph lab, skill lab, guided practice and challenge bank go into one "כלים ועוד" drawer.

## 1. The principle

Vizy does not teach the student to move through screens. It trains the student to recognize a way of thinking: decide, find out what criterion produced the decision, test it, refine it, and see how a new problem connects to something already known. Once that connection is seen, the rest is technical.

Two questions drive every activity: ״מה זה אומר?״ and ״מה גורם לך לחשוב ככה?״

The app never writes out a full algebraic solution. An optional side notebook for the student's own work is acceptable.

## 2. One investigation environment, not a sequence of screens

Each activity is one environment on the phone, with three layers:

| Layer | What it is | Rule |
|---|---|---|
| **Stage** | The large interactive object: a graph (increasing vs positive) or the general–particular map (difference of squares) | Always visible. Never replaced by a new page |
| **Prompt** | The one thing to do or decide now, in a bottom panel | One prompt at a time. The relevant part of the stage is highlighted; the rest is dimmed, not removed |
| **Trail** | What the student has already discovered, as short lines | Collapsed by default, one tap to open. Nothing discovered is lost |

A progress hint ("שלב 2 מתוך 4") is fine, but steps are prompts inside the same environment, not separate pages.

## 2a. Presentation rules (Haggai's feedback on the live app, 13 Nov 03:27)

Haggai's observation: the eye goes first to the graph in the middle, and only later finds the problem in small text at the top. The page explains the method instead of letting the student move inside it.

1. **Enter through an overlay.** Each activity opens with a full-screen overlay showing the problem (or the opening question) in large text. The student's first action happens there: read the given, tap what is given and what is asked, or make the first decision. Then the overlay **shrinks, with visible motion, into a pinned strip** at the top of the stage, so the eye follows where the problem went. Tapping the strip opens it again.
2. **One focal point at a time.** At any moment the most important thing is the largest thing on screen: the problem in the overlay, then the current prompt. The given is never smaller than the controls around it.
3. **Do not explain the method. Use it.** No subtitles or boxes that describe how Vizy works or why ("משימה אחת בכל פעם. כל שכבה נשמרת...", "לא מוחקים את הדרך", "הקיצור אינו פסק..."). At most one short line telling the student what to do now. The method is experienced through the sequence of actions, not described.
4. **Stories lead into the activity; they never solve it first.**
   - A story is at most three short lines, then **one question** that makes the student make the connection themselves (for example: ״איזו בעיה כבר פתרנו שהבעיה הזאת חוזרת אליה?״), then straight into the activity.
   - Never show the solved path of the same problem before the student does it. The current story corner shows the full U for `(x+1)² − 9` with the result `(x−2)(x+4)` before the activity starts: remove that.
   - Remove the explanation boxes in the story ("קודם כול: השביל שכבר מכירים...", the closing note about shortcuts).
5. **Font sizes on desktop too.** Prompts and options must be readable without zooming; the current desktop card uses very small text inside a narrow column.

## 3. Verdicts and help

- Three verdicts plus one help button. Help is never a verdict and is never scored as wrong.
- **Default wording (build this):** each button has a short label and a small subline:
  - ״חייב להיות״ — נובע מהנתונים
  - ״תלוי״ — אפשר כך ואפשר אחרת
  - ״לא יכול להיות״ — סותר את הנתונים
- Alternative to test in class later: ״חד־משמעית!״ / ״תלוי...״ / ״אין מצב!״. Not the default: ״חד־משמעית״ is ambiguous, since a claim that cannot hold is also decided unambiguously.
- The three verdicts mean: the given forces the claim / the given does not settle it / the given rules it out. "Equivalent" and "sufficient" are not verdict buttons.
- After "תלוי", the app asks ״תלוי במה?״ and the student **builds** two cases with the stage controls: one where the claim holds and one where it fails (for example, an increasing function that is positive and an increasing function that is negative). Building both is the evidence that the given does not decide the claim. Picking from a gallery is only a fallback after one failed attempt.
- Help: ״עוד לא יודע/ת — בוא נבדוק״. It must look and sit apart from the answer options (for example, a text link under them), so it does not read as a fourth answer. "I can't tell yet" is the student's state, not a mathematical verdict: a claim can be already determined by the data but not yet worked out.
- The given is pinned on screen while the student judges.
- Not used: "שטויות במיץ" (it mocks plausible student beliefs).

## 4. Activity 1: increasing vs positive (build first)

### Stage
One large graph area with curves A and B. Both curves must truly satisfy the claims on their whole domain, not just in the drawn window: A rises and stays below the axis everywhere (shape of −e^(−x)); B falls and stays above it everywhere (shape of e^(−x)). Formulas are not shown at first. Do not use straight lines: a rising line eventually crosses the axis.

Controls on the stage, revealed when needed:
- A **moving point** on the curve, travelling left to right. Optional small figure riding on the point (settings toggle). The point is the default for grades 9–11.
- A **vertical slider** that moves a whole graph up or down.
- A **reflect** button.

### Prompts

| # | Prompt | Notes |
|---|---|---|
| 1 | ״איזו פונקציה עולה?״ A / B / אף אחת | **Do not** add "כשמתקדמים ימינה" to the question, and **do not** caption the curves "מעל ציר x" / "מתחת לציר x". Both give away a criterion and destroy the diagnosis |
| 2 | ״מה גרם לך לבחור?״ (only on this first decision) | Taps in student language, shuffled: ״היא מעל ציר x״ / ״כשזזים ימינה, היא עולה״ / ״היא נראית כמו עלייה״ / ״לא בטוח/ה״; optional free text to Haggai's inbox |
| 3 | Predict, then act | Three actions, each with a prediction **before** the control unlocks: (a) moving the whole graph up or down (״אם נוריד את B אל מתחת לציר, היא תהפוך לעולה?״); (b) reflecting the graph; (c) running the moving point along the curve, left to right, with its y-value shown changing. Predict, act, compare |
| 4 | What changed, what stayed | 2×2 taps: position / direction × moving / reflecting |
| 5 | Say the principle | Choose all phrasings that say "increasing" (words, a < b ⇒ f(a) < f(b), the moving-point sentence) and reject "the graph is above the axis". One tap: position tells us about sign, not direction |
| 6 | Build | ״צרו פונקציה שעולה ממש וכולה מתחת לציר x״ with the same controls |
| 7 | Verdicts | Given pinned: ״f עולה בכל הישר״. Claims: ״f חיובית״ (תלוי — the student builds one increasing positive function and one increasing negative function), ״a < b ⇒ f(a) < f(b)״ (חייב להיות), ״f(1) < f(0)״ (לא יכול להיות) |
| 8 | Transfer, no picture | Temperature from −8 to −3 (rose? positive?); f(x) = x − 10 on 0 ≤ x ≤ 5 (increasing? positive?) |

### Lanes
- **Fast lane:** correct choice in prompt 1 and the direction reason in prompt 2 → one confirming contrast item (a parabola above the axis that falls then rises: "increasing on the whole line?") → prompt 7 → prompt 8. A student who understood is not dragged through the investigation.
- **Investigation lane:** anything else → prompts 3 to 8.
- **Every student does transfer.** Skipping is allowed; skipping the evidence is not.

### Errors and their responses

| Student does | Likely criterion | App response |
|---|---|---|
| Prompt 1: picks B, reason "above the axis" | Position = direction | No "wrong". ״בוא נבדוק את הכלל שלך: אם הוא נכון, הזזה למטה תהפוך את B לעולה.״ → prompt 3 |
| Prompt 1: picks "neither", A is below so can't be rising | Increasing requires positive | Same investigation, starting with A: move A up, ask whether the point changed direction |
| Prompt 1: picks A, reason "looks like rising" | Shape impression | Light check: parabola above the axis, falling then rising: ״עולה בכל הישר?״ |
| Prompt 3: predicted B becomes increasing, sees the point still going down | Criterion being tested | ״הכלל 'מעל הציר = עולה' לא עבר את הבדיקה. מה כן נשאר קבוע?״ → prompt 4 |
| Prompt 6: curve below the axis but still decreasing | New idea about position only | Point walks downhill on their curve: ״מה עוד צריך לשנות?״ |
| Prompt 7: "f חיובית" → must be true | Old criterion returning | ״תראו לנו פונקציה עולה שאינה חיובית.״ Gallery includes curve A |
| Prompt 8: temperature "rose" and "positive" | Words and sign confused | ״מ־8− ל־3−: כל הערכים מתחת לאפס. עלה, אבל לא חיובי.״ Logged as transfer with help |

Rule: the first error of a kind opens a short investigation; a repeat of the same error gets a direct one-line explanation.

### Later extension (grade 11, separate short activity)
x³ + kx with one slider for k (−2 to 2) and the tangent drawn at x = 0: find k where the function still increases but has a flat tangent (k = 0). Offer ״תראו לי״ after one try. Only after the student holds the concept of increasing.

## 5. Activity 2: difference of squares on the general–particular map (build second)

### Stage
The map: specific → general structure → general rule → back to specific, laid out left to right following the equation. Five stops: S₁ `(x+1)² − 9`, G₁ `A² − B²` (A = x+1, B = 3), G₂ `(A − B)(A + B)`, S₂ `((x+1) − 3)((x+1) + 3)`, S₃ `(x − 2)(x + 4)`. A check along the bottom (x = 0 gives −8 on both ends), labelled as a check, not a proof.

The map must not fill the screen with boxes: draw it as one path with stops; only the active stop is full size; the others are small labels.

### Prompts
Lift (choose the shape from `A² − B²` / `(A − B)²` / `A² + B²`, then tap `(x+1)` as one unit and pick B from 3 / 9 / −3, with the put-back check; B = −3 is also correct), rule (revealed the first time, chosen from a small toolbox later), return (drag A and B into slots, same A in both brackets), tidy, check, transfer `(x − 2)² − 25`. Detail in `GENERAL_PARTICULAR_MAP.md`.

### Fading: the map becomes the student's own
| Stage of the student | What the map shows |
|---|---|
| First use | Full path with labels |
| After the lift is done independently twice | Only the stops (waypoints), no labels |
| Later | Empty; the student chooses how to get from the specific to the general |

### Shortcut
A student who recognizes the structure immediately can jump straight to the result. The app then asks for one piece of evidence (name A and B, or do the check) instead of the whole path.

### Pictures
The map is the main picture. The parabola is an optional second picture (vertex from `(x+1)² − 9`, x-intercepts from `(x − 2)(x + 4)`). The area model sits behind a button and, if shown, must include the rearrangement into the rectangle.

## 6. One engine for both

Both activities run on one "learning state" engine:
- a stage type (graph or map) with its controls;
- prompts with conditions for showing them (lane, previous answers);
- verdicts with evidence requests;
- a trail of discoveries;
- records per move: first try, after help, transfer independent, and the likely criterion at the start and after the investigation.

The existing layered lessons and weave lessons move onto this engine afterwards, not in the same pass.

## 7. Build order

1. Consolidation from `PHONE_REVIEW_2026-11-13.md` (one home, one nav, one theme; park the drill; fix the wrong graph in guided practice).
2. Activity 1 as a full interactive prototype **built on the general engine of section 6, not as a one-off page**: first diagnosis, investigation, response to errors, demonstration, transfer, and the student's saved thinking path. No new stations or explanation screens until it is checked that students understand what they are doing.
3. Activity 2 on the same engine.
4. Classroom trial with both activities; settle button wording (set A vs set B) and the moving point vs figure.
5. Then: photo intake end to end; moving the older lessons onto the engine.

## 8. Triangle and U: two different pictures, keep both

The "משולש כלל ופרט" Haggai draws in class and the U-shaped map are **not** the same thing, and the map must not replace the triangle.

- **The triangle is the map of knowledge.** The rule is at the top; the classes, cases and examples sit beneath it. Levels nest: what is a rule at one level can be a case at a higher level. It answers: *where am I in the mathematical world?*
- **The U is the path of action.** Specific → recognize the general structure → use the rule → back to the specific. It answers: *what is my next move?*

They complement each other. In the app, the U is the stage of activity 2; the triangle is a separate view the student can open to see where this case sits among others (for example, `(x+1)² − 9` and `x² − 16` as two cases under `A² − B²`, which is itself one case of "special products"). Build the U first; design the triangle view with Haggai before building it.

## 9. Still open

- The exact form of the triangle view (section 8), to be designed with Haggai.
- Final verdict wording after the classroom trial.
