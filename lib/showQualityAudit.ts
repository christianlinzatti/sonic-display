export type AuditPoint={x:number;y:number;z:number};
export type AuditSample={time:number;hips?:AuditPoint;left?:AuditPoint;right?:AuditPoint;leftPlanted?:boolean;rightPlanted?:boolean;camera?:AuditPoint};
export type ShowAudit={samples:number;plantedSeconds:number;slideSeconds:number;maxSlideSpeed:number;abruptMoves:number;cameraCuts:number;recentCuts:number[];last?:AuditSample};
export const newShowAudit=():ShowAudit=>({samples:0,plantedSeconds:0,slideSeconds:0,maxSlideSpeed:0,abruptMoves:0,cameraCuts:0,recentCuts:[]});
const valid=(p:AuditPoint|undefined):p is AuditPoint=>!!p&&[p.x,p.y,p.z].every(Number.isFinite);
const distance=(a:AuditPoint,b:AuditPoint)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
/** Measured residual motion only. No inferred contact, no good score for missing data. */
export function sampleShowAudit(state:ShowAudit,sample:AuditSample,bodyScale=1){
 if(!Number.isFinite(sample.time)||!Number.isFinite(bodyScale)||bodyScale<=0)return;
 const prev=state.last,dt=prev?sample.time-prev.time:0;
 state.last=sample;
 if(!prev||dt<=0||dt>.100001)return; // Pause, seek and missing frames break continuity.
 state.samples++;
 let measured=false,slide=0;
 for(const side of ['left','right'] as const){
  const a=prev[side],b=sample[side],key=side==='left'?'leftPlanted':'rightPlanted';
  if(sample[key]&&prev[key]&&valid(a)&&valid(b)){
   measured=true;slide=Math.max(slide,Math.hypot(b.x-a.x,b.z-a.z)/dt/bodyScale);
  }
 }
 if(measured){state.plantedSeconds+=dt;state.maxSlideSpeed=Math.max(state.maxSlideSpeed,slide);if(slide>.12)state.slideSeconds+=dt;}
 if(valid(sample.hips)&&valid(prev.hips)&&distance(sample.hips,prev.hips)/bodyScale>Math.max(.08,dt*3))state.abruptMoves++;
 if(state.recentCuts.length)state.recentCuts=state.recentCuts.filter(time=>sample.time-time<=10&&sample.time>=time);
 if(valid(sample.camera)&&valid(prev.camera)&&distance(sample.camera,prev.camera)>Math.max(.45,dt*10)){state.cameraCuts++;state.recentCuts.push(sample.time);state.recentCuts=state.recentCuts.slice(-60);}
}
export type AuditRect={x:number;y:number;width:number;height:number};
export function lyricLayoutAudit(text:AuditRect,viewport:AuditRect,performer?:AuditRect){
 const rect=(r:AuditRect)=>[r.x,r.y,r.width,r.height].every(Number.isFinite)&&r.width>0&&r.height>0;
 if(!rect(text)||!rect(viewport)||performer&&!rect(performer))return {measured:false,clipped:false,overlap:0};
 const area=performer?Math.max(0,Math.min(text.x+text.width,performer.x+performer.width)-Math.max(text.x,performer.x))*
  Math.max(0,Math.min(text.y+text.height,performer.y+performer.height)-Math.max(text.y,performer.y)):0;
 return {measured:true,clipped:text.x<viewport.x||text.y<viewport.y||text.x+text.width>viewport.x+viewport.width||text.y+text.height>viewport.y+viewport.height,overlap:area/(text.width*text.height)};
}
