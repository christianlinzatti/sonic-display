/** V1117 · AI Stage Transformation.
 * Offline, deterministic and explicitly opt-in: coordinate the real V1037,
 * V1038, V1066, V1067 and V1082 scenic modules through the EXISTING V1040
 * stage timeline. No invented GLB/geometry, no hardware/pyro/Govee command.
 * Chapter names are authored templates, NOT song-structure recognition.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';

export const STAGE_STYLES_V1117=['kinetic','floating','monumental','cinematic'] as const;
export type StageStyleV1117=typeof STAGE_STYLES_V1117[number];
export const STAGE_STYLE_LABELS_V1117:Record<StageStyleV1117,string>={
 kinetic:'Kinetische 360°-Bühne',floating:'Schwebende Plattformwelten',
 monumental:'Monumentale Bühnenarchitektur',cinematic:'Filmische Verwandlung',
};
export type StageOptionsV1117={style:StageStyleV1117;strength:number;intensityCap:number};
type Deck=AiShowRemixV1106['acts'][number]['deck'];
type Float=AiShowRemixV1106['acts'][number]['floating'];
type Laser=AiShowRemixV1106['acts'][number]['lasers'];
type Look={deck:Deck;floating:Float;lasers:Laser;chapter:string};
export type StageCueV1117={index:number;scene:string;start:number;end:number;
 deck:Deck;floating:Float;lasers:Laser;intensity:number;chapter:string;
 transition:'soft-crossfade';source:'authored-timeline';physicalStage:false};
export type StageShowV1117={style:StageStyleV1117;strength:number;
 remix:AiShowRemixV1106;cues:StageCueV1117[];quality:{scenes:7;layouts:number;
 floatingModes:number;quietBreak:boolean;smoothTransitions:boolean;
 preservedTimeline:boolean;manualSettingsRespected:true;hardwareCommands:0}};
export type StageLivePresetV1117={
 arenaTransformingStageEnabledV1066:true;arenaTransformingStageStrengthV1066:number;
 arenaFloatingExperienceEnabledV1067:true;arenaFloatingExperienceStrengthV1067:number;
 arenaDynamicArchitectureEnabledV1082:true;arenaDynamicArchitectureStrengthV1082:number;
 arenaEpicTransformationEnabledV1086:true;arenaEpicTransformationStrengthV1086:number;
};
const LOOKS:Record<StageStyleV1117,readonly Look[]>={
 kinetic:[
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'360°-Ring öffnet sich'},
  {deck:'spiral',floating:'wave',lasers:'halo',chapter:'Segmente drehen sich zum Lead'},
  {deck:'spiral',floating:'rise',lasers:'spiral',chapter:'Kinetischer Anstieg'},
  {deck:'fan',floating:'orbit',lasers:'tunnel',chapter:'360°-Fächer öffnet sich'},
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Ruhiger Umbau'},
  {deck:'spiral',floating:'orbit',lasers:'spiral',chapter:'Zweite Bewegungswelle'},
  {deck:'fan',floating:'rise',lasers:'tunnel',chapter:'Großer 360°-Abschluss'},
 ],
 floating:[
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Schwebeebenen erwachen'},
  {deck:'fan',floating:'orbit',lasers:'halo',chapter:'Umlaufende Plattformen'},
  {deck:'spiral',floating:'rise',lasers:'spiral',chapter:'Aufsteigende Inseln'},
  {deck:'halo',floating:'orbit',lasers:'tunnel',chapter:'Schwebende Bühne in der Runde'},
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Sanftes Absinken'},
  {deck:'fan',floating:'rise',lasers:'spiral',chapter:'Zweite Flugformation'},
  {deck:'fan',floating:'rise',lasers:'tunnel',chapter:'Schwebendes Finale'},
 ],
 monumental:[
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Arkaden erscheinen'},
  {deck:'spiral',floating:'wave',lasers:'halo',chapter:'Säulen begleiten die Strophe'},
  {deck:'fan',floating:'rise',lasers:'spiral',chapter:'Treppenartige Architektur'},
  {deck:'fan',floating:'orbit',lasers:'tunnel',chapter:'Terrassen öffnen die Arena'},
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Ruhige Kolonnade'},
  {deck:'spiral',floating:'orbit',lasers:'halo',chapter:'Architektur im Wandel'},
  {deck:'fan',floating:'rise',lasers:'tunnel',chapter:'Kronenformation zum Finale'},
 ],
 cinematic:[
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Leiser Filmbeginn'},
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Reduzierte Lead-Bühne'},
  {deck:'spiral',floating:'rise',lasers:'spiral',chapter:'Dramaturgische Öffnung'},
  {deck:'fan',floating:'orbit',lasers:'tunnel',chapter:'Große Kinoperspektive'},
  {deck:'halo',floating:'wave',lasers:'halo',chapter:'Atempause ohne Showblitz'},
  {deck:'spiral',floating:'wave',lasers:'halo',chapter:'Langsamer zweiter Aufbau'},
  {deck:'fan',floating:'rise',lasers:'tunnel',chapter:'Filmisches Arena-Finale'},
 ],
};
export function normalizeStageOptionsV1117(raw:unknown):StageOptionsV1117|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const v=raw as Record<string,unknown>;
 if(!STAGE_STYLES_V1117.includes(v.style as StageStyleV1117)||
  typeof v.strength!=='number'||!Number.isInteger(v.strength)||v.strength<20||v.strength>80||v.strength%10!==0||
  typeof v.intensityCap!=='number'||!Number.isInteger(v.intensityCap)||v.intensityCap<30||v.intensityCap>85)return null;
 return {style:v.style as StageStyleV1117,strength:v.strength,intensityCap:v.intensityCap};
}
/** Only existing deck/floating/laser modes are changed. All other authored
 * details (time boundaries, intensity, camera, dance, title) are unchanged. */
