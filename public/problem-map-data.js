window.VizyProblemMaps=[{
 id:'parameter-extremum',grade:'י״א',topic:'נגזרת וקיצון עם פרמטר',
 text:[
  {t:'נתונה',phrase:'given'},{t:' '},
  {t:'הפונקציה f(x) = x² + ax',phrase:'fn',ltr:true},{t:'. לפונקציה '},
  {t:'יש',phrase:'has'},{t:' '},{t:'נקודת קיצון',phrase:'ext'},
  {t:' ב־'},{t:'x = 2',phrase:'x',ltr:true},{t:'. '},
  {t:'מצאו',phrase:'find'},{t:' את '},{t:'a',phrase:'a',ltr:true},{t:'.'}
 ],
 phrases:{
  given:{role:'relation',source:'none',ok:'יחס: המילה מסמנת שמה שבא אחריה נתון.'},
  fn:{role:'object',source:'given',ok:'עצם, והוא נתון. בגלל a זו משפחה של פונקציות, לא פונקציה אחת.'},
  has:{role:'relation',source:'none',ok:'יחס: מחבר בין הפונקציה לבין הנקודה.'},
  ext:{role:'object',source:'given',ok:'עצם, והוא נתון: ידוע שיש נקודה כזו.'},
  x:{role:'object',source:'given',ok:'עצם, והוא נתון: המקום של הנקודה.'},
  find:{role:'instruction',source:'none',ok:'הוראה: היא לא מוסיפה מידע. היא אומרת מה מבוקש.'},
  a:{role:'object',source:'asked',ok:'עצם, והוא המבוקש.'}
 },
 roleError:'עוד לא. עצם הוא דבר מתמטי, יחס מחבר בין דברים, הוראה אומרת מה לעשות.',
 summaryDetermined:'הנתונים קובעים: פונקציה אחת מתוך אינסוף.',
 fields:[
  {id:'x',symbol:'x',from:{phrase:'x'},value:'x = 2',label:'נתון'},
  {id:'y',symbol:'y',from:{phrase:'fn'},value:'f(2)',label:'תלוי ב-a'},
  {id:'d',symbol:'f′(x)',from:{claim:'c1'},value:'f′(2) = 0',label:'מסקנה'},
  {id:'a',symbol:'a',from:{phrase:'a'},value:'?',label:'מבוקש',overrides:[{from:{claim:'c4'},value:'?',label:'נקבע, לא חושב'}]}
 ],
 represent:{
  intro:'הנוסחה לבדה, בציור: משפחה של פרבולות. כל a נותן פרבולה אחרת.',
  statement:'נקודת קיצון ב־x = 2',
  pictures:[
   {id:'crossing',right:false,aria:'עקומה חוצה את הציר ב־2'},
   {id:'flat',right:true,aria:'משיק אופקי מעל 2, עם גבעה ועמק מקווקווים'},
   {id:'rising',right:false,aria:'עקומה עולה עם משיק משופע מעל 2'}
  ],
  algebra:[
   {text:'f′(2) = 0',right:true},
   {text:'f(2) = 0',right:false},
   {text:'f′(x) = 2',right:false}
  ],
  pictureRight:'קובע: משיק אופקי מעל x = 2. לא קובע: גובה הנקודה, וגבעה או עמק.',
  algebraRight:'קובע: קשר מדויק בין הנגזרת לנקודה. לא קובע עדיין: כמה שווה a.',
  pictureWrong:'עוד לא. מה קורה למשיק בנקודת קיצון?',
  algebraWrong:'עוד לא. הנגזרת היא שמתאפסת, ובנקודה x = 2.'
 },
 principle:'עיקרון ידוע: בנקודת קיצון של פונקציה גזירה, הנגזרת שווה אפס.',
 answerLabels:['נובע בלי חישוב','לא נכון','נקבע, דורש חישוב'],
 claims:[
  {id:'c1',text:'f′(2) = 0',right:0,reason:'נובע מהעיקרון ומהנתון x = 2.',summary:'f′(2) = 0'},
  {id:'c2',text:'הנקודה היא מינימום',right:0,reason:'המקדם של x² חיובי, לכן הפרבולה פונה למעלה.',summary:'מינימום'},
  {id:'c3',text:'כל ערך של a מתאים לשאלה',right:1,reason:'התנאי על x = 2 משאיר פרבולה אחת בלבד.',summary:'לא כל a מתאים'},
  {id:'c4',text:'a הוא מספר אחד מסוים',right:2,reason:'הנתונים קובעים אותו. כמה הוא? את זה מחשבים בכיתה.',summary:'a נקבע אך לא חושב'}
 ],
 inferenceWrong:'עוד לא. מה בדיוק ידוע, ומאיפה?',
 inferenceClosing:'זה מה שאפשר לדעת בלי לחשב. את a מוצאים באלגברה, בכיתה.',
 checkpoint:[
  {id:'tangent',text:'אנחנו יודעים איך נראה המשיק'},
  {id:'graph',text:'אנחנו רואים רק חלק מהגרף'},
  {id:'algebra',text:'אנחנו יודעים מה עוד צריך לחשב'},
  {id:'unsure',text:'אנחנו עדיין לא בטוחים, וזה בסדר'}
 ]
}];