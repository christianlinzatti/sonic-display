import {CREATIVE_MOTIFS} from './creativeChoreography';
import {musicFamilyV1129} from './musicPerformanceV1129';
export type CrewDialogue={scene:number;phase:'call'|'reply'|'reunion';caller:number;responder:number};
/** A seekable 24-second scene, introduced after the personal opening. */
export function crewDialogue(phrase:number,count:number):CrewDialogue|null{
 if(!Number.isFinite(phrase)||phrase<3||!Number.isFinite(count)||count<2)return null;
 const size=Math.max(2,Math.min(4,Math.round(count))),step=Math.floor(phrase)-3;
 const scene=Math.floor(step/3),caller=scene%size;
 return {scene,phase:(['call','reply','reunion'] as const)[step%3],caller,
  responder:(caller+1+Math.floor(scene/size)%(size-1))%size};
}
const hash=(text:string)=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
const memory=new Map<string,Readonly<{call:string;contrast:string}>>();
/** Evaluate complete call/contrast pairs. Shared constraints take priority over variety.
 * This is local candidate planning, without remote models or invented audio observations.
 */
export function dialogueMotifs(trackId:string,genre:string|null|undefined,scene:number){
 const family=musicFamilyV1129(genre),seed=hash(trackId),key=`${seed}:${family}:${scene}`;
 const cached=memory.get(key);if(cached){memory.delete(key);memory.set(key,cached);return cached;}
 const soft=family==='ambient'||family==='classical';
 const target=soft?.32:family==='rock'||family==='hard'?.78:family==='jazz'?.48:.6;
 const pool=CREATIVE_MOTIFS.filter(m=>!soft||!['Dance_RobotGroove','Dance_FrontmanDrive'].includes(m.clip));
 let best=-Infinity,pair={call:pool[0].clip,contrast:pool[1].clip};
 for(const a of pool)for(const b of pool){
  if(a.clip===b.clip)continue;
  const score=(a.families.includes(family)?1.6:0)+(b.families.includes(family)?.6:0)-Math.abs(a.energy-target)*2+
   Math.min(.65,Math.abs(a.energy-b.energy))*.75+
   hash(`${seed}:${scene}:${a.clip}`)/4294967295*.7+hash(`${seed}:${scene}:${b.clip}:answer`)/4294967295*.35;
  if(score>best){best=score;pair={call:a.clip,contrast:b.clip};}
 }
 Object.freeze(pair);memory.set(key,pair);if(memory.size>64)memory.delete(memory.keys().next().value!);
 return pair;
}
export function dialogueClip(input:{dialogue:CrewDialogue;trackId:string;genre?:string|null;slot:number;
 available:ReadonlySet<string>;fallback:string|null}):string|null{
 const {dialogue}=input,pair=dialogueMotifs(input.trackId,input.genre,dialogue.scene);
 const lead=dialogue.phase==='reply'?dialogue.responder:dialogue.caller;
 const partner=dialogue.phase==='reply'?dialogue.caller:dialogue.responder;
 const clip=dialogue.phase==='reunion'||input.slot===lead?pair.call:input.slot===partner?pair.contrast:'Dance_Groove';
 return input.available.has(clip)?clip:input.fallback;
}
