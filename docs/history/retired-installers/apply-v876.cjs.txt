'use strict';
/** V876 additive installer. Requires V874 + V875. Run from project root. */
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
  throw Error('Integrationsstelle in '+rel+' fehlt oder ist mehrdeutig: '+anchor.slice(0,65));
 staged.set(rel,src.slice(0,i)+replacement+src.slice(i+anchor.length));
}
function add(rel,needle,insertion,marker){edit(rel,needle,needle+insertion,marker);}
try{
 if(!fs.existsSync(path.join(root,'components/visualizer/smartFestivalAtmosphereV875.ts')))
  throw Error('Bitte V874 und V875 zuerst installieren.');
 const cfg='components/visualizer/concertFxStudioV810.ts';
 const fields="festivalAtmosphereStyleV875:'subtle'|'balanced'|'immersive';";
 add(cfg,fields,"\n  crowdChoreographyV876:boolean;crowdSectorSyncV876:boolean;crowdChoreographyStrengthV876:number;crowdChoreographyStyleV876:'natural'|'concert'|'festival';",'crowdChoreographyV876:boolean');
 const defaults="festivalAtmosphereStrengthV875:65,festivalAtmosphereStyleV875:'balanced',";
 add(cfg,defaults,"\n  crowdChoreographyV876:true,crowdSectorSyncV876:true,crowdChoreographyStrengthV876:65,crowdChoreographyStyleV876:'concert',",'crowdChoreographyV876:true');
 const norm="festivalAtmosphereStyleV875:raw?.festivalAtmosphereStyleV875==='subtle'||raw?.festivalAtmosphereStyleV875==='immersive'?raw.festivalAtmosphereStyleV875:'balanced',";
 add(cfg,norm,`
 crowdChoreographyV876:typeof raw?.crowdChoreographyV876==='boolean'?raw.crowdChoreographyV876:d.crowdChoreographyV876,
 crowdSectorSyncV876:typeof raw?.crowdSectorSyncV876==='boolean'?raw.crowdSectorSyncV876:d.crowdSectorSyncV876,
 crowdChoreographyStrengthV876:finite(raw?.crowdChoreographyStrengthV876)?Math.round(clamp(raw.crowdChoreographyStrengthV876,0,100)):d.crowdChoreographyStrengthV876,
 crowdChoreographyStyleV876:raw?.crowdChoreographyStyleV876==='natural'||raw?.crowdChoreographyStyleV876==='festival'?raw.crowdChoreographyStyleV876:'concert',`,'crowdChoreographyStrengthV876:finite(raw?.crowdChoreographyStrengthV876)');
 const scene='components/visualizer/DynamicStage.tsx';
 add(scene,'import {FestivalWristbandsV875} from "./FestivalWristbandsV875";',
  '\nimport {planDynamicFestivalCrowdChoreographyV876} from "./dynamicFestivalCrowdChoreographyV876";\nimport type {FestivalAtmosphereCueV875} from "./smartFestivalAtmosphereV875";',
  'import {planDynamicFestivalCrowdChoreographyV876}');
 const stageAnchor='lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});\n    particlesCueV816.current=mergeFestivalParticlesV844';
 edit(scene,stageAnchor,`lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});
    // V876 is downstream of the verified V810 cue, V825 budget and V875 mood.
    crowdCueV815.current=planDynamicFestivalCrowdChoreographyV876({
      base:crowdCueV815.current as FestivalAtmosphereCueV875,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});
    particlesCueV816.current=mergeFestivalParticlesV844`,
  'crowdCueV815.current=planDynamicFestivalCrowdChoreographyV876(');
 const panel='components/visualizer/ConcertFxStudioPanelV810.tsx';
 add(panel,"import {planSmartFestivalAtmosphereV875} from './smartFestivalAtmosphereV875';",
  "\nimport {planDynamicFestivalCrowdChoreographyV876} from './dynamicFestivalCrowdChoreographyV876';",
  'import {planDynamicFestivalCrowdChoreographyV876}');
 const uiPreview='lyricsProtected:false,vocalFocus:false,reducedMotion:false});\n const particlePreview=planReactiveParticlesV816';
 edit(panel,uiPreview,`lyricsProtected:false,vocalFocus:false,reducedMotion:false});
 const choreographyV876=planDynamicFestivalCrowdChoreographyV876({base:atmosphereV875,fx:preview,
   settings:s,energy:.86,kick:.92,tier:'high',playing:true,manualLighting:false,
   blackout:false,lyricsProtected:false,vocalFocus:false,reducedMotion:false});
 const particlePreview=planReactiveParticlesV816`, 'const choreographyV876=planDynamicFestivalCrowdChoreographyV876(');
 const panelAnchor='  <fieldset style={{border:\'1px solid #56566a\',borderRadius:8,padding:12}}><legend>V816 · Reactive Particle Studio</legend>';
 const controls=`  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V876 · Dynamic Festival Crowd Choreography</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdChoreographyV876}
     disabled={!s.virtualCrowd||!s.crowdExperienceV874||!s.smartFestivalAtmosphereV875}
     onChange={e=>patch({crowdChoreographyV876:e.target.checked})}/> Natürliche Publikums-Choreografien automatisch steuern</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdSectorSyncV876}
     disabled={!s.crowdChoreographyV876||!s.virtualCrowd}
     onChange={e=>patch({crowdSectorSyncV876:e.target.checked})}/> Sechs Publikumssektoren synchronisieren</label>
   <label>Bewegungsstärke ({s.crowdChoreographyStrengthV876} %)
     <input type="range" min="0" max="100" step="5" value={s.crowdChoreographyStrengthV876}
      disabled={!s.crowdChoreographyV876||!s.virtualCrowd}
      onChange={e=>patch({crowdChoreographyStrengthV876:+e.target.value})}/></label>
   <label>Choreografie-Stil <select value={s.crowdChoreographyStyleV876}
      disabled={!s.crowdChoreographyV876||!s.virtualCrowd}
      onChange={e=>patch({crowdChoreographyStyleV876:e.target.value as ConcertFxSettingsV810['crowdChoreographyStyleV876']})}>
     <option value="natural">Natürlich</option><option value="concert">Konzert</option>
     <option value="festival">Festival / Rave</option></select></label>
   <small>Simulierte Vorschau: {choreographyV876.choreographyMode} · Reaktionsstärke {Math.round(choreographyV876.choreographyStrength*100)} % · Sektorsynchronisation {choreographyV876.choreographySectorSync?'an':'aus'}. Keine neuen Meshes oder Lichtquellen; Lyrics, Blackout, manuelle Regie und Performance-Limits gehen vor.</small>
  </fieldset>
`;
 edit(panel,panelAnchor,controls+panelAnchor,'V876 · Dynamic Festival Crowd Choreography');
 const renderImport="import {createVirtualCrowdLayoutV815,CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';";
 const renderAdd="\nimport {sampleCrowdChoreographyV876,createCrowdMotionScratchV876} from './dynamicFestivalCrowdChoreographyV876';";
 const body='components/visualizer/VirtualConcertCrowdV815.tsx';
 add(body,renderImport,renderAdd,'import {sampleCrowdChoreographyV876');
 add(body,' const dummy=useMemo(()=>new Object3D(),[]);',
  '\n const choreographyMotion=useMemo(createCrowdMotionScratchV876,[]);','const choreographyMotion=useMemo(createCrowdMotionScratchV876');
 edit(body,'    const lift=Math.max(-.07,Math.min(.12,wave*cue.movement));',
 `    const lift=Math.max(-.07,Math.min(.12,wave*cue.movement));
    sampleCrowdChoreographyV876(index,p,cue,choreographyMotion);
    const visualLift=lift+choreographyMotion.bob;`,
 'sampleCrowdChoreographyV876(index,p,cue,choreographyMotion)');
 edit(body,'dummy.position.set(p.x,p.y+.36*p.scale+lift,p.z);',
  'dummy.position.set(p.x+choreographyMotion.horizontal,p.y+.36*p.scale+visualLift,p.z);',
  'p.x+choreographyMotion.horizontal,p.y+.36');
 edit(body,'dummy.rotation.set(0,0,wave*cue.movement*.18);',
  'dummy.rotation.set(0,0,wave*cue.movement*.18+choreographyMotion.tilt);',
  'wave*cue.movement*.18+choreographyMotion.tilt');
 edit(body,'dummy.position.set(p.x,p.y+.8*p.scale+lift,p.z);',
  'dummy.position.set(p.x+choreographyMotion.horizontal,p.y+.8*p.scale+visualLift,p.z);',
  'p.x+choreographyMotion.horizontal,p.y+.8');
 edit(body,'dummy.position.set(p.x+.14*p.scale,p.y+1.03*p.scale+lift+phoneSway,p.z+.03);',
  'dummy.position.set(p.x+choreographyMotion.horizontal+.14*p.scale,p.y+1.03*p.scale+visualLift+phoneSway,p.z+.03);',
  'p.x+choreographyMotion.horizontal+.14');
 const arms='components/visualizer/IntelligentAudienceArmsV874.tsx';
 add(arms,renderImport,renderAdd,'import {sampleCrowdChoreographyV876');
 add(arms,' const object=useMemo(()=>new Object3D(),[]);',
  '\n const choreographyMotion=useMemo(createCrowdMotionScratchV876,[]);','const choreographyMotion=useMemo(createCrowdMotionScratchV876');
 edit(arms,'   const p=people[index];',
  '   const p=people[index];\n   sampleCrowdChoreographyV876(index,p,cue,choreographyMotion);',
  'sampleCrowdChoreographyV876(index,p,cue,choreographyMotion)');
 edit(arms,'waveStrength*Math.sin(cue.phase*1.8-p.x*.55)*1.35;',
  'waveStrength*Math.sin(cue.phase*1.8-p.x*.55)*1.35+choreographyMotion.wavePhase;',
  '*1.35+choreographyMotion.wavePhase;');
 edit(arms,'object.position.set(p.x+side*.36*p.scale,p.y+.65*p.scale,p.z-.018);',
  'object.position.set(p.x+choreographyMotion.horizontal+side*.36*p.scale,p.y+.65*p.scale+choreographyMotion.bob,p.z-.018);',
  'p.x+choreographyMotion.horizontal+side');
 edit(arms,'object.rotation.set(0,0,-side*(.12+lift*(.27+alternate*1.07)));',
  'object.rotation.set(0,0,-side*(.12+lift*(.27+alternate*1.07+choreographyMotion.armAccent)));',
  'alternate*1.07+choreographyMotion.armAccent');
 const wrists='components/visualizer/FestivalWristbandsV875.tsx';
 add(wrists,renderImport,renderAdd,'import {sampleCrowdChoreographyV876');
 add(wrists,' const dummy=useMemo(()=>new Object3D(),[]);',
  '\n const choreographyMotion=useMemo(createCrowdMotionScratchV876,[]);','const choreographyMotion=useMemo(createCrowdMotionScratchV876');
 edit(wrists,'   const p=people[index];',
  '   const p=people[index];\n   sampleCrowdChoreographyV876(index,p,cue,choreographyMotion);',
  'sampleCrowdChoreographyV876(index,p,cue,choreographyMotion)');
 edit(wrists,'dummy.position.set(p.x+side*.37*p.scale,p.y+(.95+lift)*p.scale,p.z-.02);',
  'dummy.position.set(p.x+choreographyMotion.horizontal+side*.37*p.scale,p.y+(.95+lift)*p.scale+choreographyMotion.bob+choreographyMotion.armAccent*.08,p.z-.02);',
  'p.x+choreographyMotion.horizontal+side');
 // Package validation and file-write rollback. Avoid overwriting local custom edits.
 const additions=[
  'components/visualizer/dynamicFestivalCrowdChoreographyV876.ts',
  'tests/v876-dynamic-festival-crowd-regression.cjs',
  'tests/tsconfig.v876-core.json'
 ];
 for(const rel of additions){
  const source=path.join(bundle,'v876',rel),dest=path.join(root,rel);
  if(!fs.existsSync(source))throw Error('Upgrade-Payload fehlt: '+rel);
  const bytes=fs.readFileSync(source);
  if(fs.existsSync(dest)&&!fs.readFileSync(dest).equals(bytes))
   throw Error('Abweichende lokale Datei vorhanden: '+rel);
  payloads.set(rel,bytes);
 }
 const pkg=JSON.parse(read('package.json'));
 if(!pkg.scripts)throw Error('package.json scripts fehlen');
 pkg.scripts['test:v876']='node tests/v876-dynamic-festival-crowd-regression.cjs';
 pkg.scripts['test:v876:types']='tsc -p tests/tsconfig.v876-core.json --noEmit';
 for(const key of ['build:preflight','prebuild']){
  if(typeof pkg.scripts[key]==='string'&&!pkg.scripts[key].includes('test:v876')){
   // V868 requires its historical build:preflight prefix to remain intact.
   const check='npm run test:v876 && npm run test:v876:types';
   pkg.scripts[key]=key==='prebuild'?check+' && '+pkg.scripts[key]:pkg.scripts[key]+' && '+check;
  }
 }
 staged.set('package.json',JSON.stringify(pkg,null,2)+'\n');
 const original=new Map(),created=[];
 try{
  for(const [rel,data] of staged){const dest=path.join(root,rel);original.set(dest,fs.readFileSync(dest));fs.writeFileSync(dest,data,'utf8');}
  for(const [rel,data] of payloads){const dest=path.join(root,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest)){fs.writeFileSync(dest,data);created.push(dest);}}
 }catch(err){for(const [dest,data] of original)fs.writeFileSync(dest,data);for(const dest of created)fs.rmSync(dest,{force:true});throw err;}
 console.log('V876 installiert. Jetzt npm run test:v876 && npm run test:v876:types && npm run typecheck && npm run build ausführen.');
}catch(error){console.error('V876 Installation abgebrochen:',error.message);process.exitCode=1;}
