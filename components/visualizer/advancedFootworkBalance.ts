/** V204: bounded foot plant locking / support blending. Pure, frame-rate independent math. */
export type BalanceFoot = { x:number; y:number; z:number; phase:"airborne"|"candidate"|"planted"|"releasing"; confidence:number };
export type BalanceAnchor = { x:number; y:number; z:number; planted:boolean; influence:number };
export type BalanceState = {left:BalanceAnchor;right:BalanceAnchor;support:number; landing:number};
const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(x)?x:0));
export const createBalanceAnchor=():BalanceAnchor=>({x:0,y:0,z:0,planted:false,influence:0});
export const createBalanceState=():BalanceState=>({left:createBalanceAnchor(),right:createBalanceAnchor(),support:0,landing:0});
export function updateBalanceAnchor(state:BalanceAnchor,foot:BalanceFoot,dt:number,softness=0.5):BalanceAnchor {
  const step=clamp(dt,0,0.1);
  const inContact=foot.phase==="planted";
  if(inContact&&!state.planted){state.x=foot.x;state.y=foot.y;state.z=foot.z;}
  state.planted=inContact;
  const target=inContact?clamp(foot.confidence):0;
  const response=(target>state.influence?8:13)*(1-0.55*clamp(softness));
  state.influence=clamp(state.influence+(target-state.influence)*(1-Math.exp(-response*step)));
  return state;
}
export function resolveSupport(left:BalanceAnchor,right:BalanceAnchor):number {
  const sum=left.influence+right.influence;
  return sum<=0.001?0:clamp((right.influence-left.influence)/sum,-1,1);
}
export function boundedFootTarget(state:BalanceAnchor,foot:BalanceFoot,legLength:number,lock=0.5) {
  const max=Math.max(0.001,legLength)*(0.03+0.14*clamp(lock));
  const dx=state.x-foot.x,dy=state.y-foot.y,dz=state.z-foot.z;
  const distance=Math.hypot(dx,dy,dz);
  const ratio=distance>max?max/distance:1;
  return {x:foot.x+dx*ratio,y:foot.y+dy*ratio,z:foot.z+dz*ratio,weight:state.influence};
}
export function updateLanding(current:number, feetOnFloor:boolean,dt:number):number {
  const target=feetOnFloor?1:0;const rate=feetOnFloor?6:16;
  return clamp(current+(target-current)*(1-Math.exp(-rate*clamp(dt,0,0.1))));
}
