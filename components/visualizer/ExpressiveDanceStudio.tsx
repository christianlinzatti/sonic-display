"use client";
import {useEffect,useState} from "react";
import {DEFAULT_EXPRESSIVE_SETTINGS,type ExpressiveSettings,type ExpressivePersona,chooseExpressivePersona} from "./expressiveDanceCharacters";
import {readExpressiveSettings,saveExpressiveSettings,EXPRESSIVE_EVENT} from "./expressiveDanceSettings";
const personalities:{id:ExpressivePersona;label:string;description:string}[]=[{id:"auto",label:"Automatisch",description:"Musikgenre bestimmt den Stil"},{id:"hard",label:"Hardtekk / Hardstyle",description:"Präzise, kraftvolle Kopf- und Schulterakzente"},{id:"fluid",label:"Techno / Flow",description:"Weiche, fließende Kopf- und Oberkörperbewegungen"},{id:"playful",label:"Playful",description:"Lebhafte, verspielte Akzente"},{id:"subtle",label:"Subtle",description:"Zurückhaltende, ruhige Körpersprache"}];
export function ExpressiveDanceStudio({avatarId}:{avatarId:string}){
 const [value,setValue]=useState<ExpressiveSettings>({...DEFAULT_EXPRESSIVE_SETTINGS});
 useEffect(()=>{const refresh=()=>setValue(readExpressiveSettings(avatarId));refresh();window.addEventListener(EXPRESSIVE_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(EXPRESSIVE_EVENT,refresh);window.removeEventListener("storage",refresh);};},[avatarId]);
 function change(patch:Partial<ExpressiveSettings>){setValue(saveExpressiveSettings(avatarId,{...value,...patch}));}
 return <section aria-label="Expressive Dance Characters V205" className="avatar-metadata-editor"><h3>Expressive Dance Characters · V205</h3><p>Optionale Zusatzakzente für Kopf, Blickwirkung und Oberkörper. Die bestehenden GLB-Motions und IK-Fußkontakte bleiben erhalten.</p>
 <label className="setting-check"><input type="checkbox" checked={value.enabled} onChange={e=>change({enabled:e.target.checked})}/> Musikabhängige Ausdrucksbewegungen aktivieren</label>
 <label>Persönlichkeit<select disabled={!value.enabled} value={value.persona} onChange={e=>change({persona:e.target.value as ExpressivePersona})}>{personalities.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
 <p><small>{personalities.find(p=>p.id===value.persona)?.description}; Auto-Profil folgt dem erkannten Musikgenre.</small></p>
 {([ ["strength","Ausdrucksstärke"],["headResponse","Kopfbewegung"],["torsoResponse","Oberkörper"] ] as const).map(([key,label])=><label key={key} style={{display:"block",margin:8}}>{label}: {Math.round(value[key]*100)} %<input disabled={!value.enabled} type="range" min="0" max="1" step="0.05" value={value[key]} onChange={e=>change({[key]:Number(e.target.value)})}/></label>)}
 <p><small>Auto bei Hardtekk: {chooseExpressivePersona("auto","hardtekk")}; bei Techno: {chooseExpressivePersona("auto","techno")}. Keine echte Gesichtserkennung oder KI-generierte Körperbewegung.</small></p>
 <button type="button" onClick={()=>change({...DEFAULT_EXPRESSIVE_SETTINGS})}>Zurücksetzen</button></section>;
}
