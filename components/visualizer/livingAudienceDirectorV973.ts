/** V973 – Living Audience 3.0: lightweight, per-person audience microchoreography.
 * Runs downstream of V815/V825/V874–V880/V893; it never creates a crowd, changes
 * audio verification, overrides authored cues, or allocates scene objects.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxSectionV810} from './concertFxStudioV810';
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';
import type {CrowdLayoutPersonV876,CrowdMotionScratchV876} from './dynamicFestivalCrowdChoreographyV876';
import {CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';

export type LivingAudienceModeV973='idle'|'groove'|'hands'|'wave'|'bounce'|'finale';
export type LivingAudienceCueV973=VirtualCrowdCueV815 & Readonly<{
 livingActiveV973:boolean;livingModeV973:LivingAudienceModeV973;
 livingStrengthV973:number;livingWaveV973:number;livingHandsV973:number;
 livingIndividualV973:number;livingPhaseV973:number;livingQualityV973:'eco'|'balanced'|'cinematic';
}>;
export type LivingAudienceInputV973=Readonly<{
 base:VirtualCrowdCueV815;fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 positionMs:number;playing:boolean;manualLighting:boolean;blackout:boolean;
 manualCamera:boolean;reducedMotion:boolean;lyricsProtected:boolean;
 vocalFocus:boolean;groupCount:number;energy:number;kick:number;
 tier:'low'|'balanced'|'high';
}>;
const unit=(n:number)=>Math.max(0,Math.min(1,n));
const finite=(...n:number[])=>n.every(Number.isFinite);
const SECTION_MODE:Record<ConcertFxSectionV810,LivingAudienceModeV973>={
 intro:'idle',verse:'groove',hook:'hands',build:'wave',drop:'bounce',break:'idle',finale:'finale'
};
const SECTION_ENERGY:Record<ConcertFxSectionV810,number>={
 intro:.08,verse:.43,hook:.78,build:.63,drop:1,break:0,finale:.88
};
const MAX_BY_QUALITY={eco:24,balanced:48,cinematic:CROWD_MAX_V815} as const;
function off(base:VirtualCrowdCueV815,quality:LivingAudienceCueV973['livingQualityV973']):LivingAudienceCueV973{
 return {...base,livingActiveV973:false,livingModeV973:'idle',livingStrengthV973:0,
   livingWaveV973:0,livingHandsV973:0,livingIndividualV973:0,livingPhaseV973:0,livingQualityV973:quality};
}
/** Only trims a permitted crowd; renderer reuses THREE instanced heads, bodies,
 * phones and arms. 60 Hz timer, network, microphone and Govee are not involved.
 */
