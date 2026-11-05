/** V986: optional virtual LIGHTING cues ONLY at verified V604/V763 boundaries.
 * Existing V354 score remains sole live authority, manual clips win conflicts.
 */
import {normalizeAtmospherePlanV986,type AtmospherePlanV986} from './aiAtmosphereDesignerV986';
import {verifiedConcertSnapshotV985} from './predictiveShowTimelineV985';
import type {ConcertTimelineSnapshotV763} from '../components/visualizer/concertTimelineBridgeV763';
import {sanitizeTimelineV354,type ShowTimelineV354,type ShowClipV354} from
 '../services/stageContent/showTimelineV354';

export interface AtmosphereCueV986 {clip:ShowClipV354;actIndex:number;section:string}
const conflict=(a:ShowClipV354,b:ShowClipV354)=>a.id===b.id||
 a.lane===b.lane&&a.startMs<b.startMs+b.durationMs&&b.startMs<a.startMs+a.durationMs;
export function proposeAtmosphereCuesV986(snapshot:ConcertTimelineSnapshotV763|null,
 plan:AtmospherePlanV986,trackId:string,durationMs:number):AtmosphereCueV986[]{
 const safe=normalizeAtmospherePlanV986(plan);
 if(!safe||!verifiedConcertSnapshotV985(snapshot,trackId,durationMs))return [];
 const cues:AtmosphereCueV986[]=[];
 for(const scene of snapshot!.scenes){
  if(cues.length>=80)break;
  const actIndex=Math.min(4,Math.floor(scene.startMs/durationMs*5));
  const act=safe.acts[actIndex];
  const length=Math.min(7000,scene.endMs-scene.startMs,durationMs-scene.startMs);
  if(length<250)continue;
  // Gentle virtual brightness gain, not physical lamp brightness.
  const value=Number(Math.min(1.25,Math.max(.65,.65+act.virtualLight/110)).toFixed(2));
  cues.push({clip:{id:`v986-${scene.index}-lighting`,lane:'lighting',
   startMs:scene.startMs,durationMs:Math.floor(length),value,
   label:`V986 ${scene.section} · Lichtakt ${actIndex+1}`},
   section:scene.section,actIndex});
 }
 return cues;
}
export function importAtmosphereCuesV986(score:ShowTimelineV354,
 snapshot:ConcertTimelineSnapshotV763|null,plan:AtmospherePlanV986,
 selected:readonly string[]):{score:ShowTimelineV354;added:number;conflicts:number;invalid:number}{
 const clean=sanitizeTimelineV354(score);
 if(selected.length>80||selected.some(x=>typeof x!=='string'||x.length>36)||
  !clean.trackId||!verifiedConcertSnapshotV985(snapshot,clean.trackId,clean.durationMs))
  return {score:clean,added:0,conflicts:0,invalid:selected.length};
 const proposals=proposeAtmosphereCuesV986(snapshot,plan,clean.trackId,clean.durationMs);
 const byId=new Map(proposals.map(x=>[x.clip.id,x.clip]));
 const clips=[...clean.clips];let added=0,conflicts=0,invalid=0;
 for(const id of new Set(selected)){
  const clip=byId.get(id);
  if(!clip){invalid++;continue;}
  if(clips.length>=400||clips.some(existing=>conflict(existing,clip))){conflicts++;continue;}
  clips.push(clip);added++;
 }
 return {score:sanitizeTimelineV354({...clean,clips}),added,conflicts,invalid};
}
