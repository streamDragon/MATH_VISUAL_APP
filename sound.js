const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

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

function attachButtonClickSounds() {
    document.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', playButtonClickSound);
    });
}

document.addEventListener('DOMContentLoaded', attachButtonClickSounds);
