/** V876 – Dynamic Festival Crowd Choreography.
 * Six deterministic sectors, no additional GPU draw calls, timers or detections.
 * This planner is downstream of the V815/V825/V874/V875 safety governors.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FestivalAtmosphereCueV875} from './smartFestivalAtmosphereV875';
import {CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';

export type CrowdChoreographyModeV876='rest'|'sway'|'groove'|'clap'|'ripple'|'bounce'|'surge';
export type CrowdChoreographyCueV876=FestivalAtmosphereCueV875 & Readonly<{
 choreographyMode:CrowdChoreographyModeV876;
 choreographyStrength:number;
 choreographySectorSync:boolean;
}>;
export type CrowdChoreographyInputV876=Readonly<{
 base:FestivalAtmosphereCueV875;fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 energy:number;kick:number;tier:'low'|'balanced'|'high';
 playing:boolean;manualLighting:boolean;blackout:boolean;
 lyricsProtected:boolean;vocalFocus:boolean;reducedMotion:boolean;
}>;
export type CrowdMotionScratchV876={horizontal:number;bob:number;tilt:number;armAccent:number;wavePhase:number};
export type CrowdLayoutPersonV876=Readonly<{x:number;phase:number;scale:number}>;
const unit=(n:number)=>Math.min(1,Math.max(0,n));
export const CROWD_SECTORS_V876=6;
const SECTION_MODE:Record<ConcertFxCueV810['section'],CrowdChoreographyModeV876>={
 intro:'sway',verse:'groove',hook:'clap',build:'ripple',drop:'bounce',break:'rest',finale:'surge'
};
const SECTION_GAIN:Record<ConcertFxCueV810['section'],number>={
 intro:.24,verse:.42,hook:.83,build:.64,drop:1,break:0,finale:.78
};
function inactive(base:FestivalAtmosphereCueV875):CrowdChoreographyCueV876{
 return {...base,choreographyMode:'rest',choreographyStrength:0,choreographySectorSync:false};
}
/** Only trims an already permitted and performance-governed crowd cue. */
export function planDynamicFestivalCrowdChoreographyV876(i:CrowdChoreographyInputV876):CrowdChoreographyCueV876{
 const b=i.base,s=i.settings;
 if(!b.active||!Number.isInteger(b.count)||b.count<2||b.count>CROWD_MAX_V815||
   !i.fx.active||i.fx.reason!=='music'||!i.playing||i.manualLighting||i.blackout||
   i.reducedMotion||i.tier==='low'||!s.enabled||!s.virtualCrowd||
   !s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876||
   ![i.energy,i.kick,b.movement,b.armLift,b.lightGain,b.phase,
     s.intensity,s.crowdIntensity,s.crowdChoreographyStrengthV876].every(Number.isFinite)||
   b.movement<=0||s.intensity<=0||s.crowdIntensity<=0||s.crowdChoreographyStrengthV876<=0||
   !SECTION_MODE[i.fx.section])return inactive(b);
 let choreographyMode=SECTION_MODE[i.fx.section];
 if(i.fx.section==='hook'){
   choreographyMode=i.fx.genre==='rap'?'groove':i.fx.genre==='pop'?'sway':'clap';
 }else if(i.fx.section==='drop'){
   choreographyMode=i.fx.genre==='rap'?'surge':i.fx.genre==='rock'?'clap':
    i.fx.genre==='pop'?'sway':'bounce';
 }
 const genre=i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle'?1:
   i.fx.genre==='rock'?.82:i.fx.genre==='rap'?.74:i.fx.genre==='pop'?.70:.62;
 const style=s.crowdChoreographyStyleV876==='festival'?1:
   s.crowdChoreographyStyleV876==='natural'?.54:.78;
 const parent=unit(b.movement/.14);
 const protection=(i.lyricsProtected?.52:1)*(i.vocalFocus?.66:1);
 const quality=i.tier==='balanced'?.66:1;
 const energy=unit(i.energy)*.36+unit(i.kick)*.64;
 const choreographyStrength=unit(s.crowdChoreographyStrengthV876/100)*
   SECTION_GAIN[i.fx.section]*genre*style*protection*quality*parent*(.35+energy*.65);
 return {...b,choreographyMode,choreographyStrength:unit(choreographyStrength),
   choreographySectorSync:s.crowdSectorSyncV876};
}
export function createCrowdMotionScratchV876():CrowdMotionScratchV876{
 return {horizontal:0,bob:0,tilt:0,armAccent:0,wavePhase:0};
}
/** Samples one participant into a caller-owned scratch value (zero allocations in frames).
 * All lateral motion remains below 9 cm; the empty central performer lane stays free.
 * A fixed six-sector partition and existing cue phase make results seek-stable.
 */
export function sampleCrowdChoreographyV876(index:number,person:CrowdLayoutPersonV876,
 cue:Partial<CrowdChoreographyCueV876>,out:CrowdMotionScratchV876):void{
 out.horizontal=0;out.bob=0;out.tilt=0;out.armAccent=0;out.wavePhase=0;
 const strength=cue.choreographyStrength??0,phase=cue.phase??0;
 const mode=cue.choreographyMode;
 if(!cue.active||!Number.isInteger(index)||index<0||index>=CROWD_MAX_V815||
   !Number.isFinite(strength)||strength<=0||!Number.isFinite(phase)||
   !Number.isFinite(person.x)||!Number.isFinite(person.phase)||
   !Number.isFinite(person.scale)||mode==='rest'||!mode)return;
 const gain=unit(strength);
 const sector=Math.floor(index/12)%CROWD_SECTORS_V876;
 const offset=cue.choreographySectorSync===true?sector*.66:person.phase*.47;
 const rhythm=phase*(mode==='bounce'?5.9:mode==='clap'?4.2:mode==='ripple'?2.4:2.1)-offset+person.phase*.10;
 const pulse=Math.sin(rhythm);
 const side=Math.sin(phase*(mode==='sway'?1.25:1.85)+offset*.7+person.phase*.14);
 const bounce=mode==='bounce'||mode==='surge';
 const amplitude=mode==='ripple'?.60:mode==='sway'?.70:1;
 out.horizontal=Math.max(-.085,Math.min(.085,.068*gain*side*amplitude));
 out.bob=Math.max(-.075,Math.min(.075,.070*gain*(bounce?Math.max(0,pulse):pulse*.43)));
 out.tilt=Math.max(-.09,Math.min(.09,.070*gain*(mode==='clap'?pulse:side)));
 out.armAccent=(mode==='clap'?.24:mode==='ripple'?.17:.11)*gain*Math.max(0,pulse);
 out.wavePhase=(mode==='ripple'?.45:.20)*gain*Math.sin(phase*1.4-sector*.75);
}
