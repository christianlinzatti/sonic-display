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
// A bypass credential must only go to the Vercel-generated deployment URL for
// THIS project/team. Arbitrary workflow_dispatch URLs never get a credential.
function trustedAutomationHostV965(url){
 try {
  const {hostname}=new URL(url);
  return /^sonic-display-(?:git-[a-z0-9-]+|[a-z0-9]{9,})-spotify-now\.vercel\.app$/.test(hostname);
 } catch {return false;}
}
function protectionRedirectV965(response,origin){
 if(![301,302,303,307,308].includes(response.status))return false;
 const location=response.headers.get('location');
 if(!location)return false;
 try {
  const target=new URL(location,origin);
  return target.hostname==='vercel.com'||target.hostname.endsWith('.vercel.com');
 }catch{return false;}
}
async function smokeV965(url,fetcher=fetch,options={}){
 const target=normalizeDeploymentUrlV965(url);
 if(!target)return{passed:false,reason:'TARGET_NOT_ALLOWED'};
 try{
  const headers={accept:'text/html'};
  const bypass=options.bypassToken;
  if(bypass!==undefined&&bypass!==null&&bypass!==''){
   if(options.trustedEvent!==true||!trustedAutomationHostV965(target)||
     typeof bypass!=='string'||bypass.length>512||bypass.length<16||/[\r\n]/.test(bypass))
    return{passed:false,reason:'BYPASS_NOT_AUTHORIZED'};
   headers['x-vercel-protection-bypass']=bypass;
  }
  const response=await fetcher(target,{redirect:'manual',headers,
   signal:AbortSignal.timeout(15000)});
  if(response.status!==200)return{passed:false,reason:protectionRedirectV965(response,target)
    ? 'VERCEL_PROTECTION_AUTH_REQUIRED' : 'HTTP_'+response.status};
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
 // Only the trusted Vercel deployment-status event may use the optional
 // automation credential. It is never used for manually supplied URLs.
 const result=await smokeV965(raw,fetch,{
  trustedEvent:process.env.GITHUB_EVENT_NAME==='deployment_status',
  bypassToken:process.env.VERCEL_AUTOMATION_BYPASS_SECRET||undefined,
 });
 const file=path.resolve(__dirname,'../reports/v965-deployment-smoke.json');
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify({schema:'sonic-v965-deployment-smoke-v1',
  startedAt:start,checkedAt:new Date().toISOString(),...result},null,2)+'\n');
 console.log('VERCEL_DEPLOYMENT_SMOKE_V965 '+(result.passed?'PASS':'FAIL')+' '+result.reason);
 if(!result.passed)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error('Smoke check failed safely: '+e.name);process.exitCode=1;});
module.exports={normalizeDeploymentUrlV965,smokeV965,trustedAutomationHostV965};
