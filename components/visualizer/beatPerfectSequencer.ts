/** V199: pause-safe transport and bar-boundary quantization for motion sequencing. */
export type BeatTransport = {seconds:number; lastBpm:number; beat:number; phase:number; playing:boolean};
export const initialBeatTransport=():BeatTransport=>({seconds:0,lastBpm:120,beat:0,phase:0,playing:false});
export const validBpm=(value:number|undefined|null):number=>Number.isFinite(value)&&value!>=50&&value!<=240?value!:120;
export function advanceBeatTransport(previous:BeatTransport,delta:number,playing:boolean,bpm:number|undefined):BeatTransport {
 const tempo=validBpm(bpm);
 if(!playing||!Number.isFinite(delta)||delta<=0||delta>1) return {...previous,lastBpm:tempo,playing};
 const beat=previous.beat+delta*tempo/60;
 return {seconds:previous.seconds+delta,lastBpm:tempo,beat,phase:beat-Math.floor(beat),playing};
}
export function barPosition(beat:number,beatsPerBar:number):number {
 const size=Math.max(1,Math.min(16,Math.round(beatsPerBar)||4));
 return ((beat%size)+size)%size;
}
export function nextBoundaryDelay(beat:number,bpm:number|undefined,beatsPerBar=4):number {
 const size=Math.max(1,Math.min(16,Math.round(beatsPerBar)||4));
 const rem=barPosition(beat,size);
 return (rem<1e-6?0:size-rem)*60/validBpm(bpm);
}
/** Full number of completed musical bars in the phase. No wall-clock drift during pause. */
export function completedBars(beat:number,beatsPerBar=4):number {
 const size=Math.max(1,Math.min(16,Math.round(beatsPerBar)||4));
 return Math.floor(Math.max(0,beat)/size);
}
/** Prepare a pending switch only when close to the next bar, but commit on the boundary. */
export function shouldCommitMotionSwitch(previousBeat:number,nextBeat:number,beatsPerBar=4):boolean {
 const size=Math.max(1,Math.min(16,Math.round(beatsPerBar)||4));
 return Math.floor(nextBeat/size)>Math.floor(previousBeat/size) || (previousBeat===0&&nextBeat===0);
}
