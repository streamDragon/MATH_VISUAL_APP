# P14: קולות עידוד ותגובות קוליות

---

## שלב 1: ייצור הקולות — תדביק ב-ElevenLabs או ChatGPT Voice

### רשימת הקולות לייצר (15 קליפים, כל אחד 1-3 שניות):

**✅ תשובה נכונה (5 וריאציות — כל פעם אחר):**
1. "כל הכבוד! הבנת את זה!"
2. "יאללה! ככה ממשיכים!"
3. "מדהים, ראית את זה על הגרף?"
4. "בום! תשובה נכונה!"
5. "אלוף! עוד אחת כזאת!"

**❌ תשובה לא נכונה (4 וריאציות — מעודד, לא שיפוטי):**
6. "אחי, מה קרה? תסתכל שוב על הגרף"
7. "קרוב! תנסה שוב, אתה מסוגל"
8. "לא נורא, תזיז את הנקודה ותראה"
9. "עוד קצת... תסתכל איפה השיפוע משתנה"

**🏆 סיום שאלה (3 וריאציות):**
10. "שאלה סגורה! ממשיכים הלאה!"
11. "עוד שאלה מאחוריך! אתה עף!"
12. "סיימת! בוא נראה מה הבא"

**👋 כניסה לאפליקציה (2 וריאציות):**
13. "היי! מה נלמד היום?"
14. "שלום! יאללה בוא נתחיל"

**🔥 Streak (1):**
15. "חמישה ימים ברצף! וואו!"

---

### אפשרות א': ElevenLabs (הכי טוב)

```
1. לך ל-elevenlabs.io → Speech Synthesis
2. בחר קול: "young male" עברי, או "Adam" עם Hebrew
3. הדבק כל משפט → Generate → Download MP3
4. שמור את כל הקבצים ב: public/audio/
   - correct-1.mp3, correct-2.mp3, ... correct-5.mp3
   - wrong-1.mp3, wrong-2.mp3, ... wrong-4.mp3
   - complete-1.mp3, complete-2.mp3, complete-3.mp3
   - welcome-1.mp3, welcome-2.mp3
   - streak-1.mp3
```

### אפשרות ב': ChatGPT Advanced Voice

```
תגיד ל-ChatGPT (במצב Voice):

"אני צריך שתקליט 15 משפטים קצרים בעברית, בטון של בחור ישראלי בן 22, 
אנרגטי ונחמד, כאילו חבר מבוגר שמעודד. כל משפט 1-3 שניות.
תקליט כל אחד בנפרד:"

[ואז תדביק כל משפט]
```

### אפשרות ג': הקלט בעצמך!
30 שניות עם הטלפון. הכי אותנטי.

---

## שלב 2: העתק את הקבצים לפרויקט

```powershell
mkdir C:\Users\nlpis\vscode\MATH_VISUAL_APP\public\audio
# העתק את כל ה-MP3 לשם
```

---

## שלב 3: תדביק לקודקס

