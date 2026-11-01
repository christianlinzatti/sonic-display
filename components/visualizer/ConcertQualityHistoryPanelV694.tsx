'use client';
import {useState} from 'react';
import {compareV693Snapshots,type V693Progress} from './concertQualityImprovementV693';
import {encodeV694Archive,V694_MAX_JSON_LENGTH,type V694Archive} from './concertQualityHistoryV694';

const date=(at:number)=>new Date(at).toLocaleString('de-AT');
const delta=(v:number|null,unit='')=>v===null?'keine vergleichbare Messung':`${v>0?'+':''}${v.toFixed(1)}${unit}`;
const changeLabel={
 'hinweis-nicht-wiederholt':'Warnung in späterer Probe nicht wiederholt',
 'neuer-hinweis':'Neue Warnung in späterer Probe',
 'weiter-pruefen':'Weiter prüfen',
 'nicht-vergleichbar':'Ohne vergleichbare Belege',
} as const;
export function ConcertQualityHistoryPanelV694({archive,available,notice,onArchive,onDelete,onReplace,onClear,onProgress}: {
 archive:V694Archive;available:boolean;notice:string;
 onArchive:()=>void;onDelete:(id:string)=>void;onReplace:(raw:string)=>void;onClear:()=>void;
 onProgress:(key:string,stage:V693Progress)=>void;
}){
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const selected=archive.entries.find(e=>e.id===selectedId)??archive.entries[0]??null;
 const result=selected?compareV693Snapshots(selected.before.snapshot,selected.after.snapshot):null;
 const older=selected?archive.entries.filter(e=>e.trackId===selected.trackId&&e.id!==selected.id&&e.archivedAt<=selected.archivedAt)
  .sort((a,b)=>b.archivedAt-a.archivedAt)[0]:null;
 const trend=selected&&older?compareV693Snapshots(older.after.snapshot,selected.after.snapshot):null;
 const exportFile=()=>{
  const raw=encodeV694Archive(archive);if(raw===null)return;
  const blob=new Blob([raw+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download='sonic-display-v694-qa-history.json';document.body.append(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const importFile=async(event:import('react').ChangeEvent<HTMLInputElement>)=>{
  const input=event.currentTarget,file=input.files?.[0];if(!file)return;
  if(file.size>V694_MAX_JSON_LENGTH*2){onReplace('');input.value='';return;}
  try{const raw=await file.text();if(window.confirm('Vorhandene QA-Historie durch diese geprüfte JSON-Sicherung ersetzen?'))onReplace(raw);}
  catch{onReplace('');/* Read failed; no change to archive. */}
  finally{input.value='';}
 };
 const saveAllowed=!!archive.before&&!!archive.after&&
  compareV693Snapshots(archive.before.snapshot,archive.after.snapshot).comparable;
 return <section className="v694-quality-history" aria-label="Dauerhafte Konzert-Qualitätshistorie">
  <strong>V694 · Dauerhafte Konzert-Qualitätshistorie</strong>
  <p>Im <b>Browser auf diesem Gerät</b> gespeichert. Manuelle Aufgabenstatus und ausgewählte Aufnahmen bleiben nach dem Schließen der QA-Ansicht erhalten. Kein Cloud-Sync und keine automatische Qualitätsfreigabe.</p>
  <p role="status">{notice||(!available?'Browser-Speicher nicht verfügbar – nur vorübergehend.':`${archive.entries.length} archivierte Vergleiche · Speicher lokal aktiv`)}</p>
  <div className="v694-actions">
   <button type="button" onClick={onArchive} disabled={!saveAllowed}>Aktuellen Vorher-/Nachher-Vergleich archivieren</button>
   <button type="button" onClick={exportFile} disabled={!encodeV694Archive(archive)}>QA-Historie als JSON sichern</button>
   <label>JSON-Sicherung importieren <input type="file" accept=".json,application/json" onChange={importFile}/></label>
   <button type="button" disabled={!archive.entries.length&&!archive.before&&!archive.after&&!Object.keys(archive.progress).length} onClick={()=>{
    if(window.confirm('Alle lokal gespeicherten QA-Aufgaben, Aufnahmen und Vergleiche löschen?'))onClear();
   }}>Lokale Historie löschen</button>
  </div>
  <p><small>Gespeichert werden nur zusammengefasste Messwerte, Prüfhinweise, Zeitmarken, manuelle Bearbeitungsstände und Release-Nummern. Keine Audio-/Videodaten, Lyrics oder Rohstichproben. Für andere Geräte JSON exportieren und dort importieren.</small></p>
  {Object.keys(archive.progress).length>0&&<details className="v694-saved-tasks">
   <summary>Gespeicherte Aufgabenstatus ({Object.keys(archive.progress).length})</summary>
   <ol>{Object.entries(archive.progress).slice(-100).map(([key,stage])=><li key={key}>
    <code>{key}</code><select aria-label={`Gespeicherter Aufgabenstatus ${key}`} value={stage} onChange={e=>onProgress(key,e.target.value as V693Progress)}>
     <option value="offen">Offen</option><option value="in-arbeit">In Prüfung</option><option value="manuell-geprueft">Von mir geprüft</option>
    </select>
   </li>)}</ol><p><small>Historische Aufgaben werden nur auf deinen Klick geändert; „geprüft“ ist keine bestätigte Fehlerbehebung.</small></p>
  </details>}
  {archive.entries.length>0&&<div className="v694-history-layout">
   <div><b>Archivierte Prüfungen</b><ol>{archive.entries.map(entry=><li key={entry.id}>
    <button type="button" className={selected?.id===entry.id?'v694-selected':''} aria-pressed={selected?.id===entry.id} onClick={()=>setSelectedId(entry.id)}>
     {date(entry.archivedAt)} · {entry.before.release} → {entry.after.release} · Song {entry.trackId.slice(0,32)}
    </button>
   </li>)}</ol></div>
   {selected&&result&&<section className="v694-history-detail" aria-label="Archivierter Qualitätsvergleich">
    <b>{date(selected.archivedAt)} · {selected.before.release} → {selected.after.release}</b>
    <p>Song-ID: <code>{selected.trackId}</code></p>
    <p>Vorher {selected.before.snapshot.samples} Messpunkte ({selected.before.snapshot.coveragePercent.toFixed(1)} %); Nachher {selected.after.snapshot.samples} Messpunkte ({selected.after.snapshot.coveragePercent.toFixed(1)} %).</p>
    <p>{result.comparable?'Eingeschränkt vergleichbare Messungen':'Nicht vergleichbar'}: {result.reason}</p>
    {result.comparable&&<><ul>{result.rows.map(row=><li key={row.id}><b>{row.title}:</b> {changeLabel[row.change]}{row.afterAtMs!==null?` · ${Math.floor(row.afterAtMs/60000)}:${String(Math.floor(row.afterAtMs/1000)%60).padStart(2,'0')}`:''}</li>)}</ul>
     <p>FPS-Medianänderung: {delta(result.fpsDelta)} · P95-Framezeitänderung: {delta(result.p95DeltaMs,' ms')}</p>
    </>}
    <b>Manuelle Status bei Archivierung</b>
    <ul>{Object.entries(selected.progress).map(([key,stage])=><li key={key}>{key.slice(key.lastIndexOf(':')+1)}: {stage}</li>)}</ul>
    {trend&&<p><b>Vergleich über Releases:</b> {older!.after.release} → {selected.after.release} · {trend.comparable?`FPS ${delta(trend.fpsDelta)}, P95 ${delta(trend.p95DeltaMs,' ms')}. Warnungen dienen nur als Prüfhinweise.`:trend.reason}</p>}
    <button type="button" onClick={()=>{if(window.confirm('Diesen archivierten QA-Vergleich löschen?'))onDelete(selected.id);}}>Diesen Vergleich löschen</button>
    <p><small>Weder ein verschwundener Warnhinweis noch „Von mir geprüft“ bedeutet automatisch „behoben“.</small></p>
   </section>}
  </div>}
  {archive.entries.length===0&&<p>Noch keine archivierten Vergleiche. Erst zwei geeignete Aufnahmen als Vorher/Nachher wählen und dann ausdrücklich archivieren.</p>}
 </section>;
}
