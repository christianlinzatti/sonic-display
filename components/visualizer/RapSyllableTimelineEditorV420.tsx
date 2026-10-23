"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {sampleRapArticulationPairV421,compareRapArticulationWordV421,type RapComparisonOptionsV421} from "./rapArticulationComparisonV421";
import {RapArticulationComparisonPanelV421,type RapComparisonModeV421} from "./RapArticulationComparisonPanelV421";
import {suggestRapArticulationV422,type RapArticulationSuggestionV422} from "./rapArticulationAssistantV422";
import {RapArticulationAssistantPanelV422} from "./RapArticulationAssistantPanelV422";
import {normalizeRapMouthDocumentV420,normalizeRapMouthEditV420,rapWordKeyV420,upsertRapMouthEditV420,
  type RapMouthDocumentV420,type RapMouthKeyframeV420,type RapMouthWordEditV420} from "./rapSyllableKeyframesV420";

const clamp=(n:number,a=0,b=1)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const emptyFrames=():RapMouthKeyframeV420[]=>[
 {at:0,jaw:.18,wide:.28,round:.10},{at:.5,jaw:.62,wide:.48,round:.2},{at:1,jaw:.18,wide:.28,round:.1},
];
const fmt=(ms:number)=>`${(ms/1000).toFixed(2)} s`;
type WordEntry={lineIndex:number;wordIndex:number;startMs:number;text:string;endMs:number};
export function RapSyllableTimelineEditorV420({onPreviewMouth}:{onPreviewMouth:(value:number|null)=>void}){
 const {track,lyrics,progressMs}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [open,setOpen]=useState(false),[selection,setSelection]=useState<string|null>(null);
 const [frames,setFrames]=useState<RapMouthKeyframeV420[]>(emptyFrames),[strength,setStrength]=useState(80);
 const [activeFrame,setActiveFrame]=useState(1),[previewMs,setPreviewMs]=useState(0);
 const [follow,setFollow]=useState(false),[status,setStatus]=useState("");
 const [hasUnsavedV422,setHasUnsavedV422]=useState(false);
 const [comparisonModeV421,setComparisonModeV421]=useState<RapComparisonModeV421>("corrected");
 const trackId=track?.id??"";
 const words=useMemo<WordEntry[]>(()=>{
  if(!lyrics?.synced)return [];
  const out:WordEntry[]=[];
  lyrics.lines.forEach((line,li)=>line.words?.forEach((word,wi)=>{
   const end=Math.min(word.endMs??Infinity,line.words?.[wi+1]?.startMs??Infinity,line.endMs??Infinity,lyrics.lines[li+1]?.startMs??Infinity,word.startMs+2100);
   if(word.text.trim()&&Number.isFinite(word.startMs)&&word.startMs>=line.startMs&&end>word.startMs)
    out.push({lineIndex:li,wordIndex:wi,startMs:word.startMs,endMs:end,text:word.text});
  }));return out;
 },[lyrics]);
 const doc=useMemo(()=>normalizeRapMouthDocumentV420(trackId,(preferences.rapSyllableDocumentsV420??{})[trackId]),[preferences.rapSyllableDocumentsV420,trackId]);
 const identity=(w:WordEntry)=>`${w.startMs}|${rapWordKeyV420(w.text)}`;
 const selected=useMemo(()=>words.find(w=>`${w.startMs}|${rapWordKeyV420(w.text)}`===selection)??null,[words,selection]);
 const existing=selected?doc.edits.find(e=>e.startMs===selected.startMs&&e.text===rapWordKeyV420(selected.text)):null;
 useEffect(()=>{setSelection(null);setFollow(false);setStatus("");setComparisonModeV421("corrected");setHasUnsavedV422(false);onPreviewMouth(null);},[trackId,onPreviewMouth]);
 useEffect(()=>()=>onPreviewMouth(null),[onPreviewMouth]);
 const choose=(w:WordEntry)=>{
  const previous=doc.edits.find(e=>e.startMs===w.startMs&&e.text===rapWordKeyV420(w.text));
  setSelection(identity(w));setFrames(previous?.frames.map(f=>({...f}))??emptyFrames());setStrength(previous?.strength??80);
  setHasUnsavedV422(false);setActiveFrame(Math.min(1,(previous?.frames.length??3)-1));setPreviewMs(Math.round(w.startMs+(w.endMs-w.startMs)*.5));setFollow(false);setStatus("");
 };
 const draft=useMemo<RapMouthWordEditV420|null>(()=>selected?normalizeRapMouthEditV420({startMs:selected.startMs,text:selected.text,strength,frames}):null,[selected,strength,frames]);
 const playTime=follow?progressMs:previewMs;
 const draftDoc=useMemo<RapMouthDocumentV420>(()=>draft?
  upsertRapMouthEditV420(doc,draft,{startMs:draft.startMs,text:draft.text}):doc,[doc,draft]);
 const comparisonOptionsV421=useMemo<RapComparisonOptionsV421>(()=>({
   mode:"lyrics",style:"rap",lipStrength:preferences.avatarLipSyncStrength??90,
   rapLipEnabledV415:true,rapLipPrecisionV415:preferences.avatarRapLipPrecisionV415??70,
   rapLipOffsetMsV415:preferences.rapTimingLiveEnabledV418?preferences.rapTimingOffsetsV418?.mouthMs??0:preferences.avatarRapLipOffsetMsV415??0,
   rapSyllableEnabledV419:true,rapSyllableStrengthV419:preferences.avatarRapSyllableStrengthV419??65,
   rapSyllableSmoothnessV419:preferences.avatarRapSyllableSmoothnessV419??70,
   rapSyllableTrackIdV420:trackId,rapSyllableDocumentV420:draftDoc,
   reducedMotion:preferences.reducedMotion,
 }),[trackId,draftDoc,preferences.avatarLipSyncStrength,preferences.avatarRapLipPrecisionV415,
     preferences.avatarRapLipOffsetMsV415,preferences.rapTimingLiveEnabledV418,preferences.rapTimingOffsetsV418,
     preferences.avatarRapSyllableStrengthV419,preferences.avatarRapSyllableSmoothnessV419,preferences.reducedMotion]);
 const comparisonV421=useMemo(()=>open&&selected&&draft&&lyrics?.synced?
   compareRapArticulationWordV421(lyrics,selected,comparisonOptionsV421):
   {points:[],averageChange:0,maximumChange:0,validSamples:0},
   [open,selected,draft,lyrics,comparisonOptionsV421]);
 const suggestionsV422=useMemo(()=>open&&selected&&lyrics?.synced&&!existing&&!hasUnsavedV422?
   suggestRapArticulationV422(lyrics,selected,comparisonOptionsV421):[],
   [open,selected,lyrics,existing,hasUnsavedV422,comparisonOptionsV421]);
 const applySuggestionV422=(suggestion:RapArticulationSuggestionV422)=>{
  if(!selected||existing||hasUnsavedV422||!suggestionsV422.some(s=>s.id===suggestion.id))return;
  setFrames(suggestion.edit.frames.map(f=>({...f})));setStrength(suggestion.edit.strength);
  setActiveFrame(Math.min(2,suggestion.edit.frames.length-1));setHasUnsavedV422(true);
  setPreviewMs(Math.round(selected.startMs+(selected.endMs-selected.startMs)*.5));setFollow(false);
  setComparisonModeV421("corrected");
  setStatus("V422-Vorschlag nur als Entwurf geladen. A/B-Vergleich prüfen und zum Übernehmen ausdrücklich „Mundformen speichern“ wählen.");
 };
 const currentPairV421=useMemo(()=>open&&selected&&draft&&lyrics?.synced?
   sampleRapArticulationPairV421(lyrics,selected,Math.min(selected.endMs-1,Math.max(selected.startMs,playTime)),comparisonOptionsV421):null,
   [open,selected,draft,lyrics,playTime,comparisonOptionsV421]);
 const sample=useCallback((ms:number)=>{
   if(!lyrics?.synced||!trackId||!selected||!draft)return onPreviewMouth(null);
   const pair=sampleRapArticulationPairV421(lyrics,selected,Math.min(selected.endMs-1,Math.max(selected.startMs,ms)),comparisonOptionsV421);
   onPreviewMouth(pair?pair[comparisonModeV421].jaw:null);
 },[lyrics,trackId,selected,draft,comparisonOptionsV421,comparisonModeV421,onPreviewMouth]);
 useEffect(()=>{if(open&&selected)sample(playTime);},[open,selected,playTime,sample]);
 const patchFrame=(key:keyof RapMouthKeyframeV420,value:number)=>{
  setHasUnsavedV422(true);setFrames(old=>old.map((frame,i)=>i===activeFrame?{...frame,[key]:clamp(value)}:frame));
 };
 const save=(erase:boolean)=>{
  if(!selected||!trackId||!lyrics?.synced)return;
  if(!erase&&!draft){setStatus("Ungültige Keyframe-Daten. Die Zeitpunkte müssen verschieden und zwischen 0 und 100 % liegen.");return;}
  const updated=upsertRapMouthEditV420(doc,erase?null:draft,{startMs:selected.startMs,text:selected.text});
  updatePreferences({rapSyllableDocumentsV420:{...(preferences.rapSyllableDocumentsV420??{}),[trackId]:updated}});
  setStatus(erase?"Korrektur entfernt.":"Mundformen für diesen Song und dieses Wort gespeichert.");
  setHasUnsavedV422(false);
  if(erase){setFrames(emptyFrames());setStrength(80);}
 };
 const duration=selected?selected.endMs-selected.startMs:1;
 const phase=selected?clamp((playTime-selected.startMs)/duration):0;
 return <fieldset aria-label="V420 Visual Syllable Articulation Editor" style={{marginTop:14,padding:12,border:"1px solid #527a80",borderRadius:10,display:"grid",gap:10}}>
  <legend>V420 · Visual Syllable Articulation Editor</legend>
  <button type="button" aria-expanded={open} onClick={()=>{setOpen(o=>!o);if(open)onPreviewMouth(null);}}>
   {open?"▾ Mundform-Keyframes schließen":"▸ Silben-/Mundform-Timeline bearbeiten"}
  </button>
  {open&&<>
   <small>Manuelle Mundform-Keyframes verwenden ausschließlich die vorhandenen <b>Wortzeitstempel</b>. Die relative Silbenposition ist eine Bearbeitungshilfe, keine erkannte Phonemgrenze. Änderungen werden pro Song gespeichert; Spotify wird nicht vorgespult.</small>
   <label className="setting-check"><input type="checkbox" checked={preferences.rapSyllableEditsEnabledV420??false}
    onChange={e=>updatePreferences({rapSyllableEditsEnabledV420:e.target.checked})}/> Gespeicherte V420-Mundformen in der Live-Show verwenden</label>
   {!preferences.avatarRapSyllableEnabledV419&&<small>Für die Live-Wirkung zusätzlich V419 Rap-Silbenartikulation in den Anzeige-Einstellungen einschalten.</small>}
   {!words.length?<p role="status">Für V420 sind synchronisierte Lyrics mit echten Wortzeitstempeln nötig. Zeilenzeitstempel reichen nicht aus.</p>:<>
    <div><strong>{track?.title}</strong> – {doc.edits.length} bearbeitete Wörter gespeichert</div>
    <div role="group" aria-label="Wörter mit editierbaren Mundformen" style={{maxHeight:185,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:5,padding:8,border:"1px solid #34435c",borderRadius:8}}>
     {words.map(w=><button type="button" key={`${w.lineIndex}-${w.wordIndex}-${w.startMs}`} aria-pressed={selection===identity(w)}
      title={`Wortbeginn ${fmt(w.startMs)} · Ende ${fmt(w.endMs)}`} onClick={()=>choose(w)}
      style={{fontWeight:doc.edits.some(e=>e.startMs===w.startMs&&e.text===rapWordKeyV420(w.text))?800:400,border:selection===identity(w)?"2px solid #79d8f7":undefined}}>
      {w.text} {doc.edits.some(e=>e.startMs===w.startMs&&e.text===rapWordKeyV420(w.text))?"◆":""}
     </button>)}
    </div>
    {selected&&<section style={{display:"grid",gap:9,padding:9,background:"#18263c",borderRadius:8}}>
     <strong>{selected.text} · {fmt(selected.startMs)}–{fmt(selected.endMs)} {existing?"· gespeichert":"· ungespeichert"}</strong>
     <div style={{display:"flex",gap:9,flexWrap:"wrap",alignItems:"center"}}>
      <label className="setting-check"><input type="checkbox" checked={follow} onChange={e=>setFollow(e.target.checked)}/> Wiedergabezeit folgen</label>
      <span>Vorschau: {fmt(playTime)} · Wortphase {Math.round(phase*100)} %</span>
     </div>
     <input aria-label="V420 Wortposition Vorschau" type="range" min={selected.startMs} max={selected.endMs}
       step={10} value={clamp(playTime,selected.startMs,selected.endMs)} onChange={e=>{setFollow(false);setPreviewMs(Number(e.target.value));}}/>
     <div role="group" aria-label="V420 Grafische Mundform-Zeitachse" style={{display:"grid",gap:4}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span>{fmt(selected.startMs)}</span><span>Wort-Mundformen (relative Keyframes)</span><span>{fmt(selected.endMs)}</span></div>
      <div style={{position:"relative",height:42,margin:"0 9px",background:"#253a56",borderRadius:6}}>
       {frames.map((frame,i)=><button type="button" key={i} aria-label={`Keyframe ${i+1} bei ${Math.round(frame.at*100)} Prozent`} title={`${Math.round(frame.at*100)} % · Kiefer ${Math.round(frame.jaw*100)} %`}
        onClick={()=>{setActiveFrame(i);setFollow(false);setPreviewMs(selected.startMs+Math.round(duration*frame.at));}}
        style={{position:"absolute",left:`${frame.at*100}%`,top:10,transform:"translateX(-50%)",height:22,width:20,
         background:activeFrame===i?"#8bdbeb":"#c2b5ea",color:"#122134",border:activeFrame===i?"2px solid white":0,borderRadius:8,padding:0,zIndex:2}}><span aria-hidden="true">◆</span></button>)}
       <div aria-hidden="true" style={{position:"absolute",left:`${phase*100}%`,width:2,top:0,height:"100%",background:"#fff",pointerEvents:"none",zIndex:1}}/>
      </div>
     </div>
     <div role="group" aria-label="Editierbare Mundform-Keyframes" style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
      {frames.map((frame,i)=><button type="button" key={i} aria-pressed={activeFrame===i} onClick={()=>{setActiveFrame(i);setFollow(false);setPreviewMs(selected.startMs+Math.round(duration*frame.at));}}
       style={{border:activeFrame===i?"2px solid #79d8f7":undefined}}>◆ {Math.round(frame.at*100)} %</button>)}
      <button type="button" disabled={frames.length>=8} onClick={()=>{
       if(frames.length>=8)return;
       setHasUnsavedV422(true);const positions=frames.slice().sort((a,b)=>a.at-b.at);
       let gap=-1,at=.5;
       for(let i=0;i<positions.length-1;i++)if(positions[i+1].at-positions[i].at>gap){gap=positions[i+1].at-positions[i].at;at=(positions[i+1].at+positions[i].at)/2;}
       if(gap<=.03){setStatus("Keine freie Position für weiteren Keyframe.");return;}
       const next=[...frames,{at,jaw:.5,wide:.4,round:.2}].sort((a,b)=>a.at-b.at);setFrames(next);setActiveFrame(next.findIndex(f=>f.at===at));
      }}>+ Keyframe</button>
      <button type="button" disabled={frames.length<=1} onClick={()=>{setHasUnsavedV422(true);setFrames(old=>old.filter((_,i)=>i!==activeFrame));setActiveFrame(0);}}>− Keyframe</button>
     </div>
     {frames[activeFrame]&&<div style={{display:"grid",gap:6}}>
      {([{key:"at",label:"Position im Wort"},{key:"jaw",label:"Kieferöffnung"},{key:"wide",label:"Lippenbreite"},{key:"round",label:"Lippenrundung"}] as const).map(x=><label key={x.key} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
       <span style={{minWidth:125}}>{x.label} · {Math.round(frames[activeFrame][x.key]*100)} %</span>
       <input type="range" aria-label={`V420 ${x.label}`} min="0" max="100" step="1" value={Math.round(frames[activeFrame][x.key]*100)}
        onChange={e=>patchFrame(x.key,Number(e.target.value)/100)} style={{flex:1,minWidth:100}}/>
      </label>)}
      <label>Korrekturstärke: {strength} % <input type="range" min={0} max={100} step={5} value={strength} onChange={e=>{setHasUnsavedV422(true);setStrength(Number(e.target.value));}}/></label>
     </div>}
     {!draft&&<small role="alert">Keyframes müssen unterschiedliche Zeitpunkte haben. Bitte Positionen korrigieren.</small>}
     <RapArticulationAssistantPanelV422 suggestions={suggestionsV422} hasExisting={!!existing}
      hasUnsaved={hasUnsavedV422} onApply={applySuggestionV422}/>
     <RapArticulationComparisonPanelV421 data={comparisonV421} current={currentPairV421} mode={comparisonModeV421}
      onModeChange={setComparisonModeV421}
      onSeek={position=>{setFollow(false);setPreviewMs(selected.startMs+Math.floor((duration-1)*position));}}/>
     <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button type="button" disabled={!draft} onClick={()=>save(false)}>Mundformen speichern</button>
      <button type="button" disabled={!existing} onClick={()=>save(true)}>Korrektur entfernen</button>
      <button type="button" onClick={()=>{setHasUnsavedV422(false);setFrames(existing?.frames.map(f=>({...f}))??emptyFrames());setStrength(existing?.strength??80);setActiveFrame(0);}}>Änderungen zurücksetzen</button>
     </div>
     <small>Die GLB-Vorschau zeigt für V421 wahlweise den automatischen oder bearbeiteten Kieferkanal. Lippenverschlüsse bei B/P/M sowie die V416-Rapper-Rollen bleiben geschützt.</small>
    </section>}
   </>}
   {!!status&&<small role="status">{status}</small>}
  </>}
 </fieldset>;
}
