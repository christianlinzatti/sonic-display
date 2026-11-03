'use strict';
/** V878 fail-closed additive installer. Requires V874–V877. Run in project root. */
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
  throw Error('Integrationsstelle fehlt oder mehrdeutig in '+rel+': '+anchor.slice(0,110));
 staged.set(rel,src.slice(0,i)+replacement+src.slice(i+anchor.length));
}
function add(rel,anchor,addition,marker){edit(rel,anchor,anchor+addition,marker);}
try{
 const src='components/visualizer/smartAudienceEmotionDirectorV878.ts';
 const cfg='components/visualizer/concertFxStudioV810.ts';
 const stage='components/visualizer/DynamicStage.tsx';
 const panel='components/visualizer/ConcertFxStudioPanelV810.tsx';
 if(!fs.existsSync(path.join(root,'components/visualizer/intelligentCrowdInteractionV877.ts')))
  throw Error('Bitte Upgrades V874 bis V877 zuerst installieren.');
 add(cfg,"crowdInteractionStyleV877:'subtle'|'balanced'|'lively';",
  "\n  crowdEmotionDirectorV878:boolean;crowdEmotionWavesV878:boolean;crowdEmotionContrastV878:boolean;crowdEmotionStrengthV878:number;crowdEmotionStyleV878:'cinematic'|'balanced'|'responsive';",
  'crowdEmotionDirectorV878:boolean');
 add(cfg,"crowdInteractionStrengthV877:65,crowdInteractionStyleV877:'balanced',",
  "\n  crowdEmotionDirectorV878:true,crowdEmotionWavesV878:true,crowdEmotionContrastV878:true,crowdEmotionStrengthV878:65,crowdEmotionStyleV878:'balanced',",
  'crowdEmotionDirectorV878:true');
 add(cfg,"crowdInteractionStyleV877:raw?.crowdInteractionStyleV877==='subtle'||raw?.crowdInteractionStyleV877==='lively'?raw.crowdInteractionStyleV877:'balanced',",
  `\n crowdEmotionDirectorV878:typeof raw?.crowdEmotionDirectorV878==='boolean'?raw.crowdEmotionDirectorV878:d.crowdEmotionDirectorV878,
 crowdEmotionWavesV878:typeof raw?.crowdEmotionWavesV878==='boolean'?raw.crowdEmotionWavesV878:d.crowdEmotionWavesV878,
 crowdEmotionContrastV878:typeof raw?.crowdEmotionContrastV878==='boolean'?raw.crowdEmotionContrastV878:d.crowdEmotionContrastV878,
 crowdEmotionStrengthV878:finite(raw?.crowdEmotionStrengthV878)?Math.round(clamp(raw.crowdEmotionStrengthV878,0,100)):d.crowdEmotionStrengthV878,
 crowdEmotionStyleV878:raw?.crowdEmotionStyleV878==='cinematic'||raw?.crowdEmotionStyleV878==='responsive'?raw.crowdEmotionStyleV878:'balanced',`,
  'crowdEmotionStrengthV878:finite(raw?.crowdEmotionStrengthV878)');
 add(stage,'import {planIntelligentCrowdInteractionV877} from "./intelligentCrowdInteractionV877";',
  '\nimport {planSmartAudienceEmotionV878} from "./smartAudienceEmotionDirectorV878";\nimport type {AudienceEmotionStateV878,CrowdInteractionCueV877} from "./smartAudienceEmotionDirectorV878";',
  'import {planSmartAudienceEmotionV878}');
 // The cue interface lives in V877; keep the type import from its own module.
 const wrong='import type {AudienceEmotionStateV878,CrowdInteractionCueV877} from "./smartAudienceEmotionDirectorV878";';
 edit(stage,wrong,'import type {AudienceEmotionStateV878} from "./smartAudienceEmotionDirectorV878";\nimport type {CrowdInteractionCueV877} from "./intelligentCrowdInteractionV877";',
  'import type {CrowdInteractionCueV877} from "./intelligentCrowdInteractionV877"');
 add(stage,'  const crowdCueV815=useRef<VirtualCrowdCueV815>({...CROWD_OFF_V815});',
  '\n  const audienceEmotionStateV878=useRef<AudienceEmotionStateV878|null>(null);',
  'audienceEmotionStateV878=useRef');
 edit(stage,
  'lyrics:lyricsV813,lyricsVisible:lyricsVisibleV813,progressMs:playback.positionMs});\n    particlesCueV816.current=mergeFestivalParticlesV844',
  `lyrics:lyricsV813,lyricsVisible:lyricsVisibleV813,progressMs:playback.positionMs});
    // V878 – smooth mood changes using *song position*, reset on seek/track change.
    // The director only dims existing FX gains and adds bounded existing-mesh motion.
    const audienceEmotionV878=planSmartAudienceEmotionV878({
      base:crowdCueV815.current as CrowdInteractionCueV877,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      previous:audienceEmotionStateV878.current,trackId:playback.trackId??null,
      positionMs:playback.positionMs,energy:audio.energyEnvelope??0,
      kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      reducedMotion,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542});
    audienceEmotionStateV878.current=audienceEmotionV878.state;
    crowdCueV815.current=audienceEmotionV878.cue;
    particlesCueV816.current=mergeFestivalParticlesV844`, 'const audienceEmotionV878=planSmartAudienceEmotionV878(');
 add(panel,"import {planIntelligentCrowdInteractionV877} from './intelligentCrowdInteractionV877';",
  "\nimport {planSmartAudienceEmotionV878} from './smartAudienceEmotionDirectorV878';",
  'import {planSmartAudienceEmotionV878}');
 add(panel,"lyrics:undefined,lyricsVisible:false,progressMs:5000});",
  `\n const emotionV878=planSmartAudienceEmotionV878({base:interactionV877,fx:preview,settings:s,
   previous:null,trackId:'preview',positionMs:5000,energy:.86,kick:.92,
   playing:true,manualLighting:false,blackout:false,reducedMotion:false,
   lyricsProtected:false,vocalFocus:false,tier:'high'});`,
  'const emotionV878=planSmartAudienceEmotionV878(');
 const panelAnchor="  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V816 · Reactive Particle Studio</legend>";
 const ui=`  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V878 · Smart Audience Emotion &amp; Energy Director</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdEmotionDirectorV878}
    disabled={!s.virtualCrowd||!s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876}
    onChange={e=>patch({crowdEmotionDirectorV878:e.target.checked})}/>
    Intelligenten Spannungsbogen für das Publikum aktivieren</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdEmotionWavesV878}
    disabled={!s.crowdEmotionDirectorV878||!s.crowdArmWaveV874}
    onChange={e=>patch({crowdEmotionWavesV878:e.target.checked})}/>
    Sanfte Wellenbewegungen bei Stimmungswechseln</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdEmotionContrastV878}
    disabled={!s.crowdEmotionDirectorV878}
    onChange={e=>patch({crowdEmotionContrastV878:e.target.checked})}/>
    Ruhige Momente und große Höhepunkte stärker voneinander abheben</label>
   <label>Emotionale Intensität ({s.crowdEmotionStrengthV878} %)
    <input type="range" min="0" max="100" step="5" value={s.crowdEmotionStrengthV878}
     disabled={!s.crowdEmotionDirectorV878}
     onChange={e=>patch({crowdEmotionStrengthV878:+e.target.value})}/></label>
   <label>Reaktionsgeschwindigkeit <select value={s.crowdEmotionStyleV878}
     disabled={!s.crowdEmotionDirectorV878}
     onChange={e=>patch({crowdEmotionStyleV878:e.target.value as ConcertFxSettingsV810['crowdEmotionStyleV878']})}>
     <option value="cinematic">Cinematisch / weich</option><option value="balanced">Ausgewogen</option>
     <option value="responsive">Direkt / lebendig</option></select></label>
   <small>Simulierte Vorschau: {emotionV878.cue.emotionMoodV878} · Energie {Math.round(emotionV878.cue.emotionEnergyV878*100)} %.
    Stimmungswechsel folgen überprüften Songabschnitten, mit Hysterese und Glättung über die Songposition.
    Kein Audio-KI-Emotionsdetektor: die Regie verwendet vorhandene Musikdaten und reaktiviert keine deaktivierten Effekte.</small>
  </fieldset>
`;
 edit(panel,panelAnchor,ui+panelAnchor,'V878 · Smart Audience Emotion &amp; Energy Director');
 for(const file of ['VirtualConcertCrowdV815.tsx','IntelligentAudienceArmsV874.tsx','FestivalWristbandsV875.tsx']){
  const rel='components/visualizer/'+file;
  add(rel,"import {applyCrowdInteractionMotionV877} from './intelligentCrowdInteractionV877';",
   "\nimport {applyAudienceEmotionMotionV878} from './smartAudienceEmotionDirectorV878';",
   'import {applyAudienceEmotionMotionV878}');
  add(rel,'applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion);',
   '\n   applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion);',
   'applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion)');
 }
 const additions=[src,'tests/v878-smart-audience-emotion-regression.cjs','tests/tsconfig.v878-core.json'];
 for(const rel of additions){
  const file=path.join(bundle,'v878',rel),dest=path.join(root,rel);
  if(!fs.existsSync(file))throw Error('Upgrade-Payload fehlt: '+rel);
  const bytes=fs.readFileSync(file);
  if(fs.existsSync(dest)&&!fs.readFileSync(dest).equals(bytes))throw Error('Lokale Datei weicht ab: '+rel);
  payloads.set(rel,bytes);
 }
 const pkg=JSON.parse(read('package.json'));
 if(!pkg.scripts||typeof pkg.scripts!=='object')throw Error('package.json scripts fehlen');
 pkg.scripts['test:v878']='node tests/v878-smart-audience-emotion-regression.cjs';
 pkg.scripts['test:v878:types']='tsc -p tests/tsconfig.v878-core.json --noEmit';
 const checks='npm run test:v878 && npm run test:v878:types';
 for(const key of ['build:preflight','prebuild']){
  if(typeof pkg.scripts[key]==='string'&&!pkg.scripts[key].includes('test:v878')){
   pkg.scripts[key]=key==='prebuild'?checks+' && '+pkg.scripts[key]:pkg.scripts[key]+' && '+checks;
  }
 }
 staged.set('package.json',JSON.stringify(pkg,null,2)+'\n');
 // Installer payload directories from V874–V878 are copied next to package.json.
 // They contain unfinished relative imports and must not be compiled as application source.
 const tsconfig=JSON.parse(read('tsconfig.json'));
 if(!Array.isArray(tsconfig.exclude))
  throw Error('tsconfig.json benötigt eine explizite exclude-Liste; bitte manuell prüfen.');
 for(const folder of ['v874','v875','v876','v877','v878']){
  const pattern=folder+'/**/*';
  if(!tsconfig.exclude.includes(pattern))tsconfig.exclude.push(pattern);
 }
 staged.set('tsconfig.json',JSON.stringify(tsconfig,null,2)+'\n');

 // Validate complete patch before writing. Atomic per-file rename plus rollback on I/O errors.
 const backups=new Map(),created=[];
 try{
  for(const [rel,data] of staged){
   const file=path.join(root,rel);backups.set(file,fs.readFileSync(file));
   const tmp=file+'.v878.tmp';fs.writeFileSync(tmp,data,'utf8');fs.renameSync(tmp,file);
  }
  for(const [rel,data] of payloads){
   const file=path.join(root,rel);fs.mkdirSync(path.dirname(file),{recursive:true});
   if(!fs.existsSync(file)){fs.writeFileSync(file,data);created.push(file);}
  }
 }catch(e){for(const [file,data] of backups)fs.writeFileSync(file,data);for(const file of created)fs.rmSync(file,{force:true});throw e;}
 console.log('V878 installiert. npm run test:v878 && npm run test:v878:types && npm run typecheck && npm run build');
}catch(error){console.error('V878 Installation abgebrochen:',error.message);process.exitCode=1;}
