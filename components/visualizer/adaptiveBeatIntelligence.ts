/** V209 adaptive rhythm engine. Pure, bounded and pause-safe. No Spotify audio access. */
import type {AudioFeatures} from "@/types/audio";
export type RhythmLock={beat:number; tempo:number; confidence:number; pulseTime:number|null; lastTime:number|null; lastOnset:boolean; intervals:number[]; pulseCount:number; corrections:number; status:"waiting"|"tracking"|"locked"};
export const initialRhythmLock=():RhythmLock=>({beat:0,tempo:120,confidence:0,pulseTime:null,lastTime:null,lastOnset:false,intervals:[],pulseCount:0,corrections:0,status:"waiting"});
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const valid=(x:number|undefined|null)=>typeof x==="number"&&Number.isFinite(x);
const median=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:0;};
/** Update on render samples. Observe only distinct onsets; reject double-kicks and implausible gaps.
 * The transport never advances during pause. Long discontinuities reset onset calibration only.
 * Corrections are small, bounded, and confidence-weighted; no abrupt bar jumps. */
export function updateRhythmLock(state:RhythmLock,now:number,delta:number,playing:boolean,audio:Pick<AudioFeatures,"bpm"|"beat"|"beatStrength"|"kickAccentIntensity"|"bpmConfidence">,enabled=true):RhythmLock{
 const bpm=valid(audio.bpm)&&audio.bpm!>=50&&audio.bpm!<=240?audio.bpm!:state.tempo;
 if(!valid(now)||!valid(delta)||delta<0||delta>1) return {...state,tempo:bpm,lastTime:null,lastOnset:false,confidence:state.confidence*.99};
 if(!playing)return {...state,lastTime:null,lastOnset:false};
 const onset=!!audio.beat&&audio.beatStrength>=.45 || (audio.kickAccentIntensity??0)>=.82;
 let beat=state.beat+delta*bpm/60;
 if(!enabled)return {...state,beat,tempo:bpm,lastTime:now,lastOnset:onset,status:"waiting"};
 const rising=onset&&!state.lastOnset;
 let intervals=state.intervals, pulseTime=state.pulseTime, confidence=state.confidence, corrections=state.corrections,pulseCount=state.pulseCount;
 if(rising && (pulseTime===null||now-pulseTime>=.22)){
   if(pulseTime!==null){
     const dt=now-pulseTime;const candidate=60/dt;
     const expected=60/bpm;
     // Avoid interpreting 1/2, 2x tempo and off-beat ornaments as tempo drift.
     if(dt>=.24&&dt<=1.1&&Math.abs(dt-expected)/expected<.26){
       intervals=[...intervals.slice(-15),dt];
       const learned=60/median(intervals);
       if(intervals.length>=3&&learned>=50&&learned<=240){
         const target=Math.round(beat);const error=clamp(target-beat,-.28,.28);
         const strength=clamp(audio.beatStrength,0,1);
         const correction=error*(.10+.18*strength)*clamp(intervals.length/7,0,1);
         beat=Math.max(state.beat,beat+correction);
         corrections+=Math.abs(correction)>1e-5?1:0;
         confidence=clamp((intervals.length/9)*(.45+.55*strength)*(1-Math.min(1,Math.abs(learned-bpm)/bpm)),0,1);
       }
     }else{confidence*=.94;}
   }
   pulseTime=now;pulseCount++;
 }
 if(pulseTime!==null&&now-pulseTime>2.5){confidence*=.97;intervals=[];pulseTime=null;}
 return {beat,tempo:bpm,confidence,pulseTime,lastTime:now,lastOnset:onset,intervals,pulseCount,corrections,status:confidence>=.65?"locked":intervals.length>=2?"tracking":"waiting"};
}
export type BeatLockSettings={enabled:boolean;minConfidence:number};
export const BEAT_LOCK_SETTINGS_EVENT="sonic:rhythm-intelligence-settings";
export const BEAT_LOCK_LIVE_EVENT="sonic:rhythm-intelligence-live";
const KEY="sonic.rhythm.intelligence.v209";
export function loadBeatLockSettings():BeatLockSettings{
 if(typeof window==="undefined")return {enabled:false,minConfidence:.35};
 try{const v=JSON.parse(localStorage.getItem(KEY)||"{}");return {enabled:v.enabled===true,minConfidence:valid(v.minConfidence)?clamp(v.minConfidence,.2,.85):.35};}catch{return {enabled:false,minConfidence:.35};}
}
export function saveBeatLockSettings(x:BeatLockSettings):void{
 if(typeof window==="undefined")return;
 try{localStorage.setItem(KEY,JSON.stringify({enabled:x.enabled===true,minConfidence:clamp(x.minConfidence,.2,.85)}));window.dispatchEvent(new Event(BEAT_LOCK_SETTINGS_EVENT));}catch{/* storage denied */}
}
export function publishRhythmLock(s:RhythmLock):void{
 if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(BEAT_LOCK_LIVE_EVENT,{detail:{tempo:s.tempo,confidence:s.confidence,status:s.status,pulses:s.pulseCount,corrections:s.corrections,phase:s.beat%1}}));
}
