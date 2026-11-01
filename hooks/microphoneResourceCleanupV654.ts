/** Actual device teardown, used both for failures and React cleanup.
 * A rejected AudioContext.close() must never produce an unhandled rejection.
 */
export function releaseMicrophoneResourcesV654(resources:{
  frame:number;
  cancelFrame:(id:number)=>void;
  stream?:{getTracks():ArrayLike<{stop():void}>};
  context?:{state:string;close():Promise<unknown>};
  worker?:{terminate():void}|null;
}):void {
  resources.cancelFrame(resources.frame);
  resources.worker?.terminate();
  if(resources.stream)Array.from(resources.stream.getTracks()).forEach(track=>track.stop());
  if(resources.context && resources.context.state!=="closed")
    void resources.context.close().catch(()=>{});
}
