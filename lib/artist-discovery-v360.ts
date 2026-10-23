/** V360: pure, defensive boundaries for Spotify Artist Discovery. */
export type DiscoveryGenre = "deutschrap" | "hardstyle" | "hardtekk" | "techno" | "hiphop" | "rock" | "ambient";
export const DISCOVERY_GENRES: Record<DiscoveryGenre, { label: string; query: string }> = {
  deutschrap: { label: "Deutschrap", query: 'genre:"german hip hop"' },
  hardstyle: { label: "Hardstyle", query: 'genre:hardstyle' },
  hardtekk: { label: "Hardtekk", query: 'genre:hardtekk' },
  techno: { label: "Techno", query: 'genre:techno' },
  hiphop: { label: "Hip-Hop", query: 'genre:"hip hop"' },
  rock: { label: "Rock", query: 'genre:rock' },
  ambient: { label: "Ambient", query: 'genre:ambient' },
};
export type DiscoveryArtist = { id: string; name: string; imageUrl: string | null; genres: string[]; spotifyUrl: string };
export type DiscoverySong = { id: string; name: string; album: string; spotifyUrl: string };
export const SPOTIFY_ID_RE = /^[A-Za-z0-9]{10,32}$/;
export const validDiscoveryId = (value: unknown): value is string => typeof value === "string" && SPOTIFY_ID_RE.test(value);
export function safeSpotifyImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return url.protocol === "https:" && ["i.scdn.co", "mosaic.scdn.co", "image-cdn-ak.spotifycdn.com"].includes(url.hostname) ? value : null; }
  catch { return null; }
}
const record = (value: unknown): Record<string, unknown> | null => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
export function normalizeDiscoveryArtists(value: unknown): DiscoveryArtist[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>(); const out: DiscoveryArtist[] = [];
  for (const raw of value) {
    const data = record(raw); if (!data || !validDiscoveryId(data.id) || typeof data.name !== "string") continue;
    const name = data.name.trim().slice(0, 140); if (!name || seen.has(data.id)) continue;
    seen.add(data.id);
    const images = Array.isArray(data.images) ? data.images : [];
    const imageUrl = images.map(img => safeSpotifyImage(record(img)?.url)).find(Boolean) ?? null;
    const genres = Array.isArray(data.genres) ? data.genres.filter((v): v is string => typeof v === "string").slice(0, 4).map(v => v.slice(0, 45)) : [];
    out.push({ id: data.id, name, imageUrl, genres, spotifyUrl: `https://open.spotify.com/artist/${data.id}` });
  }
  return out;
}
export function normalizeDiscoverySongs(value: unknown, artistId: string): DiscoverySong[] {
  if (!Array.isArray(value) || !validDiscoveryId(artistId)) return [];
  const seen = new Set<string>(); const out: DiscoverySong[] = [];
  for (const raw of value) {
    const data = record(raw);
    if (!data || !validDiscoveryId(data.id) || typeof data.name !== "string" || !Array.isArray(data.artists) || !data.artists.some(a => record(a)?.id === artistId) || seen.has(data.id)) continue;
    seen.add(data.id);
    out.push({ id: data.id, name: data.name.slice(0, 160), album: typeof record(data.album)?.name === "string" ? String(record(data.album)?.name).slice(0, 100) : "", spotifyUrl: `https://open.spotify.com/track/${data.id}` });
    if (out.length >= 5) break;
  }
  return out;
}
/** Control chars, field injection and unchecked free-form genre queries never reach Spotify. */
export function normalizeDiscoverySearch(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const q = value.trim().replace(/\s+/g, " ");
  return q.length >= 2 && q.length <= 70 && !/[\x00-\x1F\x7F]/.test(q) ? q : null;
}
export function spotifyDiscoveryPath(mode: string, params: { q?: string; genre?: string; offset?: number; artistId?: string; artistName?: string }): string | null {
  const q = new URLSearchParams();
  if (mode === "search") {
    const search = normalizeDiscoverySearch(params.q);
    if (!search) return null;
    q.set("q", search); q.set("type", "artist"); q.set("limit", "10"); q.set("offset", String(Number.isFinite(params.offset) ? Math.min(50, Math.max(0, Math.trunc(params.offset!))) : 0));
    return `/search?${q}`;
  }
  if (mode === "genre") {
    if (!params.genre || !Object.hasOwn(DISCOVERY_GENRES, params.genre)) return null;
    q.set("q", DISCOVERY_GENRES[params.genre as DiscoveryGenre].query); q.set("type", "artist"); q.set("limit", "10"); q.set("offset", String(Number.isFinite(params.offset) ? Math.min(50, Math.max(0, Math.trunc(params.offset!))) : 0));
    return `/search?${q}`;
  }
  if (mode === "top") return "/me/top/artists?limit=10&time_range=medium_term";
  if (mode === "songs") {
    if (!validDiscoveryId(params.artistId)) return null;
    const name = normalizeDiscoverySearch(params.artistName);
    if (!name) return null;
    // Strip field operators: the artist ID is matched again against each result.
    q.set("q", `artist:\"${name.replace(/[\"\\:]/g, " ").replace(/\s+/g," ").trim()}\"`);
    q.set("type", "track"); q.set("limit", "10");
    return `/search?${q}`;
  }
  return null;
}
