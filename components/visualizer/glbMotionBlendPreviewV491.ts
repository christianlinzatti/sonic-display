/** V491: non-destructive, preview-only mixing of two already installed GLB clips.
 * No root, hip, leg, foot, hand/finger, neck, head, face or translation channels.
 * Never mutate the source clips; callers clone the selected tracks. */
import {safeUpperGestureTrackV490} from './automaticGlbUpperBlendV490';

export type PreviewBlendRegionV491='arms'|'upper';
export type PreviewBlendPlanV491={enabled:boolean;sourceId:string;weight:number;region:PreviewBlendRegionV491};

export const previewBlendRegionsV491:ReadonlyArray<{value:PreviewBlendRegionV491;label:string}>= [
  {value:'arms',label:'Arme & Schultern'},
  {value:'upper',label:'Arme, Schultern & Brust'},
];

export function isPreviewBlendTrackV491(trackName:string,region:PreviewBlendRegionV491):boolean{
  if(!safeUpperGestureTrackV490(trackName))return false;
  if(region==='upper')return true;
  const joint=(trackName.split('.')[0].split(/[\\/|]/).pop()||'').toLowerCase();
  return /arm|shoulder|clavicle|collar/.test(joint);
}

export function previewBlendWeightV491(value:number):number{
  return Number.isFinite(value)?Math.min(.5,Math.max(0,value)):0;
}

/** A preview mix is valid only when distinct source clips are present and there
 * are actual safe rotation tracks to animate. Missing clips fail closed. */
export function resolvePreviewBlendV491<T extends {id:string;clip:{duration:number;tracks:readonly {name:string}[]}}>(
  clips:readonly T[],baseId:string,plan:PreviewBlendPlanV491,reducedMotion=false
):{clip:T;weight:number;trackNames:string[]}|null{
  if(!plan.enabled||reducedMotion||!plan.sourceId||baseId===plan.sourceId)return null;
  const base=clips.find(c=>c.id===baseId)??clips[0];
  const source=clips.find(c=>c.id===plan.sourceId);
  if(!base||!source||base.id===source.id||!Number.isFinite(source.clip.duration)||source.clip.duration<=0)return null;
  const names=source.clip.tracks.map(t=>t.name).filter(n=>isPreviewBlendTrackV491(n,plan.region));
  const weight=previewBlendWeightV491(plan.weight);
  return names.length&&weight>0?{clip:source,weight,trackNames:names}:null;
}
