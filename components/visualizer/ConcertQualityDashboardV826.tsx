'use client';
import {useSyncExternalStore} from 'react';
import {CONCERT_QUALITY_LANES_V826,getConcertQualityV826,subscribeConcertQualityV826,
 EMPTY_QUALITY_SNAPSHOT_V826} from './concertQualityTelemetryV826';
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
const p=(n:number)=>`${Math.round(n*100)} %`;
const format=(n:number)=>n.toLocaleString('de-AT');
const laneNames:Record<string,string>={laser:'Laser',led:'LED',particles:'Partikel',foam:'Schaum',transition:'Übergänge',
 crowd:'Publikum',spectral:'Spektral',haze:'Atmosphäre',kinetic:'Kinetik',vocal:'Vocal'};
/** Live-only read view: works within settings without adding HTML to the Canvas.
 * Externally subscribed at <=2 Hz, never causes a full R3F scene rerender. */
export function ConcertQualityDashboardV826({enabled=true}:{enabled?:boolean}){
 const snapshot=useSyncExternalStore(subscribeConcertQualityV826,getConcertQualityV826,
  ()=>EMPTY_QUALITY_SNAPSHOT_V826 as ConcertQualitySnapshotV826);
 if(!enabled)return <p style={{opacity:.75}}>Live-Diagnose ausgeschaltet. In „Anzeige → Concert FX Studio“ einschalten.</p>;
 if(!snapshot.available)return <p role="status">Keine Live-Messdaten. Bühne öffnen und Anzeige des Qualitätsdashboards aktivieren.</p>;
 const c=snapshot.counts;
 const totalParticles=c.sparks+c.shards+c.confetti+c.energyRings;
 const totalFoam=c.foamBubbles+c.foamMist;
 const statusText={healthy:'Unauffällig',warning:'Erhöhte Framezeit',critical:'Starke Verlangsamung',paused:'Pausiert',unavailable:'Keine Daten'}[snapshot.status];
 return <section aria-label="Konzertqualität Live-Dashboard" style={{display:'grid',gap:10}}>
  <div role="status"><b>Live-Status: {statusText}</b> · {snapshot.playing?'Wiedergabe':'Keine aktive Wiedergabe'} · FX-Freigabe {snapshot.verified?'bestätigt':'nicht bestätigt'} · Profil {snapshot.performanceTier}</div>
  <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
   <div><strong>{snapshot.fps.toFixed(1)} FPS</strong><small style={{display:'block'}}>Gemessen aus Frame-Abständen</small></div>
   <div><strong>{snapshot.frameMs.toFixed(1)} ms</strong><small style={{display:'block'}}>Ø Framezeit</small></div>
   <div><strong>{snapshot.p95FrameMs.toFixed(1)} ms</strong><small style={{display:'block'}}>P95 der letzten Frames</small></div>
   <div><strong>{p(snapshot.slowFrameShare)}</strong><small style={{display:'block'}}>Langsame Frames</small></div>
  </div>
  {typeof snapshot.autoQualityPressureV827==='number'&&<div><b>V827 Auto-Tuning:</b> {p(snapshot.autoQualityPressureV827)} zusätzlicher FX-Regeldruck · {snapshot.autoQualityReasonV827??'wartet'}. V825 und manuelle Sicherheitssperren bleiben vorrangig.</div>}
  {snapshot.cameraAwareReasonV834&&<div><b>V834 Kamera-bewusstes FX-Budget:</b> {snapshot.cameraAwareReasonV834==='optimized'?`Dekorative Effekte reduziert (${snapshot.cameraIntentV834??'Kameraabsicht'}, ${snapshot.cameraAwareSavingsV834?.toFixed(2)??'0'} relative Kosten gespart)`:`${snapshot.cameraAwareReasonV834} – keine zusätzliche Reduktion`}. Nur bestätigte Kameraabsichten, keine Sichtbarkeitsmessung.</div>}
  <small>Messfenster ca. 0,5 s ({snapshot.sampleCount} Frames), Ziel {snapshot.targetFps} FPS. Framezeit ist keine GPU-Zeit. Fensterwechsel und Browser-Aufwachspitzen werden ausgeschlossen.</small>
  <fieldset style={{border:'1px solid #666',borderRadius:8,padding:9}}><legend>V825 · Live-Effektbudgets</legend>
   <div>Regeldruck: <b>{p(snapshot.pressure)}</b> · geschätzte FX-Kosten <b>{snapshot.fxCost.toFixed(1)}</b> / Budget <b>{snapshot.fxCapacity.toFixed(1)}</b></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:6,marginTop:8}}>
    {CONCERT_QUALITY_LANES_V826.map(lane=><div key={lane}>
     <div style={{display:'flex',justifyContent:'space-between',gap:5}}><span>{laneNames[lane]}</span><b>{p(snapshot.gains[lane])}</b></div>
     <progress aria-label={`${laneNames[lane]} Effektbudget`} max={100} value={Math.round(snapshot.gains[lane]*100)} style={{width:'100%'}}/>
    </div>)}
   </div>
   <small>Relative V825-Kostenprognose, nicht gemessene GPU-Auslastung. 100 % bedeutet keine V825-Drosselung – nicht zwingend, dass ein Effekt gerade sichtbar ist.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #666',borderRadius:8,padding:9}}><legend>Effekt-Instanzen (live geplante Sichtbarkeit)</legend>
   <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
    <span>Partikel <b>{format(totalParticles)}</b></span><span>Schaum <b>{format(totalFoam)}</b></span>
    <span>Publikum <b>{format(c.crowd)}</b></span><span>LED-Säulen <b>{format(c.kineticColumns)}</b></span>
    <span>Spektral <b>{format(c.spectralWaves+c.spectralRings+c.spectralPrisms)}</b></span>
   </div>
   <small>Partikel: {c.sparks} Funken, {c.shards} Splitter, {c.confetti} Konfetti, {c.energyRings} Ringe · Schaum: {c.foamBubbles} Blasen, {c.foamMist} Nebelpartikel.</small>
   <div style={{marginTop:7}}>Three.js-Rendererzähler: {format(snapshot.rendererCalls)} Draw Calls, {format(snapshot.rendererTriangles)} Dreiecke, {format(snapshot.rendererGeometries)} Geometrien, {format(snapshot.rendererTextures)} Texturen.</div>
   <small>Rendererzähler sind Momentaufnahmen aus WebGLRenderer.info und können durch automatisches Zurücksetzen abweichen. Instanzwerte sind Render-Cue-Sollzahlen, keine GPU-Primitive-Messungen.</small>
  </fieldset>
  <div><b>Diagnose-Hinweise</b><ul>{snapshot.recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul></div>
 </section>;
}
