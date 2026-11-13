/* Curated short stories. Historical attribution is distinguished from mathematical folklore.
   Spec rule 2a.4 (docs/teaching/AGREED_SPEC_2026-11-13.md): at most three short lines, then ONE
   question in which the student makes the connection, then straight into the activity.
   A story never shows the solved path of the activity's own problem: connecting questions use
   different expressions from the activity. No boxes explaining the method.
   Each option has verdict 'best' (the connection), 'works' (valid but not the connection) or 'no'. */
(function(root){
 'use strict';
 const b=(he,en)=>({he,en});
 root.VizyStoryLibrary=[
  {
   id:'kettle',icon:'☕',status:'folklore',title:b('הקומקום של המתמטיקאי','The mathematician’s kettle'),
   scenes:[
    b('פיזיקאי ומתמטיקאי צריכים להכין תה. הקומקום בסלון. שניהם לוקחים אותו למטבח ומרתיחים.',
      'A physicist and a mathematician must make tea. The kettle is in the living room. Both carry it to the kitchen and boil water.'),
    b('למחרת הקומקום כבר במטבח.',
      'The next day the kettle is already in the kitchen.'),
    b('הפיזיקאי מדליק אותו. המתמטיקאי מחזיר אותו לסלון: ״עכשיו זו בעיה שכבר פתרנו.״',
      'The physicist switches it on. The mathematician carries it back to the living room: “Now it is a problem we have already solved.”')
   ],
   question:b('תרגיל חדש: (y+2)² − 16. מה כאן ״להחזיר את הקומקום לסלון״?',
     'A new exercise: (y+2)² − 16. What is “carrying the kettle back” here?'),
   options:[
    {id:'reduce',verdict:'best',label:b('לקרוא ל־(y+2) בשם אחד, A, ולקבל A² − 16, תרגיל שכבר מכירים','Call (y+2) by one name, A, and get A² − 16, an exercise we already know'),
     feedback:b('זה הקומקום: נתנו לביטוי שלם שם אחד, והגענו לבעיה מוכרת.','That is the kettle: one name for a whole expression, and we reach a familiar problem.')},
    {id:'expand',verdict:'works',label:b('לפתוח סוגריים ולכנס, כמו בכל תרגיל','Expand and collect, as in any exercise'),
     feedback:b('זה עובד, וזו הדרך של הפיזיקאי. איזו בעיה מוכרת מסתתרת כאן?','That works, and it is the physicist’s way. Which familiar problem is hiding here?')},
    {id:'plug',verdict:'no',label:b('להציב y = 0 ולראות מה יוצא','Put y = 0 and see what comes out'),
     feedback:b('זו בדיקה של מקרה אחד. היא לא מחזירה אותנו לבעיה מוכרת.','That checks one case. It does not bring us back to a familiar problem.')}
   ],
   link:{href:'problem-map.html?lesson=difference-squares',text:b('עכשיו בתרגיל שלך','Now in your exercise')},
   source:{href:'https://hsm.stackexchange.com/questions/14189/origin-of-the-teakettle-principle-joke',
     label:b('על גלגולי בדיחת הקומקום','History of the kettle joke')},
   attribution:b('בדיחה מתמטית ותיקה. חגי זוכר גרסה שסיפר פרופ׳ ישראל אומן; לא מצאנו תיעוד שמאמת את הייחוס ולכן זה אינו מוצג כציטוט שלו.',
     'An old mathematical joke. Haggai recalls Professor Robert Aumann telling a version; we have not independently verified that attribution, so this is not presented as his quotation.')
  },
  {
   id:'gauss',icon:'➕',status:'legend',title:b('גאוס והמספרים עד מאה','Gauss and the numbers to 100'),
   scenes:[
    b('מספרים שהמורה של גאוס הצעיר ביקש לחבר את כל המספרים מ־1 עד 100.',
      'The story goes that young Gauss’s teacher asked for the sum of all numbers from 1 to 100.'),
    b('גאוס הסתכל על הקצוות: 1+100, 2+99, 3+98.',
      'Gauss looked at the ends: 1+100, 2+99, 3+98.'),
    b('אחרי רגע כתב: 5050.',
      'A moment later he wrote: 5050.')
   ],
   question:b('עכשיו: 1 + 2 + … + 20. מה חוזר כאן?','Now: 1 + 2 + … + 20. What repeats here?'),
   options:[
    {id:'pairs',verdict:'best',label:b('10 זוגות, וכל זוג שווה 21','10 pairs, each equal to 21'),
     feedback:b('כן. 10 × 21 = 210. ראית יחידה שחוזרת.','Yes. 10 × 21 = 210. You saw a unit that repeats.')},
    {id:'twenty',verdict:'no',label:b('20 זוגות, וכל זוג שווה 21','20 pairs, each equal to 21'),
     feedback:b('כל זוג לוקח שני מספרים. כמה זוגות יש ב־20 מספרים?','Each pair uses two numbers. How many pairs are there in 20 numbers?')},
    {id:'onebyone',verdict:'works',label:b('אין מה לחפש, מחברים אחד־אחד','Nothing to look for; add one by one'),
     feedback:b('זה עובד, אבל ארוך. מה חוזר בקצוות?','That works, but it is long. What repeats at the ends?')}
   ],
   link:{href:'problem-map.html?lesson=difference-squares',text:b('לחפש מה חוזר בביטוי','Find what repeats in an expression')},
   source:{href:'https://epubs.siam.org/doi/10.1137/1.9780898717624.appc',
      label:b('הסיפור וההסבר המתמטי (SIAM)','The story and mathematics (SIAM)')},
   attribution:b('הסיפור מוכר כאנקדוטה על גאוס; הפרטים ההיסטוריים אינם ודאיים.',
     'This is a famous anecdote attributed to Gauss; its historical details are not certain.')
  },
  {
   id:'germain',icon:'✉️',status:'history',title:b('סופי ז׳רמן והחתימה הסודית','Sophie Germain and the secret signature'),
   scenes:[
    b('בתחילת המאה ה־19 נשים כמעט לא הורשו לעסוק במתמטיקה.',
      'In the early 1800s, women were barely allowed to work in mathematics.'),
    b('סופי ז׳רמן כתבה לגאוס בשם בדוי, ״מר לה בלאן״.',
      'Sophie Germain wrote to Gauss under a false name, “M. LeBlanc”.'),
    b('גאוס העריך את העבודה. כשגילה מי כתבה אותה, הוא העריך אותה עוד יותר.',
      'Gauss valued the work. When he found out who wrote it, he valued it even more.')
   ],
   question:b('תלמיד כתב: ב־(y−4)² − 16 מתקיים A = y−4 ו־B = 4. איך נדע אם הוא צודק?',
     'A student wrote: in (y−4)² − 16, A = y−4 and B = 4. How do we know if he is right?'),
   options:[
    {id:'putback',verdict:'best',label:b('מציבים בחזרה ב־A² − B² ובודקים שיוצא בדיוק הביטוי','Put them back into A² − B² and check the expression comes out exactly'),
     feedback:b('כן. A² − B² = (y−4)² − 16. הבדיקה, לא השם, מכריעה.','Yes. A² − B² = (y−4)² − 16. The check decides, not the name.')},
    {id:'star',verdict:'no',label:b('הוא התלמיד הכי טוב בכיתה','He is the best student in the class'),
     feedback:b('שם טוב לא מוכיח. מה אפשר לבדוק?','A good name proves nothing. What can be checked?')},
    {id:'looks',verdict:'no',label:b('זה נראה דומה ל־A² − B²','It looks like A² − B²'),
     feedback:b('דומה זו התחלה. מה יראה שזה בדיוק אותו ביטוי?','Looking alike is a start. What would show it is exactly the same expression?')}
   ],
   link:{href:'problem-map.html?lesson=difference-squares',text:b('עכשיו בתרגיל שלך','Now in your exercise')},
   source:{href:'https://mathshistory.st-andrews.ac.uk/Biographies/Germain/',
      label:b('ביוגרפיה היסטורית, MacTutor','Historical biography, MacTutor')},
   attribution:b('מבוסס על התכתובת המתועדת בין סופי ז׳רמן לגאוס.',
     'Based on the historically documented correspondence between Germain and Gauss.')
  },
  {
   id:'wiles',icon:'🧭',status:'history',title:b('ויילס והגשר למשפט פרמה','Wiles and the bridge to Fermat'),
   scenes:[
    b('יותר מ־300 שנה ניסו מתמטיקאים להוכיח את המשפט האחרון של פרמה.',
      'For more than 300 years mathematicians tried to prove Fermat’s Last Theorem.'),
    b('אנדרו ויילס לא תקף אותו ישירות.',
      'Andrew Wiles did not attack it directly.'),
    b('אחרי שבע שנות עבודה, ב־1994, ההוכחה הושלמה.',
      'After seven years of work, in 1994, the proof was complete.')
   ],
   question:b('אם לא ישירות, מה ויילס עשה?','If not directly, what did Wiles do?'),
   options:[
    {id:'bridge',verdict:'best',label:b('חיבר את פרמה לבעיה אחרת שיש לה כלים, והוכיח את החיבור','He connected Fermat to another problem that had tools, and proved the connection'),
     feedback:b('כן. הגשר היה החלק הקשה. בכיתה הגשר קצר: מחברים ביטוי לזהות מוכרת.','Yes. The bridge was the hard part. In class the bridge is short: connect an expression to a known identity.')},
    {id:'formula',verdict:'no',label:b('מצא נוסחה קצרה שאף אחד לא ראה','He found a short formula nobody had seen'),
     feedback:b('ההוכחה ארוכה מאוד. מה עוד אפשר לעשות עם בעיה קשה?','The proof is very long. What else can you do with a hard problem?')},
    {id:'check',verdict:'no',label:b('בדק במחשב הרבה מאוד מספרים','He checked a huge number of cases by computer'),
     feedback:b('בדיקת מקרים לא מוכיחה טענה על כל המספרים.','Checking cases does not prove a claim about all numbers.')}
   ],
   link:{href:'problem-map.html?lesson=difference-squares',text:b('לבנות גשר קטן באלגברה','Build a small bridge in algebra')},
   source:{href:'https://abelprize.no/abel-prize-laureates/2016',
      label:b('פרס אבל 2016, התיאור הרשמי','2016 Abel Prize, official citation')},
   attribution:b('עובדות היסטוריות מתוך תיעוד פרס אבל, 2016.',
     'Historical facts sourced from the 2016 Abel Prize citation.')
  }
 ];
})(typeof window!=='undefined'?window:globalThis);
