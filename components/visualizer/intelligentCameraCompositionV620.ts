/** V620 — conservative, evidence-bound composition finishing pass for the EXISTING R3F camera.
 * Verified singer scenes may request a portrait/two-shot/ensemble; verified V604
 * narrative without a vocalist can request only an all-cast stage view.
 * The entire visible cast and a conservative head/foot projection must not lose
 * framing. No singer inference, new renderer, camera cuts, timing loop or settings.
 */
import type {CameraPoseV528 as Pose,ConcertAnchorV528 as Anchor,ConcertSceneV528 as Scene} from './cinematicConcertCoordinationV528';
import type {NarrativeCueV604,NarrativePlanV604} from './fullSongConcertDramaturgyV604';
import {narrativeActAtV604} from './fullSongConcertDramaturgyV604';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type CameraCompositionOptionsV620={
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 automatic:boolean;authored:boolean;quality:'low'|'balanced'|'high';
 aspect:number;lyricsProtected:boolean;lyricsSide?:'left'|'right'|null;
 faceY?:number|null;paceV623?:number;
};
export type CompositionIntentV620={active:boolean;kind:'portrait'|'duet'|'ensemble'|'stage'|'off';
 slots:readonly number[];gain:number;startMs:number;endMs:number};
const inactive:CompositionIntentV620={active:false,kind:'off',slots:[],gain:0,startMs:0,endMs:0};
const finite=(n:number)=>Number.isFinite(n);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const validPose=(p:Pose)=>[p.x,p.y,p.z,p.targetX??0,p.targetY,p.targetZ??0,p.fov].every(finite)&&p.fov>=28&&p.fov<=76;
const validAnchor=(a:Anchor)=>a.visible&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<4&&
 [a.x,a.y,a.z].every(n=>finite(n)&&Math.abs(n)<40);

/** No visual-only lead may become a singer; untrusted or stale roles fail closed. */
export function planIntelligentCameraCompositionV620(
 scene:Scene|null|undefined,roots:readonly Anchor[],plan:NarrativePlanV604|null|undefined,
 cue:NarrativeCueV604|null|undefined,o:CameraCompositionOptionsV620):CompositionIntentV620{
 if(!o.automatic||o.authored||!o.playing||o.reducedMotion||o.quality==='low'||
   !o.trackId?.trim()||!finite(o.progressMs)||o.progressMs<0||
   !finite(o.aspect)||o.aspect<.55||o.aspect>3.5||
   !Array.isArray(roots)||roots.length<1||roots.length>4||
   !roots.every(validAnchor)||new Set(roots.map(r=>r.slot)).size!==roots.length)return inactive;
 const cast=roots.map(a=>a.slot);
 if(scene?.active){
   if(scene.trackId!==o.trackId||scene.count!==roots.length||
     !Number.isInteger(scene.count)||scene.count<2||scene.count>4||
     !finite(scene.cueStartMs)||!finite(scene.cueEndMs)||scene.cueStartMs<0||
     scene.cueEndMs<=scene.cueStartMs||
     o.progressMs<scene.cueStartMs||o.progressMs>=scene.cueEndMs||
     !finite(scene.strength)||scene.strength<=0||scene.strength>1||
     !Number.isInteger(scene.leadSlot)||!cast.includes(scene.leadSlot)||
     !Array.isArray(scene.singingSlots)||!scene.singingSlots.length||
     new Set(scene.singingSlots).size!==scene.singingSlots.length||
     !scene.singingSlots.every(s=>cast.includes(s))||!scene.singingSlots.includes(scene.leadSlot)||
     !['lead','handoff','ensemble'].includes(scene.focus))return inactive;
   let kind:CompositionIntentV620['kind']='portrait',slots:readonly number[]=[scene.leadSlot];
   if(scene.focus==='handoff'){
     if(scene.handoffFrom===null||scene.handoffFrom===scene.leadSlot||!cast.includes(scene.handoffFrom))return inactive;
     kind='duet';slots=[scene.handoffFrom,scene.leadSlot];
   } else if(scene.focus==='ensemble'){
     if(scene.singingSlots.length!==roots.length)return inactive;
     kind='ensemble';slots=cast;
   }
   const fade=smooth((o.progressMs-scene.cueStartMs)/750)*smooth((scene.cueEndMs-o.progressMs)/580);
   const gain=scene.strength*fade*(o.quality==='balanced'?.62:1)*(o.lyricsProtected?.7:1);
   return gain>.004?{active:true,kind,slots,gain,startMs:scene.cueStartMs,endMs:scene.cueEndMs}:inactive;
 }
 // Song structure is sufficient for a wide stage shot, NEVER a portrait.
 if(!plan||plan.source!=='verified-v600'||plan.trackId!==o.trackId||
   !cue?.active||cue.source!=='verified-v600'||!finite(cue.transition)||
   cue.transition<=0||cue.transition>1||!Number.isInteger(cue.act)||
   cue.act<0||cue.act>=plan.acts.length)return inactive;
 const act=narrativeActAtV604(plan,o.progressMs);
 if(!act||act.index!==cue.act||act.chapter!==cue.chapter||
   act.motif!==cue.motif||act.repetition!==cue.repetition||
   act.endMs-act.startMs<3000||!['hook','drop','build','verse'].includes(act.section))return inactive;
 const fade=smooth((o.progressMs-act.startMs)/1600)*smooth((act.endMs-o.progressMs)/1350);
 const gain=cue.transition*fade*clamp(o.paceV623??1,.8,1)*(o.quality==='balanced'?.42:.66)*(o.lyricsProtected?.62:1);
 return gain>.004?{active:true,kind:'stage',slots:cast,gain,startMs:act.startMs,endMs:act.endMs}:inactive;
}

