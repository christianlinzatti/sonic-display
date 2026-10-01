"use client";
import type { MusicGenre } from "@/types/animation";
const palette:Record<MusicGenre,{a:string;b:string;accent:string;label:string}>={
 hardstyle:{a:"#ff315e",b:"#6415a8",accent:"#faff00",label:"RAVER"},techno:{a:"#00d5c0",b:"#153c91",accent:"#d4ff00",label:"PULSE"},hiphop:{a:"#ff9a28",b:"#a52b35",accent:"#ffe0a3",label:"FLOW"},rock:{a:"#ed4a28",b:"#361b25",accent:"#f4d4a2",label:"RIFF"},ambient:{a:"#5f9fca",b:"#7964bc",accent:"#e0f5ff",label:"DREAM"},pop:{a:"#ff6db4",b:"#7047d9",accent:"#fff39b",label:"STAR"}
};
export function GenreAvatar({genre,beat,bass,highs,isPlaying}:{genre:MusicGenre;beat:number;bass:number;highs:number;isPlaying:boolean}){const p=palette[genre];const pulse=1+Math.min(.22,bass*.16+beat*.12);return <div className={`genre-avatar genre-${genre} ${isPlaying?"is-playing":""}`} style={{"--avatar-a":p.a,"--avatar-b":p.b,"--avatar-accent":p.accent,"--pulse":pulse,"--beat":beat} as React.CSSProperties} aria-label={`${genre} animated avatar`}>
 <div className="avatar-orbit orbit-one"/><div className="avatar-orbit orbit-two"/><div className="avatar-body" style={{transform:`scale(${pulse}) translateY(${beat>0.35?-5:0}px)`}}>
 <div className="avatar-hair"/><div className="avatar-head"><span className="avatar-eye eye-left"/><span className="avatar-eye eye-right"/><span className="avatar-mouth"/></div><div className="avatar-neck"/><div className="avatar-torso"><span className="avatar-emblem">{p.label}</span></div>
 </div><div className="avatar-spark spark-one"/><div className="avatar-spark spark-two"/><div className="avatar-caption">{genre.toUpperCase()} <small>AVATAR</small></div><div className="avatar-level" style={{height:`${8+highs*35}px`}}/>
 </div>}
