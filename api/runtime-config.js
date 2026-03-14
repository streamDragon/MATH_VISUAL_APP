export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let hasGeminiKey = !!String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    let scanProxyOptIn = String(process.env.ENABLE_CLOUD_SCAN_PROXY || '').trim() === '1';
    let scanAvailable = hasGeminiKey && scanProxyOptIn;

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({
        aiModeDefault: 'local',
        cloud: {
            provider: hasGeminiKey ? 'gemini' : '',
            tutorAvailable: hasGeminiKey,
            scanAvailable,
            scanOptInEnabled: scanProxyOptIn
        },
        endpoints: {
            runtimeConfig: '/api/runtime-config',
            tutor: '/api/tutor',
            scanQuestion: '/api/scan-question'
        }
    });
}
