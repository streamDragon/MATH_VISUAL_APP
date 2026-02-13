/* === זה הקובץ היחיד שצריך לערוך כדי להוסיף תוכן === */

const QUESTIONS = [
    {
        title: "שלב 1: משחקים חופשיים",
        desc: "זהו שלב חופשי.\n1. שחקו עם הסליידרים.\n2. גררו את הנקודה הכחולה לטייל על הגרף.",
        params: [0.5, 0, -2, 0], // [a, b, c, d]
        goal: "free"
    },
    {
        title: "משיק אופקי (קיצון)",
        desc: "הזיזו את הנקודה X עד שהמשיק הכתום יהיה מאוזן לגמרי (שיפוע 0).",
        params: [0.5, 0, -2, 0], 
        goal: "slope_zero"
    },
    {
        title: "מציאת שיפוע ספציפי",
        desc: "מצאו נקודה שבה השיפוע הוא בדיוק 2.",
        params: [0, 1, 0, -2], 
        goal: "slope_match",
        targetSlope: 2
    },
    {
        title: "מעבדת האנך",
        desc: "פתחו את 'מעבדת האנך'. כוונו את m2 כך שמכפלת השיפועים תהיה 1-.",
        params: [0, 0.5, 0, 0], 
        goal: "normal_match"
    },
    {
        title: "פגיעה במטרה",
        desc: "הזיזו את הגרף (גרירת רקע או סליידר d) עד שהקו יעבור בנקודה האדומה.",
        params: [0, 1, -2, 0],
        targets: [{x: 2, y: 4}], // רשימת מטרות
        goal: "hit_target",
        locked: ["inpA", "inpB", "inpC", "inpX"] // סליידרים נעולים
    },
    {
        title: "האתגר הכפול",
        desc: "כוונו את b ואת d כדי לפגוע בשתי הנקודות יחד.",
        params: [0, 0, 0, 0],
        targets: [{x: -1, y: 2}, {x: 2, y: 5}], 
        goal: "hit_target",
        locked: ["inpA", "inpC"]
    }
];

// === כאן מחליטים מתי המשתמש ניצח ===
// הפונקציה הזו מקבלת מהמנוע את כל הנתונים:
// state = { m (שיפוע), nm (שיפוע אנך), x, y, a, b, c, d }
function checkWinLogic(q, state) {
    
    // 1. בדיקת שיפוע 0
    if (q.goal === 'slope_zero') {
        return Math.abs(state.m) < 0.1;
    }
    
    // 2. בדיקת שיפוע יעד
    if (q.goal === 'slope_match') {
        return Math.abs(state.m - q.targetSlope) < 0.15;
    }
    
    // 3. בדיקת אנך (מכפלה שווה -1)
    if (q.goal === 'normal_match') {
        if (!state.showNormal) return false;
        return Math.abs(state.m * state.nm + 1) < 0.15;
    }
    
    // 4. בדיקת פגיעה במטרות
    if (q.goal === 'hit_target') {
        let allHit = true;
        q.targets.forEach(t => {
            // חישוב Y בנקודה של המטרה
            let yAtTarget = state.a * Math.pow(t.x, 3) + 
                            state.b * Math.pow(t.x, 2) + 
                            state.c * t.x + 
                            state.d;
            
            // האם הפונקציה עוברת קרוב למטרה? (סטייה של 0.3)
            if (Math.abs(yAtTarget - t.y) > 0.3) allHit = false;
        });
        return allHit;
    }

    return false; // ברירת מחדל
}
