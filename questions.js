const QUESTIONS = [
  {
    id: 0,
    title: "מעבדת עיצוב פונקציה",
    desc: "שלב העיצוב: השתמש בפרמטרים a, b, c, d כדי לבנות פונקציה מעניינת (למשל עם 'גבעות' ועמקים). לאחר שתעצב, נחקור את הנקודה הכחולה עליה.",
    mode: "setup",
    goal: "free",
    params: [0.2, 0, -2, 0]
  },
  {
    id: 1,
    title: "קיצון: שיפוע אפס",
    desc: "הזז את x לנקודת המקסימום או המינימום של הפונקציה. שים לב ש-f'(x) בשלשה הקדושה הופך ל-0.",
    mode: "move_x",
    goal: "slope_zero",
    params: [0.2, 0, -2, 0]
  },
  {
    id: 2,
    title: "משיק בשיפוע m=2",
    desc: "מצא נקודה על הגרף שבה המשיק הכתום עולה בחדות בשיפוע 2.",
    mode: "move_x",
    goal: "slope_equals",
    targetM: 2,
    params: [0.2, 0, -2, 0]
  },
  {
    id: 3,
    title: "הזזה לנקודה אדומה (d)",
    desc: "שנה רק את הפרמטר d (הזזה אנכית) עד שהגרף יפגע בנקודה. שים לב לצבע המשתנה (חם/קר)!",
    mode: "find_param",
    goal: "hit_target",
    targets: [{ x: 2, y: 3 }],
    params: [0.1, 0, -1, 0],
    locked: ["inpX", "inpA", "inpB", "inpC"]
  },
  {
    id: 4,
    title: "מעבדת האנך (הנורמל)",
    desc: "הפעלנו את הקו הסגול (הנורמל). הזז את x וראה איך הוא תמיד מאונך למשיק הכתום.",
    mode: "move_x",
    goal: "free",
    showNormal: true,
    params: [0.1, 0, -2, 0]
  },
  {
    id: 5,
    title: "יצירת משולש עם הצירים",
    desc: "הזז את x כך שהקו הסגול יחתוך את שני הצירים וייצור משולש צבוע.",
    mode: "move_x",
    goal: "free",
    showNormal: true,
    params: [0.5, 0, -3, 0]
  },
  {
    id: 6,
    title: "חיתוך ציר Y ב- (0,2)",
    desc: "כוון את הפרמטרים כך שהפונקציה תעבור בדיוק ב-y=2 כשהיא חוצה את ציר ה-Y.",
    mode: "find_param",
    goal: "hit_target",
    targets: [{ x: 0, y: 2 }],
    params: [0.2, 0, -2, 0],
    locked: ["inpX", "inpA", "inpB", "inpC"]
  },
  {
    id: 7,
    title: "שיפוע שלילי m=-1",
    desc: "מצא אזור בו הפונקציה יורדת בשיפוע של -1.",
    mode: "move_x",
    goal: "slope_equals",
    targetM: -1,
    params: [0.2, 0, -2, 0]
  },
  {
    id: 8,
    title: "הצמדת נקודות (a,b)",
    desc: "נסה לשנות את a ו-b כדי שהפונקציה תעבור דרך שתי המטרות בו זמנית.",
    mode: "find_param",
    goal: "hit_target",
    targets: [{ x: -2, y: 1 }, { x: 2, y: 1 }],
    params: [0, 0, 0, 0],
    locked: ["inpX", "inpC", "inpD"]
  },
  {
    id: 9,
    title: "נורמל אנכי",
    desc: "מצא נקודה שבה הנורמל הסגול עומד זקוף (אנכי). רמז: זה קורה בנקודת קיצון.",
    mode: "move_x",
    goal: "slope_zero",
    showNormal: true,
    params: [0.3, 0, -3, 0]
  },
  {
    id: 10,
    title: "משיק עובר בראשית",
    desc: "הזז את x עד שהמשיק הכתום יעבור בדיוק בנקודה (0,0).",
    mode: "move_x",
    goal: "free",
    params: [0.1, 0, -2, 4]
  },
  {
    id: 11,
    title: "חקר הפרמטר c",
    desc: "שנה את c וראה איך הוא משפיע על שיפוע הפונקציה בנקודת החיתוך עם ציר ה-Y.",
    mode: "find_param",
    goal: "free",
    params: [0, 0, 1, 0],
    locked: ["inpX", "inpA", "inpB", "inpD"]
  },
  {
    id: 12,
    title: "מינימום מקומי",
    desc: "מצא את הנקודה הכי נמוכה ב'עמק' של הפונקציה.",
    mode: "move_x",
    goal: "slope_zero",
    params: [0.5, 0, -2, 0]
  },
  {
    id: 13,
    title: "פגיעה במטרה רחוקה",
    desc: "הזז את הגרף לפגיעה בנקודה (4,4).",
    mode: "find_param",
    goal: "hit_target",
    targets: [{ x: 4, y: 4 }],
    params: [0.1, 0, -1, 0]
  },
  {
    id: 14,
    title: "סיכום חופשי",
    desc: "כל הכבוד! חקרת את כל התכונות. עכשיו בנה פונקציה משוגעת כרצונך.",
    mode: "free",
    goal: "free",
    showNormal: true,
    params: [0.2, 0.5, -2, 0]
  }
];
