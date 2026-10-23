"use client";
import {useEffect,useState} from "react";
import {BEAT_LOCK_LIVE_EVENT,loadBeatLockSettings,saveBeatLockSettings,type BeatLockSettings} from "./adaptiveBeatIntelligence";
type Live={tempo:number;confidence:number;status:string;pulses:number;corrections:number;phase:number};
export function RhythmIntelligenceDashboard(){
 const [settings,setSettings]=useState<BeatLockSettings>({enabled:false,minConfidence:.35});
 const [live,setLive]=useState<Live|null>(null);
 useEffect(()=>{setSettings(loadBeatLockSettings());const listen=(e:Event)=>setLive((e as CustomEvent<Live>).detail);window.addEventListener(BEAT_LOCK_LIVE_EVENT,listen);return()=>window.removeEventListener(BEAT_LOCK_LIVE_EVENT,listen);},[]);
 const change=(next:BeatLockSettings)=>{setSettings(next);saveBeatLockSettings(next);};
 return <section className="avatar-metadata-editor" aria-label="Rhythm Learning V209">
  <h4>V209 · Rhythm Learning &amp; Adaptive Beat Intelligence</h4>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({...settings,enabled:e.target.checked})}/> Adaptive Beat-Korrektur aktivieren (experimentell)</label>
  <label>Minimale Konfidenz: {Math.round(settings.minConfidence*100)} %<input type="range" min="20" max="85" step="5" value={Math.round(settings.minConfidence*100)} onChange={e=>change({...settings,minConfidence:Number(e.target.value)/100})}/></label>
  <p>Status: <strong>{live?.status??"Keine Live-Daten"}</strong> · BPM: {live?.tempo.toFixed(1)??"—"} · Konfidenz: {live?`${Math.round(live.confidence*100)} %`:"—"}</p>
  <p>Erkannte Impulse: {live?.pulses??"—"} · Sanfte Korrekturen: {live?.corrections??"—"} · Beat-Phase: {live?`${Math.round(live.phase*100)} %`:"—"}</p>
  <small>Nur lokale Audiosignale; kein Spotify-Roh-Audio. Korrekturen sind begrenzt, bei geringer Konfidenz greift automatisch der bisherige BPM-Transport. Bei Pausen bleibt die Beat-Zeit stehen.</small>
 </section>;
}
