/* bagrut_questions.js - מאגר השאלות */
const bagrutData = [
    {
        id: 1,
        title: "שאלה 1: חקירה בסיסית",
        instruction: "נתונה הפונקציה f(x) = x². <br> חקור את הפונקציה ומצא את נקודת המינימום.",
        type: "move_x", 
        setup: { a: 1, b: 0, c: 0, d: 0 }, 
        goal: "m0", 
        targetPoint: { x: 0, y: 0 },
        locked: ['a', 'b', 'c', 'd'] 
    },
    {   
        // התיקון: הוספתי כאן סוגריים מסולסלים שהיו חסרים
        id: 2,
        title: "שאלה 2: שיפוע משיק",
        instruction: "מצא נקודה על הגרף שבה שיפוע המשיק הוא 2.",
        type: "move_x",
        setup: { a: 1, b: 0, c: 0, d: 0 },
        goal: "slope_val", 
        targetVal: 2,      
        locked: ['a', 'b', 'c', 'd']
    },
    {
        id: 3,
        title: "שאלה 3: מציאת פרמטר C",
        instruction: "הפונקציה היא f(x) = x² + c. <br> מצא את ערך c כך שהפונקציה תעבור בנקודה (0, 2).",
        type: "find_param", 
        setup: { a: 1, b: 0, c: 0, d: 0 },
        goal: "hit_target", 
        targetPoint: { x: 0, y: 2 }, 
        locked: ['a', 'b', 'd'] 
    },
    {
        id: 4,
        title: "שאלה 4: חקירה מורכבת",
        instruction: "מצא את נקודת החיתוך עם ציר ה-X החיובי.",
        type: "move_x",
        setup: { a: -1, b: 2, c: 3, d: 0 },
        goal: "y0", 
        targetRegion: { min: 0.1, max: 5 }, 
        locked: ['a', 'b', 'c', 'd']
    }
];
