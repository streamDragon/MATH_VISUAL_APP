(function(){
"use strict";
const key="vizy_problem_map_v1";
const $=id=>document.getElementById(id);
const relationInfo={
 derivative:{text:"בנקודת קיצון שבה הפונקציה גזירה, המשיק אופקי ולכן f′(x)=0. זה תנאי הכרחי, לא מספיק.",value:"f′(x)=0"},
 x:{text:"x מציין איפה אנחנו על הציר האופקי. בפונקציה ממעלה שלישית ייתכנו לכל היותר שתי נקודות קיצון.",value:"מיקום הנקודה"},
 y:{text:"y=f(x) נותן את גובה הנקודה אחרי שבוחרים x. עדיין לא צריך לחשב אותו.",value:"גובה הפונקציה"}
};
const statusLabels={unknown:"עוד לא",maybe:"כנראה",sure:"בטוח"};
const state={clues:{function:false,extrema:false,kind:false},node:null,marks:{derivative:"unknown",x:"unknown",y:"unknown"},tangent:"flat",before:"up",after:"down",checkpoint:null,checked:false,localChecked:false};
function load(){try{let s=JSON.parse(localStorage.getItem(key)||"null");if(s&&typeof s==="object"){for(let k of ["clues","marks"]){if(s[k]&&typeof s[k]==="object")Object.assign(state[k],s[k]);}for(let k of ["tangent","before","after","checkpoint"]){if(typeof s[k]==="string")state[k]=s[k];}}}catch{}}
function save(){try{localStorage.setItem(key,JSON.stringify({clues:state.clues,marks:state.marks,tangent:state.tangent,before:state.before,after:state.after,checkpoint:state.checkpoint}));}catch{}}
function truthCount(){return Number(state.clues.function)+Number(state.clues.extrema)+Number(state.clues.kind)+Number(state.checked&&state.clues.extrema&&state.clues.kind);}
function updateProgress(){const count=truthCount();$("clarityText").textContent=count+" מתוך 4 קשרים";$("clarityFill").style.width=(count/4*100)+"%";$("clarityTrack").setAttribute("aria-valuenow",String(count));}
function selectNode(node){state.node=node;document.querySelectorAll("[data-node]").forEach(b=>{let selected=b.dataset.node===node;b.setAttribute("aria-pressed",String(selected));let desc=b.querySelector(".node-desc");desc.textContent=state.marks[b.dataset.node]!=="unknown"?statusLabels[state.marks[b.dataset.node]]:({x:"איפה?",y:"כמה גבוה?",derivative:"מה השיפוע?"})[b.dataset.node];});
 $("conceptNote").textContent=relationInfo[node].text;
 document.querySelectorAll("[data-certainty]").forEach(b=>b.setAttribute("aria-pressed",String(state.marks[node]===b.dataset.certainty)));
 $("confidenceNote").textContent="הביטחון הוא ההערכה שלכם. נכון או לא נבדק לפי הנתונים, לא לפי העוצמה שבחרתם."; }
function updateClues(){document.querySelectorAll("[data-clue]").forEach(b=>b.setAttribute("aria-pressed",String(state.clues[b.dataset.clue])));updateProgress();}
function setChoice(group,value){state[group]=value;document.querySelectorAll("[data-"+group+"]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset[group]===value)));draw();save();}
function draw(){
 const {tangent:t,before:b,after:a}=state;let curve="",line="",label="";
 if(t==="up"){curve="M35 185 C85 156 126 127 170 111 S266 64 310 24";line="M90 147 L250 75";label="המשיק עולה. אין כאן קיצון עם משיק אופקי.";}
 else if(t==="down"){curve="M35 25 C85 52 126 87 170 111 S266 156 310 185";line="M90 75 L250 147";label="המשיק יורד. אין כאן קיצון עם משיק אופקי.";}
 else{
  line="M90 111 L250 111";
  const left=b==="up"?195:25,right=a==="up"?25:195;
  curve=b===a?(b==="up"?"M35 194 C90 158 140 111 170 111 C200 111 250 66 310 28":"M35 28 C90 66 140 111 170 111 C200 111 250 158 310 194"):"M35 "+left+" Q108 111 170 111 Q232 111 310 "+right;
  if(b==="up"&&a==="down")label="מקסימום מקומי: קודם עולה ואחר כך יורדת.";
  else if(b==="down"&&a==="up")label="מינימום מקומי: קודם יורדת ואחר כך עולה.";
  else label="משיק אופקי אינו מבטיח קיצון: הכיוון לא התחלף.";
 }
 $("curve").setAttribute("d",curve);$("tangent").setAttribute("d",line);$("localVerdict").textContent=label;
 const flat=t==="flat";$("beforeControls").hidden=!flat;$("afterControls").hidden=!flat;
 document.querySelectorAll("[data-tangent]").forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.tangent===t)));
 document.querySelectorAll("[data-before]").forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.before===b)));
 document.querySelectorAll("[data-after]").forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.after===a)));
}
function checkMap(){state.checked=true;let things=[];if(!state.clues.function)things.push("סמנו את דרגת הפונקציה");if(!state.clues.extrema)things.push("זהו שמבקשים נקודות קיצון");if(!state.clues.kind)things.push("זהו שמבקשים את סוג הקיצון");if(state.marks.derivative==="unknown")things.push("בחרו את f′(x) וסמנו את מידת הביטחון שלכם");$("mapResult").textContent=things.length?"נשאר לבדוק: "+things.join(" · "):"זיהיתם את המבנה הכללי. עדיין צריך לחשב היכן הקיצון ולקבוע את הסוג לפי שינוי הסימן של f′.";updateProgress();}
function summary(){const parts=[];if(state.clues.function)parts.push("פונקציה ממעלה 3");if(state.clues.extrema)parts.push("מחפשים קיצון");if(state.clues.kind)parts.push("נדרש לקבוע סוג");const checkpoint=({tangent:"אני יודע איך נראה המשיק",graph:"אני רואה רק חלק מהגרף",algebra:"אני יודע מה עוד צריך לחשב",unsure:"אני עדיין לא בטוח"})[state.checkpoint]||"טרם בחרתי";
return "Vizy | מפת השאלה\nf(x)=x³−12x, נקודות קיצון\nמה זיהיתי: "+(parts.join(", ")||"עוד לא")+"\nמה רואים ליד הנקודה: "+$("localVerdict").textContent+"\nאיפה אני עכשיו: "+checkpoint+"\nנשאר לבדוק: מיקום הקיצון וסוגו באלגברה בכיתה.";}
async function share(){const text=summary();if(navigator.share){try{await navigator.share({title:"Vizy | מפת השאלה",text});return;}catch(err){if(err.name==="AbortError")return;}}
 try{await navigator.clipboard.writeText(text);$("checkpointSummary").textContent="כרטיס המפה הועתק. אפשר להדביק אותו בהודעה למורה.";}catch{$("checkpointSummary").textContent=text;}}
