'use client';
/** V764: explicit review/approval. The V354 editor remains the sole playback authority. */
import {useEffect,useState} from 'react';
import {ConcertShowLibraryStudioV765} from './ConcertShowLibraryStudioV765';
import {CONCERT_TIMELINE_EVENT_V763,getConcertTimelineV763} from './concertTimelineBridgeV763';
import {SHOW_TIMELINE_EVENT_V354,readTimelineV354,saveTimelineV354,
 type ShowValueV354,type ShowLaneV354} from '../../services/stageContent/showTimelineV354';
import {CONCERT_LIBRARY_EVENT_V764,readConcertLibraryV764,putConcertSongV764,
 loadConcertSongV764,deleteConcertSongV764,setConcertAutoLoadV764,
 createConcertSongV764,proposeConcertCuesV764,applyConcertSuggestionsV764,
 type SuggestedCueV764} from '../../services/stageContent/concertTimelineAutomationV764';
const labels:Record<ShowLaneV354,string>={camera:'Kamera',lighting:'Licht',dance:'Tanz',lyrics:'Lyrics',effects:'FX',photos:'Fotos'};
const choices:Record<string,readonly [string,string][]>= {
 camera:[['wide','Weitwinkel'],['medium','Halbtotale'],['close','Nahaufnahme'],['orbit','Orbit']],
 dance:[['solo','Solo'],['sync','Synchron'],['mirror','Spiegel'],['duet','Duett']],
 lyrics:[['focus','Hervorheben'],['normal','Normal']]};
const fmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function SmartConcertTimelineAutomationV764(){
 const [snapshot,setSnapshot]=useState(getConcertTimelineV763);
 const [score,setScore]=useState(readTimelineV354);
 const [library,setLibrary]=useState(readConcertLibraryV764);
 const [selected,setSelected]=useState<readonly string[]>([]);
 const [edits,setEdits]=useState<Record<string,ShowValueV354>>({});
 const [message,setMessage]=useState('');
 useEffect(()=>{const refresh=()=>setSnapshot(getConcertTimelineV763());
  window.addEventListener(CONCERT_TIMELINE_EVENT_V763,refresh);
  return()=>window.removeEventListener(CONCERT_TIMELINE_EVENT_V763,refresh);},[]);
 useEffect(()=>{const sync=()=>{setScore(readTimelineV354());setLibrary(readConcertLibraryV764());};
  window.addEventListener(SHOW_TIMELINE_EVENT_V354,sync);
  window.addEventListener(CONCERT_LIBRARY_EVENT_V764,sync);
  return()=>{window.removeEventListener(SHOW_TIMELINE_EVENT_V354,sync);
   window.removeEventListener(CONCERT_LIBRARY_EVENT_V764,sync);};},[]);
 useEffect(()=>{setSelected([]);setEdits({});setMessage('');},[snapshot?.trackId]);
 const ready=!!snapshot&&snapshot.trackId===score.trackId&&snapshot.durationMs===score.durationMs;
 const suggestions=proposeConcertCuesV764(snapshot);
 const pending=ready?applyConcertSuggestionsV764(score,snapshot,selected,edits):null;
 const toggle=(id:string,enabled:boolean)=>setSelected(prev=>enabled?[...prev.filter(x=>x!==id),id]:prev.filter(x=>x!==id));
 const chooseAll=()=>setSelected(suggestions.map(c=>c.clip.id));
 const apply=()=>{
  if(!ready||!pending||selected.length===0){setMessage('Bitte zuerst eine Song-Timeline und Vorschläge auswählen.');return;}
  if(pending.applied){saveTimelineV354(pending.score);setSelected([]);setEdits({});}
  setMessage(`${pending.applied} geprüfte Cues hinzugefügt; ${pending.conflicts} Überschneidungen übersprungen, ${pending.invalid} ungültige Einträge.`+
    ' Die Show bleibt gemäß der vorhandenen V354-Aktivierung gesteuert. Für die Bibliothek anschließend speichern.');
 };
 const save=()=>{
  if(!score.trackId){setMessage('Zuerst eine an einen Song gebundene Show erstellen.');return;}
  setMessage(putConcertSongV764(score)?'Show für diesen Song dauerhaft in der Bibliothek gesichert.':'Speichern fehlgeschlagen: Speicher voll, beschädigt oder Bibliotheksgrenze erreicht. Die aktuelle Show bleibt erhalten.');
 };
 const create=()=>{
  if(!snapshot)return;
  if(score.clips.length>0&&!window.confirm('Vorhandene Show wechseln? Sie wird zuerst in der V764-Bibliothek gesichert. Abbrechen lässt sie unverändert.'))return;
  setMessage(createConcertSongV764(snapshot.trackId,snapshot.durationMs)?'Neue Song-Timeline angelegt und bisherige Show zuvor gesichert.':'Wechsel abgebrochen: Die bisherige Show konnte nicht sicher in der Bibliothek gesichert werden.');
 };
 const load=(id:string)=>{
  if(score.trackId!==id||score.clips.length>0){if(!window.confirm('Gespeicherte Songshow laden? Der aktuell offene V354-Stand wird, soweit es ein anderer Song ist, zuerst in der Bibliothek gesichert. Bei derselben Song-ID werden lokale Änderungen durch die gespeicherte Version ersetzt.'))return;}
  const result=loadConcertSongV764(id);setMessage(result==='loaded'?`Gespeicherte Show geladen (${id}).`:`Laden nicht möglich: ${result}. Die bisherige Show bleibt bestehen.`);
 };
 const remove=(id:string)=>{
  if(!window.confirm('Gespeicherte Songshow aus der Bibliothek löschen? Die offene V354-Show wird nicht gelöscht.'))return;
  setMessage(deleteConcertSongV764(id)?'Bibliothekseintrag gelöscht.':'Löschen fehlgeschlagen.');
 };
 const exportAll=()=>{
  if(!library)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(library,null,2)],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-v764-song-library.json';anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const conflicts=suggestions.filter(s=>score.clips.some(c=>c.id===s.clip.id||c.lane===s.clip.lane&&
   c.startMs<s.clip.startMs+s.clip.durationMs&&s.clip.startMs<c.startMs+c.durationMs));
 return <><fieldset className="smart-concert-timeline-v764"><legend>V764 · Smart Concert Timeline Automation</legend>
  <p>Automatische <strong>Vorschläge</strong> aus verifizierten V761-Szenen prüfen, einzeln bearbeiten und erst nach Freigabe als echte V354-Cues übernehmen. Keine automatische Sänger- oder Beat-Erkennung.</p>
  {!library?<p role="alert">Die Songbibliothek kann nicht sicher gelesen werden. Bestehende Daten werden nicht überschrieben. Bitte zuerst eine vorhandene Sicherung prüfen.</p>:<>
   <p><strong>Mehrsong-Bibliothek:</strong> {library.entries.length}/32 gespeicherte Shows · Browser-localStorage · in portabler Sicherung enthalten.</p>
   <label><input type="checkbox" checked={library.autoLoad} onChange={(e:{target:{checked:boolean;value:string}})=>{
    setMessage(setConcertAutoLoadV764(e.target.checked)?e.target.checked?'Songwechsel-Automatik aktiviert. Vor einem Wechsel wird eine bisherige songgebundene Show gesichert.':'Automatisches Laden deaktiviert.':'Die Einstellung konnte nicht gesichert werden.');
   }}/> Gespeicherte Show beim echten Songwechsel automatisch laden (freiwillig)</label>
   <p><small>Ohne Aktivierung bleibt der bisherige V354-Playbackpfad unverändert. Mit Aktivierung wird der alte songgebundene Stand vor einem Wechsel gesichert. Bei Speicherfehlern wird nichts ersetzt.</small></p>
   <button type="button" onClick={save} disabled={!score.trackId}>Offene Songshow in Bibliothek speichern</button>{' '}
   <button type="button" onClick={exportAll} disabled={!library.entries.length}>Bibliothek als JSON exportieren</button>
   {library.entries.length>0&&<div style={{maxHeight:190,overflowY:'auto',marginTop:8}} aria-label="Gespeicherte Songshows">
    {library.entries.map(s=><div key={s.trackId} style={{padding:'5px 2px',borderBottom:'1px solid #405064'}}>
     <strong>{s.name}</strong> · {s.clips.length} Cues · {fmt(s.durationMs)} · <code>{s.trackId}</code>{' '}
     <button type="button" onClick={()=>load(s.trackId)}>Laden</button>{' '}
     <button type="button" onClick={()=>remove(s.trackId)}>Löschen</button>
    </div>)}
   </div>}
  </>}
  {!snapshot?<p role="status">Songdaten fehlen. Die Bibliothek bleibt auch ohne laufende Musik nutzbar.</p>:<>
   <p>Aktueller Song: <code>{snapshot.trackId}</code> · {fmt(snapshot.durationMs)} · {suggestions.length} prüfbare Vorschläge.</p>
   {!ready&&<><p>Es ist keine passende V354-Timeline für diesen Song geöffnet. Vorhandene Shows werden beim Anlegen zuerst gesichert.</p>
    <button type="button" onClick={create} disabled={!library}>Song-Timeline sicher anlegen</button></>}
   {ready&&suggestions.length>0&&<>
    <p><strong>Vorschläge prüfen</strong> · {conflicts.length} überlappen vorhandene manuelle Cues. Diese werden beim Import automatisch übersprungen.</p>
    <button type="button" onClick={chooseAll}>Alle Vorschläge markieren</button>{' '}
    <button type="button" onClick={()=>setSelected([])}>Auswahl aufheben</button>
    <div style={{maxHeight:330,overflowY:'auto',margin:'8px 0'}} aria-label="Automatische Cue-Vorschläge">
     {suggestions.map(({clip,section,intent,reason}:SuggestedCueV764)=>{
      const conflict=conflicts.some(c=>c.clip.id===clip.id);
      return <div key={clip.id} style={{padding:'5px 3px',borderBottom:'1px solid #405064'}}>
       <label><input type="checkbox" checked={selected.includes(clip.id)} onChange={(e:{target:{checked:boolean;value:string}})=>toggle(clip.id,e.target.checked)}/>
        <strong>{labels[clip.lane]}</strong> · {fmt(clip.startMs)} – {fmt(clip.startMs+clip.durationMs)} · {section}/{intent}
       </label>
       {conflict&&<strong> · Überschneidung – geschützt</strong>}
       <div><small>{reason}</small></div>
       <label>Vorgeschlagene Aktion: {' '}
        {choices[clip.lane]?<select value={String(edits[clip.id]??clip.value)}
         onChange={(e:{target:{checked:boolean;value:string}})=>setEdits(prev=>({...prev,[clip.id]:e.target.value}))}>
          {choices[clip.lane].map(([v,label])=><option value={v} key={v}>{label}</option>)}
         </select>:<input type="number" min="0.25" max="1.8" step="0.05" value={Number(edits[clip.id]??clip.value)}
         onChange={(e:{target:{checked:boolean;value:string}})=>{const n=Number(e.target.value);if(Number.isFinite(n))setEdits(prev=>({...prev,[clip.id]:n}));}}/>}
       </label>
      </div>;
     })}
    </div>
    <p>Auswahl: {selected.length} · übernehmbar: {pending?.applied??0} · geschützt: {pending?.conflicts??0}</p>
    <button type="button" disabled={!selected.length||!pending?.applied} onClick={apply}>Geprüfte Cues ausdrücklich übernehmen</button>
    <p><small>Nach dem Übernehmen lassen sich Start, Dauer und Aktion im V763-Editor frei nachbearbeiten. Bereits vorhandene manuelle Cues bleiben bestehen. Die Bibliothek wird über „Speichern“ aktualisiert.</small></p>
   </>}
   {ready&&!suggestions.length&&<p>Keine verifizierten V761-Szenen. Es werden keine künstlichen Songabschnitte erfunden; manuelle Bearbeitung bleibt möglich.</p>}
  </>}
  {message&&<p role="status">{message}</p>}
 </fieldset><ConcertShowLibraryStudioV765/></>;
}
