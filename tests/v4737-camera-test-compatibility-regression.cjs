// Regression against fragile substring assertions in older camera tests.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {assertConcertCameraCueContract, assertConcertCameraCueContractFromProject} = require('./helpers/concert-camera-contract-v4737.cjs');
const root=path.resolve(__dirname,'..');
assertConcertCameraCueContractFromProject();
require('./helpers/genius-track-safety-contract-v4737.cjs').assertGeniusTrackSafetyContract(
 fs.readFileSync(path.join(root,'components/GeniusSongInsightsV447.tsx'),'utf8')
);
// Explicitly verify equivalent parenthesization of the same null-safe priority chain.
const simple='featureDirectionV460.cameraCue??(ultimateShowV456.active?ultimateShowV456.cameraCue:smartShowCueV446)??undefined';
const wrapped='('+simple.slice(0,-11)+')??undefined';
for (const cue of [simple,wrapped]) {
  const example=`const props={concertCameraCueV454:${cue}};`;
  assert.equal(assertConcertCameraCueContract(example).includes('smartShowCueV446'),true);
}
for (const name of ['v454-cinematic-concert-camera-regression.cjs', 'v456-ultimate-show-regression.cjs', 'v460-intelligent-feature-performance-regression.cjs', 'v464-automatic-concert-experience-regression.cjs']) {
  const test=fs.readFileSync(path.join(root,'tests',name),'utf8');
  assert(test.includes('assertConcertCameraCueContract('),`${name} must use semantic contract`);
  assert(!test.includes('concertCameraCueV454:featureDirectionV460.cameraCue'),`${name} must not require exact JSX whitespace or parentheses`);
}
for(const name of ['v447-genius-song-insights-regression.cjs','v448-cinematic-genius-insights-regression.cjs','v449-genius-music-discovery-regression.cjs']) {
 const test=fs.readFileSync(path.join(root,'tests',name),'utf8');
 assert(test.includes('assertGeniusTrackSafetyContract('),`${name} must use shared strict track guard`);
 assert(!test.includes("result?.id===track.id"),`${name} must not rely on old literal guard spelling`);
}
console.log('PASS V473.7: semantic V454/V456/V460/V464 camera priority and V449 Genius track-scoping (strict TypeScript)');
