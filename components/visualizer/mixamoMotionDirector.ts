/** Mixamo motion hints and bounded musical timing.
 * All helpers are deterministic; no network, timers, scene traversal or per-frame allocations.
 * These hints never bypass rig/BPM/genre eligibility or a manual clip choice.
 */
export type MixamoGenreFamily = "rap" | "hardtekk" | "hardstyle" | "rock" | "pop" | "general";
export type MixamoSection = "quiet" | "verse" | "hook" | "drop";

export const isMixamoMotion = (name:string):boolean => /mixamo/i.test(name);

function words(name:string):string {
  return name.replace(/([a-z])([A-Z])/g,"$1 $2").toLowerCase().replace(/[^a-z0-9]+/g," ");
}
function has(name:string,pattern:RegExp):boolean {return pattern.test(name);}

/** Small tie-break over existing V536 category/section ranking; never rejects unrelated clips. */
export function mixamoGenreBias(name:string,family:MixamoGenreFamily,section:MixamoSection,energy:number):number {
  if(!isMixamoMotion(name) || !Number.isFinite(energy))return 0;
  const s=words(name);
  const quiet=section==="quiet",high=energy>=.7;
  const rap=has(s,/\b(hip hop|hiphop|rap|swagger|groove|bounce|two step|twostep|head nod|headnod|breakdance)\b/);
  const hardtekk=has(s,/\b(hakken|hakkuh|tekk|footwork|stomp|kick|rave|gabber|bounce)\b/);
  const hardstyle=has(s,/\b(jumpstyle|hardstyle|jump|power|stomp|kick|rawstyle)\b/);
  const calm=has(s,/\b(idle|breathing|slow|sway|rest|relax)\b/);
  if(quiet)return calm?1.1:(hardtekk||hardstyle?-1.5:0);
  if(family==="rap")return rap?(section==="verse"?2.2:1.6):hardstyle||hardtekk?-.8:0;
  if(family==="hardtekk")return hardtekk?(section==="drop"&&high?2.6:1.9):rap?-.4:0;
  if(family==="hardstyle")return hardstyle?(section==="drop"&&high?2.6:1.8):rap?-.4:0;
  return 0;
}

/** Synchronize a loop length to an integer number of beats only if the
 * correction is almost imperceptible; unknown source BPM cannot be inferred.
 * Mixing and manual playback own their own speeds.
 */
export function mixamoBeatAlignedSpeed(
  name:string, clipSeconds:number, bpm:number|null|undefined, baseSpeed:number,
):number {
  if(!isMixamoMotion(name)||!Number.isFinite(clipSeconds)||clipSeconds<=0||
    !Number.isFinite(bpm)||bpm!<60||bpm!>230||
    !Number.isFinite(baseSpeed)||Math.abs(baseSpeed-1)>.001)return baseSpeed;
  let best=1, deviation=Infinity;
  for(const beats of [2,4,8,16]){
    const speed=clipSeconds*bpm!/(beats*60);
    const diff=Math.abs(1-speed);
    // No extreme time-stretch for moves with unrecognized cycle lengths.
    if(speed>=.88&&speed<=1.12&&diff<deviation){best=speed;deviation=diff;}
  }
  return deviation===Infinity?baseSpeed:Math.round(best*1000)/1000;
}

/** Lower bound for existing pose-matched, foot-contact-protected crossfades. */
export function mixamoMinimumFade(name:string,section:MixamoSection):number {
  if(!isMixamoMotion(name))return 0;
  return section==="quiet"?.72:section==="drop"?.42:.58;
}
