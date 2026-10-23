import type { LyricsStudioSectionV379 } from "./visualLyricsStudioV379";

export type StudioShotV380 = "none"|"balanced"|"face"|"lead"|"duet"|"group"|"lyrics";
export type StudioCameraModeV380 = "directed"|"orbit";
export type StudioCastV380 = 1|2|4;
export type Vec3V380 = [number,number,number];
export interface StudioCameraV380 { position:Vec3V380; target:Vec3V380; fov:number; label:string; }
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
export const STUDIO_CAST_POSITIONS_V380:Readonly<Record<StudioCastV380,readonly number[]>>={1:[0],2:[-1.0,1.0],4:[-1.52,-.5,.5,1.52]};
/** The camera in the preview is planned in the same 3D coordinate space as its cloned models. */
export function planStudioCameraV380(input:{shot:StudioShotV380;section:LyricsStudioSectionV379;cast:StudioCastV380;leadIndex:number;side:"left"|"right";immersive:boolean;strength:number}):StudioCameraV380 {
  const count=STUDIO_CAST_POSITIONS_V380[input.cast].length;
  const lead=STUDIO_CAST_POSITIONS_V380[input.cast][Math.floor(clamp(input.leadIndex,0,count-1))]??0;
  const weight=clamp(input.strength/100,0,1);
  const textBias=input.immersive?(input.side==="right"?-.32:.32)*weight:0;
  const base:StudioCameraV380={position:[textBias,1.26,5.9],target:[textBias*.5,.28,0],fov:43,label:"Bühnenübersicht"};
  if (input.shot==="none"||input.shot==="balanced") return base;
  if (input.shot==="group"||input.section==="drop") return {...base,position:[textBias,1.46,6.8],fov:48,label:"Gruppenaufnahme"};
  if (input.shot==="duet"&&count>1) return {...base,position:[textBias,1.23,5.1],fov:46,label:"Duett · beide Tänzer"};
  if (input.shot==="lyrics"&&input.immersive) return {...base,position:[textBias+(input.side==="left"?-.3:.3),1.42,5.15],target:[input.side==="left"?-.7:.7,.36,-.3],fov:43,label:"Lyrics-Fokus"};
  if (input.shot==="lead"||input.shot==="face") return {...base,position:[lead*.68+textBias,1.29,3.6],target:[lead,.53,0],fov:42,label:"Lead-Nahaufnahme"};
  return base;
}
/** Normalize timeline position independently of the Spotify player. */
export function previewClipTimeV380(positionMs:number,durationSeconds:number,speed:number):number {
  if (!Number.isFinite(durationSeconds)||durationSeconds<=0)return 0;
  const t=Math.max(0,Number.isFinite(positionMs)?positionMs:0)/1000*Math.max(.1,Number.isFinite(speed)?speed:1);
  return t%durationSeconds;
}
/** Per-word color is only real word timing when the provider supplies it; no invented phonemes. */
export function activeStudioWordV380(words:readonly {startMs:number;endMs?:number}[]|undefined,timeMs:number):number {
  if (!words?.length||!Number.isFinite(timeMs))return -1;
  let active=-1;
  for (let i=0;i<words.length;i++) {
    const w=words[i];if (!Number.isFinite(w.startMs))continue;
    if (timeMs>=w.startMs && (w.endMs===undefined||timeMs<w.endMs))active=i;
  }
  return active;
}
