/** V897 – Cinematic Camera 4.0: verified, continuous micro-composition on the
 * SINGLE existing React Three Fiber camera. No new camera, GL resource,
 * inferred singer, beat, hard cut, interval or authoring override.
 * V848 performer framing remains upstream; V351 lyrics/safe-frame guard is downstream.
 */
// Structural types intentionally preserve compatibility with V289/V895 without
// importing their runtime-heavy React/Three dependency graphs into isolated tests.
export type CameraPoseV897={x:number;y:number;z:number;targetY:number;fov:number;targetX?:number;targetZ?:number};
export type CameraSceneV897={index:number;startMs:number;endMs:number;section:string};
export type CameraPlanV897={trackId:string;durationMs:number;source:'verified-v604'|'unavailable';scenes:readonly CameraSceneV897[]};

export type CinematicCameraStyleV897='steady'|'cinematic'|'dynamic';
export type CinematicShotV897='portrait'|'orbit'|'dolly'|'crane'|'wide';
export type CinematicCameraPreferenceV897='auto'|CinematicShotV897;
export interface CinematicCameraSettingsV897 {
 enabled:boolean;style:CinematicCameraStyleV897;intensity:number;
 preference:CinematicCameraPreferenceV897;protectLyrics:boolean;protectDuets:boolean;
 portrait:boolean;orbit:boolean;dolly:boolean;crane:boolean;wide:boolean;
}
export const CAMERA_KEY_V897='sonic-cinematic-camera-v897';
export const DEFAULT_CAMERA_V897:Readonly<CinematicCameraSettingsV897>={
 enabled:true,style:'cinematic',intensity:55,preference:'auto',
 protectLyrics:true,protectDuets:true,portrait:true,orbit:true,dolly:true,crane:true,wide:true,
};
const shots:readonly CinematicShotV897[]=['portrait','orbit','dolly','crane','wide'];
const styles:readonly CinematicCameraStyleV897[]=['steady','cinematic','dynamic'];
const prefs:readonly CinematicCameraPreferenceV897[]=['auto',...shots];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const ease=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v);};
export function normalizeCinematicCameraV897(raw:unknown):CinematicCameraSettingsV897 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<CinematicCameraSettingsV897>:{};
 const flag=(k:keyof CinematicCameraSettingsV897)=>typeof v[k]==='boolean'?v[k] as boolean:DEFAULT_CAMERA_V897[k] as boolean;
 return {enabled:flag('enabled'),style:styles.includes(v.style as CinematicCameraStyleV897)?v.style as CinematicCameraStyleV897:'cinematic',
  preference:prefs.includes(v.preference as CinematicCameraPreferenceV897)?v.preference as CinematicCameraPreferenceV897:'auto',
  intensity:finite(v.intensity)?Math.round(clamp(v.intensity,0,100)):55,
  protectLyrics:flag('protectLyrics'),protectDuets:flag('protectDuets'),
  portrait:flag('portrait'),orbit:flag('orbit'),dolly:flag('dolly'),crane:flag('crane'),wide:flag('wide')};
}
/** Select distinct shots from the real V895/V604 scenes; never invent scene cuts. */
export function selectCameraShotV897(scene:CameraSceneV897,settings:CinematicCameraSettingsV897):CinematicShotV897|null {
 const eligible=shots.filter(s=>settings[s]);
 if(!eligible.length)return null;
 if(settings.preference!=='auto')return eligible.includes(settings.preference)?settings.preference:null;
 const options:Record<string,readonly CinematicShotV897[]>={
  intro:['crane','wide','dolly'],verse:['portrait','dolly','orbit'],
  hook:['wide','orbit','crane'],build:['dolly','crane','orbit'],
  drop:['wide','crane','orbit'],break:['portrait','dolly'],
  finale:['wide','crane','orbit'],outro:['wide','dolly','portrait']};
 const candidates=(options[scene.section]??['portrait']).filter(s=>eligible.includes(s));
 if(!candidates.length)return eligible[(scene.index%eligible.length+eligible.length)%eligible.length];
 return candidates[(scene.index%candidates.length+candidates.length)%candidates.length];
}
export interface CinematicCameraCueV897 {active:boolean;pose:CameraPoseV897;shot:CinematicShotV897|null;gain:number;cameraRate:number;sceneIndex:number;}
export interface CinematicCameraInputV897 {
 pose:CameraPoseV897;plan?:CameraPlanV897|null;settings:CinematicCameraSettingsV897;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 directorEnabled:boolean;directorCameraEnabled:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';aspect:number;
 manualFx?:boolean;authored?:boolean;seekBlocked?:boolean;blackout?:boolean;
 lyricsProtected?:boolean;lyricsVisible?:boolean;closeup?:boolean;duo?:boolean;
}
/** Original input pose returned by identity for any rejected cue. */
export function sampleCinematicCameraV897(i:CinematicCameraInputV897):CinematicCameraCueV897 {
 const off=(sceneIndex=-1):CinematicCameraCueV897=>({active:false,pose:i.pose,shot:null,gain:0,cameraRate:1,sceneIndex});
 const s=i.settings,p=i.plan,pose=i.pose;
 if(!s.enabled||s.intensity<=0||!i.playing||!i.autoEnabled||!i.directorEnabled||!i.directorCameraEnabled||
  i.manualFx||i.authored||i.seekBlocked||i.blackout||i.reducedMotion||i.tier==='low'||
  !p||p.source!=='verified-v604'||!i.trackId||p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !finite(i.aspect)||i.aspect<.6||i.aspect>3.5||
  (s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible||i.closeup))||
  ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
  pose.fov<28||pose.fov>76)return off();
 const scene=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!scene||!Number.isInteger(scene.index)||scene.index<0||scene.endMs-scene.startMs<2400||
  !finite(scene.startMs)||!finite(scene.endMs)||scene.endMs>i.durationMs)return off();
 const shot=selectCameraShotV897(scene,s);
 if(!shot)return off(scene.index);
 const age=i.positionMs-scene.startMs,remaining=scene.endMs-i.positionMs;
 const transition=s.style==='steady'?2600:s.style==='dynamic'?1100:1800;
 // Song clock, not wall time. At every scene boundary the original pose wins.
 const envelope=ease(age/transition)*ease(remaining/transition);
 const tierGain=i.tier==='balanced'?.64:1;
 const duoGain=i.duo&&s.protectDuets?.50:1;
 const styleGain=s.style==='steady'?.55:s.style==='dynamic'?1.15:.83;
 const gain=envelope*clamp(s.intensity/100,0,1)*tierGain*duoGain*styleGain;
 if(gain<.00001)return off(scene.index);
 const progress=clamp(age/(scene.endMs-scene.startMs),0,1);
 const drift=Math.sin(progress*Math.PI*2+scene.index*.37);
 const sweep=Math.sin(progress*Math.PI);
 let x=0,y=0,z=0,lookX=0,lookY=0,fov=0;
 if(shot==='portrait'){
  z=-.21;lookY=.04;fov=-1.15;x=.06*drift;lookX=.015*drift;
 }else if(shot==='orbit'){
  x=.27*drift;lookX=.055*drift;z=-.08*sweep;fov=-.35;
 }else if(shot==='dolly'){
  z=-.27*(.35+.65*sweep);lookY=.025;fov=-.4;
 }else if(shot==='crane'){
  y=.19*sweep;lookY=.045*sweep;z=.12*sweep;fov=.3;
 }else if(shot==='wide'){
  z=.24*(.55+.45*sweep);fov=1.25;x=.045*drift;
 }
 // Extremely modest offsets retain V848's actual singer/duet framing and V351's guard.
 const next:CameraPoseV897={...pose,
  x:pose.x+x*gain,y:pose.y+y*gain,z:pose.z+z*gain,
  targetX:(pose.targetX??0)+lookX*gain,targetY:pose.targetY+lookY*gain,
  fov:clamp(pose.fov+fov*gain,28,76)};
 if(![next.x,next.y,next.z,next.fov,next.targetX,next.targetY].every(finite)||
  Math.hypot(next.x-(next.targetX??0),next.y-next.targetY,next.z-(next.targetZ??0))<1.6)return off(scene.index);
 return {active:true,pose:next,shot,gain,cameraRate:clamp(1+(shot==='portrait'?-0.08:shot==='orbit'?-.035:.02)*gain,.94,1.03),sceneIndex:scene.index};
}
export function exportCinematicCameraV897(plan:CameraPlanV897,settings:CinematicCameraSettingsV897):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!finite(plan.durationMs)||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-cinematic-camera-v897',version:1,trackId:plan.trackId,
  durationMs:plan.durationMs,source:plan.source,settings:normalizeCinematicCameraV897(settings),
  scenes:plan.scenes.map(scene=>({index:scene.index,startMs:scene.startMs,endMs:scene.endMs,
   section:scene.section,shot:selectCameraShotV897(scene,settings)})),
  note:'Deterministic virtual camera shot plan from verified V604/V895 acts. No new camera, inferred vocals, beats or hard cuts.'},null,2);
}
