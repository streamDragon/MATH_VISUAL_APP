import {
    enforceImageDataUrlSize,
    enforceJsonBodySize,
    enforceRateLimit,
    fetchWithTimeout,
    safeErrorMeta
} from './_lib/cloud_guardrails.js';

const SCAN_GEMINI_MODEL = String(process.env.SCAN_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
const SCAN_PROXY_ENABLED = String(process.env.ENABLE_CLOUD_SCAN_PROXY || '').trim() === '1';
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_PROMPT_CHARS = 12_000;
const PROVIDER_TIMEOUT_MS = 12_000;

function clampText(value, maxChars = MAX_PROMPT_CHARS) {
    return String(value || '').trim().slice(0, Math.max(0, maxChars));
}

function normalizeModel(value) {
    let model = String(value || '').trim();
    if (!model) return SCAN_GEMINI_MODEL;
    if (!/^[A-Za-z0-9._-]{1,80}$/.test(model)) return SCAN_GEMINI_MODEL;
    return model;
}

function parseImageDataUrl(dataUrl) {
    let match = String(dataUrl || '').trim().match(/^data:(image\/[A-Za-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) {
        throw new Error('invalid_image_data_url');
    }
    return {
        mimeType: match[1].toLowerCase(),
        data: match[2].replace(/\s+/g, '')
    };
}

function parseJsonishText(raw) {
    if (raw && typeof raw === 'object') return raw;
    let text = String(raw || '').trim();
    if (!text) {
        throw new Error('empty_provider_response');
    }
    if (text.startsWith('```')) {
        text = text.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '').trim();
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        let start = text.indexOf('{');
        let end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return JSON.parse(text.slice(start, end + 1));
        }
        throw err;
    }
}

function extractGeminiText(data) {
    return (data?.candidates?.[0]?.content?.parts || [])
        .map((part) => String(part?.text || '').trim())
        .filter(Boolean)
        .join('\n')
        .trim();
}

async function callGeminiVision(options = {}) {
    let promptText = [
        clampText(options.systemPrompt),
        clampText(options.userPrompt)
    ].filter(Boolean).join('\n\n');
    let imagePart = parseImageDataUrl(options.imageDataUrl);
    let response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizeModel(options.model))}:generateContent`,
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
                        parts: [
                            { text: promptText || 'Return only a valid JSON object for the attached math problem image.' },
                            {
                                inline_data: {
                                    mime_type: imagePart.mimeType,
                                    data: imagePart.data
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 3000
                }
            })
        },
        PROVIDER_TIMEOUT_MS
    );

    if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}`);
    }

    let data = await response.json();
    let text = extractGeminiText(data);
    if (!text) {
        throw new Error('empty_provider_response');
    }
    return parseJsonishText(text);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    if (!enforceRateLimit(req, res, { scope: 'scan_question', limit: 6, windowMs: 60_000 })) return;
    if (!enforceJsonBodySize(res, req.body, MAX_BODY_BYTES, 'scan_payload_too_large')) return;

    let imageDataUrl = String(req.body?.image_data_url || '').trim();
    if (imageDataUrl && !enforceImageDataUrlSize(res, imageDataUrl, MAX_IMAGE_BYTES)) return;
    if (!imageDataUrl) {
        return res.status(400).json({
            error: 'image_missing',
            message: 'An image_data_url payload is required.'
        });
    }

    if (!SCAN_PROXY_ENABLED) {
        return res.status(503).json({
            error: 'cloud_scan_disabled',
            message: 'Cloud image scan is disabled until ENABLE_CLOUD_SCAN_PROXY=1 is configured.'
        });
    }

    if (!GEMINI_API_KEY) {
        return res.status(503).json({
            error: 'cloud_scan_disabled',
            message: 'Cloud image scan needs GEMINI_API_KEY or GOOGLE_API_KEY before it can run.'
        });
    }

    try {
        let vision = await callGeminiVision({
            model: req.body?.model,
            imageDataUrl,
            systemPrompt: req.body?.system_prompt,
            userPrompt: req.body?.user_prompt
        });
        return res.status(200).json({
            vision,
            provider: 'gemini',
            model: normalizeModel(req.body?.model)
        });
    } catch (err) {
        console.warn('[scan-question] Gemini vision request failed:', safeErrorMeta(err));
        return res.status(502).json({
            error: 'cloud_scan_failed',
            message: 'Cloud image scan is unavailable right now. You can still paste the problem text and keep working locally.'
        });
    }
}
