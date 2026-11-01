/** V823 – per-track, authored visual FX envelopes. Pure and seek-stable.
 * No independent beat clock, activation of blocked FX, camera edits or GPU allocations.
 */
export type FxTimelineLaneV823='laser'|'led'|'particles'|'foam'|'transition';
export type FxTimelineModeV823='boost'|'mute';
export type FxTimelineLedLookV823='auto'|'equalizer'|'geometry'|'waves'|'tunnel';
export interface FxTimelineCueV823 {
  id:string;trackId:string;startMs:number;durationMs:number;
  lane:FxTimelineLaneV823;mode:FxTimelineModeV823;intensity:number;
  ledLook:FxTimelineLedLookV823;
}
export interface FxTimelineLaneGainV823 {boost:number;mute:number;ledLook:FxTimelineLedLookV823;}
export type FxTimelineResultV823=Record<FxTimelineLaneV823,FxTimelineLaneGainV823>;
export const FX_TIMELINE_LANES_V823:readonly FxTimelineLaneV823[]=['laser','led','particles','foam','transition'];
const LOOKS:readonly FxTimelineLedLookV823[]=['auto','equalizer','geometry','waves','tunnel'];
const isFiniteNumber=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const empty=():FxTimelineResultV823=>({
  laser:{boost:0,mute:0,ledLook:'auto'},led:{boost:0,mute:0,ledLook:'auto'},
  particles:{boost:0,mute:0,ledLook:'auto'},foam:{boost:0,mute:0,ledLook:'auto'},
  transition:{boost:0,mute:0,ledLook:'auto'},
});
/** Protect localStorage, backups and runtime from malformed input or oversized timelines. */
export function normalizeFxTimelineV823(raw:unknown):FxTimelineCueV823[]{
 if(!Array.isArray(raw))return [];
 const out:FxTimelineCueV823[]=[];const seen=new Set<string>();const perTrack=new Map<string,number>();
 for(const item of raw.slice(0,1000)){
  if(!item||typeof item!=='object')continue;
  const c=item as Record<string,unknown>;
  if(typeof c.id!=='string'||!/^[-a-zA-Z0-9_]{1,72}$/.test(c.id)||
     typeof c.trackId!=='string'||!/^[-a-zA-Z0-9_:]{1,128}$/.test(c.trackId)||
     !FX_TIMELINE_LANES_V823.includes(c.lane as FxTimelineLaneV823)||
     (c.mode!=='boost'&&c.mode!=='mute')||
     !isFiniteNumber(c.startMs)||!isFiniteNumber(c.durationMs)||!isFiniteNumber(c.intensity))continue;
  const key=c.trackId+':'+c.id;
  if(seen.has(key)||(perTrack.get(c.trackId)||0)>=48)continue;
  seen.add(key);perTrack.set(c.trackId,(perTrack.get(c.trackId)||0)+1);
  out.push({id:c.id,trackId:c.trackId,startMs:Math.round(clamp(c.startMs,0,21600000)),
   durationMs:Math.round(clamp(c.durationMs,250,600000)),
   intensity:Math.round(clamp(c.intensity,0,100)),
   lane:c.lane as FxTimelineLaneV823,mode:c.mode as FxTimelineModeV823,
   ledLook:LOOKS.includes(c.ledLook as FxTimelineLedLookV823)?c.ledLook as FxTimelineLedLookV823:'auto'});
  if(out.length>=200)break;
 }
 return out.sort((a,b)=>a.trackId.localeCompare(b.trackId)||a.startMs-b.startMs||a.id.localeCompare(b.id));
}
export function evaluateFxTimelineV823(input:{
 cues:readonly FxTimelineCueV823[];enabled:boolean;trackId:string;durationMs:number;
 progressMs:number;verified:boolean;playing:boolean;reducedMotion:boolean;
}):FxTimelineResultV823{
 const result=empty();
 if(!input.enabled||!input.verified||!input.playing||input.reducedMotion||
   !input.trackId||!isFiniteNumber(input.progressMs)||!isFiniteNumber(input.durationMs)||
   input.durationMs<=0||input.progressMs<0||input.progressMs>=input.durationMs)return result;
 for(const cue of input.cues){
  if(cue.trackId!==input.trackId||!FX_TIMELINE_LANES_V823.includes(cue.lane)||
   !isFiniteNumber(cue.startMs)||!isFiniteNumber(cue.durationMs)||!isFiniteNumber(cue.intensity)||
   cue.durationMs<=0||cue.intensity<=0||cue.startMs>=input.durationMs)continue;
  const end=Math.min(input.durationMs,cue.startMs+cue.durationMs);
  if(input.progressMs<cue.startMs||input.progressMs>=end)continue;
  const fade=Math.min(250,(end-cue.startMs)/3);
  const envelope=fade>0?Math.min(1,(input.progressMs-cue.startMs)/fade,(end-input.progressMs)/fade):1;
  const value=clamp(cue.intensity/100,0,1)*clamp(envelope,0,1);
  const lane=result[cue.lane];
  // Overlaps are deterministic; neither mute nor boost ever accumulates above 1.
  if(cue.mode==='mute')lane.mute=Math.max(lane.mute,value);
  else {lane.boost=Math.max(lane.boost,value);
   if(cue.lane==='led'&&cue.ledLook!=='auto'&&value>.001)lane.ledLook=cue.ledLook;}
 }
 return result;
}
/** A timeline never activates an inactive renderer. Hard caps remain lower than V810-V822 caps. */
export function fxTimelineMultiplierV823(g:FxTimelineLaneGainV823):number{
 const mute=isFiniteNumber(g.mute)?clamp(g.mute,0,1):0;
 const boost=isFiniteNumber(g.boost)?clamp(g.boost,0,1):0;
 return (1+.40*boost)*(1-mute);
}
