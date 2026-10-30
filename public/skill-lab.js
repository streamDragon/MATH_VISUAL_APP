(function(){
"use strict";
const bank=window.VizySkillLabData||[], $=id=>document.getElementById(id), KEY="vizy_structure_skill_v1";
let grade=9,session=null,position=0,part=0,attempts=0,hinted=false,chosen="",completed=[],answered=false,round=0;
const phases=["אבחון","אימון","העברה"],sizes=[2,4,2],total=sizes.reduce((a,b)=>a+b,0);
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
function save(report){try{const all=read();all[grade]=report;localStorage.setItem(KEY,JSON.stringify(all))}catch{}}
function stableShuffle(a,offset){return a.slice(offset%a.length).concat(a.slice(0,offset%a.length))}
function source(){return bank.filter(x=>x.grades.includes(grade))}
function selectCards(){const list=source();return Array.from({length:total},(_,i)=>({item:list[(i+round)%list.length],sample:i+round}));}
function phaseAt(i){return i<2?0:i<6?1:2}
function current(){return session[position]}
function task(){return part===0?"מה המבנה של הביטוי או של הבעיה?":"איזה כלי מתאים כצעד ראשון?"}
function options(){const property=part===0?"type":"tool",pool=source().map(x=>x[property]),answer=current().item[property];return stableShuffle([answer,...pool.filter(x=>x!==answer).slice(0,3)],position+part)}
function render(){
const {item,sample}=current(),phase=phaseAt(position),transfer=phase===2,opts=options();
$("phaseLabel").textContent=phases[phase];$("stepLabel").textContent="דוגמה "+(position+1)+" מתוך "+total;
$("meterFill").style.width=Math.round((position+(part/2))/total*100)+"%";
$("meter").setAttribute("aria-valuenow",String(Math.round((position+part/2)/total*100)));
$("questionContext").textContent="תרגיל לדוגמה · לא צריך לפתור אותו";
$("expression").textContent=item.examples[(sample+position)%item.examples.length];
$("questionHeading").textContent=task();
$("questionSub").textContent=transfer?"בלי רמזים: האם אתם מזהים את המבנה גם בדוגמה החדשה?":part===0?"בחרו את סוג המבנה. עוצרים לפני כל חישוב.":"עכשיו בחרו כלי אחד שמתאים למבנה שזיהיתם.";
$("answers").replaceChildren();
opts.forEach(v=>{const b=document.createElement("button");b.type="button";b.textContent=v;b.setAttribute("aria-pressed","false");b.onclick=()=>answer(v,b);$("answers").append(b)});
$("feedback").textContent="";$("feedback").className="feedback";
$("help").classList.add("hidden");$("help").textContent="";
$("bridge").classList.add("hidden");
$("hint").disabled=transfer;$("hint").textContent=transfer?"אין רמזים בשלב העברה":"רמז על המבנה";
$("next").classList.add("hidden");$("next").textContent=part===0?"לבחירת כלי":position===total-1?"לסיכום":"לדוגמה הבאה";
answered=false;attempts=0;hinted=false;chosen="";
}
function answer(v,button){
if(answered)return;
const expected=current().item[part===0?"type":"tool"],correct=v===expected,phase=phaseAt(position);
attempts++;
$("answers").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
if(!correct){$("feedback").textContent=phase===2?"עדיין לא. שאלת ההעברה נמדדת לפי הניסיון הראשון. המשיכו לחשוב או נסו שוב.":"עדיין לא. חפשו סימן בזיהוי המבנה, או השתמשו ברמז."; $("feedback").className="feedback wrong";return;}
completed.push({phase,position,part,independent:attempts===1&&!hinted,correct:true});
answered=true;
$("answers").querySelectorAll("button").forEach(b=>b.disabled=true);
$("feedback").textContent=attempts===1&&!hinted?"זיהיתם נכון בניסיון הראשון.":"נכון לאחר תיקון. זהו תרגול מועיל, אבל לא נספר כהצלחה עצמאית.";
$("feedback").className="feedback correct";
if(part===1){
 const x=current().item;
 $("words").textContent=x.words;$("sketch").textContent=x.sketch;$("algebra").textContent=x.algebra;$("why").textContent=x.why;$("bridge").classList.remove("hidden");
}
$("next").classList.remove("hidden");$("next").focus({preventScroll:true});
}
$("hint").onclick=()=>{
if(!current()||phaseAt(position)===2||answered)return;
hinted=true;
const x=current().item;
$("help").classList.remove("hidden");
$("help").textContent=part===0?"חפשו: "+x.words:"המבנה שזיהינו הוא "+x.type+". מה עושים איתו לפני שמציבים מספרים?";
};
$("next").onclick=()=>{
if(!answered)return;
if(part===0){part=1;render();return}
if(position<total-1){position++;part=0;render();return}
finish();
};
function finish(){
$("work").classList.add("hidden");$("done").classList.remove("hidden");
const count=phase=>completed.filter(x=>x.phase===phase&&x.independent).length;
const phaseData=[0,1,2].map(p=>({value:count(p),max:sizes[p]*2}));
$("scores").replaceChildren();
phaseData.forEach((d,i)=>{const e=document.createElement("div"),strong=document.createElement("strong"),label=document.createElement("span");strong.textContent=d.value+"/"+d.max;label.textContent=phases[i]+" ללא רמז, בניסיון ראשון";e.append(strong,label);$("scores").append(e)});
const transfer=phaseData[2];
$("resultMessage").textContent=transfer.value===transfer.max?"הצלחתם לזהות את המבנה ואת הכלי גם בהעברה. נסו סיבוב נוסף עם נתונים חדשים.":"השלמתם את הסיבוב. היכולת עדיין בבנייה: חזרו על אימון המבנה ונסו שוב בדוגמה אחרת.";
save({at:new Date().toISOString(),grade,summary:phaseData,transferIndependent:transfer.value,transferTotal:transfer.max});
$("done").focus({preventScroll:true});
}
function start(){
session=selectCards();round++;position=0;part=0;completed=[];
$("intro").classList.add("hidden");$("done").classList.add("hidden");$("work").classList.remove("hidden");render();$("work").focus({preventScroll:true});
}
function showIntro(){
$("work").classList.add("hidden");$("done").classList.add("hidden");$("intro").classList.remove("hidden");
const s=read()[grade];$("lastResult").textContent=s&&Number.isInteger(s.transferIndependent)?"בהעברה הקודמת זיהיתם לבד "+s.transferIndependent+" מתוך "+s.transferTotal+" בחירות.": "עדיין אין תוצאה שמורה לרמה הזאת.";
$("gradeButtons").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.grade===grade)));
}
$("gradeButtons").addEventListener("click",e=>{const b=e.target.closest("[data-grade]");if(!b)return;grade=+b.dataset.grade;showIntro()});
$("start").onclick=start;$("back").onclick=showIntro;$("again").onclick=start;$("chooseGrade").onclick=showIntro;
showIntro();
})();