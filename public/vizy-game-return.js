/* The glide game is an optional reward. Return to the exact lesson without
   relying on browser Back (which can reopen a stale WebView/splash screen). */
(function() {
  'use strict';
  const from = new URLSearchParams(location.search).get('return');
  let destination = 'learn.html';
  if (from && from.startsWith('/') && !from.startsWith('//')) {
    try {
      const url = new URL(from, location.origin);
      const learningPage = /^\/(learn|problem-map|classroom-practice|skill-lab)\.html$/.test(url.pathname);
      const graphLab = url.pathname === '/' && url.searchParams.get('workspace') === '1';
      if (url.origin === location.origin && (learningPage || graphLab)) {
        destination = url.pathname + url.search + url.hash;
      }
    } catch {
      // Unknown/malformed return targets go to the home page.
    }
  }
  for (const id of ['back', 'exit-game']) {
    const link = document.getElementById(id);
    if (link) link.setAttribute('href', destination);
  }
})();
