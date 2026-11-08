#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1104(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try {
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',v>=1104&&pkg.sonicRoadmapRelease==='v'+v&&pkg.sonicFeatureRelease==='v'+v);
  add('lock',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('test',pkg.scripts['test:v1104']==='node tests/v1104-playwright-visual-regression.cjs');
  add('types',pkg.scripts['test:v1104:types']==='tsc -p tests/tsconfig.v1104-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1104 && npm run test:v1104:types'));
  for(const f of ['scripts/v1104-playwright-visual-report.cjs','tests/v1104-playwright-visual-regression.cjs',
   'tests/e2e/visual-quality-v1104.spec.cjs','tests/tsconfig.v1104-core.json','scripts/v1104-release-readiness.cjs',
   'changelog/V1104-PLAYWRIGHT-VISUAL-QA-SCREENSHOTS.md'])add('file:'+f,exists(f));
  const fixtures=read('tests/e2e/fixtures.cjs'),runner=read('scripts/playwright-production.cjs'),gallery=read('scripts/v1104-playwright-visual-report.cjs');
  add('real-passing-screenshots',fixtures.includes("testInfo.attach('v1104-ui-screenshot'")&&fixtures.includes('test.afterEach('));
  add('fail-closed-evidence',runner.includes('Missing desktop/touch screenshot evidence')&&runner.includes('visual.screenshotCount < 2'));
  add('failure-gallery',runner.includes('if (results && !visual)'));
  add('offline-gallery',gallery.includes("visual-gallery")&&gallery.includes("manifest.json"));
  add('injection-defense',gallery.includes('escapeHtml')&&gallery.includes('fs.realpathSync'));
  add('jpeg-magic',gallery.includes('bytes[0] === 255'));
  const config=read('config/playwright.production.cjs');
  add('two-browsers',config.includes("name: 'chromium-desktop'")&&config.includes("name: 'chromium-touch'"));
  add('real-prod-server',config.includes('next/dist/bin/next')&&config.includes("'production'"));
  add('html-report',config.includes("['html', { outputFolder"));
  add('junit-report',config.includes("['junit', { outputFile"));
  add('trace-on-failure',config.includes("trace: 'retain-on-failure'"));
  add('no-external',fixtures.includes('Unexpected external browser request'));
  add('seven-browser-scenarios',(read('tests/e2e/visual-quality-v1104.spec.cjs').match(/test\('V1104 visual:/g)||[]).length===7);
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1104-playwright-visual-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1104-playwright-visual-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1104(root)'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('artifact-upload',wf.includes('reports/playwright-production/'));
  add('matrix',wf.includes('windows-latest')&&wf.includes('ubuntu-24.04'));
  add('dynamic-release',wf.includes('Active imported release (regression and isolated type checks)'));
  add('summary',read('.github/scripts/production-test-summary.cjs').includes('Playwright screenshots'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1104);
 }catch(e){console.error(e);add('parse',false);}
 return {checks,passed:checks.length>=28&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1104(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1104 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1104};
