/** V132: conservative auto-tuning from measured local joint errors. No React updates per frame. */
export type LodAutoTuneState={strength:number; smoothedError:number; frames:number};
export function createLodAutoTuneState():LodAutoTuneState{return {strength:0.25,smoothedError:0,frames:0};}
export function updateLodAutoTune(state:LodAutoTuneState, errors:readonly number[], delta:number):LodAutoTuneState {
  const safe=errors.filter(x=>Number.isFinite(x)&&x>=0&&x<=30);
  if(!safe.length) return createLodAutoTuneState();
  const mean=safe.reduce((a,b)=>a+b,0)/safe.length;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(delta,0.1)):0;
  const alpha=1-Math.exp(-dt*3);
  const smoothed=state.frames===0?mean:state.smoothedError+(mean-state.smoothedError)*alpha;
  // stronger correction for moderate errors; never exceed the original 5° frame cap.
  const target=smoothed<1?0.12:smoothed>15?0.38:0.12+((smoothed-1)/14)*0.26;
  const strength=state.strength+(target-state.strength)*alpha;
  return {strength:Math.max(0.10,Math.min(0.4,strength)),smoothedError:smoothed,frames:state.frames+1};
}
