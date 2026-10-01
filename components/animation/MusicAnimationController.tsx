"use client";
import { useState } from "react";
import { useMusic } from "@/context/MusicContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { GENRES, type MusicGenre } from "@/types/animation";
import { GenreAvatar } from "./GenreAvatar";
/** Presentation/controller only: consumes normalized context data; never fetches. */
export function MusicAnimationController(){const {track,isPlaying}=useMusic();const {metrics,active}=useAudioAnalysis();const [genre,setGenre]=useState<MusicGenre>("hardstyle");return <section className="music-animation" aria-label="Music animation controller">
 <header className="animation-header"><div><strong>Music Animation</strong><span>{active?"Live microphone analysis":"Avatar reacts to playback state"}</span></div><label>Avatar genre<select value={genre} onChange={e=>setGenre(e.target.value as MusicGenre)}>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label></header>
 <GenreAvatar genre={genre} beat={active?metrics.beat:0} bass={active?metrics.bass:0} highs={active?metrics.highs:0} isPlaying={isPlaying}/>
 <footer className="animation-track">{track?`${track.title} · ${track.artist}`:"Waiting for track"}<span>{active?"MIC INPUT":"MIC OFF"}</span></footer>
 </section>}
