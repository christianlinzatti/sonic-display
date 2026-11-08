/** V1118 · AI Holographic Stage Director.
 * An explicit opt-in, deterministic arrangement of the EXISTING V1039 portal,
 * V1068 holographic concert, V1081 optical dancers and V1085 projection mapping.
 * It does not synthesize musicians, GLB assets, vocals, song sections or hardware light.
 * The authored seven-section V1040 timeline stays authoritative.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import type {HologramLookV1068} from './arena360HolographicConcertV1068';
import type {DancerStyleV1081} from './arena360HolographicDancersV1081';
import type {ProjectionModeV1085} from './arena360ProjectionMappingV1085';

export const HOLOGRAM_STYLES_V1118=['spectral','mirrors','duet','cosmic'] as const;
export type HologramStyleV1118=typeof HOLOGRAM_STYLES_V1118[number];
export const HOLOGRAM_STYLE_LABELS_V1118:Record<HologramStyleV1118,string>={
 spectral:'Spektrales Lichttheater',mirrors:'Holografische Spiegelwelt',
 duet:'Optisches Künstlerduett',cosmic:'Kosmischer Lichttunnel',
};
export type HologramOptionsV1118={style:HologramStyleV1118;strength:number;intensityCap:number};
type Laser=AiShowRemixV1106['acts'][number]['lasers'];
type Pattern=Exclude<ProjectionModeV1085,'auto'>;
const STYLES:Record<HologramStyleV1118,{projection:Pattern;lasers:readonly Laser[];chapters:readonly string[]}>= {
 spectral:{projection:'aurora',lasers:['halo','halo','spiral','tunnel','halo','spiral','tunnel'],chapters:[
  'Lichterscheinung öffnet sich','Spektrale Silhouetten begleiten den Lead','Lichtbögen wachsen',
  'Spektralringe füllen die Arena','Atempause im Halblicht','Zweiter Lichtbogen','Spektrales Finale']},
 mirrors:{projection:'lattice',lasers:['halo','spiral','spiral','tunnel','halo','halo','tunnel'],chapters:[
  'Spiegelachsen erscheinen','Reflexionen wandern um die Bühne','Gitter aus Licht entsteht',
  'Versetzte Lichtbilder antworten','Spiegelwelt wird still','Reflexionen kehren zurück','Lichtspiegel im Finale']},
 duet:{projection:'ripple',lasers:['halo','halo','spiral','tunnel','halo','spiral','tunnel'],chapters:[
  'Schatten der Crew erscheinen','Lead im Lichtkreis','Zweite Silhouette reagiert',
  'Holografisches Duo als optische Illusion','Vorsichtige Ruhepause','Wechselnde Lichtfiguren','Gemeinsamer optischer Abschluss']},
 cosmic:{projection:'orbit',lasers:['halo','spiral','spiral','tunnel','halo','spiral','tunnel'],chapters:[
  'Raumportal erwacht','Lichtteilchen umrunden die Arena','Tiefenraum verdichtet sich',
  'Kosmischer Tunnel öffnet sich','Sternenlicht ruht','Portal erwacht erneut','Großes Tunnel-Finale']},
};
const CHAPTER_LOOK:Record<ArenaShowSceneV1040,HologramLookV1068>={
 intro:'awakening',verse:'reflection',build:'vortex',hook:'duet',interlude:'breath',finale:'finale'
};
const CHAPTER_DANCER:Record<ArenaShowSceneV1040,DancerStyleV1081>={
 intro:'arrival',verse:'groove',build:'build',hook:'duet',interlude:'breath',finale:'encore'
};
export type HologramCueV1118={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 chapter:string;look:HologramLookV1068;opticalDancers:DancerStyleV1081;projection:Pattern;
 lasers:Laser;intensity:number;source:'authored-timeline';visualOnly:true;virtualPerformerClones:false};
export type HologramShowV1118={style:HologramStyleV1118;strength:number;
 remix:AiShowRemixV1106;cues:HologramCueV1118[];quality:{scenes:7;
 looks:number;projectedPattern:Pattern;quietBreak:boolean;preservedTimeline:boolean;
 opticalOnly:true;safeTransitions:boolean;hardwareCommands:0;noGeneratedAvatars:true}};
export type HologramLivePresetV1118={
 arenaHologramsEnabledV1039:true;arenaHologramStrengthV1039:number;
 arenaHolographicConcertEnabledV1068:true;arenaHolographicConcertStrengthV1068:number;
 arenaHolographicDancersEnabledV1081:true;arenaHolographicDancersStrengthV1081:number;
 arenaProjectionEnabledV1085:true;arenaProjectionStrengthV1085:number;
 arenaProjectionModeV1085:Pattern;
};
export function normalizeHologramOptionsV1118(raw:unknown):HologramOptionsV1118|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(!HOLOGRAM_STYLES_V1118.includes(o.style as HologramStyleV1118)||
  typeof o.strength!=='number'||!Number.isInteger(o.strength)||o.strength<20||o.strength>80||o.strength%10!==0||
  typeof o.intensityCap!=='number'||!Number.isInteger(o.intensityCap)||o.intensityCap<30||o.intensityCap>85)return null;
 return {style:o.style as HologramStyleV1118,strength:o.strength,intensityCap:o.intensityCap};
}
/** Writes ONLY existing virtual laser motifs. The other approved performance and
 * stage properties and all manual time boundaries/IDs remain unchanged. */
