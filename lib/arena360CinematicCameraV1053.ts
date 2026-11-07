/** V1053 · Intelligent Concert Camera Experience 2.0.
 * Deterministic, bounded, virtual-only camera composition on an EXISTING auto
 * shot. Authored/manual/vocal/lyric directors keep priority in both camera owners.
 * Timed lyrics inform a modest lead-facing push-in, never singer identity.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
import type {ArenaTierV1036} from './arena360AtmosphereV1036';
import type {Lyrics} from '../types/playbackCore';
export type ConcertCameraMotionV1053='sweep'|'crane'|'wide'|'lead';
export type ConcertCameraCueV1053={active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'clock'|'planned';
 mode:ConcertCameraMotionV1053;seconds:number;gain:number;lyricAccent:boolean;};
const OFF:ConcertCameraCueV1053=Object.freeze({active:false,reason:'disabled',mode:'wide',seconds:0,gain:0,lyricAccent:false});
const clamp=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
/** A bounded O(log lines + words) lookup. Line-only timestamps do NOT imply a vocalist. */
export function hasTimedVocalAccentV1053(lyrics:Lyrics|null|undefined,ms:number):boolean{
 if(!lyrics?.synced||!Number.isFinite(ms)||ms<0||!Array.isArray(lyrics.lines))return false;
 let low=0,high=lyrics.lines.length-1,index=-1;
 while(low<=high){const mid=(low+high)>>>1;if(lyrics.lines[mid].startMs<=ms){index=mid;low=mid+1;}else high=mid-1;}
 if(index<0)return false;
 const line=lyrics.lines[index],next=lyrics.lines[index+1];
 const lineEnd=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
   next?.startMs??Infinity,line.startMs+12000);
 if(ms>=lineEnd||!line.words?.length)return false;
 // Restrict to existing word-level timestamps. Do not fabricate a singer or phoneme.
 let active=-1;
 for(let i=0;i<line.words.length;i++){
  const word=line.words[i];
  if(Number.isFinite(word.startMs)&&word.startMs<=ms)active=i;
  else if(word.startMs>ms)break;
 }
 if(active<0)return false;
 const word=line.words[active],following=line.words[active+1];
 const end=Math.min(lineEnd,word.endMs!=null&&word.endMs>word.startMs?word.endMs:Infinity,
  following?.startMs??Infinity,word.startMs+2100);
 if(ms>=end||!/[a-zäöüß]{3}/i.test(word.text)||/^\[[^\]]+\]$/.test(word.text.trim()))return false;
 // An end-of-phrase/long word accent, not a cut every rap syllable.
 return active===line.words.length-1||/[!?.,…:]$/.test(word.text.trim())||word.text.replace(/[^a-zäöüß]/gi,'').length>=7;
}
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
export function planArenaCinematicCameraV1053(input:{enabled:boolean;stageIsArena:boolean;cameraEnabled:boolean;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean;reactive?:boolean;
 show?:ArenaShowCueV1040|null;trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number;performanceTier?:ArenaTierV1036|null;lyrics?:Lyrics|null;lyricsPlaying?:boolean;
}):ConcertCameraCueV1053{
 if(!input.enabled||!input.stageIsArena||!input.cameraEnabled||input.reactive===false||
  !input.show?.active)return OFF;
 if(!input.playing)return {...OFF,reason:'paused'};
 if(input.reducedMotion||input.performanceTier==='low')return {...OFF,reason:'motion'};
 if(input.manualPriority)return {...OFF,reason:'manual'};
 const ms=input.progressMs, duration=input.durationMs;
 if(!input.trackId||!Number.isFinite(ms)||!Number.isFinite(duration)||
  (ms??-1)<0||(duration??0)<30000||(ms??0)>(duration??0))return {...OFF,reason:'clock'};
 const gain=clamp((input.strength??50)/100,0,.8)*clamp(input.show.intensity/100,0,1)*clamp(input.show.fade,0,1)*
  (input.performanceTier==='balanced'?.72:1);
 if(gain<=.0001)return OFF;
 const seconds=(ms??0)/1000;
 const lyricAccent=input.lyricsPlaying===true&&hasTimedVocalAccentV1053(input.lyrics,ms??0);
 // Stable per-track motif. Shots change only over multi-second spans, never per beat.
 const motif=(hash(input.trackId)+Math.floor(seconds/18))%3;
 const mode:ConcertCameraMotionV1053=lyricAccent?'lead':
   input.show.scene==='interlude'?'wide':
   input.show.scene==='finale'?'crane':
   motif===0?'sweep':motif===1?'crane':'wide';
 return {active:true,reason:'planned',mode,seconds,gain,lyricAccent};
}
/** Small smooth offsets; no new camera, animation loop, event or frame allocation. */
export function composeArenaCinematicCameraV1053<T extends {x:number;y:number;z:number;fov:number;
 targetX?:number;targetY:number;targetZ?:number}>(pose:T,cue?:ConcertCameraCueV1053|null,protectedShot=false):T{
 if(!cue?.active||protectedShot||!
  [pose.x,pose.y,pose.z,pose.fov,pose.targetY,cue.seconds,cue.gain].every(Number.isFinite))return pose;
 const g=clamp(cue.gain,0,.8),tx=Number.isFinite(pose.targetX)?pose.targetX!:0,
  tz=Number.isFinite(pose.targetZ)?pose.targetZ!:0;
 const dx=pose.x-tx,dz=pose.z-tz,dist=Math.hypot(dx,dz);
 if(dist<3.5||dist>28||g<=0)return pose;
 const slow=Math.sin(cue.seconds*.12),rise=Math.sin(cue.seconds*.08);
 let angle=0,scale=1,y=pose.y,targetY=pose.targetY,fov=pose.fov;
 if(cue.mode==='lead'){
  // Lead framing only (never assume which artist is actually singing).
  scale=1-.095*g;targetY+=.13*g;fov-=2.5*g;
 }else if(cue.mode==='sweep'){
  angle=slow*g*.19;y+=g*.14;fov+=g*.6;
 }else if(cue.mode==='crane'){
  angle=slow*g*.09;y+=g*(.25+.10*rise);fov+=g*1.1;
 }else{
  scale=1+g*.075;y+=g*.06;fov+=g*1.5;
 }
 const c=Math.cos(angle),s=Math.sin(angle);
 return {...pose,x:tx+(dx*c-dz*s)*scale,z:tz+(dx*s+dz*c)*scale,y,
  targetY,fov:clamp(fov,28,65)};
}
