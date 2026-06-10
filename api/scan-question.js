import {
    enforceCloudAiBudget,
    enforceImageDataUrlSize,
    enforceJsonBodySize,
    enforceRateLimit,
    fetchWithTimeout,
    safeErrorMeta
} from './_lib/cloud_guardrails.js';

// Canonical prompts live server-side only. The client may still send
// system_prompt / user_prompt / model for self-hosted proxy compatibility,
// but this endpoint ignores them so callers cannot rewrite instructions or
// pick a more expensive model on our API key.
const SCAN_SYSTEM_PROMPT = `You are an expert math educator specializing in visual intuition training for high-school mathematics.
The user will provide an image of a math problem (e.g., polynomials, calculus, analytic geometry, parameter questions).

DO NOT SOLVE THE PROBLEM.
DO NOT provide algebraic derivations, symbolic manipulations, or final answers.
Your task is to produce a visual preparation plan only.

Return ONLY a valid JSON object matching this schema:

{
  "original_topic": "Brief title of the problem type (e.g., 'Function investigation with a parameter')",
  "problem_family": "One normalized family tag, e.g., parameterized_polynomial, tangent_to_function, extrema_analysis, analytic_geometry_intersection, parameter_solution_count",
  "visual_layers_required": [
    {
      "layer_id": "One normalized layer id, e.g., object_identification, coordinate_anchors, shape_drivers, local_geometry, global_behavior, algebra_graph_translation, task_decomposition",
      "layer_title": "Human-readable title",
      "why_this_layer_matters": "Short pedagogical reason",
      "skills": [
        {
          "skill_number": 1,
          "title": "Human-readable visual skill title",
          "pedagogical_reason": "Why the student should visualize this before solving",
          "visual_category": "Normalized visual skill tag (examples below)",
          "difficulty": "basic | intermediate | advanced",
          "prerequisites": ["optional list of visual_category tags"],
          "micro_goal": "What the student should be able to imagine/say after this step",
          "ui_exercise_type": "One of: classification, drag_to_axis, graph_compare, slope_match, parameter_slider, sign_chart_visual, point_placement, case_split_visual"
        }
      ]
    }
  ],
  "action_plan_order": ["ordered list of visual_category tags"],
  "do_not_solve_notice": "This output is a visual preparation plan only. No algebraic solution steps are provided.",
  "confidence": 0.0
}

Allowed layer_id values:
- object_identification
- coordinate_anchors
- shape_drivers
- local_geometry
- global_behavior
- algebra_graph_translation
- task_decomposition

Allowed visual_category examples (use only relevant ones):
- function_object
- parameterized_family
- line_object
- derivative_related_object
- axis_intersection
- domain_constraint
- symmetry_hint
- end_behavior
- parameter_shift
- parameter_scale
- reflection
- translation
- tangent_condition
- slope_at_point
- extreme_point
- inflection_point
- concavity
- monotonicity_sign
- sign_regions
- solution_count_visualization
- parameter_case_split
- asymptote_behavior
- equation_to_intersection
- derivative_to_slope
- parallel_tangent_condition
- double_root_touch
- single_solution_visual
- visual_planning_sequence
- prerequisite_order

Rules:
1) Prefer normalized tags over free-form wording.
2) If the image is not a clear high-school math problem, return a valid JSON with empty layers and a suitable original_topic.
3) Never include a solved answer.
4) Keep pedagogical text concise and actionable.
5) The action_plan_order should reflect prerequisite logic.`;

const SCAN_USER_PROMPT = 'Analyze the attached math problem image and produce a pedagogy-first visual action plan JSON (visual layers + normalized skill tags) following the exact schema. Do not solve the problem.';

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
        clampText(SCAN_SYSTEM_PROMPT),
        clampText(SCAN_USER_PROMPT)
    ].filter(Boolean).join('\n\n');
    let imagePart = parseImageDataUrl(options.imageDataUrl);
    let response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(SCAN_GEMINI_MODEL)}:generateContent`,
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

    if (!enforceCloudAiBudget(res, { scope: 'scan_question' })) return;

    try {
        let vision = await callGeminiVision({ imageDataUrl });
        return res.status(200).json({
            vision,
            provider: 'gemini',
            model: SCAN_GEMINI_MODEL
        });
    } catch (err) {
        console.warn('[scan-question] Gemini vision request failed:', safeErrorMeta(err));
        return res.status(502).json({
            error: 'cloud_scan_failed',
            message: 'Cloud image scan is unavailable right now. You can still paste the problem text and keep working locally.'
        });
    }
}
