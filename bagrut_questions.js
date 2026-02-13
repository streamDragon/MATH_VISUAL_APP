/* bagrutQuestions.js
   מאגר שאלות הבגרות - מכיל את הטקסטים, הפרמטרים והתנאים להצלחה.
*/

const bagrutData = [
    // --- שלב 1: חקירה (הזזת X) ---
    {
        id: 1,
        title: "חקירה: נקודת קיצון",
        instruction: "הזז את הנקודה הכחולה לנקודת המינימום (הכי נמוכה) של הפרבולה.",
        type: 'move_x', 
        setup: { a: 1, b: -4, c: 3, d: 0 },
        goal: 'm0', // שיפוע 0
        locked: ['a', 'b', 'c', 'd'] // הכל נעול, רק X זז
    },
    {
        id: 2,
        title: "חקירה: חיתוך ציר X",
        instruction: "מצא את נקודת החיתוך הימנית עם ציר ה-X (איפה ש-y=0).",
        type: 'move_x',
        setup: { a: -1, b: 4, c: 0, d: 0 },
        goal: 'y0', // גובה 0
        targetRegion: { min: 3.5, max: 4.5 }, // אזור ספציפי (x=4)
        locked: ['a', 'b', 'c', 'd']
    },
    {
        id: 3,
        title: "חקירה: שיפוע ספציפי",
        instruction: "מצא נקודה שבה המשיק יורד בחדות (שיפוע 2-).",
        type: 'move_x',
        setup: { a: 0.5, b: 0, c: 0, d: 0 },
        goal: 'slope_val',
        targetVal: -2,
        locked: ['a', 'b', 'c', 'd']
    },

    // --- שלב 2: שאלות בגרות (מציאת פרמטרים) ---
    {
        id: 4,
        title: "בגרות: מציאת C",
        instruction: "נתונה הפונקציה f(x)=x²+c.<br>הגרף עובר בנקודה (0, 2). מצא את c.",
        type: 'find_param',
        setup: { a: 1, b: 0, c: -3, d: 0 }, // מתחיל לא נכון
        goal: 'hit_target',
        targetPoint: { x: 0, y: 2 },
        locked: ['a', 'b', 'd'], // רק c פתוח
        journalEq: "f(0) = 2"
    },
    {
        id: 5,
        title: "בגרות: מציאת B לפי קיצון",
        instruction: "נתונה f(x)=x²+bx.<br>ידוע שיש קיצון ב-x=2 (שיפוע 0). שנה את b.",
        type: 'find_param',
        setup: { a: 1, b: 0, c: 0, d: 0 },
        goal: 'slope_at_x',
        targetPoint: { x: 2, m: 0 },
        locked: ['a', 'c', 'd'], // רק b פתוח
        journalEq: "f'(2) = 0"
    },
    {
        id: 6,
        title: "בגרות: שיפוע משיק",
        instruction: "נתונה f(x)=ax².<br>בנקודה x=2 שיפוע המשיק הוא 4. מצא את a.",
        type: 'find_param',
        setup: { a: 0.1, b: 0, c: 0, d: 0 },
        goal: 'slope_at_x',
        targetPoint: { x: 2, m: 4 },
        locked: ['b', 'c', 'd'], // רק a פתוח
        journalEq: "f'(2) = 4"
    },
    {
        id: 7,
        title: "אתגר מסכם",
        instruction: "כוון את b ו-c כך שהקודקוד יהיה בנקודה (3, 1-).",
        type: 'find_param',
        setup: { a: 1, b: 0, c: 0, d: 0 },
        goal: 'complex',
        targetPoint: { x: 3, y: -1, m: 0 }, // גם מיקום וגם שיפוע
        locked: ['a', 'd'],
        journalEq: "V(3, -1)"
    }
];
