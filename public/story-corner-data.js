/* Curated short stories. Historical attribution is distinguished from mathematical folklore.
   Add stories here; the overlay renderer is intentionally independent of lesson engines. */
(function(root){
 'use strict';
 const b=(he,en)=>({he,en});
 root.VizyStoryLibrary=[
  {
   id:'kettle',icon:'☕',status:'folklore',title:b('הקומקום של המתמטיקאי','The mathematician’s kettle'),
   eyebrow:b('סיפור מתמטי ידוע · מגיעים למסלול שכבר מכירים','Mathematical folklore · reduce to a familiar path'),
   scenes:[
    b('פיזיקאי ומתמטיקאי התבקשו להכין תה. הקומקום היה בסלון. שניהם לקחו אותו למטבח, מילאו מים והרתיחו. פתרנו!',
      'A physicist and a mathematician were asked to make tea. The kettle was in the living room. Both brought it to the kitchen, filled it and boiled water. Solved!'),
    b('למחרת ביקשו מהם שוב להכין תה. אלא שהפעם הקומקום כבר נמצא במטבח.',
      'The next day they were asked again. But this time the kettle was already in the kitchen.'),
    b('הפיזיקאי הדליק את הקומקום. המתמטיקאי החזיר אותו לסלון וחייך: ״עכשיו זו בדיוק הבעיה שכבר פתרנו!״',
      'The physicist turned on the kettle. The mathematician carried it back to the living room: “Now it is exactly the problem we have already solved!”')
   ],
   dilemma:b('מה מיוחד בתשובה של המתמטיקאי?','What is special about the mathematician’s answer?'),
   options:[
    {id:'quick',label:b('הפיזיקאי מצא דרך קצרה יותר להכין תה','The physicist found a quicker way to make tea'),
     feedback:b('נכון! בחיי היום־יום לא כדאי להחזיר את הקומקום לסלון. הבדיחה אינה טוענת שהמתמטיקאי יעיל יותר במטבח.',
       'Exactly. In real life there is no reason to move the kettle back. The joke does not claim that mathematicians make tea more efficiently.')},
    {id:'reduce',label:b('המתמטיקאי חיבר את הבעיה החדשה למסלול שכבר פתרנו','The mathematician reduced the new case to a solved case'),
     feedback:b('זה לב הבדיחה: במקום להמציא פתרון חדש, מחפשים דרך להגיע למצב שכבר יודעים לפתור. במתמטיקה קוראים לזה צמצום לבעיה מוכרת.',
       'That is the heart of the joke: find a way to reach a case we already know how to solve. In mathematics, this is a reduction to a familiar problem.')}
   ],
   bridgeTitle:b('ואיך זה עוזר בהפרש ריבועים?','How does this help with difference of squares?'),
   knownLabel:b('השביל שכבר הכרנו: פתיחת סוגריים וכינוס','Our familiar path: expand and collect like terms'),
   known:b('(A−B)(A+B) = A² + AB − AB − B² = A² − B²',
     '(A−B)(A+B) = A² + AB − AB − B² = A² − B²'),
   bridgeLabel:b('מכאן למדנו קיצור חדש','We can now remember a shortcut'),
   shortcut:b('A² − B² = (A−B)(A+B)','A² − B² = (A−B)(A+B)'),
   applicationLabel:b('עכשיו מתחברים לשביל הזה במקרה שלנו','Now connect our new example to this path'),
   example:b('(x+1)² − 9 → A=x+1, B=3 → (x−2)(x+4)',
     '(x+1)² − 9 → A=x+1, B=3 → (x−2)(x+4)'),
   takeaway:b('הקיצור אינו קסם. קודם יודעים לפתח ולכנס, אחר כך מזהים את המבנה ופשוט מציבים.',
     'The shortcut is not magic. First understand expansion and collecting like terms; then recognize the structure and substitute.'),
   link:{href:'problem-map.html?lesson=difference-squares',text:b('לפעילות הפרש הריבועים','Try the difference-of-squares lesson')},
   source:{href:'https://hsm.stackexchange.com/questions/14189/origin-of-the-teakettle-principle-joke',
     label:b('על גלגולי בדיחת הקומקום','History of the kettle joke')},
   attribution:b('בדיחה מתמטית ותיקה. חגי זוכר גרסה שסיפר פרופ׳ ישראל אומן; לא מצאנו תיעוד שמאמת את הייחוס ולכן זה אינו מוצג כציטוט שלו.',
     'An old mathematical joke. Haggai recalls Professor Robert Aumann telling a version; we have not independently verified that attribution, so this is not presented as his quotation.')
  },
  {
   id:'gauss',icon:'➕',status:'legend',title:b('גאוס והמספרים עד מאה','Gauss and the numbers to 100'),
   eyebrow:b('אגדה מפורסמת · מגלים דפוס במקום לחשב הכול','A famous legend · discover a pattern'),
   scenes:[
    b('מספרים על גאוס הצעיר שמורה ביקש ממנו לחבר את כל המספרים מ־1 עד 100.',
      'A famous story says that young Gauss was asked to add every integer from 1 to 100.'),
    b('במקום לחבר אחד־אחד, הוא הביט בקצוות: 1+100, אחר כך 2+99, ואז 3+98.',
      'Instead of adding one by one, he noticed the ends: 1+100, then 2+99, then 3+98.'),
    b('כל זוג שווה 101. יש 50 זוגות, ולכן הסכום הוא 50×101 = 5050.',
      'Every pair equals 101. There are 50 pairs, so the sum is 50×101 = 5050.')
   ],
   dilemma:b('מה התגלית הגדולה כאן?','What was the important discovery?'),
   options:[
    {id:'calculate',label:b('הוא היה מסוגל לחבר מהר מאוד','He could add very quickly'),
     feedback:b('אולי, אבל זה לא העיקר בסיפור. הוא חסך חישובים מפני שזיהה מבנה חוזר.',
       'Perhaps, but that is not the point. He avoided repetitive calculations by recognizing a pattern.')},
    {id:'pattern',label:b('הוא זיהה שכל זוג קצוות נותן אותו סכום','He noticed that every end-pair has the same sum'),
     feedback:b('בדיוק. כשמזהים יחידה חוזרת, עשרות פעולות הופכות לפעולה אחת של כפל.',
       'Exactly. When you recognize a repeating unit, dozens of additions become one multiplication.')}
   ],
   bridgeTitle:b('מחשבים פחות כי מבינים יותר','Do less calculation by seeing more'),
   knownLabel:b('הדרך הארוכה','The long way'),
   known:b('1 + 2 + 3 + … + 100','1 + 2 + 3 + … + 100'),
   bridgeLabel:b('מהו המבנה החוזר?','What repeats?'),
   shortcut:b('(1+100) = (2+99) = … = 101','(1+100) = (2+99) = … = 101'),
   applicationLabel:b('התוצאה בקיצור','The short calculation'),
   example:b('50 × 101 = 5050','50 × 101 = 5050'),
   takeaway:b('גם כינוס איברים דומים וגם כפל מקוצר מתחילים באותה פעולה: מזהים משהו שחוזר, ונותנים לו שם.',
     'Collecting like terms and algebraic identities both begin with recognizing a repeating structure.'),
   link:{href:'problem-map.html?lesson=difference-squares',text:b('למציאת מבנה בתוך ביטוי','Find structure in an expression')},
   source:{href:'https://epubs.siam.org/doi/10.1137/1.9780898717624.appc',
      label:b('הסיפור וההסבר המתמטי (SIAM)','The story and mathematics (SIAM)')},
   attribution:b('הסיפור מוכר כאנקדוטה על גאוס; הפרטים ההיסטוריים אינם ודאיים.',
     'This is a famous anecdote attributed to Gauss; its historical details are not certain.')
  },
  {
   id:'germain',icon:'✉️',status:'history',title:b('סופי ז׳רמן והחתימה הסודית','Sophie Germain and the secret signature'),
   eyebrow:b('סיפור היסטורי · הנימוק חשוב מהשם','A true story · the argument matters more than the name'),
   scenes:[
    b('בתחילת המאה ה־19 סופי ז׳רמן חקרה מתמטיקה למרות המחסומים שהציבו בפני נשים בתחום.',
      'In the early 1800s, Sophie Germain pursued mathematics despite barriers facing women in the field.'),
    b('כדי שמחקריה יישקלו ברצינות, היא כתבה למתמטיקאי קרל פרידריך גאוס בשם הבדוי ״מר לה בלאן״.',
      'To have her work taken seriously, she wrote to mathematician Carl Friedrich Gauss under the pseudonym “M. LeBlanc”.'),
    b('גאוס העריך את הרעיונות שהגיעו אליו. כשגילה מי עומדת מאחורי השם, הוא הביע הערכה רבה עוד יותר.',
      'Gauss valued the mathematical work. When he learned who had written it, his admiration grew.')
   ],
   dilemma:b('מה צריך להכריע אם טענה מתמטית נכונה?','What should determine whether a mathematical statement is correct?'),
   options:[
    {id:'name',label:b('השם המפורסם שחתום עליה','The famous name on the page'),
     feedback:b('שם מפורסם אינו הוכחה. גם רעיון של תלמיד אלמוני יכול להיות נכון אם הנימוק עומד במבחן.',
       'A famous name is not a proof. An unknown student may have a sound idea if the reasoning stands up.')},
    {id:'reason',label:b('הנימוק, הדוגמאות וההוכחה','The reasoning, examples, and proof'),
     feedback:b('בדיוק. במתמטיקה בודקים מה נאמר ולמה זה נובע, לא מי כתב.',
       'Exactly. Mathematics asks what is claimed and why it follows, not merely who wrote it.')}
   ],
   bridgeTitle:b('אותיות הן שמות. המשמעות היא הקשר','Letters are names; the meaning is the relationship'),
   knownLabel:b('כך נראית תבנית כללית','The general structure'),
   known:b('A² − B²','A² − B²'),
   bridgeLabel:b('השם A יכול לייצג ביטוי שלם','A can stand for a whole expression'),
   shortcut:b('A = x+1 ; B = 3','A = x+1 ; B = 3'),
   applicationLabel:b('מה שחשוב הוא שההצבה מתאימה','What matters is a valid substitution'),
   example:b('(x+1)² − 9','(x+1)² − 9'),
   takeaway:b('אל תסמכו על התווית. בדקו את המשמעות ואת הנימוק שמאחוריה.',
     'Do not rely on the label. Check the meaning and the reasoning behind it.'),
   link:{href:'problem-map.html?lesson=difference-squares',text:b('לזהות מה A באמת מייצג','Explore what A represents')},
   source:{href:'https://mathshistory.st-andrews.ac.uk/Biographies/Germain/',
      label:b('ביוגרפיה היסטורית, MacTutor','Historical biography, MacTutor')},
   attribution:b('מבוסס על התכתובת המתועדת בין סופי ז׳רמן לגאוס.',
     'Based on the historically documented correspondence between Germain and Gauss.')
  },
  {
   id:'wiles',icon:'🧭',status:'history',title:b('ויילס והגשר למשפט פרמה','Wiles and the bridge to Fermat'),
   eyebrow:b('פריצת דרך אמיתית · חיבור בין שתי בעיות','A real breakthrough · connecting two problems'),
   scenes:[
    b('יותר מ־300 שנה מתמטיקאים ניסו להוכיח את המשפט האחרון של פרמה.',
      'Mathematicians struggled with Fermat’s Last Theorem for more than 300 years.'),
    b('אנדרו ויילס התקדם דרך גשר מפתיע: קשר בין משפט פרמה לבין טענה על עקומים אליפטיים וצורות מודולריות.',
      'Andrew Wiles advanced through a surprising bridge connecting Fermat’s theorem to modularity of elliptic curves.'),
    b('הוא הוכיח מקרה מרכזי של טענת המודולריות, וממנו נבע גם משפט פרמה. זה דרש שנים של עבודה עמוקה.',
      'He proved a key modularity result, which implied Fermat’s theorem. It took years of profound work.')
   ],
   dilemma:b('מה משותף כאן לבדיקת הקומקום?','What connects this to the kettle joke?'),
   options:[
    {id:'easy',label:b('אחרי שמוצאים קשר, הכול תמיד נעשה קל וטכני','Once a connection is found, everything is always easy'),
     feedback:b('לא תמיד. הקישור יכול לחשוף דרך, אבל הוכחת הקשר עצמה עשויה להיות החלק הקשה ביותר.',
       'Not always. Finding a connection exposes a path, but proving the bridge may be the hardest part.')},
    {id:'bridge',label:b('מנסים להגיע לבעיה שיש לנו כלים לעבוד עליה','We connect the problem to one for which tools already exist'),
     feedback:b('נכון. כאן הגשר היה עמוק מאוד. בכפל מקוצר הגשר קצר: מזהים A ו־B ומשתמשים בזהות מוכרת.',
       'Yes. The bridge here was profound. In a school algebra identity, the bridge is shorter: identify A and B and use a known relationship.')}
   ],
   bridgeTitle:b('מהקל אל הקשה: אותו סוג תנועה','From classroom algebra to deep research'),
   knownLabel:b('בתרגיל בכיתה','In a classroom exercise'),
   known:b('A² − B² = (A−B)(A+B)','A² − B² = (A−B)(A+B)'),
   bridgeLabel:b('מזהים מקרה מתאים לכלל','Identify a case that fits the general rule'),
   shortcut:b('A=x+1 ; B=3','A=x+1 ; B=3'),
   applicationLabel:b('ומסיקים מסקנה חדשה','And obtain a new result'),
   example:b('(x+1)²−9=(x−2)(x+4)','(x+1)²−9=(x−2)(x+4)'),
   takeaway:b('ההצלחה היא למצוא גשר נכון ולנמק למה הוא עובד. לפעמים אז נשאר רק לחשב, ולפעמים עוד מצפה עבודה גדולה.',
     'The achievement is finding and justifying a bridge. Sometimes only calculation remains; sometimes much more work is needed.'),
   link:{href:'problem-map.html?lesson=difference-squares',text:b('לתרגל גשר קטן באלגברה','Practice a small bridge in algebra')},
   source:{href:'https://abelprize.no/abel-prize-laureates/2016',
      label:b('פרס אבל 2016, התיאור הרשמי','2016 Abel Prize, official citation')},
   attribution:b('עובדות היסטוריות מתוך תיעוד פרס אבל, 2016.',
     'Historical facts sourced from the 2016 Abel Prize citation.')
  }
 ];
})(typeof window!=='undefined'?window:globalThis);
