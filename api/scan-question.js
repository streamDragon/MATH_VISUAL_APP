import {
    enforceImageDataUrlSize,
    enforceJsonBodySize,
    enforceRateLimit
} from './_lib/cloud_guardrails.js';

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!enforceRateLimit(req, res, { scope: 'scan_question', limit: 6, windowMs: 60_000 })) return;
    if (!enforceJsonBodySize(res, req.body, MAX_BODY_BYTES, 'scan_payload_too_large')) return;

    let imageDataUrl = String(req.body?.image_data_url || '').trim();
    if (imageDataUrl && !enforceImageDataUrlSize(res, imageDataUrl, MAX_IMAGE_BYTES)) return;

    return res.status(503).json({
        error: 'cloud_scan_disabled',
        message: 'Cloud image scan is disabled by default until explicitly connected.'
    });
}
