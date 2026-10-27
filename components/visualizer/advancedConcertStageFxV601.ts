/** V601 – cue-led, bounded modulation of the EXISTING V555 stage decorations.
 * No new music-structure classifier, singer inference, lyrics changes or GPU passes.
 * Only a pre-existing stage cue may activate hook/drop accents. Explicit manual
 * lighting and reduced-motion controls take precedence.
 */
import type {ConcertDetailSettingsV555, ConcertDetailsCueV555} from './concertDetailEffectsV555';
import {balanceConcertDetailsV556, type ConcertQualityV556} from './concertBalanceV556';

export type StageFxModeV601='off'|'verse'|'build'|'hook'|'drop'|'break'|'ambient';
export type StageFxCueV601={
  mode:StageFxModeV601; gobo:number;pixelWall:number;floorFog:number;projection:number;
  spotlight:number; sweep:number; speed:number; ledShape:0|1|2; projectedWord:string;
  evidence:'stage-cue'|'base'|'off';
};
export type StageFxInputV601={
  cue:ConcertDetailsCueV555;settings:ConcertDetailSettingsV555;
  playing:boolean;reducedMotion:boolean;tier:ConcertQualityV556;
  section?:string|null;genre?:string|null;manualLighting?:boolean;reactive?:boolean;lyricsProtected?:boolean;
};
const clamp=(n:number,lo=0,hi=1)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const clean=(n:number)=>Math.round(clamp(n)*10000)/10000;
export function planAdvancedConcertStageFxV601(input:StageFxInputV601):StageFxCueV601{
  const {settings,cue,tier,playing,reducedMotion}=input;
  const old=balanceConcertDetailsV556({cue,settings,playing,reducedMotion,tier});
  const off:StageFxCueV601={mode:'off',gobo:0,pixelWall:0,floorFog:0,projection:0,
    spotlight:0,sweep:0,speed:0,ledShape:0,projectedWord:'',evidence:'off'};
  if(!settings.enabled||!playing)return off;
  // Stage-reactive off is a MANUAL request to keep the existing V556 static detail layers.
  const manual=input.manualLighting===true||input.reactive===false;
  const section=!manual&&['verse','build','hook','drop','break'].includes(input.section??'')?input.section:'';
  const named=section==='hook'||section==='drop'||section==='build'||section==='break';
  const mode:StageFxModeV601=manual?'ambient':section==='drop'?'drop':section==='hook'||(!section&&cue.hook)?'hook':section==='build'?'build':section==='break'?'break':section==='verse'?'verse':'ambient';
  const density=clamp(cue.density);
  const quiet=density>=.65||input.lyricsProtected===true;
  // The original V556 settings/budget, not any new slider, determine every maximum.
  // Hooks/drops modulate <= 19% relative to V556; dense lyrics always calm down.
  const sourceGain=manual||reducedMotion?1:mode==='drop'?1.19:mode==='hook'?1.14:mode==='build'?1.08:mode==='break'?.72:mode==='verse'?.87:1;
  const wordGain=quiet?.66:1;
  let gobo=old.gobo*sourceGain*(quiet?.77:1);
  let pixelWall=old.pixelWall*sourceGain*wordGain;
  // When authored lighting is active V601 leaves ALL existing shader strengths untouched.
  if(manual){gobo=old.gobo;pixelWall=old.pixelWall;}
  const projection=old.projection;
  const budget=tier==='low'?.12:.35;
  const total=gobo+pixelWall+projection;
  if(total>budget){const allowed=Math.max(0,budget-projection);const ratio=allowed/(gobo+pixelWall||1);
    gobo*=ratio;pixelWall*=ratio;}
  const floorFog=old.floorFog*(manual?1:quiet?.55:mode==='drop'?.93:mode==='break'?.82:1);
  // Spotlight uses an existing cheap WebGL light only in balanced/high tiers.
  // No spotlight during dense speech, authored lighting, motion reduction, or low tier.
  const spotlight=!manual&&!reducedMotion&&!quiet&&tier!=='low'&&settings.avatarLight!==false&&settings.gobo&&
    (mode==='hook'||mode==='drop'||mode==='build')?
    clamp(old.gobo*(tier==='high'?1.7:1.1),0,tier==='high'?.25:.13):0;
  const sweep=spotlight>0?clamp(mode==='drop'?.9:mode==='hook'?.62:.35):0;
  const genre=(input.genre??'').toLowerCase();
  const pace=genre.includes('hardtekk')?1.16:genre.includes('hardstyle')?1.08:genre.includes('rap')?.82:1;
  const speed=reducedMotion||manual||tier==='low'?0:clamp((quiet?.18:mode==='drop'?.82:mode==='hook'?.56:mode==='build'?.35:.2)*pace);
  return {mode,gobo:clean(gobo),pixelWall:clean(pixelWall),floorFog:clean(floorFog),
    projection:clean(projection),spotlight:clean(spotlight),sweep:clean(sweep),speed:clean(speed),
    ledShape:mode==='drop'?2:mode==='hook'?1:0,projectedWord:old.projectedWord,
    evidence:manual?'base':named||!section&&cue.hook?'stage-cue':'base'};
}
