import type {Lyrics} from "@/types/music";
import {rapLipWordAtV415,rapLipMouthOffsetV415} from "./rapLipPrecisionV415";
import {resolveVocalPerformanceQualityV374,type VocalQualityOptionsV374} from "./vocalPerformanceQualityV374";
import {rapWordKeyV420,type RapMouthDocumentV420} from "./rapSyllableKeyframesV420";

/** A/B comparison of two PREDICTED mouth poses, not an audio-verified accuracy score. */
export type RapMouthPoseV421={jaw:number;wide:number;round:number;lipsClosed:number};
export type RapMouthPairV421={timeMs:number;phase:number;automatic:RapMouthPoseV421;corrected:RapMouthPoseV421;delta:Pick<RapMouthPoseV421,"jaw"|"wide"|"round">};
export type RapMouthComparisonV421={points:RapMouthPairV421[];averageChange:number;maximumChange:number;validSamples:number};
export type RapWordSelectionV421={startMs:number;endMs:number;text:string};
export type RapComparisonOptionsV421=VocalQualityOptionsV374&{
 rapSyllableTrackIdV420:string;
 rapSyllableDocumentV420:RapMouthDocumentV420;
};
const clamp=(n:number,a=0,b=1)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const pickPose=(face:RapMouthPoseV421):RapMouthPoseV421=>({jaw:clamp(face.jaw),wide:clamp(face.wide),round:clamp(face.round),lipsClosed:clamp(face.lipsClosed)});
/** The same resolver and clock are used for both sides. No live settings are mutated. */
export function sampleRapArticulationPairV421(lyrics:Lyrics|null,word:RapWordSelectionV421,ms:number,options:RapComparisonOptionsV421):RapMouthPairV421|null{
 if(!lyrics?.synced||!options.rapSyllableTrackIdV420||options.rapSyllableDocumentV420?.trackId!==options.rapSyllableTrackIdV420 ||
   !Number.isFinite(word.startMs)||!Number.isFinite(word.endMs)||word.endMs<=word.startMs ||
   !Number.isFinite(ms)||ms<word.startMs||ms>=word.endMs)return null;
 const mouthOffset=rapLipMouthOffsetV415(options);
 // Match the selected word at the effective mouth clock, including any V415/V418 offset.
 const at=rapLipWordAtV415(lyrics,ms+mouthOffset);
 if(!at||at.start!==word.startMs||rapWordKeyV420(at.word.text)!==rapWordKeyV420(word.text))return null;
 const common={...options,rapSyllableEnabledV419:true,style:"rap" as const};
 const automatic=resolveVocalPerformanceQualityV374(lyrics,ms,true,{...common,rapSyllableEditsEnabledV420:false});
 if(!automatic.rapSyllableV419.active||automatic.confidence!=="word")return null;
 const corrected=resolveVocalPerformanceQualityV374(lyrics,ms,true,{...common,rapSyllableEditsEnabledV420:true});
 const a=pickPose(automatic.face),b=pickPose(corrected.face);
 const delta={jaw:b.jaw-a.jaw,wide:b.wide-a.wide,round:b.round-a.round};
 return {timeMs:ms,phase:clamp((ms-word.startMs)/(word.endMs-word.startMs)),automatic:a,corrected:b,delta};
}
export function compareRapArticulationWordV421(lyrics:Lyrics|null,word:RapWordSelectionV421,options:RapComparisonOptionsV421,steps=21):RapMouthComparisonV421{
 if(!Number.isFinite(steps))steps=21;
 const count=Math.max(2,Math.min(49,Math.round(steps)));
 const points:RapMouthPairV421[]=[];
 for(let i=0;i<count;i++){
  const ms=word.startMs+Math.floor((word.endMs-word.startMs-1)*i/(count-1));
  const pair=sampleRapArticulationPairV421(lyrics,word,ms,options);
  if(pair)points.push(pair);
 }
 let total=0,peak=0;
 for(const item of points){const change=(Math.abs(item.delta.jaw)+Math.abs(item.delta.wide)+Math.abs(item.delta.round))/3;
  total+=change;peak=Math.max(peak,change);}
 return {points,averageChange:points.length?total/points.length:0,maximumChange:peak,validSamples:points.length};
}
