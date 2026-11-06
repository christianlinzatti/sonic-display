/** V1034 – deterministic, resource-bounded choreography for the circular arena.
 * Section markers come from the existing song/concert director; no second AI
 * request, clock owner, camera or beat analyzer is created here.
 */
export type ArenaSectionV1034 = 'verse'|'hook'|'drop'|'build'|'break';
export type ArenaFormationV1034 = 'focus'|'fan'|'burst'|'spiral'|'halo';
export type ArenaShowPlanV1034 = {section:ArenaSectionV1034;lift:number;spin:number;brightness:number;formation:ArenaFormationV1034};
export type ArenaLiftStateV1034 = {height:number;rotation:number};
export const INITIAL_ARENA_LIFT_V1034:ArenaLiftStateV1034={height:0,rotation:0};
const TAU=Math.PI*2;
const clamp01=(v:number|undefined)=>Number.isFinite(v)?Math.max(0,Math.min(1,v!)):0;
const safeDelta=(v:number)=>Number.isFinite(v)?Math.min(.1,Math.max(0,v)):0;

/** Unknown or absent song sections remain a calm verse rather than inventing a drop. */
export function normalizeArenaSectionV1034(section:string|undefined|null):ArenaSectionV1034 {
 const s=(section??'').toLowerCase().replace(/[\s_-]+/g,'');
 if(s==='hook'||s==='chorus'||s==='refrain')return 'hook';
 if(s==='drop'||s==='climax')return 'drop';
 if(s==='build'||s==='buildup'||s==='prechorus')return 'build';
 if(s==='break'||s==='bridge'||s==='intro'||s==='outro'||s==='interlude')return 'break';
 return 'verse';
}
const PLANS:Record<ArenaSectionV1034,ArenaShowPlanV1034>={
 verse:{section:'verse',lift:.035,spin:.12,brightness:.44,formation:'focus'},
 hook:{section:'hook',lift:.15,spin:.29,brightness:.73,formation:'fan'},
 drop:{section:'drop',lift:.27,spin:-.42,brightness:.88,formation:'burst'},
 build:{section:'build',lift:.11,spin:.22,brightness:.65,formation:'spiral'},
 break:{section:'break',lift:0,spin:0,brightness:.28,formation:'halo'},
};
export function planArenaShowV1034(section:string|undefined|null):ArenaShowPlanV1034 {
 return PLANS[normalizeArenaSectionV1034(section)];
}
/** The second mechanical tier is a SCENIC RING around the performer center.
 * Performers stay on their original shared deck; no avatar foot IK or rigs move.
 * Height is limited to 27 cm, with smooth transitions and finite rotation.
 */
export function stepArenaLiftV1034(previous:ArenaLiftStateV1034,deltaSeconds:number,opts:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 section?:string|null;energy?:number;
}):ArenaLiftStateV1034 {
 if(!opts.enabled||opts.reducedMotion)return INITIAL_ARENA_LIFT_V1034;
 if(!opts.playing||!opts.reactive)return previous;
 const dt=safeDelta(deltaSeconds),plan=planArenaShowV1034(opts.section);
 const energy=clamp01(opts.energy);
 const target=plan.lift*(.88+.12*energy);
 const prevHeight=Number.isFinite(previous.height)?Math.max(0,Math.min(.27,previous.height)):0;
 const prevRotation=Number.isFinite(previous.rotation)?previous.rotation:0;
 const blend=1-Math.exp(-dt*1.35);
 return {height:Math.max(0,Math.min(.27,prevHeight+(target-prevHeight)*blend)),
   rotation:(prevRotation+plan.spin*dt)%TAU};
}
export type ArenaSkyFixtureV1034={index:number;angle:number;x:number;y:number;z:number};
/** Fixed overhead light sculptures (not added WebGL lights). One instanced draw. */
export function createArenaSkyFixturesV1034(tier:'low'|'balanced'|'high'):ArenaSkyFixtureV1034[]{
 const count=tier==='low'?16:tier==='balanced'?32:48;
 return Array.from({length:count},(_,index)=>{
  const angle=TAU*(index+.5)/count;
  return {index,angle,x:4.15*Math.cos(angle),y:3.22+(.08*Math.sin(angle*4)),z:4.15*Math.sin(angle)};
 });
}
/** Gradual alternating beams; no flashes, true strobes or extra real light sources.
 * Result is a bounded intensity for a decorative emissive pixel fixture.
 */
export function sampleArenaSkyFixtureV1034(fixture:ArenaSkyFixtureV1034,time:number,section:string|null|undefined,bass:number):number{
 const plan=planArenaShowV1034(section);
 if(!Number.isFinite(time))return .22;
 const a=fixture.angle,t=Math.max(0,time),e=clamp01(bass);
 let pattern=0;
 switch(plan.formation){
  case 'focus': pattern=.5+.5*Math.cos(a*2);break;
  case 'fan': pattern=.5+.5*Math.cos(a*6-t*.65);break;
  case 'burst':pattern=.5+.5*Math.cos(a*8-t*.9);break;
  case 'spiral':pattern=.5+.5*Math.cos(a*3-t*.48);break;
  case 'halo':pattern=.4;break;
 }
 return Math.max(.14,Math.min(.9,.15+plan.brightness*(.24+.44*pattern+.1*e)));
}
/** This is ONLY a minor trim to an already-authorized automatic camera pose.
 * The existing camera director interpolates it and retains all manual/lyric locks.
 */
export function composeArenaSectionCameraV1034<T extends {x:number;y:number;z:number;fov:number;targetX?:number;targetY:number;targetZ?:number}>(
 pose:T,opts:{enabled:boolean;playing:boolean;reducedMotion:boolean;protectedShot:boolean;section?:string|null}
):T {
 if(!opts.enabled||!opts.playing||opts.reducedMotion||opts.protectedShot)return pose;
 const phase=normalizeArenaSectionV1034(opts.section);
 const tx=pose.targetX??0,tz=pose.targetZ??0,x=pose.x-tx,z=pose.z-tz;
 const radius=Math.hypot(x,z);
 if(!Number.isFinite(radius)||radius<4||!Number.isFinite(pose.y)||!Number.isFinite(pose.fov))return pose;
 const scale=phase==='hook'?1.07:phase==='drop'?.96:phase==='build'?1.025:1;
 const height=phase==='drop'?.28:phase==='hook'?.16:phase==='build'?.08:0;
 const fov=phase==='hook'?2:phase==='drop'?1.5:0;
 return {...pose,x:tx+x*scale,z:tz+z*scale,y:pose.y+height,
  fov:Math.min(78,Math.max(34,pose.fov+fov))};
}
