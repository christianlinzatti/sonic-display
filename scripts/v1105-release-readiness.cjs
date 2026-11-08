#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1105(root){
  const checks=[],add=(id,condition)=>checks.push({id,ok:Boolean(condition)});
  const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
  try{
    const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
    const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
    add('release-and-lockfile',v>=1105&&pkg.sonicRoadmapRelease==='v'+v&&pkg.sonicFeatureRelease==='v'+v&&lock.version===pkg.version&&lock.packages[''].version===pkg.version);
    add('node24',pkg.engines.node==='24.x');
    add('new-regression',pkg.scripts['test:v1105']==='node tests/v1105-playwright-accessibility-regression.cjs');
    add('new-types',pkg.scripts['test:v1105:types']==='tsc -p tests/tsconfig.v1105-core.json --noEmit');
    add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1105 && npm run test:v1105:types && npm run test:v1104'));
    for(const f of ['lib/visualPngDiffV1105.cjs','lib/visualViewportAuditV1105.ts',
      'scripts/v1105-playwright-quality-report.cjs','tests/e2e/visual-quality-v1105.spec.cjs',
      'tests/v1105-playwright-accessibility-regression.cjs','tests/tsconfig.v1105-core.json',
      'changelog/V1105-PLAYWRIGHT-VISUAL-REGRESSION-ACCESSIBILITY.md'])add('file:'+f,exists(f));
    const browser=read('tests/e2e/visual-quality-v1105.spec.cjs'),runner=read('scripts/playwright-production.cjs'),audit=read('scripts/v1105-playwright-quality-report.cjs');
    add('six-real-browser-scenarios',(browser.match(/test\('V1105 visual:/g)||[]).length===6);
    add('same-run-png',browser.includes('comparePngV1105(before,after'));
    add('mouse-free',browser.includes("keyboard.press('Enter')")&&browser.includes("keyboard.press('Escape')"));
    add('reduced-motion',browser.includes("reducedMotion:'reduce'"));
    add('layout-audit',browser.includes('v1105-viewport-metrics'));
    add('safe-govee',browser.includes('toBeDisabled()'));
    add('no-false-pass',runner.includes('if (!visualQuality.passed)')&&runner.includes('V1105 visual quality evidence missing or incomplete'));
    add('production-evidence',runner.includes('proof.visualQuality = visualQuality')&&runner.includes("report: 'visual-gallery/quality.html'"));
    add('both-projects',audit.includes("'chromium-desktop','chromium-touch'"));
    add('not-just-summary',audit.includes('matches.length===1')&&audit.includes('hasScreenshot'));
    add('two-before-after',audit.includes('count>=2'));
    add('offline-html',audit.includes("'quality.html'")&&audit.includes('escapeHtml'));
    add('gallery',read('scripts/v1104-playwright-visual-report.cjs').includes('visual-gallery'));
    add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1105-playwright-accessibility-regression.cjs'));
    add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1105-playwright-accessibility-regression.cjs'));
    const wf=read('.github/workflows/v965-room-wave-production.yml');
    add('windows-ubuntu',wf.includes('ubuntu-24.04')&&wf.includes('windows-latest'));
    add('dynamic-release',wf.includes('Active imported release (regression and isolated type checks)'));
    add('artifact-upload',wf.includes('reports/playwright-production/'));
    add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1105(root)'));
    add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1105);
  }catch(error){console.error(error);add('parse-error',false)}
  return {checks,passed:checks.length>=28&&checks.every(x=>x.ok)};
}
if(require.main===module){const result=inspectReleaseV1105(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1105 ${c.id}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1105};
