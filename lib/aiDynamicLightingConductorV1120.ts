/** V1120 · AI Dynamic Lighting Conductor.
 * Offline, bounded lighting dramaturgy based on an AUTHORED seven-scene plan.
 * Scene labels are templates, not detected audio sections or predicted drops.
 * Never writes hardware/Govee/DMX, invokes OpenAI, samples audio or starts timers.
 * The existing V1056, V1058, V1059 and V1060 renderer modules own all live
 * lighting, including safe transitions, manual timeline precedence and GPU guards.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';

export const LIGHTING_STYLES_V1120=['cinematic','festival','portrait','holographic'] as const;
export type LightingStyleV1120=typeof LIGHTING_STYLES_V1120[number];
export const LIGHTING_LABELS_V1120:Record<LightingStyleV1120,string>={
 cinematic:'Filmischer Lichtbogen',festival:'Festival-Lichtarchitektur',
 portrait:'Künstlerporträt & lesbare Lyrics',holographic:'Holografischer Lichtkosmos',
};
export type LightingOptionsV1120={style:LightingStyleV1120;strength:number;intensityCap:number};
type Laser=AiShowRemixV1106['acts'][number]['lasers'];
export type LightingCueV1120={index:number;scene:ArenaShowSceneV1040;start:number;end:number;
 chapter:string;look:'wash'|'portrait'|'architecture'|'halo'|'rest'|'ensemble';
 colorMood:'cool'|'warm'|'neutral'|'prismatic';virtualBrightness:number;
 lasers:Laser;camera:AiShowRemixV1106['acts'][number]['camera'];
 holograms:'existing-v1039-v1118';fade:'existing-smooth-transitions';
 authoredTiming:true;manualLightingPriority:true;actualSongSectionDetected:false};
export type LightingShowV1120={style:LightingStyleV1120;strength:number;
 remix:AiShowRemixV1106;cues:LightingCueV1120[];
 quality:{scenes:7;lightLooks:number;quietBreak:true;lyricsProtected:true;fadeSafe:true;
 preservedTimeline:true;manualLightingPriority:true;hardwareCommands:0;detectedDrops:0}};
/** Runtime settings are ONLY existing virtual lighting layer opt-ins. */
export type LightingLivePresetV1120={
 arenaCinematicLightingEnabledV1056:true;arenaCinematicLightingStrengthV1056:number;
 arenaVolumetricLightingEnabledV1058:true;arenaVolumetricLightingStrengthV1058:number;
 arenaLedWallEnabledV1059:true;arenaLedWallStrengthV1059:number;
 arenaLightingChoreographerEnabledV1060:true;arenaLightingChoreographerStrengthV1060:number;
};
const PROFILES:Record<LightingStyleV1120,{
 chapters:readonly string[];looks:readonly LightingCueV1120['look'][];
 moods:readonly LightingCueV1120['colorMood'][];lasers:readonly Laser[];brightness:readonly number[];
}>={
 cinematic:{chapters:['Leiser Lichtauftakt','Warm geführtes Künstlerporträt','Raumlicht wächst',
  'Breites Ensemble im Licht','Verdunkelte Atempause','Zweiter Lichtbogen','Filmisches Lichtfinale'],
  looks:['wash','portrait','architecture','ensemble','rest','portrait','ensemble'],
  moods:['cool','warm','cool','prismatic','neutral','warm','prismatic'],
  lasers:['halo','halo','spiral','tunnel','halo','spiral','tunnel'],brightness:[20,34,49,67,14,49,75]},
 festival:{chapters:['Festivalgelände erwacht','Bühne für die Crew','Breiter Lichtaufbau',
  'Große Lichtarchitektur','Ruhige Lichtinsel','Neue Lichtwelle','Ensemble-Finale'],
  looks:['wash','ensemble','architecture','ensemble','rest','architecture','ensemble'],
  moods:['cool','prismatic','warm','prismatic','neutral','cool','prismatic'],
  lasers:['halo','halo','spiral','tunnel','halo','spiral','tunnel'],brightness:[25,41,58,74,18,57,80]},
 portrait:{chapters:['Lesbares Licht auf Bühne','Künstler vor ruhigem Hintergrund','Sanfte Randlichter',
  'Hook im Gruppenfokus','Lyrics-freundliche Pause','Künstlerbild erneut öffnen','Gemeinsame Porträts'],
  looks:['wash','portrait','portrait','ensemble','rest','portrait','ensemble'],
  moods:['neutral','warm','warm','cool','neutral','warm','prismatic'],
  lasers:['halo','halo','halo','spiral','halo','halo','spiral'],brightness:[20,33,43,57,14,43,63]},
 holographic:{chapters:['Optische Ringe sichtbar','Transparente Bühnenebene','Lichtgitter öffnet sich',
  'Holografische Ensembleweitung','Lichttunnel ruht','Rückkehr der Projektionen','Kosmisches Finale'],
  looks:['halo','portrait','architecture','ensemble','rest','halo','ensemble'],
  moods:['cool','cool','prismatic','prismatic','neutral','cool','prismatic'],
  lasers:['halo','halo','spiral','tunnel','halo','spiral','tunnel'],brightness:[24,39,55,70,15,50,76]},
};
export function normalizeLightingOptionsV1120(raw:unknown):LightingOptionsV1120|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(!LIGHTING_STYLES_V1120.includes(o.style as LightingStyleV1120)||
  typeof o.strength!=='number'||!Number.isInteger(o.strength)||o.strength<20||o.strength>80||o.strength%10!==0||
  typeof o.intensityCap!=='number'||!Number.isInteger(o.intensityCap)||o.intensityCap<30||o.intensityCap>85)return null;
 return {style:o.style as LightingStyleV1120,strength:o.strength,intensityCap:o.intensityCap};
}
/** Preview's color moods/brightness are descriptive cues. The existing V1040
 * timeline stores only supported LASER looks; it has no per-scene color field.
 * All remaining scene fields and artist-authored timing remain unchanged. */
