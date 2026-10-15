'use strict';

var crypto = require('crypto');

var REFERRAL_BENEFIT_USD = 50000;
var CORRIDORS = { 'jackson-barracks': true, 'tri-parish': true, 'lao-diaspora': true };
var PATHWAYS = { sweat: true, refer: true, sponsor: true, mentor: true };
var LANES = { SL: true, NB: true };
var MODEL = 'gemini-2.5-flash';
var LOCKED_LAYERS = [
    { name: 'Gateway admission', amountUsd: 100 },
    { name: 'Sweat equity liability', amountUsd: 10000000 },
    { name: 'Mentor', amountUsd: 1000000 },
    { name: 'Sponsor', amountUsd: 100000 },
    { name: 'Referral', amountUsd: 50000 }
];

function clean(value, max) {
    return String(value == null ? '' : value).trim().slice(0, max);
}

function readJson(req) {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return Promise.resolve(req.body);
    }
    if (typeof req.body === 'string') {
        if (!req.body) return Promise.resolve({});
        return Promise.resolve(JSON.parse(req.body));
    }
    return new Promise(function (resolve, reject) {
        var chunks = [];
        req.on('data', function (chunk) { chunks.push(chunk); });
        req.on('end', function () {
            var raw = Buffer.concat(chunks).toString('utf8');
            if (!raw) { resolve({}); return; }
            try { resolve(JSON.parse(raw)); }
            catch (err) { reject(err); }
        });
        req.on('error', reject);
    });
}

function incentiveEscrowLedger(referralCode) {
    return {
        recordType: 'IncentiveEscrowLedger',
        benefit: 'referral',
        amountUsd: REFERRAL_BENEFIT_USD,
        unit: 'per converted referral',
        state: 'ATTACHED',
        earnsOn: 'Qualified introduction with a Stripe receipt. A name-drop does not credit.',
        referralCode: referralCode || null
    };
}

function applicantPipelineRecord(input) {
    var referralCode = clean(input.ref || input.referralCode, 40);
    return {
        recordType: 'ApplicantPipelineRecord',
        id: 'apl-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'),
        state: 'INTAKE_LOGGED',
        loggedAt: new Date().toISOString(),
        applicant: {
            name: clean(input.name, 80),
            email: clean(input.email, 120),
            phone: clean(input.phone, 30),
            lane: clean(input.lane, 8),
            corridor: clean(input.corridor, 40),
            pathway: clean(input.role || input.pathway, 20)
        },
        referralCode: referralCode || null,
        incentiveEscrowLedger: incentiveEscrowLedger(referralCode)
    };
}

function problemsFor(record) {
    var person = record.applicant;
    if (!person.name) return 'Enter your name.';
    if (!CORRIDORS[person.corridor]) return 'Choose a corridor to continue.';
    if (!PATHWAYS[person.pathway]) return 'Choose a deployment pathway to continue.';
    if (!LANES[person.lane]) return 'Choose a lane.';
    if (!person.email && !person.phone) return 'Enter an email or a phone number.';
    if (person.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) return 'That email address does not look valid.';
    if (record.referralCode && !/^[A-Za-z0-9._-]{1,40}$/.test(record.referralCode)) {
        return 'Referral codes use letters, numbers, dot, dash, or underscore.';
    }
    return '';
}

function reiSchema(Type) {
    return {
        type: Type.OBJECT,
        properties: {
            capitalStack: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    layers: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                amountUsd: { type: Type.NUMBER },
                                note: { type: Type.STRING }
                            },
                            required: ['name', 'amountUsd', 'note']
                        }
                    }
                },
                required: ['summary', 'layers']
            },
            engineering: {
                type: Type.OBJECT,
                properties: {
                    elevationBfeFt: { type: Type.NUMBER },
                    windLoadMph: { type: Type.NUMBER },
                    basis: { type: Type.STRING }
                },
                required: ['elevationBfeFt', 'windLoadMph', 'basis']
            }
        },
        required: ['capitalStack', 'engineering']
    };
}

