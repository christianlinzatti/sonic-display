'use client';
import {useState} from 'react';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
import {resolveGoveeRoleV911,type GoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import {colorToHexV912,hexToGoveeColorV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';
import {GOVEE_HARMONY_SCHEMES_V913,applyGoveeHarmonyToShowV913,
 generateGoveeHarmonyLookV913,suggestGoveeHarmonyBaseV913,type GoveeHarmonySchemeV913}
 from '@/lib/goveeColorHarmonyV913';
import {GOVEE_PHASES_V912} from '@/lib/goveeLightShowV912';

type Props={config:GoveeConfigV909;devices:GoveeDeviceV909[];genre:string;
 phase:GoveePhaseV911;draft:GoveeShowV912;onApply:(show:GoveeShowV912,message:string)=>void};
const schemeLabels:Record<GoveeHarmonySchemeV913,string>={
 analogous:'Benachbarte Farben',complementary:'Komplementär-Kontrast',
 triadic:'Drei harmonische Farben',split:'Geteilter Komplementärkontrast',monochrome:'Eine Farbe, mehrere Nuancen'};
const phaseLabels:Record<GoveePhaseV911,string>={ambient:'Ambient',verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};

/** This studio only edits a draft. It never writes to storage or sends LAN commands. */
export function GoveeColorHarmonyStudioV913({config,devices,genre,phase,draft,onApply}:Props){
 const [base,setBase]=useState(()=>colorToHexV912(suggestGoveeHarmonyBaseV913(genre)));
 const [scheme,setScheme]=useState<GoveeHarmonySchemeV913>('analogous');
 const [strength,setStrength]=useState(85);
 const [previewPhase,setPreviewPhase]=useState<GoveePhaseV911>(phase);
 const selected=config.selectedIps.map(ip=>{
  const device=devices.find(d=>d.ip===ip);
  return {ip,role:resolveGoveeRoleV911(config.deviceRolesV911[ip],device?.sku),name:device?.name||device?.sku||ip};
 });
 const options={base:hexToGoveeColorV912(base),scheme,strength,masterBrightness:config.masterBrightness};
 const apply=(all:boolean)=>{
  const phases=all?GOVEE_PHASES_V912:[phase];
  const next=applyGoveeHarmonyToShowV913(draft,selected,options,phases);
  onApply(next,`V913-Farbharmonie für ${selected.length} Leuchte(n) und ${all?'alle sechs Phasen':phaseLabels[phase]} in den Entwurf übernommen. Zum dauerhaften Speichern „Änderungen speichern“ drücken.`);
 };
 return <div className="govee-v913" aria-label="V913 Smart Color Harmony Studio">
  <h4>V913 · Smart Color Harmony 2.0</h4>
  <p className="settings-note">Wähle eine Hauptfarbe und ein Farbschema. Sonic Display verteilt passende Farben auf deine ausgewählten Govee-Leuchten – mit eigenen Nuancen je Rolle und Musikphase. <strong>Die Vorschau steuert keine echten Lichter.</strong></p>
  <div className="govee-v913-controls">
   <label>Hauptfarbe <input type="color" aria-label="Harmonie-Hauptfarbe" value={base} onChange={e=>setBase(e.target.value)}/></label>
   <label>Farbharmonie <select aria-label="Harmonie-Farbschema" value={scheme} onChange={e=>setScheme(e.target.value as GoveeHarmonySchemeV913)}>
    {GOVEE_HARMONY_SCHEMES_V913.map(s=><option key={s} value={s}>{schemeLabels[s]}</option>)}
   </select></label>
   <label>Farbabweichung ({strength} %)<input aria-label="Farbharmonie-Stärke" type="range" min="0" max="100" step="5" value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
   <label>Vorschauphase <select aria-label="Harmonie-Vorschauphase" value={previewPhase} onChange={e=>setPreviewPhase(e.target.value as GoveePhaseV911)}>
    {GOVEE_PHASES_V912.map(p=><option key={p} value={p}>{phaseLabels[p]}</option>)}
   </select></label>
  </div>
  <div className="govee-v909-actions">
   <button type="button" onClick={()=>setBase(colorToHexV912(suggestGoveeHarmonyBaseV913(genre)))}>Genre-Farbe vorschlagen</button>
  </div>
  <div className="govee-v913-palette" aria-label="Harmonische Farben – Vorschau">
   {selected.map(item=>{
    const look=generateGoveeHarmonyLookV913(options,item.role,previewPhase);
    return <div key={item.ip} className="govee-v913-palette-card">
     <strong>{item.name}</strong>
     <span className="govee-v913-color" style={{backgroundColor:`rgb(${look.color.r},${look.color.g},${look.color.b})`}} aria-label={`RGB ${look.color.r}, ${look.color.g}, ${look.color.b}`}/>
     <small>{item.role} · {colorToHexV912(look.color)} · {look.brightness}%</small>
    </div>;
   })}
  </div>
  <div className="govee-v909-actions">
   <button type="button" disabled={!selected.length} onClick={()=>apply(false)}>Farben für {phaseLabels[phase]} übernehmen</button>
   <button type="button" disabled={!selected.length} onClick={()=>apply(true)}>Alle sechs Phasen harmonisieren</button>
  </div>
  <p className="settings-note">Übernehmen verändert ausschließlich den ungespeicherten Editor-Entwurf. Bestehende Übergangszeiten bleiben erhalten. Die Live-Lichtregie verwendet die neue Palette erst nach dem Speichern und nur, wenn du die V912-Show und Musiksynchronisierung ausdrücklich aktiviert hast. RGBIC-Segmente und native Govee-Szenen werden nicht angesprochen.</p>
 </div>;
}
