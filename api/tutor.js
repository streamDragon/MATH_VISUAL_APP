import {
    enforceJsonBodySize,
    enforceRateLimit,
    fetchWithTimeout,
    safeErrorMeta
} from './_lib/cloud_guardrails.js';

const SYSTEM_PROMPT = `אתה מורה מתמטי ידידותי ומעודד לתלמידי תיכון בישראל.
ענה בעברית קצרה וברורה, בלי לפתור מיד את כל השאלה.
העדף 2-4 משפטים, עם צעד אחד ברור להמשך.
אם התלמיד תקוע, עזור לו לראות מה אפשר לקרוא מהגרף, מה הנתון, ואיזו משוואה זה יוצר.
אל תכתוב תשובות ארוכות, ואל תיתן פתרון מלא אלא אם ממש מבקשים.`;

const GEMINI_MODEL = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
const MAX_BODY_BYTES = 24 * 1024;
const PROVIDER_TIMEOUT_MS = 8_000;

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

async function callGemini(messages) {
    let prompt = [
        SYSTEM_PROMPT,
        '',
        'שיחה עד כאן:',
        buildTranscript(messages),
        '',
        'ענה עכשיו רק להודעה האחרונה של התלמיד.'
    ].join('\n');

    let response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 350
                }
            })
        },
        PROVIDER_TIMEOUT_MS
    );

    if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}`);
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

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    if (!enforceRateLimit(req, res, { scope: 'tutor', limit: 18, windowMs: 60_000 })) return;
    if (!enforceJsonBodySize(res, req.body, MAX_BODY_BYTES, 'tutor_payload_too_large')) return;

    let messages = normalizeMessages(req.body?.messages);
    if (messages.length === 0) {
        return res.status(400).json({ error: 'messages_missing' });
    }

    if (process.env.ANTHROPIC_API_KEY) {
        console.warn('[tutor] ANTHROPIC_API_KEY is still set but no longer used. Remove it to avoid accidental billing.');
    }

    if (!GEMINI_API_KEY) {
        return res.status(503).json({
            error: 'cloud_tutor_disabled',
            message: 'Cloud tutor is disabled until GEMINI_API_KEY or GOOGLE_API_KEY is configured.'
        });
    }

    try {
        let reply = await callGemini(messages);
        if (!reply) {
            throw new Error('Gemini returned an empty reply');
        }
        return res.status(200).json({
            reply,
            provider: 'gemini'
        });
    } catch (err) {
        console.warn('[tutor] Gemini request failed:', safeErrorMeta(err));
        return res.status(502).json({
            error: 'cloud_tutor_failed',
            message: 'Cloud tutor is unavailable right now. Switch to Local mode to keep working offline.'
        });
    }
}
