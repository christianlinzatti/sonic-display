import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
const COOKIE = "sonic_avatar_admin";
const TTL = 60 * 60 * 12;
function secret() { return process.env.SONIC_ADMIN_SESSION_SECRET || ""; }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export function passwordConfigured() { return Boolean(process.env.SONIC_ADMIN_PASSWORD && secret() && process.env.SONIC_ADMIN_PASSWORD.length >= 12 && secret().length >= 32); }
export function passwordMatches(value: string) { const expected = Buffer.from(process.env.SONIC_ADMIN_PASSWORD || ""); const received = Buffer.from(value); return passwordConfigured() && expected.length === received.length && timingSafeEqual(expected, received); }
export function sessionToken() { const expires = String(Math.floor(Date.now()/1000) + TTL); return `${expires}.${sign(expires)}`; }
export async function isAdmin() { if (!passwordConfigured()) return false; const token = (await cookies()).get(COOKIE)?.value || ""; const [expires, mac] = token.split("."); if (!expires || !mac || !/^\d+$/.test(expires) || Number(expires) < Date.now()/1000 || Number(expires) > Date.now()/1000+TTL) return false; const a=Buffer.from(mac,"hex"), b=Buffer.from(sign(expires),"hex"); return a.length===b.length && timingSafeEqual(a,b); }
export function sameOrigin(req: NextRequest) { const origin=req.headers.get("origin"); if (!origin) return true; try { return new URL(origin).host === req.headers.get("host"); } catch { return false; } }
export const adminCookie = COOKIE;
