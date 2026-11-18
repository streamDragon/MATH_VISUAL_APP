(function (root) {
  "use strict";
  const KEY = "vizy_sound_v1";
  const LEGACY_KEY = "vizy_mute";
  const forcedOff = new URLSearchParams(root.location.search).get("sound") === "off";
  let enabled = false;
  let unlocked = false;
  let audioContext = null;
  let activeVoice = null;

  try {
    const saved = root.localStorage.getItem(KEY);
    enabled = saved === null ? root.localStorage.getItem(LEGACY_KEY) !== "1" : saved === "on";
  } catch {
    enabled = true;
  }
  if (forcedOff) enabled = false;

  function persist() {
    try {
      root.localStorage.setItem(KEY, enabled ? "on" : "off");
      root.localStorage.setItem(LEGACY_KEY, enabled ? "0" : "1");
    } catch {}
  }
  function context() {
    const Ctx = root.AudioContext || root.webkitAudioContext;
    if (!Ctx) return null;
    audioContext ||= new Ctx();
    return audioContext;
  }
  function tone(frequency, start, duration, volume, wave) {
    const ctx = context();
    if (!ctx || !unlocked || !enabled) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = wave || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.015);
  }
  const patterns = {
    tap: [[520, 0, 0.075, 0.025]],
    right: [[587, 0, 0.11, 0.035], [784, 0.09, 0.12, 0.035]],
    earn: [[659, 0, 0.14, 0.035], [880, 0.12, 0.16, 0.035], [1047, 0.25, 0.18, 0.03]],
    celebrate: [[523, 0, 0.18, 0.035], [659, 0.14, 0.18, 0.035], [784, 0.28, 0.2, 0.035], [1047, 0.43, 0.23, 0.03]]
  };
  function play(name) {
    if (!enabled || !unlocked || name === "wrong" || name === "error") return;
    const pattern = patterns[name];
    if (!pattern) return;
    try {
      const ctx = context();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime + 0.012;
      pattern.forEach(([hz, offset, length, volume]) => tone(hz, now + offset, length, volume));
    } catch {}
  }
  function isInquiry() {
    return /(?:^|\/)problem-map\.html$/.test(root.location.pathname);
  }
  function isMuted() { return !enabled; }
  function setMuted(muted) {
    if (forcedOff && !muted) {
      enabled = false;
      render();
      return;
    }
    enabled = !muted;
    persist();
    if (enabled && audioContext?.state === "suspended") audioContext.resume().catch(() => {});
    if (!enabled) {
      activeVoice?.pause();
      audioContext?.suspend().catch(() => {});
    }
    render();
  }
  function toggle() { setMuted(enabled); return enabled; }
  function playVoice(id) {
    if (!enabled || isInquiry()) return;
    const clips = root.LearningAudio?.voices || {};
    const path = clips[id];
    if (typeof path !== "string" || !/^audio\/learning\/[\w/-]+\.(mp3|wav)$/.test(path)) return;
    activeVoice?.pause();
    const audio = (activeVoice = new Audio(path));
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }
  function celebrate() {
    play("celebrate");
    if (root.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const holder = document.getElementById("celebration");
    if (!holder) return;
    holder.replaceChildren();
    for (let i = 0; i < 28; i++) {
      const spark = document.createElement("i");
      spark.className = "spark";
      spark.style.left = "50%";
      spark.style.top = "45%";
      spark.style.background = ["#d9fa78", "#a394ff", "#ff93c3", "#6fd6ff"][i % 4];
      spark.style.setProperty("--dx", `${(Math.random() - 0.5) * 560}px`);
      spark.style.setProperty("--dy", `${(Math.random() - 0.3) * 560}px`);
      holder.append(spark);
    }
    root.setTimeout(() => holder.replaceChildren(), 1100);
  }
  function label() {
    const en = document.documentElement.lang === "en";
    return enabled ? (en ? "Turn sound off" : "כיבוי צלילים") : (en ? "Turn sound on" : "הפעלת צלילים");
  }
  function render() {
    const slot = document.querySelector('[data-vizy-slot="sound"]');
    if (!slot) return;
    let button = slot.querySelector("button[data-vizy-sound-toggle]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.vizySoundToggle = "";
      button.id = "mute";
      button.className = "vizy-sound-toggle";
      slot.replaceChildren(button);
      button.addEventListener("click", toggle);
    }
    const en = document.documentElement.lang === "en";
    button.setAttribute("aria-label", label());
    button.setAttribute("aria-pressed", String(enabled));
    button.title = label();
    const buttonText = enabled ? (en ? "Sound on" : "צלילים פעילים") : (en ? "Sound off" : "צלילים כבויים");
    if (button.textContent !== buttonText) button.textContent = buttonText;
    button.disabled = forcedOff;
  }
  root.addEventListener("pointerdown", () => {
    unlocked = true;
    const ctx = context();
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  }, { once: true, capture: true });
  root.addEventListener("keydown", () => { unlocked = true; }, { once: true, capture: true });
  root.addEventListener("storage", event => {
    if (event.key !== KEY && event.key !== LEGACY_KEY) return;
    if (event.key === KEY) enabled = event.newValue === "on";
    else enabled = event.newValue !== "1";
    if (forcedOff) enabled = false;
    render();
  });
  new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
  root.addEventListener("DOMContentLoaded", render, { once: true });
  root.addEventListener("vizy:progress", ({ detail }) => {
    if (detail?.type === "activity") play("celebrate");
  });
  root.VizySound = { play, toggle, isEnabled: () => enabled, isForcedOff: () => forcedOff };
  root.LearningAudio = {
    isMuted,
    setMuted,
    playEffect(name) { if (name === "wrong" || name === "error") return; play(name === "success" ? "right" : name); },
    playVoice,
    celebrate,
    voices: {}
  };
  if (!isInquiry()) fetch("learning-voices.json").then(response => response.ok ? response.json() : {}).then(data => {
    root.LearningAudio.voices = data.clips || {};
  }).catch(() => {});
})(window);
