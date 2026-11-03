'use strict';
/** Single, mandatory production entry point: real release regressions -> TS -> Next build.
 * No --skip flag, fixture mode or cached result may produce an approval.
 * The Next CLI is invoked directly to avoid npm's prebuild hook re-running all tests.
 */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {inspectBuildV831}=require('./v831-build-readiness.cjs');
const ROOT=path.resolve(__dirname,'..');
const REPORT=path.join(ROOT,'v831-production-gate-result.json');
function evaluateTechnicalGateV831(report){
 return Boolean(report?.readiness?.readyForBuild)&&['check:release','typecheck','next-build'].every(name=>
   report.stages?.some(x=>x.name===name&&x.status==='passed'));
}
function executeV831(opts={}) {
 const root=opts.root??ROOT;
 const readiness=inspectBuildV831(root);
 const report={schemaVersion:1,projectVersion:readiness.projectVersion,readiness,
  status:'blocked',productionReleased:false,stages:[],
  outstanding:['9 real concert runs (rap/tekk/rock x 1/2/4 actual GLB rigs)','Manual lyrics, lip-sync and camera review','Real browser/GPU acceptance']};
 const reportPath=path.join(root,path.basename(REPORT));
 const save=()=>fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
 save();
 if(!readiness.readyForBuild){
  report.stages.push({name:'dependencies',status:'blocked',detail:'Build nicht ausgefuehrt; zuerst npm ci und V831-Doctor-Blocker beheben'});
  save();return {code:1,report};
 }
 if(opts.auditOnly){report.status='ready-to-test';save();return {code:0,report};}
 const npm=process.platform==='win32'?'npm.cmd':'npm';
 const nextBin=path.join(root,'node_modules','next','dist','bin','next');
 const commands=[
  {name:'check:release',bin:npm,args:['run','check:release:flat'],maxMs:45*60*1000},
  {name:'typecheck',bin:npm,args:['run','typecheck'],maxMs:15*60*1000},
  {name:'next-build',bin:process.execPath,args:[nextBin,'build'],maxMs:30*60*1000}
 ];
 for(const stage of commands){
  console.log(`V831 Production Gate: ${stage.name}`);
  const started=Date.now();
  const result=spawnSync(stage.bin,stage.args,{cwd:root,stdio:'inherit',timeout:stage.maxMs,
   windowsHide:true,shell:process.platform==='win32'&&stage.bin===npm});
  const passed=result.status===0&&!result.error&&!result.signal;
  report.stages.push({name:stage.name,status:passed?'passed':'failed',exitCode:result.status,
   signal:result.signal??null,error:result.error?.message??null,durationMs:Date.now()-started});
  save();
  if(!passed)return {code:1,report};
 }
 report.status=evaluateTechnicalGateV831(report)?'technical-gates-passed':'blocked';
 // Even fully successful build is NOT a visual/GPU/hardware acceptance.
 report.productionReleased=false;
 save();return {code:report.status==='technical-gates-passed'?0:1,report};
}
if(require.main===module){
 try{
  const args=process.argv.slice(2);
  if(args.some(x=>x!=='--audit'))throw new Error('Ungueltiges Argument: kein Ueberspringen von Checks erlaubt');
  const result=executeV831({auditOnly:args.includes('--audit')});
  if(result.code)console.error('V831: Technische Freigabe blockiert. Details: v831-production-gate-result.json');
  else console.log('V831:',result.report.status,'; reale Konzerte bleiben offen');
  process.exitCode=result.code;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={executeV831,evaluateTechnicalGateV831};
