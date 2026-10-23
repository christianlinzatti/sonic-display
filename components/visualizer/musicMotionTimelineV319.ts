/** V319: deterministic song-time grid and safe non-destructive multi-track editing.
 * Imported marker coordinates are absolute seconds in the active track, not local clip time. */
import type {TrackAnalysisV318,AnalysisMarkerV318,AnalysisSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {TimelineSegment} from './motionTimelineEngine';

export type SnapModeV319='off'|'beat'|'bar';
export type GridSourceV319='imported'|'bpm';
export type MotionGridV319={source:GridSourceV319;beatSource:GridSourceV319;barSource:GridSourceV319;trackId:string;tempo:number;timeSignature:number;beats:readonly number[];bars:readonly number[];sections:readonly {at:number;label?:string}[]};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,Number.isFinite(n)?n:lo));
const round=(n:number)=>Math.round(n*1000)/1000;
const positions=(markers:readonly AnalysisMarkerV318[],limit:number)=>markers.slice(0,limit).map(m=>m.startMs/1000).filter(x=>finite(x)&&x>=0).sort((a,b)=>a-b).filter((x,i,a)=>i===0||x>a[i-1]);
export function makeMotionGridV319(trackId:string,analysis:TrackAnalysisV318|null,tempo:number,viewSeconds:number):MotionGridV319{
 const ok=Boolean(trackId&&analysis?.trackId===trackId);
 const bpm=clamp(ok?(analysis?.tempo??tempo):tempo,40,240);
 const meter=ok?clamp(analysis?.timeSignature??4,1,12):4;
 const limit=clamp(viewSeconds,1,3600);
 const providedBeats=ok?positions(analysis!.beats,4500):[];
 const providedBars=ok?positions(analysis!.bars,1400):[];
 // Do not manufacture detected beat events or labels. Fallback is an explicitly synthetic grid.
 const beats=providedBeats.length?providedBeats:Array.from({length:Math.min(4500,Math.ceil(limit*bpm/60)+1)},(_,i)=>round(i*60/bpm));
 const bars=providedBars.length?providedBars:providedBeats.length
   ?providedBeats.filter((_,i)=>i%meter===0)
   :Array.from({length:Math.min(1400,Math.ceil(limit*bpm/60/meter)+1)},(_,i)=>round(i*60/bpm*meter));
 const sections=ok?analysis!.sections.slice(0,160).filter(s=>finite(s.startMs)&&s.startMs>=0).map((s:AnalysisSectionV318)=>({at:s.startMs/1000,label:s.confidence>=.5?s.label:undefined})):[];
 return {source:providedBeats.length||providedBars.length?'imported':'bpm',beatSource:providedBeats.length?'imported':'bpm',barSource:providedBars.length?'imported':'bpm',trackId,tempo:bpm,timeSignature:meter,beats,bars,sections};
}
/** Binary-search nearest marker. Never snap far beyond the last known imported marker. */
export function snapMotionSecondV319(seconds:number,grid:MotionGridV319,mode:SnapModeV319):number{
 const value=clamp(seconds,0,3600);
 if(mode==='off')return round(value);
 const items=mode==='bar'?grid.bars:grid.beats;
 if(!items.length)return round(value);
 let lo=0,hi=items.length;
 while(lo<hi){const m=(lo+hi)>>>1;if(items[m]<value)lo=m+1;else hi=m;}
 const before=items[Math.max(0,lo-1)];const after=items[Math.min(items.length-1,lo)];
 const closest=Math.abs(value-before)<=Math.abs(value-after)?before:after;
 // For imported data, don't jump to the final marker many seconds after its coverage.
 const range=mode==='bar'?grid.timeSignature*60/grid.tempo:60/grid.tempo;
 if((mode==='beat'?grid.beatSource:grid.barSource)==='imported'&&Math.abs(value-closest)>Math.max(.15,range*1.6))return round(value);
 return round(closest);
}
export type EditModeV319='move'|'trim-start'|'trim-end'|'fade-in'|'fade-out';
export function editMotionSegmentV319(segment:TimelineSegment,mode:EditModeV319,offset:number,grid:MotionGridV319,snap:SnapModeV319):TimelineSegment{
 const start=clamp(segment.start,0,3600),duration=clamp(segment.duration,.1,600);
 const end=start+duration;
 let next:TimelineSegment={...segment};
 if(mode==='move')next.start=snapMotionSecondV319(start+offset,grid,snap);
 if(mode==='trim-start'){
   const newStart=Math.min(end-.1,snapMotionSecondV319(start+offset,grid,snap));
   const shift=newStart-start;
   next={...next,start:round(newStart),duration:round(end-newStart),keys:segment.keys.map(k=>({at:round(k.at-shift),value:k.value})).filter(k=>k.at>=0&&k.at<=end-newStart)};
 }
 if(mode==='trim-end'){
   const newEnd=Math.max(start+.1,snapMotionSecondV319(end+offset,grid,snap));
   next={...next,duration:round(Math.min(600,newEnd-start)),keys:segment.keys.filter(k=>k.at<=newEnd-start)};
 }
 if(mode==='fade-in')next.fadeIn=round(clamp(segment.fadeIn+offset,0,duration));
 if(mode==='fade-out')next.fadeOut=round(clamp(segment.fadeOut-offset,0,duration));
 next.duration=clamp(next.duration,.1,600);
 next.fadeIn=clamp(next.fadeIn,0,next.duration);
 next.fadeOut=clamp(next.fadeOut,0,next.duration);
 return next;
}
export function timelineSongSecondsV319(localSeconds:number,trackId:string|undefined,currentTrackId:string|undefined,progressMs:number|undefined,songSync:boolean):number|null{
 if(!songSync)return Math.max(0,finite(localSeconds)?localSeconds:0);
 if(!trackId||trackId!==currentTrackId||!finite(progressMs))return null;
 return Math.max(0,progressMs/1000);
}
