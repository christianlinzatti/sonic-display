'use strict';
/** Four real-browser camera passes: direct/smoothed/smoothed/direct; fail closed. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const ts=require('../tests/typescript-loader.cjs'),Module=require('node:module');
const source=path.join(__dirname,'../services/monitoring/cameraReviewV784.ts');
const built=ts.transpileModule(fs.readFileSync(source,'utf8'),{fileName:source,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const mod=new Module(source,module);mod.filename=source;mod.paths=Module._nodeModulePaths(path.dirname(source));mod._compile(built.outputText,source);
const {reviewCameraRunsV784,CAMERA_ORDER_V784}=mod.exports;
const arg=(k,def)=>process.argv.find(s=>s.startsWith('--'+k+'='))?.slice(k.length+3)??def;
const localUrl=s=>{try{const u=new URL(s);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false}};
function markdown(r){const lines=['# V784 Camera Smoothness Review','',`Status: **${r.status}**`,'',...r.issues.map(x=>'- '+x),''];
 if(r.rows.length){lines.push('| Szene | GLB | Harte Schnitte (off/on) | P95 Rotation-Jerk (off/on) | P95 Position-Jerk (off/on) | Lyrics außerhalb % (off/on) | FPS (off/on) | Warnungen |',
 '|---|---:|---:|---:|---:|---:|---:|---|');
 for(const x of r.rows)lines.push(`| ${x.id} | ${x.avatars} | ${x.hardCutsOff} / ${x.hardCutsOn} | ${x.p95RotationJerkOff} / ${x.p95RotationJerkOn} | ${x.p95PositionJerkOff} / ${x.p95PositionJerkOn} | ${x.lyricSafeOff} / ${x.lyricSafeOn} | ${x.fpsOff} / ${x.fpsOn} | ${x.warnings.join('; ')||'–'} |`);}
 lines.push('','## Grenzen','',...r.notes.map(n=>'- '+n),'');return lines.join('\n');}
function save(out,runs){const report=reviewCameraRunsV784(runs);fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(out.replace(/\.json$/i,'')+'.md',markdown(report));
 if(report.status!=='ready')process.exitCode=2;return report;}
function main(){const out=path.resolve(arg('out','artifacts/v784/camera-review.json'));let runs=[];
 try{
  if(process.argv.includes('--assess-only')){
   const input=arg('input',null);if(!input)throw Error('--assess-only erfordert --input=...');const parsed=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
   runs=Array.isArray(parsed)?parsed:parsed.runs;if(!Array.isArray(runs))throw Error('Keine gültige runs-Liste');
  }else{
   const url=arg('url','http://127.0.0.1:3000');if(!localUrl(url))throw Error('Nur lokale URLs zulässig');
   const extra=[];for(const key of ['glb','glb2','chromium']){const v=arg(key,null);if(v!==null)extra.push(`--${key}=${v}`)}
   for(let i=0;i<CAMERA_ORDER_V784.length;i++){
    const mode=CAMERA_ORDER_V784[i],file=path.join(path.dirname(out),`run-${i+1}-${mode}.json`);
    const args=[path.join(__dirname,'v777-concert-benchmark-browser.cjs'),`--url=${url}`,'--profile=balanced',`--cameraV784=${mode}`,'--passes=2','--warmup=60','--frames=240',`--out=${file}`,...extra];
    const run=cp.spawnSync(process.execPath,args,{encoding:'utf8',timeout:30*60*1000,maxBuffer:3*1024*1024});
    if(run.stdout)process.stdout.write(run.stdout);if(run.stderr)process.stderr.write(run.stderr);
    let record;try{record=JSON.parse(fs.readFileSync(file,'utf8'))}catch{record={status:'blocked',message:'Keine echten Browsermessungen'}}
    runs.push(record);if(run.status!==0||record.status!=='ok')break;
   }
   fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(path.join(path.dirname(out),'runs.json'),JSON.stringify({runs},null,2)+'\n');
  }
  const r=save(out,runs);console.log('V784:',r.status,out);if(r.issues.length)console.error(r.issues.join('; '));
 }catch(e){const r=save(out,runs);console.error('V784 BLOCKED:',String(e?.message||e),r.issues.join('; '));process.exitCode=2;}
}
if(require.main===module)main();module.exports={localUrl,save,markdown};
