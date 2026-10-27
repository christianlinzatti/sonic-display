/** V605 – verified whole-song camera finishing on the EXISTING R3F camera.
 * Small deterministic tracking, portrait/duet/wide variations from V604's
 * confirmed authored timeline. No vocalist inference, new render loop or cuts.
 */
import type {CameraPoseV528 as Pose,ConcertAnchorV528 as Anchor,ConcertSceneV528 as Scene} from './cinematicConcertCoordinationV528';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import {narrativeActAtV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';
export type FullSongCameraOptionsV605={
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';
 aspect:number;lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;
};
const finite=(v:number)=>Number.isFinite(v);
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const valid=(p:Pose)=>[p.x,p.y,p.z,p.targetY,p.targetX??0,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;
/** This is an enhancement of a camera pose, not a new shot planner. */
export function composeFullSongCameraV605(pose:Pose,plan:NarrativePlanV604|null|undefined,
 cue:NarrativeCueV604|null|undefined,roots:readonly Anchor[],scene:Scene|null|undefined,
 o:FullSongCameraOptionsV605):Pose{
 if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
   !plan||plan.source!=='verified-v600'||!cue?.active||cue.source!=='verified-v600'||
   !o.trackId||plan.trackId!==o.trackId||!finite(o.progressMs)||!valid(pose)||
   !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||cue.transition<=0||cue.transition>1||
   !Array.isArray(roots)||!roots.length||roots.length>4)return pose;
 const act=narrativeActAtV604(plan,o.progressMs);
 if(!act||cue.act!==act.index||cue.chapter!==act.chapter||cue.motif!==act.motif||
   cue.repetition!==act.repetition||act.endMs-act.startMs<2600)return pose;
 const cast=roots.filter(r=>r.visible&&Number.isInteger(r.slot)&&r.slot>=0&&r.slot<4&&
   [r.x,r.y,r.z].every(finite)&&Math.max(Math.abs(r.x),Math.abs(r.y),Math.abs(r.z))<40);
 if(cast.length!==roots.length||new Set(cast.map(c=>c.slot)).size!==cast.length)return pose;
 const side=o.lyricsProtected?o.lyricsSide??null:null;
 const before=measureConcertFrameV550(pose,cast,o.aspect,side,o.lyricsProtected);
 const before540=measureScreenFrameV540(pose,cast,o.aspect,side);
 if(!before||!before540)return pose;
 const dur=act.endMs-act.startMs;
 // In/out curves make the extra movement disappear at section boundaries and gaps.
 const boundary=Math.min(2300,dur*.24);
 const fade=smooth((o.progressMs-act.startMs)/boundary)*smooth((act.endMs-o.progressMs)/boundary);
 const gain=fade*cue.transition*(o.quality==='balanced'?.53:1)*(o.lyricsProtected?.38:1);
 if(gain<.005)return pose;
 const center=cast.reduce((a,r)=>a+r.x,0)/cast.length;
 const lead=scene?.active&&scene.trackId===o.trackId&&
   o.progressMs>=scene.cueStartMs&&o.progressMs<scene.cueEndMs&&
   scene.count===cast.length&&scene.singingSlots.includes(scene.leadSlot)
   ?cast.find(a=>a.slot===scene.leadSlot):undefined;
 const participants=scene?.active&&scene.trackId===o.trackId&&
   scene.focus==='handoff'&&scene.handoffFrom!==null&&lead
   ?cast.find(a=>a.slot===scene.handoffFrom):undefined;
 const isPortrait=cue.motif==='portrait'&&!!lead;
 const isDialogue=cue.motif==='dialogue'&&!!lead&&!!participants;
 const isWide=['ensemble','wide','crescendo'].includes(cue.motif);
 // Only *verified* vocalist roles can be tracked. Otherwise keep a stage-wide
 // view without guessing who is rapping from Spotify imagery/lyrics.
 const focusX=isPortrait?lead!.x:isDialogue?(lead!.x+participants!.x)/2:center;
 const phase=(o.progressMs-act.startMs)/dur;
 const orbitSign=act.repetition%2===0?1:-1;
 const drift=(isWide?.07:isPortrait?.035:.045)*Math.sin(phase*Math.PI*2)*orbitSign;
 const shift=clamp(focusX-(pose.targetX??0),-.24,.24)*gain*.28+drift*gain;
 const targetX=(pose.targetX??0)+clamp(shift,-.12,.12);
 const depthRatio=1+(isWide?.055:isDialogue?.025:isPortrait?-.025:0)*gain;
 const offsetX=pose.x-(pose.targetX??0),offsetY=pose.y-pose.targetY;
 const offsetZ=pose.z-(pose.targetZ??0);
 const next:Pose={...pose,targetX,x:targetX+offsetX*depthRatio,
   y:pose.targetY+offsetY*depthRatio,
   z:(pose.targetZ??0)+offsetZ*depthRatio,
   fov:clamp(pose.fov+(isWide?.5:isPortrait?-.35:0)*gain,28,76)};
 const after=measureConcertFrameV550(next,cast,o.aspect,side,o.lyricsProtected);
 const after540=measureScreenFrameV540(next,cast,o.aspect,side);
 if(!after||!after540||after.overflow>before.overflow+1e-6||
   after.headOverflow>before.headOverflow+1e-6||
   after.fullBodyOverflow>before.fullBodyOverflow+1e-6||
   after540.overflow>before540.overflow+1e-6)return pose;
 return next;
}
