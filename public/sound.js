let audioCtx = null;
let soundEnabled = true;
let lastWarmColdTs = 0;
let introPlayed = false;
const SOUND_PREF_KEY = 'math_visual_sound_enabled_v1';
let backgroundTrackAudio = null;
let backgroundTrackTimer = null;

try {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) audioCtx = new AudioCtor();
} catch (err) {
    audioCtx = null;
}

try {
    const saved = localStorage.getItem(SOUND_PREF_KEY);
    if (saved === '0') soundEnabled = false;
    if (saved === '1') soundEnabled = true;
} catch (err) {
    // Keep defaults if storage is unavailable.
}

function initAudio() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function updateSoundButton() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    if (!audioCtx) {
        btn.innerText = '\uD83D\uDD07';
        btn.title = 'אין תמיכה בסאונד במכשיר/בדפדפן זה';
        return;
    }
    btn.innerText = soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    btn.title = soundEnabled ? 'כבה סאונד' : 'הפעל סאונד';
}

function toggleSound() {
    if (!audioCtx) {
        updateSoundButton();
        return;
    }
    soundEnabled = !soundEnabled;
    try {
        localStorage.setItem(SOUND_PREF_KEY, soundEnabled ? '1' : '0');
    } catch (err) {
        // Keep running if storage fails.
    }
    if (soundEnabled) initAudio();
    else stopBackgroundTrack();
    updateSoundButton();
}

function stopBackgroundTrack(resetPosition = true) {
    if (backgroundTrackTimer) {
        clearTimeout(backgroundTrackTimer);
        backgroundTrackTimer = null;
    }
    if (!backgroundTrackAudio) return;
    try {
        backgroundTrackAudio.pause();
        if (resetPosition) backgroundTrackAudio.currentTime = 0;
    } catch (err) {
        // Ignore cleanup errors from media element.
    }
    backgroundTrackAudio = null;
}

function playTimedBackgroundTrack(src, durationSeconds = 30) {
    if (!soundEnabled || !src) return Promise.resolve(false);
    stopBackgroundTrack(false);

    const audio = new Audio(src);
    backgroundTrackAudio = audio;
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.45;

    const maxSeconds = Math.max(1, Number(durationSeconds) || 30);
    const scheduleStop = () => {
        if (backgroundTrackTimer) clearTimeout(backgroundTrackTimer);
        backgroundTrackTimer = setTimeout(() => {
            if (backgroundTrackAudio !== audio) return;
            stopBackgroundTrack();
        }, Math.round(maxSeconds * 1000));
    };

    let playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
        return playAttempt.then(() => {
            scheduleStop();
            return true;
        }).catch(() => {
            if (backgroundTrackAudio === audio) stopBackgroundTrack();
            return false;
        });
    }

    scheduleStop();
    return Promise.resolve(true);
}

function playSound(type) {
    if (!audioCtx || !soundEnabled) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start();
        osc.stop(now + 0.4);
    } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
    }
}

function playButtonClickSound() {
    playSound('pop');
}

function playIntroTheme() {
    if (!audioCtx || !soundEnabled || introPlayed) return;
    initAudio();
    introPlayed = true;

    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392, 523.25];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const start = now + i * 0.1;
        const stop = start + 0.22;
        osc.type = i % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(0.06, start + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, stop);
        osc.start(start);
        osc.stop(stop);
    });

    const bassOsc = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(audioCtx.destination);
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(130.81, now);
    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.03, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    bassOsc.start(now);
    bassOsc.stop(now + 0.45);
}

function resetWarmColdFeedback() {
    lastWarmColdTs = 0;
}

function playWarmColdFeedback(score, delta) {
    if (!audioCtx || !soundEnabled) return;
    initAudio();

    const nowMs = performance.now();
    const level = Math.max(0, Math.min(1, score));
    const minInterval = 300 - level * 210;
    if (nowMs - lastWarmColdTs < minInterval) return;
    lastWarmColdTs = nowMs;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const t = audioCtx.currentTime;
    const movingCloser = delta >= 0;
    const baseFreq = 180 + level * 980;
    const endFreq = movingCloser ? baseFreq * 1.14 : baseFreq * 0.82;
    const duration = 0.075 + (1 - level) * 0.055;

    osc.type = movingCloser ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(90, endFreq), t + duration * 0.9);

    const peak = 0.025 + level * 0.09;
    gainNode.gain.setValueAtTime(peak, t);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.01);
}

function attachButtonClickSounds() {
    document.addEventListener('click', (event) => {
        if (event.target && event.target.closest('button')) {
            playButtonClickSound();
        }
    });
}

document.addEventListener('DOMContentLoaded', attachButtonClickSounds);
