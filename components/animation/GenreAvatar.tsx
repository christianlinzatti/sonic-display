"use client";
import type { MusicGenre } from "@/types/animation";
import { MUSIC_GENRES } from "@/config/musicGenres";
export function GenreAvatar({genre,beat,bass,highs,isPlaying}:{genre:MusicGenre;beat:number;bass:number;highs:number;isPlaying:boolean}){const p=MUSIC_GENRES[genre];const pulse=1+Math.min(.22,bass*.16+beat*.12);return <div className={`genre-avatar genre-${genre} ${isPlaying?"is-playing":""}`} style={{"--avatar-a":p.a,"--avatar-b":p.b,"--avatar-accent":p.accent,"--pulse":pulse,"--beat":beat} as React.CSSProperties} aria-label={`${genre} animated avatar`}>
 <div className="avatar-orbit orbit-one"/><div className="avatar-orbit orbit-two"/><div className="avatar-body" style={{transform:`scale(${pulse}) translateY(${beat>0.35?-5:0}px)`}}>
 <div className="avatar-hair"/><div className="avatar-head"><span className="avatar-eye eye-left"/><span className="avatar-eye eye-right"/><span className="avatar-mouth"/></div><div className="avatar-neck"/><div className="avatar-torso"><span className="avatar-emblem">{p.avatarLabel}</span></div>
 </div><div className="avatar-spark spark-one"/><div className="avatar-spark spark-two"/><div className="avatar-caption">{genre.toUpperCase()} <small>AVATAR</small></div><div className="avatar-level" style={{height:`${8+highs*35}px`}}/>
 </div>}
