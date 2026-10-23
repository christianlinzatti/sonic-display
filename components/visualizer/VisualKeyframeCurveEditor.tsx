"use client";
import {useState, type PointerEvent, type MouseEvent} from "react";
import {clamp} from "./motionBlendEngine";
import {DEFAULT_BEZIER, keyframeWeight, timelineCurve, type TimelineSegment} from "./motionTimelineEngine";

type Props={segment:TimelineSegment;onChange:(patch:Partial<TimelineSegment>)=>void};
const W=520,H=178, L=32,R=12,T=12,B=26;
const xp=(t:number,d:number)=>L+clamp(t/Math.max(.1,d))*(W-L-R);
const yp=(v:number)=>T+(1-clamp(v))*(H-T-B);
export function VisualKeyframeCurveEditor({segment,onChange}:Props){
 const [drag,setDrag]=useState<number|null>(null);
 const keys=segment.keys;
 const d=Math.max(.1,segment.duration);
 const plotW=W-L-R,plotH=H-T-B;
 const locate=(e:MouseEvent<SVGSVGElement>)=>{const rect=e.currentTarget.getBoundingClientRect();return {at:Math.round(clamp(((e.clientX-rect.left)/rect.width*W-L)/plotW)*d*20)/20,value:Math.round((1-clamp(( (e.clientY-rect.top)/rect.height*H-T)/plotH))*100)/100};};
 const move=(e:PointerEvent<SVGSVGElement>)=>{if(drag===null)return; const p=locate(e);onChange({keys:keys.map((k,i)=>i===drag?p:k).sort((a,b)=>a.at-b.at)});};
 const samples=Array.from({length:101},(_,i)=>{const rel=d*i/100;return `${i?'L':'M'} ${xp(rel,d).toFixed(2)} ${yp(keyframeWeight(segment,rel)).toFixed(2)}`;}).join(" ");
 const bezier=segment.bezier??DEFAULT_BEZIER;
 const bx=(t:number)=>25+clamp(t)*150,by=(v:number)=>175-clamp(v)*150;
 const [handle,setHandle]=useState<"a"|"b"|null>(null);
 const curveMove=(e:PointerEvent<SVGSVGElement>)=>{if(!handle)return;const r=e.currentTarget.getBoundingClientRect();const x=clamp(((e.clientX-r.left)/r.width*200-25)/150);const y=clamp((175-(e.clientY-r.top)/r.height*200)/150);onChange({bezier:{...bezier,...(handle==="a"?{x1:x,y1:y}:{x2:x,y2:y})}});};
 return <div className="sonic-v106-editor">
 <strong>Visueller Keyframe-Editor</strong>
 <p><small>Doppelklick: Keyframe hinzufügen · Punkt ziehen: Zeit und Gewicht ändern · Punkt auswählen und löschen.</small></p>
 <svg aria-label="Grafische Keyframe-Kurve" viewBox={`0 0 ${W} ${H}`} role="img" style={{width:"100%",maxWidth:720,background:"#171c2c",touchAction:"none",borderRadius:8,border:"1px solid #454e66"}}
 onDoubleClick={e=>{const p=locate(e);onChange({keys:[...keys,p].sort((a,b)=>a.at-b.at)});}}
 onPointerMove={move} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>
 {[0,.25,.5,.75,1].map(v=><g key={v}><line x1={L} x2={W-R} y1={yp(v)} y2={yp(v)} stroke="#434c63" strokeDasharray="3 5"/><text x={4} y={yp(v)+4} fill="#bdc9e1" fontSize="10">{Math.round(v*100)}</text></g>)}
 <path d={samples} fill="none" stroke="#6ce9de" strokeWidth="3"/>
 {keys.map((k,i)=><circle key={i} cx={xp(k.at,d)} cy={yp(k.value)} r={drag===i?9:7} fill={drag===i?"#ffd878":"#e494ff"} stroke="#ffffff" strokeWidth="2" style={{cursor:"grab"}} onPointerDown={e=>{e.currentTarget.parentElement?.setPointerCapture(e.pointerId);setDrag(i);e.stopPropagation();}}/>)}
 <text x={W/2} y={H-6} fill="#c2cee2" fontSize="11" textAnchor="middle">Zeit (0 – {d.toFixed(1)} Sekunden)</text>
 </svg>
 <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginTop:8}}><button type="button" onClick={()=>onChange({keys:[...keys,{at:d/2,value:.5}].sort((a,b)=>a.at-b.at)})}>+ Keyframe</button><button type="button" disabled={!keys.length} onClick={()=>onChange({keys:keys.slice(0,-1)})}>Letzten entfernen</button><button type="button" onClick={()=>onChange({keys:[]})}>Alle Keyframes zurücksetzen</button></div>
 {keys.map((k,i)=><div key={i} style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginTop:6}}><span>#{i+1}</span><label>Zeit (s) <input aria-label={`Keyframe ${i+1} Zeit`} type="number" min="0" max={d} step="0.05" value={k.at} onChange={e=>onChange({keys:keys.map((v,j)=>j===i?{...v,at:clamp(Number(e.target.value)/d)*d}:v)})}/></label><label>Gewicht <input aria-label={`Keyframe ${i+1} Gewicht`} type="number" min="0" max="1" step="0.05" value={k.value} onChange={e=>onChange({keys:keys.map((v,j)=>j===i?{...v,value:clamp(Number(e.target.value))}:v)})}/></label><button type="button" onClick={()=>onChange({keys:keys.filter((_,j)=>j!==i)})}>Entfernen</button></div>)}
 <h4>Bézier-Übergang</h4><p><small>Wähle oben „bezier“ als Übergangskurve. Ziehe die beiden Kontrollpunkte oder verwende die Zahlenfelder.</small></p>
 <svg role="img" aria-label="Bézier-Kurveneditor" viewBox="0 0 200 200" style={{width:200,maxWidth:"100%",background:"#171c2c",touchAction:"none",border:"1px solid #454e66",borderRadius:8}} onPointerMove={curveMove} onPointerUp={()=>setHandle(null)} onPointerCancel={()=>setHandle(null)}>
 <rect x="25" y="25" width="150" height="150" fill="none" stroke="#505d75"/><path d={`M 25 175 C ${bx(bezier.x1)} ${by(bezier.y1)}, ${bx(bezier.x2)} ${by(bezier.y2)}, 175 25`} fill="none" stroke="#6ce9de" strokeWidth="3"/>
 <path d={`M 25 175 L ${bx(bezier.x1)} ${by(bezier.y1)} M 175 25 L ${bx(bezier.x2)} ${by(bezier.y2)}`} fill="none" stroke="#aaa" strokeDasharray="3 4"/>
 {([[bezier.x1,bezier.y1,"a"],[bezier.x2,bezier.y2,"b"]] as const).map(([x,y,id])=><circle key={id} cx={bx(x)} cy={by(y)} r="9" fill={id==="a"?"#ffbd71":"#e494ff"} stroke="white" strokeWidth="2" style={{cursor:"grab"}} onPointerDown={e=>{e.currentTarget.parentElement?.setPointerCapture(e.pointerId);setHandle(id);}}/>)}
 </svg>
 <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(["x1","y1","x2","y2"] as const).map(key=><label key={key}>{key}<input style={{maxWidth:85}} type="number" min="0" max="1" step="0.05" value={bezier[key]} onChange={e=>onChange({bezier:{...bezier,[key]:clamp(Number(e.target.value))}})}/></label>)}<button type="button" onClick={()=>onChange({bezier:{...DEFAULT_BEZIER}})}>Kurve zurücksetzen</button></div>
 <small>Kurvenvorschau bei 50 % Übergang: {Math.round(timelineCurve(.5,segment)*100)} %</small>
 </div>;
}
