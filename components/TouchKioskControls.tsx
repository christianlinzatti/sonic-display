"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {useDisplayWakeLockV395} from "./DisplayWakeLockV395";
import {hydrateDisplayProductionV395,setProductionKioskV395,useDisplayProductionV395,setAutoRecoveryV395} from "./DisplayProductionV395";
const DisplayProductionPanelV403=dynamic(()=>import("./DisplayProductionPanelV403").then(m=>m.DisplayProductionPanelV403),{ssr:false});
const DisplayReliabilityPanelV395 = dynamic(() => import("./DisplayReliabilityPanelV395").then(m => m.DisplayReliabilityPanelV395), {ssr:false});
const DisplayCalibrationStudioV389 = dynamic(() => import("./DisplayCalibrationStudioV389").then(m => m.DisplayCalibrationStudioV389), {ssr:false});
import {setKioskActiveV388,useDisplayProfileV388} from "./DisplayPerformanceV388";

export type KioskView = "stage" | "lyrics" | "split";
const EXPERIENCE_KEY = "sonic-display:v275:experience2";
const MODE_KEY = "sonic-display:v166:kiosk-enabled";
const VIEW_KEY = "sonic-display:v166:kiosk-view";
const VIEWS: KioskView[] = ["stage", "split", "lyrics"];
const LABELS: Record<KioskView, string> = { stage: "Avatar", split: "Mix", lyrics: "Lyrics" };
function readMode() { try { return window.localStorage.getItem(MODE_KEY) === "true"; } catch { return false; } }
function readView(): KioskView { try { const value = window.localStorage.getItem(VIEW_KEY); return VIEWS.includes(value as KioskView) ? value as KioskView : "split"; } catch { return "split"; } }
/** Touch-only presentation state; Spotify and visualizer settings remain untouched. */
export function useTouchKiosk() {
  const [enabled, setEnabled] = useState(false);
  const wakeLockV395=useDisplayWakeLockV395(enabled);
  const {profile:displayProfile,setProfile:setDisplayProfile}=useDisplayProfileV388();
  useEffect(()=>{hydrateDisplayProductionV395();},[]);
  useEffect(()=>{setKioskActiveV388(enabled);setProductionKioskV395(enabled);return ()=>{setKioskActiveV388(false);setProductionKioskV395(false);};},[enabled]);
  const [experience2, setExperience2] = useState(false);
  const [view, setView] = useState<KioskView>("split");
  const [visible, setVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const lastTouch = useRef(0);
  useEffect(() => { setEnabled(readMode()); setView(readView()); try { setExperience2(localStorage.getItem(EXPERIENCE_KEY) === "true"); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(EXPERIENCE_KEY, String(experience2)); } catch {} }, [experience2]);
  useEffect(() => { try { localStorage.setItem(MODE_KEY, String(enabled)); } catch {} }, [enabled]);
  useEffect(() => { try { localStorage.setItem(VIEW_KEY, view); } catch {} }, [view]);
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    sync(); document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const show = useCallback(() => { lastTouch.current = Date.now(); setVisible(true); }, []);
  useEffect(() => {
    if (!enabled) { setVisible(true); return; }
    show(); const id = window.setInterval(() => {
      if (Date.now() - lastTouch.current > 5000) setVisible(false);
    }, 800);
    return () => window.clearInterval(id);
  }, [enabled, show]);
  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      return true;
    } catch { return false; }
  }, []);
  return {enabled, setEnabled, experience2, setExperience2, displayProfile, setDisplayProfile, view, setView, visible, show, fullscreen, toggleFullscreen,wakeLockV395};
}
export function TouchKioskControls({ kiosk, ambient, theme, trackId }: { kiosk: ReturnType<typeof useTouchKiosk>; theme?: {enabled:boolean;setEnabled:(v:boolean)=>void}; trackId?:string; ambient?: {autoLayout:boolean;setAutoLayout:(v:boolean)=>void;ambientEnabled:boolean;setAmbientEnabled:(v:boolean)=>void} }) {
  const [notice, setNotice] = useState("");
  const [expandedV388,setExpandedV388] = useState(false);
  const [calibrationOpenV389,setCalibrationOpenV389] = useState(false);
  const [productionOpenV395,setProductionOpenV395] = useState(false);
  const [productionOpenV403,setProductionOpenV403] = useState(false);
  const productionV395=useDisplayProductionV395();
  return <>
    {kiosk.enabled && <button type="button" className="kiosk-wake" aria-label="Touch-Bedienelemente anzeigen" onClick={kiosk.show} />}
    <nav aria-label="Touchscreen und Kiosk" className={`kiosk-toolbar ${kiosk.enabled && !kiosk.visible ? "kiosk-toolbar-hidden" : ""}`} onPointerDown={kiosk.show}>
      <button type="button" aria-pressed={kiosk.enabled} onClick={() => { kiosk.setEnabled(!kiosk.enabled); kiosk.show(); }}>{kiosk.enabled ? "Kiosk aus" : "Touchmodus"}</button>
      {kiosk.enabled && <>
        <div className="kiosk-modes" role="group" aria-label="Anzeigeansicht">{VIEWS.map(mode => <button key={mode} type="button" aria-pressed={kiosk.view === mode} onClick={() => kiosk.setView(mode)}>{LABELS[mode]}</button>)}</div>
        <button type="button" className="kiosk-more-v388" aria-expanded={expandedV388} aria-controls="kiosk-extra-v388" onClick={()=>{setExpandedV388(v=>!v);kiosk.show();}}>{expandedV388?"Weniger":"Mehr · Display"}</button>
        <div id="kiosk-extra-v388" className={`kiosk-extra-v388 ${expandedV388?"kiosk-extra-open-v388":""}`} hidden={!expandedV388}>
        <label className="kiosk-profile-v388">10-Zoll-Display
          <select aria-label="Display-Profil V388" value={kiosk.displayProfile} onChange={e=>{kiosk.setDisplayProfile(e.target.value as typeof kiosk.displayProfile);kiosk.show();}}>
            <option value="off">Standard (unverändert)</option><option value="auto">Adaptiv</option><option value="eco">Energiesparen</option><option value="sharp">Schärfer</option>
          </select>
        </label>
        <button type="button" aria-expanded={calibrationOpenV389} onClick={()=>{setCalibrationOpenV389(v=>!v);kiosk.show();}}>V389 · Kalibrieren</button>
        <button type="button" aria-expanded={productionOpenV403} onClick={()=>{setProductionOpenV403(v=>!v);kiosk.show();}}>V403 · Produktionsdiagnose</button>
        <button type="button" aria-expanded={productionOpenV395} onClick={()=>{setProductionOpenV395(v=>!v);kiosk.show();}}>V395 · Stabilität {productionV395.phase==='ready'?'':'⚠'}</button>
        <label className="setting-check"><input type="checkbox" checked={productionV395.enabled} onChange={e=>setAutoRecoveryV395(e.target.checked)}/> Automatische 3D-Wiederherstellung</label>
        <label className="setting-check" title={kiosk.wakeLockV395.status}><input type="checkbox" checked={kiosk.wakeLockV395.requested} onChange={e=>kiosk.wakeLockV395.change(e.target.checked)}/> Bildschirm wach halten {kiosk.wakeLockV395.active?'✓':''}</label>
        {kiosk.wakeLockV395.requested&&!kiosk.wakeLockV395.active&&<small role="status">{kiosk.wakeLockV395.status}</small>}
        <button type="button" aria-pressed={kiosk.experience2} onClick={() => { kiosk.setExperience2(!kiosk.experience2); kiosk.show(); }} title="Experience 2.0: Bühne, Track und Lyrics für 10-Zoll-Touch optimieren">Experience 2.0</button>
        {theme && <button type="button" aria-pressed={theme.enabled} onClick={() => theme.setEnabled(!theme.enabled)}>Musikfarben</button>}{ambient && <><button type="button" aria-pressed={ambient.autoLayout} onClick={() => ambient.setAutoLayout(!ambient.autoLayout)}>Auto-Layout</button><button type="button" aria-pressed={ambient.ambientEnabled} onClick={() => ambient.setAmbientEnabled(!ambient.ambientEnabled)}>Ambient</button></>}
        </div>
        <button type="button" onClick={async () => setNotice(await kiosk.toggleFullscreen() ? "" : "Browser hat Vollbild abgelehnt. Chromium mit --kiosk starten.")}>{kiosk.fullscreen ? "Fenster" : "Vollbild"}</button>
      </>}
      {notice && <span className="kiosk-notice" role="status">{notice}</span>}
    </nav>
    {kiosk.enabled&&calibrationOpenV389&&<DisplayCalibrationStudioV389 trackId={trackId} onClose={()=>setCalibrationOpenV389(false)}/>} 
    {kiosk.enabled&&productionOpenV395&&<DisplayReliabilityPanelV395 onClose={()=>setProductionOpenV395(false)}/>}
    {kiosk.enabled&&productionOpenV403&&<DisplayProductionPanelV403 onClose={()=>setProductionOpenV403(false)}/>}
  </>;
}
