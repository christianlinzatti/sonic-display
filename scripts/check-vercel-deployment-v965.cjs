#!/usr/bin/env node
'use strict';
/** Public, read-only Vercel deployment smoke check for the Sonic Display project.
 * Never contacts arbitrary addresses: domain allowlist blocks SSRF and redirects
 * are not followed. Optional CI-only bypass header tests protected deployments
 * without weakening public URL rules or exposing tokens in diagnostics.
 * This verifies HTML readiness, not Spotify/Govee auth.
 */
const fs=require('node:fs');
const path=require('node:path');
function normalizeDeploymentUrlV965(raw){
 if(typeof raw!=='string'||!raw.trim()||raw.length>300)return null;
 const text=raw.trim();
 try{
  const u=new URL(text.startsWith('https://')?text:'https://'+text);
  if(u.protocol!=='https:'||u.port||u.username||u.password||u.pathname!=='/'||u.search||u.hash||
    !/^sonic-display(?:-[a-z0-9-]+)?\.vercel\.app$/.test(u.hostname))return null;
  return u.origin+'/';
 }catch{return null;}
}
async function smokeV965(url,fetcher=fetch,options={}){
 // Resolve the target before touching any credentials. A bypass token must never
 // be sent to unknown hosts or forwarded through an HTTP redirect.
 const target=normalizeDeploymentUrlV965(url);
 if(!target)return{passed:false,reason:'TARGET_NOT_ALLOWED'};
 const secret=options.automationBypassSecret??'';
 if(typeof secret!=='string'||secret.length>2048||/[\r\n]/.test(secret))
  return{passed:false,reason:'INVALID_AUTOMATION_BYPASS_SECRET'};
 const headers={accept:'text/html'};
 if(secret)headers['x-vercel-protection-bypass']=secret;
 try{
  const response=await fetcher(target,{redirect:'manual',headers,
   signal:AbortSignal.timeout(15000)});
  // Even with a bypass token, redirects and sign-in pages do not count as healthy.
  // Never include Location, request headers, or token values in the report.
  if(response.status!==200)return{passed:false,reason:'HTTP_'+response.status};
  if(!/^text\/html(?:;|$)/i.test(response.headers.get('content-type')||''))
   return{passed:false,reason:'NOT_HTML'};
  const html=await response.text();
  if(html.length>2500000||!/<html[\s>]/i.test(html)||!/<body[\s>]/i.test(html))
   return{passed:false,reason:'HTML_NOT_READY'};
  return{passed:true,reason:'PUBLIC_HTML_READY'};
 }catch(e){return{passed:false,reason:'NETWORK_'+(e.name==='TimeoutError'?'TIMEOUT':'ERROR')};}
}
async function main(){
 const raw=process.env.VERCEL_DEPLOYMENT_URL||process.argv[2]||'';
 const start=new Date().toISOString();
 const result=await smokeV965(raw,fetch,{
  automationBypassSecret:process.env.VERCEL_AUTOMATION_BYPASS_SECRET||''
 });
 const file=path.resolve(__dirname,'../reports/v965-deployment-smoke.json');
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify({schema:'sonic-v965-deployment-smoke-v1',
  startedAt:start,checkedAt:new Date().toISOString(),...result},null,2)+'\n');
 console.log('VERCEL_DEPLOYMENT_SMOKE_V965 '+(result.passed?'PASS':'FAIL')+' '+result.reason);
 if(!result.passed)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error('Smoke check failed safely: '+e.name);process.exitCode=1;});
module.exports={normalizeDeploymentUrlV965,smokeV965};
