import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/spotify";
import { clearStateCookie, setSessionCookie, stateCookieName } from "@/lib/session";
import { spotifyCallbackUrl } from "@/lib/spotify-origin";

export const dynamic = "force-dynamic";
const matches = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  // Use configured canonical origin rather than potentially untrusted Host headers.
  let origin: string;
  try { origin = spotifyCallbackUrl().origin; }
  catch { return NextResponse.json({ error: "spotify_configuration" }, { status: 500 }); }
  const fail = (reason: string) => {
    const response = NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(reason)}`, origin));
    response.headers.set("Cache-Control", "no-store");
    clearStateCookie(response);
    return response;
  };
  if (url.searchParams.has("error")) return fail("denied");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = req.cookies.get(stateCookieName())?.value;
  if (!code || !state || !saved || !matches(state, saved)) {
    console.warn("Spotify OAuth state mismatch", { hasCode: !!code, hasState: !!state, hasCookie: !!saved, requestHost: url.host, expectedHost: new URL(origin).host });
    return fail("invalid_state");
  }
  try {
    const session = await exchangeCode(code);
    const response = NextResponse.redirect(new URL("/", origin));
    response.headers.set("Cache-Control", "no-store");
    setSessionCookie(response, session);
    clearStateCookie(response);
    return response;
  } catch (error) {
    console.error("Spotify token exchange failed:", error instanceof Error ? error.message : "unknown");
    return fail("token_exchange");
  }
}
