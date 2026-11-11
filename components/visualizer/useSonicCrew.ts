'use client';
import {liveConcertContext} from '@/lib/concertScenePlan';
import type {ProductionId} from '@/lib/showProduction';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {CREW_DEFAULT,normalizeCrewSettings,newCrewState,stepCrew,type CrewSettings,type CrewInput} from './sonicCrewDirector';
import {rememberShow} from '@/lib/showExperience';
import {measuredMusic} from '@/lib/musicalEvidence';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {CONCERT_COORDINATION_KEY_V1154,CONCERT_COORDINATION_EVENT_V1154,loadConcertCoordinationV1154,planConcertCoordinationV1154,applyConcertCrewV1154} from '@/lib/aiConcertCoordinationV1154';
export const CREW_KEY='sonic-stage-crew-v4';
const EVENT='sonic:stage-crew-v4';
let raw:string|null|undefined,snapshot: CrewSettings = CREW_DEFAULT;
function read():CrewSettings {
 if(typeof window==='undefined')return CREW_DEFAULT;
 try {const next=localStorage.getItem(CREW_KEY);if(next!==raw){raw=next;snapshot=normalizeCrewSettings(next?JSON.parse(next):null);}}catch{return snapshot;}
 return snapshot;
}
function subscribe(fn:()=>void){window.addEventListener(EVENT,fn);window.addEventListener('storage',fn);return()=>{window.removeEventListener(EVENT,fn);window.removeEventListener('storage',fn);};}
export function writeCrewSettings(value:unknown){const clean=normalizeCrewSettings(value);try{localStorage.setItem(CREW_KEY,JSON.stringify(clean));}catch{snapshot=clean;}window.dispatchEvent(new Event(EVENT));return clean;}
export function useCrewSettings(){return useSyncExternalStore(subscribe,read,()=>CREW_DEFAULT);}
/** Only new observed motifs/shots write to local storage. */
export function rememberCrewExperience(track:string|undefined|null,entry:{motif?:string;shot?:number;production?:ProductionId;take?:number}){
 if(!track||typeof window==='undefined')return;
 const settings=read();if(settings.remember===false||!settings.enabled||settings.mode!=='adaptive')return;
 const history=rememberShow(settings.history,track,entry);
 if(JSON.stringify(history)!==JSON.stringify(settings.history??[]))writeCrewSettings({...settings,history});
}
let queued=false;
const cameraEntries=new Map<string,number>();
export function rememberCrewCamera(track:string|undefined|null,shot:number){
 if(!track||typeof window==='undefined'||snapshot.remember===false||!snapshot.enabled||snapshot.mode!=='adaptive'||snapshot.history?.find(row=>row.track===track)?.shots.includes(shot))return;
 cameraEntries.set(track,shot);if(queued)return;queued=true;
 queueMicrotask(()=>{queued=false;for(const [id,value] of cameraEntries)rememberCrewExperience(id,{shot:value});cameraEntries.clear();});
}
export function useCrewDirector(input:CrewInput){
 const analysis=useAudioAnalysis(),evidence=measuredMusic(analysis.active,analysis.metrics);
 const [coordination,setCoordination]=useState(loadConcertCoordinationV1154);
 useEffect(()=>{
  const refresh=()=>setCoordination(loadConcertCoordinationV1154());
  const storage=(e:StorageEvent)=>{if(e.key===CONCERT_COORDINATION_KEY_V1154||e.key===null)refresh();};
  window.addEventListener(CONCERT_COORDINATION_EVENT_V1154,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(CONCERT_COORDINATION_EVENT_V1154,refresh);window.removeEventListener('storage',storage);};
 },[]);
 // Inactive microphone metrics are placeholders, not evidence about this song.
 input={...input,audioEvidence:evidence,...(input.settings.showPlans&&input.settings.mode==='adaptive'?liveConcertContext(input,analysis.active):{})};
 const previous=useRef(newCrewState());
 const [result,setResult]=useState(()=>stepCrew(previous.current,input));
 useEffect(()=>{
  const next=stepCrew(previous.current,input);previous.current=next.state;
  setResult(old=>old.state.key===next.state.key&&old.state.position===next.state.position&&old.state.beat===next.state.beat&&old.state.bpm===next.state.bpm&&old.state.switched===next.state.switched&&old.plan.clip===next.plan.clip&&old.plan.part===next.plan.part&&old.plan.reaction===next.plan.reaction&&old.plan.offset===next.plan.offset&&old.plan.leader===next.plan.leader&&old.plan.reason===next.plan.reason&&old.plan.expressionGain===next.plan.expressionGain&&old.plan.offsetTarget===next.plan.offsetTarget&&old.plan.story?.chapter===next.plan.story?.chapter&&old.plan.story?.scenery===next.plan.story?.scenery&&old.plan.story?.production?.id===next.plan.story?.production?.id&&old.plan.story?.production?.take===next.plan.story?.production?.take&&old.plan.story?.production?.scene===next.plan.story?.production?.scene&&old.plan.story?.music.prepare===next.plan.story?.music.prepare&&old.plan.story?.music.measured===next.plan.story?.music.measured&&old.plan.sequence?.label===next.plan.sequence?.label?old:next);
 },[input.stance?.left,input.stance?.right,input.modelId,input.clips,input.trackId,input.progressMs,input.bpm,input.energy,input.section,input.genre,input.slot,input.count,input.playing,input.reducedMotion,input.manualPriority,input.settings,input.lyricDensity,input.durationMs,input.lyrics,evidence?.phase,evidence?.confidence,evidence?.energy,evidence?.onset,evidence?.anticipation]);
 useEffect(()=>{
  if(input.playing&&!input.reducedMotion&&!input.manualPriority&&result.plan.active&&result.state.key===`${input.trackId}|${input.modelId}|${input.settings.mode}|${input.count}|${input.slot}`&&result.plan.clip)rememberCrewExperience(input.trackId,{motif:result.plan.clip,...(result.plan.story?.production?{production:result.plan.story.production.id,take:result.plan.story.production.take}:{})});
 },[input.trackId,input.playing,input.reducedMotion,input.manualPriority,result.plan.active,result.plan.clip,result.plan.story?.production?.id,result.plan.story?.production?.take]);
 // Immediately suppress a stale action when playback/ownership changes.
 if(!input.playing||input.reducedMotion||input.manualPriority||!input.settings.enabled||result.state.key!==`${input.trackId}|${input.modelId}|${input.settings.mode}|${input.count}|${input.slot}`)
  return stepCrew(newCrewState(),{...input,manualPriority:true});
 const cue=planConcertCoordinationV1154({
  settings:coordination,trackId:input.trackId,progressMs:input.progressMs??NaN,
  durationMs:input.durationMs,
  phase:result.plan.part==='quiet'?'quiet':result.plan.part==='drop'?'drop':
   result.plan.part==='hook'?'hook':'verse',
  // The crew uses existing observed song/lyric context for expression only.
  // No unverified crew observation ever authorizes a physical light phase.
  verified:Boolean(input.section||input.lyrics?.synced),
  transition:Math.min(1,Math.max(0,((input.progressMs??0)-result.state.switched)/3200)),
  playing:input.playing,reducedMotion:input.reducedMotion,manualPriority:input.manualPriority,
  lyricsFocus:result.plan.story?.reading===true,genre:input.genre
 });
 return {...result,plan:applyConcertCrewV1154(result.plan,cue,input.manualPriority)};
}
