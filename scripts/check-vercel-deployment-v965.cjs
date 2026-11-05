#!/usr/bin/env node
'use strict';
/** Public, read-only Vercel deployment smoke check for the Sonic Display project.
 * Never contacts arbitrary addresses: domain allowlist blocks SSRF and redirects
 * are not followed. This verifies public reachability, not Spotify/Govee auth.
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
async function smokeV965(url,fetcher=fetch){
 const target=normalizeDeploymentUrlV965(url);
 if(!target)return{passed:false,reason:'TARGET_NOT_ALLOWED'};
 try{
  const response=await fetcher(target,{redirect:'manual',headers:{accept:'text/html'},
   signal:AbortSignal.timeout(15000)});
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
 const result=await smokeV965(raw);
 const file=path.resolve(__dirname,'../reports/v965-deployment-smoke.json');
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify({schema:'sonic-v965-deployment-smoke-v1',
  startedAt:start,checkedAt:new Date().toISOString(),...result},null,2)+'\n');
 console.log('VERCEL_DEPLOYMENT_SMOKE_V965 '+(result.passed?'PASS':'FAIL')+' '+result.reason);
 if(!result.passed)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error('Smoke check failed safely: '+e.name);process.exitCode=1;});
module.exports={normalizeDeploymentUrlV965,smokeV965};
