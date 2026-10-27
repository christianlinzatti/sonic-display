'use strict';
/** V594: offline comparison of two local measured V592 runs + capped opt-in history. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {compareConcertReports}=require('./v594-concert-quality-comparison.cjs');
const {renderV594Comparison,renderV594History}=require('./v594-concert-quality-report.cjs');
const {analyzePngs}=require('./v590-visual-image.cjs');
const args=process.argv.slice(2),opt=(name,def)=>args.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)??def;
function readFile(filename){const real=path.resolve(filename);if(!fs.statSync(real).isFile())throw Error('Not a local JSON report file');
 const stat=fs.statSync(real);if(stat.size>10*1024*1024)throw Error('Local report too large');
 return {file:real,report:JSON.parse(fs.readFileSync(real,'utf8'))};}
const digest=data=>crypto.createHash('sha256').update(data).digest('hex').slice(0,20);
function relImage(directory,file){return path.relative(directory,file).split(path.sep).map(encodeURIComponent).join('/');}
function checkImage(reportFile,file){if(!/^live-\d{2}\.png$/.test(file))return null;
 const target=path.join(path.dirname(reportFile),file);
 if(!fs.existsSync(target)||!fs.statSync(target).isFile()||fs.statSync(target).size>20*1024*1024)return null;
 return target;
}
function imagePairs(comparison,before,after,out){
 return comparison.alignedCaptures.map(pair=>{
  const a=before.report.screenshots[pair.beforeIndex],b=after.report.screenshots[pair.afterIndex];
  const aPath=checkImage(before.file,a.file),bPath=checkImage(after.file,b.file);
  const result={beforeProgressMs:a.progressMs,afterProgressMs:b.progressMs,deltaMs:pair.progressDeltaMs,
   beforeIndex:pair.beforeIndex,afterIndex:pair.afterIndex,beforeUrl:aPath?relImage(out,aPath):null,
   afterUrl:bPath?relImage(out,bPath):null,pixelStatus:'not-measured'};
  if(aPath&&bPath&&comparison.status!=='comparable-needs-human-review')result.pixelStatus='not-comparable';
  else if(aPath&&bPath){try{const diff=analyzePngs(fs.readFileSync(aPath),fs.readFileSync(bPath));
   Object.assign(result,{pixelStatus:'measured-differences-not-quality',changedPixelFraction:diff.changedPixelFraction,averageMaxChannelDelta:diff.averageMaxChannelDelta});
  }catch(error){result.pixelStatus='incompatible-or-invalid-PNG';}}
  else result.pixelStatus='missing-original-PNG';
  return result;
 });
}
function updateHistory(historyPath,entry){
 let history={format:'sonic-v594-comparison-history',version:1,entries:[]};
 if(fs.existsSync(historyPath)){
  if(fs.statSync(historyPath).size>2*1024*1024)throw Error('History index too large');
  history=JSON.parse(fs.readFileSync(historyPath,'utf8'));
  if(history.format!=='sonic-v594-comparison-history'||history.version!==1||!Array.isArray(history.entries)||history.entries.length>100||
   history.entries.some(x=>typeof x.key!=='string'||typeof x.status!=='string'))throw Error('Incompatible history file; refusing overwrite');
 }
 const pos=history.entries.findIndex(x=>x.key===entry.key);
 if(pos<0)history.entries.push(entry);else history.entries[pos]=entry;
 history.entries=history.entries.slice(-100);
 fs.mkdirSync(path.dirname(historyPath),{recursive:true});
 const temporary=`${historyPath}.${process.pid}.tmp`;
 try{fs.writeFileSync(temporary,JSON.stringify(history,null,2)+'\n',{flag:'wx'});fs.renameSync(temporary,historyPath);fs.writeFileSync(path.join(path.dirname(historyPath),'history-v594.html'),renderV594History(history));}
 finally{if(fs.existsSync(temporary))fs.rmSync(temporary,{force:true});}
 return history;
}
function compare(options){
 const before=readFile(options.before),after=readFile(options.after),out=path.resolve(options.out);
 if(before.file===after.file)throw Error('Before and after must be different local reports');
 if(options.history&&[before.file,after.file].includes(path.resolve(options.history)))throw Error('History path must not overwrite a source report');
 const result=compareConcertReports(before.report,after.report);
 if(result.status==='blocked')throw Error(result.reason);
 const images=imagePairs(result,before,after,out);
 result.visualComparison={...result.visualComparison,
  status:images.length&&images.every(i=>i.pixelStatus==='measured-differences-not-quality')?'measured-differences-not-quality':'partial-or-unavailable',
  pairs:images.map(({beforeIndex,afterIndex,deltaMs,pixelStatus,changedPixelFraction,averageMaxChannelDelta})=>
   ({beforeIndex,afterIndex,deltaMs,pixelStatus,changedPixelFraction:changedPixelFraction??null,averageMaxChannelDelta:averageMaxChannelDelta??null}))};
 result.runId=digest(fs.readFileSync(before.file)+fs.readFileSync(after.file));
 result.evidence={beforeReport:path.relative(out,before.file).split(path.sep).join('/'),afterReport:path.relative(out,after.file).split(path.sep).join('/')};
 const html=renderV594Comparison(result,images);
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'comparison-v594.json'),JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync(path.join(out,'report-v594.html'),html);
 if(options.history){const history=path.resolve(options.history),entry={key:result.runId,status:result.status,
  capturedAtBefore:String(before.report.capturedAt||'unknown'),capturedAtAfter:String(after.report.capturedAt||'unknown'),
  trackHash:digest(String(before.report.sourceTrack)),
  report:path.relative(path.dirname(history),path.join(out,'report-v594.html')).split(path.sep).join('/'),
  baselineFps:result.observations.before.averageFps,candidateFps:result.observations.after.averageFps,
  reviewRequired:true};updateHistory(history,entry);}
 return result;
}
function main(){try{
 if(args.includes('--list')){const file=path.resolve(opt('history','artifacts/v594/history.json'));
  if(!fs.existsSync(file)){console.log('V594 HISTORY: no saved comparisons yet.');return;}
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  if(data.format!=='sonic-v594-comparison-history'||!Array.isArray(data.entries))throw Error('Invalid history');
  console.log(`V594 HISTORY: ${data.entries.length} local comparisons`);
  for(const x of data.entries)console.log(`${x.key}  ${x.status}  ${x.baselineFps} → ${x.candidateFps} rAF/s  ${x.report}`);
  return;
 }
 const b=opt('before',null),a=opt('after',null);
 if(!b||!a)throw Error('Use --before=PATH --after=PATH (two separate measured V592 report.json files)');
 const out=path.resolve(opt('out','artifacts/v594/comparison'));
 const history=args.includes('--no-history')?null:opt('history','artifacts/v594/history.json');
 const comparison=compare({before:b,after:a,out,history});
 console.log(`V594: ${comparison.status} · ${comparison.alignedCaptures.length} aligned captures · ${out}/report-v594.html`);
 if(comparison.status!=='comparable-needs-human-review')console.warn('V594: limited comparability; no positive optimisation claims.');
 }catch(error){console.error('V594 BLOCKED:',error.message);process.exitCode=1;}}
if(require.main===module)main();
module.exports={compare,updateHistory,imagePairs,relImage};
