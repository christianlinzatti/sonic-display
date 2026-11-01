'use client';
import {useEffect,useState} from 'react';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {V751_OPEN_RENDER_QA_EVENT} from './concertDashboardStoreV751';
import {effectiveQualityTuneV755,TUNE_TTL_MS_V755} from './qualityAutoTunerV755';
import {setQualityAutoTuneEnabledV755,useQualityAutoTuneEnabledV755,
 useQualityAutoTuneStatusV755} from './qualityAutoTuneStoreV755';

export function QualityAutoTunePanelV755(){
 const enabled=useQualityAutoTuneEnabledV755();
 const status=useQualityAutoTuneStatusV755();
 const probe=useConcertQualityV466();
 const [now,setNow]=useState(0);
 useEffect(()=>{setNow(Date.now());const id=window.setInterval(()=>setNow(Date.now()),1000);
  return()=>window.clearInterval(id);},[]);
 const fresh=now>0&&status.lastAt>0&&now-status.lastAt<=TUNE_TTL_MS_V755;
 const factors=effectiveQualityTuneV755(status,{enabled,playing:fresh,reducedMotion:false,
  avatarStage:true,trackId:status.trackId,now});
 const measured=fresh&&probe.metricsAt===status.sampleAt;
 const format=(gain:number)=>`${Math.round((1-gain)*100)} %`;
 return <section className="v751-measurements" aria-label="V755 Smart Quality Auto-Tuning" data-v755-panel>
  <h3>V755 · Smart Quality Auto-Tuning</h3>
  <p>Freiwillige, stufenweise Anpassung anhand tatsächlicher WebGL-Messungen. Schützt die Lyrics und bevorzugt zuerst die Reduzierung automatischer Kamera- und Lichtakzente.</p>
  <label><input type="checkbox" checked={enabled} onChange={(e:{target:{checked:boolean}})=>setQualityAutoTuneEnabledV755(e.target.checked)}/>
   {' '}Automatische Qualitätsanpassung aktivieren (nur für diesen Tab)</label>{' '}
  <button type="button" onClick={()=>window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))}>
   WebGL-Probe auf der Bühne aktivieren
  </button>
  <p role="status">{!enabled?'Aus – keine Eingriffe':!fresh?'Wartet auf aktuelle WebGL-Daten einer laufenden 3D-Bühne':
   `Aktiviert · ${factors.active?'Dämpfung wirksam':'keine Dämpfung nötig'} · Stufe ${factors.level}/3 · ${status.reason==='slow'?'Leistungsabfall erkannt':status.reason==='recovering'?'Erholung läuft':'Leistung stabil'}`}</p>
  {enabled&&fresh&&<><div className="v751-summary">
   <div><small>Gemessene FPS</small><strong>{measured&&probe.fps!==null?probe.fps.toFixed(1):'Nicht verfügbar'}</strong></div>
   <div><small>P95 Frame-Time</small><strong>{measured&&probe.p95FrameMs!==null?`${probe.p95FrameMs.toFixed(1)} ms`:'Nicht verfügbar'}</strong></div>
   <div><small>Kamera-Zusatzakzente</small><strong>−{format(factors.camera)}</strong></div>
   <div><small>Licht-Zusatzakzente</small><strong>−{format(factors.lighting)}</strong></div>
  </div><small>Optionale Tanzakzente: −{format(factors.dance)} · Vocal-Körperakzente: −{format(factors.vocal)} · Lyrics-Glows: −{format(factors.lyricsAccent)}.
  {factors.visualGuard?' V754 meldet eine geometrische Auffälligkeit; keine Pixelverdeckung bestätigt.':''}</small></>}
  <p><small>Manuelle Szenen, Sänger-Zuordnungen, GLB-Clips, Lippenanimation und Fuß-IK bleiben unverändert. Keine Änderung der Renderauflösung, Avataranzahl oder gespeicherten Einstellungen. Ohne Probe, bei Pause oder bei veralteten Daten wird die Zusatzdämpfung neutral. Für faire V753-Vergleichsbenchmarks diese Funktion ausschalten.</small></p>
 </section>;
}
