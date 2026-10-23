/** V446 Smart Automatic Rap Show.
 * A small, deterministic *visual* stage score based on timed lyrics and tempo.
 * It does not read Spotify audio, identify voices, or modify saved choreographies.
 */
import {layoutV326,type GroupFormationV326,type GroupStudioV326,type GroupCueV326} from './multiAvatarStageDirectorV326';
import type {MotionSceneV438} from './automaticMotionIntelligenceV438';

export type ShowSectionV446='intro'|'verse'|'hook'|'outro';
export interface ShowBeatV446 {
  id:string;atMs:number;untilMs:number;lineFrom:number;lineTo:number;
  section:ShowSectionV446;focus:number;formation:GroupFormationV326;
}
export interface SmartShowPlanV446 {
  trackId:string;count:1|2|3|4;source:'synced-lyrics'|'tempo'|'none';beats:ShowBeatV446[];
}
export interface SmartShowCueV446 {
  active:boolean;section:ShowSectionV446;focus:number;group:boolean;
  phrase:number;eventId:string;motionScene:MotionSceneV438;
}
const finite=(v:number|undefined|null,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?v:fallback;
const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
const normalize=(value:string)=>value.toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export interface SmartShowLyricsV446 {synced:boolean;lines:readonly {startMs:number;text?:string}[]}

/** A repeated *pair* of substantial lines is a conservative hook candidate, not proof. */
function repeatedHookLines(lines:readonly {startMs:number;text?:string}[]):Set<number>{
  const keys=lines.map(line=>normalize(typeof line.text==='string'?line.text:''));
  const positions=new Map<string,number[]>();
  for(let i=0;i<keys.length;i++)if(keys[i].length>=12){
    const found=positions.get(keys[i])??[];
    if(found.length<24)found.push(i);
    positions.set(keys[i],found);
  }
  const match=keys.map((text,i)=>text.length>=12&&Boolean(positions.get(text)?.some(j=>Math.abs(j-i)>=4)));
  const hooks=new Set<number>();
  for(let i=0;i<match.length;i++)if(match[i]&&(match[i-1]||match[i+1]))hooks.add(i);
  return hooks;
}

export function buildSmartRapShowV446(input:{trackId:string;count:number;lyrics?:SmartShowLyricsV446|null;
  bpm?:number|null;durationMs?:number|null;enabled?:boolean}):SmartShowPlanV446{
  const trackId=typeof input.trackId==='string'?input.trackId.slice(0,200):'';
  const count=clamp(Math.trunc(finite(input.count,1)),1,4) as 1|2|3|4;
  const blank:SmartShowPlanV446={trackId,count,source:'none',beats:[]};
  if(!input.enabled||!trackId)return blank;
  const duration=clamp(finite(input.durationMs,0),0,3600000);
  const valid=(input.lyrics?.synced?input.lyrics.lines:[]).slice(0,5000)
    .filter(line=>Number.isFinite(line.startMs)&&line.startMs>=0&&line.startMs<=3600000);
  // Do not use unsorted or nonsensical lyric timestamps. The beat fallback is safer.
  const sorted=valid.length>0&&valid.every((line,i)=>i===0||line.startMs>valid[i-1].startMs);
  const lines=sorted?valid:[];
  const beats:ShowBeatV446[]=[];
  if(lines.length>=4){
    const hooks=repeatedHookLines(lines);
    const phrases=Math.min(63,Math.ceil(lines.length/4));
    for(let p=0;p<phrases;p++){
      const from=p*4,to=Math.min(lines.length-1,from+3);
      const at=p===0?0:lines[from].startMs;
      if(p>0&&at<beats[beats.length-1].atMs+5500)continue;
      const hits=Array.from({length:to-from+1},(_,i)=>hooks.has(from+i)).filter(Boolean).length;
      const section:ShowSectionV446=hits>=2?'hook':p===0&&lines[0].startMs>5000?'intro':
        duration>0&&at>duration-11000?'outro':'verse';
      const focus=section==='hook'?-1:count===1?0:beats.filter(b=>b.section!=='hook').length%count;
      const formation:GroupFormationV326=section==='hook'?'wide':section==='intro'||section==='outro'?'arc':
        p%3===0?'line':p%3===1?'stagger':'arc';
      beats.push({id:`show-${p}-${section}`,atMs:at,untilMs:duration||3600000,lineFrom:from,lineTo:to,section,focus,formation});
    }
    // A lyric source may stop before the actual song ends; never add fake voice credits.
  }else if(duration>=16000){
    const bpm=clamp(finite(input.bpm,105),50,220);
    // Approx. eight bars at the actual tempo, clamped against restless switching.
    const phraseMs=clamp(Math.round((60_000/bpm)*32),9500,23500);
    const phrases=Math.min(63,Math.ceil(duration/phraseMs));
    for(let p=0;p<phrases;p++){
      const at=p*phraseMs;
      const section:ShowSectionV446=p===0?'intro':p===phrases-1?'outro':'verse';
      beats.push({id:`tempo-${p}-${section}`,atMs:at,untilMs:duration,
        lineFrom:-1,lineTo:-1,section,focus:count===1?0:p%count,
        formation:p%3===0?'line':p%3===1?'stagger':'arc'});
    }
  }
  for(let i=0;i<beats.length;i++)beats[i].untilMs=beats[i+1]?.atMs??(duration||3600000);
  return {trackId,count,source:lines.length>=4&&beats.length?'synced-lyrics':beats.length?'tempo':'none',beats};
}

/** Binary lookup: stable through pause, seeks, re-renders and progress updates. */
export function sampleSmartRapShowV446(plan:SmartShowPlanV446,progressMs:number,input:{
  enabled:boolean;playing:boolean;reducedMotion:boolean;manualProtected:boolean;
  liveScene?:MotionSceneV438}):SmartShowCueV446{
  const inactive:SmartShowCueV446={active:false,section:'verse',focus:0,group:false,
    phrase:0,eventId:'inactive',motionScene:input.liveScene??'verse'};
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualProtected||
    !Number.isFinite(progressMs)||progressMs<0||!plan.beats.length)return inactive;
  let lo=0,hi=plan.beats.length-1,index=0;
  while(lo<=hi){const mid=(lo+hi)>>1;if(plan.beats[mid].atMs<=progressMs){index=mid;lo=mid+1;}else hi=mid-1;}
  const beat=plan.beats[index];
  const live=input.liveScene;
  const group=beat.section==='hook'||live==='hook'||live==='duet'||live==='drop';
  const section=group?'hook':beat.section;
  const motionScene:MotionSceneV438=group?(live==='drop'?'drop':'hook'):
    section==='intro'||section==='outro'?'break':live==='reply'?'reply':'verse';
  return {active:true,section,focus:group?-1:beat.focus,group,
    phrase:index,eventId:`v446:${plan.trackId}:${beat.id}:${group?'group':'solo'}`,
    motionScene};
}

