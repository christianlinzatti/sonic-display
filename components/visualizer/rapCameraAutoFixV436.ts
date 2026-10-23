import type {RapCameraTimelineItemV431} from "./rapCameraTimelineV431";
import type {RapCameraOverrideV430} from "./rapCameraShotStudioV430";
import {normalizeRapCameraOverridesV430} from "./rapCameraShotStudioV430";
import {normalizeRapCameraKeyframesV432} from "./rapCameraKeyframesV432";
import type {RapCameraPreviewSettingsV434} from "./rapCameraTransitionPreviewV434";
import {inspectRapCameraTransitionV435} from "./rapCameraQualityOptimizerV435";

export type RapCameraAutoFixReasonV436="short-line"|"rapid-cut";
export type RapCameraAutoFixChangeV436={
  lineIndex:number;startMs:number;previousShot:string;shot:RapCameraOverrideV430["shot"];
  reason:RapCameraAutoFixReasonV436;text:string;
};
export type RapCameraAutoFixPlanV436={
  available:boolean;trackId:string;analyzed:number;eligible:number;protectedLines:number;
  overrides:RapCameraOverrideV430[];changes:RapCameraAutoFixChangeV436[];
  settings:RapCameraPreviewSettingsV434;baseline:RapCameraPreviewSettingsV434;
  scoreBefore:number|null;scoreAfter:number|null;sampledTransitions:number;
};
const changed=(a:RapCameraTimelineItemV431,b:RapCameraTimelineItemV431)=>
  a.shot!==b.shot||a.leadSlot!==b.leadSlot;
const valid=(v:RapCameraTimelineItemV431)=>v.eligible&&v.shot!=="none"&&
  Number.isFinite(v.startMs)&&Number.isFinite(v.endMs)&&v.endMs>v.startMs;
const empty=(trackId:string,base:RapCameraPreviewSettingsV434):RapCameraAutoFixPlanV436=>({
  available:false,trackId,analyzed:0,eligible:0,protectedLines:0,overrides:[],changes:[],
  settings:{...base},baseline:{...base},scoreBefore:null,scoreAfter:null,sampledTransitions:0,
});
const lineWithFix=(item:RapCameraTimelineItemV431,override?:RapCameraOverrideV430):RapCameraTimelineItemV431=>
  override?{...item,shot:override.shot==="off"?"none":override.shot,
    strength:override.strength}:item;

/** Stateless, bounded, deterministic song-level planning. Does not save settings or touch playback.
 * Manual V430 choices and V432 poses are never included in generated fixes.
 * Historical kick events and real visual occlusion cannot be inferred from lyrics. */
