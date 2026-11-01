'use client';
/** V765 – library management; V354 is the only show playback owner. */
import {useEffect,useState} from 'react';
import {CONCERT_LIBRARY_EVENT_V764,readConcertLibraryV764} from '../../services/stageContent/concertTimelineAutomationV764';
import {MAX_CONCERT_IMPORT_BYTES_V765,exportConcertSongV765,importConcertLibraryV765,
 previewConcertImportV765,renameConcertSongV765,searchConcertSongsV765,
 type ConcertImportModeV765,type ConcertSortV765} from '../../services/stageContent/concertShowLibraryStudioV765';
function downloadJson(text:string,filename:string){
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=filename;a.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function ConcertShowLibraryStudioV765(){
 const [library,setLibrary]=useState(readConcertLibraryV764);
 const [query,setQuery]=useState('');
 const [sort,setSort]=useState<ConcertSortV765>('name');
 const [editing,setEditing]=useState('');
 const [renamed,setRenamed]=useState('');
 const [importText,setImportText]=useState('');
 const [mode,setMode]=useState<ConcertImportModeV765>('skip');
 const [message,setMessage]=useState('');
 const [fileName,setFileName]=useState('');
 useEffect(()=>{const sync=()=>setLibrary(readConcertLibraryV764());
  window.addEventListener(CONCERT_LIBRARY_EVENT_V764,sync);
  return()=>window.removeEventListener(CONCERT_LIBRARY_EVENT_V764,sync);},[]);
 const songs=searchConcertSongsV765(library,query,sort);
 const preview=importText?previewConcertImportV765(importText,library,mode):null;
 const rename=(id:string,oldName:string)=>{
  const success=renameConcertSongV765(id,renamed,oldName);
  setMessage(success?'Show-Name in der Bibliothek geändert. Die laufende Show bleibt unverändert.':
   'Umbenennen fehlgeschlagen: Eintrag verändert, ungültiger Name oder Speicherfehler.');
  if(success){setEditing('');setRenamed('');}
 };
 const importFile=async(file:File|undefined)=>{
  setImportText('');setMessage('');setFileName('');
  if(!file)return;
  if(file.size>MAX_CONCERT_IMPORT_BYTES_V765){setMessage('Datei zu groß (maximal 4 MB).');return;}
  try{const value=await file.text();if(value.length>MAX_CONCERT_IMPORT_BYTES_V765){setMessage('Datei zu groß.');return;}
   setImportText(value);setFileName(file.name);
  }catch{setMessage('JSON-Datei konnte nicht gelesen werden.');}
 };
 const commit=()=>{
  if(!preview||!preview.valid){setMessage('Import nicht möglich: erst eine gültige Vorschau prüfen.');return;}
  if(preview.wouldReplace>0&&!window.confirm(`${preview.wouldReplace} vorhandene Songshows in der Bibliothek ersetzen? Die aktive V354-Show bleibt geöffnet. Bitte zuvor ein vollständiges Backup exportieren.`))return;
  if(!window.confirm(`Geprüften Import durchführen? ${preview.newEntries} neue, ${preview.wouldReplace} zu ersetzende und ${preview.wouldSkip} unveränderte/übersprungene Shows. Die Songwechsel-Automatik bleibt unverändert.`))return;
  const result=importConcertLibraryV765(importText,mode,preview.baseline);
  setMessage(result.ok?`Import abgeschlossen: ${result.added} hinzugefügt, ${result.replaced} ersetzt, ${result.skipped} übersprungen.`:
   `Import sicher abgebrochen (${result.reason}). Bitte die Vorschau erneut prüfen.`);
  setImportText('');setFileName('');
 };
 return <fieldset className="concert-show-library-studio-v765"><legend>V765 · Concert Show Library Studio</legend>
  <p>Gespeicherte Songshows durchsuchen, umbenennen und einzeln exportieren. JSON-Importe werden vor dem Übernehmen geprüft; bestehende Cues und Live-Wiedergabe bleiben geschützt.</p>
  {!library?<p role="alert">Bibliothek nicht lesbar. Keine Änderungen möglich – vorhandene Browserdaten werden nicht ersetzt.</p>:<>
   <p><strong>{library.entries.length}/32 Shows</strong> · Automatisches Laden: {library.autoLoad?'aktiv':'aus'} · browserlokale Speicherung.</p>
   <label>Show suchen <input aria-label="Gespeicherte Shows durchsuchen" value={query} onChange={(e:{target:{value:string}})=>setQuery(e.target.value)} placeholder="Name oder Song-ID"/></label>{' '}
   <label>Sortieren <select value={sort} onChange={(e:{target:{value:string}})=>setSort(e.target.value as ConcertSortV765)}>
    <option value="name">Name</option><option value="cues">Meiste Cues</option><option value="duration">Längster Song</option>
   </select></label>
   <div style={{maxHeight:230,overflowY:'auto',marginTop:8}} aria-label="Durchsuchbare Konzertshow-Bibliothek">
    {songs.length===0&&<p>Keine passenden Songshows gefunden.</p>}
    {songs.map(song=><div key={song.trackId} style={{padding:'6px 0',borderBottom:'1px solid #405064'}}>
     <strong>{song.name}</strong> · {song.clips.length} Cues · {Math.round(song.durationMs/1000)} s · <code>{song.trackId}</code>{' '}
     <button type="button" onClick={()=>{setEditing(song.trackId);setRenamed(song.name);}}>Umbenennen</button>{' '}
     <button type="button" onClick={()=>{const text=exportConcertSongV765(song.trackId,library);
      if(text)downloadJson(text,`sonic-show-${song.trackId.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,60)}.json`);}}>Einzeln exportieren</button>
     {editing===song.trackId&&<div><label>Neuer Show-Name <input maxLength={60} value={renamed}
       onChange={(e:{target:{value:string}})=>setRenamed(e.target.value)}/></label>{' '}
       <button type="button" disabled={!renamed.trim()||renamed.trim().length>60} onClick={()=>rename(song.trackId,song.name)}>Speichern</button>{' '}
       <button type="button" onClick={()=>setEditing('')}>Abbrechen</button></div>}
    </div>)}
   </div>
   <p><strong>Songshows aus JSON importieren</strong> · V764-Bibliotheksexport oder V765-Einzelexport; bis 4 MB.</p>
   <label>JSON-Datei auswählen <input type="file" accept=".json,application/json" onChange={(e:{target:{files:FileList|null;value:string}})=>{
    void importFile(e.target.files?.[0]);e.target.value='';}}/></label>
   {preview&&<div aria-label="Importvorschau">
    <p><strong>Importvorschau:</strong> {fileName} · {preview.incoming} Shows · {preview.newEntries} neu · {preview.conflicts} Konflikte · {preview.unchanged} identisch</p>
    <label>Konflikte behandeln <select value={mode} onChange={(e:{target:{value:string}})=>setMode(e.target.value as ConcertImportModeV765)}>
     <option value="skip">Vorhandene Shows schützen / überspringen</option>
     <option value="replace">Vorhandene Shows nach Bestätigung ersetzen</option>
    </select></label>
    {!preview.valid?<p role="alert">Import blockiert: {preview.reason}. Frei: {preview.availableSlots} Plätze.</p>:<>
     <p>Ergebnis: {preview.newEntries} neue · {preview.wouldReplace} ersetzt · {preview.wouldSkip} übersprungen. Automatisches Laden wird nicht aus der Datei übernommen.</p>
     <div style={{maxHeight:150,overflowY:'auto'}}>{preview.entries.map(song=><div key={song.trackId}>
      {song.name} · {song.clips} Cues · {song.identical?'identisch':song.conflict?'Konflikt':'neu'}
     </div>)}</div>
     <button type="button" onClick={commit}>Geprüften Bibliotheksimport ausdrücklich bestätigen</button>
    </>}
    <button type="button" onClick={()=>{setImportText('');setFileName('');}}>Import verwerfen</button>
   </div>}
   <p><small>Vorsicht: Bei „Ersetzen“ ändern sich nur Einträge in der V764-Bibliothek, niemals die derzeit geöffnete V354-Show. Vor einem Gerätewechsel die gesamte Bibliothek exportieren; localStorage wird nicht synchronisiert.</small></p>
  </>}
  {message&&<p role="status">{message}</p>}
 </fieldset>;
}
