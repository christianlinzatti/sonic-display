'use client';
import dynamic from 'next/dynamic';
import {useEffect,useMemo,useState} from 'react';
import type {ShowPlanV790} from './cinematicShowDirectorV790';
import type {ImprovementPreviewV802} from './concertImprovementAssistantV802';
import {resolveConcertComparisonV803} from './visualConcertComparisonV803';
import type {StageEnvironmentId} from './stages';
import type {PerformerPreviewV805} from './multiPerformerVisibilityV805';
const CameraComparisonCanvasV803=dynamic(()=>import('./CameraComparisonCanvasV803').then(m=>m.CameraComparisonCanvasV803),{
  ssr:false,loading:()=> <p role="status">3D-Szenenvergleich wird geladen …</p>});
const format=(ms:number)=>{const s=Math.floor(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
export function VisualConcertComparisonPanelV803({plan,draft,modelUrl,avatarChoicesV805,stageTheme}:{
  plan:ShowPlanV790;draft:ImprovementPreviewV802;modelUrl?:string|null;avatarChoicesV805?:readonly PerformerPreviewV805[];stageTheme?:StageEnvironmentId}){
  const [sceneIndex,setSceneIndex]=useState(-1);
  const [position,setPosition]=useState<number|undefined>(undefined);
  const [open,setOpen]=useState(false);
  const [secondId,setSecondId]=useState('');
  const [thirdId,setThirdId]=useState('');
  const changes=draft.source==='verified-draft'?draft.changes:[];
  const signature=`${plan.trackId}:${plan.durationMs}:`+changes.map(c=>`${c.sceneIndex}:${c.before}:${c.after}`).join('|');
  useEffect(()=>{setOpen(false);setPosition(undefined);setSceneIndex(-1);setSecondId('');setThirdId('');},[signature]);
  const current=changes.some(c=>c.sceneIndex===sceneIndex)?sceneIndex:(changes[0]?.sceneIndex??-1);
  const comparison=useMemo(()=>resolveConcertComparisonV803(plan,draft,current,position),[plan,draft,current,position]);
  // Never invent participants from the audio: additional GLBs are explicit user selections.
  const choices=(avatarChoicesV805??[]).filter(p=>p.url&&p.id&&p.label&&
    /^(https?:\/\/|\/|blob:)/i.test(p.url)&&p.url!==modelUrl);
  const second=choices.find(p=>p.id===secondId);
  const third=choices.find(p=>p.id===thirdId&&p.id!==secondId);
  const performerModelsV805=[...(modelUrl?[{id:'lead',label:'Hauptavatar',url:modelUrl}]:[]),
    ...(second?[second]:[]),...(third?[third]:[])];
  const countV805=performerModelsV805.length;
  const scene=plan.scenes[current];
  return <div className="v803-comparison" data-v803-comparison>
    <h4>V803–V805 · Visual Concert Comparison &amp; Multi-Performer Inspector</h4>
    <p className="v751-hint">Den gleichen Avatar und dieselbe 3D-Bühne am exakt gleichen Zeitpunkt aus zwei Kamerawinkeln ansehen. V804 zeigt im geöffneten Vergleich die projizierten Körpergrenzen, Kopf-/Fußpositionen und eine angenommene Lyrics-Reserve. Die Kamera-Posen sind aus den V790-Absichten angenäherte Vorschauwerte, keine Live-Kameraaufzeichnung.</p>
    <div className="v803-controls">
      <label>Zu prüfender Kameraentwurf
        <select value={current} onChange={e=>{setSceneIndex(Number(e.target.value));setPosition(undefined);setOpen(false);}}>
          {changes.map(c=><option key={c.sceneIndex} value={c.sceneIndex}>
            Szene {c.sceneIndex+1} · {c.before} → {c.after} ({format(c.startMs)}–{format(c.endMs)})
          </option>)}
        </select>
      </label>
      {scene&&<label>Songzeitpunkt: {format(comparison?.progressMs??(scene.startMs+scene.endMs)/2)}
        <input type="range" min={scene.startMs+600} max={scene.endMs-600} step={100}
          value={Math.max(scene.startMs+600,Math.min(scene.endMs-600,position??(scene.startMs+scene.endMs)/2))}
          onChange={e=>setPosition(Number(e.target.value))}/>
      </label>}
    </div>
    <div className="v805-model-controls" data-v805-controls>
      <strong>V805 · Multi-Performer Visibility Studio</strong>
      <p>Bis zu drei echte GLB-Avatare gemeinsam prüfen. Zusätzliche Künstler werden nur durch deine Auswahl geladen; dies ist keine automatische Sängerzuordnung.</p>
      <label>Zweiter Performer
        <select value={second?.id??''} onChange={e=>{setSecondId(e.target.value);if(e.target.value===thirdId)setThirdId('');setOpen(false);}}>
          <option value="">Kein weiterer Performer</option>
          {choices.map(p=><option key={p.id} value={p.id} disabled={p.id===thirdId}>{p.label}</option>)}
        </select>
      </label>
      {second&&<label>Dritter Performer (optional)
        <select value={third?.id??''} onChange={e=>{setThirdId(e.target.value);setOpen(false);}}>
          <option value="">Kein dritter Performer</option>
          {choices.filter(p=>p.id!==second.id).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </label>}
      <small>{countV805>1?`${countV805} ausgewählte GLB-Avatare. Geometrieprüfung in beiden Kameras nach dem Öffnen.`:
        'Wähle einen weiteren GLB-Avatar aus der Bibliothek, um die Gruppenprüfung zu aktivieren.'}</small>
    </div>
    {comparison?<>
      <div className="v803-shot-meta"><span>Vorher: <strong>{comparison.before}</strong></span>
        <span>Nachher: <strong>{comparison.after}</strong></span>
        <span>Song: <strong>{format(comparison.progressMs)}</strong></span></div>
      <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
        {open?'3D-Vergleich schließen':'Echten 3D-Vergleich öffnen'}</button>
      {open&&<CameraComparisonCanvasV803 view={comparison}
        modelUrl={modelUrl??null} performerModelsV805={performerModelsV805} stageTheme={stageTheme??'classic'}/>}
      <small className="v803-disclaimer">Ein isolierter, angehaltener WebGL-Szenentest. Beide Ansichten verwenden dieselben 3D-Objekte, Lichter und dieselbe Pose. Die laufende Live-Show wird nicht umgeschaltet. Unbestätigte Sängerpositionen, Lippenbewegungen, Song-Effekte und manuelle Kamera-Cues werden nicht simuliert. Kein automatisches Qualitätsurteil aus Pixeln.</small>
    </>:<p role="status">Für diese Szene liegt kein konsistenter, bestätigter Kameravergleich vor. Keine Vorschau erstellt.</p>}
  </div>;
}
