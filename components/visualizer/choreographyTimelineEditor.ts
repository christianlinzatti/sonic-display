/** V202: pure, bounded editing helpers. Saved live sequences still use EvolutionStep. */
import type {EvolutionStep} from "./smartChoreographyEvolution";
export type TimelineEditStep=EvolutionStep & {crossfade:number};
export const clampBars=(value:number)=>Math.max(1,Math.min(16,Math.round(Number.isFinite(value)?value:1)));
export const clampCrossfade=(value:number)=>Math.max(0.1,Math.min(4,Number.isFinite(value)?Math.round(value*20)/20:0.6));
export function normalizeTimeline(items:TimelineEditStep[]):TimelineEditStep[]{return items.slice(0,12).filter(x=>typeof x.motionId==="string"&&/^[\w:-]{1,160}$/.test(x.motionId)).map(x=>({motionId:x.motionId,bars:clampBars(x.bars),crossfade:clampCrossfade(x.crossfade)}));}
export function reorderTimeline<T>(list:readonly T[],from:number,to:number):T[]{const out=list.slice();if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=out.length||to>=out.length||from===to)return out;const [item]=out.splice(from,1);out.splice(to,0,item);return out;}
export function timelineAtBar(steps:readonly EvolutionStep[],bar:number):number {if(!steps.length)return -1;const size=steps.reduce((s,x)=>s+clampBars(x.bars),0);let at=((Math.floor(bar)%size)+size)%size;for(let i=0;i<steps.length;i++){at-=clampBars(steps[i].bars);if(at<0)return i;}return 0;}
export function timelineBars(steps:readonly EvolutionStep[]):number{return steps.reduce((n,x)=>n+clampBars(x.bars),0);}
