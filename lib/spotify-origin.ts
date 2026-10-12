import { getEnv } from "@/lib/env";

/** Spotify requires an exact redirect URI match, including host and port. */
export function spotifyCallbackUrl() {
  const uri = new URL(getEnv().redirectUri);
  if (uri.pathname !== "/api/spotify/callback" || uri.search || uri.hash) {
    throw new Error("SPOTIFY_REDIRECT_URI must end with /api/spotify/callback (without query or hash)");
  }
  if (uri.protocol !== "https:" && !(uri.protocol === "http:" && ["127.0.0.1", "localhost"].includes(uri.hostname))) {
    throw new Error("SPOTIFY_REDIRECT_URI must use HTTPS except on local development");
  }
  return uri;
}
