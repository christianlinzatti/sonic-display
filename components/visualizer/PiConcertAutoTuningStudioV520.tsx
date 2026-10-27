'use client';
import {useEffect,useState} from 'react';
import {useAdaptivePerformance,setPerformanceMode} from './adaptivePerformance';
import {PiConcertQualityPresetsV521} from './PiConcertQualityPresetsV521';
import {previewConcertPresetV521,type ConcertPresetIdV521} from '@/services/monitoring/concertQualityPresetsV521';
import {readPiProfile,type PiProfile} from './piDeviceProfile';
import {proposeConcertTuneV520,assessConcertTrialV520,validV520Trial,
 type V520Trial,type V520Mode} from '@/services/monitoring/concertAutoTuningV520';
import {validOptimizationCaptureV519} from '@/services/monitoring/concertOptimizationAdvisorV519';
import type {PiStudioCaptureV518} from '@/services/monitoring/piConcertPerformanceStudioV518';

const STORAGE='sonic-display:v520:pending-quality-trial';
const format=(n:number|null)=>n===null||!Number.isFinite(n)?'—':n.toFixed(1);
/** User-triggered one-setting experiment. The original quality mode is stored before applying.
 * No setting changes in effects; explicit click handlers only. */
export function PiConcertAutoTuningStudioV520({captures,liveConfiguration}:{
  captures:readonly PiStudioCaptureV518[];liveConfiguration:string|null;
}){
 const quality=useAdaptivePerformance();
 const [trial,setTrial]=useState<V520Trial|null>(null);
 const [targetFps,setTargetFps]=useState<30|45|60>(30);
 const [presetId,setPresetId]=useState<ConcertPresetIdV521>('ensemble');
 const [notice,setNotice]=useState('');
 const [profile,setProfile]=useState<PiProfile>('off');
 useEffect(()=>{
   const refresh=()=>setProfile(readPiProfile());refresh();
   window.addEventListener('sonic:pi-profile-changed',refresh);
   try{const raw=window.sessionStorage.getItem(STORAGE);
     if(raw){const restored:unknown=JSON.parse(raw);if(validV520Trial(restored))setTrial(restored);
       else window.sessionStorage.removeItem(STORAGE);}
   }catch{/* Corrupt/unavailable storage: never apply anything automatically. */}
   return ()=>window.removeEventListener('sonic:pi-profile-changed',refresh);
 },[]);
 const latest=captures[captures.length-1];
 const proposal=proposeConcertTuneV520(latest,quality,profile,Date.now(),targetFps,
   liveConfiguration);
 const measured=assessConcertTrialV520(trial,captures,quality.mode,profile);
 const presetPreview=previewConcertPresetV521(presetId,quality,proposal,captures);
 const canUndo=trial!==null&&quality.mode===trial.targetMode&&profile==='off';
 function begin(){
  if(trial){setNotice('Zuerst den laufenden Test abschließen oder zurücknehmen.');return;}
  const candidate=captures[captures.length-1];
  const safe=proposeConcertTuneV520(candidate,quality,readPiProfile(),Date.now(),targetFps,
    liveConfiguration);
  if(!safe.allowed||!safe.targetMode||!validOptimizationCaptureV519(candidate)||
    !previewConcertPresetV521(presetId,quality,safe,captures).canStartV520){
    setNotice(!safe.allowed?safe.reason:'Gewähltes V521-Profil kann mit dieser V520-Einzeländerung nicht sicher getestet werden.');return;
  }
  const pending:V520Trial={version:520,baseline:candidate,previousMode:quality.mode as V520Mode,
    targetMode:safe.targetMode,startedAt:Date.now()};
  try{window.sessionStorage.setItem(STORAGE,JSON.stringify(pending));}
  catch{setNotice('Sitzungsspeicher nicht verfügbar. Test wird ohne zuverlässige Rücknahme nicht gestartet.');return;}
  setTrial(pending);
  setPerformanceMode(pending.targetMode);
  setNotice(`Test aktiv: ${pending.previousMode} → ${pending.targetMode}. Nach mindestens sechs stabilen Messfenstern den Messpunkt oben übernehmen.`);
 }
 function rollback(){
  if(!trial)return;
  // Never undo a later manual change from another settings view.
  if(quality.mode!==trial.targetMode||readPiProfile()!=='off'){
    setNotice('Der Qualitätsmodus oder das Pi-Profil wurde außerhalb des Tests verändert. Zum Schutz werden keine fremden Einstellungen überschrieben.');return;
  }
  setPerformanceMode(trial.previousMode);
  try{window.sessionStorage.removeItem(STORAGE);}catch{/* next reload can show stale trial, without applying anything */}
  setTrial(null);setNotice(`Grafikmodus ${trial.previousMode} wiederhergestellt. Andere Einstellungen unverändert.`);
 }
 function keep(){
  if(!trial||measured.status!=='ready'||!canUndo||quality.tier!==trial.targetMode){
   setNotice('Nur mit gültiger Nachmessung und unverändertem Testmodus beibehalten.');return;
  }
  try{window.sessionStorage.removeItem(STORAGE);}catch{setNotice('Testabschluss konnte nicht gespeichert werden. Änderung vorerst nicht bestätigt.');return;}
  setTrial(null);setNotice(`Grafikmodus ${trial.targetMode} ausdrücklich beibehalten. Du kannst ihn jederzeit über die vorhandenen Qualitätseinstellungen ändern.`);
 }
 function discard(){
  // Only allow discard when there is no active target mode to leave behind.
  if(!trial||canUndo)return;
  try{window.sessionStorage.removeItem(STORAGE);}catch{setNotice('Teststatus kann nicht entfernt werden.');return;}
  setTrial(null);setNotice('Testvermerk verworfen. Zwischenzeitliche manuelle Einstellungen wurden nicht überschrieben.');
 }
 return <div className="settings-note" aria-label="V520 Concert Performance Auto-Tuning Studio">
   <PiConcertQualityPresetsV521 selected={presetId} onSelect={setPresetId} quality={quality}
      proposal={proposal} captures={captures} trialActive={trial!==null} />
   <h5>V520 – Concert Performance Auto-Tuning Studio</h5>
   <p>Kontrollierter, rücknehmbarer Qualitätstest mit der echten Hauptbühne. Ein Test verändert <strong>nur den Grafikmodus</strong>; die daraus folgende DPR-Anpassung gehört ausdrücklich dazu. Andere V519-Empfehlungen bleiben manuell.</p>
   {!trial&&<>
     <label>FPS-Ziel <select value={targetFps} onChange={e=>setTargetFps(Number(e.target.value) as 30|45|60)}>
       <option value={30}>30 FPS</option><option value={45}>45 FPS</option><option value={60}>60 FPS</option>
     </select></label>
     <p role="status">{proposal.allowed?`Testvorschlag: ${proposal.reason}`:proposal.reason}</p>
     <p>Aktuell: <strong>{quality.mode}</strong> · gemessene Stufe <strong>{quality.tier}</strong> · DPR {format(quality.dpr)}. Referenz: {latest&&validOptimizationCaptureV519(latest)?`${format(latest.avgFps)} FPS, ${latest.avatarCount} Avatare, ${latest.count} Messfenster`:'noch keine gültige Messung'}.</p>
     <button type="button" onClick={begin} disabled={!presetPreview.canStartV520}>V521-Profil mit V520-Rücknahme testen</button>
   </>}
   {trial&&<>
     <p role="status"><strong>Test läuft:</strong> {trial.previousMode} → {trial.targetMode} · Referenz {format(trial.baseline.avgFps)} FPS / P95 {format(trial.baseline.worstWindowP95Ms)} ms.</p>
     <p><strong>Aktuelle Grafikstufe:</strong> {quality.mode}/{quality.tier} · DPR {format(quality.dpr)}. Die geänderte Stufe bleibt bis zur expliziten Rücknahme oder Bestätigung aktiv – auch beim Verlassen dieser Ansicht.</p>
     <p>{measured.reason}</p>
     {measured.candidate&&<p>Nachmessung: {format(measured.candidate.avgFps)} FPS · P95 {format(measured.candidate.worstWindowP95Ms)} ms · Δ FPS {measured.fpsDelta!==null&&measured.fpsDelta>=0?'+':''}{format(measured.fpsDelta)} · Δ P95 {measured.p95DeltaMs!==null&&measured.p95DeltaMs>=0?'+':''}{format(measured.p95DeltaMs)} ms · Änderungen: {measured.changes.join(' + ')||'keine'}.</p>}
     {measured.status==='ready'&&<p>{measured.positiveObservation?'Beide Kennzahlen haben sich in dieser Messung verbessert.':'Kein gleichgerichteter Vorteil bei beiden Messwerten.'} Beobachtung, kein garantierter oder kausal belegter Leistungsgewinn.</p>}
     <div className="concert-actions-v480">
       <button type="button" onClick={rollback} disabled={!canUndo}>Vorherigen Grafikmodus wiederherstellen</button>
       <button type="button" onClick={keep} disabled={measured.status!=='ready'||!canUndo||quality.tier!==trial.targetMode}>Messung akzeptieren und Änderung beibehalten</button>
       {!canUndo&&<button type="button" onClick={discard}>Nur Testvermerk verwerfen</button>}
     </div>
   </>}
   {notice&&<p role="status">{notice}</p>}
   <p>Messpunkte müssen denselben Songabschnitt, dieselbe Bühne und vergleichbare Betriebsbedingungen nutzen. Keine Änderung von Rap-Lip-Sync, Wort-Lyrics, Licht, Avataren, GLB-Clips, Fuß-IK oder manuellen Choreografien. Nach einem Browserneustart kann der Testvermerk wiederhergestellt werden, sofern Sitzungsspeicher erhalten blieb.</p>
 </div>;
}
