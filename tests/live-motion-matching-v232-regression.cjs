const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(base, 'components/visualizer/ThreeAvatar.tsx'),'utf8');
const engine = fs.readFileSync(path.join(base, 'components/visualizer/smartMotionMatching.ts'),'utf8');
const pkg = require('../package.json');
const checks = [
 ['live matcher import', source.includes('import { findMotionMatch } from "./smartMotionMatching"')],
 ['matcher called on live switch', source.includes('findMotionMatch(outgoingClip, incomingClip, previousAction!.time, 12)')],
 ['matched seek', source.includes('if (usableMatch) nextAction.time')],
 ['track compatibility guard', source.includes('match.comparedTracks > 0')],
 ['score guard', source.includes('match.score < 1.5')],
 ['safe incoming bounds', source.includes('incomingClip.duration - 0.001')],
 ['phase fallback retained', source.includes('else if (plan.preservePhase) nextAction.time = matchedClipTime')],
 ['beat transition retained', source.includes('planDanceTransition({')],
 ['explicit sequence time retained', source.includes('action.time = start;')],
 ['studio reuses engine', engine.includes('export function findMotionMatch')],
 ['V232 package', pkg.version === '0.1.0-v248'],
 ['test wired', pkg.scripts['verify:offline'].includes('test:v232')],
];
for (const [name, result] of checks){assert.ok(result, name); console.log('PASS',name)}
