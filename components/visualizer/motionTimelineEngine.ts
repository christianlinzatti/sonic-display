import { curveBlend, type BlendCurve, clamp } from "./motionBlendEngine";
export type BezierHandles = {x1:number;y1:number;x2:number;y2:number};
export type TimelineKey = { at: number; value: number };
export type TimelineSegment = { track?: number; id: string; clip: string; start: number; duration: number; fadeIn: number; fadeOut: number; speed: number; curve: BlendCurve | "bezier"; bezier?: BezierHandles; keys: TimelineKey[] };
export type MotionTimeline = { name: string; loop: boolean; bpm?: number; snap?: boolean; snapMode?: "off"|"beat"|"bar"; songSync?: boolean; trackId?: string; segments: TimelineSegment[] };
export const DEFAULT_BEZIER: BezierHandles = {x1:0.25,y1:0.1,x2:0.75,y2:0.9};
const coord = (a:number,b:number,c:number,t:number) => 3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t*c;
export function bezierValue(t:number, handles:BezierHandles=DEFAULT_BEZIER):number {
 const x=clamp(t);let lo=0,hi=1;
 for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(coord(0,handles.x1,handles.x2,mid)<x)lo=mid;else hi=mid;}
 return clamp(coord(0,handles.y1,handles.y2,(lo+hi)/2));
}
export function timelineCurve(t:number,s:TimelineSegment):number {return s.curve==="bezier"?bezierValue(t,s.bezier):curveBlend(t,s.curve);}
export function keyframeWeight(s:TimelineSegment, rel:number):number {
 const keys=[{at:0,value:1},...s.keys.filter(k=>k.at>=0&&k.at<=s.duration).sort((a,b)=>a.at-b.at),{at:s.duration,value:1}];
 for(let i=1;i<keys.length;i++){if(rel<=keys[i].at){const a=keys[i-1],b=keys[i];return clamp(a.value+(b.value-a.value)*timelineCurve((rel-a.at)/Math.max(.0001,b.at-a.at),s));}}
 return 1;
}
export const TIMELINE_DEFAULT: MotionTimeline = { name: "Neue Tanzsequenz", loop: true, segments: [] };
export function timelineDuration(t: MotionTimeline): number { return t.segments.reduce((m,s)=>Math.max(m, s.start+s.duration), 0); }
export function timelinePosition(t: MotionTimeline, elapsed: number): number { const d=timelineDuration(t); return t.loop && d>0 ? ((elapsed%d)+d)%d : Math.max(0,elapsed); }
export function timelineWeights(t: MotionTimeline, elapsed: number): Record<string,number> {
 const pos=timelinePosition(t,elapsed); const weights: Record<string,number> = {};
 for(const s of t.segments){ if(!s.clip || s.duration<=0 || pos<s.start || pos>=s.start+s.duration) continue;
 const rel=pos-s.start; const fadeIn=s.fadeIn>0?timelineCurve(rel/s.fadeIn,s):1;
 const fadeOut=s.fadeOut>0?timelineCurve((s.duration-rel)/s.fadeOut,s):1;
 const k=keyframeWeight(s,rel);
 weights[s.clip]=(weights[s.clip]||0)+clamp(Math.min(fadeIn,fadeOut)*k);
 }
 const total=Object.values(weights).reduce((a,b)=>a+b,0); if(total>1)for(const name in weights)weights[name]/=total;
 return weights;
}
export function sanitizeTimeline(raw: unknown): MotionTimeline {
 if(!raw || typeof raw!=="object")return {...TIMELINE_DEFAULT};
 const r=raw as Partial<MotionTimeline>;
 return {bpm:clamp(Number(r.bpm)||120,40,240),snap:r.snap!==false,snapMode:r.snapMode==="bar"||r.snapMode==="off"?r.snapMode:"beat",songSync:r.songSync===true,trackId:typeof r.trackId==="string"?r.trackId.slice(0,200):"",name:typeof r.name==="string"?r.name.slice(0,100):"Tanzsequenz",loop:r.loop!==false,segments:Array.isArray(r.segments)?r.segments.slice(0,40).filter(s=>s&&typeof s.clip==="string").map((s,i)=>({track:Math.round(clamp(Number(s.track)||0,0,7)),id:String(s.id||i),clip:s.clip.slice(0,200),start:clamp(Number(s.start),0,3600),duration:clamp(Number(s.duration),.1,600),fadeIn:clamp(Number(s.fadeIn),0,30),fadeOut:clamp(Number(s.fadeOut),0,30),speed:clamp(Number(s.speed)||1,.25,3),curve:(["linear","smooth","ease-in","ease-out","bezier"].includes(s.curve)?s.curve:"smooth") as TimelineSegment["curve"],bezier:s.bezier && typeof s.bezier==="object" ? {x1:clamp(Number(s.bezier.x1)),y1:clamp(Number(s.bezier.y1)),x2:clamp(Number(s.bezier.x2)),y2:clamp(Number(s.bezier.y2))}: {...DEFAULT_BEZIER},keys:Array.isArray(s.keys)?s.keys.slice(0,30).map(k=>({at:clamp(Number(k.at),0,600),value:clamp(Number(k.value))})):[]})):[]};
}

/** Quantise a position to the nearest musical beat. */
export function snapToBeat(seconds:number,bpm:number,enabled=true,division=1):number {
 const beat=60/Math.max(40,Math.min(240,bpm||120))/Math.max(1,division);
 return enabled?Math.max(0,Math.round(seconds/beat)*beat):Math.max(0,seconds);
}
/** Derive rows from clip lanes while retaining backwards compatible timeline schema. */
export function timelineTracks(t:MotionTimeline):number[] {
 return Array.from(new Set([0,...t.segments.map(s=>s.track??0)])).sort((a,b)=>a-b);
}
