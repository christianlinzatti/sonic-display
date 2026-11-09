/** V1124 · AI Audience Energy Sync.
 * Safe, deterministic SEVEN-scene crowd cue score. This is NOT an audience
 * telemetry/audio analysis system, beat detector, sound generator or hardware
 * controller. It reuses existing V1044/V1073/V1075/V1092 visual renderers.
 * V1123's energy score is consumed if deliberately enabled, otherwise the
 * normalized authored remix intensity is used. All scenes remain templates.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import type {EnergyShowV1123} from './aiConcertEnergyDirectorV1123';

export const AUDIENCE_STYLES_V1124=['wave','festival','rap','cinematic'] as const;
export type AudienceStyleV1124=typeof AUDIENCE_STYLES_V1124[number];
export const AUDIENCE_STYLE_LABELS_V1124:Record<AudienceStyleV1124,string>={
 wave:'Gemeinsame Publikumswellen',festival:'Festival-Arme & Lichtmeer',
 rap:'Deutschrap-Call-and-Response',cinematic:'Filmisches Lichtermeer',
};
export type AudienceOptionsV1124={style:AudienceStyleV1124;strength:number;intensityCap:number};
export type AudienceChannelsV1124={phones:number;wristbands:number;arms:number;cheer:number;attention:number};
export type AudienceSceneV1124={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 label:string;energy:number;channels:AudienceChannelsV1124;
 authoredTiming:true;visualOnly:true;verifiedBeat:false;generatedAudio:false};
export type AudienceShowV1124={style:AudienceStyleV1124;strength:number;
 remix:AiShowRemixV1106;scenes:AudienceSceneV1124[];energyLinked:boolean;
 quality:{scenes:7;existingCrowdRenderers:true;quietBreak:true;boundedMotion:true;
 preservesSongTimes:true;manualPriority:true;noHardware:true;noAudioGeneration:true;
 noSongStructureDetection:true;noAddedCrowdInstances:true}};
export type AudienceSampleV1124={scene:AudienceSceneV1124;blend:number;channels:AudienceChannelsV1124};
export type AudienceLivePresetV1124={
 arenaAudienceDirectorEnabledV1044:true;arenaAudienceDirectorStrengthV1044:number;
 arenaAudienceExperienceEnabledV1073:true;arenaAudienceExperienceStrengthV1073:number;
 arenaCrowdEnergyEnabledV1075:true;arenaCrowdEnergyStrengthV1075:number;
 arenaCrowdHarmonyEnabledV1092:true;arenaCrowdHarmonyStrengthV1092:number;
};
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const SCENE_LABELS=['Ankommen','Publikumswelle','Gemeinsamer Aufbau','Lichtermeer',
 'Bewusste Ruhe','Zweite Welle','Gemeinsames Finale'] as const;
const STYLES:Record<AudienceStyleV1124,readonly [number,number,number,number,number]>= {
 // coefficients: phones, wristbands, arms, cheering gestures, focus on stage
 wave:[.83,.77,.73,.53,.82],festival:[.94,.89,.95,.82,.63],
 rap:[.65,.68,.82,.91,.84],cinematic:[.86,.72,.46,.36,.96],
};
export function normalizeAudienceOptionsV1124(input:unknown):AudienceOptionsV1124|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const x=input as Record<string,unknown>;
 if(!AUDIENCE_STYLES_V1124.includes(x.style as AudienceStyleV1124)||
  typeof x.strength!=='number'||!Number.isInteger(x.strength)||x.strength<20||
  x.strength>80||x.strength%10!==0||typeof x.intensityCap!=='number'||
  !Number.isInteger(x.intensityCap)||x.intensityCap<30||x.intensityCap>85)return null;
 return {style:x.style as AudienceStyleV1124,strength:x.strength,intensityCap:x.intensityCap};
}
const limits:AudienceChannelsV1124={phones:65,wristbands:60,arms:60,cheer:55,attention:60};
const makeChannels=(energy:number,style:AudienceStyleV1124,strength:number,sceneIndex:number,cap:number):AudienceChannelsV1124=>{
 const factors=STYLES[style];
 const quiet=sceneIndex===4,hook=sceneIndex===3||sceneIndex===6;
 // Planned hooks may enhance visuals slightly, but do not imply actual drops.
 const adjusted=clamp((energy*strength/75)*(quiet?.26:hook?1:.82),0,cap);
 const values=(Object.keys(limits) as (keyof AudienceChannelsV1124)[]).map((key,i)=>
  [key,Math.round(clamp(adjusted*factors[i],0,Math.min(cap,limits[key]))) ]);
 return Object.fromEntries(values) as AudienceChannelsV1124;
};
/** V1123 source must match the current base + full seven-act proposal; never
 * accept a stale cue or allow an optional energy link to re-time the show. */
