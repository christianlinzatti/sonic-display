"use client";
import { useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { analyzePcm, composeAnalyzedTimeline, type StructureAnalysis } from "./musicStructureAnalyzer";
import type { ComposerGenre } from "./choreographyComposer";

export function MusicStructureAnalyzerStudio({clips}:{clips:string[]}){
 const {updatePreferences}=useUiPreferences();const [analysis,setAnalysis]=useState<StructureAnalysis|null>(null);
 const [genre,setGenre]=useState<ComposerGenre>("deutschrap"),[bpm,setBpm]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [fileName,setFileName]=useState("");
 async function load(file:File){setBusy(true);setError("");setAnalysis(null);setFileName(file.name);let ctx:AudioContext|null=null;
 try{if(file.size>90*1024*1024)throw new Error("Audiodatei ist größer als 90 MB.");ctx=new AudioContext();const buffer=await ctx.decodeAudioData(await file.arrayBuffer());
 // Mix down channels so the analysis works for stereo files too.
 const len=buffer.length;const mono=new Float32Array(len);for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<len;i++)mono[i]+=data[i]/buffer.numberOfChannels;}
 setAnalysis(analyzePcm(mono,buffer.sampleRate,bpm||undefined));}catch(e){setError(e instanceof Error?e.message:"Datei konnte nicht dekodiert werden.");}finally{await ctx?.close().catch(()=>{});setBusy(false);}}
 const apply=()=>{if(!analysis||!clips.length)return;const timeline=composeAnalyzedTimeline(analysis,clips,genre);updatePreferences({avatarTimeline:timeline,avatarTimelineEnabled:true});};
 return <fieldset><legend>Music Structure Analyzer · V109</legend>
 <p>Lokale Audiodatei analysieren: Energie, Transienten, ungefähres Tempo und Übergänge. Für Deutschrap werden Verse/Hook und Head-Nod/Groove-Bewegungen gegenüber Hardstyle-Drops bevorzugt.</p>
 <p><small>Die Verarbeitung bleibt im Browser. Spotify-Audio kann wegen fehlendem direkten Audiostream nicht automatisch analysiert werden. Dies ist eine Datei-basierte Strukturanalyse, keine Live-Spotify-Analyse.</small></p>
 <div style={{display:"flex",flexWrap:"wrap",gap:12}}><label>Audio (MP3/WAV/OGG, je nach Browser)<input type="file" accept="audio/*" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void load(file);}}/></label>
 <label>Musikstil<select value={genre} onChange={e=>setGenre(e.target.value as ComposerGenre)}>{["deutschrap","hiphop","hardstyle","hardtekk","techno","pop","ambient","auto"].map(g=><option key={g} value={g}>{g}</option>)}</select></label>
 <label>BPM-Korrektur (0 = Schätzung)<input type="number" min={0} max={240} value={bpm} onChange={e=>setBpm(Number(e.target.value)||0)}/></label></div>
 {busy&&<p role="status">Audio wird lokal analysiert…</p>}{error&&<p role="alert">{error}</p>}
 {analysis&&<><p><strong>{fileName}</strong> · {analysis.duration.toFixed(1)} s · ca. {analysis.bpm} BPM · {analysis.sections.length} Abschnitte</p>
 <div style={{display:"flex",width:"100%",minHeight:52,overflow:"hidden"}}>{analysis.sections.map((s,i)=><div key={i} title={`${s.kind}: ${s.start.toFixed(1)}–${s.end.toFixed(1)}s`} style={{flex:`${Math.max(.01,s.end-s.start)} 1 0`,background:s.kind==="drop"?"#92438a":s.kind==="hook"?"#347b85":s.kind==="breakdown"?"#435779":"#40516c",padding:3,fontSize:10,overflow:"hidden"}}>{s.kind}</div>)}</div>
 {analysis.warnings.map(w=><p key={w}><small>{w}</small></p>)}
 <button type="button" disabled={!clips.length} onClick={apply}>Analysierte Choreografie in Timeline übernehmen</button>{!clips.length&&<small> Bitte zuerst einen Avatar mit Animationen laden.</small>}</>}
 </fieldset>;
}
