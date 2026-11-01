/** V784: deterministic scripted camera shots and frame-rate-aware smoothing.
 * Only the opt-in concert benchmark uses this director; the live show is unchanged. */
export type CameraModeV784='off'|'on';
export type CameraPoseV784={position:[number,number,number];target:[number,number,number];fov:number;shot:string};
export type CameraSampleV784={frame:number;position:[number,number,number];quaternion:[number,number,number,number];fov:number;
 lyricNdc:[number,number];visiblePerformers:number;shot:string};
export type CameraSceneV784={id:string;pass:number;avatars:2|4;frames:number;p95PositionStep:number;p95RotationStepDeg:number;
 p95PositionJerk:number;p95RotationJerkDeg:number;hardCuts:number;lyricOutOfSafePct:number;minVisiblePerformers:number;notes:string[]};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const round=(n:number)=>Math.round(n*1000)/1000;
const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,x));
const lin=(a:number,b:number,t:number)=>a+(b-a)*t;
const distance=(a:readonly number[],b:readonly number[])=>Math.hypot(...a.map((x,i)=>x-b[i]));
const percentile=(v:number[],p:number)=>{const s=[...v].sort((a,b)=>a-b);return s[Math.max(0,Math.min(s.length-1,Math.ceil(s.length*p)-1))]??0};
export function cameraTargetV784(frame:number,avatars:2|4):CameraPoseV784{
 if(!Number.isInteger(frame)||frame<0||![2,4].includes(avatars))throw Error('Ungültiger Kameraframe / Avatarzahl');
 // Deliberate cuts / fast shot changes, stable and independent of browser clock.
 const phase=frame%240;
 const left=avatars===4?-1.7:-.9,right=-left;
 if(phase<42)return {position:[0,.25,8.4],target:[0,.2,0],fov:45,shot:'wide'};
 if(phase<86)return {position:[left-.5,.8,6.6],target:[left,.05,0],fov:37,shot:'lead-close'};
 if(phase<129)return {position:[right+.5,.7,6.6],target:[right,.08,0],fov:37,shot:'answer-close'};
 if(phase<174)return {position:[1.4,1.2,7.9],target:[0,.22,0],fov:43,shot:'ensemble-side'};
 if(phase<215)return {position:[0,.4,8.8],target:[0,.4,0],fov:47,shot:'lyrics-wide'};
 return {position:[-.9,.85,7.5],target:[0,.2,0],fov:44,shot:'outro-dolly'};
}
export function createCameraControllerV784(mode:CameraModeV784){
 if(mode!=='on'&&mode!=='off')throw Error('Unbekannter Kameramodus');
 let previousFrame=-1,previousCount=2 as 2|4,pose:CameraPoseV784|null=null;
 return {
  reset(){previousFrame=-1;pose=null},
  sample(frame:number,avatars:2|4):CameraPoseV784{
   const target=cameraTargetV784(frame,avatars);
   if(frame===previousFrame&&avatars===previousCount&&pose)return pose;
   if(!pose||frame<=previousFrame||avatars!==previousCount){pose={...target,position:[...target.position],target:[...target.target]};}
   else if(mode==='off')pose=target;
   else{
    // Smooth transitions for unchanged shot trajectory and bounded rapid cuts.
    // Logical frame-count makes results independent of wall-clock throttling.
    const frames=clamp(frame-previousFrame,1,10),factor=1-Math.pow(1-.115,frames);
    pose={shot:target.shot,fov:lin(pose.fov,target.fov,factor),
     position:pose.position.map((x,i)=>lin(x,target.position[i],factor)) as [number,number,number],
     target:pose.target.map((x,i)=>lin(x,target.target[i],factor)) as [number,number,number]};
   }
   previousFrame=frame;previousCount=avatars;return pose;
  }
 }
}
function quaternionAngle(a:CameraSampleV784['quaternion'],b:CameraSampleV784['quaternion']){
 const dot=Math.abs(a.reduce((s,v,i)=>s+v*b[i],0));return 2*Math.acos(clamp(dot,0,1))*180/Math.PI;
}
export function summarizeCameraSceneV784(id:string,pass:number,avatars:2|4,raw:readonly CameraSampleV784[]):CameraSceneV784{
 if(!id||!Number.isInteger(pass)||pass<0||![2,4].includes(avatars)||raw.length<90)throw Error('Kamera-Messreihe unvollständig');
 const steps:number[]=[],angles:number[]=[],jumps:number[]=[],turnJumps:number[]=[];
 let hardCuts=0,outOfSafe=0,minVisible:number=avatars;
 for(let i=0;i<raw.length;i++){
  const s=raw[i];if(!Number.isInteger(s.frame)||s.frame<0||s.position.length!==3||s.quaternion.length!==4||s.lyricNdc.length!==2||
   ![...s.position,...s.quaternion,...s.lyricNdc,s.fov].every(finite)||s.fov<20||s.fov>90||
   !Number.isInteger(s.visiblePerformers)||s.visiblePerformers<0||s.visiblePerformers>avatars||!s.shot)throw Error('Ungültiger echter Kameraframe');
  if(Math.abs(s.lyricNdc[0])>.72||Math.abs(s.lyricNdc[1])>.77)outOfSafe++;
  minVisible=Math.min(minVisible,s.visiblePerformers);
  if(i===0)continue;
  if(s.frame!==raw[i-1].frame+1)throw Error('Nicht zusammenhängende Kameraframes');
  const d=distance(s.position,raw[i-1].position),a=quaternionAngle(s.quaternion,raw[i-1].quaternion);
  if(d>1.0||a>7.5)hardCuts++;
  steps.push(d);angles.push(a);
  if(steps.length>1){jumps.push(Math.abs(d-steps[steps.length-2]));turnJumps.push(Math.abs(a-angles[angles.length-2]));}
 }
 return {id,pass,avatars,frames:raw.length,p95PositionStep:round(percentile(steps,.95)),p95RotationStepDeg:round(percentile(angles,.95)),
  p95PositionJerk:round(percentile(jumps,.95)),p95RotationJerkDeg:round(percentile(turnJumps,.95)),hardCuts,
  lyricOutOfSafePct:round(100*outOfSafe/raw.length),minVisiblePerformers:minVisible,notes:[
   'Sichtbarkeit basiert auf projizierten Mittelpunkten; Textbreite, Verdeckung und subjektive Bildästhetik werden nicht automatisch bewertet.',
   'Feste synthetische Shot-Timeline, keine Spotify-/Live-Regie.']};
}
