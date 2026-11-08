/** V1123 · AI Concert Energy Director.
 * One coherent, bounded energy score shared by FIVE existing virtual directors.
 * Authored scene boundaries and the validated seven-act remix are authoritative;
 * named parts are a template, not recognized hooks or future drops. Optional
 * V1108 observation (brief local microphone measurement) adjusts at most FOUR
 * energy points. This module has no I/O, transport, devices or timers.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import type {MusicEmotionReadingV1108} from './aiMusicEmotionV1108';

export const ENERGY_STYLES_V1123=['balanced','rap','festival','cinematic'] as const;
export type EnergyStyleV1123=typeof ENERGY_STYLES_V1123[number];
export const ENERGY_LABELS_V1123:Record<EnergyStyleV1123,string>={
 balanced:'Ausgewogener Konzertbogen',rap:'Deutschrap-Dramaturgie',
 festival:'Hardtekk- und Festivalwellen',cinematic:'Filmische Spannungsreise',
};
export type EnergyOptionsV1123={style:EnergyStyleV1123;strength:number;intensityCap:number};
export type EnergyChannelsV1123={camera:number;dance:number;stage:number;lighting:number;atmosphere:number};
export type EnergyCueV1123={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 chapter:string;energy:number;channels:EnergyChannelsV1123;
 camera:AiShowRemixV1106['acts'][number]['camera'];dance:AiShowRemixV1106['acts'][number]['dance'];
 deck:AiShowRemixV1106['acts'][number]['deck'];floating:AiShowRemixV1106['acts'][number]['floating'];
 lasers:AiShowRemixV1106['acts'][number]['lasers'];
 authoredTiming:true;visualOnly:true;actualSongSectionDetected:false};
export type EnergyShowV1123={style:EnergyStyleV1123;strength:number;remix:AiShowRemixV1106;
 cues:EnergyCueV1123[];measurementUsed:boolean;measurementConfidence:number|null;
 quality:{scenes:7;sharedEnergyBudget:true;quietBreak:true;controlledDynamics:true;
 boundariesPreserved:true;existingVirtualRenderersOnly:true;manualPriority:true;
 noFullSongAnalysis:true;hardwareCommands:0;predictedDrops:0}};
export type EnergySampleV1123={cue:EnergyCueV1123;blend:number;energy:number;channels:EnergyChannelsV1123};
export type EnergyLivePresetV1123={
 arenaSmartConcertFlowEnabledV1071:true;arenaSmartConcertFlowStrengthV1071:number;
 arenaChoreographyEnabledV1041:true;arenaChoreographyStrengthV1041:number;
 arenaShowCameraEnabledV1043:true;arenaShowCameraStrengthV1043:number;
 arenaTransformingStageEnabledV1066:true;arenaTransformingStageStrengthV1066:number;
 arenaLightingChoreographerEnabledV1060:true;arenaLightingChoreographerStrengthV1060:number;
 arenaAtmosphereDirectorEnabledV1045:true;arenaAtmosphereDirectorStrengthV1045:number;
};
const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,x));
const profiles:Record<EnergyStyleV1123,{chapters:readonly string[];energy:readonly number[]}>={
 balanced:{chapters:['Leiser Auftakt','Künstler übernimmt','Energie wächst','Gemeinsamer Höhepunkt','Atempause','Zweite Energiewelle','Großes gemeinsames Finale'],energy:[20,37,54,73,15,55,80]},
 rap:{chapters:['Dunkles Intro','Rap im Fokus','Groove baut Druck auf','Starke Hook','Künstlerische Atempause','Zweite Rap-Welle','Finale mit Crew'],energy:[19,33,49,70,14,54,79]},
 festival:{chapters:['Festival erwacht','Erster Groove','Druckvoller Aufbau','Festivalwelle','Spürbare Ruhephase','Neuer Build-up','Großes Rave-Finale'],energy:[25,48,64,82,18,64,88]},
 cinematic:{chapters:['Filmische Eröffnung','Nah am Künstler','Langsamer Spannungsaufbau','Visueller Höhepunkt','Intime Stille','Tiefe Rückkehr','Monumentales Finale'],energy:[16,29,49,69,12,48,78]},
};
export function normalizeEnergyOptionsV1123(raw:unknown):EnergyOptionsV1123|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const x=raw as Record<string,unknown>;
 if(!ENERGY_STYLES_V1123.includes(x.style as EnergyStyleV1123)||
  typeof x.strength!=='number'||!Number.isInteger(x.strength)||x.strength<20||x.strength>80||x.strength%10!==0||
  typeof x.intensityCap!=='number'||!Number.isInteger(x.intensityCap)||x.intensityCap<30||x.intensityCap>85)return null;
 return {style:x.style as EnergyStyleV1123,strength:x.strength,intensityCap:x.intensityCap};
}
/** A brief optional V1108 observation is NOT a full-track energy curve.
 * Do not trust unready, stale, nonlocal or low-confidence readings.
 */
