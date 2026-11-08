#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildVisualReport } = require('../scripts/v1104-playwright-visual-report.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-v1104-visual-'));
let checks = 0;
const ok=(name, fn) => { fn(); checks++; console.log('PASS V1104 '+name); };
try {
  const target=path.join(root,'reports/playwright-production/test-results');
  fs.mkdirSync(target,{recursive:true});
  const jpeg=Buffer.from([255,216,255,225,0,8,69,120,105,102,0,0,255,217]);
  const file=path.join(target,'real-ui.jpg');fs.writeFileSync(file,jpeg);
  const external=path.join(root,'secret.jpg');fs.writeFileSync(external,jpeg);
  const spec = (project,title,attachments) => ({title,tests:[{projectName:project,results:[{status:'passed',attachments}]}]});
  const attachment={name:'v1104-ui-screenshot',path:file,contentType:'image/jpeg'};
  const withBody={name:'v1104-acceptance-form',body:jpeg.toString('base64'),contentType:'image/jpeg'};
  const report={stats:{expected:3,unexpected:0,skipped:0,flaky:0},suites:[{title:'visual-quality-v1104',specs:[
    spec('chromium-desktop','Govee <script>alert(1)</script>',[attachment,withBody]),
    spec('chromium-touch','Tablet screenshots',[attachment]),
    spec('chromium-touch','Reject traversal',[{name:'v1104-ui-screenshot',path:external,contentType:'image/jpeg'}]),
  ]}]};
  const first=buildVisualReport(root, report);
  ok('both browser projects and valid screenshot attachments',()=>{
    assert.equal(first.screenshotCount,3);
    assert.deepEqual(first.projects,['chromium-desktop','chromium-touch']);
    assert.equal(first.screenshots.every(x=>x.image.startsWith('screenshots/')),true);
    assert.equal(fs.readdirSync(path.join(root,'reports/playwright-production/visual-gallery/screenshots')).length,3);
  });
  ok('safe escaped offline HTML gallery with browsable images',()=>{
    const html=fs.readFileSync(path.join(root,'reports/playwright-production/visual-gallery/index.html'),'utf8');
    assert(html.includes('Govee &lt;script&gt;alert(1)&lt;/script&gt;'));
    assert(!html.includes('Govee <script>'));
    assert(html.includes('chromium-touch'));
    assert(!/https?:\/\//.test(html));
  });
  ok('manifest and gallery copied into same CI artifact directory',()=>{
    const file=path.join(root,'reports/playwright-production/visual-gallery/manifest.json');
    assert.deepEqual(JSON.parse(fs.readFileSync(file)).projects,first.projects);
  });
  ok('corrupted and external image attachments are discarded',()=>{
    const invalid=buildVisualReport(root,{suites:[{specs:[spec('chromium-desktop','invalid',[{name:'v1104-ui-screenshot',path:external,contentType:'image/jpeg'},
      {name:'v1104-ui-screenshot',body:Buffer.from('bad screenshot').toString('base64'),contentType:'image/jpeg'}])]}]});
    assert.equal(invalid.screenshotCount,0);
  });
  ok('missing suites never count as a screenshot report',()=>{
    assert.equal(buildVisualReport(root,{stats:{expected:33,unexpected:0,skipped:0,flaky:0}}).screenshotCount,0);
  });
  ok('report with screenshots can be regenerated without using earlier captures',()=>{
    const rep=buildVisualReport(root,{suites:[{specs:[spec('chromium-desktop','new screenshot',[attachment])]}]});
    assert.equal(rep.screenshotCount,1);
    const files=fs.readdirSync(path.join(root,'reports/playwright-production/visual-gallery/screenshots'));
    assert.equal(files.length,1);
  });
} finally {fs.rmSync(root,{recursive:true,force:true});}
// Structural checks prevent silent removal of screenshot attachment or CI evidence.
const source=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
ok('passing and failing tests capture screenshots',()=>{
  assert(source('tests/e2e/fixtures.cjs').includes("test.afterEach(async ({ page }, testInfo)"));
  assert(source('tests/e2e/fixtures.cjs').includes("testInfo.attach('v1104-ui-screenshot'"));
  assert(source('config/playwright.production.cjs').includes("['html', { outputFolder"));
  assert(source('config/playwright.production.cjs').includes("['junit', { outputFile"));
  assert(source('config/playwright.production.cjs').includes("trace: 'retain-on-failure'"));
});
ok('real Desktop and Touch Playwright projects run seven new scenarios',()=>{
  const cfg=source('config/playwright.production.cjs'),spec=source('tests/e2e/visual-quality-v1104.spec.cjs');
  assert(cfg.includes("name: 'chromium-desktop'") && cfg.includes("name: 'chromium-touch'"));
  assert.equal((spec.match(/test\('V1104 visual:/g)||[]).length,7);
  assert(spec.includes('360 arena')&&spec.includes('Govee')&&spec.includes('acceptance'));
});
ok('screenshots are mandatory for successful production proof and uploaded in CI',()=>{
  const run=source('scripts/playwright-production.cjs'),wf=source('.github/workflows/v965-room-wave-production.yml');
  assert(run.includes('visual.screenshotCount < 2')&&run.includes('Missing desktop/touch screenshot evidence'));
  assert(wf.includes('reports/playwright-production/'));
  assert(source('.github/scripts/production-test-summary.cjs').includes('Playwright screenshots'));
});
console.log(`V1104: ${checks} screenshot, safety, gallery and browser suite checks passed`);
