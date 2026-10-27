'use strict';
/** V595 local, opt-in, report-only tool; never approves snapshots automatically. */
const fs=require('node:fs'),path=require('node:path');
const {compareLiveRegression}=require('./v595-visual-regression.cjs');
const {renderV595Report}=require('./v595-visual-regression-report.cjs');
const argv=process.argv.slice(2),opt=(name,fallback)=>argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)??fallback;
function readJson(file,max=10*1024*1024){const real=path.resolve(file),stat=fs.statSync(real);if(!stat.isFile()||stat.size>max)throw Error('Invalid/oversize local JSON file');return JSON.parse(fs.readFileSync(real,'utf8'));}
function readPng(reportFile,image){
 if(typeof image!=='string'||!/^live-\d{2}\.png$/.test(image))return null;
 const candidate=path.join(path.dirname(reportFile),image);
 if(!fs.existsSync(candidate)||!fs.statSync(candidate).isFile()||fs.statSync(candidate).size>20*1024*1024)return null;
 return fs.readFileSync(candidate);
}
function relativePng(target,filename){
 const rel=path.relative(target,filename).split(path.sep);
 const url=rel.map(x=>encodeURIComponent(x)).join('/');return url.startsWith('.')?url:`./${url}`;
}
function run(options){
 const baselineFile=path.resolve(options.baseline),candidateFile=path.resolve(options.candidate),out=path.resolve(options.out);
 if(baselineFile===candidateFile)throw Error('Baseline and candidate must be different reports');
 if([baselineFile,candidateFile].includes(path.join(out,'report-v595.json')))throw Error('Output cannot overwrite input');
 const base=readJson(baselineFile),candidate=readJson(candidateFile);
 const marks=options.marks?readJson(options.marks,128*1024):{};
 const result=compareLiveRegression(base,candidate,marks,(which,file)=>readPng(which==='baseline'?baselineFile:candidateFile,file));
 if(result.status==='blocked')throw Error(result.reason);
 const pairs=result.checkpoints.map(c=>{
  const before=path.join(path.dirname(baselineFile),c.baselineImage),after=path.join(path.dirname(candidateFile),c.candidateImage);
  return {checkpoint:c,baselineUrl:readPng(baselineFile,c.baselineImage)?relativePng(out,before):null,
   candidateUrl:readPng(candidateFile,c.candidateImage)?relativePng(out,after):null};
 });
 const report=renderV595Report(result,pairs);
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'report-v595.json'),JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync(path.join(out,'report-v595.html'),report);
 return result;
}
function main(){try{
 const baseline=opt('baseline',null),candidate=opt('candidate',null);
 if(!baseline||!candidate)throw Error('Usage: --baseline=BEFORE/report.json --candidate=AFTER/report.json [--marks=marks.json] [--out=DIR]');
 const result=run({baseline,candidate,marks:opt('marks',null),out:opt('out','artifacts/v595/visual-regression')});
 console.log(`V595 REVIEW REQUIRED: ${result.checkpoints.length} real matching captures, ${result.coverage.covered}/4 labelled scenarios; report-v595.html`);
 if(result.coverage.incomplete)console.warn('V595: unobserved solo/duet/hook/drop categories are NOT passed.');
 if(result.coverage.missingImages)console.warn('V595: some real PNG screenshots unavailable; visual comparison incomplete.');
 }catch(e){console.error('V595 BLOCKED:',e.message);process.exitCode=1;}}
if(require.main===module)main();
module.exports={run,readPng,relativePng};
