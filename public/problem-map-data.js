window.VizyProblemMaps = [
  {
    id:'extrema-cubic', grade:'י״א', topic:'נגזרת · נקודות קיצון',
    text:[
      {t:'נתונה הפונקציה '},{t:'f(x) = x³ − 12x',ltr:true,clue:'fn'},
      {t:'. מצאו את '},{t:'נקודות הקיצון',clue:'ext'},
      {t:' וקבעו את '},{t:'סוגן',clue:'kind'},{t:'.'}
    ],
    nodes:['d','x','y'],extra:{id:'kind',label:'הסוג'},local:'extremum',links:[],
    clues:{
      fn:{question:'מה החלק הזה נותן?',options:[
        {label:'את y לכל x שנבחר',right:true},
        {label:'את נקודות הקיצון עצמן',feedback:'הנוסחה עוד לא אומרת איפה הקיצון. היא נותנת גובה לכל x.'},
        {label:'את השיפוע בכל נקודה',feedback:'השיפוע מגיע מהנגזרת, לא מהנוסחה עצמה.'}
      ],effects:[{node:'y',level:1,value:'y = f(x)'},{node:'x',level:1,value:'עד 2 ערכים'}],
      why:'הנוסחה נותנת גובה לכל x. היא ממעלה 3, ולכן יש לכל היותר שתי נקודות קיצון.'},
      ext:{question:'מה המילים האלה אומרות על הנקודה?',options:[
        {label:'f′(x) = 0 בנקודה',right:true},
        {label:'f(x) = 0 בנקודה',feedback:'זה חיתוך עם ציר x, לא קיצון.'},
        {label:'x = 0',feedback:'קיצון לא חייב להיות על ציר y.'}
      ],effects:[{node:'d',level:2,value:'f′(x) = 0'}],
      why:'בנקודת קיצון של פונקציה גזירה המשיק אופקי. זה תנאי הכרחי, לא מספיק.'},
      kind:{question:'איך קובעים סוג?',options:[
        {label:'בודקים את הסימן של f′ משני צידי הנקודה',right:true},
        {label:'בודקים אם y חיובי או שלילי',feedback:'מקסימום יכול להיות גם מתחת לציר x.'},
        {label:'בודקים אם x חיובי או שלילי',feedback:'המיקום על ציר x לא קובע את הסוג.'}
      ],effects:[{node:'kind',level:1,value:'מקסימום או מינימום'}],
      why:'עולה ואז יורדת: מקסימום. יורדת ואז עולה: מינימום.'}
    },
    openForClass:'לאילו ערכי x מתקיים f′(x) = 0, ומה הסימן של f′ מכל צד?'
  },
  {
    id:'tangent-parabola', grade:'י״א', topic:'נגזרת · משיק לפרבולה',
    text:[
      {t:'נתונה הפונקציה '},{t:'f(x) = x² − 4x + 3',ltr:true,clue:'fn'},
      {t:'. מצאו את משוואת '},{t:'המשיק',clue:'tan'},
      {t:' לגרף בנקודה שבה '},{t:'x = 3',ltr:true,clue:'x3'},{t:'.'}
    ],
    nodes:['d','x','y'],local:null,links:[],
    clues:{
      fn:{question:'מה החלק הזה נותן?',options:[
        {label:'את גובה הנקודה, אחרי שמציבים x',right:true},
        {label:'את שיפוע המשיק',feedback:'השיפוע מגיע מהנגזרת.'},
        {label:'את משוואת המשיק',feedback:'משוואת המשיק היא ישר אחר. הנוסחה הזו היא של הפונקציה.'}
      ],effects:[{node:'y',level:1,value:'y = f(3)'}],
      why:'מציבים x בנוסחה ומקבלים את הגובה. עוד לא חישבנו.'},
      tan:{question:'מה צריך לדעת על משיק?',options:[
        {label:'השיפוע שלו שווה לנגזרת בנקודה',right:true},
        {label:'הוא תמיד אופקי',feedback:'אופקי רק בנקודת קיצון.'},
        {label:'הוא עובר דרך ראשית הצירים',feedback:'הוא עובר דרך נקודת ההשקה, לא בהכרח דרך הראשית.'}
      ],effects:[{node:'d',level:1,value:'m = f′(3)'}],
      why:'משיק הוא ישר. צריך לו נקודה ושיפוע, והשיפוע הוא הנגזרת בנקודה.'},
      x3:{question:'מה כבר ידוע בדיוק?',options:[
        {label:'איפה הנקודה על ציר x',right:true},
        {label:'גובה הנקודה',feedback:'את הגובה עוד צריך לחשב.'},
        {label:'שיפוע המשיק',feedback:'את השיפוע עוד צריך לחשב.'}
      ],effects:[{node:'x',level:2,value:'x = 3'}],
      why:'זה הנתון המדויק היחיד בשאלה. ממנו מגיעים לכל השאר.'}
    },
    openForClass:'כמה שווים f(3) ו־f′(3)? מהם בונים את משוואת הישר.'
  },
  {
    id:'parameter-extremum',grade:'י״א',topic:'נגזרת · קיצון עם פרמטר',
    text:[
      {t:'נתונה הפונקציה '},{t:'f(x) = x² + ax',ltr:true,clue:'fn'},
      {t:'. לפונקציה יש '},{t:'נקודת קיצון',clue:'ext'},
      {t:' ב־'},{t:'x = 2',ltr:true,clue:'x2'},{t:'. מצאו את a.'}
    ],
    nodes:['d','x','y'],local:'extremum',
    clues:{
      fn:{question:'מה החלק הזה נותן?',options:[
        {label:'את y לכל x, אחרי שיודעים את a',right:true},
        {label:'את הערך של a',feedback:'a עדיין לא ידוע. הוא מה שמחפשים.'},
        {label:'את נקודת הקיצון',feedback:'הנוסחה לבדה לא אומרת איפה הקיצון.'}
      ],effects:[{node:'y',level:1,value:'y = f(x), תלוי ב־a'}],
      why:'יש כאן משפחה של פונקציות. כל a נותן פונקציה אחרת.'},
      ext:{question:'מה המילים האלה אומרות על הנקודה?',options:[
        {label:'f′(x) = 0 בנקודה',right:true},
        {label:'f(x) = 0 בנקודה',feedback:'זה חיתוך עם ציר x, לא קיצון.'},
        {label:'a = 0',feedback:'אין סיבה ש־a יהיה אפס.'}
      ],effects:[{node:'d',level:2,value:'f′(x) = 0'}],
      why:'בנקודת קיצון של פונקציה גזירה המשיק אופקי.'},
      x2:{question:'מה כבר ידוע בדיוק?',options:[
        {label:'איפה הקיצון על ציר x',right:true},
        {label:'גובה הקיצון',feedback:'הגובה תלוי ב־a.'},
        {label:'הערך של a',feedback:'את a עוד צריך למצוא.'}
      ],effects:[{node:'x',level:2,value:'x = 2'}],
      why:'זה נתון מדויק.'}
    },
    links:[{needs:['ext','x2'],between:['x','d'],text:'f′(2) = 0',note:'משוואה אחת עם נעלם אחד: a'}],
    openForClass:'מה יוצא מ־f′(2) = 0?'
  }
];