/* Activity 1: diagnose the student's criterion, then investigate it on one persistent stage.
   The bounded, monotone curves are a mathematically precise alternative to exponentials:
   A=-1/(1+exp(x)) rises and is always negative; B=1/(1+exp(x)) falls and is always positive.
   Unlike unbounded exponentials, translations can make the entire B curve negative. */
(function(root){
 'use strict';
 const C=root.VizyInvestigationCore;
 const xpx=x=>180+x*47,ypx=y=>143-y*76;
 const sigmoid=x=>1/(1+Math.exp(x));
 const fA=(x,offset=0)=>-sigmoid(x)+offset;
 const fB=(x,offset=0,reflected=false)=>sigmoid(reflected?-x:x)+offset;
 const graphPath=fn=>{
  let d='';
  for(let n=0;n<=90;n++){
   const x=-3+n/15;
   d+=(n?' L':'M')+xpx(x).toFixed(1)+' '+ypx(fn(x)).toFixed(1);
  }
  return d;
 };
 const e=(tag,cls,txt)=>{
  const node=document.createElement(tag);if(cls)node.className=cls;
  if(txt!=null)node.textContent=txt;return node;
 };
 const button=(host,label,id,onClick,selected)=>{
  const b=e('button','iq-choice',label);b.type='button';b.dataset.iqAnswer=id;
  if(selected!==undefined)b.setAttribute('aria-pressed',String(selected));
  b.onclick=onClick;host.append(b);return b;
 };
 const phases={
  choose:'איזו פונקציה עולה?',
  criterion:'מה גרם לך לבחור?',
  contrast:'האם הגרף הזה עולה בכל הישר?',
  'shift-predict':'אם נוריד את B אל מתחת לציר, היא תהפוך לעולה?',
  'shift-act':'הורידו את B כך שתהיה מתחת לציר בכל הישר. האם היא התחילה לעלות?',
  'reflect-predict':'אם נשקף את B ביחס לציר y, מה יקרה לכיוון שלה?',
  'reflect-act':'שקפו את B ביחס לציר y ובדקו את הכיוון.',
  'point-predict':'כשנקודה נעה ימינה על A, הערך יכול לגדול גם כשהוא שלילי?',
  'point-act':'הזיזו את הנקודה ימינה על A. מה קרה לערך?',
  compare:'איזו תכונה השתנתה בכל פעולה?',
  phrases:'אילו משפטים באמת אומרים שהפונקציה עולה?',
  build:'בנו פונקציה שעולה ממש וכולה מתחת לציר x.',
  verdict:'מה נובע מהנתון?',
  'criterion-end':'מה קובע עכשיו אם פונקציה עולה?',
  temperature:'הטמפרטורה עלתה מ־8− ל־3−. מה נכון?',
  linear:'נתון f(x)=x−10 בתחום 0≤x≤5. מה נכון?',
  done:'מה גילינו על דרך החשיבה?'
 };
 const hint={
  choose:'בחרו לפי מה שאתם חושבים כעת. נבדוק יחד את הדרך שבה החלטתם.',
  criterion:'אין צורך להוכיח עכשיו. אנחנו מנסים לגלות מה היה הסימן שלפיו החלטתם.',
  contrast:'בחלק השמאלי הגרף יורד ימינה. בחלק הימני הוא עולה. האם הוא עולה לכל אורך הישר?',
  'shift-predict':'הזזה למעלה או למטה משנה גובה. האם היא משנה את סדר ערכי הפונקציה?',
  'shift-act':'גררו את המחוון עד ש־B כולה מתחת לציר. היא ממשיכה לרדת כשמתקדמים ימינה.',
  'reflect-predict':'השיקוף הוא ביחס לציר האנכי y. הוא הופך את כיוון ההתקדמות.',
  'reflect-act':'כפתור השיקוף נמצא מתחת לגרף.',
  'point-predict':'השאלה היא על שינוי בין שתי נקודות, לא על סימן הערך.',
  'point-act':'הזיזו את הנקודה משמאל לימין עד x=2 וראו את המספרים השליליים גדלים.',
  compare:'בהזזה אנכית הסימן/המיקום עשוי להשתנות, אבל כיוון התנועה נשמר. בשיקוף אופקי הכיוון מתהפך.',
  phrases:'עלייה היא השוואה בין ערכים עבור x הולך וגדל. להיות מעל ציר x זו תכונה אחרת.',
  build:'שקפו את B כדי שתעלה, ואז הזיזו אותה מתחת לציר. המחוון משנה גובה בלבד.',
  verdict:'בדקו אם אפשר למצוא שני גרפים עולים, אחד חיובי ואחד שלילי. ״תלוי״ דורש את שניהם.',
  'criterion-end':'עלייה פירושה: לכל a<b בתחום, f(a)<f(b).',
  temperature:'מ־8− ל־3− זו עלייה של 5 מעלות, אבל בשני המצבים הטמפרטורה שלילית.',
  linear:'כאשר x גדל, x−10 גדל. אבל בטווח 0–5 כל הערכים הם בין 10− ל־5−.'
 };
 function stage(host,ctx){
  const s=ctx.state,d=s.data,p=C.phase(s);
  const transfer=p==='temperature'||p==='linear'||p==='done';
  if(transfer){
   const quiet=e('div','iq-no-picture','מקרה חדש · הפעם בלי גרף');
   quiet.append(e('p','',p==='temperature'?'שינוי טמפרטורה':p==='linear'?'תיאור אלגברי חדש':'מה תוכלו להסביר במקרה חדש?'));
   host.append(quiet);return;
  }
  const contrast=p==='contrast';
  const build=p==='build';
  const evidence=p==='verdict'&&Number(d.verdictIndex||0)===0&&d.verdictEvidence;
  const moveShift=p==='shift-act';
  const point=p==='point-act'||p==='point-predict';
  const reflect=p==='reflect-act';
  const offB=build?Number(d.buildOffset||0):Number(d.offsetB||0);
  const reflB=build?Boolean(d.buildReflected):Boolean(d.reflectedB);
  const offA=evidence?Number(d.evidenceOffset||0):0;
  const svgNS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox','0 0 360 275');svg.setAttribute('role','img');
  svg.setAttribute('aria-label',contrast?'עקומה אחת מעל ציר x, יורדת ואז עולה':'גרפים A ו-B על צירים; אפשר לבדוק את הכיוון בכל אחד');
  svg.classList.add('iq-graph');
  const bg=document.createElementNS(svgNS,'rect');bg.setAttribute('width','360');bg.setAttribute('height','275');bg.setAttribute('rx','14');bg.setAttribute('fill','#f6fbff');svg.append(bg);
  const grid=document.createElementNS(svgNS,'g');
  grid.innerHTML='<path d="M24 143H340 M180 14V256" stroke="#8fa7c0" stroke-width="1.7"/>'+
   '<path d="M24 66H340 M24 219H340 M86 14V256 M274 14V256" stroke="#dce9f3" stroke-width="1"/>'+
   '<text x="336" y="135" font-size="12" fill="#557087">x</text><text x="187" y="21" font-size="12" fill="#557087">y</text>';
  svg.append(grid);
  const clip=document.createElementNS(svgNS,'clipPath');clip.id='iqGraphClip';
  const rect=document.createElementNS(svgNS,'rect');rect.setAttribute('x','24');rect.setAttribute('y','14');rect.setAttribute('width','312');rect.setAttribute('height','242');clip.append(rect);
  const defs=document.createElementNS(svgNS,'defs');defs.append(clip);svg.append(defs);
  const lines=document.createElementNS(svgNS,'g');lines.setAttribute('clip-path','url(#iqGraphClip)');
  let a,b,pointNode;
  const mk=(color)=>{
   const path=document.createElementNS(svgNS,'path');
   path.setAttribute('fill','none');path.setAttribute('stroke',color);
   path.setAttribute('stroke-width','4');path.setAttribute('stroke-linecap','round');
   lines.append(path);return path;
  };
  if(contrast){
   const path=mk('#9363b8');
   path.setAttribute('d',graphPath(x=>1.15+(x*x)/3));
   const label=document.createElementNS(svgNS,'text');label.setAttribute('x','185');label.setAttribute('y','53');
   label.setAttribute('fill','#62418d');label.setAttribute('font-size','14');label.textContent='C';svg.append(label);
  }else{
   a=mk('#168d7a');b=mk('#cd8146');
   const labA=document.createElementNS(svgNS,'text');
   labA.setAttribute('x','45');labA.setAttribute('y','236');
   labA.setAttribute('fill','#107865');labA.setAttribute('font-size','16');labA.setAttribute('font-weight','800');labA.textContent='A';
   svg.append(labA);
   const labB=document.createElementNS(svgNS,'text');
   labB.setAttribute('x','45');labB.setAttribute('y','56');
   labB.setAttribute('fill','#a6622d');labB.setAttribute('font-size','16');labB.setAttribute('font-weight','800');labB.textContent='B';svg.append(labB);
   if(build||evidence){a.setAttribute('opacity',build?'0.15':'1');b.setAttribute('opacity',evidence?'0.15':'1');}
   if(point){
    pointNode=document.createElementNS(svgNS,'circle');pointNode.setAttribute('r','7');
    pointNode.setAttribute('fill','#1d6bc1');pointNode.setAttribute('stroke','white');pointNode.setAttribute('stroke-width','2');
    lines.append(pointNode);
   }
  }
  svg.append(lines);host.append(svg);
  const note=e('p','iq-stage-note','');
  host.append(note);
  function redraw(){
   if(contrast){note.textContent=' ';return;}
   if(a)a.setAttribute('d',graphPath(x=>fA(x,evidence?Number(d.evidenceOffset||0):0)));
   if(b)b.setAttribute('d',graphPath(x=>fB(x,build?Number(d.buildOffset||0):Number(d.offsetB||0),
     build?Boolean(d.buildReflected):Boolean(d.reflectedB))));
   if(pointNode){
    const x=Number(d.pointX??-2);
    pointNode.setAttribute('cx',String(xpx(x)));pointNode.setAttribute('cy',String(ypx(fA(x))));
    note.textContent='x = '+x.toFixed(1)+'  |  fₐ(x) = '+fA(x).toFixed(2)+' (עדיין שלילי)';
   }else if(evidence){
    note.textContent='A נשארת עולה. הזזה אנכית משנה את הסימן, לא את הכיוון.';
   }else if(build){
    note.textContent='B: '+(d.buildReflected?'הכיוון הוחלף · ':'הכיוון המקורי · ')+(Number(d.buildOffset||0)<=-1?'מתחת לציר בכל הישר':'עוד לא מתחת לציר בכל הישר');
   }else if(moveShift||reflect){
    note.textContent='גרף B זז בלי לשנות את צורתו. האם הכיוון השתנה?';
   }else note.textContent='הנקודות והצירים נשארים במקומם. בחרו לפי מה שאתם רואים.';
  }
  redraw();
  if(moveShift||build||evidence||p==='point-act'){
   const controls=e('div','iq-graph-controls');
   const sliderLabel=e('label','',evidence?'שנו גובה של A':point?'הזיזו את הנקודה ימינה':'הזיזו את הגרף לגובה אחר');
   const range=e('input','');
   range.type='range';range.min=point?'-2':evidence?'0':'-1.3';
   range.max=point?'2':evidence?'1.3':'0.3';range.step=point?'0.5':'0.1';
   range.value=point?String(d.pointX??-2):evidence?String(d.evidenceOffset??0):build?String(d.buildOffset??0):String(d.offsetB??0);
   range.id='iqGraphSlider';sliderLabel.htmlFor=range.id;
   range.setAttribute('aria-label',sliderLabel.textContent);
   range.oninput=()=>{
    if(point)d.pointX=Number(range.value);
    else if(evidence)d.evidenceOffset=Number(range.value);
    else if(build)d.buildOffset=Number(range.value);
    else d.offsetB=Number(range.value);
    ctx.save();redraw();
   };
   controls.append(sliderLabel,range);
   if(build){
    const ref=e('button','iq-control-button',d.buildReflected?'↩ שיקוף פועל':'↔ שקפו ביחס לציר y');
    ref.type='button';ref.id='iqReflect';ref.onclick=()=>{
     d.buildReflected=!d.buildReflected;ctx.save();redraw();ref.textContent=d.buildReflected?'↩ שיקוף פועל':'↔ שקפו ביחס לציר y';
    };
    controls.append(ref);
   }
   if(evidence){
    const evidenceButtons=e('div','iq-evidence');
    const negative=e('button','iq-control-button','שמרתי מקרה שלילי');
    const positive=e('button','iq-control-button','שמרתי מקרה חיובי');
    negative.type=positive.type='button';negative.dataset.iqExample='negative';positive.dataset.iqExample='positive';
    const flags=d.examples||(d.examples={negative:false,positive:false});
    const mark=(kind,allowed)=>{
     if(!allowed){ctx.message(kind==='positive'?'הזיזו את A מספיק למעלה: כדי שתהיה חיובית בכל הישר, דרוש גובה לפחות 1.':'החזירו את A כך שתהיה שלילית בכל הישר.');return;}
     flags[kind]=true;ctx.save();redraw();
     negative.setAttribute('aria-pressed',String(flags.negative));
     positive.setAttribute('aria-pressed',String(flags.positive));
     ctx.message(flags.negative&&flags.positive?'בניתם שתי פונקציות עולות: אחת שלילית ואחת חיובית. עכשיו אפשר להמשיך.':'נשמרה דוגמה אחת. בנו גם את המקרה האחר.');
    };
    negative.onclick=()=>mark('negative',Number(d.evidenceOffset||0)<=0);
    positive.onclick=()=>mark('positive',Number(d.evidenceOffset||0)>=1);
    negative.setAttribute('aria-pressed',String(flags.negative));positive.setAttribute('aria-pressed',String(flags.positive));
    evidenceButtons.append(negative,positive);controls.append(evidenceButtons);
   }
   host.append(controls);
  }else if(reflect){
   const flip=e('button','iq-control-button iq-reflect',d.reflectedB?'השיקוף בוצע ✓':'↔ שקפו את B ביחס לציר y');
   flip.id='iqReflect';flip.disabled=Boolean(d.reflectedB);
   flip.onclick=()=>{d.reflectedB=true;ctx.save();redraw();ctx.complete('שיקוף','השיקוף שינה את כיוון B בלי להפוך אותה לחיובית.', 'כיוון התנועה התהפך. הגובה מתחת לציר נשאר.');};
   host.append(flip);
  }
 }
 function prompt(host,ctx){
  const s=ctx.state,d=s.data,p=C.phase(s);
  if(p==='done'){ctx.finish(host);return;}
  const question=e('h3','',phases[p]);question.id='iqQuestion';host.append(question);
  const choices=e('div','iq-choices');host.append(choices);
  const submit=(key,correct,wrong,label,detail,onCorrect)=>{
   ctx.submit({key,correct,wrong,label,detail,onCorrect});
  };
  if(p==='choose'){
   for(const [id,label] of [['A','גרף A'],['B','גרף B'],['neither','אף אחת']]){
    button(choices,label,id,()=>{
     d.initialChoice=id;
     C.attempt(s,'choose',id==='A');
     ctx.complete('בחירה ראשונה','בחרתם '+label+'. עכשיו נברר על מה התבססתם.','נשמור את הבחירה הראשונה בלי לתת ציון. נבדוק את הקריטריון שלכם.');
    });
   }
  }else if(p==='criterion'){
   const options=[['appearance','היא נראית כמו עלייה'],['height','היא מעל ציר x'],['direction','כשזזים ימינה היא עולה'],['unsure','לא בטוח/ה']];
   for(const [id,label] of options)button(choices,label,id,()=>{
    d.criterionBefore=id;
    const fast=d.initialChoice==='A'&&id==='direction';
    C.attempt(s,'criterion',fast);C.selectLane(s,fast);
    ctx.complete('לפי מה החלטתי?',label,fast?'נבדוק שהקריטריון עובד גם בגרף חדש.':'לא נסמן את הנימוק כטעות. נבדוק אותו בניסוי.');
   });
  }else if(p==='contrast'){
   for(const [id,label] of [['yes','כן, בכל הישר'],['no','לא, היא יורדת ואז עולה']]){
    button(choices,label,id,()=>{
     C.attempt(s,'contrast',id==='no');
     if(id!=='no')C.fallBack(s);
     ctx.complete('בדיקת קריטריון',id==='no'?'לא מספיק שהגרף מעל הציר':'הגרף משנה כיוון','כאן עלייה אינה תכונה של כל הגרף. '+(id==='no'?'אפשר לעבור להכרעות.':'נחקור מה קובע את הכיוון.'));
    });
   }
  }else if(p.endsWith('-predict')){
   const opts=p==='shift-predict'?[['yes','כן, היא תעלה'],['no','לא, תמשיך לרדת']]:
    p==='reflect-predict'?[['yes','היא תעלה'],['no','היא תמשיך לרדת']]:
    [['yes','כן, הערך יגדל'],['no','לא, הוא שלילי']];
   const expected=p==='shift-predict'?'no':'yes';
   for(const [id,label] of opts)button(choices,label,id,()=>{
    d[p]=id;C.attempt(s,p,id===expected);
    ctx.complete('חיזוי: '+phases[p],label,'רשמנו את החיזוי. עכשיו תפעילו את הכלי ותבדקו אותו.');
   });
  }else if(p==='shift-act'){
   button(choices,'בדקתי אחרי ההזזה','act',()=>{
    submit('shift-act',Number(d.offsetB||0)<=-1,'צריך להוריד את B עוד עד שתהיה מתחת לציר לכל x.','הזזה אנכית',
      'B יכולה להיות שלילית ובכל זאת לרדת. כיוון השינוי נשמר.');
   });
  }else if(p==='reflect-act'){
   if(d.reflectedB)button(choices,'בדקתי: הכיוון התהפך','reflected',()=>{
    submit('reflect-act',true,'','שיקוף אופקי','השיקוף שינה את כיוון התנועה, לא את סימן הגובה.');
   });
   else host.append(e('p','iq-help-line','לחצו על כפתור השיקוף ליד הגרף.'));
  }else if(p==='point-act'){
   button(choices,'ראיתי את הערך משתנה','point',()=>{
    submit('point-act',Number(d.pointX??-2)>=1.5,'הזיזו את הנקודה ימינה עד x=2.','נקודה בתנועה',
      'הערכים על A גדלים גם כשהם נשארים מתחת לאפס.');
   });
  }else if(p==='compare'){
   const questions=[
    ['translation','בהזזה למעלה/למטה השתנה בעיקר','מיקום ביחס לציר','כיוון התנועה','position'],
    ['reflection','בשיקוף ביחס לציר y השתנה','כיוון התנועה','סימן הגובה בלבד','direction']
   ];
   for(const [key,label,first,second,correct] of questions){
    const row=e('div','iq-compare-row');row.append(e('strong','',label));
    for(const [id,text] of [[key==='translation'?'position':'direction',first],[key==='translation'?'direction':'position',second]]){
     button(row,text,key+'-'+id,()=>{(d.compare||(d.compare={}))[key]=id;ctx.save();ctx.render();},
       d.compare?.[key]===id);
    }
    choices.append(row);
   }
   button(choices,'בדקתי את שתי הפעולות','compare-submit',()=>submit('compare',
    d.compare?.translation==='position'&&d.compare?.reflection==='direction',
    'בדקו שוב: הזזה אנכית שומרת כיוון, שיקוף סביב y משנה אותו.',
    'מה נשאר ומה השתנה','הגובה וסימן הפונקציה שונים מכיוון השינוי שלה.'));
  }else if(p==='phrases'){
   const choicesData=[
    ['words','ככל ש־x גדל, ערך הפונקציה גדל',true],
    ['symbolic','לכל a<b מתקיים f(a)<f(b)',true],
    ['motion','נקודה הנעה ימינה לאורך העקומה עולה בגובה',true],
    ['height','הגרף נמצא מעל ציר x',false]
   ];
   const chosen=d.phrases||(d.phrases=[]);
   for(const [id,label] of choicesData)button(choices,label,id,()=>{
    const i=chosen.indexOf(id);if(i>=0)chosen.splice(i,1);else chosen.push(id);
    ctx.save();ctx.render();
   },chosen.includes(id));
   button(choices,'בדקו את המשפטים','phrases-submit',()=>{
    const correct=chosen.length===3&&['words','symbolic','motion'].every(id=>chosen.includes(id));
    submit('phrases',correct,'מה שחשוב הוא השינוי כשמתקדמים ימינה, לא הגובה מעל הציר.',
      'שלושה ניסוחים, משמעות אחת','מילים, תנועת נקודה ואלגברה מבטאים את אותה תכונה.');
   });
  }else if(p==='build'){
   button(choices,'זו פונקציה עולה וכולה מתחת לציר','built',()=>{
    const correct=Boolean(d.buildReflected)&&Number(d.buildOffset||0)<=-1;
    submit('build',correct,'צריך גם לשנות את הכיוון וגם להוריד את כל הגרף מתחת לציר.',
      'בנינו דוגמה','שיקוף משנה כיוון. הזזה אנכית משנה גובה. שניהם נחוצים בבנייה הזאת.');
   });
  }else if(p==='verdict'){
   const claims=[
    ['f חיובית בכל הישר','depends','תלוי'],
    ['לכל a<b מתקיים f(a)<f(b)','must','חייב להיות'],
    ['f(1)<f(0)','impossible','לא יכול להיות']
   ];
   const index=Number(d.verdictIndex||0);
   const claim=claims[index]||claims[claims.length-1];
   host.append(e('p','iq-verdict-claim',claim[0]));
   for(const [id,label,sub] of [
    ['must','חייב להיות','נובע מהנתונים'],
    ['depends','תלוי','אפשר כך ואפשר אחרת'],
    ['impossible','לא יכול להיות','סותר את הנתונים']
   ]){
    const b=button(choices,label,id,()=>{
     if(id!==claim[1]){
      C.attempt(s,'verdict:'+index,false);
      ctx.message(index===0?'האם אפשר למצוא פונקציה עולה שכולה מתחת לציר? נסו לבנות אחת.':'היעזרו בהגדרה של עלייה ממש.');
      return;
     }
     if(index===0){
      d.verdictEvidence=true;
      C.attempt(s,'verdict:0',true);
      ctx.message('בחרתם ״תלוי״. בנו למעלה מקרה חיובי ומקרה שלילי באמצעות המחוון, וסמנו את שניהם.');
      return;
     }
     C.attempt(s,'verdict:'+index,true);
     d.verdictIndex=index+1;
     if(index===2)ctx.complete('שלוש הכרעות','חייב להיות / תלוי / לא יכול להיות',
      'הוכחתם מה נובע מהנתון, מה אפשרי ומה סותר.');
     else{ctx.save();ctx.render();}
    });
    b.append(e('small','',sub));
   }
   if(index===0&&d.verdictEvidence){
    button(choices,'שתי הדוגמאות מוכנות','evidence-complete',()=>{
     const examples=d.examples||{};
     if(!examples.negative||!examples.positive){ctx.message('כדי להוכיח ״תלוי״, בנו ושמרו גם מקרה חיובי וגם מקרה שלילי.');return;}
     d.verdictIndex=1;ctx.save();ctx.render();
    });
   }
  }else if(p==='criterion-end'){
   for(const [id,label] of [['direction','השינוי בערך כשמגדילים x'],['height','הגובה של הגרף מעל ציר x'],['looks','איך הגרף נראה במבט ראשון']]){
    button(choices,label,id,()=>{
     d.criterionAfter=id;
     submit('criterion-end',id==='direction','גובה וצורה אינם הקריטריון. השוו ערכי פונקציה כש־x גדל.',
      'הקריטריון החדש',label);
    });
   }
  }else if(p==='temperature'||p==='linear'){
   const options=p==='temperature'
    ?[['rise-not-positive','עלתה אבל עדיין שלילית'],['positive','עלתה ולכן חיובית'],['fell','ירדה']]
    :[['rise-negative','עולה, אבל שלילית בכל התחום'],['positive','עולה וחיובית בכל התחום'],['falls','יורדת']];
   const wanted=p==='temperature'?'rise-not-positive':'rise-negative';
   for(const [id,label] of options){
    button(choices,label,id,()=>submit(p,id===wanted,p==='temperature'?
      'מ־8− ל־3− זו עלייה, אבל לא מעבר לחיובי.':'כאשר x גדל, הביטוי גדל, אבל בתחום הנתון הוא נשאר שלילי.',
      'העברה למקרה חדש',label));
   }
  }
 }
 function onEnter(s,phase){
  const d=s.data;
  if(phase==='shift-act'){d.offsetB=0;d.reflectedB=false;}
  if(phase==='point-act')d.pointX=-2;
  if(phase==='build'){d.buildOffset=0;d.buildReflected=false;}
  if(phase==='verdict'){d.verdictIndex=0;d.verdictEvidence=false;d.evidenceOffset=0;d.examples={positive:false,negative:false};}
 }
 root.VizyGraphInquiry={title:'עלייה או חיוביות?',grade:'י״א',phases,stage,prompt,hint,onEnter};
})(window);
