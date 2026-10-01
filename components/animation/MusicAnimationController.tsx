"use client";
import { useEffect, useState } from "react";
import { useMusic } from "@/context/MusicContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { GENRES, type MusicGenre } from "@/types/animation";
import { GenreAvatar } from "./GenreAvatar";

type GenreResult = { genre: MusicGenre | null; matchedTag?: string | null; source?: "track" | "artist"; error?: string };
export function MusicAnimationController(){
 const {track,isPlaying}=useMusic(); const {metrics,active}=useAudioAnalysis();
 const [genre,setGenre]=useState<MusicGenre>("hardstyle"); const [detected,setDetected]=useState<GenreResult|null>(null); const [manual,setManual]=useState(false);
 useEffect(()=>{ if(!track){setDetected(null);return;} const controller=new AbortController();
  const params=new URLSearchParams({artist:track.artist,track:track.title});
  fetch(`/api/genre?${params}`,{signal:controller.signal}).then(r=>r.json()).then((result:GenreResult)=>{setDetected(result);if(!manual && result.genre)setGenre(result.genre);}).catch(()=>{});
  return ()=>controller.abort();
 },[track?.id,track?.artist,track?.title]);
 const selectGenre=(value:MusicGenre)=>{setGenre(value);setManual(true);};
 return <section className="music-animation" aria-label="Music animation controller">
 <header className="animation-header"><div><strong>Music Animation</strong><span>{active?"Live microphone analysis":"Avatar reacts to playback state"}</span></div><label>Avatar genre<select value={genre} onChange={e=>selectGenre(e.target.value as MusicGenre)}>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label></header>
 <p className="genre-source">{detected?.genre?`Last.fm: ${detected.matchedTag} (${detected.source})${manual?" · manual override":" · automatic"}`:detected?.error?"Last.fm unavailable · choose genre manually":"Detecting genre with Last.fm…"}</p>
 <GenreAvatar genre={genre} beat={active?metrics.beat:0} bass={active?metrics.bass:0} highs={active?metrics.highs:0} isPlaying={isPlaying}/>
 <footer className="animation-track">{track?`${track.title} · ${track.artist}`:"Waiting for track"}<span>{active?"MIC INPUT":"MIC OFF"}</span></footer>
 </section>
}
