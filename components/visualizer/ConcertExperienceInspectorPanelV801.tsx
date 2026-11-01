'use client';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {useConcertInspectorV801} from './concertExperienceInspectorStoreV801';
import type {ConcertInspectorLaneV801,ConcertInspectorFindingV801} from './concertExperienceInspectorV801';
import {V751_OPEN_RENDER_QA_EVENT} from './concertDashboardStoreV751';

const lanes:readonly {key:ConcertInspectorLaneV801;label:string}[]=[
  {key:'timeline',label:'Alle Bereiche'},{key:'camera',label:'Kamera'},
  {key:'dance',label:'Tanz'},{key:'lyrics',label:'Lyrics'},
  {key:'lighting',label:'Licht'},{key:'stage',label:'Bühne'},
];
const time=(ms:number)=>{const s=Math.floor(Math.max(0,ms)/1000);
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
const laneLabel=(lane:ConcertInspectorLaneV801)=>lanes.find(l=>l.key===lane)?.label??lane;
const statusLabel={planned:'Plan vorhanden',attention:'Hinweis',unverified:'Nicht gemessen',manual:'Manuell geschützt'};
export function ConcertExperienceInspectorPanelV801(){
  const {at,progressMs,playing,report}=useConcertInspectorV801();
  const [now,setNow]=useState(0);
  const [lane,setLane]=useState<ConcertInspectorLaneV801>('timeline');
  const [showInformation,setShowInformation]=useState(true);
  const [selected,setSelected]=useState<number|null>(null);
  useEffect(()=>setSelected(null),[report.trackId]);
  useEffect(()=>{setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);
    return()=>window.clearInterval(timer);},[]);
  const fresh=at>0&&now>=at&&now-at<6000;
  const valid=fresh&&report.source==='verified-plan';
  const selectedScene=valid?report.scenes.find(s=>s.index===selected)??null:null;
  const currentIndex=valid?report.scenes.find(s=>progressMs>=s.startMs&&progressMs<s.endMs)?.index??-1:-1;
  const findings=useMemo(()=>report.findings.filter(f=>
    (lane==='timeline'||f.lane===lane)&&(showInformation||f.severity==='attention')),
    [report,lane,showInformation]);
  const filteredForScene=(sceneIndex:number)=>findings.filter(f=>
    f.sceneIndex===sceneIndex||(f.sceneIndex===null&&
      f.startMs<report.scenes[sceneIndex].endMs&&f.endMs>report.scenes[sceneIndex].startMs));
  const covered=valid?`${Math.round(report.coverage*100)} %`:'–';
  return <section className="v751-measurements v801-inspector" aria-label="V801 Concert Experience Quality Inspector" data-v801-inspector>
    <header className="v751-header"><div><h3>V801 · Concert Experience Quality Inspector</h3>
      <small>Gesamten Song untersuchen: exakte Problemstellen aus bestätigten Szenen – ohne die Show zu verändern.</small>
    </div><span className={`v751-pill ${valid?'v751-ok':'v751-wait'}`}>{valid?'Storyboard geprüft':'Keine aktuelle Planung'}</span></header>
    {!valid?<p role="status">{fresh?report.note:'Kein aktuelles Bühnen-Signal. Öffne die Avatar-Ansicht mit einem Song und einer bestätigten Timeline.'}</p>:<>
      <div className="v751-summary">
        <div><small>Plan-Abdeckung</small><strong>{covered}</strong></div>
        <div><small>Strukturindex (nur Plan)</small><strong>{report.structureScore??'–'} / 100</strong></div>
        <div><small>Konkrete Hinweise</small><strong>{report.summary.attention}</strong></div>
        <div><small>Bestätigte Szenen</small><strong>{report.sceneCount}</strong></div>
      </div>
      <p className="v751-hint">{report.note}</p>
      <div className="v801-toolbar"><label htmlFor="v801-filter">Prüfbereich</label>
        <select id="v801-filter" value={lane} onChange={(e:{target:{value:string}})=>setLane(e.target.value as ConcertInspectorLaneV801)}>
          {lanes.map(l=><option key={l.key} value={l.key}>{l.label}</option>)}
        </select>
        <label className="v801-toggle"><input type="checkbox" checked={showInformation}
          onChange={(e:{target:{checked:boolean}})=>setShowInformation(e.target.checked)}/> Auch Informationen</label>
      </div>
      <div className="v801-track" role="group" aria-label="Song-Timeline nach bestätigten Szenen">
        <div className="v801-timeline" style={{minWidth:Math.max(560,report.sceneCount*20)}}>
          {(()=>{const segments:ReactNode[]=[];let cursor=0;
            for(const scene of report.scenes){
              if(scene.startMs>cursor){segments.push(<div key={`gap-${scene.index}`} className="v801-gap"
                style={{flexGrow:scene.startMs-cursor}} title={`${time(cursor)}–${time(scene.startMs)}: Keine bestätigte Szene`}/>);}
              const relevant=filteredForScene(scene.index),warning=relevant.some(f=>f.severity==='attention');
              segments.push(<button type="button" key={scene.index}
                className="v801-segment" data-v801-level={warning?'attention':relevant.length?'information':'planned'}
                data-v801-current={currentIndex===scene.index&&playing?'yes':'no'}
                aria-pressed={selected===scene.index} onClick={()=>setSelected(scene.index)}
                title={`${time(scene.startMs)}–${time(scene.endMs)} | ${scene.section} | ${relevant.length} Hinweise`}
                style={{flexGrow:scene.endMs-scene.startMs}}><span className="v801-segment-label">{scene.index+1}</span></button>);
              cursor=scene.endMs;
            }
            if(cursor<report.durationMs)segments.push(<div key="end" className="v801-gap" style={{flexGrow:report.durationMs-cursor}} title="Kein bestätigter Szenenabschluss"/>);
            return segments;})()}
        </div>
        <div className="v801-time-axis"><span>0:00</span><span>{playing?'Aktuell: ':'Position: '}{time(progressMs)}</span><span>{time(report.durationMs)}</span></div>
      </div>
      <p className="v751-hint">Szenen antippen, um Details zu sehen. Markierte Bereiche sind <strong>Plan-Hinweise</strong>, keine bestätigten Bildfehler. Grau gestrichelt = fehlende Szenenabdeckung.</p>
      {selectedScene&&<div className="v801-scene-detail" data-v801-scene={selectedScene.index}>
        <div className="v801-scene-heading"><strong>Szene {selectedScene.index+1} · {time(selectedScene.startMs)}–{time(selectedScene.endMs)}</strong>
          <button type="button" onClick={()=>setSelected(null)} aria-label="Szenendetails schließen">Schließen</button></div>
        <small>Abschnitt: {selectedScene.section} · Kamera: {selectedScene.intent} · Moment: {selectedScene.moment}</small>
        <div className="v801-lanes">{lanes.filter(l=>l.key!=='timeline').map(l=><div key={l.key}>
          <small>{l.label}</small><strong data-v801-status={selectedScene.statuses[l.key as Exclude<ConcertInspectorLaneV801,'timeline'>]}>
            {statusLabel[selectedScene.statuses[l.key as Exclude<ConcertInspectorLaneV801,'timeline'>]]}</strong>
        </div>)}</div>
        {filteredForScene(selectedScene.index).length?<ul>{filteredForScene(selectedScene.index).map(f=><li key={f.id}>
          <strong>{laneLabel(f.lane)}:</strong> {f.message}</li>)}</ul>:<small>Keine planbasierten Hinweise für diese Szene im ausgewählten Filter. Tatsächliche Qualität nicht gemessen.</small>}
      </div>}
      <div className="v801-findings" aria-live="polite">
        <h4>Problemstellen und Empfehlungen ({findings.length})</h4>
        {findings.length===0?<p>Keine strukturellen Hinweise in diesem Filter. Nicht gemessene Bereiche gelten nicht automatisch als fehlerfrei.</p>:
        <ol>{findings.map((f:ConcertInspectorFindingV801)=><li key={f.id} data-v801-severity={f.severity}>
          <div><strong>{laneLabel(f.lane)} · {time(f.startMs)}–{time(f.endMs)}</strong>
            <small>{f.severity==='attention'?'Prüfen':'Information'}</small></div>
          <p>{f.message}</p><small><strong>Empfehlung:</strong> {f.recommendation}</small>
          {f.sceneIndex!==null&&<button type="button" onClick={()=>setSelected(f.sceneIndex)}>Szene {f.sceneIndex+1} anzeigen</button>}
        </li>)}</ol>}
      </div>
      <button type="button" onClick={()=>window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))}>
        Zusätzliche WebGL-Bildprüfung öffnen
      </button>
      <small>Die WebGL-Prüfung (V754) ist separat und misst nur ihre dort dokumentierten Geometrie-Indikatoren. V801 erfindet weder Sängerzeiten noch eine Video-/Pixelanalyse. Die Berichtsdaten bleiben im Arbeitsspeicher.</small>
    </>}
  </section>;
}
