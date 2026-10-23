import { NextRequest, NextResponse } from "next/server";
import { findLyrics } from "@/services/lyrics/server";
import { getValidSession, ReauthRequiredError } from "@/lib/spotify";
import { setSessionCookie } from "@/lib/session";
import { isSpotifyId } from "@/services/lyrics/providers/spotifyColorLyrics";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = params.get("title")?.trim();
  const artist = params.get("artist")?.trim();
  const duration = Number(params.get("duration"));

  if (!title || !artist || !Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json(
      { error: "title, artist and positive duration required" },
      { status: 400 },
    );
  }

  try {
    // Spotify color-lyrics is an opt-in, undocumented endpoint. Never relay tokens to the browser.
    // If the session is missing or its Web API token is rejected, LRCLIB remains available.
    let token: string | undefined;
    let refreshed: Awaited<ReturnType<typeof getValidSession>> = null;
    const trackId = params.get("trackId");
    const albumId = params.get("albumId");
    if (process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED === "true" && isSpotifyId(trackId)) {
      try { refreshed = await getValidSession(); token = refreshed?.session.accessToken; }
      catch (e) { if (!(e instanceof ReauthRequiredError)) { /* avoid leaking provider details */ } }
    }
    const lyrics = await findLyrics({
      title,
      artist,
      album: params.get("album") ?? "",
      duration,
      trackId: isSpotifyId(trackId) ? trackId : undefined,
      albumId: isSpotifyId(albumId) ? albumId : undefined,
    }, token);
    const response = NextResponse.json(lyrics, {headers:{"Cache-Control":"private, no-store"}});
    if (refreshed?.refreshed) setSessionCookie(response, refreshed.session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lyrics lookup failed" },
      { status: 502 },
    );
  }
}