function updateCheckpoint(){document.querySelectorAll("[data-checkpoint]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.checkpoint===state.checkpoint)));const label=({tangent:"המשיק נותן לנו מידע מקומי, לא את כל הגרף.",graph:"חלק קטן יכול להספיק כדי להבין התנהגות ליד נקודה.",algebra:"המפה מבהירה מה רוצים לחשב; הפתרון המלא ממשיך בכיתה.",unsure:"זה בסדר לא לדעת עדיין. בחרו קשר אחד שאפשר לבדוק."})[state.checkpoint];$("checkpointSummary").textContent=label||"בחרו נקודת עצירה. אפשר לשמור אותה לתרגול הבא.";}
function init(){load();
 document.querySelectorAll("[data-clue]").forEach(b=>b.onclick=()=>{state.clues[b.dataset.clue]=!state.clues[b.dataset.clue];updateClues();save();});
 document.querySelectorAll("[data-node]").forEach(b=>b.onclick=()=>selectNode(b.dataset.node));
 document.querySelectorAll("[data-certainty]").forEach(b=>b.onclick=()=>{if(!state.node)selectNode("derivative");state.marks[state.node]=b.dataset.certainty;selectNode(state.node);updateProgress();save();});
 document.querySelectorAll("[data-tangent]").forEach(b=>b.onclick=()=>setChoice("tangent",b.dataset.tangent));
 document.querySelectorAll("[data-before]").forEach(b=>b.onclick=()=>setChoice("before",b.dataset.before));
 document.querySelectorAll("[data-after]").forEach(b=>b.onclick=()=>setChoice("after",b.dataset.after));
 document.querySelectorAll("[data-checkpoint]").forEach(b=>b.onclick=()=>{state.checkpoint=b.dataset.checkpoint;updateCheckpoint();save();});
 $("checkMap").onclick=checkMap;$("checkLocal").onclick=()=>{$("localCheck").textContent=state.tangent!=="flat"?"כדי לזהות קיצון גזיר בחרו משיק אופקי, ואז בדקו את שני הצדדים.":state.before===state.after?"המשיק אופקי, אבל אין החלפת כיוון. ייתכן שזו נקודת פיתול.":"נכון כסוג של התנהגות מקומית. כדי לדעת איזו נקודה זו בפונקציה הנתונה נצטרך לחשב ולבדוק סימנים.";};
 $("shareCard").onclick=share;$("resetAll").onclick=()=>{try{localStorage.removeItem(key)}catch{}location.reload();};
 updateClues();draw();updateCheckpoint();if(state.node)selectNode(state.node);
}
document.addEventListener("DOMContentLoaded",init);
})();