const usableObservation=(reading:MusicEmotionReadingV1108|null|undefined):reading is MusicEmotionReadingV1108=>
 !!reading&&reading.ready===true&&reading.source==='local-microphone'&&
 Number.isFinite(reading.confidence)&&reading.confidence>=.58&&reading.confidence<=1&&
 Number.isFinite(reading.energy)&&reading.energy>=0&&reading.energy<=1&&
 Number.isFinite(reading.durationMs)&&reading.durationMs>=4500&&reading.durationMs<=20250&&
 Number.isInteger(reading.sampleCount)&&reading.sampleCount>=16&&reading.sampleCount<=81&&
 ['rising','falling','steady'].includes(reading.trend);
const channelsFor=(energy:number,cap:number):EnergyChannelsV1123=>({
 camera:Math.min(cap,Math.round(energy*.88)),dance:Math.min(cap,Math.round(energy*.94)),
 stage:Math.min(cap,Math.round(energy*.93)),lighting:Math.min(cap,Math.round(energy*.98)),
 atmosphere:Math.min(55,cap,Math.round(energy*.57)),
});
/** Preview integration across camera, dance, stage, light and atmosphere.
 * The only actionable fields are ALREADY SUPPORTED remix camera/dance/deck/
 * floating/laser and intensity. All proposals are validated before approval.
 */
