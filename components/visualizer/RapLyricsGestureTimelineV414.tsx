"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {loadRapGestureDocumentV414,saveRapGestureDocumentV414,anchorRapGestureV414,normalizeRapGestureCueV414,updateRapGestureDocumentV414,sampleRapGestureV414,RAP_GESTURES_CHANGE_V414,type RapGestureCueV414,type RapGestureDocumentV414,type RapGestureKindV414,type RapGestureSampleV414} from "./rapGestureCuesV414";
import type {RapPreviewMotionV410} from "./rapMotionPreviewV410";

export function RapLyricsGestureTimelineV414({avatarId,motions,onPreviewGesture}:{avatarId:string;motions:ReadonlyArray<RapPreviewMotionV410>;onPreviewGesture:(sample:RapGestureSampleV414)=>void}){
 const {track,lyrics,progressMs}=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const trackId=track?.id??"";
 const [doc,setDoc]=useState<RapGestureDocumentV414>({version:1,trackId:"",avatarId:"",cues:[]});
 const [ready,setReady]=useState(false);
 const [selected,setSelected]=useState<{lineIndex:number;wordIndex:number}|null>(null);
 const [kind,setKind]=useState<RapGestureKindV414>("both");
 const [strength,setStrength]=useState(95);
 const [durationMs,setDurationMs]=useState(420);
 const [motionId,setMotionId]=useState("");
 const [previewMs,setPreviewMs]=useState(0);
 const [followLive,setFollowLive]=useState(false);
 const [message,setMessage]=useState("");
 const activePreset=preferences.rapLivePresetV412?.avatarId===avatarId?preferences.rapLivePresetV412:null;
 const allowedMotionIds=useMemo(()=>[...new Set(activePreset?.items.map(x=>x.motionId)??[])],[activePreset]);
 const allowedMotions=useMemo(()=>motions.filter(m=>allowedMotionIds.includes(m.id)),[motions,allowedMotionIds]);
 const viewMs=followLive?progressMs:previewMs;
 const available=Boolean(trackId&&avatarId&&lyrics?.synced&&lyrics.lines.some(l=>Number.isFinite(l.startMs)&&l.text.trim()));
 useEffect(()=>{
   setReady(false);setDoc(loadRapGestureDocumentV414(trackId,avatarId));setSelected(null);setPreviewMs(0);setMessage("");setFollowLive(false);setReady(true);
 },[trackId,avatarId]);
 useEffect(()=>{
   const refresh=()=>setDoc(loadRapGestureDocumentV414(trackId,avatarId));
   window.addEventListener("storage",refresh);window.addEventListener(RAP_GESTURES_CHANGE_V414,refresh);
   return()=>{window.removeEventListener("storage",refresh);window.removeEventListener(RAP_GESTURES_CHANGE_V414,refresh);};
 },[trackId,avatarId]);
 const activeDoc=ready&&doc.trackId===trackId&&doc.avatarId===avatarId?doc:null;
 const chosen=selected&&activeDoc?.cues.find(c=>c.lineIndex===selected.lineIndex&&c.wordIndex===selected.wordIndex);
 const publish=useCallback((ms:number,nextDoc:RapGestureDocumentV414|null,selectedMotionIds:ReadonlyArray<string>)=>{
   onPreviewGesture(sampleRapGestureV414(lyrics,nextDoc,trackId,avatarId,ms,true,false,0,selectedMotionIds));
 },[lyrics,trackId,avatarId,onPreviewGesture]);
 // The local GLB preview follows the selected lyric time, without seeking Spotify.
 useEffect(()=>{onPreviewGesture({head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false});},[trackId,avatarId,onPreviewGesture]);
 useEffect(()=>{if(followLive)publish(progressMs,activeDoc,allowedMotionIds);},[followLive,progressMs,activeDoc,allowedMotionIds,publish]);
 const choose=(lineIndex:number,wordIndex:number)=>{
   const ms=anchorRapGestureV414(lyrics,lineIndex,wordIndex);
   if(ms===null)return;
   const cue=activeDoc?.cues.find(c=>c.lineIndex===lineIndex&&c.wordIndex===wordIndex);
   setSelected({lineIndex,wordIndex});setPreviewMs(ms+80);setFollowLive(false);
   setKind(cue?.kind??"both");setStrength(cue?.strength??95);setDurationMs(cue?.durationMs??420);
   setMotionId(cue&&allowedMotionIds.includes(cue.motionId)?cue.motionId:"");setMessage("");
   publish(ms+80,activeDoc,allowedMotionIds);
 };
 const save=(erase:boolean)=>{
   if(!selected||!lyrics||!activeDoc)return;
   const ms=anchorRapGestureV414(lyrics,selected.lineIndex,selected.wordIndex);
   if(ms===null)return;
   const cue=erase?null:normalizeRapGestureCueV414({lineIndex:selected.lineIndex,wordIndex:selected.wordIndex,startMs:ms,kind,strength,durationMs,motionId:allowedMotionIds.includes(motionId)?motionId:""});
   if(!erase&&!cue){setMessage("Ungültige Geste.");return;}
   const next=updateRapGestureDocumentV414(activeDoc,cue,selected);
   if(!saveRapGestureDocumentV414(next)){setMessage("Browser-Speicher blockiert: Geste konnte nicht gespeichert werden.");return;}
   setDoc(next);publish(viewMs,next,allowedMotionIds);setMessage(erase?"Geste entfernt.":"Geste für diesen Track und Avatar gespeichert.");
 };
 const scrub=(ms:number)=>{setFollowLive(false);setPreviewMs(ms);publish(ms,activeDoc,allowedMotionIds);};
 const selectedStart=selected?anchorRapGestureV414(lyrics,selected.lineIndex,selected.wordIndex):null;
 const currentCue=sampleRapGestureV414(lyrics,activeDoc,trackId,avatarId,viewMs,true,false,0,allowedMotionIds);
 const activeLineIndex=useMemo(()=>{
   if(!lyrics?.synced)return -1;
   let idx=-1;for(let i=0;i<lyrics.lines.length;i++){if(lyrics.lines[i].startMs<=viewMs)idx=i;else break;}return idx;
 },[lyrics,viewMs]);
 return <section className="v414-visual-lyrics-gesture-timeline" aria-label="V414 Visual Lyrics & Gesture Timeline" style={{border:"1px solid #64748b",borderRadius:10,padding:12,marginTop:14,display:"grid",gap:10}}>
   <strong>V414 · Lyrics & Gesture Timeline</strong>
   <small>Echte synchronisierte Lyrics und ihre vorhandenen Zeitstempel. Gesten bleiben an Track + Avatar gebunden. Keine Lyrics-Texte werden gespeichert; Vorschau-Scrubbing steuert Spotify nicht.</small>
   <label className="setting-check"><input aria-label="V414 Lyrics-Gesten live aktivieren" type="checkbox" checked={!!preferences.rapLyricsGestureEnabledV414} onChange={e=>updatePreferences({rapLyricsGestureEnabledV414:e.target.checked})}/> Gespeicherte Lyrics-Gesten für aktive V412-Live-Presets anwenden</label>
   {!activePreset&&<small>Für Live-Gesten zuerst ein passendes V412-Preset aktivieren. Du kannst Gesten bereits jetzt vorbereiten und speichern.</small>}
   {!available?<p role="status">Keine synchronisierten Lyrics für den aktuellen Song verfügbar. Spotify verbinden und einen Titel mit Zeilen- oder Wortzeitstempeln abspielen.</p>:<>
     <div><strong>{track?.title}</strong> – {track?.artist} · {doc.cues.length} gespeicherte Gesten</div>
     <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
       <label className="setting-check"><input type="checkbox" checked={followLive} onChange={e=>{setFollowLive(e.target.checked);publish(e.target.checked?progressMs:previewMs,activeDoc,allowedMotionIds);}}/> Spotify-Position anzeigen</label>
       <small>{(viewMs/1000).toFixed(2)} s / {((track?.durationMs??0)/1000).toFixed(1)} s</small>
       <small>{currentCue.active?`Gestenakzent: Kopf ${currentCue.head.toFixed(2)}× · Arme ${currentCue.arms.toFixed(2)}×`:"Kein manueller Akzent an dieser Position"}</small>
     </div>
     <input aria-label="V414 Lyrics-Position" type="range" min={0} max={Math.max(1,track?.durationMs??1)} step={10} value={Math.max(0,Math.min(track?.durationMs??1,viewMs))} onChange={e=>scrub(Number(e.target.value))} style={{width:"100%"}}/>
     <div role="group" aria-label="Synchronisierte Lyrics-Zeilen und Wörter" style={{maxHeight:230,overflowY:"auto",display:"grid",gap:7,border:"1px solid #38435e",borderRadius:7,padding:8}}>
       {lyrics!.lines.map((line,li)=>{
         const lineCue=activeDoc?.cues.find(c=>c.lineIndex===li&&c.wordIndex===-1);
         return <div key={`${li}:${line.startMs}`} style={{padding:5,borderRadius:5,background:activeLineIndex===li?"#293652":"transparent",display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
           <button type="button" title={`Zeile ${li+1}: ${(line.startMs/1000).toFixed(2)} s`} aria-pressed={selected?.lineIndex===li&&selected?.wordIndex===-1} onClick={()=>choose(li,-1)} style={{fontSize:12,fontWeight:lineCue?700:400,border:selected?.lineIndex===li&&selected?.wordIndex===-1?"2px solid #77d7e5":undefined}}>{lineCue?"◆ ":""}{(line.startMs/1000).toFixed(1)} s · Zeile</button>
           {line.words?.some(w=>Number.isFinite(w.startMs))?line.words.map((w,wi)=>{
             const marked=activeDoc?.cues.some(c=>c.lineIndex===li&&c.wordIndex===wi);
             return <button type="button" key={`${wi}:${w.startMs}`} aria-pressed={selected?.lineIndex===li&&selected?.wordIndex===wi} disabled={!Number.isFinite(w.startMs)} title={`${(w.startMs/1000).toFixed(2)} s`} onClick={()=>choose(li,wi)} style={{fontWeight:marked?800:400,color:marked?"#7ee3ed":undefined,border:selected?.lineIndex===li&&selected?.wordIndex===wi?"2px solid #77d7e5":undefined}}>{w.text}{marked?" ◆":""}</button>;
           }):<span style={{fontSize:12}}>{line.text}</span>}
         </div>;
       })}
     </div>
     {selected&&selectedStart!==null&&<div style={{display:"grid",gap:8,padding:9,background:"#162239",borderRadius:8}}>
       <strong>Geste bearbeiten – {(selectedStart/1000).toFixed(2)} s {selected.wordIndex<0?"(Zeile)":"(Wort)"}{chosen?" · gespeichert":""}</strong>
       <div style={{display:"flex",flexWrap:"wrap",gap:9,alignItems:"center"}}>
         <label>Geste <select aria-label="Gesten-Typ V414" value={kind} onChange={e=>setKind(e.target.value as RapGestureKindV414)}><option value="both">Kopf + Arme</option><option value="head">Nur Kopf</option><option value="arms">Nur Arme</option></select></label>
         <label>Intensität (%) <input aria-label="Gesten-Intensität V414" type="number" min={0} max={150} step={5} value={strength} onChange={e=>setStrength(Number(e.target.value))} style={{width:65}}/></label>
         <label>Dauer (ms) <input aria-label="Gesten-Dauer V414" type="number" min={120} max={1500} step={20} value={durationMs} onChange={e=>setDurationMs(Number(e.target.value))} style={{width:78}}/></label>
         <label>Tanzclip <select aria-label="Gesten-Motion V414" value={allowedMotionIds.includes(motionId)?motionId:""} onChange={e=>setMotionId(e.target.value)}><option value="">Unverändert</option>{allowedMotions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
       </div>
       <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
         <button type="button" onClick={()=>save(false)}>Geste speichern & in Vorschau zeigen</button>
         <button type="button" disabled={!chosen} onClick={()=>save(true)}>Geste entfernen</button>
         <button type="button" onClick={()=>scrub(selectedStart+80)}>Am Wort/Zeilenbeginn vorhören</button>
       </div>
       <small>Der gewählte Tanzclip muss im aktuell aktivierten V412-Preset enthalten sein. Die Live-Show mischt den kurzen Cue kontrolliert hinzu; ohne Preset werden nur Daten gespeichert.</small>
     </div>}
     {!!message&&<small role="status">{message}</small>}
   </>}
 </section>;
}