export function directAudienceEnergySyncV1124(baseRaw:unknown,remixRaw:unknown,
 optionsRaw:unknown,energy:EnergyShowV1123|null=null):AudienceShowV1124|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const options=normalizeAudienceOptionsV1124(optionsRaw);
 if(!base||!remix||!options||remix.acts.length!==7||base.segments.length!==7||
  remix.acts.some((a,i)=>a.scene!==base.segments[i].scene||a.intensity>options.intensityCap)||
  !applyAiShowRemixV1106(base,remix,options.intensityCap))return null;
 const energyLinked=energy!==null;
 if(energyLinked&&(!energy||energy.cues.length!==7||energy.cues.some((c,i)=>
  c.index!==i||c.scene!==base.segments[i].scene||c.start!==base.segments[i].start||
  c.end!==base.segments[i].end||c.energy!==remix.acts[i].intensity||
  !Number.isInteger(c.energy)||c.energy<0||c.energy>options.intensityCap)))return null;
 const scenes=remix.acts.map((act,i):AudienceSceneV1124=>{
  const segment=base.segments[i];
  const energyValue=energyLinked?energy!.cues[i].energy:act.intensity;
  return {index:i,scene:segment.scene,start:segment.start,end:segment.end,
   label:SCENE_LABELS[i],energy:energyValue,
   channels:makeChannels(energyValue,options.style,options.strength,i,options.intensityCap),
   authoredTiming:true,visualOnly:true,verifiedBeat:false,generatedAudio:false};
 });
 const quiet=scenes[4].channels.arms<=scenes[3].channels.arms*.5&&
  scenes[4].channels.phones<=scenes[3].channels.phones*.5;
 const bounded=scenes.every((s,i)=>s.start===base.segments[i].start&&s.end===base.segments[i].end&&
  s.energy>=0&&s.energy<=options.intensityCap&&
  Object.entries(s.channels).every(([key,value])=>Number.isInteger(value)&&value>=0&&
   value<=limits[key as keyof AudienceChannelsV1124]&&value<=options.intensityCap));
 if(!bounded||!quiet)return null;
 return {style:options.style,strength:options.strength,remix,scenes,energyLinked,
  quality:{scenes:7,existingCrowdRenderers:true,quietBreak:true,boundedMotion:true,
   preservesSongTimes:true,manualPriority:true,noHardware:true,noAudioGeneration:true,
   noSongStructureDetection:true,noAddedCrowdInstances:true}};
}
/** Low-frequency ease-in at the current authored scene boundary. */
export function sampleAudienceEnergySyncV1124(show:AudienceShowV1124|null,progress:unknown):AudienceSampleV1124|null{
 if(!show||show.scenes.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||
  progress<0||progress>1)return null;
 const index=progress===1?6:show.scenes.findIndex(s=>progress<s.end);
 if(index<0)return null;
 const scene=show.scenes[index],before=show.scenes[Math.max(0,index-1)];
 const width=Math.min(.012,(scene.end-scene.start)*.20);
 const t=index===0||width<=0?1:clamp((progress-scene.start)/width,0,1);
 const blend=t*t*(3-2*t);
 const channels=Object.fromEntries((Object.keys(scene.channels) as (keyof AudienceChannelsV1124)[])
  .map(k=>[k,Math.round(before.channels[k]+(scene.channels[k]-before.channels[k])*blend)])) as AudienceChannelsV1124;
 return {scene,blend:Math.round(blend*1000)/1000,channels};
}
/** Only 4 opt-in, already existing V1044/1073/1075/1092 visual modules.
 * Runtime itself enforces pause/reduced motion/performance/manual phone modes.
 * These preferences do NOT generate sound, light hardware commands or loops.
 */
export function audienceLivePresetV1124(raw:unknown):AudienceLivePresetV1124|null{
 const o=normalizeAudienceOptionsV1124(raw);if(!o)return null;
 const strength=Math.min(o.strength,o.intensityCap,55);
 return {arenaAudienceDirectorEnabledV1044:true,arenaAudienceDirectorStrengthV1044:strength,
  arenaAudienceExperienceEnabledV1073:true,arenaAudienceExperienceStrengthV1073:strength,
  arenaCrowdEnergyEnabledV1075:true,arenaCrowdEnergyStrengthV1075:strength,
  arenaCrowdHarmonyEnabledV1092:true,arenaCrowdHarmonyStrengthV1092:strength};
}
