/* questions.js - בנק תצורות + שאלות גנריות לחקר פונקציות */

const FUNCTION_TEMPLATES = [
  {
    id: "quad_abcd",
    title: "פרבולה כללית: f(x)=ax^2+bx+c",
    kind: "poly2",
    defaults: { a: 1, b: 0, c: 0, d: 0 },
    params: ["a", "b", "c"],
    paramDescriptions: {
      a: "מקדם של x^2",
      b: "מקדם של x",
      c: "איבר חופשי",
      d: "לא בשימוש בתבנית זו",
    },
    domain: { xMin: -10, xMax: 10 },
  },
  {
    id: "cubic_abcd",
    title: "פולינום ממעלה 3: f(x)=ax^3+bx^2+cx+d",
    kind: "poly3",
    defaults: { a: 0.2, b: 0, c: 0, d: 0 },
    params: ["a", "b", "c", "d"],
    paramDescriptions: {
      a: "מקדם של x^3",
      b: "מקדם של x^2",
      c: "מקדם של x",
      d: "איבר חופשי",
    },
    domain: { xMin: -6, xMax: 6 },
  },
  {
    id: "quartic_abcd",
    title: "פולינום ממעלה 4: f(x)=ax^4+bx^3+cx^2+dx+e",
    kind: "poly4",
    defaults: { a: 0.05, b: 0, c: -1, d: 0.5, e: 0 },
    params: ["a", "b", "c", "d", "e"],
    paramDescriptions: {
      a: "מקדם של x^4",
      b: "מקדם של x^3",
      c: "מקדם של x^2",
      d: "מקדם של x",
      e: "איבר חופשי",
    },
    domain: { xMin: -5, xMax: 5 },
  },
  {
    id: "line_ab",
    title: "קו ישר: f(x)=mx+n",
    kind: "line",
    defaults: { a: 0, b: 0, c: 1, d: 0 },
    params: ["c", "d"],
    paramDescriptions: {
      a: "לא בשימוש בתבנית זו",
      b: "לא בשימוש בתבנית זו",
      c: "שיפוע m",
      d: "חיתוך n עם ציר y",
    },
    domain: { xMin: -10, xMax: 10 },
  },
  {
    id: "shifted_quad_k",
    title: "פרבולה מוזזת: f(x)=(x-k)^2 + d",
    kind: "quad_shift",
    defaults: { a: 0, b: 0, c: 0, d: 0 },
    params: ["c", "d"],
    paramDescriptions: {
      a: "לא בשימוש בתבנית זו",
      b: "לא בשימוש בתבנית זו",
      c: "הזזה אופקית k",
      d: "הזזה אנכית d",
    },
    domain: { xMin: -10, xMax: 10 },
  },
];

