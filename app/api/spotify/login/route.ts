import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { setStateCookie } from "@/lib/session";
import { spotifyCallbackUrl } from "@/lib/spotify-origin";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const env = getEnv();
    const callback = spotifyCallbackUrl();
    // Canonicalize BEFORE setting the state cookie: localhost and 127.0.0.1 have separate cookies.
    if (req.nextUrl.origin !== callback.origin) {
      const canonicalLogin = new URL("/api/spotify/login", callback.origin);
      return NextResponse.redirect(canonicalLogin, { status: 307, headers: { "Cache-Control": "no-store" } });
    }
    const state = randomBytes(32).toString("base64url");
    const authorize = new URL("https://accounts.spotify.com/authorize");
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("client_id", env.clientId);
    authorize.searchParams.set("redirect_uri", callback.toString());
    authorize.searchParams.set("scope", "user-read-currently-playing user-read-playback-state");
    authorize.searchParams.set("state", state);
    authorize.searchParams.set("show_dialog", "false");
    const response = NextResponse.redirect(authorize);
    response.headers.set("Cache-Control", "no-store");
    setStateCookie(response, state);
    return response;
  } catch (error) {
    console.error("Spotify login configuration error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "spotify_configuration", message: "Spotify OAuth configuration is invalid. Check server logs." }, { status: 500 });
  }
}