function reiPrompt(record) {
    var person = record.applicant;
    return [
        'You are the DRAH REI Reasoning Agent. Return only the structured JSON for this intake.',
        'Do not include the applicant name, email, or phone.',
        'Corridor: ' + person.corridor + '.',
        'Pathway: ' + person.pathway + '.',
        'Lane: ' + person.lane + '.',
        'Referral code on file: ' + (record.referralCode || 'none') + '.',
        'Locked ledger. Use these amounts exactly. Do not invent other dollar figures.',
        'Gateway admission is $100. The gateway admits and does not neutralize the ledger.',
        'Sweat equity is $50 per hour times 200,000 hours, a $10,000,000 liability.',
        'Mentor is $1,000,000.',
        'Sponsor is $100,000.',
        'Referral is $50,000 per converted referral. This intake attaches the benefit. It is not earned until a qualified conversion with a Stripe receipt. A name-drop does not credit.',
        'capitalStack.layers must be exactly these five, in this order, with these amountUsd values and these name strings:',
        '1. name "Gateway admission", amountUsd 100.',
        '2. name "Sweat equity liability", amountUsd 10000000.',
        '3. name "Mentor", amountUsd 1000000.',
        '4. name "Sponsor", amountUsd 100000.',
        '5. name "Referral", amountUsd 50000.',
        'Each note explains that layer in one sentence. summary is one sentence naming the selected corridor and pathway.',
        'Engineering is a planning response for coastal southeast Louisiana. It is not a sealed survey, elevation certificate, or title opinion.',
        'Jackson Barracks and Tri-Parish sit in St. Bernard, Orleans, and Plaquemines.',
        'Lao diaspora is not a single parcel. If the corridor is lao-diaspora, give elevation BFE and wind load for the Tri-Parish housing placement and say Tri-Parish in basis.',
        'elevationBfeFt is base flood elevation in feet. windLoadMph is design wind speed in miles per hour.',
        'basis must name the geographic basis and state that the figures are a planning response, not a sealed survey.',
        'Do not invent a transaction hash, a parcel APN, or a Nevada County elevation.'
    ].join('\n');
}

function finiteNumber(value) {
    var number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? number : null;
}

function normalizeRei(raw, record) {
    var stack = raw && raw.capitalStack;
    var engineering = raw && raw.engineering;
    var layers = stack && stack.layers;
    if (!stack || typeof stack.summary !== 'string' || !stack.summary.trim()) {
        return { ok: false, error: 'The REI reasoning agent did not return a capital stack.' };
    }
    if (!Array.isArray(layers) || layers.length !== LOCKED_LAYERS.length) {
        return { ok: false, error: 'The REI reasoning agent returned a capital stack that does not match the locked ledger.' };
    }
    var normalizedLayers = [];
    for (var i = 0; i < LOCKED_LAYERS.length; i++) {
        var layer = layers[i] || {};
        var amount = finiteNumber(layer.amountUsd);
        if (clean(layer.name, 80) !== LOCKED_LAYERS[i].name || amount !== LOCKED_LAYERS[i].amountUsd) {
            return { ok: false, error: 'The REI reasoning agent returned a capital stack that does not match the locked ledger.' };
        }
        if (typeof layer.note !== 'string' || !layer.note.trim()) {
            return { ok: false, error: 'The REI reasoning agent returned a capital stack layer without a note.' };
        }
        normalizedLayers.push({
            name: LOCKED_LAYERS[i].name,
            amountUsd: LOCKED_LAYERS[i].amountUsd,
            note: clean(layer.note, 400)
        });
    }
    var elevation = engineering && finiteNumber(engineering.elevationBfeFt);
    var wind = engineering && finiteNumber(engineering.windLoadMph);
    var basis = engineering && typeof engineering.basis === 'string' ? engineering.basis.trim() : '';
    if (elevation == null || elevation <= -20 || elevation >= 100) {
        return { ok: false, error: 'The REI reasoning agent returned an elevation BFE outside the accepted planning range.' };
    }
    if (wind == null || wind <= 0 || wind >= 400) {
        return { ok: false, error: 'The REI reasoning agent returned a wind load outside the accepted planning range.' };
    }
    if (!basis) {
        return { ok: false, error: 'The REI reasoning agent did not return an engineering basis.' };
    }
    if (record.applicant.corridor === 'lao-diaspora' && !/tri-parish/i.test(basis)) {
        return { ok: false, error: 'The REI reasoning agent did not tie the Lao diaspora corridor to the Tri-Parish housing placement.' };
    }
    if (!/louisiana|st\.?\s*bernard|orleans|plaquemines|coastal/i.test(basis)) {
        return { ok: false, error: 'The REI reasoning agent did not ground the engineering response in coastal southeast Louisiana.' };
    }
    return {
        ok: true,
        rei: {
            model: MODEL,
            capitalStack: {
                summary: clean(stack.summary, 600),
                layers: normalizedLayers
            },
            engineering: {
                elevationBfeFt: elevation,
                windLoadMph: wind,
                basis: clean(basis, 800)
            }
        }
    };
}

