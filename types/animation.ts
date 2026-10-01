import type { AudioMetrics } from "./audio";
export type MusicGenre = "hardstyle" | "techno" | "hiphop" | "rock" | "ambient" | "pop";
export type AnimationFrame = { genre: MusicGenre; beat: number; bass: number; mids: number; highs: number; isPlaying: boolean; trackId: string | null };
export type MusicAnimationControllerProps = { frame: AnimationFrame; onGenreChange: (genre: MusicGenre) => void };
export const GENRES: {id:MusicGenre;label:string}[] = [
 {id:"hardstyle",label:"Hardstyle / Hardtekk"},{id:"techno",label:"Techno / Electronic"},{id:"hiphop",label:"Hip-hop"},{id:"rock",label:"Rock / Metal"},{id:"ambient",label:"Ambient"},{id:"pop",label:"Pop"}
];
