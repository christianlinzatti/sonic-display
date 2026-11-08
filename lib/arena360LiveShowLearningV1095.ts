/** V1095 · Live Show Learning.
 * Explicit, privacy-preserving feedback about locally edited V1040 show plans.
 * No automatic evaluation of user activity, no title, track ID, prompt, lyrics,
 * playback history, user identity, network, audio or device control.
 * Pure deterministic suggestions, never silently applied to the live stage.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040,
 type ArenaShowSegmentV1040} from './arena360ShowDesignerV1040';

export const STORAGE_KEY_V1095='sonic-display-live-show-learning-v1095';
export const MAX_FEEDBACK_V1095=24;
export const MAX_RECENT_V1095=6;
const GENRES=['rap','hard','rock','pop'] as const;
const DECKS=['halo','fan','spiral'] as const;
const FLOATS=['wave','orbit','rise'] as const;
const LASERS=['halo','spiral','tunnel'] as const;
type GenreV1095=typeof GENRES[number];
type CueV1095=Pick<ArenaShowSegmentV1040,'deck'|'floating'|'lasers'|'intensity'>;
export type FeedbackV1095={genre:GenreV1095;rating:1|-1;cues:CueV1095[];signature:string};
export type LearningMemoryV1095={version:1095;sequence:number;feedback:FeedbackV1095[];recent:string[]};
export const EMPTY_LEARNING_V1095:LearningMemoryV1095={version:1095,sequence:0,feedback:[],recent:[]};
const matches=<T extends string>(item:unknown,values:readonly T[]):item is T=>
 typeof item==='string'&&values.includes(item as T);
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const choices=(s:ArenaShowSegmentV1040):CueV1095=>({deck:s.deck,floating:s.floating,
 lasers:s.lasers,intensity:Math.round(clamp(s.intensity,0,100)/5)*5});
const cuesOf=(p:ArenaShowPlanV1040)=>p.segments.map(choices);
/** Bounded 32-bit fingerprint. Not an identity or a claim about unique songs. */
export function showStyleSignatureV1095(cues:readonly CueV1095[]):string{
 const key=cues.map(s=>`${s.deck}.${s.floating}.${s.lasers}.${s.intensity}`).join('|');
 let hash=2166136261;
 for(let i=0;i<key.length;i++){hash^=key.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return `s${(hash>>>0).toString(16).padStart(8,'0')}`;
}
function parseCue(input:unknown):CueV1095|null{
 if(!input||typeof input!=='object')return null;
 const raw=input as Partial<CueV1095>;
 if(!matches(raw.deck,DECKS)||!matches(raw.floating,FLOATS)||!matches(raw.lasers,LASERS)||
  !Number.isInteger(raw.intensity)||raw.intensity===undefined||raw.intensity<0||raw.intensity>100||raw.intensity%5!==0)return null;
 return {deck:raw.deck,floating:raw.floating,lasers:raw.lasers,intensity:raw.intensity};
}
/** Fail closed on corrupt/old storage. Never trust unbounded serialized records. */
export function normalizeLearningMemoryV1095(input:unknown):LearningMemoryV1095{
 if(!input||typeof input!=='object')return {...EMPTY_LEARNING_V1095};
 const data=input as Partial<LearningMemoryV1095>;
 if(data.version!==1095||!Number.isSafeInteger(data.sequence)||data.sequence===undefined||data.sequence<0||
  !Array.isArray(data.feedback)||!Array.isArray(data.recent)||data.feedback.length>MAX_FEEDBACK_V1095||
  data.recent.length>MAX_RECENT_V1095)return {...EMPTY_LEARNING_V1095};
 const feedback:FeedbackV1095[]=[];
 for(const item of data.feedback){
  if(!item||typeof item!=='object'||!matches(item.genre,GENRES)||(item.rating!==1&&item.rating!==-1)||
   !Array.isArray(item.cues)||item.cues.length!==7)return {...EMPTY_LEARNING_V1095};
  const parsed=item.cues.map(parseCue);
  if(parsed.some(x=>x===null))return {...EMPTY_LEARNING_V1095};
  const cues=parsed as CueV1095[];
  if(item.signature!==showStyleSignatureV1095(cues))return {...EMPTY_LEARNING_V1095};
  feedback.push({genre:item.genre,rating:item.rating,cues,signature:item.signature});
 }
 const recent:string[]=[];
 for(const s of data.recent){
  if(typeof s!=='string'||!/^s[0-9a-f]{8}$/.test(s))return {...EMPTY_LEARNING_V1095};
  if(!recent.includes(s))recent.push(s);
 }
 return {version:1095,sequence:data.sequence,feedback,recent};
}
/** A plan is only learned from the user's explicit feedback click. */
export function recordShowFeedbackV1095(input:unknown,plan:unknown,rating:1|-1):LearningMemoryV1095|null{
 const valid=normalizeArenaShowPlanV1040(plan);
 if(!valid||(rating!==1&&rating!==-1))return null;
 const state=normalizeLearningMemoryV1095(input);
 const cues=cuesOf(valid),signature=showStyleSignatureV1095(cues);
 const next:FeedbackV1095={genre:valid.genre,rating,cues,signature};
 const feedback=state.feedback.filter(f=>f.genre!==valid.genre||f.signature!==signature);
 return {...state,feedback:[...feedback,next].slice(-MAX_FEEDBACK_V1095)};
}
const rotate=<T extends string>(value:T,items:readonly T[],offset:number):T=>{
 const index=items.indexOf(value);return items[(index+1+(offset%Math.max(1,items.length-1)))%items.length];
};
export type ShowVariationV1095={plan:ArenaShowPlanV1040;memory:LearningMemoryV1095;
 learned:boolean;changedScenes:number[]};
/** Produces one *review-only* variant. No stage or preference mutation occurs here. */
export function suggestLiveShowV1095(input:unknown,plan:unknown):ShowVariationV1095|null{
 const valid=normalizeArenaShowPlanV1040(plan);if(!valid)return null;
 const state=normalizeLearningMemoryV1095(input);
 const original=showStyleSignatureV1095(cuesOf(valid));
 const avoided=new Set(state.feedback.filter(f=>f.genre===valid.genre&&f.rating===-1).map(f=>f.signature));
 const liked=state.feedback.filter(f=>f.genre===valid.genre&&f.rating===1);
 // Rotate choices across songs and scenes, prefer explicitly liked cues in one scene.
 for(let attempt=0;attempt<32;attempt++){
  const seed=state.sequence+attempt;
  const primary=1+(seed%6),secondary=1+((seed+3)%6);
  const favorite=liked.length>0?liked[(seed+Math.floor(seed/6))%liked.length]:null;
  const segments=valid.segments.map(s=>({...s}));
  const changedScenes:number[]=[];
  const a=segments[primary],b=segments[secondary];
  if(favorite){
   const f=favorite.cues[primary];
   a.deck=f.deck;a.floating=f.floating;a.lasers=f.lasers;
   a.intensity=Math.round(clamp((a.intensity+f.intensity)/2,0,100));
  }else{
   a.deck=rotate(a.deck,DECKS,seed);
   a.lasers=rotate(a.lasers,LASERS,seed+1);
  }
  // A second change guarantees novelty even when a remembered motif matches.
  b.floating=rotate(b.floating,FLOATS,seed);
  b.lasers=rotate(b.lasers,LASERS,seed+1);
  // A small five-step energy variation prevents a six-pattern repetition loop.
  b.intensity=Math.round(clamp(b.intensity+([-10,-5,0,5,10][Math.floor(seed/6)%5]),0,100));
  for(const i of [primary,secondary])if(!changedScenes.includes(i))changedScenes.push(i);
  const candidate=normalizeArenaShowPlanV1040({...valid,segments});if(!candidate)continue;
  const signature=showStyleSignatureV1095(cuesOf(candidate));
  if(signature===original||state.recent.includes(signature)||avoided.has(signature))continue;
  return {plan:candidate,learned:!!favorite,changedScenes,
   memory:{...state,sequence:state.sequence+1,
    recent:[signature,...state.recent.filter(s=>s!==signature)].slice(0,MAX_RECENT_V1095)}};
 }
 return null;
}
/** Diagnostic counts without any personal or playback metadata. */
export function learningSummaryV1095(input:unknown){
 const data=normalizeLearningMemoryV1095(input);
 return {liked:data.feedback.filter(f=>f.rating===1).length,
  avoided:data.feedback.filter(f=>f.rating===-1).length,remembered:data.feedback.length};
}
