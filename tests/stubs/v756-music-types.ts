/** Isolated UI test stand-in only; never compiled into production. */
export type LyricWord={text:string;startMs:number;endMs:number|null};
export type LyricLine={text:string;startMs:number;endMs:number|null;words?:LyricWord[]};
export type Lyrics={provider:'spotify'|'lrclib'|'genius'|'lyrics.ovh';synced:boolean;lines:LyricLine[];plainText:string|null};
