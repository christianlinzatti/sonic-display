/** V613 – deterministic, evidence-bound shot cadence on the existing R3F camera.
 * Reuses VERIFIED V604 acts and the existing V528 performer anchors. No camera
 * cuts, singer inference, secondary music clock, GLB or lyric timing changes.
 */
import type {CameraPoseV528 as Pose,ConcertAnchorV528 as Anchor,ConcertSceneV528 as Scene} from './cinematicConcertCoordinationV528';
import type {NarrativePlanV604,NarrativeCueV604,NarrativeActV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type ConcertShotV613='hold'|'wide'|'push'|'left'|'right'|'portrait';
export type ShotPacingOptionsV613={
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';aspect:number;
 lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;
 energy:number;kick:number;
};
export type ShotPacingCueV613={active:boolean;act:number;shot:ConcertShotV613;previous:ConcertShotV613;
 mix:number;gain:number;slot:number};
const idle:ShotPacingCueV613={active:false,act:-1,shot:'hold',previous:'hold',mix:0,gain:0,slot:-1};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const finite=(n:number)=>Number.isFinite(n);
const ease=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
const validPose=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;

/** A director's *visual* hold length is NOT interpreted as a musical beat.
 * The pattern is deterministic, song-time-based and alternates between acts.
 */
const verseShots:readonly ConcertShotV613[]=['portrait','left','portrait','right'];
const hookShots:readonly ConcertShotV613[]=['wide','left','wide','right'];
const buildShots:readonly ConcertShotV613[]=['hold','push','left','push'];
const dropShots:readonly ConcertShotV613[]=['wide','right','wide','left'];
function shotAt(act:NarrativeActV604,slot:number):ConcertShotV613{
 if(act.section==='break')return 'hold';
 const index=(act.index+act.repetition+slot)%4;
 if(act.section==='verse')return verseShots[index];
 if(act.section==='hook')return hookShots[index];
 if(act.section==='build')return buildShots[index];
 if(act.section==='drop')return dropShots[index];
 return 'hold';
}

export function planConcertShotPacingV613(plan:NarrativePlanV604|null|undefined,
 cue:NarrativeCueV604|null|undefined,o:ShotPacingOptionsV613):ShotPacingCueV613{
 if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
   !plan||plan.source!=='verified-v600'||!cue?.active||cue.source!=='verified-v600'||
   !o.trackId||o.trackId!==plan.trackId||!finite(plan.durationMs)||plan.durationMs<=0||
   !finite(o.progressMs)||o.progressMs<0||o.progressMs>=plan.durationMs||
   !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length||
   !finite(cue.transition)||cue.transition<=0||cue.transition>1||
   !finite(o.energy)||!finite(o.kick)||o.energy<0||o.energy>1||o.kick<0||o.kick>1||
   !finite(o.aspect)||o.aspect<.55||o.aspect>3.5)return idle;
 const act=plan.acts[cue.act];
 if(!act||act.index!==cue.act||act.chapter!==cue.chapter||act.motif!==cue.motif||
   act.repetition!==cue.repetition||!finite(act.startMs)||!finite(act.endMs)||
   act.startMs<0||act.endMs>plan.durationMs||act.endMs-act.startMs<5200||
   o.progressMs<act.startMs||o.progressMs>=act.endMs||
   !['verse','hook','build','drop','break'].includes(act.section))return idle;
 // A labelled drop without independently measured energy/kick is NOT a cue.
 if(act.section==='drop'&&(o.energy<.34||o.kick<.17))return idle;
 const duration=act.endMs-act.startMs;
 const holdMs=plan.genre==='hardtekk'?6200:plan.genre==='hardstyle'?7200:plan.genre==='deutschrap'?9400:8200;
 const local=o.progressMs-act.startMs;
 const slot=Math.floor(local/holdMs);
 const previous=slot===0?'hold':shotAt(act,slot-1);
 const shot=shotAt(act,slot);
 const mix=slot===0?ease(local/1500):ease((local-slot*holdMs)/1600);
 const boundary=Math.min(2100,duration*.2);
 const envelope=ease(local/boundary)*ease((duration-local)/boundary);
 const gain=envelope*cue.transition*(o.quality==='balanced'?.57:1)*(o.lyricsProtected?.27:1);
 return {active:true,act:act.index,shot,previous,mix,gain,slot};
}

