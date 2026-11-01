/** V780 immutable visual review scenario plan. This is a capture protocol, not an FPS benchmark. */
export type VisualProfileV780='cinematic'|'balanced'|'economy';
export type VisualStageV780='cyberpunk'|'rock'|'galaxy';
export type VisualScenarioV780={profile:VisualProfileV780;stage:VisualStageV780;avatars:2|4;frame:number;filename:string};
export const VISUAL_PROFILES_V780=['cinematic','balanced','economy'] as const;
export const VISUAL_STAGES_V780=['cyberpunk','rock','galaxy'] as const;
export const VISUAL_FRAMES_V780=[96,208] as const;
export function normalizeVisualFramesV780(frames:readonly number[]):number[]{
 if(!Array.isArray(frames)||frames.length<1||frames.length>3||frames.some(x=>!Number.isInteger(x)||x<30||x>1800)||new Set(frames).size!==frames.length)
  throw new Error('V780: 1–3 verschiedene Frames zwischen 30 und 1800');
 return [...frames];
}
export function visualPlanV780(frames:readonly number[]=VISUAL_FRAMES_V780):VisualScenarioV780[]{
 const checkpoints=normalizeVisualFramesV780(frames);
 return VISUAL_PROFILES_V780.flatMap(profile=>VISUAL_STAGES_V780.flatMap(stage=>
  ([2,4] as const).flatMap(avatars=>checkpoints.map(frame=>({
   profile,stage,avatars,frame,filename:`${stage}-${avatars}glb-f${frame}-${profile}.png`,
  })))));
}
