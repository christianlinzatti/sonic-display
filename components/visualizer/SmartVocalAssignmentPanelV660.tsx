"use client";
import {useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {proposeVocalAssignmentsV660,mergeVocalProposalsV660} from './smartVocalAssignmentV660';

const clock=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
const originName={'manual-lines':'V385 · Manuelle Lyrics-Zuordnung','rap-duet':'V416 · Rap-Duett','lyric-tag':'Ausdrückliche Lyrics-Markierung'};
/** Review-only editor: nothing is written to the live scene before explicit acceptance. */
export function SmartVocalAssignmentPanelV660({trackId,durationMs}:{trackId:string;durationMs:number}){
 const {track,lyrics}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [open,setOpen]=useState(false);
 const [count,setCount]=useState<2|3|4>(2);
 const [selected,setSelected]=useState<number[]|null>(null);
 const [notice,setNotice]=useState('');
 const existing=preferences.vocalTimeSegmentsV496?.[trackId]??[];
 const report=useMemo(()=>proposeVocalAssignmentsV660({
   lyrics:track?.id===trackId?lyrics:null,durationMs,avatarCount:count,
   manual:preferences.avatarVocalAssignmentsV385?.[trackId],
   rapDuet:preferences.rapDuetAssignmentsV416?.[trackId],existing,
  }),[track?.id,trackId,lyrics,durationMs,count,preferences.avatarVocalAssignmentsV385,
   preferences.rapDuetAssignmentsV416,preferences.vocalTimeSegmentsV496]);
 const active=selected===null?report.proposals.map((_,i)=>i):selected.filter(i=>i>=0&&i<report.proposals.length);
 const accept=()=>{
   if(!trackId||!active.length)return;
   const library=preferences.vocalTimeSegmentsV496??{};
   const merged=mergeVocalProposalsV660(library[trackId],active.map(i=>report.proposals[i]),durationMs);
   if(merged.added){updatePreferences({vocalTimeSegmentsV496:{...library,[trackId]:merged.segments},vocalTimeEnabledV496:true});}
   setNotice(`${merged.added} Zeitmarken übernommen${merged.skipped?`, ${merged.skipped} übersprungen`:''}.`);
   setSelected(null);
 };
 return <fieldset className="v660-smart-vocal-casting" aria-label="V660 Smart Vocal Assignment" style={{marginBlock:12}}>
  <legend>V660 · Smart Vocal Assignment</legend>
  <p><small>Erstellt nur Vorschläge aus bereits von dir erfassten V385-/V416-Rollen oder aus ausdrücklich markierten synchronisierten Lyrics. Keine Stimmenerkennung, keine automatische Künstleridentifikation. Vorhandene Zeitmarken bleiben unverändert.</small></p>
  <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?'Vorschläge schließen':'Zuordnungsvorschläge prüfen'}</button>
  {open&&<div style={{display:'grid',gap:9,marginTop:8}}>
   <label>Avatare auf der Bühne <select value={count} onChange={e=>{setCount(Number(e.target.value) as 2|3|4);setSelected(null);setNotice('');}}>
    <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
   </select></label>
   <small>Lyrics-Markierung (optional und ausdrücklich): <code>[vocal:lead:1]</code>, <code>[vocal:feature:2]</code>, <code>[vocal:duet:1,2]</code>, <code>[vocal:hook:1,2]</code> oder <code>[vocal:adlib:2]</code>. Die Zahlen bezeichnen Avatar-Slots, keine erkannten Stimmen.</small>
   {!lyrics?.synced?<p>Vorschläge erfordern synchronisierte Lyrics. Die manuelle Zeitachse darüber funktioniert weiterhin ohne Lyrics.</p>:<>
    <p><strong>{report.proposals.length} Vorschläge</strong> · {report.skippedExisting} bereits belegte Bereiche · {report.skippedCompeting} konkurrierende Vorschläge übersprungen{report.truncated?' · Vorschläge auf 120 begrenzt':''}</p>
    <div aria-label="V660 vorgeschlagene Sänger-Zeitmarken" style={{maxHeight:270,overflowY:'auto',display:'grid',gap:5}}>
     {report.proposals.map((p,i)=><label key={`${i}-${p.segment.startMs}-${p.origin}`} style={{display:'flex',gap:7,alignItems:'start'}}>
      <input type="checkbox" checked={active.includes(i)} onChange={e=>{setSelected(prev=>{
       const before=prev??report.proposals.map((_,n)=>n);
       return e.target.checked?[...new Set([...before,i])]:before.filter(n=>n!==i);
      });setNotice('');}}/>
      <span>{clock(p.segment.startMs)}–{clock(p.segment.endMs)} · {p.segment.roleV547??p.segment.style} · Avatar {p.segment.singerSlotsV547?.map(i=>i+1).join(' + ')}
       <small style={{display:'block'}}>{originName[p.origin]} · Lyrics-Zeile {p.lineStart+1}{p.lineEnd!==p.lineStart?`–${p.lineEnd+1}`:''}</small></span>
     </label>)}
     {!report.proposals.length&&<small>Keine neuen ausdrücklich belegten Sängerrollen gefunden. Du kannst vorhandene V385-/V416-Zuordnungen verwenden oder unten manuell eine V496-Zeitmarke anlegen.</small>}
    </div>
    <button type="button" disabled={!active.length} onClick={accept}>{active.length} ausgewählte Zeitmarken übernehmen und Zeitregie aktivieren</button>
    {notice&&<p role="status">{notice}</p>}
   </>}
   <small>V385 hat in der Live-Regie weiterhin Vorrang. Vorhandene V496-Zeitmarken und manuelle Kamera-/Show-Cues werden nicht überschrieben. Ein Textmarker ist ein redaktioneller Hinweis, kein Beweis über die tatsächliche Tonspur.</small>
  </div>}
 </fieldset>;
}
