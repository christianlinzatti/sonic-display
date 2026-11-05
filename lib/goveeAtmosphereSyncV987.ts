/** V987 – consent-bound, song-specific V986 room tint in the EXISTING V909 LAN loop.
 * No hardware driver, polling, intervals, power commands, or storage here.
 * A V986 storyboard is creative: only V604/V763 validated scenes supply timing.
 */
import {ACCENT_HEX_V986,normalizeAtmospherePlanV986,type AtmospherePlanV986}
 from './aiAtmosphereDesignerV986';
import {verifiedConcertSnapshotV985} from './predictiveShowTimelineV985';
import type {ConcertTimelineSnapshotV763} from '../components/visualizer/concertTimelineBridgeV763';
import type {GoveeLookV909} from './goveeLanV909';
import type {GoveeRoleV911} from './goveeConcertDirectorV911';

export const GOVEE_ROOM_ATMOSPHERE_EVENT_V987='sonic-display:govee-room-atmosphere-v987';
export type RoomAtmosphereSessionV987={trackId:string;durationMs:number;approvedAt:number;plan:AtmospherePlanV986};
export type RoomAtmosphereDecisionV987={active:boolean;actIndex:number;accent:string;
 tint:number;dim:number;reason:string};
export type RoomAtmospherePolicyV987={enabled:boolean;playing:boolean;visible:boolean;
 savedShowActive?:boolean;authoredStageActive?:boolean;recovering?:boolean;
 reducedMotion?:boolean;voiceActive?:boolean};
const inactive=(reason:string):RoomAtmosphereDecisionV987=>({active:false,actIndex:-1,accent:'',tint:0,dim:0,reason});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);

/** Created only by an explicit UI click. Approval is memory-only for the active tab. */
export function createRoomAtmosphereSessionV987(plan:AtmospherePlanV986,
 snapshot:ConcertTimelineSnapshotV763|null,trackId:string,durationMs:number,now:number):RoomAtmosphereSessionV987|null{
 const safe=normalizeAtmospherePlanV986(plan);
 if(!safe||!verifiedConcertSnapshotV985(snapshot,trackId,durationMs)||
  !snapshot?.playing||!finite(now)||now<=0||!finite(snapshot.progressMs)||
  snapshot.progressMs<0||snapshot.progressMs>durationMs)return null;
 return {trackId,durationMs,approvedAt:now,plan:safe};
}
/** Runtime revalidates all event data, never treating an arbitrary CustomEvent as permission. */
export function normalizeRoomAtmosphereSessionV987(raw:unknown):RoomAtmosphereSessionV987|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if(typeof r.trackId!=='string'||!r.trackId||r.trackId.length>160||
  !Number.isInteger(r.durationMs)||!finite(r.durationMs)||r.durationMs<10000||r.durationMs>1800000||
  !finite(r.approvedAt)||r.approvedAt<=0)return null;
 const plan=normalizeAtmospherePlanV986(r.plan);
 return plan?{trackId:r.trackId,durationMs:r.durationMs as number,
  approvedAt:r.approvedAt,plan}:null;
}
/** Recheck actual playback clock each existing LAN tick; seek/track changes fail closed.
 * Creative acts are five relative visual motifs, NOT claimed measured verse/drop locations.
 */
export function planRoomAtmosphereV987(raw:RoomAtmosphereSessionV987|null,
 snapshot:ConcertTimelineSnapshotV763|null,trackId:string,durationMs:number,
 progressMs:number,now:number,policy:RoomAtmospherePolicyV987):RoomAtmosphereDecisionV987{
 if(!policy?.enabled||!policy.playing||!policy.visible)return inactive('Raumlicht-Sync ist nicht freigegeben oder Wiedergabe pausiert');
 if(policy.savedShowActive||policy.authoredStageActive||policy.recovering||policy.reducedMotion||policy.voiceActive)
  return inactive('Manuelle Show, Sprachbefehl oder Schutzmodus hat Vorrang');
 const session=normalizeRoomAtmosphereSessionV987(raw);
 if(!session||session.trackId!==trackId||session.durationMs!==durationMs||
  !finite(now)||now<session.approvedAt||now-session.approvedAt>3600000)
  return inactive('Keine aktuelle ausdrückliche Songfreigabe');
 if(!verifiedConcertSnapshotV985(snapshot,trackId,durationMs)||!snapshot?.playing||
  !finite(progressMs)||progressMs<0||progressMs>=durationMs||
  !finite(snapshot.progressMs)||Math.abs(snapshot.progressMs-progressMs)>3000)
  return inactive('Keine aktuelle, bestätigte Songposition');
 const scene=snapshot.scenes.find(x=>progressMs>=x.startMs&&progressMs<x.endMs);
 if(!scene)return inactive('Außerhalb bestätigter Songabschnitte');
 const actIndex=Math.min(4,Math.floor(scene.startMs/durationMs*5));
 const act=session.plan.acts[actIndex];
 const accent=ACCENT_HEX_V986[act.accent];
 // Very slow/low-contrast color matching, no flashes or strobe modes.
 const tint=Math.min(.24,.10+act.beams/550);
 const dim=Math.min(.10,Math.max(0,(65-act.virtualLight)/650));
 return {active:true,actIndex,accent,tint,dim,reason:'Freigegebene Raumfarbe an bestätigter V604-Szene'};
}
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const safeRgb=(v:number)=>Math.round(clamp(v,0,255));
/** Modify only the existing whole-lamp look, with previous-send slew limiting.
 * Brightness never exceeds the preceding V915 group/fixture cap or master limit.
 */
export function applyRoomAtmosphereV987(look:GoveeLookV909,previous:GoveeLookV909|undefined,
 decision:RoomAtmosphereDecisionV987,role:GoveeRoleV911,masterBrightness:number):GoveeLookV909{
 if(!decision.active||!/^#[0-9a-fA-F]{6}$/.test(decision.accent)||
  !finite(look.brightness)||look.brightness<0||look.brightness>100||
  !finite(masterBrightness)||masterBrightness<1||masterBrightness>100||
  !['wall','rhythm','neon','ambient'].includes(role)||
  !finite(decision.tint)||decision.tint<0||decision.tint>.24||
  !finite(decision.dim)||decision.dim<0||decision.dim>.10||
  !['r','g','b'].every(k=>finite(look.color?.[k as keyof typeof look.color])))return look;
 const desired={r:parseInt(decision.accent.slice(1,3),16),
  g:parseInt(decision.accent.slice(3,5),16),b:parseInt(decision.accent.slice(5,7),16)};
 const roleMix=role==='ambient'?.65:role==='rhythm'?.8:role==='neon'?1:.9;
 const mix=decision.tint*roleMix;
 const color={r:0,g:0,b:0};
 for(const channel of ['r','g','b'] as const){
  const from=safeRgb(look.color[channel]);
  const target=safeRgb(from*(1-mix)+desired[channel]*mix);
  const previousChannel=previous&&finite(previous.color?.[channel])?safeRgb(previous.color[channel]):from;
  color[channel]=clamp(target,previousChannel-24,previousChannel+24);
 }
 const brightness=Math.min(Math.round(look.brightness),Math.round(masterBrightness),
  Math.round(look.brightness*(1-decision.dim)));
 return {color,brightness};
}
