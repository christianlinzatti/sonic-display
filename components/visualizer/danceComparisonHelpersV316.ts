/** V316: isolated live 3D A/B preview. Same demo clock, real V306/V307/V310/V311
 * functions, no writes to user settings or current show; synthetic beat is explicit. */
import {withImprovementValueV315, improvementValueV315,improvementFieldEnabledV315,
  type ImprovementSettingsV315,type ImprovementSuggestionV315} from './danceImprovementAssistantV315';
import type {AvatarRigMotion} from './avatarRigController';
import type {StageSection} from './stageDirectorV287';
export type ComparisonGenreV316='Hardtekk'|'Deutschrap'|'Cinematic';
export type DemoSampleV316={time:number; bpm:number;genre:ComparisonGenreV316; section:StageSection;
  energy:number;kick:number;snare:number;beat:number;plantedLeft:boolean;plantedRight:boolean;};
const clamp=(x:number,low=0,high=1)=>Number.isFinite(x)?Math.min(high,Math.max(low,x)):low;
export function prepareComparisonV316(settings:ImprovementSettingsV315,items:readonly ImprovementSuggestionV315[]):
  {ok:true;before:ImprovementSettingsV315;after:ImprovementSettingsV315;changed:number}|{ok:false;reason:string}{
  if(items.length===0)return {ok:false,reason:'Bitte mindestens einen Vorschlag auswählen.'};
  const visited=new Set<string>();let after=settings;
  for(const item of items){
    if(visited.has(item.field)||!improvementFieldEnabledV315(settings,item.field)||improvementValueV315(settings,item.field)!==item.before)
      return {ok:false,reason:'Mindestens ein Vorschlag ist veraltet. Bitte die Show neu analysieren.'};
    visited.add(item.field);
    after=withImprovementValueV315(after,item.field,item.after);
  }
  if(items.every(s=>improvementValueV315(settings,s.field)===improvementValueV315(after,s.field)))
    return {ok:false,reason:'Die ausgewählten Vorschläge verändern keine Regler.'};
  return {ok:true,before:settings,after,changed:visited.size};
}
export function previewBpmV316(genre:ComparisonGenreV316):number{
  return genre==='Hardtekk'?165:genre==='Deutschrap'?92:118;
}
export function demoSampleV316(seconds:number,genre:ComparisonGenreV316):DemoSampleV316{
  const bpm=previewBpmV316(genre);
  const beatDuration=60/bpm;
  const at=Math.max(0,Number.isFinite(seconds)?seconds:0);
  // Repeats a musical 144-beat demonstration with a quiet passage, build and drop.
  const beatCount=at/beatDuration+1e-8;
  const phrase=beatCount%144;
  const section:StageSection=phrase<64?'verse':phrase<80?'break':phrase<96?'build':phrase<128?'drop':'hook';
  const phase=beatCount%1;
  const kick=Math.exp(-phase*12)*(section==='break'?.12:section==='build'?.55:1);
  const snare=Math.exp(-Math.abs((beatCount+.5)%1-.5)*11)*(section==='break'?.12:.70);
  const energy=section==='break'?.20:section==='build'?.50:section==='drop'?.96:section==='hook'?.78:.55;
  const footPhase=(Math.floor(beatCount)%2+2)%2;
  return {time:at,bpm,genre,section,energy,kick:clamp(kick),snare:clamp(snare),beat:clamp(kick),
    plantedLeft:footPhase===0&&phase<.44,plantedRight:footPhase===1&&phase<.44};
}
/** Shared source additive dance pattern on both sides. The V307+V311 processors
 * supply settings-dependent refinements; this is not imported GLB clip playback. */
export function demoRigMotionV316(sample:DemoSampleV316):AvatarRigMotion{
  const beat=sample.time*sample.bpm/60;
  const pulse=sample.kick;
  const flow=Math.sin(beat*Math.PI);
  const accent=sample.section==='break'?.32:sample.section==='build'?.68:1;
  return {headNod:-pulse*.075*accent,headTurn:Math.sin(beat*.52)*.07*accent,
    spineSway:flow*.095*accent,hipSway:-flow*.06*accent,shoulderRoll:Math.sin(beat*1.3)*.07*accent,
    followThrough:flow*.045,headLag:-flow*.02,chestPulse:pulse*.075*accent,
    armSwing:flow*.31*accent,legGroove:Math.cos(beat*Math.PI)*.23*accent,
    footStep:Math.max(0,Math.sin(beat*Math.PI))*.13*accent,
    weightShift:flow*.32*accent,beatImpulse:pulse*.3,
    expressionJaw:0,expressionBrow:0,expressionEyeNarrow:0,expressionHeadTilt:0};
}
export function demoSectionLabelV316(section:StageSection):string{
  return ({verse:'Groove',break:'Break',build:'Aufbau',drop:'Drop',hook:'Hook'})[section];
}
