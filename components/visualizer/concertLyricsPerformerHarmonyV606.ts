/** V606 – shared lyrical/performer framing. The same verified playback evidence
 * drives DOM lyrics and a bounded final R3F camera pass. No syllable/voice or
 * section inference, new clocks, DOM reads, camera objects or persistent edits.
 */
import type {LyricLine} from '@/types/music';
import type {ConcertSceneV528 as Scene,CameraPoseV528 as Pose,ConcertAnchorV528 as Anchor} from './cinematicConcertCoordinationV528';
import type {NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type HarmonyModeV606='quiet'|'rap-focus'|'duet'|'hook';
export type LyricsHarmonyV606={mode:HarmonyModeV606;active:boolean;dense:boolean;
 widthCh:number;plateBoost:number;motionGain:number;hookAccent:number;
 confirmedLead:boolean;confirmedDuet:boolean; verifiedWords:boolean;};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const ease=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
const quiet:LyricsHarmonyV606={mode:'quiet',active:false,dense:false,widthCh:60,plateBoost:0,motionGain:1,hookAccent:0,confirmedLead:false,confirmedDuet:false,verifiedWords:false};
/** Strict line/word timing is required for a playback-aware visual accent.
 * A V604 hook is used only with a verified section, not from lyric words.
 */
export function planConcertLyricsHarmonyV606(o:{
 line:LyricLine|null|undefined;nextLineStart?:number;progressMs:number;playing:boolean;
 synchronized:boolean;reducedMotion:boolean;immersive:boolean;cast:number;
 trackId?:string;scene?:Scene|null;cue?:NarrativeCueV604|null;
 hookSection?:boolean;wordHighlight?:boolean;
}):LyricsHarmonyV606{
 const line=o.line,ms=o.progressMs;
 if(!o.playing||!o.synchronized||!line||!finite(ms)||!finite(line.startMs)||
   !Number.isInteger(o.cast)||o.cast<1||o.cast>4)return quiet;
 const end=[line.endMs,o.nextLineStart].filter((v):v is number=>finite(v)&&v>line.startMs);
 const lineEnd=end.length?Math.min(...end):line.startMs+8000;
 if(ms<line.startMs||ms>=lineEnd||lineEnd<=line.startMs)return quiet;
 const glyphs=[...line.text.trim()].length;
 const dense=glyphs>(o.immersive?47:75)||(line.text.match(/\S+/gu)??[]).some(w=>[...w].length>25);
 const validScene=Boolean(o.scene?.active&&o.scene.trackId&&o.scene.trackId===o.trackId&&
   o.scene.count===o.cast&&ms>=o.scene.cueStartMs&&ms<o.scene.cueEndMs&&
   Number.isInteger(o.scene.leadSlot)&&o.scene.leadSlot>=0&&o.scene.leadSlot<o.cast&&
   o.scene.singingSlots?.includes(o.scene.leadSlot));
 const confirmedDuet=validScene&&o.cast>=2&&o.scene!.focus==='handoff'&&
   o.scene!.handoffFrom!==null&&o.scene!.handoffFrom!==o.scene!.leadSlot&&
   o.scene!.singingSlots.includes(o.scene!.handoffFrom);
 const confirmedHook=Boolean(o.hookSection&&o.cue?.active&&o.cue.source==='verified-v600'&&
   o.cue.chapter==='payoff'&&o.cue.transition>0&&o.cue.transition<=1);
 const mode:HarmonyModeV606=confirmedHook?'hook':confirmedDuet?'duet':'rap-focus';
 const times=(o.wordHighlight?line.words??[]:[]).filter(w=>finite(w.startMs)&&w.startMs>=line.startMs&&
   w.startMs<lineEnd&&typeof w.text==='string'&&w.text.trim());
 const verifiedWords=Boolean(o.wordHighlight&&!o.reducedMotion&&times.length>0&&times.length===(line.words??[]).length&&
   times.every((w,i)=>i===0||w.startMs>=times[i-1].startMs));
 const fade=ease((ms-line.startMs)/200)*ease((lineEnd-ms)/260);
 const strength=o.reducedMotion?0:fade;
 const crowded=o.immersive&&o.cast>=3;
 const widthCh=dense?(crowded?34:42):crowded?40:o.immersive?47:60;
 return {mode,active:true,dense,widthCh,
   // Static legibility remains even when reduced motion is requested.
   plateBoost:o.immersive?(dense?.10:confirmedDuet?.07:.04):dense?.055:0,
   motionGain:1-strength*(dense?.36:confirmedDuet?.27:.16),
   hookAccent:confirmedHook?strength*(dense?.07:.17):0,
   confirmedLead:validScene,confirmedDuet,verifiedWords};
}
/** A visual-only accent; never alters or replaces the established karaoke fill. */
export function lyricHarmonyWordAccentV606(line:LyricLine,wi:number,ms:number,plan:LyricsHarmonyV606):number{
 if(!plan.active||!plan.verifiedWords||!finite(ms)||!Number.isInteger(wi))return 0;
 const w=line.words?.[wi];if(!w||!finite(w.startMs))return 0;
 const possible=[w.endMs,line.words?.[wi+1]?.startMs,line.endMs].filter((v):v is number=>finite(v)&&v>w.startMs);
 if(!possible.length)return 0;
 const end=Math.min(...possible);
 if(ms<w.startMs||ms>=end)return 0;
 return Math.min(.21,ease((ms-w.startMs)/90)*ease((end-ms)/105)*(plan.mode==='hook'?.21:.13));
}
/** One small extra camera correction, AFTER V605 and BEFORE the V351 guard.
 * Actual visible anchor bounds and two established frame meters must approve it.
 * This does not assume a 3D bounding box from lyrics DOM geometry.
 */
export function composeConcertHarmonyCameraV606(pose:Pose,plan:LyricsHarmonyV606,
 anchors:readonly Anchor[],scene:Scene|null|undefined,o:{
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 automatic:boolean;authored:boolean;aspect:number;quality:'low'|'balanced'|'high';
 lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;cue?:NarrativeCueV604|null;
}):Pose{
 if(!o.playing||o.reducedMotion||!o.automatic||o.authored||o.quality==='low'||
   !plan.active||!o.lyricsProtected||!finite(o.aspect)||o.aspect<.55||o.aspect>3.5||
   !o.trackId||!finite(o.progressMs)||!o.cue?.active||o.cue.source!=='verified-v600'||
   o.cue.transition<=0||!Array.isArray(anchors)||!anchors.length||anchors.length>4||
   ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
   pose.fov<28||pose.fov>76)return pose;
 if(anchors.some(a=>!a.visible||!Number.isInteger(a.slot)||a.slot<0||a.slot>=4||
    ![a.x,a.y,a.z].every(finite))||new Set(anchors.map(a=>a.slot)).size!==anchors.length)return pose;
 const side=o.lyricsSide??null;
 const base=measureConcertFrameV550(pose,anchors,o.aspect,side,true);
 const screen=measureScreenFrameV540(pose,anchors,o.aspect,side);
 if(!base||!screen)return pose;
 // Extra breathing room is most useful for fast dense rap and actual duet shots.
 const focus=plan.confirmedDuet&&scene?.active&&scene.trackId===o.trackId&&
   scene.count===anchors.length&&scene.singingSlots.includes(scene.leadSlot)&&
   scene.handoffFrom!==null&&scene.singingSlots.includes(scene.handoffFrom)
    ?[scene.leadSlot,scene.handoffFrom]:[];
 const positions=focus.map(slot=>anchors.find(a=>a.slot===slot)).filter((v):v is Anchor=>Boolean(v));
 if(focus.length&&!positions.length)return pose;
 const center=positions.length===2?(positions[0].x+positions[1].x)/2:
   anchors.reduce((n,a)=>n+a.x,0)/anchors.length;
 const power=o.cue.transition*(o.quality==='balanced'?.48:1);
 const dx=pose.x-(pose.targetX??0),dy=pose.y-pose.targetY,dz=pose.z-(pose.targetZ??0);
 const distance=Math.hypot(dx,dy,dz);if(!finite(distance)||distance<.1)return pose;
 const widen=(plan.dense?.036:plan.mode==='duet'?.026:plan.mode==='hook'?.027:.012)*power;
 const shift=clamp(center-(pose.targetX??0),-.18,.18)*power*.13;
 const targetX=(pose.targetX??0)+shift;
 const ratio=1+widen;
 const next:Pose={...pose,targetX,x:targetX+dx*ratio,y:pose.targetY+dy*ratio,
    z:(pose.targetZ??0)+dz*ratio,fov:clamp(pose.fov+(plan.dense?.35:.16)*power,28,76)};
 const after=measureConcertFrameV550(next,anchors,o.aspect,side,true);
 const afterScreen=measureScreenFrameV540(next,anchors,o.aspect,side);
 if(!after||!afterScreen||after.overflow>base.overflow+1e-6||
   after.headOverflow>base.headOverflow+1e-6||
   after.fullBodyOverflow>base.fullBodyOverflow+1e-6||
   afterScreen.overflow>screen.overflow+1e-6)return pose;
 return next;
}
/** O(log n) camera-side lookup, avoids array scans inside useFrame. */
export function activeLyricLineV606(lines:readonly LyricLine[],ms:number):{line:LyricLine;next?:number}|null{
 if(!finite(ms)||!Array.isArray(lines)||!lines.length)return null;
 let lo=0,hi=lines.length;
 while(lo<hi){const mid=(lo+hi)>>1;if(lines[mid].startMs<=ms)lo=mid+1;else hi=mid;}
 const line=lines[lo-1],next=lines[lo]?.startMs;
 if(!line||!finite(line.startMs)||ms<line.startMs||
    (finite(next)&&ms>=next)||(finite(line.endMs)&&ms>=line.endMs))return null;
 return {line,next};
}
