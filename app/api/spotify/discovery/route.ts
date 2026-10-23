import { NextRequest, NextResponse } from "next/server";
import { getValidSession, refreshSession, ReauthRequiredError } from "@/lib/spotify";
import { clearSessionCookie, setSessionCookie, type SpotifySession } from "@/lib/session";
import { normalizeDiscoveryArtists, normalizeDiscoverySongs, spotifyDiscoveryPath, validDiscoveryId } from "@/lib/artist-discovery-v360";

export const dynamic = "force-dynamic";
type Valid = NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
const json = (data: object, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const unauth = () => { const response = json({ code: "reauth_required", message: "Bitte Spotify neu verbinden." }, 401); clearSessionCookie(response); return response; };
const finish = (response: NextResponse, valid: Valid) => { if (valid.refreshed) setSessionCookie(response, valid.session); return response; };
function failed(status: number, retry: string | null) {
  const code = status === 429 ? "rate_limited" : status === 403 ? "forbidden" : "spotify_unavailable";
  const response = json({ code, message: status === 429 ? "Spotify begrenzt gerade die Anfragen. Bitte später erneut versuchen." : status === 403 ? "Spotify hat diese Abfrage nicht freigegeben." : "Spotify-Suche vorübergehend nicht verfügbar." }, status === 429 ? 429 : status === 403 ? 403 : 503);
  if (status === 429 && retry && /^\d{1,5}$/.test(retry)) response.headers.set("Retry-After", retry);
  return response;
}
async function requestSpotify(valid: Valid, path: string): Promise<{valid: Valid; response: Response}> {
  const request = (session: SpotifySession) => fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${session.accessToken}`, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12000) });
  let response = await request(valid.session);
  if (response.status === 401) { valid = { session: await refreshSession(valid.session), refreshed: true }; response = await request(valid.session); }
  return {valid, response};
}
/** Spotify tokens and source API responses stay on the server. */
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const mode = search.get("mode") ?? "genre";
  const artistId = search.get("artistId") ?? "";
  const path = spotifyDiscoveryPath(mode, { q: search.get("q") ?? "", genre: search.get("genre") ?? "", offset: Number(search.get("offset") ?? "0"), artistId, artistName: search.get("name") ?? "" });
  if (!path || (mode === "songs" && !validDiscoveryId(artistId))) return json({ code: "invalid_query", message: "Ungültige Künstler-Suchanfrage." }, 400);
  let valid: Valid | null = null;
  try {
    valid = await getValidSession(); if (!valid) return unauth();
    if (mode === "top" && !(valid.session.scopes ?? "").split(/\s+/).includes("user-top-read")) return finish(json({ code: "consent_required", message: "Für deine Spotify-Favoriten ist user-top-read erforderlich. Bitte Spotify neu verbinden." }, 403), valid);
    const result = await requestSpotify(valid, path); valid = result.valid;
    if (result.response.status === 401) return unauth();
    if (!result.response.ok) return finish(failed(result.response.status, result.response.headers.get("Retry-After")), valid);
    const data = await result.response.json() as { artists?: { items?: unknown[]; next?: string | null }; tracks?: { items?: unknown[] }; items?: unknown[] };
    if (mode === "songs") return finish(json({songs: normalizeDiscoverySongs(data.tracks?.items, artistId), label:"Songauswahl – keine Popularitätsrangliste"}), valid);
    const page = mode === "top" ? data : data.artists;
    return finish(json({artists: normalizeDiscoveryArtists(page?.items), hasMore: mode !== "top" && Boolean((page as {next?: string | null} | undefined)?.next), source:mode}), valid);
  } catch (error) {
    if (error instanceof ReauthRequiredError) return unauth();
    return valid ? finish(json({ code: "spotify_unavailable", message: "Spotify ist vorübergehend nicht erreichbar." }, 503), valid) : json({ code: "spotify_unavailable", message: "Spotify ist vorübergehend nicht erreichbar." }, 503);
  }
}
