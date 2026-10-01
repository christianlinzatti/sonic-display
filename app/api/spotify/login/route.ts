import {randomBytes} from "node:crypto";
import {NextResponse} from "next/server";
import {getEnv} from "@/lib/env";
import {setStateCookie} from "@/lib/session";
export async function GET(){const e=getEnv();const state=randomBytes(24).toString("hex");const u=new URL("https://accounts.spotify.com/authorize");u.searchParams.set("response_type","code");u.searchParams.set("client_id",e.clientId);u.searchParams.set("redirect_uri",e.redirectUri);u.searchParams.set("scope","user-read-currently-playing user-read-playback-state");u.searchParams.set("state",state);const res=NextResponse.redirect(u);setStateCookie(res,state);return res;}
