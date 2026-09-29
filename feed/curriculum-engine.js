/* Modular curriculum rendering engine.
   Fetches /curriculum-data.json, mounts [data-curriculum-factory],
   and builds a briefing card + media player + quiz + Stripe hook
   for every subject. Ingested drafts persist in localStorage until
   exported into the JSON file and shipped. */
(function () {
    var STORAGE_KEY = 'mhbojt-curriculum-drafts';
    var STRIPE = 'https://buy.stripe.com/8x228rcRfa087yu9P4cIE02';
    var CATEGORIES = [
        { id: 'youtube', label: 'YouTube / TikTok integration' },
        { id: 'tiktok', label: 'YouTube / TikTok integration (TikTok URL)' },
        { id: 'notebooklm', label: 'NotebookLM notes' },
        { id: 'industry', label: 'Industry Standard' }
    ];
    var state = {
        catalog: { version: '', stripe: STRIPE, subjects: [] },
        drafts: [],
        error: '',
        source: '',
        selectedId: ''
    };

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function onAcademyHost() {
        return (location.hostname || '').indexOf('finacademy.') === 0;
    }

    function originRoot() {
        return onAcademyHost() ? 'https://www.mhbojt.com' : '';
    }

    function dataUrl() {
        return originRoot() + '/curriculum-data.json';
    }

    function abs(path) {
        if (!path) return originRoot() + '/';
        if (/^https?:\/\//.test(path)) return path;
        return originRoot() + path;
    }

    function stripeHref() {
        return (state.catalog && state.catalog.stripe) || STRIPE;
    }

    function slug(value) {
        var text = String(value || 'module').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return (text || 'module').slice(0, 60);
    }

    function youtubeId(input) {
        var text = String(input || '');
        var m = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/) || text.match(/^([A-Za-z0-9_-]{11})$/);
        return m ? m[1] : '';
    }

    function tiktokId(input) {
        var text = String(input || '');
        var m = text.match(/\/video\/(\d+)/) || text.match(/^(\d{8,})$/);
        return m ? m[1] : '';
    }

    function loadDrafts() {
        try {
            var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    function saveDrafts(drafts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts.slice(0, 40)));
    }

    function allSubjects() {
        var published = (state.catalog && state.catalog.subjects) || [];
        var seen = {};
        var out = [];
        published.concat(state.drafts).forEach(function (item) {
            if (!item || !item.id || seen[item.id]) return;
            seen[item.id] = true;
            out.push(item);
        });
        return out;
    }

    function findSubject(id) {
        var list = allSubjects();
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return list[0] || null;
    }

    function buildModule(title, category, mediaUrl, prompt) {
        var cat = category || 'industry';
        var id = slug(title) + '-' + Date.now().toString(36).slice(-4);
        var yt = youtubeId(mediaUrl);
        var tk = tiktokId(mediaUrl);
        var media;
        if (cat === 'youtube' || (yt && cat !== 'tiktok' && cat !== 'notebooklm')) {
            media = { type: 'youtube', id: yt || 'wCzS2FZoB-I', title: title };
            cat = 'youtube';
        } else if (cat === 'tiktok') {
            media = { type: 'tiktok', id: tk, url: mediaUrl, title: title };
        } else if (cat === 'notebooklm') {
            media = { type: 'audio', src: mediaUrl || '/drah-dual-host-overview.mp3', title: title };
        } else {
            media = { type: 'industry', title: title, href: '/drah_crystal_dynasty1.html' };
        }
        var body = prompt || ('Auto-built ' + cat + ' module. Sweat credits $50/Hr against the $10,000,000 apprentice liability. The $100 gateway admits; it does not neutralize.');
        return {
            id: id,
            title: title,
            category: cat,
            prompt: prompt || title,
            body: body,
            media: media,
            draft: true,
            quiz: [
                { prompt: 'What is the MHBOJT sweat-equity conversion rate?', choices: ['$15 / Hr', '$25 / Hr', '$50 / Hr', '$100 / Hr'], answer: '$50 / Hr' },
                { prompt: 'What franchise liability must an apprentice neutralize?', choices: ['$100,000', '$1,000,000', '$10,000,000', '$100,000,000'], answer: '$10,000,000' },
                { prompt: 'How many verified sweat hours neutralize $10,000,000 at $50 per hour?', choices: ['2,000 Hours', '10,000 Hours', '20,000 Hours', '200,000 Hours'], answer: '200,000 Hours' },
                { prompt: 'What is the Stripe gateway reservation?', choices: ['$10', '$50', '$100', '$1,000'], answer: '$100' }
            ]
        };
    }

    function mediaHtml(subject) {
        var media = subject.media || {};
        if (media.type === 'youtube' && media.id) {
            return '<div class="aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-black">' +
                '<iframe class="w-full h-full" src="https://www.youtube.com/embed/' + esc(media.id) + '" title="' + esc(media.title || subject.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
                '</div>';
        }
        if (media.type === 'tiktok') {
            if (media.id) {
                return '<div class="aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-black">' +
                    '<iframe class="w-full h-full" src="https://www.tiktok.com/embed/v2/' + esc(media.id) + '" title="' + esc(media.title || subject.title) + '" allow="encrypted-media" allowfullscreen></iframe>' +
                    '</div>';
            }
            return '<p class="text-xs text-zinc-400">Paste a TikTok video URL (…/video/123…) to embed the player.</p>';
        }
        if (media.type === 'audio') {
            return '<audio controls class="w-full" src="' + esc(abs(media.src || '/drah-dual-host-overview.mp3')) + '"></audio>' +
                '<p class="text-[11px] text-zinc-500 mt-1">NotebookLM Audio Overview. Native controls.</p>';
        }
        return '<div class="bg-zinc-950 border border-amber-500/30 rounded-xl p-4 space-y-2">' +
            '<div class="text-[10px] uppercase tracking-widest text-amber-400">Industry Standard</div>' +
            '<p class="text-xs text-zinc-300">Open Crystal Dynasty and run Action Tracks until remaining liability is $0. $50/Hr sweat · 200,000 Hours · $10M ledger.</p>' +
            '<a href="' + esc(abs(media.href || '/drah_crystal_dynasty1.html')) + '" class="inline-block bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs">Open Crystal Dynasty Calculator</a>' +
            '</div>';
    }

    function quizHtml(subject) {
        var quiz = subject.quiz || [];
        if (!quiz.length) return '';
        return '<form data-quiz-form="' + esc(subject.id) + '" class="space-y-3">' +
            quiz.map(function (q, i) {
                var choices = (q.choices || []).map(function (c) {
                    return '<label class="flex items-center gap-2 bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 rounded-lg px-3 py-2 text-xs text-zinc-300 cursor-pointer">' +
                        '<input type="radio" name="q-' + esc(subject.id) + '-' + i + '" value="' + esc(c) + '" class="accent-amber-400">' +
                        '<span>' + esc(c) + '</span></label>';
                }).join('');
                return '<article class="space-y-2"><p class="text-xs font-semibold text-white">' + (i + 1) + '. ' + esc(q.prompt) + '</p>' + choices + '</article>';
            }).join('') +
            '<button type="submit" class="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold tracking-widest px-4 py-3 rounded-lg text-sm">SUBMIT &amp; CALCULATE SCORE</button>' +
            '<div data-quiz-result="' + esc(subject.id) + '" class="hidden bg-zinc-950 border border-amber-500/40 rounded-xl p-4 text-center text-sm font-mono text-amber-400"></div>' +
            '</form>';
    }

    function stripeHtml() {
        return '<div class="flex flex-wrap gap-2">' +
            '<a href="' + esc(stripeHref()) + '" class="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs">Secure $100 Reservation</a>' +
            '<a href="' + esc(abs('/drah_crystal_dynasty1.html')) + '" class="bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-amber-300 font-bold px-4 py-2 rounded-lg text-xs">Crystal Dynasty Calculator</a>' +
            '</div>' +
            '<p class="text-[11px] text-zinc-500">The $100 gateway admits a candidate. It does not neutralize the $10,000,000 liability.</p>';
    }

    function moduleHtml(subject) {
        var cat = subject.category || 'industry';
        var badge = cat === 'notebooklm' ? 'NotebookLM notes' : (cat === 'industry' ? 'Industry Standard' : 'YouTube / TikTok integration');
        return '<article id="module-' + esc(subject.id) + '" class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">' +
            '<div class="flex flex-wrap justify-between gap-2">' +
            '<div><div class="text-[9px] uppercase tracking-widest text-amber-400">' + esc(badge) + (subject.draft ? ' · draft' : '') + '</div>' +
            '<h3 class="text-sm font-bold text-white">' + esc(subject.title) + '</h3></div></div>' +
            '<p class="text-xs text-zinc-400">' + esc(subject.body) + '</p>' +
            '<div data-media>' + mediaHtml(subject) + '</div>' +
            '<div><div class="text-[10px] uppercase tracking-widest text-amber-400 mb-2">Interactive quiz</div>' + quizHtml(subject) + '</div>' +
            '<div><div class="text-[10px] uppercase tracking-widest text-amber-400 mb-2">Stripe checkout hook</div>' + stripeHtml() + '</div>' +
            '</article>';
    }

    function ingestHtml() {
        var opts = CATEGORIES.map(function (c) {
            return '<option value="' + esc(c.id) + '">' + esc(c.label) + '</option>';
        }).join('');
        return '<section class="bg-zinc-900 border border-amber-500/40 rounded-2xl p-5 space-y-3">' +
            '<div class="text-[9px] uppercase tracking-widest text-amber-400">Input ingestion zone</div>' +
            '<h2 class="text-sm font-bold text-white">Course Factory · automated module builder</h2>' +
            '<p class="text-xs text-zinc-400">Title + category builds a briefing card, media player, quiz, and $100 Stripe hook. Drafts stay in this browser until you export JSON into curriculum-data.json.</p>' +
            '<input data-field="title" placeholder="Subject title prompt (e.g. Jackson Barracks dual-duty hours)" class="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-2">' +
            '<select data-field="category" class="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">' + opts + '</select>' +
            '<input data-field="media" placeholder="YouTube / TikTok / audio URL (optional)" class="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400">' +
            '</div>' +
            '<textarea data-field="prompt" rows="2" placeholder="Optional doctrine prompt / notes" class="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"></textarea>' +
            '<div class="flex flex-wrap gap-2">' +
            '<button type="button" data-action="build" class="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs">Build module</button>' +
            '<button type="button" data-action="export" class="bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold px-4 py-2 rounded-lg text-xs">Copy JSON export</button>' +
            '</div>' +
            '<p data-status class="text-[11px] text-zinc-500">' + (state.source ? 'Loaded ' + esc(state.source) : 'Loading curriculum-data.json…') + (state.error ? ' · ' + esc(state.error) : '') + '</p>' +
            '</section>';
    }

    function listHtml() {
        var list = allSubjects();
        if (!list.length) return '<p class="text-xs text-zinc-500">No subjects yet. Build a module or wait for curriculum-data.json.</p>';
        return '<div class="flex flex-wrap gap-2">' + list.map(function (s) {
            var on = s.id === state.selectedId;
            return '<button type="button" data-select="' + esc(s.id) + '" class="text-left px-3 py-2 rounded-lg text-xs border ' +
                (on ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold' : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-500/40') + '">' +
                esc(s.title) + '</button>';
        }).join('') + '</div>';
    }

    function paintNode(root) {
        if (!root) return;
        var subject = findSubject(state.selectedId);
        if (subject) state.selectedId = subject.id;
        root.innerHTML = ingestHtml() +
            '<section class="space-y-3"><div class="text-[10px] uppercase tracking-widest text-amber-400">Published + draft subjects</div>' +
            listHtml() + '</section>' +
            (subject ? moduleHtml(subject) : '');
    }

    function paint() {
        var nodes = document.querySelectorAll('[data-curriculum-factory]');
        for (var i = 0; i < nodes.length; i++) paintNode(nodes[i]);
    }

    function onBuild(root) {
        var title = ((root.querySelector('[data-field="title"]') || {}).value || '').trim();
        var category = ((root.querySelector('[data-field="category"]') || {}).value || 'industry');
        var media = ((root.querySelector('[data-field="media"]') || {}).value || '').trim();
        var prompt = ((root.querySelector('[data-field="prompt"]') || {}).value || '').trim();
        if (!title) {
            var status = root.querySelector('[data-status]');
            if (status) status.textContent = 'Enter a subject title prompt first.';
            return;
        }
        var module = buildModule(title, category, media, prompt);
        state.drafts.unshift(module);
        saveDrafts(state.drafts);
        state.selectedId = module.id;
        paint();
    }

    function onExport() {
        var payload = {
            version: (state.catalog && state.catalog.version) || 'draft',
            stripe: stripeHref(),
            subjects: allSubjects().map(function (s) {
                var copy = JSON.parse(JSON.stringify(s));
                delete copy.draft;
                return copy;
            })
        };
        var text = JSON.stringify(payload, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                paint();
            }).catch(function () {
                window.prompt('Copy curriculum JSON', text);
            });
        } else {
            window.prompt('Copy curriculum JSON', text);
        }
        alert('JSON copied. Paste into curriculum-data.json, commit, and Vercel will publish the new subject.');
    }

    function scoreQuiz(form) {
        var id = form.getAttribute('data-quiz-form');
        var subject = findSubject(id);
        if (!subject) return;
        var quiz = subject.quiz || [];
        var correct = 0;
        quiz.forEach(function (q, i) {
            var picked = form.querySelector('input[name="q-' + id + '-' + i + '"]:checked');
            if (picked && picked.value === q.answer) correct += 1;
        });
        var box = form.querySelector('[data-quiz-result="' + id + '"]');
        if (box) {
            box.classList.remove('hidden');
            box.textContent = correct + ' / ' + quiz.length + ' · ' + Math.round((correct / Math.max(quiz.length, 1)) * 100) + '%';
        }
    }

    function onClick(ev) {
        var build = ev.target.closest('[data-action="build"]');
        var exp = ev.target.closest('[data-action="export"]');
        var select = ev.target.closest('[data-select]');
        if (build) {
            ev.preventDefault();
            onBuild(build.closest('[data-curriculum-factory]') || document.body);
        } else if (exp) {
            ev.preventDefault();
            onExport();
        } else if (select) {
            ev.preventDefault();
            state.selectedId = select.getAttribute('data-select');
            paint();
        }
    }

    function onSubmit(ev) {
        var form = ev.target.closest('[data-quiz-form]');
        if (!form) return;
        ev.preventDefault();
        scoreQuiz(form);
    }

    function acceptCatalog(data, source) {
        state.catalog = data || { subjects: [] };
        if (state.catalog.stripe) STRIPE = state.catalog.stripe;
        state.source = source;
        state.error = '';
        if (!state.selectedId && allSubjects()[0]) state.selectedId = allSubjects()[0].id;
        paint();
    }

    function fetchCatalog() {
        fetch(dataUrl(), { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) { acceptCatalog(data, 'curriculum-data.json'); })
            .catch(function (err) {
                state.error = err && err.message ? err.message : 'fetch failed';
                paint();
            });
    }

    window.MHBOJT_CURRICULUM = {
        mount: function (root) {
            if (root && root.querySelectorAll) {
                var nodes = root.querySelectorAll('[data-curriculum-factory]');
                for (var i = 0; i < nodes.length; i++) paintNode(nodes[i]);
            } else {
                paint();
            }
        },
        buildModule: buildModule,
        subjects: allSubjects
    };

    state.drafts = loadDrafts();
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    fetchCatalog();
    paint();
})();
