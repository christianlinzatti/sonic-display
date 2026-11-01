"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import type {RecentTrackV672} from '@/lib/recently-played-v672';
import {ListeningHistoryExplorerV855} from '@/components/ListeningHistoryExplorerV855';
import {V702_CHANGE_EVENT,V702_STATUS_EVENT,readAutoHistoryConsentV702,setAutoHistoryConsentV702,readAutoHistoryStatusV702,removeAutoHistoryStatusV702,type V702SyncStatus} from '@/lib/automatic-listening-history-v702';
import {V701_MAX_EVENTS,V701_MAX_JSON_CHARS,validArchiveOwnerV701,newArchiveV701,mergeArchiveV701,readArchiveV701,writeArchiveV701,removeArchiveV701,parseArchiveJSONV701,exportArchiveJSONV701,archiveSummaryV701,type V701Archive,type V701Period} from '@/lib/persistent-listening-history-v701';

/** Opt-in archive, strictly tied to Spotify /me identity. No background polling or server writes. */
export function PersistentListeningHistoryPanelV701({loaded,active}:{loaded:ReadonlyArray<RecentTrackV672>;active:boolean}){
 const [owner,setOwner]=useState<string|null>(null);
 const [archive,setArchive]=useState<V701Archive|null>(null);
 const archiveRef=useRef<V701Archive|null>(null);
 const [ready,setReady]=useState(false);
 const [corrupt,setCorrupt]=useState(false);
 const [autoEnabled,setAutoEnabled]=useState(false);
 const [autoStatus,setAutoStatus]=useState<V702SyncStatus|null>(null);
 const [message,setMessage]=useState('');
 const [period,setPeriod]=useState<V701Period>('all');
 const fileInput=useRef<HTMLInputElement|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  const open=async()=>{
   try{
    const response=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error('Spotify-Konto derzeit nicht prüfbar. Lokales Archiv bleibt geschützt.');
    const data=await response.json() as {spotifyUserId?:unknown};
    if(!validArchiveOwnerV701(data.spotifyUserId))throw new Error('Spotify-Konto konnte nicht zugeordnet werden.');
    if(controller.signal.aborted)return;
    const found=readArchiveV701(window.localStorage,data.spotifyUserId);
    archiveRef.current=found.archive;setArchive(found.archive);setCorrupt(!!found.error);
    const consent=readAutoHistoryConsentV702(window.localStorage,data.spotifyUserId);
    setAutoEnabled(!!found.archive&&!found.error&&consent.enabled);
    setAutoStatus(readAutoHistoryStatusV702(window.localStorage,data.spotifyUserId));
    if(consent.error)setMessage(consent.error);
    if(found.error)setMessage(found.error);
    setOwner(data.spotifyUserId);
   }catch(error){if(!controller.signal.aborted)setMessage(error instanceof Error?error.message:'Konto-Zuordnung fehlgeschlagen.');}
   finally{if(!controller.signal.aborted)setReady(true);}
  };void open();return()=>controller.abort();
 },[]);
 const save=(candidate:V701Archive,trimmed=0)=>{
  const result=writeArchiveV701(window.localStorage,candidate);
  if(!result.archive){setMessage(result.error??'Speichern fehlgeschlagen.');return false;}
  archiveRef.current=result.archive;setArchive(result.archive);
  setMessage(`${result.archive.events.length} Wiedergaben gespeichert.${trimmed?` Achtung: ${trimmed} älteste Einträge wegen des Limits verworfen.`:''}`);
  return true;
 };
 useEffect(()=>{
  if(!owner||!archiveRef.current||!autoEnabled||!loaded.length||corrupt)return;
  const merged=mergeArchiveV701(archiveRef.current,loaded);
  if(merged.added>0)save(merged.archive,merged.trimmed);
 },[loaded,owner,corrupt,autoEnabled]);
 const toggleAuto=()=>{
  if(!owner||corrupt||!archiveRef.current)return;
  const next=!autoEnabled;
  if(!setAutoHistoryConsentV702(window.localStorage,owner,next)){setMessage('Automatische Sicherung konnte nicht umgeschaltet werden.');return;}
  setAutoEnabled(next);setMessage(next?'Automatische Sicherung aktiviert: nur während Sonic Display geöffnet und der Tab aktiv ist.':'Automatische Sicherung deaktiviert. Manuelles Speichern bleibt möglich.');
  window.dispatchEvent(new Event(V702_CHANGE_EVENT));
 };
 useEffect(()=>{
  if(!owner)return;
  const onUpdate=()=>{setAutoStatus(readAutoHistoryStatusV702(window.localStorage,owner));setAutoEnabled(readAutoHistoryConsentV702(window.localStorage,owner).enabled);const latest=readArchiveV701(window.localStorage,owner);if(latest.archive&&!latest.error){archiveRef.current=latest.archive;setArchive(latest.archive);}};
  const onStorage=(event:StorageEvent)=>{if(event.key===null||event.key?.includes(encodeURIComponent(owner)))onUpdate();};
  window.addEventListener(V702_STATUS_EVENT,onUpdate);window.addEventListener('storage',onStorage);
  return()=>{window.removeEventListener(V702_STATUS_EVENT,onUpdate);window.removeEventListener('storage',onStorage);};
 },[owner]);
 const activate=()=>{
  if(!owner||corrupt)return;
  const base=archiveRef.current??newArchiveV701(owner);
  const merged=mergeArchiveV701(base,loaded);
  save(merged.archive,merged.trimmed);
 };
 const importFile=async(file:File|undefined)=>{
  if(!owner||corrupt||!file)return;
  if(file.size>V701_MAX_JSON_CHARS){setMessage('Import abgelehnt: JSON-Datei zu groß.');return;}
  try{
   const parsed=parseArchiveJSONV701(await file.text(),owner);
   const merged=mergeArchiveV701(archiveRef.current??newArchiveV701(owner),parsed.events);
   save(merged.archive,merged.trimmed);
  }catch(error){setMessage(error instanceof Error?error.message:'Import abgelehnt; vorhandene Daten unverändert.');}
 };
 const download=()=>{
  if(!archive)return;
  const url=URL.createObjectURL(new Blob([exportArchiveJSONV701(archive)],{type:'application/json;charset=utf-8'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-display-hoerarchiv-v701.json';document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),10000);
 };
 const clear=()=>{
  if(!owner||!window.confirm('Dieses lokale Spotify-Hörarchiv auf diesem Gerät endgültig löschen? Vorher gegebenenfalls JSON exportieren.'))return;
  if(!setAutoHistoryConsentV702(window.localStorage,owner,false)){setMessage('Automatische Einstellung konnte nicht deaktiviert werden; Löschung abgebrochen.');return;}
  window.dispatchEvent(new Event(V702_CHANGE_EVENT));
  if(removeArchiveV701(window.localStorage,owner)){
   removeAutoHistoryStatusV702(window.localStorage,owner);setAutoEnabled(false);setAutoStatus(null);
   archiveRef.current=null;setArchive(null);setCorrupt(false);setMessage('Lokales Hörarchiv gelöscht und Aufzeichnung deaktiviert.');
  }else setMessage('Lokales Archiv konnte nicht gelöscht werden.');
 };
 const summary=useMemo(()=>archive?archiveSummaryV701(archive,period):null,[archive,period]);
 return <section hidden={!active} className="personal-history-v701" aria-label="Dauerhaftes persönliches Hörarchiv">
  <header><span className="recent-insight-kicker-v673">V701 / PERSÖNLICHES ARCHIV</span><h3>Deine Musik über längere Zeit<span>.</span></h3><p>Deine geladenen Spotify-Wiedergaben bleiben auf Wunsch im Browser gespeichert, getrennt nach Spotify-Konto.</p></header>
  <p role="status" aria-live="polite">{message||(!ready?'Spotify-Konto wird zugeordnet …':!owner?'Konto nicht verfügbar':archive?'Archiv aktiv · neue geladene Seiten werden beim Öffnen übernommen':'Archiv noch nicht aktiviert')}</p>
  <div className="personal-history-actions-v701">
   {!archive&&<button type="button" disabled={!ready||!owner||corrupt} onClick={activate}>Lokales Archiv aktivieren und {loaded.length} geladene Einträge übernehmen</button>}
   {archive&&<button type="button" onClick={activate}>Geladene Einträge jetzt abgleichen</button>}
   {archive&&<button type="button" aria-pressed={autoEnabled} onClick={toggleAuto}>{autoEnabled?'Automatische Sicherung ausschalten':'Automatische Sicherung einschalten'}</button>}
   <button type="button" disabled={!archive} onClick={download}>JSON-Sicherung exportieren</button>
   <button type="button" disabled={!owner||corrupt} onClick={()=>fileInput.current?.click()}>JSON-Sicherung importieren</button>
   <button type="button" disabled={!owner||(!archive&&!corrupt)} onClick={clear}>Archiv löschen / deaktivieren</button>
   <input ref={fileInput} type="file" accept=".json,application/json" className="recent-sr-v672" onChange={(e:{target:{files:FileList|null;value:string}})=>{void importFile(e.target.files?.[0]);e.target.value='';}} aria-label="Archivdatei auswählen"/>
  </div>
  {archive&&<p className="personal-history-note-v701" role="status">V702 · Automatik: <strong>{autoEnabled?'EIN':'AUS'}</strong> · Bei aktivem Tab maximal alle 3 Minuten eine Spotify-Verlauf-Abfrage. {autoStatus?`Letzter erfolgreicher Abgleich: ${new Date(autoStatus.at).toLocaleString('de-AT')} · ${autoStatus.added} neue Einträge.`:'Noch kein erfolgreicher automatischer Abgleich.'} Keine Überwachung bei geschlossenem Browser.</p>}
  <p className="personal-history-note-v701">{archive?.events.length??0} von maximal {V701_MAX_EVENTS} Wiedergabeereignissen gespeichert. Manuell sicherbar; automatische Übernahme nur nach zusätzlicher aktiver Einwilligung. Kein Tracking bei geschlossener App und kein Server-Speicher.</p>
  <label className="personal-history-period-v701">Statistik für <select value={period} onChange={(e:{target:{value:string}})=>setPeriod(e.target.value as V701Period)}><option value="month">Diesen Monat</option><option value="year">Dieses Jahr</option><option value="all">Gesamtes Archiv</option></select></label>
  {summary&&<>
   <div className="personal-history-metrics-v701"><div><strong>{summary.plays}</strong><span>Gespeicherte Wiedergaben</span></div><div><strong>{summary.uniqueSongs}</strong><span>Verschiedene Songs</span></div><div><strong>{summary.activeDays}</strong><span>Hörtage mit Ereignissen</span></div></div>
   <div className="personal-history-columns-v701"><section><h4>Oft wiedergehörte Songs</h4>{summary.topSongs.length?<ol>{summary.topSongs.map(song=><li key={song.id}><span>{song.title}<small>{song.artist}</small></span><b>{song.plays}×</b></li>)}</ol>:<p>Für diesen Zeitraum sind noch keine Wiedergaben gespeichert.</p>}</section><section><h4>Künstler-Credits</h4><ol>{summary.topArtists.map(([artist,count])=><li key={artist}><span>{artist}</span><b>{count}×</b></li>)}</ol></section></div>
   <section className="personal-history-months-v701"><h4>Monatliche Entwicklung</h4>{summary.months.length?<div>{summary.months.map(([month,count])=><span key={month}><b>{month}</b><strong>{count}×</strong></span>)}</div>:<p>Keine Monatsdaten in diesem Zeitraum.</p>}</section>
  </>}
  {archive&&<ListeningHistoryExplorerV855 events={archive.events}/>}
  <p className="personal-history-note-v701">Der lokale Speicher ist weder verschlüsselt noch zwischen Geräten synchronisiert. Auf gemeinsam verwendeten Browserprofilen könnten andere Personen mit Gerätezugriff die Daten einsehen. Für einen Gerätewechsel JSON sichern und im selben Spotify-Konto importieren. Spotify bietet hier keinen vollständigen historischen Rückblick; die Zahlen sind erfasste Wiedergabeereignisse, keine Hörminuten.</p>
 </section>;
}
