/* Activity 2, on the same inquiry-state engine: specific -> general -> identity -> specific.
   The U is the path of ACTION, not Haggai's distinct triangle of mathematical knowledge. */
(function(root){
 'use strict';
 const C=root.VizyInvestigationCore;
 const e=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;};
 const phases={
  shape:'לפני שפותחים סוגריים: איזה מבנה יש כאן?',
  reason:'מה גרם לכם לזהות את המבנה?',
  partA:'מהו A? געו בביטוי השלם, לא רק ב־x.',
  partB:'מהו B, כך ש־B²=9?',
  rule:'איזה כלל מחבר את שתי הצורות?',
  return:'החזירו את A ואת B לשני הסוגריים.',
  tidy:'קצרו כל סוגר בלי לאבד את המבנה.',
  check:'הגענו לאותו מקום? מה מוכיחה בדיקת x=0?',
  transfer:'האם תזהו את אותו מבנה בביטוי חדש?',
  done:'מה למדתם על הדרך?'
 };
 const hint={
  shape:'חפשו שני ריבועים שביניהם סימן חיסור. אל תפתחו סוגריים.',
  reason:'גם (x+1)² הוא ריבוע של ביטוי שלם, וגם 9 הוא ריבוע של מספר.',
  partA:'אם A=x, מקבלים x²−9, וזה לא הביטוי המקורי. בדקו מה נמצא בתוך הריבוע.',
  partB:'אם B=9, אז B²=81. אפשר לבחור גם 3 וגם −3, כי לשניהם ריבוע 9.',
  rule:'זהות הפרש ריבועים: A²−B²=(A−B)(A+B). זה שוויון לשני הכיוונים.',
  return:'הכניסו את אותו A לשני הסוגריים ואת אותו B לשניהם. הקישו על החלקים או גררו אותם לשיבוצים.',
  tidy:'בדקו בנפרד: (x+1)−3=x−2, ו־(x+1)+3=x+4.',
  check:'השוואה ב־x=0 עשויה לתפוס שגיאה, אבל אינה מוכיחה זהות לכל x. השוויון הכללי הוא ההוכחה.',
  transfer:'בביטוי החדש A=x−2, B=5 או −5. השתמשו בכלל בלי לפתוח את הריבוע.'
 };
 const pretty=val=>val===-3?'−3':val===3?'3':String(val||'');
 function slotFormula(d){
  const b=Number(d.B||3),v=pretty(b),a='(x+1)';
  return '(('+a+') − ('+v+'))(('+a+') + ('+v+'))';
 }
 function stage(host,ctx){
  const s=ctx.state,d=s.data,p=C.phase(s);
  const transfer=p==='transfer',independent=Number(localStorage.getItem('vizy_inquiry_map_lifts')||0);
  const active=p==='shape'||p==='reason'?'s1':p==='partA'||p==='partB'?'g1':
    p==='rule'?'g2':p==='return'?'s2':p==='tidy'||p==='check'?'s3':'s1';
  const first=transfer?'(x−2)² − 25':'(x+1)² − 9';
  const activeState=key=>active===key?' iq-map-active':'';
  const ready=key=>{
   if(transfer)return false;
   if(key==='s1')return true;
   if(key==='g1')return Boolean(d.shape);
   if(key==='g2')return Boolean(d.rule||d.shortcut&&d.B);
   if(key==='s2')return Boolean(d.returnDone||d.shortcut&&d.B);
   if(key==='s3')return Boolean(d.tidyDone||d.shortcut&&d.B);
  };
  const wrapper=e('div','iq-map-path');wrapper.setAttribute('dir','ltr');
  const node=(id,label,formula)=>{
   const box=e('div','iq-map-node'+activeState(id));
   box.dataset.iqStop=id;
   const short=independent>=2&&active!==id;
   box.append(e('small','iq-map-node-label',short?'':label));
   const formulaEl=e('strong','iq-map-formula',ready(id)?formula:'⋯');
   box.append(formulaEl);return box;
  };
  const top=e('div','iq-map-top');
  const g1=ready('g1')?'A² − B²':'';
  const g2=ready('g2')?'(A−B)(A+B)':'';
  top.append(node('g1','התבנית הכללית',g1),e('span','iq-map-equals',ready('g2')?' = → ':'→'),node('g2','הזהות הכללית',g2));
  const arrows=e('div','iq-map-arrows');
  arrows.append(e('span','','↑ מזהים מבנה'),e('span','',ready('g2')?'↓ מציבים':'↓ חוזרים לפרט'));
  const middle=e('div','iq-map-middle');
  const from=node('s1','המקרה שלנו',first);
  if(p==='partA'&&!ctx.state.pending){
   const chip=e('button','iq-tap-unit','(x+1)');chip.type='button';chip.dataset.iqPart='whole';
   chip.onclick=()=>ctx.submit({key:'partA',correct:true,wrong:'',label:'A הוא ביטוי שלם',
    detail:'A = x+1. חלק שלם יכול לשמש במקום אות אחת.',onCorrect:()=>{d.A='x+1';}});
   from.append(chip);
  }
  const b=Number(d.B||3);
  const substituted=b===-3?'((x+1)+3)((x+1)−3)':'((x+1)−3)((x+1)+3)';
  middle.append(from,node('s2','מציבים במקרה שלנו',substituted));
  const lowers=e('div','iq-map-lowers');
  lowers.append(e('span','','↓ בודקים'),e('span','','↓ מפשטים'));
  const bottom=e('div','iq-map-bottom');
  bottom.append(e('div','iq-map-check',d.checkDone?'x=0 : −8 = −8 ✓':'הגענו לאותו מקום?'),node('s3','התוצאה',b===-3?'(x+4)(x−2)':'(x−2)(x+4)'));
  wrapper.append(top,arrows,middle,lowers,bottom);
  host.append(wrapper);
  if(ready('g1')&&!transfer){
   host.append(e('p','iq-stage-note','A = '+(d.A||'?')+' · B = '+(d.B==null?'?':pretty(d.B))+
    ' · החץ העליון הוא שוויון (=), לא מסקנה חד־כיוונית.'));
  }
  if(p==='return'&&!s.pending){
   const work=e('div','iq-slot-work');
   work.append(e('p','', 'געו בחלקים. אותה אות ממלאת את שני המקומות המתאימים.'));
   const slots=e('div','iq-slot-row');
   for(const name of ['A','B','A','B']){
    const token=e('button','iq-map-slot',d.slots?.[name]?(name==='A'?'(x+1)':pretty(d.B)):'__');
    token.dataset.iqSlot=name;token.type='button';
    token.setAttribute('aria-label','שיבוץ '+name);
    token.onclick=()=>{
     if(d.selectedToken===name){(d.slots||(d.slots={}))[name]=true;ctx.save();ctx.render();}
     else ctx.message('בחרו קודם את החלק '+name+' למטה.');
    };
    token.addEventListener('dragover',ev=>ev.preventDefault());
    token.addEventListener('drop',ev=>{
     ev.preventDefault();const tokenName=ev.dataTransfer?.getData('text/plain');
     if(tokenName!==name){ctx.message('החלק צריך להתאים לאות שעל המקום.');return;}
     (d.slots||(d.slots={}))[name]=true;ctx.save();ctx.render();
    });
    slots.append(token);
   }
   work.append(slots);
   const bank=e('div','iq-token-bank');
   for(const name of ['A','B']){
    const token=e('button','iq-token',''+name+' = '+(name==='A'?'(x+1)':pretty(d.B)));
    token.type='button';token.dataset.iqChip=name;token.draggable=true;
    token.setAttribute('aria-pressed',String(d.selectedToken===name));
    token.onclick=()=>{d.selectedToken=name;(d.slots||(d.slots={}))[name]=true;ctx.save();ctx.render();};
    token.addEventListener('dragstart',ev=>ev.dataTransfer?.setData('text/plain',name));
    bank.append(token);
   }
   work.append(bank);
   host.append(work);
  }
  if(p==='check'||p==='done'){
   host.append(e('div','iq-check-strip','בדיקה: x=0 → (0+1)²−9=−8; (0−2)(0+4)=−8. בדיקה אינה הוכחה.'));
  }
  if(!transfer){
   const extras=e('details','iq-map-extras');extras.append(e('summary','','עוד דרך לראות את זה (לא חובה)'));
   const area=e('div','iq-extra-area');area.append(e('p','', 'המחשת שטחים במקרה x=4 בלבד (כך x+1=5≥3). חתכו ריבוע 3×3 וסדרו את החלקים הנותרים למלבן 8×2.'));
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 360 135');svg.setAttribute('role','img');
   svg.setAttribute('aria-label','ריבוע צלע 5, מוציאים ריבוע צלע 3, מסדרים את שתי החתיכות למלבן צלעות 8 ו-2');
   svg.innerHTML='<rect x="10" y="12" width="90" height="90" fill="#fff" stroke="#5b6d8a" stroke-width="2"/>'+
    '<rect x="10" y="12" width="90" height="36" fill="#ffd67d" stroke="#bc8a38" stroke-width="1"/>'+
    '<rect x="10" y="48" width="36" height="54" fill="#9bd5ac" stroke="#4c9d75" stroke-width="1"/>'+
    '<rect x="46" y="48" width="54" height="54" fill="#fff" stroke="#b2bfd0" stroke-dasharray="4 3"/>'+
    '<text x="16" y="119" font-size="11" fill="#52657b">5² − 3²</text>'+
    '<path d="M121 58h31l-8-8m8 8l-8 8" stroke="#447bae" stroke-width="2" fill="none"/>'+
    '<rect x="177" y="36" width="90" height="36" fill="#ffd67d" stroke="#bc8a38"/>'+
    '<rect x="267" y="36" width="54" height="36" fill="#9bd5ac" stroke="#4c9d75"/>'+
    '<text x="179" y="94" font-size="11" fill="#52657b">8 × 2 = 16</text>';
   area.append(svg);extras.append(area);host.append(extras);
  }
 }
 function prompt(host,ctx){
  const s=ctx.state,d=s.data,p=C.phase(s);
  if(p==='done'){ctx.finish(host);return;}
  host.append(e('h3','',phases[p]));const q=host.querySelector('h3');q.id='iqQuestion';
  const buttons=e('div','iq-choices');host.append(buttons);
  function choice(label,id,action,selected){
   const btn=e('button','iq-choice',label);btn.type='button';btn.dataset.iqAnswer=id;
   if(selected!==undefined)btn.setAttribute('aria-pressed',String(selected));
   btn.onclick=action;buttons.append(btn);return btn;
  }
  const answer=(key,correct,wrong,label,detail,onCorrect)=>{
   ctx.submit({key,correct,wrong,label,detail,onCorrect});
  };
  if(p==='shape'){
   if(!d.quick){
    for(const [id,lab,correct] of [
     ['diff','A² − B²',true],['square','(A−B)²',false],['sum','A² + B²',false]
    ])choice(lab,id,()=>answer('shape',correct,'השוו את הסימן בין שני ריבועים. זה אינו ריבוע של הפרש.',
      'זיהוי מבנה','זיהינו הפרש של שני ריבועים בלי לפתוח סוגריים.',()=>{d.shape='diff';}));
    const quick=e('button','iq-subtle','אני כבר רואה את הקיצור · אציג ראיה');
    quick.type='button';quick.dataset.iqShortcut='true';quick.onclick=()=>{
     d.quick=true;d.shortcut=true;d.shape='diff';
     s.route=['shape','partA','partB','check','transfer','done'];
     C.attempt(s,'shape',true);
     ctx.complete('קיצור דרך','זיהיתי הפרש ריבועים. עכשיו אראה מה A ומה B.',
       'לא חייבים לעבור בכל תחנה. מוכיחים שהזיהוי מתאים למקרה.');
    };
    host.append(quick);
   }else{
    host.append(e('p','iq-help-line','הכרתם את התבנית. עכשיו נראה מה החלקים שלה.'));
    if(!s.pending)choice('מזהים את החלקים','continue',()=>ctx.complete('זיהוי מבנה','הפרש שני ריבועים','ממשיכים להוכיח את הזיהוי.'));
   }
  }else if(p==='reason'){
   for(const [id,label,correct] of [
    ['two','שני ריבועים עם חיסור ביניהם',true],
    ['nine','כי מופיע המספר 9',false],
    ['something','כי יש סוגריים',false]
   ])choice(label,id,()=>answer('reason',correct,'המספר 9 או סוגריים לבדם אינם מגדירים הפרש ריבועים.',
    'מה זיהיתי?','גם (x+1)² וגם 9 הם ריבועים, ויש ביניהם חיסור.'));
  }else if(p==='partA'){
   choice('A = x+1','whole',()=>answer('partA',true,'','מזהים יחידה שלמה',
    'A הוא כל הביטוי שבתוך הריבוע: x+1.',()=>{d.A='x+1';}));
   choice('A = x','x',()=>answer('partA',false,'אם A=x נקבל x²−9, לא (x+1)²−9. החזירו את החלקים למקור.','', ''));
  }else if(p==='partB'){
   for(const [id,num,correct] of [['3',3,true],['-3',-3,true],['9',9,false]]){
    choice('B = '+pretty(num),id,()=>answer('partB',correct,
     'אם B=9, אז B²=81. אבל בביטוי מופיע 9, לא 81.',
     'בחרנו את B','גם 3 וגם −3 מתאימים כי הריבוע שלהם הוא 9.',()=>{
      d.B=num;
      if(d.shortcut){d.rule=true;d.returnDone=true;d.tidyDone=true;}
      const countKey='vizy_inquiry_map_lifts';
      if(!d.countedLift&&s.records.partA?.firstTry&&s.records.partB?.firstTry){
       d.countedLift=true;
       const count=Number(localStorage.getItem(countKey)||0);
       try{localStorage.setItem(countKey,String(Math.min(20,count+1)));}catch{}
      }
     }));
   }
  }else if(p==='rule'){
   choice('A² − B² = (A−B)(A+B)','identity',()=>answer('rule',true,'',
    'כלל מוכר','זו זהות (=) שעובדת בשני הכיוונים. במקרה הזה אין תנאי נוסף.',
    ()=>{d.rule=true;}));
   choice('A² − B² = (A−B)²','square',()=>answer('rule',false,
    '(A−B)² יוצר גם איבר −2AB, ולכן אינו זהות הפרש ריבועים.','',''));
  }else if(p==='return'){
   choice('שיבצתי בשני הסוגריים','return',()=>answer('return',
    Boolean(d.slots?.A&&d.slots?.B),'צריך להציב את אותו A בשני הסוגריים ואת אותו B בשניהם.',
    'הצבה בכלל',slotFormula(d),()=>{d.returnDone=true;}));
  }else if(p==='tidy'){
   const expected=d.B===-3?['x+4','x−2']:['x−2','x+4'];
   for(const [name,label] of [['left','הסוגר הראשון'],['right','הסוגר השני']]){
    const section=e('div','iq-tidy-row');section.append(e('strong','',label));
    const options=name==='left'?['x−2','x−4','x+4']:['x+4','x+2','x−2'];
    const selected=d['tidy'+name]||'';
    for(const opt of options){
     const b=e('button','iq-choice',opt);b.type='button';b.dataset.iqFactor=name+'-'+opt;
     b.setAttribute('aria-pressed',String(selected===opt));
     b.onclick=()=>{d['tidy'+name]=opt;ctx.save();ctx.render();};section.append(b);
    }
    buttons.append(section);
   }
   choice('בדקתי את שני הסוגריים','tidy',()=>answer('tidy',
    d.tidyleft===expected[0]&&d.tidyright===expected[1],
    'פתחו רק את החיבור/חיסור בתוך כל סוגר: (x+1)−3=x−2, (x+1)+3=x+4.',
    'פישוט נפרד','קיבלנו '+(d.B===-3?'(x+4)(x−2)':'(x−2)(x+4)')+'.',
    ()=>{d.tidyDone=true;}));
  }else if(p==='check'){
   host.append(e('p','iq-given','מקרה אחד לבדיקה: x = 0. בשני הצדדים נקבל −8.'));
   choice('זו בדיקה, לא הוכחה','check',()=>answer('check',true,'','בדקנו את הקיצור',
    'הערכים תואמים ב־x=0. ההוכחה לכל x היא הזהות שהשתמשנו בה.',()=>{d.checkDone=true;}));
   choice('זה מוכיח שוויון לכל x','proof',()=>answer('check',false,
    'מספר אחד יכול לתפוס שגיאה, אבל לא להוכיח זהות לכל המספרים.','',''));
  }else if(p==='transfer'){
   const progress=Number(d.transferStep||0);
   host.append(e('p','iq-given','ביטוי חדש: (x−2)² − 25. הפעם המפה ריקה.'));
   if(progress===0){
    for(const [id,label,correct] of [
     ['a','A=x−2 ; B=5',true],['b','A=x ; B=25',false],['c','A=x−2 ; B=25',false]
    ])choice(label,id,()=>{C.attempt(s,'transfer:parts',correct);
     if(!correct){ctx.message('B² צריך להיות 25, ו־A הוא הביטוי השלם x−2.');return;}
     d.transferStep=1;ctx.save();ctx.render();
    });
   }else{
    for(const [id,label,correct] of [
     ['correct','(x−7)(x+3)',true],['near','(x−5)(x+5)',false],
     ['sign','(x−3)(x+7)',false]
    ])choice(label,id,()=>answer('transfer:result',correct,
     'החזירו A=x−2 ו־B=5 אל (A−B)(A+B), ופשטו כל סוגר.',
     'העברה עצמאית','(x−2)²−25=(x−7)(x+3). אפשר לבדוק ב־x=0: −21 בשני הצדדים.'));
   }
  }
 }
 function onEnter(s,phase){
  const d=s.data;
  if(phase==='shape')d.shape=null;
  if(phase==='transfer')d.transferStep=0;
 }
 root.VizyMapInquiry={title:'הפרש ריבועים · כלל ופרט',grade:'ט׳',phases,stage,prompt,hint,onEnter};
})(window);
