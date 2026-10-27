/** V528 – verified multi-artist camera and lyrics, one shared playback clock.
 * Scene vocabulary comes from V527; a visual-only lead is NEVER voice evidence.
 * No side effects, media capture, React state or new camera renderer.
 */
import {cinematicFocusV527, type EnsembleFocusV527} from './cinematicSceneIntentV527';
/** Structural copy of V517's explicitly resolved cast – no inference. */
export type VerifiedVocalCueV528={active:boolean;role:'lead'|'feature'|'hook'|null;leadSlot:number;
 singingSlots:readonly number[];startMs:number;endMs:number;handoffFrom:number|null;count:number};
export type CameraPoseV528={x:number;y:number;z:number;targetY:number;fov:number;targetX?:number;targetZ?:number};

export type ConcertSceneV528={
 active:boolean;trackId:string;cueStartMs:number;cueEndMs:number;count:number;
 focus:EnsembleFocusV527;leadSlot:number;singingSlots:readonly number[];
 handoffFrom:number|null;strength:number;lyricMotionGain:number;readingBoost:number;plateBoost:number;
};
export type ConcertAnchorV528={slot:number;x:number;y:number;z:number;visible:boolean};
const off=():ConcertSceneV528=>({active:false,trackId:'',cueStartMs:0,cueEndMs:0,count:0,
 focus:'none',leadSlot:-1,singingSlots:[],handoffFrom:null,strength:0,
 lyricMotionGain:1,readingBoost:1,plateBoost:0});
export const inactiveConcertSceneV528=off;
const finite=(v:number)=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>finite(v)?Math.max(min,Math.min(max,v)):min;
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};
/** Only a track-bound, explicitly authored V385/V416/V496 cast may drive V528. */
export function planConcertSceneV528(input:{
 trackId?:string|null;cueTrackId?:string|null;cue?:VerifiedVocalCueV528|null;
 progressMs:number;count:number;playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';
}):ConcertSceneV528{
 const {cue,trackId,progressMs,count}=input;
 if(!input.playing||input.reducedMotion||input.tier==='low'||!trackId?.trim()||
    trackId!==input.cueTrackId||!Number.isInteger(count)||count<2||count>4||
    !finite(progressMs)||progressMs<0||!cue?.active||cue.count!==count||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !finite(cue.startMs)||!finite(cue.endMs)||cue.startMs<0||cue.endMs<=cue.startMs||
    progressMs<cue.startMs||progressMs>=cue.endMs||
    !['lead','feature','hook'].includes(cue.role??'')||
    !Array.isArray(cue.singingSlots)||cue.singingSlots.length<1||
    !cue.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<count)||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||
    !cue.singingSlots.includes(cue.leadSlot)||
    (cue.role==='hook'&&cue.singingSlots.length!==count)||
    (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count||cue.handoffFrom===cue.leadSlot)))return off();
 const focus=cinematicFocusV527(cue.role==='hook'?'hook':cue.handoffFrom!==null?'handoff':'verse');
 const envelope=smooth((progressMs-cue.startMs)/620)*smooth((cue.endMs-progressMs)/430);
 const strength=clamp((input.tier==='balanced'?.55:.8)*envelope,0,.8);
 return {active:strength>.0001,trackId, cueStartMs:cue.startMs,cueEndMs:cue.endMs,
   count,focus,leadSlot:cue.leadSlot,singingSlots:[...cue.singingSlots],handoffFrom:cue.handoffFrom,
   strength,lyricMotionGain:1-.32*strength,readingBoost:1+.035*strength,
   plateBoost:.085*strength};
}
/** Accents only automatically framed shots, after legacy directors, before V351 lyrics guard.
 * Requires CURRENT measured anchors, never guesses artist world positions. Missing
 * anchors, authored poses and invalid camera values all fail closed.
 */
export function composeConcertSceneCameraV528(pose:CameraPoseV528,scene:ConcertSceneV528,
 anchors:readonly ConcertAnchorV528[],options:{automatic:boolean;authored:boolean;lyricsProtected:boolean}):CameraPoseV528{
 if(!scene.active||!options.automatic||options.authored||scene.strength<=0||
    ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite))return pose;
 const cast=scene.focus==='ensemble'?scene.singingSlots:
   scene.focus==='handoff'&&scene.handoffFrom!==null?[scene.leadSlot,scene.handoffFrom]:[scene.leadSlot];
 const found=cast.map(slot=>anchors.find(a=>a.slot===slot&&a.visible&&[a.x,a.y,a.z].every(finite)));
 if(found.some(a=>!a))return pose;
 const x=found.reduce((sum,a)=>sum+a!.x,0)/found.length;
 const gain=scene.strength*(options.lyricsProtected?.38:.62);
 const originalX=pose.targetX??0;
 const shift=clamp((x-originalX)*gain,-.38,.38);
 const targetX=clamp(originalX+shift,-2.4,2.4);
 const ensemble=scene.focus==='ensemble';
 const handoff=scene.focus==='handoff';
 const minDistance=ensemble?(scene.count>=4?8:scene.count===3?7:5.4):handoff?5.25:3.6;
 const dx=pose.x-originalX,dy=pose.y-pose.targetY,dz=pose.z-(pose.targetZ??0);
 const distance=Math.hypot(dx,dy,dz);
 if(!finite(distance)||distance<.01)return pose;
 const desired=Math.max(minDistance,distance*(1+(ensemble?.052:handoff?.035:-.035)*gain));
 const ratio=desired/distance;
 const fov=clamp(pose.fov+(ensemble?1.15:handoff?.8:-.55)*gain,30,72);
 return {...pose,targetX,x:targetX+dx*ratio,y:pose.targetY+dy*ratio,
   z:(pose.targetZ??0)+dz*ratio,fov};
}
/** Shared DOM/3D typography envelope: never changes word fill or line timestamps. */
export function concertLyricDirectionV528(scene:ConcertSceneV528|null|undefined,playing:boolean,reducedMotion:boolean){
 return scene?.active&&playing&&!reducedMotion
   ?{motionGain:clamp(scene.lyricMotionGain,.74,1),readingBoost:clamp(scene.readingBoost,1,1.035),plateBoost:clamp(scene.plateBoost,0,.07)}
   :{motionGain:1,readingBoost:1,plateBoost:0};
}

