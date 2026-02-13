/* bagrutQuestions.js */
const bagrutData = [
    {
        id: 1,
        title: "שאלה 1: הזזות אנכיות",
        instruction: "נתונה הפונקציה f(x) = x². <br> הזז את הפונקציה למעלה ב-2 יחידות.",
        type: 'find_param',
        setup: { a: 1, b: 0, c: 0, d: 0 }, 
        goal: 'hit_target',
        targetPoint: { x: 0, y: 2 },
        locked: ['a', 'b', 'c'], // רק d פתוח
        journalEq: "y = x² + 2"
    },
    {
        id: 2,
        title: "שאלה 2: שיפוע משיק",
        instruction: "מצא את הנקודה שבה שיפוע המשיק הוא 0 (נקודת קיצון).",
        type: 'move_x',
        setup: { a: 1, b: -4, c: 0, d: 0 },
        goal: 'm0',
        locked: ['a', 'b', 'c', 'd'], // הכל נעול
        journalEq: "f'(x) = 0"
    },
    {
        id: 3,
        title: "שאלה 3: אתגר פרמטרים",
        instruction: "מצא את a ו-b כך שהפרבולה תהיה 'בוכה' (הפוכה) והקודקוד שלה יהיה ב (0, 4).",
        type: 'find_param',
        setup: { a: 1, b: 0, c: 0, d: 0 },
        goal: 'complex',
        targetPoint: { x: 0, y: 4, m: 0 }, 
        locked: ['c', 'd'], // a, b פתוחים
        journalEq: "y = -x² + 4"
    }
];
