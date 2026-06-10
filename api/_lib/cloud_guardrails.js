const RATE_LIMIT_STORE = globalThis.__MATH_VISUAL_RATE_LIMIT_STORE__ || new Map();
globalThis.__MATH_VISUAL_RATE_LIMIT_STORE__ = RATE_LIMIT_STORE;

function nowMs() {
    return Date.now();
}

export function redactSecrets(value) {
    let text = String(value || '');
    return text
        .replace(/AIza[0-9A-Za-z_\-]{20,}/g, '[redacted-api-key]')
        .replace(/(key=)[^&\s]+/gi, '$1[redacted]')
        .replace(/(x-goog-api-key["':=\s]+)[^\s,}]+/gi, '$1[redacted]')
        .replace(/(authorization["':=\s]+bearer\s+)[^\s,}]+/gi, '$1[redacted]');
}

export function safeErrorMeta(err) {
    return {
        name: redactSecrets(err?.name || 'Error'),
        message: redactSecrets(err?.message || 'Unknown error')
    };
}

export function getClientAddress(req) {
    let forwarded = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
    let realIp = String(req?.headers?.['x-real-ip'] || '').trim();
    if (realIp) return realIp;
    return 'unknown';
}

export function enforceRateLimit(req, res, options = {}) {
    let scope = String(options.scope || 'global').trim() || 'global';
    let limit = Number.isFinite(options.limit) ? Math.max(1, options.limit) : 20;
    let windowMs = Number.isFinite(options.windowMs) ? Math.max(1000, options.windowMs) : 60_000;
    let retryAfterSec = Math.ceil(windowMs / 1000);
    let key = `${scope}:${getClientAddress(req)}`;
    let current = nowMs();

    let timestamps = RATE_LIMIT_STORE.get(key) || [];
    timestamps = timestamps.filter((ts) => current - ts < windowMs);
    if (timestamps.length >= limit) {
        if (res?.setHeader) {
            res.setHeader('Retry-After', String(retryAfterSec));
            res.setHeader('X-RateLimit-Limit', String(limit));
            res.setHeader('X-RateLimit-Remaining', '0');
        }
        if (res?.status) {
            res.status(429).json({ error: 'rate_limited' });
        }
        RATE_LIMIT_STORE.set(key, timestamps);
        return false;
    }

    timestamps.push(current);
    RATE_LIMIT_STORE.set(key, timestamps);
    if (res?.setHeader) {
        res.setHeader('X-RateLimit-Limit', String(limit));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - timestamps.length)));
    }
    return true;
}

// Emergency kill switch + coarse daily budget for all cloud AI endpoints.
// The daily counter lives in the same in-memory store as the rate limiter,
// so it resets on cold starts — it is a runaway-cost backstop, not an
// accurate quota. Set CLOUD_AI_DISABLED=1 to stop all provider calls.
export function enforceCloudAiBudget(res, options = {}) {
    if (String(process.env.CLOUD_AI_DISABLED || '').trim() === '1') {
        if (res?.status) {
            res.status(503).json({
                error: 'cloud_ai_disabled',
                message: 'Cloud AI features are temporarily disabled.'
            });
        }
        return false;
    }
    let cap = Number.parseInt(String(process.env.CLOUD_AI_DAILY_REQUEST_CAP || '').trim(), 10);
    if (!Number.isFinite(cap) || cap <= 0) return true;
    let scope = String(options.scope || 'global').trim() || 'global';
    let dayKey = `daily:${scope}:${new Date().toISOString().slice(0, 10)}`;
    let count = RATE_LIMIT_STORE.get(dayKey);
    count = Number.isFinite(count) ? count : 0;
    if (count >= cap) {
        if (res?.status) {
            res.status(429).json({
                error: 'cloud_ai_daily_cap',
                message: 'Daily cloud AI budget reached. Try again tomorrow.'
            });
        }
        return false;
    }
    RATE_LIMIT_STORE.set(dayKey, count + 1);
    return true;
}

export function getJsonByteLength(payload) {
    try {
        return Buffer.byteLength(JSON.stringify(payload || {}), 'utf8');
    } catch (err) {
        return Number.POSITIVE_INFINITY;
    }
}

export function enforceJsonBodySize(res, payload, maxBytes, message = 'payload_too_large') {
    let limit = Number.isFinite(maxBytes) ? Math.max(1, maxBytes) : 32_768;
    if (getJsonByteLength(payload) <= limit) return true;
    if (res?.status) {
        res.status(413).json({ error: message });
    }
    return false;
}

export function estimateDataUrlBytes(dataUrl) {
    let text = String(dataUrl || '');
    let idx = text.indexOf(',');
    if (idx < 0) return 0;
    let base64 = text.slice(idx + 1).replace(/\s+/g, '');
    if (!base64) return 0;
    let padding = 0;
    if (base64.endsWith('==')) padding = 2;
    else if (base64.endsWith('=')) padding = 1;
    return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function enforceImageDataUrlSize(res, imageDataUrl, maxBytes) {
    let limit = Number.isFinite(maxBytes) ? Math.max(1, maxBytes) : 4 * 1024 * 1024;
    if (estimateDataUrlBytes(imageDataUrl) <= limit) return true;
    if (res?.status) {
        res.status(413).json({ error: 'image_too_large' });
    }
    return false;
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    let controller = new AbortController();
    let timer = setTimeout(() => controller.abort(new Error('timeout')), Math.max(500, timeoutMs));
    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timer);
    }
}
