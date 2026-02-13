/* questions.js - בנק תצורות + שאלות גנריות לחקר פונקציות */

const FUNCTION_TEMPLATES = [
  {
    id: "quad_abcd",
    title: "פרבולה כללית: f(x)=ax²+bx+c",
    kind: "poly2",
    // coefficients meaning (internally your app can map)
    // a,b,c used; d ignored
    defaults: { a: 1, b: 0, c: 0, d: 0 },
    params: ["a", "b", "c"],           // allowed to edit before start
    domain: { xMin: -10, xMax: 10 },
  },
  {
    id: "cubic_abcd",
    title: "פולינום ממעלה 3: f(x)=ax³+bx²+cx+d",
    kind: "poly3",
    defaults: { a: 0.2, b: 0, c: 0, d: 0 },
    params: ["a", "b", "c", "d"],
    domain: { xMin: -6, xMax: 6 },
  },
  {
    id: "line_ab",
    title: "קו ישר: f(x)=mx+n",
    kind: "line",
    defaults: { a: 0, b: 0, c: 1, d: 0 }, // map: c=m, d=n (בכוונה לשמור תאימות ל־[a,b,c,d])
    params: ["c", "d"],
    domain: { xMin: -10, xMax: 10 },
  },
  {
    id: "shifted_quad_k",
    title: "פרבולה מוזזת: f(x)=(x-k)² + d",
    kind: "quad_shift",
    defaults: { a: 0, b: 0, c: 0, d: 0 }, // app interprets: k stored in c, d stored in d (לדוגמה)
    params: ["c", "d"], // here c=k, d=d
    domain: { xMin: -10, xMax: 10 },
  },
];

/**
 * QUESTIONS:
 * - כל שאלה גנרית: מתייחסת לפונקציה הפעילה שנבחרה בתחילת המשחק
 * - "locks" כאן מתייחסים ל־IDs שלך ב־UI; אם אצלך השמות שונים – תשנה פעם אחת במיפוי.
 *
 * שדות מומלצים:
 *  id, title, desc
 *  mode: "move_x" | "find_param" | "free"
 *  goal:
 *    - "slope_equals" (מציאת x0 כך ש-f'(x0)=m)
 *    - "slope_zero" (קיצון: f'(x0)=0)
 *    - "y_equals" (מציאת x0 כך ש-f(x0)=Y)
 *    - "read_slope" (המשתמש קורא m בנקודה ומאשר)
 *    - "read_y" (המשתמש קורא y בנקודה ומאשר)
 *    - "hit_target" (לכוון פרמטר(ים) לעבור בנקודה)
 *    - "hit_targets" (לכוון פרמטר(ים) לעבור בשתי נקודות יחד)
 *    - "tangent_through_point" (למצוא x0 כך שהמשיק בנקודה עובר דרך נקודה חיצונית)
 *  data: פרטי שאלה
 */

