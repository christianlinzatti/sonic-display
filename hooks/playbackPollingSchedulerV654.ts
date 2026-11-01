/** Exactly one scheduled Spotify poll and one active poll cycle per mounted hook.
 * The clock is injectable so tab visibility, pending requests, and cleanup can be tested.
 */
export function createSingleFlightPollingV654({run,delayMs,clock}: {
  run:()=>Promise<unknown>;
  delayMs:()=>number;
  clock:{setTimeout:(callback:()=>void,delay:number)=>number;clearTimeout:(id:number)=>void};
}) {
  let active=false;
  let inFlight=false;
  let timer:number|undefined;
  let epoch=0;
  const cancelTimer=()=>{if(timer!==undefined){clock.clearTimeout(timer);timer=undefined;}};
  const tick=()=>{
    if(!active||inFlight)return;
    cancelTimer();
    inFlight=true;
    const currentEpoch=epoch;
    const finish=()=>{
      if(currentEpoch!==epoch)return; // Unmounted / stopped poll must not re-arm a timer.
      inFlight=false;
      if(active)timer=clock.setTimeout(tick,Math.max(0,delayMs()));
    };
    void Promise.resolve().then(run).then(finish,finish);
  };
  return {
    start(){if(active)return;active=true;epoch++;tick();},
    wake(){if(!active)return;cancelTimer();if(!inFlight)tick();},
    stop(){active=false;epoch++;cancelTimer();inFlight=false;},
  };
}
