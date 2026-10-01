import {cookies} from "next/headers";
import {getEnv} from "@/lib/env";
import {decryptSession,SESSION_COOKIE,type SpotifySession} from "@/lib/session";
const TOKEN_URL="https://accounts.spotify.com/api/token";
export async function getSession(){const jar=await cookies();const value=jar.get(SESSION_COOKIE)?.value;return value?decryptSession(value):null;}
export class ReauthRequiredError extends Error {}
async function refresh(s:SpotifySession):Promise<SpotifySession>{
 const e=getEnv();
 let r:Response;
 try { r=await fetch(TOKEN_URL,{method:"POST",headers:{Authorization:`Basic ${Buffer.from(`${e.clientId}:${e.clientSecret}`).toString("base64")}`,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"refresh_token",refresh_token:s.refreshToken}),cache:"no-store",signal:AbortSignal.timeout(12000)}); }
 catch { throw new Error("Spotify token service temporarily unavailable"); }
 if(r.status===400||r.status===401)throw new ReauthRequiredError("Spotify-Anmeldung erforderlich.");
 if(!r.ok)throw new Error(`Spotify token service temporarily unavailable (${r.status})`);
 const t=await r.json() as {access_token:string;expires_in:number;refresh_token?:string};
 return {accessToken:t.access_token,refreshToken:t.refresh_token||s.refreshToken,expiresAt:Date.now()+t.expires_in*1000};
}
export async function getValidSession(){const s=await getSession();if(!s)return null;if(s.expiresAt>Date.now()+90000)return {session:s,refreshed:false};return {session:await refresh(s),refreshed:true};}
export async function refreshSession(s:SpotifySession){return refresh(s);}
export async function exchangeCode(code:string){const e=getEnv();const r=await fetch(TOKEN_URL,{method:"POST",headers:{Authorization:`Basic ${Buffer.from(`${e.clientId}:${e.clientSecret}`).toString("base64")}`,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:e.redirectUri}),cache:"no-store",signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error(`Spotify token exchange failed (${r.status})`);const t=await r.json() as {access_token:string;refresh_token:string;expires_in:number};return {accessToken:t.access_token,refreshToken:t.refresh_token,expiresAt:Date.now()+t.expires_in*1000};}
