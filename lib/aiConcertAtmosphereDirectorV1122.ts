/** V1122 AI Concert Atmosphere Director.
 * Bounded, deterministic *rehearsal* based solely on authored V1040 segments.
 * Existing V1045 fog/sky modulation, V1058 volumetric light and V1084 virtual
 * festival particles remain the ONLY live renderers. This is NOT a fog machine,
 * DMX, Govee, new WebGL pass, song-structure detector or second particle system.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';

export const ATMOSPHERE_STYLES_V1122=['cinematic','festival','ethereal','intimate'] as const;
export type AtmosphereStyleV1122=typeof ATMOSPHERE_STYLES_V1122[number];
export const ATMOSPHERE_LABELS_V1122:Record<AtmosphereStyleV1122,string>={
 cinematic:'Filmischer Bodennebel',festival:'Festival-Luft & Partikel',
 ethereal:'Holografische Tiefenräume',intimate:'Ruhige Künstleratmosphäre',
};
export type AtmosphereOptionsV1122={style:AtmosphereStyleV1122;strength:number;intensityCap:number};
export type AtmosphereCueV1122={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 chapter:string;look:'mist'|'aerial'|'depth'|'glow'|'breath'|'finale';
 fog:number;particles:number;depth:number;airflow:number;lyricsClearance:number;
 authoredTiming:true;virtualOnly:true;actualSongEventDetected:false};
export type AtmosphereShowV1122={style:AtmosphereStyleV1122;strength:number;
 remix:AiShowRemixV1106;cues:AtmosphereCueV1122[];
 quality:{scenes:7;quietBreak:true;boundedFog:true;lyricsReadable:true;authoredTiming:true;
 manualPriority:true;existingRenderersOnly:true;hardwareCommands:0;detectedDrops:0}};
export type AtmosphereSampleV1122={cue:AtmosphereCueV1122;transition:number;
 fog:number;particles:number;depth:number;airflow:number;lyricsClearance:number};
export type AtmosphereLivePresetV1122={
 arenaAtmosphereDirectorEnabledV1045:true;arenaAtmosphereDirectorStrengthV1045:number;
 arenaVolumetricLightingEnabledV1058:true;arenaVolumetricLightingStrengthV1058:number;
 arenaFestivalFxEnabledV1084:true;arenaFestivalFxStrengthV1084:number;
};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const profiles:Record<AtmosphereStyleV1122,{
 names:readonly string[];looks:readonly AtmosphereCueV1122['look'][];
 fog:readonly number[];particles:readonly number[];depth:readonly number[];air:readonly number[];
}>={
 cinematic:{names:['Leiser Nebelvorhang','Konturen im Tiefennebel','Dichter werdender Bühnenraum',
  'Leuchtender Bühnennebel','Freier Blick in der Atempause','Tiefenwirkung kehrt zurück','Großes Nebel-Lichtfinale'],
  looks:['mist','mist','depth','glow','breath','depth','finale'],
  fog:[25,34,47,54,13,45,62],particles:[12,20,30,38,8,27,47],depth:[30,39,56,65,18,51,73],air:[18,25,32,42,12,35,48]},
 festival:{names:['Festival-Luft erwacht','Aufgelockerter Partikelraum','Konfetti-Atmosphäre baut sich auf',
  'Breites Festival-Panorama','Partikel halten inne','Zweite atmosphärische Welle','Partikel-Finale'],
  looks:['aerial','aerial','depth','glow','breath','aerial','finale'],
  fog:[16,24,30,40,10,32,45],particles:[27,38,52,65,12,47,72],depth:[21,34,45,55,15,44,63],air:[26,34,45,57,13,47,63]},
 ethereal:{names:['Ferne Lichtschleier','Schwebende Farbtiefe','Optisches Nebelportal',
  'Holografischer Raum öffnet sich','Stille transparente Ebene','Neuer Lichtnebel','Kosmisches Raumfinale'],
  looks:['depth','depth','mist','glow','breath','depth','finale'],
  fog:[22,29,42,52,12,43,58],particles:[16,22,35,43,9,32,49],depth:[33,46,61,73,20,58,80],air:[17,23,32,40,10,30,48]},
 intimate:{names:['Freie Sicht auf Künstler','Sanfter Lichthauch','Behutsamer Raumausbau',
  'Leichtes Ensembleleuchten','Sehr ruhige Atempause','Warm zurückkehrender Nebel','Klares Sängerfinale'],
  looks:['mist','mist','depth','glow','breath','mist','finale'],
  fog:[12,19,25,32,7,25,37],particles:[7,13,20,26,5,21,31],depth:[17,27,35,43,12,34,49],air:[10,16,22,29,8,24,35]},
};
export function normalizeAtmosphereOptionsV1122(input:unknown):AtmosphereOptionsV1122|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const x=input as Record<string,unknown>;
 if(!ATMOSPHERE_STYLES_V1122.includes(x.style as AtmosphereStyleV1122)||
  typeof x.strength!=='number'||!Number.isInteger(x.strength)||x.strength<20||x.strength>80||x.strength%10!==0||
  typeof x.intensityCap!=='number'||!Number.isInteger(x.intensityCap)||x.intensityCap<30||x.intensityCap>85)return null;
 return {style:x.style as AtmosphereStyleV1122,strength:x.strength,intensityCap:x.intensityCap};
}
/** Keeps the incoming remix byte-for-byte intact and NEVER rewrites scene boundaries.
 * The levels below are explanation/previews, not direct WebGL or hardware commands.
 */
