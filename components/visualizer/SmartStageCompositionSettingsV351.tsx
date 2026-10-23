'use client';
import {useEffect,useState} from 'react';
import {
 DEFAULT_SMART_STAGE_V351,SMART_STAGE_EVENT_V351,readSmartStageV351,saveSmartStageV351,
 decideSmartStageV351,composeStagePanelsV351,
 type SmartStageSettingsV351,type StageFocusV351,
} from '@/services/stageContent/smartStageCompositionV351';

const samplePanels=[
 {id:'main',enabled:true,x:0,y:1.1,z:-3.9,scale:1,yaw:0},
 {id:'left',enabled:true,x:-3.65,y:1.3,z:-2.5,scale:.53,yaw:.16},
 {id:'right',enabled:true,x:3.65,y:1.3,z:-2.5,scale:.53,yaw:-.16},
 {id:'front',enabled:true,x:0,y:1.1,z:-1.9,scale:.48,yaw:0},
 {id:'extra',enabled:true,x:3.65,y:1.3,z:-2.5,scale:.44,yaw:0},
];
export function SmartStageCompositionSettingsV351(){
 const [settings,setSettings]=useState(readSmartStageV351);
 const [section,setSection]=useState('verse');
 const [lyrics,setLyrics]=useState(true);
 const [side,setSide]=useState<'left'|'right'>('right');
 const [avatars,setAvatars]=useState(2);
 const [panels,setPanels]=useState(3);
 const [playing,setPlaying]=useState(true);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const update=()=>setSettings(readSmartStageV351());window.addEventListener(SMART_STAGE_EVENT_V351,update);return()=>window.removeEventListener(SMART_STAGE_EVENT_V351,update);},[]);
 const update=(partial:Partial<SmartStageSettingsV351>)=>saveSmartStageV351({...settings,...partial});
 const cue=decideSmartStageV351({lyricsActive:lyrics,lyricsSide:side,section,screenCount:panels,avatarCount:avatars,playing,reducedMotion:reduced,beatAccent:.85},settings);
 const layout=composeStagePanelsV351(samplePanels.slice(0,panels),cue);
 return <fieldset className="sonic-smart-stage-v351"><legend>V351 – Smart Stage Composition</legend>
  <p>Eine gemeinsame Priorität für Avatare, Lyrics, Bühnenfotos, Effekte, Licht und automatische Kamerafahrten. Bestehende manuelle Kamera-Presets bleiben maßgeblich.</p>
  <label className="sonic-smart-stage-check-v351"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Intelligente Bühnenkomposition aktivieren</label>
  <div className="sonic-smart-stage-grid-v351">
   <label>Fokus <select value={settings.focus} onChange={e=>update({focus:e.target.value as StageFocusV351})}>
    <option value="auto">Automatisch nach Songabschnitt</option><option value="lyrics">Lyrics</option><option value="avatars">Avatare</option><option value="photos">Fotos</option><option value="balanced">Ausgewogen</option>
   </select></label>
   {([
    ['lyricsProtection','Lyrics-Lesbarkeit'],['clearance','Abstand zwischen Inhalten'],
    ['cameraProtection','Sicherer Kamerabildausschnitt'],['lightProtection','Licht-/Effektschutz'],
    ['maxPanelScale','Maximale Leinwandgröße'],
   ] as const).map(([key,label])=><label key={key}>{label} <strong>{Math.round(settings[key]*100)} %</strong>
    <input type="range" min={key==='maxPanelScale'?40:0} max={100} step={5} value={Math.round(settings[key]*100)} onChange={e=>update({[key]:Number(e.target.value)/100})}/>
   </label>)}
  </div>
  <div className="sonic-smart-stage-preview-v351" aria-label="Smart Stage Szenensimulator">
   <h4>Live-Cue-Simulator (ohne zweite WebGL-Szene)</h4>
   <div className="sonic-smart-stage-grid-v351">
    <label>Songabschnitt <select value={section} onChange={e=>setSection(e.target.value)}><option value="intro">Intro</option><option value="verse">Verse</option><option value="chorus">Hook/Refrain</option><option value="build">Build-up</option><option value="drop">Drop</option><option value="outro">Outro</option></select></label>
    <label>Avatare <input type="number" min="1" max="5" value={avatars} onChange={e=>setAvatars(Math.max(1,Math.min(5,Number(e.target.value)||1)))}/></label>
    <label>Leinwände <input type="number" min="0" max="5" value={panels} onChange={e=>setPanels(Math.max(0,Math.min(5,Number(e.target.value)||0)))}/></label>
    <label>Lyrics-Seite <select value={side} onChange={e=>setSide(e.target.value as typeof side)}><option value="left">Links</option><option value="right">Rechts</option></select></label>
    <label><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics sichtbar</label>
    <label><input type="checkbox" checked={playing} onChange={e=>setPlaying(e.target.checked)}/> Musik läuft</label>
    <label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Weniger Bewegung</label>
   </div>
   <div className="sonic-smart-stage-schematic-v351" role="img" aria-label={`Bühnenaufteilung: ${avatars} Tänzer, ${panels} Leinwände, Fokus ${cue.focus}`}>
    <div className="sonic-smart-stage-avatar-row-v351">{Array.from({length:avatars},(_,i)=><span key={i} aria-hidden="true">♟</span>)}</div>
    {lyrics&&<span className={`sonic-smart-stage-lyrics-v351 side-${side}`} style={{opacity:cue.protectLyrics?1:.8}}>♪ Lyrics</span>}
    {layout.map((p,i)=><div key={p.id} className="sonic-smart-stage-panel-v351" style={{left:`${Math.max(6,Math.min(94,50+p.x*6.7))}%`,top:`${Math.max(11,Math.min(75,78-p.y*21))}%`,width:`${Math.max(11,p.scale*25)}%`,opacity:cue.photoOpacity,transform:'translate(-50%,-50%)'}}>{i===0?'Bühne':`Foto ${i}`}</div>)}
   </div>
   <p className="sonic-smart-stage-result-v351"><strong>{cue.focus.toUpperCase()}</strong> · {cue.reason}</p>
   <p className="sonic-smart-stage-metrics-v351">Fotolimit: {cue.maxPhotos} · Licht: {Math.round(cue.lightGain*100)} % · Effekte: {Math.round(cue.fxGain*100)} % · Kamera: {cue.active?`${cue.minFov.toFixed(0)}° Mindest-FOV`:'unverändert'}</p>
  </div>
  <button type="button" onClick={()=>update(DEFAULT_SMART_STAGE_V351)}>V351-Standard wiederherstellen</button>
  <small>V351 ändert keine importierten GLB-Motions oder gespeicherten Kamerafahrten. Es speichert nur diese lokalen Regie-Einstellungen, nicht Fotos, Lyrics oder Songdaten.</small>
 </fieldset>;
}
