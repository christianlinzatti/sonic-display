'use client';
import {useState,useSyncExternalStore} from 'react';
import {subscribeCastV830,getCastV830,getCastServerV830,resetCastV830,productionReadinessV830} from './concertProductionEvidenceV830';
import {ACCEPTANCE_GENRES_V829,ACCEPTANCE_COUNTS_V829,ACCEPTANCE_REVIEWS_V829,
 acceptanceKeyV829,acceptanceVerdictV829,acceptanceFpsV829,acceptanceSlowShareV829,
 acceptanceReportV829,beginAcceptanceV829,endAcceptanceV829,clearAcceptanceV829,markAcceptanceReviewV829,
 subscribeAcceptanceV829,getAcceptanceV829,getAcceptanceServerV829} from './concertAcceptanceV829';
import type {AcceptanceGenreV829,AcceptanceCountV829,AcceptanceDecisionV829} from './concertAcceptanceV829';
const labels:Record<AcceptanceGenreV829,string>={rap:'Deutschrap',hardtekk:'Hardtekk',rock:'Deutschrock / NDH'};
const aspects={lyrics:'Lyrics-Lesbarkeit',lipSync:'Mund-/Gesangssynchronität',camera:'Kamera und Bildausschnitt',
 choreography:'Natürlichkeit & Formation',stageFx:'LED, Laser, Partikel, Schaum',transitions:'Szenenwechsel & Regiespannung'};
