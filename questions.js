/* questions.js - מאגר שאלות בלבד (בלי לוגיקה) */

const QUESTIONS = [
  // --- שלב 1: הזזת X ---
  { 
    id: 1,
    type: "move_x",
    t: "חקירה: נקודת מינימום", 
    d: "הזיזו את הנקודה הכחולה לנקודת המינימום.", 
    p: [0, 1, -4, 4],
    goal: "min_point"
  },
  { 
    id: 2,
    type: "move_x",
    t: "חקירה: משיק אופקי", 
    d: "מצאו נקודה שבה המשיק מקביל לציר ה-X.", 
    p: [-1, 0, 9, 0],
    goal: "slope_zero"
  },

  // --- שלב 2: מציאת פרמטרים ---
  {
    id: 3,
    type: "find_param",
    t: "בנייה: הזזה אנכית",
    d: "הזיזו את המקדם d כדי שהפרבולה תעבור בראשית (0,0).",
    p: [0, 1, 0, 5],
    locked: ["a","b","c"],
    targets: [{ x: 0, y: 0, label: "A" }],
    goal: "hit_targets",
    solvedEq: "f(0) = 0"
  },
  {
    id: 4,
    type: "find_param",
    t: "בנייה: פרמטר K",
    d: "נתונה y = x² - 4x + k. מצאו את k כך שהפונקציה תשיק לציר X.",
    p: [0, 1, -4, -2],
    locked: ["a","b","c"],
    targets: [{ x: 2, y: 0, label: "השקה" }],
    goal: "hit_targets",
    solvedEq: "f(2) = 0"
  },
  {
    id: 5,
    type: "find_param",
    t: "בנייה: שתי נקודות",
    d: "כוונו את c ו-d כך שהישר y = cx + d יעבור בנקודות המסומנות.",
    p: [0, 0, 1, 0],
    locked: ["a","b"],
    targets: [
      { x: 0, y: 2, label: "A" },
      { x: 2, y: 0, label: "B" }
    ],
    goal: "hit_targets",
    solvedEq: "y = -x + 2"
  }
];

// חשיפה גלובלית כדי ש-script.js יראה את זה בלי import
window.QUESTIONS = QUESTIONS;
