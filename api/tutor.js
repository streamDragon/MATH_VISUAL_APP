const SYSTEM_PROMPT = `אתה מורה מתמטי ידידותי ומעודד לתלמידי תיכון בישראל.
ענה בעברית קצרה וברורה, בלי לפתור מיד את כל השאלה.
עדיף 2-4 משפטים, עם צעד אחד ברור להמשך.
אם התלמיד תקוע, עזור לו לראות מה אפשר לקרוא מהגרף, מה הנתון, ואיזו משוואה זה יוצר.
אל תכתוב תשובות ארוכות, ואל תיתן פתרון מלא אלא אם ממש מבקשים.`;

const GEMINI_MODEL = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

function normalizeMessages(rawMessages) {
    if (!Array.isArray(rawMessages)) return [];
    return rawMessages
        .filter((message) => (
            (message?.role === 'user' || message?.role === 'assistant')
            && typeof message?.content === 'string'
            && message.content.trim()
        ))
        .slice(-10)
        .map((message) => ({
            role: message.role,
            content: message.content.trim()
        }));
}

function buildTranscript(messages) {
    return messages.map((message) => {
        let speaker = message.role === 'assistant' ? 'מורה' : 'תלמיד';
        return `${speaker}: ${message.content}`;
    }).join('\n');
}

function buildLocalTutorReply(messages) {
    let lastUserText = '';
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i].role === 'user') {
            lastUserText = messages[i].content;
            break;
        }
    }

    let text = String(lastUserText || '').toLowerCase();
    if (!text) {
        return 'בואו נתחיל ממה שרואים בגרף: מה נתון, מה צריך למצוא, ואיזה רמז חזותי כבר יש לכם?';
    }

    if (/שיפוע|נגזרת|f'|slope/.test(text)) {
        return 'התמקדו קודם בשאלה אחת: צריך לקרוא שיפוע קיים, או להביא את השיפוע לערך מסוים? גררו את הנקודה ובדקו מה קורה ל־f\'(x). אם מחפשים משיק אופקי, חפשו מקום שבו השיפוע מתקרב ל־0.';
    }

    if (/משיק|tangent/.test(text)) {
        return 'משיק תמיד מתחיל בנקודת מגע על הגרף. קודם מצאו את הנקודה שמתאימה לתנאי, אחר כך קראו את השיפוע שם, ורק אז כתבו את משוואת המשיק.';
    }

    if (/אנך|נורמל|normal/.test(text)) {
        return 'באנך בודקים קודם את שיפוע המשיק. אחרי שיש שיפוע למשיק, לאנך יש שיפוע הופכי ושלילי, ואז בודקים שהוא באמת עובר דרך נקודת המגע.';
    }

    if (/קיצון|מינימום|מקסימום|extrem/.test(text)) {
        return 'בקיצון שווה לבדוק שני דברים: קודם שהשיפוע מתקרב ל־0, ואז שהגרף באמת מחליף כיוון סביב הנקודה. אל תעצרו רק ב־m=0 בלי בדיקה נוספת.';
    }

    if (/פרמטר|a|b|c|d|e|f/.test(text)) {
        return 'לא קופצים ישר לערכי הפרמטרים. רשמו אילו נתונים ניתנים מהגרף או מהטקסט, וכל נתון כזה הופך למשוואה על הפרמטרים. רק אחרי שיש מספיק תנאים פותרים.';
    }

    if (/שורש|חיתוך|ציר x|x-?intercept/.test(text)) {
        return 'שורש הוא מקום שבו הגרף פוגש את ציר ה־x, כלומר y=0. חפשו קודם איפה זה קורה בציור, ואז כתבו את התנאי האלגברי המתאים.';
    }

    if (/לא הבנתי|תקוע|עזרה|help/.test(text)) {
        return 'בואו נפרק את זה לצעד אחד קטן: מה הכי לא ברור עכשיו, הקריאה מהגרף או המעבר למשוואה? התחילו מלכתוב במילים מה רואים על הגרף בנקודה החשובה.';
    }

    return 'נסו לעצור רגע ולנסח את השאלה מחדש במילים שלכם: מה נתון, מה צריך למצוא, ומה אפשר כבר לקרוא מהגרף. משם בוחרים צעד אחד קטן ולא את כל הפתרון בבת אחת.';
}

async function callGemini(messages) {
    if (!GEMINI_API_KEY) return null;

    let prompt = [
        'שיחה עד כה:',
        buildTranscript(messages),
        '',
        'ענה עכשיו רק להודעה האחרונה של התלמיד.'
    ].join('\n');

    let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 350,
                    thinkingConfig: {
                        thinkingBudget: 0
                    }
                }
            })
        }
    );

    if (!response.ok) {
        let errText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    let data = await response.json();
    let reply = (data?.candidates?.[0]?.content?.parts || [])
        .map((part) => String(part?.text || '').trim())
        .filter(Boolean)
        .join(' ')
        .trim();

    return reply || null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let messages = normalizeMessages(req.body?.messages);
    if (messages.length === 0) {
        return res.status(400).json({ error: 'messages חסר או ריק' });
    }

    if (process.env.ANTHROPIC_API_KEY) {
        console.warn('[tutor] ANTHROPIC_API_KEY is still set but no longer used. Remove it to avoid accidental billing.');
    }

    try {
        let reply = await callGemini(messages);
        if (!reply) reply = buildLocalTutorReply(messages);
        return res.status(200).json({
            reply,
            provider: GEMINI_API_KEY ? 'gemini' : 'local'
        });
    } catch (err) {
        console.error('[tutor] Falling back to local tutor:', err);
        return res.status(200).json({
            reply: buildLocalTutorReply(messages),
            provider: 'local'
        });
    }
}
