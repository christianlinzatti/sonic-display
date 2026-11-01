'use client';
import {useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {proposeVocalAssignmentsV660} from './smartVocalAssignmentV660';
import {resolveVocalTimeCueV496} from './vocalTimeDirectorV496';
import {applyVocalReviewsV756,auditVocalTimelineV756,buildVocalReviewV756,defaultVocalReviewEditV756,
 type VocalReviewEditV756} from './advancedVocalReviewV756';

const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(Math.floor(ms%1000)).padStart(3,'0')}`;
const names={'manual-lines':'V385 · manuell','rap-duet':'V416 · Rap-Duett','lyric-tag':'redaktioneller Textmarker'};
/** V756 is a review/edit stage. No proposed voice is made live without the Save action. */
export function AdvancedVocalReviewPanelV756({trackId,durationMs}:{trackId:string;durationMs:number}){
 const {track,lyrics}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [open,setOpen]=useState(false);
 const [count,setCount]=useState<2|3|4>(2);
 const [drafts,setDrafts]=useState<Record<number,VocalReviewEditV756>>({});
 const [checked,setChecked]=useState<number[]>([]);
 const [override,setOverride]=useState(false);
 const [previewIndex,setPreviewIndex]=useState<number|null>(null);
 const [message,setMessage]=useState('');
 const existing=trackId?preferences.vocalTimeSegmentsV496?.[trackId]??[]:[];
 // Intentionally include candidates overlapping previously saved V496 cues, so they can be explicitly reviewed.
 const report=useMemo(()=>proposeVocalAssignmentsV660({
  lyrics:track?.id===trackId?lyrics:null,durationMs,avatarCount:count,manual:preferences.avatarVocalAssignmentsV385?.[trackId],
  rapDuet:preferences.rapDuetAssignmentsV416?.[trackId],existing:[]
 }),[track?.id,trackId,lyrics,durationMs,count,preferences.avatarVocalAssignmentsV385,preferences.rapDuetAssignmentsV416]);
 const reviews=useMemo(()=>report.proposals.map((proposal,i)=>buildVocalReviewV756({
  proposal,edit:drafts[i]??defaultVocalReviewEditV756(proposal),durationMs,count,existing
 })),[report,drafts,durationMs,count,existing]);
 const audit=useMemo(()=>auditVocalTimelineV756(existing,durationMs,count),[existing,durationMs,count]);
 const selected=checked.filter(i=>i>=0&&i<reviews.length);
 const update=(index:number,patch:Partial<VocalReviewEditV756>)=>setDrafts(prev=>({
  ...prev,[index]:{...(prev[index]??defaultVocalReviewEditV756(report.proposals[index])),...patch}
 }));
 const changeCount=(next:2|3|4)=>{setCount(next);setDrafts({});setChecked([]);setPreviewIndex(null);setMessage('');setOverride(false);};
 const save=()=>{
  if(!trackId||track?.id!==trackId||!selected.length)return;
  // Every candidate is rechecked against the latest persisted cues immediately before the write.
  const latest=preferences.vocalTimeSegmentsV496?.[trackId]??[];
  const candidates=selected.map(i=>buildVocalReviewV756({proposal:report.proposals[i],
   edit:drafts[i]??defaultVocalReviewEditV756(report.proposals[i]),durationMs,count,existing:latest}));
  const result=applyVocalReviewsV756({existing:latest,reviews:candidates,durationMs,count,overrideExisting:override});
  if(result.added){updatePreferences({vocalTimeSegmentsV496:{...(preferences.vocalTimeSegmentsV496??{}),
   [trackId]:result.segments},vocalTimeEnabledV496:true});}
  setMessage(`${result.added} überprüfte Zeitmarken gespeichert · ${result.replaced} vorhandene Konflikt-Markierungen ersetzt · ${result.skipped} übersprungen.`);
  if(result.added){setChecked([]);setDrafts({});setOverride(false);}
 };
 const preview=previewIndex===null?null:reviews[previewIndex];
 const cue=preview?.segment?resolveVocalTimeCueV496({trackId,progressMs:preview.segment.startMs+Math.min(200,Math.floor((preview.segment.endMs-preview.segment.startMs)/2)),
  playing:true,enabled:true,count,segments:[preview.segment]}):null;
 return <fieldset className="v756-advanced-vocal-review" aria-label="V756 Advanced Vocal Assignment" style={{marginBlock:12}}>
  <legend>V756 · Advanced Vocal Assignment</legend>
  <p><small>Vorschläge mit Sängerwechsel, Feature, Duett und Hook vor der Freigabe bearbeiten. Die Vorschläge stammen ausschließlich aus manuell gespeicherten Rollen oder ausdrücklichen Lyrics-Markierungen – nicht aus einer automatischen Stimmenerkennung.</small></p>
  <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?'Korrekturstudio schließen':'Erweitertes Sänger-Korrekturstudio öffnen'}</button>
  {open&&<div style={{display:'grid',gap:10,marginTop:10}}>
   <label>Aktuelle Bühnenbesetzung <select value={count} onChange={(e:{target:{value:string}})=>changeCount(Number(e.target.value) as 2|3|4)}>
    <option value={2}>2 Avatare</option><option value={3}>3 Avatare</option><option value={4}>4 Avatare</option>
   </select></label>
   <p><small>Gespeichert: {audit.segments} Zeitmarken · {audit.conflicts} konkurrierende Haupt-/Adlib-Zeitmarken · {audit.invalidSlots} für diese Besetzung ungültige Zuordnungen · {fmt(audit.uncoveredMs)} ohne zugewiesene Hauptrolle. Das bedeutet nicht, dass im Ton keine Stimme zu hören ist.</small></p>
   <p><strong>{report.proposals.length} überprüfbare Vorschläge</strong>{report.truncated?' · begrenzt auf 120':''} · {report.skippedCompeting} widersprüchliche Vorschläge nicht übernommen</p>
   {!lyrics?.synced&&<small>Synchronisierte Lyrics fehlen. Manuelle V496-Zeitmarken lassen sich darüber weiterhin anlegen und bearbeiten.</small>}
   <div style={{maxHeight:460,overflowY:'auto',display:'grid',gap:9}} aria-label="V756 Sänger-Vorschläge und manuelle Korrektur">
    {report.proposals.map((proposal,i)=>{
     const d=drafts[i]??defaultVocalReviewEditV756(proposal),review=reviews[i],isHook=d.role==='hook',isDuet=!isHook&&d.role!=='adlib'&&d.style==='duet';
     return <div key={`${proposal.origin}-${proposal.segment.startMs}-${i}`} style={{border:'1px solid #75849b',borderRadius:8,padding:9,display:'grid',gap:6}}>
      <label><input type="checkbox" checked={selected.includes(i)} onChange={(e:{target:{checked:boolean}})=>setChecked(v=>e.target.checked?[...new Set([...v,i])]:v.filter(n=>n!==i))}/>
       <strong> {fmt(proposal.segment.startMs)}–{fmt(proposal.segment.endMs)}</strong> · {names[proposal.origin]} · Zeile {proposal.lineStart+1}{proposal.lineEnd>proposal.lineStart?`–${proposal.lineEnd+1}`:''}</label>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
       <label>Rolle <select aria-label={`V756 Rolle Vorschlag ${i+1}`} value={d.role} onChange={(e:{target:{value:string}})=>{
        const role=e.target.value as VocalReviewEditV756['role'];
        update(i,{role,style:role==='hook'?'hook':role==='adlib'?'solo':d.style==='hook'?'solo':d.style,
         singerSlots:role==='hook'?[...new Set([d.leadSlot,d.partnerSlot])]:[d.leadSlot]});}}>
        <option value="verse">Lead / Verse</option><option value="feature">Feature</option><option value="hook">Hook</option><option value="adlib">Adlib</option>
       </select></label>
       {!isHook&&d.role!=='adlib'&&<label>Auftritt <select aria-label={`V756 Auftritt Vorschlag ${i+1}`} value={d.style} onChange={(e:{target:{value:string}})=>update(i,{style:e.target.value as 'solo'|'duet'})}>
        <option value="solo">Solo</option><option value="duet">Duett</option>
       </select></label>}
       <label>Lead-Avatar <select aria-label={`V756 Lead Vorschlag ${i+1}`} value={d.leadSlot} onChange={(e:{target:{value:string}})=>{
        const leadSlot=Number(e.target.value);
        update(i,{leadSlot,partnerSlot:d.partnerSlot===leadSlot?((leadSlot+1)%count):d.partnerSlot,
         singerSlots:isHook?[...new Set([...d.singerSlots.filter(s=>s!==d.leadSlot),leadSlot])]:[leadSlot]});}}>
        {Array.from({length:count},(_,n)=><option key={n} value={n}>Avatar {n+1}</option>)}
       </select></label>
       {isDuet&&<label>Duettpartner <select aria-label={`V756 Duettpartner Vorschlag ${i+1}`} value={d.partnerSlot} onChange={(e:{target:{value:string}})=>update(i,{partnerSlot:Number(e.target.value)})}>
        {Array.from({length:count},(_,n)=><option key={n} value={n}>Avatar {n+1}</option>)}
       </select></label>}
      </div>
      {isHook&&<div><small>Hook-Sänger (Lead bleibt immer ausgewählt):</small><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
       {Array.from({length:count},(_,n)=><label key={n}><input type="checkbox" disabled={n===d.leadSlot} checked={d.singerSlots.includes(n)}
        onChange={(e:{target:{checked:boolean}})=>update(i,{singerSlots:e.target.checked?[...new Set([...d.singerSlots,n])].sort((a,b)=>a-b):d.singerSlots.filter(v=>v!==n)})}/>Avatar {n+1}</label>)}
      </div></div>}
      <small role="status">{review.status==='ready'?'✓ Freigabefähig':review.status==='conflict'?'⚠ Konflikt':'✕ Ungültig'} · {review.reason}</small>
      <button type="button" onClick={()=>setPreviewIndex(previewIndex===i?null:i)} aria-expanded={previewIndex===i}> {previewIndex===i?'Vorschau schließen':'Sängerrollen-Vorschau'}</button>
      {previewIndex===i&&<small>Nur Regie-Vorschau ohne Spotify-Sprung: {cue?.active?`Lead Avatar ${cue.leadSlot+1} · aktive Lippen-Avatare ${cue.singingSlots.map(s=>s+1).join(', ')} · ${cue.style}`:'Keine gültige Sängerzuordnung'}.</small>}
     </div>;
    })}
    {!report.proposals.length&&<small>Keine belegten Vorschläge gefunden. Nutze die manuelle Zeitachse oder setze ausdrückliche Vocal-Marker in synchronisierte Lyrics.</small>}
   </div>
   <label><input type="checkbox" checked={override} onChange={(e:{target:{checked:boolean}})=>setOverride(e.target.checked)}/>
    <strong> Bewusstes Ersetzen vorhandener überlappender Sänger-Zeitmarken erlauben</strong></label>
   <small>Ohne diese Freigabe werden Konflikte übersprungen. Mit Freigabe bleiben nicht überlappende Teile bestehender Zeitmarken erhalten; getrennte Adlibs werden geschützt. Manuelle V385-Lyrics-Rollen haben in der Live-Regie weiterhin Vorrang.</small>
   <button type="button" onClick={save} disabled={!selected.length||!trackId||track?.id!==trackId||selected.every(i=>reviews[i].status==='invalid')}>
    {selected.length} geprüfte Vorschläge ausdrücklich speichern und Zeitregie aktivieren
   </button>
   {message&&<p role="status">{message}</p>}
  </div>}
 </fieldset>;
}
