/** V1126 · AI Festival Show Master.
 * One locally validated, seven-scene storyboard across nine *existing* virtual
 * directors. This file does not detect song structure or control hardware.
 * It never adds new render loops, GLB actors or speaker/Govee commands.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106} from './arena360AiShowRemixV1106';
import {stageLivePresetV1117,type StageShowV1117,type StageStyleV1117} from './aiStageTransformationV1117';
import {hologramLivePresetV1118,type HologramShowV1118,type HologramStyleV1118} from './aiHolographicStageDirectorV1118';
import {cameraLivePresetV1119,type CameraShowV1119,type CameraStyleV1119} from './aiCinematicCameraDirectorV1119';
import {lightingLivePresetV1120,type LightingShowV1120,type LightingStyleV1120} from './aiDynamicLightingConductorV1120';
import {transitionLivePresetV1121,type TransitionShowV1121,type TransitionStyleV1121} from './aiImmersiveSceneTransitionsV1121';
import {atmosphereLivePresetV1122,type AtmosphereShowV1122,type AtmosphereStyleV1122} from './aiConcertAtmosphereDirectorV1122';
import {energyLivePresetV1123,type EnergyShowV1123,type EnergyStyleV1123} from './aiConcertEnergyDirectorV1123';
import {audienceLivePresetV1124,type AudienceShowV1124,type AudienceStyleV1124} from './aiAudienceEnergySyncV1124';
import {festivalCrowdLivePresetV1125,type FestivalCrowdShowV1125,type FestivalCrowdStyleV1125} from './aiFestivalCrowdDirectorV1125';

export const MASTER_STYLES_V1126=['cinematic','festival','rap','immersive'] as const;
export type MasterStyleV1126=typeof MASTER_STYLES_V1126[number];
export const MASTER_LABELS_V1126:Record<MasterStyleV1126,string>={
 cinematic:'Kino-Konzert: Spannungsbogen und weiche Wechsel',
 festival:'Festival: Arena, Lichtwellen und großes Finale',
 rap:'Deutschrap: Künstlerfokus, Atmosphäre und Gegenchor',
 immersive:'Immersiv: 360°-Räume, Hologramme und Bewegung',
};
export type MasterOptionsV1126={style:MasterStyleV1126;strength:number;intensityCap:number};
export type MasterDirectorStyleSetV1126={stage:StageStyleV1117;holo:HologramStyleV1118;
 camera:CameraStyleV1119;lighting:LightingStyleV1120;transition:TransitionStyleV1121;
 atmosphere:AtmosphereStyleV1122;energy:EnergyStyleV1123;
 audience:AudienceStyleV1124;festival:FestivalCrowdStyleV1125};
const LOOKS:Record<MasterStyleV1126,MasterDirectorStyleSetV1126>={
 cinematic:{stage:'cinematic',holo:'spectral',camera:'cinematic',lighting:'cinematic',transition:'cinematic',atmosphere:'cinematic',energy:'cinematic',audience:'cinematic',festival:'ripple'},
 festival:{stage:'kinetic',holo:'cosmic',camera:'festival',lighting:'festival',transition:'festival',atmosphere:'festival',energy:'festival',audience:'festival',festival:'stadium'},
 rap:{stage:'monumental',holo:'duet',camera:'artist',lighting:'portrait',transition:'gentle',atmosphere:'intimate',energy:'rap',audience:'rap',festival:'duet'},
 immersive:{stage:'floating',holo:'mirrors',camera:'immersive',lighting:'holographic',transition:'holographic',atmosphere:'ethereal',energy:'balanced',audience:'wave',festival:'spotlight'},
};
export function normalizeMasterOptionsV1126(raw:unknown):MasterOptionsV1126|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(!MASTER_STYLES_V1126.includes(o.style as MasterStyleV1126)||
  typeof o.strength!=='number'||!Number.isInteger(o.strength)||o.strength<20||o.strength>80||o.strength%10!==0||
  typeof o.intensityCap!=='number'||!Number.isInteger(o.intensityCap)||o.intensityCap<30||o.intensityCap>85)return null;
 return {style:o.style as MasterStyleV1126,strength:o.strength,intensityCap:o.intensityCap};
}
/** All nine directors receive the same validated intensity budget. */
export function masterDirectorOptionsV1126(raw:unknown){
 const o=normalizeMasterOptionsV1126(raw);if(!o)return null;
 const styles=LOOKS[o.style];
 const common={strength:o.strength,intensityCap:o.intensityCap};
 return {stage:{...common,style:styles.stage},holo:{...common,style:styles.holo},
  camera:{...common,style:styles.camera},lighting:{...common,style:styles.lighting},
  transition:{...common,style:styles.transition,duration:'balanced' as const},
  atmosphere:{...common,style:styles.atmosphere},energy:{...common,style:styles.energy},
  audience:{...common,style:styles.audience},festival:{...common,style:styles.festival}};
}
export type MasterModulesV1126={stage:StageShowV1117;holo:HologramShowV1118;
 camera:CameraShowV1119;lighting:LightingShowV1120;transition:TransitionShowV1121;
 atmosphere:AtmosphereShowV1122;energy:EnergyShowV1123;
 audience:AudienceShowV1124;festival:FestivalCrowdShowV1125};
