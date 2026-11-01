'use strict';
/** V779 controlled browser sweep: V777 real Chromium measurements, not estimates.
 * Paired, counterbalanced profile order; only localhost; keep blocked reports.
 * Usage: npm run benchmark:v779:sweep -- --url=http://127.0.0.1:3000 --glb=/benchmark/your-avatar.glb --rounds=2 --target=45 --avatars=4
 * Offline re-evaluation: npm run benchmark:v779:assess -- --input=artifacts/v779/runs.json --target=45
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),Module=require('node:module');
const ts=require('../tests/typescript-loader.cjs');
const file=path.resolve(__dirname,'../services/monitoring/concertQualityProfilesV779.ts');
const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(compiled.outputText,file);
const {assessProfileSweepV779,plannedProfileOrderV779}=m.exports;
const arg=(key,def)=>process.argv.find(x=>x.startsWith('--'+key+'='))?.slice(key.length+3)??def;
function int(key,def,values){const n=Number(arg(key,String(def)));if(!values.includes(n))throw Error('Ungültiger Parameter --'+key);return n}
function localUrl(value){try{const u=new URL(value);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false}}
const bounded=(s,max)=>String(s).slice(0,max);
function markdown(summary){
 const a=[`# Sonic Display V779 – Quality Sweep`,
  '',`- Status: ${summary.status}`,`- FPS-Ziel: ${summary.targetFps}`,`- Avatare: ${summary.targetAvatars}`,`- Runden: ${summary.rounds}`,
  `- Empfohlenes Profil: ${summary.recommendedProfile??'keines'}`,`- Option bei zwei Avataren: ${summary.twoAvatarAlternative??'keine'}`,''];
 if(summary.issues.length){a.push('## Blockiert',...summary.issues.map(s=>'- '+s),'')}
 if(summary.rows.length){a.push('| Profil | Bühne | GLBs | Min. FPS | Schlechteste P95 ms | Median Calls | Ziel | Streuung |',
  '|---|---|---:|---:|---:|---:|---|---|');
  for(const r of summary.rows)a.push(`| ${r.profile} | ${r.stage} | ${r.avatars} | ${r.minFps} | ${r.worstP95Ms} | ${r.medianCalls} | ${r.passed?'Ja':'Nein'} | ${r.unstable?'Instabil':'OK'} |`);
  a.push('');}
 a.push('## Grenzen',...summary.notes.map(s=>'- '+s),'');return a.join('\n');
}
function writeResult(out,result){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 const md=out.replace(/\.json$/i,'')+'.md';fs.writeFileSync(md,markdown(result));
 console.log('V779 JSON:',out,'\nV779 Markdown:',md,'\nStatus:',result.status,'\nProfil:',result.recommendedProfile||'nicht nachgewiesen');}
async function run(){
 const out=path.resolve(arg('out','artifacts/v779/quality-sweep.json'));
 const target=int('target',60,[30,45,60]),avatars=int('avatars',4,[2,4]);
 const rounds=int('rounds',2,[2,3,4,5,6]);
 let records=[];
 try{
  if(process.argv.includes('--assess-only')){
   const input=arg('input',null);if(!input)throw Error('--assess-only benötigt --input=...');
   const v=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
   records=Array.isArray(v)?v:v.runs;
   if(!Array.isArray(records))throw Error('Keine gespeicherten Browserläufe gefunden');
  } else {
   const root=arg('url','http://127.0.0.1:3000');if(!localUrl(root))throw Error('Nur lokale URLs erlaubt');
   const order=plannedProfileOrderV779(rounds);
   const dir=path.dirname(out),common=[];
   for(const option of ['glb','glb2','chromium','passes','warmup','frames']){
    const value=arg(option,null);if(value!==null)common.push(`--${option}=${value}`);
   }
   // Fail early. A failed run never results in invented or partial "ready" metrics.
   for(let i=0;i<order.length;i++){
    const profile=order[i],raw=path.join(dir,`run-${String(i+1).padStart(2,'0')}-${profile}.json`);
    const proc=cp.spawnSync(process.execPath,[path.join(__dirname,'v777-concert-benchmark-browser.cjs'),
      `--url=${root}`,`--profile=${profile}`,`--label=V779-${profile}-${i+1}`,`--out=${raw}`,...common],
      {encoding:'utf8',timeout:30*60*1000,maxBuffer:2*1024*1024});
    if(proc.stdout)process.stdout.write(proc.stdout);
    if(proc.stderr)process.stderr.write(proc.stderr);
    let record;try{record=JSON.parse(fs.readFileSync(raw,'utf8'))}catch{record={status:'blocked',message:'Kein gültiges Runner-JSON: '+bounded(proc.error?.message||proc.stderr||'',500)}}
    record.profileV779=profile;
    records.push(record);
    if(proc.status!==0||record.status!=='ok'){
      console.error('V779: Browserlauf blockiert; keine zusätzlichen Profile gestartet.');break;
    }
   }
   fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'runs.json'),JSON.stringify(records,null,2)+'\n');
  }
  const result=assessProfileSweepV779(records,target,avatars);
  writeResult(out,result);
  if(result.status!=='ready')process.exitCode=2;
 }catch(e){
  console.error('V779 BLOCKED:',bounded(e?.message||e,700));
  const result=assessProfileSweepV779(records,target,avatars);
  result.status='blocked';result.recommendedProfile=null;result.twoAvatarAlternative=null;result.rows=[];
  result.issues.unshift(bounded(e?.message||e,700));writeResult(out,result);process.exitCode=2;
 }
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=2});
module.exports={localUrl,markdown,writeResult};
