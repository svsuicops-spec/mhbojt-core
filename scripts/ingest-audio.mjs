/* Write assets/audio/manifest.json from the audio ingestion rule.
   Run automatically in CI when an .mp3 or .m4a is pushed, and locally
   with: node scripts/ingest-audio.mjs
*/
import { createRequire } from 'module';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { catalog } = require('./audio-catalog.js');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tracks = catalog(root);
const version = createHash('sha256').update(JSON.stringify(tracks)).digest('hex').slice(0, 12);
const manifest = {
    version: version,
    rule: 'Root *.mp3 and *.m4a, plus everything under assets/audio. Same basename pairs into one player. townhall / town-hall / critic names are town hall tracks.',
    tracks: tracks
};
const dir = path.join(root, 'assets', 'audio');
fs.mkdirSync(dir, { recursive: true });
const dest = path.join(dir, 'manifest.json');
fs.writeFileSync(dest, JSON.stringify(manifest, null, 2) + '\n');
console.log('Wrote ' + path.relative(root, dest) + ' (' + tracks.length + ' tracks, ' + version + ')');