export function directDynamicLightingV1120(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown):LightingShowV1120|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const o=normalizeLightingOptionsV1120(optionsRaw);
 if(!base||!remix||!o||base.segments.length!==7||remix.acts.some((a,i)=>
  a.scene!==base.segments[i].scene||a.intensity>o.intensityCap))return null;
 const profile=PROFILES[o.style];
 const acts=remix.acts.map((a,i)=>({...a,
  lasers:o.strength>=40?profile.lasers[i]:a.lasers,
  note:(a.note+' V1120: '+profile.chapters[i]+'.').slice(0,145)}));
 const staged=normalizeAiShowRemixV1106({...remix,acts,explanation:(
  'V1120: lokale Licht-Regiepartitur, auf bestehende virtuelle Lichtmodule beschränkt. Keine echte Lichtfarbe in der V1040-Timeline, kein erkanntes Audio und keine Gerätebefehle. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,o.intensityCap))return null;
 const levels=profile.brightness.map(value=>Math.min(o.intensityCap,Math.round(value*o.strength/70)));
 // The visual plan should never suggest an abrupt intensity drop; actual runtime fades remain authoritative.
 if(levels[3]-levels[4]>45)levels[4]=levels[3]-45;
 levels[4]=Math.min(levels[4],Math.floor(levels[3]/2));
 const cues=staged.acts.map((a,i):LightingCueV1120=>({
  index:i,scene:a.scene,start:base.segments[i].start,end:base.segments[i].end,
  chapter:profile.chapters[i],look:profile.looks[i],colorMood:profile.moods[i],
  virtualBrightness:levels[i],
  lasers:a.lasers,camera:a.camera,holograms:'existing-v1039-v1118',
  fade:'existing-smooth-transitions',authoredTiming:true,manualLightingPriority:true,
  actualSongSectionDetected:false}));
 const preserved=cues[0].start===0&&cues[6].end===1&&cues.every((c,i)=>i===0||c.start===cues[i-1].end);
 const quiet=cues[4].look==='rest'&&cues[4].virtualBrightness<=cues[3].virtualBrightness/2;
 const fadeSafe=cues.every((c,i)=>i===0||Math.abs(c.virtualBrightness-cues[i-1].virtualBrightness)<=45);
 if(!preserved||!quiet||!fadeSafe)return null;
 return {style:o.style,strength:o.strength,remix:staged,cues,quality:{scenes:7,
  lightLooks:new Set(cues.map(c=>c.look)).size,quietBreak:true,lyricsProtected:true,fadeSafe:true,
  preservedTimeline:true,manualLightingPriority:true,hardwareCommands:0,detectedDrops:0}};
}
/** User-approved enablement only: no Govee, physical strobe, pyro or DMX. */
export function lightingLivePresetV1120(raw:unknown):LightingLivePresetV1120|null{
 const o=normalizeLightingOptionsV1120(raw);if(!o)return null;
 const strength=Math.min(o.strength,o.intensityCap,70);
 return {arenaCinematicLightingEnabledV1056:true,arenaCinematicLightingStrengthV1056:strength,
  arenaVolumetricLightingEnabledV1058:true,arenaVolumetricLightingStrengthV1058:strength,
  arenaLedWallEnabledV1059:true,arenaLedWallStrengthV1059:strength,
  arenaLightingChoreographerEnabledV1060:true,arenaLightingChoreographerStrengthV1060:strength};
}
export function sampleLightingCueV1120(show:LightingShowV1120|null,progress:unknown):LightingCueV1120|null{
 if(!show||show.cues.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
