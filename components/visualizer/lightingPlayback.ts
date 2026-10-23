/** Lightweight shared playback snapshot: updated from Spotify state, consumed by the R3F frame. */
export type LightingPlayback = { trackId: string; durationMs: number; positionMs: number; playing: boolean };
const playback: LightingPlayback = {trackId:"",durationMs:0,positionMs:0,playing:false};
export function setLightingPlayback(trackId:string,durationMs:number,positionMs:number,playing:boolean):void {
  playback.trackId=trackId;playback.durationMs=durationMs;playback.positionMs=positionMs;playback.playing=playing;
}
export function getLightingPlayback():LightingPlayback {return playback;}
