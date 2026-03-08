(function attachHelpVideoRegistry(global) {
    var cache = null;
    var pending = null;

    function normalizeEntry(raw) {
        if (!raw || typeof raw !== 'object') return null;
        var id = String(raw.id || '').trim();
        if (!id) return null;
        return {
            id: id,
            title: String(raw.title || '').trim(),
            description: String(raw.description || '').trim(),
            src: String(raw.src || '').trim(),
            poster: String(raw.poster || '').trim(),
            durationSec: Number(raw.durationSec) || 0,
            externalUrl: String(raw.externalUrl || '').trim(),
            mimeType: String(raw.mimeType || '').trim(),
            trackSrc: String(raw.trackSrc || '').trim(),
            trackLabel: String(raw.trackLabel || '').trim(),
            trackLang: String(raw.trackLang || '').trim(),
            trackDefault: raw.trackDefault === true
        };
    }

    function normalizeList(items) {
        if (!Array.isArray(items)) return [];
        return items.map(normalizeEntry).filter(Boolean);
    }

    function getCandidates() {
        var query = global.__APP_ASSET_QUERY ? ('?' + global.__APP_ASSET_QUERY) : '';
        return [
            '/help_videos.json',
            '/public/help_videos.json',
            'help_videos.json',
            'public/help_videos.json'
        ].map(function withQuery(path) {
            return path + query;
        });
    }

    async function load() {
        if (Array.isArray(cache)) return cache;
        if (pending) return pending;

        pending = (async function fetchRegistry() {
            if (Array.isArray(global.__HELP_VIDEOS__)) {
                cache = normalizeList(global.__HELP_VIDEOS__);
                return cache;
            }

            var candidates = getCandidates();
            for (var i = 0; i < candidates.length; i += 1) {
                try {
                    var response = await global.fetch(candidates[i], { cache: 'no-store' });
                    if (!response.ok) continue;
                    var data = await response.json();
                    cache = normalizeList(data);
                    return cache;
                } catch (err) {
                    // Try the next candidate path.
                }
            }

            cache = [];
            return cache;
        })();

        pending.finally(function clearPending() {
            pending = null;
        });

        return pending;
    }

    async function getById(id) {
        var targetId = String(id || '').trim();
        if (!targetId) return null;
        var items = await load();
        for (var i = 0; i < items.length; i += 1) {
            if (items[i].id === targetId) return items[i];
        }
        return null;
    }

    global.HelpVideoRegistry = {
        load: load,
        getById: getById,
        invalidate: function invalidate() {
            cache = null;
        }
    };
})(window);
