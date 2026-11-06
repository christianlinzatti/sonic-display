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
const response=(status=200,type='text/html; charset=utf-8',html='<!doctype html><html><head><title>Sonic Display</title></head><body>ok</body></html>')=>({
 status,headers:{get:()=>type},text:async()=>html});
(async()=>{
 let attempts=0;
 const fake=async (url,options)=>{attempts++;assert.equal(url,valid);
  assert.equal(options.redirect,'manual');return response();};
 assert.equal((await smokeV965(valid,fake)).passed,true);assert.equal(attempts,1);
 assert.equal((await smokeV965('https://example.org/',fake)).passed,false);assert.equal(attempts,1);
 for(const [r,reason] of [[response(403),'HTTP_403'],[response(307),'HTTP_307'],
   [response(200,'application/json'),'NOT_HTML'],[response(200,'text/html','not html'),'HTML_NOT_READY'],
   [response(200,'text/html','<html><body>'+('x'.repeat(2500001))+'</body></html>'),'HTML_NOT_READY']]){
  const x=await smokeV965(valid,async()=>r);assert.equal(x.reason,reason);
 }
 assert.equal((await smokeV965(valid,async()=>{throw Error('connection refused')})).passed,false);
 const secret='test-bypass-value-not-a-real-token';
 const protectedResult=await smokeV965(valid,async (url,options)=>{
  assert.equal(url,valid);assert.equal(options.redirect,'manual');
  assert.equal(options.headers['x-vercel-protection-bypass'],secret);return response();
 },{automationBypassSecret:secret});
 assert.equal(protectedResult.reason,'PROTECTED_HTML_READY');
 assert(!JSON.stringify(protectedResult).includes(secret));
 let unsafeCalls=0;const unsafe=async()=>{unsafeCalls++;return response();};
 assert.equal((await smokeV965('https://example.org/',unsafe,{automationBypassSecret:secret})).passed,false);
 assert.equal((await smokeV965(valid,unsafe,{automationBypassSecret:'bad\r\nheader'})).reason,'INVALID_AUTOMATION_BYPASS_SECRET');
 assert.equal(unsafeCalls,0);
 let redirects=0;
 const redirected=await smokeV965(valid,async(_url,options)=>{
  redirects++;assert.equal(options.redirect,'manual');return response(302);
 },{automationBypassSecret:secret});
 assert.equal(redirected.reason,'HTTP_302');assert.equal(redirects,1);
 const login=await smokeV965(valid,async()=>response(200,'text/html','<html><head><title>Login – Vercel</title></head><body>Sign in</body></html>'),{automationBypassSecret:secret});
 assert.equal(login.reason,'NOT_SONIC_DISPLAY_HTML');
 const config=fs.readFileSync(path.join(root,'.github/workflows/v965-deployment-smoke.yml'),'utf8');
 assert(config.includes('deployment_status:'));assert(config.includes('workflow_dispatch:'));
 assert(config.includes('VERCEL_DEPLOYMENT_URL:'));
 assert(config.includes('node scripts/check-vercel-deployment-v965.cjs'));
 assert(config.includes('ubuntu-24.04'));
 console.log('PASS V965 public deployment smoke: strict host allowlist, no redirects, HTTP/HTML readiness and CI workflow');
})().catch(e=>{console.error(e);process.exitCode=1});
