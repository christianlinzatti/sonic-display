"use client";
import {useMemo} from "react";
import type {RapMouthComparisonV421,RapMouthPairV421,RapMouthPoseV421} from "./rapArticulationComparisonV421";

export type RapComparisonModeV421="automatic"|"corrected";
type Channel="jaw"|"wide"|"round";
const colors:Record<Channel,string>={jaw:"#8de9fa",wide:"#fcb98b",round:"#c8a9ff"};
const channels:ReadonlyArray<{key:Channel;label:string}>=[
 {key:"jaw",label:"Kiefer"},{key:"wide",label:"Breite"},{key:"round",label:"Rundung"},
];
const pct=(value:number)=>`${Math.round(value*100)} %`;
function MouthDiagram({face,label}:{face:RapMouthPoseV421;label:string}){
 const opening=Math.max(2,4+24*face.jaw*(1-face.lipsClosed*.98));
 const radius=20+face.wide*17-face.round*9;
 return <div style={{flex:"1 1 150px",textAlign:"center",padding:8,border:"1px solid #425672",borderRadius:9}}>
  <strong>{label}</strong>
  <svg aria-label={`${label}: schematische Mundform`} role="img" viewBox="0 0 120 76" style={{display:"block",maxWidth:150,width:"100%",margin:"auto"}}>
   <ellipse cx={60} cy={38} rx={46} ry={32} fill="#ba8e83"/>
   <ellipse cx={60} cy={42} rx={Math.max(8,radius)} ry={Math.min(25,opening)} fill="#391d32" stroke="#e6a09c" strokeWidth={4+face.round*3}/>
  </svg>
  <small>Kiefer {pct(face.jaw)} · Breite {pct(face.wide)} · Rundung {pct(face.round)}</small>
 </div>;
}
/** Comparison stays in local preview state; the A/B switch never changes Spotify or saved animation data. */
export function RapArticulationComparisonPanelV421({data,current,mode,onModeChange,onSeek}:{
 data:RapMouthComparisonV421;current:RapMouthPairV421|null;mode:RapComparisonModeV421;
 onModeChange:(mode:RapComparisonModeV421)=>void;onSeek:(phase:number)=>void;
}){
 const paths=useMemo(()=>{
  const path=(channel:Channel,version:RapComparisonModeV421)=>data.points.map((item,index)=>{
   const x=16+item.phase*568;const y=110-item[version][channel]*96;
   return `${index?"L":"M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return channels.flatMap(({key})=>[{key:`${key}-automatic`,color:colors[key],dash:"6 4",path:path(key,"automatic")},
   {key:`${key}-corrected`,color:colors[key],dash:undefined,path:path(key,"corrected")}]);
 },[data]);
 if(!data.validSamples||!current)return <p role="status">An dieser Wortposition sind keine gültigen V419-Mundsignale verfügbar. Für den Vergleich sind echte Wortzeitstempel und aktive Rap-Artikulation nötig.</p>;
 return <section aria-label="V421 Artikulationsvergleich" style={{display:"grid",gap:10,border:"1px solid #527a80",borderRadius:9,padding:10}}>
  <strong>V421 · Automatisch / Korrigiert vergleichen</strong>
  <small>Gegenüberstellung zweier <b>berechneter</b> Mundbewegungen aus derselben Wortzeit. Die Kurven zeigen keine gemessene Audio-Synchronität.</small>
  <div role="group" aria-label="V421 A/B Vorschau-Modus" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
   {(["automatic","corrected"] as const).map(item=><button key={item} type="button" aria-pressed={mode===item}
    onClick={()=>onModeChange(item)} style={{border:mode===item?"2px solid #8de9fa":undefined}}>{item==="automatic"?"A · Automatisch (V419)":"B · Korrigiert (V420)"}</button>)}
  </div>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
   <MouthDiagram face={current.automatic} label="A · Automatisch"/><MouthDiagram face={current.corrected} label="B · Korrigiert"/>
  </div>
  <div role="group" aria-label="V421 Mouth Curves" style={{display:"grid",gap:5}}>
   <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:12}}>
    <span>Gestrichelt: A · Durchgezogen: B</span><span>Mittlere / maximale Formdifferenz: {pct(data.averageChange)} / {pct(data.maximumChange)}</span>
   </div>
   <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{channels.map(c=><span key={c.key} style={{color:colors[c.key],fontSize:12}}>● {c.label}</span>)}</div>
   <svg viewBox="0 0 600 126" role="img" aria-label="Kurvenvergleich Kieferöffnung, Lippenbreite und Rundung mit automatischer und korrigierter Mundform" style={{width:"100%",maxHeight:240,background:"#18263c",borderRadius:8}}>
    {[0,0.5,1].map(n=><g key={n}><line x1={16} x2={584} y1={110-n*96} y2={110-n*96} stroke="#607087" strokeOpacity={.35}/><text x={4} y={113-n*96} fontSize={8} fill="#d2deeb">{Math.round(n*100)}</text></g>)}
    {paths.map(path=><path key={path.key} d={path.path} fill="none" stroke={path.color} strokeWidth={path.dash?1.7:2.7} strokeDasharray={path.dash} vectorEffect="non-scaling-stroke"/>)}
    <line x1={16+current.phase*568} x2={16+current.phase*568} y1={7} y2={114} stroke="#fff" strokeWidth={1.5}/>
   </svg>
   <label>Position im Wort · {Math.round(current.phase*100)} %
    <input aria-label="V421 Vergleichsposition" type="range" min={0} max={100} step={1} value={Math.round(current.phase*100)} onChange={e=>onSeek(Number(e.target.value)/100)} style={{width:"100%"}}/>
   </label>
  </div>
  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><caption>Werte am aktuellen Wortzeitpunkt</caption>
   <thead><tr><th style={{textAlign:"left"}}>Mundkanal</th><th>A</th><th>B</th><th>Differenz</th></tr></thead>
   <tbody>{channels.map(c=><tr key={c.key}><th style={{textAlign:"left"}}>{c.label}</th><td style={{textAlign:"center"}}>{pct(current.automatic[c.key])}</td><td style={{textAlign:"center"}}>{pct(current.corrected[c.key])}</td><td style={{textAlign:"center"}}>{Math.round(current.delta[c.key]*100)>0?"+":""}{Math.round(current.delta[c.key]*100)} %-P.</td></tr>)}</tbody>
  </table>
  <small>Die aktive A/B-Seite steuert die <b>Kieferöffnung</b> der bestehenden 3D-Vorschau. Lippenbreite und Rundung werden in den Kurven und schematischen Mundformen verglichen. Die echte GLB-Darstellung hängt von den Morph-Targets des Avatars ab. A/B verändert weder gespeicherte Keyframes noch die Live-Show.</small>
 </section>;
}
