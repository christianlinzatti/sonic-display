'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inspect, scanCaseCollisions } = require('../lib/v959BuildReadiness.cjs');
let passed = 0;
function test(title, fn) {
  fn(); passed++;
  console.log(`PASS V959 ${title}`);
}
const root = path.resolve(__dirname, '..');
function fixtures(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-v959-'));
  const put = (name, value = '') => {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value);
  };
  const pkg = { version:'0.1.0-v959', scripts:{ build:'next build', typecheck:'tsc --noEmit', 'verify:v931:production':'node scripts/v931-production-gate.cjs' } };
  const lock = { version:'0.1.0-v959', packages:{'':{version:'0.1.0-v959'}} };
  put('package.json',JSON.stringify(pkg));
  put('package-lock.json',JSON.stringify(lock));
  for (const file of ['scripts/v931-production-gate.cjs','tests/v931-build-gate-regression.cjs','tests/v958-concert-roadmap-regression.cjs','tests/check-source-syntax.cjs','.github/workflows/v958-ultimate-concert-validation.yml','node_modules/typescript/bin/tsc','node_modules/next/dist/bin/next']) put(file);
  try { fn({dir,put,pkg,lock}); } finally {fs.rmSync(dir,{recursive:true,force:true});}
}
test('complete dependency and source fixture passes preflight',()=>fixtures(({dir})=>{
  const result=inspect(dir);
  assert.equal(result.passed,true,JSON.stringify(result.checks.filter(x=>!x.passed)));
}));
test('missing Next.js executable blocks certification',()=>fixtures(({dir})=>{
  fs.unlinkSync(path.join(dir,'node_modules/next/dist/bin/next'));
  assert.equal(inspect(dir).passed,false);
  assert.ok(inspect(dir).checks.some(x=>x.id.includes('dependency:node_modules/next')&&!x.passed));
}));
test('missing TypeScript executable blocks certification',()=>fixtures(({dir})=>{
  fs.unlinkSync(path.join(dir,'node_modules/typescript/bin/tsc'));
  assert.ok(inspect(dir).checks.some(x=>x.id.includes('dependency:node_modules/typescript')&&!x.passed));
}));
test('pre-install inspection permits missing dependencies but not missing scripts',()=>fixtures(({dir})=>{
  fs.rmSync(path.join(dir,'node_modules'),{recursive:true});
  assert.equal(inspect(dir,{requireDependencies:false}).passed,true);
  fs.unlinkSync(path.join(dir,'scripts/v931-production-gate.cjs'));
  assert.equal(inspect(dir,{requireDependencies:false}).passed,false);
}));
test('package and lockfile version drift blocks certification',()=>fixtures(({dir,put,lock})=>{
  lock.version='0.1.0-v958';put('package-lock.json',JSON.stringify(lock));
  assert.ok(inspect(dir).checks.some(x=>x.id==='lockfile-version'&&!x.passed));
}));
test('missing lockfile is an explicit failure',()=>fixtures(({dir})=>{
  fs.unlinkSync(path.join(dir,'package-lock.json'));
  assert.ok(inspect(dir).checks.some(x=>x.id==='parse:package-lock.json'&&!x.passed));
}));
test('malformed lockfile is an explicit failure',()=>fixtures(({dir,put})=>{
  put('package-lock.json','{broken');
  assert.equal(inspect(dir).passed,false);
}));
test('missing build script blocks certification',()=>fixtures(({dir,put,pkg})=>{
  delete pkg.scripts.typecheck;put('package.json',JSON.stringify(pkg));
  assert.ok(inspect(dir).checks.some(x=>x.id==='build-scripts'&&!x.passed));
}));
test('nested case-insensitive path collision is rejected',()=>fixtures(({dir,put})=>{
  // Case collisions cannot coexist on case-insensitive Windows filesystems.
  if(process.platform!=='win32'){
    put('src/Stage.ts');put('src/stage.ts');
    assert.ok(scanCaseCollisions(dir).some(x=>x.join('|').includes('Stage.ts')));
    assert.equal(inspect(dir).passed,false);
  }
}));
test('existing V958 project is cross-platform path collision free',()=>{
  assert.equal(scanCaseCollisions(root).length,0);
});
test('workflow requires clean install, both operating systems and artifact upload',()=>{
  const ci=fs.readFileSync(path.join(root,'.github/workflows/v958-ultimate-concert-validation.yml'),'utf8');
  for(const expected of ['npm ci --no-audit --no-fund','ubuntu-24.04','windows-latest','node scripts/v959-production-verify.cjs','SONIC_TEST_CONCURRENCY','if: always()','actions/upload-artifact@v4']) assert.ok(ci.includes(expected),expected);
});
test('production gate requires real TypeScript and real Next.js, not only an isolated check',()=>{
  const gate=fs.readFileSync(path.join(root,'scripts/v931-production-gate.cjs'),'utf8');
  assert.ok(gate.includes("['Full TypeScript'"));
  assert.ok(gate.includes("['Next.js production build'"));
  assert.ok(/report\.passed\s*=\s*true/.test(gate));
});
test('CI finalization always reports missing builds as failure',()=>{
  const finalize=fs.readFileSync(path.join(root,'scripts/v959-ci-finalize.cjs'),'utf8');
  assert.ok(finalize.includes('VERIFIER_NOT_COMPLETED_OR_NPM_INSTALL_FAILED'));
  assert.ok(finalize.includes('if (!passed) process.exitCode = 1'));
});
console.log(`V959 production validation: ${passed} checks passed`);
