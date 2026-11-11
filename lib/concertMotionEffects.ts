import {STAGE_FLOOR_V1135} from './stagePresenceV1135';
export type StagePoint={x:number;y:number;z:number;scale?:number};
type Limb={last?:StagePoint;history:StagePoint[];airborne:boolean;lastHit:number};
export type MotionFxState={source:string;position:number;now:number;armed:boolean;limbs:Limb[];hit?:{point:StagePoint;at:number};};
export const newMotionFxState=():MotionFxState=>({source:'',position:0,now:0,armed:false,limbs:Array.from({length:8},()=>({history:[],airborne:false,lastHit:-Infinity}))});
const valid=(p:StagePoint|undefined):p is StagePoint=>!!p&&[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.x)<6&&p.y> -2.2&&p.y<4&&Math.abs(p.z)<5;
const distance=(a:StagePoint,b:StagePoint)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
/** Observe actual hands/feet. No beat-generated landings and no catch-up after discontinuities. */
export function sampleMotionEffects(state:MotionFxState,input:{source:string;position:number;now:number;allowed:boolean;points:readonly (StagePoint|undefined)[]}){
 const dt=input.now-state.now,dp=input.position-state.position;
 const reset=state.source!==input.source||!input.allowed||!state.armed||![dt,dp].every(Number.isFinite)||dt<=0||dt>.15||dp< -100||dp>700||dp>0&&Math.abs(dp-dt*1000)>450;
 state.source=input.source;state.position=input.position;state.now=input.now;state.armed=input.allowed;
 if(reset){state.hit=undefined;for(const limb of state.limbs){limb.last=undefined;limb.history.length=0;limb.airborne=false;limb.lastHit=-Infinity;}return {segments:[] as [StagePoint,StagePoint][],landing:null};}
 const segments:[StagePoint,StagePoint][]=[];
 for(let i=0;i<8;i++){
  const point=input.points[i],limb=state.limbs[i];
  if(!valid(point)){limb.last=undefined;limb.history.length=0;limb.airborne=false;continue;}
  const scale=Number.isFinite(point.scale)&&point.scale!>0?point.scale!:1;
  const last=limb.last,speed=last?distance(last,point)/dt/scale:0;
  if(speed>5){limb.history.length=0;limb.airborne=false;limb.last={...point};continue;}
  if(i<4){
   if(speed>.35&&speed<5){limb.history.push({...point});if(limb.history.length>6)limb.history.shift();}
   else if(limb.history.length)limb.history.shift();
   for(let j=1;j<limb.history.length;j++)segments.push([limb.history[j-1],limb.history[j]]);
  }else{
   const height=(point.y-STAGE_FLOOR_V1135)/scale;
   if(height>.035)limb.airborne=true;
   if(limb.airborne&&last&&height<=.015&&point.y<last.y&&input.now-limb.lastHit>1.2&&(!state.hit||input.now-state.hit.at>1.2)){
    limb.airborne=false;limb.lastHit=input.now;state.hit={point:{x:point.x,y:STAGE_FLOOR_V1135+.006,z:point.z},at:input.now};
   }
  }
  limb.last={...point};
 }
 const age=state.hit?input.now-state.hit.at:2;
 if(age>=.65)state.hit=undefined;
 return {segments,landing:state.hit?{point:state.hit.point,age,gain:Math.sin(Math.PI*age/.65)**2}:null};
}
