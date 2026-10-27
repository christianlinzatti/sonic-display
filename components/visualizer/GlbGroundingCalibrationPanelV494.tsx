"use client";
import {useEffect,useState} from 'react';
import {DEFAULT_GLB_GROUND_CALIBRATION_V494,GLB_GROUND_REPORT_EVENT_V494,
 readGlbGroundCalibrationsV494,writeGlbGroundCalibrationV494,
 type GlbGroundCalibrationV494,type GlbGroundReportV494} from './realisticGlbFootContactV494';
/** V494 diagnostic/config surface. Subscribes to the existing 2Hz group report;
 * no geometry queries, new render loops or automatic changes to imported clips.
 */
export function GlbGroundingCalibrationPanelV494(){
 const [report,setReport]=useState<GlbGroundReportV494|null>(null);
 const [selected,setSelected]=useState('');
 const [settings,setSettings]=useState<GlbGroundCalibrationV494>(DEFAULT_GLB_GROUND_CALIBRATION_V494);
 const [message,setMessage]=useState('');
 useEffect(()=>{
  const listen=(ev:Event)=>{const next=(ev as CustomEvent<GlbGroundReportV494>).detail;
    if(next&&Array.isArray(next.slots)&&next.count<=4)setReport(next);};
  window.addEventListener(GLB_GROUND_REPORT_EVENT_V494,listen);
  return()=>window.removeEventListener(GLB_GROUND_REPORT_EVENT_V494,listen);
 },[]);
 const models=Array.from(new Set((report?.slots??[]).map(s=>s.modelId).filter(Boolean)));
 const load=(id:string)=>{setSelected(id);setSettings(readGlbGroundCalibrationsV494()[id]??DEFAULT_GLB_GROUND_CALIBRATION_V494);setMessage('');};
 const save=()=>{
  const result=writeGlbGroundCalibrationV494(selected,settings);
  setMessage(result?'Modell-Kalibrierung gespeichert.':'Speichern nicht möglich (z. B. privater Modus).');
 };
 return <fieldset className="stage-director-v287 glb-ground-calibration-v494">
  <legend>GLB Foot Contact Calibration · V494</legend>
  <p>Beruhigt nur zusätzliche automatische Seitwärtsschritte während Hocke, Aufstehen und festem Fußkontakt. Deine GLB-Clips, Fuß-IK und manuellen Formationen bleiben unverändert.</p>
  {report?.slots.map((slot,i)=><div key={i} style={{fontSize:12,marginBottom:5}}>
    Avatar {i+1}: {slot.modelId||'Modell-ID nicht verfügbar'} · {slot.phase} · automatische Schrittbewegung {Math.round(slot.gain*100)} %
    {slot.support!=='none'?` · Fußkontakt: ${slot.support}`:''}
  </div>)}
  {models.length?<>
   <label>Kalibrierung für GLB-Modell
    <select value={models.includes(selected)?selected:''} onChange={e=>load(e.target.value)}>
     <option value="">Modell auswählen</option>
     {models.map(id=><option value={id} key={id}>{id}</option>)}
    </select>
   </label>
   {selected&&models.includes(selected)&&<>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>setSettings(v=>({...v,enabled:e.target.checked}))}/> Automatische Fußkontakt-Beruhigung aktiv</label>
    <label>Zusatzbewegung bei beidseitigem Stand ({Math.round(settings.stanceDamping*100)} %)
     <input type="range" min="10" max="100" step="5" value={Math.round(settings.stanceDamping*100)} onChange={e=>setSettings(v=>({...v,stanceDamping:Number(e.target.value)/100}))}/>
    </label>
    <label>Sanftes Aufstehen/Absenken ({settings.transitionHoldMs} ms)
     <input type="range" min="0" max="800" step="40" value={settings.transitionHoldMs} onChange={e=>setSettings(v=>({...v,transitionHoldMs:Number(e.target.value)}))}/>
    </label>
    <label>Drift-Schwelle ({settings.driftThresholdCm.toFixed(1)} cm, geschätzt)
     <input type="range" min="1.5" max="12" step="0.5" value={settings.driftThresholdCm} onChange={e=>setSettings(v=>({...v,driftThresholdCm:Number(e.target.value)}))}/>
    </label>
    <button type="button" onClick={save}>Kalibrierung speichern</button>
    {message&&<p role="status">{message}</p>}
   </>}
  </>:<p>Noch keine bekannten Modell-IDs. Starte eine automatische GLB-Gruppenshow mit aktiver Foot-IK.</p>}
  <small>Drift-Werte sind nur Knöchel-/Standanker-Schätzungen. Ohne aktive Fuß-IK ist die Beruhigung deaktiviert; keine echte Bodenkollision, kein IK-Retargeting.</small>
 </fieldset>;
}
