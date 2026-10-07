/* Briefing LMS merged with the 11-format presentation engine.
   Authors add title, source URL, and subject category. Sort, filter, and
   shuffle rules stay in this browser. Each briefing opens a viewer whose
   medium dropdown renders Audio, Town Hall, Video, Slides, Mind Map,
   Reports, Data Table, Flashcards, Quiz, Infographic, or Artifact Links.
   Ingest URL, Execution Quiz, Project Essay, and Comment Notes sit under
   the stage.
*/
(function () {
    var STORAGE = 'mhbojt-lms-briefings';
    var RULES = 'mhbojt-lms-briefing-rules';
    var CATEGORIES = ['Dynasty', 'Citadel', 'Guardsmen', 'Diaspora', 'Sovereign wealth', 'Resilient housing', 'RWA', 'General'];
    var FORMATS = [
        ['audio', 'Audio Overview'],
        ['townhall', 'Town Hall Multi-Critic'],
        ['video', 'Video Cinematic'],
        ['slides', 'Slide Deck'],
        ['mindmap', 'Mind Map'],
        ['reports', 'Strategy Reports'],
        ['datatable', 'Data Table'],
        ['flashcards', 'Flashcards'],
        ['quiz', 'Execution Quiz'],
        ['infographic', 'Infographic'],
        ['artifact', 'Artifact Links']
    ];
    var QUIZ = [
        { prompt: 'What is the MHBOJT sweat-equity conversion rate?', choices: ['$15 / Hr', '$25 / Hr', '$50 / Hr', '$100 / Hr'], answer: '$50 / Hr' },
        { prompt: 'How many verified sweat hours neutralize $10,000,000 at $50 per hour?', choices: ['2,000 Hours', '10,000 Hours', '20,000 Hours', '200,000 Hours'], answer: '200,000 Hours' },
        { prompt: 'What franchise liability must an apprentice neutralize?', choices: ['$100,000', '$1,000,000', '$10,000,000', '$100,000,000'], answer: '$10,000,000' },
        { prompt: 'What does the $100 Stripe reservation do?', choices: ['Neutralizes the $10M liability', 'Credits 2,000 sweat hours', 'Admits a candidate only', 'Pays the mentor pipeline'], answer: 'Admits a candidate only' }
    ];
    var state = { selectedId: '', medium: 'audio', flashIndex: 0, flashFace: 'front' };

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function seedBriefings() {
        return [
            { id: 'dual-host', title: 'Dual-Author Dynasty Overview', sourceUrl: '/drah-dual-host-overview.mp3', category: 'Dynasty', createdAt: 1, order: 0 },
            { id: 'homes-in-hours', title: 'HOMES IN HOURS?!', sourceUrl: 'https://www.youtube.com/watch?v=wCzS2FZoB-I', category: 'Citadel', createdAt: 2, order: 1 },
            { id: 'st-bernard', title: 'St. Bernard Smart Living Campus', sourceUrl: '/feed/st-bernard/', category: 'Resilient housing', createdAt: 3, order: 2 },
            { id: 'rwa-ledger', title: 'RWA Tokenization Ledger', sourceUrl: '/feed/sovereign-cases.json', category: 'RWA', createdAt: 4, order: 3 }
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
        var rules = { sort: 'manual', category: 'all', query: '' };
        try {
            var saved = JSON.parse(localStorage.getItem(RULES) || '{}');
            if (saved && typeof saved === 'object') {
                if (saved.sort) rules.sort = saved.sort;
                if (saved.category) rules.category = saved.category;
                if (typeof saved.query === 'string') rules.query = saved.query;
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

    function youtubeId(url) {
        var match = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
        return match ? match[1] : '';
    }

    function isAudio(url) {
        return /\.(mp3|m4a)(\?|#|$)/i.test(url || '');
    }

    function audioSources(url) {
        if (isAudio(url)) {
            var type = /\.m4a(\?|#|$)/i.test(url) ? 'audio/mp4' : 'audio/mpeg';
            var sources = '<source src="' + esc(url) + '" type="' + type + '">';
            if (/\.mp3(\?|#|$)/i.test(url)) sources += '<source src="' + esc(url.replace(/\.mp3(\?|#|$)/i, '.m4a$1')) + '" type="audio/mp4">';
            return sources;
        }
        return '<source src="/drah-dual-host-overview.mp3" type="audio/mpeg"><source src="/drah-dual-host-overview.m4a" type="audio/mp4">';
    }

    function audioPlayer(url, caption) {
        return '<p class="text-xs text-slate-300">' + esc(caption) + '</p>' +
            '<audio controls class="w-full accent-amber-400 py-2" preload="metadata">' + audioSources(url) + '</audio>';
    }

    function visibleBriefings(items, rules) {
        var query = (rules.query || '').trim().toLowerCase();
        var list = items.filter(function (item) {
            if (rules.category !== 'all' && item.category !== rules.category) return false;
            if (!query) return true;
            return (item.title + ' ' + item.category + ' ' + item.sourceUrl).toLowerCase().indexOf(query) !== -1;
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
        var category = item.category;
        var url = item.sourceUrl;
        if (format === 'audio') {
            return audioPlayer(url, title + ' — dual-author overview for ' + category + '.');
        }
        if (format === 'townhall') {
            return '<div class="space-y-3 text-left">' +
                '<div class="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs"><strong class="text-amber-400">Critic A (Financial Underwriter):</strong> How does "' + esc(title) + '" hold a lender cushion before the unit is occupied?</div>' +
                '<div class="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs"><strong class="text-emerald-400">Critic B (Community Leader):</strong> ' + esc(category) + ' demand has to be counseled in before this source is treated as supply.</div>' +
                audioPlayer(url, 'Town hall bed for ' + title + '.') +
                '</div>';
        }
        if (format === 'video') {
            var videoId = youtubeId(url);
            if (videoId) {
                return '<p class="text-xs text-slate-300 text-left">' + esc(title) + '</p><div class="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800"><iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/' + esc(videoId) + '" title="' + esc(title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
            }
            if (/\.(mp4|webm)(\?|#|$)/i.test(url)) {
                return '<video controls class="w-full rounded-xl border border-slate-800" src="' + esc(url) + '"></video>';
            }
            return audioPlayer(url, title + ' has no cinematic file. The overview plays instead. Open the source from Artifact Links.');
        }
        if (format === 'slides') {
            return '<div class="space-y-3 text-xs text-left">' +
                '<div><div class="text-amber-400 font-bold">Slide 1 · ' + esc(title) + '</div><p class="text-slate-300 mt-1">Subject: ' + esc(category) + '.</p></div>' +
                '<div><div class="text-amber-400 font-bold">Slide 2 · Source</div><p class="text-slate-300 mt-1 break-all">' + esc(url) + '</p></div>' +
                '<div><div class="text-amber-400 font-bold">Slide 3 · Ledger</div><p class="text-slate-300 mt-1">Sweat $50 / Hr · 200,000 Hours · Mentor $1,000,000 · Sponsor $100,000 · Referral $50,000. The $100 reservation admits a candidate.</p></div></div>';
        }
        if (format === 'mindmap') {
            var safeTitle = title.replace(/"/g, "'");
            var safeCategory = category.replace(/"/g, "'");
            return '<div class="overflow-x-auto"><pre class="mermaid">graph TD\nA["' + safeTitle + '"] --> B["' + safeCategory + '"]\nA --> C["Source"]\nB --> D["Crystal Dynasty Ledger"]</pre></div>';
        }
        if (format === 'reports') {
            return '<span class="text-amber-400 font-bold block text-xs text-left">Strategy dossier · ' + esc(title) + '</span>' +
                '<p class="text-xs text-slate-300 text-left">Category ' + esc(category) + '. Credits still require a verified hour, mentee, sponsor, or converted referral. The source is the evidence, not the credit.</p>';
        }
        if (format === 'datatable') {
            return '<table class="w-full text-xs text-left"><tbody class="text-slate-300">' +
                '<tr><td class="py-1 pr-3 text-amber-400">Title</td><td>' + esc(title) + '</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Category</td><td>' + esc(category) + '</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Source</td><td class="break-all">' + esc(url) + '</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Sweat</td><td>$50 / Hr · 200,000 Hours</td></tr>' +
                '<tr><td class="py-1 pr-3 text-amber-400">Gateway</td><td>$100 admission</td></tr></tbody></table>';
        }
        if (format === 'flashcards') {
            var cards = [
                { front: title, back: category + ' briefing. Source stays attached to this card.' },
                { front: 'Gateway', back: 'The $100 reservation admits a candidate. It does not neutralize $10,000,000.' },
                { front: 'Sweat', back: '$50 per verified hour. 200,000 hours neutralize the apprentice liability.' }
            ];
            state.flashCards = cards;
            var card = cards[state.flashIndex] || cards[0];
            var face = state.flashFace === 'back' ? card.back : card.front;
            return '<button type="button" data-lms-action="flip" class="w-full text-left bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[7rem]"><div class="text-[10px] text-amber-400 uppercase tracking-widest">' + (state.flashFace === 'back' ? 'Back' : 'Front') + ' · tap to flip</div><div class="text-sm text-white mt-2">' + esc(face) + '</div></button>' +
                '<div class="flex justify-between text-[11px]"><button type="button" data-lms-action="flash-prev" class="text-amber-400">Prev</button><span class="text-slate-400">' + (state.flashIndex + 1) + ' / ' + cards.length + '</span><button type="button" data-lms-action="flash-next" class="text-amber-400">Next</button></div>';
        }
        if (format === 'quiz') return quizBlock('stage');
        if (format === 'infographic') {
            return '<div class="space-y-2 text-xs text-left">' +
                '<div class="bg-amber-500/15 border border-amber-500/40 rounded-lg px-3 py-2"><span class="text-amber-400 font-bold">01</span> ' + esc(title) + '</div>' +
                '<div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2"><span class="text-emerald-400 font-bold">02</span> ' + esc(category) + '</div>' +
                '<div class="bg-sky-500/10 border border-sky-500/30 rounded-lg px-3 py-2"><span class="text-sky-400 font-bold">03</span> Ingest · Quiz · Essay · Notes</div></div>';
        }
        return '<ul class="text-xs space-y-2 text-left text-amber-400">' +
            '<li><a class="hover:text-amber-300 break-all" href="' + esc(url) + '">' + esc(title) + '</a></li>' +
            '<li><a class="hover:text-amber-300" href="/drah-dual-host-overview.mp3">Dual-host overview (.mp3)</a></li>' +
            '<li><a class="hover:text-amber-300" href="/drah-dual-host-overview.m4a">Dual-host overview (.m4a)</a></li>' +
            '<li><a class="hover:text-amber-300" href="/drah_crystal_dynasty1.html">Crystal Dynasty engine</a></li>' +
            '<li><a class="hover:text-amber-300" href="/feed/">Academy feed</a></li></ul>';
    }

    function quizBlock(scope) {
        return QUIZ.map(function (item, i) {
            var choices = item.choices.map(function (choice) {
                return '<label class="flex items-start gap-2 text-[11px] text-slate-300"><input type="radio" name="lms-' + scope + '-' + i + '" value="' + esc(choice) + '" class="accent-amber-400 mt-0.5"><span>' + esc(choice) + '</span></label>';
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

    function validationHtml(item) {
        var notes = notesOf(item.id).map(function (note) {
            return '<li class="border border-slate-800 rounded-lg p-2"><div class="text-[10px] text-slate-500">' + esc(note.at) + '</div><div>' + esc(note.text) + '</div></li>';
        }).join('');
        return '<div class="grid grid-cols-1 gap-4">' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">' +
            '<div class="text-xs font-bold text-amber-400">Ingest URL</div>' +
            '<div class="flex flex-col sm:flex-row gap-2">' +
            '<input data-field="ingest" type="url" value="' + esc(item.sourceUrl) + '" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400" placeholder="https://… or /path/audio.mp3">' +
            '<button type="button" data-lms-action="ingest" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">Ingest</button></div></div>' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3" data-testid="section-execution-quiz">' +
            '<div class="text-xs font-bold text-amber-400">Execution Quiz</div>' + quizBlock('suite') + '</div>' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2" data-testid="section-project-essay">' +
            '<div class="text-xs font-bold text-amber-400">Project Essay</div>' +
            '<p class="text-[11px] text-slate-400">Apply "' + esc(item.title) + '" to a Selfless Leader or Nation Builder in ' + esc(item.category) + '.</p>' +
            '<textarea data-field="essay" rows="4" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Write your response…">' + esc(essayOf(item.id)) + '</textarea>' +
            '<button type="button" data-lms-action="save-essay" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-2 rounded text-xs">Save essay</button>' +
            '<p data-essay-status class="text-[11px] text-slate-500"></p></div>' +
            '<div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">' +
            '<div class="text-xs font-bold text-amber-400">Comment Notes</div>' +
            '<textarea data-field="note" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Field note for this briefing"></textarea>' +
            '<button type="button" data-lms-action="save-note" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-2 rounded text-xs">Save note</button>' +
            '<ul class="space-y-2 text-[11px] text-slate-300">' + (notes || '<li class="text-slate-500">No notes for this briefing yet.</li>') + '</ul></div></div>';
    }

    function viewerHtml(item) {
        if (!item) {
            return '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400">Select a briefing to open the 11-format viewer, ingest URL, quiz, essay, and notes.</div>';
        }
        var options = FORMATS.map(function (pair) {
            return '<option value="' + pair[0] + '"' + (pair[0] === state.medium ? ' selected' : '') + '>' + pair[1] + '</option>';
        }).join('');
        return '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">' +
            '<button type="button" data-lms-action="close" class="text-[11px] text-slate-400 hover:text-amber-400">All briefings</button>' +
            '<div><div class="text-[10px] uppercase tracking-widest text-amber-400">' + esc(item.category) + '</div>' +
            '<h2 class="text-sm font-bold text-white">' + esc(item.title) + '</h2></div>' +
            '<label class="text-[11px] text-slate-300 block" for="briefingMedium">Presentation medium</label>' +
            '<select id="briefingMedium" data-lms-action="medium" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400">' + options + '</select>' +
            '<div id="lmsStage" class="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">' + stageHtml(item, state.medium) + '</div>' +
            validationHtml(item) + '</div>';
    }

    function renderNode(node) {
        var items = loadBriefings();
        var rules = loadRules();
        var shown = visibleBriefings(items, rules);
        var selected = byId(state.selectedId);
        var categoryOptions = '<option value="all">All categories</option>' + CATEGORIES.map(function (category) {
            return '<option value="' + esc(category) + '"' + (rules.category === category ? ' selected' : '') + '>' + esc(category) + '</option>';
        }).join('');
        var formCategories = CATEGORIES.map(function (category) {
            return '<option value="' + esc(category) + '">' + esc(category) + '</option>';
        }).join('');
        var rows = shown.map(function (item) {
            var active = item.id === state.selectedId ? ' border-amber-500/50' : '';
            return '<li class="bg-slate-950 border border-slate-800' + active + ' rounded-lg px-3 py-2 flex gap-2 items-center" data-briefing-id="' + esc(item.id) + '">' +
                '<button type="button" data-lms-action="open" data-id="' + esc(item.id) + '" class="flex-1 text-left"><div class="text-xs font-bold text-white">' + esc(item.title) + '</div><div class="text-[10px] text-slate-500">' + esc(item.category) + '</div></button>' +
                '<button type="button" data-lms-action="up" data-id="' + esc(item.id) + '" class="text-[10px] text-amber-400 px-1" aria-label="Move up">↑</button>' +
                '<button type="button" data-lms-action="down" data-id="' + esc(item.id) + '" class="text-[10px] text-amber-400 px-1" aria-label="Move down">↓</button></li>';
        }).join('');
        node.innerHTML = '<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">' +
            '<section class="lg:col-span-4 space-y-4">' +
            '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">' +
            '<h2 class="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin · Add Briefing</h2>' +
            '<label class="text-[10px] uppercase text-slate-400 block" for="bf-title">Title</label>' +
            '<input id="bf-title" data-field="title" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Briefing title">' +
            '<label class="text-[10px] uppercase text-slate-400 block" for="bf-url">Source URL</label>' +
            '<input id="bf-url" data-field="url" type="url" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400" placeholder="https://… or /audio.mp3">' +
            '<label class="text-[10px] uppercase text-slate-400 block" for="bf-category">Subject category</label>' +
            '<select id="bf-category" data-field="category" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">' + formCategories + '</select>' +
            '<button type="button" data-lms-action="add" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">+ Add Briefing</button>' +
            '<p data-admin-status class="text-[11px] text-slate-500"></p></div>' +
            '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">' +
            '<div class="flex items-center justify-between gap-2"><h3 class="text-xs font-bold text-slate-200 uppercase tracking-widest">Briefing rules</h3>' +
            '<button type="button" data-lms-action="shuffle" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]"' + (items.length < 2 ? ' disabled' : '') + '>Shuffle order</button></div>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Sort</label>' +
            '<select data-field="sort" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white">' +
            '<option value="manual"' + (rules.sort === 'manual' ? ' selected' : '') + '>Manual order</option>' +
            '<option value="title"' + (rules.sort === 'title' ? ' selected' : '') + '>Title A–Z</option>' +
            '<option value="newest"' + (rules.sort === 'newest' ? ' selected' : '') + '>Newest first</option></select>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Filter category</label>' +
            '<select data-field="filter-category" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white">' + categoryOptions + '</select>' +
            '<label class="text-[10px] uppercase text-slate-400 block">Filter text</label>' +
            '<input data-field="filter-query" value="' + esc(rules.query) + '" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400" placeholder="Title, category, or URL">' +
            '<p class="text-[10px] font-mono text-slate-500">Showing ' + shown.length + ' of ' + items.length + ' · sort ' + esc(rules.sort) + '</p>' +
            '<ol class="space-y-2" data-testid="list-briefings">' + (rows || '<li class="text-xs text-slate-500">No briefings match this filter.</li>') + '</ol></div></section>' +
            '<section class="lg:col-span-8" data-lms-viewer>' + viewerHtml(selected) + '</section></div>';
        runMermaid(node);
    }

    function runMermaid(node) {
        if (!window.mermaid) return;
        var diagrams = node.querySelectorAll('.mermaid');
        if (diagrams.length) window.mermaid.run({ nodes: diagrams });
    }

    function paintStage(node, item) {
        var stage = node.querySelector('#lmsStage');
        if (!stage || !item) return;
        stage.innerHTML = stageHtml(item, state.medium);
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

    function onClick(event) {
        var button = event.target.closest('[data-lms-action]');
        if (!button) return;
        var node = hostOf(button);
        if (!node) return;
        var action = button.getAttribute('data-lms-action');
        var items = loadBriefings();
        var rules = loadRules();
        if (action === 'add') {
            var title = (node.querySelector('[data-field="title"]').value || '').trim();
            var sourceUrl = (node.querySelector('[data-field="url"]').value || '').trim();
            var category = node.querySelector('[data-field="category"]').value;
            var status = node.querySelector('[data-admin-status]');
            if (!title || !sourceUrl) {
                if (status) status.textContent = 'Title and source URL are required.';
                return;
            }
            var next = items.slice();
            var created = { id: 'b-' + Date.now().toString(36), title: title, sourceUrl: sourceUrl, category: category, createdAt: Date.now(), order: next.length };
            next.push(created);
            saveBriefings(next);
            state.selectedId = created.id;
            state.medium = 'audio';
            mount();
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
        if (action === 'open') {
            state.selectedId = button.getAttribute('data-id');
            state.medium = 'audio';
            state.flashIndex = 0;
            state.flashFace = 'front';
            mount();
            return;
        }
        if (action === 'close') {
            state.selectedId = '';
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
        if (action === 'ingest') {
            var item = byId(state.selectedId);
            var input = node.querySelector('[data-field="ingest"]');
            if (!item || !input) return;
            var nextUrl = input.value.trim();
            if (!nextUrl) return;
            item.sourceUrl = nextUrl;
            saveBriefings(items.map(function (entry) { return entry.id === item.id ? item : entry; }));
            paintStage(node, item);
            return;
        }
        if (action === 'grade') {
            var scope = button.getAttribute('data-quiz-scope');
            var correct = 0;
            QUIZ.forEach(function (question, index) {
                var picked = node.querySelector('input[name="lms-' + scope + '-' + index + '"]:checked');
                if (picked && picked.value === question.answer) correct += 1;
            });
            var result = node.querySelector('[data-quiz-result="' + scope + '"]');
            if (result) result.textContent = correct + ' / ' + QUIZ.length + ' correct';
            return;
        }
        if (action === 'save-essay') {
            var essayItem = byId(state.selectedId);
            var essay = node.querySelector('[data-field="essay"]');
            if (!essayItem || !essay) return;
            localStorage.setItem('mhbojt-lms-essay-' + essayItem.id, essay.value);
            var essayStatus = node.querySelector('[data-essay-status]');
            if (essayStatus) essayStatus.textContent = 'Essay saved for this briefing.';
            return;
        }
        if (action === 'save-note') {
            var noteItem = byId(state.selectedId);
            var noteField = node.querySelector('[data-field="note"]');
            if (!noteItem || !noteField) return;
            var text = noteField.value.trim();
            if (!text) return;
            var notes = notesOf(noteItem.id);
            notes.unshift({ text: text, at: new Date().toLocaleString() });
            localStorage.setItem('mhbojt-lms-notes-' + noteItem.id, JSON.stringify(notes.slice(0, 20)));
            mount();
            return;
        }
        if (action === 'flip') {
            state.flashFace = state.flashFace === 'front' ? 'back' : 'front';
            paintStage(node, byId(state.selectedId));
            return;
        }
        if (action === 'flash-prev' || action === 'flash-next') {
            var cards = state.flashCards || [];
            if (!cards.length) return;
            state.flashIndex = (state.flashIndex + (action === 'flash-next' ? 1 : -1) + cards.length) % cards.length;
            state.flashFace = 'front';
            paintStage(node, byId(state.selectedId));
        }
    }

    function onChange(event) {
        var field = event.target;
        var node = hostOf(field);
        if (!node) return;
        if (field.getAttribute('data-lms-action') === 'medium') {
            state.medium = field.value;
            state.flashIndex = 0;
            state.flashFace = 'front';
            paintStage(node, byId(state.selectedId));
            return;
        }
        var name = field.getAttribute('data-field');
        if (name !== 'sort' && name !== 'filter-category' && name !== 'filter-query') return;
        var rules = loadRules();
        if (name === 'sort') rules.sort = field.value;
        if (name === 'filter-category') rules.category = field.value;
        if (name === 'filter-query') rules.query = field.value;
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

    window.MHBOJT_LMS = { mount: mount, seed: seedBriefings };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
    else mount();
})();
