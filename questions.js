/* קובץ שאלות - חקר פונקציות */
const QUESTIONS = [
  {
    id: 1,
    title: "שלב 1: איפוס הנגזרת (מינימום)",
    desc: "לפניך הפונקציה: f(x) = x² - 4x + 4.\nהמטרה: מצא את נקודת המינימום.\nרמז: בנקודת המינימום, המשיק הוא אופקי לגמרי (שיפוע 0).",
    params: [0, 1, -4, 4],
    locked: ["inpA", "inpB", "inpC", "inpD"], 
    goal: "slope_zero",
    targetX: 2 
  },
  {
    id: 2,
    title: "שלב 2: נקודת מקסימום",
    desc: "כעת הפונקציה הפוכה: f(x) = -x² + 4.\nמצא את נקודת המקסימום (הפסגה) שבה השיפוע הוא 0.",
    params: [0, -1, 0, 4], 
    locked: ["inpA", "inpB", "inpC", "inpD"],
    goal: "slope_zero",
    targetX: 0
  },
  {
    id: 3,
    title: "שלב 3: הזזה אנכית (d)",
    desc: "מצא את d כך שהפונקציה תעבור בנקודה (0, 2).",
    params: [0, 1, 0, 0], 
    locked: ["inpA", "inpB", "inpC", "inpX"], 
    targets: [{x: 0, y: 2}], 
    goal: "hit_target"
  },
  {
    id: 4,
    title: "שלב 4: מציאת פרמטר c",
    desc: "מצא את c כך שהפונקציה תעבור דרך הנקודה (2, 0).",
    params: [1, 0, 0, 0], 
    locked: ["inpA", "inpB", "inpD", "inpX"], 
    targets: [{x: 2, y: 0}],
    goal: "hit_target"
  },
  {
    id: 5,
    title: "חקירה חופשית",
    desc: "כל הסליידרים פתוחים! שחק עם הפונקציה.",
    params: [0.5, 0, -3, 0],
    locked: [], 
    goal: "free" 
  }
];
