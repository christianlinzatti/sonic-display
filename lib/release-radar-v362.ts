/** V362 — Spotify release radar: bounded requests and strictly dated releases. */
import { normalizeDiscoveryArtists, validDiscoveryId, type DiscoveryArtist } from "@/lib/artist-discovery-v360";
import { normalizeMusicReleases, type MusicReleaseV361 } from "@/lib/music-discovery-v361";

export type RadarArtistV362 = DiscoveryArtist;
export type RadarReleaseV362 = MusicReleaseV361 & { artistId: string; artistName: string; daysOld: number; group: "album" | "single" | "other" };
export type RadarDaysV362 = 30 | 90 | 180;
export const RADAR_DAYS_V362: RadarDaysV362[] = [30, 90, 180];
const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
export const radarDays = (value: unknown): RadarDaysV362 | null => Number(value) === 30 || Number(value) === 90 || Number(value) === 180 ? Number(value) as RadarDaysV362 : null;
export function radarFollowedPath(after: string | null): string | null {
  if (after !== null && !validDiscoveryId(after)) return null;
  const p = new URLSearchParams({ type: "artist", limit: "4" });
  if (after) p.set("after", after);
  return `/me/following?${p.toString()}`;
}
export function radarArtistAlbumsPath(id: unknown): string | null {
  if (!validDiscoveryId(id)) return null;
  return `/artists/${id}/albums?${new URLSearchParams({include_groups:"album,single",limit:"10"})}`;
}
/** The returned cursor is always validated before a later request. */
export function normalizeRadarFollowed(value: unknown): { artists: RadarArtistV362[]; cursor: string | null; hasMore: boolean } | null {
  const page = record(record(value)?.artists); if (!page) return null;
  const artists = normalizeDiscoveryArtists(page.items).slice(0, 4);
  const cursors = record(page.cursors);
  const next = typeof page.next === "string" && page.next.startsWith("https://api.spotify.com/v1/me/following?");
  const cursor = next && validDiscoveryId(cursors?.after) ? cursors.after as string : null;
  return {artists, cursor, hasMore: Boolean(cursor)};
}
export function normalizeRadarReleases(raw: unknown, artist: RadarArtistV362, days: RadarDaysV362, nowMs: number): RadarReleaseV362[] {
  if (!Array.isArray(raw) || !Number.isFinite(nowMs) || !validDiscoveryId(artist.id)) return [];
  const releases = normalizeMusicReleases(raw);
  const out: RadarReleaseV362[] = [];
  for (const release of releases) {
    // Month/year precision does not establish a definite release day.
    if (release.releasePrecision !== "day" || !release.releaseDate) continue;
    const at = Date.parse(`${release.releaseDate}T00:00:00Z`);
    const age = (nowMs - at) / 86400000;
    if (!Number.isFinite(age) || age < 0 || age > days) continue;
    const original = raw.find(item => record(item)?.id === release.id);
    const group = record(original)?.album_type;
    out.push({...release,artistId:artist.id,artistName:artist.name,daysOld:Math.max(0,Math.floor(age)),group:group === "single" || group === "album" ? group : "other"});
  }
  return out.sort((a,b)=>b.releaseDate!.localeCompare(a.releaseDate!) || a.id.localeCompare(b.id));
}
export function mergeRadarReleases(releases: RadarReleaseV362[]): RadarReleaseV362[] {
  const seen = new Set<string>();
  return [...releases].sort((a,b)=>b.releaseDate!.localeCompare(a.releaseDate!) || a.id.localeCompare(b.id)).filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);return true;
  }).slice(0,120);
}
export const RADAR_SEEN_KEY_V362 = "sonic.release-radar.seen.v362";
export function parseSeenRadarIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter(validDiscoveryId))].slice(-300);
}
