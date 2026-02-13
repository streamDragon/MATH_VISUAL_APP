// --- מאגר השאלות החדש (10 שאלות) ---
const questions = [
    // --- שלב 1: שאלות בסיס (הזזת נקודה בלבד) ---
    {
        id: 1,
        title: "שאלה 1: הכרות עם קיצון",
        instruction: "הזז את הנקודה הכחולה לנקודת המינימום של הפרבולה (השיפוע צריך להיות 0).",
        type: "point", // מציאת נקודה
        targetCondition: (state) => Math.abs(state.m) < 0.1 && state.isExtremum, 
        setup: { a: 1, b: -4, c: 0, d: 0, showTangent: true },
        locked: ['a', 'b', 'c', 'd'] // נועלים פרמטרים, רק X זז
    },
    {
        id: 2,
        title: "שאלה 2: משיק בשיפוע חיובי",
        instruction: "מצא נקודה על הגרף שבה שיפוע המשיק הוא בדיוק 2.",
        type: "point",
        targetCondition: (state) => Math.abs(state.m - 2) < 0.1,
        setup: { a: 0.5, b: 0, c: -2, d: 0, showTangent: true },
        locked: ['a', 'b', 'c', 'd']
    },
    {
        id: 3,
        title: "שאלה 3: משיק בשיפוע שלילי",
        instruction: "מצא נקודה על הגרף שבה שיפוע המשיק הוא -1.",
        type: "point",
        targetCondition: (state) => Math.abs(state.m - (-1)) < 0.1,
        setup: { a: 0.5, b: 0, c: 1, d: 0, showTangent: true },
        locked: ['a', 'b', 'c', 'd']
    },
    {
        id: 4,
        title: "שאלה 4: ערך הפונקציה",
        instruction: "מצא את הנקודה שבה ערך הפונקציה (y) הוא בדיוק 3.",
        type: "point",
        targetCondition: (state) => Math.abs(state.y - 3) < 0.1,
        setup: { a: -0.5, b: 2, c: 1, d: 0, showTangent: false },
        locked: ['a', 'b', 'c', 'd']
    },
    {
        id: 5,
        title: "שאלה 5: חיתוך עם הצירים",
        instruction: "מצא את נקודת החיתוך הימנית של הפרבולה עם ציר ה-X.",
        type: "point",
        targetCondition: (state) => Math.abs(state.y) < 0.1 && state.x > 0,
        setup: { a: 1, b: 0, c: -4, d: 0, showTangent: false },
        locked: ['a', 'b', 'c', 'd']
    },

    // --- שלב 2: שאלות מתקדמות (שינוי פרמטרים) ---
    {
        id: 6,
        title: "שאלה 6: הזזה אנכית (פרמטר C)",
        instruction: "שנה את c כך שלפרבולה תהיה נקודת השקה אחת בלבד עם ציר ה-X (קודקוד על הציר).",
        type: "parameter",
        targetCondition: (state) => Math.abs(state.y) < 0.1 && Math.abs(state.m) < 0.1, // גם גובה 0 וגם שיפוע 0
        setup: { a: 1, b: -2, c: 3, d: 0, showTangent: true },
        locked: ['a', 'b', 'd'] // רק C פתוח
    },
    {
        id: 7,
        title: "שאלה 7: מניפולציה של השיפוע",
        instruction: "שנה את הפרמטר a כך שהפונקציה תהיה 'פרבולה בוכה' (מקסימום) שעוברת בראשית.",
        type: "parameter",
        targetCondition: (state) => state.a < 0 && Math.abs(state.y) < 0.2 && Math.abs(state.x) < 0.2,
        setup: { a: 2, b: 0, c: 0, d: 0, showTangent: false },
        locked: ['b', 'c', 'd'] // רק A פתוח
    },
    {
        id: 8,
        title: "שאלה 8: חקירת פונקציה ממעלה שלישית",
        instruction: "הזז את הנקודה לנקודת המקסימום המקומי של הפונקציה.",
        type: "point",
        targetCondition: (state) => Math.abs(state.m) < 0.1 && state.x < 0, // מקסימום הוא בצד שמאל במקרה הזה
        setup: { a: 0.3, b: 0, c: -3, d: 0, showTangent: true }, // יוצר פונקציה מעלה 3
        locked: ['a', 'b', 'c', 'd']
    },
    {
        id: 9,
        title: "שאלה 9: יצירת משיק ספציפי",
        instruction: "שנה את b כך שבנקודה x=1 השיפוע יהיה 0 (נקודת קיצון ב-x=1).",
        type: "parameter",
        targetCondition: (state) => Math.abs(state.x - 1) < 0.1 && Math.abs(state.m) < 0.1,
        setup: { a: 1, b: -4, c: 0, d: 0, showTangent: true },
        locked: ['a', 'c', 'd'] // רק b פתוח
    },
    {
        id: 10,
        title: "שאלה 10: אתגר מסכם",
        instruction: "צור פרבולה שקודקודה נמצא בנקודה (2,1). השתמש ב-a, b, c.",
        type: "parameter",
        targetCondition: (state) => Math.abs(state.x - 2) < 0.2 && Math.abs(state.y - 1) < 0.2 && Math.abs(state.m) < 0.1,
        setup: { a: 1, b: 0, c: 0, d: 0, showTangent: true },
        locked: ['d'] // הכל פתוח חוץ מ-d
    }
];

