'use strict';

var crypto = require('crypto');

var REFERRAL_BENEFIT_USD = 50000;
var CORRIDORS = { 'jackson-barracks': true, 'tri-parish': true, 'lao-diaspora': true };
var PATHWAYS = { sweat: true, refer: true, sponsor: true, mentor: true };
var LANES = { SL: true, NB: true };

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
        send(res, 200, { ok: true, record: record });
    }).catch(function () {
        send(res, 400, { ok: false, error: 'Intake payload must be JSON.' });
    });
}

module.exports = intake;
module.exports.applicantPipelineRecord = applicantPipelineRecord;
module.exports.REFERRAL_BENEFIT_USD = REFERRAL_BENEFIT_USD;
