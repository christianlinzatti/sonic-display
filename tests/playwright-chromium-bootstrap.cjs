'use strict';
const assert=require('node:assert/strict'),{prepareChromium}=require('../scripts/prepare-playwright-chromium.cjs');
function fixture(results,platform='linux'){const calls=[];return {calls,run(){return prepareChromium({platform,run(label,args){calls.push(args);return results.shift()??false;}});}};}
let f=fixture([true,true]);f.run();assert.equal(f.calls.length,2);assert(!f.calls.some(c=>c.includes('install-deps')),'A real healthy browser launch must not need apt or optional font downloads');
f=fixture([true,false,true,true]);f.run();assert.equal(f.calls.length,4);assert(f.calls[2].includes('install-deps'));assert(f.calls[3].includes('--probe'),'Repair must be verified with a real launch');
for(const [results,message] of [[[false],/download failed/],[[true,false,false],/dependency installation failed/],[[true,false,true,false],/still fails/]]){f=fixture(results);assert.throws(()=>f.run(),message);}
f=fixture([true,false],'win32');assert.throws(()=>f.run(),/launch probe failed/);assert.equal(f.calls.length,2);
console.log('PASS pinned Chromium bootstrap: healthy runtime avoids optional apt downloads; missing libraries require verified repair; download, dependency and launch failures still block CI');
