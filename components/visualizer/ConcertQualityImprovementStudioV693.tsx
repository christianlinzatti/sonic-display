'use client';
import type {V693Progress,V693Snapshot} from './concertQualityImprovementV693';
import {compareV693Snapshots,createV693Tasks} from './concertQualityImprovementV693';
import type {V692Inspection} from './concertQualityInspectorV692';

const time=(ms:number|null)=>ms===null?'Ohne Zeitmarke':`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
const priorityLabel={'hoch':'Hoch · Browser-Messung',normal:'Gezielt prüfen',sichtpruefung:'Sichtprüfung','daten-fehlen':'Messdaten ergänzen'} as const;
const changeLabel={'hinweis-nicht-wiederholt':'Warnhinweis in Nachher nicht wiederholt','neuer-hinweis':'Neuer Warnhinweis','weiter-pruefen':'Weiter prüfen','nicht-vergleichbar':'Keine vergleichbare Beleglage'} as const;
export function ConcertQualityImprovementStudioV693({inspection,before,after,progress,onProgress,onBefore,onAfter,onReset,canSnapshot}:{
 inspection:V692Inspection;before:V693Snapshot|null;after:V693Snapshot|null;
 progress:Record<string,V693Progress>;onProgress:(key:string,value:V693Progress)=>void;
 onBefore:()=>void;onAfter:()=>void;onReset:()=>void;canSnapshot:boolean;
}){
 const tasks=createV693Tasks(inspection);
 const comparison=compareV693Snapshots(before,after);
 return <section className="v693-improvement-studio" aria-label="V693 Konzertqualität verbessern">
  <strong>V693 · Concert Quality Improvement Studio</strong>
  <p>Prüfliste aus der <em>aktuellen</em> lokalen Vollsong-Aufzeichnung. Aufgabenstatus nur manuell; kein Eingriff in Show, Lyrics oder Presets.</p>
  <ol>{tasks.map(task=><li key={task.key} data-v693-domain={task.id} data-v693-priority={task.priority}>
    <b>{task.title}</b> <small>{priorityLabel[task.priority]} · {time(task.atMs)}</small>
    <p>{task.detail}</p><p><b>Prüfschritt:</b> {task.action}</p>
    <label>Bearbeitungsstand <select aria-label={`${task.title}: Bearbeitungsstand`} value={progress[task.key]??'offen'} onChange={e=>onProgress(task.key,e.target.value as V693Progress)}>
      <option value="offen">Offen</option><option value="in-arbeit">In Prüfung</option><option value="manuell-geprueft">Von mir geprüft</option>
    </select></label>
  </li>)}</ol>
  {tasks.length===0&&<p>Für Aufgaben zuerst eine gültige Vollsong-Aufzeichnung starten.</p>}
  <div className="v693-comparison-controls">
   <button type="button" disabled={!canSnapshot} onClick={onBefore}>Aktuelle Aufnahme als Vorher merken</button>
   <button type="button" disabled={!canSnapshot||!before||inspection.trackId!==before.trackId} onClick={onAfter}>Aktuelle Aufnahme als Nachher merken</button>
   <button type="button" disabled={!before&&!after} onClick={onReset}>Vergleich zurücksetzen</button>
  </div>
  <p>Vorher: {before?`${before.samples} Proben · ${before.coveragePercent.toFixed(1)} %`:'noch nicht gewählt'} · Nachher: {after?`${after.samples} Proben · ${after.coveragePercent.toFixed(1)} %`:'noch nicht gewählt'}</p>
  {before&&after&&<div className="v693-comparison" role="status">
   <strong>Vorher / Nachher · {comparison.comparable?'eingeschränkt vergleichbar':'nicht vergleichbar'}</strong>
   <p>{comparison.reason}</p>
   {comparison.comparable&&<>
    <ul>{comparison.rows.map(row=><li key={row.id}><b>{row.title}:</b> {changeLabel[row.change]}{row.beforeAtMs!==null?` · vorher ${time(row.beforeAtMs)}`:''}{row.afterAtMs!==null?` · nachher ${time(row.afterAtMs)}`:''}</li>)}</ul>
    <p>Browser-Median: FPS-Änderung {comparison.fpsDelta===null?'nicht verfügbar':`${comparison.fpsDelta>0?'+':''}${comparison.fpsDelta.toFixed(1)}`} · P95-Änderung {comparison.p95DeltaMs===null?'nicht verfügbar':`${comparison.p95DeltaMs>0?'+':''}${comparison.p95DeltaMs.toFixed(1)} ms`}</p>
   </>}
  </div>}
  <p><small>„Von mir geprüft“ bedeutet keine technische Behebung. Ein verschwundener geometrischer Warnhinweis beweist weder gute Tanzqualität noch lesbare Lyrics. Keine automatische Qualitätsfreigabe.</small></p>
 </section>;
}
