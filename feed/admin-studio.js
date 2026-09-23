/* Admin Studio: NotebookLM drop intake and client-side M4A → MP3 conversion.
   Mounts into [data-admin-studio]. Conversion decodes with Web Audio and
   encodes with lamejs. The MP3 stays in the browser until the operator downloads
   it into the repository; playback binding uses a session blob URL. */
(function () {
    var STORAGE_KEY = 'mhbojt-notebooklm-drops';
    var FORMATS = [
        { key: 'audio', label: 'Audio Overview' },
        { key: 'interactive', label: 'Interactive Report' },
        { key: 'slides', label: 'Slide Deck' },
        { key: 'datatable', label: 'Data Table' },
        { key: 'video', label: 'Video Overview' },
        { key: 'mindmap', label: 'Mind Map' },
        { key: 'reports', label: 'Reports' },
        { key: 'flashcards', label: 'Flashcards' },
        { key: 'quiz', label: 'Quiz' },
        { key: 'infographic', label: 'Infographic' },
        { key: 'artifact', label: 'Artifact' }
    ];
    var SOURCE_TAGS = [
        'Crystal Dynasty',
        'Sentinel Perpetuity',
        'Guardsmen',
        'Tri-Parish',
        'Laotian Diaspora',
        'Sovereign wealth',
        'Resilient housing',
        'RWA ledger'
    ];
    var state = {
        tags: ['Crystal Dynasty'],
        source: 'dynasty',
        staged: null,
        bound: null,
        mp3Blob: null,
        mp3Name: ''
    };

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatLabel(key) {
        for (var i = 0; i < FORMATS.length; i++) {
            if (FORMATS[i].key === key) return FORMATS[i].label;
        }
        return 'Audio Overview';
    }

    function slug(value) {
        var text = String(value || 'notebook-output').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return (text || 'notebook-output').slice(0, 60);
    }

    function loadDrops() {
        try {
            var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    function saveDrops(drops) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drops.slice(0, 20)));
    }

    function studioNodes() {
        return document.querySelectorAll('[data-admin-studio]');
    }

    function readForm(root) {
        var title = (root.querySelector('[data-field="title"]') || {}).value || '';
        var medium = (root.querySelector('[data-field="medium"]') || {}).value || 'audio';
        var source = (root.querySelector('[data-field="source"]') || {}).value || 'dynasty';
        var notes = (root.querySelector('[data-field="notes"]') || {}).value || '';
        return {
            title: title.trim(),
            medium: medium,
            source: source,
            notes: notes.trim(),
            tags: state.tags.slice()
        };
    }

    function previewHtml(drop) {
        if (!drop || !drop.title) {
            return '<p class="text-xs text-slate-400">The staged card appears here after you add a title. Nothing is committed until the MP3 is downloaded and pushed with the repository.</p>';
        }
        var tags = (drop.tags || []).map(function (tag) {
            return '<span class="text-[10px] border border-amber-500/40 text-amber-300 rounded px-2 py-0.5">' + esc(tag) + '</span>';
        }).join('');
        return '<div class="text-[9px] uppercase tracking-widest text-amber-400">' + esc(formatLabel(drop.medium)) + '</div>' +
            '<h4 class="text-sm font-bold text-white mt-1">' + esc(drop.title) + '</h4>' +
            '<p class="text-[10px] text-slate-500 mt-1">Notebook source · ' + esc(drop.source === 'sentinel' ? 'Sentinel Perpetuity Fund' : 'Crystal Dynasty Engine') + '</p>' +
            '<div class="flex flex-wrap gap-1 mt-2">' + tags + '</div>' +
            (drop.notes ? '<p class="text-[11px] text-slate-300 mt-2 leading-relaxed">' + esc(drop.notes) + '</p>' : '');
    }

    function paintPreview(root) {
        var box = root.querySelector('[data-preview]');
        if (box) box.innerHTML = previewHtml(readForm(root));
    }

    function paintTags(root) {
        var box = root.querySelector('[data-tags]');
        if (!box) return;
        box.innerHTML = SOURCE_TAGS.map(function (tag) {
            var on = state.tags.indexOf(tag) !== -1;
            var cls = on
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-500/40';
            return '<button type="button" data-admin-action="tag" data-tag="' + esc(tag) + '" class="border font-semibold px-2 py-1 rounded text-[10px] ' + cls + '">' + esc(tag) + '</button>';
        }).join('') + state.tags.filter(function (tag) {
            return SOURCE_TAGS.indexOf(tag) === -1;
        }).map(function (tag) {
            return '<button type="button" data-admin-action="tag" data-tag="' + esc(tag) + '" class="border font-semibold px-2 py-1 rounded text-[10px] bg-amber-500 text-slate-950 border-amber-400">' + esc(tag) + '</button>';
        }).join('');
    }

    function paintDrops(root) {
        var box = root.querySelector('[data-drops]');
        if (!box) return;
        var drops = loadDrops();
        if (!drops.length) {
            box.innerHTML = '<p class="text-[11px] text-slate-500">No NotebookLM outputs saved in this browser yet.</p>';
            return;
        }
        box.innerHTML = drops.map(function (drop) {
            return '<article class="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-wrap justify-between gap-2">' +
                '<div><div class="text-[10px] uppercase tracking-widest text-amber-400">' + esc(formatLabel(drop.medium)) + '</div>' +
                '<div class="text-xs font-bold text-white">' + esc(drop.title) + '</div>' +
                '<div class="text-[10px] text-slate-500">' + esc((drop.tags || []).join(' · ')) + '</div></div>' +
                '<div class="flex gap-2 items-start">' +
                '<button type="button" data-admin-action="load-drop" data-id="' + esc(drop.id) + '" class="text-[10px] font-bold text-amber-400">Stage</button>' +
                '<button type="button" data-admin-action="remove-drop" data-id="' + esc(drop.id) + '" class="text-[10px] text-slate-500">Remove</button>' +
                '</div></article>';
        }).join('');
    }

    function paintAll(kind) {
        studioNodes().forEach(function (root) {
            if (kind !== 'drops') paintPreview(root);
            if (kind !== 'preview') paintTags(root);
            paintDrops(root);
        });
    }

    function template() {
        var options = FORMATS.map(function (format) {
            return '<option value="' + format.key + '">' + esc(format.label) + '</option>';
        }).join('');
        return '<div class="space-y-4">' +
            '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">' +
            '<div class="border-b border-slate-800 pb-3">' +
            '<div class="text-[9px] uppercase tracking-widest text-amber-400">Admin Studio · NotebookLM Drop</div>' +
            '<h2 class="text-sm font-bold text-white">NotebookLM output intake</h2>' +
            '<p class="text-[11px] text-slate-400 mt-1 max-w-3xl">Same intake shape as Create Micro-Briefing — a title, one category, and source tags — aimed at the 11 NotebookLM formats. Staging points the on-page selector at this output.</p>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
            '<div><label class="block text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1" for="nlTitle">Title</label>' +
            '<input id="nlTitle" data-field="title" placeholder="Output title" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"></div>' +
            '<div><label class="block text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1" for="nlMedium">Medium · 11 formats</label>' +
            '<select id="nlMedium" data-field="medium" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">' + options + '</select></div>' +
            '</div>' +
            '<div><label class="block text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1" for="nlSource">Notebook source</label>' +
            '<select id="nlSource" data-field="source" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">' +
            '<option value="dynasty">Crystal Dynasty Engine</option>' +
            '<option value="sentinel">Sentinel Perpetuity Fund</option>' +
            '</select></div>' +
            '<div><div class="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Source tags</div>' +
            '<div data-tags class="flex flex-wrap gap-1.5"></div>' +
            '<div class="flex gap-2 mt-2">' +
            '<input data-field="custom-tag" placeholder="Add a source tag" class="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">' +
            '<button type="button" data-admin-action="add-tag" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded text-[10px]">Add tag</button>' +
            '</div></div>' +
            '<div><label class="block text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1" for="nlNotes">Output notes</label>' +
            '<textarea id="nlNotes" data-field="notes" rows="3" placeholder="What this NotebookLM output should brief" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"></textarea></div>' +
            '<div class="flex flex-wrap gap-2">' +
            '<button type="button" data-admin-action="stage" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">Stage in NotebookLM selector</button>' +
            '<button type="button" data-admin-action="save-drop" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-2 rounded-lg text-xs">Save drop</button>' +
            '</div>' +
            '<p data-drop-status class="text-[11px] text-slate-400"></p>' +
            '<div data-preview class="bg-slate-950 border border-slate-800 rounded-xl p-4"></div>' +
            '<div><div class="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Saved drops</div><div data-drops class="space-y-2"></div></div>' +
            '</div>' +
            '<div class="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 space-y-4">' +
            '<div class="border-b border-slate-800 pb-3">' +
            '<div class="text-[9px] uppercase tracking-widest text-amber-400">Admin Studio · Audio utility</div>' +
            '<h2 class="text-sm font-bold text-white">M4A to MP3 converter</h2>' +
            '<p class="text-[11px] text-slate-400 mt-1 max-w-3xl">Upload an .m4a file. This page decodes it and writes a 128 kbps MP3 in the browser. Download that file into <span class="font-mono text-amber-300">audio/</span> for repository storage. Binding plays it on the NotebookLM audio player for this session.</p>' +
            '</div>' +
            '<label class="block text-[10px] font-bold text-amber-400 uppercase tracking-widest" for="m4aFile">.m4a upload</label>' +
            '<input id="m4aFile" data-field="m4a" type="file" accept=".m4a,audio/mp4,audio/x-m4a,audio/aac" class="block w-full text-xs text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950">' +
            '<p data-convert-status class="text-[11px] font-mono text-slate-400">Waiting for an .m4a file.</p>' +
            '<audio data-convert-preview controls class="w-full accent-amber-400 hidden"></audio>' +
            '<div class="flex flex-wrap gap-2">' +
            '<button type="button" data-admin-action="download-mp3" disabled class="bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">Download MP3</button>' +
            '<button type="button" data-admin-action="bind-mp3" disabled class="bg-slate-800 disabled:text-slate-500 text-amber-400 font-bold px-4 py-2 rounded-lg text-xs">Bind live playback</button>' +
            '</div>' +
            '<p data-repo-path class="text-[11px] text-slate-500"></p>' +
            '</div></div>';
    }

    function renderStudio(node) {
        if (node.getAttribute('data-ready') === '1') {
            paintDrops(node);
            return;
        }
        node.innerHTML = template();
        node.setAttribute('data-ready', '1');
        paintTags(node);
        paintPreview(node);
        paintDrops(node);
        var file = node.querySelector('[data-field="m4a"]');
        if (file) {
            file.addEventListener('change', function () {
                var picked = file.files && file.files[0];
                if (picked) convertFile(picked, node);
            });
        }
        node.addEventListener('input', function (event) {
            if (event.target && event.target.getAttribute && event.target.getAttribute('data-field')) paintPreview(node);
        });
    }

    function setStatus(root, message) {
        var nodes = root ? [root] : studioNodes();
        nodes.forEach(function (node) {
            var line = node.querySelector('[data-drop-status]');
            if (line) line.textContent = message;
        });
    }

    function setConvertStatus(root, message) {
        var line = root && root.querySelector('[data-convert-status]');
        if (line) line.textContent = message;
    }

    function applyDropToForm(root, drop) {
        var title = root.querySelector('[data-field="title"]');
        var medium = root.querySelector('[data-field="medium"]');
        var source = root.querySelector('[data-field="source"]');
        var notes = root.querySelector('[data-field="notes"]');
        if (title) title.value = drop.title || '';
        if (medium) medium.value = drop.medium || 'audio';
        if (source) source.value = drop.source || 'dynasty';
        if (notes) notes.value = drop.notes || '';
        state.tags = (drop.tags || []).slice();
        state.source = drop.source || 'dynasty';
        paintTags(root);
        paintPreview(root);
    }

    function stageFrom(root) {
        var drop = readForm(root);
        if (!drop.title) {
            setStatus(root, 'Add a title before staging.');
            paintPreview(root);
            return null;
        }
        state.source = drop.source;
        state.staged = {
            id: 'drop-' + Date.now(),
            title: drop.title,
            medium: drop.medium,
            source: drop.source,
            notes: drop.notes,
            tags: drop.tags,
            savedAt: new Date().toISOString()
        };
        var mediumSelect = document.getElementById('notebookMedium');
        var sourceSelect = document.getElementById('notebookSource');
        if (sourceSelect && (drop.source === 'dynasty' || drop.source === 'sentinel')) sourceSelect.value = drop.source;
        if (mediumSelect) mediumSelect.value = drop.medium;
        if (typeof window.renderSelectedNotebookMedium === 'function') window.renderSelectedNotebookMedium();
        var tray = document.getElementById('notebookPluginTray') || document.getElementById('mediaContainer');
        if (tray && root.id !== 'adminStay') tray.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setStatus(root, 'Staged “' + drop.title + '” on ' + formatLabel(drop.medium) + '.');
        return state.staged;
    }

    function saveFrom(root) {
        var staged = stageFrom(root);
        if (!staged) return;
        var drops = loadDrops().filter(function (drop) { return drop.title !== staged.title || drop.medium !== staged.medium; });
        drops.unshift(staged);
        saveDrops(drops);
        paintAll('drops');
        setStatus(root, 'Saved “' + staged.title + '” in this browser and staged it on the selector.');
    }

    function addCustomTag(root) {
        var input = root.querySelector('[data-field="custom-tag"]');
        var tag = input ? input.value.trim() : '';
        if (!tag) return;
        if (state.tags.indexOf(tag) === -1) state.tags.push(tag);
        if (input) input.value = '';
        paintTags(root);
        paintPreview(root);
    }

    function toggleTag(root, tag) {
        var index = state.tags.indexOf(tag);
        if (index === -1) state.tags.push(tag);
        else state.tags.splice(index, 1);
        paintTags(root);
        paintPreview(root);
    }

    function loadLame() {
        if (window.lamejs && window.lamejs.Mp3Encoder) return Promise.resolve(window.lamejs);
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
            script.onload = function () {
                if (window.lamejs && window.lamejs.Mp3Encoder) resolve(window.lamejs);
                else reject(new Error('MP3 encoder loaded without Mp3Encoder'));
            };
            script.onerror = function () { reject(new Error('MP3 encoder failed to load')); };
            document.head.appendChild(script);
        });
    }

    function floatTo16(samples) {
        var out = new Int16Array(samples.length);
        for (var i = 0; i < samples.length; i++) {
            var sample = Math.max(-1, Math.min(1, samples[i]));
            out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
        return out;
    }

    function resample(audioBuffer) {
        var rate = 44100;
        if (audioBuffer.sampleRate === rate) return Promise.resolve(audioBuffer);
        var channels = Math.min(2, audioBuffer.numberOfChannels);
        var offline = new OfflineAudioContext(channels, Math.ceil(audioBuffer.duration * rate), rate);
        var source = offline.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offline.destination);
        source.start();
        return offline.startRendering();
    }

    function encodeMp3(audioBuffer, onProgress) {
        var channels = audioBuffer.numberOfChannels > 1 ? 2 : 1;
        var encoder = new window.lamejs.Mp3Encoder(channels, audioBuffer.sampleRate, 128);
        var left = floatTo16(audioBuffer.getChannelData(0));
        var right = channels === 2 ? floatTo16(audioBuffer.getChannelData(1)) : null;
        var block = 1152;
        var chunks = [];
        var index = 0;

        function step() {
            var stop = Math.min(index + block * 40, left.length);
            for (; index < stop; index += block) {
                var leftChunk = left.subarray(index, index + block);
                var encoded = right
                    ? encoder.encodeBuffer(leftChunk, right.subarray(index, index + block))
                    : encoder.encodeBuffer(leftChunk);
                if (encoded && encoded.length) chunks.push(Uint8Array.from(encoded));
            }
            if (onProgress) onProgress(left.length ? index / left.length : 1);
            if (index < left.length) return new Promise(function (resolve) { setTimeout(resolve, 0); }).then(step);
            var end = encoder.flush();
            if (end && end.length) chunks.push(Uint8Array.from(end));
            return new Blob(chunks, { type: 'audio/mpeg' });
        }

        return Promise.resolve().then(step);
    }

    function isM4a(file) {
        var name = (file.name || '').toLowerCase();
        var type = (file.type || '').toLowerCase();
        return name.endsWith('.m4a') || type === 'audio/mp4' || type === 'audio/x-m4a' || type === 'audio/aac';
    }

    function outputName(file) {
        var fromTitle = '';
        var titleInput = document.querySelector('[data-admin-studio] [data-field="title"]');
        if (titleInput && titleInput.value.trim()) fromTitle = titleInput.value.trim();
        var base = fromTitle || (file.name || 'notebook-output').replace(/\.m4a$/i, '');
        return slug(base) + '.mp3';
    }

    function enableConvertActions(root, enabled) {
        root.querySelectorAll('[data-admin-action="download-mp3"], [data-admin-action="bind-mp3"]').forEach(function (button) {
            button.disabled = !enabled;
        });
    }

    function showMp3(root, blob, name) {
        state.mp3Blob = blob;
        state.mp3Name = name;
        var preview = root.querySelector('[data-convert-preview]');
        var path = root.querySelector('[data-repo-path]');
        if (state.bound && state.bound.url) URL.revokeObjectURL(state.bound.url);
        var url = URL.createObjectURL(blob);
        state.bound = { url: url, name: name };
        if (preview) {
            preview.src = url;
            preview.classList.remove('hidden');
        }
        if (path) path.textContent = 'Repository path: audio/' + name + ' · ' + blob.size + ' bytes · 128 kbps';
        enableConvertActions(root, true);
        bindPlayback(false);
    }

    function bindPlayback(scroll) {
        if (!state.bound) return;
        var medium = document.getElementById('notebookMedium');
        if (medium) medium.value = 'audio';
        if (typeof window.renderSelectedNotebookMedium === 'function') window.renderSelectedNotebookMedium();
        if (scroll) {
            var tray = document.getElementById('notebookPluginTray') || document.getElementById('mediaContainer');
            if (tray) tray.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function convertFile(file, root) {
        var studio = root || document.querySelector('[data-admin-studio]');
        if (!studio) return Promise.reject(new Error('Admin studio is not on this page'));
        if (!file) return Promise.reject(new Error('Choose an .m4a file'));
        if (!isM4a(file)) {
            setConvertStatus(studio, 'This utility accepts .m4a uploads.');
            return Promise.reject(new Error('not m4a'));
        }
        enableConvertActions(studio, false);
        setConvertStatus(studio, 'Decoding ' + file.name + '…');
        var context = new AudioContext();
        return file.arrayBuffer()
            .then(function (buffer) { return context.decodeAudioData(buffer.slice(0)); })
            .then(function (audioBuffer) {
                setConvertStatus(studio, 'Resampling to 44.1 kHz…');
                return resample(audioBuffer);
            })
            .then(function (audioBuffer) {
                setConvertStatus(studio, 'Loading MP3 encoder…');
                return loadLame().then(function () { return audioBuffer; });
            })
            .then(function (audioBuffer) {
                setConvertStatus(studio, 'Encoding MP3…');
                return encodeMp3(audioBuffer, function (ratio) {
                    setConvertStatus(studio, 'Encoding MP3… ' + Math.min(100, Math.round(ratio * 100)) + '%');
                });
            })
            .then(function (blob) {
                var name = outputName(file);
                showMp3(studio, blob, name);
                setConvertStatus(studio, 'Converted ' + file.name + ' → ' + name + '. Playback is bound to the Audio Overview for this session.');
                return context.close().then(function () { return blob; });
            })
            .catch(function (err) {
                setConvertStatus(studio, 'Conversion failed: ' + (err && err.message ? err.message : 'unknown error'));
                if (context && context.close) context.close();
                throw err;
            });
    }

    function downloadMp3() {
        if (!state.mp3Blob) return;
        var link = document.createElement('a');
        link.href = state.bound ? state.bound.url : URL.createObjectURL(state.mp3Blob);
        link.download = state.mp3Name || 'notebook-output.mp3';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function onClick(event) {
        var el = event.target.closest('[data-admin-action]');
        if (!el) return;
        var root = el.closest('[data-admin-studio]');
        if (!root) return;
        var action = el.getAttribute('data-admin-action');
        if (action === 'tag') {
            event.preventDefault();
            toggleTag(root, el.getAttribute('data-tag') || '');
            return;
        }
        if (action === 'add-tag') {
            event.preventDefault();
            addCustomTag(root);
            return;
        }
        if (action === 'stage') {
            event.preventDefault();
            stageFrom(root);
            return;
        }
        if (action === 'save-drop') {
            event.preventDefault();
            saveFrom(root);
            return;
        }
        if (action === 'load-drop') {
            event.preventDefault();
            var id = el.getAttribute('data-id');
            var found = loadDrops().filter(function (drop) { return drop.id === id; })[0];
            if (!found) return;
            applyDropToForm(root, found);
            stageFrom(root);
            return;
        }
        if (action === 'remove-drop') {
            event.preventDefault();
            var removeId = el.getAttribute('data-id');
            saveDrops(loadDrops().filter(function (drop) { return drop.id !== removeId; }));
            paintAll('drops');
            return;
        }
        if (action === 'download-mp3') {
            event.preventDefault();
            downloadMp3();
            return;
        }
        if (action === 'bind-mp3') {
            event.preventDefault();
            bindPlayback(true);
            setConvertStatus(root, 'Bound ' + (state.mp3Name || 'MP3') + ' to the Audio Overview player.');
        }
    }

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        var input = event.target.closest ? event.target.closest('[data-field="custom-tag"]') : null;
        if (!input) return;
        event.preventDefault();
        var root = input.closest('[data-admin-studio]');
        if (root) addCustomTag(root);
    });

    window.MHBOJT_ADMIN = {
        mount: function (root) {
            if (!root) {
                studioNodes().forEach(renderStudio);
                return;
            }
            if (root.getAttribute && root.getAttribute('data-admin-studio') != null) renderStudio(root);
            if (root.querySelectorAll) root.querySelectorAll('[data-admin-studio]').forEach(renderStudio);
        },
        convertFile: convertFile,
        audioFrame: function () {
            if (!state.bound) return null;
            return {
                caption: '🔊 Admin MP3 · ' + state.bound.name,
                badge: 'Audio Overview',
                html: '<audio id="dualHostAudio" src="' + esc(state.bound.url) + '" controls preload="auto" class="w-full accent-amber-400"></audio>' +
                    '<p class="text-[10px] text-slate-500 mt-2">Session binding for ' + esc(state.bound.name) + '. Commit the downloaded file under audio/ to keep it on the production domain.</p>'
            };
        },
        activeDrop: function () {
            if (!state.staged) return null;
            var tags = state.staged.tags || [];
            return {
                medium: state.staged.medium,
                caption: state.staged.title + ' · ' + formatLabel(state.staged.medium),
                banner: [state.staged.title].concat(tags).join(' · ')
            };
        }
    };

    studioNodes().forEach(renderStudio);
})();
