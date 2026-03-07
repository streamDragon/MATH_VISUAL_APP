/* questions.js - בנק תצורות + שאלות גנריות לחקר פונקציות */

const FUNCTION_TEMPLATES = [
  {
    id: "quad_abcd",
    title: "פרבולה כללית: f(x)=ax^2+bx+c",
    kind: "poly2",
    toggleLabel: "x2",
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
    toggleLabel: "x3",
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
    toggleLabel: "x4",
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
    id: "quintic_abcdef",
    title: "Polynomial degree 5: f(x)=ax^5+bx^4+cx^3+dx^2+ex+f",
    kind: "poly5",
    toggleLabel: "x5",
    defaults: { a: 0.02, b: 0, c: 0, d: -0.3, e: 0.5, f: 0 },
    params: ["a", "b", "c", "d", "e", "f"],
    paramDescriptions: {
      a: "coeff x^5",
      b: "coeff x^4",
      c: "coeff x^3",
      d: "coeff x^2",
      e: "coeff x",
      f: "constant term",
    },
    domain: { xMin: -4.5, xMax: 4.5 },
  },
  {
    id: "line_ab",
    title: "קו ישר: f(x)=mx+n",
    kind: "line",
    toggleLabel: "line",
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
    toggleLabel: "(x-k)^2",
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
    startTemplateId: "quartic_abcd",
    title: "הכנת גרף לקריאת תנאים",
    desc:
      "זהו שלב הכנה קצר: בוחרים משפחת פונקציות שמתאימה לשאלה כדי שאפשר יהיה לראות רמזים ברורים על הגרף.\n" +
      "אחרי שהגרף נהיה קריא, עוברים לעריכת פרמטרים כדי להפיק ממנו תנאים ומשוואות.",
    mode: "setup",
    goal: "choose_function_template",
  },
  {
    id: 1,
    startTemplateId: "quad_abcd",
    title: "קיצון: משיק אופקי",
    desc:
      "גררו את הנקודה עד שבחלונית מתקבל f'(x)=m קרוב ל-0.\n" +
      "כש-m=0 המשיק אופקי וזה פתרון המשימה.",
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
      "גררו עד שמתקבל f'(x)=0.\n" +
      "לאחר מכן ודאו שזו נקודת מינימום (למשל f''(x)>0 או ירידה ואז עלייה).",
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
      "היעד: למצוא x0 שבו f'(x0)=2.\n" +
      "גררו את הנקודה עד שהערך m בחלונית קרוב ל-2.",
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
    startTemplateId: "quad_abcd",
    title: "שיפוע שלילי",
    desc:
      "היעד: למצוא x0 שבו f'(x0)=-1.\n" +
      "שימו לב: כאן מחפשים שיפוע שלילי, לא נקודת קיצון.",
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
      "היעד: למצוא x0 כך ש-f(x0)=3.\n" +
      "גררו את הנקודה ובדקו בחלונית שהערך y קרוב ל-3.",
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
      "נתון x0=1 (x0 הוא המיקום על ציר x). מקמים את הנקודה בדיוק על x=1.\n" +
      "קוראים את השיפוע m=f'(1) מהחלונית, מזינים בתיבה ולוחצים \"בדוק תשובה\".",
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
      "נתון x0=-2 (x0 הוא המיקום על ציר x). מקמים את הנקודה בדיוק על x=-2.\n" +
      "קוראים את y=f(-2) מהחלונית, מזינים בתיבה ולוחצים \"בדוק תשובה\".",
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
    title: "מהנקודה (0,2) למשוואה על הפרמטרים",
    desc:
      "הנתון הוא שהגרף עובר דרך (0,2), ולכן נבנה ממנו תנאי כמו f(0)=2.\n" +
      "המחברת צריכה לאסוף את התנאי הזה, ורק אחר כך לגלות אילו פרמטרים מתאימים.",
    mode: "find_param",
    goal: "hit_target",
    data: {
      targets: [{ x: 0, y: 2, label: "A" }],
      toleranceY: 0.2,
      preferredEditableParams: ["e", "d", "c"],
    },
    locked: [],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 9,
    startTemplateId: "line_ab",
    title: "נקודה על ציר x: בונים f(2)=0",
    desc:
      "אם הנקודה (2,0) נמצאת על הגרף, מקבלים מיד את התנאי f(2)=0.\n" +
      "המטרה היא להשתמש בגרף ובמחברת כדי לבנות את המשוואה, לא רק לכוון עד שנראה נכון.",
    mode: "find_param",
    goal: "hit_target",
    data: {
      targets: [{ x: 2, y: 0, label: "B" }],
      toleranceY: 0.2,
      preferredEditableParams: ["c", "d"],
    },
    locked: [],
    overlay: {
      essence: "בשאלה הזאת משתמשים בנקודה (2,0) כדי לייצר תנאי על הפונקציה.",
      goal: "להבין שנקודה על ציר x פירושה f(2)=0, ומשם לבנות משוואה על הפרמטרים של הישר או של הפונקציה שבחרתם.",
      material: "ישר ושיפוע, חיתוך עם הצירים, והדרך שבה נקודה על הגרף הופכת למשוואה.",
      howTo: [
        "פתחו פרמטרים ובחרו סוג פונקציה. לשאלה זו מומלץ line.",
        "אפשר ללחוץ על \"ציור פתיחה\" כדי להתחיל מציור עזר שמבליט את הרמז החשוב.",
        "תרגמו את הנקודה (2,0) לתנאי f(2)=0 והוסיפו אותו למחברת.",
        "בדקו שהפונקציה שבניתם באמת מקיימת את התנאי על הגרף ולא רק נראית קרובה אליו."
      ]
    },
    visualCategories: [
      "line_object",
      "axis_intersection",
      "equation_to_intersection",
      "parameter_shift",
      "parameterized_family"
    ],
    steps: [
      {
        instruction: "מומלץ לבחור ישר, לטעון ציור פתיחה, ולבנות מהנקודה (2,0) את התנאי f(2)=0 במחברת.",
        goal: {
          type: "hit_target",
          params: {
            targets: [{ x: 2, y: 0, label: "B" }],
            toleranceY: 0.2,
            preferredEditableParams: ["c", "d"]
          }
        },
        onComplete: {
          toastText: "מעולה! הגרף עבר דרך (2,0)."
        }
      }
    ],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 10,
    startTemplateId: "shifted_quad_k",
    title: "שתי נקודות על הגרף = שתי משוואות",
    desc:
      "הנקודות A ו-B אינן רק יעד ויזואלי: כל אחת מהן יוצרת תנאי על הפונקציה.\n" +
      "המטרה היא לאסוף מהן שתי משוואות, ואז לבדוק אם כבר יש מספיק מידע כדי למצוא את הפרמטרים.",
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
      "גררו את הנקודה עד שהמשיק לגרף יעבור דרך הנקודה החיצונית P=(0,-1).\n" +
      "בדיקה מהירה: הקו הכתום חייב לחתוך ממש את P.",
    mode: "move_x",
    goal: "tangent_through_point",
    data: {
      point: { x: 0, y: -1 },
      tolerance: 0.25,
    },
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: true },
  },
  {
    id: 12,
    startTemplateId: "cubic_abcd",
    title: "נורמל אנכי/אופקי",
    desc:
      "היעד: למצוא x0 שבו הנורמל אנכי (כלומר המשיק אופקי).\n" +
      "בפועל מחפשים מצב שבו f'(x)=0.",
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
    title: "חקירה חופשית: איזה תנאי כל שינוי יוצר?",
    desc:
      "כל הסליידרים פתוחים לשינוי חופשי.\n" +
      "המשימה: לשנות פרמטר אחד בכל פעם, לזהות איזה רמז חדש נוצר על הגרף, ולשאול איך הייתם כותבים אותו באלגברה.",
    mode: "free",
    goal: "free",
    visualCategories: [
      "parameterized_family",
      "parameter_shift",
      "end_behavior",
      "visual_planning_sequence",
      "prerequisite_order"
    ],
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: true },
  },
  {
    id: 14,
    startTemplateId: "quad_abcd",
    title: "עוגן גרפי: חיתוך עם ציר y",
    desc:
      "מטרת השאלה: לבנות עוגן ראשון לגרף באמצעות חיתוך עם ציר y.\n" +
      "קבעו את הנקודה הכחולה בדיוק על x=0, קראו y=f(0), והזינו תשובה. אחר כך נסו לשנות את c ולראות איך החיתוך משתנה.",
    mode: "move_x",
    goal: "read_y",
    data: {
      fixedX0: 0,
      answerTolerance: 0.2,
    },
    visualCategories: [
      "function_object",
      "axis_intersection",
      "equation_to_intersection",
      "parameterized_family"
    ],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 15,
    startTemplateId: "cubic_abcd",
    title: "שורש גרפי: מצאו x כך ש-f(x)=0",
    desc:
      "מחפשים שורש של הפונקציה: נקודה שבה הגרף חותך (או נוגע) בציר x.\n" +
      "גררו את הנקודה לאורך הגרף עד שערך הפונקציה קרוב ל-0, כלומר y~0.",
    mode: "move_x",
    goal: "y_equals",
    data: {
      targetY: 0,
      toleranceY: 0.2,
    },
    visualCategories: [
      "axis_intersection",
      "equation_to_intersection",
      "single_solution_visual",
      "function_object"
    ],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 16,
    startTemplateId: "quartic_abcd",
    title: "משיק מקביל לישר y=2x+1",
    desc:
      "משיק מקביל לישר y=2x+1 פירושו שיפוע משיק m=2.\n" +
      "גררו את הנקודה עד שבתיבה מופיע f'(x)=m קרוב ל-2.",
    mode: "move_x",
    goal: "slope_equals",
    data: {
      targetM: 2,
      toleranceM: 0.15,
    },
    visualCategories: [
      "tangent_condition",
      "parallel_tangent_condition",
      "derivative_to_slope",
      "slope_at_point"
    ],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 17,
    startTemplateId: "quintic_abcdef",
    title: "קריאת שיפוע במעלה 5",
    desc:
      "בוחנים פונקציה ממעלה 5 וקוראים שיפוע בנקודה נתונה.\n" +
      "קבעו את הנקודה על x=0, קראו את m=f'(0), והזינו תשובה. אחר כך נסו לשנות רק את e ולראות מה משתנה.",
    mode: "move_x",
    goal: "read_slope",
    data: {
      fixedX0: 0,
      answerTolerance: 0.25,
    },
    visualCategories: [
      "derivative_related_object",
      "derivative_to_slope",
      "slope_at_point",
      "parameterized_family"
    ],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 18,
    startTemplateId: "cubic_abcd",
    title: "שני שורשים על ציר x = מערכת משוואות",
    desc:
      "אם (-1,0) ו-(2,0) נמצאות על הגרף, הן יוצרות את התנאים f(-1)=0 ו-f(2)=0.\n" +
      "כך בונים מהציור ומהנתונים מערכת משוואות על הפרמטרים, במקום לנחש לפי העין.",
    mode: "find_param",
    goal: "hit_targets",
    data: {
      targets: [
        { x: -1, y: 0, label: "A" },
        { x: 2, y: 0, label: "B" },
      ],
      toleranceY: 0.2,
      preferredEditableParams: ["c", "d", "b"],
    },
    locked: [],
    visualCategories: [
      "parameterized_family",
      "axis_intersection",
      "solution_count_visualization",
      "parameter_case_split",
      "equation_to_intersection"
    ],
    ui: { allowNormal: false, defaultNormalOn: false, allowLineTool: false },
  },
  {
    id: 19,
    startTemplateId: "quartic_abcd",
    title: "חקירה חופשית: התנהגות קצוות (מעלה 4)",
    desc:
      "חקירה ממוקדת: מה קורה בקצוות הגרף בפולינום ממעלה 4.\n" +
      "שנו בעיקר את a ואז את b, ותארו מה נשאר קבוע ומה משתנה בצורה.",
    mode: "free",
    goal: "free",
    visualCategories: [
      "parameterized_family",
      "end_behavior",
      "parameter_shift",
      "visual_planning_sequence"
    ],
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: true },
  },
  {
    id: 20,
    startTemplateId: "quintic_abcdef",
    title: "חקירה חופשית: התנהגות קצוות (מעלה 5)",
    desc:
      "חקירה ממוקדת: פולינום ממעלה 5 (מעלה אי-זוגית) והתנהגות הקצוות שלו.\n" +
      "שנו את a ואת f, והשוו בין הגרף לבין הנגזרת כדי לזהות עליות/ירידות ושינויי צורה.",
    mode: "free",
    goal: "free",
    visualCategories: [
      "parameterized_family",
      "end_behavior",
      "monotonicity_sign",
      "derivative_related_object",
      "visual_planning_sequence"
    ],
    ui: { allowNormal: true, defaultNormalOn: false, allowLineTool: true },
  },
];
