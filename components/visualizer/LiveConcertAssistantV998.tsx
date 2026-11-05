'use client';
/** V998 – conversational opt-in UI. Never an auto-executing chat agent. */
import {useEffect,useRef,useState} from 'react';
import {localLivePlanV998,normalizeLivePlanV998,
 type LivePlanV998,type LiveDiffV998} from '@/lib/liveConcertAssistantV998';
const labels:Record<string,string>={
 atmosphere:'Atmosphäre',stage:'Virtuelle Bühne',camera:'Kamera',fx:'Virtuelle Effekte',
 palette:'Farbwelt',look:'Bühnen-Look',mode:'Kamerastil',intensity:'Intensität',cap:'FX-Obergrenze',
 noir:'Noir',electric:'Electric',arena:'Arena',dream:'Dream',
 reactor:'Reactor','rock-arena':'Rock-Arena',prism:'Prism',
 story:'Filmisch',performer:'Künstler-Nähe',festival:'Festival',
};
const examples=[
 'Mach die Bühne düsterer und zeige mehr Nahaufnahmen vom Rapper.',
 'Hardtekk: Neon-Atmosphäre, weite Festival-Kamera.',
 'Weniger Effekte und sanftere Kamerabewegungen.',
];
export function LiveConcertAssistantV998({trackId,genre,canApply,onPreview,onApply,onUndo,undoAvailable}:{
 trackId:string;genre:string;canApply:boolean;
 onPreview:(plan:LivePlanV998)=>LiveDiffV998[];
 onApply:(plan:LivePlanV998)=>boolean;onUndo:()=>boolean;undoAvailable:boolean;
}){
 const [prompt,setPrompt]=useState(examples[0]);
 const [plan,setPlan]=useState<LivePlanV998|null>(null);
 const [source,setSource]=useState<'ki'|'lokal'>('lokal');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [applied,setApplied]=useState(false);
 const [committedDiffs,setCommittedDiffs]=useState<LiveDiffV998[]>([]);
 const pending=useRef<AbortController|null>(null);
 const sequence=useRef(0);
 useEffect(()=>()=>{sequence.current++;pending.current?.abort();},[]);
 const reset=(next:string)=>{
  sequence.current++;pending.current?.abort();pending.current=null;setBusy(false);
  setPrompt(next);setPlan(null);setApplied(false);setCommittedDiffs([]);setMessage('');
 };
 const local=()=>{
  sequence.current++;pending.current?.abort();pending.current=null;setBusy(false);
  setPlan(localLivePlanV998(prompt));setSource('lokal');setApplied(false);setCommittedDiffs([]);setMessage('');
 };
 const ask=async()=>{
  const id=++sequence.current;
  pending.current?.abort();
  const controller=new AbortController();pending.current=controller;
  setBusy(true);setPlan(null);setApplied(false);setCommittedDiffs([]);setMessage('');
  try{
   const response=await fetch('/api/ai/live-concert',{method:'POST',credentials:'same-origin',
    cache:'no-store',headers:{'Content-Type':'application/json'},signal:controller.signal,
    body:JSON.stringify({prompt:prompt.trim(),genre:genre.slice(0,75)})});
   const result:unknown=await response.json();
   if(id!==sequence.current||controller.signal.aborted)return;
   if(!response.ok)throw Error('Remote response');
   const proposal=normalizeLivePlanV998((result as {plan?:unknown}).plan);
   if(!proposal)throw Error('Invalid proposal');
   setPlan(proposal);setSource('ki');
  }catch{if(id===sequence.current&&!controller.signal.aborted)
   setMessage('KI derzeit nicht verfügbar. „Lokal entwerfen“ funktioniert ohne API.');}
  finally{if(id===sequence.current){pending.current=null;setBusy(false);}}
 };
 const diffs=applied?committedDiffs:plan?onPreview(plan):[];
 return <fieldset className="immersive-ai-v982 live-concert-assistant-v998"
  aria-label="V998 Live AI Concert Assistant">
  <legend>V998 · Live AI Concert Assistant</legend>
  <p>Gib deiner laufenden virtuellen Show eine Regieanweisung. Erst prüfen, dann ausdrücklich übernehmen.</p>
  <label htmlFor="live-concert-prompt-v998">Live-Regieanweisung</label>
  <textarea id="live-concert-prompt-v998" value={prompt} rows={3} maxLength={450}
   onChange={e=>reset(e.target.value)}/>
  <div className="immersive-ai-presets-v982" aria-label="Live-Regiebeispiele">
   {examples.map((text,i)=><button key={text} type="button" onClick={()=>reset(text)}>
    {['Rap-Fokus','Festival','Ruhiger'][i]}</button>)}
  </div>
  <div className="immersive-ai-actions-v982">
   <button type="button" disabled={busy||prompt.trim().length<4}
    onClick={()=>void ask()}>{busy?'KI-Anfrage läuft …':'KI befragen'}</button>
   <button type="button" disabled={prompt.trim().length<4} onClick={local}>Lokal entwerfen</button>
  </div>
  <small>Nur Anweisung und Genre werden bei einer bewussten KI-Abfrage gesendet. Keine Lyrics,
   Audiodaten, Songhistorie oder Spotify-Zugangsdaten. Anfragen können API-Kosten verursachen.
   Ohne API-Schlüssel funktioniert der lokale Regieentwurf.</small>
  {message&&<p role="status" className="immersive-ai-message-v982">{message}</p>}
  {plan&&<section className="immersive-ai-preview-v982" aria-label="Live-Regievorschau" aria-live="polite">
   <div className="immersive-ai-preview-title-v982"><strong>{plan.title}</strong>
    <small>{source==='ki'?'KI-Vorschlag':'Regelbasierter Vorschlag'}</small></div>
   <p>{plan.explanation}</p>
   {diffs.length?<>
    <p><b>Vorher → nachher (nur virtuelle, bereits aktive Regler)</b></p>
    <ul>{diffs.map(d=><li key={`${d.target}.${d.field}`}>
     {labels[d.target]} / {labels[d.field]}: <b>{labels[String(d.before)]||d.before}</b>
     {' → '}<b>{labels[String(d.after)]||d.after}</b>{typeof d.after==='number'?' %':''}
    </li>)}</ul>
   </>:<p>Keine anwendbare Änderung. Nicht unterstützte oder deaktivierte Funktionen bleiben unverändert.</p>}
   <small>Keine automatische Ausführung, kein neuer Song-Zeitpunkt und keine Steuerung von
    Govee, Spotify oder anderen Geräten. Sicherheits- und Manuell-Vorrang bleiben aktiv.
    Einstellungen greifen nur im bestehenden Show-System.</small>
   <div className="immersive-ai-actions-v982">
    <button type="button" disabled={!canApply||applied||!diffs.length} onClick={()=>{
     const ok=onApply(plan);setApplied(ok);if(ok)setCommittedDiffs(diffs);
     setMessage(ok?'Freigegebene Änderungen übernommen. Rückgängig ist möglich.':
      'Show-Status hat sich verändert. Bitte Vorschau prüfen und erneut freigeben.');
    }}>{applied?'Übernommen':'Änderungen für die Show übernehmen'}</button>
   </div>
   {!canApply&&<small>Übernahme nur bei laufendem Song, aktiver Automatik und ohne reduzierte Bewegung.</small>}
  </section>}
  {undoAvailable&&<button type="button" className="immersive-ai-undo-v982" onClick={()=>{
   const ok=onUndo();if(ok){setApplied(false);setCommittedDiffs([]);}
   setMessage(ok?'Vorherige virtuelle Regler wiederhergestellt.':
    'Regler wurden seitdem verändert oder der Song wechselte: nichts überschrieben.');
  }}>Letzte Live-Regie rückgängig</button>}
 </fieldset>;
}
