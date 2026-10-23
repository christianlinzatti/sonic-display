/** V329: heuristic phrase descriptors from imported AnimationClip keyframes.
 * Samples local authored tracks only; no IK / physical floor or whole-body inverse kinematics.
 * Core has no runtime dependency on three so analysis and selection are deterministic/testable. */
import type {AnimationClip} from 'three';
export type PhraseWeightsV329={feet:number;posture:number;direction:number;rhythm:number};
export type PhraseSettingsV329={enabled:boolean;weights:PhraseWeightsV329;minConfidence:number;alignPhase:boolean;maxCandidates:number};
export type PhraseSignatureV329={name:string;index:number;duration:number;feet:number;posture:number;direction:number;rhythm:number;wave:number[];evidence:number};
export type PhraseMatchV329={indices:number[];offsets:number[];scores:number[];eligible:boolean[];reason:string};
export const PHRASE_KEY_V329='sonic-group-motion-phrase-v329';
export const PHRASE_EVENT_V329='sonic:group-motion-phrase-v329';
export const PHRASE_DEFAULT_V329:PhraseSettingsV329={enabled:false,weights:{feet:.35,posture:.25,direction:.15,rhythm:.25},minConfidence:.52,alignPhase:false,maxCandidates:24};
const bounded=(n:unknown,d:number,lo:number,hi:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):d;
const fract=(n:number)=>(n%1+1)%1;
export function normalizePhraseSettingsV329(raw:unknown):PhraseSettingsV329{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<PhraseSettingsV329>:{};
 const w=o.weights&&typeof o.weights==='object'?o.weights:PHRASE_DEFAULT_V329.weights;
 return {enabled:o.enabled===true,weights:{feet:bounded(w.feet,.35,0,1),posture:bounded(w.posture,.25,0,1),direction:bounded(w.direction,.15,0,1),rhythm:bounded(w.rhythm,.25,0,1)},
  minConfidence:bounded(o.minConfidence,.52,.2,.95),alignPhase:o.alignPhase===true,maxCandidates:Math.round(bounded(o.maxCandidates,24,1,64))};
}
export function readPhraseV329():PhraseSettingsV329{
 if(typeof window==='undefined')return normalizePhraseSettingsV329(PHRASE_DEFAULT_V329);
 try{return normalizePhraseSettingsV329(JSON.parse(window.localStorage.getItem(PHRASE_KEY_V329)||'null'));}catch{return normalizePhraseSettingsV329(PHRASE_DEFAULT_V329);}
}
export function writePhraseV329(value:unknown):PhraseSettingsV329{
 const s=normalizePhraseSettingsV329(value);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(PHRASE_KEY_V329,JSON.stringify(s));}catch{/* private mode */}
  window.dispatchEvent(new Event(PHRASE_EVENT_V329));
 }return s;
}
// Track types are read structurally, avoiding runtime imports from three.
export type PhraseTrackV329={name:string;times:ArrayLike<number>;values:ArrayLike<number>;getValueSize:()=>number};
export type PhraseClipV329={name:string;duration:number;tracks:readonly PhraseTrackV329[]};
const parts=8;
function category(name:string):'feet'|'posture'|'direction'|null{
 const n=name.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(/(foot|toe|ankle|calf|shin|leg|knee|thigh)/.test(n))return 'feet';
 if(/(hips|pelvis|spine|chest|shoulder|head|arm|hand|neck)/.test(n))return 'posture';
 if(/(root|armature|mixamorig|body)/.test(n))return 'direction';
 return null;
}
function norm(v:number){return Math.max(0,Math.min(1,v));}
function magnitude(track:PhraseTrackV329,i:number):number{
 const stride=track.getValueSize();if(![3,4].includes(stride))return 0;
 const v=track.values;
 const from=(i-1)*stride,to=i*stride;
 if(from<0||to+stride>v.length)return 0;
 let sum=0;
 if(stride===4){
  let dot=0,sa=0,sb=0;
  for(let k=0;k<4;k++){const a=v[from+k],b=v[to+k];if(!Number.isFinite(a)||!Number.isFinite(b))return 0;dot+=a*b;sa+=a*a;sb+=b*b;}
  if(sa<1e-8||sb<1e-8)return 0;
  const angle=2*Math.acos(Math.max(0,Math.min(1,Math.abs(dot/Math.sqrt(sa*sb)))));
  return norm(angle/1.15);
 }
 for(let k=0;k<3;k++){const d=v[to+k]-v[from+k];if(!Number.isFinite(d))return 0;sum+=d*d;}
 return norm(Math.sqrt(sum)/.22);
}
/** Character motion energy fingerprint: 8 normalized temporal bins, with independent
 * lower-body, torso and root contributions. No invented contact/collision claims. */
