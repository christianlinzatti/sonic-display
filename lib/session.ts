import {createCipheriv,createDecipheriv,createHash,randomBytes} from "node:crypto";
import type {NextResponse} from "next/server";
import {getEnv} from "@/lib/env";
export interface SpotifySession {accessToken:string;refreshToken:string;expiresAt:number;}
export const SESSION_COOKIE="sonic_session";
const STATE_COOKIE="sonic_oauth_state";
const key=()=>createHash("sha256").update(getEnv().sessionSecret).digest();
const b64=(b:Buffer)=>b.toString("base64url");
export function encryptSession(s:SpotifySession){const iv=randomBytes(12);const c=createCipheriv("aes-256-gcm",key(),iv);const data=Buffer.concat([c.update(JSON.stringify(s)),c.final()]);return `${b64(iv)}.${b64(c.getAuthTag())}.${b64(data)}`;}
export function decryptSession(v:string):SpotifySession|null{try{const [iv,tag,data]=v.split(".");if(!iv||!tag||!data)return null;const d=createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"base64url"));d.setAuthTag(Buffer.from(tag,"base64url"));return JSON.parse(Buffer.concat([d.update(Buffer.from(data,"base64url")),d.final()]).toString()) as SpotifySession;}catch{return null;}}
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"};
export function setSessionCookie(res:NextResponse,s:SpotifySession){res.cookies.set(SESSION_COOKIE,encryptSession(s),{...cookieOptions,maxAge:60*60*24*30});}
export function clearSessionCookie(res:NextResponse){res.cookies.set(SESSION_COOKIE,"",{...cookieOptions,maxAge:0});}
export function setStateCookie(res:NextResponse,state:string){res.cookies.set(STATE_COOKIE,state,{...cookieOptions,path:"/api/spotify",maxAge:600});}
export function clearStateCookie(res:NextResponse){res.cookies.set(STATE_COOKIE,"",{...cookieOptions,path:"/api/spotify",maxAge:0});}
export function stateCookieName(){return STATE_COOKIE;}
