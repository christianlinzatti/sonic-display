"use strict";
/** Local-only comparison of independent V641 QA recordings at 1, 2 and 4 GLB avatars.
 * FPS frame stats do not certify GPU timing, visual quality or target hardware.
 * No access to Spotify cookies or audio; no invented performance values.
 */
const fs=require('node:fs'),path=require('node:path');
const {load}=require('../tests/helpers/ts-loader-v404.cjs');
const {auditFullConcertV641,validV641Observation}=load('components/visualizer/fullConcertQualityAuditV641');
const median=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),i=Math.floor(s.length/2);return s.length%2?s[i]:(s[i-1]+s[i])/2;};
function readProfile(filename,expected){
 if(typeof filename!=='string'||!filename)return {avatarCount:expected,status:'missing',audit:null,metrics:null};
 const full=path.resolve(filename),stat=fs.statSync(full);
 if(!stat.isFile()||stat.size<30||stat.size>8*1024*1024)throw Error(`V641: unsafe or oversized profile file (${expected})`);
 const file=JSON.parse(fs.readFileSync(full,'utf8'));
 if(file?.format!=='sonic-v641-live-song-audit'||file.source!=='v466-qa-measurements-and-stage-cues'||
    file.automaticallyApproved!==false||!Array.isArray(file.observations)||file.observations.length<2||file.observations.length>1200||
    !file.observations.every(validV641Observation))throw Error(`V641: invalid local QA evidence for ${expected} avatars`);
 const recomputed=auditFullConcertV641(file.observations);
 if(recomputed.samples!==file.observations.length||recomputed.trackId!==file.trackId||recomputed.durationMs!==file.durationMs||
    Math.abs(recomputed.coveragePercent-file.coveragePercent)>0.05)throw Error(`V641: untrusted or inconsistent capture at ${expected} avatars`);
 const observed=new Set(file.observations.map(s=>s.avatarCount));
 const verified=file.observations.filter(s=>s.verifiedGlbActors===expected).length;
 if(!observed.has(expected)||Array.from(observed).some(n=>n!==0&&n!==expected))throw Error(`V641: unexpected avatar slot count for profile ${expected}`);
 if(verified/file.observations.length<.75)throw Error(`V641: fewer than 75% of measurements verify ${expected} actual GLB meshes; enable local ?benchmarkV592=1`);
 const metrics={medianFps:recomputed.medianFps,medianP95Ms:recomputed.medianP95Ms,
  medianDrawCalls:median(file.observations.map(s=>s.drawCalls).filter(Number.isFinite)),
  medianTriangles:median(file.observations.map(s=>s.triangles).filter(Number.isFinite))};
 return {avatarCount:expected,status:recomputed.status,coveragePercent:recomputed.coveragePercent,
  samples:recomputed.samples,verifiedGlbFraction:Math.round(verified/file.observations.length*1000)/1000,trackId:recomputed.trackId,durationMs:recomputed.durationMs,
  fpsBelow30:recomputed.fpsBelow30,headsOutsideFrame:recomputed.headsOutsideFrame,lyricWarnings:recomputed.lyricWarnings,
  metrics};
}
function compareProfiles(args){
 const profiles=[1,2,4].map(c=>readProfile(args[`avatar${c}`],c));
 const present=profiles.filter(p=>p.status!=='missing');
 if(new Set(present.map(p=>p.trackId)).size>1||new Set(present.map(p=>p.durationMs)).size>1)
  throw Error('V641: compare only the same song and duration across all three profiles');
 const complete=profiles.every(p=>p.status==='broad-coverage-needs-human-review');
 return {format:'sonic-v641-local-avatar-performance-comparison',status:complete?'broad-measurement-coverage-needs-human-review':'incomplete-evidence',
  source:'three-independent-manual-browser-qa-captures',deviceLabel:String(args.deviceLabel??'not-recorded').slice(0,120),
  profiles,visualQualityApproved:false,hardwareSuitabilityCertified:false,
  notes:['Only measured browser FPS, P95, Draw Calls and triangles are compared; hardware load and GPU time are not directly measured.',
   'Repeat on the SAME computer, browser, resolution, song, scene and GLB assets for meaningful comparison.',
   'Never extrapolate measured Windows GPU values to a Raspberry Pi; visual and audio/lip-sync review remains manual.']};
}
function main(){try{
 const cli=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>{const n=x.indexOf('=');return [x.slice(2,n),x.slice(n+1)];}));
 if(!cli.avatar1&&!cli.avatar2&&!cli.avatar4)throw Error('Use --avatar1=report.json --avatar2=report.json --avatar4=report.json [--out=report.json]');
 const report=compareProfiles(cli);const result=JSON.stringify(report,null,2)+'\n';
 if(cli.out){const out=path.resolve(cli.out);if(Object.entries(cli).some(([k,v])=>/^avatar[124]$/.test(k)&&path.resolve(v)===out))throw Error('Refusing to overwrite source capture');fs.writeFileSync(out,result);}
 console.log(result);
 if(report.status==='incomplete-evidence')process.exitCode=2;
 }catch(e){console.error('V641 comparison blocked:',e.message);process.exitCode=1;}}
if(require.main===module)main();
module.exports={compareProfiles,readProfile};
