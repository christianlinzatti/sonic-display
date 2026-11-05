#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {normalizeDeploymentUrlV965,smokeV965,trustedAutomationHostV965}=require('../scripts/check-vercel-deployment-v965.cjs');
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
 assert.equal((await smokeV965('https://example.org/',fake)).passed,false);assert.equal(attempts,1);
 for(const [r,reason] of [[response(403),'HTTP_403'],[response(307),'HTTP_307'],
   [response(200,'application/json'),'NOT_HTML'],[response(200,'text/html','not html'),'HTML_NOT_READY'],
   [response(200,'text/html','<html><body>'+('x'.repeat(2500001))+'</body></html>'),'HTML_NOT_READY']]){
  const x=await smokeV965(valid,async()=>r);assert.equal(x.reason,reason);
 }
 assert.equal((await smokeV965(valid,async()=>{throw Error('connection refused')})).passed,false);
 // A Vercel login redirect is NOT proof that the deployed app is ready.
 const authRedirect={status:302,headers:{get:(name)=>name==='location'?'https://vercel.com/login?next=protected':'text/html'}};
 assert.equal((await smokeV965(valid,async()=>authRedirect)).reason,'VERCEL_PROTECTION_AUTH_REQUIRED');
 assert.equal((await smokeV965(valid,async()=>response(302))).reason,'HTTP_302');
 assert.equal(trustedAutomationHostV965(valid),true);
 assert.equal(trustedAutomationHostV965('https://sonic-display.vercel.app/'),false);
 assert.equal(trustedAutomationHostV965('https://sonic-display-attacker.vercel.app/'),false);
 assert.equal(trustedAutomationHostV965('https://sonic-display-test-other-team.vercel.app/'),false);
 const secret='test-automation-token-123456';
 let trustedCalls=0;
 const tokenFetcher=async (_url,options)=>{
  trustedCalls++;
  assert.equal(options.headers['x-vercel-protection-bypass'],secret);
  assert.equal(options.redirect,'manual');
  return response();
 };
 const verified=await smokeV965(valid,tokenFetcher,{trustedEvent:true,bypassToken:secret});
 assert.equal(verified.passed,true);assert.equal(trustedCalls,1);
 assert.equal(JSON.stringify(verified).includes(secret),false);
 for(const [url,options] of [
  [valid,{trustedEvent:false,bypassToken:secret}],
  ['https://sonic-display.vercel.app/',{trustedEvent:true,bypassToken:secret}],
  [valid,{trustedEvent:true,bypassToken:'bad\nheader'}],
  [valid,{trustedEvent:true,bypassToken:'short'}]
 ]){
  const result=await smokeV965(url,tokenFetcher,options);
  assert.equal(result.passed,false);
  assert.equal(result.reason,'BYPASS_NOT_AUTHORIZED');
  assert.equal(trustedCalls,1,'Never send credentials to untrusted targets or events');
 }

 const config=fs.readFileSync(path.join(root,'.github/workflows/v965-deployment-smoke.yml'),'utf8');
 assert(config.includes('deployment_status:'));assert(config.includes('workflow_dispatch:'));
 assert(config.includes('VERCEL_DEPLOYMENT_URL:'));
 assert(config.includes("github.event_name == 'deployment_status' && secrets.VERCEL_AUTOMATION_BYPASS_SECRET"));
 assert(config.includes('node scripts/check-vercel-deployment-v965.cjs'));
 assert(config.includes('ubuntu-24.04'));
 console.log('PASS V965 deployment smoke: strict allowlist, protected redirects fail closed, opt-in CI token, HTML readiness and CI workflow');
})().catch(e=>{console.error(e);process.exitCode=1});