/** Applies the same stable timeline to the EXISTING V326 stage, never to saved groups. */
export function arrangeAutomaticGroupV446(group:GroupStudioV326,plan:SmartShowPlanV446):GroupStudioV326{
  if(!group.enabled||!plan.beats.length||plan.count!==group.count||group.trackId!==plan.trackId)return group;
  const cues:GroupCueV326[]=plan.beats.slice(0,63).map((beat,i)=>({
    id:`v446-${i}-${beat.section}`,at:beat.atMs/1000,
    formation:beat.formation,focus:beat.focus,drop:beat.section==='hook',
    transition:i===0?0:clamp((beat.atMs-plan.beats[i-1].atMs)/1000*.14,.5,1.1),
    positions:layoutV326(beat.formation,group.count),
  }));
  return {...group,cues};
}

/** Only supplied to *inferred* camera role ranges, never to authored assignments. */
export function smartShowCameraAssignmentsV446<T extends {fromLine:number;toLine:number;leadSlot:number;
  partnerSlot:number;style:string;strength:number}>(existing:readonly T[],plan:SmartShowPlanV446):T[]{
  if(plan.source!=='synced-lyrics'||plan.count<2||!existing.length)return [...existing];
  const generic=existing.filter(x=>x.style!=='hook'&&x.style!=='solo');
  const inferred=plan.beats.filter(b=>b.lineFrom>=0).slice(0,Math.max(0,150-generic.length)).map(b=>({
    fromLine:b.lineFrom,toLine:b.lineTo,leadSlot:b.focus<0?0:b.focus,
    partnerSlot:b.focus<0?1:(b.focus+1)%plan.count,
    style:b.section==='hook'?'hook':'solo',strength:b.section==='hook'?70:65,
  } as T));
  return [...generic,...inferred].slice(0,150);
}
