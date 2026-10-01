export interface Track { id:string; title:string; artist:string; artists:string[]; album:string; albumCoverUrl:string|null; spotifyUrl:string; durationMs:number; }
export interface LyricLine { startMs:number; endMs:number|null; text:string; }
export interface Lyrics { provider:"lrclib"; synced:boolean; lines:LyricLine[]; plainText:string|null; }
export interface MusicState { connected:boolean; loading:boolean; error:string|null; track:Track|null; progressMs:number; isPlaying:boolean; fetchedAt:number; lyrics:Lyrics|null; }
export interface MusicContextValue extends MusicState { refresh:()=>Promise<void>; disconnect:()=>Promise<void>; }
