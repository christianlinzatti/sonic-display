// Structural contracts keep this planner small and independently type-checkable.
type FeatureTrackV440={artists?:string[];artistDetails?:Array<{name:string}>};
type FeatureLyricsV440={synced:boolean;lines:Array<{startMs:number}>};
import type {MotionSceneV438} from "./automaticMotionIntelligenceV438";

export type StageModeV440="solo"|"sync"|"mirror"|"duet";
export interface FeatureCastV440{
  enabled:boolean;feature:boolean;artists:string[];visibleCount:1|2;
  mode:StageModeV440;source:"spotify-artists"|"single-artist"|"manual-mode"|"disabled";
}
export interface FeatureChoreoCueV440{
  scene:MotionSceneV438;primaryScene:MotionSceneV438;secondaryScene:MotionSceneV438;
  focusSlot:0|1;phrase:number;eventKey:string;feature:boolean;
}

/** Artist credits identify contributors, NOT which voice performs a particular lyric. */
export function planFeatureCastV440(input:{track:FeatureTrackV440|null|undefined;enabled:boolean;mode:StageModeV440;
  avatarStage:boolean;reducedMotion:boolean}):FeatureCastV440{
  const manual=input.mode!=="solo";
  const credits=(input.track?.artistDetails?.length?input.track.artistDetails.map(a=>a.name):input.track?.artists??[])
    .filter((n):n is string=>typeof n==="string"&&!!n.trim()&&n.length<140);
  const artists=Array.from(new Map(credits.map(name=>[name.trim().toLocaleLowerCase(),name.trim()])).values()).slice(0,12);
  const feature=artists.length>=2;
  if(manual)return {enabled:false,feature,artists,visibleCount:2,mode:input.mode,source:"manual-mode"};
  if(!input.enabled||!input.avatarStage||input.reducedMotion)return {enabled:false,feature,artists,visibleCount:1,mode:"solo",source:"disabled"};
  if(!feature)return {enabled:false,feature:false,artists,visibleCount:1,mode:"solo",source:"single-artist"};
  return {enabled:true,feature:true,artists,visibleCount:2,mode:"duet",source:"spotify-artists"};
}

/** Only visual phrasing: the alternating spotlight never asserts a recognized singer. */
export function featureChoreoCueV440(input:{cast:FeatureCastV440;lyrics:FeatureLyricsV440|null|undefined;
  progressMs:number;scene?:MotionSceneV438;phraseSlot?:number;playing:boolean}):FeatureChoreoCueV440{
  const ms=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
  let phrase=Number.isFinite(input.phraseSlot)&&input.phraseSlot!>=0?Math.floor(input.phraseSlot!):Math.floor(ms/12000);
  if(input.lyrics?.synced&&input.lyrics.lines.length){
    const lines=input.lyrics.lines;
    let low=0,high=Math.min(lines.length,5000)-1,index=-1;
    while(low<=high){const mid=(low+high)>>1; if(lines[mid].startMs<=ms){index=mid;low=mid+1;}else high=mid-1;}
    if(index>=0&&(!Number.isFinite(input.phraseSlot)||input.phraseSlot===undefined))phrase=Math.floor(index/4);
  }
  const scene=input.scene??"verse";
  const focusSlot:0|1= input.cast.enabled&&phrase%2===1?1:0;
  const primaryScene:MotionSceneV438= !input.cast.enabled?scene:
    scene==="hook"||scene==="duet"?scene:focusSlot===0?scene:"break";
  const secondaryScene:MotionSceneV438= !input.cast.enabled?scene:
    scene==="hook"?"hook":scene==="duet"?"duet":focusSlot===1?scene:"break";
  return {scene,primaryScene,secondaryScene,focusSlot,phrase,eventKey:`${phrase}:${scene}:${focusSlot}`,feature:input.cast.enabled};
}

/** Inferred camera staging only. Assignments represent visual shot targets, never voices. */
export function featureCameraAssignmentsV440<T extends {fromLine:number;toLine:number;leadSlot:number;
  partnerSlot:number;style:string;strength:number}>(existing:readonly T[],lyrics:FeatureLyricsV440|null|undefined):T[]{
  if(!lyrics?.synced||!lyrics.lines?.length||!existing.length)return [...existing];
  const max=Math.min(lyrics.lines.length,5000);
  // Keep generic hook ranges LAST, so they override the automatic verse spotlight.
  const hooks=existing.filter(item=>item.style==="hook");
  const ordinary=existing.filter(item=>item.style!=="hook");
  const inserts:T[]=[];
  for(let i=0;i<max&&inserts.length<Math.min(110,Math.max(0,150-ordinary.length-hooks.length));i+=4){
    const lead=(Math.floor(i/4)%2) as 0|1;
    inserts.push({fromLine:i,toLine:Math.min(max-1,i+3),leadSlot:lead,
      partnerSlot:1-lead,style:"solo",strength:65} as T);
  }
  return [...ordinary,...inserts,...hooks].slice(0,150);
}
