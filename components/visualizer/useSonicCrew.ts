'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {CREW_DEFAULT,normalizeCrewSettings,newCrewState,stepCrew,type CrewSettings,type CrewInput} from './sonicCrewDirector';
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
export function useCrewDirector(input:CrewInput){
 const previous=useRef(newCrewState());
 const [result,setResult]=useState(()=>stepCrew(previous.current,input));
 useEffect(()=>{
  const next=stepCrew(previous.current,input);previous.current=next.state;
  setResult(old=>old.state.key===next.state.key&&old.state.position===next.state.position&&old.state.beat===next.state.beat&&old.state.bpm===next.state.bpm&&old.state.switched===next.state.switched&&old.plan.clip===next.plan.clip&&old.plan.part===next.plan.part&&old.plan.reaction===next.plan.reaction&&old.plan.offset===next.plan.offset&&old.plan.leader===next.plan.leader&&old.plan.reason===next.plan.reason&&old.plan.expressionGain===next.plan.expressionGain&&old.plan.offsetTarget===next.plan.offsetTarget&&old.plan.story?.chapter===next.plan.story?.chapter&&old.plan.sequence?.label===next.plan.sequence?.label?old:next);
 },[input.modelId,input.clips,input.trackId,input.progressMs,input.bpm,input.energy,input.section,input.genre,input.slot,input.count,input.playing,input.reducedMotion,input.manualPriority,input.settings,input.lyricDensity,input.durationMs,input.lyrics]);
 // Immediately suppress a stale action when playback/ownership changes.
 if(!input.playing||input.reducedMotion||input.manualPriority||!input.settings.enabled||result.state.key!==`${input.trackId}|${input.modelId}|${input.settings.mode}|${input.count}|${input.slot}`)
  return stepCrew(newCrewState(),{...input,manualPriority:true});
 return result;
}
