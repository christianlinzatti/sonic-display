"use client";
import { useMemo, useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { composeChoreography, type ComposerGenre, type ComposerOptions } from "./choreographyComposer";

export function AIChoreographyComposer({clips}:{clips:string[]}) {
 const {preferences,updatePreferences}=useUiPreferences();
 const [genre,setGenre]=useState<ComposerGenre>("hardstyle");
 const [bpm,setBpm]=useState(150),[bars,setBars]=useState(16),[energy,setEnergy]=useState(.75),[variation,setVariation]=useState(.65),[seed,setSeed]=useState(42),[dropEveryBars,setDropEveryBars]=useState(8),[dynamics,setDynamics]=useState(true);
 const [generated,setGenerated]=useState<ReturnType<typeof composeChoreography>|null>(null);
 const opts:ComposerOptions=useMemo(()=>({genre,bpm,bars,energy,variation,seed,dropEveryBars,useEnergyDynamics:dynamics}),[genre,bpm,bars,energy,variation,seed,dropEveryBars,dynamics]);
 const generate=()=>setGenerated(composeChoreography(clips,opts));
 const apply=()=>{if(!generated?.timeline.segments.length)return;updatePreferences({avatarTimeline:generated.timeline,avatarTimelineEnabled:true});};
 return <fieldset><legend>AI Choreography Composer · V108</legend>
 <p>Lokaler regelbasierter Choreografie-Generator: Er komponiert aus den vorhandenen Avatar-Clips eine mehrspurige Timeline. Kein Cloud-Dienst und kein trainiertes KI-Modell erforderlich.</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
 <label>Genre<select value={genre} onChange={e=>setGenre(e.target.value as ComposerGenre)}>{["hardstyle","hardtekk","techno","hiphop","deutschrap","pop","ambient","auto"].map(g=><option value={g} key={g}>{g}</option>)}</select></label>
 <label>BPM<input type="number" min={40} max={240} value={bpm} onChange={e=>setBpm(Number(e.target.value))}/></label>
 <label>Takte<input type="number" min={4} max={32} value={bars} onChange={e=>setBars(Number(e.target.value))}/></label>
 <label>Drop alle x Takte<input type="number" min={4} max={32} value={dropEveryBars} onChange={e=>setDropEveryBars(Number(e.target.value))}/></label>
 <label>Seed<input type="number" value={seed} onChange={e=>setSeed(Number(e.target.value))}/></label>
 <label>Energie {Math.round(energy*100)} %<input type="range" min={0} max={1} step={.05} value={energy} onChange={e=>setEnergy(Number(e.target.value))}/></label>
 <label>Variation {Math.round(variation*100)} %<input type="range" min={0} max={1} step={.05} value={variation} onChange={e=>setVariation(Number(e.target.value))}/></label>
 <label className="setting-check"><input type="checkbox" checked={dynamics} onChange={e=>setDynamics(e.target.checked)}/> Dynamische Energie für Intro, Build, Drop und Breakdown</label>
 </div>
 <p><button type="button" disabled={!clips.length} onClick={generate}>Choreografie generieren</button>{" "}<button type="button" disabled={!generated?.timeline.segments.length} onClick={apply}>In Live-Timeline übernehmen</button></p>
 <small>{clips.length} verfügbare Avatar-Clips. Die Übernahme ersetzt erst nach Klick die bisherige Timeline; ein Export ist danach im Sequencer möglich.</small>
 {!clips.length&&<p role="status">Lade einen animierten Avatar, um Clips für die Komposition zu erhalten.</p>}
 {generated&&<div role="status"><strong>Vorschau: {generated.timeline.segments.length} Segmente / {generated.markers.length} Abschnitte</strong>
 {generated.warnings.map(w=><p key={w}>{w}</p>)}
 <div style={{display:"flex",gap:4,marginTop:8,marginBottom:8}}>{generated.markers.map((m,i)=><div key={i} title={`${m.section} – Takt ${m.bar+1}`} style={{flex:1,minWidth:12,padding:5,background:m.section==="drop"?"#a53b8c":m.section==="breakdown"?"#37567a":"#315e63",fontSize:11}}>{m.section} · {m.bar+1}</div>)}</div>
 <p>Spur 1: {generated.timeline.segments.filter(s=>s.track===0).length} Grundbewegungen · Spur 2: {generated.timeline.segments.filter(s=>s.track===1).length} Drop-Akzente</p>
 </div>}
 </fieldset>;
}
