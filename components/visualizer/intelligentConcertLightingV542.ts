/**
 * V542 – Intelligent Concert Lighting & Stage FX.
 * A bounded, additive refinement of the existing V462 rig; no lights, geometries,
 * timers, GPU resources or speaker detection are created by this planner.
 * Stage sections from the existing director are estimates, not Spotify metadata.
 */
import type {ConcertLightingPlanV462,LightingSectionV462,LightingTierV462} from './concertLightingDirectorV462';

export type ConcertLightingInputV542 = {
  base: ConcertLightingPlanV462;
  section?: LightingSectionV462 | null;
  energy: number;
  kick: number;
  tier: LightingTierV462;
  playing: boolean;
  reactive: boolean;
  reducedMotion: boolean;
  authored: boolean;
  blackout: boolean;
  lyricsProtected: boolean;
  vocalFocus: boolean;
  groupCount: number;
};
export type ConcertLightingPlanV542 = {
  active: boolean;
  scene: 'vocal-verse'|'crew-hook'|'build'|'drop'|'calm';
  keyGain: number;
  fillGain: number;
  beamGain: number;
  spotGain: number;
  hazeGain: number;
  sweepGain: number;
  faceFloor: number;
  allowLasers: false;
};
const safe=(n:number)=>Number.isFinite(n)?n:0;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,safe(n)));
const NEUTRAL:ConcertLightingPlanV542={active:false,scene:'calm',keyGain:1,fillGain:1,beamGain:1,spotGain:1,hazeGain:1,sweepGain:1,faceFloor:0,allowLasers:false};
export function refineConcertLightingV542(input:ConcertLightingInputV542):ConcertLightingPlanV542 {
  const {base}=input;
  // No extra brightening for manually authored scenes, blackouts, reduced motion,
  // unknown/low quality states or lights already disabled by their owner.
  if(!base.active||!input.playing||!input.reactive||input.reducedMotion||input.authored||input.blackout||input.tier==='low') return NEUTRAL;
  const energy=clamp(input.energy,0,1),kick=clamp(input.kick,0,1);
  const voices=clamp(Math.floor(safe(input.groupCount)),1,4);
  const level=input.tier==='high'?1:.55;
  const hasLyrics=!!input.lyricsProtected;
  const vocal=!!input.vocalFocus || base.mood==='rap';
  const section=input.section??'verse';
  const hook=section==='hook'&&voices>=2;
  const drop=section==='drop'&&(base.mood==='hardstyle'||base.mood==='hardtekk');
  const build=section==='build';
  const scene:ConcertLightingPlanV542['scene']=hook?'crew-hook':drop?'drop':build?'build':vocal?'vocal-verse':'calm';
  // V542 never produces strobe or laser pulses. Kick drives modest existing beam
  // strength only, and is required evidence for enhanced drops.
  let key=1,fill=1,beam=1,spot=1,haze=1,sweep=1;
  if(scene==='vocal-verse'){
    key+=.035*level;fill+=.055*level;
    beam-=.09*level;sweep-=.21*level;haze-=.16*level;
  }else if(scene==='crew-hook'){
    key+=.045*level;fill+=.07*level;
    spot+=(voices>=3?.075:.05)*level;beam+=.065*level;
    sweep-=.12*level;haze-=.13*level;
  }else if(scene==='drop'){
    const accent=kick*Math.min(energy,.95)*level;
    beam+=.12*accent;spot+=.07*accent;
    sweep+=.10*accent;haze+=.035*accent;
  }else if(scene==='build'){
    beam+=.025*energy*level;sweep+=.03*energy*level;
  }
  // Lyric captions must win over haze, bright beams and wide beam sweeps.
  if(hasLyrics){
    key=Math.max(key,1+.025*level);
    fill=Math.max(fill,1+.045*level);
    beam=Math.min(beam,1-.18*level);
    spot=Math.min(spot,1+.02*level);
    haze=Math.min(haze,1-.32*level);
    sweep=Math.min(sweep,1-.34*level);
  }
  // The floor can only raise V462's pre-authorized face brightness and is
  // applied by existing key/fill clamps, never to manual blackouts.
  const floor=base.faceFloor>0?clamp(base.faceFloor+(vocal ? .04 : .015)*level+(hasLyrics ? .025*level : 0),0,.55):0;
  return {active:true,scene,
    keyGain:clamp(key,.92,1.09),fillGain:clamp(fill,.92,1.1),
    beamGain:clamp(beam,.70,1.16),spotGain:clamp(spot,.85,1.12),
    hazeGain:clamp(haze,.6,1.08),sweepGain:clamp(sweep,.58,1.13),
    faceFloor:floor,allowLasers:false};
}
