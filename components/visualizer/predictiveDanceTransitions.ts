/** V211: deterministic lookahead for user-authored bar-based motion sequences. */
import type {EvolutionState} from './smartChoreographyEvolution';
import type {TimelinePhase} from './musicStructureTimeline';
import type {InstalledCharacterMotion} from './characterMotionLibrary';
export const PREDICTIVE_DANCE_EVENT='sonic:predictive-dance-settings-changed';
const KEY='sonic.predictive.dance.v211';
export type PredictiveDanceSettings={enabled:boolean;leadBeats:number;minimumDwellBars:number};
export const DEFAULT_PREDICTIVE_DANCE:PredictiveDanceSettings={enabled:false,leadBeats:1,minimumDwellBars:1};
export function sanitizePredictiveDance(raw:unknown):PredictiveDanceSettings {
 const o=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const lead=Number(o.leadBeats),dwell=Number(o.minimumDwellBars);
 return {enabled:o.enabled===true,leadBeats:Number.isFinite(lead)?Math.max(.25,Math.min(4,lead)):1,
 minimumDwellBars:Number.isFinite(dwell)?Math.max(0,Math.min(8,Math.floor(dwell))):1};
}
export function readPredictiveDance():PredictiveDanceSettings {
 if(typeof window==='undefined')return {...DEFAULT_PREDICTIVE_DANCE};
 try{return sanitizePredictiveDance(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return {...DEFAULT_PREDICTIVE_DANCE};}
}
export function writePredictiveDance(value:PredictiveDanceSettings):PredictiveDanceSettings {
 const safe=sanitizePredictiveDance(value);
 if(typeof window!=='undefined')try{localStorage.setItem(KEY,JSON.stringify(safe));window.dispatchEvent(new Event(PREDICTIVE_DANCE_EVENT));}catch{}
 return safe;
}
export type UpcomingDanceCue={motionId:string;url:string;boundaryBeat:number;remainingBeats:number;crossfade?:number};
/** Only forecasts the *next real motion change*, and never invents a clip URL. */
export function predictDanceCue(state:EvolutionState,avatarId:string,phase:TimelinePhase,motions:InstalledCharacterMotion[],beat:number,beatsPerBar=4,leadBeats=1):UpcomingDanceCue|undefined {
 if(!state.enabled||!Number.isFinite(beat)||beat<0)return undefined;
 const size=Math.max(1,Math.min(16,Math.round(beatsPerBar)||4));
 const steps=(state.sequences[avatarId]?.[phase]||[]).filter(s=>motions.some(m=>m.id===s.motionId&&m.avatarId===avatarId));
 if(steps.length<2)return undefined;
 const total=steps.reduce((sum,s)=>sum+s.bars,0);if(!total)return undefined;
 const currentBar=Math.floor(beat/size)%total;
 let cursor=0,index=0;
 for(let i=0;i<steps.length;i++){cursor+=steps[i].bars;if(currentBar<cursor){index=i;break;}}
 let next=(index+1)%steps.length;
 // Do not schedule self-transitions when consecutive timeline steps have the same motion.
 let remainingBars=cursor-currentBar;
 while(steps[next].motionId===steps[index].motionId && next!==index){remainingBars+=steps[next].bars;next=(next+1)%steps.length;}
 if(next===index)return undefined;
 const boundaryBeat=(Math.floor(beat/size)+remainingBars)*size;
 const remainingBeats=boundaryBeat-beat;
 if(remainingBeats<=0||remainingBeats>Math.max(.25,Math.min(4,leadBeats)))return undefined;
 const motion=motions.find(m=>m.id===steps[next].motionId&&m.avatarId===avatarId);
 return motion?{motionId:motion.id,url:motion.url,boundaryBeat,remainingBeats,crossfade:steps[next].crossfade}:undefined;
}
export function mayCommitPredictedCue(cue:UpcomingDanceCue|undefined,previousBeat:number,currentBeat:number,clipReady:boolean,lastSwitchBeat:number,beatsPerBar=4,minimumDwellBars=1):boolean {
 if(!cue||!clipReady||!Number.isFinite(previousBeat)||!Number.isFinite(currentBeat)||currentBeat<previousBeat)return false;
 const dwell=Math.max(0,Math.min(8,minimumDwellBars))*Math.max(1,Math.min(16,beatsPerBar));
 return previousBeat<cue.boundaryBeat&&currentBeat>=cue.boundaryBeat&&cue.boundaryBeat-lastSwitchBeat>=dwell;
}
