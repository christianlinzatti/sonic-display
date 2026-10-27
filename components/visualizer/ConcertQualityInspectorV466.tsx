"use client";
import {useConcertQualityV466} from './concertQualityStoreV466';
import type {QualityLevelV466} from '@/services/show/concertQualityInspectorV466';
import {ConcertQualityAdvisorV467} from './ConcertQualityAdvisorV467';
import {ConcertVisualCompareV544} from './ConcertVisualCompareV544';
const label=(v:QualityLevelV466)=>v==='ok'?'OK':v==='watch'?'Prüfen':v==='issue'?'Problem':'Keine Daten';
const pretty=(n:number|null,suffix='')=>n===null||!Number.isFinite(n)?'—':`${n.toFixed(1)}${suffix}`;
export function ConcertQualityInspectorV466({enabled,onToggle}:{enabled:boolean;onToggle:()=>void}){
 const live=useConcertQualityV466();
 const quality=live.assessment;
 const valid=enabled&&live.at>0;
 return <div className="v466-quality-ui" data-v466-inspector={enabled?'open':'closed'}>
   <button className="v466-quality-toggle" type="button" aria-pressed={enabled} aria-controls="v466-quality-panel"
     onClick={onToggle} title="Live-Qualitätsdiagnose (nur lokal)">QA</button>
   {enabled&&<div className="v466-quality-panel" id="v466-quality-panel" role="region" aria-label="Live-Konzertqualität">
     <strong>V466 · Konzert-Qualität</strong>
     <p>{!valid?'Warte auf echte WebGL-Messwerte…':`FPS ${pretty(live.fps)} · P95 ${pretty(live.p95FrameMs,' ms')} · ${live.qualityTier}`}</p>
     <p>FPS: {quality?label(quality.fps):'Keine Daten'} · Köpfe: {quality?`${quality.headsInFrame}/${quality.activeAvatarCount}`:'—'} · Lyrics: {quality?label(quality.lyrics):'Keine Daten'}</p>
     {valid&&<p>Draw Calls {live.drawCalls??'—'} · Dreiecke {live.triangles??'—'}</p>}
     {quality?.warnings.length?<ul>{quality.warnings.map((warning,i)=><li key={i}>{warning}</li>)}</ul>:
       <p>{valid?'Keine erkannten Projektions-/Layoutwarnungen.':'Nur bei aktiver 3D-Bühne verfügbar.'}</p>}
     {quality&&live.avatars.some(a=>a.anchor==='estimated')&&<p>Mindestens eine Kopfposition ist aus der Avatar-Höhe geschätzt.</p>}
     {valid&&<ConcertQualityAdvisorV467 history={live.historyV467??[]} now={Date.now()}/>}
     {enabled&&<ConcertVisualCompareV544/>}
     <p className="v466-quality-disclaimer">Kopfprojektion ≠ sichtbares Gesicht. Keine Erkennung von Verdeckung, Lichtqualität oder GPU-Auslastung; Lyrics-Rechteck nur bei aktiver immersiver Zeile. Keine Aufzeichnung oder Übertragung.</p>
   </div>}
   {enabled&&valid&&live.canvas&&live.avatars.map(avatar=><div key={avatar.slot}
     className={`v466-head-marker ${avatar.anchor==='estimated'?'v466-marker-estimate':''}`}
     style={{left:avatar.x-live.canvas!.x,top:avatar.y-live.canvas!.y,display:avatar.inFront?'block':'none'}}
     aria-hidden="true" title={`Avatar ${avatar.slot+1}`}>{avatar.slot+1}</div>)}
 </div>;
}
