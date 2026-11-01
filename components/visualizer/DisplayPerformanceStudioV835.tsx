'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {getDisplayStudioSettingsV835,getDisplayStudioServerSettingsV835,subscribeDisplayStudioV835,
 getDisplayStudioStatusV835,subscribeDisplayStudioStatusV835,setDisplayStudioSettingsV835,loadDisplayStudioSettingsV835} from './displayStudioStoreV835';
import type {DisplayStudioProfileV835,DisplayStudioTargetV835} from './displayStudioV835';
export default function DisplayPerformanceStudioV835(){
 const settings=useSyncExternalStore(subscribeDisplayStudioV835,getDisplayStudioSettingsV835,getDisplayStudioServerSettingsV835);
 const status=useSyncExternalStore(subscribeDisplayStudioStatusV835,getDisplayStudioStatusV835,()=>null);
 useEffect(()=>{loadDisplayStudioSettingsV835();},[]);
 const change=(patch:Partial<typeof settings>)=>setDisplayStudioSettingsV835({...settings,...patch});
 return <section className="settings-field" aria-label="V835 Display Performance Studio">
  <h3>V835 · Display Performance Studio</h3>
  <p className="settings-note">Optionale Renderauflösung für das Touchdisplay; keine verlässliche Erkennung eines Raspberry Pi. Automatik nutzt ausschließlich Browser-Hinweise und echte Framezeiten, keine GPU-Timer.</p>
  <label htmlFor="v835-device-profile">Geräteprofil</label>
  <select id="v835-device-profile" value={settings.profile} onChange={e=>change({profile:e.target.value as DisplayStudioProfileV835})}>
   <option value="off">Aus – bisherige Auflösung beibehalten</option>
   <option value="auto">Automatisch (Browser-Hinweise)</option>
   <option value="mini-pc">Mini-PC / leistungsfähiger PC</option>
   <option value="pi-balanced">Sparsames Gerät – ausgewogen (z. B. Pi)</option>
   <option value="pi-eco">Sparsames Gerät – Eco</option>
  </select>
  <label htmlFor="v835-fps-target">FPS-Ziel für zusätzliche Auflösungsanpassung</label>
  <select id="v835-fps-target" value={settings.targetFps} onChange={e=>change({targetFps:Number(e.target.value) as DisplayStudioTargetV835})}>
   <option value={30}>30 FPS</option><option value={45}>45 FPS</option><option value={60}>60 FPS</option>
  </select>
  <label><input type="checkbox" checked={settings.adaptive} onChange={e=>change({adaptive:e.target.checked})}/> Adaptive Auflösung bei anhaltender Last</label>
  <p className="settings-note" aria-live="polite">Aktuell: {status&&settings.profile!=='off'?`${status.dpr.toFixed(2)} DPR · ${Math.round(status.estimatedPixels).toLocaleString('de-DE')} geschätzte Renderpixel · ${status.level} · ${status.reason}`:settings.profile==='off'?'Deaktiviert':'Messung beginnt bei laufender 3D-Bühne'}.</p>
  <p className="settings-note">Hinweis: Die 3D-Auflösung wird begrenzt, nicht das CSS-/Touch-Layout. Lyrics, Kamerazeiten, Avatar-Animation und Audio bleiben unverändert. Ein Leistungsgewinn ist erst nach einem Live-Benchmark belegt.</p>
 </section>;
}