export function planLivingAudienceV973(i:LivingAudienceInputV973):LivingAudienceCueV973{
 const b=i.base,s=i.settings;
 const quality=s.livingQualityV973;
 if(!s.enabled||!s.virtualCrowd||!s.livingAudienceV973||!b.active||
    !i.fx.active||i.fx.reason!=='music'||!i.playing||i.manualLighting||i.blackout||
    i.manualCamera||i.reducedMotion||i.tier==='low'||
    !Number.isInteger(b.count)||b.count<2||b.count>CROWD_MAX_V815||
    !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
    !finite(b.phase,b.movement,b.phoneOpacity,i.positionMs,i.energy,i.kick,
      s.livingStrengthV973,s.intensity,s.crowdIntensity)||
    i.positionMs<0||s.intensity<=0||s.crowdIntensity<=0||
    s.livingStrengthV973<=0||!Object.prototype.hasOwnProperty.call(SECTION_MODE,i.fx.section))
    return off(b,quality);
 const count=Math.min(b.count,MAX_BY_QUALITY[quality]);
 if(count<2)return off({...b,count,active:false},quality);
 const mode=SECTION_MODE[i.fx.section];
 const genre=i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle'?1:
   i.fx.genre==='rock'?.86:i.fx.genre==='rap'?.73:.66;
 const protect=(i.lyricsProtected?.55:1)*(i.vocalFocus?.68:1)*
   (i.groupCount>=3?.78:1);
 const tier=i.tier==='balanced'?.70:1;
 const volume=unit(s.livingStrengthV973/100)*unit(s.intensity/100)*
   unit(s.crowdIntensity/100)*protect*tier*genre*SECTION_ENERGY[i.fx.section];
 const rhythm=unit(unit(i.energy)*.45+unit(i.kick)*.55);
 // Scale relative to the inherited V825-governed motion; no new crowd FX lane.
 const original=unit(b.movement/.22);
 const gain=unit(volume*(.55+.45*rhythm)*original);
 const existingArms=Number.isFinite((b as {armLift?:number}).armLift)?
   unit(((b as {armLift?:number}).armLift??0)/.88):0;
 const hands=s.crowdArmWaveV874?unit(gain*existingArms*(mode==='hands'||mode==='finale'?1:mode==='wave'?.7:mode==='bounce'?.52:.20)):0;
 const wave=s.livingWavesV973&&existingArms>0&&mode!=='idle'?unit(gain*existingArms*(mode==='wave'||mode==='finale'?1:.60)):0;
 const individuals=s.livingIndividualV973?gain:gain*.18;
 return {...b,count,livingActiveV973:gain>.001,livingModeV973:mode,
  livingStrengthV973:gain,livingHandsV973:hands,livingWaveV973:wave,
  livingIndividualV973:individuals,livingPhaseV973:Math.min(1e7,i.positionMs/1000), livingQualityV973:quality};
}
export type LivingMotionScratchV973={leftRaise:number;rightRaise:number;headNod:number};
export function createLivingMotionScratchV973():LivingMotionScratchV973{
 return {leftRaise:0,rightRaise:0,headNod:0};
}
/** Stable 6-sector waves plus distinct per-person response. No heap allocation per
 * participant; parameters are caller-owned scratch structs, sampled at <=20 Hz.
 * Physical displacement stays below existing V876/V879 side-lane caps.
 */
export function sampleLivingAudienceV973(index:number,person:CrowdLayoutPersonV876,
 cue:Partial<LivingAudienceCueV973>,out:CrowdMotionScratchV876,
 limbs:LivingMotionScratchV973):void{
 limbs.leftRaise=0;limbs.rightRaise=0;limbs.headNod=0;
 if(!cue.active||!cue.livingActiveV973||!Number.isInteger(index)||
    index<0||index>=CROWD_MAX_V815||
    !finite(person.x,person.phase,person.scale,out.horizontal,out.bob,out.tilt,
      cue.livingStrengthV973??NaN,cue.livingHandsV973??NaN,
      cue.livingWaveV973??NaN,cue.livingIndividualV973??NaN,cue.livingPhaseV973??NaN))return;
 const gain=unit(cue.livingStrengthV973??0),hands=unit(cue.livingHandsV973??0),
   wave=unit(cue.livingWaveV973??0),individual=unit(cue.livingIndividualV973??0);
 const phase=cue.livingPhaseV973??0;
 const sector=Math.floor(index/12)%6;
 // A line wave rolls from one wing/rank to the other; person phase never random.
 const pulse=Math.sin(phase*1.38-sector*.8-person.phase*.12);
 const individuality=Math.sin(phase*(1.02+(index%7)*.045)+person.phase*.64);
 const lift=Math.max(0,pulse)*wave;
 const foot=cue.livingModeV973==='bounce'?Math.max(0,individuality):individuality*.35;
 const sway=(.75*individuality+.25*pulse)*individual;
 // V879 may previously have applied camera/lyrics restrictions. New movement
 // is damped further by its output harmony focus, never resets that focus.
 const harmony=1-unit((cue as {harmonyFocusV879?:number}).harmonyFocusV879??0);
 const amplitude=gain*harmony;
 out.horizontal=Math.max(-.085,Math.min(.085,out.horizontal+.010*amplitude*sway));
 out.bob=Math.max(-.075,Math.min(.075,out.bob+.013*amplitude*foot+.009*lift*harmony));
 out.tilt=Math.max(-.09,Math.min(.09,out.tilt+.013*amplitude*sway));
 limbs.leftRaise=unit((hands*(.3+.7*Math.max(0,individuality))+.52*lift)*harmony);
 limbs.rightRaise=unit((hands*(.3+.7*Math.max(0,-individuality))+.52*lift)*harmony);
 limbs.headNod=Math.max(-.025,Math.min(.025,.022*amplitude*individuality));
}
