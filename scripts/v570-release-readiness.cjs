'use strict';
/** Explicit environmental build/visual check: never report success without running build/browser/Pi. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pkg=require(path.join(root,'package.json'));
const exists=p=>fs.existsSync(path.join(root,p));
const major=Number(process.versions.node.split('.')[0]);
const installReady=exists('node_modules/next/package.json')&&exists('node_modules/react/package.json')&&exists('node_modules/typescript/package.json');
const status={
  version:pkg.version,
  environment:{node:process.versions.node,compatibleNode:major>=20,dependenciesInstalled:installReady,packageLockPresent:exists('package-lock.json')},
  productionBuild:{status:installReady?'not-run':'blocked',reason:installReady?'Requires npm run build; never inferred from the presence of dependencies.':'node_modules is incomplete; install compatible pinned dependencies before npm run build.'},
  webgl:{status:'not-run',reason:'Requires real browser/WebGL rendering and representative GLB avatars.'},
  raspberryPi:{status:'not-run',reason:'Requires device FPS, heap and GPU observations over a multi-hour session.'},
  spotify:{status:'not-run',reason:'Requires an authenticated playback session and real synced lyrics.'},
};
if(process.argv.includes('--json'))console.log(JSON.stringify(status,null,2));
else {
  console.log(`Sonic Display ${status.version} – V570 local release readiness`);
  console.log(`Node ${status.environment.node}: ${status.environment.compatibleNode?'compatible':'too old'}`);
  for(const section of ['productionBuild','webgl','raspberryPi','spotify'])console.log(`${section}: ${status[section].status} – ${status[section].reason}`);
}
