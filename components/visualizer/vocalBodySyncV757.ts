/** V757 – Vocal & Body Synchronization 3.0.
 * Pure, seek-safe additive overlay: responds to verified word timing and the
 * ALREADY resolved vocal (mouth-activity) cue. Does not derive phonemes, modify
 * face/mouth morphs, infer a recorded singer or touch foot IK / mixer clips.
 */
import type {VocalStageCueV746,VocalRoleV746} from './vocalPerformanceDirectorV746';
export type VocalBodySyncSettingsV757={enabled:boolean;strength:number;head:number;gestures:number;rapidControl:number};
export const DEFAULT_VOCAL_BODY_SYNC_V757:Readonly<VocalBodySyncSettingsV757>={
  enabled:true,strength:55,head:65,gestures:60,rapidControl:75,
};
export type WordMarkV757={text:string;startMs:number;endMs?:number|null};
export type TimedLineV757={startMs:number;endMs?:number|null;words?:readonly WordMarkV757[]|null};
export type VocalBodySyncInputV757={
  settings?:Partial<VocalBodySyncSettingsV757>|null;
  body:VocalStageCueV746;role:VocalRoleV746;playing:boolean;reducedMotion:boolean;
  manualBodyPriority:boolean;bodyEnabled:boolean;gesturesEnabled:boolean;
  lyricSynced:boolean;lines?:readonly TimedLineV757[]|null;
  effectiveTimeMs:number;activeWord?:string|null;
  vocalConfidence:'none'|'line'|'word';vocalStyle:'silent'|'line'|'rap'|'singing';
  mouthActivity:number;focus:number;genre?:string|null;
};
export type VocalBodySyncResultV757={active:boolean;body:VocalStageCueV746;phase:'none'|'onset'|'body'|'release';wordStartMs:number;amount:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const unit=(n:number)=>clamp(n,0,1);
const ease=(n:number)=>{const t=unit(n);return t*t*(3-2*t);};
const clean=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
export function normalizeVocalBodySyncV757(raw?:Partial<VocalBodySyncSettingsV757>|null):VocalBodySyncSettingsV757{
  const pct=(x:unknown,fallback:number)=>finite(x)?Math.round(clamp(x,0,100)):fallback;
  return {enabled:raw?.enabled===undefined?true:raw.enabled===true,
    strength:pct(raw?.strength,55),head:pct(raw?.head,65),gestures:pct(raw?.gestures,60),
    rapidControl:pct(raw?.rapidControl,75)};
}
/** Exact provider timestamp evidence. Never extrapolate an end across a missing
 * word boundary or across a gap; avoids made-up syllables and late mouth cues. */
export function timedVocalWordV757(lines:readonly TimedLineV757[]|null|undefined,ms:number,activeWord:string):
  {startMs:number;endMs:number;rapid:boolean;phraseEnd:boolean}|null{
  if(!finite(ms)||ms<0||!activeWord.trim()||!lines)return null;
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!finite(line.startMs)||line.startMs<0||ms<line.startMs)continue;
    const nextLine=lines[i+1]?.startMs;
    const lineEnd=finite(line.endMs)&&line.endMs>line.startMs?line.endMs:
      finite(nextLine)&&nextLine>line.startMs?nextLine:NaN;
    if(!finite(lineEnd)||ms>=lineEnd)continue;
    const words=(line.words??[]).filter(w=>typeof w?.text==='string'&&!!w.text.trim()&&
      finite(w.startMs)&&w.startMs>=line.startMs&&w.startMs<lineEnd&&
      (w.endMs==null||finite(w.endMs)&&w.endMs>w.startMs)).slice().sort((a,b)=>a.startMs-b.startMs);
    for(let j=0;j<words.length;j++){
      const word=words[j],next=words[j+1];
      const explicit=word.endMs;
      const end=finite(explicit)?explicit:next?.startMs;
      if(!finite(end)||end<=word.startMs||end>lineEnd||end-word.startMs>2100||
        (next&&end>next.startMs)||ms<word.startMs||ms>=end||clean(word.text)!==clean(activeWord))continue;
      const previous=words[j-1];
      const duration=end-word.startMs;
      const previousEnd=previous?.endMs;
      const previousGap=previous&&finite(previousEnd)?word.startMs-previousEnd:Infinity;
      const nextGap=next?next.startMs-end:Infinity;
      return {startMs:word.startMs,endMs:end,rapid:duration<340||previousGap>=0&&previousGap<90||nextGap>=0&&nextGap<90,
        phraseEnd:!next||/[!?.,:]$/.test(word.text)};
    }
  }
  return null;
}
/** Returns a modified V371 body cue; existing V371 smoother remains the only
 * transform writer. The maximum V757 increment per channel is deliberately
 * lower than the existing V746 envelope and never touches eye, jaw or pelvis. */
