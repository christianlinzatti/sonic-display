'use strict';
/** Six real V777/781 Chromium runs, counterbalanced profile order.
 * The renderer is never mocked. Offline --assess-only evaluates saved evidence.
 * Examples:
 * npm run benchmark:v781:motion -- --url=http://127.0.0.1:3000 --glb=/benchmark/avatar.glb
 * npm run benchmark:v781:assess -- --input=artifacts/v781/runs.json
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),Module=require('node:module');
const ts=require('../tests/typescript-loader.cjs');
const source=path.resolve(__dirname,'../services/monitoring/motionSmoothnessV781.ts');
const compiled=ts.transpileModule(fs.readFileSync(source,'utf8'),{fileName:source,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const mod=new Module(source,module);mod.filename=source;mod.paths=Module._nodeModulePaths(path.dirname(source));mod._compile(compiled.outputText,source);
const {reviewMotionRunsV781}=mod.exports;
const arg=(key,def)=>process.argv.find(x=>x.startsWith('--'+key+'='))?.slice(key.length+3)??def;
const localUrl=s=>{try{const u=new URL(s);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}};
function markdown(report){
 const lines=['# Sonic Display V781 – Motion Smoothness Review','','Status: '+report.status,'',
  'Bewertungsbasis: reale GLB-Knochen/Morph-Werte im Browser; synthetische Musiksignale, **keine Spotify-Show**.',''];
 if(report.issues.length)lines.push('## Blockiert',...report.issues.map(x=>'- '+x),'');
 if(report.rows.length){lines.push('## Zeitliche Messwerte','',
 '| Profil | Bühne | Avatare | P95 Frame ms | Pose-Holds % | P95 Pose-Jerk ° | Mund-Holds % | Vokal-MAE | Fußrutschen (heuristisch) | Hinweise |',
 '|---|---|---:|---:|---:|---:|---:|---:|---:|---|');
  for(const r of report.rows)lines.push(`| ${r.profile} | ${r.id} | ${r.avatars} | ${r.worstP95FrameMs} | ${r.worstPoseHoldPct} | ${r.worstP95PoseJerkDeg} | ${r.worstMouthHoldPct} | ${r.worstVocalErrorMean} | ${r.footSlipEvents??'nicht messbar'} | ${r.warnings.join('; ')||'–'} |`);
  lines.push('');}
 lines.push('## Empfehlung','',report.recommendation,'','## Grenzen','',...report.limitations.map(x=>'- '+x),'');return lines.join('\n');
}
function write(out,report){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 const md=out.replace(/\.json$/i,'')+'.md';fs.writeFileSync(md,markdown(report));console.log('V781 Bericht:',out,'/ ',md,'Status:',report.status);}
function assess(records,out){const report=reviewMotionRunsV781(records);write(out,report);if(report.status!=='ready')process.exitCode=2;return report;}
function run(){
 const out=path.resolve(arg('out','artifacts/v781/motion-review.json'));let records=[];
 try{
  if(process.argv.includes('--assess-only')){
   const file=arg('input',null);if(!file)throw Error('Mit --assess-only ist --input= erforderlich');
   const data=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));records=Array.isArray(data)?data:data.runs;
   if(!Array.isArray(records))throw Error('runs.json enthält keine Messungen');
  }else{
   const root=arg('url','http://127.0.0.1:3000');if(!localUrl(root))throw Error('Nur lokale HTTP(S)-Adressen erlaubt');
   const args=[];for(const key of ['glb','glb2','chromium','warmup','frames']){const val=arg(key,null);if(val!==null)args.push('--'+key+'='+val)}
   // Fixed passes=2, all six cases, the V779 alternating order.
   const order=['cinematic','balanced','economy','economy','balanced','cinematic'];
   for(let i=0;i<order.length;i++){
    const profile=order[i],file=path.join(path.dirname(out),'run-'+String(i+1).padStart(2,'0')+'-'+profile+'.json');
    const cmd=[path.join(__dirname,'v777-concert-benchmark-browser.cjs'),`--url=${root}`,`--profile=${profile}`,
      '--motionV781','--passes=2',`--out=${file}`,...args];
    const proc=cp.spawnSync(process.execPath,cmd,{encoding:'utf8',timeout:30*60*1000,maxBuffer:2*1024*1024});
    if(proc.stdout)process.stdout.write(proc.stdout);if(proc.stderr)process.stderr.write(proc.stderr);
    let row;try{row=JSON.parse(fs.readFileSync(file,'utf8'))}catch{row={status:'blocked',message:'Keine gültige Browserantwort'}}
    row.profileV779=profile;records.push(row);
    if(proc.status!==0||row.status!=='ok'){console.error('V781: Abbruch nach blockiertem echten Browserlauf.');break}
   }
   fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(path.join(path.dirname(out),'runs.json'),JSON.stringify(records,null,2)+'\n');
  }
  assess(records,out);
 }catch(e){const msg=String(e?.message||e).slice(0,600);const report=reviewMotionRunsV781(records);
  report.issues.unshift(msg);report.status='blocked';report.rows=[];write(out,report);process.exitCode=2;console.error('V781 BLOCKED:',msg)}
}
if(require.main===module)run();
module.exports={localUrl,markdown,assess};
