'use client';
import {LastFmInsightsV732} from '@/components/LastFmInsightsV732';
import {ExplorerBackupFileV732} from '@/components/ExplorerBackupFileV732';
import {exportFavoritesV731,importFavoritesV731} from '@/lib/lastfm-explorer-v731';
import {useEffect,useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import type {ExplorerSelectionV729} from '@/lib/lastfm-explorer-v729';
import {compareProfilesV730,compareYearsV730,explorerCsvV730,favoriteStorageKeyV730,parseFavoritesV730,profileRowsV730,selectionKeyV730,toggleFavoriteV730,yearMonthsV730,type ExplorerProfileV730,type ExplorerRangeV730} from '@/lib/lastfm-explorer-v730';

type Props={account:string;events:readonly LastFmEventV706[];selection:ExplorerSelectionV729|null;profile:ExplorerProfileV730|null;range:ExplorerRangeV730;rangeError:string|null;onSelect:(selection:ExplorerSelectionV729)=>void};
const label=(s:ExplorerSelectionV729)=>s.title===undefined?s.artist:`${s.title} · ${s.artist}`;
function download(rows:readonly (readonly (string|number)[])[],name:string){
 const url=URL.createObjectURL(new Blob([explorerCsvV730(rows)],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function LastFmExplorerToolsV730({account,events,selection,profile,range,rangeError,onSelect}:Props){
 const [favorites,setFavorites]=useState<ExplorerSelectionV729[]>([]),[loadedAccount,setLoadedAccount]=useState<string|null>(null),[storageError,setStorageError]=useState(''),[readFailed,setReadFailed]=useState(false),[status,setStatus]=useState('');
 const [backup,setBackup]=useState(''),[preview,setPreview]=useState<number|null>(null);
 function exportBackup(){try{const url=URL.createObjectURL(new Blob([exportFavoritesV731(favorites)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='sonic-favoriten-v731.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Favoriten-Backup heruntergeladen.');}catch{setStatus('Backup konnte nicht erstellt werden.');}}
 function applyBackup(){try{const next=importFavoritesV731(backup,favorites);window.localStorage.setItem(favoriteStorageKeyV730(account),JSON.stringify(next));setFavorites(next);setPreview(null);setBackup('');setStorageError('');setStatus('Favoriten zusammengeführt und gespeichert.');}catch(error){setStatus(error instanceof Error?error.message:'Import fehlgeschlagen.');}}
 const [a,setA]=useState<ExplorerSelectionV729|null>(null),[b,setB]=useState<ExplorerSelectionV729|null>(null);
 const [chosenYear,setChosenYear]=useState(''),[chosenA,setChosenA]=useState(''),[chosenB,setChosenB]=useState('');
 function load(){setFavorites([]);setReadFailed(false);setStorageError('');setStatus('');try{setFavorites(parseFavoritesV730(window.localStorage.getItem(favoriteStorageKeyV730(account))));}catch{setReadFailed(true);setStorageError('Favoriten konnten nicht gelesen werden. Vorhandene Daten werden nicht überschrieben.');}setLoadedAccount(account);}
 useEffect(()=>{load();setA(null);setB(null);},[account]);
 const ready=Boolean(account)&&loadedAccount===account;
 const marked=selection!==null&&ready&&favorites.some(s=>selectionKeyV730(s)===selectionKeyV730(selection));
 function toggle(s:ExplorerSelectionV729){
  if(!ready||readFailed)return;
  try{const next=toggleFavoriteV730(favorites,s);setFavorites(next);setStatus('');try{window.localStorage.setItem(favoriteStorageKeyV730(account),JSON.stringify(next));setStorageError('');setStatus('Favoriten gespeichert.');}catch{setStorageError('Speichern fehlgeschlagen. Die Änderung gilt nur für diese Sitzung.');}}catch(error){setStatus(error instanceof Error?error.message:'Profil konnte nicht gemerkt werden.');}
 }
 const comparison=useMemo(()=>a&&b?compareProfilesV730(events,a,b,range):null,[events,a,b,range]);
 const years=profile?.years.map(([year])=>year)??[];
 const pick=(chosen:string,fallback:number)=>years.includes(Number(chosen))?Number(chosen):fallback;
 const year=pick(chosenYear,years[0]??new Date().getFullYear()),yearA=pick(chosenA,years[1]??years[0]??year),yearB=pick(chosenB,years[0]??year);
 const annual=profile?compareYearsV730(profile,yearA,yearB):null;
 const monthly=profile?yearMonthsV730(profile,year):[];
 const monthMax=Math.max(1,...monthly.map(m=>m.plays));
 const yearOptions=years.map(y=><option value={y} key={y}>{y}</option>);
 function exportRows(rows:readonly (readonly (string|number)[])[],name:string){try{download(rows,name);setStatus('CSV-Download gestartet.');}catch{setStatus('CSV-Download konnte nicht gestartet werden.');}}
 return <div className="explorer-tools-v730"><LastFmInsightsV732 events={events} range={range} onSelect={onSelect}/>
  <section aria-label="Gemerkte Profile"><h5>Favoriten</h5><p>Bis zu 100 Künstler- und Songprofile, lokal für dieses Last.fm-Konto gespeichert.</p>
   {selection&&<button type="button" disabled={!ready||readFailed} aria-pressed={marked} onClick={()=>toggle(selection)}>{marked?'★ Favorit entfernen':'☆ Profil merken'}</button>}
   {storageError&&<p role="alert">{storageError} {readFailed&&<button type="button" onClick={load}>Erneut lesen</button>}</p>}
   {ready&&!readFailed&&(favorites.length?<ul className="explorer-favorites-v730">{favorites.map(s=><li key={selectionKeyV730(s)}><button type="button" onClick={()=>onSelect(s)}>{s.title===undefined?'Künstler: ':'Song: '}{label(s)}</button><button type="button" aria-label={`${label(s)} aus Favoriten entfernen`} onClick={()=>toggle(s)}>Entfernen</button></li>)}</ul>:<p>Noch keine Profile gemerkt.</p>)}
   <details><summary>Favoriten sichern und importieren</summary><p>Backup enthält nur Künstler-/Songfavoriten. Import ergänzt das aktuelle Konto, vorhandene Favoriten bleiben erhalten. Kein History-Backup.</p><button type="button" disabled={!ready||readFailed} onClick={exportBackup}>Favoriten-Backup herunterladen</button><ExplorerBackupFileV732 key={account} onText={text=>{setBackup(text);setPreview(null);}}/><label>Backup-JSON einfügen<textarea maxLength={200000} value={backup} onChange={(e:{target:{value:string}})=>{setBackup(e.target.value);setPreview(null);}}/></label><button type="button" disabled={!ready||readFailed||!backup} onClick={()=>{try{setPreview(importFavoritesV731(backup,favorites).length);setStatus('');}catch(error){setPreview(null);setStatus(error instanceof Error?error.message:'Ungültiges Backup.');}}}>Import prüfen</button>{preview!==null&&<p>Nach dem Zusammenführen: {preview} Favoriten. <button type="button" disabled={!ready||readFailed} onClick={applyBackup}>Favoriten zusammenführen</button></p>}</details>
  </section>
  {profile&&selection&&<section aria-label="Profilstatistiken vertiefen"><h5>Monatsverlauf und Jahresvergleich</h5><p>Alle Werte verwenden den gewählten Zeitraum. Null bedeutet: keine archivierten Scrobbles. Angebrochene Jahre und Archivlücken können den Vergleich beeinflussen.</p>
   {years.length>0?<><label>Monatsverlauf für das Jahr <select value={year} onChange={(e:{target:{value:string}})=>setChosenYear(e.target.value)}>{yearOptions}</select></label>
    <div className="explorer-months-v730">{monthly.map(m=><div key={m.month}><span>{m.month}</span><meter value={m.plays} min={0} max={monthMax} aria-label={`${m.month}: ${m.plays} Scrobbles`}/><strong>{m.plays}×</strong></div>)}</div>
    {years.length>=2&&annual?<><div className="explorer-controls-v729"><label>Jahr A <select value={yearA} onChange={(e:{target:{value:string}})=>setChosenA(e.target.value)}>{yearOptions}</select></label><label>Jahr B <select value={yearB} onChange={(e:{target:{value:string}})=>setChosenB(e.target.value)}>{yearOptions}</select></label></div>
     {yearA===yearB?<p>Wähle zwei unterschiedliche Jahre.</p>:<><p>{yearA}: {annual.playsA} · {yearB}: {annual.playsB} Scrobbles · Änderung B gegenüber A: {annual.delta>0?'+':''}{annual.delta}{annual.percent===null?' · Prozentwert ohne Ausgangswert nicht berechenbar':` (${annual.percent>0?'+':''}${annual.percent.toFixed(1)} %)`}</p><div className="explorer-table-v730"><table><caption>Monatsvergleich {yearA} und {yearB}</caption><thead><tr><th>Monat</th><th>{yearA}</th><th>{yearB}</th></tr></thead><tbody>{annual.months.map(m=><tr key={m.month}><th>{m.month}</th><td>{m.a}</td><td>{m.b}</td></tr>)}</tbody></table></div></>}
    </>:<p>Für einen Jahresvergleich werden mindestens zwei erfasste Kalenderjahre im gewählten Zeitraum benötigt.</p>}
   </>:<p>Keine Jahres- oder Monatsdaten in dieser Auswahl.</p>}
   <button type="button" disabled={Boolean(rangeError)||!profile.plays} onClick={()=>exportRows(profileRowsV730(profile,range),'sonic-v730-profilstatistiken.csv')}>Profilstatistiken als CSV</button>
  </section>}
  <section aria-label="Zwei Profile vergleichen"><h5>Profile vergleichen</h5><p>Öffne ein Profil und übernimm es als A. Öffne anschließend ein anderes Profil und übernimm es als B. Verglichen werden zwei Künstler oder zwei Songs im selben Zeitraum.</p>
   <div className="explorer-controls-v729"><button type="button" disabled={!selection} onClick={()=>setA(selection)}>Aktuelles Profil als A</button><button type="button" disabled={!selection} onClick={()=>setB(selection)}>Aktuelles Profil als B</button><button type="button" disabled={!a&&!b} onClick={()=>{setA(null);setB(null);}}>Vergleich zurücksetzen</button></div>
   <p>A: {a?label(a):'Noch nicht gewählt'} · B: {b?label(b):'Noch nicht gewählt'}</p>
   {comparison?.error&&<p role="status">{comparison.error}</p>}
   {comparison?.a&&comparison.b&&<><div className="explorer-table-v730"><table><caption>Profilvergleich im gewählten Zeitraum</caption><thead><tr><th>Kennzahl</th><th>A: {label(comparison.a.selection)}</th><th>B: {label(comparison.b.selection)}</th></tr></thead><tbody>
    <tr><th>Scrobbles</th><td>{comparison.a.plays}</td><td>{comparison.b.plays}</td></tr><tr><th>Verschiedene Songs</th><td>{comparison.a.topSongs.length}</td><td>{comparison.b.topSongs.length}</td></tr><tr><th>Erfasste Jahre</th><td>{comparison.a.years.length}</td><td>{comparison.b.years.length}</td></tr><tr><th>Wiederentdeckungen</th><td>{comparison.a.rediscoveries.length}</td><td>{comparison.b.rediscoveries.length}</td></tr>
   </tbody></table></div><p>Differenz B − A: {comparison.delta} Scrobbles · An {comparison.sharedDays} lokalen Kalendertagen sind beide Profile erfasst.</p><p>Gleiche Tage bedeuten keine gleichzeitige Wiedergabe. Die Profile sind anhand der vorhandenen Archivdaten verglichen, nicht nach Hörminuten oder musikalischer Ähnlichkeit.</p>
    <button type="button" onClick={()=>{if(comparison.a&&comparison.b){const rows=profileRowsV730(comparison.a,range);rows.push(...profileRowsV730(comparison.b,range).slice(1));rows.push(['Vergleich','','',range.from,range.to,'Gemeinsame lokale Tage','',comparison.sharedDays],['Vergleich','','',range.from,range.to,'Scrobble-Differenz B minus A','',comparison.delta]);exportRows(rows,'sonic-v730-profilvergleich.csv');}}}>Vergleich als CSV</button>
   </>}
  </section>
  {status&&<p role="status">{status}</p>}
 </div>;
}
