(function () {
    const VOICE_STORAGE_KEY = 'math_visual_voice_enabled_v1';
    const DEFAULT_CATALOG_URL = '/coach_feedback_catalog.json';
    const STEP_EVENT_TYPES = ['STEP_ENTER', 'ATTEMPT_CORRECT', 'ATTEMPT_WRONG', 'HINT_REQUESTED', 'STEP_EXIT'];
    const FORCE_REPLACE_EVENTS = new Set(['APP_READY', 'QUESTION_LOADED', 'STEP_ENTER', 'STEP_ADVANCE', 'HINT_REQUESTED', 'RESET']);

    const DEFAULT_CATALOG = {
        meta: { version: '1.0.0', lang: 'he', fallbackPolicy: 'globalThenQuestionThenStep' },
        global: { events: {} },
        questions: {}
    };

    const DEFAULT_EVENT_MESSAGE = {
        APP_READY: 'ברוכים הבאים. מתחילים צעד אחד בכל פעם.',
        QUESTION_LOADED: 'השאלה נטענה. קראו את ההנחיה והתחילו.',
        STEP_ENTER: 'שלב חדש: {stepLabel}.',
        STEP_ADVANCE: 'כל הכבוד, מתקדמים לשלב הבא.',
        ATTEMPT_WRONG: 'נסו לבדוק שוב את הגרף - האם הנקודה במקום הנכון?',
        ATTEMPT_CORRECT: 'יפה מאוד! הצלחתם.',
        HINT_REQUESTED: 'נסו לקרוא שוב את ההוראות בכרטיס המשימה ולהסתכל על הגרף',
        TIMEOUT: 'קחו רגע, הסתכלו על הגרף ונסו שוב',
        RESET: 'בוצע איפוס. מתחילים מחדש.'
    };
    const GENERAL_FALLBACK_MESSAGE = 'הסתכלו על הגרף ועל ההוראות למעלה - מה אתם רואים?';
    const VOICE_RETRY_DELAYS_MS = [1000, 3000, 5000];

    const dom = {};
    const roundRobinState = new Map();
    let voicesListenerAttached = false;
    let catalog = deepClone(DEFAULT_CATALOG);
    let initPromise = null;
    let voiceRetryTimer = null;
    let voiceRetryAttempt = 0;
    let voiceRetryToastShown = false;
    let voiceFeaturesSkippedUntilReload = false;

    const state = {
        initialized: false,
        muted: false,
        voiceEnabled: false,
        ttsSupported: false,
        voicesReady: false,
        questionId: 'q_0',
        questionTitle: '',
        stepId: 's1',
        stepLabel: 'שלב תרגול',
        attemptsCount: 0,
        lastMessageId: '',
        lastText: '',
        lastMessage: null,
        hideTimer: null,
        helpOpen: false,
        helpTextOverride: '',
        helpReasonText: ''
    };

    const callbacks = {
        onHintRequested: null
    };

    function deepClone(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (err) {
            return {};
        }
    }

    function ensureArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function normalizeQuestionId(raw, fallbackIndex) {
        if (raw === 0 || raw) return String(raw);
        const idx = Number(fallbackIndex);
        if (Number.isFinite(idx) && idx >= 0) return `q_${idx}`;
        return 'q_unknown';
    }

    function createDefaultStep(stepId, label) {
        return {
            id: String(stepId || 's1'),
            label: String(label || 'שלב תרגול'),
            events: {
                STEP_ENTER: [],
                ATTEMPT_CORRECT: [],
                ATTEMPT_WRONG: [],
                HINT_REQUESTED: [],
                STEP_EXIT: []
            }
        };
    }

    function ensureCatalogShape(rawCatalog) {
        const nextCatalog = deepClone(rawCatalog || {});
        if (!nextCatalog.meta || typeof nextCatalog.meta !== 'object') nextCatalog.meta = {};
        if (!nextCatalog.global || typeof nextCatalog.global !== 'object') nextCatalog.global = {};
        if (!nextCatalog.global.events || typeof nextCatalog.global.events !== 'object') nextCatalog.global.events = {};
        if (!nextCatalog.questions || typeof nextCatalog.questions !== 'object') nextCatalog.questions = {};
        return nextCatalog;
    }

    function ensureQuestionSkeletons(baseCatalog) {
        const nextCatalog = ensureCatalogShape(baseCatalog);
        const sourceQuestions = Array.isArray(window.QUESTIONS) ? window.QUESTIONS : [];
        sourceQuestions.forEach((question, index) => {
            const qid = normalizeQuestionId(question?.id, index);
            if (!nextCatalog.questions[qid]) {
                nextCatalog.questions[qid] = {
                    title: String(question?.title || `שאלה ${index + 1}`),
                    steps: [createDefaultStep('s1', 'שלב ראשון')]
                };
            }
            const questionEntry = nextCatalog.questions[qid];
            if (!Array.isArray(questionEntry.steps) || questionEntry.steps.length === 0) {
                questionEntry.steps = [createDefaultStep('s1', 'שלב ראשון')];
            }
            questionEntry.steps = questionEntry.steps.map((step, stepIndex) => {
                const normalizedStep = {
                    ...step,
                    id: String(step?.id || `s${stepIndex + 1}`),
                    label: String(step?.label || step?.instruction || `שלב ${stepIndex + 1}`),
                    events: (step && typeof step.events === 'object') ? step.events : {}
                };
                STEP_EVENT_TYPES.forEach((eventType) => {
                    if (!Array.isArray(normalizedStep.events[eventType])) normalizedStep.events[eventType] = [];
                });
                return normalizedStep;
            });
        });
        return nextCatalog;
    }

    function normalizeMessage(rawMessage, eventType, fallbackId) {
        const source = (rawMessage && typeof rawMessage === 'object') ? rawMessage : {};
        const text = String(source.text || DEFAULT_EVENT_MESSAGE[eventType] || GENERAL_FALLBACK_MESSAGE).trim();
        const priority = Number(source.priority);
        return {
            id: String(source.id || fallbackId || `fallback_${eventType}`),
            tone: String(source.tone || (eventType === 'ATTEMPT_WRONG' ? 'error' : 'instruction')),
            priority: Number.isFinite(priority) ? priority : 5,
            sticky: !!source.sticky,
            ttlMs: Number.isFinite(Number(source.ttlMs)) ? Number(source.ttlMs) : null,
            text,
            voiceText: String(source.voiceText || text),
            next: (source.next && typeof source.next === 'object') ? source.next : null,
            ui: {
                variant: String(source?.ui?.variant || 'bubble'),
                icon: String(source?.ui?.icon || '💡'),
                pulse: !!source?.ui?.pulse
            }
        };
    }

    function normalizeMessages(rawMessages, eventType) {
        return ensureArray(rawMessages)
            .map((item, idx) => normalizeMessage(item, eventType, `${eventType.toLowerCase()}_${idx + 1}`));
    }

    function getQuestionScopedMessages(eventType, payload) {
        const questionId = String(payload?.questionId || state.questionId || '');
        const stepId = String(payload?.stepId || state.stepId || '');
        const question = catalog?.questions?.[questionId];
        if (!question) return [];

        const questionMessages = normalizeMessages(question?.events?.[eventType], eventType);
        const steps = Array.isArray(question.steps) ? question.steps : [];
        const scopedStep = steps.find((item) => String(item?.id || '') === stepId) || steps[0];
        const stepMessages = normalizeMessages(scopedStep?.events?.[eventType], eventType);
        if (stepMessages.length > 0) return stepMessages;
        return questionMessages;
    }

    function getGlobalMessages(eventType) {
        return normalizeMessages(catalog?.global?.events?.[eventType], eventType);
    }

    function pickRoundRobin(messages, key) {
        if (messages.length <= 1) return messages[0];
        const index = Number(roundRobinState.get(key) || 0);
        const nextIndex = (index + 1) % messages.length;
        roundRobinState.set(key, nextIndex);
        return messages[index];
    }

    function pickMessage(eventType, payload) {
        const scoped = getQuestionScopedMessages(eventType, payload);
        const candidates = scoped.length > 0 ? scoped : getGlobalMessages(eventType);
        if (candidates.length === 0) {
            const questionLoadedFallback = getGlobalMessages('QUESTION_LOADED');
            if (questionLoadedFallback.length > 0) {
                return normalizeMessage(questionLoadedFallback[0], 'QUESTION_LOADED', 'fallback_question_loaded');
            }
            return normalizeMessage({
                id: `fallback_${eventType}`,
                tone: eventType === 'ATTEMPT_WRONG' ? 'error' : 'instruction',
                priority: 5,
                sticky: false,
                ttlMs: 2600,
                text: DEFAULT_EVENT_MESSAGE[eventType] || GENERAL_FALLBACK_MESSAGE,
                voiceText: DEFAULT_EVENT_MESSAGE[eventType] || GENERAL_FALLBACK_MESSAGE,
                next: null,
                ui: { variant: 'bubble', icon: '💡', pulse: false }
            }, eventType, `fallback_${eventType}`);
        }

        const highestPriority = Math.max(...candidates.map((item) => Number(item.priority) || 0));
        const shortlisted = candidates.filter((item) => (Number(item.priority) || 0) === highestPriority);
        const key = `${payload?.questionId || state.questionId}:${payload?.stepId || state.stepId}:${eventType}:${highestPriority}`;
        return pickRoundRobin(shortlisted, key);
    }

    function compileTemplate(text, payload) {
        const source = String(text || '').trim();
        if (!source) return '';
        return source
            .replace(/\{([a-zA-Z0-9_]+)\}/g, (_, token) => {
                const value = payload?.[token];
                if (value === 0 || value) return String(value);
                return '';
            })
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function clearHideTimer() {
        if (!state.hideTimer) return;
        clearTimeout(state.hideTimer);
        state.hideTimer = null;
    }

    function setHidden(hidden) {
        if (!dom.root) return;
        dom.root.classList.toggle('is-hidden', !!hidden);
    }

    function setTone(tone, variant, pulse) {
        if (!dom.root) return;
        dom.root.classList.remove('tone-instruction', 'tone-praise', 'tone-error', 'tone-hint', 'tone-info', 'variant-bubble', 'variant-toast', 'is-pulse');
        dom.root.classList.add(`tone-${tone || 'instruction'}`);
        dom.root.classList.add(`variant-${variant || 'bubble'}`);
        if (pulse) dom.root.classList.add('is-pulse');
    }

    function setCollapsed(collapsed) {
        if (!dom.root || !dom.minBtn) return;
        dom.root.classList.toggle('is-collapsed', !!collapsed);
        dom.minBtn.innerText = collapsed ? '▢' : '—';
        dom.minBtn.title = collapsed ? 'פתח עזרה' : 'מזער עזרה';
    }

    function hasSpeechApi() {
        return !!(window.speechSynthesis && typeof SpeechSynthesisUtterance === 'function');
    }

    function hasVoices() {
        if (!hasSpeechApi() || typeof window.speechSynthesis.getVoices !== 'function') return false;
        try {
            const voices = window.speechSynthesis.getVoices();
            return Array.isArray(voices) && voices.length > 0;
        } catch (err) {
            return false;
        }
    }

    function clearVoiceRetryTimer() {
        if (!voiceRetryTimer) return;
        clearTimeout(voiceRetryTimer);
        voiceRetryTimer = null;
    }

    function updateVoiceSupportState(options = {}) {
        state.ttsSupported = hasSpeechApi();
        state.voicesReady = !!findHebrewVoice();
        if (!state.ttsSupported || !state.voicesReady || voiceFeaturesSkippedUntilReload) state.voiceEnabled = false;
        if (!state.ttsSupported) {
            clearVoiceRetryTimer();
            voiceRetryAttempt = 0;
            return;
        }
        if (state.voicesReady) {
            clearVoiceRetryTimer();
            voiceRetryAttempt = 0;
            return;
        }
        if (options.allowRetry !== false && !voiceFeaturesSkippedUntilReload) {
            scheduleVoiceSupportRetry();
        }
    }

    function readStoredVoicePreference() {
        try {
            return localStorage.getItem(VOICE_STORAGE_KEY) === '1';
        } catch (err) {
            return false;
        }
    }

    function persistVoicePreference(enabled) {
        try {
            localStorage.setItem(VOICE_STORAGE_KEY, enabled ? '1' : '0');
        } catch (err) {
            // Ignore storage failures.
        }
    }

    function updateVoiceStatus(text) {
        if (!dom.voiceStatus) return;
        const message = String(text || '').trim();
        dom.voiceStatus.innerText = message;
        dom.voiceStatus.classList.toggle('hidden', !message);
    }

    function syncVoiceUi() {
        if (dom.voiceToggle) {
            dom.voiceToggle.checked = !!state.voiceEnabled;
            dom.voiceToggle.disabled = !state.ttsSupported || !state.voicesReady || voiceFeaturesSkippedUntilReload;
        }
        if (dom.voiceLabel) {
            if (voiceFeaturesSkippedUntilReload) dom.voiceLabel.innerText = 'הסבר בקול (בטעינה הבאה)';
            else if (!state.ttsSupported || !state.voicesReady) dom.voiceLabel.innerText = 'הסבר בקול (לא זמין)';
            else dom.voiceLabel.innerText = state.voiceEnabled ? 'הסבר בקול (דולק)' : 'הסבר בקול (כבוי)';
        }
        if (voiceFeaturesSkippedUntilReload) {
            updateVoiceStatus('הקול יהיה זמין בטעינה הבאה');
            return;
        }
        if (!state.ttsSupported || !state.voicesReady) {
            updateVoiceStatus('אין תמיכה בקול בדפדפן הזה');
            return;
        }
        updateVoiceStatus(state.voiceEnabled ? 'הסבר בקול פעיל.' : '');
    }

    function setVoiceEnabled(enabled, options = {}) {
        const persist = options.persist !== false;
        updateVoiceSupportState();
        const next = !!enabled && state.ttsSupported && state.voicesReady && !voiceFeaturesSkippedUntilReload;
        state.voiceEnabled = next;
        if (persist) persistVoicePreference(next);
        syncVoiceUi();
        return state.voiceEnabled;
    }

    function eventOverridesCurrent(eventType) {
        return FORCE_REPLACE_EVENTS.has(String(eventType || ''));
    }

    function shouldReplaceMessage(nextMessage, eventType) {
        if (eventOverridesCurrent(eventType)) return true;
        const current = state.lastMessage;
        if (!current) return true;
        const nextPriority = Number(nextMessage?.priority) || 0;
        const currentPriority = Number(current?.priority) || 0;
        if (nextPriority > currentPriority) return true;
        if (nextPriority === currentPriority) return true;
        return !current.sticky;
    }

    function syncHelpPopover(reasonText) {
        if (!dom.helpPopover) return;
        const helpText = String(state.helpTextOverride || '').trim();
        if (dom.helpText) {
            dom.helpText.innerText = helpText || state.lastText || 'עדיין אין הודעת עזרה. התחילו את המשימה כדי לקבל הכוונה.';
        }
        if (dom.helpReason) {
            const cleanReason = String(reasonText || state.helpReasonText || '').trim();
            dom.helpReason.classList.toggle('hidden', !cleanReason);
            dom.helpReason.innerText = cleanReason;
        }
        syncVoiceUi();
    }

    function setHelpPopoverOpen(open, options = {}) {
        if (!dom.helpPopover) return;
        state.helpOpen = !!open;
        state.helpTextOverride = state.helpOpen ? String(options.helpText || '').trim() : '';
        state.helpReasonText = state.helpOpen ? String(options.cleanModeReason || '').trim() : '';
        dom.helpPopover.classList.toggle('hidden', !state.helpOpen);
        if (state.helpOpen) syncHelpPopover(options.cleanModeReason || state.helpReasonText || '');
    }

    function updateStateFromPayload(payload = {}) {
        if (payload.questionId === 0 || payload.questionId) state.questionId = String(payload.questionId);
        if (payload.questionTitle) state.questionTitle = String(payload.questionTitle);
        if (payload.stepId === 0 || payload.stepId) state.stepId = String(payload.stepId);
        if (payload.stepLabel) state.stepLabel = String(payload.stepLabel);
        if (payload.eventType === 'ATTEMPT_WRONG') state.attemptsCount += 1;
        if (payload.eventType === 'QUESTION_LOADED' || payload.eventType === 'RESET') state.attemptsCount = 0;
    }

    function findHebrewVoice() {
        if (!hasSpeechApi() || typeof window.speechSynthesis.getVoices !== 'function') return null;
        try {
            const voices = window.speechSynthesis.getVoices();
            if (!Array.isArray(voices) || voices.length === 0) return null;
            const hebrew = voices.filter((voice) => String(voice.lang || '').toLowerCase().replace('_', '-').startsWith('he'));
            if (hebrew.length === 0) return null;
            // Prefer neural/online voices (Edge "Natural", Google) over the robotic local SAPI voice.
            const score = (voice) => {
                const name = String(voice.name || '').toLowerCase();
                let s = 0;
                if (name.includes('natural')) s += 4;
                if (name.includes('google')) s += 3;
                if (name.includes('online')) s += 2;
                if (voice.localService === false) s += 1;
                return s;
            };
            hebrew.sort((a, b) => score(b) - score(a));
            return hebrew[0];
        } catch (err) {
            return null;
        }
    }

    function scheduleVoiceSupportRetry() {
        if (voiceRetryTimer || voiceFeaturesSkippedUntilReload) return;
        if (voiceRetryAttempt >= VOICE_RETRY_DELAYS_MS.length) return;
        const delay = VOICE_RETRY_DELAYS_MS[voiceRetryAttempt];
        voiceRetryAttempt += 1;
        voiceRetryTimer = setTimeout(() => {
            voiceRetryTimer = null;
            updateVoiceSupportState({ allowRetry: false });
            syncVoiceUi();
            if (state.voicesReady) return;
            if (voiceRetryAttempt < VOICE_RETRY_DELAYS_MS.length) {
                scheduleVoiceSupportRetry();
                return;
            }
            voiceFeaturesSkippedUntilReload = true;
            state.voiceEnabled = false;
            syncVoiceUi();
            if (!voiceRetryToastShown) {
                voiceRetryToastShown = true;
                if (typeof window.showStepToast === 'function') {
                    window.showStepToast('הקול יהיה זמין בטעינה הבאה');
                }
            }
        }, delay);
    }

    function speakMessage(message, payload) {
        if (!state.voiceEnabled || state.muted || !state.ttsSupported || !state.voicesReady) return;
        const text = compileTemplate(message.voiceText || message.text || '', payload);
        if (!text) return;
        try {
            const synth = window.speechSynthesis;
            if (!synth) return;
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'he-IL';
            const hebrewVoice = findHebrewVoice();
            if (hebrewVoice) utterance.voice = hebrewVoice;
            utterance.rate = 1;
            utterance.pitch = 1;
            synth.speak(utterance);
        } catch (err) {
            // Ignore speech failures.
        }
    }

    function renderMessage(message, payload, options = {}) {
        if (!dom.root || !dom.mainText || !dom.icon) return false;
        const force = !!options.force;
        if (!force && !shouldReplaceMessage(message, payload?.eventType)) return false;

        clearHideTimer();
        const compiledText = compileTemplate(message.text || '', payload) || DEFAULT_EVENT_MESSAGE[payload?.eventType] || 'המשיכו לפי המשימה.';
        const nextStepText = message?.next?.stepId ? `הצעד הבא: ${message.next.stepId}` : '';
        dom.icon.innerText = String(message?.ui?.icon || '💡');
        dom.mainText.innerText = compiledText;
        if (dom.nextText) dom.nextText.innerText = nextStepText;

        state.lastText = compiledText;
        state.lastMessageId = String(message?.id || '');
        state.lastMessage = deepClone(message);

        setTone(message?.tone || 'instruction', message?.ui?.variant || 'bubble', !!message?.ui?.pulse);
        setHidden(false);
        syncHelpPopover('');

        if (!message?.sticky && Number.isFinite(Number(message?.ttlMs)) && Number(message.ttlMs) > 0) {
            state.hideTimer = setTimeout(() => {
                state.hideTimer = null;
                setHidden(true);
            }, Number(message.ttlMs));
        }

        speakMessage(message, payload);
        return true;
    }

    function onHintRequested(source) {
        if (typeof callbacks.onHintRequested !== 'function') return;
        try {
            callbacks.onHintRequested({ source: String(source || 'coach') });
        } catch (err) {
            // Ignore callback errors.
        }
    }

    function repeatLastMessage() {
        if (!state.lastMessage) return;
        renderMessage(state.lastMessage, {
            eventType: 'REPEAT',
            questionId: state.questionId,
            stepId: state.stepId,
            stepLabel: state.stepLabel
        }, { force: true });
    }

    function ensureDom() {
        if (dom.root) return;
        const host = document.getElementById('graph-area-wrapper') || document.body;
        const root = document.createElement('section');
        root.id = 'coach-feedback';
        root.setAttribute('role', 'status');
        root.setAttribute('aria-live', 'polite');
        root.setAttribute('aria-label', 'עזרה בזמן אמת');
        root.innerHTML = [
            '<div class="coach-feedback-head">',
            '  <strong id="coach-feedback-title">עזרה בזמן אמת</strong>',
            '  <button id="coach-feedback-min" type="button" aria-label="מזער">—</button>',
            '</div>',
            '<div class="coach-feedback-body">',
            '  <div id="coach-feedback-line">',
            '    <span id="coach-feedback-icon" aria-hidden="true">💡</span>',
            '    <span id="coach-feedback-text">העזרה מתכוננת...</span>',
            '  </div>',
            '  <div id="coach-feedback-next"></div>',
            '</div>',
            '<div class="coach-feedback-actions">',
            '  <button id="coach-feedback-repeat" type="button">חזור</button>',
            '  <button id="coach-feedback-hint" type="button">רמז</button>',
            '  <button id="coach-feedback-help" type="button">עזרה</button>',
            '</div>',
            '<div id="coach-feedback-help-popover" class="hidden" aria-live="polite">',
            '  <div id="coach-feedback-help-text"></div>',
            '  <div id="coach-feedback-help-reason" class="hidden"></div>',
            '  <div class="coach-feedback-help-actions">',
            '    <button id="coach-feedback-help-repeat" type="button">חזור</button>',
            '    <button id="coach-feedback-help-hint" type="button">רמז</button>',
            '  </div>',
            '  <label class="coach-feedback-voice-toggle">',
            '    <input id="coach-feedback-voice" type="checkbox">',
            '    <span id="coach-feedback-voice-label">הסבר בקול (כבוי)</span>',
            '  </label>',
            '  <div id="coach-feedback-voice-status" class="hidden"></div>',
            '  <div class="coach-feedback-privacy-note">הדיבור מופק בדפדפן. ייתכן שקול מסוים תלוי-רשת—אפשר להשאיר כבוי.</div>',
            '</div>'
        ].join('');
        host.appendChild(root);

        dom.root = root;
        dom.mainText = root.querySelector('#coach-feedback-text');
        dom.nextText = root.querySelector('#coach-feedback-next');
        dom.icon = root.querySelector('#coach-feedback-icon');
        dom.minBtn = root.querySelector('#coach-feedback-min');
        dom.helpPopover = root.querySelector('#coach-feedback-help-popover');
        dom.helpText = root.querySelector('#coach-feedback-help-text');
        dom.helpReason = root.querySelector('#coach-feedback-help-reason');
        dom.voiceToggle = root.querySelector('#coach-feedback-voice');
        dom.voiceLabel = root.querySelector('#coach-feedback-voice-label');
        dom.voiceStatus = root.querySelector('#coach-feedback-voice-status');

        root.querySelector('#coach-feedback-repeat')?.addEventListener('click', repeatLastMessage);

        root.querySelector('#coach-feedback-hint')?.addEventListener('click', () => {
            MVCoach.push('HINT_REQUESTED', { source: 'coach_button' });
            onHintRequested('coach_button');
        });

        root.querySelector('#coach-feedback-help')?.addEventListener('click', () => {
            MVCoach.toggleHelpPopover();
        });

        root.querySelector('#coach-feedback-help-repeat')?.addEventListener('click', repeatLastMessage);

        root.querySelector('#coach-feedback-help-hint')?.addEventListener('click', () => {
            MVCoach.push('HINT_REQUESTED', { source: 'coach_help_popover' });
            onHintRequested('coach_help_popover');
        });

        dom.minBtn?.addEventListener('click', () => {
            setCollapsed(!dom.root.classList.contains('is-collapsed'));
        });

        dom.voiceToggle?.addEventListener('change', (event) => {
            const checked = !!event?.target?.checked;
            const applied = MVCoach.setVoiceEnabled(checked);
            if (!applied && checked) updateVoiceStatus('אין תמיכה בקול בדפדפן הזה');
        });
    }

    async function loadCatalog(url) {
        if (!url) return ensureCatalogShape(DEFAULT_CATALOG);
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const json = await response.json();
            return ensureCatalogShape(json);
        } catch (err) {
            console.warn('Coach catalog load failed, using defaults.', err);
            return ensureCatalogShape(DEFAULT_CATALOG);
        }
    }

    function attachVoicesChangedListener() {
        if (!hasSpeechApi() || voicesListenerAttached) return;
        voicesListenerAttached = true;
        const handleVoicesChanged = () => {
            const wasEnabled = state.voiceEnabled;
            updateVoiceSupportState();
            if (!state.voicesReady || voiceFeaturesSkippedUntilReload) state.voiceEnabled = false;
            else if (wasEnabled || readStoredVoicePreference()) state.voiceEnabled = true;
            syncVoiceUi();
        };

        try {
            if (typeof window.speechSynthesis.addEventListener === 'function') {
                window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
            } else {
                window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
            }
        } catch (err) {
            // Ignore listener failures.
        }
    }

    const MVCoach = {
        async init(options = {}) {
            if (state.initialized) return this;
            if (initPromise) return initPromise;

            initPromise = (async () => {
                callbacks.onHintRequested = (typeof options.onHintRequested === 'function') ? options.onHintRequested : null;
                ensureDom();
                catalog = ensureQuestionSkeletons(await loadCatalog(options.catalogUrl || DEFAULT_CATALOG_URL));
                updateVoiceSupportState();
                attachVoicesChangedListener();
                setVoiceEnabled(readStoredVoicePreference(), { persist: false });

                state.initialized = true;
                renderMessage({
                    id: 'coach_boot',
                    tone: 'info',
                    priority: 6,
                    sticky: false,
                    ttlMs: 2400,
                    text: 'העזרה זמינה. אפשר לבקש רמז בכל רגע.',
                    voiceText: 'העזרה זמינה. אפשר לבקש רמז בכל רגע.',
                    next: null,
                    ui: { variant: 'bubble', icon: '🤖', pulse: false }
                }, {
                    eventType: 'APP_READY',
                    questionId: state.questionId,
                    stepId: state.stepId,
                    stepLabel: state.stepLabel
                }, { force: true });
                return this;
            })();

            return initPromise;
        },

        push(eventType, payload = {}) {
            if (!eventType) return null;
            ensureDom();
            const safePayload = {
                ...payload,
                eventType: String(eventType),
                questionId: (payload.questionId === 0 || payload.questionId) ? String(payload.questionId) : state.questionId,
                stepId: (payload.stepId === 0 || payload.stepId) ? String(payload.stepId) : state.stepId,
                stepLabel: payload.stepLabel || state.stepLabel
            };
            updateStateFromPayload(safePayload);
            const message = pickMessage(String(eventType), safePayload);
            renderMessage(message, safePayload, { force: eventOverridesCurrent(eventType) });
            if (String(eventType) === 'HINT_REQUESTED') onHintRequested(payload.source || 'coach_event');
            return message;
        },

        setContext(context = {}) {
            const nextContext = {
                questionId: (context.questionId === 0 || context.questionId) ? String(context.questionId) : state.questionId,
                questionTitle: String(context.questionTitle || state.questionTitle || ''),
                stepId: (context.stepId === 0 || context.stepId) ? String(context.stepId) : state.stepId,
                stepLabel: String(context.stepLabel || state.stepLabel || 'שלב תרגול')
            };
            updateStateFromPayload(nextContext);
            return this.getState();
        },

        setVoiceEnabled(enabled) {
            return setVoiceEnabled(enabled, { persist: true });
        },

        setMuted(muted) {
            state.muted = !!muted;
        },

        toggleHelpPopover(forceOpen, options = {}) {
            const nextOpen = (typeof forceOpen === 'boolean') ? forceOpen : !state.helpOpen;
            setHelpPopoverOpen(nextOpen, options || {});
        },

        repeatLast() {
            repeatLastMessage();
            return state.lastMessage;
        },

        requestHint(payload = {}) {
            return this.push('HINT_REQUESTED', {
                ...payload,
                source: payload?.source || 'coach_request_hint'
            });
        },

        isHelpPopoverOpen() {
            return !!state.helpOpen;
        },

        getState() {
            return {
                initialized: state.initialized,
                muted: state.muted,
                voiceEnabled: state.voiceEnabled,
                ttsSupported: state.ttsSupported,
                voicesReady: state.voicesReady,
                questionId: state.questionId,
                questionTitle: state.questionTitle,
                stepId: state.stepId,
                stepLabel: state.stepLabel,
                attemptsCount: state.attemptsCount,
                lastMessageId: state.lastMessageId,
                lastText: state.lastText,
                helpOpen: state.helpOpen
            };
        }
    };

    window.MVCoach = MVCoach;
})();
