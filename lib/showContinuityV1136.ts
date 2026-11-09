export type ShowClockV1136={source:string;positionMs:number};
/** A discontinuity resets held presentation; ordinary polling jitter keeps the current shot. */
export function showJumpV1136(previous:ShowClockV1136|null,next:ShowClockV1136,elapsedMs=0):boolean{
 if(!Number.isFinite(next.positionMs)||next.positionMs<0)return false;
 if(!previous||!Number.isFinite(previous.positionMs))return true;
 const elapsed=Number.isFinite(elapsedMs)?Math.max(0,elapsedMs):0;
 return previous.source!==next.source||next.positionMs<previous.positionMs-500||next.positionMs-previous.positionMs-elapsed>1500;
}
export function previewSampleV1136(previous:ShowClockV1136|null,next:ShowClockV1136,playing:boolean){
 const valid=Number.isFinite(next.positionMs)&&next.positionMs>=0;
 const jump=valid&&showJumpV1136(previous,next);
 const scrub=valid&&!playing&&(!previous||next.positionMs!==previous.positionMs||next.source!==previous.source);
 return {sample:valid&&(playing||jump||scrub),cut:jump||scrub};
}
/** Let a newly acquired reading shot settle promptly, then hold it. Manual paths keep their rate. */
export function readingCameraBlendV1136(alpha:number,delta:number,reading:boolean):number{
 const safe=Number.isFinite(alpha)?Math.max(0,Math.min(1,alpha)):0;
 if(!reading)return safe;
 const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
 return Math.max(safe,1-Math.exp(-6*dt));
}
export type PlaybackSampleV1136={positionMs:number;fetchedAt:number;playing:boolean};
export function validPlaybackSampleV1136(value:PlaybackSampleV1136|undefined|null):value is PlaybackSampleV1136{
 return !!value&&Number.isFinite(value.positionMs)&&value.positionMs>=0&&Number.isFinite(value.fetchedAt)&&value.fetchedAt>0;
}
/** Provider samples distinguish real seeks from late UI renders; old responses never rewind a shot. */
export function sampledJumpV1136(previous:PlaybackSampleV1136|null|undefined,next:PlaybackSampleV1136):boolean{
 if(!validPlaybackSampleV1136(previous)||!validPlaybackSampleV1136(next)||next.fetchedAt<previous.fetchedAt||previous.playing!==next.playing)return false;
 const expected=previous.playing?next.fetchedAt-previous.fetchedAt:0;
 const correction=next.positionMs-previous.positionMs-expected;
 return correction>1500||correction< -500;
}
