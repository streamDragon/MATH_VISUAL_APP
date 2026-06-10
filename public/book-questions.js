/* book-questions.js - בנק שאלות ספר מוערות (Annotated Question Bank, premium)
 *
 * Schema v1
 * ---------
 * Each entry is a full, bagrut-style question whose text contains tappable
 * anchors. An anchor marks a phrase that denotes a visual/graphical concept,
 * and launches a micro-interaction on the existing mission engine, using the
 * question's OWN function (not a generic example).
 *
 * Text format: anchors are embedded inline as {{anchorId|visible phrase}}.
 * The renderer splits on this marker, shows the phrase as a tappable chip
 * (colored by the anchor's skill colorToken from VISUAL_SKILL_REGISTRY),
 * and marks it ✓ once the launched micro-interaction is completed.
 *
 * Anchor fields:
 *   id        - matches the {{id|...}} marker in the text
 *   skills    - keys into VISUAL_SKILL_REGISTRY (first = primary, sets color)
 *   heExplain - one line shown before launching: what this phrase means visually
 *   launch    - mission-engine config (same shape as QUESTIONS entries):
 *               { startTemplateId, mode, goal, data, defaults, locked, steps, ui }
 *               defaults always carry the question's actual function.
 *   engineNeeds - present only when the launch requires a goal type that does
 *               not exist yet in isCurrentStepDone (see ENGINE_NEEDS below).
 *
 * Question fields:
 *   fnParametric / fnSolved - template params before/after the parameter part
 *               is solved. Anchors for later parts use fnSolved.
 *   verified  - authoring-time solution key. Every entry MUST be verified by
 *               a human (Hagai) before shipping; AI-generated questions can be
 *               inconsistent.
 *   source.method - "ai_generated_original": the question was generated as an
 *               original (Gemini), not copied from a book. Never store original
 *               book text here.
 */

const BOOK_QUESTION_SCHEMA_VERSION = 1;

/* New goal types the engine still needs for some launches:
 * 1. (optional, nice-to-have) horizontal_line_solution_count:
 *      drag a horizontal line y=k, done when intersection count equals target
 *      inside a k-range. Until it exists, those anchors launch free
 *      exploration with the line tool.
 * Note: slope_at_x_equals (adjust a parameter until f'(x0)=m0 at a fixed x0)
 * is now implemented in the engine (evalLegacyGoal in index.html).
 */
const BOOK_ENGINE_NEEDS = ["horizontal_line_solution_count"];

