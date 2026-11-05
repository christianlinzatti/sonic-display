'use client';
/** Touch-sized, explicit two-step virtual concert control. Existing V998 assistant remains separate. */
import {useState} from 'react';
import {touchPlanV1001,canCommitTouchV1001,canUndoTouchV1001,TOUCH_LANES_V1001,
 type TouchContextV1001,type TouchValuesV1001,type TouchLaneV1001,
 type TouchPreviewV1001,type TouchPresetV1001} from './interactiveConcertControlV1001';
const labels:Record<TouchLaneV1001,string>={stage:'Bühnenregie',camera:'Kamera',dance:'Tanz',lights:'Virtuelles Licht'};
const profiles:readonly {id:TouchPresetV1001;label:string;help:string}[]=[
 {id:'intimate',label:'Intim',help:'Ruhige, nahe Inszenierung'},
 {id:'balanced',label:'Ausgewogen',help:'Aktuelle Intensitäten erhalten'},
 {id:'festival',label:'Festival',help:'Mehr Dynamik im virtuellen Raum'},
 {id:'finale',label:'Finale',help:'Kontrollierter Höhepunkt'},
];
const all:Readonly<Record<TouchLaneV1001,boolean>>={stage:true,camera:true,dance:true,lights:true};
export function InteractiveConcertControlV1001({context,current,onChange}:{
 context:TouchContextV1001;current:TouchValuesV1001;
 onChange:(values:TouchValuesV1001)=>void;
}){
 const [preset,setPreset]=useState<TouchPresetV1001>('balanced');
 const [strength,setStrength]=useState(50);
 const [chosen,setChosen]=useState<Readonly<Record<TouchLaneV1001,boolean>>>(all);
 const [review,setReview]=useState<TouchPreviewV1001|null>(null);
 const [undo,setUndo]=useState<TouchPreviewV1001|null>(null);
 const [message,setMessage]=useState('');
 const reset=()=>{setReview(null);setMessage('');};
 const permitted=Boolean(context.controlsReady&&context.verified&&context.playing&&context.autoEnabled&&!context.manual&&!context.reducedMotion&&!context.seekBlocked);
 return <fieldset className="concert-touch-v1001" aria-label="V1001 Interactive Concert Control" data-v1001-touch>
  <legend>V1001 · Interactive Concert Control</legend>
  <p>Vier bestehende virtuelle Regler, eine Vorschau. Keine neuen Gerätebefehle und kein automatisches Aktivieren abgeschalteter Effekte.</p>
  <div className="concert-touch-presets-v1001" role="group" aria-label="Touch-Regieprofile">
   {profiles.map(p=><button type="button" key={p.id} aria-pressed={preset===p.id}
    title={p.help} onClick={()=>{setPreset(p.id);reset();}}>{p.label}</button>)}
  </div>
  <label className="concert-touch-master-v1001" htmlFor="touch-master-v1001">
   Konzertintensität · {strength} %
   <input id="touch-master-v1001" type="range" min="0" max="100" step="5" value={strength}
    onChange={e=>{setStrength(Number(e.target.value));reset();}}/>
  </label>
  <div className="concert-touch-lanes-v1001" role="group" aria-label="Virtuelle Bereiche auswählen">
   {TOUCH_LANES_V1001.map(k=><label key={k} className="concert-touch-lane-v1001">
    <input type="checkbox" checked={chosen[k]} onChange={e=>{setChosen(x=>({...x,[k]:e.target.checked}));reset();}}/>
    <span>{labels[k]} <small>{current[k].enabled?`${current[k].intensity} %`:'Aus – geschützt'}</small></span>
   </label>)}
  </div>
  <div className="concert-touch-actions-v1001">
   <button type="button" disabled={!permitted} onClick={()=>{
    const plan=touchPlanV1001(current,context,preset,strength,chosen);setReview(plan);
    setMessage(plan?'Vorschau erstellt. Vor der Übernahme Änderungen prüfen.':'Show aktuell geschützt. Keine Änderung.');
   }}>Änderungen anzeigen</button>
   <button type="button" disabled={!review||!permitted||!review.diffs.length} onClick={()=>{
    if(!canCommitTouchV1001(review,current,context)){
     setReview(null);setMessage('Show oder Regler wurden geändert. Erneut Vorschau erstellen.');return;
    }
    onChange(review!.after);setUndo(review);setReview(null);setMessage('Virtuelle Einstellungen übernommen.');
   }}>Vorschau übernehmen</button>
  </div>
  {review&&<div className="concert-touch-preview-v1001" aria-live="polite">
   <strong>Freigabevorschau</strong>
   {review.diffs.length?<ul>{review.diffs.map(d=><li key={d.lane}>
    {labels[d.lane]}: <b>{d.before} % → {d.after} %</b></li>)}</ul>:
    <p>Keine Änderungen: abgeschaltete Funktionen werden nicht automatisch eingeschaltet.</p>}
   <small>Die Werte gelten für vorhandene Regler. Tatsächliche Effekte brauchen bestätigte Songabschnitte und bleiben durch manuelle Regie, Lyrics und V999 begrenzt.</small>
  </div>}
  {undo&&<button type="button" className="concert-touch-undo-v1001" onClick={()=>{
   if(!canUndoTouchV1001(undo,current,context)){
    setUndo(null);setMessage('Seitdem wurde ein Regler oder die Show verändert. Nichts überschrieben.');return;
   }
   onChange(undo.before);setUndo(null);setMessage('Letzte Touch-Änderung zurückgenommen.');
  }}>Letzte Touch-Änderung rückgängig</button>}
  {!permitted&&<p className="concert-touch-help-v1001">Vorschau/Übernahme erst bei laufendem Song, bestätigter Szene, aktiver Automatik und ohne manuelle oder barrierefreie Sperre.</p>}
  <p role="status" aria-live="polite">{message}</p>
  <small>Keine KI-Anfrage, kein Spotify- oder Govee-Befehl. Für natürliche Sprache den vorhandenen V998 Live AI Concert Assistant verwenden.</small>
 </fieldset>;
}
