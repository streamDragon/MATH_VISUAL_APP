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
