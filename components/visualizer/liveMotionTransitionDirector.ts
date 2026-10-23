/** V193: bounded live transition policy. BPM is an approximate grid; detected kicks take precedence. */
export function resolveLiveTransitionDuration(saved:number, fallback:number, libraryChange:boolean):number {
  return libraryChange && Number.isFinite(saved) ? Math.max(0.1,Math.min(4,saved)) : fallback;
}
export function shouldSwitchLiveMotion(p:{now:number;lastSwitch:number;isStopping:boolean;beatSync:boolean;bpm?:number|null;beatsPerBar:number;beatOffset:number;kickAt:number}):boolean {
  if(p.isStopping)return true;
  if(p.now-p.lastSwitch<2)return false;
  if(!p.beatSync)return true;
  // Only accept a fresh onset, never a stale held kick value.
  if(p.now-p.kickAt>=0 && p.now-p.kickAt<0.12)return true;
  const bpm=Number(p.bpm);
  if(!Number.isFinite(bpm)||bpm<50||bpm>240)return true;
  const bar=(60/bpm)*Math.max(1,Math.min(16,p.beatsPerBar));
  const phase=((p.now-p.beatOffset*bar)%bar+bar)%bar;
  return phase<0.065 || bar-phase<0.065;
}
