/** V363: privacy-contained, bounded client-side inbox for Spotify release checks.
 * No browser notifications, background server polling, or claim of a complete feed.
 */
import { validDiscoveryId, safeSpotifyImage } from "@/lib/artist-discovery-v360";
import { parseSeenRadarIds, type RadarReleaseV362 } from "@/lib/release-radar-v362";

export const RELEASE_NOTIFICATIONS_KEY_V363 = "sonic.release-notifications.v363";
export const RELEASE_NOTIFICATIONS_EVENT_V363 = "sonic:release-notifications-changed-v363";
export const RELEASE_CHECK_INTERVAL_V363 = 6 * 60 * 60 * 1000;
export const RELEASE_SCAN_DAYS_V363 = 30;
export const RELEASE_ALERT_DAYS_V363 = 14;
export const RELEASE_SCAN_PAGES_V363 = 2; // 2 * 4 followed artists; always bounded
export const RELEASE_INBOX_MAX_V363 = 40;
export const RELEASE_KNOWN_MAX_V363 = 500;

export type ReleaseAlertV363 = { release: RadarReleaseV362; discoveredAt: number; read: boolean };
export type ReleaseNotificationStateV363 = {
  version: 1; enabled: boolean; lastCheckedAt: number; retryAfter: number;
  nextCursor: string | null; knownIds: string[]; alerts: ReleaseAlertV363[];
};
export function freshNotificationStateV363(): ReleaseNotificationStateV363 {
  return { version: 1, enabled: true, lastCheckedAt: 0, retryAfter: 0, nextCursor: null, knownIds: [], alerts: [] };
}
const obj = (v: unknown): Record<string, unknown> | null => v !== null && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : null;
const trim = (v: unknown, length: number) => typeof v === "string" ? v.trim().slice(0, length) : "";
const safeTime = (v: unknown): number => Number.isFinite(v) && Number(v) >= 0 && Number(v) <= 1e14 ? Number(v) : 0;
const safeCursor = (v: unknown): string | null => validDiscoveryId(v) ? v : null;
const safeRelease = (raw: unknown): RadarReleaseV362 | null => {
  const r = obj(raw);
  if (!r || !validDiscoveryId(r.id) || !validDiscoveryId(r.artistId) || r.releasePrecision !== "day") return null;
  const title = trim(r.title, 160), artistName = trim(r.artistName, 140);
  if (!title || !artistName || typeof r.releaseDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.releaseDate)) return null;
  const ms = Date.parse(`${r.releaseDate}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== r.releaseDate) return null;
  return {
    id: r.id, title, artists: Array.isArray(r.artists) ? r.artists.filter((a): a is string => typeof a === "string").slice(0, 6).map(a => a.slice(0, 90)) : [artistName],
    releaseDate: r.releaseDate, releasePrecision: "day", coverUrl: safeSpotifyImage(r.coverUrl),
    spotifyUrl: `https://open.spotify.com/album/${r.id}`,
    artistId: r.artistId, artistName, daysOld: 0,
    group: r.group === "single" || r.group === "album" ? r.group : "other"
  };
};
/** Never trust JSON restored from localStorage or from a previously cached API result. */
export function parseNotificationStateV363(raw: unknown): ReleaseNotificationStateV363 {
  const r = obj(raw), fresh = freshNotificationStateV363();
  if (!r || r.version !== 1) return fresh;
  const knownIds = parseSeenRadarIds(r.knownIds).slice(-RELEASE_KNOWN_MAX_V363);
  // V362 parser bounds to 300; V363 can store more without trusting malformed IDs.
  const ids = Array.isArray(r.knownIds) ? [...new Set(r.knownIds.filter(validDiscoveryId))].slice(-RELEASE_KNOWN_MAX_V363) : knownIds;
  const alerts: ReleaseAlertV363[] = [];
  const seen = new Set<string>();
  if (Array.isArray(r.alerts)) for (const rawAlert of r.alerts.slice(-RELEASE_INBOX_MAX_V363 * 2)) {
    const a = obj(rawAlert), release = safeRelease(a?.release);
    if (!release || seen.has(release.id)) continue;
    seen.add(release.id);
    alerts.push({ release, discoveredAt: safeTime(a?.discoveredAt), read: a?.read === true });
  }
  return { version: 1, enabled: r.enabled !== false, lastCheckedAt: safeTime(r.lastCheckedAt), retryAfter: safeTime(r.retryAfter),
    nextCursor: safeCursor(r.nextCursor), knownIds: ids, alerts: alerts.slice(-RELEASE_INBOX_MAX_V363) };
}
export function shouldCheckReleasesV363(state: ReleaseNotificationStateV363, now: number): boolean {
  return state.enabled && Number.isFinite(now) && now >= state.retryAfter && (state.lastCheckedAt === 0 || now - state.lastCheckedAt >= RELEASE_CHECK_INTERVAL_V363);
}
export function countUnreadReleasesV363(state: ReleaseNotificationStateV363): number {
  return state.alerts.filter(a => !a.read).length;
}
export function readReleaseAlertV363(state: ReleaseNotificationStateV363, id: string | "all"): ReleaseNotificationStateV363 {
  return { ...state, alerts: state.alerts.map(a => id === "all" || a.release.id === id ? { ...a, read: true } : a) };
}
/** Add newly discovered releases, not duplicates; previously seen V362 albums are suppressed. */
export function applyReleaseScanV363(state: ReleaseNotificationStateV363, results: unknown[], now: number, seenInRadar: unknown,
  nextCursor: string | null, partial = false): { state: ReleaseNotificationStateV363; added: number } {
  const known = new Set(state.knownIds), inInbox = new Set(state.alerts.map(a => a.release.id));
  const radarSeen = new Set(parseSeenRadarIds(seenInRadar));
  const alerts = [...state.alerts]; let added = 0;
  const unique = new Map<string, RadarReleaseV362>();
  for (const raw of results.slice(0, 120)) {
    const release = safeRelease(raw);
    if (release && !unique.has(release.id)) unique.set(release.id, release);
  }
  for (const release of [...unique.values()].sort((a, b) => b.releaseDate!.localeCompare(a.releaseDate!))) {
    const at = Date.parse(`${release.releaseDate}T00:00:00Z`);
    const age = (now - at) / 86400000;
    if (!Number.isFinite(age) || age < 0 || age > RELEASE_SCAN_DAYS_V363) continue;
    const previouslyKnown = known.has(release.id);
    known.add(release.id);
    if (previouslyKnown || inInbox.has(release.id) || radarSeen.has(release.id) || age > RELEASE_ALERT_DAYS_V363) continue;
    // Bounded additions prevent notifications flooding the display on first setup.
    if (added >= 12) continue;
    alerts.push({ release: { ...release, daysOld: Math.floor(age) }, discoveredAt: now, read: false });
    inInbox.add(release.id); added += 1;
  }
  return { added, state: {
    ...state,
    lastCheckedAt: now, retryAfter: partial ? now + 60 * 60 * 1000 : 0,
    nextCursor: safeCursor(nextCursor), knownIds: [...known].slice(-RELEASE_KNOWN_MAX_V363),
    alerts: alerts.slice(-RELEASE_INBOX_MAX_V363)
  } };
}
