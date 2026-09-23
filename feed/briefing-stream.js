/* Sovereign briefing stream.
   Fetches /feed/sovereign-cases.json and renders [data-briefing-ingest].
   Medium chips link the on-page NotebookLM selector when it exists,
   and always expose a real href to /?briefing=&medium=#notebookPluginTray.
   FALLBACK_CATALOG is a same-commit copy used only if the fetch fails. */
(function () {
    var FALLBACK_CATALOG = {"version": "2026-09-23", "title": "Sovereign case studies", "note": "Versioned briefing catalog. Pages fetch this file when they load and when a visitor refreshes. It is not a live news wire.", "cases": [{"id": "lky-sovereign-wealth", "kicker": "Case study · Singapore sovereign wealth", "title": "Lee Kuan Yew's sovereign wealth model", "place": "Singapore", "summary": "A long-horizon national balance sheet: compulsory household savings, a commercial holding company, and a separate reserve manager. The Crystal Dynasty protocol studies this architecture. It does not speak for Singapore's institutions.", "disclaimer": "Historical case study only. No affiliation, endorsement, or claim that Temasek, GIC, CPF, or the Government of Singapore operates this ledger.", "audio": {"lead": "Lee Kuan Yew's government treated surplus as a multi-generational trust. Household savings, commercial assets, and foreign reserves were split across institutions with different jobs.", "beats": ["The Central Provident Fund, created in 1955, is the compulsory savings pillar for housing, retirement, and medical needs.", "Temasek Holdings, incorporated in 1974, commercially manages investments previously held by the Singapore government. It is owned by the Minister for Finance.", "GIC, established in 1981, manages foreign reserves on a long horizon and reports rolling real returns rather than a single promotional fund size.", "The Housing and Development Board, formed in 1960, is the housing expression of that savings model. This site borrows the discipline, not the seal."]}, "slides": [{"title": "Surplus before speculation", "body": "The model starts with public thrift and household savings, then gives professional managers a mandate longer than one election or one market cycle."}, {"title": "Three different jobs", "body": "CPF serves the household. Temasek (1974) holds and manages commercial investments. GIC (1981) stewards foreign reserves. Policy, commerce, and reserves are not the same desk."}, {"title": "Housing is part of the balance sheet", "body": "HDB, from 1960, turned savings into shelter. A sovereign wealth story that ignores housing misses how families actually joined the national ledger."}, {"title": "What this protocol copies", "body": "Separate the household track, the real-asset track, and the long reserve. Publish the rules. Do not pretend an external fund is endorsing the copy."}], "interactive": {"lead": "Walk the four institutions. Each section is a different stewardship job inside one national design.", "sections": [{"heading": "Household savings", "body": "CPF (1955) is compulsory contributions with defined uses: housing, retirement, and healthcare. The individual account is visible. The state does not treat it as discretionary spending money."}, {"heading": "Commercial portfolio", "body": "Temasek (1974) was created so government-linked investments could be owned and managed on commercial terms, under the Minister for Finance, rather than left inside ministries."}, {"heading": "Foreign reserves", "body": "GIC (1981) invests reserves for the long term. Public communication emphasizes multi-decade real returns. This briefing does not invent an assets-under-management figure."}, {"heading": "Transferable lesson", "body": "MHBOJT uses the split: sweat and referral credits for the household, modular shelter as the real asset, and a 1,000-year compounding map as the reserve view. Singapore's institutions are the case, not the operator."}]}, "datatable": {"columns": ["Institution", "Established", "Stewardship job"], "rows": [["Central Provident Fund", "1955", "Compulsory household savings for housing, retirement, and healthcare"], ["Housing and Development Board", "1960", "Public housing as the shelter expression of national savings"], ["Temasek Holdings", "1974", "Commercial owner of investments previously held by the government"], ["GIC", "1981", "Long-horizon manager of Singapore's foreign reserves"]]}, "video": {"lead": "Use the Video Overview when you want the cinematic cut. This case is a reading of public institutional history, not a film produced by those institutions.", "cue": "Pair it with the Charlie Munger archive already on the NotebookLM selector when you need a second long-horizon voice beside the Singapore case."}, "mindmap": [{"label": "Sovereign wealth model", "children": ["Fiscal surplus", "Professional mandate", "Intergenerational horizon"]}, {"label": "Household", "children": ["CPF 1955", "HDB 1960"]}, {"label": "State balance sheet", "children": ["Temasek 1974", "GIC 1981"]}, {"label": "Protocol copy", "children": ["Action Tracks", "Modular shelter", "1,000-year map"]}], "reports": {"lead": "Findings a Selfless Leader can use without over-claiming the source.", "findings": ["The model separates household savings, commercial assets, and foreign reserves.", "Dates that matter in public record: CPF 1955, HDB 1960, Temasek 1974, GIC 1981.", "Lee Kuan Yew (Prime Minister 1959–1990) is the political context of the build-out, not a brand on this site.", "No portfolio mark is republished here. GIC's own reporting stresses long-horizon real returns."]}, "flashcards": [{"front": "What is Temasek's job in this case?", "back": "Commercial stewardship, from 1974, of investments previously held by the Singapore government."}, {"front": "What is GIC's job?", "back": "Long-horizon management of foreign reserves, established in 1981."}, {"front": "Does this site operate CPF or Temasek?", "back": "No. The card is a case study the protocol studies."}], "quiz": [{"prompt": "Which institution was established in 1981 to manage Singapore's foreign reserves?", "choices": ["Temasek Holdings", "GIC", "HDB", "CPF"], "answer": "GIC"}, {"prompt": "How should a visitor read this card?", "choices": ["As an endorsement by the Government of Singapore", "As a case study of institutional design", "As a claim that Temasek runs the MHBOJT ledger", "As a live fund-size quote"], "answer": "As a case study of institutional design"}], "infographic": [{"label": "CPF", "value": "1955"}, {"label": "HDB", "value": "1960"}, {"label": "Temasek", "value": "1974"}, {"label": "GIC", "value": "1981"}], "artifact": {"icon": "🏦", "title": "Sovereign split icon", "body": "Three desks, one horizon: household savings, commercial assets, foreign reserves."}}, {"id": "regional-resilient-housing", "kicker": "Field case · Tri-Parish shelter", "title": "Regional resilient housing", "place": "St. Bernard, Orleans, and Plaquemines", "summary": "The institute's own housing case: a 48-acre Smart Living campus in St. Bernard Parish, a National Guard pipeline at Jackson Barracks, and modular shelter credited through sweat equity.", "disclaimer": "Field case published by this platform. Component #001 and #002 are program briefs, not a scraped municipal award or a completed census of built homes.", "audio": {"lead": "Resilient housing here means the shelter stays in the parish that trains the people. Hours, lots, and reservations are recorded before anyone talks about a token.", "beats": ["Component #001 is the 48-acre St. Bernard Smart Living campus.", "Component #002 is the Jackson Barracks National Guard pipeline into Tri-Parish placement.", "The geography is St. Bernard, Orleans, and Plaquemines.", "Sweat equity is logged at $50 an hour. The gateway reservation is $100. Neither figure is a promise of a finished house."]}, "slides": [{"title": "Shelter is the real asset", "body": "The regional case is modular housing and campus land, not a paper yield. The feed names the yards before the ledger names the credits."}, {"title": "Two published components", "body": "Component #001: St. Bernard 48-acre campus. Component #002: Jackson Barracks and the Tri-Parish housing campaign."}, {"title": "Who the brief is for", "body": "Selfless Leaders, Nation Builders, Guardsmen, recovery households, and sponsors. Incoming candidates read the 5W1H, then run Action Tracks."}, {"title": "What is still a brief", "body": "Priority language on the campus page is the first 200 reservations. This card does not claim those homes are already delivered."}], "interactive": {"lead": "Move from the parish map to the credit rule. Each section is a gate, not a slogan.", "sections": [{"heading": "Campus", "body": "The 48-acre Smart Living campus is Component #001, anchored in the Chalmette / Meraux area of St. Bernard Parish. Open that feed for the 5W1H and the map."}, {"heading": "Guard pipeline", "body": "Jackson Barracks is Component #002. Service and training hours are the story; the campaign routes them toward Tri-Parish housing equity at the published $50/hr sweat rate."}, {"heading": "Tri-Parish households", "body": "St. Bernard, Orleans, and Plaquemines are the recovery geography named on the Guard feed, including scattered lots in Meraux and Chalmette."}, {"heading": "Gateway", "body": "The $100 reservation is the published Stripe gateway. It admits a candidate to the pipeline. It does not, by itself, neutralize the $10,000,000 franchise liability."}]}, "datatable": {"columns": ["Corridor", "Component", "Published marker"], "rows": [["St. Bernard Smart Living campus", "#001", "48 acres · first 200 reservations"], ["Jackson Barracks pipeline", "#002", "Guard hours into Tri-Parish placement"], ["Tri-Parish geography", "Field", "St. Bernard, Orleans, Plaquemines"], ["Sweat equity", "Action Track", "$50 per hour"], ["Reservation gateway", "Stripe", "$100"]]}, "video": {"lead": "The Video Overview can cut to the St. Bernard site feed or the National Guard campaign. Those are on-site pages, not external live cameras.", "cue": "In the NotebookLM selector choose Video Overview, then St. Bernard Site Feed or National Guard Campaign."}, "mindmap": [{"label": "Regional shelter", "children": ["Modular build", "Campus land", "Recovery households"]}, {"label": "Component #001", "children": ["48 acres", "St. Bernard Parish"]}, {"label": "Component #002", "children": ["Jackson Barracks", "Tri-Parish placement"]}, {"label": "Intake", "children": ["$50/hr sweat", "$100 reservation"]}], "reports": {"lead": "Operational findings from the published component briefs.", "findings": ["Housing resilience is defined here as parish-anchored shelter plus a training pipeline.", "Two components are live in the feed: the campus and the Guard campaign.", "Sweat is priced at $50/hr. The reservation gateway is $100.", "Delivery claims stop at what those pages actually publish."]}, "flashcards": [{"front": "What is Component #001?", "back": "The 48-acre St. Bernard Smart Living campus."}, {"front": "What is Component #002?", "back": "The Jackson Barracks National Guard and Tri-Parish housing campaign."}, {"front": "What does the $100 reservation do?", "back": "It is the gateway deposit. It does not by itself clear the $10M liability."}], "quiz": [{"prompt": "Which component is the 48-acre campus?", "choices": ["#002 National Guard", "#001 St. Bernard", "#003 FinAcademy", "The Stripe receipt"], "answer": "#001 St. Bernard"}, {"prompt": "Which parishes does the Guard brief name?", "choices": ["Only Orleans", "St. Bernard, Orleans, and Plaquemines", "Baton Rouge and Lafayette", "Singapore"], "answer": "St. Bernard, Orleans, and Plaquemines"}], "infographic": [{"label": "Campus", "value": "48 acres"}, {"label": "Reservations", "value": "First 200"}, {"label": "Sweat", "value": "$50/hr"}, {"label": "Gateway", "value": "$100"}], "artifact": {"icon": "🏠", "title": "Parish shelter icon", "body": "Campus, Guard pipeline, and Tri-Parish lots on one intake."}, "related": [{"href": "/feed/st-bernard/", "label": "Open Component #001"}, {"href": "/feed/national-guard/", "label": "Open Component #002"}]}, {"id": "rwa-tokenization", "kicker": "Protocol case · RWA ledger", "title": "RWA tokenization", "place": "MHBOJT component ledger", "summary": "Real-world asset tokenization on this platform means a ledger of shelter, sweat, and sponsorship. An 80-year-old's referral and an apprentice's hours are entries on the same 200+ component map.", "disclaimer": "Design case for this ledger. Not an offer of a security, not a live token price, and not a promise that a $100 reservation becomes a $100,000,000 enterprise.", "audio": {"lead": "DIFY — Do It For You / Perpetuity — is how someone who will never swing a hammer still appears on the ledger: wisdom, referrals, and sponsorship beside the apprentice who builds the module.", "beats": ["The published scale path runs from a $100 reservation through training, support, and funding toward a $100,000,000 enterprise. That is an operating range, not a return.", "Sweat equity is $50 an hour, capped at 200,000 hours against the $10,000,000 franchise liability.", "Mentors credit $1,000,000, sponsors $100,000, referrals $50,000.", "The 200+ figure is the component map used across the site, not 200 issued tokens."]}, "slides": [{"title": "Token means a ledger entry", "body": "Here a real-world asset token is a recorded claim on work or shelter: hours, a mentor seat, a sponsor, a referral, a reservation. It is not a ticker."}, {"title": "DIFY", "body": "Do It For You / Perpetuity lets a grandparent contribute wisdom and referrals, or an apprentice contribute modular-housing hours, on one 1,000-year map."}, {"title": "Action Track math", "body": "$10,000,000 is neutralized by 200,000 hours at $50, or by 10 mentors, 100 sponsors, or 200 referrals. The calculator is the audit."}, {"title": "Scale path", "body": "The published path starts at the $100 reservation and describes growth toward a $100,000,000 enterprise through training, support, and funding."}], "interactive": {"lead": "Open a track, read the credit, then jump to the Crystal Dynasty sliders to run it.", "sections": [{"heading": "Sweat", "body": "$50 per hour. The liability cap used on this site is 200,000 hours, because 200,000 × $50 = $10,000,000. Ongoing hours only credit while the cap still has room."}, {"heading": "Mentors, sponsors, referrals", "body": "Mentor $1,000,000 (10 clear the liability). Sponsor $100,000 (100). Referral $50,000 (200). These are Action Track offsets, not interest."}, {"heading": "DIFY seats", "body": "The 80-year-old path is referral and sponsorship. The apprentice path is logged hours on modular housing. Both are meant to be visible on the same component ledger."}, {"heading": "What the token is not", "body": "This catalog does not quote a market price, a chain, or a yield. The 200+ count is the enterprise component map. The $100 to $100,000,000 line is the stated scale path."}]}, "datatable": {"columns": ["Track", "Credit", "Count to offset $10M"], "rows": [["Sweat equity", "$50 / hour", "200,000 hours"], ["Mentor", "$1,000,000", "10"], ["Sponsor", "$100,000", "100"], ["Referral", "$50,000", "200"], ["Reservation gateway", "$100", "Not a liability offset"]]}, "video": {"lead": "The Video Overview for this case is the institute's own dual-host brief plus the cinematic source already wired in the selector.", "cue": "Switch to Video Overview after this card links. The Munger archive is the long-horizon external voice; the feed pages are the local proof."}, "mindmap": [{"label": "RWA ledger", "children": ["Shelter", "Sweat", "Sponsorship"]}, {"label": "DIFY", "children": ["Grandparent referral", "Apprentice hours"]}, {"label": "Offsets", "children": ["$50/hr", "$1M mentor", "$100k sponsor", "$50k referral"]}, {"label": "Scale path", "children": ["$100 reservation", "Training and funding", "$100,000,000 enterprise range"]}], "reports": {"lead": "Ledger findings a visitor can check against the calculator.", "findings": ["RWA on this site is a component ledger for real work and real shelter.", "Liability math is integer-clean: $10,000,000 / $50 = 200,000 hours.", "DIFY is the perpetuity seat for people who contribute wisdom, referrals, or labor.", "No token price is streamed because this catalog does not have one."]}, "flashcards": [{"front": "What does RWA mean on this site?", "back": "A ledger entry for shelter, sweat, or sponsorship — not a live token price."}, {"front": "How many sweat hours offset $10,000,000 at $50/hr?", "back": "200,000 hours."}, {"front": "What is DIFY?", "back": "Do It For You / Perpetuity: referrals and wisdom or apprentice labor on one legacy map."}], "quiz": [{"prompt": "How many $50 hours offset the $10,000,000 liability?", "choices": ["10,000", "50,000", "200,000", "1,000,000"], "answer": "200,000"}, {"prompt": "What is the $100 Stripe charge in this case?", "choices": ["A token price", "A liability offset of $10M", "The reservation gateway", "A dividend"], "answer": "The reservation gateway"}], "infographic": [{"label": "Sweat", "value": "$50/hr"}, {"label": "Hour cap", "value": "200,000"}, {"label": "Liability", "value": "$10M"}, {"label": "Gateway", "value": "$100"}], "artifact": {"icon": "💠", "title": "Component ledger icon", "body": "One map for a referral, a sponsor, and an hour on a modular house."}, "related": [{"href": "/#dynasty", "label": "Open the Crystal Dynasty engine"}]}]};
    var PRIMARY = ['audio', 'interactive', 'slides', 'datatable'];
    var MEDIA = [
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
    var state = {
        catalog: null,
        source: '',
        fetchedAt: null,
        error: '',
        caseId: '',
        medium: 'audio',
        linked: false,
        slide: 0,
        flash: 0,
        flashFace: 'front',
        quizResult: ''
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

    function catalogUrl() {
        return originRoot() + '/feed/sovereign-cases.json';
    }

    function audioFile() {
        return originRoot() + '/drah-dual-host-overview.mp3';
    }

    function absHref(path) {
        if (!path) return originRoot() + '/';
        if (/^https?:\/\//.test(path)) return path;
        return originRoot() + path;
    }

    function hubUrl(id, medium) {
        return originRoot() + '/?briefing=' + encodeURIComponent(id) + '&medium=' + encodeURIComponent(medium) + '#notebookPluginTray';
    }

    function mediaByKey(key) {
        for (var i = 0; i < MEDIA.length; i++) {
            if (MEDIA[i].key === key) return MEDIA[i];
        }
        return MEDIA[0];
    }

    function cases() {
        return (state.catalog && state.catalog.cases) || [];
    }

    function findCase(id) {
        var list = cases();
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) return list[i];
        }
        return null;
    }

    function activeCase() {
        return findCase(state.caseId) || cases()[0] || null;
    }

    function chip(item, key) {
        var primary = PRIMARY.indexOf(key) !== -1;
        var current = state.caseId === item.id && state.medium === key;
        var cls = primary
            ? 'inline-flex items-center border font-bold px-2 py-1 rounded text-[10px] '
            : 'inline-flex items-center border px-2 py-1 rounded text-[10px] ';
        cls += current
            ? 'bg-amber-500 text-slate-950 border-amber-400'
            : (primary
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-500/40');
        return '<a href="' + esc(hubUrl(item.id, key)) + '" data-briefing-action="medium" data-case="' + esc(item.id) + '" data-medium="' + esc(key) + '" class="' + cls + '">' + esc(mediaByKey(key).label) + '</a>';
    }

    function listHtml(items) {
        return '<ul class="text-[11px] text-slate-300 space-y-1 list-disc list-inside">' +
            (items || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
            '</ul>';
    }

    function mediumHtml(item, key, scope) {
        var quizScope = scope || 'stage';
        var media = item[key] || {};
        if (key === 'audio') {
            return '<div class="space-y-2 text-left">' +
                '<p class="text-xs text-slate-200 leading-relaxed">' + esc(media.lead) + '</p>' +
                listHtml(media.beats) +
                '<audio controls preload="metadata" class="w-full accent-amber-400" src="' + esc(audioFile()) + '"></audio>' +
                '<p class="text-[10px] text-slate-500">Shared dual-host file for this institute. The case transcript above is what this card adds. Switching format does not wait on a new upload.</p>' +
                '</div>';
        }
        if (key === 'slides') {
            var slides = media || [];
            var index = Math.max(0, Math.min(state.slide, slides.length - 1));
            var slide = slides[index] || { title: 'Untitled', body: '' };
            return '<div class="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-left">' +
                '<div class="text-[9px] uppercase tracking-widest text-amber-400">Slide ' + (index + 1) + ' / ' + slides.length + '</div>' +
                '<h4 class="text-sm font-bold text-white">' + esc(slide.title) + '</h4>' +
                '<p class="text-[11px] text-slate-300 leading-relaxed">' + esc(slide.body) + '</p>' +
                '<div class="flex items-center justify-between gap-2">' +
                '<button type="button" data-briefing-action="slide" data-delta="-1" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]">◀ Prev</button>' +
                '<span class="text-[10px] font-mono text-slate-400">' + (index + 1) + ' / ' + slides.length + '</span>' +
                '<button type="button" data-briefing-action="slide" data-delta="1" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]">Next ▶</button>' +
                '</div></div>';
        }
        if (key === 'interactive') {
            var sections = (media.sections || []).map(function (section, i) {
                return '<section id="case-' + esc(item.id) + '-s' + i + '" class="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">' +
                    '<h4 class="text-xs font-bold text-white">' + esc(section.heading) + '</h4>' +
                    '<p class="text-[11px] text-slate-300 leading-relaxed">' + esc(section.body) + '</p></section>';
            }).join('');
            var jumps = (media.sections || []).map(function (section, i) {
                return '<a href="#case-' + esc(item.id) + '-s' + i + '" class="text-[10px] text-amber-400 hover:text-amber-300">' + esc(section.heading) + '</a>';
            }).join('');
            return '<div class="space-y-3 text-left"><p class="text-xs text-slate-200">' + esc(media.lead) + '</p>' +
                '<div class="flex flex-wrap gap-2">' + jumps + '</div>' + sections + '</div>';
        }
        if (key === 'datatable') {
            var head = (media.columns || []).map(function (col) {
                return '<th class="py-2 px-2 font-semibold">' + esc(col) + '</th>';
            }).join('');
            var rows = (media.rows || []).map(function (row) {
                return '<tr>' + row.map(function (cell) {
                    return '<td class="py-2 px-2 text-slate-300">' + esc(cell) + '</td>';
                }).join('') + '</tr>';
            }).join('');
            return '<div class="overflow-x-auto text-left"><table class="w-full text-left font-mono text-[11px]"><thead class="text-slate-400 border-b border-slate-800"><tr>' +
                head + '</tr></thead><tbody class="divide-y divide-slate-900">' + rows + '</tbody></table></div>';
        }
        if (key === 'video') {
            return '<div class="space-y-2 text-left"><p class="text-xs text-slate-200 leading-relaxed">' + esc(media.lead) + '</p>' +
                '<p class="text-[11px] text-slate-400">' + esc(media.cue) + '</p></div>';
        }
        if (key === 'mindmap') {
            var branches = (media || []).map(function (branch) {
                return '<li class="text-xs text-white"><span class="text-amber-400 font-bold">' + esc(branch.label) + '</span>' +
                    '<ul class="mt-1 ml-4 list-disc text-[11px] text-slate-300">' +
                    (branch.children || []).map(function (child) { return '<li>' + esc(child) + '</li>'; }).join('') +
                    '</ul></li>';
            }).join('');
            return '<ul class="space-y-2 text-left">' + branches + '</ul>';
        }
        if (key === 'reports') {
            return '<div class="space-y-2 text-left"><p class="text-xs text-slate-200">' + esc(media.lead) + '</p>' + listHtml(media.findings) + '</div>';
        }
        if (key === 'flashcards') {
            var cards = media || [];
            var card = cards[state.flash] || { front: '', back: '' };
            var showBack = state.flashFace === 'back';
            return '<div class="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-center">' +
                '<div class="' + (showBack ? 'hidden' : '') + ' text-sm font-bold text-white">' + esc(card.front) + '</div>' +
                '<div class="' + (showBack ? '' : 'hidden') + ' text-xs text-amber-400">' + esc(card.back) + '</div>' +
                '<div class="flex justify-center gap-2">' +
                '<button type="button" data-briefing-action="flash" data-delta="-1" class="bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]">◀</button>' +
                '<button type="button" data-briefing-action="flash" data-delta="0" class="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded text-[10px]">Flip</button>' +
                '<button type="button" data-briefing-action="flash" data-delta="1" class="bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]">▶</button>' +
                '</div><div class="text-[10px] font-mono text-slate-500">' + (cards.length ? (state.flash + 1) : 0) + ' / ' + cards.length + '</div></div>';
        }
        if (key === 'quiz') {
            var questions = (media || []).map(function (q, i) {
                var choices = (q.choices || []).map(function (choice) {
                    return '<label class="text-[11px] text-slate-300 flex items-center gap-1"><input type="radio" name="sq-' + esc(quizScope) + '-' + esc(item.id) + '-' + i + '" value="' + esc(choice) + '" class="accent-amber-400"> ' + esc(choice) + '</label>';
                }).join('');
                return '<article class="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2"><h4 class="text-xs font-bold text-white">' + (i + 1) + '. ' + esc(q.prompt) + '</h4><div class="flex flex-wrap gap-2">' + choices + '</div></article>';
            }).join('');
            return '<div class="space-y-3 text-left" data-quiz-root="' + esc(item.id) + '" data-quiz-scope="' + esc(quizScope) + '">' + questions +
                '<button type="button" data-briefing-action="quiz" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded text-xs">Score this case</button>' +
                '<div data-quiz-score class="' + (state.quizResult ? '' : 'hidden') + ' text-center text-lg font-mono font-extrabold text-amber-400">' + esc(state.quizResult) + '</div></div>';
        }
        if (key === 'infographic') {
            var tiles = (media || []).map(function (tile) {
                return '<div class="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center"><div class="text-[9px] uppercase text-slate-400">' + esc(tile.label) + '</div><div class="text-lg font-mono text-amber-400">' + esc(tile.value) + '</div></div>';
            }).join('');
            return '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">' + tiles + '</div>';
        }
        if (key === 'artifact') {
            return '<div class="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center"><div class="text-3xl">' + esc(media.icon || '✦') + '</div>' +
                '<h4 class="text-sm font-bold text-white mt-2">' + esc(media.title) + '</h4>' +
                '<p class="text-[11px] text-slate-400 mt-1">' + esc(media.body) + '</p></div>';
        }
        return '<p class="text-xs text-slate-400">This format is not in the catalog yet.</p>';
    }

    function frameFor(medium) {
        if (!state.linked) return null;
        var item = activeCase();
        if (!item) return null;
        var spec = mediaByKey(medium);
        return {
            caption: item.title + ' · ' + spec.label,
            badge: spec.label,
            html: mediumHtml(item, spec.key, 'notebook')
        };
    }

    function statusText() {
        if (state.error) return state.error;
        if (!state.catalog) return 'Fetching sovereign case catalog…';
        var stamp = state.fetchedAt ? state.fetchedAt.toLocaleTimeString() : '';
        return 'Ingested ' + stamp + ' · ' + cases().length + ' case studies · ' + state.source + ' · v' + (state.catalog.version || '');
    }

    function stageHtml(item) {
        if (!item) return '';
        var spec = mediaByKey(state.medium);
        var related = (item.related || []).map(function (link) {
            return '<a href="' + esc(absHref(link.href)) + '" class="text-[10px] text-amber-400 hover:text-amber-300">' + esc(link.label) + '</a>';
        }).join('');
        var hasSelector = !!document.getElementById('notebookMedium');
        var selectorLink = '<a href="' + esc(hubUrl(item.id, spec.key)) + '" data-briefing-action="open-hub" class="text-[10px] font-bold text-amber-400 hover:text-amber-300">Open in the 11-item NotebookLM selector ↗</a>';
        var unlink = state.linked && hasSelector
            ? '<button type="button" data-briefing-action="unlink" class="text-[10px] text-slate-400 hover:text-amber-300">Return selector to studio default</button>'
            : '';
        var mode = hasSelector ? (state.linked ? 'Selector linked' : 'Preview') : 'Feed stream';
        return '<div data-briefing-stage class="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-3">' +
            '<div class="flex flex-wrap justify-between items-start gap-2">' +
            '<div><div class="text-[9px] uppercase tracking-widest text-amber-400">' + esc(spec.label) + '</div>' +
            '<h4 class="text-sm font-bold text-white">' + esc(item.title) + '</h4></div>' +
            '<span class="text-[9px] font-mono text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">' + mode + '</span></div>' +
            mediumHtml(item, spec.key, 'stage') +
            '<p class="text-[10px] text-slate-500">' + esc(item.disclaimer || '') + '</p>' +
            '<div class="flex flex-wrap gap-3 items-center">' + selectorLink + unlink + related + '</div></div>';
    }

    function cardHtml(item) {
        var active = item.id === state.caseId;
        var primary = PRIMARY.map(function (key) { return chip(item, key); }).join('');
        var secondary = MEDIA.filter(function (spec) { return PRIMARY.indexOf(spec.key) === -1; })
            .map(function (spec) { return chip(item, spec.key); }).join('');
        return '<article data-case-card="' + esc(item.id) + '" class="bg-slate-950 border ' + (active ? 'border-amber-400' : 'border-slate-800') + ' rounded-xl p-4 space-y-3 text-left">' +
            '<div class="text-[9px] uppercase tracking-widest text-amber-400">' + esc(item.kicker) + '</div>' +
            '<h3 class="text-sm font-bold text-white"><a href="' + esc(hubUrl(item.id, 'audio')) + '" data-briefing-action="medium" data-case="' + esc(item.id) + '" data-medium="audio" class="hover:text-amber-300">' + esc(item.title) + '</a></h3>' +
            '<p class="text-[10px] text-slate-500">' + esc(item.place) + '</p>' +
            '<p class="text-[11px] text-slate-300 leading-relaxed">' + esc(item.summary) + '</p>' +
            '<div class="flex flex-wrap gap-1.5">' + primary + '</div>' +
            '<div class="flex flex-wrap gap-1.5">' + secondary + '</div></article>';
    }

    function shell(inner) {
        return '<div class="space-y-4">' +
            '<div class="flex flex-wrap justify-between items-start gap-3">' +
            '<div><div class="text-[9px] uppercase tracking-widest text-emerald-400">Sovereign case stream</div>' +
            '<h3 class="text-sm font-bold text-white">Briefing feed ingestion</h3>' +
            '<p class="text-[11px] text-slate-400 max-w-2xl mt-1">Three real-world cases load from the sovereign catalog. Every format chip links the 11-item NotebookLM selector: Audio Overview, Interactive Report, Slide Deck, and Data Table are the primary switches.</p></div>' +
            '<div class="text-right space-y-1"><p data-ingest-status class="text-[10px] font-mono text-slate-400">' + esc(statusText()) + '</p>' +
            '<button type="button" data-briefing-action="refresh" class="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded text-[10px]">Refresh catalog</button></div></div>' +
            inner + '</div>';
    }

    function renderNode(node) {
        if (!state.catalog) {
            node.innerHTML = shell('<p class="text-xs text-slate-400">' + esc(state.error || 'Waiting for /feed/sovereign-cases.json') + '</p>');
            return;
        }
        var item = activeCase();
        node.innerHTML = shell(
            '<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">' + cases().map(cardHtml).join('') + '</div>' +
            stageHtml(item)
        );
    }

    function paint() {
        var nodes = document.querySelectorAll('[data-briefing-ingest]');
        for (var i = 0; i < nodes.length; i++) renderNode(nodes[i]);
    }

    function remember() {
        var tray = document.getElementById('notebookPluginTray');
        if (!tray || !state.linked) return;
        var path = location.pathname || '/';
        if (path !== '/' && path !== '/index.html') return;
        var next = '/?briefing=' + encodeURIComponent(state.caseId) + '&medium=' + encodeURIComponent(state.medium) + (location.hash || '');
        history.replaceState(null, '', next);
    }

    function syncSelector() {
        var select = document.getElementById('notebookMedium');
        if (select && state.linked) {
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].value === state.medium) {
                    select.value = state.medium;
                    break;
                }
            }
        }
        if (state.linked && typeof window.renderSelectedNotebookMedium === 'function') {
            window.renderSelectedNotebookMedium();
        }
    }

    function refreshMedia() {
        paint();
        if (state.linked) syncSelector();
    }

    function activate(id, medium, link) {
        var item = findCase(id) || activeCase();
        if (!item) return;
        state.caseId = item.id;
        state.medium = mediaByKey(medium).key;
        state.slide = 0;
        state.flash = 0;
        state.flashFace = 'front';
        state.quizResult = '';
        if (link) state.linked = true;
        paint();
        if (state.linked) {
            remember();
            syncSelector();
        }
    }

    function unlink() {
        state.linked = false;
        paint();
        if (typeof window.renderSelectedNotebookMedium === 'function') {
            window.renderSelectedNotebookMedium();
        }
        var path = location.pathname || '/';
        if ((path === '/' || path === '/index.html') && location.search.indexOf('briefing=') !== -1) {
            history.replaceState(null, '', path + (location.hash || ''));
        }
    }

    function stepSlide(delta) {
        var item = activeCase();
        var slides = (item && item.slides) || [];
        if (!slides.length) return;
        state.slide = (state.slide + delta + slides.length) % slides.length;
        refreshMedia();
    }

    function stepFlash(delta) {
        var item = activeCase();
        var cards = (item && item.flashcards) || [];
        if (!cards.length) return;
        if (delta === 0) {
            state.flashFace = state.flashFace === 'back' ? 'front' : 'back';
        } else {
            state.flash = (state.flash + delta + cards.length) % cards.length;
            state.flashFace = 'front';
        }
        refreshMedia();
    }

    function scoreQuiz(target) {
        var root = target.closest('[data-quiz-root]');
        var item = activeCase();
        if (!root || !item) return;
        var questions = item.quiz || [];
        var scopeName = root.getAttribute('data-quiz-scope') || 'stage';
        var correct = 0;
        questions.forEach(function (q, i) {
            var chosen = root.querySelector('input[name="sq-' + scopeName + '-' + item.id + '-' + i + '"]:checked');
            if (chosen && chosen.value === q.answer) correct += 1;
        });
        state.quizResult = correct + ' / ' + questions.length;
        var scores = document.querySelectorAll('[data-quiz-score]');
        for (var i = 0; i < scores.length; i++) {
            scores[i].textContent = state.quizResult;
            scores[i].classList.remove('hidden');
        }
    }

    function onClick(event) {
        var el = event.target.closest('[data-briefing-action]');
        if (!el) return;
        var action = el.getAttribute('data-briefing-action');
        if (action === 'refresh') {
            event.preventDefault();
            loadCatalog();
            return;
        }
        if (action === 'unlink') {
            event.preventDefault();
            unlink();
            return;
        }
        if (action === 'slide') {
            event.preventDefault();
            stepSlide(Number(el.getAttribute('data-delta')) || 0);
            return;
        }
        if (action === 'flash') {
            event.preventDefault();
            stepFlash(Number(el.getAttribute('data-delta')) || 0);
            return;
        }
        if (action === 'quiz') {
            event.preventDefault();
            scoreQuiz(el);
            return;
        }
        if (action === 'open-hub') {
            if (document.getElementById('notebookPluginTray')) {
                event.preventDefault();
                activate(state.caseId, state.medium, true);
                document.getElementById('notebookPluginTray').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }
        if (action === 'medium') {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            activate(el.getAttribute('data-case'), el.getAttribute('data-medium') || 'audio', true);
        }
    }

    function applyIncoming() {
        var params = new URLSearchParams(location.search);
        var requested = params.get('briefing');
        var medium = params.get('medium') || state.medium || 'audio';
        if (requested && findCase(requested)) {
            activate(requested, medium, true);
            return;
        }
        if (!state.caseId && cases()[0]) {
            state.caseId = cases()[0].id;
            state.medium = 'audio';
            paint();
        } else {
            paint();
            if (state.linked) syncSelector();
        }
    }

    function acceptCatalog(data, source) {
        if (!data || !data.cases || !data.cases.length) throw new Error('Catalog has no cases');
        state.catalog = data;
        state.source = source;
        state.fetchedAt = new Date();
        state.error = '';
        applyIncoming();
    }

    function loadCatalog() {
        state.error = '';
        var statusNodes = document.querySelectorAll('[data-ingest-status]');
        for (var i = 0; i < statusNodes.length; i++) statusNodes[i].textContent = 'Fetching sovereign case catalog…';
        fetch(catalogUrl(), { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) { acceptCatalog(data, 'live JSON'); })
            .catch(function (err) {
                if (FALLBACK_CATALOG && FALLBACK_CATALOG.cases) {
                    acceptCatalog(FALLBACK_CATALOG, 'embedded catalog');
                    return;
                }
                state.error = 'Catalog unavailable (' + (err && err.message ? err.message : 'fetch failed') + ')';
                paint();
            });
    }

    window.MHBOJT = {
        mount: function (root) {
            if (!root) {
                paint();
                return;
            }
            var nodes = root.querySelectorAll ? root.querySelectorAll('[data-briefing-ingest]') : [];
            if (root.getAttribute && root.getAttribute('data-briefing-ingest') != null) {
                renderNode(root);
            }
            for (var i = 0; i < nodes.length; i++) renderNode(nodes[i]);
            if (state.linked && document.getElementById('notebookMedium')) syncSelector();
        },
        frameFor: frameFor,
        linkedLabel: function () {
            if (!state.linked) return '';
            var item = activeCase();
            return item ? item.kicker : '';
        },
        noteSelector: function (medium) {
            if (!state.linked || !medium || medium === state.medium) return;
            state.medium = mediaByKey(medium).key;
            state.slide = 0;
            state.flash = 0;
            state.flashFace = 'front';
            state.quizResult = '';
            paint();
        }
    };

    document.addEventListener('click', onClick);
    paint();
    loadCatalog();
})();
