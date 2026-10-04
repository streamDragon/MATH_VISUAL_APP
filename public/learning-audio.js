(function () {
  "use strict";
  let muted = false,
    ctx,
    activeVoice,
    voices = {};
  try {
    muted = localStorage.getItem("vizy_mute") === "1";
  } catch {}
  fetch("learning-voices.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => (voices = m.clips || {}))
    .catch(() => {});
  function setMuted(v) {
    muted = !!v;
    try {
      localStorage.setItem("vizy_mute", muted ? "1" : "0");
    } catch {}
    if (muted) {
      ctx?.suspend();
      activeVoice?.pause();
    } else ctx?.resume();
  }
  function playEffect(name) {
    if (muted) return;
    try {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      const notes =
        name === "success"
          ? [523, 659, 784, 1047]
          : name === "wrong"
            ? [220, 196]
            : [440, 660];
      notes.forEach((hz, i) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain(),
          t = ctx.currentTime + i * 0.1;
        o.type = "sine";
        o.frequency.value = hz;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.18);
      });
    } catch {}
  }
  function playVoice(id) {
    if (muted) return;
    const path = voices[id];
    if (
      typeof path !== "string" ||
      !/^audio\/learning\/[\w/-]+\.(mp3|wav)$/.test(path)
    )
      return;
    activeVoice?.pause();
    const audio = (activeVoice = new Audio(path));
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }
  function celebrate() {
    playEffect("success");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.getElementById("celebration");
    if (!root) return;
    root.replaceChildren();
    for (let i = 0; i < 34; i++) {
      const e = document.createElement("i");
      e.className = "spark";
      e.style.left = "50%";
      e.style.top = "45%";
      e.style.background = ["#d9fa78", "#a394ff", "#ff93c3", "#6fd6ff"][i % 4];
      e.style.setProperty("--dx", `${(Math.random() - 0.5) * 650}px`);
      e.style.setProperty("--dy", `${(Math.random() - 0.3) * 650}px`);
      root.append(e);
    }
    setTimeout(() => root.replaceChildren(), 1500);
  }
  window.LearningAudio = {
    isMuted: () => muted,
    setMuted,
    playEffect,
    playVoice,
    celebrate,
  };
})();
