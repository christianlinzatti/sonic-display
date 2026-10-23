import type {Lyrics, LyricWord} from "@/types/music";
import {resolveCoordinatedVocalV372,type CoordinatedVocalCueV372,type VocalDirectorOptionsV372} from "./vocalPerformanceDirectorV372";
import {resolveVocalPerformanceV368} from "./vocalPerformanceV368";
import {resolveFacialPoseV369} from "./facialPerformanceV369";
import {applyNaturalVocalArticulationV384,type NaturalArticulationSettingsV384} from "./naturalVocalArticulationV384";
import {refineRapArticulationV405,type RapArticulationOptionsV405,type RapArticulationCueV405} from "./rapArticulationV405";
import {refineFastRapMouthV415,rapLipMouthOffsetV415,type RapLipPrecisionOptionsV415} from "./rapLipPrecisionV415";
import {refineRapSyllablesV419,type RapSyllableOptionsV419,type RapSyllableCueV419} from "./rapSyllableArticulationV419";
import {applyRapMouthKeyframesV420,type RapMouthEditsOptionsV420} from "./rapSyllableKeyframesV420";
import {applyRapAudioV423,type RapAudioOptionsV423} from "./rapAudioAwareV423";

/** Visual roles do not identify the performer actually singing in the recording. */
export type VocalEnsembleModeV374="balanced"|"lead"|"call-response";
export type VocalQualityOptionsV374=VocalDirectorOptionsV372&NaturalArticulationSettingsV384&RapArticulationOptionsV405&RapLipPrecisionOptionsV415&RapSyllableOptionsV419&RapMouthEditsOptionsV420&RapAudioOptionsV423&{
  qualityEnabledV374?:boolean;
  mouthSmoothnessV374?:number;
  rapGestureCalmV374?:number;
  ensembleModeV374?:VocalEnsembleModeV374;
  ensembleCountV374?:number;
  /** Shared V375 stage lead when a dynamic cast is active. */
  stageLeaderV375?:number;
  manualSingingSlotsV385?: readonly number[];
};
export type VocalQualityResultV374=CoordinatedVocalCueV372&{
  qualityV374:{role:"solo"|"lead"|"backing"|"ensemble";rapidWord:boolean;gestureGain:number;mouthMix:number};
};
const clamp=(n:number,min=0,max=1)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const setting=(v:number|undefined,fallback:number)=>clamp((v??fallback)/100);
const validWord=(w:LyricWord)=>typeof w.text==="string"&&!!w.text.trim()&&Number.isFinite(w.startMs)&&w.startMs>=0;
function currentWord(lyrics:Lyrics|null,ms:number){
  if(!lyrics?.synced)return null;
  const lines=lyrics.lines;
  let li=-1;
  for(let i=0;i<lines.length;i++){if(lines[i].startMs<=ms)li=i;else break;}
  if(li<0)return null;
  const line=lines[li];
  if(!line.words?.length)return null;
  const words=line.words.filter(validWord).slice().sort((a,b)=>a.startMs-b.startMs);
  let wi=-1;
  for(let i=0;i<words.length;i++){if(words[i].startMs<=ms)wi=i;else break;}
  if(wi<0)return null;
  const word=words[wi];
  const end=Math.min(word.endMs!=null&&word.endMs>word.startMs?word.endMs:Infinity,
    words[wi+1]?.startMs??Infinity,line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
    lines[li+1]?.startMs??Infinity,word.startMs+2100,line.startMs+12000);
  if(ms>=end||end<=word.startMs)return null;
  const before=wi>0?word.startMs-words[wi-1].startMs:Infinity;
  const after=wi+1<words.length?words[wi+1].startMs-word.startMs:Infinity;
  return {lineIndex:li,wordIndex:wi,word,last:wi===words.length-1,rapid:before<370||after<370};
}
/** Pure, clock-based quality pass: no audio phoneme recognition or mutable timers. */
export function resolveVocalPerformanceQualityV374(
  lyrics:Lyrics|null,ms:number,playing:boolean,options:VocalQualityOptionsV374={}
):RapSyllableCueV419{
  const base=resolveCoordinatedVocalV372(lyrics,ms,playing,options);
  const count=clamp(Math.trunc(options.ensembleCountV374??1),1,8);
  const slot=clamp(Math.trunc(options.avatarSlot??0),0,7);
  const mode=options.ensembleModeV374??"lead";
  const word=base.confidence==="word"&&playing?currentWord(lyrics,base.effectiveTimeMs):null;
  const stageLeadV375=Number.isInteger(options.stageLeaderV375)&&options.stageLeaderV375!>=0&&options.stageLeaderV375!<count?options.stageLeaderV375:undefined;
  const assignedV385=Array.isArray(options.manualSingingSlotsV385)&&options.manualSingingSlotsV385.length>0;
  const role:VocalQualityResultV374["qualityV374"]["role"]=assignedV385?
    (options.manualSingingSlotsV385!.includes(slot)?(options.manualSingingSlotsV385!.length>1?"ensemble":"lead"):"backing"):count<=1?"solo":stageLeadV375!==undefined?(slot===stageLeadV375?"lead":"backing"):mode==="balanced"?"ensemble":
    mode==="call-response"?(word&&slot===word.lineIndex%count?"lead":"backing"):(slot===0?"lead":"backing");
  const result=(cue:CoordinatedVocalCueV372,gestureGain=1,mouthMix=0)=>{
    const naturallyArticulated=applyNaturalVocalArticulationV384(lyrics,{
      ...cue,qualityV374:{role,rapidWord:!!word?.rapid,gestureGain,mouthMix},
    },playing,options);
    const articulated=refineRapArticulationV405(lyrics,naturallyArticulated,playing,options);
    // V415 shifts ONLY the face. The timed text, body pose, and singer assignments
    // continue to use V372's clock. Re-sample through V384/V405 at the mouth clock.
    const offset=rapLipMouthOffsetV415(options);
    let facialCue=articulated;
    if(offset && playing && !options.reducedMotion && lyrics?.synced &&
        articulated.vocal.style==="rap" && articulated.confidence==="word"){
      const shifted=resolveCoordinatedVocalV372(lyrics,ms+offset,playing,options);
      const naturalShift=applyNaturalVocalArticulationV384(lyrics,{...shifted,qualityV374:{role,rapidWord:!!word?.rapid,gestureGain,mouthMix}},playing,options);
      const lipShift=refineRapArticulationV405(lyrics,naturalShift,playing,options);
      facialCue={...articulated,face:lipShift.face,vocal:lipShift.vocal,
        confidence:lipShift.confidence,effectiveTimeMs:lipShift.effectiveTimeMs,
        articulationV384:lipShift.articulationV384,articulationV405:lipShift.articulationV405};
    }
    const precise=refineFastRapMouthV415(lyrics,facialCue,playing,options);
    const syllables=applyRapMouthKeyframesV420(lyrics,refineRapSyllablesV419(lyrics,precise,playing,options),playing,options);
    const audioAware=applyRapAudioV423(lyrics,syllables,playing,options);
    // Preserve V372 song clock and V374 body accents; only face follows mouth offset.
    const merged={...audioAware,body:articulated.body,vocal:articulated.vocal,
      confidence:articulated.confidence,effectiveTimeMs:articulated.effectiveTimeMs,
      articulationV384:articulated.articulationV384,articulationV405:articulated.articulationV405,
      songTimeMs:articulated.songTimeMs,focus:articulated.focus,
      qualityV374:{role,rapidWord:!!word?.rapid,gestureGain,mouthMix}};
    // Authored vocalist assignments mute non-singing avatars' mouth, not their dance clips.
    if(!assignedV385||role!=="backing")return merged;
    return {...merged,face:{...merged.face,jaw:merged.face.jaw*.05,
      wide:merged.face.wide*.05,round:merged.face.round*.05,
      lipsClosed:Math.max(.9,merged.face.lipsClosed)}};
  };
  if(options.qualityEnabledV374===false||!word||!playing||base.face.jaw===0&&base.face.lipsClosed===0)return result(base);
  let face=base.face;
  let mouthMix=0;
  const smoothness=setting(options.mouthSmoothnessV374,65);
  if(smoothness>0&&base.face.lipsClosed<.3){
    const offset=25+smoothness*35;
    const samples=[base.effectiveTimeMs-offset,base.effectiveTimeMs+offset].map(time=>{
      const vocal=resolveVocalPerformanceV368(lyrics,time,true,{
        style:options.style??"auto",genre:options.genre,mode:options.mode??"lyrics",
        mids:options.mids??0,expression:options.expression??.55,avatarSlot:options.avatarSlot??0,
      });
      return vocal.confidence==="word"&&vocal.activeWord===base.vocal.activeWord?resolveFacialPoseV369(vocal,{
        jawFollow:options.jawFollow??65,strength:options.lipStrength??90,
      }):null;
    }).filter((sample):sample is NonNullable<typeof sample>=>!!sample&&sample.lipsClosed<.2);
    if(samples.length){
      mouthMix=.3*smoothness;
      const avg=(part:"jaw"|"wide"|"round")=>samples.reduce((sum,s)=>sum+s[part],0)/samples.length;
      const jaw=clamp(base.face.jaw*(1-mouthMix)+avg("jaw")*mouthMix);
      const round=clamp(base.face.round*(1-mouthMix)+avg("round")*mouthMix);
      const wide=clamp((base.face.wide*(1-mouthMix)+avg("wide")*mouthMix)*(1-round*.4));
      face={...face,jaw:Math.min(jaw,1-base.face.lipsClosed*.88),wide,round,cheek:clamp(face.smile*.42+jaw*.08)};
    }
  }
  let gestureGain=1;
  // Alternate focus words in rapid rap; retain phrase endings and punctuation.
  if(base.body.mode==="rap"&&word.rapid){
    const anchor=word.last||/[!?.,:]$/.test(word.word.text)||word.wordIndex%3===0;
    gestureGain=1-setting(options.rapGestureCalmV374,70)*(anchor?.16:.70);
  }
  if(count>1){
    if(role==="backing")gestureGain*=mode==="call-response"?.42:.52;
    else if(role==="ensemble")gestureGain*=.82;
  }
  const gain=clamp(gestureGain);
  const body={...base.body,leftArm:base.body.leftArm*gain,rightArm:base.body.rightArm*gain,
    chestLean:base.body.chestLean*(.6+.4*gain),headPitch:base.body.headPitch*(.72+.28*gain),
    headTilt:base.body.headTilt*(.8+.2*gain),eyeYaw:base.body.eyeYaw*(role==="backing"?.78:1)};
  if(role==="backing"&&mode==="call-response")face={...face,jaw:face.jaw*.78,wide:face.wide*.85,round:face.round*.85};
  return result({...base,face,body},gain,mouthMix);
}