export function directHolographicShowV1118(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown):HologramShowV1118|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw),o=normalizeHologramOptionsV1118(optionsRaw);
 if(!base||!remix||!o||base.segments.length!==7||remix.acts.some((a,i)=>
  a.scene!==base.segments[i].scene||a.intensity>o.intensityCap))return null;
 const profile=STYLES[o.style];
 const acts=remix.acts.map((a,i)=>({...a,
  lasers:o.strength>=50?profile.lasers[i]:a.lasers,
  note:(a.note+' V1118: '+profile.chapters[i]+'.').slice(0,145)}));
 const staged=normalizeAiShowRemixV1106({...remix,acts,explanation:(
  'V1118: lokale Hologramm-Partitur auf vorhandenen optischen 3D-Modulen; entworfene Songphasen, keine erkannten Vocals, Hologramm-Künstler oder echten Projektionen. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,o.intensityCap))return null;
 const cues=staged.acts.map((a,i):HologramCueV1118=>({index:i,scene:a.scene,
  start:base.segments[i].start,end:base.segments[i].end,chapter:profile.chapters[i],
  look:CHAPTER_LOOK[a.scene],opticalDancers:CHAPTER_DANCER[a.scene],projection:profile.projection,
  lasers:a.lasers,intensity:a.intensity,source:'authored-timeline',visualOnly:true,virtualPerformerClones:false}));
 const quality={scenes:7 as const,looks:new Set(cues.map(c=>c.look)).size,
  projectedPattern:profile.projection,quietBreak:cues[4].scene==='interlude'&&cues[4].look==='breath',
  preservedTimeline:cues[0].start===0&&cues[6].end===1&&cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  opticalOnly:true as const,safeTransitions:true,hardwareCommands:0 as const,noGeneratedAvatars:true as const};
 if(!quality.quietBreak||!quality.preservedTimeline||quality.looks<4)return null;
 return {style:o.style,strength:o.strength,remix:staged,cues,quality};
}
/** Enables only existing virtual visuals after separate user approval.
 * Renderer guards for pausing, low GPU tier, reduced motion, inactive sections,
 * manually selected hologram pattern and invalid beat signals remain authoritative.
 * A non-auto projection pattern chosen by the user must be handled by UI before
 * calling the preset; never silently force manual hologram patterns back to auto. */
export function hologramLivePresetV1118(optionsRaw:unknown):HologramLivePresetV1118|null{
 const o=normalizeHologramOptionsV1118(optionsRaw);if(!o)return null;
 const gain=Math.min(70,o.intensityCap,o.strength);
 const lowGain=Math.min(60,gain);
 return {arenaHologramsEnabledV1039:true,arenaHologramStrengthV1039:gain,
  arenaHolographicConcertEnabledV1068:true,arenaHolographicConcertStrengthV1068:gain,
  arenaHolographicDancersEnabledV1081:true,arenaHolographicDancersStrengthV1081:lowGain,
  arenaProjectionEnabledV1085:true,arenaProjectionStrengthV1085:lowGain,
  arenaProjectionModeV1085:STYLES[o.style].projection};
}
export function sampleHologramCueV1118(show:HologramShowV1118|null,position:unknown):HologramCueV1118|null{
 if(!show||show.cues.length!==7||typeof position!=='number'||!Number.isFinite(position)||position<0||position>1)return null;
 return show.cues.find(c=>position<c.end)??show.cues[6];
}
