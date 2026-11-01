declare const process: {env: Record<string, string | undefined>};
declare module "@/services/lyrics/selectionV554" {
  export {chooseBestLyricsV554} from "../../services/lyrics/selectionV554";
}
declare module "@/services/lyrics/providers/lrclib" {
  export function lookupLrclibLyrics(query: {title:string;artist:string;album:string;duration:number}): Promise<import("@/types/music").Lyrics|null>;
}
declare module "@/services/lyrics/providers/lyricsOvh" {
  export function lookupLyricsOvh(title:string,artist:string): Promise<import("@/types/music").Lyrics|null>;
}
declare module "@/services/lyrics/providers/genius" {
  export function lookupGeniusLyrics(query: {title:string;artist:string;album:string;duration:number}): Promise<import("@/types/music").Lyrics|null>;
}
declare module "@/services/lyrics/providers/spotifyColorLyrics" {
  export function lookupSpotifyColorLyrics(trackId:string,albumId:string|undefined,token:string): Promise<import("@/types/music").Lyrics|null>;
}
// Real implementation is typechecked by tests/tsconfig.v654-resilience.json.
declare module "@/services/lyrics/providerDeadlineV654" {
  export function withProviderDeadlineV654<T>(task: Promise<T>, timeoutMs: number): Promise<T>;
}
