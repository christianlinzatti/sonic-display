/** V1054 · Advanced Avatar Performance Intelligence.
 * A pure adapter for the existing V1041 duo/procedural dancers. No new mixers,
 * bones, clips, skeletal retargeting, audio detector, camera or network owner.
 * Show segments are *authored templates*, not measured musical structure.
 */
import type {ArenaChoreoCueV1041} from './arena360ChoreographyV1041';
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
import type {Lyrics} from '../types/playbackCore';

export type AvatarPerformanceStyleV1054='breathe'|'flow'|'rap-accent'|'vocal-swell'|'ensemble';
export type AvatarPerformanceCueV1054={
 active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'performance'|'clock'|'show'|'planned';
 style:AvatarPerformanceStyleV1054;phrase:number;blend:number;wordTimed:boolean;
 armGain:number;bodyGain:number;choreography:ArenaChoreoCueV1041;
};
const bounded=(value:unknown,min:number,max:number,otherwise:number):number=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):otherwise;
const ease=(value:number)=>{const t=bounded(value,0,1,0);return t*t*(3-2*t);};
function hashSong(id:string):number{
 let n=2166136261;for(let j=0;j<Math.min(id.length,256);j++)n=Math.imul(n^id.charCodeAt(j),16777619)>>>0;
 return n;
}
/** Do not infer which person sings, detect phonemes, or infer a musical drop.
 * Word timestamps are accepted only while the corresponding synced line is current.
 * Unsynced lyrics and line-only timestamps are not vocal gesture evidence.
 */
export function timedWordGestureV1054(lyrics:Lyrics|null|undefined,atMs:number):
 {kind:'rap-accent'|'vocal-swell';strength:number}|null{
 if(!lyrics?.synced||!Number.isFinite(atMs)||atMs<0||!Array.isArray(lyrics.lines))return null;
 const lines=lyrics.lines;
 // V1054 is called during playback: a binary search avoids scanning the full song every frame.
 let low=0,high=lines.length;
 while(low<high){const mid=(low+high)>>>1;if(lines[mid].startMs<=atMs)low=mid+1;else high=mid;}
 const index=low-1;if(index<0)return null;
 const line=lines[index],next=lines[index+1];
 if(!Number.isFinite(line.startMs)||!Array.isArray(line.words)||line.words.length===0)return null;
 const lineEnd=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
  next?.startMs??Infinity,line.startMs+12000);
 if(atMs>=lineEnd)return null;
 let wordIndex=-1;
 for(let i=0;i<line.words.length;i++){
  const w=line.words[i];if(!Number.isFinite(w.startMs))return null;
  if(w.startMs<=atMs)wordIndex=i;else break;
 }
 if(wordIndex<0)return null;
 const word=line.words[wordIndex],nextWord=line.words[wordIndex+1];
 const until=Math.min(lineEnd,word.endMs!=null&&word.endMs>word.startMs?word.endMs:Infinity,
  nextWord?.startMs??Infinity,word.startMs+2000);
 if(atMs>=until||until-word.startMs<120||!/\p{L}{2,}/u.test(word.text))return null;
 const sustain=until-word.startMs>=650;
 const elapsed=atMs-word.startMs;
 const attack=ease(elapsed/(sustain?170:95)),release=ease((until-atMs)/(sustain?240:130));
 const value=attack*release;
 if(value<.02)return null;
 return {kind:sustain?'vocal-swell':'rap-accent',strength:value};
}
const neutral=(base:ArenaChoreoCueV1041,reason:AvatarPerformanceCueV1054['reason']):AvatarPerformanceCueV1054=>({
 active:false,reason,style:'breathe',phrase:base.phrase,blend:0,wordTimed:false,
 armGain:1,bodyGain:1,choreography:base,
});
/** Blend small expressive accents onto the existing approved V1041 cue.
 * User-authored formations, vocal casting, existing clip selection and foot IK win.
 * In absence of verified lyric words use only genre-labeled *visual motifs*.
 */
