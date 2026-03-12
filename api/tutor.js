// api/tutor.js — Vercel Serverless Function
// מספק endpoint לצ'אט עם המורה הפרטי דרך Claude API.
// משתנה סביבה נדרש: ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `אתה מורה מתמטיקה ידידותי ומעודד לתלמידי תיכון ישראלים הלומדים 4 יחידות מתמטיקה.
אתה מסביר בעברית, בצורה קצרה וברורה, עם דוגמאות פשוטות.
אתה מעודד, סבלני, ולא שופט. אם תלמיד נתקע — אתה שואל שאלה שתעזור לו לחשוב, לא נותן תשובה ישר.
השתמש בסמיילים ובשפה נעימה לנוער. תשובות קצרות — 3-5 משפטים מקסימום.
הקשר: התלמיד עובד עם גרפים של פונקציות, נגזרות, משיקים, פרמטרים, קיצונים.`;

export default async function handler(req, res) {
    // רק POST מותר
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY לא מוגדר בסביבה' });
    }

    // קבלת הודעות מהלקוח
    let messages;
    try {
        messages = req.body?.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages חסר או ריק' });
        }
    } catch (e) {
        return res.status(400).json({ error: 'גוף הבקשה לא תקין' });
    }

    // סינון הודעות — רק user ו-assistant, ללא תוכן ריק
    const cleanMessages = messages
        .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .slice(-10); // עד 10 הודעות אחרונות

    if (cleanMessages.length === 0) {
        return res.status(400).json({ error: 'אין הודעות תקינות' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 350,
                system: SYSTEM_PROMPT,
                messages: cleanMessages
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[tutor] Claude API error:', response.status, errText);
            return res.status(response.status).json({ error: `שגיאת API: ${response.status}` });
        }

        const data = await response.json();
        const reply = data?.content?.[0]?.text || 'מצטער, לא הצלחתי לענות. נסה שוב.';
        return res.status(200).json({ reply });

    } catch (err) {
        console.error('[tutor] fetch error:', err);
        return res.status(500).json({ error: 'שגיאת רשת פנימית' });
    }
}
