import {musicFamilyV1129,type MusicFamilyV1129} from './musicPerformanceV1129';
import type {StoryCueV1131} from './concertStoryV1131';
type Motif={clip:string;energy:number;families:readonly MusicFamilyV1129[]};
const MOTIFS:readonly Motif[]=[
 {clip:'Dance_RobotGroove',energy:.58,families:['electronic','urban','hard']},
 {clip:'Dance_FluidArc',energy:.25,families:['ambient','classical','electronic']},
 {clip:'Dance_FrontmanDrive',energy:.9,families:['rock','hard']},
 {clip:'Dance_JazzRebound',energy:.48,families:['jazz','pop']},
 {clip:'Dance_CrossStep',energy:.62,families:['latin','afro','pop','global']},
 {clip:'Dance_TurnPhrase',energy:.7,families:['latin','classical','jazz','global']},
];
const hash=(text:string)=>{let value=2166136261;for(const c of text)value=Math.imul(value^c.charCodeAt(0),16777619)>>>0;return value;};
/** Bounded candidate scoring, not an audio classifier or a remote language model.
 * Reconstruct a short motif history from song phrases so seeks and shared casts agree.
 */
export function creativeBodyClip(input:{trackId:string;modelId:string;genre?:string|null;cue:StoryCueV1131;
 available:ReadonlySet<string>;recent?:readonly string[];shared:boolean;personal:string}):string|null{
 const family=musicFamilyV1129(input.genre),soft=family==='ambient'||family==='classical';
 const phrase=Math.max(2,Math.min(10800,Math.floor(input.cue.phrase)||0));
 const power=!soft&&(input.cue.act==='impact'||input.cue.act==='finale')&&input.cue.intensity>=.7;
 const target=soft?Math.min(.4,input.cue.intensity):input.cue.intensity;
 let pool=MOTIFS.filter(m=>(!soft||m.clip!=='Dance_FrontmanDrive'&&m.clip!=='Dance_RobotGroove')&&
  (!power||m.energy>=.45)&&(input.shared||input.available.has(m.clip)));
 if(!pool.length)return null;
 if(!input.shared&&pool.length>1)pool=pool.filter(m=>m.clip!==input.recent?.[0]);
 const seed=hash(input.trackId+(input.shared?'':`:${input.modelId}`));
 let selected=pool[0].clip;const recent:string[]=[];
 for(let p=Math.max(2,phrase-3);p<=phrase;p++){
  let best=-Infinity;
  for(const motif of pool){
   const age=recent.indexOf(motif.clip),played=input.shared?-1:(input.recent??[]).indexOf(motif.clip);
   const novelty=hash(`${seed}:${p}:${motif.clip}`)/4294967295;
   const score=3-Math.abs(motif.energy-target)*2+(motif.families.includes(family)?1.1:0)+
    (!input.shared&&motif.clip===input.personal?.7:0)+novelty*1.6-(age<0?0:(3-age)*1.4)-(played<0?0:Math.max(0,3-played)*1.5);
   if(score>best){selected=motif.clip;best=score;}
  }
  recent.unshift(selected);recent.length=Math.min(3,recent.length);
 }
 // A partial asset must never cause a shared performer to choose a different motif.
 return input.available.has(selected)?selected:null;
}
