'use client';
import {useEffect,useRef,useState} from 'react';
import {localImmersivePlanV982,normalizeImmersivePlanV982,
 type ImmersivePlanV982,type ImmersiveSectionV982} from '@/lib/immersiveAiDirectorV982';
const names:Record<ImmersiveSectionV982,string>={intro:'Intro',verse:'Verse',hook:'Hook',drop:'Drop',finale:'Finale'};
const examples=['Düsterer Deutschrap-Club, Fokus auf Lyrics und Bass','Hardtekk-Reaktor, epische Drops, neonblau','Großes Deutschrock-Arena-Finale, warmes Licht'];
export function ImmersiveAiDirectorV982({trackId,genre,onApply,onUndo,undoAvailable,canApply}:{
 trackId:string;genre:string;onApply:(plan:ImmersivePlanV982)=>void;
 onUndo:()=>boolean;undoAvailable:boolean;canApply:boolean;
}){
 const [prompt,setPrompt]=useState(examples[0]);
 const [plan,setPlan]=useState<ImmersivePlanV982|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [applied,setApplied]=useState(false);
 const requestId=useRef(0);
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>{requestId.current++;controller.current?.abort();controller.current=null;
  setBusy(false);setPlan(null);setSource(null);setMessage('');setApplied(false);
 },[trackId]);
 useEffect(()=>()=>{controller.current?.abort();requestId.current++;},[]);
 const local=()=>{
  controller.current?.abort();requestId.current++;
  setBusy(false);setPlan(localImmersivePlanV982(prompt,genre));
  setSource('local');setApplied(false);
  setMessage('Lokaler Entwurf – keine KI-Anfrage und keine Übermittlung an einen Anbieter.');
 };
 const ask=async()=>{
  if(prompt.trim().length<4||prompt.length>450){setMessage('Bitte 4 bis 450 Zeichen eingeben.');return;}
  controller.current?.abort();const c=new AbortController();controller.current=c;
  const id=++requestId.current;setBusy(true);setMessage('KI-Regie wird angefragt …');setPlan(null);setApplied(false);
  try{
   const response=await fetch('/api/ai/immersive-show',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt.trim(),genre}),signal:c.signal});
   const json:unknown=await response.json();
   if(id!==requestId.current)return;
   const data=json&&typeof json==='object'?json as Record<string,unknown>:{};
   if(!response.ok){setMessage(typeof data.error==='string'?data.error:'KI-Anfrage fehlgeschlagen.');return;}
   const normalized=normalizeImmersivePlanV982(data.plan);
   if(!normalized){setMessage('Der KI-Vorschlag war ungültig. Keine Änderungen übernommen.');return;}
   setPlan(normalized);setSource('ai');
   setMessage('KI-Vorschlag fertig. Noch keine Änderungen an der Show.');
  }catch(err){if(id===requestId.current&&!c.signal.aborted)
    setMessage('KI nicht erreichbar. Du kannst einen lokalen Entwurf erstellen.');}
  finally{if(id===requestId.current){setBusy(false);controller.current=null;}}
 };
 return <fieldset className="immersive-ai-v982" aria-label="KI Immersive Konzertregie V982">
  <legend>V982 · KI Immersive Show Studio</legend>
  <p>Beschreibe das Konzertgefühl. Die KI entwirft einen <b>Vorschlag</b> für vorhandene virtuelle Looks;
   erst mit deiner Freigabe werden Einstellungen übernommen.</p>
  <label htmlFor="sonic-immersive-prompt-v982">Regieanweisung</label>
  <textarea id="sonic-immersive-prompt-v982" value={prompt} maxLength={450} rows={3}
   onChange={e=>{controller.current?.abort();requestId.current++;setBusy(false);setPrompt(e.target.value);setPlan(null);setApplied(false);setMessage('');}}/>
  <div className="immersive-ai-presets-v982" aria-label="Beispielwünsche">
   {examples.map((example,i)=><button key={example} type="button"
    onClick={()=>{controller.current?.abort();requestId.current++;setBusy(false);setPrompt(example);setPlan(null);setApplied(false);setMessage('');}}>
    {i===0?'Deutschrap':i===1?'Hardtekk':'Deutschrock'}</button>)}
  </div>
  <div className="immersive-ai-actions-v982">
   <button type="button" disabled={busy||prompt.trim().length<4} onClick={()=>void ask()}>{busy?'KI arbeitet …':'KI-Regie fragen'}</button>
   <button type="button" disabled={prompt.trim().length<4} onClick={local}>Lokal entwerfen</button>
  </div>
  <small>Bei „KI-Regie fragen“ werden ausschließlich dieser Text und das angezeigte Genre an OpenAI gesendet.
   Keine Lyrics, Audioaufnahmen, Track-History oder Spotify-Zugangsdaten. API-Schlüssel nur auf dem Server.
   Die Abfrage kann API-Kosten verursachen.</small>
  {message&&<p className="immersive-ai-message-v982" role="status">{message}</p>}
  {plan&&<section className="immersive-ai-preview-v982" aria-label="Vorschau der Show" aria-live="polite">
   <div className="immersive-ai-preview-title-v982"><strong>{plan.title}</strong><small>{source==='ai'?'KI-Vorschlag':'Regelbasierter lokaler Vorschlag'}</small></div>
   <p>{plan.explanation}</p>
   <div className="immersive-ai-swatches-v982">
    <span className={`immersive-ai-color-v982 palette-${plan.palette}`} aria-hidden="true"/>
    <span>Bühne: {plan.look} · Atmosphäre: {plan.palette} · Tempo: {plan.pace}</span>
   </div>
   <p>Atmosphäre <b>{plan.atmosphereIntensity}%</b> · 3D-Look <b>{plan.stageIntensity}%</b> · FX-Obergrenze <b>{plan.fxIntensity}%</b></p>
   <ol>{plan.scenes.map(s=><li key={s.section}><b>{names[s.section]}</b> – {s.description}</li>)}</ol>
   <small>Die Szenen sind dramaturgische Ideen, keine nachgewiesenen Songabschnitte.
    Tatsächlich aktiv werden nur bereits freigeschaltete Effekte mit vorhandener verifizierter Timeline.
    Es werden keine realen Lichter oder Sprachassistenten angesteuert.</small>
   <div className="immersive-ai-actions-v982">
    <button type="button" disabled={!canApply||applied} onClick={()=>{onApply(plan);setApplied(true);
     setMessage('Show-Look übernommen. Voreinstellungen können jederzeit manuell angepasst werden.');}}>
     {applied?'Übernommen':'Diesen Show-Look übernehmen'}</button>
    {!canApply&&<small>Änderungen nur mit aktivierter automatischer Show und ohne reduzierte Bewegung.</small>}
   </div>
  </section>}
  {undoAvailable&&<button className="immersive-ai-undo-v982" type="button" onClick={()=>{
   const ok=onUndo();setMessage(ok?'Vorherige Show-Einstellungen wiederhergestellt.':
    'Seit der Übernahme wurden Einstellungen manuell geändert. Kein automatisches Überschreiben.');
   if(ok)setApplied(false);
  }}>Letzte KI-Übernahme rückgängig</button>}
 </fieldset>;
}
