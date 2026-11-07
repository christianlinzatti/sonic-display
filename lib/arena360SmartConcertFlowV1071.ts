/** V1071 Smart Concert Flow 3.0. Pure, deterministic, opt-in local show crossfader.
 * Transitions authored scene focus between the existing V1040 chapters. It
 * neither detects musical structure nor creates beats, light flashes, camera
 * shots, animations, devices, 3D assets, timers or network requests.
 * Downward-only gains keep each independent effect's own limits and manual locks.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowCueV1040,type ArenaShowPlanV1040} from './arena360ShowDesignerV1040';
export type FlowLaneV1071='deck'|'floating'|'holograms'|'lasers'|'led'|'cast'|'camera'|'rap';
export type FlowChapterV1071='intro'|'verse-one'|'build'|'hook'|'interlude'|'verse-two'|'finale';
export type FlowCueV1071={active:boolean;chapter:FlowChapterV1071|null;
 progress:number;transition:boolean;focus:'none'|'intro'|'vocal'|'energy'|'ensemble'|'atmosphere'|'finale';
 deck:number;floating:number;holograms:number;lasers:number;led:number;cast:number;camera:number;rap:number};
export const FLOW_LANES_V1071:readonly FlowLaneV1071[]=
 ['deck','floating','holograms','lasers','led','cast','camera','rap'];
export const NEUTRAL_FLOW_V1071:FlowCueV1071=Object.freeze({active:false,chapter:null,progress:0,
 transition:false,focus:'none',deck:1,floating:1,holograms:1,lasers:1,led:1,cast:1,camera:1,rap:1});
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const smoother=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
// Seven DIFFERENT mixes, including a deliberately different second verse.
// Finale returns to neutral: V1070 owns the final-12%-of-song staging.
const FOCI:readonly FlowCueV1071['focus'][]=['intro','vocal','energy','ensemble','atmosphere','vocal','finale'];
const CHAPTERS:readonly FlowChapterV1071[]=['intro','verse-one','build','hook','interlude','verse-two','finale'];
const MIXES:readonly (readonly number[])[]=[
 [.95,.94,.94,.76,.91,.87,1,.84],
 [.78,.71,.83,.62,.70,.89,.97,1],
 [.93,.91,.88,.95,.95,.88,.96,.86],
 [.96,.97,.95,.97,.99,1,.89,.92],
 [.84,.90,.96,.61,.68,.75,1,.73],
 [.88,.76,.90,.71,.85,.89,.91,1],
 [1,1,1,1,1,1,1,1],
];
const TRANSITION_PCT=.012; // ~2.5 seconds for a 3:30 track; smooth entry after every boundary
const isFiniteNumber=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
/** A visible cue is a projection of an already authorized, individually enabled
 * system. No enabled flags are emitted and manual lane locks always yield 1.
 */
export function planSmartConcertFlowV1071(i:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number|null;show?:ArenaShowCueV1040|null;plan?:ArenaShowPlanV1040|null;
 channels?:Partial<Record<FlowLaneV1071,boolean>>|null;
}):FlowCueV1071{
 if(!i.enabled||!i.stageIsArena||!i.playing||i.reducedMotion||!i.reactive||
   !i.showDesignerEnabled||!i.showDirectorEnabled||i.performanceTier==='low'||
   typeof i.trackId!=='string'||!i.trackId.trim())return NEUTRAL_FLOW_V1071;
 const ms=i.progressMs, duration=i.durationMs,strength=i.strength;
 if(!isFiniteNumber(ms)||!isFiniteNumber(duration)||!isFiniteNumber(strength)||
  duration<30000||duration>900000||ms<0||ms>duration||strength<=0||strength>80)
  return NEUTRAL_FLOW_V1071;
 const plan=normalizeArenaShowPlanV1040(i.plan);
 const show=i.show;
 if(!plan||!show?.active||!isFiniteNumber(show.segmentIndex)||!Number.isInteger(show.segmentIndex)||
    show.segmentIndex<0||show.segmentIndex>=7||!isFiniteNumber(show.intensity)||
    !isFiniteNumber(show.fade)||show.intensity<0||show.intensity>100||show.fade<0||show.fade>1||
    !FLOW_LANES_V1071.some(lane=>i.channels?.[lane]===true))return NEUTRAL_FLOW_V1071;
 const p=ms/duration;
 const index=plan.segments.findIndex(s=>p<s.end);
 const chapterIndex=index===-1?6:index;
 const segment=plan.segments[chapterIndex];
 if(!segment||show.segmentIndex!==chapterIndex||show.scene!==segment.scene)return NEUTRAL_FLOW_V1071;
 const start=segment.start,within=Math.max(0,p-start);
 const transition=within<TRANSITION_PCT;
 const t=transition?smoother(within/TRANSITION_PCT):1;
 const current=MIXES[chapterIndex],previous=chapterIndex===0?
   [1,1,1,1,1,1,1,1]:MIXES[chapterIndex-1];
 const previousLevel=chapterIndex===0?100:plan.segments[chapterIndex-1].intensity;
 const intensity=previousLevel+(segment.intensity-previousLevel)*t;
 const weight=(strength/80)*(.58+.42*intensity/100)*(i.performanceTier==='balanced'?.70:1);
 // A gentle mid-chapter change creates variety without adding unverified
 // rhythmic events. It fades to zero at BOTH chapter boundaries.
 let seed=0;for(let k=0;k<i.trackId.length;k++)seed=(Math.imul(seed,31)+i.trackId.charCodeAt(k))|0;
 const normalized=clamp(within/Math.max(.0001,segment.end-start),0,1);
 const breath=chapterIndex===6?0:Math.sin(normalized*2*Math.PI)*Math.sin(normalized*Math.PI)*.022;
 const values=FLOW_LANES_V1071.map((lane,k)=>{
   if(i.channels?.[lane]!==true)return 1;
   let target=previous[k]*(1-t)+current[k]*t;
   // A pre-existing, bounded preference for a genre may DECREASE attenuation,
   // but never increase power above the original effect level.
   if(plan.genre==='hard'&&lane==='lasers')target=Math.min(1,target+.025);
   if(plan.genre==='rap'&&lane==='rap')return 1;
   // A rap lead retains full priority across both verse scenes.
   if(plan.genre==='rock'&&lane==='deck')target=Math.min(1,target+.02);
   if(plan.genre==='pop'&&lane==='holograms')target=Math.min(1,target+.02);
   target=clamp(target+(seed%2===0?breath:-breath),.50,1);
   return clamp(1-(1-target)*weight,.50,1);
 });
 return {active:true,chapter:CHAPTERS[chapterIndex],progress:p,transition,focus:FOCI[chapterIndex],
  deck:values[0],floating:values[1],holograms:values[2],lasers:values[3],
  led:values[4],cast:values[5],camera:values[6],rap:values[7]};
}
