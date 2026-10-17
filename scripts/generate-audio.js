'use strict';

/*
  Export a voiceover mp3 into /assets for the video editor.

  The narration is the SCRIPT below. Pass a text file to speak that instead:
    node scripts/generate-audio.js path/to/script.txt
    node scripts/generate-audio.js --out assets/voiceover.mp3

  Uses the OpenAI speech endpoint, which returns MP3 bytes:
    POST https://api.openai.com/v1/audio/speech
  Set OPENAI_API_KEY. Optional: TTS_VOICE (default onyx), TTS_MODEL (default tts-1-hd).
*/

var fs = require('fs');
var path = require('path');
var https = require('https');

var ROOT = path.resolve(__dirname, '..');
var DEFAULT_OUT = path.join(ROOT, 'assets', 'voiceover.mp3');
var SPEECH_URL = 'https://api.openai.com/v1/audio/speech';
var MAX_CHARS = 4096;

var SCRIPT = [
    'DRAH GOSSSM. Disaster recovery and affordable housing, the global one-stop shop.',
    'The one hundred dollar reservation admits a candidate. It does not neutralize the ten million dollar liability.',
    'Sweat equity is fifty dollars an hour across two hundred thousand hours.',
    'A referral of fifty thousand dollars credits only on a qualified conversion with a Stripe receipt.'
].join(' ');

function looksLikeMp3(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 128) return false;
    if (buf.slice(0, 3).toString('ascii') === 'ID3') return true;
    return buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
}

function speechError(status, buf) {
    var message = '';
    try {
        var parsed = JSON.parse(buf.toString('utf8'));
        message = parsed && parsed.error && parsed.error.message ? String(parsed.error.message) : '';
    } catch (err) {
        message = '';
    }
    if (message) return new Error('Speech endpoint returned ' + status + ': ' + message);
    return new Error('Speech endpoint returned ' + status + '.');
}

function postSpeech(options) {
    var payload = JSON.stringify(options.body);
    var url = new URL(SPEECH_URL);
    return new Promise(function (resolve, reject) {
        var req = https.request({
            protocol: url.protocol,
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + options.apiKey,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, function (res) {
            var chunks = [];
            res.on('data', function (chunk) { chunks.push(chunk); });
            res.on('end', function () {
                var buf = Buffer.concat(chunks);
                if (res.statusCode !== 200) {
                    reject(speechError(res.statusCode, buf));
                    return;
                }
                resolve(buf);
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function generateAudio(options) {
    var text = String(options.text || '').trim();
    var apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    var outFile = options.outFile || DEFAULT_OUT;
    if (!text) return Promise.reject(new Error('The voiceover script is empty.'));
    if (text.length > MAX_CHARS) {
        return Promise.reject(new Error('The voiceover script is longer than ' + MAX_CHARS + ' characters.'));
    }
    if (!apiKey) return Promise.reject(new Error('Set OPENAI_API_KEY to export the voiceover.'));
    var request = options.request || postSpeech;
    return Promise.resolve(request({
        apiKey: apiKey,
        body: {
            model: options.model || process.env.TTS_MODEL || 'tts-1-hd',
            voice: options.voice || process.env.TTS_VOICE || 'onyx',
            input: text,
            response_format: 'mp3'
        }
    })).then(function (audio) {
        if (!looksLikeMp3(audio)) {
            throw new Error('The speech endpoint did not return an mp3.');
        }
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, audio);
        return outFile;
    });
}

function readArgs(argv) {
    var outFile = DEFAULT_OUT;
    var textFile = '';
    var voice = '';
    for (var i = 2; i < argv.length; i++) {
        if (argv[i] === '--out') {
            outFile = path.resolve(argv[i + 1] || '');
            i += 1;
        } else if (argv[i] === '--voice') {
            voice = argv[i + 1] || '';
            i += 1;
        } else if (!textFile) {
            textFile = argv[i];
        }
    }
    var text = textFile ? fs.readFileSync(textFile, 'utf8') : SCRIPT;
    return { outFile: outFile, text: text, voice: voice };
}

function main() {
    var args = readArgs(process.argv);
    return generateAudio(args).then(function (outFile) {
        console.log('Wrote ' + path.relative(ROOT, outFile));
    });
}

module.exports = {
    SCRIPT: SCRIPT,
    DEFAULT_OUT: DEFAULT_OUT,
    SPEECH_URL: SPEECH_URL,
    generateAudio: generateAudio,
    looksLikeMp3: looksLikeMp3,
    readArgs: readArgs
};

if (require.main === module) {
    main().catch(function (err) {
        console.error(err.message || String(err));
        process.exitCode = 1;
    });
}
