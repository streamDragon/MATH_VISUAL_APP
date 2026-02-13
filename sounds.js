/* sounds.js - מחולל צלילים */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
     
    if (audioCtx.state === 'suspended') {
        audioCtx.resume(); // זה משחרר את החסימה של הדפדפן
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'win') {
        // צליל ניצחון (Arpeggio)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.1); // C#
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.2); // E
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
    } 
    else if (type === 'pop') {
        // צליל פופ עדין (למעבר שאלה)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
}
