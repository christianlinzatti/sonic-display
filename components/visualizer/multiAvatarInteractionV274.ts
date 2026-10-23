import type { AudioFeatures } from "../../types/audio";
import { danceGenre } from "./advancedMusicDanceIntelligenceV273";
import type { DuoRole, MultiAvatarCue, MultiAvatarSettings } from "./multiAvatarChoreography";

/** V274: shared, deterministic scene director; uses audio heuristics, not song-stem labels.
 * Preserves existing V206 cue semantics, skinned meshes and manually configured motions. */
export type InteractionSection = "verse" | "hook" | "build" | "drop" | "break";
export type InteractionState = { elapsed: number; section: InteractionSection; candidate: InteractionSection | null; candidateSince: number; changedAt: number; lastPhrase: number; };
export const initialInteractionState = (): InteractionState => ({elapsed:0,section:"verse",candidate:null,candidateSince:0,changedAt:0,lastPhrase:-1});
const bound = (v: unknown, fallback=0) => typeof v === "number" && Number.isFinite(v) ? Math.min(1,Math.max(0,v)) : fallback;
const finite = (v: unknown, fallback:number) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
export function interactionSection(audio: AudioFeatures, genre: string | null | undefined): InteractionSection {
  const energy=bound(audio.energyEnvelope), kick=bound(audio.kickAccentIntensity), bass=bound(audio.bass), phrase=bound(audio.rhythmPhraseAccent);
  const hard=danceGenre(genre)!=="deutschrap";
  if(energy < .14 && bass < .20) return "break";
  if(energy > (hard ? .64 : .75) && kick > (hard ? .57 : .70)) return "drop";
  if(energy > .43 && (phrase > .48 || (hard ? kick > .38 : bound(audio.mids) > .43))) return "hook";
  if(energy > .38 && kick < .34 && phrase > .30) return "build";
  return "verse";
}
export function advanceInteraction(state: InteractionState, audio: AudioFeatures, delta: number, genre: string | null | undefined, playing: boolean, reducedMotion: boolean, base: MultiAvatarCue, settings: MultiAvatarSettings): MultiAvatarCue {
  if(!settings.enabled || !settings.smartInteraction || !playing || reducedMotion) return base;
  state.elapsed += Math.max(0,Math.min(.15,finite(delta,0)));
  const desired=interactionSection(audio,genre);
  if(desired===state.section){state.candidate=null;}
  else {
    if(state.candidate!==desired){state.candidate=desired;state.candidateSince=state.elapsed;}
    const rapid=desired==="drop" && danceGenre(genre)!=="deutschrap";
    const stable=rapid ? .36 : .85;
    const hold=rapid ? 1.4 : 2.4;
    if(state.elapsed-state.candidateSince>=stable && state.elapsed-state.changedAt>=hold){state.section=desired;state.changedAt=state.elapsed;state.candidate=null;}
  }
  const section=state.section;
  const rap=danceGenre(genre)==="deutschrap";
  // Solo alternation is phrase-bound; signal spikes cannot flip the lead each frame.
  const role: DuoRole = section==="drop" || section==="hook" ? "together" : section==="break" ? "lead-solo" :
    section==="build" ? "partner-solo" : rap ? (base.phrase%2 ? "partner-solo":"lead-solo") : base.role;
  const quiet=1-.85*settings.soloEmphasis;
  const together=role==="together";
  return {...base,scene:together ? "sync":"duet",role,
    leadGain:role==="partner-solo"?quiet:1,
    partnerGain:role==="lead-solo"?quiet:1,
    formation: section==="drop" ? "wide" : section==="hook" ? "line" : section==="build" ? "diagonal" : base.formation,
    partnerDelayBeats:together?0:section==="build"?.5:base.partnerDelayBeats,
    dropAccent:section==="drop"};
}
