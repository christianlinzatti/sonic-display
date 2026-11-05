/** V985 – Predictive Show Timeline.
 * A narrative can colour an EXISTING confirmed scene schedule, never supply timing.
 * Imported clips start at the confirmed time, not at the anticipation preview time.
 * V354 remains the sole playback authority. No physical light / hardware commands.
 */
import {normalizeConcertStoryV984,type ConcertStoryV984} from './aiConcertStoryV984';
import type {ConcertTimelineSnapshotV763} from '../components/visualizer/concertTimelineBridgeV763';
import {sanitizeTimelineV354,type ShowClipV354,type ShowTimelineV354,type ShowLaneV354} from '../services/stageContent/showTimelineV354';

export type ProposedCueV985={clip:ShowClipV354;section:string;reason:string;storyAct:number};
export type TimelinePreviewV985={state:'no-evidence'|'paused'|'idle'|'upcoming'|'live';
 next:ProposedCueV985|null;secondsUntil:number|null};
const ALLOWED_SECTIONS=new Set(['verse','hook','build','drop','break']);
const ALLOWED_INTENTS=new Set(['portrait','dialogue','ensemble','wide','rise','pulse','breath']);
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const overlap=(a:Pick<ShowClipV354,'startMs'|'durationMs'>,b:Pick<ShowClipV354,'startMs'|'durationMs'>)=>
 a.startMs<b.startMs+b.durationMs&&b.startMs<a.startMs+a.durationMs;
export function verifiedConcertSnapshotV985(raw:ConcertTimelineSnapshotV763|null,trackId:string,durationMs:number):boolean{
 if(!raw||raw.source!=='verified-v604'||raw.trackId!==trackId||!trackId||trackId.length>160||
  !Number.isInteger(durationMs)||durationMs<10000||durationMs>1800000||raw.durationMs!==durationMs||
  !Array.isArray(raw.scenes)||raw.scenes.length<1||raw.scenes.length>480)return false;
 let last=0;
 for(let i=0;i<raw.scenes.length;i++){
  const s=raw.scenes[i];
  if(!s||s.index!==i||!Number.isInteger(s.actIndex)||s.actIndex<0||s.actIndex>479||
   !ALLOWED_SECTIONS.has(s.section)||!ALLOWED_INTENTS.has(s.intent)||
   !num(s.startMs)||!num(s.endMs)||!Number.isInteger(s.startMs)||!Number.isInteger(s.endMs)||
   s.startMs<last||s.endMs<=s.startMs||s.endMs>durationMs)return false;
  last=s.endMs;
 }
 return true;
}
const cameraFor=(intent:string,section:string):'wide'|'medium'|'close'|'orbit'=>
 intent==='portrait'?'close':intent==='dialogue'?'medium':
 section==='drop'||section==='hook'||intent==='ensemble'?'wide':'medium';
const lanes:readonly ShowLaneV354[]=['camera','lighting','dance','effects'];
/** At most 96 timed suggestions, on real V604 scene boundaries. The V984 act
 * index follows relative song position as a visual motif, NOT a claim that
 * a scene is truly an intro/verse/hook/drop/finale. */
