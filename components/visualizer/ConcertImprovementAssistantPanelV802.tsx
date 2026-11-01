'use client';
import {useEffect,useMemo,useState} from 'react';
import {useConcertInspectorV801} from './concertExperienceInspectorStoreV801';
import {planConcertImprovementsV802,previewConcertImprovementsV802,
  prepareImprovementTimelineV802,type ImprovementPriorityV802} from './concertImprovementAssistantV802';
import {VisualConcertComparisonPanelV803} from './VisualConcertComparisonPanelV803';
import type {StageEnvironmentId} from './stages';
import type {PerformerPreviewV805} from './multiPerformerVisibilityV805';
import {readTimelineV354,saveTimelineV354} from '../../services/stageContent/showTimelineV354';
const format=(ms:number)=>{const t=Math.floor(Math.max(0,ms)/1000);
  return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;};
const label:Record<ImprovementPriorityV802,string>={high:'Wichtig',medium:'Verbesserung',info:'Hinweis'};
export function ConcertImprovementAssistantPanelV802({modelUrl,avatarChoicesV805,stageTheme}:{modelUrl?:string|null;avatarChoicesV805?:readonly PerformerPreviewV805[];stageTheme?:StageEnvironmentId}={}){
  const snapshot=useConcertInspectorV801();
  const {plan,audit,report,evidence,at}=snapshot;
  const [selected,setSelected]=useState<string[]>([]);
  const [confirmed,setConfirmed]=useState(false);
  const [message,setMessage]=useState('');
  const [now,setNow]=useState(0);
  useEffect(()=>{setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);
    return()=>window.clearInterval(timer);},[]);
  const signature=plan?.source==='verified-storyboard'?`${plan.trackId}:${plan.durationMs}:`+
    plan.scenes.map(s=>`${s.index}-${s.startMs}-${s.endMs}-${s.intent}`).join('|'):'unavailable';
  useEffect(()=>{setSelected([]);setConfirmed(false);setMessage('');},[signature]);
  const fresh=at>0&&now>=at&&now-at<6000;
  const proposals=useMemo(()=>plan&&audit&&evidence?
    planConcertImprovementsV802(plan,audit,report,evidence):[],[plan,audit,report,evidence]);
  const valid=fresh&&report.source==='verified-plan'&&!!plan&&!!audit&&!!evidence;
  const draft=useMemo(()=>plan&&audit&&evidence?
    previewConcertImprovementsV802(plan,audit,report,evidence,selected):null,
    [plan,audit,report,evidence,selected]);
  const selectedChanges=draft?.source==='verified-draft'?draft.changes.length:0;
  const selectedCurrent=selected.filter(id=>proposals.some(p=>p.id===id&&p.kind==='camera-intent'));
  const safePreview=valid&&draft?.source==='verified-draft'&&
    draft.after.structureScore!==null&&draft.before.structureScore!==null&&
    draft.after.structureScore>=draft.before.structureScore;
  const apply=()=>{
    setMessage('');
    if(!confirmed||!safePreview||!draft||!selectedChanges){setMessage('Bitte die Vorschau und Übernahmebestätigung prüfen.');return;}
    const current=readTimelineV354();
    const result=prepareImprovementTimelineV802(current,draft);
    if(!result.ok||!result.timeline){setMessage(result.reason);return;}
    // Re-read immediately before write; do not replace edits made by another tab.
    if(JSON.stringify(readTimelineV354())!==JSON.stringify(current)){
      setMessage('Die gespeicherte Timeline hat sich geändert. Bitte erneut prüfen.');return;
    }
    saveTimelineV354(result.timeline);
    if(JSON.stringify(readTimelineV354())!==JSON.stringify(result.timeline)){
      setMessage('Speichern fehlgeschlagen (z. B. Speicherplatz oder Browser-Sperre).');return;
    }
    setMessage(`${result.added} Kamera-Cues in die bestehende manuelle V354-Timeline übernommen. `+
      'Sie sind sofort als manuelle Cues aktiv; bei Bedarf im Timeline-Studio bearbeiten oder löschen.');
    setConfirmed(false);setSelected([]);
  };
  return <section className="v751-measurements v802-assistant" data-v802-assistant
    aria-label="V802 Intelligent Concert Improvement Assistant">
    <header className="v751-header"><div><h3>V802 · Intelligent Concert Improvement Assistant</h3>
      <small>Strukturprobleme priorisieren, Kameraalternativen simulieren und nur auf ausdrücklichen Wunsch als manuelle Timeline-Cues übernehmen.</small>
    </div><span className={`v751-pill ${valid?'v751-ok':'v751-wait'}`}>
      {valid?'Entwurf verfügbar':'Keine aktuelle Show'}</span></header>
    {!valid?<p role="status">Aktuelle, verifizierte V790/V800-Songplanung erforderlich. Starte die Avatar-Show mit einer bestätigten Timeline.</p>:<>
      <p className="v751-hint">Vorschläge basieren auf V801-Planbefunden. Sie erkennen keine echten Kameraüberdeckungen, Lippenfehler oder GPU-Probleme. Fehlende Songabschnitte und Lyrics werden niemals automatisch erfunden.</p>
      <div className="v802-before-after" aria-label="Vorher-Nachher-Vergleich (nur Szenenplan)">
        <div><small>Vorher · Strukturindex</small><strong>{report.structureScore??'–'} / 100</strong>
          <small>{report.summary.attention} planbasierte Hinweise</small></div>
        <div><small>Nachher · Entwurf</small><strong>{safePreview?draft!.after.structureScore:'–'} / 100</strong>
          <small>{safePreview?`${draft!.after.summary.attention} planbasierte Hinweise`:'Noch kein gültiger Entwurf'}</small></div>
        <div><small>Geänderte Szenen</small><strong>{selectedChanges}</strong>
          <small>Keine Live-Vorschau, nur Szenenplan-Simulation</small></div>
      </div>
      <div className="v802-proposals"><h4>Priorisierte Verbesserungen ({proposals.length})</h4>
        {proposals.length===0?<p>Keine sicher ableitbaren strukturellen Vorschläge. Das ist keine Bestätigung der visuellen Konzertqualität.</p>:
        <ol>{proposals.map(item=><li key={item.id} data-v802-priority={item.priority}>
          <div className="v802-proposal-title"><strong>{item.title}</strong>
            <span>{label[item.priority]} · {format(item.startMs)}–{format(item.endMs)}</span></div>
          <p>{item.reason}</p><p><small>{item.proposal}</small></p>
          {item.kind==='camera-intent'?<label className="v802-select">
            <input type="checkbox" checked={selectedCurrent.includes(item.id)}
              onChange={(ev:{target:{checked:boolean}})=>{setConfirmed(false);setMessage('');setSelected(current=>
                ev.target.checked?[...current,item.id]:current.filter(id=>id!==item.id));}}/>
            In den Vorher-/Nachher-Entwurf aufnehmen
            {item.previewDelta!==null&&<small> (allein bis zu +{item.previewDelta} Strukturpunkte)</small>}
          </label>:<small>Manuell überprüfen · Keine sichere automatische Umsetzung</small>}
        </li>)}</ol>}
      </div>
      {selectedChanges>0&&draft?.source==='verified-draft'&&<div className="v802-draft-detail">
        <strong>Entwurf: {selectedChanges} Szenen mit alternativer Kameraperspektive</strong>
        <ul>{draft.changes.map(change=><li key={change.sceneIndex}>
          Szene {change.sceneIndex+1} ({format(change.startMs)}–{format(change.endMs)}):
          {' '}{change.before} → <strong>{change.after}</strong></li>)}</ul>
        {valid&&safePreview&&plan&&<VisualConcertComparisonPanelV803 plan={plan} draft={draft} modelUrl={modelUrl} avatarChoicesV805={avatarChoicesV805} stageTheme={stageTheme}/>}
        <p className="v751-hint">{draft.warning} Die Übernahme verwendet kurze, angenäherte V354-Kamera-Cues – keine exakten V790-Szenenänderungen.</p>
        <label className="v802-select"><input type="checkbox" checked={confirmed}
          onChange={(ev:{target:{checked:boolean}})=>setConfirmed(ev.target.checked)}/>
          Ich möchte die ausgewählten Kamera-Cues in meine aktive, songgebundene V354-Timeline übernehmen.</label>
        <div className="v802-buttons"><button type="button" disabled={!confirmed||!safePreview}
          onClick={apply}>Kamera-Cues ausdrücklich übernehmen</button>
          <button type="button" onClick={()=>{setSelected([]);setConfirmed(false);setMessage('Entwurf zurückgesetzt.');}}>
            Entwurf verwerfen</button></div>
        <small>Voraussetzung: Im interaktiven Konzert-Timeline-Studio V763 muss bereits eine aktive, zu diesem Song gehörende V354-Show bestehen. Bestehende Cues werden nie überschrieben oder überlagert. Übernommene Cues kannst du dort entfernen.</small>
      </div>}
      {message&&<p role="status" className="v802-message">{message}</p>}
    </>}
  </section>;
}