const QUESTIONS = [
  // -------------------- 0) SETUP / INTRO --------------------
  {
    id: 0,
    title: "בחירת פונקציה",
    desc:
      "לפני שמתחילים: בחר תצורת פונקציה (תבנית) ושנה את הפרמטרים.\n" +
      "לאחר הבחירה – כל השאלות הבאות יהיו על הפונקציה שבחרת.",
    mode: "setup",
    goal: "choose_function_template",
    // app uses FUNCTION_TEMPLATES to render selection UI
  },

  // -------------------- 1) BASIC: SLOPE ZERO (EXTREMUM) --------------------
  {
    id: 1,
    title: "קיצון: משיק אופקי",
    desc:
      "מצא נקודה שבה המשיק אופקי: f'(x₀)=0.\n" +
      "גרור את x₀ עד שמתקבל שיפוע 0.",
    mode: "move_x",
    goal: "slope_zero",
    data: {
      toleranceM: 0.15,
      requireSecondDerivCheck: false, // אפשר להדליק אם רוצים "מינימום בלבד"
    },
  },

  {
    id: 2,
    title: "מינימום: משיק אופקי + בדיקת f''(x₀)>0",
    desc:
      "מצא נקודת מינימום: f'(x₀)=0 וגם f''(x₀)>0.\n" +
      "גרור את x₀ עד שהשיפוע אפס, וודא שהעקמומיות חיובית.",
    mode: "move_x",
    goal: "min_point",
    data: {
      toleranceM: 0.15,
      requireSecondDerivCheck: true,
    },
  },

  // -------------------- 2) GIVEN SLOPE m: FIND x0 --------------------
  {
    id: 3,
    title: "מצא x₀ לפי שיפוע נתון",
    desc:
      "נתון שיפוע m=2.\n" +
      "מצא ערך x₀ כך ש־f'(x₀)=2.",
    mode: "move_x",
    goal: "slope_equals",
    data: {
      targetM: 2,
      toleranceM: 0.15,
    },
  },

  {
    id: 4,
    title: "שיפוע שלילי",
    desc:
      "מצא x₀ כך ש־f'(x₀)=-1.\n" +
      "זה בודק שליטה בשיפוע ולא רק בקיצון.",
    mode: "move_x",
    goal: "slope_equals",
    data: {
      targetM: -1,
      toleranceM: 0.15,
    },
  },

  // -------------------- 3) GIVEN y: FIND x0 --------------------
  {
    id: 5,
    title: "מצא x₀ לפי ערך פונקציה",
    desc:
      "מצא x₀ כך ש־f(x₀)=3.\n" +
      "גרור את x₀ עד שהנקודה (x₀,y₀) מגיעה ל־y=3.",
    mode: "move_x",
    goal: "y_equals",
    data: {
      targetY: 3,
      toleranceY: 0.2,
    },
  },

  // -------------------- 4) READ VALUES (QUIZ STYLE) --------------------
  {
    id: 6,
    title: "קרא שיפוע בנקודה",
    desc:
      "קבע x₀=1 (גרור ל־1 בדיוק).\n" +
      "כעת התשובה היא השיפוע m=f'(1). האפליקציה תבקש ממך להזין את m.",
    mode: "move_x",
    goal: "read_slope",
    data: {
      fixedX0: 1,
      answerTolerance: 0.2,
    },
  },

  {
    id: 7,
    title: "קרא ערך פונקציה בנקודה",
    desc:
      "קבע x₀=-2.\n" +
      "כעת התשובה היא y=f(-2). האפליקציה תבקש ממך להזין את y.",
    mode: "move_x",
    goal: "read_y",
    data: {
      fixedX0: -2,
      answerTolerance: 0.25,
    },
  },

  // -------------------- 5) PARAMETER FIT: PASS THROUGH POINT --------------------
  {
    id: 8,
    title: "מצא פרמטר אחד: מעבר בנקודה",
    desc:
      "שנה פרמטר אחד (למשל d או c – בהתאם לתבנית שבחרת) כך שהגרף יעבור בנקודה (0,2).",
    mode: "find_param",
    goal: "hit_target",
    data: {
      targets: [{ x: 0, y: 2, label: "A" }],
      toleranceY: 0.2,
      // allow app to decide which parameter(s) are editable now:
      // e.g. prefer ["d"] if exists, else ["c"], else ["b"]...
      preferredEditableParams: ["d", "c"],
    },
    locks: ["inpX"], // פה רק דוגמה: "x" נעול אם יש לך inpX
  },

  {
    id: 9,
    title: "מצא פרמטר: מעבר בנקודה כללית",
    desc:
      "שנה פרמטר אחד כך שהגרף יעבור בנקודה (2,0).",
    mode: "find_param",
    goal: "hit_target",
    data: {
      targets: [{ x: 2, y: 0, label: "B" }],
      toleranceY: 0.2,
      preferredEditableParams: ["c", "d", "b"],
    },
    locks: ["inpX"],
  },

  // -------------------- 6) TWO TARGETS AT ONCE (1 or 2 params) --------------------
  {
    id: 10,
    title: "שתי נקודות יחד (פרמטר אחד/שניים)",
    desc:
      "כוון את הפרמטרים המותרים כך שהפונקציה תפגע בשתי הנקודות יחד.\n" +
      "הצלחה רק אם *באותו רגע* היא עוברת בשתיהן.",
    mode: "find_param",
    goal: "hit_targets",
    data: {
      targets: [
        { x: -1, y: 1, label: "A" },
        { x:  2, y: 4, label: "B" },
      ],
      toleranceY: 0.2,
      preferredEditableParams: ["c", "d", "b"], // האפליקציה תפתח 1 או 2 לפי מה שהמשתמש בחר לפני התחלה
    },
  },

  // -------------------- 7) TANGENT THROUGH EXTERNAL POINT --------------------
  {
    id: 11,
    title: "משיק שעובר דרך נקודה חיצונית",
    desc:
      "מצא x₀ כך שהמשיק לגרף בנקודה x₀ יעבור דרך הנקודה החיצונית P=(0,1).\n" +
      "רמז: משיק: y = m(x-x₀)+f(x₀). בדוק האם (0,1) מקיימת את זה.",
    mode: "move_x",
    goal: "tangent_through_point",
    data: {
      point: { x: 0, y: 1 },
      tolerance: 0.25,
    },
  },

  // -------------------- 8) NORMAL LINE SPECIAL (OPTIONAL) --------------------
  {
    id: 12,
    title: "נורמל אנכי/אופקי",
    desc:
      "מצא x₀ כך שהנורמל יהיה אנכי (כלומר המשיק אופקי).\n" +
      "זה אותו רעיון של f'(x₀)=0, אבל עם ניסוח אחר.",
    mode: "move_x",
    goal: "slope_zero",
    data: {
      toleranceM: 0.15,
    },
  },

  // -------------------- 9) FREE PLAY --------------------
  {
    id: 13,
    title: "חקירה חופשית",
    desc:
      "כל הסליידרים פתוחים.\n" +
      "המטרה: להבין איך כל פרמטר משפיע על צורה, שיפועים, וקיצון.",
    mode: "free",
    goal: "free",
  },
];
