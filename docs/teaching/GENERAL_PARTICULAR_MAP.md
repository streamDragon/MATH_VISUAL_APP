# MATH VISUAL (Vizy): the general–particular map (מפת כלל ופרט) as a reusable interaction pattern

Date: 2026-11-13. Design detail for activity 2 of `AGREED_SPEC_2026-11-13.md`. Haggai's correction: the area model is optional; the main picture is a map of the reasoning.

## 1. What students should see

Not a picture of the object, but a picture of the reasoning:

```
        GENERAL            =             GENERAL
       A² − B²   ───────────────▶   (A − B)(A + B)
          ▲                                │
 recognize│ A = x+1, B = 3                 │ substitute A, B
 structure│                                ▼
       (x+1)² − 9                  ((x+1) − 3)((x+1) + 3)
       SPECIFIC                            │ simplify
          └──────── same value? ───────▶ (x − 2)(x + 4)
                       (check)             SPECIFIC
```

Specific → general → equivalent general form → specific, with the whole path kept on screen. This is "פרק והרכב" (see a whole subexpression as one unit), "כלל ופרט" (lift to the rule and come back), and "meaning before action" (identify the structure before any computation). The area model explains *why* the identity holds; the map shows *how a student uses* an identity on an unfamiliar expression, which is the ability the app trains.

## 2. Haggai's two sketches (inspiration, not specification)

**Sketch 1 (vertical: rule → "מציבים במקרה שלנו" → our case → result, area model on the side).**
- Good: the "המקרה שלנו" box with A = x+1, B = 3 beside the expression; the one-line idea at the bottom ("כל הפרש של שני ריבועים אפשר לכתוב כמכפלה של שני סוגריים"); the area model clearly secondary.
- Problem: it starts from the rule, so recognizing the structure in the specific expression is skipped.
- Problem: the area picture shows a big square minus a small square but not the rearrangement into the rectangle (x+4)(x−2), so it does not explain the factoring.

**Sketch 2 (U shape: our case → up "מזהים מבנה" → across "זהות הכפל המקוצר" → down "מציבים בכלל ומפשטים" → result).**
- The right picture; use it as the base layout.
- Changes: split the down arrow into **substitute** and **simplify**, showing `(x+1−3)(x+1+3)` in between (where substitution errors show); add the **close** check along the bottom ("הגענו לאותו מקום?").
- Direction: left to right, following the equation on the top row, even in a Hebrew app. Labels in Hebrew.

## 3. The pattern, in general terms

| Place | Role |
|---|---|
| S₁ (bottom left, start) | The specific expression or situation ("המקרה שלנו") |
| G₁ (top left) | Its general structure, with named parts (A, B, f, x₀...) ("התבנית הכללית") |
| G₂ (top right) | What a known general rule gives from G₁ |
| S₂ (bottom right, upper) | G₂ with the same parts substituted back |
| S₃ (bottom right, lower) | S₂ simplified ("התוצאה") |

| Move | Direction | Question to the student | What it trains |
|---|---|---|---|
| **Lift** (מזהים מבנה) | up | "Which general shape is this? What are its parts?" | Seeing a subexpression as one unit; choosing the structure |
| **Rule** (כלל) | across | "Which rule do we know for this shape?" | Choosing the tool |
| **Return** (מציבים) | down | "Put your parts back in." | Instantiation, with the *same* parts everywhere |
| **Tidy** (מפשטים) | down | "Make it shorter." | Ordinary algebra, kept separate from substitution |
| **Close** (בודקים) | along the bottom | "Did we arrive at the same place?" | Haggai's "a shortcut works only if you arrive at the same place" |

### Three precision rules built into the pattern

1. **The arrow across has a type, and the type is shown.** For an identity it is "=" and can be walked both ways (expand ↔ factor). For a theorem it is "⇒" and only one way.
2. **Conditions travel with the arrow.** If the rule has a condition (A ≠ B, f differentiable, x₀ interior, denominator ≠ 0), it is printed on the arrow and must arrive at the bottom with the result. Losing it is a named error.
3. **Close is a check, not a proof.** Testing x = 0 ((0+1)² − 9 = −8 and (0−2)(0+4) = −8) catches mistakes; the path is the proof. The app says this in one line.

## 4. The difference-of-squares activity

1. **Specific.** Only `(x+1)² − 9`. ״לפני שפותחים סוגריים: איזה מבנה יש כאן?״ Choose from `A² − B²`, `(A − B)²`, `A² + B²`. Then ״מה גרם לך לזהות?״ (two squares with a minus between them / it has a 9 / not sure).
2. **Lift: name the parts.** Tapping `(x+1)` turns it into one chip labelled A. For B choose from 3, 9, −3.
   - **B = 9**: ״אם B = 9, אז B² = 81. איפה ה־81 בביטוי?״
   - **A = x**: the app puts the parts back and shows `x² − 9` next to `(x+1)² − 9`: ״זה אותו ביטוי?״
   - **B = −3** is also correct (B² = 9). Accept it; show at the end it gives the same result in another order.
