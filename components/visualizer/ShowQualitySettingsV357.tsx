'use client';
import {useEffect,useMemo,useState} from 'react';
import {planAutonomousShowV356,DEFAULT_AUTO_SHOW_V356,type AutoShowSectionV356} from '@/services/stageContent/autonomousShowV356';
import {readShowQualityV357,saveShowQualityV357,refineShowQualityV357,SHOW_QUALITY_EVENT_V357,
 type ShowQualitySettingsV357,type ShowQualityModeV357} from '@/services/stageContent/showQualityV357';
const sections:AutoShowSectionV356[]=['verse','hook','build','drop','break'];
const seconds=(n:number)=>(n/1000).toFixed(1);
export function ShowQualitySettingsV357(){
 const [settings,setSettings]=useState(readShowQualityV357);
 const [genre,setGenre]=useState('Deutschrap');
 const [section,setSection]=useState<AutoShowSectionV356>('verse');
 const [time,setTime]=useState(32);
 const [bpm,setBpm]=useState(140);
 const [screens,setScreens]=useState(2);
 const [avatars,setAvatars]=useState(2);
 const [lyrics,setLyrics]=useState(true);
 useEffect(()=>{const sync=()=>setSettings(readShowQualityV357());window.addEventListener(SHOW_QUALITY_EVENT_V357,sync);
  return()=>window.removeEventListener(SHOW_QUALITY_EVENT_V357,sync);},[]);
 const update=(patch:Partial<ShowQualitySettingsV357>)=>setSettings(saveShowQualityV357({...settings,...patch}));
 const result=useMemo(()=>{
  const plan=planAutonomousShowV356({trackId:'v357-preview',progressMs:time*1000,durationMs:240000,
   bpm,genre,section,lyricsActive:lyrics,playing:true,reducedMotion:false,avatarCount:avatars,
   automaticShowEnabled:true},{...DEFAULT_AUTO_SHOW_V356,lookahead:8});
  return refineShowQualityV357(plan,{trackId:'v357-preview',section,lyricsActive:lyrics,mediaCount:screens,
   avatarCount:avatars,playing:true,reducedMotion:false},settings);
 },[settings,genre,section,time,bpm,lyrics,screens,avatars]);
 return <fieldset className="sonic-show-quality-v357"><legend>V357 – Show Quality Intelligence</legend>
  <p>Verbessert automatisch vorgeschlagene V356-Szenen: Kameravariation, wiederkehrende Muster und das gemeinsame Licht-/Effektbudget. Die Werte sind <strong>heuristische Planungs-Scores</strong>, keine Messung der Bildqualität oder GPU-Leistung.</p>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Automatische Show-Qualitätsregie aktivieren</label>
  <div className="sonic-show-toolbar-v354">
   <label>Regiestil <select value={settings.mode} onChange={e=>update({mode:e.target.value as ShowQualityModeV357})}>
    <option value="balanced">Ausgewogen</option><option value="cinematic">Cinematic</option><option value="energetic">Energiegeladen</option></select></label>
   <label>Abwechslung ({settings.variety} %) <input type="range" min="0" max="100" step="5" value={settings.variety} onChange={e=>update({variety:Number(e.target.value)})}/></label>
   <label>Ruhige Kamera priorisieren ({settings.calmness} %) <input type="range" min="0" max="100" step="5" value={settings.calmness} onChange={e=>update({calmness:Number(e.target.value)})}/></label>
   <label>Maximaler FX-Faktor ({settings.maxFxGain.toFixed(2)}×) <input type="range" min="0.4" max="1.55" step="0.05" value={settings.maxFxGain} onChange={e=>update({maxFxGain:Number(e.target.value)})}/></label>
   <label><input type="checkbox" checked={settings.protectContent} onChange={e=>update({protectContent:e.target.checked})}/> Lyrics &amp; Fotogalerien zusätzlich schützen</label>
  </div>
  <details><summary>Show-Qualität simulieren (ohne 3D-Renderer)</summary>
   <div className="sonic-show-toolbar-v354">
    <label>Genre <select value={genre} onChange={e=>setGenre(e.target.value)}>{['Deutschrap','Hardstyle','Hardtekk','Techno','Ambient','Pop','Rock'].map(g=><option key={g}>{g}</option>)}</select></label>
    <label>Abschnitt <select value={section} onChange={e=>setSection(e.target.value as AutoShowSectionV356)}>{sections.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>BPM <input type="number" min="50" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/></label>
    <label>Songposition ({time}s) <input type="range" min="0" max="239" value={time} onChange={e=>setTime(Number(e.target.value))}/></label>
    <label>Foto-Screens <select value={screens} onChange={e=>setScreens(Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <label>Avatare <select value={avatars} onChange={e=>setAvatars(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <label><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics sichtbar</label>
   </div>
   {result.active?<div aria-live="polite">
    <p><strong>Heuristischer Show-Score:</strong> vorher {result.before.score}/100 → nachher {result.after.score}/100</p>
    <p>Kamerabewegung: {result.after.cameraActivity}% · Wiederholungen: {result.after.repetition}% · visuelle Last: {result.after.visualLoad}%</p>
    <p>{result.changes.length?result.changes.join(' · '):'Keine automatische Korrektur nötig'}</p>
    <ol>{result.moments.map(m=><li key={m.index}>{seconds(m.startMs)}–{seconds(m.endMs)}s · {m.formation} · {m.shot} · Licht {Math.round(m.lightGain*100)}% · FX {Math.round(m.fxGain*100)}%</li>)}</ol>
   </div>:<p role="status">{result.reason}</p>}
  </details>
  <small>Vorrang: eigene V354-Timelines, manuelle Kameras/Animationen, reduzierte Bewegung, V351-Lyrics-Schutz und V355-Performance-Limits. Keine neuen Render-Loops, ML-Dienste oder Audioanalysen.</small>
 </fieldset>;
}
