'use client';
import {useEffect,useMemo,useState} from 'react';
import {AUTONOMOUS_SHOW_EVENT_V356,readAutoShowV356,saveAutoShowV356,planAutonomousShowV356,
 type AutoShowSettingsV356,type AutoShowSectionV356} from '@/services/stageContent/autonomousShowV356';
const secs:AutoShowSectionV356[]=['verse','hook','build','drop','break'];
const seconds=(n:number)=>(n/1000).toFixed(1);
export function AutonomousShowSettingsV356(){
 const [settings,setSettings]=useState(readAutoShowV356);
 const [section,setSection]=useState<AutoShowSectionV356>('hook');
 const [genre,setGenre]=useState('Hardstyle');
 const [bpm,setBpm]=useState(150);
 const [time,setTime]=useState(30);
 const [lyrics,setLyrics]=useState(false);
 const [avatars,setAvatars]=useState(2);
 useEffect(()=>{const sync=()=>setSettings(readAutoShowV356());window.addEventListener(AUTONOMOUS_SHOW_EVENT_V356,sync);return()=>window.removeEventListener(AUTONOMOUS_SHOW_EVENT_V356,sync);},[]);
 const update=(patch:Partial<AutoShowSettingsV356>)=>setSettings(saveAutoShowV356({...settings,...patch}));
 const plan=useMemo(()=>planAutonomousShowV356({trackId:'preview',progressMs:time*1000,durationMs:180000,
  bpm,section,genre,playing:true,reducedMotion:false,lyricsActive:lyrics,avatarCount:avatars,automaticShowEnabled:true},settings),
 [time,bpm,section,genre,lyrics,avatars,settings]);
 return <fieldset className="sonic-autonomous-show-v356"><legend>V356 – Autonomous Show Intelligence 2.0</legend>
 <p>Musiktaktbasierte Vorausplanung mit wechselnden Formationen und Kameraperspektiven. Die folgenden Szenen sind <strong>vorläufige Vorschläge</strong>: Zukünftige Verse, Hooks oder Drops werden nicht erfunden oder als erkannt ausgegeben.</p>
 <label><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> V356 für automatische V306-Shows einschalten</label>
 <div className="sonic-show-toolbar-v354">
  <label>Show-Intensität ({settings.intensity} %) <input type="range" min="0" max="100" step="5" value={settings.intensity} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
  <label>Takte pro Abschnitt <select value={settings.phraseBars} onChange={e=>update({phraseBars:Number(e.target.value) as 2|4|8})}><option value="2">2</option><option value="4">4</option><option value="8">8</option></select></label>
  <label>Vorausplanung <select value={settings.lookahead} onChange={e=>update({lookahead:Number(e.target.value)})}>{[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} Abschnitte</option>)}</select></label>
 </div>
 <div className="sonic-show-toolbar-v354" role="group" aria-label="Automatische Spuren">
  {([['camera','Kamera'],['formations','Formationen'],['lighting','Licht'],['effects','Effekte'],['motions','GLB-Motions']] as const).map(([k,label])=><label key={k}><input type="checkbox" checked={settings[k]} onChange={e=>update({[k]:e.target.checked})}/> {label}</label>)}
 </div>
 <details><summary>Vorausschau simulieren (ohne Live-Bühne)</summary>
  <div className="sonic-show-toolbar-v354">
   <label>Genre <select value={genre} onChange={e=>setGenre(e.target.value)}>{['Deutschrap','Hardstyle','Hardtekk','Techno','Ambient','Pop','Rock'].map(g=><option key={g}>{g}</option>)}</select></label>
   <label>Songabschnitt <select value={section} onChange={e=>setSection(e.target.value as AutoShowSectionV356)}>{secs.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
   <label>BPM <input type="number" min="50" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/></label>
   <label>Songposition {time}s <input type="range" min="0" max="179" value={time} onChange={e=>setTime(Number(e.target.value))}/></label>
   <label>Avatare <select value={avatars} onChange={e=>setAvatars(Number(e.target.value))}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>
   <label><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics eingeblendet</label>
  </div>
  {plan.active?<div><strong>Geplante Szenen (Vorschau)</strong><ol>{plan.moments.map(m=><li key={m.index}>{seconds(m.startMs)}–{seconds(m.endMs)} s · {m.formation} · Kamera {m.shot} · Licht {Math.round(m.lightGain*100)} % · FX {Math.round(m.fxGain*100)} %</li>)}</ol></div>:<p role="status">{plan.reason}</p>}
 </details>
 <small>Vorrang: manuelle V354-Timelines, manuelle Gruppen-/Kamera-Steuerung, Lyrics-Schutz aus V351, Reduced Motion und V355-Performancegrenzen. Es werden keine externen KI-Dienste benötigt.</small>
 </fieldset>;
}
