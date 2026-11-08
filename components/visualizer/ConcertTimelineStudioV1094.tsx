'use client';
/** V1094 · Local time-boundary editor for the live V1040 360° show plan. */
import {useEffect,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {normalizeArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {retimeConcertBoundaryV1094,resetConcertBoundariesV1094,
 previewConcertTimelineV1094,timelineBoundaryRangeV1094,
 TIMELINE_COLORS_V1094} from '@/lib/arena360ConcertTimelineStudioV1094';
const LABELS:Record<string,string>={intro:'Intro',verse:'Strophe',build:'Aufbau',hook:'Hook',interlude:'Break',finale:'Finale'};
const format=(n:number)=>`${Math.floor(n/60000)}:${String(Math.floor(n/1000)%60).padStart(2,'0')}`;
export function ConcertTimelineStudioV1094(){
 const {preferences,updatePreferences}=useUiPreferences();
 const plan=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
 const [playhead,setPlayhead]=useState(0);
 const [selected,setSelected]=useState('act-1');
 const [notice,setNotice]=useState('');
 const duration=plan?.durationMs??0;
 useEffect(()=>{setPlayhead(0);setSelected('act-1');setNotice('');},[plan?.title,plan?.durationMs]);
 const preview=plan?previewConcertTimelineV1094(plan,Math.min(playhead,duration)):null;
 const changeBoundary=(i:number,time:number)=>{
  const updated=retimeConcertBoundaryV1094(plan,i,time);
  if(updated)updatePreferences({arenaShowPlanV1040:updated});
  else setNotice('Diese Grenze kann hier nicht verschoben werden.');
 };
 return <fieldset className="arena-v1094-concert-timeline" aria-label="V1094 Concert Timeline Studio 3.0">
  <legend>V1094 · Concert Timeline Studio 3.0</legend>
  <p>Alle sieben geplanten Szenen auf einer Zeitachse. Verschiebe die sechs inneren Grenzen, um den Ablauf an deinen Song anzupassen. Die Änderung wird im vorhandenen Showplan gespeichert.</p>
  {!plan?<p role="status">Erstelle zuerst im AI Show Designer einen Showplan. Die Timeline überschreibt keine anderen Song- oder Kamera-Timelines.</p>:<>
   <div role="group" aria-label="Editierbare Vorschau der Konzertabschnitte"
    style={{display:'flex',width:'100%',minHeight:48,borderRadius:6,overflow:'hidden',background:'#1a2637'}}>
    {plan.segments.map((s,i)=><button key={s.id} type="button" aria-label={`${LABELS[s.scene]}: ${format(duration*s.start)} bis ${format(duration*s.end)} auswählen`}
     title={`${LABELS[s.scene]} · ${format(duration*s.start)}–${format(duration*s.end)}`}
     onClick={()=>{setSelected(s.id);setPlayhead(Math.round(duration*(s.start+s.end)/2));}}
     style={{flex:`${Math.round((s.end-s.start)*100000)} 1 0`,minWidth:0,
      background:TIMELINE_COLORS_V1094[i],color:'#fff',border:selected===s.id?'2px solid #fff':'1px solid #243147',
      fontSize:11,overflow:'hidden',cursor:'pointer'}}>{Math.round((s.end-s.start)*100)>8?LABELS[s.scene]:i+1}</button>)}
   </div>
   <label>Vorschauposition · {format(Math.min(playhead,duration))} / {format(duration)}
    <input type="range" min={0} max={duration} step={250} value={Math.min(playhead,duration)}
     onChange={e=>setPlayhead(Number(e.target.value))}/>
   </label>
   <p aria-live="polite">Vorschau: {preview?.active?`${LABELS[preview.scene??'']??'Szene'} · ${preview.intensity}% Licht · ${preview.lasers} Laser · ${preview.camera} Kamera-Vorschlag`:'Keine Szene'}.</p>
   <div className="arena-v1094-boundaries">
    {plan.segments.slice(0,-1).map((s,i)=>{
     const range=timelineBoundaryRangeV1094(plan,i+1);
     if(!range)return null;
     return <label key={s.id}>{LABELS[s.scene]} → {LABELS[plan.segments[i+1].scene]} · {format(range.currentMs)}
      <input type="range" min={range.minMs} max={range.maxMs} step={250}
       aria-label={`Grenze nach ${LABELS[s.scene]} verschieben`} value={range.currentMs}
       onChange={e=>changeBoundary(i+1,Number(e.target.value))}/>
      <input type="number" min={range.minMs/1000} max={range.maxMs/1000} step="0.25"
       aria-label={`Sekunden nach ${LABELS[s.scene]}`} value={Number((range.currentMs/1000).toFixed(2))}
       onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n))changeBoundary(i+1,n*1000);}}/>
     </label>;
    })}
   </div>
   <button type="button" onClick={()=>{
    const reset=resetConcertBoundariesV1094(plan);
    if(reset){updatePreferences({arenaShowPlanV1040:reset});setNotice('Zeitgrenzen zurückgesetzt – Licht- und Kameravorgaben erhalten.');}
   }}>Standard-Zeitgrenzen wiederherstellen</button>
   {notice&&<small role="status">{notice}</small>}
   <small>Die Timeline ist eine bearbeitbare Show-Vorlage, keine erkannte Songstruktur. Die Vorschau ändert weder die Spotify-Position noch den laufenden Bühnenzustand. Erst „Showplan live anwenden“ aktiviert die gespeicherten Zeitgrenzen. Manuelle V354-Cues und Kamera-/Choreografie-Entscheidungen behalten Vorrang. Keine neuen Beats, Drops, Pyro-, Govee- oder Hardwarebefehle.</small>
  </>}
 </fieldset>;
}