const QUESTIONS = [
  {
    id: 0,
    title: "בחירת פונקציה",
    desc:
      "לפני שמתחילים: בחר תצורת פונקציה (תבנית) ושנה את הפרמטרים.\n" +
      "לאחר מכן אפשר לעבור שאלה: כל שאלה נטענת עם פונקציה התחלתית שונה לגיוון, ותמיד אפשר לערוך פרמטרים כרצונך.",
    mode: "setup",
    goal: "choose_function_template",
  },
  {
    id: 1,
    startTemplateId: "quad_abcd",
    title: "קיצון: משיק אופקי",
    desc:
      "מצא נקודה שבה המשיק אופקי: f'(x0)=0.\n" +
      "גרור את x0 עד שמתקבל שיפוע 0.",
    mode: "move_x",
    goal: "slope_zero",
    data: {
      toleranceM: 0.15,
      requireSecondDerivCheck: false,
    },
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 2,
    startTemplateId: "cubic_abcd",
    title: "מינימום: משיק אופקי + בדיקת f''(x0)>0",
    desc:
      "מצא נקודת מינימום: f'(x0)=0 וגם f''(x0)>0.\n" +
      "גרור את x0 עד שהשיפוע אפס, וודא שהעקמומיות חיובית.",
    mode: "move_x",
    goal: "min_point",
    data: {
      toleranceM: 0.15,
      requireSecondDerivCheck: true,
    },
    ui: { allowNormal: true, defaultNormalOn: true, allowLineTool: false },
  },
  {
    id: 3,
    startTemplateId: "quartic_abcd",
    title: "מצא x0 לפי שיפוע נתון",
    desc:
      "נתון שיפוע m=2.\n" +
      "מצא ערך x0 כך ש־f'(x0)=2.",
    mode: "move_x",
    goal: "slope_equals",
    data: {
      targetM: 2,
      toleranceM: 0.15,
    },
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 4,
    startTemplateId: "line_ab",
    title: "שיפוע שלילי",
    desc:
      "מצא x0 כך ש־f'(x0)=-1.\n" +
      "זה בודק שליטה בשיפוע ולא רק בקיצון.",
    mode: "move_x",
    goal: "slope_equals",
    data: {
      targetM: -1,
      toleranceM: 0.15,
    },
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 5,
    startTemplateId: "shifted_quad_k",
    title: "מצא x0 לפי ערך פונקציה",
    desc:
      "מצא x0 כך ש־f(x0)=3.\n" +
      "גרור את x0 עד שהנקודה (x0,y0) מגיעה ל־y=3.",
    mode: "move_x",
    goal: "y_equals",
    data: {
      targetY: 3,
      toleranceY: 0.2,
    },
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 6,
    startTemplateId: "quad_abcd",
    title: "קרא שיפוע בנקודה",
    desc:
      "קבע x0=1 (גרור ל־1 בדיוק).\n" +
      "כעת התשובה היא השיפוע m=f'(1). האפליקציה תבקש ממך להזין את m.",
    mode: "move_x",
    goal: "read_slope",
    data: {
      fixedX0: 1,
      answerTolerance: 0.2,
    },
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 7,
    startTemplateId: "cubic_abcd",
    title: "קרא ערך פונקציה בנקודה",
    desc:
      "קבע x0=-2.\n" +
      "כעת התשובה היא y=f(-2). האפליקציה תבקש ממך להזין את y.",
    mode: "move_x",
    goal: "read_y",
    data: {
      fixedX0: -2,
      answerTolerance: 0.25,
    },
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 8,
    startTemplateId: "quartic_abcd",
    title: "מצא פרמטר אחד: מעבר בנקודה",
    desc:
      "שנה פרמטר אחד (למשל d או c – בהתאם לתבנית שבחרת) כך שהגרף יעבור בנקודה (0,2).",
    mode: "find_param",
    goal: "hit_target",
    data: {
      targets: [{ x: 0, y: 2, label: "A" }],
      toleranceY: 0.2,
      preferredEditableParams: ["d", "c"],
    },
    locks: ["inpX"],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 9,
    startTemplateId: "line_ab",
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
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 10,
    startTemplateId: "shifted_quad_k",
    title: "שתי נקודות יחד (פרמטר אחד/שניים)",
    desc:
      "כוון את הפרמטרים המותרים כך שהפונקציה תפגע בשתי הנקודות יחד.\n" +
      "הצלחה רק אם *באותו רגע* היא עוברת בשתיהן.",
    mode: "find_param",
    goal: "hit_targets",
    data: {
      targets: [
        { x: -1, y: 1, label: "A" },
        { x: 2, y: 4, label: "B" },
      ],
      toleranceY: 0.2,
      preferredEditableParams: ["c", "d", "b"],
    },
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 11,
    startTemplateId: "quad_abcd",
    title: "משיק שעובר דרך נקודה חיצונית",
    desc:
      "מצא x0 כך שהמשיק לגרף בנקודה x0 יעבור דרך הנקודה החיצונית P=(0,1).\n" +
      "רמז: משיק: y = m(x-x0)+f(x0). בדוק האם (0,1) מקיימת את זה.",
    mode: "move_x",
    goal: "tangent_through_point",
    data: {
      point: { x: 0, y: 1 },
      tolerance: 0.25,
    },
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: true },
  },
  {
    id: 12,
    startTemplateId: "cubic_abcd",
    title: "נורמל אנכי/אופקי",
    desc:
      "מצא x0 כך שהנורמל יהיה אנכי (כלומר המשיק אופקי).\n" +
      "זה אותו רעיון של f'(x0)=0, אבל עם ניסוח אחר.",
    mode: "move_x",
    goal: "slope_zero",
    data: {
      toleranceM: 0.15,
    },
    ui: { allowNormal: true, defaultNormalOn: true, allowLineTool: false },
  },
  {
    id: 13,
    startTemplateId: "quartic_abcd",
    title: "חקירה חופשית",
    desc:
      "כל הסליידרים פתוחים.\n" +
      "המטרה: להבין איך כל פרמטר משפיע על צורה, שיפועים, וקיצון.",
    mode: "free",
    goal: "free",
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: true },
  },
];

