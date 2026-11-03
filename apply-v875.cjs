'use strict';
/** V875 additive installer. Requires V874; only patches validated unique anchors.
 * Run from the Sonic Display project root (the folder containing package.json).
 * Leaves V869–V873 files intact except for targeted additions to V874 integration.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=process.cwd(),bundle=__dirname;
const staged=new Map();
function current(rel){
 const f=path.join(root,rel);
 if(!fs.existsSync(f))throw Error('Projektdatei fehlt: '+rel);
 return staged.get(rel)??fs.readFileSync(f,'utf8');
}
function insert(rel,anchor,replacement,marker){
 let value=current(rel);
 if(value.includes(marker))return;
 const pos=value.indexOf(anchor);
 if(pos<0||value.indexOf(anchor,pos+anchor.length)!==-1)
  throw Error('Nicht eindeutige/fehlende Integrationsstelle in '+rel+': '+anchor.slice(0,75));
 staged.set(rel,value.slice(0,pos)+replacement+value.slice(pos+anchor.length));
}
try{
 if(!fs.existsSync(path.join(root,'components/visualizer/intelligentAudienceExperienceV874.ts')))
  throw Error('V874 fehlt: Bitte zuerst node apply-v874.cjs ausführen.');
 const settings='components/visualizer/concertFxStudioV810.ts';
 const fields='crowdExperienceV874:boolean;crowdArmWaveV874:boolean;crowdPhoneWaveV874:boolean;';
 insert(settings,fields,fields+'\n  smartFestivalAtmosphereV875:boolean;festivalCrowdWavesV875:boolean;festivalWristbandsV875:boolean;festivalAtmosphereStrengthV875:number;festivalAtmosphereStyleV875:\'subtle\'|\'balanced\'|\'immersive\';','smartFestivalAtmosphereV875:boolean');
 const defaults='crowdExperienceV874:true,crowdArmWaveV874:true,crowdPhoneWaveV874:true,';
 insert(settings,defaults,defaults+"\n  smartFestivalAtmosphereV875:true,festivalCrowdWavesV875:true,festivalWristbandsV875:true,festivalAtmosphereStrengthV875:65,festivalAtmosphereStyleV875:'balanced',",'smartFestivalAtmosphereV875:true');
 const norm="crowdPhoneWaveV874:typeof raw?.crowdPhoneWaveV874==='boolean'?raw.crowdPhoneWaveV874:d.crowdPhoneWaveV874,";
 insert(settings,norm,norm+`\n smartFestivalAtmosphereV875:typeof raw?.smartFestivalAtmosphereV875==='boolean'?raw.smartFestivalAtmosphereV875:d.smartFestivalAtmosphereV875,
 festivalCrowdWavesV875:typeof raw?.festivalCrowdWavesV875==='boolean'?raw.festivalCrowdWavesV875:d.festivalCrowdWavesV875,
 festivalWristbandsV875:typeof raw?.festivalWristbandsV875==='boolean'?raw.festivalWristbandsV875:d.festivalWristbandsV875,
 festivalAtmosphereStrengthV875:finite(raw?.festivalAtmosphereStrengthV875)?Math.round(clamp(raw.festivalAtmosphereStrengthV875,0,100)):d.festivalAtmosphereStrengthV875,
 festivalAtmosphereStyleV875:raw?.festivalAtmosphereStyleV875==='subtle'||raw?.festivalAtmosphereStyleV875==='immersive'?raw.festivalAtmosphereStyleV875:'balanced',`,'festivalAtmosphereStrengthV875:finite(raw?.festivalAtmosphereStrengthV875)');
 const stage='components/visualizer/DynamicStage.tsx';
 const stageImport='import {IntelligentAudienceArmsV874} from "./IntelligentAudienceArmsV874";';
 insert(stage,stageImport,stageImport+'\nimport {planSmartFestivalAtmosphereV875} from "./smartFestivalAtmosphereV875";\nimport type {AudienceCueV874} from "./intelligentAudienceExperienceV874";\nimport {FestivalWristbandsV875} from "./FestivalWristbandsV875";', 'import {planSmartFestivalAtmosphereV875}');
 const stageCue=`crowdCueV815.current=planIntelligentAudienceV874({base:crowdCueV815.current,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      tier,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});`;
 insert(stage,stageCue,stageCue+`
    // V875 reads only the performance-governed V874 crowd. No new FX authority.
    crowdCueV815.current=planSmartFestivalAtmosphereV875({
      base:crowdCueV815.current as AudienceCueV874,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});`,'crowdCueV815.current=planSmartFestivalAtmosphereV875(');
 const actor='<IntelligentAudienceArmsV874 cueRef={crowdCueV815}/>';
 insert(stage,actor,actor+'\n    <FestivalWristbandsV875 cueRef={crowdCueV815}/>','<FestivalWristbandsV875 cueRef={crowdCueV815}/>');
 // Make V875 waves visible in the original V874 arm animation as well as LED bands.
 const arms='components/visualizer/IntelligentAudienceArmsV874.tsx';
 const oldPhase="const position=p.phase+cue.phase*(cue.style==='rave'?7:cue.style==='clap'?5:3);";
 insert(arms,oldPhase,`const festivalWave=(cue as typeof cue & {festivalWave?:number}).festivalWave;
   const waveStrength=Number.isFinite(festivalWave)?Math.max(0,Math.min(.65,festivalWave??0)):0;
   const position=p.phase+cue.phase*(cue.style==='rave'?7:cue.style==='clap'?5:3)+
     waveStrength*Math.sin(cue.phase*1.8-p.x*.55)*1.35;`,'const festivalWave=(cue as typeof cue & {festivalWave?:number}).festivalWave;');
 const panel='components/visualizer/ConcertFxStudioPanelV810.tsx';
 const panelImport="import {planIntelligentAudienceV874} from './intelligentAudienceExperienceV874';";
 insert(panel,panelImport,panelImport+"\nimport {planSmartFestivalAtmosphereV875} from './smartFestivalAtmosphereV875';",'import {planSmartFestivalAtmosphereV875}');
 const preview=`const audienceV874=planIntelligentAudienceV874({base:crowdPreview,fx:preview,settings:s,
   tier:'high',lyricsProtected:false,vocalFocus:false,reducedMotion:false,energy:.86,kick:.92});`;
 insert(panel,preview,preview+`
 const atmosphereV875=planSmartFestivalAtmosphereV875({base:audienceV874,fx:preview,settings:s,
   energy:.86,kick:.92,tier:'high',playing:true,manualLighting:false,blackout:false,
   lyricsProtected:false,vocalFocus:false,reducedMotion:false});`,'const atmosphereV875=planSmartFestivalAtmosphereV875(');
 const uiAnchor='  <fieldset style={{border:\'1px solid #56566a\',borderRadius:8,padding:12}}><legend>V816 · Reactive Particle Studio</legend>';
 insert(panel,uiAnchor,`  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
    <legend>V875 · Smart Festival Atmosphere 3.0</legend>
    <label className="setting-check"><input type="checkbox" checked={s.smartFestivalAtmosphereV875}
      disabled={!s.virtualCrowd||!s.crowdExperienceV874}
      onChange={e=>patch({smartFestivalAtmosphereV875:e.target.checked})}/>
      Automatische Festival-Stimmungen nach Musikabschnitt</label>
    <label className="setting-check"><input type="checkbox" checked={s.festivalCrowdWavesV875}
      disabled={!s.smartFestivalAtmosphereV875||!s.crowdArmWaveV874||!s.virtualCrowd}
      onChange={e=>patch({festivalCrowdWavesV875:e.target.checked})}/>
      La-Ola- und Festival-Wellen im Publikum</label>
    <label className="setting-check"><input type="checkbox" checked={s.festivalWristbandsV875}
      disabled={!s.smartFestivalAtmosphereV875||!s.virtualCrowd}
      onChange={e=>patch({festivalWristbandsV875:e.target.checked})}/>
      Synchronisierte virtuelle LED-Armbänder</label>
    <label>Festival-Stimmung ({s.festivalAtmosphereStrengthV875} %)
      <input type="range" min="0" max="100" step="5" value={s.festivalAtmosphereStrengthV875}
       disabled={!s.smartFestivalAtmosphereV875||!s.virtualCrowd}
       onChange={e=>patch({festivalAtmosphereStrengthV875:+e.target.value})}/></label>
    <label>Festival-Stil <select value={s.festivalAtmosphereStyleV875}
       disabled={!s.smartFestivalAtmosphereV875||!s.virtualCrowd}
       onChange={e=>patch({festivalAtmosphereStyleV875:e.target.value as ConcertFxSettingsV810['festivalAtmosphereStyleV875']})}>
      <option value="subtle">Dezent</option><option value="balanced">Ausgewogen</option>
      <option value="immersive">Immersives Festival</option></select></label>
    <small>Simulierte Vorschau: {atmosphereV875.festivalMood} · Welle {Math.round(atmosphereV875.festivalWave*100)} % · LED-Bänder {Math.round(atmosphereV875.wristbandGlow*100)} %. Kein Strobo oder Vollbildblitz. Blackout, manuelle Regie, Lyrics und FPS haben Vorrang.</small>
  </fieldset>
`+uiAnchor,'V875 · Smart Festival Atmosphere 3.0');
 const additions=[
  'components/visualizer/smartFestivalAtmosphereV875.ts',
  'components/visualizer/FestivalWristbandsV875.tsx',
  'tests/v875-smart-festival-atmosphere-regression.cjs',
  'tests/tsconfig.v875-core.json'
 ];
 const bytes=new Map();
 for(const rel of additions){
  const src=path.join(bundle,'v875',rel),dest=path.join(root,rel);
  if(!fs.existsSync(src))throw Error('Upgrade-Datei fehlt: '+src);
  // Refuse to silently overwrite an unrelated local edit to the upgrade files.
  const payload=fs.readFileSync(src);
  if(fs.existsSync(dest)&&!fs.readFileSync(dest).equals(payload))
   throw Error('Bestehende Datei weicht vom Upgrade ab: '+rel+' (bitte vorher sichern)');
  bytes.set(rel,payload);
 }
 const json=JSON.parse(current('package.json'));
 if(!json.scripts||typeof json.scripts!=='object')throw Error('package.json ohne scripts');
 json.scripts['test:v875']='node tests/v875-smart-festival-atmosphere-regression.cjs';
 json.scripts['test:v875:types']='tsc -p tests/tsconfig.v875-core.json --noEmit';
 for(const key of ['prebuild','build:preflight']){
  if(typeof json.scripts[key]==='string'&&!json.scripts[key].includes('test:v875')){
   const checks='npm run test:v875 && npm run test:v875:types';
   // V868 regression requires build:preflight to retain its original V868 prefix.
   json.scripts[key]=key==='build:preflight'?json.scripts[key]+' && '+checks:checks+' && '+json.scripts[key];
  }
 }
 staged.set('package.json',JSON.stringify(json,null,2)+'\n');
 // Validate all files and patches first. On write failure restore original bytes.
 const originals=new Map(),created=[];
 try{
  for(const [rel,value] of staged){
   const dest=path.join(root,rel);originals.set(rel,fs.readFileSync(dest));
   fs.writeFileSync(dest,value,'utf8');
  }
  for(const [rel,value] of bytes){
   const dest=path.join(root,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});
   if(!fs.existsSync(dest)){fs.writeFileSync(dest,value);created.push(dest);}
  }
 }catch(error){
  for(const [rel,original] of originals)fs.writeFileSync(path.join(root,rel),original);
  for(const file of created)fs.rmSync(file,{force:true});
  throw error;
 }
 console.log('V875 installiert. Prüfe: npm run test:v875 && npm run test:v875:types && npm run typecheck && npm run build');
}catch(error){console.error('V875 nicht installiert:',error.message);process.exitCode=1;}
