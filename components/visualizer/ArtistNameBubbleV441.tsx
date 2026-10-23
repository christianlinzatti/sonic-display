"use client";
import {Html} from "@react-three/drei";
import type {CSSProperties} from "react";
import type {ArtistBubblePlanV441} from "./artistNameBubblesV441";
import type {ArtistSpotlightV443} from "./artistSpotlightV443";

/** Attached to a dancer's stage-space group, so labels track the ACTUAL camera and formations. */
export function ArtistNameBubbleV441({plan,slot,reducedMotion,spotlightV443}:{
  plan?:ArtistBubblePlanV441;slot:number;reducedMotion:boolean;spotlightV443?:ArtistSpotlightV443;
}){
  const bubble=plan?.enabled?plan.bubbles.find(item=>item.slot===slot):undefined;
  if(!bubble?.visible)return null;
  const style=plan?.style??"comic";
  const emphasized=bubble.emphasized;
  const spotlightActive=!!spotlightV443?.enabled&&spotlightV443.slots[slot]?.attention===1&&emphasized;
  const cueKey=spotlightActive?`${slot}-${spotlightV443?.cueId}-${spotlightV443?.group}`:`${slot}-rest`;
  const base:CSSProperties={position:"relative",pointerEvents:"none",userSelect:"none",whiteSpace:"nowrap",maxWidth:210,
    overflow:"hidden",textOverflow:"ellipsis",textAlign:"center",fontWeight:750,
    fontFamily:"system-ui, sans-serif",fontSize:emphasized?15:12,lineHeight:1.3,
    borderRadius:style==="comic"?16:style==="neon"?9:6,
    padding:style==="minimal"?"4px 9px":"7px 12px",
    border:style==="comic"?"2px solid #091526":style==="neon"?"1px solid #67f2ff":"1px solid #9aaabe",
    color:style==="minimal"?"#f4f7ff":style==="neon"?"#a9faff":"#081424",
    background:style==="comic"?(emphasized?"#f9e35c":"#eff6ff"):
      style==="neon"?"rgba(7,19,43,.9)":"rgba(10,20,34,.87)",
    boxShadow:style==="neon"?(emphasized?"0 0 17px #32dafa, 0 2px 9px #001":"0 0 6px #217baf"):
      style==="comic"?"3px 4px 0 #071827":"0 2px 7px #001",
    opacity:emphasized?1:.7,transform:emphasized?"scale(1)":"scale(.91)",
    transition:reducedMotion?"none":"opacity .3s ease, transform .3s ease"};
  return <Html center position={[0,2.55,0]} distanceFactor={7.5} zIndexRange={[12,2]}
    style={{pointerEvents:"none"}}>
    <div key={cueKey} data-v443-spotlight={spotlightActive?"on":"off"} data-v441-slot={slot} aria-label={`Künstler ${bubble.name}`} title={bubble.name}
      style={{...base,animation:spotlightActive&&!reducedMotion?"v443-artist-entry .52s ease-out both":undefined}}>
      {bubble.displayName}
      {style==="comic"&&<span aria-hidden="true" style={{position:"absolute",left:"48%",top:"100%",
        width:0,height:0,borderLeft:"7px solid transparent",borderRight:"7px solid transparent",
        borderTop:`10px solid ${emphasized?"#f9e35c":"#eff6ff"}`}}/>}
    </div>
  </Html>;
}