const BOOK_QUESTIONS = [
  {
    id: "bq_poly3_param_extremum_001",
    schemaVersion: 1,
    track: "4_5_units",
    topic: "polynomials",
    archetype: "find_param_then_investigate",
    premium: true,
    source: {
      method: "ai_generated_original",
      generator: "gemini",
      reviewedBy: "hagai",
      reviewDate: "2026-06-10",
    },
    title: "חקירת פולינום ממעלה 3 עם פרמטר",
    startTemplateId: "cubic_abcd",
    // f(x) = -x^3 + 3a·x^2 - 4. Template form ax^3+bx^2+cx+d, so the
    // question's parameter "a" maps to template param b (b = 3a).
    fnParametric: { a: -1, b: 0, c: 0, d: -4, editable: ["b"] },
    fnSolved: { a: -1, b: 3, c: 0, d: -4 }, // question's a = 1
    stem:
      "נתונה הפונקציה f(x) = -x³ + 3ax² - 4, {{q1_param|כאשר a הוא פרמטר}}.\n" +
      "ידוע כי לפונקציה יש {{q1_extremum|נקודת קיצון ב־x = 2}}.",
    parts: [
      {
        letter: "א",
        text: "מצא את הערך של הפרמטר a.\n(הצב את הערך של a שמצאת, וענה על הסעיפים ב'–ה')",
      },
      {
        letter: "ב",
        text: "מצא את {{q1_axes|נקודות החיתוך של גרף הפונקציה f(x) עם הצירים}}.",
      },
      {
        letter: "ג",
        text: "מצא את {{q1_extrema_type|שיעורי נקודות הקיצון של הפונקציה, וקבע את סוגן}}.",
      },
      {
        letter: "ד",
        text: "{{q1_sketch|סרטט סקיצה של גרף הפונקציה f(x)}}.",
      },
      {
        letter: "ה",
        text: "היעזר בגרף שסרטטת, וקבע לאילו ערכים של k {{q1_k_solutions|למשוואה f(x) = k יש בדיוק פתרון אחד}}.",
      },
    ],
    anchors: [
      {
        id: "q1_param",
        skills: ["parameterized_family"],
        heExplain:
          "פרמטר = משפחה שלמה של גרפים. הזיזו את המקדם של x² וראו איך הגרף משתנה - השאלה בעצם שואלת איזה גרף מהמשפחה הוא הנכון.",
        launch: {
          startTemplateId: "cubic_abcd",
          mode: "free",
          goal: "free",
          defaults: { a: -1, b: 0, c: 0, d: -4 },
          locked: ["a", "c", "d"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q1_extremum",
        skills: ["extreme_point", "derivative_to_slope", "parameterized_family"],
        heExplain:
          "\"נקודת קיצון ב־x=2\" פירושו: השיפוע שם הוא 0, כלומר f'(2)=0. כוונו את הפרמטר עד שהמשיק בנקודה x=2 נהיה אופקי - זה בדיוק החישוב של סעיף א'.",
        launch: {
          startTemplateId: "cubic_abcd",
          mode: "find_param",
          goal: "slope_at_x_equals",
          data: { x: 2, m: 0, toleranceM: 0.15, preferredEditableParams: ["b"] },
          defaults: { a: -1, b: 0, c: 0, d: -4 },
          locked: ["a", "c", "d"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q1_axes",
        skills: ["axis_intersection", "double_root_touch"],
        heExplain:
          "חיתוך עם הצירים = הנקודות שבהן הגרף פוגש את ציר x (כלומר f(x)=0) ואת ציר y (כלומר x=0). שימו לב: בנקודה x=2 הגרף נוגע בציר ולא חוצה אותו - שורש כפול!",
        launch: {
          startTemplateId: "cubic_abcd",
          mode: "move_x",
          defaults: { a: -1, b: 3, c: 0, d: -4 },
          locked: ["a", "b", "c", "d"],
          steps: [
            { goal: "read_y", data: { x: 0, tolerance: 0.3 }, heHint: "חיתוך עם ציר y: מהו f(0)?" },
            { goal: "y_equals", data: { y: 0, tolerance: 0.15 }, heHint: "מצאו נקודה שבה הגרף פוגש את ציר x" },
          ],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q1_extrema_type",
        skills: ["extreme_point", "monotonicity_sign"],
        heExplain:
          "נקודת קיצון = שיפוע אפס. הסוג (מינימום/מקסימום) נקבע לפי כיווני העלייה והירידה משני הצדדים.",
        launch: {
          startTemplateId: "cubic_abcd",
          mode: "move_x",
          defaults: { a: -1, b: 3, c: 0, d: -4 },
          locked: ["a", "b", "c", "d"],
          steps: [
            { goal: "min_point", data: { toleranceM: 0.15 }, heHint: "מצאו את נקודת המינימום" },
            { goal: "slope_zero", data: { toleranceM: 0.15, xNear: 2 }, heHint: "מצאו את הקיצון השני - מאיזה סוג הוא?" },
          ],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q1_sketch",
        skills: ["visual_planning_sequence", "end_behavior"],
        heExplain:
          "סקיצה = לחבר את כל מה שמצאתם: חיתוכים, קיצון, התנהגות קצה. חקרו את הגרף האמיתי ובדקו שהסקיצה שלכם מסכימה איתו.",
        launch: {
          startTemplateId: "cubic_abcd",
          mode: "free",
          goal: "free",
          defaults: { a: -1, b: 3, c: 0, d: -4 },
          locked: ["a", "b", "c", "d"],
          ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q1_k_solutions",
        skills: ["single_solution_visual", "solution_count_visualization", "equation_to_intersection"],
        heExplain:
          "f(x)=k זה חיתוך בין הגרף לישר אופקי y=k. הזיזו את הישר למעלה ולמטה וספרו נקודות חיתוך - מתי יש בדיוק אחת?",
        launch: {
          startTemplateId: "cubic_abcd",
          mode: "free",
          goal: "free",
          defaults: { a: -1, b: 3, c: 0, d: -4 },
          locked: ["a", "b", "c", "d"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: true },
        },
        engineNeeds: ["horizontal_line_solution_count"],
      },
    ],
    verified: {
      a: "a = 1 (כי f'(x) = -3x² + 6ax, ומ-f'(2)=0 מקבלים -12+12a=0)",
      b: "ציר y: (0,-4). ציר x: x=-1 (חציה) ו-x=2 (שורש כפול - השקה). פירוק: -(x+1)(x-2)²",
      c: "מינימום (0,-4), מקסימום (2,0). f'(x) = -3x(x-2)",
      d: "יורדת-עולה-יורדת; נוגעת בציר x ב-(2,0)",
      e: "פתרון יחיד עבור k > 0 או k < -4",
    },
  },

  {
    id: "bq_poly4_param_tangent_002",
    schemaVersion: 1,
    track: "4_5_units",
    topic: "polynomials",
    archetype: "find_param_then_investigate",
    premium: true,
    source: {
      method: "ai_generated_original",
      generator: "gemini",
      reviewedBy: "hagai",
      reviewDate: "2026-06-10",
    },
    title: "פולינום ממעלה 4: משיק, קיצון והזזה אנכית",
    startTemplateId: "quartic_abcd",
    // f(x) = x^4 - b·x^2 + 9. Template form ax^4+bx^3+cx^2+dx+e, so the
    // question's parameter "b" maps to template param c (c = -b).
    fnParametric: { a: 1, b: 0, c: 0, d: 0, e: 9, editable: ["c"] },
    fnSolved: { a: 1, b: 0, c: -8, d: 0, e: 9 }, // question's b = 8
    stem:
      "נתונה הפונקציה f(x) = x⁴ - bx² + 9, {{q2_param|כאשר b הוא פרמטר}}.\n" +
      "העבירו {{q2_tangent|משיק לגרף הפונקציה בנקודה שבה x = 1}}. ידוע כי {{q2_slope|שיפוע המשיק בנקודה זו הוא 12-}}.",
    parts: [
      {
        letter: "א",
        text: "מצא את הערך של הפרמטר b.\n(הצב את הערך של b שמצאת, וענה על הסעיפים ב'–ה')",
      },
      {
        letter: "ב",
        text: "מצא את {{q2_extrema|שיעורי נקודות הקיצון של הפונקציה f(x), וקבע את סוגן}}.",
      },
      {
        letter: "ג",
        text: "מצא את {{q2_y_axis|נקודת החיתוך של גרף הפונקציה עם ציר ה־y}}.",
      },
      {
        letter: "ד",
        text: "סרטט סקיצה של גרף הפונקציה f(x).",
      },
      {
        letter: "ה",
        text: "נתונה פונקציה חדשה {{q2_shift|g(x) = f(x) + c}}, כאשר c הוא פרמטר. מצא את שני הערכים האפשריים של c שעבורם {{q2_touch_axis|גרף הפונקציה g(x) משיק לציר ה־x}}.",
      },
    ],
    anchors: [
      {
        id: "q2_param",
        skills: ["parameterized_family"],
        heExplain:
          "הפרמטר b קובע איזה גרף מתוך משפחת הרביעיות הוא שלנו. שחקו עם המקדם של x² וראו איך נולדות \"שתי בארות\".",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "free",
          goal: "free",
          defaults: { a: 1, b: 0, c: 0, d: 0, e: 9 },
          locked: ["a", "b", "d", "e"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q2_tangent",
        skills: ["tangent_condition", "slope_at_point"],
        heExplain:
          "משיק בנקודה = הישר שצמוד לגרף שם, והשיפוע שלו הוא בדיוק f'(1). גררו את הנקודה אל x=1 וקראו את השיפוע.",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "move_x",
          goal: "read_slope",
          data: { x: 1, tolerance: 0.5 },
          defaults: { a: 1, b: 0, c: -8, d: 0, e: 9 },
          locked: ["a", "b", "c", "d", "e"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q2_slope",
        skills: ["derivative_to_slope", "parameterized_family"],
        heExplain:
          "\"שיפוע המשיק ב-x=1 הוא 12-\" הוא תנאי על הפרמטר: f'(1) = -12. כוונו את הפרמטר עד שהמשיק ב-x=1 מקבל שיפוע 12- - זה החישוב של סעיף א'.",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "find_param",
          goal: "slope_at_x_equals",
          data: { x: 1, m: -12, toleranceM: 0.5, preferredEditableParams: ["c"] },
          defaults: { a: 1, b: 0, c: 0, d: 0, e: 9 },
          locked: ["a", "b", "d", "e"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q2_extrema",
        skills: ["extreme_point", "monotonicity_sign", "symmetry_hint"],
        heExplain:
          "לרביעית הזו שלוש נקודות קיצון. שימו לב לסימטריה: הפונקציה זוגית, אז הקיצונות באות בזוגות סימטריים.",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "move_x",
          defaults: { a: 1, b: 0, c: -8, d: 0, e: 9 },
          locked: ["a", "b", "c", "d", "e"],
          steps: [
            { goal: "min_point", data: { toleranceM: 0.3 }, heHint: "מצאו נקודת מינימום אחת" },
            { goal: "slope_zero", data: { toleranceM: 0.3, xNear: 0 }, heHint: "מצאו את הקיצון שבאמצע - מאיזה סוג הוא?" },
          ],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q2_y_axis",
        skills: ["axis_intersection"],
        heExplain: "חיתוך עם ציר y = הנקודה שבה x=0, כלומר (0, f(0)).",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "move_x",
          goal: "read_y",
          data: { x: 0, tolerance: 0.4 },
          defaults: { a: 1, b: 0, c: -8, d: 0, e: 9 },
          locked: ["a", "b", "c", "d", "e"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q2_shift",
        skills: ["translation", "parameter_shift"],
        heExplain:
          "g(x) = f(x) + c זה אותו גרף בדיוק, מוזז למעלה או למטה ב-c. שחקו עם האיבר החופשי וראו שהצורה לא משתנה - רק הגובה.",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "free",
          goal: "free",
          defaults: { a: 1, b: 0, c: -8, d: 0, e: 9 },
          locked: ["a", "b", "c", "d"],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
      {
        id: "q2_touch_axis",
        skills: ["double_root_touch", "tangent_condition", "extreme_point"],
        heExplain:
          "\"משיק לציר x\" = הגרף נוגע בציר בלי לחצות, כלומר נקודת קיצון שיושבת בדיוק על הציר. הזיזו את הגרף אנכית עד שזה קורה - יש שתי דרכים!",
        launch: {
          startTemplateId: "quartic_abcd",
          mode: "find_param",
          defaults: { a: 1, b: 0, c: -8, d: 0, e: 9 },
          locked: ["a", "b", "c", "d"],
          steps: [
            {
              goal: "hit_target",
              data: { targets: [{ x: 2, y: 0, label: "השקה במינימום" }], toleranceY: 0.2, preferredEditableParams: ["e"] },
              heHint: "הזיזו את הגרף עד שהמינימום נוגע בציר x",
            },
            {
              goal: "hit_target",
              data: { targets: [{ x: 0, y: 0, label: "השקה במקסימום" }], toleranceY: 0.2, preferredEditableParams: ["e"] },
              heHint: "ועכשיו: הזיזו עד שדווקא המקסימום המקומי נוגע בציר x",
            },
          ],
          ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
        },
      },
    ],
    verified: {
      a: "b = 8 (כי f'(x) = 4x³ - 2bx, ומ-f'(1) = -12 מקבלים 4 - 2b = -12)",
      b: "מקסימום (0,9), מינימום (2,-7) ומינימום (-2,-7). f'(x) = 4x(x²-4)",
      c: "(0,9)",
      d: "צורת W סימטרית סביב ציר y",
      e: "c = 7 (המינימומים עולים לציר: f+7 = (x²-4)²) או c = -9 (המקסימום יורד לציר: f-9 = x²(x²-8))",
    },
  },
];

const BOOK_QUESTIONS_BY_ID = Object.fromEntries(
  BOOK_QUESTIONS.map((q) => [q.id, q])
);
