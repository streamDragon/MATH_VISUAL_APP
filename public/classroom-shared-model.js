/* Reuse the canonical Vizy graph engine inside the classroom flow. */
(function () {
  'use strict';
  function mount(host, step) {
    if (!window.LearningVisuals || !window.LearningCore) return false;
    const match = step.problem.match(/x²\s*[−-]\s*(\d+)/);
    const c = match ? Number(match[1]) : 4;
    const params = { a: 1, h: 0, k: -c, x: 0 };
    const model = document.createElement('div');
    model.className = 'embedded-vizy-model';
    host.replaceChildren(model);
    const note = document.createElement('p');
    note.className = 'visual-caption';
    note.textContent = 'גרף Vizy המקורי: הזיזו את הקודקוד כדי לחקור. השאלה מתייחסת תמיד לפונקציה המקורית.';
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'subtle reset-model';
    reset.textContent = 'חזרה לגרף של השאלה';
    function render() {
      const updateLabel = () => {
        note.textContent = 'קודקוד הניסוי: ('+params.h+', '+params.k+'). השאלה מתייחסת ל־f(x)=x²−'+c+'.';
      };
      window.LearningVisuals.renderVisual(model, {kind:'quadratic'}, params, updateLabel, 'he');
      updateLabel();
    }
    reset.addEventListener('click', () => { params.h=0; render(); });
    host.append(note, reset);
    render();
    return true;
  }
  window.VizySharedGraph = { mount };
})();
