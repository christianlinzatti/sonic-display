#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {escapeHtml}=require('./v1104-playwright-visual-report.cjs');
const PROJECTS=['chromium-desktop','chromium-touch'];
const EXPECTED=[
  'stable heading screenshot before and after reload',
  'settings dialog stays inside viewport on desktop and touch',
  'keyboard can close settings and focus returns safely',
  'settings categories are operable without a mouse',
  'reduced motion preference keeps readable UI usable',
  'unauthenticated Govee commands remain unavailable',
];
function auditQualityV1105(results,manifest) {
  const records=[];
  function walk(suites){for(const suite of suites||[]){for(const spec of suite.specs||[]){
    for(const entry of spec.tests||[]){records.push({title:spec.title,project:entry.projectName,results:entry.results||[],status:entry.status});}
  }walk(suite.suites)}}walk(results?.suites);
  const imageRows=Array.isArray(manifest?.screenshots)?manifest.screenshots:[];
  const checks=[];let passedCases=0;
  for(const project of PROJECTS){
    for(const fragment of EXPECTED){
      const name='V1105 visual: '+fragment;
      const matches=records.filter(x=>x.title===name&&x.project===project);
      const ok=matches.length===1&&matches[0].results.length===1&&matches[0].results[0].status==='passed';
      const withScreenshot=imageRows.some(x=>x.project===project&&x.test===name&&x.status==='passed'
        &&typeof x.image==='string'&&/^screenshots\/[a-zA-Z0-9_.-]+\.(png|jpg)$/.test(x.image));
      checks.push({project,test:fragment,passed:ok&&withScreenshot,hasScreenshot:withScreenshot});
      if(ok&&withScreenshot)passedCases++;
    }
  }
  // A passing test without its fresh quantitative evidence cannot certify visual stability.
  // Playwright JSON serializes testInfo.attach(Buffer) as base64 in result attachments.
  function measurement(project,fragment,attachmentName){
    const item=records.find(x=>x.project===project&&x.title==='V1105 visual: '+fragment);
    const attachments=item?.results?.[0]?.attachments || [];
    const att=attachments.find(x=>x.name===attachmentName&&x.contentType==='application/json');
    if(!att||typeof att.body!=='string'||att.body.length>16384||!(/^[A-Za-z0-9+/]*={0,2}$/).test(att.body))return null;
    try{return JSON.parse(Buffer.from(att.body,'base64').toString('utf8'))}catch{return null}
  }
  for(const project of PROJECTS){
    const diff=measurement(project,EXPECTED[0],'v1105-visual-diff');
    const validDiff=diff?.passed===true&&Number.isFinite(diff.width)&&diff.width>0
      &&Number.isFinite(diff.height)&&diff.height>0
      &&Number.isFinite(diff.differentRatio)&&diff.differentRatio>=0&&diff.differentRatio<=0.07;
    checks.push({project,test:'measured same-run pixel difference',passed:validDiff});
    const metrics=measurement(project,EXPECTED[1],'v1105-viewport-metrics');
    const validMetrics=metrics && [metrics.viewportWidth,metrics.scrollWidth,metrics.dialogLeft,metrics.dialogRight,metrics.dialogWidth].every(Number.isFinite)
      && metrics.viewportWidth>0&&metrics.dialogWidth>0&&metrics.scrollWidth<=metrics.viewportWidth+2
      && metrics.dialogLeft>=-2&&metrics.dialogRight<=metrics.viewportWidth+2
      && metrics.searchVisible===true&&metrics.headingVisible===true;
    checks.push({project,test:'measured viewport and dialog geometry',passed:Boolean(validMetrics)});
  }
  // The visual regression scenario must provide two PNG captures in each browser.
  for(const project of PROJECTS){
    const name='V1105 visual: '+EXPECTED[0];
    const count=imageRows.filter(x=>x.project===project&&x.test===name&&x.status==='passed'&&x.image.endsWith('.png')).length;
    checks.push({project,test:'before/after PNG screenshot evidence',passed:count>=2,hasScreenshot:count>=2});
  }
  const clean=results?.stats&&results.stats.unexpected===0&&results.stats.skipped===0&&results.stats.flaky===0;
  checks.push({project:'all',test:'no skipped, failed or flaky browser cases',passed:!!clean});
  return {schema:'sonic-visual-quality-v1105',passed:checks.every(x=>x.passed),
    expectedChecks:checks.length,passedChecks:checks.filter(x=>x.passed).length,
    expectedBrowserCases:PROJECTS.length*EXPECTED.length,verifiedBrowserCases:passedCases,
    projects:PROJECTS,checks};
}
function writeQualityReportV1105(root,results,manifest) {
  const quality=auditQualityV1105(results,manifest);
  const folder=path.join(root,'reports/playwright-production/visual-gallery');
  fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'quality.json'),JSON.stringify(quality,null,2)+'\n');
  const rows=quality.checks.map(c=>`<tr><td>${escapeHtml(c.project)}</td><td>${escapeHtml(c.test)}</td><td>${c.passed?'PASS':'FAIL'}</td></tr>`).join('');
  const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic Display – Visual Quality V1105</title><style>body{font:16px system-ui;margin:2rem auto;max-width:980px;padding:0 1rem;background:#111a27;color:#eef5ff}a{color:#a7d6ff}table{width:100%;border-collapse:collapse}td,th{padding:.65rem;border-bottom:1px solid #3c4960;text-align:left}tr:focus-within{outline:2px solid #fff}</style></head><body><h1>Visual Quality V1105</h1><p>'+ (quality.passed?'Alle Nachweise vorhanden':'Nicht freigegeben: fehlende oder fehlerhafte Nachweise') +'</p><p>'+quality.passedChecks+' / '+quality.expectedChecks+' Kontrollen bestanden. <a href="index.html">Zur Screenshot-Galerie</a></p><table><thead><tr><th>Browser</th><th>Test</th><th>Nachweis</th></tr></thead><tbody>'+rows+'</tbody></table></body></html>';
  fs.writeFileSync(path.join(folder,'quality.html'),html);
  return quality;
}
if(require.main===module){try{
  const root=path.resolve(__dirname,'..'),folder=path.join(root,'reports/playwright-production');
  const quality=writeQualityReportV1105(root,JSON.parse(fs.readFileSync(path.join(folder,'results.json'))),JSON.parse(fs.readFileSync(path.join(folder,'visual-gallery/manifest.json'))));
  console.log('V1105 quality: '+quality.passedChecks+'/'+quality.expectedChecks+' checks');if(!quality.passed)process.exitCode=1;
}catch(e){console.error(e);process.exitCode=1;}}
module.exports={auditQualityV1105,writeQualityReportV1105,EXPECTED,PROJECTS};
