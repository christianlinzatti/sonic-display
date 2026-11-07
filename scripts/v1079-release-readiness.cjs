#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1079(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',version>=1079&&p.sonicRoadmapRelease==='v'+version&&p.sonicFeatureRelease==='v'+version);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1079 && npm run test:v1079:types &&'));
  add('focused',p.scripts['verify:v1079:focused']?.includes('verify:v1078:focused'));
  add('test',p.scripts['test:v1079']==='node tests/v1079-live-artist-interaction-regression.cjs');
  for(const f of ['lib/arena360LiveArtistInteractionV1079.ts','tests/v1079-live-artist-interaction-regression.cjs',
   'tests/tsconfig.v1079-core.json','scripts/v1079-release-readiness.cjs',
   'changelog/V1079-LIVE-ARTIST-INTERACTION.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaLiveArtistEnabledV1079:false'));
  add('public-type',read('types/music.ts').includes('arenaLiveArtistStrengthV1079'));
  add('registry',read('components/visualizer/registry.tsx').includes('arenaLiveArtistStrengthV1079'));
  add('ui-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaLiveArtistEnabledV1079='));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1079 · Live Artist Interaction'));
  const three=read('components/visualizer/ThreeAvatar.tsx');
  add('plan',three.includes('planLiveArtistInteractionV1079({'));
  add('avatar',three.includes('arenaAvatarAudienceCueV1074:liveArtistV1079'));
  add('crowd',three.includes('avatarAudienceCueV1074={liveArtistV1079}'));
  add('lyrics',three.includes('lyricsProgressMs:props.lipSync?.progressMs,lyrics:props.lipSync?.lyrics'));
  add('manual',three.includes('props.lipSync?.manualVocalEnabledV385===true||'));
  const source=read('lib/arena360LiveArtistInteractionV1079.ts');
  add('lyrics-evidence',source.includes('p.lyrics?.synced!==true'));
  add('clock',source.includes('Math.abs(p.lyricsProgressMs-p.progressMs)>400'));
  add('gap',source.includes('span<1800||span>16000'));
  add('bounded',source.includes('0,.60')&&source.includes('0,.38'));
  add('manual-priority',source.includes('p.manualPriority'));
  add('low-tier',source.includes("p.performanceTier==='low'"));
  add('partner-gaze',read('lib/arena360AvatarAudienceInteractionV1074.ts').includes("cue.interactionIntentV1079==='partner'"));
  add('no-extra-controller',!source.includes('setInterval(')&&!source.includes('setTimeout(')&&!source.includes('new AnimationMixer('));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1079-live-artist-interaction-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1079-live-artist-interaction-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1079(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1079);
 }catch(e){console.error('V1079 readiness:',e.message);add('readable',false)}
 return {passed:checks.length>=30&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1079(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1079 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1079};
