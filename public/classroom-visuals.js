(function () {
  "use strict";
  const q = (host, selector) => host.querySelector(selector);
  const format = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  const svg = (markup, label) => '<svg viewBox="0 0 360 245" role="img" aria-label="' + label + '">' + markup + '</svg>';
  function parabola(host, step) {
    const match = step.problem.match(/x²\s*[−-]\s*(\d+)/);
    const c = match ? Number(match[1]) : 4;
    const xPixel = x => 180 + x * 37;
    const yPixel = y => 99 - y * 10.4;
    const points = [];
    for (let x = -4; x <= 4.01; x += .08) points.push(xPixel(x).toFixed(1) + ',' + yPixel(x * x - c).toFixed(1));
    host.innerHTML = svg('<path d="M24 99H336 M180 15V230" stroke="#657ba8" stroke-width="1.8"/>' +
      '<polyline points="' + points.join(' ') + '" fill="none" stroke="#81daf8" stroke-width="3"/>' +
      '<circle id="movingDot" r="6" fill="#ffe08c" stroke="#10172b" stroke-width="2"/>' +
      '<text x="330" y="92" fill="#d9e5ff" font-size="12">x</text>' +
      '<text x="185" y="15" fill="#d9e5ff" font-size="12">y</text>', 'גרף פרבולה אינטראקטיבי; המחוון משנה את x ומציג את ערך הפונקציה') +
      '<div class="visual-controls"><label for="visualSlider">שנו את x</label><input id="visualSlider" type="range" min="-3" max="3" step=".5" value="0"><strong id="visualResult" dir="ltr"></strong></div>' +
      '<p class="visual-caption">הגובה של הנקודה משתנה. אפשר לבדוק איפה הגרף חוצה את הצירים.</p>';
    const update = () => { const x = Number(q(host, '#visualSlider').value), y = x * x - c;
      q(host, '#movingDot').setAttribute('cx', xPixel(x)); q(host, '#movingDot').setAttribute('cy', yPixel(y));
      q(host, '#visualResult').textContent = 'x=' + format(x) + '  |  y=' + format(y); };
    q(host, '#visualSlider').addEventListener('input', update); update();
  }
  function circle(host, step) {
    if (/מרובע/.test(step.problem)) {
      const points=[[93.4,172],[214.2,216],[278.5,139.4],[214.2,28]];
      host.innerHTML=svg('<circle cx="180" cy="122" r="100" fill="none" stroke="#84dafa" stroke-width="3"/>' +
        '<polygon points="'+points.map(p=>p.join(',')).join(' ')+'" fill="#27739933" stroke="#b4eab2" stroke-width="3"/>' +
        points.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="#ffd48d"/>').join('') +
        '<text x="73" y="172" fill="#ffce9c" font-size="14">70°</text><text x="290" y="140" fill="#fff" font-size="16">?</text>',
        'מרובע חסום במעגל עם זווית בת שבעים מעלות וזווית נגדית לא ידועה') +
        '<p class="visual-caption">במרובע חסום במעגל זוויות נגדיות משלימות ל־180 מעלות.</p>'; return;
    }
    if (/משיק/.test(step.problem)) {
      host.innerHTML = svg('<circle cx="166" cy="122" r="85" fill="none" stroke="#86dbfa" stroke-width="3"/>' +
        '<line x1="166" y1="122" x2="251" y2="122" stroke="#ffd17d" stroke-width="3"/>' +
        '<line x1="251" y1="12" x2="251" y2="230" stroke="#b2efb3" stroke-width="3"/>' +
        '<path d="M236 122V107H251" fill="none" stroke="white" stroke-width="2"/>' +
        '<text x="153" y="137" fill="white" font-size="13">O</text>', 'מעגל ובו רדיוס אל נקודת ההשקה; המשיק מאונך לרדיוס') +
        '<p class="visual-caption">חפשו איזה סוג זווית נוצרת בנקודת המפגש.</p>'; return;
    }
    if (/זווית/.test(step.problem)) {
      const m = step.problem.match(/(\d+)°/), given = m ? Number(m[1]) : 100;
      const central = /היקפית הנשענת/.test(step.problem) ? 2 * given : given;
      const a = central / 2 * Math.PI / 180, cx = 176, cy = 122, r = 88;
      const bx = cx + r * Math.cos(a), by = cy - r * Math.sin(a), dx = bx, dy = cy + r * Math.sin(a), ax = cx - r;
      host.innerHTML = svg('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#84dafa" stroke-width="3"/>' +
        '<path d="M' + cx + ' ' + cy + 'L' + bx + ' ' + by + ' M' + cx + ' ' + cy + 'L' + dx + ' ' + dy + '" stroke="#ffd080" stroke-width="2.5"/>' +
        '<path d="M' + ax + ' ' + cy + 'L' + bx + ' ' + by + ' M' + ax + ' ' + cy + 'L' + dx + ' ' + dy + '" stroke="#acebbd" stroke-width="2.5"/>' +
        '<text x="' + (cx - 5) + '" y="' + (cy + 18) + '" font-size="13" fill="white">O</text><text x="' + (ax - 14) + '" y="' + (cy + 4) + '" font-size="13" fill="white">A</text>', 'זווית מרכזית וקשת, וזווית היקפית הנשענת על אותה קשת') +
        '<p class="visual-caption">הקווים הצהובים יוצרים זווית מרכזית. הקווים הירוקים יוצרים זווית היקפית הנשענת על אותה הקשת.</p>'; return;
    }
    host.innerHTML = svg('<circle cx="180" cy="122" r="85" fill="none" stroke="#84dafa" stroke-width="3"/>' +
      '<line x1="95" y1="122" x2="265" y2="122" stroke="#ffd080" stroke-width="3"/>' +
      '<circle cx="180" cy="122" r="4" fill="white"/><text x="183" y="115" fill="white" font-size="13">O</text>',
      'מעגל עם קוטר העובר דרך המרכז ומורכב משני רדיוסים') +
      '<div class="visual-controls"><label for="visualSlider">רדיוס</label><input id="visualSlider" type="range" min="2" max="8" value="5" step="1"><strong id="visualResult"></strong></div>';
    const update = () => {const r = Number(q(host, '#visualSlider').value);q(host, '#visualResult').textContent = 'רדיוס ' + r + ' · קוטר ' + (2 * r);};
    q(host, '#visualSlider').addEventListener('input', update); update();
  }
  function simpleEquation(host) {
    host.innerHTML=svg('<rect x="49" y="47" width="119" height="93" rx="9" fill="#253d64" stroke="#8bd4fa" stroke-width="2"/>' +
      '<text x="74" y="81" font-size="18" fill="white" direction="ltr">(x+1)/2</text>' +
      '<path d="M180 94H245 m-10 -7 10 7 -10 7" stroke="#ffd38d" fill="none" stroke-width="3"/>' +
      '<text x="189" y="76" fill="#ffd38d" font-size="13">×2</text>' +
      '<rect x="260" y="62" width="72" height="66" rx="8" fill="#28523f" stroke="#90edb4" stroke-width="2"/>' +
      '<text x="270" y="102" font-size="17" fill="white" direction="ltr">x+1</text>',
      'מכפילים את שני אגפי המשוואה בשתיים כדי להסיר מכנה') +
      '<div class="visual-controls"><label for="visualSlider">בדקו x</label><input id="visualSlider" type="range" min="0" max="10" step="1" value="3"><strong id="visualResult" dir="ltr"></strong></div>' +
      '<p class="visual-caption">שומרים על שוויון: כפל ב־2 נעשה בשני האגפים.</p>';
    const update=()=>{const x=Number(q(host,'#visualSlider').value);
      q(host,'#visualResult').textContent='x='+x+'  |  (x+1)/2 = '+format((x+1)/2);};
    q(host,'#visualSlider').addEventListener('input',update);update();
  }
  function fraction(host, step) {
    if(/\(x\+1\)\/2/.test(step.problem)){simpleEquation(host);return;}
    const c = /16/.test(step.problem) ? 4 : 3;
    const numerator = c * c;
    host.innerHTML = svg('<path d="M32 130H334" stroke="#7e95bd" stroke-width="2"/><circle cx="240" cy="130" r="8" fill="#14243e" stroke="#ffbb83" stroke-width="3"/>' +
      '<text x="225" y="165" fill="#ffcf94" font-size="15">x=' + c + '</text>' +
      '<text x="70" y="74" fill="#a9e4fb" font-size="20" direction="ltr">x²−' + numerator + '</text>' +
      '<path d="M50 89H170" stroke="#e3e9ff" stroke-width="2"/>' +
      '<text x="68" y="117" fill="#b6f4b5" font-size="20" direction="ltr">x−' + c + '</text>',
      'שבר אלגברי: הסימן הריק על ציר המספרים מסמן ערך אסור להצבה') +
      '<div class="visual-controls"><label for="visualSlider">בדקו הצבה</label><input id="visualSlider" type="range" min="-2" max="8" step="1" value="1"><strong id="visualResult" dir="ltr"></strong></div>' +
      '<p class="visual-caption">נקודה חלולה מסמנת ערך אסור. צמצום לא מחזיר אותו לתחום.</p>';
    const update = () => {const x=Number(q(host,'#visualSlider').value);
      q(host,'#visualResult').textContent='x='+x+'  |  '+(x===c?'לא מוגדר':format((x*x-numerator)/(x-c)));};
    q(host,'#visualSlider').addEventListener('input',update);update();
  }
  function linearInequality(host, step) {
    const negative=/−2x|-2x/.test(step.problem);
    const boundary=negative?-3:2, fx=x=>negative?-2*x:2*x+3, rhs=negative?6:7;
    const px=x=>180+x*24;
    host.innerHTML=svg('<path d="M27 126H334" stroke="#91a7c9" stroke-width="3"/>' +
      '<circle cx="'+px(boundary)+'" cy="126" r="8" fill="#111f3b" stroke="#ffbf8a" stroke-width="3"/>' +
      '<text x="'+(px(boundary)-10)+'" y="157" font-size="15" fill="#ffbf8a">'+boundary+'</text>' +
      '<circle id="movingDot" cx="180" cy="126" r="7" fill="#adf2c3"/>' +
      '<text x="46" y="48" fill="#dce6f7" font-size="15">נקודת גבול ועבודה על ציר המספרים</text>',
      'ציר מספרים עם מחוון שמאפשר לבדוק אלו ערכים מקיימים אי־שוויון') +
      '<div class="visual-controls"><label for="visualSlider">שנו את x</label><input id="visualSlider" type="range" min="-6" max="6" step="1" value="0"><strong id="visualResult" dir="ltr"></strong></div>' +
      '<p class="visual-caption">בדקו ערכים משני צדי הגבול. בחילוק במספר שלילי כיוון אי־השוויון מתהפך.</p>';
    const update=()=>{const x=Number(q(host,'#visualSlider').value);
      q(host,'#movingDot').setAttribute('cx',px(x));
      q(host,'#visualResult').textContent='x='+x+'  |  '+format(fx(x))+' > '+rhs+'  '+(fx(x)>rhs?'✓':'✗');};
    q(host,'#visualSlider').addEventListener('input',update);update();
  }
  function inequality(host, step) {
    if(/2x\+3|−2x|-2x/.test(step.problem)){linearInequality(host,step);return;}
    const a = /x[−-]3/.test(step.problem) ? 3 : 2;
    const b = /x\+2/.test(step.problem) ? -2 : -1;
    const px = x => 180 + x * 27;
    host.innerHTML = svg('<path d="M20 125H340" stroke="#91a7c9" stroke-width="3"/>' +
      '<path d="m30 119 -10 6 10 6 m300 -12 10 6 -10 6" fill="none" stroke="#91a7c9" stroke-width="2"/>' +
      '<circle cx="'+px(a)+'" cy="125" r="7" fill="#13213c" stroke="#f6bd84" stroke-width="3"/>' +
      '<circle cx="'+px(b)+'" cy="125" r="7" fill="#13213c" stroke="#f6bd84" stroke-width="3"/>' +
      '<text x="'+(px(a)-8)+'" y="155" fill="#f6cfaa" font-size="14">'+a+'</text>' +
      '<text x="'+(px(b)-8)+'" y="155" fill="#f6cfaa" font-size="14">'+b+'</text>' +
      '<circle id="movingDot" cx="180" cy="125" r="6" fill="#a1efd1"/>' +
      '<text x="30" y="39" fill="#d9eaff" font-size="15">הזיזו x ובדקו סימן</text>',
      'ציר מספרים עם נקודות קריטיות ומחוון לחקירת סימן השבר') +
      '<div class="visual-controls"><label for="visualSlider">בחרו x</label><input id="visualSlider" type="range" min="-5" max="5" step=".5" value="0"><strong id="visualResult" dir="ltr"></strong></div>' +
      '<p class="visual-caption">בכל תחום בדקו בנפרד סימן מונה וסימן מכנה, ואז את סימן השבר.</p>';
    const update=()=>{const x=Number(q(host,'#visualSlider').value),den=x-b,num=x-a;
      q(host,'#movingDot').setAttribute('cx',px(x));
      q(host,'#visualResult').textContent='x='+format(x)+'  |  '+(den===0?'לא מוגדר':num===0?'אפס':(num/den>0?'חיובי':'שלילי'));};
    q(host,'#visualSlider').addEventListener('input',update);update();
  }
  window.VizyClassroomVisuals = {mount(host, lesson, step) {
    host.replaceChildren();
    if (lesson.id === 'g9-functions') {
      if (!window.VizySharedGraph?.mount(host, step)) parabola(host, step);
    }
    else if (lesson.id === 'g9-circles') circle(host,step);
    else if (lesson.id === 'g11-fractions') fraction(host,step);
    else if (lesson.id === 'g11-inequality') inequality(host,step);
  }};
})();
