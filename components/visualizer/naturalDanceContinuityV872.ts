/** V872 Natural Dance & Avatar Performance 4.0.
 * Post-processes the existing V738/V743 hip signal. It never drives GLB actions,
 * edits bones, modifies root position or replaces the V492 foot IK solver.
 * The input pose is sampled from the REAL musical clock, not a guessed beat.
 */
import type {HipDanceChannelsV735,HipDanceModeV735} from './hipDanceV735';

export type NaturalContinuitySettingsV872={enabled:boolean;smoothness:number;contactSafety:number;ensembleBalance:number};
export const DEFAULT_NATURAL_CONTINUITY_V872:Readonly<NaturalContinuitySettingsV872>=Object.freeze({
 enabled:true,smoothness:65,contactSafety:80,ensembleBalance:55,
});
const keys=['hipPitch','hipRoll','hipLateral','hipVertical','spineCounter','kneeCounter','ankleCounter'] as const;
const caps:Readonly<HipDanceChannelsV735>={hipPitch:.1,hipRoll:.12,hipLateral:.018,hipVertical:.022,spineCounter:.085,kneeCounter:.042,ankleCounter:.024};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const bound=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const empty=():HipDanceChannelsV735=>({hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,spineCounter:0,kneeCounter:0,ankleCounter:0});
const percent=(n:unknown,fallback:number)=>finite(n)?Math.round(bound(n,0,100)):fallback;
export function normalizeNaturalContinuityV872(raw:Partial<NaturalContinuitySettingsV872>|null|undefined):NaturalContinuitySettingsV872{
 return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:true,
  smoothness:percent(raw?.smoothness,65),contactSafety:percent(raw?.contactSafety,80),ensembleBalance:percent(raw?.ensembleBalance,55)};
}
export type NaturalContinuityStateV872={pose:HipDanceChannelsV735;trackId:string|null;seconds:number|null;ready:boolean};
export function createNaturalContinuityStateV872():NaturalContinuityStateV872{
 return {pose:empty(),trackId:null,seconds:null,ready:false};
}
export function resetNaturalContinuityV872(s:NaturalContinuityStateV872):void{
 s.pose=empty();s.trackId=null;s.seconds=null;s.ready=false;
}
export type NaturalContinuityInputV872={
 pose:HipDanceChannelsV735;mode:HipDanceModeV735;trackId?:string|null;seconds:number;delta:number;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean;autoMode:boolean;
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft?:boolean;plantedRight?:boolean;
 slot?:number;count?:number;section?:string|null;
 settings?:Partial<NaturalContinuitySettingsV872>|null;
};
export type NaturalContinuityResultV872={pose:HipDanceChannelsV735;active:boolean;reason:string;contactGain:number};
/** A single stateful envelope for hip/leg counter-motion. A discontinuity
 * hard-resets instead of interpolating across a seek, pause or track switch.
 * Planted feet and missing IK are constrained AFTER smoothing on every frame.
 */
export function refineNaturalContinuityV872(s:NaturalContinuityStateV872,input:NaturalContinuityInputV872):NaturalContinuityResultV872{
 const cfg=normalizeNaturalContinuityV872(input.settings);
 const inactive=()=>{resetNaturalContinuityV872(s);return {pose:input.pose,active:false,reason:'priority',contactGain:1};};
 if(!cfg.enabled||!input.playing||input.reducedMotion||input.manualPriority||!input.autoMode||input.mode==='off')return inactive();
 if(!finite(input.seconds)||input.seconds<0||!finite(input.delta)||input.delta<0||
    keys.some(key=>!finite(input.pose[key]))){resetNaturalContinuityV872(s);return {pose:empty(),active:false,reason:'invalid',contactGain:0};}
 const track=input.trackId??'';
 const seek=s.trackId!==null&&(s.trackId!==track||s.seconds!==null&&(input.seconds<s.seconds-.18||input.seconds-s.seconds>2.5));
 if(seek)resetNaturalContinuityV872(s);
 s.trackId=track;s.seconds=input.seconds;
 const hasContact=input.footIKEnabled&&input.contactKnown;
 const bothPlanted=hasContact&&input.plantedLeft===true&&input.plantedRight===true;
 const onePlanted=hasContact&&(input.plantedLeft===true||input.plantedRight===true);
 const contactGain=!hasContact?0:bothPlanted?1-cfg.contactSafety/100:onePlanted?1-.60*cfg.contactSafety/100:1;
 // Existing V745 provides phrase roles/timing. We only quiet background
 // response a little; the shared song clock and its phase stay untouched.
 const count=finite(input.count)?Math.round(bound(input.count!,1,4)):1;
 const slot=finite(input.slot)?Math.round(bound(input.slot!,0,count-1)):0;
 const ensembleGain=count>1&&slot>0?1-.12*cfg.ensembleBalance/100:1;
 const target=empty();
 for(const key of keys)target[key]=bound((input.pose[key]??0)*ensembleGain,-(caps[key]??0),caps[key]??0);
 target.hipLateral=(target.hipLateral??0)*contactGain;
 target.hipVertical=(target.hipVertical??0)*contactGain;
 if(!hasContact||onePlanted)target.ankleCounter=0;
 // A bounded low-pass removes sudden hip flicker without adding new
 // oscillators. The first frame and discontinuities do not chase stale data.
 const tau=.012+.095*cfg.smoothness/100;
 const alpha=cfg.smoothness===0?1:1-Math.exp(-bound(input.delta,0,.1)/tau);
 if(!s.ready){s.pose={...target};s.ready=true;}
 else for(const key of keys)s.pose[key]=bound((s.pose[key]??0)+((target[key]??0)-(s.pose[key]??0))*alpha,-(caps[key]??0),caps[key]??0);
 // A stale lateral/vertical/ankle pose must never leak into planted support.
 if(!hasContact||bothPlanted){s.pose.hipLateral=target.hipLateral;s.pose.hipVertical=target.hipVertical;}
 if(!hasContact||onePlanted)s.pose.ankleCounter=0;
 return {pose:{...s.pose},active:true,reason:seek?'seek-reset':'coordinated',contactGain};
}