export function planAvatarPerformanceV1054(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;reactive?:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 base:ArenaChoreoCueV1041;show?:ArenaShowCueV1040|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 genre?:string|null;strength?:number|null;lyrics?:Lyrics|null;lyricsPlaying?:boolean;
}):AvatarPerformanceCueV1054{
 const base=input.base;
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return neutral(base,'disabled');
 if(!input.playing)return neutral(base,'paused');
 if(input.reducedMotion)return neutral(base,'motion');
 if(input.manualPriority)return neutral(base,'manual');
 if(input.performanceTier==='low')return neutral(base,'performance');
 const ms=input.progressMs,all=input.durationMs;
 if(typeof input.trackId!=='string'||!input.trackId.trim()||!Number.isFinite(ms)||
  !Number.isFinite(all)||(all??0)<30000||(ms??-1)<0||(ms??0)>(all??0))return neutral(base,'clock');
 if(!base.active||!input.show?.active||input.show.intensity<=0||input.show.fade<=0)
  return neutral(base,'show');
 const amount=bounded(input.strength,0,80,55)/100*(input.performanceTier==='balanced'?.65:1);
 if(amount===0)return neutral(base,'disabled');
 const progress=ms??0,phaseMs=8000;
 const phrase=Math.floor(progress/phaseMs);
 const seed=hashSong(input.trackId),pattern=(phrase+(seed%4))%4;
 const vocal=input.lyricsPlaying===true?timedWordGestureV1054(input.lyrics,progress):null;
 const busy=input.show.dance==='peak'||input.show.dance==='group';
 const quiet=input.show.dance==='calm'||input.show.scene==='interlude';
 const rap=/rap|trap|hip.?hop|deutschrap/i.test(input.genre??'');
 // A 550ms phrase onset ramp prevents visual jerks at 8s template boundaries.
 const phraseBlend=ease((progress%phaseMs)/550);
 const intensity=bounded(input.show.intensity/100,0,1,0)*bounded(input.show.fade,0,1,0);
 const blend=bounded(amount*intensity*phraseBlend,0,.8,0);
 const style:AvatarPerformanceStyleV1054=quiet?'breathe':vocal?.kind??
   (busy?'ensemble':rap&&pattern%2===0?'rap-accent':'flow');
 // Motif variation is deterministic, not falsely detected audio onset.
 const motif=[.60,.85,.72,1][pattern];
 const vocalWeight=vocal?(.50+.50*vocal.strength):.65;
 const shape=style==='breathe'?.15:style==='ensemble'?.75:style==='flow'?.55:
  style==='vocal-swell'?.72:.90;
 const accent=blend*motif*shape*vocalWeight;
 // Gains never exceed the original V1041 safety envelope (1.18).
 const leadGain=Math.min(1.18,Math.max(0,base.leadGain+accent*.10));
 const partnerGain=Math.min(1.18,Math.max(0,base.partnerGain+
  accent*(style==='ensemble'?.10:style==='vocal-swell'?.035:.025)));
 const armGain=bounded(1+accent*.18,1,1.13,1);
 const bodyGain=bounded(quiet?1-accent*.12:1+accent*.055,.90,1.06,1);
 // Only pulse existing response/intensity values. Never replace a saved formation,
 // clip, role, body joint, partner spacing, sync marker or real beat event.
 // During a confirmed word interval, an otherwise delayed partner can gently
 // rejoin the lead. This never forces a singer slot or changes a user formation.
 const partnerDelayBeats=base.partnerDelayBeats>0 && vocal && !quiet
   ?Math.max(0,base.partnerDelayBeats-.12*blend*vocal.strength):base.partnerDelayBeats;
 const choreography:ArenaChoreoCueV1041={...base,leadGain,partnerGain,partnerDelayBeats};
 return {active:true,reason:'planned',style,phrase,blend,wordTimed:!!vocal,
  armGain,bodyGain,choreography};
}
