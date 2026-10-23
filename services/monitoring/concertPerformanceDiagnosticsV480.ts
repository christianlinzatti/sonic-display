/** V480 – bounded, session-only concert diagnostics.
 * Fed by the existing V479 one-second render sample; no RAF, GPU timer,
 * network request, persistent storage or changes to any quality policy.
 */
import type {PiConcertBudgetV479,PiConcertSampleV479,PiConcertLevelV479} from './piConcertBudgetV479';

export const CONCERT_HISTORY_LIMIT_V480 = 90;
export const CONCERT_EVENT_LIMIT_V480 = 24;
export const CONCERT_SAMPLE_INTERVAL_V480 = 750;

export type ConcertReadingV480=Readonly<{
  at:number;fps:number;frameMs:number;p95FrameMs:number;slowPercent:number;
  drawCalls:number;triangles:number;avatarCount:number;
  piEnabled:boolean;piLevel:PiConcertLevelV479;piProfile:PiConcertBudgetV479['profile'];
}>;
export type ConcertChangeV480=Readonly<{
  at:number;from:string;to:string;reason:string;
}>;
export type ConcertSnapshotV480=Readonly<{
  readings:readonly ConcertReadingV480[];
  changes:readonly ConcertChangeV480[];
  lastAt:number;
}>;
export type ConcertRenderSampleV480=Readonly<{
  updatedAt:number;fps:number;frameMs:number;p95FrameMs?:number;slowPercent:number;
  drawCalls:number;triangles:number;avatarCount?:number;
}>;
export type ConcertInputV480=Readonly<{
  sample:PiConcertSampleV479;render:ConcertRenderSampleV480;
  before:PiConcertBudgetV479;after:PiConcertBudgetV479;
}>;
export function emptyConcertSnapshotV480():ConcertSnapshotV480{return {readings:[],changes:[],lastAt:0};}
function finiteRange(value:number,minimum:number,maximum:number):boolean{
  return Number.isFinite(value)&&value>=minimum&&value<=maximum;
}
export function advanceConcertSnapshotV480(previous:ConcertSnapshotV480,input:ConcertInputV480):ConcertSnapshotV480{
  const {sample,render,before,after}=input;
  if(!sample.playing||!sample.visible||!finiteRange(sample.at,1,Number.MAX_SAFE_INTEGER)||
     sample.at<=previous.lastAt||(previous.lastAt>0&&sample.at-previous.lastAt<CONCERT_SAMPLE_INTERVAL_V480)||
     !finiteRange(sample.fps,0.01,240)||!finiteRange(sample.p95FrameMs,0.01,250)||
     !finiteRange(sample.avatarCount,1,4)||
     !finiteRange(render.updatedAt,1,Number.MAX_SAFE_INTEGER)||
     Math.abs(sample.at-render.updatedAt)>2500||
     !finiteRange(render.fps,0.01,240)||Math.abs(render.fps-sample.fps)>0.1||
     !finiteRange(render.frameMs,0.01,250)||
     !finiteRange(render.slowPercent,0,100)||
     !finiteRange(render.drawCalls,0,1000000)||!finiteRange(render.triangles,0,1000000000)||
     !finiteRange(render.avatarCount??0,1,4)||render.avatarCount!==sample.avatarCount)return previous;
  const reading:ConcertReadingV480={at:sample.at,fps:sample.fps,frameMs:render.frameMs,
    p95FrameMs:sample.p95FrameMs,slowPercent:render.slowPercent,
    drawCalls:render.drawCalls,triangles:render.triangles,avatarCount:sample.avatarCount,
    piEnabled:after.enabled,piLevel:after.level,piProfile:after.profile};
  const nextChanges=[...previous.changes];
  if(before.profile!==after.profile||before.enabled!==after.enabled||before.level!==after.level){
    const label=(b:PiConcertBudgetV479)=>b.enabled?`${b.profile}: ${b.level}`:'aus';
    nextChanges.push({at:sample.at,from:label(before),to:label(after),reason:after.reason});
  }
  return {readings:[...previous.readings,reading].slice(-CONCERT_HISTORY_LIMIT_V480),
    changes:nextChanges.slice(-CONCERT_EVENT_LIMIT_V480),lastAt:sample.at};
}
export type ConcertSummaryV480=Readonly<{
  count:number;avgFps:number;minFps:number;p95FrameMs:number;avgSlowPercent:number;
  maxDrawCalls:number;avatars:number;grade:'stable'|'strained'|'limited'|'insufficient';
}>;
export function summarizeConcertV480(readings:readonly ConcertReadingV480[]):ConcertSummaryV480{
  const window=readings.slice(-30);
  if(window.length===0)return {count:0,avgFps:0,minFps:0,p95FrameMs:0,avgSlowPercent:0,maxDrawCalls:0,avatars:0,grade:'insufficient'};
  const mean=(values:number[])=>values.reduce((sum,value)=>sum+value,0)/values.length;
  const avgFps=mean(window.map(s=>s.fps));
  const p95FrameMs=Math.max(...window.map(s=>s.p95FrameMs));
  const avgSlowPercent=mean(window.map(s=>s.slowPercent));
  const grade=window.length<5?'insufficient':avgFps<28||p95FrameMs>47?'strained':
    avgFps<42||p95FrameMs>34?'limited':'stable';
  return {count:window.length,avgFps,minFps:Math.min(...window.map(s=>s.fps)),p95FrameMs,
    avgSlowPercent,maxDrawCalls:Math.max(...window.map(s=>s.drawCalls)),
    avatars:window[window.length-1].avatarCount,grade};
}
