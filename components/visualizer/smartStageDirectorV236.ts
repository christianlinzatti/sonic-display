import type { AudioFeatures } from "@/types/audio";
export type StageMood = "rest" | "groove" | "build" | "drop";
export type StageDirectorState = { energy: number; mood: StageMood; hold: number; camera: number; sweep: number };
export const createStageDirectorState = (): StageDirectorState => ({energy:0,mood:"rest",hold:0,camera:0,sweep:0});
const clamp = (n:number) => Number.isFinite(n) ? Math.min(1,Math.max(0,n)) : 0;
/** Bounded energy/beat cues; the sections are estimates, never metadata or actual section labels. */
export function advanceStageDirector(s:StageDirectorState,a:AudioFeatures,dt:number,genre:string|null|undefined,playing:boolean,reducedMotion:boolean) {
 const step=Math.min(.1,Math.max(0,Number.isFinite(dt)?dt:0));
 const energy=playing?clamp(a.energyEnvelope*.65+a.bass*.25+a.volume*.1):0;
 s.energy+=(energy-s.energy)*(1-Math.exp(-step*3));
 const kick=playing?clamp(Math.max(a.kickAccentIntensity??0,a.beat?a.beatStrength:0)):0;
 const proposed:StageMood=!playing||s.energy<.12?"rest":s.energy>.64&&kick>.44?"drop":s.energy>.40?"build":"groove";
 if(proposed!==s.mood){s.hold+=step;if(s.hold>.28){s.mood=proposed;s.hold=0;}}else s.hold=0;
 const hard=/hardstyle|hardtekk|hardcore|tekk/i.test(genre??"");
 const cameraTarget=!playing||reducedMotion?0:s.mood==="drop"? .62 + kick*.38:s.mood==="build"?.48:s.mood==="groove"?(hard?.28:.14):0;
 const sweepTarget=!playing||reducedMotion?0:s.mood==="drop"? .7:s.mood==="build"?.45:.10;
 const alpha=1-Math.exp(-step*2.3);
 s.camera+=(cameraTarget-s.camera)*alpha;
 s.sweep+=(sweepTarget-s.sweep)*alpha;
 return {mood:s.mood,camera:clamp(s.camera),sweep:clamp(s.sweep),kick};
}
