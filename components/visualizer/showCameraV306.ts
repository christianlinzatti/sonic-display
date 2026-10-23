import type { CameraPose } from "./stageCameraPoseHelpersV289";
import type { ShowCue } from "./ultimateShowDirectorV306";
/** Add restrained show cinematography only to the automatic camera, never a saved user camera path. */
export function showCameraPose(base: CameraPose, cue: ShowCue, progressMs: number, duo: boolean): CameraPose {
  if (!cue.cameraEnabled) return base;
  const elapsed = Math.max(0, (Number.isFinite(progressMs) ? progressMs - cue.sectionStartMs : 0) / 1000);
  const direction = base.z >= 0 ? 1 : -1;
  const strength=Math.max(0,Math.min(1,cue.cameraGain));
  const wide=(duo ? 1.05 : .65)*strength;
  switch(cue.cameraShot) {
    case "wide": return {...base, z:base.z+direction*wide, y:base.y+.08*strength, fov:Math.min(65,base.fov+3*strength), x:base.x+Math.sin(elapsed*.42)*.35*strength};
    case "groove": return {...base, x:base.x+Math.sin(elapsed*.26)*.18*strength, y:base.y+.04*strength};
    case "rise": return {...base, y:base.y+Math.min(.48,elapsed*.045)*strength, z:base.z+direction*.4*strength};
    case "hero": return {...base, x:base.x+Math.sin(elapsed*.3)*.25*strength, z:base.z+direction*.15*strength, y:base.y+.10*strength};
    case "intimate": return {...base, z:base.z-direction*(duo ? .30 : .42)*strength, fov:Math.max(26,base.fov-2*strength), y:base.y+.10*strength};
  }
}
