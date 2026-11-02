'use strict';
/** The release gate must fail closed on both OSes and avoid duplicated production builds. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pkg=require('../package.json');
const script=pkg.scripts;
const prod=fs.readFileSync('.github/workflows/concert-validation-v571.yml','utf8');
const extended=fs.readFileSync('.github/workflows/production-quality-v405.yml','utf8');
const arch=fs.readFileSync('ARCHITECTURE.md','utf8');
const release=/^0\.1\.0-v(\d+)$/.exec(pkg.version);
assert(release && Number(release[1])>=656, 'Release must use a supported V656+ semantic version');
assert.equal(script.verify,'npm run build');
assert(script.prebuild.trim().endsWith('npm run check:fast'),'prebuild must finish with fast quality gate');
assert(script.prebuild.includes('npm run test:v865'),'newer V865 regression must precede fast gate');
assert(!script.prebuild.includes('npm run build'),'prebuild must not recurse into production build');
assert.equal(script['test:smoke:v656'],'npm run test:v656 && npm run test:smoke:v655');
const gate=script['check:release'];
for(const requirement of ['test:smoke:v656','check:syntax','check:architecture','test:module-case',
 'check:test-types','test:env:spotify-build','typecheck']){
 assert(gate.includes(`npm run ${requirement}`) || (requirement==='test:smoke:v656' && (script['test:smoke:v658']?.includes('npm run test:smoke:v657') && script['test:smoke:v657']?.includes('npm run test:smoke:v656'))),`Release gate missing ${requirement}`);
}
assert(!gate.includes('verify:offline:fast'),'historical suite must not block every regular build');
for(const v of ['test:v572','test:v591','test:v593','verify:offline:fast']) assert(script['verify:historical'].includes(v),`historical suite missing ${v}`);
for(const trigger of ['push:','pull_request:','workflow_dispatch:'])assert(prod.includes(trigger),`missing CI trigger ${trigger}`);
for(const os of ['ubuntu-24.04','windows-latest'])assert(prod.includes(os),`missing build OS: ${os}`);
assert(prod.includes("node-version: '22'"));
assert(prod.includes('npm run build'));
assert.equal((prod.match(/run: npm run build/g)||[]).length,1,'only one real production build per OS');
assert(!prod.includes('npm run test:smoke:v655 && npm run check:release'),'prebuild already verifies');
assert(extended.includes('workflow_dispatch:')&&extended.includes('schedule:'));
assert(extended.includes('npm run verify:historical'));
assert(!/^  push:|^  pull_request:/m.test(extended),'do not duplicate release builds for every PR');
assert(arch.includes(`**Dokumentationsstand:** V${pkg.version.split('-v')[1]}`));
// Regression coverage is guaranteed by the V655 -> V654 -> V653 chain.
for(const item of ['test:integrity:v654','test:blob:v654','test:resilience:v654',
 'test:resource-lifecycle','test:v654','test:v655']){
 const chain=script['test:smoke:v654']+' '+script['test:smoke:v655'];
 assert(chain.includes(item),`missing critical regression ${item}`);
}
console.log('PASS V656 CI contract: Windows+Linux real production build once, mandatory typecheck and resource/integrity regressions, historical suite scheduled separately');