export function proposePredictiveCuesV985(snapshot:ConcertTimelineSnapshotV763|null,
 story:ConcertStoryV984,trackId:string,durationMs:number):ProposedCueV985[]{
 if(!verifiedConcertSnapshotV985(snapshot,trackId,durationMs))return [];
 const safeStory=normalizeConcertStoryV984(story);if(!safeStory)return [];
 const cues:ProposedCueV985[]=[];
 for(const scene of snapshot!.scenes){
  if(cues.length>=96)break;
  const visualAct=Math.min(4,Math.floor(scene.startMs/durationMs*5));
  const energy=safeStory.acts[visualAct].energy;
  const length=Math.min(7000,scene.endMs-scene.startMs,durationMs-scene.startMs);
  if(length<250)continue;
  const base={startMs:scene.startMs,durationMs:Math.floor(length)};
  const choices:{lane:ShowLaneV354;value:string|number;reason:string}[]=[
   {lane:'camera',value:cameraFor(scene.intent,scene.section),reason:'Kamera auf bestätigter Szenengrenze'},
   {lane:'lighting',value:Number(Math.max(.65,Math.min(1.35,.65+energy/100)).toFixed(2)),reason:'Virtuelle Lichtdynamik aus Story-Energie'},
  ];
  if(scene.section==='hook'&&scene.intent==='ensemble')choices.push(
   {lane:'dance',value:'sync',reason:'Gruppenformation nur bei bestätigter Hook und Ensemble'});
  if(scene.section==='drop'&&scene.intent==='pulse')choices.push(
   {lane:'effects',value:Number(Math.min(1.25,.65+energy/110).toFixed(2)),reason:'Begrenzter virtueller Effekt bei bestätigtem Drop'});
  for(const candidate of choices){
   if(cues.length>=96)break;
   if(!lanes.includes(candidate.lane))continue;
   cues.push({clip:{id:`v985-${scene.index}-${candidate.lane}`,
    lane:candidate.lane,...base,value:candidate.value,
    label:`V985 ${scene.section} · Akt ${visualAct+1}`},
    section:scene.section,storyAct:visualAct+1,reason:candidate.reason});
  }
 }
 return cues;
}
/** Preview-only pre-roll: it may alert the user 2 seconds ahead, but never
 * moves cue timestamps, calls APIs or causes effects. Deterministic for seeks. */
export function previewPredictiveCuesV985(cues:readonly ProposedCueV985[],progressMs:number,
 playing:boolean,evidenceValid:boolean):TimelinePreviewV985{
 if(!evidenceValid)return {state:'no-evidence',next:null,secondsUntil:null};
 if(!playing||!num(progressMs))return {state:'paused',next:null,secondsUntil:null};
 const sorted=[...cues].sort((a,b)=>a.clip.startMs-b.clip.startMs||a.clip.id.localeCompare(b.clip.id));
 const current=sorted.find(x=>x.clip.startMs<=progressMs&&progressMs<x.clip.startMs+x.clip.durationMs);
 if(current)return {state:'live',next:current,secondsUntil:0};
 const next=sorted.find(x=>x.clip.startMs>progressMs)??null;
 if(!next)return {state:'idle',next:null,secondsUntil:null};
 const remaining=(next.clip.startMs-progressMs)/1000;
 return {state:remaining<=2?'upcoming':'idle',next,secondsUntil:Number(remaining.toFixed(1))};
}
export type ImportPredictiveResultV985={score:ShowTimelineV354;added:number;conflicts:number;invalid:number};
/** Explicitly approved, track-exact, no overwrite, no activation toggle.
 * Validate against the current confirmed bridge again before committing. */
export function importPredictiveCuesV985(score:ShowTimelineV354,snapshot:ConcertTimelineSnapshotV763|null,
 story:ConcertStoryV984,selected:readonly string[]):ImportPredictiveResultV985{
 const clean=sanitizeTimelineV354(score);
 if(!verifiedConcertSnapshotV985(snapshot,clean.trackId,clean.durationMs)||selected.length>96||
  selected.some(id=>typeof id!=='string'||id.length>36))return {score:clean,added:0,conflicts:0,invalid:selected.length};
 const proposal=proposePredictiveCuesV985(snapshot,story,clean.trackId,clean.durationMs);
 const byId=new Map(proposal.map(x=>[x.clip.id,x.clip]));
 const next=[...clean.clips];let added=0,conflicts=0,invalid=0;
 for(const id of new Set(selected)){
  const candidate=byId.get(id);
  if(!candidate){invalid++;continue;}
  if(next.length>=400||next.some(x=>x.id===candidate.id||x.lane===candidate.lane&&overlap(x,candidate))){conflicts++;continue;}
  next.push(candidate);added++;
 }
 return {score:sanitizeTimelineV354({...clean,clips:next}),added,conflicts,invalid};
}