export type MasterSceneV1126={index:number;scene:string;start:number;end:number;
 energy:number;camera:string;stage:string;hologram:string;lighting:string;atmosphere:string;
 audience:string;focus:string;maxCrowdLight:number;handoffMs:number|null};
export type MasterShowV1126={style:MasterStyleV1126;scenes:MasterSceneV1126[];
 quality:{scenes:7;directors:9;transitions:6;boundariesPreserved:true;
 quietBreak:true;bounded:true;manualPriority:true;virtualOnly:true;
 hardwareCommands:0;detectedDrops:0;detectedSingers:0;explicitLiveApproval:true}};
const allSceneCues=(array:readonly {index:number;scene:string;start:number;end:number}[],
 segments:readonly {scene:string;start:number;end:number}[])=>array.length===7&&
 array.every((x,i)=>x.index===i&&x.scene===segments[i].scene&&
 x.start===segments[i].start&&x.end===segments[i].end);
/** Fail closed if any director produces different scene boundaries or an
 * inconsistent narrative. Existing module cues are *plans*, not live data. */
export function directFestivalShowMasterV1126(baseRaw:unknown,remixRaw:unknown,raw:unknown,
 modules:MasterModulesV1126):MasterShowV1126|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const o=normalizeMasterOptionsV1126(raw);
 if(!base||!remix||!o||!modules||remix.acts.length!==7||
  remix.acts.some((x,i)=>x.scene!==base.segments[i].scene||x.intensity>o.intensityCap)||
  !applyAiShowRemixV1106(base,remix,o.intensityCap))return null;
 const {stage,holo,camera,lighting,transition,atmosphere,energy,audience,festival}=modules;
 if(![stage,holo,camera,lighting,transition,atmosphere,energy,audience,festival].every(Boolean))return null;
 const segments=base.segments;
 if(![stage.cues,holo.cues,camera.cues,lighting.cues,atmosphere.cues,energy.cues,
  audience.scenes,festival.scenes].every(cues=>allSceneCues(cues,segments))||
  transition.durationMs!==base.durationMs||transition.cues.length!==6||
  transition.cues.some((x,i)=>
   x.index!==i||x.from!==segments[i].scene||x.to!==segments[i+1].scene||
   x.atMs!==Math.round(segments[i].end*base.durationMs)||
   x.startMs<0||x.endMs>base.durationMs||x.startMs>=x.atMs||x.endMs<=x.atMs||
   x.endMs-x.startMs!==x.durationMs||
   (i>0&&x.startMs<=transition.cues[i-1].endMs))||
  festival.scenes.some((s,i)=>s.energy!==remix.acts[i].intensity||s.sectors.length!==8||
   s.sectors.some(x=>!Number.isInteger(x)||x<0||x>65))||
  energy.cues.some(c=>c.energy>o.intensityCap)||
  energy.cues[4].energy>energy.cues[3].energy*.5)return null;
 const scenes=segments.map((seg,i):MasterSceneV1126=>({
  index:i,scene:seg.scene,start:seg.start,end:seg.end,energy:energy.cues[i].energy,
  camera:camera.cues[i].camera,stage:`${stage.cues[i].deck} / ${stage.cues[i].floating}`,
  hologram:holo.cues[i].look,lighting:lighting.cues[i].look,
  atmosphere:atmosphere.cues[i].look,audience:audience.scenes[i].label,
  focus:festival.scenes[i].focusLabel,
  maxCrowdLight:Math.max(...festival.scenes[i].sectors),
  handoffMs:i===0?null:transition.cues[i-1].durationMs,
 }));
 return {style:o.style,scenes,quality:{scenes:7,directors:9,transitions:6,
  boundariesPreserved:true,quietBreak:true,bounded:true,manualPriority:true,virtualOnly:true,
  hardwareCommands:0,detectedDrops:0,detectedSingers:0,explicitLiveApproval:true}};
}
export function sampleFestivalShowMasterV1126(show:MasterShowV1126|null,position:unknown){
 if(!show||show.scenes.length!==7||typeof position!=='number'||
  !Number.isFinite(position)||position<0||position>1)return null;
 return show.scenes.find(x=>position<x.end)??show.scenes[6];
}
/** Atomic, bounded enablement of existing virtual effects only; manual modes,
 * live playback and GPU caps remain enforced by their respective renderers. */
export function festivalShowMasterLivePresetV1126(raw:unknown){
 const opts=masterDirectorOptionsV1126(raw);if(!opts)return null;
 const parts=[stageLivePresetV1117(opts.stage),hologramLivePresetV1118(opts.holo),
  cameraLivePresetV1119(opts.camera),lightingLivePresetV1120(opts.lighting),
  transitionLivePresetV1121(opts.transition),atmosphereLivePresetV1122(opts.atmosphere),
  energyLivePresetV1123(opts.energy),audienceLivePresetV1124(opts.audience),
  festivalCrowdLivePresetV1125(opts.festival)];
 if(parts.some(x=>!x))return null;
 const merged=Object.assign({},...parts) as Record<string,boolean|number|string>;
 // Shared headroom: no virtual director receives a stronger value than 55.
 for(const key of Object.keys(merged))if(typeof merged[key]==='number')
  merged[key]=Math.min(55,merged[key] as number);
 return merged;
}
