/** Section-aware Mixamo show cues for the existing genre motion director.
 * Pure scoring hints: no new animation mixer, timers, generated keyframes or
 * assumptions about the identity of a singer. Every candidate still passes
 * the existing loaded-clip, genre/BPM and authored-section checks first.
 */
import {isMixamoMotion,type MixamoGenreFamily,type MixamoSection} from "./mixamoMotionDirector";

export type MixamoShowPhase = MixamoSection | "build";
export type MixamoShowRole = "solo" | "lead" | "support" | "unison";
export type MixamoShowCue = {
  phase: MixamoShowPhase;
  role: MixamoShowRole;
  // This describes shared phrase/energy intent; actual poses remain rig-specific.
  commonPhrase: boolean;
};

export function mixamoShowPhase(section:string|null|undefined):MixamoShowPhase {
  const raw=(section??"").toLowerCase();
  if(/intro|outro|break|bridge|ambient|quiet|interlude|pause/.test(raw))return "quiet";
  if(/build|pre.?drop|rise/.test(raw))return "build";
  if(/drop|climax|peak/.test(raw))return "drop";
  if(/hook|chorus|refrain/.test(raw))return "hook";
  return "verse";
}

/** Separate, complementary verses; shared section intent on hook/drop.
 * A common phrase is not a guarantee of the exact same clip across
 * different avatar rigs or missing personal libraries.
 */
export function mixamoShowCue(section:string|null|undefined,slot:number,count:number):MixamoShowCue {
  const phase=mixamoShowPhase(section);
  const ensemble=Number.isFinite(count)&&count>=2;
  const commonPhrase=ensemble&&(phase==="hook"||phase==="drop");
  const role:MixamoShowRole=!ensemble?"solo":commonPhrase?"unison":
    Number.isFinite(slot)&&slot>0?"support":"lead";
  return {phase,role,commonPhrase};
}

function normalizedWords(name:string):string {
  return name.replace(/([a-z])([A-Z])/g,"$1 $2")
    .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
const match=(name:string,pattern:RegExp)=>pattern.test(name);

/** Soft preference [-1.2, 1.2] over compatible Mixamo clips.
 * - Verse: lead performance vs supporting groove;
 * - Hook: steady group grooves;
 * - Build: preparatory footwork, not premature jump attacks;
 * - Drop: energetic genre-matched accents;
 * - Break: calm movement.
 */
export function mixamoShowCueBias(input:{
  name:string;family:MixamoGenreFamily;section:string|null|undefined;
  energy:number|null|undefined;slot:number;ensembleCount:number;
}):number{
  if(!isMixamoMotion(input.name)||!["rap","hardtekk","hardstyle"].includes(input.family))return 0;
  const cue=mixamoShowCue(input.section,input.slot,input.ensembleCount);
  const s=normalizedWords(input.name);
  const calm=match(s,/\b(idle|relax|breathing|rest|slow|chill|sway)\b/);
  const performance=match(s,/\b(rap|freestyle|swagger|emcee|mc|nod|head nod|point|gesture|popping)\b/);
  const expressive=match(s,/\b(freestyle|swagger|emcee|mc|nod|head nod|point|gesture|popping)\b/);
  const groove=match(s,/\b(groove|bounce|dance|step|two step|twostep|shuffle|sway|flow|sidestep)\b/);
  const footwork=match(s,/\b(hakken|hakkuh|gabber|footwork|tekk|rave|shuffle)\b/);
  const power=match(s,/\b(jump|jumpstyle|stomp|power|kick|hardstyle|rawstyle|hardtekk)\b/);
  const high=typeof input.energy==="number"&&Number.isFinite(input.energy)&&input.energy>=.7;
  let bias=0;
  if(cue.phase==="quiet"){
    bias=calm?1.1:footwork||power?-.9:0;
  }else if(cue.phase==="build"){
    bias=groove||footwork?.7:power?-.65:calm?-.3:0;
  }else if(cue.phase==="verse"){
    if(input.family==="rap")bias=cue.role==="support"?
      groove?1.05:performance?.4:power?-.65:0:
      expressive?1.1:groove?.7:performance?.45:power?-.65:0;
    else bias=cue.role==="support"?
      groove?.9:footwork?.65:power?-.15:0:
      footwork?.95:groove?.55:power?.2:0;
  }else if(cue.phase==="hook"){
    bias=groove?1.05:input.family==="rap"&&performance?.5:power?.55:calm?-.8:0;
  }else if(input.family==="rap"){
    bias=groove&&high?1.0:performance?.7:footwork||power?-.7:calm?-.85:0;
  }else if(input.family==="hardtekk"){
    bias=footwork?1.2:power&&high?.65:calm?-.95:0;
  }else{
    bias=power?1.2:footwork?.45:calm?-.95:0;
  }
  return Math.max(-1.2,Math.min(1.2,bias));
}

/** Use one phrase-selection lane for duplicated dancers with the same model,
 * eligible Mixamo repertoire and show input during hooks/drops. This aligns
 * *which* clip is selected; V327/V328 remain the owners of physical beat
 * accents and clip phase, and distinct rigs remain free to choose alternatives.
 */
export function mixamoEnsembleSelectionSlot(input:{
  slot:number;ensembleCount:number;section:string|null|undefined;hasEligibleMixamo:boolean;
}):number {
  const cue=mixamoShowCue(input.section,input.slot,input.ensembleCount);
  return cue.commonPhrase&&input.hasEligibleMixamo?0:input.slot;
}
