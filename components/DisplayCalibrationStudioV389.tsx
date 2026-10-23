"use client";
import {useEffect,useRef,useState} from "react";
import {getRenderMetricsSnapshot} from "./visualizer/renderDiagnostics";
import {getAvatarFrameStats} from "./visualizer/avatarFrameProfiler";
import {useDisplayProfileV388,setDisplayProfileV388} from "./DisplayPerformanceV388";
import {CALIBRATION_KEY_V389,CALIBRATION_WARMUP_V389,CALIBRATION_MEASURED_V389,DISPLAY_PROFILES_V389,deviceSignatureV389,validReadingV389,summarizeCalibrationV389,comparableResultsV389,recommendDisplayV389,parseCalibrationResultsV389,type CalibrationReadingV389,type CalibrationResultV389,type CalibrationProfileV389} from "./visualizer/displayCalibrationPolicyV389";

type Session={profile:CalibrationProfileV389;previous:CalibrationProfileV389;avatars:1|2|4;device:string;trackId:string;started:number;lastAt:number;warmup:number;samples:CalibrationReadingV389[];invalid:number};
const labels:Record<CalibrationProfileV389,string>={off:"Standard",auto:"Adaptiv",eco:"Energiesparen",sharp:"Schärfer"};
function detectedAvatarsV389(){const now=performance.now();return getAvatarFrameStats().filter(s=>s.frames>0&&s.updatedAt<=now&&now-s.updatedAt<6000).length;}
function snapshotReadingV389():CalibrationReadingV389{
 const m=getRenderMetricsSnapshot();return {fps:m.fps,p95FrameMs:m.p95FrameMs??m.frameMs,slowPercent:m.slowPercent,drawCalls:m.drawCalls,triangles:m.triangles,activeAvatars:detectedAvatarsV389(),updatedAt:m.updatedAt};
}
function readResults():CalibrationResultV389[]{try{return parseCalibrationResultsV389(JSON.parse(localStorage.getItem(CALIBRATION_KEY_V389)||"[]"));}catch{return [];}}
function persistResults(rows:CalibrationResultV389[]){try{localStorage.setItem(CALIBRATION_KEY_V389,JSON.stringify(rows.slice(-80)));}catch{}}
export function DisplayCalibrationStudioV389({onClose,trackId=""}:{onClose:()=>void;trackId?:string}){
 const {profile,kioskEnabled}=useDisplayProfileV388();
 const [avatars,setAvatars]=useState<1|2|4>(1);
 const [results,setResults]=useState<CalibrationResultV389[]>([]);
 const [status,setStatus]=useState("Wähle die tatsächliche Besetzung auf der Bühne und starte ein Profil.");
 const [progress,setProgress]=useState({warmup:0,samples:0});
 const [live,setLive]=useState<CalibrationReadingV389|null>(null);
 const [device,setDevice]=useState("");
 const active=useRef<Session|null>(null);
 const profileRef=useRef(profile);profileRef.current=profile;
 const trackRef=useRef(trackId);trackRef.current=trackId;
 const ticker=useRef<number|null>(null);
 useEffect(()=>{
  setResults(readResults());setDevice(deviceSignatureV389(window.innerWidth,window.innerHeight,window.devicePixelRatio||1));
  const resize=()=>setDevice(deviceSignatureV389(window.innerWidth,window.innerHeight,window.devicePixelRatio||1));
  window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize);
 },[]);
 useEffect(()=>{const id=window.setInterval(()=>{if(!active.current&&!document.hidden)setLive(snapshotReadingV389());},1250);return()=>window.clearInterval(id);},[]);
 const restore=()=>{
  if(ticker.current!==null){window.clearInterval(ticker.current);ticker.current=null;}
  const s=active.current;
  if(s){active.current=null;setDisplayProfileV388(s.previous);}
 };
 useEffect(()=>{const hide=()=>{if(document.hidden&&active.current){restore();setStatus("Abgebrochen: Tab im Hintergrund. Ursprüngliches Profil wiederhergestellt.");}};document.addEventListener("visibilitychange",hide);return()=>document.removeEventListener("visibilitychange",hide);},[]);
 // The cleanup deliberately uses refs: a component unmount must never leave the benchmark profile active.
 useEffect(()=>()=>{if(ticker.current!==null)window.clearInterval(ticker.current);if(active.current)setDisplayProfileV388(active.current.previous);active.current=null;},[]);
 function begin(candidate:CalibrationProfileV389){
  if(active.current||!kioskEnabled)return;
  if(document.hidden){setStatus("Bitte diesen Tab sichtbar lassen.");return;}
  const actual=detectedAvatarsV389();
  const metric=getRenderMetricsSnapshot();
  if(actual!==avatars){setStatus(`Noch nicht bereit: ${actual} aktive Avatare gemessen, aber ${avatars} ausgewählt. Besetzung auf der echten Bühne anpassen.`);return;}
  if(Date.now()-metric.updatedAt>2500||metric.triangles<=0||metric.fps<=0){setStatus("Keine aktuelle 3D-Bühnenmessung verfügbar. Bühne starten und die Einstellungen-Vorschauen schließen.");return;}
  const now=Date.now(),startDevice=deviceSignatureV389(window.innerWidth,window.innerHeight,window.devicePixelRatio||1);
  const session:Session={profile:candidate,previous:profileRef.current,avatars,device:startDevice,trackId,started:now,lastAt:now,warmup:0,samples:[],invalid:0};
  active.current=session;setProgress({warmup:0,samples:0});setStatus(`Teste ${labels[candidate]} mit ${avatars} tatsächlichen Avataren – kurze Aufwärmphase.`);
  setDisplayProfileV388(candidate);
  ticker.current=window.setInterval(()=>{
   const s=active.current;if(!s)return;
   const snapshot=snapshotReadingV389();setLive(snapshot);
   const now=Date.now();
   if(document.hidden){setStatus("Tab im Hintergrund – Messung pausiert.");return;}
   if(deviceSignatureV389(window.innerWidth,window.innerHeight,window.devicePixelRatio||1)!==s.device||trackRef.current!==s.trackId){restore();setStatus("Test abgebrochen: Anzeigegröße oder Titel haben sich verändert.");return;}
   if(profileRef.current!==s.profile){restore();setStatus("Abgebrochen: Display-Profil wurde während der Messung verändert.");return;}
   if(snapshot.updatedAt<=s.lastAt){if(now-s.lastAt>6000){restore();setStatus("Abgebrochen: keine neuen WebGL-Messwerte. Vorheriges Profil wiederhergestellt.");}return;} // never count the same telemetry window twice
   if(!validReadingV389(snapshot,s.avatars,s.started,now)){
    s.invalid++;s.lastAt=snapshot.updatedAt;
    if(s.invalid>=5){restore();setStatus(`Abgebrochen: Bühnen-Telemetrie nicht vergleichbar. Jetzt ${snapshot.activeAvatars} Avatare statt ${s.avatars}, oder Bühne inaktiv.`);}
    else setStatus(`Messpunkt ausgelassen (${s.invalid}/5): ${snapshot.activeAvatars} statt ${s.avatars} Avatare oder keine gültige WebGL-Telemetrie.`);
    return;
   }
   s.invalid=0;s.lastAt=snapshot.updatedAt;
   if(s.warmup<CALIBRATION_WARMUP_V389){s.warmup++;setProgress({warmup:s.warmup,samples:0});setStatus(`Aufwärmen ${s.warmup}/${CALIBRATION_WARMUP_V389} · Profil ${labels[s.profile]}.`);return;}
   s.samples.push(snapshot);setProgress({warmup:s.warmup,samples:s.samples.length});
   if(s.samples.length>=CALIBRATION_MEASURED_V389){
    const result=summarizeCalibrationV389(s.samples,{id:`${s.started}-${s.profile}-${s.avatars}`,at:now,profile:s.profile,device:s.device,trackId:s.trackId,avatars:s.avatars});
    restore();
    if(!result){setStatus("Messung ungültig; keine Daten gespeichert.");return;}
    setResults(previous=>{const next=[...previous.filter(r=>r.id!==result.id),result].slice(-80);persistResults(next);return next;});
    setStatus(`Fertig: ${result.fps.toFixed(1)} FPS Ø, P95 ${result.p95FrameMs.toFixed(1)} ms. Vorheriges Profil wiederhergestellt.`);
   }else setStatus(`Messung ${s.samples.length}/${CALIBRATION_MEASURED_V389}. Tab sichtbar und Bühne unverändert lassen.`);
  },1050);
 }
 const current=comparableResultsV389(results,device,avatars,trackId);
 const recommendation=recommendDisplayV389(current);
 const lastByProfile=DISPLAY_PROFILES_V389.map(p=>current.find(r=>r.profile===p)).filter((r):r is CalibrationResultV389=>!!r);
 const ongoing=active.current!==null;
 function exportResults(){
  const output=JSON.stringify({version:389,device,exportedAt:new Date().toISOString(),measurements:results},null,2);
  const blob=new Blob([output],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");
  link.href=url;link.download="sonic-display-v389-calibration.json";link.click();URL.revokeObjectURL(url);
 }
 return <aside className="v389-calibration" role="dialog" aria-modal="false" aria-label="V389 Smart Display Calibration Studio">
   <div className="v389-calibration-heading"><strong>V389 · Smart Display Calibration</strong><button type="button" onClick={()=>{restore();onClose();}} aria-label="Kalibrierung schließen">✕</button></div>
   <p className="v389-muted">Live-Messungen an der <strong>echten 3D-Bühne</strong>, kein künstlicher Belastungstest. Profile werden nur während eines Tests vorübergehend umgeschaltet.</p>
   <div className="v389-readout"><span>Gerät: {device||"…"}</span><span>Aktiv: {live?.activeAvatars??"–"} Avatar(e)</span><span>FPS: {live?.fps.toFixed(1)??"–"}</span><span>Frame-P95: {live?.p95FrameMs.toFixed(1)??"–"} ms</span></div>
   <label>Besetzung für den Vergleich
    <select disabled={ongoing} value={avatars} onChange={e=>setAvatars(Number(e.target.value) as 1|2|4)}>
     <option value={1}>1 Avatar</option><option value={2}>2 Avatare</option><option value={4}>4 Avatare</option>
    </select>
   </label>
   <p className="v389-muted">Besetzung zuvor auf der Bühne einstellen. Der Test prüft die <strong>tatsächlich gerenderten</strong> Avatare; er erzeugt keine Test-Avatare.</p>
   <div className="v389-buttons">{DISPLAY_PROFILES_V389.map(p=><button type="button" key={p} disabled={ongoing||!kioskEnabled} onClick={()=>begin(p)}>Test {labels[p]}</button>)}</div>
   {ongoing&&<button type="button" onClick={()=>{restore();setStatus("Abgebrochen. Ursprüngliches Profil wiederhergestellt.");}}>Test abbrechen</button>}
   <div role="status" aria-live="polite" className="v389-status">{status}{ongoing?` · ${progress.samples}/${CALIBRATION_MEASURED_V389} gültige Messpunkte`:""}</div>
   <h4>Leistungsvergleich · {avatars} Avatar(e)</h4>
   {lastByProfile.length?<div className="v389-table-wrap"><table><thead><tr><th>Profil</th><th>FPS Ø</th><th>Min.</th><th>P95</th><th>Langsam</th></tr></thead><tbody>{lastByProfile.map(r=><tr key={r.id}><td>{labels[r.profile]}</td><td>{r.fps.toFixed(1)}</td><td>{r.minFps.toFixed(1)}</td><td>{r.p95FrameMs.toFixed(1)} ms</td><td>{r.slowPercent.toFixed(1)} %</td></tr>)}</tbody></table></div>:<p className="v389-muted">Noch keine vollständige Messung für diese Besetzung, Anzeige und diesen Track.</p>}
   {recommendation&&<div className="v389-recommendation"><strong>Empfehlung: {labels[recommendation.profile]}</strong><p>{recommendation.reason} {recommendation.confidence==="limited"?"Vorläufig: erst ein Profil gemessen. Mindestens zwei für einen fairen Vergleich testen.":""}</p><button type="button" disabled={ongoing} onClick={()=>{setDisplayProfileV388(recommendation.profile);setStatus(`Profil ${labels[recommendation.profile]} angewendet. Du kannst es unter Mehr · Display jederzeit zurücksetzen.`);}}>Empfehlung bewusst übernehmen</button></div>}
   <div className="v389-buttons"><button type="button" disabled={!results.length||ongoing} onClick={exportResults}>Ergebnisse exportieren (JSON)</button><button type="button" disabled={!results.length||ongoing} onClick={()=>{setResults([]);persistResults([]);setStatus("Lokale Messergebnisse gelöscht.");}}>Messungen löschen</button></div>
   <p className="v389-muted">Die Ergebnisse bleiben nur lokal in diesem Browser. Gleicher Song, Kamerawinkel und Bühnenaufbau empfohlen. FPS sind Frame-Statistiken des WebGL-Renderers, keine GPU-Auslastung. V388-Profile wirken nur im Touchmodus. Keine automatische Änderung gespeicherter Motions oder Shows.</p>
  </aside>;
}
