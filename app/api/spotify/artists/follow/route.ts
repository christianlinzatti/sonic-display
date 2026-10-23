import { NextRequest, NextResponse } from "next/server";
import { getValidSession, refreshSession, ReauthRequiredError } from "@/lib/spotify";
import { clearSessionCookie, setSessionCookie, type SpotifySession } from "@/lib/session";
import { artistLink, FOLLOW_READ_SCOPE, FOLLOW_WRITE_SCOPE, hasFollowScope, parseArtistIds, validArtistId, normalizeContainsResponse, libraryUrisQuery } from "@/lib/artist-follow-v359";
import { spotifyCallbackUrl } from "@/lib/spotify-origin";

/** No Spotify bearer token leaves the server. All status responses bypass caches. */
export const dynamic = "force-dynamic";
const SPOTIFY_API = "https://api.spotify.com/v1";
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const unauth = () => { const r = json({ code: "reauth_required", message: "Bitte mit Spotify neu verbinden." }, 401); clearSessionCookie(r); return r; };
const noScope = () => json({ code: "consent_required", message: "Bitte Spotify neu verbinden und Künstler-Abonnements freigeben." }, 403);
const failed = (status: number) => {
  if (status === 429) return json({ code: "rate_limited", message: "Spotify begrenzt derzeit die Anfragen. Bitte später erneut versuchen." }, 429);
  // The February 2026 migration guide names artist URIs, but the PUT/DELETE endpoint
  // reference currently omits them. An unsupported artist URI must never report success.
  if ([400, 404, 405, 410, 422].includes(status)) return json({ code: "unsupported", message: "Spotify akzeptiert diese Künstler-Aktion derzeit nicht. Du kannst den Künstler direkt in Spotify öffnen." }, 503);
  if (status === 403) return json({ code: "consent_required", message: "Spotify hat den Zugriff verweigert. Bitte Spotify neu verbinden oder den Künstler in Spotify öffnen." }, 403);
  return json({ code: "spotify_error", message: "Spotify konnte den Künstlerstatus nicht aktualisieren." }, status >= 500 ? 503 : 502);
};
type Valid = NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
async function callSpotify(valid: Valid, path: string, method: "GET" | "PUT" | "DELETE"): Promise<{ result: Response; valid: Valid }> {
  const request = (session: SpotifySession) => fetch(`${SPOTIFY_API}${path}`, {
    method, headers: { Authorization: `Bearer ${session.accessToken}`, Accept: "application/json" },
    cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  let result = await request(valid.session);
  if (result.status === 401) { valid = { session: await refreshSession(valid.session), refreshed: true }; result = await request(valid.session); }
  return { result, valid };
}
function attachCookie(response: NextResponse, valid: Valid): NextResponse {
  if (valid.refreshed) setSessionCookie(response, valid.session);
  return response;
}
async function readFollowing(valid: Valid, ids: string[]): Promise<{ response: NextResponse; valid: Valid; statuses?: Record<string, boolean> }> {
  const query = libraryUrisQuery(ids);
  if (!query) return { response: json({ code: "invalid_artist" }, 400), valid };
  const call = await callSpotify(valid, `/me/library/contains?${query}`, "GET");
  valid = call.valid;
  if (call.result.status === 401) return { response: unauth(), valid };
  if (!call.result.ok) return { response: failed(call.result.status), valid };
  const statuses = normalizeContainsResponse(await call.result.json(), ids);
  if (!statuses) return { response: json({ code: "spotify_format_error", message: "Spotify hat keinen gültigen Follow-Status geliefert." }, 502), valid };
  return { response: json({ statuses }), valid, statuses };
}
export async function GET(req: NextRequest) {
  let valid: Valid | null = null;
  try {
    const ids = parseArtistIds(req.nextUrl.searchParams.get("ids"));
    if (!ids) return json({ code: "invalid_ids" }, 400);
    valid = await getValidSession(); if (!valid) return unauth();
    if (!hasFollowScope(valid.session.scopes, FOLLOW_READ_SCOPE)) return attachCookie(noScope(), valid);
    const check = await readFollowing(valid, ids);
    return check.response.status === 401 ? check.response : attachCookie(check.response, check.valid);
  } catch (e) {
    if (e instanceof ReauthRequiredError) return unauth();
    return valid ? attachCookie(json({ code: "spotify_unavailable", message: "Spotify momentan nicht erreichbar." }, 503), valid) : json({ code: "spotify_unavailable" }, 503);
  }
}
export async function POST(req: NextRequest) {
  let valid: Valid | null = null;
  try {
    const origin = req.headers.get("origin");
    if (!origin || origin !== spotifyCallbackUrl().origin) return json({ code: "invalid_origin" }, 403);
    let body: unknown; try { body = await req.json(); } catch { return json({ code: "invalid_json" }, 400); }
    const item = body as { artistId?: unknown; follow?: unknown } | null;
    if (!item || !validArtistId(item.artistId) || typeof item.follow !== "boolean") return json({ code: "invalid_artist" }, 400);
    valid = await getValidSession(); if (!valid) return unauth();
    if (!hasFollowScope(valid.session.scopes, FOLLOW_WRITE_SCOPE) || !hasFollowScope(valid.session.scopes, FOLLOW_READ_SCOPE)) return attachCookie(noScope(), valid);
    const query = libraryUrisQuery([item.artistId]);
    if (!query) return attachCookie(json({ code: "invalid_artist" }, 400), valid);
    // New 2026 Library API (replaces the deprecated artist-follow mutations).
    const method = item.follow ? "PUT" : "DELETE";
    const mutation = await callSpotify(valid, `/me/library?${query}`, method);
    valid = mutation.valid;
    if (mutation.result.status === 401) return unauth();
    if (!mutation.result.ok) return attachCookie(failed(mutation.result.status), valid);
    // A 2xx without a body is not proof of artist follow: read back the actual status.
    const verify = await readFollowing(valid, [item.artistId]);
    valid = verify.valid;
    if (!verify.statuses) return verify.response.status === 401 ? verify.response : attachCookie(verify.response, valid);
    if (verify.statuses[item.artistId] !== item.follow) return attachCookie(json({ code: "unconfirmed", message: "Die Aktion wurde gesendet, aber Spotify hat den neuen Status noch nicht bestätigt. Bitte erneut prüfen." }, 409), valid);
    return attachCookie(json({ artistId: item.artistId, following: item.follow, spotifyUrl: artistLink(item.artistId) }), valid);
  } catch (e) {
    if (e instanceof ReauthRequiredError) return unauth();
    return valid ? attachCookie(json({ code: "spotify_unavailable", message: "Spotify momentan nicht erreichbar." }, 503), valid) : json({ code: "spotify_unavailable" }, 503);
  }
}
