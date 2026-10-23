/** Pure V317 utilities: select real GLB source and deterministic A/B clip timing.
 * Both stages sample the same source clock; preview never mutates the asset. */
import type {InstalledCharacterMotion} from './characterMotionLibrary';

export type MotionSourceV317={id:string;name:string;url:string|null;kind:'embedded'|'installed'|'default'};
export type MotionClipInfoV317={id:string;name:string;duration:number};
const finite=(v:number,fallback:number)=>Number.isFinite(v)?v:fallback;
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,finite(v,min)));
export function comparisonMotionSourcesV317(avatarId:string,animationUrl:string|undefined,motions:readonly InstalledCharacterMotion[]):MotionSourceV317[]{
  const sources:MotionSourceV317[]=[{id:'embedded',name:'Eingebettete GLB-Clips',url:null,kind:'embedded'}];
  const seen=new Set<string>();
  if(animationUrl){sources.push({id:'default',name:'Standard-Animation des Avatars',url:animationUrl,kind:'default'});seen.add(animationUrl);}
  for(const item of motions){
    if(item.avatarId!==avatarId||!item.url||seen.has(item.url))continue;
    if(!(/^(https:\/\/|\/(?!\/))/.test(item.url)))continue;
    sources.push({id:`installed:${item.id}`,name:item.name,url:item.url,kind:'installed'});
    seen.add(item.url);
  }
  return sources;
}
export function validComparisonClipsV317(clips:readonly MotionClipInfoV317[]):MotionClipInfoV317[]{
  return clips.filter(c=>!!c.id&&!!c.name&&Number.isFinite(c.duration)&&c.duration>.05&&c.duration<3600);
}
export function clipTimeV317(seconds:number,duration:number,speed=1):number{
  if(!(duration>.05)||!Number.isFinite(duration))return 0;
  const t=Math.max(0,finite(seconds,0))*clamp(speed,.25,2);
  return (t%duration+duration)%duration;
}
export type ClipBlendV317={primaryTime:number;secondaryTime:number;primaryWeight:number;secondaryWeight:number;phase:'solo-primary'|'to-secondary'|'solo-secondary'|'to-primary'};
/** Alternating loop with symmetric fades. At the loop boundary A starts with
 * the same pose/time as at the end of B->A crossfade. */
export function clipBlendV317(seconds:number,durationA:number,durationB:number,transition:number,speed=1):ClipBlendV317{
  const a=Math.max(.1,finite(durationA,1)),b=Math.max(.1,finite(durationB,1));
  // Fixed overlap window independent of user settings keeps authored clip
  // timelines IDENTICAL in A and B; polish only changes blending weights.
  const anchor=Math.min(1.05,Math.min(a,b)*.4);
  const fade=clamp(transition,0,anchor);
  if(!(durationB>.05)||anchor<.02)return {primaryTime:clipTimeV317(seconds,a,speed),secondaryTime:0,primaryWeight:1,secondaryWeight:0,phase:'solo-primary'};
  const period=a+b-2*anchor;
  const t=clipTimeV317(seconds,period,speed);
  const progress=(offset:number)=>fade<.02?Number(offset>=anchor):clamp((offset-(anchor-fade))/fade,0,1);
  // The next cycle begins with A already `anchor` into its clip because the
  // B->A overlap began that earlier. This avoids restarting the pose at zero.
  if(t<a-2*anchor)return {primaryTime:t+anchor,secondaryTime:0,primaryWeight:1,secondaryWeight:0,phase:'solo-primary'};
  if(t<a-anchor){const w=progress(t-(a-2*anchor));
    return {primaryTime:t+anchor,secondaryTime:t-(a-2*anchor),primaryWeight:1-w,secondaryWeight:w,phase:'to-secondary'};}
  if(t<a+b-3*anchor)return {primaryTime:0,secondaryTime:t-(a-2*anchor),primaryWeight:0,secondaryWeight:1,phase:'solo-secondary'};
  const w=progress(t-(a+b-3*anchor));
  return {primaryTime:t-(a+b-3*anchor),secondaryTime:t-(a-2*anchor),primaryWeight:w,secondaryWeight:1-w,phase:'to-primary'};
}
export function fadeSecondsV317(durationA:number,durationB:number,transitionPolish:number):number{
  const min=Math.min(finite(durationA,0),finite(durationB,0));
  return min>.2?clamp(.12+(clamp(transitionPolish,0,100)/100)*.75,.08,Math.min(1.05,min*.4)):0;
}
/** Conservative, heuristic foot contact based on world-space motion and the
 * lowest seen foot position; returns false until enough samples exist. */
export function plantedFootV317(y:number,previousY:number|null,minY:number,dt:number):boolean{
  if(!Number.isFinite(y)||previousY===null||!Number.isFinite(minY)||dt<=0)return false;
  const speed=Math.abs(y-previousY)/Math.max(.016,dt);
  return y-minY<.13&&speed<.23;
}
