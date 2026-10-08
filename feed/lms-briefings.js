/* Admin-driven briefing engine.
   Authors add a title, one or more source URLs, and category tags.
   Sort, filter, and shuffle stay in this browser.
   Every module carries the 11-format stage (audio by default, mp3 and m4a)
   and, under that stage, Ingest URL, Execution Quiz, Project Essay, and Comment Notes.
   Shuffle and display count control how many modules are on screen.
*/
(function () {
    var STORAGE = 'mhbojt-lms-briefings';
    var RULES = 'mhbojt-lms-briefing-rules';
    var CATEGORIES = ['Dynasty', 'Citadel', 'Guardsmen', 'Diaspora', 'Sovereign wealth', 'Resilient housing', 'RWA', 'General'];
    var FORMATS = [
        ['audio', '1. Audio Overview'],
        ['townhall', '2. Town Hall Multi-Critic'],
        ['video', '3. Video Cinematic'],
        ['slides', '4. Slide Deck'],
        ['mindmap', '5. Mind Map'],
        ['reports', '6. Strategy Reports'],
        ['flashcards', '7. Flashcards'],
        ['quiz', '8. Execution Quiz'],
        ['infographic', '9. Infographic'],
        ['artifact', '10. Artifact Icon'],
        ['ledger', '11. Data Table & Interactive Report']
    ];
    var QUIZ = [
        { prompt: 'What is the MHBOJT sweat-equity conversion rate?', choices: ['$15 / Hr', '$25 / Hr', '$50 / Hr', '$100 / Hr'], answer: '$50 / Hr' },
        { prompt: 'How many verified sweat hours neutralize $10,000,000 at $50 per hour?', choices: ['2,000 Hours', '10,000 Hours', '20,000 Hours', '200,000 Hours'], answer: '200,000 Hours' },
        { prompt: 'What franchise liability must an apprentice neutralize?', choices: ['$100,000', '$1,000,000', '$10,000,000', '$100,000,000'], answer: '$10,000,000' },
        { prompt: 'What does the $100 Stripe reservation do?', choices: ['Neutralizes the $10M liability', 'Credits 2,000 sweat hours', 'Admits a candidate only', 'Pays the mentor pipeline'], answer: 'Admits a candidate only' }
    ];
    var STRIPE = 'https://buy.stripe.com/8x228rcRfa087yu9P4cIE02';
    var state = { media: {}, flash: {} };

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function seedBriefings() {
        return [
            { id: 'dual-host', title: 'Dual-Author Dynasty Overview', sourceUrl: '/drah-dual-host-overview.mp3', sourceUrls: ['/drah-dual-host-overview.mp3', '/drah-dual-host-overview.m4a'], tags: ['Dynasty'], category: 'Dynasty', createdAt: 1, order: 0 },
            { id: 'homes-in-hours', title: 'HOMES IN HOURS?!', sourceUrl: 'https://www.youtube.com/watch?v=wCzS2FZoB-I', sourceUrls: ['https://www.youtube.com/watch?v=wCzS2FZoB-I'], tags: ['Citadel'], category: 'Citadel', createdAt: 2, order: 1 },
            { id: 'st-bernard', title: 'St. Bernard Smart Living Campus', sourceUrl: '/feed/st-bernard/', sourceUrls: ['/feed/st-bernard/'], tags: ['Resilient housing'], category: 'Resilient housing', createdAt: 3, order: 2 },
            { id: 'rwa-ledger', title: 'RWA Tokenization Ledger', sourceUrl: '/feed/sovereign-cases.json', sourceUrls: ['/feed/sovereign-cases.json'], tags: ['RWA', 'Sovereign wealth'], category: 'RWA', createdAt: 4, order: 3 }
        ];
    }

    function loadBriefings() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
            if (Array.isArray(saved) && saved.length) return saved;
        } catch (err) { /* use seed */ }
        return seedBriefings();
    }

    function saveBriefings(items) {
        localStorage.setItem(STORAGE, JSON.stringify(items));
    }

    function loadRules() {
        var rules = { sort: 'manual', category: 'all', query: '', displayCount: 'all' };
        try {
            var saved = JSON.parse(localStorage.getItem(RULES) || '{}');
            if (saved && typeof saved === 'object') {
                if (saved.sort) rules.sort = saved.sort;
                if (saved.category) rules.category = saved.category;
                if (typeof saved.query === 'string') rules.query = saved.query;
                if (saved.displayCount) rules.displayCount = String(saved.displayCount);
            }
        } catch (err) { /* defaults */ }
        return rules;
    }

    function saveRules(rules) {
        localStorage.setItem(RULES, JSON.stringify(rules));
    }

    function byId(id) {
        var items = loadBriefings();
        for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
        return null;
    }

    function tagsOf(item) {
        if (item && Array.isArray(item.tags) && item.tags.length) {
            return item.tags.filter(function (tag) { return String(tag || '').trim(); });
        }
        return item && item.category ? [item.category] : [];
    }

    function sourcesOf(item) {
        if (item && Array.isArray(item.sourceUrls) && item.sourceUrls.length) {
            return item.sourceUrls.filter(function (url) { return String(url || '').trim(); });
        }
        return item && item.sourceUrl ? [item.sourceUrl] : [];
    }

    function safeUrl(url) {
        var value = String(url || '').trim();
        if (/^https?:\/\//i.test(value) || /^\//.test(value)) return value;
        return '';
    }

    function parseUrls(text) {
        var seen = [];
        String(text || '').split(/\n+/).forEach(function (line) {
            var url = safeUrl(line);
            if (url && seen.indexOf(url) === -1) seen.push(url);
        });
        return seen;
    }

    function parseTags(node) {
        var tags = [];
        node.querySelectorAll('[data-field="tag"]:checked').forEach(function (box) {
            if (tags.indexOf(box.value) === -1) tags.push(box.value);
        });
        String((node.querySelector('[data-field="custom-tags"]') || {}).value || '').split(',').forEach(function (part) {
            var tag = part.trim();
            if (tag && tags.indexOf(tag) === -1) tags.push(tag);
        });
        return tags;
    }

    function knownTags(items) {
        var tags = CATEGORIES.slice();
        items.forEach(function (item) {
            tagsOf(item).forEach(function (tag) {
                if (tags.indexOf(tag) === -1) tags.push(tag);
            });
        });
        return tags;
    }

    function youtubeId(url) {
        var match = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
        return match ? match[1] : '';
    }

    function isAudio(url) {
        return /\.(mp3|m4a)(\?|#|$)/i.test(url || '');
    }

    function isVideoFile(url) {
        return /\.(mp4|webm)(\?|#|$)/i.test(url || '');
    }

    function firstUrl(urls, test) {
        for (var i = 0; i < urls.length; i++) if (test(urls[i])) return urls[i];
        return '';
    }

    function audioMarkup(urls, caption) {
        var list = [];
        urls.forEach(function (url) {
            if (isAudio(url) && list.indexOf(url) === -1) list.push(url);
        });
        var fallback = !list.length;
        if (fallback) {
            list = ['/drah-dual-host-overview.mp3', '/drah-dual-host-overview.m4a'];
        } else {
            var extra = [];
            list.forEach(function (url) {
                var sibling = '';
                if (/\.mp3(\?|#|$)/i.test(url)) sibling = url.replace(/\.mp3(\?|#|$)/i, '.m4a$1');
                else if (/\.m4a(\?|#|$)/i.test(url)) sibling = url.replace(/\.m4a(\?|#|$)/i, '.mp3$1');
                if (sibling && list.indexOf(sibling) === -1 && extra.indexOf(sibling) === -1) extra.push(sibling);
            });
            list = list.concat(extra);
        }
        var sources = list.map(function (url) {
            var type = /\.m4a(\?|#|$)/i.test(url) ? 'audio/mp4' : 'audio/mpeg';
            return '<source src="' + esc(url) + '" type="' + type + '">';
        }).join('');
        var kinds = [];
        if (list.some(function (url) { return /\.mp3(\?|#|$)/i.test(url); })) kinds.push('.mp3');
        if (list.some(function (url) { return /\.m4a(\?|#|$)/i.test(url); })) kinds.push('.m4a');
        var note = fallback ? ' This module has no audio file yet, so the dual-author overview plays.' : '';
        return '<p class="text-xs text-slate-300 text-left">' + esc(caption) + esc(note) + '</p>' +
            '<audio controls class="w-full accent-amber-400 py-2" preload="metadata">' + sources + '</audio>' +
            '<div class="text-[10px] font-mono text-slate-500">' + kinds.join(' / ') + '</div>';
    }

    function mermaidLabel(value) {
        return String(value || 'Module').replace(/["[\]{}#;]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 72) || 'Module';
    }

    function mediumOf(id) {
        return state.media[id] || 'audio';
    }

    function flashOf(id) {
        if (!state.flash[id]) state.flash[id] = { index: 0, face: 'front' };
        return state.flash[id];
    }

    function visibleBriefings(items, rules) {
        var query = (rules.query || '').trim().toLowerCase();
        var list = items.filter(function (item) {
            var tags = tagsOf(item);
            if (rules.category !== 'all' && tags.indexOf(rules.category) === -1 && item.category !== rules.category) return false;
            if (!query) return true;
            return (item.title + ' ' + tags.join(' ') + ' ' + sourcesOf(item).join(' ')).toLowerCase().indexOf(query) !== -1;
        });
        list.sort(function (a, b) {
            if (rules.sort === 'title') return a.title.localeCompare(b.title);
            if (rules.sort === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
            return (a.order || 0) - (b.order || 0);
        });
        return list;
    }

    function stageHtml(item, format) {
        var title = item.title;
        var tags = tagsOf(item);
        var urls = sourcesOf(item).map(safeUrl).filter(Boolean);
        var tagLine = tags.join(' · ') || 'General';
        if (format === 'audio') return audioMarkup(urls, title + ' — audio overview for ' + tagLine + '.');
        if (format === 'townhall') {
            return '<div class="space-y-3 text-left">' +
                '<div class="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs"><strong class="text-amber-400">Critic A (Financial Underwriter):</strong> How does "' + esc(title) + '" hold a lender cushion before the unit is occupied? The $100 reservation admits a candidate. It does not clear $10,000,000.</div>' +
                '<div class="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs"><strong class="text-emerald-400">Critic B (Community Leader):</strong> ' + esc(tagLine) + ' demand has to be counseled in before this source is treated as supply. Sweat equity stays $50 per verified hour.</div>' +
                '<div class="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs"><strong class="text-sky-400">Critic C (Trust Steward):</strong> 200,000 verified hours neutralize the apprentice liability. Speculation is not a credit.</div>' +
                audioMarkup(urls, 'Town hall bed for ' + title + '.') +
                '</div>';
        }
        if (format === 'video') {
            var page = firstUrl(urls, youtubeId);
            var file = firstUrl(urls, isVideoFile);
            if (page) {
                return '<p class="text-xs text-slate-300 text-left">' + esc(title) + '</p><div class="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800"><iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/' + esc(youtubeId(page)) + '" title="' + esc(title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
            }
            if (file) return '<video controls class="w-full rounded-xl border border-slate-800" src="' + esc(file) + '"></video>';
            return audioMarkup(urls, title + ' has no video file. The audio overview plays instead.');
        }
        if (format === 'slides') {
            return '<div class="space-y-3 text-xs text-left">' +
                '<div><div class="text-amber-400 font-bold">Slide 1 · ' + esc(title) + '</div><p class="text-slate-300 mt-1">Tags: ' + esc(tagLine) + '.</p></div>' +
                '<div><div class="text-amber-400 font-bold">Slide 2 · Sources</div><p class="text-slate-300 mt-1 break-all">' + esc(urls.join(' · ') || 'No source URL yet.') + '</p></div>' +
                '<div><div class="text-amber-400 font-bold">Slide 3 · Ledger</div><p class="text-slate-300 mt-1">Sweat $50 / Hr · 200,000 Hours · Mentor $1,000,000 · Sponsor $100,000 · Referral $50,000. The $100 reservation admits a candidate.</p></div></div>';
        }
        if (format === 'mindmap') {
            var lines = ['graph TD', 'A["' + mermaidLabel(title) + '"] --> B["' + mermaidLabel(tagLine) + '"]'];
            urls.slice(0, 4).forEach(function (url, index) {
                lines.push('A --> S' + index + '["' + mermaidLabel(url) + '"]');
            });
            lines.push('B --> L["Crystal Dynasty Ledger"]');
            return '<div class="overflow-x-auto"><pre class="mermaid">' + lines.join('\n') + '</pre></div>';
        }
        if (format === 'reports') {
            return '<span class="text-amber-400 font-bold block text-xs text-left">Strategy report · ' + esc(title) + '</span>' +
                '<p class="text-xs text-slate-300 text-left">Tags: ' + esc(tagLine) + '. Credits still require a verified hour, mentee, sponsor, or converted referral. Source URLs are evidence. The $100 reservation admits a candidate and does not neutralize $10,000,000.</p>';
        }
        if (format === 'ledger') {
            var rows = '<tr><td class="py-1 pr-3 text-amber-400">Title</td><td>' + esc(title) + '</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Tags</td><td>' + esc(tagLine) + '</td></tr>';
            urls.forEach(function (url, index) {
                rows += '<tr><td class="py-1 pr-3 text-amber-400">Source ' + (index + 1) + '</td><td class="break-all">' + esc(url) + '</td></tr>';
            });
            rows += '<tr><td class="py-1 pr-3 text-amber-400">Sweat</td><td>$50 / Hr · 200,000 Hours</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Liability</td><td>$10,000,000</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Mentor / Sponsor / Referral</td><td>$1,000,000 / $100,000 / $50,000</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Gateway</td><td>$100 admission</td></tr>';
            var sourceLinks = urls.map(function (url) {
                return '<a class="hover:text-amber-300 break-all" href="' + esc(url) + '">' + esc(url) + '</a>';
            }).join(' · ');
            return '<div class="space-y-4 text-xs text-left">' +
                '<table class="w-full text-left"><tbody class="text-slate-300">' + rows + '</tbody></table>' +
                '<div class="border-t border-slate-800 pt-3 space-y-2 text-slate-300">' +
                '<div class="text-white font-bold">Interactive report · ' + esc(title) + '</div>' +
                '<p>Tags: ' + esc(tagLine) + '.</p>' +
                '<p class="break-all">Sources: ' + (sourceLinks || 'None yet.') + '</p>' +
                '<p>Sweat equity is $50 / Hr. 200,000 verified hours neutralize the $10,000,000 apprentice liability. The $100 reservation only admits a candidate.</p>' +
                '<div class="flex flex-wrap gap-3 text-amber-400">' +
                '<button type="button" data-lms-action="set-medium" data-medium="townhall" class="hover:text-amber-300">Open town hall</button>' +
                '<button type="button" data-lms-action="set-medium" data-medium="mindmap" class="hover:text-amber-300">Open mind map</button>' +
                '<button type="button" data-lms-action="set-medium" data-medium="quiz" class="hover:text-amber-300">Open quiz</button>' +
                '<a class="hover:text-amber-300" href="/drah_crystal_dynasty1.html">Dynasty engine</a>' +
                '<a class="hover:text-amber-300" href="' + STRIPE + '" target="_blank" rel="noopener noreferrer">$100 reservation</a></div></div></div>';
        }
        if (format === 'flashcards') {
            var cards = [
                { front: title, back: tagLine + '. Sources stay attached to this module.' },
                { front: 'Gateway', back: 'The $100 reservation admits a candidate. It does not neutralize $10,000,000.' },
                { front: 'Sweat', back: '$50 per verified hour. 200,000 hours neutralize the apprentice liability.' }
            ];
            var flash = flashOf(item.id);
            if (flash.index >= cards.length) flash.index = 0;
            var card = cards[flash.index];
            var face = flash.face === 'back' ? card.back : card.front;
            return '<button type="button" data-lms-action="flip" class="w-full text-left bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[7rem]"><div class="text-[10px] text-amber-400 uppercase tracking-widest">' + (flash.face === 'back' ? 'Back' : 'Front') + ' · tap to flip</div><div class="text-sm text-white mt-2">' + esc(face) + '</div></button>' +
                '<div class="flex justify-between text-[11px]"><button type="button" data-lms-action="flash-prev" class="text-amber-400">Prev</button><span class="text-slate-400">' + (flash.index + 1) + ' / ' + cards.length + '</span><button type="button" data-lms-action="flash-next" class="text-amber-400">Next</button></div>';
        }
        if (format === 'quiz') return quizBlock(item.id, 'stage');
        if (format === 'infographic') {
            return '<div class="space-y-2 text-xs text-left">' +
                '<div class="bg-amber-500/15 border border-amber-500/40 rounded-lg px-3 py-2"><span class="text-amber-400 font-bold">01</span> ' + esc(title) + '</div>' +
                '<div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2"><span class="text-emerald-400 font-bold">02</span> ' + esc(tagLine) + '</div>' +
                '<div class="bg-sky-500/10 border border-sky-500/30 rounded-lg px-3 py-2"><span class="text-sky-400 font-bold">03</span> Ingest · Quiz · Essay · Notes</div></div>';
        }
        var tiles = [];
        urls.forEach(function (url) {
            var icon = isAudio(url) ? (/\.m4a(\?|#|$)/i.test(url) ? '🎵' : '🎙️') : (youtubeId(url) ? '🎬' : '🔗');
            var label = isAudio(url) ? (/\.m4a(\?|#|$)/i.test(url) ? 'Audio .m4a' : 'Audio .mp3') : (youtubeId(url) ? 'Video source' : 'Source');
            tiles.push(iconTile(url, icon, label, /^https?:/i.test(url)));
        });
        if (!firstUrl(urls, function (url) { return /\.mp3(\?|#|$)/i.test(url); })) tiles.push(iconTile('/drah-dual-host-overview.mp3', '🎙️', 'Overview .mp3', false));
        if (!firstUrl(urls, function (url) { return /\.m4a(\?|#|$)/i.test(url); })) tiles.push(iconTile('/drah-dual-host-overview.m4a', '🎵', 'Overview .m4a', false));
        tiles.push(iconTile('/drah_crystal_dynasty1.html', '💎', 'Dynasty engine', false));
        tiles.push(iconTile('/feed/', '📚', 'Feed', false));
        tiles.push(iconTile(STRIPE, '🛡️', '$100 reservation', true));
        return '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">' + tiles.join('') + '</div>';
    }

    function iconTile(href, icon, label, external) {
        var attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return '<a class="flex flex-col items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:border-amber-500/40" href="' + esc(href) + '"' + attrs + '><span class="text-2xl" aria-hidden="true">' + icon + '</span><span class="text-[11px] text-amber-300">' + esc(label) + '</span></a>';
    }

    function quizBlock(id, scope) {
        return QUIZ.map(function (item, i) {
            var choices = item.choices.map(function (choice) {
                return '<label class="flex items-start gap-2 text-[11px] text-slate-300"><input type="radio" name="lms-' + esc(id) + '-' + scope + '-' + i + '" value="' + esc(choice) + '" class="accent-amber-400 mt-0.5"><span>' + esc(choice) + '</span></label>';
            }).join('');
            return '<fieldset class="space-y-1"><legend class="text-xs text-white font-semibold mb-1">' + (i + 1) + '. ' + esc(item.prompt) + '</legend>' + choices + '</fieldset>';
        }).join('') + '<button type="button" data-lms-action="grade" data-quiz-scope="' + scope + '" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">Submit answers</button><p data-quiz-result="' + scope + '" class="text-[11px] text-slate-300"></p>';
    }

    function notesOf(id) {
        try { return JSON.parse(localStorage.getItem('mhbojt-lms-notes-' + id) || '[]'); }
        catch (err) { return []; }
    }

    function essayOf(id) {
        return localStorage.getItem('mhbojt-lms-essay-' + id) || '';
    }

    function noteListHtml(id) {
        var notes = notesOf(id).map(function (note) {
            return '<li class="border border-slate-800 rounded-lg p-2"><div class="text-[10px] text-slate-500">' + esc(note.at) + '</div><div>' + esc(note.text) + '</div></li>';
        }).join('');
        return notes || '<li class="text-slate-500">No notes for this module yet.</li>';
    }

    function validationHtml(item) {
        var urls = sourcesOf(item);
        var extra = urls.slice(1).map(function (url) {
            return '<li class="break-all"><a class="text-amber-400 hover:text-amber-300" href="' + esc(safeUrl(url)) + '">' + esc(url) + '</a></li>';
        }).join('');
        return '<div class="grid grid-cols-1 gap-4 border-t border-slate-800 pt-4">' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">' +
            '<div class="text-xs font-bold text-amber-400">Ingest URL</div>' +
            '<div class="flex flex-col sm:flex-row gap-2">' +
            '<input data-field="ingest" type="url" value="' + esc(urls[0] || '') + '" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400" placeholder="https://… or /path/audio.mp3">' +
            '<button type="button" data-lms-action="ingest" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">Ingest</button></div>' +
            (extra ? '<ul class="text-[11px] space-y-1">' + extra + '</ul>' : '') + '</div>' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3" data-testid="section-execution-quiz">' +
            '<div class="text-xs font-bold text-amber-400">Execution Quiz</div>' + quizBlock(item.id, 'suite') + '</div>' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2" data-testid="section-project-essay">' +
            '<div class="text-xs font-bold text-amber-400">Project Essay</div>' +
            '<p class="text-[11px] text-slate-400">Apply "' + esc(item.title) + '" to a Selfless Leader or Nation Builder. Tags: ' + esc(tagsOf(item).join(', ') || 'General') + '.</p>' +
            '<textarea data-field="essay" rows="4" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Write your response…">' + esc(essayOf(item.id)) + '</textarea>' +
            '<button type="button" data-lms-action="save-essay" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-2 rounded text-xs">Save essay</button>' +
            '<p data-essay-status class="text-[11px] text-slate-500"></p></div>' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">' +
            '<div class="text-xs font-bold text-amber-400">Comment Notes</div>' +
            '<textarea data-field="note" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Field note for this module"></textarea>' +
            '<button type="button" data-lms-action="save-note" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-2 rounded text-xs">Save note</button>' +
            '<ul data-note-list class="space-y-2 text-[11px] text-slate-300">' + noteListHtml(item.id) + '</ul></div></div>';
    }

    function moduleHtml(item) {
        var format = mediumOf(item.id);
        var options = FORMATS.map(function (pair) {
            return '<option value="' + pair[0] + '"' + (pair[0] === format ? ' selected' : '') + '>' + pair[1] + '</option>';
        }).join('');
        var chips = tagsOf(item).map(function (tag) {
            return '<span class="text-[10px] uppercase tracking-wide text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">' + esc(tag) + '</span>';
        }).join('');
        return '<article id="module-' + esc(item.id) + '" data-module-id="' + esc(item.id) + '" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">' +
            '<div class="flex items-start justify-between gap-3">' +
            '<div class="min-w-0"><h2 class="text-sm font-bold text-white">' + esc(item.title) + '</h2><div class="flex flex-wrap gap-1 mt-2">' + chips + '</div></div>' +
            '<div class="flex items-center gap-1 shrink-0">' +
            '<button type="button" data-lms-action="up" data-id="' + esc(item.id) + '" class="text-[10px] text-amber-400 px-1" aria-label="Move up">↑</button>' +
            '<button type="button" data-lms-action="down" data-id="' + esc(item.id) + '" class="text-[10px] text-amber-400 px-1" aria-label="Move down">↓</button>' +
            '<button type="button" data-lms-action="remove" data-id="' + esc(item.id) + '" class="text-[10px] text-slate-500 hover:text-amber-400 px-1">Remove</button></div></div>' +
            '<label class="text-[11px] text-slate-300 block">Presentation medium</label>' +
            '<select data-lms-action="medium" aria-label="Presentation medium for ' + esc(item.title) + '" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400">' + options + '</select>' +
            '<div data-stage class="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">' + stageHtml(item, format) + '</div>' +
            validationHtml(item) + '</article>';
    }

    function renderNode(node) {
        var items = loadBriefings();
        var rules = loadRules();
        var matched = visibleBriefings(items, rules);
        var displayLimit = parseInt(rules.displayCount, 10);
        var shown = displayLimit > 0 ? matched.slice(0, displayLimit) : matched;
        var tags = knownTags(items);
        var categoryOptions = '<option value="all">All tags</option>' + tags.map(function (tag) {
            return '<option value="' + esc(tag) + '"' + (rules.category === tag ? ' selected' : '') + '>' + esc(tag) + '</option>';
        }).join('');
        var tagBoxes = CATEGORIES.map(function (tag) {
            var checked = tag === 'General' ? ' checked' : '';
            return '<label class="inline-flex items-center gap-1 text-[11px] text-slate-300 mr-3 mb-1"><input type="checkbox" data-field="tag" value="' + esc(tag) + '"' + checked + ' class="accent-amber-400"><span>' + esc(tag) + '</span></label>';
        }).join('');
        var modules = shown.map(moduleHtml).join('');
        node.innerHTML = '<div class="space-y-6">' +
            '<section id="briefing-admin" class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
            '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">' +
            '<h2 class="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin · Add Briefing</h2>' +
            '<label class="text-[10px] uppercase text-slate-400 block" for="bf-title">Title</label>' +
            '<input id="bf-title" data-field="title" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Briefing title">' +
            '<label class="text-[10px] uppercase text-slate-400 block" for="bf-urls">Source URLs</label>' +
            '<textarea id="bf-urls" data-field="urls" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400" placeholder="One URL per line&#10;/drah-dual-host-overview.mp3&#10;https://www.youtube.com/watch?v=…"></textarea>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Category tags</label>' +
            '<div>' + tagBoxes + '</div>' +
            '<input data-field="custom-tags" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Additional tags, comma separated">' +
            '<button type="button" data-lms-action="add" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">+ Add Briefing</button>' +
            '<p data-admin-status class="text-[11px] text-slate-500"></p></div>' +
            '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">' +
            '<div class="flex items-center justify-between gap-2"><h3 class="text-xs font-bold text-slate-200 uppercase tracking-widest">Shuffle and display</h3>' +
            '<button type="button" data-lms-action="shuffle" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]"' + (items.length < 2 ? ' disabled' : '') + '>Shuffle order</button></div>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Sort</label>' +
            '<select data-field="sort" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white">' +
            '<option value="manual"' + (rules.sort === 'manual' ? ' selected' : '') + '>Manual order</option>' +
            '<option value="title"' + (rules.sort === 'title' ? ' selected' : '') + '>Title A–Z</option>' +
            '<option value="newest"' + (rules.sort === 'newest' ? ' selected' : '') + '>Newest first</option></select>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Filter tag</label>' +
            '<select data-field="filter-category" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white">' + categoryOptions + '</select>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Filter text</label>' +
            '<input data-field="filter-query" value="' + esc(rules.query) + '" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Title, tag, or URL">' +
            '<label class="text-[10px] uppercase text-slate-400 block" for="bf-display">Display count</label>' +
            '<select id="bf-display" data-field="display-count" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white">' +
            ['all', '1', '2', '3', '4', '6', '12'].map(function (count) {
                var label = count === 'all' ? 'All modules' : 'Show ' + count;
                return '<option value="' + count + '"' + (String(rules.displayCount) === count ? ' selected' : '') + '>' + label + '</option>';
            }).join('') + '</select>' +
            '<p data-rules-line class="text-[10px] font-mono text-slate-500">Showing ' + shown.length + ' of ' + matched.length + ' · sort ' + esc(rules.sort) + ' · display ' + (displayLimit > 0 ? displayLimit : 'all') + '</p></div></section>' +
            '<div class="space-y-4" data-testid="list-briefings">' + (modules || '<p class="text-xs text-slate-500">No briefings match this filter.</p>') + '</div></div>';
        runMermaid(node);
    }

    function runMermaid(node) {
        if (!window.mermaid || !node) return;
        var diagrams = node.querySelectorAll('.mermaid');
        if (!diagrams.length) return;
        try {
            var pending = window.mermaid.run({ nodes: diagrams });
            if (pending && typeof pending.catch === 'function') pending.catch(function () {});
        } catch (err) { /* diagram text stays readable */ }
    }

    function paintStage(module, item) {
        var stage = module.querySelector('[data-stage]');
        if (!stage || !item) return;
        stage.innerHTML = stageHtml(item, mediumOf(item.id));
        runMermaid(stage);
    }

    function mount(root) {
        var scope = root || document;
        var nodes = [];
        if (scope.getAttribute && scope.getAttribute('data-lms-briefings') != null) nodes.push(scope);
        if (scope.querySelectorAll) {
            scope.querySelectorAll('[data-lms-briefings]').forEach(function (node) {
                if (nodes.indexOf(node) === -1) nodes.push(node);
            });
        }
        nodes.forEach(renderNode);
    }

    function hostOf(el) {
        return el.closest('[data-lms-briefings]');
    }

    function moduleOf(el) {
        return el.closest('[data-module-id]');
    }

    function setMedium(module, item, format) {
        state.media[item.id] = format;
        state.flash[item.id] = { index: 0, face: 'front' };
        var select = module.querySelector('[data-lms-action="medium"]');
        if (select) select.value = format;
        paintStage(module, item);
    }

    function onClick(event) {
        var button = event.target.closest('[data-lms-action]');
        if (!button) return;
        var node = hostOf(button);
        if (!node) return;
        var action = button.getAttribute('data-lms-action');
        var items = loadBriefings();
        var rules = loadRules();
        var module = moduleOf(button);
        var moduleId = module ? module.getAttribute('data-module-id') : '';
        if (action === 'add') {
            var title = (node.querySelector('[data-field="title"]').value || '').trim();
            var urls = parseUrls(node.querySelector('[data-field="urls"]').value || '');
            var tags = parseTags(node);
            var status = node.querySelector('[data-admin-status]');
            if (!title || !urls.length) {
                if (status) status.textContent = 'Title and at least one source URL are required.';
                return;
            }
            if (!tags.length) {
                if (status) status.textContent = 'Choose at least one category tag.';
                return;
            }
            var created = {
                id: 'b-' + Date.now().toString(36),
                title: title,
                sourceUrl: urls[0],
                sourceUrls: urls,
                tags: tags,
                category: tags[0],
                createdAt: Date.now(),
                order: items.length
            };
            var next = items.slice();
            next.push(created);
            saveBriefings(next);
            state.media[created.id] = 'audio';
            mount();
            var card = document.getElementById('module-' + created.id);
            if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (action === 'shuffle') {
            var order = items.slice();
            for (var i = order.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var swap = order[i];
                order[i] = order[j];
                order[j] = swap;
            }
            order.forEach(function (item, index) { item.order = index; });
            saveBriefings(order);
            rules.sort = 'manual';
            saveRules(rules);
            mount();
            return;
        }
        if (action === 'remove') {
            var removeId = button.getAttribute('data-id');
            saveBriefings(items.filter(function (item) { return item.id !== removeId; }));
            delete state.media[removeId];
            delete state.flash[removeId];
            mount();
            return;
        }
        if (action === 'up' || action === 'down') {
            var id = button.getAttribute('data-id');
            var manual = items.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
            var index = manual.findIndex(function (item) { return item.id === id; });
            var target = action === 'up' ? index - 1 : index + 1;
            if (index < 0 || target < 0 || target >= manual.length) return;
            var currentOrder = manual[index].order;
            manual[index].order = manual[target].order;
            manual[target].order = currentOrder;
            saveBriefings(manual);
            rules.sort = 'manual';
            saveRules(rules);
            mount();
            return;
        }
        if (action === 'set-medium') {
            var itemForMedium = byId(moduleId);
            if (!module || !itemForMedium) return;
            setMedium(module, itemForMedium, button.getAttribute('data-medium') || 'audio');
            return;
        }
        if (action === 'ingest') {
            var item = byId(moduleId);
            var input = module ? module.querySelector('[data-field="ingest"]') : null;
            if (!item || !input) return;
            var nextUrl = safeUrl(input.value);
            if (!nextUrl) return;
            var urls = sourcesOf(item).filter(function (url) { return url !== nextUrl; });
            urls.unshift(nextUrl);
            item.sourceUrl = nextUrl;
            item.sourceUrls = urls;
            saveBriefings(items.map(function (entry) { return entry.id === item.id ? item : entry; }));
            paintStage(module, item);
            var statusLine = module.querySelector('[data-essay-status]');
            if (statusLine) statusLine.textContent = '';
            input.value = nextUrl;
            return;
        }
        if (action === 'grade') {
            if (!module) return;
            var scope = button.getAttribute('data-quiz-scope');
            var correct = 0;
            QUIZ.forEach(function (question, qIndex) {
                var picked = module.querySelector('input[name="lms-' + moduleId + '-' + scope + '-' + qIndex + '"]:checked');
                if (picked && picked.value === question.answer) correct += 1;
            });
            var result = module.querySelector('[data-quiz-result="' + scope + '"]');
            if (result) result.textContent = correct + ' / ' + QUIZ.length + ' correct';
            return;
        }
        if (action === 'save-essay') {
            var essayItem = byId(moduleId);
            var essay = module ? module.querySelector('[data-field="essay"]') : null;
            if (!essayItem || !essay) return;
            localStorage.setItem('mhbojt-lms-essay-' + essayItem.id, essay.value);
            var essayStatus = module.querySelector('[data-essay-status]');
            if (essayStatus) essayStatus.textContent = 'Essay saved for this module.';
            return;
        }
        if (action === 'save-note') {
            var noteItem = byId(moduleId);
            var noteField = module ? module.querySelector('[data-field="note"]') : null;
            if (!noteItem || !noteField) return;
            var text = noteField.value.trim();
            if (!text) return;
            var notes = notesOf(noteItem.id);
            notes.unshift({ text: text, at: new Date().toLocaleString() });
            localStorage.setItem('mhbojt-lms-notes-' + noteItem.id, JSON.stringify(notes.slice(0, 20)));
            noteField.value = '';
            var list = module.querySelector('[data-note-list]');
            if (list) list.innerHTML = noteListHtml(noteItem.id);
            return;
        }
        if (action === 'flip' || action === 'flash-prev' || action === 'flash-next') {
            var flashItem = byId(moduleId);
            if (!module || !flashItem) return;
            var flash = flashOf(flashItem.id);
            if (action === 'flip') flash.face = flash.face === 'front' ? 'back' : 'front';
            else {
                flash.index = (flash.index + (action === 'flash-next' ? 1 : -1) + 3) % 3;
                flash.face = 'front';
            }
            paintStage(module, flashItem);
        }
    }

    function onChange(event) {
        var field = event.target;
        if (!field.getAttribute) return;
        var node = hostOf(field);
        if (!node) return;
        if (field.getAttribute('data-lms-action') === 'medium') {
            var module = moduleOf(field);
            var item = module ? byId(module.getAttribute('data-module-id')) : null;
            if (!module || !item) return;
            setMedium(module, item, field.value);
            return;
        }
        var name = field.getAttribute('data-field');
        if (name !== 'sort' && name !== 'filter-category' && name !== 'filter-query' && name !== 'display-count') return;
        var rules = loadRules();
        if (name === 'sort') rules.sort = field.value;
        if (name === 'filter-category') rules.category = field.value;
        if (name === 'filter-query') rules.query = field.value;
        if (name === 'display-count') rules.displayCount = field.value;
        saveRules(rules);
        mount();
        if (name === 'filter-query') {
            var again = document.querySelector('[data-lms-briefings] [data-field="filter-query"]');
            if (again) {
                again.focus();
                var pos = again.value.length;
                again.setSelectionRange(pos, pos);
            }
        }
    }

    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', function (event) {
        if (event.target.getAttribute && event.target.getAttribute('data-field') === 'filter-query') onChange(event);
    });
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' || !event.target.getAttribute || event.target.getAttribute('data-field') !== 'title') return;
        var node = hostOf(event.target);
        if (!node) return;
        event.preventDefault();
        var button = node.querySelector('[data-lms-action="add"]');
        if (button) button.click();
    });

    window.MHBOJT_LMS = { mount: mount, seed: seedBriefings, formats: FORMATS.map(function (pair) { return pair[0]; }) };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
    else mount();
})();
