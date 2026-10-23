"use client";
import {useEffect,useState} from "react";
import {DEFAULT_CHOREOGRAPHY_V312,readChoreographyV312,writeChoreographyV312,CHOREOGRAPHY_V312_EVENT,type ChoreographySettingsV312} from "./intelligentDanceChoreographyV312";

export function IntelligentChoreographyControlsV312(){
  const [settings,setSettings]=useState<ChoreographySettingsV312>({...DEFAULT_CHOREOGRAPHY_V312});
  useEffect(()=>{const sync=()=>setSettings(readChoreographyV312());sync();window.addEventListener(CHOREOGRAPHY_V312_EVENT,sync);return()=>window.removeEventListener(CHOREOGRAPHY_V312_EVENT,sync);},[]);
  const edit=(patch:Partial<ChoreographySettingsV312>)=>setSettings(writeChoreographyV312({...settings,...patch}));
  return <fieldset className="stage-director-v287 intelligent-choreography-v312"><legend>Intelligent Dance Choreography Director · V312</legend>
    <p>Gemeinsame musikalische Phrasen, abwechselnde Solo-Auftritte, Call-and-Response, Partnerreaktionen und synchronisierte Drops für zwei Tänzer.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>edit({enabled:e.target.checked})}/> Intelligente Duo-Choreografie aktivieren</label>
    <label>Choreografie-Stil<select value={settings.style} disabled={!settings.enabled} onChange={e=>edit({style:e.target.value as ChoreographySettingsV312["style"]})}><option value="auto">Automatisch nach Show-Stil</option><option value="rave">Hardtekk / Hardstyle</option><option value="dialogue">Deutschrap · Call & Response</option><option value="cinematic">Filmische Choreografie</option></select></label>
    <label>Solo-Wechsel alle {settings.barsPerExchange} Takte<input type="range" min="2" max="16" step="2" value={settings.barsPerExchange} disabled={!settings.enabled} onChange={e=>edit({barsPerExchange:Number(e.target.value)})}/></label>
    <label>Solo-Kontrast ({settings.soloContrast} %)<input type="range" min="0" max="100" step="5" value={settings.soloContrast} disabled={!settings.enabled} onChange={e=>edit({soloContrast:Number(e.target.value)})}/></label>
    <label>Partner-Interaktion ({settings.interaction} %)<input type="range" min="0" max="100" step="5" value={settings.interaction} disabled={!settings.enabled} onChange={e=>edit({interaction:Number(e.target.value)})}/></label>
    <label>Formations-Abwechslung ({settings.variety} %)<input type="range" min="0" max="100" step="5" value={settings.variety} disabled={!settings.enabled} onChange={e=>edit({variety:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={settings.dropTogether} disabled={!settings.enabled} onChange={e=>edit({dropTogether:e.target.checked})}/> Synchroner Duo-Drop mit breiter Formation</label>
    <button type="button" onClick={()=>edit(DEFAULT_CHOREOGRAPHY_V312)}>V312 auf Standard setzen</button>
    <small>Wirkt in der automatischen V306-Tanzshow. Manuelle V206/V274-Multi-Avatar-Choreografien haben Vorrang; eigene Motion-Clips, IK, Kamera-Keyframes und reduzierte Bewegung bleiben erhalten. Das System nutzt geschätzte Musikabschnitte, keine Spotify-Stems.</small>
  </fieldset>;
}