/** Bounded reframing; test all visible performers, not just the chosen singer. */
export function composeIntelligentCameraV620(
 pose:Pose,scene:Scene|null|undefined,roots:readonly Anchor[],
 plan:NarrativePlanV604|null|undefined,cue:NarrativeCueV604|null|undefined,
 o:CameraCompositionOptionsV620):Pose{
 const intent=planIntelligentCameraCompositionV620(scene,roots,plan,cue,o);
 if(!intent.active||!validPose(pose))return pose;
 const cast=roots.filter(r=>validAnchor(r));
 const focus=cast.filter(r=>intent.slots.includes(r.slot));
 if(focus.length!==intent.slots.length)return pose;
 const side=o.lyricsProtected?(o.lyricsSide??null):null;
 const faceY=finite(o.faceY as number)?clamp(o.faceY as number,1.2,2.25):1.55;
 const baseAll=measureConcertFrameV550(pose,cast,o.aspect,side,o.lyricsProtected,faceY);
 const baseFocus=measureConcertFrameV550(pose,focus,o.aspect,side,o.lyricsProtected,faceY);
 const baseScreen=measureScreenFrameV540(pose,cast,o.aspect,side);
 if(!baseAll||!baseFocus||!baseScreen)return pose;
 const dx=pose.x-(pose.targetX??0),dy=pose.y-pose.targetY,dz=pose.z-(pose.targetZ??0);
 const dist=Math.hypot(dx,dy,dz);
 if(dist<.5||dz<=.5||Math.abs(dx)>dz*.8)return pose;
 const centerX=focus.reduce((sum,r)=>sum+r.x,0)/focus.length;
 const centerY=focus.reduce((sum,r)=>sum+r.y,0)/focus.length;
 // Lyrics sidebar: composer aims for the center of remaining safe viewport.
 // A bottom lyric band permits vertical head-room adjustment but no side pan.
 const safeMid=(baseAll.safeLeft+baseAll.safeRight)/2;
 const safeX=o.lyricsProtected&&!side?0:safeMid;
 const halfWidth=dist*Math.tan(pose.fov*Math.PI/360)*o.aspect;
 const desiredX=centerX-safeX*halfWidth;
 const lateral=o.lyricsProtected&&!side?0:
   clamp(desiredX-(pose.targetX??0),-.30,.30)*intent.gain;
 const desiredY=centerY+(intent.kind==='portrait'?.87:intent.kind==='duet'?.79:.69);
 const lift=clamp(desiredY-pose.targetY,-.21,.21)*intent.gain;
 const wide=intent.kind==='ensemble'||intent.kind==='stage';
 const distanceChange=(wide?.055:intent.kind==='duet'?.025:-.018)*intent.gain;
 const lensChange=(wide?.55:intent.kind==='duet'?.18:-.28)*intent.gain;
 const originalScore=Math.abs((baseFocus.left+baseFocus.right)/2-safeMid)+
   .23*Math.abs((baseFocus.top+baseFocus.bottom)/2-.08);
 // Try a fixed number of candidate intensities. No history or per-frame state.
 // The strongest *measurably safer* candidate wins; all checks fail closed.
 let best:Pose=pose,bestScore=originalScore;
 for(const scale of [1,.6,.3]){
   const targetX=(pose.targetX??0)+lateral*scale;
   const targetY=pose.targetY+lift*scale;
   const ratio=1+distanceChange*scale;
   const candidate:Pose={...pose,targetX,targetY,
     x:targetX+dx*ratio,y:targetY+dy*ratio,
     z:(pose.targetZ??0)+dz*ratio,
     fov:clamp(pose.fov+lensChange*scale,28,76)};
   if(!validPose(candidate))continue;
   const all=measureConcertFrameV550(candidate,cast,o.aspect,side,o.lyricsProtected,faceY);
   const focused=measureConcertFrameV550(candidate,focus,o.aspect,side,o.lyricsProtected,faceY);
   const screen=measureScreenFrameV540(candidate,cast,o.aspect,side);
   if(!all||!focused||!screen||
     all.overflow>baseAll.overflow+1e-6||
     all.headOverflow>baseAll.headOverflow+1e-6||
     all.fullBodyOverflow>baseAll.fullBodyOverflow+1e-6||
     focused.headOverflow>baseFocus.headOverflow+1e-6||
     screen.overflow>baseScreen.overflow+1e-6)continue;
   // Keep each portrait or duet centrally composed without destabilizing the
   // frame when it is already better than any new candidate.
   const score=Math.abs((focused.left+focused.right)/2-safeMid)+
     .23*Math.abs((focused.top+focused.bottom)/2-.08);
   if(score<bestScore-1e-5){best=candidate;bestScore=score;}
 }
 return best;
}