export function directStageTransformationV1117(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown):StageShowV1117|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw),opts=normalizeStageOptionsV1117(optionsRaw);
 if(!base||!remix||!opts||base.segments.length!==7||remix.acts.some((a,i)=>
  a.scene!==base.segments[i].scene||a.intensity>opts.intensityCap))return null;
 const looks=LOOKS[opts.style];
 const acts=remix.acts.map((a,i)=>{
  const l=looks[i];
  return {...a,deck:l.deck,floating:opts.strength>=30?l.floating:a.floating,
   lasers:opts.strength>=60?l.lasers:a.lasers,
   note:(a.note+' V1117: '+l.chapter+'.').slice(0,145)};
 });
 const staged=normalizeAiShowRemixV1106({...remix,acts,explanation:
  ('V1117 Bühnenverwandlung auf bestehender 360°-Show: reine lokale Regievorlage, keine Detektion echter Musikphasen. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,opts.intensityCap))return null;
 const cues=staged.acts.map((a,i)=>({index:i,scene:a.scene,start:base.segments[i].start,
  end:base.segments[i].end,deck:a.deck,floating:a.floating,lasers:a.lasers,
  intensity:a.intensity,chapter:looks[i].chapter,
  transition:'soft-crossfade' as const,source:'authored-timeline' as const,physicalStage:false as const}));
 const quality={scenes:7 as const,layouts:new Set(cues.map(c=>c.deck)).size,
  floatingModes:new Set(cues.map(c=>c.floating)).size,quietBreak:cues[4].scene==='interlude'&&
   cues[4].deck==='halo'&&cues[4].floating==='wave',
  smoothTransitions:true,preservedTimeline:cues[0].start===0&&cues[6].end===1&&
   cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  manualSettingsRespected:true as const,hardwareCommands:0 as const};
 if(!quality.quietBreak||!quality.preservedTimeline||quality.layouts<2)return null;
 return {style:opts.style,strength:opts.strength,remix:staged,cues,quality};
}
/** Enable only already-installed virtual scenic modules after explicit approval.
 * The V1040/V1048 show engine, user-selected manual deck modes, individual
 * effect toggles, reduced-motion and GPU-quality guards remain authoritative.
 * No Govee, pyro, new audio capture, or graphics resource allocation. */
export function stageLivePresetV1117(raw:unknown):StageLivePresetV1117|null{
 const o=normalizeStageOptionsV1117(raw);if(!o)return null;
 const bounded=Math.min(70,o.intensityCap,o.strength);
 return {arenaTransformingStageEnabledV1066:true,arenaTransformingStageStrengthV1066:bounded,
  arenaFloatingExperienceEnabledV1067:true,arenaFloatingExperienceStrengthV1067:bounded,
  arenaDynamicArchitectureEnabledV1082:true,arenaDynamicArchitectureStrengthV1082:bounded,
  arenaEpicTransformationEnabledV1086:true,arenaEpicTransformationStrengthV1086:bounded};
}
export function sampleStageCueV1117(show:StageShowV1117|null,progress:unknown):StageCueV1117|null{
 if(!show||show.cues.length!==7||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
