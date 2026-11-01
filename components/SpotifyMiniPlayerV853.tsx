"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {formatPlayerTimeV853,playerProgressV853,type SpotifyMiniPlayerActionV853} from "@/lib/spotify-mini-player-v853";
import {type SpotifyDeviceV851} from "@/lib/spotify-playlists-v851";
import {type SpotifyConnectCommandV854,type SpotifyConnectStateV854,type SpotifyRepeatV854} from "@/lib/spotify-connect-v854";

const DEVICE_POLL_MS_V853=45000;
type ErrorResponseV853={code?:string;message?:string};
const repeatNextV854=(mode:SpotifyRepeatV854):SpotifyRepeatV854=>mode==="off"?"context":mode==="context"?"track":"off";
const repeatLabelV854=(mode:SpotifyRepeatV854)=>mode==="track"?"Titel wiederholen":mode==="context"?"Playlist wiederholen":"Wiederholung aus";
const deviceIconV854=(type:string)=>/speaker/i.test(type)?"🔊":/computer/i.test(type)?"▣":/phone|tablet/i.test(type)?"▯":"♫";
/** Persistent mini-player, reading current track exclusively from MusicContext. V854 adds a touch-friendly Connect popover. */
export function SpotifyMiniPlayerV853(){
 const {connected,track,progressMs,isPlaying,fetchedAt,refresh}=useMusic();
 const [busy,setBusy]=useState(false);
 const [device,setDevice]=useState<string|null>(null);
 const [devices,setDevices]=useState<SpotifyDeviceV851[]>([]);
 const [deviceReload,setDeviceReload]=useState(0);
 const [tick,setTick]=useState(()=>Date.now());
 const [error,setError]=useState<string|null>(null);
 const [needsConsent,setNeedsConsent]=useState(false);
 const [panelOpen,setPanelOpen]=useState(false);
 const [settings,setSettings]=useState<SpotifyConnectStateV854|null>(null);
 const [settingsLoading,setSettingsLoading]=useState(false);
 const [notice,setNotice]=useState<string|null>(null);
 const [volumeDraft,setVolumeDraft]=useState<number|null>(null);
 const volumeRef=useRef<number|null>(null);
 const volumeDirty=useRef(false);
 const panelRef=useRef<HTMLDivElement>(null);
 const lock=useRef(false);
 const delayedRefresh=useRef<number|null>(null);
 useEffect(()=>()=>{if(delayedRefresh.current!==null)window.clearTimeout(delayedRefresh.current);},[]);
 useEffect(()=>{
  if(!connected){setDevice(null);setDevices([]);setPanelOpen(false);setSettings(null);return;}
  const ctrl=new AbortController();
  void fetch("/api/spotify/devices",{cache:"no-store",signal:ctrl.signal})
   .then(async r=>{
    const data=await r.json() as {devices?:SpotifyDeviceV851[]}&ErrorResponseV853;
    if(!r.ok)throw new Error(data.message??"Spotify Connect nicht erreichbar");
    return data;
   })
   .then(data=>{if(!ctrl.signal.aborted){setDevices(data.devices??[]);setDevice(data.devices?.find(d=>d.active)?.name??null);}})
   .catch(()=>{if(!ctrl.signal.aborted){setDevices([]);setDevice(null);}});
  return()=>ctrl.abort();
 },[connected,deviceReload]);
 useEffect(()=>{
  if(!connected)return;
  const onPlayed=()=>setDeviceReload(n=>n+1);
  const onVisible=()=>{if(document.visibilityState==="visible")setDeviceReload(n=>n+1);};
  const timer=window.setInterval(onVisible,DEVICE_POLL_MS_V853);
  window.addEventListener("sonic:spotify-playback-v853",onPlayed);
  document.addEventListener("visibilitychange",onVisible);
  return()=>{window.clearInterval(timer);window.removeEventListener("sonic:spotify-playback-v853",onPlayed);document.removeEventListener("visibilitychange",onVisible);};
 },[connected]);
 // Settings are fetched only while the controls are open: no duplicate track polling.
 useEffect(()=>{
  if(!connected||!panelOpen)return;
  const controller=new AbortController();setSettingsLoading(true);
  void fetch("/api/spotify/player/settings",{cache:"no-store",signal:controller.signal})
   .then(async response=>{
    const data=await response.json() as {state?:SpotifyConnectStateV854}&ErrorResponseV853;
    if(!response.ok){if(data.code==="consent_required"||data.code==="reauth_required")setNeedsConsent(true);throw new Error(data.message??"Spotify-Einstellungen nicht abrufbar.");}
    return data;
   })
   .then(data=>{if(!controller.signal.aborted){setSettings(data.state??null);setVolumeDraft(null);volumeDirty.current=false;volumeRef.current=null;}})
   .catch(cause=>{if(!controller.signal.aborted){setSettings(null);setError(cause instanceof Error?cause.message:"Spotify ist derzeit nicht erreichbar.");}})
   .finally(()=>{if(!controller.signal.aborted)setSettingsLoading(false);});
  return()=>controller.abort();
 },[connected,panelOpen,deviceReload]);
 useEffect(()=>{
  if(!panelOpen)return;
  const onPointer=(event:PointerEvent)=>{if(!panelRef.current?.contains(event.target as Node))setPanelOpen(false);};
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setPanelOpen(false);};
  document.addEventListener("pointerdown",onPointer);
  document.addEventListener("keydown",onKey);
  return()=>{document.removeEventListener("pointerdown",onPointer);document.removeEventListener("keydown",onKey);};
 },[panelOpen]);
 useEffect(()=>{
  if(!isPlaying||!track)return;
  const timer=window.setInterval(()=>setTick(Date.now()),1000);
  return()=>window.clearInterval(timer);
 },[isPlaying,track]);
 useEffect(()=>{setTick(Date.now());},[fetchedAt,track?.id]);
 const progress=track?Math.min(track.durationMs,progressMs+(isPlaying?Math.max(0,tick-fetchedAt):0)):0;
 const percent=playerProgressV853(progress,track?.durationMs??0);
 const control=useCallback(async(action:SpotifyMiniPlayerActionV853)=>{
  if(!connected||!track||lock.current)return;
  lock.current=true;setBusy(true);setError(null);
  try{
   const response=await fetch("/api/spotify/player/control",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});
   const data=await response.json() as {ok?:boolean}&ErrorResponseV853;
   if(!response.ok||!data.ok){if(data.code==="consent_required"||data.code==="reauth_required")setNeedsConsent(true);throw new Error(data.message??"Spotify konnte den Befehl nicht ausführen.");}
   await refresh();
   setDeviceReload(n=>n+1);
  }catch(cause){setError(cause instanceof Error?cause.message:"Spotify ist derzeit nicht erreichbar.");}
  finally{lock.current=false;setBusy(false);}
 },[connected,track,refresh]);
 const settingsCommand=useCallback(async(command:SpotifyConnectCommandV854)=>{
  if(!connected||lock.current)return;
  lock.current=true;setBusy(true);setError(null);setNotice(null);
  try{
   const response=await fetch("/api/spotify/player/settings",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify(command)});
   const data=await response.json() as {ok?:boolean}&ErrorResponseV853;
   if(!response.ok||!data.ok){if(data.code==="consent_required"||data.code==="reauth_required")setNeedsConsent(true);throw new Error(data.message??"Spotify Connect konnte den Befehl nicht ausführen.");}
   if(command.action==="transfer"){
    setNotice("Gerätewechsel angefordert. Spotify Connect aktualisiert den Ausgang.");
    if(delayedRefresh.current!==null)window.clearTimeout(delayedRefresh.current);
    delayedRefresh.current=window.setTimeout(()=>{setDeviceReload(n=>n+1);window.dispatchEvent(new Event("sonic:spotify-connect-v854"));delayedRefresh.current=null;},1800);
    void refresh();
   }else if(command.action==="volume"){
    setNotice(`Lautstärke auf ${command.volume} % eingestellt.`);
    setSettings(prev=>prev?{...prev,volumePercent:command.volume}:prev);
   }else if(command.action==="shuffle"){
    setSettings(prev=>prev?{...prev,shuffle:command.enabled}:prev);
   }else if(command.action==="repeat"){
    setSettings(prev=>prev?{...prev,repeat:command.mode}:prev);
   }
   // Keep the existing player/library in sync after a Connect change.
   window.dispatchEvent(new Event("sonic:spotify-connect-v854"));
   if(command.action!=="transfer")setDeviceReload(n=>n+1);
  }catch(cause){setError(cause instanceof Error?cause.message:"Spotify ist derzeit nicht erreichbar.");}
  finally{lock.current=false;setBusy(false);}
 },[connected,refresh]);
 const activeId=settings?.activeDeviceId??devices.find(d=>d.active)?.id??null;
 const activeName=settings?.activeDeviceName??device;
 const canVolume=!!activeId&&settings?.supportsVolume===true&&settings.volumePercent!==null;
 const draftVolume=volumeDraft??settings?.volumePercent??0;
 const setDraft=(next:number)=>{setVolumeDraft(next);volumeRef.current=next;volumeDirty.current=true;};
 const commitVolume=()=>{
  if(!volumeDirty.current||!activeId||!canVolume||busy)return;
  const value=volumeRef.current;if(value===null)return;
  volumeDirty.current=false;setVolumeDraft(null);
  void settingsCommand({action:"volume",deviceId:activeId,volume:value});
 };
 return <section className="sonic-mini-player-v853" aria-label="Spotify Mini-Player" ref={panelRef}>
  <div className="sonic-mini-now-v853">
   {track?.albumCoverUrl?<img className="sonic-mini-cover-v853" src={track.albumCoverUrl} alt=""/>:<span className="sonic-mini-cover-v853 sonic-mini-cover-empty-v853" aria-hidden="true">♫</span>}
   <div className="sonic-mini-copy-v853">
    <span className="sonic-mini-kicker-v853"><span className={`sonic-mini-live-dot-v853 ${isPlaying?"is-playing":""}`}/>{track?(isPlaying?"NOW PLAYING":"PAUSIERT"):"SPOTIFY CONNECT"}</span>
    <strong title={track?.title??"Kein Titel"}>{track?.title??"Bereit für Musik"}</strong>
    <small title={track?.artist??"Öffne die Musikbibliothek"}>{track?.artist??"Playlist auswählen und starten"}</small>
   </div>
  </div>
  <div className="sonic-mini-center-v853">
   <div className="sonic-mini-controls-v853" role="group" aria-label="Wiedergabe steuern">
    <button type="button" title="Vorheriger Titel" aria-label="Vorheriger Titel" disabled={!track||!connected||busy} onClick={()=>void control("previous")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5v14M19 5l-11 7 11 7z"/></svg></button>
    <button className="sonic-mini-toggle-v853" type="button" aria-label={isPlaying?"Wiedergabe pausieren":"Wiedergabe fortsetzen"} title={isPlaying?"Pause":"Abspielen"} disabled={!track||!connected||busy} onClick={()=>void control(isPlaying?"pause":"resume")}><svg viewBox="0 0 24 24" aria-hidden="true">{isPlaying?<path d="M7 5h4v14H7zM14 5h4v14h-4z"/>:<path d="M8 5v14l11-7z"/>}</svg></button>
    <button type="button" title="Nächster Titel" aria-label="Nächster Titel" disabled={!track||!connected||busy} onClick={()=>void control("next")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5v14M5 5l11 7-11 7z"/></svg></button>
    <button className={`sonic-mini-settings-toggle-v854 ${panelOpen?"is-open":""}`} type="button" title="Lautsprecher und Wiedergabeoptionen" aria-label="Spotify-Connect-Einstellungen öffnen" aria-expanded={panelOpen} aria-controls="sonic-connect-panel-v854" disabled={!connected} onClick={()=>setPanelOpen(open=>!open)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4zm12-2a6 6 0 0 1 0 8m2-11a10 10 0 0 1 0 14" fill="none" strokeWidth="1.8"/></svg></button>
   </div>
   <div className="sonic-mini-timeline-v853"><span aria-label="Titelposition">{formatPlayerTimeV853(progress)}</span><div role="progressbar" aria-label="Songfortschritt" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}><span style={{width:`${percent}%`}}/></div><span>{formatPlayerTimeV853(track?.durationMs??0)}</span></div>
  </div>
  <div className="sonic-mini-output-v853" title={device??"Kein aktives Spotify-Connect-Gerät"}>
   <span aria-hidden="true" className="sonic-mini-speaker-icon-v853">◖))</span><div><small>AUSGABE</small><strong>{device??"Kein aktives Gerät"}</strong></div>
   <button type="button" aria-label="Lautsprecher aktualisieren" title="Lautsprecher aktualisieren" onClick={()=>setDeviceReload(n=>n+1)}>↻</button>
  </div>
  {panelOpen&&<div id="sonic-connect-panel-v854" className="sonic-connect-panel-v854" role="region" aria-label="Spotify-Connect-Lautsprecher und Wiedergabeoptionen">
   <header className="sonic-connect-head-v854"><div><span>SPOTIFY CONNECT</span><strong>Sound Control</strong></div><button type="button" className="sonic-connect-close-v854" title="Schließen" aria-label="Spotify-Connect-Einstellungen schließen" onClick={()=>setPanelOpen(false)}>✕</button></header>
   <div className="sonic-connect-current-v854"><span aria-hidden="true">♫</span><div><small>AKTIVER AUSGANG</small><strong>{activeName??"Kein Gerät aktiv"}</strong></div><button type="button" title="Geräteliste aktualisieren" aria-label="Geräteliste aktualisieren" onClick={()=>setDeviceReload(n=>n+1)} disabled={busy||settingsLoading}>↻</button></div>
   <div className="sonic-connect-section-label-v854">Gerät wählen <small>{devices.filter(d=>!d.restricted).length} verfügbar</small></div>
   <div className="sonic-connect-devices-v854" role="group" aria-label="Spotify-Connect-Geräte">
    {devices.map(d=><button type="button" key={d.id} className={`sonic-connect-device-v854 ${d.id===activeId?"is-active":""}`} aria-pressed={d.id===activeId} disabled={busy||d.restricted} title={d.restricted?"Dieses Gerät erlaubt keine Spotify-Steuerung":`Zu ${d.name} wechseln`} onClick={()=>void settingsCommand({action:"transfer",deviceId:d.id,play:isPlaying})}>
     <span aria-hidden="true" className="sonic-connect-device-symbol-v854">{deviceIconV854(d.type)}</span><span className="sonic-connect-device-name-v854"><strong>{d.name}</strong><small>{d.restricted?"Gesperrt":d.id===activeId?"Aktiv":"Antippen zum Wechseln"}</small></span>{d.id===activeId?<span aria-hidden="true" className="sonic-connect-active-v854">✓</span>:<span aria-hidden="true">↗</span>}
    </button>)}
    {!devices.length&&<p className="sonic-connect-muted-v854">Kein Connect-Gerät sichtbar. Öffne Spotify auf deinem Lautsprecher oder Smartphone und aktualisiere die Liste.</p>}
   </div>
   <div className="sonic-connect-section-label-v854">Lautstärke <output aria-live="off">{canVolume?`${draftVolume} %`:"–"}</output></div>
   <div className="sonic-connect-volume-v854"><span aria-hidden="true">◖</span><input type="range" min={0} max={100} step={1} value={draftVolume} aria-label="Lautstärke" aria-valuetext={`${draftVolume} Prozent`} disabled={!connected||busy||settingsLoading||!canVolume} onChange={e=>setDraft(Number(e.target.value))} onPointerUp={commitVolume} onKeyUp={event=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End","PageUp","PageDown"].includes(event.key))commitVolume();}} onBlur={commitVolume}/><span aria-hidden="true">◖))</span></div>
   {!settingsLoading&&!canVolume&&<p className="sonic-connect-hint-v854">{!activeId?"Erst ein aktives Gerät auswählen.":"Dieser Lautsprecher bietet keine fernsteuerbare Lautstärke an."}</p>}
   <div className="sonic-connect-modes-v854" role="group" aria-label="Wiedergabemodus">
    <button type="button" aria-pressed={settings?.shuffle??false} disabled={!activeId||!settings||busy} className={settings?.shuffle?"is-on":""} onClick={()=>{if(activeId&&settings)void settingsCommand({action:"shuffle",enabled:!settings.shuffle,deviceId:activeId});}}><span aria-hidden="true">⤨</span><span>Shuffle</span><small>{settings?.shuffle?"An":"Aus"}</small></button>
    <button type="button" aria-pressed={settings?.repeat!=="off"&&settings!==null} disabled={!activeId||!settings||busy} className={settings?.repeat!=="off"&&settings?"is-on":""} onClick={()=>{if(activeId&&settings)void settingsCommand({action:"repeat",mode:repeatNextV854(settings.repeat),deviceId:activeId});}} title="Aus → Playlist → Titel → Aus"><span aria-hidden="true">↻</span><span>Repeat</span><small>{settings?repeatLabelV854(settings.repeat):"Aus"}</small></button>
   </div>
   {settingsLoading&&<p className="sonic-connect-hint-v854" role="status">Einstellungen werden geladen …</p>}
   {notice&&<p className="sonic-connect-hint-v854" role="status">{notice}</p>}
   <p className="sonic-connect-foot-v854">Spotify Premium und ein erreichbares Connect-Gerät erforderlich.</p>
  </div>}
  {(error||needsConsent)&&<div role="alert" className="sonic-mini-error-v853">{error??"Spotify-Berechtigungen aktualisieren."}{needsConsent&&<> <a href="/api/spotify/login">Neu verbinden</a></>}<button type="button" onClick={()=>{setError(null);setNeedsConsent(false);}} aria-label="Meldung schließen">✕</button></div>}
 </section>;
}
