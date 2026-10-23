"use client";
import {useEffect,useState} from "react";
import {readMotionStyle,writeMotionStyle,STYLE_EVENT} from "./motionStyleSettings";
import type {MotionStyle} from "./motionStyleTransfer";
export function MotionStylePanel({avatarId}:{avatarId:string}){
 const [style,setStyle]=useState<MotionStyle>({amplitude:1,upperBody:1,lowerBody:1});
 useEffect(()=>{const refresh=()=>setStyle(readMotionStyle(avatarId));refresh();window.addEventListener(STYLE_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(STYLE_EVENT,refresh);window.removeEventListener("storage",refresh);};},[avatarId]);
 return <section aria-label="Motion Style Transfer V203"><h3>Motion Style Transfer · V203</h3><p>Konservative Anpassung der Rotationsamplitude an den Charakter. Keine Veränderung von Root-Translation, Fußpositionen oder Skelettlängen.</p>
 {(["amplitude","upperBody","lowerBody"] as const).map(key=><label key={key} style={{display:"block",margin:8}}>{({amplitude:"Gesamtintensität",upperBody:"Oberkörper",lowerBody:"Beine / Hüfte"})[key]}: {style[key].toFixed(2)} <input type="range" min={0.5} max={1.5} step={0.05} value={style[key]} onChange={e=>{const next={...style,[key]:Number(e.target.value)};setStyle(next);writeMotionStyle(avatarId,next);}}/></label>)}
 <button type="button" onClick={()=>writeMotionStyle(avatarId,{amplitude:1,upperBody:1,lowerBody:1})}>Neutral zurücksetzen</button></section>;
}
