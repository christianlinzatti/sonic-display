/** V1125 · Festival Crowd Director 2.0.
 * Eight spatial audience sectors and three symbolic stage-performer focus points.
 * Templates are NOT recognized performers, applause, hooks or real devices.
 * Live sampling reuses V1032 instanced bodies, arms and phones on its capped tick.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowCueV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import type {AudienceShowV1124} from './aiAudienceEnergySyncV1124';

export const FESTIVAL_CROWD_STYLES_V1125=['ripple','spotlight','duet','stadium'] as const;
export type FestivalCrowdStyleV1125=typeof FESTIVAL_CROWD_STYLES_V1125[number];
export const FESTIVAL_CROWD_LABELS_V1125:Record<FestivalCrowdStyleV1125,string>={
 ripple:'Ringförmige Publikumswellen',spotlight:'Künstler-Fokuswellen',
 duet:'Duett & Gegenchor',stadium:'Acht-Sektoren-Festival',
};
export const FESTIVAL_CROWD_PERFORMERS_V1125=['Neon Pulse','Festival Nova','Chrome Beat'] as const;
export type FestivalCrowdOptionsV1125={style:FestivalCrowdStyleV1125;strength:number;intensityCap:number};
export type FestivalCrowdSceneV1125={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 focusSlot:number|null;focusLabel:string;energy:number;sectors:readonly number[];
 planned:true;noDetectedSinger:true};
export type FestivalCrowdShowV1125={remix:AiShowRemixV1106;style:FestivalCrowdStyleV1125;
 scenes:FestivalCrowdSceneV1125[];linkedAudience:boolean;
 quality:{scenes:7;sectors:8;performers:3;preservesTimes:true;bounded:true;
  quietBreak:true;existingInstances:true;noAudio:true;noHardware:true;explicitOptIn:true}};
export type FestivalCrowdSampleV1125={scene:FestivalCrowdSceneV1125;blend:number;sectors:readonly number[]};
export type FestivalCrowdLivePresetV1125={arenaFestivalCrowdEnabledV1125:true;
 arenaFestivalCrowdStrengthV1125:number;arenaFestivalCrowdStyleV1125:FestivalCrowdStyleV1125;
 arenaAvatarAudienceEnabledV1074:true;arenaAvatarAudienceStrengthV1074:number;
 arenaAudienceExperienceEnabledV1073:true;arenaAudienceExperienceStrengthV1073:number};
export type FestivalCrowdLiveCueV1125={active:true;style:FestivalCrowdStyleV1125;
 sceneIndex:number;energy:number;strength:number;focusSlot:number|null;fade:number;sectors:readonly number[]};
export type FestivalCrowdSpatialV1125={light:number;rise:number;arms:number;head:number};
const TAU=Math.PI*2,clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
const FOCUS:readonly (number|null)[]=[0,0,1,null,null,2,null];
const FOCUS_LABELS=FOCUS.map(s=>s===null?'Gesamtes Ensemble':FESTIVAL_CROWD_PERFORMERS_V1125[s]);
const PERFORMER_SECTORS=[0,3,5] as const;
const circularDistance=(a:number,b:number)=>Math.min(Math.abs(a-b),8-Math.abs(a-b));
export function normalizeFestivalCrowdOptionsV1125(raw:unknown):FestivalCrowdOptionsV1125|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(!FESTIVAL_CROWD_STYLES_V1125.includes(o.style as FestivalCrowdStyleV1125)||
  typeof o.strength!=='number'||!Number.isInteger(o.strength)||o.strength<20||o.strength>80||o.strength%10!==0||
  typeof o.intensityCap!=='number'||!Number.isInteger(o.intensityCap)||o.intensityCap<30||o.intensityCap>85)return null;
 return {style:o.style as FestivalCrowdStyleV1125,strength:o.strength,intensityCap:o.intensityCap};
}
/** Stable eight-sector palette; each style gives genuinely different spatial distribution.
 * The quiet fourth transition is substantially dimmer; no rapid flashes.
 */