export function directConcertEnergyV1123(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown,
 reading:MusicEmotionReadingV1108|null=null):EnergyShowV1123|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const o=normalizeEnergyOptionsV1123(optionsRaw);
 if(!base||!remix||!o||base.segments.length!==7||remix.acts.length!==7||
  remix.acts.some((a,i)=>a.scene!==base.segments[i].scene||a.intensity>o.intensityCap)||
  !applyAiShowRemixV1106(base,remix,o.intensityCap))return null;
 const p=profiles[o.style],measurementUsed=usableObservation(reading);
 const observationBump=measurementUsed?clamp(Math.round((reading.energy-.5)*8),-4,4):0;
 // Style determines the narrative curve; the incoming remix contributes detail.
 const energy=p.energy.map((styleEnergy,i)=>clamp(Math.round(
  .55*styleEnergy*o.strength/70+.45*remix.acts[i].intensity+
  (i===4?0:observationBump)),0,o.intensityCap));
 // Enforce a real quiet break and avoid sharp jumps except the intended
 // hook-to-break contrast. Cap always wins over the artistic target.
 energy[4]=clamp(energy[4],Math.max(0,energy[3]-45),Math.floor(energy[3]*.5));
 for(let i=1;i<energy.length;i++)if(i!==4)
  energy[i]=clamp(energy[i],Math.max(0,energy[i-1]-45),Math.min(o.intensityCap,energy[i-1]+45));
 const stagedActs=remix.acts.map((act,i)=>{
  const high=energy[i]>=Math.min(50,Math.round(o.intensityCap*.72));
  const quiet=i===0||i===4;
  const showFocus=i===3||i===6;
  const camera=quiet?'wide':showFocus?'group':i===1||i===5?'lead':'orbit';
  const dance=quiet?'calm':showFocus?'group':high?'peak':'groove';
  const deck=quiet?'halo':showFocus?'fan':high?'spiral':'halo';
  const floating=quiet?'wave':showFocus?'orbit':i===2?'rise':'wave';
  const lasers=quiet?'halo':showFocus?'tunnel':high?'spiral':'halo';
  return {...act,camera,dance,deck,floating,lasers,intensity:energy[i],
   note:(act.note+' V1123: '+p.chapters[i]+'.').slice(0,145)};
 });
 const staged=normalizeAiShowRemixV1106({...remix,acts:stagedActs,
  explanation:('V1123: gemeinsame, begrenzte Energiedramaturgie für fünf virtuelle Regiekanäle; nur vorab geplante Szenen, keine erkannten Songteile oder Hardware. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,o.intensityCap))return null;
 const cues=staged.acts.map((a,i):EnergyCueV1123=>({index:i,scene:a.scene,
  start:base.segments[i].start,end:base.segments[i].end,chapter:p.chapters[i],
  energy:a.intensity,channels:channelsFor(a.intensity,o.intensityCap),
  camera:a.camera,dance:a.dance,deck:a.deck,floating:a.floating,lasers:a.lasers,
  authoredTiming:true,visualOnly:true,actualSongSectionDetected:false}));
 const quiet=cues[4].energy<=cues[3].energy*.5;
 const bounded=cues.every((cue,i)=>cue.energy>=0&&cue.energy<=o.intensityCap&&
  Object.values(cue.channels).every(value=>Number.isFinite(value)&&value>=0&&value<=o.intensityCap)&&
  (i===0||Math.abs(cue.energy-cues[i-1].energy)<=45));
 const boundaries=cues.every((c,i)=>c.start===base.segments[i].start&&c.end===base.segments[i].end);
 if(!quiet||!bounded||!boundaries)return null;
 return {style:o.style,strength:o.strength,remix:staged,cues,
  measurementUsed,measurementConfidence:measurementUsed?reading.confidence:null,
  quality:{scenes:7,sharedEnergyBudget:true,quietBreak:true,controlledDynamics:true,
   boundariesPreserved:true,existingVirtualRenderersOnly:true,manualPriority:true,
   noFullSongAnalysis:true,hardwareCommands:0,predictedDrops:0}};
}
/** Smooth local preview interpolation, not a renderer or automated trigger. */
export function sampleConcertEnergyV1123(show:EnergyShowV1123|null,progress:unknown):EnergySampleV1123|null{
 if(!show||show.cues.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 const i=Math.max(0,show.cues.findIndex(c=>progress<c.end));
 const index=progress===1?6:i, cue=show.cues[index],previous=show.cues[Math.max(0,index-1)];
 const width=Math.min(.012,(cue.end-cue.start)*.20);
 const t=index===0||width<=0?1:clamp((progress-cue.start)/width,0,1);
 const blend=t*t*(3-2*t);
 const mix=(a:number,b:number)=>Math.round(a+(b-a)*blend);
 const channels=Object.fromEntries((Object.keys(cue.channels) as (keyof EnergyChannelsV1123)[])
  .map(key=>[key,mix(previous.channels[key],cue.channels[key])])) as EnergyChannelsV1123;
 return {cue,blend:Math.round(blend*1000)/1000,energy:mix(previous.energy,cue.energy),channels};
}
/** Explicit user-confirmed enablement of existing virtual guarded directors.
 * No per-segment automatic intensity parameters are sent to renderers.
 */
export function energyLivePresetV1123(raw:unknown):EnergyLivePresetV1123|null{
 const o=normalizeEnergyOptionsV1123(raw);if(!o)return null;
 const strength=Math.min(o.strength,o.intensityCap,65);
 return {arenaSmartConcertFlowEnabledV1071:true,arenaSmartConcertFlowStrengthV1071:strength,
  arenaChoreographyEnabledV1041:true,arenaChoreographyStrengthV1041:strength,
  arenaShowCameraEnabledV1043:true,arenaShowCameraStrengthV1043:strength,
  arenaTransformingStageEnabledV1066:true,arenaTransformingStageStrengthV1066:strength,
  arenaLightingChoreographerEnabledV1060:true,arenaLightingChoreographerStrengthV1060:strength,
  arenaAtmosphereDirectorEnabledV1045:true,arenaAtmosphereDirectorStrengthV1045:Math.min(strength,55)};
}
