/** V530: dependency-free director for clips EMBEDDED in the character GLB.
 * Only names of clips on that character are candidates. It never infers who sings,
 * modifies the GLB, creates AnimationMixers or controls any facial / IK channel.
 */
export type EmbeddedClipV530 = { name: string; duration: number; trackCount: number };
export type EmbeddedMotionInputV530 = {
  clips: readonly EmbeddedClipV530[];
  modelKey: string; trackId: string | null | undefined;
  progressMs: number | null | undefined;
  section: string | null | undefined;
  genre: string | null | undefined;
  energy: number | null | undefined;
  bpm: number | null | undefined;
  slot: number;
  playing: boolean; reducedMotion: boolean; manualPriority: boolean;
};
export type EmbeddedMotionStateV530 = {
  modelKey: string; trackId: string; selectedName: string | null;
  lastPositionMs: number; lastSwitchMs: number; lastPhrase: string;
};
export const newEmbeddedMotionStateV530 = (): EmbeddedMotionStateV530 => ({
  modelKey: '', trackId: '', selectedName: null, lastPositionMs: 0,
  lastSwitchMs: -Infinity, lastPhrase: '',
});
const finite = (n: number | null | undefined, fallback: number, min: number, max: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
const hash = (value: string) => {
  let h = 2166136261;
  for (let i=0; i<value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
};
const musicalPart = (section?: string | null): 'quiet'|'verse'|'hook'|'drop' => {
  const s = (section ?? '').toLowerCase();
  if (/intro|outro|break|ambient|quiet|pause/.test(s)) return 'quiet';
  if (/drop|climax|peak/.test(s)) return 'drop';
  if (/hook|chorus|refrain/.test(s)) return 'hook';
  return 'verse';
};
const family = (genre?: string | null): 'rap'|'hard'|'general' => {
  const s=(genre ?? '').toLowerCase();
  if (/deutschrap|hip.?hop|trap|drill|boom.?bap|rap|rnb/.test(s)) return 'rap';
  if (/hardstyle|hardtekk|hardcore|gabber|techno|rave|rawstyle/.test(s)) return 'hard';
  return 'general';
};
const validClip = (c: EmbeddedClipV530): boolean => !!c && typeof c.name==='string' &&
  !!c.name.trim() && !/^(imported:|library:|glbpresetv492:)/i.test(c.name) &&
  Number.isFinite(c.duration) && c.duration >= 0.35 && c.duration <= 180 &&
  Number.isFinite(c.trackCount) && c.trackCount > 0;

/** Deterministic weight: embedded names are *hints* about motion, not semantic guarantees.
 * No external model, waveform or singer identity is guessed here. */
export function rankEmbeddedClipsV530(input: EmbeddedMotionInputV530, phrase: string): string[] {
  const section=musicalPart(input.section), genre=family(input.genre);
  const energy=finite(input.energy,.5,0,1);
  const slot=Math.trunc(finite(input.slot,0,0,15));
  const seen=new Set<string>();
  return input.clips.filter(c=>validClip(c) && !seen.has(c.name) && !!seen.add(c.name))
    .map(clip=>{
      const n=clip.name.toLowerCase().replace(/[\s_-]+/g,'');
      const idle=/idle|rest|stand|breath/.test(n);
      const greeting=/greeting|wavehello|salute/.test(n);
      const dance=/dance|groove|bounce|step|sway|roll|tap/.test(n);
      const rap=/rap|twostep|fingerflow|headnod|shoulderroll/.test(n);
      const hard=/club|bounce|armsup|armwave|hard|stomp|jump/.test(n);
      const expressive=/gesture|finger|headnod|shoulder/.test(n);
      // All valid clips remain options if the imported rig has unfamiliar names.
      // Never make an idle/greeting clip the default at a full-energy hook/drop.
      let score = .4;
      if (section==='quiet') score += idle?4.5:dance?1.2:0;
      else if (section==='verse') score += dance?2.6:0;
      else score += dance?3.1:0;
      if (section==='verse' && genre==='rap') score += rap?2.5:0;
      if (section==='hook' && genre==='rap') score += /raptwostep|clubgroove|dancegroove|sidestep/.test(n)?2.0:expressive?.9:0;
      if (section==='drop' && genre==='hard') score += hard?2.8:0;
      if (section==='hook' && genre==='hard') score += hard?1.8:0;
      if (section==='verse' && genre==='hard') score += /groove|step|bounce/.test(n)?1.3:0;
      if (section!=='quiet' && idle) score -= 4;
      if (section!=='quiet' && greeting) score -= 3;
      if (section==='quiet' && /armsup|jump|stomp/.test(n)) score -= 1.8;
      if (energy<.32 && /armsup|jump|stomp/.test(n)) score -= 2;
      if (energy>.72 && section!=='quiet' && hard) score += .7;
      // A small per-artist/per-phrase seeded variation, not per-frame randomness.
      score += (hash(`${input.trackId}:${input.modelKey}:${phrase}:${slot}:${clip.name}`)%1009)/1009*1.15;
      return {name:clip.name,score};
    }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name)).map(x=>x.name);
}

/** At most one selection per 4 bars and >=8s between switches; seeks reset.
 * Section transitions are musical *suggestions*, not hard camera/animation cuts. */
export function stepEmbeddedMotionV530(previous: EmbeddedMotionStateV530, input: EmbeddedMotionInputV530): EmbeddedMotionStateV530 {
  const trackId = input.trackId || '';
  const position = finite(input.progressMs, 0, 0, 1_000_000_000);
  const reset = trackId!==previous.trackId || input.modelKey!==previous.modelKey ||
    position < previous.lastPositionMs - 1_500 || position > previous.lastPositionMs + 60_000;
  const initial=reset?newEmbeddedMotionStateV530():previous;
  const blank:EmbeddedMotionStateV530={...initial,modelKey:input.modelKey,trackId,lastPositionMs:position,selectedName:null,lastPhrase:''};
  if (!trackId || !input.modelKey || !input.playing || input.reducedMotion || input.manualPriority) return blank;
  const bars4Ms=4*4*60_000/finite(input.bpm,120,55,210);
  const phrase=`${musicalPart(input.section)}:${Math.floor(position/bars4Ms)}`;
  const ranked=rankEmbeddedClipsV530(input,phrase);
  if (!ranked.length) return blank;
  const heldValid=ranked.includes(initial.selectedName??'');
  if (!initial.selectedName || !heldValid)
    return {...blank,selectedName:ranked[0],lastSwitchMs:position,lastPhrase:phrase};
  const phraseChanged=phrase!==initial.lastPhrase;
  if (!phraseChanged || position-initial.lastSwitchMs<8_000)
    return {...blank,selectedName:initial.selectedName,lastSwitchMs:initial.lastSwitchMs,lastPhrase:phrase};
  // Allow variation among the strongest compatible clips only. Never swap to
  // an arbitrary low-score fallback just to force a new animation.
  const chosen=ranked[0]===initial.selectedName && ranked.length>1 &&
    hash(`${trackId}:${phrase}:${input.slot}:vary`)%3===0 ? ranked[1] : ranked[0];
  return {...blank,selectedName:chosen,lastSwitchMs:chosen===initial.selectedName?initial.lastSwitchMs:position,lastPhrase:phrase};
}
