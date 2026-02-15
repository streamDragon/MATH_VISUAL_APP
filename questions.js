const QUESTIONS = [
    {
        title: '1. חימום מנועים',
        desc: 'שחק עם הסליידרים. נסה ליצור פונקציה שעולה תמיד.',
        params: [0.1, 0, 1, 0],
        goal: 'free',
        locked: []
    },
    {
        title: '2. נקודת קיצון',
        desc: 'מצא נקודה שבה המשיק הוא אופקי (שיפוע 0).',
        params: [0.3, 0, -2, 1],
        goal: 'slope_zero',
        targetM: 0,
        locked: ['inpA', 'inpB', 'inpC', 'inpD']
    },
    {
        title: '3. צליפה למטרה',
        desc: 'כוון את הגרף כך שיעבור בנקודה הירוקה (2,3).',
        params: [0, 0, 1, 0],
        goal: 'hit_target',
        targets: [{ x: 2, y: 3 }],
        locked: ['inpA', 'inpB']
    },
    {
        title: '4. פרבולה בוכה',
        desc: "צור פרבולה 'בוכה' (a=0, b שלילי).",
        params: [0, 1, 0, 0],
        goal: 'slope_equals',
        targetM: 999,
        locked: []
    }
];