export function festivalCrowdSectorsV1125(style:FestivalCrowdStyleV1125,sceneIndex:number,
 energy:number,strength:number,cap:number):number[]{
 if(!FESTIVAL_CROWD_STYLES_V1125.includes(style)||!Number.isInteger(sceneIndex)||sceneIndex<0||sceneIndex>6||
 !Number.isFinite(energy)||energy<0||energy>100||!Number.isFinite(strength)||strength<0||strength>80||
 !Number.isFinite(cap)||cap<0||cap>85)return Array(8).fill(0);
 const focus=FOCUS[sceneIndex],anchor=focus===null?0:PERFORMER_SECTORS[focus];
 const amount=clamp(energy*strength/80*(sceneIndex===4?.18:sceneIndex===0?.48:1),0,cap);
 return Array.from({length:8},(_,sector)=>{
  const dist=circularDistance(sector,anchor),rotate=(sector+sceneIndex*2)%8;
  const weight=style==='ripple'?.30+.70*(.5+.5*Math.cos((sector*2-sceneIndex)*Math.PI/4)):
   style==='spotlight'?(focus===null?.64:.20+.80*Math.exp(-dist*dist/2.1)):
   style==='duet'?.23+.65*Math.max(Math.exp(-dist*dist/1.5),Math.exp(-(circularDistance(sector,(anchor+4)%8)**2)/1.5)):
   .28+.72*(rotate%2===0?1:.35);
  return Math.round(clamp(amount*weight,0,Math.min(65,cap)));
 });
}
export function directFestivalCrowdV1125(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown,
 audience:AudienceShowV1124|null=null):FestivalCrowdShowV1125|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const opts=normalizeFestivalCrowdOptionsV1125(optionsRaw);
 if(!base||!remix||!opts||remix.acts.length!==7||
  remix.acts.some((a,i)=>a.scene!==base.segments[i].scene||a.intensity>opts.intensityCap)||
  !applyAiShowRemixV1106(base,remix,opts.intensityCap))return null;
 if(audience&&(audience.scenes.length!==7||audience.scenes.some((s,i)=>
  s.index!==i||s.scene!==base.segments[i].scene||s.start!==base.segments[i].start||
  s.end!==base.segments[i].end||s.energy!==remix.acts[i].intensity)))return null;
 const scenes=remix.acts.map((act,i):FestivalCrowdSceneV1125=>({
  index:i,scene:base.segments[i].scene,start:base.segments[i].start,end:base.segments[i].end,
  focusSlot:FOCUS[i],focusLabel:FOCUS_LABELS[i],energy:act.intensity,
  sectors:festivalCrowdSectorsV1125(opts.style,i,act.intensity,opts.strength,opts.intensityCap),
  planned:true,noDetectedSinger:true,
 }));
 if(!scenes.every(s=>s.sectors.length===8&&s.sectors.every(v=>Number.isInteger(v)&&v>=0&&v<=Math.min(65,opts.intensityCap)))||
  Math.max(...scenes[4].sectors)>Math.max(...scenes[3].sectors)*.5)return null;
 return {remix,style:opts.style,scenes,linkedAudience:Boolean(audience),quality:{scenes:7,sectors:8,
  performers:3,preservesTimes:true,bounded:true,quietBreak:true,existingInstances:true,
  noAudio:true,noHardware:true,explicitOptIn:true}};
}
export function sampleFestivalCrowdV1125(show:FestivalCrowdShowV1125|null,progress:unknown):FestivalCrowdSampleV1125|null{
 if(!show||show.scenes.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 const index=progress===1?6:show.scenes.findIndex(s=>progress<s.end);
 if(index<0)return null;
 const scene=show.scenes[index],previous=show.scenes[Math.max(0,index-1)];
 const width=Math.min(.012,(scene.end-scene.start)*.20);
 const t=index===0||width<=0?1:clamp((progress-scene.start)/width,0,1);
 const blend=t*t*(3-2*t);
 return {scene,blend:Math.round(blend*1000)/1000,
  sectors:scene.sectors.map((v,s)=>Math.round(previous.sectors[s]+(v-previous.sectors[s])*blend))};
}
/** This live opt-in also enables existing avatar-to-audience poses and wristbands. */
export function festivalCrowdLivePresetV1125(raw:unknown):FestivalCrowdLivePresetV1125|null{
 const opts=normalizeFestivalCrowdOptionsV1125(raw);if(!opts)return null;
 const strength=Math.min(opts.strength,opts.intensityCap,55);
 return {arenaFestivalCrowdEnabledV1125:true,arenaFestivalCrowdStrengthV1125:strength,
  arenaFestivalCrowdStyleV1125:opts.style,arenaAvatarAudienceEnabledV1074:true,
  arenaAvatarAudienceStrengthV1074:strength,arenaAudienceExperienceEnabledV1073:true,
  arenaAudienceExperienceStrengthV1073:strength};
}
/** Never samples unless the authored show, live playback, safe phone mode and GPU tier agree. */
export function planFestivalCrowdLiveV1125(input:{enabled:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;audienceEnabled:boolean;phoneSyncEnabled:boolean;phoneMode:string;
 performanceTier:'low'|'balanced'|'high'|null;show:ArenaShowCueV1040|null|undefined;
 style:FestivalCrowdStyleV1125;strength:number}):FestivalCrowdLiveCueV1125|null{
 const show=input.show;
 if(!input.enabled||!input.playing||input.reducedMotion||!input.reactive||!input.audienceEnabled||
  !input.phoneSyncEnabled||input.phoneMode!=='wave'||!input.performanceTier||input.performanceTier==='low'||
  !show?.active||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||show.segmentIndex>6||
  typeof show.intensity!=='number'||!Number.isFinite(show.intensity)||show.intensity<0||show.intensity>100||
  typeof show.fade!=='number'||!Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
  !FESTIVAL_CROWD_STYLES_V1125.includes(input.style)||!Number.isFinite(input.strength)||
  input.strength<=0||input.strength>55)return null;
 return {active:true,sceneIndex:show.segmentIndex,style:input.style,energy:show.intensity,
  strength:input.strength*(input.performanceTier==='balanced'?.7:1),focusSlot:FOCUS[show.segmentIndex],fade:show.fade,
  sectors:festivalCrowdSectorsV1125(input.style,show.segmentIndex,show.intensity,input.strength,65)};
}
/** One low-frequency sector sample, applied to EXISTING matrices and colors only. */
export function sampleFestivalCrowdSectorV1125(cue:FestivalCrowdLiveCueV1125|null,
 angle:number,seconds:number):FestivalCrowdSpatialV1125{
 const zero={light:1,rise:0,arms:0,head:0};
 if(!cue?.active||!Number.isFinite(angle)||!Number.isFinite(seconds)||seconds<0)return zero;
 const sector=((Math.floor((((angle+Math.PI)%TAU+TAU)%TAU)/TAU*8))%8);
 const weight=(cue.sectors[sector]??0)/65;
 const phase=.5+.5*Math.cos(seconds*.83-sector*.63+cue.sceneIndex*.44);
 const amount=clamp(weight*cue.fade*(.28+.72*phase),0,1);
 return {light:clamp(.7+.3*amount,.7,1),rise:Math.min(.045,.032*amount),
  arms:Math.min(.11,.10*amount),head:Math.max(-.018,Math.min(.018,(amount-.5)*.024))};
}
