/** Ably-backed multi-instance message delivery. All credentials stay server-side. */
import type { LiveStageMessageV331 } from "./pushV331";
export const STAGE_REALTIME_CHANNEL_V332 = "sonic-stage-live";
export const STAGE_REALTIME_EVENT_V332 = "stage-message";
export function realtimeConfigV332() {
  const key = process.env.STAGE_CONTENT_ABLY_API_KEY?.trim() ?? "";
  // Channel is server-controlled and never taken from untrusted requests.
  const configured = process.env.STAGE_CONTENT_ABLY_CHANNEL?.trim() || STAGE_REALTIME_CHANNEL_V332;
  const channel = /^[A-Za-z0-9_-]{1,100}$/.test(configured) ? configured : STAGE_REALTIME_CHANNEL_V332;
  return {key, channel, enabled: !!key};
}
function authHeader(key:string) { return `Basic ${Buffer.from(key).toString("base64")}`; }
function keyName(key:string) { const i=key.indexOf(":");return i>0?key.slice(0,i):""; }
export async function requestStageRealtimeTokenV332():Promise<unknown> {
  const {key,channel,enabled}=realtimeConfigV332();
  if(!enabled||!keyName(key))throw new Error("Ably not configured");
  const response=await fetch(`https://rest.ably.io/keys/${encodeURIComponent(keyName(key))}/requestToken`,{
    method:"POST",headers:{Authorization:authHeader(key),"Content-Type":"application/json"},
    body:JSON.stringify({ttl:60*60*1000,capability:JSON.stringify({[channel]:["subscribe"]})}),
    cache:"no-store",signal:AbortSignal.timeout(8000)
  });
  if(!response.ok)throw new Error(`Ably token request failed (${response.status})`);
  return response.json();
}
export async function publishStageRealtimeV332(message:LiveStageMessageV331):Promise<void> {
  const {key,channel,enabled}=realtimeConfigV332();
  if(!enabled)throw new Error("Ably not configured");
  const response=await fetch(`https://rest.ably.io/channels/${encodeURIComponent(channel)}/messages`,{
    method:"POST",headers:{Authorization:authHeader(key),"Content-Type":"application/json"},
    body:JSON.stringify({name:STAGE_REALTIME_EVENT_V332,data:message,id:message.id}),
    cache:"no-store",signal:AbortSignal.timeout(8000)
  });
  if(!response.ok)throw new Error(`Ably publish failed (${response.status})`);
}
