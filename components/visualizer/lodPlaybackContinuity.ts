/** Transient in-memory playback snapshots across LOD GLB remounts.
 * A key is the original avatar URL (not the LOD URL). Never persisted to disk.
 */
export type ClipSnapshot = {time: number; weight: number; running: boolean; paused: boolean; timeScale: number};
export type PlaybackSnapshot = {savedAt: number; timelineElapsed: number | null; clips: Record<string, ClipSnapshot>};
const snapshots = new Map<string, PlaybackSnapshot>();
export function safeClipTime(time: number, duration: number): number {
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) return 0;
  return ((time % duration) + duration) % duration;
}
export function saveLodPlayback(source: string, snapshot: PlaybackSnapshot): void {
  if (!source || !Number.isFinite(snapshot.savedAt)) return;
  snapshots.set(source, snapshot);
  if (snapshots.size > 32) snapshots.delete(snapshots.keys().next().value!);
}
export function takeLodPlayback(source: string, now: number, maxAgeSeconds = 4): PlaybackSnapshot | null {
  const snapshot = snapshots.get(source);
  snapshots.delete(source);
  if (!snapshot || !Number.isFinite(now) || now - snapshot.savedAt < 0 || now - snapshot.savedAt > maxAgeSeconds) return null;
  return snapshot;
}
export function clearLodPlayback(source: string): void { snapshots.delete(source); }

/** V129: simultaneous LOD instances can read the outgoing pose clock without
 * consuming the one-shot unmount snapshot. The store is memory-only. */
const liveSnapshots = new Map<string, { owner: string; snapshot: PlaybackSnapshot }>();
/** V569 – keep abandoned live LOD sources bounded on month-long kiosk sessions.
 * Idle entries are pruned only when another real frame is published: no timer.
 */
export const MAX_LIVE_LOD_SOURCES_V569=32;
export const LIVE_LOD_MAX_IDLE_SECONDS_V569=6;
let lastLiveLodSweepV569=-Infinity;
export function publishLiveLodPlayback(source: string, owner: string, snapshot: PlaybackSnapshot): void {
  if (!source || !owner || !Number.isFinite(snapshot.savedAt) || snapshot.savedAt<0) return;
  // Sweep only once per second, not on every 60fps snapshot publication.
  if(snapshot.savedAt-lastLiveLodSweepV569>=1 || snapshot.savedAt<lastLiveLodSweepV569){
    for(const [key,entry] of liveSnapshots){
      const age=snapshot.savedAt-entry.snapshot.savedAt;
      if(age>LIVE_LOD_MAX_IDLE_SECONDS_V569||age<0)liveSnapshots.delete(key);
    }
    lastLiveLodSweepV569=snapshot.savedAt;
  }
  liveSnapshots.set(source, {owner, snapshot});
  while(liveSnapshots.size>MAX_LIVE_LOD_SOURCES_V569)liveSnapshots.delete(liveSnapshots.keys().next().value!);
}
export function readLiveLodPlayback(source: string, owner: string, now: number, maxAge = 0.5): PlaybackSnapshot | null {
  const entry = liveSnapshots.get(source);
  if (!entry || entry.owner === owner || !Number.isFinite(now)) return null;
  const age = now - entry.snapshot.savedAt;
  return age >= 0 && age <= maxAge ? entry.snapshot : null;
}
export function clearLiveLodPlayback(source: string, owner: string): void {
  if (liveSnapshots.get(source)?.owner === owner) liveSnapshots.delete(source);
}
