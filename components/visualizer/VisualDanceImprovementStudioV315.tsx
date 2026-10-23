"use client";
import {useState} from 'react';
import dynamic from 'next/dynamic';
import {snapshotReviewV314} from './dancePerformanceReviewV314';
import {planDanceImprovementsV315,type ImprovementPlanV315,type ImprovementSuggestionV315} from './danceImprovementAssistantV315';
import {applyImprovementSuggestionsV315,readImprovementSettingsV315,undoImprovementSuggestionsV315,type ImprovementUndoV315} from './danceImprovementActionsV315';
const DanceLiveComparisonV316=dynamic(()=>import('./DanceLiveComparisonV316').then(m=>m.DanceLiveComparisonV316),{ssr:false});

const secs=(ms:number)=>`${Math.round(ms/1000)} s`;
export function VisualDanceImprovementStudioV315(){
  const [plan,setPlan]=useState<ImprovementPlanV315|null>(null);
  const [selected,setSelected]=useState<string[]>([]);
  const [undo,setUndo]=useState<ImprovementUndoV315|null>(null);
  const [message,setMessage]=useState('');
  const [comparison,setComparison]=useState<{baseline:ReturnType<typeof readImprovementSettingsV315>;proposals:ImprovementSuggestionV315[]}|null>(null);
  const analyze=()=>{
    const result=planDanceImprovementsV315(snapshotReviewV314(),readImprovementSettingsV315());
    setComparison(null);setPlan(result);setSelected(result.suggestions.map(s=>s.id));setMessage(result.status==='insufficient'?'Mindestens acht Messpunkte und 12 Sekunden zusammenhängende Aufzeichnung benötigt.':result.status==='no-issues'?'Keine durch die verfügbaren Daten begründeten Regleränderungen gefunden.':'Vorschläge aktualisiert. Bisher wurde nichts verändert.');
  };
  const toggle=(id:string,checked:boolean)=>setSelected(values=>checked?[...values.filter(v=>v!==id),id]:values.filter(v=>v!==id));
  const chosen=():ImprovementSuggestionV315[]=>plan?.suggestions.filter(s=>selected.includes(s.id))??[];
  const apply=()=>{
    if(undo){setMessage('Bitte zuerst die letzte Änderung rückgängig machen oder als abgeschlossen bestätigen.');return;}
    const result=applyImprovementSuggestionsV315(chosen());
    if(!result.ok){setMessage(result.reason);return;}
    setUndo(result.undo);setMessage(`${result.reason} Du kannst diese Änderungen rückgängig machen.`);
  };
  const preview3D=()=>{
    const proposals=chosen();
    if(!proposals.length){setMessage('Bitte zuerst Vorschläge auswählen.');return;}
    // Snapshot at click time; engine validates all stale fields before 3D rendering.
    setComparison({baseline:readImprovementSettingsV315(),proposals});
  };
  const restore=()=>{
    if(!undo)return;
    const result=undoImprovementSuggestionsV315(undo);setUndo(null);setPlan(null);setSelected([]);
    setComparison(null);setMessage(`${result.restored} Regler zurückgesetzt.${result.skipped?` ${result.skipped} später manuell veränderte Regler nicht überschrieben.`:''}`);
  };
  return <fieldset className="stage-director-v287 dance-improvement-v315"><legend>Visual Dance Improvement Assistant · V315</legend>
    <p>Erstellt konkrete <strong>Änderungsvorschläge</strong> aus dem Dance Performance Review V314. Die Vorschau verändert nichts und schätzt keine objektive Tanzqualität.</p>
    <div className="dance-improvement-v315-actions">
      <button type="button" onClick={analyze}>Aufzeichnung analysieren</button>
      <button type="button" disabled={!plan||!selected.length||!!undo} onClick={preview3D}>Real-Motion-Vergleich öffnen · V317</button>
      <button type="button" disabled={!plan||!selected.length||!!undo} onClick={apply}>Ausgewählte Änderungen übernehmen</button>
      <button type="button" disabled={!undo} onClick={restore}>Änderungen rückgängig machen</button>
      {undo&&<button type="button" onClick={()=>{setUndo(null);setPlan(null);setMessage('Änderungen beibehalten. Neue Analyse ist möglich.');}}>Änderungen beibehalten</button>}
    </div>
    <small aria-live="polite" role="status">{message||'Keine automatische Anpassung – erst Analyse, dann Vorschau und ausdrückliche Übernahme.'}</small>
    {plan&&<div className="dance-improvement-v315-results">
      <small>Analysiert: {plan.trackLabel||'Aktueller Song'} · {plan.sampleCount} Messpunkte · {secs(plan.spanMs)}</small>
      {plan.suggestions.map(s=><article key={s.id} className="dance-improvement-v315-item">
        <label className="setting-check"><input type="checkbox" checked={selected.includes(s.id)} disabled={!!undo} onChange={e=>toggle(s.id,e.target.checked)}/><strong>{s.title}</strong></label>
        <p>{s.explanation}</p>
        <div className="dance-improvement-v315-preview" aria-label={`Vorschau ${s.title}`}>
          <div><small>Bisher</small><strong>{s.before}{s.field==='quality.minHoldSeconds'?' s':' %'}</strong></div>
          <span aria-hidden="true">→</span>
          <div><small>Vorgeschlagen</small><strong>{s.after}{s.field==='quality.minHoldSeconds'?' s':' %'}</strong></div>
          <span className="dance-improvement-v315-diff">{s.after>s.before?'+':''}{s.after-s.before}{s.field==='quality.minHoldSeconds'?' s':' Punkte'}</span>
        </div>
        <div className="dance-improvement-v315-bars" aria-label="Grafischer Vergleich der Reglerwerte, keine 3D-Simulation">
          <div><small>Bisher</small><span className="dance-improvement-v315-track"><i style={{width:`${Math.round(s.before/(s.field==='quality.minHoldSeconds'?40:100)*100)}%`}}/></span></div>
          <div><small>Vorschlag</small><span className="dance-improvement-v315-track proposed"><i style={{width:`${Math.round(s.after/(s.field==='quality.minHoldSeconds'?40:100)*100)}%`}}/></span></div>
        </div>
        <small><strong>Beobachtung:</strong> {s.evidence} · {s.strength}</small>
        <small><strong>Grenze:</strong> {s.limitation}</small>
      </article>)}
    </div>}
    {comparison&&<DanceLiveComparisonV316 baseline={comparison.baseline} proposals={comparison.proposals} onClose={()=>setComparison(null)}/>}
    <small>Die Empfehlungen beruhen auf Stichproben und Heuristiken. Keine echte Motion-Capture-Prüfung, kein automatisches Trainieren, keine neue Kamera-/Motion-Datei, keine Änderung an Reduced Motion oder manuellen Keyframes. Die grafische Vorschau zeigt Reglerwerte, keine vorhergesagte 3D-Tanzshow. Die Vorschläge und die Rückgängig-Sicherung bleiben nur in dieser geöffneten Ansicht erhalten. Werden Regler nach der Vorschau geändert, muss die Analyse aktualisiert werden.</small>
  </fieldset>;
}
