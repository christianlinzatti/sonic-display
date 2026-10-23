"use client";
import type {RapArticulationSuggestionV422} from "./rapArticulationAssistantV422";
export function RapArticulationAssistantPanelV422({suggestions,hasExisting,hasUnsaved,onApply}:{
 suggestions:RapArticulationSuggestionV422[];hasExisting:boolean;hasUnsaved:boolean;
 onApply:(value:RapArticulationSuggestionV422)=>void;
}){
 return <section aria-label="V422 Smart Articulation Assistant" style={{display:"grid",gap:7,padding:10,border:"1px solid #456e80",borderRadius:8}}>
  <strong>V422 · Smart Articulation Assistant</strong>
  <small>Heuristische Hinweise aus <b>berechneten Mundformen</b>, keine Audio- oder Renderfehler-Messung. Vorschläge verändern weder Spotify noch gespeicherte Keyframes.</small>
  {hasExisting?<small role="status">Für dieses Wort existiert eine gespeicherte manuelle Korrektur. V422 schützt sie; zuerst bewusst entfernen, um neue Vorschläge zu erhalten.</small>:
   hasUnsaved?<small role="status">Du bearbeitest bereits eigene Keyframes. Setze die Bearbeitung zurück, bevor du einen V422-Vorschlag übernimmst.</small>:
   !suggestions.length?<small>Keine auffälligen Übergänge aus den verfügbaren Wort-Zeitstempeln abgeleitet.</small>:
   suggestions.map(s=><div key={s.id} style={{display:"grid",gap:5,padding:8,background:"#22364d",borderRadius:6}}>
    <b>{s.title}</b>
    <small>{s.explanation}</small>
    <small>{s.observations.join(" · ")}</small>
    <small>Max. Änderung je Stichprobenschritt (Vorhersage): {(s.estimatedPeakChange*100).toFixed(1)} %-Punkte · {s.edit.frames.length} Keyframes · Korrekturstärke {s.edit.strength} %</small>
    <button type="button" onClick={()=>onApply(s)}>Als ungespeicherten Entwurf im A/B-Vergleich testen</button>
   </div>)}
  <small>Nach dem Test speicherst du die Keyframes ausschließlich über die vorhandene Schaltfläche „Mundformen speichern“.</small>
 </section>;
}
