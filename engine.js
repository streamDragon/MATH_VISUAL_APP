/* === מאגר השאלות === */
// כאן אתה יכול להוסיף, למחוק ולשנות שאלות בלי לגעת בקוד המסובך
const QUESTIONS = [
    {
        title: "שלב 1: היכרות ומשחקים",
        desc: "ברוכים הבאים!\n1. שחקו עם הסליידרים a,b,c,d כדי לעצב את הפונקציה.\n2. גררו את הנקודה הכחולה (או את הרקע) כדי לטייל.",
        params: [0.5, 0, -2, 0], // [a, b, c, d]
        goal: "free"
    },
    {
        title: "משיק אופקי (קיצון)",
        desc: "הזיזו את הנקודה X עד שהמשיק הכתום יהיה ישר לגמרי (מאוזן).\nבמצב זה השיפוע הוא 0.",
        params: [0.5, 0, -2, 0], 
        goal: "slope_zero"
    },
    {
        title: "שיפוע 2 בפרבולה",
        desc: "נתונה הפונקציה. עליכם למצוא היכן השיפוע (m) שווה בדיוק ל-2.",
        params: [0, 1, 0, -2], 
        goal: "slope_match",
        targetSlope: 2
    },
    {
        title: "מעבדת האנך - 90 מעלות",
        desc: "פתחו את 'מעבדת האנך'.\nשנו את שיפוע האנך (m2) עד שמכפלת השיפועים תהיה 1-.",
        params: [0, 0.5, 0, 0], 
        goal: "normal_match"
    },
    {
        title: "צלף: פגיעה במטרה",
        desc: "הזיזו את הפונקציה למעלה/למטה (בעזרת סליידר d או גרירת הרקע) עד שתפגעו בנקודה האדומה.",
        params: [0, 1, -2, 0],
        targets: [{x: 2, y: 4}],
        goal: "hit_target",
        locked: ["inpA", "inpB", "inpC", "inpX"] // נעילת סליידרים
    },
    {
        title: "האתגר הכפול",
        desc: "פגעו בשתי הנקודות יחד! שנו את b (רוחב) ואת d (גובה).",
        params: [0, 0, 0, 0],
        targets: [{x: -1, y: 2}, {x: 2, y: 5}], 
        goal: "hit_target",
        locked: ["inpA", "inpC"]
    }
];

// בדיקת ניצחון - לוגיקה טהורה
function checkWinCondition(q, currentState) {
    const { m, nm, a, b, c, d, showNormal } = currentState;

    if (q.goal === 'free') return false;

    if (q.goal === 'slope_zero' && Math.abs(m) < 0.1) return true;
    
    if (q.goal === 'slope_match' && Math.abs(m - q.targetSlope) < 0.15) return true;
    
    if (q.goal === 'normal_match') {
        // צריך שהמכפלה תהיה קרובה למינוס 1
        if (showNormal && Math.abs(m * nm + 1) < 0.15) return true;
    }
    
    if (q.goal === 'hit_target') {
        let allHit = true;
        q.targets.forEach(t => {
            let ty = a*t.x**3 + b*t.x**2 + c*t.x + d;
            if (Math.abs(ty - t.y) > 0.3) allHit = false;
        });
        if (allHit) return true;
    }

    return false;
}
