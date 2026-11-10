import type {ShowHistory} from './showExperience';
import type {MotifTaste} from './showTaste';
import type {SongShowMemory} from './songShowMemory';
import {dialogueClip,type CrewDialogue} from './crewDialogue';
import {creativeBodyClip} from './creativeChoreography';
import type {StoryCueV1131} from './concertStoryV1131';
import {musicFamilyV1129} from './musicPerformanceV1129';
export const FULL_BODY_CLIPS_V1133=['Dance_RobotGroove','Dance_FluidArc','Dance_FrontmanDrive','Dance_JazzRebound','Dance_CrossStep','Dance_TurnPhrase'] as const;
const STYLES:Record<string,string>={Dance_RobotGroove:'Präzision & Stopps',Dance_FluidArc:'Fließende Gewichtswechsel',Dance_FrontmanDrive:'Kraftvolle Kniearbeit',Dance_JazzRebound:'Swing & Federung',Dance_CrossStep:'Diagonale Schritte',Dance_TurnPhrase:'Drehphrase'};
export const bodyStyleV1133=(clip:string|null)=>clip?STYLES[clip]:undefined;
const PERSONAL:Record<string,string>={
 'sonic-neon-pulse':'Dance_CrossStep','sonic-festival-nova':'Dance_FrontmanDrive','sonic-chrome-beat':'Dance_RobotGroove',
 'sonic-ember-rock':'Dance_FrontmanDrive','sonic-luna-flow':'Dance_FluidArc','sonic-sol-groove':'Dance_CrossStep',
 'sonic-velvet-jazz':'Dance_JazzRebound','sonic-atlas-prism':'Dance_RobotGroove','sonic-aurora-synth':'Dance_FluidArc',
 'sonic-rio-carnival':'Dance_CrossStep','sonic-quantum-bass':'Dance_RobotGroove',
};
/** Whole-body choices from actual available clips; keep quiet/dense passages and shared canon intact. */
export function fullBodyClipV1133(input:{history?:ShowHistory;taste?:MotifTaste;slot?:number;trackId?:string;recent?:readonly string[];modelId:string;genre?:string|null;cue:StoryCueV1131 & {reading?:boolean;dialogue?:CrewDialogue;memory?:SongShowMemory};count:number;available:ReadonlySet<string>;fallback:string|null}):string|null{
 const {cue}=input;
 if(cue.reading||cue.act==='breathe'||cue.act==='build'||cue.lyricDensity>.7)return input.fallback;
 if(cue.memory)return input.available.has(cue.memory.clip)?cue.memory.clip:input.fallback;
 if(input.count>1&&cue.interaction==='answer')return input.fallback;
 if(cue.dialogue)return dialogueClip({dialogue:cue.dialogue,trackId:input.trackId??'sonic-show',genre:input.genre,
  history:input.history,taste:input.taste,slot:input.slot??0,available:input.available,fallback:input.fallback});
 const family=musicFamilyV1129(input.genre),shared=input.count>1&&cue.interaction==='unison';
 // The opening establishes each personality; later phrases develop contrasting motifs.
 if(cue.phrase>=2){
  const creative=creativeBodyClip({trackId:input.trackId??'sonic-show',modelId:input.modelId,genre:input.genre,cue,
   history:input.history,taste:input.taste,available:input.available,recent:input.recent,shared,personal:PERSONAL[input.modelId]??'Dance_CrossStep'});
  if(creative)return creative;
  if(shared)return input.fallback;
 }
 const selected=cue.phrase%4===3?'Dance_TurnPhrase':shared?
 (family==='ambient'||family==='classical'?'Dance_FluidArc':family==='jazz'?'Dance_JazzRebound':family==='hard'||family==='rock'?'Dance_FrontmanDrive':family==='electronic'?'Dance_RobotGroove':'Dance_CrossStep'):
 PERSONAL[input.modelId]??'Dance_CrossStep';
 return input.available.has(selected)?selected:input.fallback;
}
