// Original authored scenarios, not copied textbook pages. Regeneration is explicit.
import fs from "node:fs";
const families = [
  {
    kind: "linear",
    topicLabel: "ישרים ושיפוע",
    grade: 9,
    query: "value",
    title: "בונים מסלול",
    stem: "נתון הישר y = {m}x + {b}. מהו y כאשר x = {x}?",
    params: { m: 2, b: 1, x: 2 },
    answer: 5,
    transfer: { params: { m: 2, b: 1, x: 3 }, query: "value", answer: 7 },
    prediction: {
      question: "כשמתקדמים צעד אחד ימינה, בכמה משתנה הגובה?",
      options: ["עולה ב־2", "עולה ב־1", "יורד ב־2"],
      correct: 0,
    },
    meaning:
      "השיפוע הוא שינוי בגובה לכל צעד ימינה. החיתוך עם ציר y קובע מאיפה מתחילים.",
    rule: "y = mx + b",
    mediation: [
      "מהו הגובה ההתחלתי? מצאו את החיתוך עם ציר y.",
      "כל צעד ימינה מוסיף את השיפוע. דמיינו שני צעדים.",
      "חברו בין הגובה בציור להצבה במשוואה.",
    ],
  },
  {
    kind: "quadratic",
    topicLabel: "פרבולות והזזות",
    grade: 9,
    query: "vertexX",
    title: "מזיזים את העמק",
    stem: "נתונה הפרבולה y = {a}(x − {h})² + {k}. מהו x של הקודקוד?",
    params: { a: 1, h: 2, k: -1, x: 0 },
    answer: 2,
    transfer: {
      params: { a: 1, h: -3, k: 2, x: 0 },
      query: "vertexX",
      answer: -3,
    },
    prediction: {
      question: "בביטוי (x − 2)², לאיזה צד זז הקודקוד ביחס ל־x²?",
      options: ["שמאלה", "ימינה", "לא זז"],
      correct: 1,
    },
    meaning:
      "הקודקוד נמצא במקום שבו הביטוי בריבוע מתאפס. ההזזה האנכית משנה את הגובה.",
    rule: "קודקוד: (h, k)",
    mediation: [
      "סמנו בראש את נקודת הקודקוד, שבה הפרבולה משנה כיוון.",
      "איזה x הופך את הביטוי בתוך הסוגריים לאפס?",
      "בדקו שההזזה האנכית אינה משנה את x של הקודקוד.",
    ],
  },
  {
    kind: "intersection",
    topicLabel: "משוואות ומפגשים",
    grade: 10,
    query: "intersectionX",
    title: "איפה נפגשים?",
    stem: "שני המסלולים הם y = {m}x + {b} ו־y = {n}x + {c}. באיזה x הם נפגשים?",
    params: { m: 2, b: 1, n: -1, c: 7, x: 0 },
    answer: 2,
    transfer: {
      params: { m: 1, b: 0, n: -1, c: 6, x: 0 },
      query: "intersectionX",
      answer: 3,
    },
    prediction: {
      question: "ישר עולה וישר יורד — כמה נקודות מפגש יש להם?",
      options: ["אף אחת", "אחת", "שתיים"],
      correct: 1,
    },
    meaning:
      "בנקודת המפגש שני המסלולים נותנים אותו גובה. לכן משווים בין הביטויים.",
    rule: "mx + b = nx + c",
    mediation: [
      "עקבו בעיניים אחרי כל מסלול בנפרד.",
      "דמיינו מקום שבו שני הגבהים שווים.",
      "השוויון בציור הופך למשוואה עם נעלם אחד.",
    ],
  },
  {
    kind: "triangle",
    topicLabel: "משולשים ופיתגורס",
    grade: 10,
    query: "hypotenuse",
    title: "בונים קיצור דרך",
    stem: "במשולש ישר־זווית אורכי הניצבים הם {a} ו־{b}. מהו אורך היתר?",
    params: { a: 3, b: 4, x: 0 },
    answer: 5,
    transfer: { params: { a: 6, b: 8, x: 0 }, query: "hypotenuse", answer: 10 },
    prediction: {
      question: "היתר הוא הצלע שמול הזווית הישרה. מה נכון?",
      options: ["קצר מכל ניצב", "שווה תמיד לניצב", "ארוך מכל ניצב"],
      correct: 2,
    },
    meaning: "היתר מחבר את קצות שני הניצבים. פיתגורס מקשר בין ריבועי האורכים.",
    rule: "c² = a² + b²",
    mediation: [
      "זהו קודם את הזווית הישרה ואת הצלע שמולה.",
      "דמיינו ריבוע על כל צלע: איזה שטח הוא סכום האחרים?",
      "מצאו את ריבוע היתר, ואז את האורך עצמו.",
    ],
  },
  {
    kind: "probability",
    topicLabel: "הסתברות",
    grade: 10,
    query: "probability",
    title: "מה הסיכוי?",
    stem: "בשק יש {red} כדורים ורודים ו־{blue} כדורים כחולים. מה ההסתברות להוציא ורוד? אפשר לכתוב שבר.",
    params: { red: 2, blue: 6, x: 0 },
    answer: 0.25,
    transfer: {
      params: { red: 3, blue: 3, x: 0 },
      query: "probability",
      answer: 0.5,
    },
    prediction: {
      question: "כשיש יותר כדורים כחולים מוורודים, הסיכוי לוורוד הוא…",
      options: ["קטן מחצי", "בדיוק חצי", "גדול מחצי"],
      correct: 0,
    },
    meaning: "כל כדור הוא אפשרות שווה. סופרים הצלחות ומשווים לכל האפשרויות.",
    rule: "P = מספר ההצלחות / מספר האפשרויות",
    mediation: [
      "סמנו בראש רק את האפשרויות שנחשבות הצלחה.",
      "ספרו את כל האפשרויות, גם אלה שאינן הצלחה.",
      "תרגמו את היחס בציור לשבר בין 0 ל־1.",
    ],
  },
  {
    kind: "derivative",
    topicLabel: "משיקים ונגזרות",
    grade: 11,
    query: "slope",
    title: "קוראים את הכיוון",
    stem: "נתונה f(x) = {a}x² + {b}x + {c}. מה שיפוע המשיק ב־x = {x}?",
    params: { a: 1, b: 0, c: 0, x: 2 },
    answer: 4,
    transfer: {
      params: { a: 1, b: 0, c: 0, x: -1 },
      query: "slope",
      answer: -2,
    },
    prediction: {
      question: "בפרבולה x², בצד הימני של הקודקוד המשיק…",
      options: ["אופקי תמיד", "יורד", "עולה"],
      correct: 2,
    },
    meaning: "הנגזרת מתארת את השיפוע המקומי. המשיק מראה את הכיוון ממש בנקודה.",
    rule: "f′(x) = 2ax + b",
    mediation: [
      "התבוננו בכיוון הגרף ליד הנקודה, לא בכל הגרף.",
      "דמיינו סרגל שמונח על הגרף בנקודה.",
      "קשרו בין השיפוע של הסרגל לערך הנגזרת.",
    ],
  },
];
const bank = [];
for (const f of families)
  for (let i = 0; i < 4; i++) {
    const a = structuredClone(f);
    a.id = `${f.kind}-${String(i + 1).padStart(2, "0")}`;
    a.topic = f.kind;
    a.tier = i < 2 ? "free" : "premium";
    a.level = i < 2 ? 1 : 2;
    a.minutes = 3;
    a.summary = f.meaning;
    a.source = {
      method: "original_authored",
      date: "2026-10-04",
      review: "mathematical_validator",
      curriculumAlignment: "suggested; teacher review required",
    };
    if (i) {
      if (f.kind === "linear") {
        a.params = { m: i + 1, b: i, x: 2 };
        a.answer = 3 * i + 2;
        a.transfer.params = { m: i + 1, b: i, x: 3 };
        a.transfer.answer = 4 * i + 3;
        a.prediction = {
          question: `בישר ששיפועו ${i + 1}, בכמה משתנה y בצעד אחד ימינה?`,
          options: [`עולה ב־${i + 1}`, "לא משתנה", `יורד ב־${i + 1}`],
          correct: 0,
        };
      }
      if (f.kind === "quadratic") {
        a.params = { a: i % 2 ? -1 : 1, h: i - 2, k: i, x: 0 };
        a.answer = i - 2;
        a.transfer.params = { a: 1, h: i + 2, k: -i, x: 0 };
        a.transfer.answer = i + 2;
        a.prediction = {
          question: `כשמקדם הריבוע הוא ${a.params.a}, הפרבולה נפתחת…`,
          options: ["כלפי מעלה", "כלפי מטה", "לצדדים"],
          correct: a.params.a > 0 ? 0 : 1,
        };
      }
      if (f.kind === "intersection") {
        a.params = { m: 1, b: i, n: -1, c: i + 4, x: 0 };
        a.answer = 2;
        a.transfer.params = { m: 2, b: i, n: -1, c: i + 9, x: 0 };
        a.transfer.answer = 3;
      }
      if (f.kind === "triangle") {
        const j = i + 1;
        a.params = { a: 3 * j, b: 4 * j, x: 0 };
        a.answer = 5 * j;
        a.transfer.params = { a: 3 * (j + 1), b: 4 * (j + 1), x: 0 };
        a.transfer.answer = 5 * (j + 1);
      }
      if (f.kind === "probability") {
        a.params = { red: i + 1, blue: 3 * (i + 1), x: 0 };
        a.answer = 0.25;
        a.transfer.params = { red: i + 1, blue: i + 1, x: 0 };
        a.transfer.answer = 0.5;
      }
      if (f.kind === "derivative") {
        a.params = { a: 1, b: i, c: 1, x: 2 };
        a.answer = 4 + i;
        a.transfer.params = { a: 1, b: i, c: 1, x: -2 };
        a.transfer.answer = -4 + i;
      }
      a.title =
        f.title + ["", " · שינוי קטן", " · אתגר נוסף", " · חושבים קדימה"][i];
    }
    a.transfer.stem = a.stem;
    a.transfer.meaning =
      "אותו רעיון, נתונים אחרים: נסו קודם לדמיין את הציור בלי להציג אותו.";
    bank.push(a);
  }
fs.writeFileSync(
  "content/learning-bank.json",
  JSON.stringify(bank, null, 2) + "\n",
);
fs.writeFileSync(
  "public/learning-bank.json",
  JSON.stringify(
    bank.map((a) =>
      a.tier === "free"
        ? a
        : {
            id: a.id,
            title: a.title,
            grade: a.grade,
            topic: a.topic,
            topicLabel: a.topicLabel,
            summary: a.summary,
            tier: a.tier,
            minutes: a.minutes,
            level: a.level,
          },
    ),
    null,
    2,
  ) + "\n",
);
console.log(
  `${bank.length} activities; ${bank.filter((a) => a.tier === "free").length} free`,
);
