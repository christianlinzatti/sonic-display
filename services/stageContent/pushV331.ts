/** V331 live text messages. In-memory pub/sub for a single long-lived Node server. */
export interface LiveStageMessageV331 { id: string; title: string; text: string; priority: "normal"|"high"; durationSeconds: number; receivedAt: number; }
const isObject=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
export function validateLiveStageMessageV331(input:unknown, now=Date.now()):LiveStageMessageV331|null {
  if(!isObject(input))return null;
  const text=typeof input.text==="string"?input.text.trim().slice(0,1600):"";
  if(!text)return null;
  const duration=typeof input.durationSeconds==="number"&&Number.isFinite(input.durationSeconds)?input.durationSeconds:15;
  return {id:`${now}-${Math.random().toString(36).slice(2,10)}`,title:typeof input.title==="string"?input.title.trim().slice(0,90)||"Nachricht":"Nachricht",text,priority:input.priority==="high"?"high":"normal",durationSeconds:Math.min(120,Math.max(3,Math.round(duration))),receivedAt:now};
}
const KEY="__sonicStagePushV331";
type PushBus={latest:LiveStageMessageV331|null;listeners:Set<(msg:LiveStageMessageV331)=>void>};
const memory=globalThis as typeof globalThis & {[KEY]?:PushBus};
export function stagePushBusV331():PushBus {return memory[KEY]??(memory[KEY]={latest:null,listeners:new Set()});}
export function publishStageMessageV331(message:LiveStageMessageV331):void {const bus=stagePushBusV331();bus.latest=message;for(const callback of bus.listeners){try{callback(message);}catch{/* disconnected */}}}
