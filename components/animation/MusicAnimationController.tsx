"use client";
import { GENRES, type MusicGenre } from "@/types/animation";
import { useVisualizer } from "@/context/VisualizerContext";
import { GenreAvatar } from "./GenreAvatar";
import { GenreCorrectionDashboard } from "./GenreCorrectionDashboard";
import { useState } from "react";

export function MusicAnimationController(){
 const [showGenreDashboard,setShowGenreDashboard]=useState(false);
 const {track,isPlaying,genre,genreStatus,genreSource,genreMatchedTag,genreError,genreOverride,setGenreOverride,genreConfidence,genreReason,genreFusion,genreBpmHint,setGenreBpmHint,artistSuggestion,genreMemoryCount,clearGenreMemory,audio:metrics,audioActive:active}=useVisualizer();
 const selectedGenre=genre??"hardstyle";
 const genreLabel=genreStatus==="loading"?"Detecting genre with Last.fm…":genreStatus==="error"?`Last.fm unavailable${genreError?` · ${genreError}`:""} · choose genre manually`:genreStatus==="unknown"?"No matching Last.fm genre · using default avatar":genreMatchedTag?`Last.fm: ${genreMatchedTag} (${genreSource})${genreOverride?" · manual override":" · automatic"}`:"Choose an avatar genre";
 return <section className="music-animation" aria-label="Music animation controller">
 <header className="animation-header"><div><strong>Music Animation</strong><span>{active?"Live microphone analysis":"Estimated rhythm (not Spotify audio analysis)"}</span></div><label>Avatar genre<select value={selectedGenre} onChange={e=>setGenreOverride(e.target.value as MusicGenre)}>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label></header>
 <p className="genre-source">{genreLabel} {genreConfidence>0&&!genreOverride?` · Vertrauen (heuristisch): ${genreConfidence}%`:""} {genreReason&&!genreOverride?` · ${genreReason}`:""}{genreOverride&&<button type="button" onClick={()=>setGenreOverride(null)}>Gespeicherte Korrektur löschen</button>}</p>
 {genreFusion&&!genreOverride&&<p className="genre-source"><strong>Genre-Fusion:</strong> {GENRES.find(x=>x.id===genreFusion.primary)?.label} + {GENRES.find(x=>x.id===genreFusion.secondary)?.label} ({Math.round(genreFusion.secondaryWeight*100)} % Zweitstil). Tanz und Bühne können beide Stile kombinieren.</p>}
 <label style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>Optionaler BPM-Hinweis (manuell)<input aria-label="BPM-Hinweis" type="number" min="50" max="240" step="1" value={genreBpmHint??""} placeholder="Unbekannt" onChange={e=>{const n=Number(e.target.value);setGenreBpmHint(e.target.value&&n>=50&&n<=240?n:null)}} style={{width:95}}/><span>Kein Spotify-Audio-BPM-Feed; Hinweis ist optional.</span></label>
 {track&&artistSuggestion&&<p className="genre-source">Artist-Hinweis: <strong>{artistSuggestion.genre}</strong> ({artistSuggestion.votes} von {artistSuggestion.total} anderen korrigierten Songs). <button type="button" onClick={()=>setGenreOverride(artistSuggestion.genre)}>Für diesen Song übernehmen</button> Der Hinweis wird nicht automatisch angewendet.</p>}
 <p className="genre-source">Gespeicherte Genre-Korrekturen: {genreMemoryCount}. {genreMemoryCount>0&&<button type="button" onClick={()=>{if(window.confirm("Alle gespeicherten Genre-Korrekturen löschen?"))clearGenreMemory();}}>Alle Korrekturen löschen</button>}</p>
 <button type="button" onClick={()=>setShowGenreDashboard(open=>!open)}>{showGenreDashboard?"Genre-Dashboard schließen":"Genre-Dashboard öffnen"}</button>
 {showGenreDashboard&&<GenreCorrectionDashboard onClose={()=>setShowGenreDashboard(false)}/>}
 <GenreAvatar genre={selectedGenre} beat={active?metrics.beatStrength:0} bass={active?metrics.bass:0} highs={active?metrics.highs:0} isPlaying={isPlaying}/>
 <footer className="animation-track">{track?`${track.title} · ${track.artist}`:"Waiting for track"}<span>{active?"MIC INPUT":"ESTIMATED"}</span></footer>
 </section>;
}
