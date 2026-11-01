/** V672: Spotify playback history is read-only and normalized on the server. */
export type RecentTrackV672 = {
  id: string;
  title: string;
  artist: string;
  primaryArtist?: string;
  album: string;
  albumCoverUrl: string | null;
  spotifyUrl: string;
  durationMs: number;
  playedAt: string;
};
export type RecentPageV672 = {tracks: RecentTrackV672[]; nextBefore: string | null; hasMore: boolean};
const validId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9]{22}$/.test(id);
export function recentBeforeV672(cursor: string | null): string | null | false {
  if (cursor == null) return null;
  if (!/^\d{10,13}$/.test(cursor) || !Number.isSafeInteger(Number(cursor)) || Number(cursor) <= 0) return false;
  return cursor;
}
function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function string(value: unknown): string { return typeof value === 'string' ? value : ''; }
function cover(value: unknown): string | null {
  const url = string(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && (parsed.hostname === 'i.scdn.co' || parsed.hostname.endsWith('.scdn.co')) ? url : null;
  } catch { return null; }
}
/** Preserve repeated listens as separate history events; never deduplicate by track ID. */
export function normalizeRecentlyPlayedV672(source: unknown): RecentPageV672 | null {
  const data = object(source);
  if (!data || !Array.isArray(data.items)) return null;
  const tracks: RecentTrackV672[] = [];
  for (const entry of data.items.slice(0, 50)) {
    const event = object(entry);
    const track = object(event?.track);
    const album = object(track?.album);
    const artists = Array.isArray(track?.artists) ? track.artists : [];
    const id = track?.id;
    const when = string(event?.played_at);
    if (!validId(id) || !Number.isFinite(Date.parse(when)) || !when) continue;
    const images = Array.isArray(album?.images) ? album.images : [];
    const names = artists.map(a => string(object(a)?.name)).filter(Boolean);
    tracks.push({
      id,
      title: string(track?.name) || 'Unbekannter Titel',
      artist: names.join(', ') || 'Unbekannter Künstler',
      primaryArtist: names[0] || undefined,
      album: string(album?.name) || 'Album unbekannt',
      albumCoverUrl: cover(object(images[0])?.url) ?? cover(object(images[1])?.url),
      spotifyUrl: `https://open.spotify.com/track/${id}`,
      durationMs: typeof track?.duration_ms === 'number' && Number.isFinite(track.duration_ms) ? Math.max(0, Math.min(86400000, Math.round(track.duration_ms))) : 0,
      playedAt: new Date(when).toISOString(),
    });
  }
  const cursors = object(data.cursors);
  const before = recentBeforeV672(string(cursors?.before) || null);
  const hasMore = Boolean(data.next) && before !== null && before !== false;
  return {tracks, nextBefore: hasMore ? before as string : null, hasMore};
}
