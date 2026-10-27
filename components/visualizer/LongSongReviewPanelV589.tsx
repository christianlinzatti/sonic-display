'use client';
import {useMemo,useState} from 'react';
import type {AnimationClip} from 'three';
import {probeLongSongQualityV589} from './longSongQualityProbeV589';
export function LongSongReviewPanelV589({clips,onSelect,canPreview}:{clips:readonly AnimationClip[];onSelect:(clipIndex:number)=>void;canPreview:boolean}){
 const [minutes,setMinutes]=useState(4),[bpm,setBpm]=useState(110),[genre,setGenre]=useState('Deutschrap');
 const plan=useMemo(()=>probeLongSongQualityV589(clips.map(c=>({name:c.name,duration:c.duration,trackCount:c.tracks.length})),
  {minutes,bpm,genre,modelKey:'selected-glb-preview'}),[clips,minutes,bpm,genre]);
 return <section className="avatar-metadata-editor" aria-label="V589 Long Song GLB Quality Scenario">
  <h4>V589 · Lange Choreografien mit geladenen GLB-Clips durchspielen</h4>
  <p>Hypothetischer V588-Stresstest über vorhandene Animationen. Die Beispielsongstruktur ersetzt keine echten Track- oder Lyrics-Daten.</p>
  <label>Songlänge: {minutes} Minuten <input type="range" min={2} max={8} step={1} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label>
  <label>Beispieltempo: {bpm} BPM <input type="range" min={55} max={220} step={5} value={bpm} onChange={e=>setBpm(Number(e.target.value))}/></label>
  <label>Genre <select value={genre} onChange={e=>setGenre(e.target.value)}><option>Deutschrap</option><option>Hardstyle</option><option>Hardtekk</option></select></label>
  <p role="status">{plan.totalWindows} musikalische Fenster · {plan.uniqueClips} unterschiedliche Clips · {plan.immediateRepeats} direkte Wiederholungen · {plan.unavailableWindows} Fenster ohne passende Alternativauswahl.</p>
  {!canPreview&&<p>Für die tatsächliche 3D-Sichtprüfung zuerst einen passenden Avatar auswählen.</p>}
  <div style={{maxHeight:235,overflowY:'auto'}}><ol>{plan.entries.map((step,i)=><li key={i}>
   {step.atSeconds.toFixed(1)} s · {step.section} · {step.clipName??'Originalauswahl / kein zusätzlicher Wechsel'}
   {step.clipIndex!==null&&step.clipIndex>=0&&<button type="button" disabled={!canPreview} onClick={()=>onSelect(step.clipIndex!)}>Clip in 3D ansehen</button>}
  </li>)}</ol></div>
  <small>{plan.note} Die Clips werden hier nicht automatisch als echte 4-Minuten-Show gerendert oder auf dem Pi gemessen.</small>
 </section>;
}
