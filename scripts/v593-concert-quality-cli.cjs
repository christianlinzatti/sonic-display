'use strict';
/** Re-analyse a LOCAL measured V592 report. No network calls or settings edits. */
const fs=require('node:fs'),path=require('node:path');
const {adviceForLiveReport}=require('./v593-concert-quality-advisor.cjs');
const {renderV593Report}=require('./v593-concert-quality-report.cjs');
const args=process.argv.slice(2);
const opt=(name,def)=>args.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)??def;
function generate(report,dir,assetsDir=dir){
 const advice=adviceForLiveReport(report);
 if(advice.status!=='advice-needs-human-review')return advice;
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'advice-v593.json'),JSON.stringify(advice,null,2)+'\n');
 const images=path.relative(dir,assetsDir).split(path.sep).join('/');
 const htmlReport={...report,screenshots:report.screenshots.map(s=>({...s,file:(images?images+'/':'')+s.file}))};
 fs.writeFileSync(path.join(dir,'report-v593.html'),renderV593Report(htmlReport,advice));
 return advice;
}
function run(){
 const reportFile=path.resolve(opt('report','artifacts/v592/live/report.json'));
 const out=path.resolve(opt('out',path.dirname(reportFile)));
 try{
  if(!fs.statSync(reportFile).isFile())throw Error('Report is not a file');
  const report=JSON.parse(fs.readFileSync(reportFile,'utf8'));
  const advice=generate(report,out,path.dirname(reportFile));
  if(advice.status!=='advice-needs-human-review')throw Error('V592 report blocked or lacks genuine measured evidence');
  console.log(`V593 ADVICE: ${advice.recommendations.length} recommendations; human approval required; ${out}/report-v593.html`);
 }catch(error){console.error('V593 BLOCKED:',error.message);process.exitCode=1;}
}
if(require.main===module)run();
module.exports={generate};
