/* Connect the existing inquiry evidence engine to the optional earned-playtime
   service. This adapter does not change the teaching state or score guesses.
   Keep here until the architect-owned engine publishes its own progress events. */
(function(root) {
  'use strict';
  const lesson = new URLSearchParams(location.search).get('lesson');
  if (!['increasing', 'difference-squares'].includes(lesson)) return;
  const host = document.getElementById('vizyInquiry');
  const source = root.VizyInvestigation;
  if (!host || typeof source?.getState !== 'function') return;

  // Only mathematically checked steps; no credit for initial choices, a
  // speculative prediction, an unconfirmed "depends", or opening a hint.
  const evidence = new Set([
    'contrast', 'shift-act', 'reflect-act', 'point-act', 'compare',
    'phrases', 'build', 'verdict:0', 'verdict:1', 'verdict:2',
    'criterion-end', 'temperature', 'linear',
    'reason', 'partA', 'partB', 'rule', 'return', 'tidy', 'check',
    'transfer:result'
  ]);
  const emitted = new Set();
  let scheduled = false;
  let dispatching = false;
  let nativeProgress = false;
  // Claude's inquiry engine may begin publishing the same contract. Prefer
  // its native events immediately, rather than paying twice via this bridge.
  root.addEventListener('vizy:progress', event => {
    if (!dispatching && event.detail?.lesson === lesson) nativeProgress = true;
  });

  function announce(type, id, helped) {
    const signature = type + ':' + lesson + ':' + id;
    if (emitted.has(signature)) return;
    if (nativeProgress) return;
    emitted.add(signature);
    dispatching = true;
    try {
      root.dispatchEvent(new CustomEvent('vizy:progress', {
        detail: {type, lesson, id, helped: Boolean(helped), source:'integration-bridge'}
      }));
    } finally {
      dispatching = false;
    }
  }

  function sync() {
    scheduled = false;
    if (nativeProgress) return;
    const snapshot = source.getState();
    if (!snapshot || !snapshot.records) return;
    const records = snapshot.records;
    for (const [id, record] of Object.entries(records)) {
      if (!evidence.has(id) || !record?.completed) continue;
      if (id === 'verdict:0' && !(snapshot.data?.examples?.positive && snapshot.data?.examples?.negative)) continue;
      const helped = Boolean(record.helped || record.assisted ||
        (id.startsWith('transfer:') && records.transfer?.helped));
      announce('prompt', id, helped);
    }
    const done = snapshot.route?.[snapshot.index] === 'done';
    const transfer = lesson === 'increasing'
      ? records.temperature?.completed && records.linear?.completed
      : records['transfer:parts']?.completed && records['transfer:result']?.completed;
    if (done && transfer) announce('activity', 'complete', false);
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(sync);
  });
  observer.observe(host, {childList:true, subtree:true});
  sync();
})(window);
