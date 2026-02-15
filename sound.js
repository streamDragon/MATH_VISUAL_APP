const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;
let lastWarmColdTs = 0;

function initAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function updateSoundButton() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.innerText = soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();
}

function playSound(type) {
    if (!soundEnabled) return;
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

function resetWarmColdFeedback() {
    lastWarmColdTs = 0;
}

function playWarmColdFeedback(score, delta) {
    if (!soundEnabled) return;
    initAudio();

    const nowMs = performance.now();
    const minInterval = 170;
    if (nowMs - lastWarmColdTs < minInterval) return;
    lastWarmColdTs = nowMs;

    const level = Math.max(0, Math.min(1, score));
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const t = audioCtx.currentTime;
    const movingCloser = delta >= 0;
    const baseFreq = 220 + level * 760;
    const endFreq = movingCloser ? baseFreq * 1.12 : baseFreq * 0.85;

    osc.type = movingCloser ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(90, endFreq), t + 0.09);

    const peak = 0.03 + level * 0.08;
    gainNode.gain.setValueAtTime(peak, t);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

    osc.start(t);
    osc.stop(t + 0.12);
}

function attachButtonClickSounds() {
    document.addEventListener('click', (event) => {
        if (event.target && event.target.closest('button')) {
            playButtonClickSound();
        }
    });
}

document.addEventListener('DOMContentLoaded', attachButtonClickSounds);
