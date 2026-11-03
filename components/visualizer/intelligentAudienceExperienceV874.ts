/** V874 – Intelligent Audience Experience 2.0.
 * Pure, seek-stable enhancement of the existing verified V815 audience.
 * Never creates independent beat/drop triggers or exceeds parent FX budgets.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';

export type AudienceStyleV874='groove'|'rave'|'clap'|'wave'|'calm';
export type AudienceCueV874=VirtualCrowdCueV815 & Readonly<{
  style:AudienceStyleV874; armLift:number; cheer:number; phoneWave:number;
}>;
export type AudienceInputV874=Readonly<{
  base:VirtualCrowdCueV815; fx:ConcertFxCueV810;
  settings:ConcertFxSettingsV810;
  energy:number;kick:number;
  tier:'low'|'balanced'|'high';
  lyricsProtected:boolean;vocalFocus:boolean;reducedMotion:boolean;
}>;
const clamp=(value:number)=>Math.min(1,Math.max(0,value));
const finite=(...values:number[])=>values.every(Number.isFinite);
const styleFor=(genre:ConcertFxCueV810['genre']):AudienceStyleV874=>
  genre==='hardstyle'||genre==='hardtekk'?'rave':genre==='rap'?'groove':
  genre==='rock'?'clap':genre==='pop'?'wave':'calm';

/** Reactions only piggyback on a currently visible, verified V815 crowd. */
export function planIntelligentAudienceV874(i:AudienceInputV874):AudienceCueV874 {
  const base=i.base;
  const inactive:AudienceCueV874={...base,style:'calm',armLift:0,cheer:0,phoneWave:0};
  if(!base.active||base.count<2||!i.fx.active||i.fx.reason!=='music'||
    !i.settings.enabled||!i.settings.virtualCrowd||
    !i.settings.crowdExperienceV874||i.tier==='low'||i.reducedMotion||
    !finite(i.energy,i.kick,base.movement,base.phoneOpacity,base.lightGain,
      i.settings.crowdIntensity,i.settings.intensity)||
    i.settings.crowdIntensity<=0||i.settings.intensity<=0)return inactive;
  const style=styleFor(i.fx.genre);
  const section=i.fx.section;
  const climax=section==='drop'?1:section==='finale'?.93:
    section==='hook'?.83:section==='build'?.56:
    section==='verse'?.31:section==='intro'?.2:.13;
  const rhythm=clamp(i.kick)*.67+clamp(i.energy)*.33;
  const styleGain=style==='rave'?1:style==='clap'?.84:
    style==='wave'?.79:style==='groove'?.64:.48;
  const protection=(i.lyricsProtected?.57:1)*(i.vocalFocus?.72:1);
  const perf=i.tier==='balanced'?.74:1;
  // The source movement is already scaled by the FX performance governor.
  // Therefore no arm animation can appear if the parent was performance-muted.
  const sourceGain=clamp(base.movement/.22);
  const response=clamp(styleGain*climax*(.2+.8*rhythm)*protection*perf*sourceGain);
  const armLift=i.settings.crowdArmWaveV874?Math.min(.88,response*.82):0;
  const cheer=Math.min(.75,response*(section==='drop'||section==='hook'||section==='finale'?.73:.32));
  const phoneWave=i.settings.crowdPhoneWaveV874&&i.settings.crowdPhones&&base.phoneOpacity>0?
    Math.min(.74,response*.69):0;
  return {...base,style,armLift,cheer,phoneWave};
}