const decisions:Record<AcceptanceDecisionV829,string>={pending:'Nicht geprüft',pass:'Visuell bestanden',fail:'Problem festgestellt'};
const statuses={ 'not-recorded':'Nicht aufgenommen',incomplete:'Unvollständig',review:'Visuelle Abnahme offen',failed:'Nicht bestanden',passed:'Abgenommen'};
/** Review companion to the existing live 3D scene; it cannot validate visuals on its own. */
export function ConcertAcceptancePanelV829({enabled=true}:{enabled?:boolean}){
 const state=useSyncExternalStore(subscribeAcceptanceV829,getAcceptanceV829,getAcceptanceServerV829);
 const cast=useSyncExternalStore(subscribeCastV830,getCastV830,getCastServerV830);
 const [genre,setGenre]=useState<AcceptanceGenreV829>('rap');
 const [count,setCount]=useState<AcceptanceCountV829>(1);
 const [downloadError,setDownloadError]=useState('');
 const selected=state.cases[acceptanceKeyV829(genre,count)];
 const report=acceptanceReportV829(state);
 const production=productionReadinessV830(state,cast);
 const exportReport=()=>{
  try{
   const blob=new Blob([JSON.stringify({...report,productionV830:production,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-display-v830-production-acceptance.json';
   document.body.appendChild(anchor);anchor.click();anchor.remove();
   URL.revokeObjectURL(url);setDownloadError('');
  }catch{setDownloadError('Export nicht möglich. Ergebnisse bleiben in dieser Ansicht erhalten.');}
 };
 return <section aria-label="V829 Ultimate Concert Experience Abnahme" style={{display:'grid',gap:10,marginTop:12}}>
  <b>V829 · Ultimate Concert Experience – Real-Show-Abnahme</b>
  <small>Neun echte Live-Durchläufe: Deutschrap, Hardtekk und Deutschrock mit je 1, 2 und 4 konfigurierten Performern. Für jeden Test den Song am Anfang starten und möglichst vollständig abspielen. Die Bühne muss gleichzeitig aktiv sein; für Kameraführung, Lyrics und Lippensynchronität ist eine manuelle Sichtprüfung erforderlich.</small>
  {!enabled&&<small role="alert">V826-Live-Messung einschalten. Ohne Telemetrie werden keine Durchläufe erfasst.</small>}
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <label>Genre <select value={genre} onChange={e=>setGenre(e.target.value as AcceptanceGenreV829)}>
    {ACCEPTANCE_GENRES_V829.map(value=><option key={value} value={value}>{labels[value]}</option>)}
   </select></label>
   <label>Besetzung <select value={count} onChange={e=>setCount(Number(e.target.value) as AcceptanceCountV829)}>
    {ACCEPTANCE_COUNTS_V829.map(value=><option key={value} value={value}>{value} Performer</option>)}
   </select></label>
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type="button" disabled={!enabled} onClick={()=>{resetCastV830(acceptanceKeyV829(genre,count));beginAcceptanceV829(genre,count);}}>Diesen Durchlauf neu aufnehmen</button>
   <button type="button" disabled={!state.active} onClick={endAcceptanceV829}>Aufnahme stoppen</button>
   <button type="button" onClick={exportReport}>JSON-Prüfbericht exportieren</button>
   <button type="button" onClick={()=>{resetCastV830();clearAcceptanceV829();}}>Alle Ergebnisse löschen</button>
  </div>
  {downloadError&&<small role="alert">{downloadError}</small>}
  <div role="status">{state.notice} {state.active?`Aktiv: ${state.active}`:''}</div>
  <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',fontSize:13}}>
   <thead><tr><th>Genre</th><th>Performer</th><th>Ergebnis</th><th>FPS</th><th>Abschnitte</th></tr></thead>
   <tbody>{report.rows.map(row=><tr key={`${row.genre}:${row.count}`}>
    <td>{labels[row.genre]}</td><td>{row.count}</td><td>{statuses[row.status]}</td>
    <td>{row.fps?.toFixed(1)??'—'}</td><td>{row.sections.length}</td>
   </tr>)}</tbody>
  </table></div>
  {selected&&<fieldset style={{border:'1px solid #666',borderRadius:8,padding:9}}>
   <legend>Visuelle Einzelabnahme: {labels[genre]} / {count}</legend>
   <small>{selected.trackId?`Track ${selected.trackId} · ${Math.round(selected.lastMs/1000)} / ${Math.round(selected.durationMs/1000)} s · ${selected.sections.join(', ')}`:'Noch keine gültige Live-Messung.'}
    {selected.frames>0&&` · ${acceptanceFpsV829(selected).toFixed(1)} FPS · ${(acceptanceSlowShareV829(selected)*100).toFixed(1)} % langsame Frames`}</small>
   <div style={{display:'grid',gap:7,marginTop:8}}>{ACCEPTANCE_REVIEWS_V829.map(field=><label key={field} style={{display:'flex',gap:8,justifyContent:'space-between',flexWrap:'wrap'}}>
    <span>{aspects[field]}</span><select value={selected.reviews[field]}
     onChange={e=>markAcceptanceReviewV829(genre,count,field,e.target.value as AcceptanceDecisionV829)}>
     {(['pending','pass','fail'] as const).map(value=><option key={value} value={value}>{decisions[value]}</option>)}
    </select>
   </label>)}</div>
   <small>Diese Häkchen sind deine Bewertungen – keine automatisch gemessene Lippen-, Kamera- oder Bildqualität. Konfigurierte Performer ≠ nachgewiesen geladene GLB-Meshes.</small>
  </fieldset>}
  <section aria-label="V830 Nachweis sichtbarer GLB-Rigs" style={{display:'grid',gap:6,padding:10,border:'1px solid #666',borderRadius:8}}>
   <b>V830 · Produktionsnachweis der Performer</b>
   <small>Im Haupt-Renderer gezählte sichtbare, animierbare SkinnedMeshes je Performer-Slot (keine bloß konfigurierten Avatare). Ein GLB ohne SkinnedMesh oder ein versteckter Fallback erfüllt diesen strengen Nachweis nicht. Diese Prüfung bestätigt weder Dateiformat/Herkunft noch die GPU-Zeit.</small>
   <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',fontSize:12}}>
    <thead><tr><th>Genre</th><th>Cast</th><th>Sichtbare Rigs</th><th>Messfenster</th><th>Nachweis</th></tr></thead>
    <tbody>{production.rows.map(row=><tr key={`proof-${row.genre}-${row.count}`}>
     <td>{labels[row.genre]}</td><td>{row.count}</td><td>{row.riggedSlots}/{row.count}</td>
     <td>{row.castWindows}</td><td>{row.castVerified?'Erfüllt':'Offen'}</td>
    </tr>)}</tbody>
   </table></div>
   <strong>{production.liveEvidenceReady?'Alle neun Fälle haben Review und sichtbare Rigs. Typecheck, Build und Hardware-Abnahme separat prüfen.':'Produktionsnachweis offen: Für alle neun Fälle werden vollständige Songs, manuelle Reviews und tatsächlich sichtbare geriggte Avatare benötigt.'}</strong>
  </section>
  <small>Messfreigabe erst nach fast vollständigem, ununterbrochenem Song; mehrere verifizierte Abschnitte erforderlich. Framezeiten stammen aus dem Browser-Renderloop, nicht aus GPU-Timern. Als Anhaltspunkt gilt mindestens 80 % der Zielbildrate und maximal 30 % langsame Frames. Für faire Besetzungsvergleiche müssen Song, Qualitätsprofil, Auflösung und GLB-Komplexität übereinstimmen.</small>
  <small>Vergleich je Genre: {report.comparable.map(item=>`${labels[item.genre]} ${item.comparable?'technisch vergleichbar':'noch nicht vergleichbar'}`).join(' · ')}.</small>
  <strong>{report.allPassed?'Alle neun Fälle gemessen und manuell abgenommen. Ein realer GPU-/Hardwaretest bleibt separat erforderlich.':'Gesamtabnahme offen – nur tatsächlich gemessene und manuell geprüfte Fälle zählen.'}</strong>
 </section>;
}