const variants:Readonly<Record<Exclude<ConcertShotV613,'portrait'>,{lateral:number;distance:number;fov:number}>>={
 hold:{lateral:0,distance:0,fov:0},
 wide:{lateral:0,distance:.033,fov:.52},
 push:{lateral:0,distance:-.019,fov:-.34},
 left:{lateral:-.085,distance:.005,fov:.08},
 right:{lateral:.085,distance:.005,fov:.08},
};

/** Conservative overlay. No new camera: the caller's final V351 guard remains
 * last; frame measurements also refuse *any* worsening of existing cropping.
 */
export function composeConcertShotPacingV613(pose:Pose,plan:NarrativePlanV604|null|undefined,
 cue:NarrativeCueV604|null|undefined,anchors:readonly Anchor[],scene:Scene|null|undefined,
 o:ShotPacingOptionsV613):Pose{
 const pacing=planConcertShotPacingV613(plan,cue,o);
 if(!pacing.active||pacing.gain<.002||!validPose(pose)||!Array.isArray(anchors)||
   anchors.length<1||anchors.length>4)return pose;
 if(!anchors.every(a=>a.visible&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<4&&
    [a.x,a.y,a.z].every(finite)&&Math.max(Math.abs(a.x),Math.abs(a.y),Math.abs(a.z))<40)||
    new Set(anchors.map(a=>a.slot)).size!==anchors.length)return pose;
 const trustedScene=!!scene?.active&&scene.trackId===o.trackId&&
   scene.count===anchors.length&&finite(scene.cueStartMs)&&finite(scene.cueEndMs)&&
   o.progressMs>=scene.cueStartMs&&o.progressMs<scene.cueEndMs&&
   Number.isInteger(scene.leadSlot)&&Array.isArray(scene.singingSlots)&&
   scene.singingSlots.includes(scene.leadSlot)&&
   anchors.some(a=>a.slot===scene.leadSlot);
 const lead=trustedScene?anchors.find(a=>a.slot===scene!.leadSlot):undefined;
 const values=(name:ConcertShotV613)=>{
   if(name!=='portrait')return variants[name];
   // A portrait is permitted only for a currently VERIFIED V528 vocalist.
   return lead?{lateral:clamp((lead.x-(pose.targetX??0))*.24,-.085,.085),distance:-.01,fov:-.22}:
     variants.hold;
 };
 const from=values(pacing.previous),to=values(pacing.shot);
 const lerp=(a:number,b:number)=>a+(b-a)*pacing.mix;
 // Keep a currently singing face steadier, and never pan into legible lyrics.
 const vocal=trustedScene?.52:1;
 const shift=o.lyricsProtected?0:lerp(from.lateral,to.lateral)*pacing.gain*vocal;
 const depth=1+lerp(from.distance,to.distance)*pacing.gain;
 const fovShift=lerp(from.fov,to.fov)*pacing.gain;
 // Entirely neutral intervals (including breaks) require zero allocations/measurements.
 if(Math.abs(shift)<1e-8&&Math.abs(depth-1)<1e-8&&Math.abs(fovShift)<1e-8)return pose;
 const originalX=pose.targetX??0,originalZ=pose.targetZ??0;
 const next:Pose={...pose,targetX:originalX+shift,
   x:originalX+shift+(pose.x-originalX)*depth,
   y:pose.targetY+(pose.y-pose.targetY)*depth,
   z:originalZ+(pose.z-originalZ)*depth,
   fov:clamp(pose.fov+fovShift,28,76)};
 if(!validPose(next))return pose;
 const side=o.lyricsProtected?o.lyricsSide??null:null;
 const prev=measureConcertFrameV550(pose,anchors,o.aspect,side,o.lyricsProtected);
 const after=measureConcertFrameV550(next,anchors,o.aspect,side,o.lyricsProtected);
 const prevScreen=measureScreenFrameV540(pose,anchors,o.aspect,side);
 const afterScreen=measureScreenFrameV540(next,anchors,o.aspect,side);
 if(!prev||!after||!prevScreen||!afterScreen||
   after.overflow>prev.overflow+1e-6||after.headOverflow>prev.headOverflow+1e-6||
   after.fullBodyOverflow>prev.fullBodyOverflow+1e-6||
   afterScreen.overflow>prevScreen.overflow+1e-6)return pose;
 return next;
}
