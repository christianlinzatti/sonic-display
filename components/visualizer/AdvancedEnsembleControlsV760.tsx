"use client";
import {useEffect,useState} from 'react';
import {DEFAULT_ENSEMBLE_V760,readEnsembleV760,writeEnsembleV760,previewEnsembleV760,type EnsembleSettingsV760} from './advancedEnsembleDirectorV760';
/** Configuration and deterministic rehearsal preview, not a live singer detector. */
export function AdvancedEnsembleControlsV760({count,seconds,bpm,section}:{count:3|4;seconds:number;bpm:number;section?:string|null}){
 const [settings,setSettings]=useState<EnsembleSettingsV760>(DEFAULT_ENSEMBLE_V760);
 useEffect(()=>setSettings(readEnsembleV760()),[]);
 const put=(patch:Partial<EnsembleSettingsV760>)=>setSettings(writeEnsembleV760({...settings,...patch}));
 const preview=previewEnsembleV760({settings,count,seconds,bpm,section,lead:0});
 return <fieldset className="advanced-ensemble-v760"><legend>Advanced Ensemble Director · V760</legend>
  <p>Automatische 3–4-Personen-Ensemble-Regie mit musikalisch getakteten visuellen Rollentauschen, gemeinsamen Hook-Akzenten und zurückhaltenden Formationsbögen. Gilt nur für automatisch erzeugte Gruppen; manuelle Bühnen-Cues und Sängerrollen bleiben unberührt.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={(e:{target:{checked:boolean}})=>put({enabled:e.target.checked})}/> Zusätzliche Ensemble-Regie aktivieren</label>
  <div className="ensemble-studio-v325-controls">
   <label>Stärke ({settings.strength} %) <input type="range" min="0" max="100" value={settings.strength} onChange={(e:{target:{value:string}})=>put({strength:Number(e.target.value)})}/></label>
   <label>Übergänge ({settings.transitions} %) <input type="range" min="0" max="100" value={settings.transitions} onChange={(e:{target:{value:string}})=>put({transitions:Number(e.target.value)})}/></label>
   <label>Phrasenlänge <select value={settings.phraseBars} onChange={(e:{target:{value:string}})=>put({phraseBars:Number(e.target.value) as EnsembleSettingsV760['phraseBars']})}>{[4,8,16].map(n=><option key={n} value={n}>{n} Takte</option>)}</select></label>
   <label className="setting-check"><input type="checkbox" checked={settings.rotateLead} onChange={(e:{target:{checked:boolean}})=>put({rotateLead:e.target.checked})}/> Visuelle Führungsrolle wechseln (niemals Gesangsrolle)</label>
   <label className="setting-check"><input type="checkbox" checked={settings.travel} onChange={(e:{target:{checked:boolean}})=>put({travel:e.target.checked})}/> Minimale Bühnen-Tiefenbewegung bei freigegebenem Fußkontakt</label>
  </div>
  <p>Regie-Vorschau (simuliert): {preview.pattern==='off'?'Keine gültige Vorschau':`${preview.pattern} · visuelle Führungsposition ${preview.visualLead+1} · Phrase ${preview.phrase+1}`}</p>
  <small>Die Vorschau zeigt eine zeitbasierte Planung, keine Live-Messung. Die Live-Bühne aktiviert V760 nur für ihre automatisch erzeugte Gruppe und prüft zusätzlich Fußkontakt, Kollisionsrisiko und Performance-Stufe. Es werden keine GLB-Animationen erzeugt oder ersetzt.</small>
  <button type="button" onClick={()=>setSettings(writeEnsembleV760(DEFAULT_ENSEMBLE_V760))}>V760 zurücksetzen</button>
 </fieldset>;
}
