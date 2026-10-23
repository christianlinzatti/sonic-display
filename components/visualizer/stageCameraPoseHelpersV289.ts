import type { StageSection } from "./stageDirectorV287";
/** V304 adds optional world-space horizontal look-at axes; old saved V290 poses remain valid. */
export type CameraPose = { x: number; y: number; z: number; targetY: number; fov: number; targetX?: number; targetZ?: number };
/** Pure cue planner. Uses playback time, not wall-clock time, so pause and seek are deterministic. */
export function stageCameraPoseV289(section: StageSection, progressMs: number, intensity: number, duo: boolean): CameraPose {
  const scale = Math.max(0, Math.min(1, Number.isFinite(intensity) ? intensity / 100 : 0));
  const seconds = Math.max(0, Number.isFinite(progressMs) ? progressMs / 1000 : 0);
  const orbit = Math.sin(seconds * .32) * scale;
  const z = duo ? 5.9 : 4.2;
  const sectionCue: Record<StageSection, [number,number,number,number]> = {
    verse: [0,0,0,0], break: [0,.25,1.05,-2], build: [.2,.18,-.4,-1], hook: [-.35,.08,-.5,-2], drop: [.48,-.08,-.85,-3]
  };
  const [x,y,distance,fov]= sectionCue[section] ?? sectionCue.verse;
  return {x: (x + orbit * .18)*scale, y: .1 + y*scale, z: z + distance*scale, targetY: Math.max(-.1,.1+y*scale*.5), fov: 38 + fov*scale};
}
