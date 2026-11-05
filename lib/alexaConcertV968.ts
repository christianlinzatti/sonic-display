/** V968 – strict, virtual-only Alexa command extensions and visual presentation.
 * Alexa never operates playback, external lights, physical effects or manual shows.
 * All scene projections are pure and applied only within the existing R3F renderer.
 */
import type {ConcertSceneV958,ConcertSettingsV958,ConcertFxV955} from './ultimateConcertRoadmapV958';
import type {ImmersiveCueV966} from './immersiveConcertEngineV966';
import {ALEXA_CONCERT_COMMANDS_V967,ALEXA_CONCERT_MESSAGES_V967,
 applyAlexaConcertCommandV967,canApplyAlexaCommandV967,isAlexaConcertCommandV967}
 from './alexaConcertV967';

export const ALEXA_CONCERT_COMMANDS_V968=[...ALEXA_CONCERT_COMMANDS_V967,
 'zone-stage','zone-backdrop','zone-audience','zone-all',
 'mood-warm','mood-cool','mood-neon','mood-auto',
 'effect-beams','effect-fog','effect-confetti','effect-streamers','effect-auto','effect-off'] as const;
export type AlexaConcertCommandV968=(typeof ALEXA_CONCERT_COMMANDS_V968)[number];
export type AlexaQueuedCommandV968=Readonly<{id:string;command:AlexaConcertCommandV968;createdAt:number}>;
export function isAlexaConcertCommandV968(command:unknown):command is AlexaConcertCommandV968{
 return typeof command==='string'&&(ALEXA_CONCERT_COMMANDS_V968 as readonly string[]).includes(command);
}
export function canApplyAlexaCommandV968(raw:unknown,enabledSince:number,now:number):raw is AlexaQueuedCommandV968{
 if(!raw||typeof raw!=='object')return false;
 const msg=raw as Partial<AlexaQueuedCommandV968>;
 if(isAlexaConcertCommandV967(msg.command))return canApplyAlexaCommandV967(raw,enabledSince,now);
 return typeof msg.id==='string'&&/^[\da-f-]{36}$/i.test(msg.id)&&
  isAlexaConcertCommandV968(msg.command)&&typeof msg.createdAt==='number'&&
  Number.isSafeInteger(msg.createdAt)&&Number.isSafeInteger(enabledSince)&&Number.isSafeInteger(now)&&
  msg.createdAt>=enabledSince-1000&&msg.createdAt<=now+5000&&now-msg.createdAt<=75000;
}

/** Voice-controlled parameters persist as preferences, but hardwareSync is never inherited.
 * Existing cinematic cues and manual timelines cannot be edited by these commands.
 */
export function applyAlexaConcertCommandV968(settings:ConcertSettingsV958,command:AlexaConcertCommandV968):ConcertSettingsV958{
 if(isAlexaConcertCommandV967(command)){
  const legacy=applyAlexaConcertCommandV967(settings,command);
  return ['arena','festival','club','calm'].includes(command)?{...legacy,
   voiceZoneV968:'all',voiceMoodV968:'auto',voiceFxV968:'auto'}:
   command==='fx-on'?{...legacy,voiceFxV968:'auto'}:legacy;
 }
 const base={...settings,hardwareSync:false,enabled:true,virtualFx:true,immersiveV966:true};
 switch(command){
  case 'zone-stage':return {...base,voiceZoneV968:'stage'};
  case 'zone-backdrop':return {...base,voiceZoneV968:'backdrop'};
  case 'zone-audience':return {...base,voiceZoneV968:'audience'};
  case 'zone-all':return {...base,voiceZoneV968:'all'};
  case 'mood-warm':return {...base,voiceMoodV968:'warm'};
  case 'mood-cool':return {...base,voiceMoodV968:'cool'};
  case 'mood-neon':return {...base,voiceMoodV968:'neon'};
  case 'mood-auto':return {...base,voiceMoodV968:'auto'};
  case 'effect-beams':return {...base,voiceFxV968:'beams'};
  case 'effect-fog':return {...base,voiceFxV968:'fog'};
  case 'effect-confetti':return {...base,voiceFxV968:'confetti'};
  case 'effect-streamers':return {...base,voiceFxV968:'streamers'};
  case 'effect-auto':return {...base,voiceFxV968:'auto'};
  case 'effect-off':return {...base,voiceFxV968:'off'};
 }
}
export const ALEXA_CONCERT_MESSAGES_V968:Readonly<Record<AlexaConcertCommandV968,string>>={
 ...ALEXA_CONCERT_MESSAGES_V967,
 'zone-stage':'Bühnenbereich', 'zone-backdrop':'LED-Hintergrund',
 'zone-audience':'Publikumsrand', 'zone-all':'gesamte virtuelle Bühne',
 'mood-warm':'warme Lichtstimmung','mood-cool':'kühle Lichtstimmung',
 'mood-neon':'Neon-Lichtstimmung','mood-auto':'automatische Lichtfarben',
 'effect-beams':'virtuelle Lichtkegel','effect-fog':'virtueller Bodennebel',
 'effect-confetti':'virtuelles Konfetti','effect-streamers':'virtuelle Papierluftschlangen',
 'effect-auto':'automatische Effekte','effect-off':'keine zusätzlichen Bühneneffekte'
};

const palettes={warm:['#ffad62','#bd3c69'],cool:['#58c5f3','#6355cf'],neon:['#d665f4','#31d5c9']} as const;
/** The current verified song phase and its authored cue retain priority.
 * In particular paper effects need a verified hook/drop/outro; no unsupported bursts.
 */
export function applyAlexaVirtualSceneV968(scene:ConcertSceneV958|null,settings:ConcertSettingsV958,
 options:{authoredStage:boolean;reducedMotion:boolean;lowPerformance:boolean}):ConcertSceneV958|null{
 if(!scene||!settings.enabled||!settings.virtualFx||!scene.verified||
   scene.timelineOverride||options.authoredStage||options.lowPerformance)return scene;
 const palette=settings.voiceMoodV968==='auto'?scene.palette:
  palettes[settings.voiceMoodV968]||scene.palette;
 const mode=settings.voiceFxV968;
 if(mode==='auto'||!mode)return {...scene,palette:[palette[0],palette[1]]};
 let effects:ConcertFxV955[]=[];
 if(mode!=='off'&&!options.reducedMotion){
  const isPaper=mode==='confetti'||mode==='streamers';
  if(!isPaper||['hook','drop','outro'].includes(scene.phase))effects=[mode];
 }
 return {...scene,palette:[palette[0],palette[1]],effects};
}
/** Mask visual channels, without adding geometry, draw loops or performance cost. */
export function maskAlexaImmersiveCueV968(cue:ImmersiveCueV966,settings:ConcertSettingsV958):ImmersiveCueV966{
 if(!cue.active||settings.voiceZoneV968==='all')return cue;
 switch(settings.voiceZoneV968){
  case 'stage':return {...cue,backHazeOpacity:0,audienceEdgeOpacity:0};
  case 'backdrop':return {...cue,beamOpacity:0,sideGlowOpacity:0,floorGlowOpacity:0,audienceEdgeOpacity:0};
  case 'audience':return {...cue,beamOpacity:0,sideGlowOpacity:0,floorGlowOpacity:0,backHazeOpacity:0};
  default:return cue;
 }
}
