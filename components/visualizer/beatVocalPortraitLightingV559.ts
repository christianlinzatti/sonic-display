import type { AudioFeatures } from '../../types/audio';
import type { ConcertDetailSettingsV555, ConcertDetailsCueV555 } from './concertDetailEffectsV555';
import type { PerformerLightingPlanV557 } from './performerLightingV557';
import type { AvatarPortraitPlanV558 } from './avatarPortraitLightingV558';

export type BeatVocalPortraitPlanV559 = Readonly<{
  enabled: boolean; keyLift: number; fillLift: number;
  keyColorMix: number; fillColorMix: number;
  mode: 'off'|'verse'|'hook'|'dense'|'duet';
}>;
const NEUTRAL: BeatVocalPortraitPlanV559 = Object.freeze({
  enabled:false,keyLift:0,fillLift:0,keyColorMix:0,fillColorMix:0,mode:'off',
});
const clamp01=(n:number):number=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;

/** V559: understated beat envelope + midrange/volume proxy, NEVER singer identification.
 * Only active with V557 validated performer focus and V558 portrait mode. No extra lights,
 * shadows, shader, lyric overlay, or guessed singer/word boundaries.
 * Intensity/color outputs are added to the *existing* R3F key/fill within hard caps.
 */
export function planBeatVocalPortraitLightingV559(input:{
  performer:PerformerLightingPlanV557; portrait:AvatarPortraitPlanV558;
  cue?:ConcertDetailsCueV555|null; audio:AudioFeatures;
  settings?:Partial<ConcertDetailSettingsV555>;
  playing:boolean;reactive:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';authored:boolean;blackout:boolean;
  lyricsProtected?:boolean;
}):BeatVocalPortraitPlanV559 {
  const {settings,performer,portrait,cue,audio,tier}=input;
  if(!settings||settings.enabled===false||settings.avatarLight===false||settings.portraitLight===false||
    settings.beatPortraitLight===false||!portrait.enabled||performer.focusSlot===null||!cue||
    !input.playing||!input.reactive||input.reducedMotion||tier==='low'||input.authored||input.blackout)return NEUTRAL;
  const strength=clamp01((settings.beatPortraitStrength??45)/100)*
    clamp01((settings.avatarLightStrength??55)/100)*clamp01((settings.strength??45)/100);
  if(strength<=0)return NEUTRAL;
  // Midrange + RMS are merely musical activity indicators; instruments contribute too.
  // If audio analysis is unavailable the accent remains absent, never fabricated.
  const beat=clamp01(Math.max(clamp01(audio.beatStrength),clamp01(audio.kickAccentIntensity??0)));
  const voiceProxy=clamp01(.62*clamp01(audio.mids)+.38*clamp01(audio.volume));
  const dynamic=clamp01((beat-.12)*1.05)*.62 + voiceProxy*.38;
  if(dynamic<.025)return NEUTRAL;
  const dense=clamp01(cue.density)>.7;
  const duo=performer.partnerSlot!==null;
  const hook=performer.hook||cue.hook;
  const mode=duo?'duet':dense?'dense':hook?'hook':'verse';
  // Keep tightly bounded to protect face detail and main readable lyrics.
  const sectionGain=dense?.40:hook?1:.64;
  const lyricGuard=input.lyricsProtected?.62:1;
  const deviceGain=tier==='high'?1:.78;
  const accent=clamp01(strength*dynamic*sectionGain*lyricGuard*deviceGain*3.3);
  return {
    enabled:true,
    keyLift:Math.min(.12,accent*.115),
    fillLift:Math.min(.075,accent*(duo?.068:.055)),
    keyColorMix:Math.min(.11,accent*.10),
    fillColorMix:Math.min(.08,accent*(duo?.078:.055)),
    mode,
  };
}
