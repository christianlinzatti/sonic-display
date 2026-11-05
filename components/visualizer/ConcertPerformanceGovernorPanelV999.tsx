'use client';
import {useEffect,useState} from 'react';
import {configureConcertGovernorV999,useConcertGovernorV999,GOVERNOR_TTL_V999} from './concertPerformanceGovernorStoreV999';
import {concertBudgetFactorsV999} from './intelligentPerformanceGovernorV999';
/** Read-only status and opt-in override; never changes saved effects or avatar settings. */
export function ConcertPerformanceGovernorPanelV999(){
 const s=useConcertGovernorV999();
 const [now,setNow]=useState(0);
 useEffect(()=>{setNow(Date.now());const timer=window.setInterval(()=>setNow(Date.now()),1000);
  return()=>window.clearInterval(timer);},[]);
 const fresh=s.enabled&&s.active&&now>=s.at&&now-s.at<=GOVERNOR_TTL_V999;
 const level=fresh?s.state.level:0;
 const factors=concertBudgetFactorsV999(level);
 return <section className="v751-measurements" aria-label="V999 Intelligent Performance Governor" data-v999-governor>
  <h3>V999 · Intelligent Performance Governor</h3>
  <p>Automatische Reduktion <strong>optionaler</strong> Konzertdekoration auf Basis der bestehenden WebGL-Frame-Messung. Keine zusätzliche Messschleife und keine Änderung von Lyrics, Lip-Sync, Fuß-IK, Songzeit oder Govee.</p>
  <label><input type="checkbox" checked={s.enabled} onChange={e=>configureConcertGovernorV999(e.target.checked)}/>{' '}Dekorationsbudget automatisch anpassen (nur im Qualitätsmodus Auto)</label>
  <label> Zielbildrate{' '}<select value={s.targetFps} onChange={e=>configureConcertGovernorV999(s.enabled,Number(e.target.value) as 30|45|60)} aria-label="V999 FPS Ziel">
   <option value={30}>30 FPS · Raspberry Pi</option><option value={45}>45 FPS · Ausgewogen</option><option value={60}>60 FPS · Desktop</option>
  </select></label>
  <p role="status">{!s.enabled?'Ausgeschaltet':!fresh?'Wartet auf gültige Live-Messungen im Auto-Modus':`Aktiv · Qualitätsdruck ${level}/3 · ${s.fps?.toFixed(1)} FPS · P95 ${s.p95FrameMs?.toFixed(1)} ms`}</p>
  <p><small>Zusatzbudget: Nebeltiefe {Math.round(factors.depth*100)} % · Publikum {Math.round(factors.crowd*100)} % · LED-Motive {Math.round(factors.led*100)} % · Bass-Schockwellen {Math.round(factors.bass*100)} %.</small></p>
  <p><small>Herabstufen nach anhaltendem Leistungsabfall, Wiederherstellung nur nach längerer stabiler Phase. Keine GPU-Zeitmessung, keine garantierten FPS. Manuelle Qualitätsstufen und nicht aktuelle Messungen greifen nicht ein.</small></p>
 </section>;
}
