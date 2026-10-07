/* Audio ingestion rule.
   Collect .mp3 and .m4a files from the repository root (one level only)
   and from assets/audio (nested). Pair files that share a basename into
   one HTML5 <audio> track with multiple <source> entries.
   A basename containing "townhall", "town-hall", or "critic" is a
   multi-critic town hall track. Every other file is a podcast variation.
*/
const fs = require('fs');
const path = require('path');

const AUDIO_EXT = {
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4'
};

const TOWNHALL = /town[-_\s]?hall|multi[-_\s]?critic|critic/i;

function roleFor(base) {
    return TOWNHALL.test(base) ? 'townhall' : 'podcast';
}

function labelFor(base) {
    return base
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b([a-z])/g, function (match, letter) { return letter.toUpperCase(); });
}

function addFile(map, root, file) {
    const ext = path.extname(file).toLowerCase();
    if (!AUDIO_EXT[ext]) return;
    const rel = path.relative(root, file).split(path.sep).join('/');
    if (rel.startsWith('.') || rel.split('/').some(function (part) { return part.startsWith('.'); })) return;
    const base = path.basename(rel, ext);
    const dir = path.posix.dirname(rel);
    const id = (dir === '.' ? '' : dir + '/') + base;
    if (!map.has(id)) {
        map.set(id, {
            id: id,
            label: labelFor(base),
            role: roleFor(base),
            sources: []
        });
    }
    map.get(id).sources.push({ src: '/' + rel, type: AUDIO_EXT[ext] });
}

function walk(dir, out) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (entry.isFile()) out.push(full);
    });
}

function catalog(root) {
    const map = new Map();
    fs.readdirSync(root, { withFileTypes: true }).forEach(function (entry) {
        if (entry.isFile()) addFile(map, root, path.join(root, entry.name));
    });
    const nested = [];
    walk(path.join(root, 'assets', 'audio'), nested);
    nested.forEach(function (file) { addFile(map, root, file); });
    const order = { '.mp3': 0, '.m4a': 1 };
    const tracks = Array.from(map.values());
    tracks.forEach(function (track) {
        track.sources.sort(function (a, b) {
            return (order[path.extname(a.src).toLowerCase()] ?? 9) - (order[path.extname(b.src).toLowerCase()] ?? 9);
        });
    });
    tracks.sort(function (a, b) {
        if (a.role !== b.role) return a.role === 'podcast' ? -1 : 1;
        return a.label.localeCompare(b.label);
    });
    return tracks;
}

module.exports = { catalog, roleFor, labelFor };
