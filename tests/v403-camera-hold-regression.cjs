'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'components/visualizer/visualPerformanceDirectorV397.ts');
const source=fs.readFileSync(file,'utf8');
assert.ok(!source.includes('clamp(input.studioV398.holdMs,450,2400,1150)'), 'clamp must not receive 4 arguments');
assert.match(source,/Number\.isFinite\(input\.studioV398\.holdMs\)/, 'invalid hold duration needs fallback');
assert.match(source,/clamp\(input\.studioV398\.holdMs,450,2400\)/, 'valid hold duration is bounded');
// Keep the complete behavioral regression (including fallback) in the V397 test.
const {spawnSync}=require('node:child_process');
const r=spawnSync(process.execPath,[path.join(__dirname,'v397-visual-performance-director-regression.cjs')],{encoding:'utf8'});
assert.equal(r.status,0,r.stderr||r.stdout);
console.log('PASS V403 camera hold clamp argument/fallback regression');
