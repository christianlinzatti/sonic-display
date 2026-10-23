"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMusic } from "@/context/MusicContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { generateAdaptiveChoreography, resolveAdaptiveProfile, type AdaptiveStyle, type AdaptiveMode } from "./adaptiveGenreDance";
import {GENRES} from "@/config/musicGenres";
import {readGenreVisualV352,GENRE_VISUAL_EVENT_V352} from "@/services/stageContent/genreVisualDirectorV352";

export function AdaptiveGenreDanceStudio({clips}:{clips:string[]}) {
 const {genre,track,genreSource,genreFusion}=useMusic();
 const [fusionOn,setFusionOn]=useState(()=>readGenreVisualV352().fusionEnabled!==false);
 useEffect(()=>{const update=()=>setFusionOn(readGenreVisualV352().fusionEnabled!==false);window.addEventListener(GENRE_VISUAL_EVENT_V352,update);return()=>window.removeEventListener(GENRE_VISUAL_EVENT_V352,update);},[]);
 const {metrics,active}=useAudioAnalysis();
 const {preferences,updatePreferences}=useUiPreferences();
 const [feedback,setFeedback]=useState("");
 const lastApplied=useRef("");
 const override=preferences.adaptiveDanceGenre??"auto";
 const mode=preferences.adaptiveDanceMode??"live";
 const auto=preferences.adaptiveDanceEnabled??false;
 const bpmOverride=preferences.adaptiveDanceBpm??0;
 const profile=useMemo(()=>resolveAdaptiveProfile(genre,override,active?metrics.energyEnvelope:undefined,bpmOverride||((active?metrics.bpm:null)??undefined),fusionOn?genreFusion:null),[genre,override,active,metrics.energyEnvelope,metrics.bpm,bpmOverride,genreFusion,fusionOn]);
 const apply=(selectedMode:AdaptiveMode,manual=false)=>{
  if(!clips.length && selectedMode==="timeline") {setFeedback("Für den Timeline-Modus bitte zuerst einen Avatar mit Animationsclips laden.");return;}
  if(selectedMode==="live") {
   updatePreferences({smartDanceEnabled:true,avatarTimelineEnabled:false,avatarDancePreset:"auto",danceAggression:profile.aggression,danceVariation:profile.variation,danceMotionStyle:profile.motionStyle});
  } else {
   const result=generateAdaptiveChoreography(clips,profile,track?.id?.split("").reduce((v,c)=>((v*31+c.charCodeAt(0))>>>0),17)??42);
   updatePreferences({avatarTimeline:result.timeline,avatarTimelineEnabled:true,smartDanceEnabled:false,danceAggression:profile.aggression,danceVariation:profile.variation,danceMotionStyle:profile.motionStyle});
  }
  if(manual)setFeedback(`${profile.label} für ${selectedMode==="live"?"Live Dance":"Timeline"} aktiviert.`);
 };
 // Intentional: auto-application only on track / genre / chosen mode changes, never every audio frame.
 useEffect(()=>{
  if(!auto||!track?.id)return;
  const signature=[track.id,genre??"unknown",fusionOn?genreFusion?.secondary??"solo":"solo",override,mode,bpmOverride,clips.join("|")].join("::");
  if(lastApplied.current===signature)return;
  if(mode==="timeline"&&!clips.length)return;
  lastApplied.current=signature;
  apply(mode);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[auto,track?.id,genre,genreFusion,fusionOn,override,mode,bpmOverride,clips.join("|")]);
 return <fieldset><legend>Adaptive Genre Dance Intelligence · V110</legend>
  <p>Automatisch zwischen Deutschrap-/Trap-Groove, Hardstyle-Kicks, Hardtekk und weiteren Tanzprofilen wechseln. Spotify-Genre wird als Hinweis verwendet; beim Mikrofon werden Energie und BPM ergänzend berücksichtigt.</p>
  <label className="setting-check"><input type="checkbox" checked={auto} onChange={e=>{lastApplied.current="";updatePreferences({adaptiveDanceEnabled:e.target.checked});}}/> Bei Track-/Genre-Wechsel automatisch anwenden</label>
  <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
   <label>Genre-Profil<select value={override} onChange={e=>updatePreferences({adaptiveDanceGenre:e.target.value as AdaptiveStyle})}><option value="auto">Automatisch erkennen</option>{GENRES.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select></label>
   <label>Steuerung<select value={mode} onChange={e=>updatePreferences({adaptiveDanceMode:e.target.value as AdaptiveMode})}><option value="live">Live Smart Dance</option><option value="timeline">Generierte Timeline</option></select></label>
   <label>BPM-Override (0 = automatisch)<input type="number" min="0" max="240" value={bpmOverride} onChange={e=>updatePreferences({adaptiveDanceBpm:Math.max(0,Math.min(240,Number(e.target.value)||0))})}/></label>
  </div>
  <p><strong>Aktiv ausgewähltes Profil:</strong> {profile.label} · {profile.bpm} BPM · {Math.round(profile.energy*100)} % Energie. {profile.description}</p>
  <small>Erkanntes Genre: {genre??"unbekannt"}{fusionOn&&genreFusion?` + ${genreFusion.secondary} (${Math.round(genreFusion.secondaryWeight*100)} %)` : ""} ({genreSource??"keine Quelle"}). {active?"Mikrofonanalyse verfügbar.":"Ohne Mikrofon nur geschätzte Audiodynamik."}</small>
  <p><button type="button" disabled={mode==="timeline"&&!clips.length} onClick={()=>apply(mode,true)}>Profil jetzt anwenden</button></p>
  {feedback&&<p role="status">{feedback}</p>}
  <small>Manuelle Timeline-Änderungen bleiben bestehen, solange Auto deaktiviert ist. Beim aktivierten Timeline-Automatikmodus wird bei einem Track-/Genre-Wechsel neu komponiert. Die aktuelle Musikstruktur wird nicht direkt aus Spotify-Audio gelesen.</small>
 </fieldset>;
}
