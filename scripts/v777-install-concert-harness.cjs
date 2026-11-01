'use strict';
/** Backport the same concert fixture and its V779 quality-profile dependency (not production runtime). */
const fs=require('node:fs'),path=require('node:path');
const FILES=['components/visualizer/ConcertBenchmarkV777.tsx','services/monitoring/concertBenchmarkV777.ts',
  'app/diagnostics/concert-benchmark/page.tsx','public/benchmark/v777-reference-performer.glb',
  'services/monitoring/concertQualityProfilesV779.ts'];
function install(root){
 if(!root)throw Error('--target=<älteres-Projektverzeichnis> erforderlich');
 const target=path.resolve(root),source=path.resolve(__dirname,'..');
 if(target===source||!fs.existsSync(path.join(target,'package.json')))throw Error('Ungültiger anderer Projektpfad');
 const pkg=JSON.parse(fs.readFileSync(path.join(target,'package.json'),'utf8'));
 if(pkg.name!=='sonic-display'||!/^0\.1\.0-v77[4-6]$/.test(pkg.version))throw Error('Nur V774–V776 als identische Konzert-Fixture geprüft');
 for(const name of FILES)if(fs.existsSync(path.join(target,name)))throw Error('Abbruch, existiert bereits: '+name);
 for(const name of FILES){const to=path.join(target,name);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(source,name),to)}
 console.log('V777-Fixture nach '+target+' installiert, sonst nichts verändert');return FILES;
}
if(require.main===module){try{install(process.argv.find(a=>a.startsWith('--target='))?.slice(9))}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={install,FILES};
