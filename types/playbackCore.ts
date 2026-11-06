/** Canonical playback/lyrics DTO types: intentionally independent of UI settings and 3D modules. */
export interface Track { id:string; title:string; artist:string; artists:string[]; artistDetails?:Array<{id:string;name:string;spotifyUrl:string}>; album:string; albumId?:string; albumCoverUrl:string|null; spotifyUrl:string; durationMs:number; }
export interface LyricWord { text: string; startMs: number; endMs: number | null; }
export interface LyricLine { startMs:number; endMs:number|null; text:string; words?: LyricWord[]; }
export interface Lyrics { provider:"lrclib" | "lyrics.ovh" | "genius" | "spotify"; synced:boolean; lines:LyricLine[]; plainText:string|null; }
