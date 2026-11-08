'use client';
/** V1106 · Deliberate opt-in, preview, explicit apply and conflict-safe undo. */
import {useEffect,useRef,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {applyAiShowRemixV1106,localAiShowRemixV1106,normalizeAiShowRemixV1106,
 type AiShowRemixV1106,type RemixGenreV1106} from '@/lib/arena360AiShowRemixV1106';
const NAMES:Record<string,string>={intro:'Intro',verse:'Strophe',build:'Build-up',hook:'Hook',
 interlude:'Atempause',finale:'Finale'};
export function AiShowRemixPanelV1106({plan,prompt,genre,title,durationMs}:{
 plan:ArenaShowPlanV1040|null;prompt:string;genre:string;title:string;durationMs:number;
}){
 const {preferences,updatePreferences}=useUiPreferences();
 const [idea,setIdea]=useState('Düsteres Intro, starke Hook, schwebende Bühnen und ein überraschendes Finale');
 const [cap,setCap]=useState(70);
 const [preview,setPreview]=useState<AiShowRemixV1106|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const [baseSignature,setBaseSignature]=useState('');
 const [canUndo,setCanUndo]=useState(false);
 const controller=useRef<AbortController|null>(null);
 const requestId=useRef(0);
 const undo=useRef<{before:ArenaShowPlanV1040|null;after:string}|null>(null);
 const base=plan??generateArenaShowPlanV1040({prompt,genre,durationMs,title});
 const signature=JSON.stringify(base);
 const style:RemixGenreV1106=base.genre;
 const invalidate=()=>{controller.current?.abort();requestId.current++;setBusy(false);setPreview(null);setSource(null);setStatus('');};
 useEffect(()=>{controller.current?.abort();requestId.current++;setPreview(null);setSource(null);setBusy(false);
  return ()=>{controller.current?.abort();requestId.current++;};
 },[signature]);
 const local=()=>{
  invalidate();
  setPreview(localAiShowRemixV1106(idea,style,cap));setBaseSignature(signature);setSource('local');
  setStatus('Lokaler Remix: keine Netzwerk- oder KI-Anfrage. Noch nichts übernommen.');
 };
 const remote=async()=>{
  if(idea.trim().length<4||idea.length>400){setStatus('Bitte 4 bis 400 Zeichen eingeben.');return;}
  invalidate();
  const id=requestId.current;
  const current=new AbortController();controller.current=current;
  setBusy(true);setStatus('KI erstellt einen Vorschlag. Die Live-Show bleibt unverändert.');
  try{
   const response=await fetch('/api/ai/show-remix',{method:'POST',cache:'no-store',signal:current.signal,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:idea,genre:style,intensityCap:cap})});
   const data:unknown=await response.json();
   if(requestId.current!==id)return;
   const parsed:{remix?:unknown;error?:string}=data&&typeof data==='object'
    ? data as {remix?:unknown;error?:string}:{};
   if(!response.ok)throw Error(typeof parsed.error==='string'?parsed.error:'KI-Anfrage fehlgeschlagen.');
   const proposal=normalizeAiShowRemixV1106(parsed.remix);
   if(!proposal||proposal.acts.some(a=>a.intensity>cap))throw Error('KI-Vorschlag konnte nicht sicher validiert werden.');
   setPreview(proposal);setSource('ai');setBaseSignature(signature);
   setStatus('KI-Vorschlag bereit. Prüfe alle sieben Szenen und übernimm ihn ausdrücklich.');
  }catch(error){
   if(requestId.current===id&&!current.signal.aborted)
    setStatus((error instanceof Error?error.message:'KI vorübergehend nicht erreichbar.')+' Du kannst den lokalen Remix verwenden.');
  }finally{if(requestId.current===id)setBusy(false);}
 };
 const apply=()=>{
  if(!preview)return;
  if(signature!==baseSignature){setStatus('Der Showplan wurde inzwischen geändert. Bitte einen neuen Remix erstellen.');setPreview(null);return;}
  const result=applyAiShowRemixV1106(base,preview,cap);
  if(!result){setStatus('Remix ungültig – bestehender Showplan bleibt erhalten.');return;}
  undo.current={before:plan,after:JSON.stringify(result)};
  setCanUndo(true);
  updatePreferences({arenaShowPlanV1040:result});
  setPreview(null);
  setStatus('Remix gespeichert. Die 360°-Showplan-Aktivierung bleibt unverändert – keine Geräte wurden gesteuert.');
 };
 const revert=()=>{
  if(!undo.current)return;
  const saved=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
  if(JSON.stringify(saved)!==undo.current.after){
   setStatus('Der Showplan wurde nach dem Remix geändert; Rückgängig würde manuelle Änderungen überschreiben.');
   setCanUndo(false);undo.current=null;return;
  }
  updatePreferences({arenaShowPlanV1040:undo.current.before??undefined});
  undo.current=null;setCanUndo(false);setStatus('Vorheriger Showplan wiederhergestellt.');
 };
 return <fieldset className="arena-v1106-ai-remix" aria-label="V1106 KI Show Remix">
  <legend>V1106 · KI Creative Producer – Show Remix</legend>
  <p>Aus einer Idee werden sieben abwechslungsreiche, zusammenhängende 360°-Konzertphasen.
   Die Vorschläge verändern erst nach deinem Klick den vorhandenen Showplan;
   individuelle Zeitgrenzen bleiben erhalten.</p>
  <label>Was soll die Konzertshow besonders machen?
   <textarea rows={3} maxLength={400} value={idea} disabled={busy}
    onChange={e=>{setIdea(e.target.value);invalidate();}}
    placeholder="z. B. Hardtekk: ruhiger Start, explosive Hook, Laser-Tunnel, episches Finale"/>
  </label>
  <label>Maximale virtuelle Showintensität: {cap}%
   <input type="range" min="30" max="85" step="5" value={cap} disabled={busy}
    onChange={e=>{setCap(Number(e.target.value));invalidate();}}/>
  </label>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   <button type="button" onClick={()=>void remote()} disabled={busy||idea.trim().length<4}>
    {busy?'KI entwirft…':'Mit OpenAI kreativ gestalten'}
   </button>
   <button type="button" onClick={local} disabled={busy}>Offline-Remix ausprobieren</button>
   {canUndo&&<button type="button" onClick={revert}>Letzten Remix rückgängig machen</button>}
  </div>
  <small>OpenAI wird nur auf Knopfdruck angefragt (mit konfiguriertem OPENAI_API_KEY und Spotify-Anmeldung).
   Übertragen werden ausschließlich dein kurzer Gestaltungswunsch, Genre und Intensitätslimit –
   niemals Lyrics, Audiodaten, Tokens oder Govee-Geräteinformationen. Offline bleibt alles lokal.</small>
  {status&&<p role="status" aria-live="polite">{status}</p>}
  {preview&&<section aria-label="V1106 Show Remix Vorschau">
   <h3>{preview.title} <small>({source==='ai'?'OpenAI':'Lokaler Entwurf'})</small></h3>
   <p>{preview.explanation}</p>
   <ol style={{paddingLeft:22}}>
    {preview.acts.map((act,index)=><li key={index} style={{marginBottom:10}}>
     <strong>{index+1}. {NAMES[act.scene]} · {Math.min(cap,act.intensity)}%</strong>
     <div style={{height:7,width:'100%',maxWidth:350,background:'rgba(120,130,150,.22)',borderRadius:5}}>
      <div style={{height:'100%',width:`${Math.min(cap,act.intensity)}%`,background:'#7fe9f3',borderRadius:5}}/>
     </div>
     <small>Kamera: {act.camera} · Bühne: {act.deck}/{act.floating} · Laserlook: {act.lasers} · Tanz: {act.dance}</small>
     <p style={{margin:'3px 0 0'}}>{act.note}</p>
    </li>)}
   </ol>
   {preferences.reducedMotion&&<p>Bewegungsreduktion ist aktiv: Die Live-Bühne ignoriert bewegte Showplan-Cues weiterhin.</p>}
   <button type="button" onClick={apply}>Diese sieben Szenen in meinen Showplan übernehmen</button>
   <button type="button" onClick={invalidate}>Vorschlag verwerfen</button>
   <small>Dies ist eine entworfene Timeline, keine Erkennung echter Hooks oder Drops.
    Keine automatische Aktivierung von Pyrotechnik, Strobo, Govee oder anderen Geräten.</small>
  </section>}
 </fieldset>;
}
