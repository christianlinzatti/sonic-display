/** V788: opt-in concert-fixture governor. Does not touch live production preferences.
 * Decisions use measured frame intervals, not a synthetic GPU cost or guessed FPS.
 * Protects GLB mixer cadence, mouth morphs, lyrics and camera unconditionally. */
export type GovernorModeV788='off'|'on';
export type GovernorLevelV788=0|1|2;
export type GovernorTargetV788=30|45|60;
export type GovernorBudgetV788={level:GovernorLevelV788;name:'Full'|'Decor reduced'|'Background minimal';stageStrength:number;stageReactive:boolean;stageReducedMotion:boolean;danceFx:{enabled:boolean;strength:number;shockwaves:boolean;footprints:boolean;trails:boolean};protected:{avatarAnimation:true;lipSync:true;lyrics:true;camera:true;leadPerformer:true}};
export const GOVERNOR_BUDGETS_V788:readonly GovernorBudgetV788[]=[
 {level:0,name:'Full',stageStrength:72,stageReactive:true,stageReducedMotion:false,danceFx:{enabled:true,strength:80,shockwaves:true,footprints:true,trails:true},protected:{avatarAnimation:true,lipSync:true,lyrics:true,camera:true,leadPerformer:true}},
 {level:1,name:'Decor reduced',stageStrength:52,stageReactive:true,stageReducedMotion:false,danceFx:{enabled:true,strength:50,shockwaves:true,footprints:false,trails:false},protected:{avatarAnimation:true,lipSync:true,lyrics:true,camera:true,leadPerformer:true}},
 {level:2,name:'Background minimal',stageStrength:32,stageReactive:false,stageReducedMotion:true,danceFx:{enabled:false,strength:0,shockwaves:false,footprints:false,trails:false},protected:{avatarAnimation:true,lipSync:true,lyrics:true,camera:true,leadPerformer:true}}
] as const;
export type GovernorTransitionV788={frame:number;from:GovernorLevelV788;to:GovernorLevelV788;reason:'frame-budget-exceeded'|'sustained-recovery';windowP95Ms:number};
export type GovernorCaseV788={id:string;pass:number;avatars:2|4;frames:number;finalLevel:GovernorLevelV788;levelFrames:[number,number,number];transitions:GovernorTransitionV788[];invalidFrames:number;windowCount:number};
const p95=(xs:readonly number[])=>[...xs].sort((a,b)=>a-b)[Math.ceil(xs.length*.95)-1];
const round=(v:number)=>Math.round(v*100)/100;
/** 24 real frames/window, require two bad or five good windows, minimum 72-frame hold.
 * A safety margin avoids thrashing near the target: down at 1.12x, up at 0.78x. */
export function createConcertGovernorV788(target:GovernorTargetV788=45,mode:GovernorModeV788='on'){
 if(![30,45,60].includes(target)||!['on','off'].includes(mode))throw Error('Ungültige V788-Reglerkonfiguration');
 let frame=0,level:GovernorLevelV788=0,bad=0,good=0,lastChange=-100000,invalidFrames=0,windowCount=0;
 const window:number[]=[],levelFrames:[number,number,number]=[0,0,0],transitions:GovernorTransitionV788[]=[];
 function step(ms:number){
  frame++;levelFrames[level]++;
  if(!Number.isFinite(ms)||ms<=0||ms>5000){invalidFrames++;return level}
  if(mode==='off')return level;
  window.push(ms);if(window.length<24)return level;
  windowCount++;const measured=p95(window);window.length=0;
  const threshold=1000/target;
  if(measured>threshold*1.12){bad++;good=0}
  else if(measured<threshold*.78){good++;bad=0}
  else{bad=0;good=0}
  if(frame-lastChange<72)return level;
  let next:GovernorLevelV788=level;let reason:GovernorTransitionV788['reason']='frame-budget-exceeded';
  if(bad>=2&&level<2){next=(level+1) as GovernorLevelV788;reason='frame-budget-exceeded'}
  else if(good>=5&&level>0){next=(level-1) as GovernorLevelV788;reason='sustained-recovery'}
  if(next!==level){transitions.push({frame,from:level,to:next,reason,windowP95Ms:round(measured)});level=next;lastChange=frame;bad=0;good=0}
  return level;
 }
 function snapshot(id:string,pass:number,avatars:2|4):GovernorCaseV788{return {id,pass,avatars,frames:frame,finalLevel:level,levelFrames:[...levelFrames],transitions:transitions.map(t=>({...t})),invalidFrames,windowCount}}
 return {step,snapshot,get level(){return level},get budget(){return GOVERNOR_BUDGETS_V788[level]}};
}
export type GovernorTraceV788={format:'sonic-concert-governor-v788';version:1;mode:GovernorModeV788;target:GovernorTargetV788;
 environment:{userAgent:string;renderer:string;viewport:string;dpr:number;antialias:boolean;softwareRenderer:boolean};
 assets:{hashes:string[];mode:'reference'|'user-glb'};
 config:{passes:number;warmupFrames:number;sampleFrames:number;profile:'cinematic';protect:'avatar-mouth-lyrics-camera-v1';windowFrames:24};
 scenes:GovernorCaseV788[]};