```
Read index.html.

Add a voice feedback system that plays short Hebrew audio clips 
at key moments. The audio files are in public/audio/.

### Step 1: Add audio manager

Add this JavaScript (near the gamification code, around line 4023):

/* ===== P14: Voice Feedback System ===== */
var voiceEnabled = true; // user can toggle
var voiceClips = {
  correct: ['correct-1.mp3','correct-2.mp3','correct-3.mp3','correct-4.mp3','correct-5.mp3'],
  wrong: ['wrong-1.mp3','wrong-2.mp3','wrong-3.mp3','wrong-4.mp3'],
  complete: ['complete-1.mp3','complete-2.mp3','complete-3.mp3'],
  welcome: ['welcome-1.mp3','welcome-2.mp3'],
  streak: ['streak-1.mp3']
};
var lastVoiceClip = {};

function playVoice(category) {
  if (!voiceEnabled) return;
  var clips = voiceClips[category];
  if (!clips || clips.length === 0) return;
  
  // Pick random clip, avoid repeating last one
  var idx = Math.floor(Math.random() * clips.length);
  if (clips.length > 1 && lastVoiceClip[category] === idx) {
    idx = (idx + 1) % clips.length;
  }
  lastVoiceClip[category] = idx;
  
  var audio = new Audio('./audio/' + clips[idx]);
  audio.volume = 0.7;
  audio.play().catch(function(e) {
    console.log('Voice play blocked:', e);
  });
}

// Fallback: if audio files don't exist, use Web Speech API
function playVoiceFallback(text) {
  if (!voiceEnabled) return;
  if (!window.speechSynthesis) return;
  var utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'he-IL';
  utter.rate = 1.1;
  utter.volume = 0.8;
  speechSynthesis.speak(utter);
}

// Smart play: try audio file first, fallback to TTS
function playVoiceSmart(category, fallbackText) {
  if (!voiceEnabled) return;
  var clips = voiceClips[category];
  if (!clips || clips.length === 0) {
    playVoiceFallback(fallbackText);
    return;
  }
  
  var idx = Math.floor(Math.random() * clips.length);
  if (clips.length > 1 && lastVoiceClip[category] === idx) {
    idx = (idx + 1) % clips.length;
  }
  lastVoiceClip[category] = idx;
  
  var audio = new Audio('./audio/' + clips[idx]);
  audio.volume = 0.7;
  audio.onerror = function() {
    // File doesn't exist, use TTS fallback
    playVoiceFallback(fallbackText);
  };
  audio.play().catch(function(e) {
    playVoiceFallback(fallbackText);
  });
}


### Step 2: Connect to events

Find these existing event points and ADD playVoiceSmart calls:

1. CORRECT ANSWER (around line ~10084, where showMascotMood('celebrating'...) is):
   Add AFTER the mascotMood call:
   playVoiceSmart('correct', 'כל הכבוד!');

2. WRONG ANSWER (around line ~10114, where showMascotMood('thinking'...) is):
   Add AFTER:
   playVoiceSmart('wrong', 'תנסו שוב, תסתכלו על הגרף');

3. QUESTION COMPLETE (around line ~10588, in goToNextQuestionFromWin):
   Add AFTER:
   playVoiceSmart('complete', 'שאלה סגורה! ממשיכים');

4. APP ENTRY (around line ~7448, where showMascotMood('idle'...) is):
   Add AFTER:
   setTimeout(function() { playVoiceSmart('welcome', 'שלום! מה נלמד היום?'); }, 1000);

5. STREAK milestone (if streak logic exists in P5 gamification):
   When streak reaches 3, 5, 7, 10:
   playVoiceSmart('streak', 'רצף מדהים!');


### Step 3: Add sound toggle button

Add a sound toggle in #top-bar (near the gamification badges):

<button id="btn-voice-toggle" onclick="toggleVoice()" 
  title="הפעל/כבה קולות"
  style="background:none; border:none; font-size:18px; cursor:pointer;
  padding:2px 6px; opacity:0.7;">
  🔊
</button>

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  var btn = document.getElementById('btn-voice-toggle');
  if (btn) btn.textContent = voiceEnabled ? '🔊' : '🔇';
  try { localStorage.setItem('mathviz_voice', voiceEnabled ? '1' : '0'); } catch(e) {}
}

// On load, restore preference
document.addEventListener('DOMContentLoaded', function() {
  try {
    var saved = localStorage.getItem('mathviz_voice');
    if (saved === '0') {
      voiceEnabled = false;
      var btn = document.getElementById('btn-voice-toggle');
      if (btn) btn.textContent = '🔇';
    }
  } catch(e) {}
});


### Step 4: Add CSS for sound button

#btn-voice-toggle {
  transition: transform 0.2s ease;
}
#btn-voice-toggle:active {
  transform: scale(0.9);
}


### IMPORTANT NOTES:
- The system works even WITHOUT audio files (falls back to browser TTS)
- This means you can deploy NOW and add the real audio files later
- Each category picks a RANDOM clip so it doesn't feel repetitive
- User can mute with the toggle button
- On mobile, audio might be blocked until user interacts — 
  that's fine, the first tap on anything enables audio
- Volume is 0.7 (not full blast — students might be in class)
- Keep clips SHORT (1-3 seconds max) — don't interrupt the flow
```

Commit: git commit -m "P14: voice feedback system with fallback TTS"
