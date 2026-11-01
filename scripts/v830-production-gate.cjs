'use strict';
/** Explicit local production gate. No sample/fixture can create a PASS.
 * `npm run verify:production:v830` executes actual release checks, TS, Next build.
 * A JSON report is always written (even for missing deps / a failed step).
 * The Next CLI is called directly only AFTER check:release so npm prebuild does
 * not duplicate the very long regression chain. No skip/check bypass flag.
 */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const npm=process.platform==='win32'?'npm.cmd':'npm';
const nextBinary=path.join(root,'node_modules','next','dist','bin','next');
const typescript=path.join(root,'node_modules','typescript','bin','tsc');
const reportFile=path.join(root,'v830-production-gate-result.json');
function environmentReport(){
 const pkg=require(path.join(root,'package.json'));
 return {schemaVersion:1,projectVersion:pkg.version,node:process.version,platform:process.platform,
  dependencies:{typescript:fs.existsSync(typescript),next:fs.existsSync(nextBinary)},
  checks:[],status:'blocked',
  note:'Produktionsfreigabe braucht außerdem neun echte V829/V830-Live-Konzerte, SkinnedMesh-Nachweise und manuelle audiovisuelle Abnahme.'};
}
function writeReport(report){
 fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
}
function evaluateReport(report){
 const required=['check:release','typecheck','next-build'];
 return required.every(name=>report.checks.some(c=>c.name===name&&c.status==='passed'))&&
  report.dependencies.typescript&&report.dependencies.next;
}
function runGate(args=process.argv.slice(2)){
 const audit=args.includes('--audit');
 if(args.some(x=>x!=='--audit'))throw new Error('Nur --audit als Option erlaubt; die echte Freigabepruefung laesst sich nicht ueberspringen.');
 const report=environmentReport();
 if(!report.dependencies.typescript||!report.dependencies.next){
  report.checks.push({name:'dependencies',status:'blocked',detail:'npm ci erforderlich – TypeScript / Next.js nicht vollstaendig installiert'});
  writeReport(report);
  process.stderr.write('BLOCKIERT: npm ci ausfuehren; fehlende Projektabhaengigkeiten.\n');
  return 1;
 }
 if(audit){report.status='audit-only';writeReport(report);process.stdout.write('V830: Abhaengigkeiten vorhanden; keine Tests ausgefuehrt.\n');return 0;}
 const stages=[
  {name:'check:release',bin:npm,args:['run','check:release'],timeoutMs:40*60*1000},
  {name:'typecheck',bin:npm,args:['run','typecheck'],timeoutMs:12*60*1000},
  {name:'next-build',bin:process.execPath,args:[nextBinary,'build'],timeoutMs:25*60*1000},
 ];
 for(const stage of stages){
  process.stdout.write(`\nV830: ${stage.name}\n`);
  const begun=Date.now();
  const result=spawnSync(stage.bin,stage.args,{cwd:root,env:process.env,stdio:'inherit',timeout:stage.timeoutMs,windowsHide:true});
  const ok=!result.error&&result.status===0;
  report.checks.push({name:stage.name,status:ok?'passed':'failed',exitCode:result.status,
   signal:result.signal??null,error:result.error?.message??null,durationMs:Date.now()-begun});
  writeReport(report);
  if(!ok){process.stderr.write(`BLOCKIERT: ${stage.name} fehlgeschlagen; Bericht: ${reportFile}\n`);return 1;}
 }
 report.status=evaluateReport(report)?'technical-gates-passed':'blocked';
 writeReport(report);
 process.stdout.write('V830: Technische Gates bestanden. Reale Live-/GPU-/Hardwareabnahme bleibt erforderlich.\n');
 return report.status==='technical-gates-passed'?0:1;
}
module.exports={environmentReport,evaluateReport,runGate};
if(require.main===module)process.exitCode=runGate();
