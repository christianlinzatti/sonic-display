'use strict';
/** Dependency-free, fail-closed V831 build doctor. This is an audit, NOT a build. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules','.next','.git','.vercel','out','.cache']);
const CODE_EXT = /\.(?:ts|tsx|js|jsx|cjs|mjs)$/i;
function compareVersions(version,minimum='20.9.0') {
 const a=String(version).replace(/^v/,'').split('.').map(Number);
 const b=minimum.split('.').map(Number);
 if(a.length<3||a.slice(0,3).some(x=>!Number.isInteger(x)))return false;
 for(let i=0;i<3;i++){if(a[i]>b[i])return true;if(a[i]<b[i])return false;}
 return true;
}
function scanCaseCollisions(root) {
 const found=new Map(),collisions=[];
 function walk(dir) {
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})) {
   if(ent.isDirectory()){if(!SKIP_DIRS.has(ent.name))walk(path.join(dir,ent.name));continue;}
   if(!ent.isFile()||!CODE_EXT.test(ent.name))continue;
   const rel=path.relative(root,path.join(dir,ent.name)).replace(/\\/g,'/');
   // Windows can collide on filename casing or source module stems (.ts vs .tsx).
   const key=rel.toLowerCase().replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/,'');
   const previous=found.get(key);
   if(previous&&previous!==rel)collisions.push([previous,rel]);
   else found.set(key,rel);
  }
 }
 walk(root);
 return collisions;
}
function inspectBuildV831(root=ROOT,opts={}){
 const read=(name)=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
 const checks=[];
 let pkg,lock;
 try {pkg=read('package.json');lock=read('package-lock.json');} catch(e){
  return {schemaVersion:1,status:'blocked',projectVersion:null,checks:[{name:'package-lock',status:'blocked',detail:String(e.message)}],readyForBuild:false,productionReleased:false};
 }
 const rootPkg=lock.packages?.[''];
 const lockReady=lock.name===pkg.name&&lock.version===pkg.version&&lock.lockfileVersion===3&&rootPkg?.version===pkg.version&&
  JSON.stringify(rootPkg.dependencies||{})===JSON.stringify(pkg.dependencies||{})&&
  JSON.stringify(rootPkg.devDependencies||{})===JSON.stringify(pkg.devDependencies||{});
 checks.push({name:'package-lock',status:lockReady?'passed':'blocked',detail:lockReady?'Paketversionen und Root-Dependencies stimmen ueberein':'package-lock.json stimmt nicht mit package.json ueberein'});
 const nodeVersion=opts.nodeVersion??process.version;
 const nodeReady=compareVersions(nodeVersion);
 checks.push({name:'node',status:nodeReady?'passed':'blocked',detail:`Node ${nodeVersion} (>= 20.9 erforderlich; 22 empfohlen)`});
 const collisions=scanCaseCollisions(root);
 checks.push({name:'module-case',status:collisions.length?'blocked':'passed',detail:collisions.length?`Kollisionen: ${JSON.stringify(collisions.slice(0,10))}`:'Keine kollidierenden TS/JS-Modulnamen'});
 const installed=(name,relative)=>fs.existsSync(path.join(root,'node_modules',name,'package.json'))&&fs.existsSync(path.join(root,'node_modules',name,relative));
 const tsReady=installed('typescript','bin/tsc');
 const nextReady=installed('next','dist/bin/next');
 checks.push({name:'local-typescript',status:tsReady?'passed':'blocked',detail:tsReady?'Projekt-TypeScript installiert':'npm ci erforderlich'});
 checks.push({name:'local-next',status:nextReady?'passed':'blocked',detail:nextReady?'Projekt-Next.js installiert':'npm ci erforderlich'});
 const requiredScripts=['check:release','typecheck','build','verify:production:v831','test:v831'];
 const scriptsReady=requiredScripts.every(k=>typeof pkg.scripts?.[k]==='string'&&pkg.scripts[k].length>0);
 checks.push({name:'release-scripts',status:scriptsReady?'passed':'blocked',detail:scriptsReady?'Pflichtskripte vorhanden':'Mindestens ein Pflichtskript fehlt'});
 const hash=crypto.createHash('sha256');
 for(const file of ['package.json','package-lock.json','tsconfig.json'])hash.update(fs.readFileSync(path.join(root,file)));
 const readyForBuild=checks.every(c=>c.status==='passed');
 return {schemaVersion:1,projectVersion:pkg.version,platform:process.platform,nodeVersion,sourceHash:hash.digest('hex'),
  checks,dependencies:{typescript:tsReady,next:nextReady},caseCollisions:collisions,readyForBuild,
  status:readyForBuild?'ready-to-test':'blocked',productionReleased:false,
  note:'Ready-to-test ist keine Freigabe. Es fehlen reale TypeScript-/Next-Build-Ergebnisse und neun audiovisuelle Konzerte.'};
}
function writeDoctorReport(root=ROOT,report=inspectBuildV831(root)) {
 const out=path.join(root,'v831-build-readiness-result.json');
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');return out;
}
if(require.main===module){
 try {
  if(process.argv.slice(2).some(x=>x!=='--audit'))throw Error('Nur --audit erlaubt');
  const report=inspectBuildV831(),out=writeDoctorReport(ROOT,report);
  console.log('V831 Build Doctor:',report.status,'\nBericht:',out);
  for(const c of report.checks)console.log(`${c.status.toUpperCase().padEnd(8)} ${c.name}: ${c.detail}`);
  // An audit reports blockers but is not itself a production certification.
  process.exitCode=0;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={compareVersions,scanCaseCollisions,inspectBuildV831,writeDoctorReport};
