'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const {expandScript,cleanPathEnv} = require('../scripts/run-npm-chain-flat-v86512.cjs');
let checks = 0;
function test(name, fn) { try { fn(); checks++; } catch (e) { e.message=`V865.12 ${name}: ${e.message}`; throw e; } }
test('smoke v665 flatten contains actual regression in original order', () => {
 const a = expandScript(pkg.scripts,'test:smoke:v665');
 assert(a.length>90 && a.indexOf('test:v665')<a.indexOf('test:v649'));
 assert(a.includes('test:v545') && a.includes('test:v596') && a.includes('test:v649:types'));
 assert(!a.some(x=>x.startsWith('test:smoke:')));
});
test('smoke v671 reaches v649 unchanged',()=>{
 const a = expandScript(pkg.scripts,'test:smoke:v671');
 assert(a.length>120 && a.includes('test:v649') && a.includes('test:v650'));
 assert(a.indexOf('test:v671')<a.indexOf('test:v665'));
});
test('release includes historical, modern and type checks',()=>{
 const a=expandScript(pkg.scripts,'check:release');
 assert(a.length>400);
 for (const s of ['test:v865','test:v850','test:v665','test:v649','test:v429','typecheck','check:syntax','test:module-case'])assert(a.includes(s),s);
 assert(a.indexOf('test:v865')<a.indexOf('test:v649'));
});
test('prebuild still checks modern versions and full typecheck',()=>{
 const a=expandScript(pkg.scripts,'prebuild');
 assert(a.length>350 && a.includes('test:v865') && a.includes('typecheck'));
 assert(a.indexOf('test:v865')<a.indexOf('typecheck'));
});
test('repeated checks retain their multiplicity',()=>{
 const a=expandScript(pkg.scripts,'test:smoke:v665');
 assert(a.filter(x=>x==='test:v664').length>=1);
 assert(a.filter(x=>x==='test:v665').length===1);
});
test('a broken referenced dependency is rejected',()=>{
 assert.throws(()=>expandScript({a:'npm run missing'},'a'),/Fehlendes/);
});
test('cycles are rejected instead of looping',()=>{
 assert.throws(()=>expandScript({a:'npm run b',b:'npm run a'},'a'),/Zyklische/);
});
test('invalid script names rejected',()=>{
 assert.throws(()=>expandScript({a:'node test.cjs'},'a & echo compromised'),/Ungültiger/);
});
test('non npm-run leaf remains unchanged',()=>{
 assert.deepEqual(expandScript({a:'node a.cjs && node b.cjs'},'a'),['a']);
});
test('flat runner commands do not modify historical check scripts',()=>{
 assert(pkg.scripts['test:smoke:v665'].includes('npm run test:smoke:v664'));
 assert(pkg.scripts['check:release'].includes('npm run test:smoke:v671'));
 assert(pkg.scripts.prebuild.includes('npm run check:fast'));
});
test('environment sanitizer removes only duplicated PATH entries on this host',()=>{
 const separator = process.platform === 'win32' ? ';' : ':';
 const key = process.platform === 'win32' ? 'Path' : 'PATH';
 const env = cleanPathEnv({PATH:['/a','/b','/a','/c'].join(separator),CUSTOM:'kept'});
 assert.equal(env[key], ['/a','/b','/c'].join(separator));
 assert.equal(env.CUSTOM, 'kept');
});
test('Windows Path is emitted with the correct casing and separator',()=>{
 const env=cleanPathEnv({PATH:'C:\\Node;C:\\Tools;C:\\Node;D:\\Bin',CUSTOM:'kept'},'win32');
 assert.equal(env.Path,'C:\\Node;C:\\Tools;D:\\Bin');
 assert.equal(Object.hasOwn(env,'PATH'),false);
 assert.equal(env.CUSTOM,'kept');
});
test('Windows mixed-case PATH keys are merged without duplicating entries',()=>{
 const env=cleanPathEnv({Path:'C:\\Node;C:\\Tools',PATH:'c:\\node;D:\\Bin'},'win32');
 assert.equal(env.Path,'C:\\Node;C:\\Tools;D:\\Bin');
 assert.equal(Object.keys(env).filter(k=>k.toLowerCase()==='path').length,1);
});
test('POSIX PATH remains uppercase with colon-delimited paths',()=>{
 const env=cleanPathEnv({PATH:'/a:/b:/a',Path:'/b:/c'},'linux');
 assert.equal(env.PATH,'/a:/b:/c');
 assert.equal(Object.hasOwn(env,'Path'),false);
});
test('all alias commands call the same flatter',()=>{
 for(const k of ['test:smoke:v665:flat','test:smoke:v671:flat','check:release:flat','build:flat'])assert(pkg.scripts[k].includes('run-npm-chain-flat-v86512.cjs'));
});
console.log(`PASS V865.12: ${checks} flat npm-chain regression groups; original test coverage retained.`);