export function planRapCameraAutoFixV436(input:{
  trackId:string;items:readonly RapCameraTimelineItemV431[];manualOverrides?:unknown;
  keyframes?:unknown;settings:RapCameraPreviewSettingsV434;bpm?:number|null;
  duo?:boolean;lyricsProtected?:boolean;strength?:number;
}):RapCameraAutoFixPlanV436{
  const trackId=typeof input.trackId==="string"?input.trackId:"";
  const base:RapCameraPreviewSettingsV434={smoothness:Math.max(0,Math.min(100,
    Math.round((Number.isFinite(input.settings.smoothness)?input.settings.smoothness:55)/5)*5)),
    beatSync:input.settings.beatSync!==false};
  const result=empty(trackId,base);
  if(!trackId||trackId.length>180||["__proto__","constructor","prototype"].includes(trackId)||
    !Array.isArray(input.items)||!input.items.length)return result;
  const items=input.items.slice(0,5000);
  const manual=new Set(normalizeRapCameraOverridesV430(input.manualOverrides).map(v=>v.lineIndex));
  const authoredFrames=new Set(normalizeRapCameraKeyframesV432(input.keyframes).map(v=>v.lineIndex));
  const protectedLines=new Set([...manual,...authoredFrames]);
  const changes:RapCameraAutoFixChangeV436[]=[];
  const fixes:RapCameraOverrideV430[]=[];
  const adjusted:RapCameraTimelineItemV431[]=[];
  const recent:number[]=[];
  let previous:RapCameraTimelineItemV431|null=null,eligible=0,protectedCount=0;
  for(const item of items){
    result.analyzed++;
    if(!valid(item)){adjusted.push(item);previous=null;recent.length=0;continue;}
    eligible++;
    const guarded=protectedLines.has(item.lineIndex)||item.override!==null;
    if(guarded)protectedCount++;
    while(recent.length&&item.startMs-recent[0]>3800)recent.shift();
    const isChange=!!previous&&changed(previous,item);
    if(isChange)recent.push(item.startMs);
    const shortLine=item.durationMs<850;
    const denseCuts=recent.length>=3&&item.durationMs<1450;
    // Hooks are intentional highlights. Never erase them, nor transitions touching
    // explicit human choices or authored V432 camera poses.
    const preserve=guarded||!previous||!isChange||item.shot==="hook-push"||
      previous.shot==="none"||previous.shot==="hook-push"||
      protectedLines.has(previous.lineIndex)||previous.override!==null;
    if(!preserve&&(shortLine||denseCuts)&&fixes.length<128){
      const shot=previous!.shot as RapCameraOverrideV430["shot"];
      const fix={lineIndex:item.lineIndex,shot,strength:100};
      fixes.push(fix);
      changes.push({lineIndex:item.lineIndex,startMs:item.startMs,
        previousShot:item.shot,shot,reason:shortLine?"short-line":"rapid-cut",text:item.text});
      adjusted.push(lineWithFix(item,fix));
      // A fixed shot no longer constitutes a cut; remove its marker.
      recent.pop();
    } else adjusted.push(item);
    previous=adjusted[adjusted.length-1];
  }
  result.available=eligible>0;
  result.eligible=eligible;
  result.protectedLines=protectedCount;
  result.overrides=fixes;
  result.changes=changes;
  if(!result.available)return result;
  // Stratified, small sample; no O(song_length * candidate_count) per playback tick.
  // Evaluate the same lyrics segment for every profile for a fair A/B score.
  const pairs:{index:number;before:RapCameraTimelineItemV431;after:RapCameraTimelineItemV431;
    priorBefore:RapCameraTimelineItemV431|null;priorAfter:RapCameraTimelineItemV431|null}[]=[];
  for(let i=1;i<items.length;i++){
    if(valid(items[i])&&valid(items[i-1])&&changed(items[i-1],items[i])){
      pairs.push({index:i,before:items[i],after:adjusted[i],priorBefore:items[i-1],priorAfter:adjusted[i-1]});
    }
  }
  const n=Math.min(16,pairs.length);
  const samples=Array.from({length:n},(_,i)=>pairs[Math.floor(i*pairs.length/n)]);
  result.sampledTransitions=n;
  if(!n)return result;
  const evaluate=(settings:RapCameraPreviewSettingsV434,after:boolean)=>{
    let total=0,count=0;
    for(const pair of samples){
      const current=after?pair.after:pair.before;
      const previous=after?pair.priorAfter:pair.priorBefore;
      if(!previous)continue;
      const history=(after?adjusted:items).slice(Math.max(0,pair.index-12),pair.index+1);
      const report=inspectRapCameraTransitionV435({trackId,current,previous,history,settings,
        bpm:input.bpm,duo:input.duo,lyricsProtected:input.lyricsProtected,
        strength:input.strength},settings);
      // A successfully held shot has no moving camera; count it as a stable frame.
      const score=report.score??(valid(current)&&!changed(previous,current)?100:null);
      if(score!==null){total+=score;count++;}
    }
    return count?Math.round(total/count):null;
  };
  result.scoreBefore=evaluate(base,false);
  let best=base;
  let bestScore=evaluate(best,true);
  let smallestChange=Infinity;
  for(const smoothness of [20,30,40,50,60,75,90,base.smoothness]){
    for(const beatSync of [base.beatSync,!base.beatSync]){
      const settings={smoothness,beatSync};
      const score=evaluate(settings,true);
      const cost=Math.abs(smoothness-base.smoothness)+(beatSync!==base.beatSync?20:0);
      if(score!==null&&(bestScore===null||score>bestScore||score===bestScore&&cost<smallestChange)){
        bestScore=score;best=settings;smallestChange=cost;
      }
    }
  }
  result.settings=best;
  result.scoreAfter=bestScore;
  return result;
}

/** Automatic suggestions are placed before manual V430 edits (last edit wins).
 * One can disable the feature to recover exactly the stored V430 state. */
export function combineRapCameraAutoFixV436(
  automatic:readonly RapCameraOverrideV430[],manual:unknown,
):RapCameraOverrideV430[]{
  const saved=normalizeRapCameraOverridesV430(manual);
  const keys=new Set(saved.map(v=>v.lineIndex));
  return [...normalizeRapCameraOverridesV430(automatic).filter(v=>!keys.has(v.lineIndex)),...saved];
}
