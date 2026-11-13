import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
  .split(/\r?\n/).filter(Boolean).map(s => s.replace(/\\/g, "/"));
const have = new Set(tracked);
const aliases = {
 "index.html": "חקר פונקציות (מסך מתקדם)",
 "public/learn.html": "הבית ואתגרי הלמידה",
 "public/classroom-practice.html": "תרגול כיתתי",
 "public/skill-lab.html": "מעבדת מיומנויות",
 "public/problem-map.html": "מפת השאלה",
 "public/learning-app.js": "ניהול חוויית הלמידה",
 "public/story-corner-data.js": "סיפורי מתמטיקאים ותיעוד מקורות",
 "public/story-corner.js": "Overlay סיפורים ללא ניווט",
 "public/story-corner.css": "עיצוב פינת הסיפורים",
 "tests/story-corner.spec.ts": "בדיקות פינת הסיפורים",
 "public/classroom-flow.js": "מנוע מסלול הכיתה",
 "public/classroom-visuals.js": "המחשות כיתתיות",
 "public/classroom-activities.js": "תוכן שיעורים",
 "public/learning-core.js": "ליבת למידה",
 "public/learning-visuals.js": "מנוע ציור",
 "public/skill-lab.js": "מנוע אימון מיומנויות",
 "public/skill-lab-data.js": "תרגילי המיומנויות",
 "public/codex_features.js": "לוח ייצוגים ניסיוני",
 "public/student-buddy.js": "ליווי התלמיד",
 "public/learning-bank.json": "בנק הפעילויות",
 "public/problem-map.js": "לוגיקת מפת השאלה",
 "public/problem-map.css": "עיצוב מפת השאלה",
 "tests/problem-map.spec.ts": "בדיקת מפת השאלה",
 "scripts/build-web.mjs": "צינור בניית האתר",
 "service-worker.js": "מטמון עבודה לא מקוונת",
 "package.json": "הגדרות הפרויקט",
 "vite.config.ts": "הגדרת בנייה"
};
const featureList = []; // Everything listed from main is current; no stale feature nodes.
function group(p) {
 if (p === "package.json" || p === "vite.config.ts" || p.includes("/workflows/") || p.startsWith("scripts/") || p === "service-worker.js") return "build";
 if (p.startsWith("tests/")) return "test";
 if (p.startsWith("api/") || p.startsWith("supabase/")) return "service";
 if (p.endsWith(".html") && !p.startsWith("docs/")) return "page";
 if (p.endsWith(".css")) return "style";
 if (p.endsWith(".json") || p.startsWith("content/")) return "data";
 if (p.endsWith(".js") || p.endsWith(".mjs") || p.endsWith(".cjs")) return "logic";
 return "other";
}
function keep(p) {
 if (p.startsWith("android/") || p.startsWith("docs/") || p.startsWith("screenshots/") || p.startsWith("Images/") || p.startsWith("icons/")) return false;
 if (p.includes("/audio/") || p.includes("/help-videos/") || p.includes("/icons/") || p.includes("/screenshots/")) return false;
 if (p === "package-lock.json") return false;
 if (p === ".gitattributes" || p === ".gitignore" || p === "AGENTS.md") return false;
 if (/\.(mp3|mp4|png|jpg|jpeg|webp|pdf|aab|apk|ttf|woff2?|svg)$/i.test(p)) return false;
 return /\.(html|css|js|mjs|cjs|json|ts|yml|yaml|py)$/i.test(p);
}
const nodes = tracked.filter(keep).map(p => ({
 id:p, label:aliases[p]||p.split("/").pop(), path:p,
 group:group(p), status:"main",
 detail:p, url:"https://github.com/streamDragon/MATH_VISUAL_APP/blob/main/"+p
}));
const byId = new Map(nodes.map(n => [n.id,n]));
for (const p of featureList) if (!byId.has(p)) {
 const n = {id:p,label:aliases[p]||p.split("/").pop(),path:p,group:group(p),
 status:"feature",detail:"קיים בענף feature/vizy-problem-map-20261110; לא ב-main",
 url:"https://github.com/streamDragon/MATH_VISUAL_APP/blob/feature/vizy-problem-map-20261110/"+p};
 nodes.push(n);byId.set(n.id,n);
}
const aggregates = [
 ["android","גרסת Android","build"],
 ["assets","תמונות, קול, סרטים ואייקונים","data"],
 ["docs","מפרטים ותוכניות","build"]
];
for (const [id,label,g] of aggregates) {let n={id:"aggregate:"+id,label,group:g,status:"main",detail:"קבוצת קבצים",url:"https://github.com/streamDragon/MATH_VISUAL_APP/tree/main/"+(id==="assets"?"public":id)};nodes.push(n);byId.set(n.id,n);}
const edges = []; const edgeKeys = new Set();
function add(from,to,type) {
 if (!byId.has(from)||!byId.has(to)||from===to) return;
 const k=from+"|"+to+"|"+type;
 if (edgeKeys.has(k)) return;edgeKeys.add(k);edges.push({from,to,type});
}
function resolve(from, raw) {
 if (!raw) return null;
 let s=String(raw).trim().replace(/&amp;/g,"&");
 if (/^(https?:|data:|javascript:|mailto:|tel:|#)/i.test(s)) return null;
 s=s.split(/[?#]/)[0];if(!s||s==="/")return "index.html";
 if (s.startsWith("/api/")) return s.slice(1);
 if (s.startsWith("/")) {let p=s.slice(1);if(have.has("public/"+p)||byId.has("public/"+p))return "public/"+p;if(have.has(p)||byId.has(p))return p;}
 let src=from.startsWith("public/")?"public/":path.posix.dirname(from)+"/";
 let c=path.posix.normalize(src+s);
 if(byId.has(c)||have.has(c))return c;
 if(byId.has("public/"+s)||have.has("public/"+s))return "public/"+s;
 if(byId.has(s)||have.has(s))return s;
 return null;
}
const read = p => {try{return fs.readFileSync(path.join(root,p),"utf8");}catch{return "";}};
for (const n of nodes) {
 if(n.status!=="main"||!n.path)continue;
 const t=read(n.path);if(!t)continue;
 if(n.path.endsWith(".html")){
   for (const m of t.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
     const dest=resolve(n.id,m[1]);const type=/\.html?($|[?#])/.test(m[1]) || m[1].startsWith("/?")?"navigates":"loads";
     add(n.id,dest,type);
   }
 }
 if(/\.(js|mjs|cjs|ts)$/.test(n.path)){
   for(const m of t.matchAll(/\b(?:from\s*|import\s*\(|require\s*\()\s*["']([^"']+)["']/g))add(n.id,resolve(n.id,m[1]),"imports");
   for(const m of t.matchAll(/\bfetch\s*\(\s*["'\x60]([^"'\x60]+)/g))add(n.id,resolve(n.id,m[1]),"requests");
   for(const m of t.matchAll(/\b(?:page\.)?goto\s*\(\s*["'\x60]([^"'\x60]+)/g))add(n.id,resolve(n.id,m[1]),"tests");
   for(const m of t.matchAll(/\b(?:location(?:\.href)?\s*=\s*|open\s*\()\s*["'\x60]([^"'\x60]+)/g))add(n.id,resolve(n.id,m[1]),"navigates");
   for(const m of t.matchAll(/["'\x60](\/(?:learn|skill-lab|classroom-practice|review|problem-map)\.html)["'\x60]/g))add(n.id,resolve(n.id,m[1]),"references");
 }
 if(n.path.endsWith(".css")){
   for(const m of t.matchAll(/@import\s*(?:url\()?["']([^"']+)["']/g))add(n.id,resolve(n.id,m[1]),"imports");
 }
}
add("package.json","scripts/build-web.mjs","builds");
add("scripts/build-web.mjs","vite.config.ts","builds");
add("vite.config.ts","index.html","builds");
add("package.json","aggregate:android","builds");
add("index.html","public/learn.html","navigates");
add("public/learning-app.js","public/learning-core.js","uses");
add("public/learning-app.js","public/learning-visuals.js","uses");
add("public/learning-app.js","public/learning-service.js","uses");
add("public/classroom-flow.js","public/classroom-math.js","uses");
add("public/classroom-flow.js","public/classroom-activities.js","uses");
add("public/classroom-flow.js","public/classroom-visuals.js","uses");
add("public/skill-lab.js","public/skill-lab-data.js","uses");
add("public/learn.html","public/problem-map.html","navigates");
add("public/problem-map.html","public/meaning-weave-data.js","loads");
add("public/problem-map.html","public/meaning-weave-core.js","loads");
add("public/problem-map.html","public/meaning-weave.js","loads");
add("public/meaning-weave.js","public/meaning-weave-core.js","uses");
add("public/learning-app.js","public/ability-picker.js","routing");
add("public/learning-app.js","public/story-corner.js","offers optional overlay");
add("public/meaning-weave.js","public/story-corner.js","opens optional overlay");
add("public/story-corner.js","public/story-corner-data.js","displays stories");
add("tests/story-corner.spec.ts","public/story-corner.js","tests");
add("public/problem-map.html","public/problem-map.js","loads");
add("public/problem-map.html","public/problem-map.css","loads");
add("tests/problem-map.spec.ts","public/problem-map.html","tests");
const concepts = [
 ["concept:identify","זיהוי","student"], ["concept:represent","ייצוג","student"], ["concept:infer","הסקה","student"],
 ["concept:given","נתון","source"], ["concept:asked","מבוקש","source"],
 ["concept:principle","עיקרון ידוע","source"], ["concept:derived","מסקנה מוסקת","source"],
 ["concept:words","מילים","representation"], ["concept:picture","ציור","representation"], ["concept:algebra","אלגברה","representation"],
 ["concept:mathdetermination","מה נקבע מתמטית","knowledge"], ["concept:studentderived","מה הוסק בפועל","knowledge"],
 ["concept:x","x","knowledge"], ["concept:y","y","knowledge"],
 ["concept:derivative","f′(x)","knowledge"], ["concept:type","סוג הנקודה","knowledge"],
 ["concept:parameter","f(x)=x²+ax; קיצון ב-x=2","example"]
];
for(const [id,label,role] of concepts)nodes.push({id,label,role,group:"concept",status:"design",detail:"יעד פדגוגי מתוך v3; אינו בהכרח ממומש ב-main",url:null});
const cEdges = [];
const cadd=(from,to,type)=>cEdges.push({from,to,type});
for(const p of ["concept:given","concept:asked","concept:principle","concept:derived"])cadd(p,"concept:identify","classifies");
for(const p of ["concept:words","concept:picture","concept:algebra"])cadd("concept:represent",p,"translates");
for(const p of ["concept:given","concept:principle"])cadd(p,"concept:infer","supports");
cadd("concept:infer","concept:derived","produces");
for(const p of ["concept:x","concept:y","concept:derivative","concept:type"])cadd("concept:derived",p,"updates");
cadd("concept:given","concept:mathdetermination","constrains");
cadd("concept:derived","concept:studentderived","establishes");
cadd("concept:parameter","concept:given","example");
cadd("concept:mathdetermination","concept:studentderived","distinct");
cadd("concept:identify","concept:represent","shared state");
cadd("concept:represent","concept:infer","shared state");

const byGroup=Object.fromEntries([...new Set(nodes.filter(n=>n.group!=="concept").map(n=>n.group))].map(g=>[g,nodes.filter(n=>n.group===g).length]));
const sourceSha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const sourceBranch=execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim()||'detached';
const data={
 meta:{title:"Vizy Graphify",generatedAt:new Date().toISOString(),
 repository:"streamDragon/MATH_VISUAL_APP",mainSha:sourceSha,
 trackedFiles:tracked.length,scannedFiles:nodes.filter(n=>n.path&&n.status==="main").length,branch:sourceBranch,
 note:"מפת קבצים מסריקת git ls-files בענף "+sourceBranch+" בקומיט "+sourceSha.slice(0,7)+". מקור: סביבת העבודה המקומית. פריטי design הם כיווני תכנון, לא קוד ממומש."},
 nodes,edges:edges.concat(cEdges),counts:byGroup,
 findings:[
  {severity:"medium",title:"מפת השאלה שולבה ב-main",detail:"בקומיטים של 10 בנובמבר נוספו שלוש לשוניות זיהוי, ייצוג והסקה, מקרה פרמטר, ומבחני מובייל. זו התקדמות ממשית בקוד, לא רק במוקאפ."},
  {severity:"medium",title:"לוגיקת מקור הידע עדיין אינה ארבע קטגוריות אחידות",detail:"problem-map-core.js מאמת מקור ביטוי כנתון, מבוקש או none; עיקרון ידוע מוצג בטקסט, ומסקנה מזוהה דרך claim. המושגים מובחנים אך עדיין לא כולם מיוצגים באותו מודל נתונים."},
  {severity:"medium",title:"הבחנה בין תפקיד מילה לבין מקור מידע",detail:"המימוש מכיל object/relation/instruction ובנפרד given/asked/none. שווה לוודא שמקרא הצבעים והמשוב אינם מערבבים תפקיד תחבירי עם מקור ידיעה."},
  {severity:"medium",title:"קביעה מתמטית לעומת היסק תלמיד",detail:"המסך החדש כבר מפריד בין 'הנתונים קובעים' לבין 'הסקנו עד כה'. חשוב לשמר הפרדה זו גם בבעיות נוספות, לא רק בדוגמת הפרמטר."},
  {severity:"medium",title:"מארג משמעויות נבדק כפעילות",detail:"נוספו שלושה מסלולי מארג לכיתות ט ויא: עלייה, שיפוע, הפרש ריבועים. הבחירה הרב-נכונה, מיון סוג קשר והעברה נבדקים מקומית; הצלחה של תלמידים אמיתיים עדיין לא נמדדה."},
  {severity:"medium",title:"צילום שאלות: חיבור חי טרם אומת",detail:"הלקוח דורש העלאת תמונה מוצלחת ומזהה בקשה מהשרת; אין עדיין אישור לבדיקת חשבון תלמיד, מודרטור ושירות אחסון חי מקצה לקצה."}
 ]
};
const out = path.join(root,"public");
fs.writeFileSync(path.join(out,"graphify-data.js"),"window.VIZY_GRAPHIFY = "+JSON.stringify(data)+";\n","utf8");
fs.writeFileSync(path.join(out,"graphify-map.json"),JSON.stringify(data,null,2)+"\n","utf8");
console.log("Graphify generated:",JSON.stringify({tracked:tracked.length,nodes:nodes.length,codeLinks:edges.length,conceptLinks:cEdges.length,groups:byGroup,featureNodes:nodes.filter(n=>n.status==="feature").length}));
