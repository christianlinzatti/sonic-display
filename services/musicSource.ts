import type { CurrentTrackResponse, MusicSource } from "@/types/music";
import { fetchCurrentTrack } from "@/services/spotify/client";

/** Spotify adapter boundary. Future sources must normalize to CurrentTrackResponse here. */
export const spotifyMusicSource: MusicSource = {
  id: "spotify",
  async fetchPlayback(signal?: AbortSignal): Promise<CurrentTrackResponse> {
    const raw = await fetchCurrentTrack(signal);
    return { connected: raw.connected, track: raw.track, progressMs: raw.progressMs,
      isPlaying: raw.isPlaying, fetchedAt: raw.fetchedAt };
  },
};
