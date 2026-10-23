/** V361 — bounded Spotify music discovery; no removed recommendation/new-release endpoints. */
import { DISCOVERY_GENRES, type DiscoveryGenre, safeSpotifyImage, validDiscoveryId, normalizeDiscoverySearch } from "@/lib/artist-discovery-v360";
export type MusicDiscoveryMode = "genre" | "search" | "new" | "saved" | "album";
export type MusicGenreV361 = DiscoveryGenre;
export const MUSIC_GENRES_V361 = DISCOVERY_GENRES;
export type MusicTrackV361 = {
  id: string; title: string; artists: string[]; album: string; releaseDate: string | null;
  releasePrecision: "day" | "month" | "year" | null; coverUrl: string | null;
  spotifyUrl: string; previewUrl: string | null; explicit: boolean;
};
export type MusicReleaseV361 = {
  id: string; title: string; artists: string[]; releaseDate: string | null;
  releasePrecision: "day" | "month" | "year" | null;
  coverUrl: string | null; spotifyUrl: string;
};
type Dict = Record<string, unknown>;
const obj = (v: unknown): Dict | null => v !== null && typeof v === "object" && !Array.isArray(v) ? v as Dict : null;
const str = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";
const artistNames = (v: unknown): string[] => Array.isArray(v) ? v.map(a => str(obj(a)?.name, 90)).filter(Boolean).slice(0, 8) : [];
const cover = (v: unknown) => Array.isArray(v) ? v.map(a => safeSpotifyImage(obj(a)?.url)).find(Boolean) ?? null : null;
export function safeSpotifyPreview(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try { const u = new URL(value); return u.protocol === "https:" && u.hostname === "p.scdn.co" && u.pathname.startsWith("/mp3-preview/") ? value : null; }
  catch { return null; }
}
export function normalizeReleaseDate(value: unknown, precision: unknown): {date: string | null; precision: MusicTrackV361["releasePrecision"]} {
  if (typeof value !== "string" || !["day", "month", "year"].includes(String(precision))) return {date:null,precision:null};
  const p = precision as "day" | "month" | "year";
  const regex = p === "day" ? /^\d{4}-\d{2}-\d{2}$/ : p === "month" ? /^\d{4}-\d{2}$/ : /^\d{4}$/;
  if (!regex.test(value)) return {date:null,precision:null};
  const year = Number(value.slice(0,4)), month = Number(value.slice(5,7)), day = Number(value.slice(8,10));
  if (year < 1900 || year > 2100 || (p !== "year" && (month < 1 || month > 12))) return {date:null,precision:null};
  if (p === "day" && (day < 1 || day > new Date(Date.UTC(year,month,0)).getUTCDate())) return {date:null,precision:null};
  return {date:value,precision:p};
}
export function normalizeMusicTracks(value: unknown, album?: MusicReleaseV361): MusicTrackV361[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>(), out: MusicTrackV361[] = [];
  for (const raw of value) {
    const data = obj(raw), item = obj(data?.track) ?? data;
    if (!item || !validDiscoveryId(item.id) || seen.has(item.id)) continue;
    const title = str(item.name, 160); if (!title) continue;
    const fullAlbum = obj(item.album);
    const d = normalizeReleaseDate(fullAlbum?.release_date ?? album?.releaseDate, fullAlbum?.release_date_precision ?? album?.releasePrecision);
    seen.add(item.id);
    out.push({id:item.id,title,artists:artistNames(item.artists),album:str(fullAlbum?.name,140) || album?.title || "",releaseDate:d.date,releasePrecision:d.precision,
      coverUrl:cover(fullAlbum?.images) ?? album?.coverUrl ?? null,spotifyUrl:`https://open.spotify.com/track/${item.id}`,
      previewUrl:safeSpotifyPreview(item.preview_url),explicit:item.explicit === true});
    if (out.length >= 10) break;
  }
  return out;
}
export function normalizeMusicReleases(value: unknown): MusicReleaseV361[] {
  if (!Array.isArray(value)) return [];
  const out: MusicReleaseV361[] = [],seen = new Set<string>();
  for (const raw of value) {
    const item = obj(raw); if (!item || !validDiscoveryId(item.id) || seen.has(item.id)) continue;
    const title = str(item.name,160); if(!title)continue;
    seen.add(item.id);
    const d = normalizeReleaseDate(item.release_date,item.release_date_precision);
    out.push({id:item.id,title,artists:artistNames(item.artists),releaseDate:d.date,releasePrecision:d.precision,coverUrl:cover(item.images),spotifyUrl:`https://open.spotify.com/album/${item.id}`});
    if(out.length>=10)break;
  }
  return out;
}
export function musicDiscoveryPath(mode: MusicDiscoveryMode | string, params: {query?:unknown;genre?:string;offset?:number;albumId?:string;withGenre?:boolean}): string | null {
  const offset = Number.isFinite(params.offset) ? Math.min(50,Math.max(0,Math.trunc(params.offset!))) : 0;
  const qs = new URLSearchParams();qs.set("limit","10");qs.set("offset",String(offset));
  if (mode === "saved") return `/me/tracks?${qs}`;
  if (mode === "album") return validDiscoveryId(params.albumId) ? `/albums/${params.albumId}/tracks?${qs}` : null;
  if (mode === "search") {
    const query = normalizeDiscoverySearch(params.query);
    if(!query)return null;
    qs.set("q",query);qs.set("type","track");return `/search?${qs}`;
  }
  if (mode === "genre" || mode === "new") {
    if (mode === "genre" && (!params.genre || !Object.hasOwn(DISCOVERY_GENRES,params.genre))) return null;
    if (mode === "new" && params.withGenre && (!params.genre || !Object.hasOwn(DISCOVERY_GENRES,params.genre))) return null;
    const genre = params.genre && Object.hasOwn(DISCOVERY_GENRES,params.genre) ? DISCOVERY_GENRES[params.genre as DiscoveryGenre] : null;
    // tag:new is available for ALBUM searches only and means approximately two weeks.
    // genre:... is supported for TRACK searches, not ALBUM searches.
    qs.set("q", mode === "new" ? `tag:new${params.withGenre && genre ? ` ${genre.label.toLowerCase()}` : ""}` : genre!.query);
    qs.set("type",mode === "new" ? "album" : "track");return `/search?${qs}`;
  }
  return null;
}
export function parseTrackIds(value: string | null): string[] | null {
  if (!value || value.length > 400) return null;
  const ids = value.split(",");
  if (!ids.length || ids.length > 10 || !ids.every(validDiscoveryId)) return null;
  return Array.from(new Set(ids));
}
export function trackUriQuery(ids: string[]): string | null {
  if (!ids.length || ids.length > 10 || !ids.every(validDiscoveryId)) return null;
  return new URLSearchParams({uris:ids.map(id=>`spotify:track:${id}`).join(",")}).toString();
}
export function normalizeLibraryContains(value: unknown, ids: string[]): Record<string,boolean> | null {
  if (!Array.isArray(value) || value.length !== ids.length || value.some(v=>typeof v!=="boolean")) return null;
  return Object.fromEntries(ids.map((id,i)=>[id,value[i] as boolean]));
}
