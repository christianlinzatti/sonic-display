'use client';
/** V904 – read-only regression warnings over multiple completed V903 reviews.
 * No polling, new telemetry sampling, automatic settings change or persistence.
 */
import {useMemo,useState} from 'react';
import {exportConcertRegressionsV904,summarizeConcertRegressionsV904,
 type RegressionRecordV904,type RegressionStatusV904} from './concertQualityRegressionV904';
interface Props {history:readonly RegressionRecordV904[];onClear:()=>void}
const titles:Record<RegressionStatusV904,string>={
 insufficient:'Weitere Vergleiche erforderlich',unstable:'Schwankende FPS-Werte',
 'no-benefit':'Kein konsistenter Vorteil','possible-benefit':'Möglicher Vorteil','regression':'Mögliche Verschlechterung'};
const shade:Record<RegressionStatusV904,string>={
 insufficient:'#a6adba',unstable:'#f2bf7a','no-benefit':'#f2bf7a','possible-benefit':'#83d8b2',regression:'#e99797'};
const signed=(n:number,unit='')=>`${n>=0?'+':''}${n.toFixed(1)}${unit}`;
export function ConcertQualityRegressionPanelV904({history,onClear}:Props){
 const groups=useMemo(()=>summarizeConcertRegressionsV904(history),[history]);
 const [confirmClear,setConfirmClear]=useState(false);
 const download=()=>{
  const url=URL.createObjectURL(new Blob([exportConcertRegressionsV904(history)],{type:'application/json;charset=utf-8'}));
  try{const a=document.createElement('a');a.href=url;a.download='sonic-concert-regression-v904.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <fieldset className="concert-director-options-v895 concert-quality-regression-v904" aria-label="Concert Quality Regression Guard">
  <legend>V904 · Concert Quality Regression Guard</legend>
  <p style={{margin:'4px 0 8px'}}>Mehrere vollständige V903-Vergleiche derselben Songszene und derselben Einstellung zusammenfassen. Keine automatische Änderung.</p>
  <div role="status" aria-live="polite"><small>{history.length} abgeschlossene Vergleiche in dieser Sitzung · {groups.length} Vergleichsgruppen · mindestens drei Wiederholungen je Gruppe</small></div>
  {!groups.length?<small>Noch keine abgeschlossene V903-Nachmessung. Wiederhole dieselbe Einstellung im gleichen Songabschnitt, um einen vorsichtigen Trend zu erkennen.</small>:<div style={{display:'grid',gap:8,margin:'9px 0'}}>
   {groups.map(g=><div key={g.groupId} style={{border:'1px solid #7778',borderRadius:9,padding:10}}>
    <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
     <b>{g.patch.target}.{g.patch.field} · {String(g.patch.before)} → {String(g.patch.value)}</b>
     <strong style={{color:shade[g.status]}}>{titles[g.status]}</strong>
    </div>
    <small>Szene #{g.sceneIndex+1} · {g.repeats} vollständige Messvergleiche · {g.targetFps}-FPS-Ziel · {g.tier}</small>
    <div style={{margin:'6px 0'}}>Median FPS {signed(g.fpsMedian)} · Ø FPS-Differenz {signed(g.fpsMean)} · FPS-Spannweite {g.fpsSpread.toFixed(1)} · Median Framezeit {signed(g.frameMsMedian,' ms')}</div>
    <small>{g.positive} mit besseren FPS, {g.negative} mit schlechteren FPS · P95-Median {signed(g.p95Median,' ms')}. {g.reason}</small>
   </div>)}
  </div>}
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type="button" className="concert-transition-export-v884" disabled={!history.length} onClick={download}>V904 Zusammenfassung als JSON exportieren</button>
   {!confirmClear?<button type="button" className="concert-transition-export-v884" disabled={!history.length} onClick={()=>setConfirmClear(true)}>Sitzungsvergleiche löschen prüfen</button>:
    <section aria-label="V904 Vergleichsverlauf löschen bestätigen" style={{padding:8,border:'1px solid #b4a17b',borderRadius:9}}>
     <strong>Nur den Messverlauf dieser Sitzung löschen?</strong>
     <p style={{margin:'5px 0'}}>Keine Show-Einstellung oder manuelle Timeline wird geändert.</p>
     <button type="button" className="concert-transition-export-v884" onClick={()=>{setConfirmClear(false);onClear();}}>Messverlauf ausdrücklich löschen</button>{' '}
     <button type="button" className="concert-transition-export-v884" onClick={()=>setConfirmClear(false)}>Abbrechen</button>
    </section>}
  </div>
  <small style={{display:'block',marginTop:8}}>Nur V826-Renderer-Frame-Abstände, keine GPU-Zeit oder optische Qualitätsbewertung. Messungen desselben Songs und derselben Szene werden nicht mit anderen Songs vermischt. Drei Wiederholungen liefern lediglich eine Tendenz, keine statistische oder kausale Garantie. Nur im Arbeitsspeicher; der Export enthält keine Spotify-Trackkennung.</small>
 </fieldset>;
}