3. **Rule.** First time revealed on the arrow, `A² − B² = (A − B)(A + B)`, marked "=", ״עובד בשני הכיוונים״. Later: chosen from a toolbox of 2–3 rules.
4. **Return.** Drag A and B into `( _ − _ )( _ + _ )`. No typing. The same A chip fills both factors; both slots highlight when one is filled. Result: `((x+1) − 3)((x+1) + 3)`.
5. **Tidy.** ״קצרו כל סוגר.״ Options per factor: `(x − 2)`, `(x + 4)`, near misses `(x − 4)`, `(x + 2)`.
6. **Close.** x = 0 on both bottom ends: −8 and −8. ״הגענו לאותו מקום. זו בדיקה, לא הוכחה: ההוכחה היא המסלול.״
7. **Transfer.** `(x − 2)² − 25` with an empty map, fewer prompts.

The map grows with each move and stays; it can collapse to a thumbnail. The one-line idea appears under the finished map.

Shortcut and fading: see `AGREED_SPEC_2026-11-13.md`, section 5.

### Optional pictures
- **Graph (second picture, grade 9):** the parabola of `(x+1)² − 9`: vertex (−1, −9) from the first form, x-intercepts 2 and −4 from `(x − 2)(x + 4)`.
- **Area model:** behind ״עוד דרך לראות את זה״, only with the cut-and-rearrange into the rectangle.

## 5. The same pattern in other topics

| Topic | S₁ (specific) | G₁ (general, parts) | Arrow | G₂ | S₂ / S₃ | What the topic adds |
|---|---|---|---|---|---|---|
| Grade 9: square of a sum | `(2x + 3)²` | `(A + B)²`, A = 2x, B = 3 | = | `A² + 2AB + B²` | `4x² + 12x + 9` | A is a product, not a letter; error A² = 2x² |
| Grade 11: algebraic fractions | `(a² − 25)/(a − 5)` | `(A² − B²)/(A − B)`, A = a, B = 5 | = **with condition A ≠ B** | `A + B` | `a + 5`, **a ≠ 5** | The condition must reach the bottom |
| Grade 11: extremum with a parameter | "f(x) = x² + ax has an extremum at x = 2" | "f differentiable, interior extremum at x₀" | **⇒ only** | `f′(x₀) = 0` | `2·2 + a = 0`, `a = −4` | One-way arrow ("f′ = 0 so there is an extremum" is wrong) |
| Grade 11: increasing everywhere | `f(x) = 2x/(x²+1) + x − 2` | "f′(x) > 0 for every x in an interval" | **⇒ only** | "f increasing on the interval" | `f′(x) = (x⁴ + 3)/(x² + 1)² > 0` | The arrow's direction is the x³ lesson |
| Grade 9: circle | A specific inscribed angle | Inscribed and central angle on the same arc | = | inscribed = ½ central | The specific angle | The lift is visual: find the arc |

## 6. Fit with the rest

- The "why" question is asked at the lift. Contrast items: `(x+1)² + 9` (a sum), `(x+1)² − 8` (A² − B² over the reals with B = √8, but not with whole numbers; say so), `x² + 2x − 8` (same expression in disguise, later).
- At the lift, "A must be x" gets the "cannot be true" verdict with the put-back check as evidence.
- Record lift, rule, return, tidy, close separately (first try / with help).

## 7. Data shape for a reusable component

```js
{
  id: 'diff-squares-x-plus-1',
  start: '(x+1)² − 9',
  shapes: [ {id:'diff', text:'A² − B²', correct:true}, {id:'sqdiff', text:'(A − B)²'}, {id:'sum', text:'A² + B²'} ],
  parts: { A: {accept:['x+1'], wrong:{'x':'putBack'}}, B: {accept:['3','-3'], wrong:{'9':'squareOfB'}} },
  rule: { lhs:'A² − B²', rhs:'(A − B)(A + B)', arrow:'=', condition:null, reveal:'first-time' },
  returnSlots: '(A − B)(A + B)',
  tidy: { options:['(x − 2)(x + 4)','(x − 4)(x + 2)','(x + 2)(x − 4)'], correct:0 },
  close: { x: 0, left: -8, right: -8 },
  idea: 'כל הפרש של שני ריבועים אפשר לכתוב כמכפלה של שני סוגריים',
  pictures: { graph:'parabola', area:'optional-with-rearrangement' },
  transfer: '(x − 2)² − 25'
}
```

Fields `arrow` ('=' or '⇒') and `condition` let one component serve identities, theorems and fractions.
