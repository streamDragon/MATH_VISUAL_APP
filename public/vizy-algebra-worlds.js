(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const lesson = 'algebra-worlds';
  if (params.get('lesson') !== lesson || params.get('legacy') === '1') return;

  const host = document.getElementById('coreFlow');
  if (!host) return;
  host.classList.add('aw-lesson');
  document.body.classList.add('aw-route');
  const storageKey = 'vizy_algebra_worlds_v1';
  const steps = [
    { label: 'מונה ראשון', raw: 'x²+2x−8', factor: '(x−2)(x+4)', tool: 'monic',
      clue: 'מחפשים שני מספרים שמכפלתם −8 וסכומם 2. אלה 4 ו־−2.',
      traps: ['(x−4)(x+2)', '(x−2)(x−4)'] },
    { label: 'מכנה ראשון', raw: 'x²+6x+8', factor: '(x+2)(x+4)', tool: 'monic',
      clue: 'מחפשים מכפלה 8 וסכום 6. המספרים 2 ו־4 מתאימים לשני התנאים.',
      traps: ['(x+1)(x+8)', '(x−2)(x−4)'] },
    { label: 'מונה שני', raw: '2x²+7x+6', factor: '(2x+3)(x+2)', tool: 'nonmonic',
      clue: 'כאן a=2. מפרקים את 7x ל־4x+3x, כי 4·3=2·6. מקבצים: 2x(x+2)+3(x+2).',
      traps: ['(2x+2)(x+3)', '(2x−3)(x−2)'] },
    { label: 'מכנה שני', raw: '(x+1)²−9', factor: '(x−2)(x+4)', tool: 'identity',
      clue: '9 הוא 3². מזהים A=x+1 ו־B=3, ואז (A−B)(A+B) נותן (x+1−3)(x+1+3).',
      traps: ['(x+1−3)²', '(x−3)(x+3)'] },
  ];
  // Recognition is a separate choice. Do not disclose the trinomial subtype
  // or the identity before the learner has recognized the structure.
  const tools = [
    ['collect','כינוס איברים','1+1+x+x'],
    ['common','גורם משותף','3x+6'],
    ['identity','כפל מקוצר','A²−B²'],
    ['trinomial','טרינום','ax²+bx+c'],
  ];
  const exclusions = 'x ≠ −4, −2, −3/2, 2';
  const read = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Number.isInteger(saved?.step) && saved.step >= 0 && saved.step <= 7) {
        return { step: saved.step, phase: ['tool','subtype','normalize','formula','factor'].includes(saved.phase) ? saved.phase : 'tool',
          opened: saved.opened === true || (saved.phase && saved.phase !== 'tool'), rewarded: saved.rewarded === true };
      }
    } catch {}
    return { step: 0, phase: 'tool', opened: false, rewarded: false };
  };
  let state = read();
  let opened = Boolean(state.opened);
  let feedback = '';
  let helped = false;
  const m = (s) => '<bdi class="aw-math" dir="ltr">' + s + '</bdi>';
  const current = () => steps[state.step - 1];
  const fraction = (top, bottom) => '<span class="aw-frac"><span>' + top + '</span><span>' + bottom + '</span></span>';
  const exp = (i) => {
    const data = steps[i], done = state.step > i + 1;
    const label = m(done ? data.factor : data.raw);
    if (state.step === i + 1 && !opened)
      return '<button class="aw-piece aw-current" type="button" data-open="' + i + '" aria-label="פתחו ' + data.label + '">' + label + '</button>';
    return '<span class="aw-piece' + (done ? ' aw-solid' : '') + (state.step === i + 1 ? ' aw-current' : '') + '">' + label + '</span>';
  };
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }
  function advance() {
    state.step += 1;
    state.phase = 'tool';
    opened = false;
    state.opened = false;
    feedback = '';
    if (state.step === 7 && !state.rewarded) {
      state.rewarded = true;
      save();
      window.dispatchEvent(new CustomEvent('vizy:progress', {
        detail: { type: 'activity', lesson, id: 'done', helped }
      }));
    }
    save();
    render(true);
  }
  const button = (value, html) => '<button type="button" data-answer="' + value + '">' + html + '</button>';
  function prompt() {
    if (state.step === 0) return '<h2>מה אסור להציב?</h2><div class="aw-choices">'
      + button('omit-divisor',m('x ≠ −4, −2, 2'))
      + button('domain',m(exclusions))
      + button('omit-denominator',m('x ≠ −4, −2, −3/2')) + '</div>';
    const entry = current();
    if (entry && !opened) return '<h2>געו ב־' + entry.label + ' בתרגיל</h2>';
    if (entry && state.phase === 'tool') return '<h2>לאיזה מבנה זה דומה?</h2><div class="aw-choices aw-tools">'
      + tools.map(([id,name,example]) => button(id,'<strong>'+name+'</strong>'+m(example))).join('') + '</div>';
    if (entry && state.phase === 'subtype') return '<h2>איזה טרינום?</h2><div class="aw-choices aw-tools">'
      + button('monic','<strong>המקדם 1</strong>'+m('x²+bx+c'))
      + button('nonmonic','<strong>המקדם אינו 1</strong>'+m('ax²+bx+c')+'<small>'+m('a≠0, a≠1')+'</small>') + '</div>';
    if (entry && state.phase === 'normalize') return '<h2>אפשר להפוך את הביטוי לצורה מוכרת?</h2><div class="aw-magic"><span class="aw-math" dir="ltr">(x+1)² − </span>'
      +'<button type="button" class="aw-magic-number" data-answer="square-nine" aria-label="הפכו את תשע לריבוע">9</button></div>';
    if (entry && state.phase === 'formula') {
      const formulas = entry.tool === 'identity' ? [
        ['formula','A²−B²=(A−B)(A+B)'], ['wrong-formula','A²−B²=(A−B)²'], ['wrong-formula','A²−B²=(A+B)²']
      ] : entry.tool === 'monic' ? [
        ['formula','x²+bx+c'], ['wrong-formula','ax+bx+c'], ['wrong-formula','x²+bc']
      ] : [
        ['formula','ax²+bx+c'], ['wrong-formula','ax+bx+c'], ['wrong-formula','a(x+b+c)']
      ];
      return '<div class="aw-cloud" aria-label="נוסחאות כלליות"><h2>איזה כלל מתאים?</h2>'
        + (entry.tool === 'identity' ? '<p class="aw-transformed">'+m('(x+1)² − 3²')+'</p>' : '')
        + '<div class="aw-choices aw-formulas">'
        + formulas.map(([id,formula]) => button(id,m(formula))).join('') + '</div></div>';
    }
    if (entry) {
      const choices = [...entry.traps];
      choices.splice(state.step % 3, 0, entry.factor);
      return '<h2>יורדים בחזרה: איזו מכפלה שווה ל־' + m(entry.raw) + '?</h2><div class="aw-choices">'
        + choices.map((choice) => button(choice === entry.factor ? 'factor' : 'wrong-factor',m(choice))).join('') + '</div>';
    }
    if (state.step === 5) return '<h2>איך הופכים חילוק לכפל?</h2><div class="aw-choices">'
      + button('flip-first','הופכים את השבר הראשון') + button('flip','כופלים בהופכי של השבר השני') + button('both','הופכים את שני השברים') + '</div>';
    if (state.step === 6) return '<h2>איזה גורם אפשר לצמצם?</h2><div class="aw-choices">'
      + button('nope',m('x+2')) + button('cancel',m('x+4')) + button('term',m('x')) + '</div>';
    return '<h2>הצלחתם לצמצם!</h2><p>תחום ההגדרה המקורי נשמר.</p>'
      + '<div class="aw-choices"><button type="button" data-reset>מתרגלים שוב</button><a href="learn.html">חזרה לבית</a></div>';
  }
  function render(focus = false) {
    const flipped = state.step >= 6;
    const showFinal = state.step === 7;
    const expression = showFinal
      ? fraction(m('(x−2)²(x+4)'), m('(x+2)²(2x+3)'))
      : fraction(exp(0),exp(1)) + '<b class="aw-op">' + (flipped ? '·' : '÷') + '</b>'
        + (flipped ? fraction(exp(3),exp(2)) : fraction(exp(2),exp(3)));
    host.innerHTML = '<div class="aw-head"><div><span class="aw-kicker">VIZY · כיתה ט׳</span><h1>מפרקים כדי לצמצם</h1></div>'
      + '<button type="button" class="aw-insight" data-insight>✦ תובנה</button></div>'
      + '<div class="aw-steps" role="progressbar" aria-label="התקדמות בתרגיל" aria-valuemin="0" aria-valuemax="7" aria-valuenow="' + state.step + '">'
      + Array.from({length:7},(_,i)=>'<span class="'+(i<state.step?'aw-done':'')+'"></span>').join('') + '</div>'
      + '<div class="aw-worlds"><span class="' + (state.step<5?'aw-selected':'') + '"><b>עולם הועודים</b><small>חיבור וחיסור · מפשטים ומזהים מבנה</small></span>'
      + '<span class="' + (state.step>=5?'aw-selected':'') + '"><b>עולם הכפולים</b><small>כפל וחילוק · מצמצמים גורמים</small></span></div>'
      + '<section class="aw-stage" aria-label="התרגיל הגדול"><strong>התרגיל הגדול</strong><div class="aw-expression" dir="ltr">' + expression + '</div>'
      + (state.step>0 ? '<p class="aw-domain">תחום ההגדרה: '+m(exclusions)+'</p>' : '') + '</section>'
      + '<section class="aw-prompt">' + prompt() + '<p class="aw-feedback" role="status">'+feedback+'</p></section>'
      + (state.step > 1 ? '<details class="aw-trail"><summary>הדרך שעשינו</summary><ul>'
        + steps.slice(0,Math.min(4,state.step-1)).map(item => '<li>' + item.label + ': ' + m(item.raw + ' = ' + item.factor) + '</li>').join('')
        + '</ul></details>' : '')
      + '<dialog class="aw-dialog"><form method="dialog"><button aria-label="סגירת תובנה">✕</button></form><h2>תובנה · קו השבר הוא סוגריים</h2>'
      + '<p>קו השבר מחלק את כל המונה בכל המכנה. לפני צמצום, שאלו: האם מה שמסומן הוא איבר בתוך סכום, או גורם של המכפלה כולה?</p>'
      + '<p>בשבר ' + m('(u+v)/u') + ' המונה הוא סכום. בשבר ' + m('u(v+1)/u') + ' המונה הוא מכפלה, ולכן אפשר לצמצם ב־' + m('u') + ' כשהוא שונה מאפס.</p></dialog>';
    if (focus) {
      const heading = host.querySelector('.aw-prompt h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  host.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-insight')) {
      helped = true;
      host.querySelector('dialog').showModal();
      return;
    }
    if (target.hasAttribute('data-reset')) {
      state = { step: 0, phase: 'tool', opened: false, rewarded: state.rewarded };
      opened = false; feedback = ''; helped = false; save(); render(true); return;
    }
    if (target.hasAttribute('data-open')) {
      opened = true; state.opened = true; feedback = ''; save(); render(true); return;
    }
    const answer = target.dataset.answer;
    if (!answer) return;
    const entry = current();
    const expected = state.step === 0 ? 'domain' : state.step === 5 ? 'flip' : state.step === 6 ? 'cancel'
      : state.phase === 'tool' ? (entry.tool === 'monic' || entry.tool === 'nonmonic' ? 'trinomial' : entry.tool)
      : state.phase === 'subtype' ? entry.tool : state.phase === 'normalize' ? 'square-nine' : state.phase === 'formula' ? 'formula' : 'factor';
    if (answer !== expected) {
      feedback = state.step === 0 ? 'בדקו בנפרד איפה כל מכנה מתאפס ואיפה המונה של השבר השני מתאפס.'
        : state.step === 5 ? 'בחילוק בשבר כופלים בהופכי שלו. השבר הראשון נשאר כפי שהוא.'
        : state.step === 6 ? 'צמצום דורש אותו גורם שלם במונה ובמכנה.'
        : state.phase === 'tool' ? 'בדקו: איברים דומים, גורם שחוזר, ריבועים, או שלושה איברים?'
        : state.phase === 'subtype' ? 'בדקו את המקדם של x², לא את המקדם של x.'
        : state.phase === 'normalize' ? 'איזה מספר בריבוע שווה ל־9?'
        : state.phase === 'formula' ? 'הכלל חייב לשמור על אותו ערך לכל הצבה מותרת.'
        : 'פתחו סוגריים ובדקו את המכפלה מול הביטוי המקורי.';
      host.querySelector('.aw-feedback').textContent = feedback;
      return;
    }
    window.VizySound?.play('right');
    if (entry && state.phase !== 'factor') {
      state.phase = state.phase === 'tool'
        ? (answer === 'trinomial' ? 'subtype' : answer === 'identity' ? 'normalize' : 'formula')
        : state.phase === 'subtype' || state.phase === 'normalize' ? 'formula' : 'factor';
      feedback = ''; save(); render(true);
    } else advance();
  });
  render();
})();
