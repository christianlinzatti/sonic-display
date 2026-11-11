export type ReviewPoint={x:number;y:number;z:number};
export type ReviewClip={slot:number;clip:string};
export type ShowReviewFrame={source:string;nowMs:number;positionMs:number;durationMs:number;playing:boolean;eligible:boolean;reading:boolean;intentionalMotif:boolean;
 camera?:ReviewPoint;clips?:readonly ReviewClip[];lyrics?:{clipped:boolean;overlap:number}};
type Hold={clip:string;since:number;freeSince:number};
export type ConcertShowReview={source:string;durationMs:number;ranges:[number,number][];samples:number;cameraMs:number;lyricMs:number;crewMs:number;clippedMs:number;overlapMs:number;readingMotionMs:number;longHoldMs:number;rapidChanges:number;cameraCuts:number;
 last?:ShowReviewFrame;holds:Map<number,Hold>;readingSince:number;readingAnchor?:ReviewPoint};
export function newConcertShowReview(source:string,durationMs:number):ConcertShowReview{
 return {source,durationMs:Number.isFinite(durationMs)&&durationMs>0?durationMs:0,ranges:[],samples:0,cameraMs:0,lyricMs:0,crewMs:0,clippedMs:0,overlapMs:0,readingMotionMs:0,longHoldMs:0,rapidChanges:0,cameraCuts:0,holds:new Map(),readingSince:0};
}
const point=(p:ReviewPoint|undefined):p is ReviewPoint=>!!p&&[p.x,p.y,p.z].every(Number.isFinite);
const distance=(a:ReviewPoint,b:ReviewPoint)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function cover(state:ConcertShowReview,start:number,end:number){
 const limit=state.durationMs||86400000,a=Math.max(0,Math.min(limit,start)),b=Math.max(0,Math.min(limit,end));if(b<=a)return;
 state.ranges.push([a,b]);state.ranges.sort((x,y)=>x[0]-y[0]);
 const merged:[number,number][]=[];
 for(const range of state.ranges){const last=merged.at(-1);if(last&&range[0]<=last[1]+1)last[1]=Math.max(last[1],range[1]);else if(merged.length<2048)merged.push(range);}
 state.ranges=merged;
}
/** Actual continuous playback coverage. Seeks, pauses and missing data never earn a full-song badge. */
export function sampleConcertShowReview(state:ConcertShowReview,frame:ShowReviewFrame){
 if(frame.source!==state.source||![frame.nowMs,frame.positionMs,frame.durationMs].every(Number.isFinite)||frame.positionMs<0)return;
 if(frame.durationMs>0)state.durationMs=frame.durationMs;
 const previous=state.last;state.last=frame;
 const dt=previous?frame.nowMs-previous.nowMs:0,dp=previous?frame.positionMs-previous.positionMs:0;
 const continuous=previous&&previous.playing&&frame.playing&&previous.eligible&&frame.eligible&&dt>0&&dt<=2000&&dp>0&&Math.abs(dp-dt)<=Math.max(180,dt*.2);
 if(!continuous){state.holds.clear();state.readingAnchor=undefined;state.readingSince=frame.nowMs;return;}
 cover(state,previous.positionMs,frame.positionMs);state.samples++;
 if(frame.lyrics&&previous.lyrics){state.lyricMs+=dt;if(frame.lyrics.clipped)state.clippedMs+=dt;if(frame.lyrics.overlap>.05)state.overlapMs+=dt;}
 if(point(frame.camera)&&point(previous.camera)){
  state.cameraMs+=dt;
  if(distance(frame.camera,previous.camera)>Math.max(.65,dt/1000*6))state.cameraCuts++;
  if(frame.reading){
   if(!previous.reading||!state.readingAnchor){state.readingSince=frame.nowMs;state.readingAnchor={...frame.camera};}
   if(frame.nowMs-state.readingSince<1000)state.readingAnchor={...frame.camera};
   else if(distance(frame.camera,state.readingAnchor)>.12)state.readingMotionMs+=dt;
  }else state.readingAnchor=undefined;
 }else{state.readingAnchor=undefined;state.readingSince=frame.nowMs;}
 const intentional=frame.intentionalMotif||frame.reading;
 const clips=(frame.clips??[]).filter(c=>Number.isInteger(c.slot)&&c.slot>=0&&c.slot<4&&/^Dance_[\w-]{1,64}$/.test(c.clip));
 if(clips.length)state.crewMs+=dt;
 for(const clip of clips){
  const old=state.holds.get(clip.slot);
  if(old&&old.clip!==clip.clip&&frame.nowMs-old.since<1500)state.rapidChanges++;
  const hold=!old||old.clip!==clip.clip?{clip:clip.clip,since:frame.nowMs,freeSince:frame.nowMs}:old;
  if(intentional)hold.freeSince=frame.nowMs;
  state.holds.set(clip.slot,hold);
 }
 // Count time once for the crew, not once per performer.
 if(!intentional&&clips.some(c=>frame.nowMs-(state.holds.get(c.slot)?.freeSince??frame.nowMs)>32000))state.longHoldMs+=dt;
 for(const slot of state.holds.keys())if(!clips.some(c=>c.slot===slot))state.holds.delete(slot);
}
export function summarizeConcertShow(state:ConcertShowReview){
 const observedMs=state.ranges.reduce((sum,[a,b])=>sum+b-a,0),coverage=state.durationMs>0?Math.min(1,observedMs/state.durationMs):0;
 const fullSong=coverage>=.95&&(state.ranges[0]?.[0]??Infinity)<=1000&&(state.ranges.at(-1)?.[1]??0)>=state.durationMs-1000;
 const warnings:string[]=[];
 if(state.clippedMs>500)warnings.push('Lyrics verlassen die sichtbare Lesezone');
 if(state.overlapMs>500)warnings.push('Lyrics überlappen die Konzertbühne');
 if(state.readingMotionMs>1000)warnings.push('Kamera bewegt sich während schneller Lyrics');
 if(state.cameraCuts>=4)warnings.push('Mehrere abrupte Kamerasprünge beobachtet');
 if(state.rapidChanges>=3)warnings.push('Sehr schnelle Tanzwechsel beobachtet');
 if(state.longHoldMs>4000)warnings.push('Langes unverändertes Tanzmotiv außerhalb geplanter Rückkehr');
 return {source:state.source,samples:state.samples,observedMs:Math.round(observedMs),coverage,fullSong,cameraMs:Math.round(state.cameraMs),lyricMs:Math.round(state.lyricMs),crewMs:Math.round(state.crewMs),cameraCuts:state.cameraCuts,rapidChanges:state.rapidChanges,clippedMs:Math.round(state.clippedMs),overlapMs:Math.round(state.overlapMs),readingMotionMs:Math.round(state.readingMotionMs),longHoldMs:Math.round(state.longHoldMs),warnings};
}
export type ConcertShowSummary=ReturnType<typeof summarizeConcertShow>;