let currentLevelIndex = 0;

// פונקציה שטוענת שאלה
function initLevel(index) {
    const q = questions[index];
    
    // עדכון כותרת והוראות
    document.getElementById('questionText').innerHTML = `<strong>${q.title}</strong><br>${q.instruction}`;
    document.getElementById('successMessage').style.display = 'none';

    // איפוס סליידרים לפי הגדרות השאלה
    ['a', 'b', 'c', 'd'].forEach(param => {
        const slider = document.getElementById(`param${param.toUpperCase()}`);
        if (q.setup[param] !== undefined) {
            slider.value = q.setup[param];
            // עדכון משתנים גלובליים
            window[param] = q.setup[param]; 
            document.getElementById(`val${param.toUpperCase()}`).textContent = q.setup[param];
        }
        
        // נעילה/פתיחה של סליידרים
        slider.disabled = q.locked.includes(param);
        slider.parentElement.style.opacity = q.locked.includes(param) ? "0.5" : "1";
    });

    // איפוס הגרף (חשוב כדי לרענן את הנתונים)
    updateGraph();
}

// פונקציה שבודקת תשובה (נקראת מתוך updateGraph)
function checkAnswer(x, y, m, aVal) {
    const q = questions[currentLevelIndex];
    
    // אובייקט מצב נוכחי לבדיקה
    const currentState = {
        x: x,
        y: y,
        m: m,
        a: aVal,
        isExtremum: Math.abs(m) < 0.05 // האם זה קיצון
    };

    // בדיקה האם התנאי מתקיים
    if (q.targetCondition(currentState)) {
        showSuccess();
    }
}

// פונקציית הצלחה
function showSuccess() {
    const msg = document.getElementById('successMessage');
    if (msg.style.display === 'block') return; // מניעת הבהוב

    msg.style.display = 'block';
    
    // הוספה ליומן אם צריך
    if (questions[currentLevelIndex].type === 'parameter') {
        const funcStr = `f(x) = ${a}x² + ${b}x + ${c}`;
        addJournalEntry(`נפתר: ${questions[currentLevelIndex].title}`);
    }

    // מעבר לשאלה הבאה אוטומטית אחרי 2 שניות
    setTimeout(() => {
        if (currentLevelIndex < questions.length - 1) {
            currentLevelIndex++;
            initLevel(currentLevelIndex);
        } else {
            alert("סיימת את כל השאלות! כל הכבוד!");
            currentLevelIndex = 0;
            initLevel(0);
        }
    }, 2000);
}

// --- חשוב: וודא שאתה קורא ל-checkAnswer מתוך updateGraph ---
// בתוך הפונקציה updateGraph בקוד הקיים שלך, הוסף את השורה הזו בסוף:
// checkAnswer(xPoint, yPoint, slopeAtPoint, a);