function runReiAgent(record) {
    var apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return Promise.reject(new Error('REI reasoning is unavailable: set GEMINI_API_KEY or GOOGLE_API_KEY.'));
    }
    var genai = require('@google/genai');
    var ai = new genai.GoogleGenAI({ apiKey: apiKey });
    return ai.models.generateContent({
        model: MODEL,
        contents: reiPrompt(record),
        config: {
            responseMimeType: 'application/json',
            responseSchema: reiSchema(genai.Type)
        }
    }).then(function (response) {
        var text = response && typeof response.text === 'string' ? response.text : '';
        if (!text.trim()) {
            throw new Error('The REI reasoning agent returned an empty response.');
        }
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error('The REI reasoning agent did not return valid JSON.');
        }
    });
}

function publicAgentError(err) {
    var message = err && err.message ? String(err.message) : '';
    if (message.indexOf('REI reasoning is unavailable') === 0) return message;
    if (message.indexOf('The REI reasoning agent') === 0) return message;
    return 'The REI reasoning agent did not return a usable response.';
}

function send(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
}

function intake(req, res) {
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.setHeader('Allow', 'POST, OPTIONS');
        res.end();
        return;
    }
    if (req.method !== 'POST') {
        send(res, 405, { ok: false, error: 'POST a JSON intake payload.' });
        return;
    }
    readJson(req).then(function (input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            send(res, 400, { ok: false, error: 'Intake payload must be a JSON object.' });
            return;
        }
        var record = applicantPipelineRecord(input);
        var problem = problemsFor(record);
        if (problem) {
            send(res, 400, { ok: false, error: problem });
            return;
        }
        var reason = typeof intake.reason === 'function' ? intake.reason : runReiAgent;
        return Promise.resolve(reason(record)).then(function (raw) {
            var checked = normalizeRei(raw, record);
            if (!checked.ok) {
                send(res, 502, { ok: false, error: checked.error });
                return;
            }
            send(res, 200, { ok: true, record: record, rei: checked.rei });
        }).catch(function (err) {
            send(res, 502, { ok: false, error: publicAgentError(err) });
        });
    }).catch(function () {
        send(res, 400, { ok: false, error: 'Intake payload must be JSON.' });
    });
}

module.exports = intake;
module.exports.applicantPipelineRecord = applicantPipelineRecord;
module.exports.REFERRAL_BENEFIT_USD = REFERRAL_BENEFIT_USD;
module.exports.normalizeRei = normalizeRei;
module.exports.LOCKED_LAYERS = LOCKED_LAYERS;
