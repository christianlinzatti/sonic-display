/** V834 – camera-intent-aware budget shedding for existing V825 FX. No camera changes,
 * visibility queries or GPU allocations. A VERIFIED V761 storyboard intent is a hint,
 * NOT proof that an object is off screen. V825 can always throttle further.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FxPerfLaneV825,FxPerfPlanV825} from './concertFxPerformanceOptimizerV825';

export type CameraIntentV834='portrait'|'dialogue'|'ensemble'|'wide'|'rise'|'pulse'|'breath'|null;
export interface CameraAwareResultV834 {
  applied:boolean;reason:'off'|'unverified'|'manual-camera'|'no-pressure'|'wide-stage'|'protected-cues'|'optimized';
  intent:CameraIntentV834;relativeCostSaved:number;reduced:readonly FxPerfLaneV825[];
}
const DECO_LANES=['crowd','foam','particles','spectral','haze'] as const;
const COST:Record<typeof DECO_LANES[number],number>={crowd:1.8,foam:2.3,particles:2.5,spectral:2,haze:1.1};
const WEIGHT:Record<typeof DECO_LANES[number],number>={crowd:.80,foam:.95,particles:.67,spectral:.80,haze:.65};
const FOCUS:Record<Exclude<CameraIntentV834,null>,number>={portrait:1,dialogue:.73,ensemble:.35,wide:0,rise:0,pulse:0,breath:.45};
const SECTION:Record<ConcertFxCueV810['section'],number>={intro:.85,verse:1,hook:.62,build:.72,drop:.24,break:.65,finale:.24};
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
/** Changes only freshly produced V825 plan gains, never enables FX, never weakens a
 * verified black-out or manual FX cue. Runs after V825 and before render cue scaling.
 * If camera state is unverified, leaves everything unchanged (fail closed).
 */
export function applyCameraAwarePerformanceV834(plan:FxPerfPlanV825,i:{
 settings?:Partial<ConcertFxSettingsV810>|null;fx:ConcertFxCueV810;
 intent:CameraIntentV834;verifiedCamera:boolean;manualCamera:boolean;
 groupCount:number;authoredLanes?:readonly FxPerfLaneV825[];
}):CameraAwareResultV834 {
 const result:CameraAwareResultV834={applied:false,reason:'off',intent:i.intent,relativeCostSaved:0,reduced:[]};
 if(i.settings?.cameraAwareV834===false||i.settings?.cameraStrengthV834===0||
  i.settings?.perfOptimizerV825===false||i.settings?.enabled===false)return result;
 if(!plan.active||!i.fx.active||i.fx.reason!=='music'||!i.verifiedCamera||
   !i.intent||!(i.intent in FOCUS)||!Number.isInteger(i.groupCount)||
   i.groupCount<1||i.groupCount>4){result.reason='unverified';return result;}
 if(i.manualCamera){result.reason='manual-camera';return result;}
 if(FOCUS[i.intent]===0){result.reason='wide-stage';return result;}
 if(!finite(plan.pressure)||plan.pressure<=.18){result.reason='no-pressure';return result;}
 const strength=finite(i.settings?.cameraStrengthV834)?clamp(i.settings!.cameraStrengthV834!/100):.65;
 const pressure=clamp((plan.pressure-.18)/.65);
 const load=clamp(pressure*FOCUS[i.intent]*SECTION[i.fx.section]*strength*(i.groupCount===4?1.15:1));
 if(load<.005){result.reason='no-pressure';return result;}
 const authored=new Set(i.authoredLanes??[]);
 const reduced:FxPerfLaneV825[]=[];
 let saved=0;
 for(const lane of DECO_LANES){
   if(authored.has(lane))continue;
   const previous=plan.gains[lane];
   if(!finite(previous)||previous<=0)continue;
   const next=Math.max(0,Math.min(previous,Math.round(previous*(1-load*WEIGHT[lane])*100000)/100000));
   if(next>=previous)continue;
   plan.gains[lane]=next;
   saved+=COST[lane]*(previous-next);
   reduced.push(lane);
 }
 if(!reduced.length){result.reason='protected-cues';return result;}
 plan.cost=Math.max(0,Math.round((plan.cost-saved)*100000)/100000);
 plan.throttled=Object.keys(plan.gains).filter(lane=>plan.gains[lane as FxPerfLaneV825]<.99999) as FxPerfLaneV825[];
 plan.reason='throttled';
 result.applied=true;result.reason='optimized';result.relativeCostSaved=Math.round(saved*100000)/100000;result.reduced=reduced;
 return result;
}
