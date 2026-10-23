// Shared semantic contract for V454/V456/V460/V464 camera integration.
// Prefer the actual TSX property initializer over matching a fragile one-line JSX string.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('../typescript-loader.cjs');

function assertConcertCameraCueContract(stageText) {
  const file = ts.createSourceFile('VisualizerStage.tsx', stageText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const visit = node => {
    if (ts.isPropertyAssignment(node) && node.name.getText(file) === 'concertCameraCueV454') {
      found.push(node.initializer.getText(file));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  assert.equal(found.length, 1, 'Expected exactly one concert camera cue property');
  const cue = found[0].replace(/\s+/g, '');
  const needed = ['featureDirectionV460.cameraCue', 'ultimateShowV456.active', 'ultimateShowV456.cameraCue', 'smartShowCueV446'];
  for (const part of needed) assert(cue.includes(part), `Missing camera selection priority: ${part}`);
  assert(needed.every((part,i) => i === 0 || cue.indexOf(part) > cue.indexOf(needed[i-1])),
    'Feature cue must precede the ultimate show fallback and smart show fallback');
  assert(cue.includes('featureDirectionV460.cameraCue??'), 'Feature camera must use nullish fallback');
  assert(/\?\?undefined$/.test(cue), 'Nullable cues must be normalized to undefined');
  assert(!/\bas(?:any|unknown)\b/.test(found[0]), 'Do not bypass TypeScript camera types');
  return cue;
}

function assertConcertCameraCueContractFromProject() {
  return assertConcertCameraCueContract(fs.readFileSync(path.resolve(__dirname, '../../components/visualizer/VisualizerStage.tsx'), 'utf8'));
}
module.exports = { assertConcertCameraCueContract, assertConcertCameraCueContractFromProject };
