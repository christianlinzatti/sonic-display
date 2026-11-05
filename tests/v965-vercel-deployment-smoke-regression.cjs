#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {normalizeDeploymentUrlV965,smokeV965}=require('../scripts/check-vercel-deployment-v965.cjs');
const root=path.resolve(__dirname,'..');
const valid='https://sonic-display-ojoy87064-spotify-now.vercel.app/';
assert.equal(normalizeDeploymentUrlV965(valid),valid);
assert.equal(normalizeDeploymentUrlV965('sonic-display.vercel.app'),'https://sonic-display.vercel.app/');
for(const untrusted of ['','http://sonic-display.vercel.app/','https://example.com/',
 'https://sonic-display.vercel.app.evil.com/','https://evil-sonic-display.vercel.app/',
 'https://sonic-display.vercel.app:8080/','https://sonic-display.vercel.app/admin',
 'https://sonic-display.vercel.app/?token=secret','https://a:b@sonic-display.vercel.app/',
 'https://127.0.0.1/','https://sonic-display.vercel.app/#secret',
 'https://sonic-display.vercel.app@127.0.0.1/'])
 assert.equal(normalizeDeploymentUrlV965(untrusted),null,'Unsafe URL must be rejected: '+untrusted);
const response=(status=200,type='text/html; charset=utf-8',html='<!doctype html><html><body>ok</body></html>')=>({
 status,headers:{get:()=>type},text:async()=>html});
(async()=>{
 let attempts=0;
 const fake=async (url,options)=>{attempts++;assert.equal(url,valid);
  assert.equal(options.redirect,'manual');return response();};
 assert.equal((await smokeV965(valid,fake)).passed,true);assert.equal(attempts,1);
 // Vercel's automation bypass is optional and must only go to the allowed URL.
 const token='unit-test-vercel-automation-secret';
 let headerRequest;
 const withBypass=await smokeV965(valid,async(url,options)=>{
  assert.equal(url,valid); headerRequest=options; return response();
 },{automationBypassSecret:token});
 assert.equal(withBypass.passed,true);
 assert.equal(headerRequest.headers['x-vercel-protection-bypass'],token);
 assert.equal(headerRequest.redirect,'manual');
 assert.equal(JSON.stringify(withBypass).includes(token),false,'Never disclose bypass token');
 let publicRequest;
 assert.equal((await smokeV965(valid,async(url,options)=>{
  publicRequest=options;return response();
 })).passed,true);
 assert.equal(Object.hasOwn(publicRequest.headers,'x-vercel-protection-bypass'),false);
 let redirectCalls=0;
 const protectedResult=await smokeV965(valid,async(url,options)=>{
  redirectCalls++;assert.equal(options.redirect,'manual');return response(302);
 },{automationBypassSecret:token});
 assert.equal(protectedResult.reason,'HTTP_302','Protected or redirected URLs must not pass');
 assert.equal(redirectCalls,1,'Never follow authentication redirects');
 let unsafeCalls=0;
 const unsafe=await smokeV965('https://example.org/',async()=>{unsafeCalls++;return response();},
  {automationBypassSecret:token});
 assert.equal(unsafe.reason,'TARGET_NOT_ALLOWED');
 assert.equal(unsafeCalls,0,'Never send token to untrusted hosts');
 for(const invalid of ['bad\r\nInjected: true','a'.repeat(2049),42]){
  const actual=await smokeV965(valid,async()=>{throw Error('must not request')},
   {automationBypassSecret:invalid});
  assert.equal(actual.reason,'INVALID_AUTOMATION_BYPASS_SECRET');
 }

 assert.equal((await smokeV965('https://example.org/',fake)).passed,false);assert.equal(attempts,1);
 for(const [r,reason] of [[response(403),'HTTP_403'],[response(307),'HTTP_307'],
   [response(200,'application/json'),'NOT_HTML'],[response(200,'text/html','not html'),'HTML_NOT_READY'],
   [response(200,'text/html','<html><body>'+('x'.repeat(2500001))+'</body></html>'),'HTML_NOT_READY']]){
  const x=await smokeV965(valid,async()=>r);assert.equal(x.reason,reason);
 }
 assert.equal((await smokeV965(valid,async()=>{throw Error('connection refused')})).passed,false);
 const config=fs.readFileSync(path.join(root,'.github/workflows/v965-deployment-smoke.yml'),'utf8');
 assert(config.includes('deployment_status:'));assert(config.includes('workflow_dispatch:'));
 assert(config.includes('VERCEL_DEPLOYMENT_URL:'));
 assert(config.includes("VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}"),
  'GitHub Actions must supply bypass through a secret, not literal or public URL');
 assert(config.includes('node scripts/check-vercel-deployment-v965.cjs'));
 assert(config.includes('ubuntu-24.04'));
 console.log('PASS V965 public deployment smoke: strict host allowlist, optional secret-only header, no redirects, HTTP/HTML readiness and CI workflow');
})().catch(e=>{console.error(e);process.exitCode=1});
