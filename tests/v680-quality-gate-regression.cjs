'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inspectBuildEnvironment, main } = require('../scripts/build-dependencies-v680.cjs');
const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const s = pkg.scripts;
let count=0;
function test(label, fn) { fn(); count++; console.log('PASS V680: '+label); }
function tempFixture(fn){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v680-'));try{return fn(dir);}finally{fs.rmSync(dir,{recursive:true,force:true});}}
function fixture(root, names=['local-pkg']) {
 fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ dependencies:Object.fromEntries(names.map(n=>[n,'1.0.0'])), devDependencies:{} }));
 return names;
}
function installDummy(root, name) {const p=path.join(root,'node_modules',...name.split('/'));fs.mkdirSync(p,{recursive:true});fs.writeFileSync(path.join(p,'package.json'),'{}');}

test('Release version V680 or newer',()=>assert(Number(pkg.version.match(/-v(\d+)$/)[1])>=680));
test('Production command remains real Next.js build',()=>assert.equal(s.build,'next build'));
test('Prebuild invokes only quick gate',()=>assert.equal(s.prebuild,'npm run check:fast'));
test('Quick gate requires preflight before unit checks and TypeScript',()=>assert.equal(s['check:fast'],'npm run check:dependencies && npm run test:quick && npm run typecheck'));
test('Dependency diagnostic is runnable without Next.js',()=>assert.equal(s['check:dependencies'],'node scripts/build-dependencies-v680.cjs'));
test('Quick suite includes V680 through V669',()=>{for(let i=669;i<=680;i++)assert(s['test:quick'].includes(`npm run test:v${i}`));});
test('Quick suite contains syntax, architecture, case, test-types and OAuth import regression',()=>{for(const t of ['check:syntax','check:architecture','test:module-case','check:test-types','test:env:spotify-build'])assert(s['test:quick'].includes(`npm run ${t}`),t);});
test('Quick suite excludes historical smoke and recursion',()=>{assert(!/test:smoke|check:release|npm run build|verify:offline/.test(s['test:quick']));assert(!/check:release|test:smoke/.test(s.prebuild));});
test('Full release remains explicit and covers legacy V671 smoke',()=>{assert(s['check:release'].includes('test:smoke:v671'));assert(s['check:release'].includes('npm run test:v680'));assert(s['check:release'].includes('npm run typecheck'));});
test('V679 smoke chain remains intact',()=>assert(s['test:smoke:v680'].includes('test:smoke:v679')));
test('Historical suite retained independently',()=>assert(s['verify:historical'].includes('verify:offline:fast')));
test('New release verification runs real production build',()=>assert(s['verify:v680'].includes('npm run build')));
test('Missing npm packages fail closed',()=>tempFixture(d=>{fixture(d);const r=inspectBuildEnvironment(d);assert.equal(r.ok,false);assert.deepEqual(r.missing,['local-pkg']);}));
test('Missing lockfile is warning in local build',()=>tempFixture(d=>{fixture(d);installDummy(d,'local-pkg');const r=inspectBuildEnvironment(d);assert.equal(r.ok,true);assert.equal(r.warnings.length,1);}));
test('Missing lockfile fails when strict requested',()=>tempFixture(d=>{fixture(d);installDummy(d,'local-pkg');const r=inspectBuildEnvironment(d,{requireLock:true});assert.equal(r.ok,false);assert.equal(r.problems.length,1);}));
test('Lockfile and locally installed packages pass',()=>tempFixture(d=>{fixture(d,['local-pkg','@sonic/other']);installDummy(d,'local-pkg');installDummy(d,'@sonic/other');fs.writeFileSync(path.join(d,'package-lock.json'),'{}');const r=inspectBuildEnvironment(d,{requireLock:true});assert.equal(r.ok,true);assert.equal(r.missing.length,0);}));
test('Old Node.js versions are rejected',()=>tempFixture(d=>{fixture(d);installDummy(d,'local-pkg');assert.equal(inspectBuildEnvironment(d,{nodeVersion:'18.20.0'}).ok,false);}));
test('No dependencies and lockfile are handled safely',()=>tempFixture(d=>{fixture(d,[]);fs.writeFileSync(path.join(d,'package-lock.json'),'{}');assert.equal(inspectBuildEnvironment(d,{requireLock:true}).ok,true);}));
test('Unknown CLI flags fail closed',()=>{assert.equal(main(['--invented-flag'],root),2);});
test('New CI build runs once per OS and historical suite only on schedule',()=>{const prod=fs.readFileSync('.github/workflows/concert-validation-v571.yml','utf8');const long=fs.readFileSync('.github/workflows/production-quality-v405.yml','utf8');assert(prod.includes('npm run build'));assert((prod.match(/run: npm run build/g)||[]).length===1);assert(prod.includes('windows-latest'));assert(prod.includes('ubuntu-24.04'));assert(long.includes('npm run verify:historical'));});
test('V680 architecture and release guide are present',()=>{const a=fs.readFileSync('ARCHITECTURE.md','utf8');assert(a.includes(`**Dokumentationsstand:** V${pkg.version.split('-v')[1]}`));assert(a.includes('check:fast'));assert(fs.existsSync('V680-BUILD-QUALITY-GATE.md'));});
console.log(`PASS V680 Build & Quality Gate: ${count} checks`);
