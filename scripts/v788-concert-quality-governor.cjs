'use strict';
/** Four real-browser concert passes, fail closed on missing reports. No fake samples. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),Module=require('node:module');
const ts=require('../tests/typescript-loader.cjs');
const source=path.join(__dirname,'../services/monitoring/concertGovernorReviewV788.ts');
const js=ts.transpileModule(fs.readFileSync(source,'utf8'),{fileName:source,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const mod=new Module(source,module);mod.filename=source;mod.paths=Module._nodeModulePaths(path.dirname(source));mod._compile(js.outputText,source);
const {reviewConcertGovernorV788,GOVERNOR_ORDER_V788}=mod.exports;
const arg=(name,def)=>process.argv.find(s=>s.startsWith('--'+name+'='))?.slice(name.length+3)??def;
const localUrl=x=>{try{const u=new URL(x);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}};
function markdown(r){const lines=['# V788 – Intelligent Concert Quality Governor','','Status: **'+r.status+'**','',...r.issues.map(i=>'- '+i),''];
 if(r.rows.length){lines.push('| Szene | GLBs | FPS off/on | P95 ms off/on | Draw Calls off/on | Level 1 / 2 Frames | Wechsel | Ziel erreicht |', '|---|---:|---:|---:|---:|---:|---:|---|');
  for(const row of r.rows)lines.push(`| ${row.id} | ${row.avatars} | ${row.fpsOff} / ${row.fpsOn} | ${row.p95Off} / ${row.p95On} | ${row.callsOff} / ${row.callsOn} | ${row.levelOneFrames} / ${row.levelTwoFrames} | ${row.switches} | ${row.reachedTarget?'ja':'nein'} |`);}
 lines.push('','## Grenzen','',...r.notes.map(n=>'- '+n));return lines.join('\n')+'\n';}
function save(out,runs,target){const report=reviewConcertGovernorV788(runs,target);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(out.replace(/\.json$/i,'')+'.md',markdown(report));if(report.status!=='ready')process.exitCode=2;return report;}
function main(){const out=path.resolve(arg('out','artifacts/v788/governor-review.json'));const target=Number(arg('target','45'));let runs=[];
 try{
  if(process.argv.includes('--assess-only')){const input=arg('input',null);if(!input)throw Error('--assess-only benötigt --input');const parsed=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));runs=Array.isArray(parsed)?parsed:parsed.runs;if(!Array.isArray(runs))throw Error('Keine runs-Liste')}
  else{
   const url=arg('url','http://127.0.0.1:3000');if(!localUrl(url))throw Error('Ausschließlich lokale Browser-URLs zulässig');
   const extra=[];for(const k of ['glb','glb2','chromium']){const value=arg(k,null);if(value!==null)extra.push(`--${k}=${value}`)}
   for(let i=0;i<GOVERNOR_ORDER_V788.length;i++){
    const mode=GOVERNOR_ORDER_V788[i],file=path.join(path.dirname(out),`run-${i+1}-${mode}.json`);
    const args=[path.join(__dirname,'v777-concert-benchmark-browser.cjs'),`--url=${url}`,`--label=V788-${mode}-${i+1}`,'--profile=cinematic','--interpolationV782=on','--lipGuardV783=on','--cameraV784=on','--lyricsV785=on',`--governorV788=${mode}`,`--targetV788=${target}`,'--passes=2','--warmup=60','--frames=240',`--out=${file}`,...extra];
    const run=cp.spawnSync(process.execPath,args,{encoding:'utf8',timeout:30*60*1000,maxBuffer:4*1024*1024});
    if(run.stdout)process.stdout.write(run.stdout);if(run.stderr)process.stderr.write(run.stderr);
    let record;try{record=JSON.parse(fs.readFileSync(file,'utf8'))}catch{record={status:'blocked',message:'Keine Browsermessungen'}}
    runs.push(record);if(run.status!==0||record.status!=='ok')break;
   }
   fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(path.join(path.dirname(out),'runs.json'),JSON.stringify({runs},null,2)+'\n');
  }
  const result=save(out,runs,target);console.log('V788:',result.status,out);if(result.issues.length)console.error(result.issues.join('; '));
 }catch(e){const result=save(out,runs,target);console.error('V788 BLOCKED:',String(e?.message||e));process.exitCode=2;}
}
if(require.main===module)main();module.exports={localUrl,markdown,save};
