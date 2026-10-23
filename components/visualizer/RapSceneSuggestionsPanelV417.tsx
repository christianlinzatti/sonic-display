"use client";
import {useMemo,useState} from "react";
import type {Lyrics} from "@/types/music";
import type {RapDuetAssignmentV416,RapDuetStyleV416} from "./rapDuetStudioV416";
import {resolveRapDuetCueV416} from "./rapDuetStudioV416";
import {acceptRapScenesV417,editRapSuggestionV417,suggestRapScenesV417,
  type RapSceneSuggestionV417} from "./smartRapPerformanceDirectorV417";

const names:Record<RapDuetStyleV416,string>={solo:"Solo",reply:"Call & Response",
  duet:"Duett",hook:"Gemeinsame Hook"};
const ms=(t:number)=>`${Math.floor(t/60000)}:${String(Math.floor(t/1000)%60).padStart(2,"0")}`;

/** Suggestions are a disposable draft. Existing show cues are never mutated on generation. */
export function RapSceneSuggestionsPanelV417({lyrics,count,existing,trackId,onAccept,onPreview}:{
  lyrics:Lyrics|null;count:number;existing:readonly RapDuetAssignmentV416[];trackId:string;
  onAccept:(items:RapDuetAssignmentV416[])=>void;onPreview:(timeMs:number)=>void;
}){
  const [expanded,setExpanded]=useState(false);
  const [dismissed,setDismissed]=useState<string[]>([]);
  const [edits,setEdits]=useState<Record<string,RapSceneSuggestionV417>>({});
  const [selected,setSelected]=useState<string[]>([]);
  const [sampleId,setSampleId]=useState<string|null>(null);
  const suggestions=useMemo(()=>suggestRapScenesV417({lyrics,count,existing}),[lyrics,count,existing]);
  const visible=suggestions.filter(s=>!dismissed.includes(s.id)).map(s=>edits[s.id]??s);
  const chosen=visible.filter(s=>selected.includes(s.id));
  const preview=visible.find(s=>s.id===sampleId)??null;
  const previewMs=preview&&lyrics?lyrics.lines[preview.assignment.fromLine].startMs+200:0;
  const cue=preview?resolveRapDuetCueV416({lyrics,playing:true,progressMs:previewMs,
    count,enabled:true,assignments:[...existing,preview.assignment]}):null;
  const modify=(s:RapSceneSuggestionV417,changes:Partial<RapDuetAssignmentV416>)=>{
    const edit=editRapSuggestionV417(s,changes,count);
    setEdits(v=>({...v,[s.id]:edit}));
  };
  const update=(scope:RapSceneSuggestionV417[])=>{
    if(!scope.length)return;
    const merged=acceptRapScenesV417(existing,scope,lyrics?.lines.length??0,count);
    if(merged.length===existing.length)return;
    onAccept(merged);
    setSelected([]);setSampleId(null);
    setEdits({});setDismissed([]);
  };
  const ready=!!trackId&&!!lyrics?.synced&&count>=2;
  return <section aria-label="V417 Smart Rap Performance Director"
    style={{border:"1px solid currentColor",borderRadius:10,padding:12,marginTop:14,display:"grid",gap:9}}>
    <strong>V417 · Smart Rap Performance Director</strong>
    <p style={{margin:0}}>Szenenvorschläge aus wiederholten Lyrics-Zeilen, zeitlich
      zusammenhängenden Rap-Phrasen und möglichen Frage-/Antwort-Mustern.
      Keine automatische Stimmenerkennung.</p>
    <button type="button" disabled={!ready} onClick={()=>setExpanded(v=>!v)}>
      {expanded?"Vorschläge einklappen":"Lyrics analysieren und Szenen vorschlagen"}
    </button>
    {!ready&&<small>Benötigt einen Spotify-Titel mit synchronisierten Lyrics und mindestens zwei Avatare.</small>}
    {expanded&&ready&&<>
      <small>{suggestions.length} Vorschläge · gespeicherte Szenen werden nicht überschrieben.
        Die Vorschläge verändern die Live-Show erst nach dem ausdrücklichen Übernehmen
        und nur bei zusätzlich aktivierter V416-Live-Option.</small>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button type="button" disabled={!visible.length} onClick={()=>setSelected(visible.map(s=>s.id))}>
          Alle auswählen</button>
        <button type="button" disabled={!selected.length} onClick={()=>setSelected([])}>Auswahl aufheben</button>
        <button type="button" disabled={!chosen.length} onClick={()=>update(chosen)}>
          {chosen.length} ausgewählte Szenen übernehmen</button>
      </div>
      {visible.length===0&&<p>Keine freien Lyrics-Bereiche mit ausreichend zuverlässigen
        Strukturhinweisen. Vorhandene V416-Szenen bleiben unverändert.</p>}
      <div style={{display:"grid",gap:10,maxHeight:470,overflowY:"auto"}}>
        {visible.map(s=>{
          const a=s.assignment,l=lyrics!.lines[a.fromLine],r=lyrics!.lines[a.toLine];
          return <div key={s.id} style={{border:"1px solid #737373",borderRadius:7,padding:9,display:"grid",gap:6}}>
            <label><input type="checkbox" checked={selected.includes(s.id)}
              onChange={e=>setSelected(xs=>e.target.checked?[...xs,s.id]:xs.filter(x=>x!==s.id))}/>
              {" "}Zeilen {a.fromLine+1}–{a.toLine+1} · {ms(l.startMs)} · Hinweis {Math.round(s.confidence*100)} %</label>
            <small>{s.reason} Der Prozentwert ist nur eine heuristische Einstufung,
              keine Wahrscheinlichkeit für tatsächliche Sängerrollen.</small>
            <div style={{fontSize:13,opacity:.9}}>{l.text}{a.toLine!==a.fromLine?` / ${r.text}`:""}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"end"}}>
              <label>Szene <select value={a.style} onChange={e=>{
                const style=e.target.value as RapDuetStyleV416;
                modify(s,{style,partnerSlot:(style==="reply"||style==="duet")&&a.partnerSlot===a.leadSlot?
                  (a.leadSlot+1)%count:a.partnerSlot});
              }}>{Object.entries(names).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
              <label>Lead <select value={a.leadSlot} onChange={e=>{
                const leadSlot=Number(e.target.value);
                modify(s,{leadSlot,partnerSlot:leadSlot===a.partnerSlot?(leadSlot+1)%count:a.partnerSlot});
              }}>{Array.from({length:count},(_,i)=><option key={i} value={i}>Avatar {i+1}</option>)}</select></label>
              {(a.style==="duet"||a.style==="reply")&&<label>Partner <select value={a.partnerSlot}
                onChange={e=>modify(s,{partnerSlot:Number(e.target.value)})}>
                {Array.from({length:count},(_,i)=><option key={i} value={i} disabled={i===a.leadSlot}>
                  Avatar {i+1}</option>)}</select></label>}
              <label>Ausdruck {a.strength}% <input type="range" min="0" max="100" step="5"
                value={a.strength} onChange={e=>modify(s,{strength:Number(e.target.value)})}/></label>
              <button type="button" onClick={()=>{setSampleId(s.id);onPreview(l.startMs+200)}}>
                Zeitposition prüfen</button>
              <button type="button" onClick={()=>update([s])}>Übernehmen</button>
              <button type="button" onClick={()=>{setDismissed(xs=>[...xs,s.id]);setSelected(xs=>xs.filter(x=>x!==s.id));}}>
                Verwerfen</button>
            </div>
          </div>;
        })}
      </div>
      {preview&&<p aria-live="polite" style={{margin:0}}><strong>Vorgeschlagene Regie bei {ms(previewMs)}:</strong>{" "}
        {cue?.active?`${names[cue.style!]} · Lead Avatar ${cue.leadSlot+1} · Lippen ${cue.singingSlots.map(i=>i+1).join(" + ")}`:
          "Keine aktive Rolle (z. B. zu kurze Zeile)"}. Der Zeitregler steuert Spotify nicht.</p>}
    </>}
  </section>;
}