export function directConcertAtmosphereV1122(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown):AtmosphereShowV1122|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const options=normalizeAtmosphereOptionsV1122(optionsRaw);
 if(!base||!remix||!options||base.segments.length!==7||remix.acts.length!==7||
  remix.acts.some((a,i)=>a.scene!==base.segments[i].scene||a.intensity>options.intensityCap)||
  !applyAiShowRemixV1106(base,remix,options.intensityCap))return null;
 const p=profiles[options.style],scale=options.strength/70;
 const cues=base.segments.map((segment,i):AtmosphereCueV1122=>{
  const fog=clamp(Math.round(p.fog[i]*scale),0,65);
  const particles=clamp(Math.round(p.particles[i]*scale),0,70);
  const depth=clamp(Math.round(p.depth[i]*scale),0,75);
  const airflow=clamp(Math.round(p.air[i]*scale),0,65);
  // High opacity must never obscure lips, lyrics or singer tracking.
  const lyricsClearance=Math.max(55,100-Math.round(fog*.55+particles*.16));
  return {index:i,scene:segment.scene,start:segment.start,end:segment.end,chapter:p.names[i],
   look:p.looks[i],fog,particles,depth,airflow,lyricsClearance,
   authoredTiming:true,virtualOnly:true,actualSongEventDetected:false};
 });
 const quiet=cues[4].look==='breath'&&cues[4].fog<cues[3].fog&&
  cues[4].particles<cues[3].particles&&cues[4].depth<cues[3].depth;
 if(!quiet||cues.some(c=>c.fog>65||c.particles>70||c.depth>75||c.lyricsClearance<55||
  !Number.isFinite(c.start)||!Number.isFinite(c.end)))return null;
 return {style:options.style,strength:options.strength,remix,cues,
  quality:{scenes:7,quietBreak:true,boundedFog:true,lyricsReadable:true,authoredTiming:true,
   manualPriority:true,existingRenderersOnly:true,hardwareCommands:0,detectedDrops:0}};
}
/** Pure rehearsal blend at the START of a segment; live V1045 owns real fading. */
export function sampleConcertAtmosphereV1122(show:AtmosphereShowV1122|null,progress:unknown):AtmosphereSampleV1122|null{
 if(!show||show.cues.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 const index=show.cues.findIndex(c=>progress<c.end);
 const i=index<0?6:index;
 const cue=show.cues[i],previous=show.cues[Math.max(0,i-1)];
 const width=Math.min(.018,(cue.end-cue.start)*.22);
 const t=i===0||width<=0?1:clamp((progress-cue.start)/width,0,1);
 const blend=t*t*(3-2*t);
 const mix=(key:'fog'|'particles'|'depth'|'airflow'|'lyricsClearance')=>
  Math.round(previous[key]+(cue[key]-previous[key])*blend);
 return {cue,transition:Math.round(blend*1000)/1000,fog:mix('fog'),
  particles:mix('particles'),depth:mix('depth'),airflow:mix('airflow'),lyricsClearance:mix('lyricsClearance')};
}
/** User-activated existing V1045/V1058/V1084 virtual renderers only.
 * V1084 must remain in 'auto' (checked by the UI) and retains its own
 * playback, low-power, microphone/beat evidence and reduced-motion guards.
 */
export function atmosphereLivePresetV1122(raw:unknown):AtmosphereLivePresetV1122|null{
 const o=normalizeAtmosphereOptionsV1122(raw);if(!o)return null;
 const strength=Math.min(o.strength,o.intensityCap,65);
 return {arenaAtmosphereDirectorEnabledV1045:true,arenaAtmosphereDirectorStrengthV1045:strength,
  arenaVolumetricLightingEnabledV1058:true,arenaVolumetricLightingStrengthV1058:Math.min(strength,55),
  arenaFestivalFxEnabledV1084:true,arenaFestivalFxStrengthV1084:strength};
}
