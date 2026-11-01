"use client";
import {useMemo,useState} from "react";
import {diagnoseDashboardV668} from "@/services/system/diagnosticAdviceV668";
import type {DiagnosticRowV668,DiagnosticRouteV668} from "@/services/system/diagnosticAdviceV668";

export function DiagnosticAssistantV668({rows,serverError,serverLoaded,onNavigate,onRefresh}:{
  rows:ReadonlyArray<DiagnosticRowV668>;serverError:boolean;serverLoaded:boolean;
  onNavigate:(route:DiagnosticRouteV668)=>void;onRefresh:()=>void;
}){
  const [showOptional,setShowOptional]=useState(false);
  const advices=useMemo(()=>diagnoseDashboardV668(rows,{serverError,serverLoaded,showOptional}),[rows,serverError,serverLoaded,showOptional]);
  const problems=advices.filter(a=>a.severity!=="info").length;
  return <section className="v668-diagnostics" aria-labelledby="v668-title" data-v668-diagnostics>
    <div className="v668-diagnostics-head">
      <div><h4 id="v668-title">Systemdiagnose & Einrichtungshilfe</h4>
        <p>{problems?`${problems} Hinweise mit Handlungsbedarf`:
          serverLoaded&&!serverError?"Keine erkannten Probleme in den vorliegenden Statusdaten":"Noch keine vollständige Statusübersicht verfügbar"} · Keine automatischen Änderungen</p>
      </div>
      <label className="v668-optional"><input type="checkbox" checked={showOptional} onChange={event=>setShowOptional(event.target.checked)}/>
        Optionale Dienste anzeigen</label>
    </div>
    {advices.length===0?<p className="v668-empty">Für die derzeit bekannten Statuswerte liegen keine konkreten Schritte vor. „Nicht geprüft“ bedeutet nicht automatisch „funktionsfähig“.</p>:
      <div className="v668-advice-list">{advices.map(advice=><article key={advice.id} className={`v668-advice v668-${advice.severity}`}>
        <div className="v668-advice-title"><strong>{advice.title}</strong><span>{advice.severity==="critical"?"Wichtig":advice.severity==="warning"?"Prüfen":"Hinweis"}</span></div>
        <p>{advice.explanation}</p>
        {advice.type==="navigate"&&advice.route?<button type="button" onClick={()=>onNavigate(advice.route!)}>{advice.action}</button>:
          advice.type==="refresh"?<button type="button" onClick={onRefresh}>{advice.action}</button>:
          advice.type==="server"?<small>{advice.action} · `.env` / Hosting-Umgebung – keine Geheimnisse hier eintragen</small>:null}
      </article>)}</div>}
    <p className="v668-disclaimer">Die Empfehlungen beruhen nur auf vorhandenen Konfigurationsmerkmalen und Laufzeitsignalen. Es erfolgen keine Provider-Pings, keine automatischen Reparaturen und kein Zugriff auf Zugangsdaten.</p>
  </section>;
}
