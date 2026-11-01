/** V659: an arbitrary installed motion is playable without eagerly decoding the
 * whole library.  The cache is a bounded working set, NOT a catalog limit.
 * Pure planning keeps async loader behavior independent of the UI/React clock.
 */
export type MotionAssetV659 = { id:string; url:string };
export type MotionLoadPlanV659 = { targets:MotionAssetV659[]; pinned:string[] };

export function planMotionPlaybackV659<T extends MotionAssetV659>(
  catalog:readonly T[], requestedId:string|undefined,
  next:readonly MotionAssetV659[], activeId:string|undefined,
  capacity:number,
):MotionLoadPlanV659 {
  const limit=Math.max(1,Math.min(12,Number.isFinite(capacity)?Math.floor(capacity):6));
  const installed=new Map(catalog.filter(m=>!!m.id&&!!m.url).map(m=>[m.id,m]));
  const targets:MotionAssetV659[]=[];
  const seen=new Set<string>();
  // Playback gets first claim on memory. Keep the current clip until the newly
  // selected motion is decoded, then bring in near-future cues as space allows.
  const include=(id:string|undefined,url?:string)=>{
    if(!id||seen.has(id)||targets.length>=limit)return;
    const motion=installed.get(id);
    if(!motion||url!==undefined&&motion.url!==url)return;
    seen.add(id);targets.push({id:motion.id,url:motion.url});
  };
  include(requestedId);
  include(activeId);
  for(const candidate of next)include(candidate.id,candidate.url);
  return {targets,pinned:targets.map(t=>t.id)};
}

/** A not-yet-decoded motion must not stop an already playing valid clip. */
export function keepCurrentMotionWhileLoadingV659(requestedId:string|undefined,loadedIds:readonly string[]):boolean {
  return !!requestedId&&!loadedIds.includes(requestedId);
}
