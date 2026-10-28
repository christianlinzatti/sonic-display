/** V633 – Cinematic Camera 2.0. One final, evidence-bound AUTO-camera finishing pass.
 * Actual stage anchors + V528 assigned singers (never guessed) or a V604 verified
 * stage act; conservative projection safeguards preserve the entire visible cast.
 * No new R3F camera, animation loop, GLB asset or browser timer.
 */
import type {CameraPoseV528 as Pose, ConcertAnchorV528 as Anchor, ConcertSceneV528 as Scene} from './cinematicConcertCoordinationV528';
import type {NarrativePlanV604, NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import {narrativeActAtV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type DirectorOptionsV633={
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';
 aspect:number;lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;
 faceY?:number|null;
};
export type DirectorIntentV633={active:boolean;
 shot:'off'|'portrait'|'handoff'|'duet'|'ensemble'|'stage';
 slots:readonly number[];leadSlot:number;previousSlot:number|null;
 gain:number;cameraRate:number;startMs:number;endMs:number;variant:number;
};
const off:DirectorIntentV633={active:false,shot:'off',slots:[],leadSlot:-1,
 previousSlot:null,gain:0,cameraRate:1,startMs:0,endMs:0,variant:0};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const smooth=(t:number)=>{const s=clamp(t,0,1);return s*s*(3-2*s);};
const validAnchor=(a:Anchor)=>a.visible&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<=3&&
 [a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<40);
const validPose=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;

export function planCinematicCameraV633(scene:Scene|null|undefined,anchors:readonly Anchor[],
 plan:NarrativePlanV604|null|undefined,cue:NarrativeCueV604|null|undefined,
 o:DirectorOptionsV633):DirectorIntentV633{
 if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
   !o.trackId?.trim()||!finite(o.progressMs)||o.progressMs<0||
   !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||
   !Array.isArray(anchors)||anchors.length<1||anchors.length>4||
   !anchors.every(validAnchor)||new Set(anchors.map(a=>a.slot)).size!==anchors.length)return off;
 const cast=anchors.map(a=>a.slot);
 // An active, but stale/bad vocal cue is NEVER rescued by a structural wide shot.
 if(scene?.active){
   if(scene.trackId!==o.trackId||!Number.isInteger(scene.count)||scene.count<2||scene.count>4||
      scene.count!==anchors.length||!finite(scene.cueStartMs)||!finite(scene.cueEndMs)||
      scene.cueStartMs<0||scene.cueEndMs-scene.cueStartMs<2200||
      o.progressMs<scene.cueStartMs||o.progressMs>=scene.cueEndMs||
      !finite(scene.strength)||scene.strength<=0||scene.strength>1||
      !Number.isInteger(scene.leadSlot)||!cast.includes(scene.leadSlot)||
      !Array.isArray(scene.singingSlots)||scene.singingSlots.length<1||
      new Set(scene.singingSlots).size!==scene.singingSlots.length||
      !scene.singingSlots.every(s=>cast.includes(s))||!scene.singingSlots.includes(scene.leadSlot)||
      !['lead','handoff','ensemble'].includes(scene.focus))return off;
   if(scene.focus==='ensemble'&&scene.singingSlots.length!==scene.count)return off;
   if(scene.focus==='handoff'&&(scene.handoffFrom===null||scene.handoffFrom===scene.leadSlot||
      !cast.includes(scene.handoffFrom)))return off;
   const shot:DirectorIntentV633['shot']=scene.focus==='handoff'?'handoff':
     scene.focus==='ensemble'?'ensemble':scene.singingSlots.length>1?'duet':'portrait';
   const slots=shot==='ensemble'?cast:shot==='handoff'?[scene.handoffFrom!,scene.leadSlot]:
     shot==='duet'?scene.singingSlots:[scene.leadSlot];
   const edge=smooth((o.progressMs-scene.cueStartMs)/900)*
      smooth((scene.cueEndMs-o.progressMs)/750);
   const gain=scene.strength*edge*(o.quality==='balanced'?.56:.84)*
      (o.lyricsProtected?.62:1);
   if(gain<.008)return off;
   return {active:true,shot,slots,leadSlot:scene.leadSlot,
      previousSlot:shot==='handoff'?scene.handoffFrom:null,gain,
      cameraRate:shot==='handoff'?.72:shot==='portrait'?.86:.90,
      startMs:scene.cueStartMs,endMs:scene.cueEndMs,variant:0};
 }
 // A genuine section alone can request a WIDE STAGE SHOT, never a singer.
 if(!plan||plan.source!=='verified-v600'||plan.trackId!==o.trackId||
   !finite(plan.durationMs)||o.progressMs>=plan.durationMs||
   !cue?.active||cue.source!=='verified-v600'||!finite(cue.transition)||
   cue.transition<=0||cue.transition>1)return off;
 const act=narrativeActAtV604(plan,o.progressMs);
 if(!act||act.index!==cue.act||act.chapter!==cue.chapter||
   act.motif!==cue.motif||act.repetition!==cue.repetition||
   act.endMs-act.startMs<4000||!['hook','verse','build','drop','break'].includes(act.section))return off;
 const edge=smooth((o.progressMs-act.startMs)/1550)*
   smooth((act.endMs-o.progressMs)/1450);
 const gain=cue.transition*edge*(o.quality==='balanced'?.20:.33)*
    (o.lyricsProtected?.5:1);
 return gain<.008?off:{active:true,shot:'stage',slots:cast,leadSlot:-1,
   previousSlot:null,gain,cameraRate:.93,startMs:act.startMs,endMs:act.endMs,
   variant:act.repetition%3};
}

/** Choose ONLY candidates whose projected cast, head and lyric-safe rectangles
 * are no worse. Motion is small and all candidate calculations are deterministic.
 */
export function composeCinematicCameraV633(pose:Pose,scene:Scene|null|undefined,
 anchors:readonly Anchor[],plan:NarrativePlanV604|null|undefined,
 cue:NarrativeCueV604|null|undefined,o:DirectorOptionsV633):Pose{
 const intent=planCinematicCameraV633(scene,anchors,plan,cue,o);
 if(!intent.active||!validPose(pose))return pose;
 const focus=anchors.filter(a=>intent.slots.includes(a.slot));
 if(focus.length!==intent.slots.length)return pose;
 const side=o.lyricsProtected?(o.lyricsSide??null):null;
 const faceY=finite(o.faceY)?clamp(o.faceY!,1.2,2.25):1.55;
 const all0=measureConcertFrameV550(pose,anchors,o.aspect,side,o.lyricsProtected,faceY);
 const focus0=measureConcertFrameV550(pose,focus,o.aspect,side,o.lyricsProtected,faceY);
 const screen0=measureScreenFrameV540(pose,anchors,o.aspect,side);
 if(!all0||!focus0||!screen0)return pose;
 const dx=pose.x-(pose.targetX??0),dy=pose.y-pose.targetY,dz=pose.z-(pose.targetZ??0);
 const dist=Math.hypot(dx,dy,dz);
 if(dist<.7||dz<=.7||Math.abs(dx)>dz*.8)return pose;
 const wide=intent.shot==='stage'||intent.shot==='ensemble';
 const cx=focus.reduce((v,a)=>v+a.x,0)/focus.length;
 let focalX=cx;
 if(intent.shot==='handoff'&&intent.previousSlot!==null){
   const prev=anchors.find(a=>a.slot===intent.previousSlot);
   const lead=anchors.find(a=>a.slot===intent.leadSlot);
   if(!prev||!lead)return pose;
   const travel=smooth((o.progressMs-intent.startMs)/1900);
   // A handoff drifts deliberately FROM the previous vocalist TOWARDS the lead.
   focalX=prev.x*(1-travel)+lead.x*travel;
 }
 const safeMid=(all0.safeLeft+all0.safeRight)/2;
 const lensHalfWidth=dist*Math.tan(pose.fov*Math.PI/360)*o.aspect;
 const desiredX=focalX-safeMid*lensHalfWidth;
 const pan=o.lyricsProtected&&!side?0:
    clamp(desiredX-(pose.targetX??0),-.34,.34)*intent.gain;
 const top=wide?.70:intent.shot==='portrait'?.91:.83;
 const y=focus.reduce((v,a)=>v+a.y,0)/focus.length+top;
 const lift=clamp(y-pose.targetY,-.25,.25)*intent.gain;
 // Alternating verified refrains get a modest wider/focused lens character;
 // never infer who sings from the section label.
 const variant=intent.shot==='stage'?(intent.variant===1?-.34:.53):
   intent.shot==='portrait'?-.58:intent.shot==='handoff'?.28:wide?.42:.12;
 const fovDelta=variant*intent.gain;
 const ratio=1+(wide?.028:intent.shot==='portrait'?-0.016:.012)*intent.gain;
 let best:Pose=pose;
 // The outgoing singer stays inside the safe cast, while a verified handoff
 // smoothly moves *attention* to the incoming singer.
 const targetAnchor=intent.shot==='handoff'?anchors.find(a=>a.slot===intent.leadSlot):undefined;
 const scoredFocus=targetAnchor?[targetAnchor]:focus;
 const scored0=targetAnchor?measureConcertFrameV550(pose,scoredFocus,o.aspect,side,o.lyricsProtected,faceY):focus0;
 if(!scored0)return pose;
 const originalMid=(scored0.left+scored0.right)/2;
 const originalScore=Math.abs(originalMid-safeMid)+
     (wide?.10*(focus0.right-focus0.left):.20*Math.abs(scored0.top-.78));
 let bestScore=originalScore;
 for(const factor of [1,.6,.3]){
   const tx=(pose.targetX??0)+pan*factor,ty=pose.targetY+lift*factor;
   const r=1+(ratio-1)*factor;
   const candidate:Pose={...pose,targetX:tx,targetY:ty,
     x:tx+dx*r,y:ty+dy*r,z:(pose.targetZ??0)+dz*r,
     fov:clamp(pose.fov+fovDelta*factor,28,76)};
   if(!validPose(candidate))continue;
   const a=measureConcertFrameV550(candidate,anchors,o.aspect,side,o.lyricsProtected,faceY);
   const f=measureConcertFrameV550(candidate,focus,o.aspect,side,o.lyricsProtected,faceY);
   const s=measureScreenFrameV540(candidate,anchors,o.aspect,side);
   if(!a||!f||!s||a.overflow>all0.overflow+1e-6||
      a.headOverflow>all0.headOverflow+1e-6||
      a.fullBodyOverflow>all0.fullBodyOverflow+1e-6||
      f.headOverflow>focus0.headOverflow+1e-6||
      s.overflow>screen0.overflow+1e-6)continue;
   const scored=targetAnchor?measureConcertFrameV550(candidate,scoredFocus,o.aspect,side,o.lyricsProtected,faceY):f;
   if(!scored||scored.headOverflow>scored0.headOverflow+1e-6)continue;
   const score=Math.abs((scored.left+scored.right)/2-safeMid)+
      (wide?.10*(f.right-f.left):.20*Math.abs(scored.top-.78));
   if(score<bestScore-1e-5){best=candidate;bestScore=score;}
 }
 return best;
}
