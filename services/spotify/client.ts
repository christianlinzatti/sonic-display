import {networkJsonV1010} from '@/lib/networkJsonV1010';
import {resetClientSpotifyV1010,clientNetworkV1010} from '@/lib/networkCoordinatorV1010';
import type { CurrentTrackResponse } from "@/types/music";

/** Browser-side boundary to the server-owned Spotify session. Never handles tokens. */
export async function fetchCurrentTrack(signal?: AbortSignal): Promise<CurrentTrackResponse> {
  const response=await networkJsonV1010('/api/spotify/current',{cache:'no-store',signal},
    {provider:'spotify',priority:'playback',retry:1,timeoutMs:15000});
  if(!response.ok){
    const error=Object.assign(new Error(`Spotify vorübergehend nicht erreichbar (${response.status})`),{status:response.status});
    throw error;
  }
  const result=await response.json() as CurrentTrackResponse&{accountScope?:unknown};
  // HMAC-based server scope: never cache data from two Spotify sessions together.
  if(typeof result.accountScope==='string'&&/^[a-f0-9]{24}$/.test(result.accountScope))clientNetworkV1010.setAccount(result.accountScope);
  return result;
}

export async function disconnectSpotify(): Promise<void> {
  const response = await fetch("/api/spotify/disconnect", { method: "POST" });
  if (!response.ok) throw new Error("Spotify konnte nicht getrennt werden. Bei aktivem Web Push bitte die serverseitige Löschung erneut versuchen.");
  resetClientSpotifyV1010();
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
