'use strict';
/** V877 additive installer. Apply V874 → V875 → V876 first. Run in project root. */
const fs=require('node:fs');
const path=require('node:path');
const root=process.cwd(),bundle=__dirname;
const staged=new Map(),payloads=new Map();
function read(rel){
 const file=path.join(root,rel);
 if(!fs.existsSync(file))throw Error('Projektdatei fehlt: '+rel);
 return staged.get(rel)??fs.readFileSync(file,'utf8');
}
function edit(rel,anchor,replacement,marker){
 const src=read(rel);
 if(src.includes(marker))return;
 const i=src.indexOf(anchor);
 if(i<0||src.indexOf(anchor,i+anchor.length)!==-1)
  throw Error('Integrationsstelle fehlt oder ist mehrdeutig in '+rel+': '+anchor.slice(0,90));
 staged.set(rel,src.slice(0,i)+replacement+src.slice(i+anchor.length));
}
function add(rel,anchor,addition,marker){edit(rel,anchor,anchor+addition,marker);}
try{
 const src='components/visualizer/intelligentCrowdInteractionV877.ts';
 const cfg='components/visualizer/concertFxStudioV810.ts';
 const stage='components/visualizer/DynamicStage.tsx';
 const panel='components/visualizer/ConcertFxStudioPanelV810.tsx';
 if(!fs.existsSync(path.join(root,'components/visualizer/dynamicFestivalCrowdChoreographyV876.ts')))
  throw Error('Bitte V874, V875 und V876 zuerst installieren.');
 add(cfg,"crowdChoreographyStyleV876:'natural'|'concert'|'festival';",
  "\n  crowdInteractionV877:boolean;crowdCallResponseV877:boolean;crowdFollowPerformerV877:boolean;crowdDanceEchoV877:boolean;crowdInteractionStrengthV877:number;crowdInteractionStyleV877:'subtle'|'balanced'|'lively';",
  'crowdInteractionV877:boolean');
 add(cfg,"crowdChoreographyStrengthV876:65,crowdChoreographyStyleV876:'concert',",
  "\n  crowdInteractionV877:true,crowdCallResponseV877:true,crowdFollowPerformerV877:true,crowdDanceEchoV877:true,crowdInteractionStrengthV877:65,crowdInteractionStyleV877:'balanced',",
  'crowdInteractionV877:true');
 const norm="crowdChoreographyStyleV876:raw?.crowdChoreographyStyleV876==='natural'||raw?.crowdChoreographyStyleV876==='festival'?raw.crowdChoreographyStyleV876:'concert',";
 add(cfg,norm,`
 crowdInteractionV877:typeof raw?.crowdInteractionV877==='boolean'?raw.crowdInteractionV877:d.crowdInteractionV877,
 crowdCallResponseV877:typeof raw?.crowdCallResponseV877==='boolean'?raw.crowdCallResponseV877:d.crowdCallResponseV877,
 crowdFollowPerformerV877:typeof raw?.crowdFollowPerformerV877==='boolean'?raw.crowdFollowPerformerV877:d.crowdFollowPerformerV877,
 crowdDanceEchoV877:typeof raw?.crowdDanceEchoV877==='boolean'?raw.crowdDanceEchoV877:d.crowdDanceEchoV877,
 crowdInteractionStrengthV877:finite(raw?.crowdInteractionStrengthV877)?Math.round(clamp(raw.crowdInteractionStrengthV877,0,100)):d.crowdInteractionStrengthV877,
 crowdInteractionStyleV877:raw?.crowdInteractionStyleV877==='subtle'||raw?.crowdInteractionStyleV877==='lively'?raw.crowdInteractionStyleV877:'balanced',`,
  'crowdInteractionStrengthV877:finite(raw?.crowdInteractionStrengthV877)');
 add(stage,'import {planDynamicFestivalCrowdChoreographyV876} from "./dynamicFestivalCrowdChoreographyV876";',
  '\nimport {planIntelligentCrowdInteractionV877} from "./intelligentCrowdInteractionV877";\nimport type {CrowdChoreographyCueV876} from "./dynamicFestivalCrowdChoreographyV876";',
  'import {planIntelligentCrowdInteractionV877}');
 const anchor='lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});\n    particlesCueV816.current=mergeFestivalParticlesV844';
 edit(stage,anchor,`lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});
    // V877: verified music, optional synced lyric and verified performer-slot focus.
    // Always AFTER V825 governor and V876; may only reduce/add tiny bounded motion.
    crowdCueV815.current=planIntelligentCrowdInteractionV877({
      base:crowdCueV815.current as CrowdChoreographyCueV876,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      tier,playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      reducedMotion,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      groupCount:groupCountV542,
      focusSlot:vocalSpotlightV797?.leadSlot??null,
      focusVerified:vocalSpotlightV797?.lightingActive===true,
      lyrics:lyricsV813,lyricsVisible:lyricsVisibleV813,progressMs:playback.positionMs});
    particlesCueV816.current=mergeFestivalParticlesV844`, 'crowdCueV815.current=planIntelligentCrowdInteractionV877(');
 add(panel,"import {planDynamicFestivalCrowdChoreographyV876} from './dynamicFestivalCrowdChoreographyV876';",
  "\nimport {planIntelligentCrowdInteractionV877} from './intelligentCrowdInteractionV877';",
  'import {planIntelligentCrowdInteractionV877}');
 const uiAnchor="lyricsProtected:false,vocalFocus:false,reducedMotion:false});\n const particlePreview=planReactiveParticlesV816";
 edit(panel,uiAnchor,`lyricsProtected:false,vocalFocus:false,reducedMotion:false});
 const interactionV877=planIntelligentCrowdInteractionV877({base:choreographyV876,
   fx:preview,settings:s,energy:.86,kick:.92,tier:'high',playing:true,
   manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   reducedMotion:false,groupCount:2,focusSlot:0,focusVerified:true,
   lyrics:undefined,lyricsVisible:false,progressMs:5000});
 const particlePreview=planReactiveParticlesV816`,'const interactionV877=planIntelligentCrowdInteractionV877(');
 const panelAnchor="  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V816 · Reactive Particle Studio</legend>";
 const ui=`  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V877 · Intelligent Crowd Interaction 4.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdInteractionV877}
    disabled={!s.virtualCrowd||!s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876}
    onChange={e=>patch({crowdInteractionV877:e.target.checked})}/> Publikum interaktiv auf Songmomente reagieren lassen</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdCallResponseV877}
    disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdCallResponseV877:e.target.checked})}/>
    Mitsing- und Rap-Antworten (nur synchronisierte Lyrics)</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdFollowPerformerV877}
    disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdFollowPerformerV877:e.target.checked})}/>
    Geprüftem Lead-Performer-Fokus folgen</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdDanceEchoV877}
    disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdDanceEchoV877:e.target.checked})}/>
    Rhythmische Ensemble-Echos</label>
   <label>Interaktionsstärke ({s.crowdInteractionStrengthV877} %)
    <input type="range" min="0" max="100" step="5" value={s.crowdInteractionStrengthV877}
     disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdInteractionStrengthV877:+e.target.value})}/></label>
   <label>Interaktionsstil <select value={s.crowdInteractionStyleV877}
    disabled={!s.crowdInteractionV877}
    onChange={e=>patch({crowdInteractionStyleV877:e.target.value as ConcertFxSettingsV810['crowdInteractionStyleV877']})}>
    <option value="subtle">Dezent</option><option value="balanced">Ausgewogen</option>
    <option value="lively">Lebendig</option></select></label>
   <small>Simulierte Vorschau: {interactionV877.interactionModeV877} · Stärke {Math.round(interactionV877.interactionStrengthV877*100)} %. Echte Rap-/Mitsingreaktionen benötigen gültige Lyrics-Zeitmarken. Es werden keine Tänzer-Posen erkannt. Vorhandenes Publikum, Blackout, manuelle Show und FPS-Limit behalten Vorrang.</small>
  </fieldset>
`;
 edit(panel,panelAnchor,ui+panelAnchor,'V877 · Intelligent Crowd Interaction 4.0');
 for(const file of ['VirtualConcertCrowdV815.tsx','IntelligentAudienceArmsV874.tsx','FestivalWristbandsV875.tsx']){
  const rel='components/visualizer/'+file;
  add(rel,"import {sampleCrowdChoreographyV876,createCrowdMotionScratchV876} from './dynamicFestivalCrowdChoreographyV876';",
   "\nimport {applyCrowdInteractionMotionV877} from './intelligentCrowdInteractionV877';",
   'import {applyCrowdInteractionMotionV877}');
  add(rel,'sampleCrowdChoreographyV876(index,p,cue,choreographyMotion);',
   '\n   applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion);',
   'applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion)');
 }
 const additions=[src,'tests/v877-intelligent-crowd-interaction-regression.cjs','tests/tsconfig.v877-core.json'];
 for(const rel of additions){
  const file=path.join(bundle,'v877',rel),dest=path.join(root,rel);
  if(!fs.existsSync(file))throw Error('Upgrade-Payload fehlt: '+rel);
  const bytes=fs.readFileSync(file);
  if(fs.existsSync(dest)&&!fs.readFileSync(dest).equals(bytes))throw Error('Lokale Datei weicht ab: '+rel);
  payloads.set(rel,bytes);
 }
 const pkg=JSON.parse(read('package.json'));
 if(!pkg.scripts||typeof pkg.scripts!=='object')throw Error('package.json scripts fehlen');
 pkg.scripts['test:v877']='node tests/v877-intelligent-crowd-interaction-regression.cjs';
 pkg.scripts['test:v877:types']='tsc -p tests/tsconfig.v877-core.json --noEmit';
 const checks='npm run test:v877 && npm run test:v877:types';
 for(const key of ['build:preflight','prebuild']){
  if(typeof pkg.scripts[key]==='string'&&!pkg.scripts[key].includes('test:v877')){
   pkg.scripts[key]=key==='prebuild'?checks+' && '+pkg.scripts[key]:pkg.scripts[key]+' && '+checks;
  }
 }
 staged.set('package.json',JSON.stringify(pkg,null,2)+'\n');
 const original=new Map(),created=[];
 try{
  for(const [rel,data] of staged){const file=path.join(root,rel);original.set(file,fs.readFileSync(file));fs.writeFileSync(file,data,'utf8');}
  for(const [rel,data] of payloads){const file=path.join(root,rel);fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file)){fs.writeFileSync(file,data);created.push(file);}}
 }catch(e){for(const [file,data] of original)fs.writeFileSync(file,data);for(const file of created)fs.rmSync(file,{force:true});throw e;}
 console.log('V877 installiert. npm run test:v877 && npm run test:v877:types && npm run typecheck && npm run build');
}catch(error){console.error('V877 Installation abgebrochen:',error.message);process.exitCode=1;}
