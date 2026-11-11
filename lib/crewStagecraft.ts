export type StagePoint={x:number;z:number};
export function crewStageTarget(base:StagePoint,slot:number,count:number,leader:number,partner:number,together:boolean,preparation?:{leader:number;partner:number;progress:number}):StagePoint{
 const centre=(count-1)/2;
 const result={x:base.x+Math.sign(slot-centre)*.10,z:base.z+(together?-.16*Math.abs(slot-centre):slot===leader?.36:slot===partner?.12:-.18)};
 if(preparation&&Number.isFinite(preparation.progress)){
  const gain=Math.max(0,Math.min(.65,preparation.progress*.65));
  const depth=slot===preparation.leader?.36:slot===preparation.partner?.12:-.18;
  result.z+=(base.z+depth-result.z)*gain;
 }
 return result;
}
/** Single-support steps only; one root owner, fixed lanes, bounded speed and distance checks. */
export function stepCrewStage(current:StagePoint,target:StagePoint,others:readonly StagePoint[],dt:number,allowed:boolean,minSpacing:number):StagePoint{
 if(!allowed||![current.x,current.z,target.x,target.z,dt,minSpacing].every(Number.isFinite)||dt<=0)return current;
 const dx=target.x-current.x,dz=target.z-current.z,distance=Math.hypot(dx,dz),step=Math.min(distance,.08*Math.min(.05,dt));
 if(distance<1e-6)return current;
 const next={x:current.x+dx/distance*step,z:current.z+dz/distance*step};
 if(Math.abs(next.x)>4.5||Math.abs(next.z)>1.4||others.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.hypot(p.x-next.x,p.z-next.z)<Math.max(.9,minSpacing)))return current;
 return next;
}