export function describePhraseV329(clip:PhraseClipV329,index:number):PhraseSignatureV329|null{
 if(!clip||!Number.isFinite(clip.duration)||clip.duration<=.02||!Array.isArray(clip.tracks))return null;
 const accum={feet:new Array<number>(parts).fill(0),posture:new Array<number>(parts).fill(0),direction:new Array<number>(parts).fill(0)};
 const counts={feet:new Array<number>(parts).fill(0),posture:new Array<number>(parts).fill(0),direction:new Array<number>(parts).fill(0)};
 let evidence=0;
 for(const track of clip.tracks){
  const cat=category(track.name);if(!cat||!track.times||!track.values)continue;
  const size=track.getValueSize();if(size!==3&&size!==4)continue;
  if(!/(position|quaternion)$/i.test(track.name))continue;
  const n=Math.min(track.times.length,Math.floor(track.values.length/size));if(n<2)continue;
  let used=false;
  for(let i=1;i<n;i++){
   const t=track.times[i],dt=t-track.times[i-1];if(!Number.isFinite(t)||!Number.isFinite(dt)||dt<=0||t<0||t>clip.duration+.01)continue;
   const bin=Math.max(0,Math.min(parts-1,Math.floor(((t+track.times[i-1])*.5/clip.duration)*parts)));
   const sample=magnitude(track,i);
   // Ignore oversampled tiny segments; bound their influence.
   const normalized=norm(sample * Math.min(2,.12/dt));
   accum[cat][bin]+=normalized;counts[cat][bin]++;used=true;
  }
  if(used)evidence++;
 }
 if(evidence===0)return null;
 const vectors=(Object.keys(accum) as Array<keyof typeof accum>).map(k=>accum[k].map((v,i)=>counts[k][i]?v/counts[k][i]:0));
 const [feet,posture,direction]=vectors;
 const mean=(a:number[])=>a.reduce((s,v)=>s+v,0)/a.length;
 const wave=feet.map((f,i)=>norm(f*.5+posture[i]*.35+direction[i]*.15));
 const variation=wave.reduce((s,v)=>s+Math.abs(v-mean(wave)),0)/parts;
 return {name:clip.name,index,duration:clip.duration,feet:mean(feet),posture:mean(posture),direction:mean(direction),rhythm:norm(variation*2.8),wave,evidence};
}
export function describeAnimationClipsV329(clips:readonly AnimationClip[],limit=24):PhraseSignatureV329[]{
 const out:PhraseSignatureV329[]=[];
 // Retain original clip indices, including unsupported/missing clips.
 for(let i=0;i<clips.length&&out.length<Math.max(1,Math.min(64,limit));i++){
  const sig=describePhraseV329(clips[i],i);if(sig)out.push(sig);
 }
 return out;
}
function compareV329(a:PhraseSignatureV329,b:PhraseSignatureV329,settings:PhraseSettingsV329):{score:number;shift:number}{
 const w=settings.weights,sum=Math.max(.01,w.feet+w.posture+w.direction+w.rhythm);
 const feature=(1-Math.abs(a.feet-b.feet))*w.feet+(1-Math.abs(a.posture-b.posture))*w.posture+(1-Math.abs(a.direction-b.direction))*w.direction+(1-Math.abs(a.rhythm-b.rhythm))*w.rhythm;
 let scoreWave=-Infinity,bestShift=0;
 for(let shift=0;shift<parts;shift++){
  let err=0;
  for(let i=0;i<parts;i++)err+=Math.abs(a.wave[i]-b.wave[(i+shift)%parts]);
  const score=1-err/parts;
  if(score>scoreWave){scoreWave=score;bestShift=shift;}
 }
 const confidence=.72*feature/sum+.28*scoreWave;
 const evidence=Math.min(1,Math.min(a.evidence,b.evidence)/3);
 return {score:Math.round(norm(confidence*(.78+.22*evidence))*1000)/1000,shift:bestShift};
}
/** Group-wide reproducible match. Lead defines reference phrase (prefer a dance clip).
 * Clips with insufficient data, scores below threshold and manual selections fall back.
 * A matching offset is optional, applied only by the existing V328 beat-phase clock. */
export function planGroupPhrasesV329(signatures:readonly (readonly PhraseSignatureV329[])[],count:number,settings:PhraseSettingsV329,manualIndexes:readonly number[]=[],beatCycle=4):PhraseMatchV329{
 const n=Math.max(0,Math.min(4,Math.round(count)));
 const result:PhraseMatchV329={indices:Array(n).fill(-1),offsets:Array(n).fill(0),scores:Array(n).fill(0),eligible:Array(n).fill(false),reason:'Kein kompatibles Clip-Profil'};
 if(!settings.enabled||n<2){result.reason='Deaktiviert';return result;}
 const lead=signatures[0]??[];
 // Don't substitute a manually selected lead clip; use it as the template.
 const ref=lead.find(c=>c.index===manualIndexes[0])??lead.find(c=>/dance|groove|loop|step|move/i.test(c.name))??lead[0];
 if(!ref){return result;}
 result.reason='Analyse aus lokalen Animations-Keyframes';
 for(let slot=0;slot<n;slot++){
  const clips=signatures[slot]??[];
  if(manualIndexes[slot]!==undefined&&manualIndexes[slot]>=0)continue;
  if(slot===0){result.indices[slot]=ref.index;result.scores[slot]=1;result.eligible[slot]=true;continue;}
  let best:{sig:PhraseSignatureV329;score:number;shift:number}|null=null;
  for(const sig of clips){
   const match=compareV329(ref,sig,settings);
   if(!best||match.score>best.score)best={sig,...match};
  }
  if(!best||best.score<settings.minConfidence)continue;
  result.indices[slot]=best.sig.index;
  result.scores[slot]=best.score;
  result.eligible[slot]=true;
  result.offsets[slot]=settings.alignPhase?Math.round(fract(best.shift/parts)*Math.max(1,beatCycle)*100)/100:0;
 }
 return result;
}
