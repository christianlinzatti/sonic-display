#!/usr/bin/env node
'use strict';
const {hasFinalGoveeGovernor}=require('../lib/goveeSenderInvariant.cjs');
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1027(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version??'');
  check('release',!!match&&Number(match[1])>=1027);
  check('roadmap-metadata',!!match&&pkg.sonicFeatureRelease==='v'+match[1]&&pkg.sonicRoadmapRelease==='v'+match[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',!!match&&pkg.scripts.prebuild.startsWith(`npm run test:v${match[1]} &&`));
  check('focused-test',pkg.scripts['test:v1027']==='node tests/v1027-govee-concert-sync-regression.cjs');
  check('isolated-types',pkg.scripts['test:v1027:types']?.includes('lib/goveeConcertSyncV1027.ts'));
  for(const p of ['lib/goveeConcertSyncV1027.ts','components/GoveeConcertSyncStudioV1027.tsx',
   'components/GoveeMusicSyncV909.tsx','components/GoveeLanPanelV909.tsx',
   'changelog/V1027-GOVEE-CONCERT-SYNC-3.md','tests/v1027-govee-concert-sync-regression.cjs',
   '.github/workflows/v1027-govee-concert-sync-validation.yml'])check('file:'+p,exists(p));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  check('existing-single-lan-loop',sender.includes('const syncDecisionV1027=planGoveeSyncV1027({')&&
   sender.includes('const syncedLookV1027=applyGoveeSyncV1027(voiceLookV970,previous,syncDecisionV1027,')&&
   sender.includes('applyGoveeShowV1042(syncedLookV1027,previous,')&&
   hasFinalGoveeGovernor(sender));
  check('settings-ui',read('components/GoveeLanPanelV909.tsx').includes('<GoveeConcertSyncStudioV1027 config={config} devices={devices} onConfig={update}/>'));
  check('no-extra-lan-command',(sender.match(/goveeBridgeRequestV909\(config,'\/command','POST',\{ip,action:'look',value:finalLook\}\)/g)||[]).length===1);
  check('v931-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1027-govee-concert-sync-regression.cjs'));
  check('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1027-govee-concert-sync-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1027(root)'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('workflow-titles',titles.total>=25&&titles.changed===0);
  check('production-workflow',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(e){console.error('V1027 inspect error:',e.message);check('source-readable',false);}
 return {passed:checks.length>=22&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1027(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1027 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1027};
