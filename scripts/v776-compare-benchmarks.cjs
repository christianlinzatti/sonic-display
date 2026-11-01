'use strict';
/** Compare two reports emitted by the exact V776 fixture. Differences do NOT prove gains outside this fixture. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('../tests/typescript-loader.cjs');
const modPath=path.resolve(__dirname,'../services/monitoring/stageBenchmarkV776.ts');
const src=fs.readFileSync(modPath,'utf8');
const compiled=ts.transpileModule(src,{fileName:modPath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const file=new Module(modPath,module);file.filename=modPath;file.paths=Module._nodeModulePaths(path.dirname(modPath));file._compile(compiled.outputText,modPath);
const {compareStageReportsV776}=file.exports;
function compareFiles(beforeFile,afterFile){
 const read=f=>{const x=JSON.parse(fs.readFileSync(f,'utf8'));if(x.status!=='ok'||!x.report)throw Error('Benchmark fehlt / wurde blockiert: '+f);return x.report;};
 return compareStageReportsV776(read(beforeFile),read(afterFile));
}
function cli(){const args=process.argv.slice(2);const before=args.find(x=>x.startsWith('--before='))?.slice(9);
 const after=args.find(x=>x.startsWith('--after='))?.slice(8);
 if(!before||!after)throw Error('Anwendung: --before=artifacts/v776/before.json --after=artifacts/v776/after.json');
 const result=compareFiles(before,after);console.log('V776 Vergleich:',result.status);
 for(const w of result.warnings)console.log('NICHT VERGLEICHBAR:',w);
 console.log('Bühne                 FPS Δ%   P95 Δ%   Calls Δ%  Geom Δ  Tex Δ');
 for(const r of result.rows){console.log(r.stage.padEnd(20),String(r.fpsPct).padStart(7),String(r.p95Pct).padStart(8),String(r.callsPct).padStart(9),String(r.geometriesDelta).padStart(7),String(r.texturesDelta).padStart(6));}
 const out=args.find(x=>x.startsWith('--out='))?.slice(6)||'artifacts/v776/compare.json';
 fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 if(result.status!=='comparable')process.exitCode=2;
}
if(require.main===module){try{cli()}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={compareFiles};
