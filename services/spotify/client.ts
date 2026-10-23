import type { CurrentTrackResponse } from "@/types/music";

/** Browser-side boundary to the server-owned Spotify session. Never handles tokens. */
export async function fetchCurrentTrack(signal?: AbortSignal): Promise<CurrentTrackResponse> {
  const response = await fetch("/api/spotify/current", { cache: "no-store", signal });
  if (!response.ok) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    const error = new Error(`Spotify vorübergehend nicht erreichbar (${response.status})`) as Error & { status:number; retryAfter:number };
    error.status = response.status;
    error.retryAfter = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 0;
    throw error;
  }
  return response.json() as Promise<CurrentTrackResponse>;
}

export async function disconnectSpotify(): Promise<void> {
  const response = await fetch("/api/spotify/disconnect", { method: "POST" });
  if (!response.ok) throw new Error("Spotify konnte nicht getrennt werden. Bei aktivem Web Push bitte die serverseitige Löschung erneut versuchen.");
  // The server has now revoked any persistent push credentials for this account.
  // Also unregister the device subscription locally; keep the PWA service worker itself.
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      await subscription?.unsubscribe();
    }
  } catch { /* Server data is already revoked; browser-level cleanup may need another visit. */ }
}
