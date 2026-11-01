'use strict';
/** V783: paired real-browser lip-sync comparison; --assess-only processes saved records. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),Module=require('node:module');
const ts=require('../tests/typescript-loader.cjs');
const src=path.resolve(__dirname,'../services/monitoring/lipSyncGuardReviewV783.ts');
const js=ts.transpileModule(fs.readFileSync(src,'utf8'),{fileName:src,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const m=new Module(src,module);m.filename=src;m.paths=Module._nodeModulePaths(path.dirname(src));m._compile(js.outputText,src);
const {V783_ORDER,reviewLipSyncGuardV783}=m.exports;
const arg=(k,d)=>process.argv.find(s=>s.startsWith('--'+k+'='))?.slice(k.length+3)??d;
const localUrl=s=>{try{const u=new URL(s);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
function markdown(r){const rows=['# V783 – GLB Lip-Sync Quality Guard Review','','Status: '+r.status,''];
 if(r.issues.length)rows.push(...r.issues.map(i=>'- '+i),'');
 if(r.rows.length){rows.push('| Profil | Bühne | Avatare | Mund-Holds off → on % | Vocal-Error off → on | Pose-Jerk off → on ° | P95 ms off → on | FPS off → on | Warnungen |',
 '|---|---|---:|---:|---:|---:|---:|---:|---|');
 for(const x of r.rows)rows.push(`| ${x.profile} | ${x.id} | ${x.avatars} | ${x.mouthHoldsOff} → ${x.mouthHoldsOn} | ${x.vocalErrorOff} → ${x.vocalErrorOn} | ${x.poseJerkOff} → ${x.poseJerkOn} | ${x.p95MsOff} → ${x.p95MsOn} | ${x.fpsOff} → ${x.fpsOn} | ${x.warnings.join('; ')||'–'} |`);}
 rows.push('','## Messgrenzen','',...r.notes.map(x=>'- '+x),'');return rows.join('\n');}
function save(out,records){const r=reviewLipSyncGuardV783(records);fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');fs.writeFileSync(out.replace(/\.json$/i,'')+'.md',markdown(r));
 if(r.status!=='ready')process.exitCode=2;return r;}
function main(){const out=path.resolve(arg('out','artifacts/v783/lip-guard-review.json'));let records=[];
 try{
  if(process.argv.includes('--assess-only')){const p=arg('input',null);if(!p)throw Error('--assess-only benötigt --input=...');
   const val=JSON.parse(fs.readFileSync(path.resolve(p),'utf8'));records=Array.isArray(val)?val:val.runs;if(!Array.isArray(records))throw Error('Keine gültigen Läufe');
  }else{
   const url=arg('url','http://127.0.0.1:3000');if(!localUrl(url))throw Error('Nur lokale URLs erlaubt');
   const extra=[];for(const key of ['glb','glb2','chromium','warmup','frames']){const v=arg(key,null);if(v!==null)extra.push('--'+key+'='+v)}
   for(let i=0;i<V783_ORDER.length;i++){
    const [profile,mode]=V783_ORDER[i],file=path.join(path.dirname(out),`run-${i+1}-${profile}-${mode}.json`);
    const args=[path.join(__dirname,'v777-concert-benchmark-browser.cjs'),`--url=${url}`,`--profile=${profile}`,
     `--interpolationV782=on`,`--lipGuardV783=${mode}`,'--motionV781','--passes=2',`--out=${file}`,...extra];
    const result=cp.spawnSync(process.execPath,args,{encoding:'utf8',timeout:30*60*1000,maxBuffer:3*1024*1024});
    if(result.stdout)process.stdout.write(result.stdout);if(result.stderr)process.stderr.write(result.stderr);
    let record;try{record=JSON.parse(fs.readFileSync(file,'utf8'))}catch{record={status:'blocked',message:'Kein Browserbericht'}}
    record.profileV779=profile;records.push(record);
    if(result.status!==0||record.status!=='ok')break;
   }
   fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(path.join(path.dirname(out),'runs.json'),JSON.stringify({runs:records},null,2)+'\n');
  }
  const r=save(out,records);console.log('V783',r.status,out);if(r.issues.length)console.error(r.issues.join('; '));
 }catch(e){const r=save(out,records);console.error('V783 BLOCKED:',String(e?.message||e),r.issues.join('; '));process.exitCode=2;}
}
if(require.main===module)main();
module.exports={localUrl,markdown,save};
