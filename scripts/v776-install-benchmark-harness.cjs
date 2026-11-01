'use strict';
/** Non-destructive install of identical benchmark fixture into older V766+ source checkout. */
const fs=require('node:fs'),path=require('node:path');
function install(root){
 if(!root)throw Error('--target=<älteres-Projektverzeichnis> erforderlich');
 const target=path.resolve(root),source=path.resolve(__dirname,'..');
 if(!fs.existsSync(path.join(target,'package.json')))throw Error('Kein Sonic-Display-Projekt: '+target);
 if(target===source)throw Error('Quelle und Ziel dürfen nicht identisch sein');
 const pkg=JSON.parse(fs.readFileSync(path.join(target,'package.json'),'utf8'));
 if(pkg.name!=='sonic-display'||!/^0\.1\.0-v(?:76[6-9]|7[7-9][0-9]|[89][0-9]{2})$/.test(pkg.version))throw Error('Nur originale Sonic-Versionen ab V766 sind für diese Fixture geprüft');
 const files=['components/visualizer/StageBenchmarkV776.tsx','services/monitoring/stageBenchmarkV776.ts','app/diagnostics/stage-benchmark/page.tsx'];
 for(const name of files)if(fs.existsSync(path.join(target,name)))throw Error('Abbruch: Zieldatei existiert bereits: '+name);
 for(const name of files){const to=path.join(target,name);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(source,name),to);}
 console.log('V776 Diagnose-Fixture in '+target+' installiert. Versionsnummer und Anwendung sonst unverändert.');
 return files;
}
if(require.main===module){try{const t=process.argv.find(s=>s.startsWith('--target='))?.slice(9);install(t)}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={install};
