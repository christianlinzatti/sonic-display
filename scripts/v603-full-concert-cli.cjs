'use strict';
/** Local, opt-in aggregation of multiple V592 segments into a static human review.
 * Usage: --run=PATH [--run=PATH...] --out=DIR. Never starts Spotify or seeks audio.
 */
const fs=require('node:fs'),path=require('node:path');
const {fullConcertReview}=require('./v603-full-concert-review.cjs');
const {renderV603Report}=require('./v603-full-concert-report.cjs');
const pngSignature=Buffer.from('89504e470d0a1a0a','hex');
const {decodePng}=require('./v590-visual-image.cjs');
function loadReport(file){
 const resolved=path.resolve(file),stats=fs.statSync(resolved);
 if(!stats.isFile()||stats.size>10*1024*1024)throw Error('Local JSON report file is invalid or too large');
 return {path:resolved,report:JSON.parse(fs.readFileSync(resolved,'utf8'))};
}
function validPng(file){
 if(!/^live-\d{2}\.png$/.test(path.basename(file)))return false;
 try{const stat=fs.lstatSync(file);if(!stat.isFile()||stat.size<48||stat.size>20*1024*1024)return false;
  const data=fs.readFileSync(file);if(!data.subarray(0,8).equals(pngSignature))return false;
  const decoded=decodePng(data);return decoded.width>0&&decoded.height>0;
 }catch{return false;}
}
function generate({runs,out}){
 if(!Array.isArray(runs)||runs.length<1||runs.length>16||new Set(runs.map(x=>path.resolve(x))).size!==runs.length)
  throw Error('Provide 1..16 distinct local --run=... source files');
 const loaded=runs.map(loadReport);
 const data=loaded.map(x=>fs.readFileSync(x.path,'utf8'));
 if(new Set(data).size!==data.length)throw Error('Duplicate report content is not an independent live capture');
 const report=fullConcertReview(loaded.map(x=>x.report));
 if(report.status==='blocked')throw Error(report.reason);
 const target=path.resolve(out);
 // Refuse any output that would overwrite source data or coincide with capture folders.
 if(loaded.some(x=>target===path.dirname(x.path)||x.path===target||target.startsWith(path.dirname(x.path)+path.sep)))
  throw Error('Output directory must not be inside an original V592 capture directory');
 const images=[];
 for(const c of report.captures){const original=path.join(path.dirname(loaded[c.run-1].path),c.file);
  if(validPng(original))images.push({run:c.run,index:c.index,from:original,name:`images/run-${c.run}-${c.file}`});
 }
 report.imageEvidence={availableOriginalPngs:images.length,missingOrInvalid:report.captures.length-images.length,
  visualReviewIncomplete:images.length!==report.captures.length};
 if(images.length!==report.captures.length){
  report.warningNotes.push('Einige Originalbilder fehlen oder sind ungültig; keine vollständige visuelle Evidenz.');
  if(report.status==='broad-coverage-needs-human-review'){
   report.status='partial-evidence-needs-human-review';
   report.coverage.status='visual-images-incomplete';
  }
 }
 const html=renderV603Report(report,images);
 fs.mkdirSync(path.join(target,'images'),{recursive:true});
 for(const item of images)fs.copyFileSync(item.from,path.join(target,item.name));
 fs.writeFileSync(path.join(target,'review-v603.json'),JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(path.join(target,'review-v603.html'),html);
 return report;
}
function main(){try{
 const args=process.argv.slice(2),runs=args.filter(x=>x.startsWith('--run=')).map(x=>x.slice(6));
 const out=args.find(x=>x.startsWith('--out='))?.slice(6)||'artifacts/v603/full-concert-review';
 if(!runs.length)throw Error('Use --run=path/to/report.json for each real V592 recording; optional --out=dir');
 const result=generate({runs,out});
 console.log(`V603 ${result.status}: ${result.counts.captures} real captures / ${result.runCount} segments; review-v603.html`);
 if(result.coverage.status!=='broad-observed-windows-not-visual-approval')console.warn('V603: incomplete show evidence; no full-song sign-off.');
 }catch(error){console.error('V603 BLOCKED:',error.message);process.exitCode=1;}}
if(require.main===module)main();
module.exports={generate,loadReport,validPng};
