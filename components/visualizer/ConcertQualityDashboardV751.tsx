'use client';
import {useEffect,useState} from 'react';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {RealConcertBenchmarkPanelV753} from './RealConcertBenchmarkPanelV753';
import {VisualConcertInspectorPanelV754} from './VisualConcertInspectorPanelV754';
import {ConcertVisualQualityInspectorV836} from './ConcertVisualQualityInspectorV836';
import {ConcertExperienceInspectorPanelV801} from './ConcertExperienceInspectorPanelV801';
import {ConcertImprovementAssistantPanelV802} from './ConcertImprovementAssistantPanelV802';
import type {StageEnvironmentId} from './stages';
import type {PerformerPreviewV805} from './multiPerformerVisibilityV805';
import {QualityAutoTunePanelV755} from './QualityAutoTunePanelV755';
import {ConcertPerformanceGovernorPanelV999} from './ConcertPerformanceGovernorPanelV999';
import {ImmersiveConcertPanelV1000} from './ImmersiveConcertPanelV1000';
import {ConcertQualityAssurancePanelV1002} from './ConcertQualityAssurancePanelV1002';
import {V751_OPEN_RENDER_QA_EVENT,useConcertDashboardV751} from './concertDashboardStoreV751';
import {isConcertDashboardFreshV751,type ConcertPlanStateV751} from './concertDashboardProjectionV751';

const status:Record<ConcertPlanStateV751,string>={
 disabled:'Aus',idle:'Wartet',ready:'Bereit – aktuell kein Eingriff',
 planned:'Automatisch vorgesehen',manual:'Manueller Vorrang',unknown:'Ungeprüft',
};
const source:Record<string,string>={off:'Inaktiv',scene:'Bühnenszene',lyrics:'Lyrics-Schutz',
 ensemble:'Ensemble',performance:'Sängerfokus'};
const readable=(n:number|null,unit:string)=>n!==null&&Number.isFinite(n)?`${n.toFixed(1)} ${unit}`:'Nicht gemessen';
export function ConcertQualityDashboardV751({avatarModelUrl,avatarChoicesV805,stageTheme}:{avatarModelUrl?:string|null;avatarChoicesV805?:readonly PerformerPreviewV805[];stageTheme?:StageEnvironmentId}={}){
 const live=useConcertDashboardV751();
 const render=useConcertQualityV466();
 const [now,setNow]=useState(0);
 useEffect(()=>{setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);
   return()=>window.clearInterval(timer);},[]);
 const fresh=isConcertDashboardFreshV751(live,now);
 const renderFresh=render.at>0&&now>=render.at&&now-render.at<5000;
 const measured=renderFresh&&render.fps!==null&&Number.isFinite(render.fps);
 return <section className="v751-dashboard" aria-label="V751 Concert Quality Dashboard" data-v751-dashboard>
   <header className="v751-header"><div><h3>Concert Quality Dashboard · V751</h3>
     <small>Live-Pläne und echte Messungen sind getrennt. Hier werden keine Effekte verändert.</small></div>
     <span className={`v751-pill ${fresh?'v751-ok':'v751-wait'}`}>{fresh?'Live-Signal':'Kein aktuelles Signal'}</span>
   </header>
   {!fresh?<p role="status">Keine aktuelle Bühnen-Telemetrie. Starte die Avatar-Ansicht und einen Song. Einstellungen unten bleiben erhalten.</p>:
     <><div className="v751-summary">
       <div><small>Wiedergabe</small><strong>{live.playing?'Läuft':'Pause'}</strong></div>
       <div><small>Performer (Plan)</small><strong>{live.count}</strong></div>
       <div><small>Songabschnitt</small><strong>{live.section}</strong></div>
       <div><small>Qualitätsmodus</small><strong>{live.mode}</strong></div>
     </div>
     <p className="v751-hint">Aktuelle Schutzregel: {source[live.reason]??live.reason} · Planungsbelastung {Math.round(live.pressure*100)} % (keine GPU-Auslastung).</p>
     <div className="v751-systems">{live.rows.map(row=><article key={row.id} className="v751-system" data-v751-system={row.id}>
       <div className="v751-system-title"><strong>{row.label}</strong><span data-v751-state={row.state}>{status[row.state]}</span></div>
       <div className="v751-flags"><small>Konfiguriert: {row.configured===null?'Unbekannt':row.configured?'Ja':'Nein'}</small>
         <small>Aktiviert: {row.enabled?'Ja':'Nein'}</small>
         <small>Ausgabe: {row.state==='planned'?'Geplant, nicht visuell bestätigt':row.state==='manual'?'Manuell':'Nicht nachgewiesen'}</small></div>
       <small>{row.reason}</small>
     </article>)}</div></>}
   <div className="v751-measurements"><strong>WebGL-Leistungsdaten (separate, freiwillige Messung)</strong>
     <div className="v751-summary"><div><small>FPS</small><strong>{measured?readable(render.fps,'FPS'):'Nicht gemessen'}</strong></div>
       <div><small>P95 Frame-Time</small><strong>{renderFresh?readable(render.p95FrameMs,'ms'):'Nicht gemessen'}</strong></div>
       <div><small>Draw Calls</small><strong>{renderFresh&&render.drawCalls!==null?render.drawCalls:'–'}</strong></div>
       <div><small>Avatare im Bild</small><strong>{renderFresh&&render.assessment?`${render.assessment.headsInFrame}/${render.assessment.activeAvatarCount}`:'–'}</strong></div></div>
     <button type="button" onClick={()=>window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))}>
       WebGL-Qualitätsmessung auf der Bühne öffnen
     </button>
     <small>{renderFresh?'Die V466-Probe liefert Projektion und Renderer-Timing, keine GPU-Auslastung oder Bildanalyse.':
       'Messwerte erscheinen nur mit aktivierter V466-QA-Probe in der laufenden 3D-Bühne.'}</small>
     {renderFresh&&render.assessment?.warnings?.length?<ul>{render.assessment.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>:null}
   </div>
   <ConcertQualityAssurancePanelV1002 now={now}/>
   <ConcertExperienceInspectorPanelV801/>
   <ConcertImprovementAssistantPanelV802 modelUrl={avatarModelUrl} avatarChoicesV805={avatarChoicesV805} stageTheme={stageTheme}/>
   <VisualConcertInspectorPanelV754/>
   <ConcertVisualQualityInspectorV836/>
   <QualityAutoTunePanelV755/>
   <ConcertPerformanceGovernorPanelV999/>
   <ImmersiveConcertPanelV1000/>
   <RealConcertBenchmarkPanelV753/>
   <p className="v751-hint">„Konfiguriert“ bedeutet hier: Das Modul hat gültige Einstellungen, nicht dass ein GLB-Rig oder externer Dienst geprüft wurde. „Automatisch vorgesehen“ bestätigt nur einen Plan, keine sichtbare Ausführung. Keine Speicherung von Titeln, Lyrics oder Messhistorie.</p>
 </section>;
}
