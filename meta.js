const TEMPLATES = {
  analysis: [
    {
      he: "תאר/י את הארכיטקטורה והנחות הליבה של המודל: איזה סוג שכבות, אילו פונקציות אקטיבציה, ואילו שלבי עיבוד משפיעים על ביצועים?",
      en: "Describe the model architecture and core assumptions: which layer types, activation functions, and processing stages most affect performance?"
    },
    {
      he: "איזה סוג נתונים שימש לאימון, ואילו הטיות אפשריות קיימות בדאטה שיכולות להשפיע על התנהגות המודל?",
      en: "What data was used for training, and what potential biases in the dataset could affect the model's behavior?"
    }
  ],
  validation: [
    {
      he: "כיצד תבדוק/י שהמודל לא מתאמץ יתר על המידה (overfitting)? פרט/י בדיקות והמדדים שתשתמש/י בהם.",
      en: "How would you check the model for overfitting? List tests and metrics you would use."
    },
    {
      he: "באילו תרחישי מבחן מערכתיים (edge cases) תבחן/י את המודל כדי לוודא יציבות?",
      en: "Which systematic test scenarios (edge cases) would you evaluate to ensure model stability?"
    }
  ],
  robustness: [
    {
      he: "כיצד תבחן/י את החוסן של המודל לשינויים קלים בכניסה (perturbations) או להסרות תכונות?",
      en: "How would you test the model's robustness to small input perturbations or feature ablations?"
    },
    {
      he: "איזה ניסויים תערוך/י כדי למדוד רגישות המודל לשינויי הפצה (distribution shift)?",
      en: "What experiments would you run to measure model sensitivity to distribution shift?"
    }
  ],
  ethics: [
    {
      he: "איזה סיכונים אתיים אפשריים קיימים בשימוש במודל זה ואיך תמליץ/י להקל עליהם?",
      en: "What ethical risks might arise from using this model and how would you mitigate them?"
    },
    {
      he: "האם המודל מייצר תוצאות שאינן מובהקות או מפלות קבוצות? אילו בדיקות תפעל/י כדי לזהות זאת?",
      en: "Does the model produce potentially misleading or discriminatory outputs? Which checks would you run to detect that?"
    }
  ],
  explainability: [
    {
      he: "כיצד תסביר/י את החלטות המודל למשתמשי קצה או למפתחים? אילו כלים/שיטות תשתמש/י?",
      en: "How would you explain the model's decisions to end users or developers? Which tools/methods would you use?"
    },
    {
      he: "איזה ניסוי ראוי לבצע כדי לקשר תכונה מסוימת להשפעה על התחזיות?",
      en: "What experiment would you run to link a specific feature to its impact on predictions?"
    }
  ]
};

let lang = 'he';
const el = {
  desc: document.getElementById('model-desc'),
  type: document.getElementById('question-type'),
  btnGen: document.getElementById('btn-generate'),
  btnRand: document.getElementById('btn-randomize'),
  btnCopy: document.getElementById('btn-copy'),
  btnDL: document.getElementById('btn-download'),
  list: document.getElementById('questions-list'),
  btnHe: document.getElementById('btn-he'),
  btnEn: document.getElementById('btn-en')
};

function setLang(l){
  lang = l;
  if(l==='he'){
    document.documentElement.lang = 'he'; document.documentElement.dir = 'rtl';
    el.btnHe.classList.add('active'); el.btnEn.classList.remove('active');
  } else {
    document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
    el.btnEn.classList.add('active'); el.btnHe.classList.remove('active');
  }
}

el.btnHe.addEventListener('click', ()=>setLang('he'));
el.btnEn.addEventListener('click', ()=>setLang('en'));

function generateQuestions(){
  const modelText = (el.desc.value || '').trim();
  const type = el.type.value || 'analysis';
  const templates = TEMPLATES[type] || [];
  const out = [];

  templates.forEach(t => {
    let q = t[lang] || t['en'] || '';
    if(modelText){
      // simple placeholder insertion where applicable
      q = q.replace(/מודל|model/gi, modelText);
    }
    out.push(q);
  });

  // if model description present, add a follow-up focused question
  if(modelText){
    out.unshift(lang==='he'
      ? `תן/י שלוש שאלות שיעזרו להעריך את ביצועי המודל המתואר: ${modelText}`
      : `Provide three questions to help evaluate the performance of the described model: ${modelText}`
    );
  }

  renderQuestions(out);
}

function renderQuestions(list){
  el.list.innerHTML = '';
  list.forEach((q,i)=>{
    const li = document.createElement('li');
    li.innerText = `${i+1}. ${q}`;
    el.list.appendChild(li);
  });
}

el.btnGen.addEventListener('click', generateQuestions);
el.btnRand.addEventListener('click', ()=>{
  // pick a random type and language, then generate
  const types = Object.keys(TEMPLATES);
  const t = types[Math.floor(Math.random()*types.length)];
  el.type.value = t;
  setLang(Math.random()>0.5 ? 'en' : 'he');
  generateQuestions();
});

el.btnCopy.addEventListener('click', ()=>{
  const texts = Array.from(el.list.querySelectorAll('li')).map(li=>li.innerText).join('\n');
  navigator.clipboard?.writeText(texts).then(()=>{
    alert(lang==='he' ? 'עותק הועתק ללוח' : 'Copied to clipboard');
  }, ()=>alert(lang==='he' ? 'העתקה נכשלה' : 'Copy failed'));
});

el.btnDL.addEventListener('click', ()=>{
  const texts = Array.from(el.list.querySelectorAll('li')).map(li=>li.innerText).join('\n');
  const blob = new Blob([texts], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meta-questions.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// initialize
setLang('he');
renderQuestions([lang==='he' ? 'לחץ "צור שאלות" כדי להתחיל.' : 'Press "Generate" to start.']);