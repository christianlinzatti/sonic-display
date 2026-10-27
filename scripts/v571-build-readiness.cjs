'use strict';
/** V571 build provenance: no guessed success and no fabricated package-lock. */
const fs=require('node:fs');
const path=require('node:path');
function inspectBuildEnvironmentV571(root,system={nodeVersion:process.version}) {
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const names=Object.keys({...manifest.dependencies,...manifest.devDependencies});
  const missing=names.filter(n=>!fs.existsSync(path.join(root,'node_modules',...n.split('/'),'package.json')));
  const lockPath=path.join(root,'package-lock.json');
  let lockStatus='missing',lockIssue='package-lock.json fehlt; zuerst npm install ausführen und Lockfile versionieren.';
  if(fs.existsSync(lockPath)){
    try{
      const lock=JSON.parse(fs.readFileSync(lockPath,'utf8'));
      const base=lock.packages?.[''];
      if(!base||lock.lockfileVersion<2||!lock.packages) {lockStatus='invalid';lockIssue='Lockfile benötigt npm lockfileVersion 2 oder 3 samt packages[""].';}
      else {
        const mismatches=names.filter(n=>{
          const section=Object.prototype.hasOwnProperty.call(manifest.dependencies||{},n)?'dependencies':'devDependencies';
          return base[section]?.[n]!==manifest[section][n];
        });
        const unexpected=[...Object.keys(base.dependencies||{}),...Object.keys(base.devDependencies||{})].filter(n=>!names.includes(n));
        if(mismatches.length||unexpected.length||lock.name!==manifest.name){lockStatus='mismatch';lockIssue=`Manifest/Lockfile unterschiedlich: ${[...mismatches,...unexpected].join(', ')||'package name'}`;}
        else{lockStatus='valid';lockIssue='Abhängigkeiten und Root-Metadaten stimmen überein.';}
      }
    }catch(e){lockStatus='invalid';lockIssue=`Lockfile nicht lesbar: ${e.message}`;}
  }
  const nodeMajor=Number(String(system.nodeVersion).match(/^v?(\d+)/)?.[1]||0);
  return {
    project:manifest.name,version:manifest.version,nodeVersion:system.nodeVersion,
    nodeSupported:nodeMajor>=20,dependencyCount:names.length,
    dependencyStatus:missing.length?'missing':'installed',missingDependencies:missing,
    lockStatus,lockIssue,
    commands:{bootstrap:'npm install --no-audit --no-fund',install:'npm ci --no-audit --no-fund',fastChecks:'npm run test:smoke:v571',production:'npm run typecheck && npm run build'},
    productionBuild:{status:'not-run',reason:'Nur ein tatsächlich ausgeführtes next build darf als erfolgreich gelten.'},
    browser:{status:'not-run',reason:'Chromium/CDP plus echte lokale App, WebGL und Avatar-Assets erforderlich.'},
    raspberryPi:{status:'not-run',reason:'Messungen auf dem Zielgerät erforderlich.'}
  };
}
module.exports={inspectBuildEnvironmentV571};
if(require.main===module){
  const args=process.argv.slice(2);
  const root=path.resolve(__dirname,'..');
  const result=inspectBuildEnvironmentV571(root);
  if(args.includes('--json'))console.log(JSON.stringify(result,null,2));
  else{
    console.log(`Sonic Display ${result.version} – V571 build readiness`);
    console.log(`Node ${result.nodeVersion}: ${result.nodeSupported?'ok':'zu alt'}`);
    console.log(`Dependencies: ${result.dependencyCount-result.missingDependencies.length}/${result.dependencyCount} installiert`);
    console.log(`Lockfile: ${result.lockStatus} – ${result.lockIssue}`);
    console.log('Next.js build: not-run (keine Freigabe durch diesen Audit)');
  }
  if(!result.nodeSupported)process.exitCode=1;
  if(args.includes('--require-lock')&&result.lockStatus!=='valid')process.exitCode=2;
  if(args.includes('--require-dependencies')&&result.dependencyStatus!=='installed')process.exitCode=3;
}