export function directVocalBodySyncV757(input:VocalBodySyncInputV757):VocalBodySyncResultV757{
  const off:VocalBodySyncResultV757={active:false,body:input.body,phase:'none',wordStartMs:-1,amount:0};
  const s=normalizeVocalBodySyncV757(input.settings);
  if(!s.enabled||s.strength===0||!input.playing||input.reducedMotion||input.manualBodyPriority||
    !input.bodyEnabled||input.role!=='singer'||!input.lyricSynced||input.vocalConfidence!=='word'||
    input.vocalStyle==='silent'||input.vocalStyle==='line'||!finite(input.effectiveTimeMs)||
    !finite(input.mouthActivity)||!finite(input.focus))return off;
  const word=timedVocalWordV757(input.lines,input.effectiveTimeMs,input.activeWord??'');
  if(!word)return off;
  const duration=word.endMs-word.startMs;
  const elapsed=input.effectiveTimeMs-word.startMs,remaining=word.endMs-input.effectiveTimeMs;
  const attackMs=Math.min(120,Math.max(45,duration*.28));
  const releaseMs=Math.min(135,Math.max(45,duration*.32));
  const onset=(1-ease(elapsed/attackMs))*ease(remaining/Math.min(25,duration*.2));
  const release=(1-ease(remaining/releaseMs))*ease(elapsed/Math.min(25,duration*.2));
  const phase=onset>.08&&onset>=release?'onset':release>.08?'release':'body';
  // The mouth cue is used solely as a *correlation gate*; no facial channel is written.
  const activity=unit(input.mouthActivity*.78+input.focus*.22);
  if(activity<=.002)return off;
  const rap=input.vocalStyle==='rap'||/deutschrap|hip.?hop|drill|trap/i.test(input.genre??'');
  const rapidGain=word.rapid?1-.68*s.rapidControl/100:1;
  const impulse=clamp((.28+.72*onset+.16*(word.phraseEnd?release:0))*rapidGain,0,1);
  const amount=unit(s.strength/100*activity*impulse*(rap?1:.72));
  if(amount<=.000001)return off;
  const head=amount*s.head/100,arms=amount*(input.gesturesEnabled?s.gestures/100:0);
  const sign=Math.round(word.startMs/100)%2===0?1:-1;
  const base=input.body;
  const body:VocalStageCueV746={...base,
    headPitch:clamp(base.headPitch-.044*head,-.18,.18),
    headYaw:clamp(base.headYaw+sign*.012*head,-.20,.20),
    headTilt:clamp(base.headTilt-sign*.012*head,-.16,.16),
    chestLean:clamp(base.chestLean+(rap?-.028:.012)*arms,-.15,.15),
    leftArm:clamp(base.leftArm-sign*.050*arms,-.20,.20),
    rightArm:clamp(base.rightArm+sign*.050*arms,-.20,.20),
  };
  return {active:true,body,phase,wordStartMs:word.startMs,amount};
}
