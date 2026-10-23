declare module "@/types/music" {
  export type LyricWord = { text:string; startMs:number; endMs:number|null };
  export type LyricLine = { startMs:number; endMs:number|null; text:string; words?:LyricWord[] };
  export type Lyrics = { provider:"spotify"|"lrclib"|"lyrics.ovh"|"genius"; synced:boolean; lines:LyricLine[]; plainText:string|null };
}
