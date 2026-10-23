"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {analyzeLocalRapAudioV423,normalizeRapAudioDocumentV423,sampleRapAudioV423,type RapAudioDocumentV423} from "./rapAudioAwareV423";

/** Explicit local upload; no Spotify stream extraction, microphone permission or network transfer. */
export function RapAudioAwarePanelV423(){
 const {track,progressMs,lyrics}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [open,setOpen]=useState(false),[file,setFile]=useState<File|null>(null);
 const [draft,setDraft]=useState<RapAudioDocumentV423|null>(null);
 const [previewMs,setPreviewMs]=useState<number|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const source=useRef("");
 const trackId=track?.id??"";
 useEffect(()=>{source.current=trackId;setFile(null);setDraft(null);setPreviewMs(null);setError("");},[trackId]);
 const stored=useMemo(()=>normalizeRapAudioDocumentV423(trackId,(preferences.rapAudioDocumentsV423??{})[trackId],track?.durationMs),[trackId,track?.durationMs,preferences.rapAudioDocumentsV423]);
 const document=draft??stored;
 const sampleTime=previewMs??progressMs;
 const current=useMemo(()=>sampleRapAudioV423(document,sampleTime+(preferences.rapAudioOffsetMsV423??0)),[document,sampleTime,preferences.rapAudioOffsetMsV423]);
 const timeline=useMemo(()=>{
   if(!document)return [];
   const mid=Math.max(0,Math.floor((sampleTime+(preferences.rapAudioOffsetMsV423??0))/document.hopMs));
   return Array.from({length:31},(_,i)=>document.points[Math.min(document.points.length-1,Math.max(0,mid+i-15))]??[0,0,0]);
 },[document,sampleTime,preferences.rapAudioOffsetMsV423]);
 const analyze=async()=>{
  if(!file||!trackId||busy)return;
  const expected=trackId;
  setBusy(true);setError("");setDraft(null);
  let ctx:AudioContext|null=null;
  try{
   if(file.size>80*1024*1024)throw new Error("Datei ist größer als 80 MB.");
   ctx=new AudioContext();
   const buffer=await ctx.decodeAudioData(await file.arrayBuffer());
   if(Math.abs(buffer.duration*1000-(track?.durationMs??0))>3500)throw new Error("Die Dateilänge weicht um mehr als 3,5 Sekunden vom Spotify-Titel ab. Bitte eine passende vollständige Datei auswählen.");
   const result=analyzeLocalRapAudioV423(buffer.getChannelData(0),buffer.sampleRate,expected);
   if(!result)throw new Error("Audiodatei kann nicht ausgewertet werden (mindestens 2 Sekunden, maximal 12 Minuten).");
   if(source.current!==expected)return;
   setDraft(result);
  }catch(e){if(source.current===expected)setError(e instanceof Error?e.message:"Audiodatei konnte nicht analysiert werden.");}
  finally{if(ctx)void ctx.close().catch(()=>{});if(source.current===expected)setBusy(false);}
 };
 const save=()=>{
  if(!draft||!trackId||!track||!normalizeRapAudioDocumentV423(trackId,draft,track.durationMs))return;
  // Keep bounded persistent data. No audio bytes or copyrighted lyric text are stored.
  const prior=preferences.rapAudioDocumentsV423??{};
  const docs=Object.fromEntries(Object.entries(prior).filter(([id])=>id!==trackId).slice(-3));
  updatePreferences({rapAudioDocumentsV423:{...docs,[trackId]:draft}});
  setDraft(null);setError("Lokale Audio-Merkmale gespeichert. Der Live-Einsatz benötigt weiterhin deine ausdrückliche Aktivierung.");
 };
 return <fieldset aria-label="V423 Audio-Aware Phoneme Sync" style={{marginTop:14,border:"1px solid #527a80",borderRadius:10,padding:12,display:"grid",gap:9}}>
  <legend>V423 · Audio-Aware Rap Lip-Sync</legend>
  <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?"▾ Audioanalyse schließen":"▸ Lokale Audiodatei für Rap-Mundbewegungen analysieren"}</button>
  {open&&<>
   <small>Spotify stellt keinen dekodierten Audiostream bereit. Du kannst freiwillig eine eigene, zur aktuellen Aufnahme passende Audiodatei auswählen. Sie wird <b>nur lokal im Browser</b> dekodiert; gespeichert werden ausschließlich begrenzte Lautstärke-/Klanghelligkeits-/Einsatz-Merkmale, keine Audiodaten. Das ist keine Sprechertrennung und keine zuverlässige Phonemerkennung.</small>
   <div>{track?<><strong>{track.title}</strong> · {(track.durationMs/1000).toFixed(1)} s · {stored?"Merkmale gespeichert":"Noch keine Merkmale gespeichert"}</>:"Wähle zunächst einen Spotify-Titel."}</div>
   <label>Eigene passende Audiodatei auswählen <input aria-label="V423 Lokale Audiodatei" type="file" accept="audio/*,.wav,.mp3,.ogg,.m4a" disabled={!track||busy} onChange={e=>{setFile(e.target.files?.[0]??null);setDraft(null);setError("");}}/></label>
   <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
    <button type="button" disabled={!file||!track||busy} onClick={analyze}>{busy?"Audio wird analysiert …":"Lokale Datei analysieren"}</button>
    <button type="button" disabled={!draft||!track} onClick={save}>Merkmale diesem Song zuordnen und speichern</button>
    <button type="button" disabled={!stored} onClick={()=>{const prior={...(preferences.rapAudioDocumentsV423??{})};delete prior[trackId];updatePreferences({rapAudioDocumentsV423:prior,rapAudioEnabledV423:false});setError("Gespeicherte Audio-Merkmale entfernt; Live-Audiohilfe deaktiviert.");}}>Gespeicherte Merkmale entfernen</button>
   </div>
   {!!error&&<small role="status">{error}</small>}
   {document&&<>
    <small>{draft?"Vorschau – noch nicht gespeichert":"Gespeicherte Merkmale"}: {document.points.length} Abtastpunkte · {document.hopMs} ms · kein rohes Audio gespeichert</small>
    <label className="setting-check"><input type="checkbox" checked={preferences.rapAudioEnabledV423??false} disabled={!stored||!lyrics?.synced} onChange={e=>updatePreferences({rapAudioEnabledV423:e.target.checked})}/> Audio-Hinweise optional für Live-Mundformen verwenden</label>
    <label>Einfluss der Audio-Hinweise: {preferences.rapAudioStrengthV423??45} % <input type="range" min="0" max="100" step="5" value={preferences.rapAudioStrengthV423??45} onChange={e=>updatePreferences({rapAudioStrengthV423:Number(e.target.value)})}/></label>
    <label>Offset Datei zu Song: {preferences.rapAudioOffsetMsV423??0} ms <input aria-label="V423 Audio-Offset" type="range" min="-1000" max="1000" step="20" value={preferences.rapAudioOffsetMsV423??0} onChange={e=>updatePreferences({rapAudioOffsetMsV423:Number(e.target.value)})}/></label>
    <label>Preview-Zeit (ändert nicht Spotify): {Math.round(sampleTime/1000*10)/10} s <input aria-label="V423 Audio-Previewzeit" type="range" min="0" max={track?.durationMs??document.durationMs} step="80" value={Math.min(track?.durationMs??document.durationMs,sampleTime)} onChange={e=>setPreviewMs(Number(e.target.value))}/></label>
    <button type="button" onClick={()=>setPreviewMs(null)}>Wiedergabezeit folgen</button>
    <div role="img" aria-label="Lokale Audio-Energiekurve um die ausgewählte Wiedergabezeit" style={{height:66,display:"flex",alignItems:"end",gap:2,background:"#18263c",padding:6,borderRadius:8}}>
     {timeline.map((point,i)=><div key={i} title={`Energie ${point[0]} % · Helligkeit ${point[1]} % · Einsatz ${point[2]} %`} style={{flex:1,height:`${Math.max(3,point[0])}%`,background:i===15?"#a3efff":"#719abc",borderRadius:2}}/>)}
    </div>
    <small>Bei dieser Position: Energie {Math.round((current?.energy??0)*100)} % · Helligkeit {Math.round((current?.brightness??0)*100)} % · Einsatz {Math.round((current?.onset??0)*100)} %. Die 3D-Mundanimation nutzt diese Hinweise nur während wortgenau synchronisierter Rap-Lyrics. Vorhandene V420-Keyframes haben Vorrang.</small>
   </>}
  </>}
 </fieldset>;
}
