'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const { resolveMetadata } = require('../scripts/production-workflow-metadata.cjs');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, '.github/workflows');
const workflows = Object.fromEntries(fs.readdirSync(directory).filter(x => x.endsWith('.yml')).map(name => {
  const document = YAML.parseDocument(fs.readFileSync(path.join(directory, name), 'utf8'), { uniqueKeys: true });
  assert.equal(document.errors.length, 0, `${name}: ${document.errors}`);
  return [name, document.toJS()];
}));
for(const [name,workflow]of Object.entries(workflows))for(const job of Object.values(workflow.jobs||{}))for(const step of job.steps||[]){
 if((step.uses||'').startsWith('actions/download-artifact@'))assert.match(step.uses,/@v7$/,name+' must use the Node 24 download runtime');
 if(/^actions\/(checkout|setup-node|upload-artifact)@/.test(step.uses||''))assert.match(step.uses,/@v6$/,name+' must use the Node 24 action runtime');
}
const production = workflows['v965-room-wave-production.yml'];
assert.equal(production.name, 'Sonic Display · Production & Playwright');
assert.ok(production['run-name'].includes('inputs.release'));
assert.ok(production.jobs['v965-production'].name.includes('needs.release.outputs.release'));
assert.deepEqual(production.jobs['v965-production'].strategy.matrix.os, ['ubuntu-24.04', 'windows-latest']);
assert.equal(production.permissions.contents, 'read');
assert.equal(production.concurrency['cancel-in-progress'], true);
assert.equal(production.jobs['v965-production'].steps[0].with.ref, '${{ needs.release.outputs.revision }}');
assert.ok(production.on.push['paths-ignore'].includes('releases/**'));
assert.ok(production.on.pull_request['paths-ignore'].includes('releases/**'));
const importer = workflows['project-archive-import.yml'];
const dispatch = importer.jobs['import-project'].steps.find(x => x.name === 'Trigger full Linux/Windows production validation');
assert.ok(dispatch.run.includes('git rev-parse HEAD'));
assert.ok(dispatch.run.includes('-f "release=V$VERSION"'));
assert.ok(dispatch.run.includes('-f "revision=$IMPORTED_REVISION"'));
const upload = production.jobs['v965-production'].steps.find(x => x.uses === 'actions/upload-artifact@v6');
assert.equal(upload.if, 'always()');
assert.ok(upload.with.path.includes('reports/playwright-production/'));
assert.ok(upload.with.path.includes('reports/playwright-soak/'));
const summary=production.jobs['v965-production'].steps.find(x=>(x.run||'').includes('production-test-summary.cjs'));
assert.equal(summary.if,'always()');
assert.ok(upload.with.name.includes('needs.release.outputs.release'));
const allowedAutomatic = new Set(['v965-room-wave-production.yml', 'project-archive-import.yml', 'organize-version-docs.yml']);
for (const [name, workflow] of Object.entries(workflows)) {
  if (workflow.on.push || workflow.on.pull_request) assert.ok(allowedAutomatic.has(name), `${name} still duplicates automatic CI`);
  if (!allowedAutomatic.has(name) && name !== 'production-quality-v405.yml' && name !== 'v965-deployment-smoke.yml')
    assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch'], `${name} must remain available manually`);
}
assert.ok(workflows['production-quality-v405.yml'].on.schedule, 'Preserve historical scheduled regression');
assert.deepEqual(Object.keys(workflows['v965-deployment-smoke.yml'].on), ['workflow_dispatch'], 'Deployments should be checked manually without creating failure event noise');
assert.ok(workflows['v965-deployment-smoke.yml'].jobs['deployed-site-smoke'].env.VERCEL_DEPLOYMENT_URL.includes('inputs.deployment_url'));
const commands = production.jobs['v965-production'].steps.map(x => x.run || '').join('\n');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
for (const match of commands.matchAll(/npm run ([a-z0-9:_-]+)/g)) assert.ok(pkg.scripts[match[1]], `Missing script ${match[1]}`);
for (const version of [982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003])
  assert.ok(commands.includes(`npm run test:v${version}`), `Recent feature regression V${version} removed`);
assert.ok(commands.includes('node scripts/v965-production-verify.cjs'));
const revision = 'a'.repeat(40);
for (const version of [1005,1006,1100]) {
  const result = resolveMetadata({ version: `0.1.0-v${version}`, sonicRoadmapRelease: `v${version}`, sonicFeatureRelease: `v${version}` }, { revision });
  assert.deepEqual(result, { release: `V${version}`, revision });
}
const metadata = { version: '0.1.0-v1005', sonicRoadmapRelease: 'v1005', sonicFeatureRelease: 'v1005' };
assert.throws(() => resolveMetadata({ ...metadata, sonicFeatureRelease: 'v1004' }, { revision }), /Feature release/);
assert.throws(() => resolveMetadata(metadata, { revision, expectedRelease: 'V1004' }), /release differs/);
assert.throws(() => resolveMetadata(metadata, { revision, expectedRevision: 'b'.repeat(40) }), /revision differs/);
assert.throws(() => resolveMetadata(metadata, { revision: 'master' }), /full checked-out/);
assert.throws(() => resolveMetadata({ ...metadata, sonicRoadmapRelease: 'v1005\nfoo=bar' }, { revision }), /Invalid/);
console.log(`PASS workflow routing: ${Object.keys(workflows).length} YAML files, one automatic production matrix, versioned import, exact revision and future versions`);
// The visible summary must expose failures and missing stages, rather than inventing green results.
const os=require('node:os');
const {summary:renderSummary}=require('../.github/scripts/production-test-summary.cjs');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-ci-summary-'));
try{
 fs.writeFileSync(path.join(fixture,'package.json'),JSON.stringify({version:'0.1.0-v1009',sonicRoadmapRelease:'v1009'}));
 assert.match(renderSummary(fixture),/NOT CERTIFIED/);assert.match(renderSummary(fixture),/report missing/);
 fs.mkdirSync(path.join(fixture,'reports/playwright-production'),{recursive:true});
 fs.writeFileSync(path.join(fixture,'reports/v931-production-gate.json'),JSON.stringify({tests:[{label:'Example passing test',ok:true,elapsedMs:1200},{label:'Example failing test',ok:false,elapsedMs:800}]}));
 fs.writeFileSync(path.join(fixture,'reports/playwright-production/proof.json'),JSON.stringify({passed:false,stats:{expected:4,unexpected:1,skipped:2,flaky:0}}));
 const text=renderSummary(fixture);assert.match(text,/1\/2/);assert.match(text,/Example failing test \| FAIL/);assert.match(text,/4 passed, 1 failed, 2 skipped/);assert.match(text,/NOT CERTIFIED/);
}finally{fs.rmSync(fixture,{recursive:true,force:true});}
console.log('PASS production summary: missing reports, actual check labels, failures, skipped browser cases and overall certification');
