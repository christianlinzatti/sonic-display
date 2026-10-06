"use client";
import { GENRES, type MusicGenre } from "@/types/animation";
import { useVisualizer } from "@/context/VisualizerContext";
import { GenreAvatar } from "./GenreAvatar";

export function MusicAnimationController(){
 const {track,isPlaying,genre,genreStatus,genreSource,genreMatchedTag,genreError,genreOverride,setGenreOverride,audio:metrics,audioActive:active}=useVisualizer();
 const selectedGenre=genre??"hardstyle";
 const genreLabel=genreStatus==="loading"?"Detecting genre with Last.fm…":genreStatus==="error"?`Last.fm unavailable${genreError?` · ${genreError}`:""} · choose genre manually`:genreStatus==="unknown"?"No matching Last.fm genre · using default avatar":genreMatchedTag?`Last.fm: ${genreMatchedTag} (${genreSource})${genreOverride?" · manual override":" · automatic"}`:"Choose an avatar genre";
 return <section className="music-animation" aria-label="Music animation controller">
 <header className="animation-header"><div><strong>Music Animation</strong><span>{active?"Live microphone analysis":"Avatar reacts to playback state"}</span></div><label>Avatar genre<select value={selectedGenre} onChange={e=>setGenreOverride(e.target.value as MusicGenre)}>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label></header>
 <p className="genre-source">{genreLabel}{genreOverride&&<button type="button" onClick={()=>setGenreOverride(null)}>Use Last.fm genre</button>}</p>
 <GenreAvatar genre={selectedGenre} beat={active?metrics.beatStrength:0} bass={active?metrics.bass:0} highs={active?metrics.highs:0} isPlaying={isPlaying}/>
 <footer className="animation-track">{track?`${track.title} · ${track.artist}`:"Waiting for track"}<span>{active?"MIC INPUT":"MIC OFF"}</span></footer>
 </section>;
}
