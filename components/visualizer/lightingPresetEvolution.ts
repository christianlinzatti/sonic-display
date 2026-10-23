/** V177: transparent, deterministic proposals. Nothing is saved until confirmed. */
import type { LightingPreset } from "./predictiveLighting";
import { sanitizeLightingPreset } from "./predictiveLighting";
import { normalizeLightingGenre, sanitizeLightingLearning, type LightingLearningState } from "./lightingLearningEngine";
import { summarizeLightingLearning } from "./lightingLearningDashboard";
export type PresetEvolution = { before:LightingPreset; after:LightingPreset; genre:string; sampleCount:number; reason:string[]; deltas:{anticipation:number;kickRollStrength:number;blackoutStrength:number} };
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const round=(n:number)=>Math.round(n*100)/100;
/** Requires >=6 explicit accept/reject votes for chosen genre; 0 edits alone never create a recommendation. */
export function evolveLightingPreset(base:LightingPreset, input:LightingLearningState, genre:string):PresetEvolution|null {
 const before=sanitizeLightingPreset(base), state=sanitizeLightingLearning(input), target=normalizeLightingGenre(genre);
 const summary=summarizeLightingLearning(state).find(g=>g.genre===target);
 if(!summary?.sampleSufficient) return null;
 const rate=(kind:string)=>{const k=summary.kinds.find(k=>k.kind===kind);return k?.approvalRate===null||k?.approvalRate===undefined?0:k.accepted+k.rejected<3?0:k.approvalRate-.5};
 const drop=rate("drop"), build=rate("build"), roll=rate("strobe"), black=rate("blackout");
 const deltas={anticipation:round(Math.max(-.12,Math.min(.12,(drop*.7+build*.3)*.22))),kickRollStrength:round(Math.max(-.12,Math.min(.12,(roll*.55+drop*.45)*.23))),blackoutStrength:round(Math.max(-.12,Math.min(.12,black*.23)))};
 const after=sanitizeLightingPreset({...before,id:`evolved-${target}`,name:`${before.name} · ${target}`.slice(0,48),anticipation:round(clamp(before.anticipation+deltas.anticipation)),kickRollStrength:round(clamp(before.kickRollStrength+deltas.kickRollStrength)),blackoutStrength:round(clamp(before.blackoutStrength+deltas.blackoutStrength))});
 const reason=[`${summary.accepted} angenommen, ${summary.rejected} abgelehnt (${target})`,"Nur Cue-Arten mit mindestens drei Entscheidungen wirken sich aus.","Jeder Regler ändert sich um höchstens 12 Prozentpunkte."];
 return {before,after,genre:target,sampleCount:summary.accepted+summary.rejected,reason,deltas};
}
/** Undo only affects the current editor draft, not previously saved settings. */
export function undoPresetEvolution(snapshot:LightingPreset):LightingPreset {return sanitizeLightingPreset(snapshot);}
