'use strict';
/** Documentation drift guard: broken referenced paths and missing architecture sections.
 * This is intentionally structural: it cannot prove that prose still describes runtime behavior.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const document = fs.readFileSync(path.join(root, 'ARCHITECTURE.md'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.match(document, /^# Sonic Display – Systemarchitektur/m);
assert.equal(pkg.name, 'sonic-display');
const documented = document.match(/\*\*Dokumentationsstand:\*\* V(\d+)(?:\.\d+)?/);
const released = pkg.version.match(/-v(\d+)/);
assert(documented && released, 'Architecture/release version must be stated explicitly');
assert.equal(documented[1], released[1], 'ARCHITECTURE.md has not been updated for the package release');
for (const section of [
 'System auf einen Blick', 'Einstiegspunkte, Provider und Datenfluss',
 'Serverseitige Integration und Sicherheit', 'Visualisierung und Bühnenarchitektur',
 'Audio- und Zeitquellen', 'Laufzeit, Ressourcen und Raspberry Pi',
 'Datenspeicher und Schutzgrenzen', 'Test- und Build-Architektur',
 'Erweiterungspunkte und Wartungsregeln', 'Weitere Referenzen',
]) assert(document.includes(section), `Architecture section missing: ${section}`);
const sourcePath = /`((?:app|components|config|context|hooks|lib|scripts|services|tests|types)\/[a-zA-Z0-9_./-]+\.(?:ts|tsx|cjs|md|json))`/g;
const references = new Set();
for (const [, ref] of document.matchAll(sourcePath)) references.add(ref);
for (const ref of references) {
 const resolved = path.resolve(root, ref);
 assert(resolved.startsWith(root + path.sep), `Invalid path: ${ref}`);
 assert(fs.existsSync(resolved), `ARCHITECTURE.md references missing source: ${ref}`);
}
assert(references.size >= 40, 'Too few checked architecture source references');
for (const name of ['README.md','SPOTIFY_LOCAL_SETUP.md','V473.4-TYPESCRIPT-BUILD-HOTFIX.md','V473-AUTOMATIC-RAP-FLOW-ADLIBS.md','V456-ULTIMATE-AUTOMATIC-SHOW-DIRECTOR.md','V442-MULTI-ARTIST-STAGE-DIRECTOR.md','V453-EXPRESSIVE-LIP-SYNC-2.md','V463-RASPBERRY-PI-PERFORMANCE-STABILITY.md']) {
 assert(fs.existsSync(path.join(root, name)), `Missing referenced document: ${name}`);
}
console.log(`PASS architecture ${pkg.version}: ${references.size} current code references, 10 sections and linked documentation`);
