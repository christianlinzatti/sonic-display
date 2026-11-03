/** V877 – Intelligent Crowd Interaction 4.0.
 * Song-verified, timestamp-driven audience interaction without an independent
 * audio classifier, face tracker, random generator, timer, scene object or light.
 * The planner only changes already admitted V815/V825/V874–876 crowd motion.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {CrowdChoreographyCueV876,CrowdMotionScratchV876,CrowdLayoutPersonV876} from './dynamicFestivalCrowdChoreographyV876';
import {CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';

export type CrowdInteractionModeV877='none'|'rap-response'|'singalong'|'performer-follow'|'ensemble-echo'|'drop-cheer'|'finale-wave';
export type TimedLyricsV877=Readonly<{synced:boolean;lines:readonly Readonly<{startMs:number;endMs?:number|null;text:string}>[]}>;
export type CrowdInteractionCueV877=CrowdChoreographyCueV876 & Readonly<{
 interactionModeV877:CrowdInteractionModeV877;
 interactionStrengthV877:number;interactionSectorV877:number;interactionLyricPulseV877:number;
}>;
export type CrowdInteractionInputV877=Readonly<{
 base:CrowdChoreographyCueV876;fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 tier:'low'|'balanced'|'high';playing:boolean;manualLighting:boolean;
 blackout:boolean;reducedMotion:boolean;lyricsProtected:boolean;vocalFocus:boolean;
 energy:number;kick:number;groupCount:number;focusSlot:number|null;
 focusVerified:boolean;lyrics:TimedLyricsV877|null|undefined;lyricsVisible:boolean;
 progressMs:number;
}>;
const clamp=(n:number,low=0,high=1)=>Math.min(high,Math.max(low,n));
const finite=(...values:number[])=>values.every(Number.isFinite);
const OFF_V877={interactionModeV877:'none',interactionStrengthV877:0,
 interactionSectorV877:-1,interactionLyricPulseV877:0} as const;
function inactive(base:CrowdChoreographyCueV876):CrowdInteractionCueV877{
 return {...base,...OFF_V877};
}
/** An active, actually timestamped lyric, never inferred from LRC gaps or untimed text.
 * Binary search keeps frame work logarithmic; no lyrics text is parsed or displayed.
 */
export function timedLyricPulseV877(lyrics:TimedLyricsV877|null|undefined,
 visible:boolean,progressMs:number):number{
 if(!visible||!lyrics?.synced||!Array.isArray(lyrics.lines)||!finite(progressMs)||progressMs<0)return 0;
 const lines=lyrics.lines;
 let lo=0,hi=lines.length-1,found=-1;
 while(lo<=hi){
  const mid=(lo+hi)>>>1,line=lines[mid];
  if(!line||!finite(line.startMs)||line.startMs<0)return 0;
  if(line.startMs<=progressMs){found=mid;lo=mid+1;}else hi=mid-1;
 }
 if(found<0)return 0;
 const line=lines[found],next=lines[found+1];
 if(!line.text?.trim()||!finite(line.startMs))return 0;
 if(next&&(!finite(next.startMs)||next.startMs<=line.startMs))return 0;
 const nextStart=next?.startMs??Infinity;
 const end=finite(line.endMs??NaN)?Math.min(line.endMs!,nextStart):Math.min(line.startMs+4000,nextStart);
 if(end<=line.startMs||progressMs>=end)return 0;
 const age=progressMs-line.startMs;
 // Response window on real line onset; returns 0 during a long lyric tail.
 if(age<0||age>1700)return 0;
 return clamp(Math.sin(Math.PI*age/1700));
}

/** Safe downstream interaction: never promotes a parent-disabled crowd. */
export function planIntelligentCrowdInteractionV877(i:CrowdInteractionInputV877):CrowdInteractionCueV877{
 const b=i.base,s=i.settings,fx=i.fx;
 if(!b.active||!Number.isInteger(b.count)||b.count<2||b.count>CROWD_MAX_V815||
  !fx.active||fx.reason!=='music'||!i.playing||i.manualLighting||i.blackout||
  i.reducedMotion||i.tier==='low'||!s.enabled||!s.virtualCrowd||
  !s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876||
  !s.crowdInteractionV877||!Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  !finite(i.energy,i.kick,b.movement,b.armLift,b.phase,b.choreographyStrength,
    s.intensity,s.crowdIntensity,s.crowdInteractionStrengthV877)||
  b.movement<=0||b.choreographyStrength<=0||s.intensity<=0||s.crowdIntensity<=0||
  s.crowdInteractionStrengthV877<=0)return inactive(b);
 const lyricPulse=timedLyricPulseV877(i.lyrics,i.lyricsVisible,i.progressMs);
 const validFocus=s.crowdFollowPerformerV877&&i.focusVerified&&
  Number.isInteger(i.focusSlot)&&i.focusSlot!==null&&i.focusSlot>=0&&i.focusSlot<i.groupCount;
 let interactionModeV877:CrowdInteractionModeV877='none';
 let sectionGain=0;
 if(fx.section==='drop'&&i.energy>.12){interactionModeV877='drop-cheer';sectionGain=.92;}
 else if(fx.section==='finale'){interactionModeV877='finale-wave';sectionGain=.78;}
 else if((fx.section==='hook'||(fx.section==='verse'&&fx.genre==='rap'))&&
   lyricPulse>0&&s.crowdCallResponseV877){
  interactionModeV877=fx.section==='verse'?'rap-response':'singalong';sectionGain=fx.section==='verse'?.55:.8;
 }else if(validFocus&&(fx.section==='verse'||fx.section==='hook')){
  interactionModeV877='performer-follow';sectionGain=.43;
 }else if(s.crowdDanceEchoV877&&i.groupCount>=2&&
  (fx.section==='verse'||fx.section==='hook'||fx.section==='build')){
  interactionModeV877='ensemble-echo';sectionGain=.54;
 }
 if(interactionModeV877==='none')return inactive(b);
 const style=s.crowdInteractionStyleV877==='lively'?1:s.crowdInteractionStyleV877==='subtle'?.46:.74;
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:fx.genre==='rock'?.88:
  fx.genre==='rap'?.84:fx.genre==='pop'?.74:.65;
 const parent=clamp(b.choreographyStrength);
 const quality=i.tier==='balanced'?.74:1;
 const protection=(i.lyricsProtected?.60:1)*(i.vocalFocus?.74:1);
 const energy=clamp(i.energy)*.44+clamp(i.kick)*.56;
 const phraseGain=interactionModeV877==='rap-response'||interactionModeV877==='singalong'?
  (.3+.7*lyricPulse):(.4+.6*energy);
 const gain=clamp(s.crowdInteractionStrengthV877/100)*style*genre*sectionGain*
  parent*quality*protection*phraseGain;
 const interactionStrengthV877=clamp(gain);
 if(interactionStrengthV877<=.00001)return inactive(b);
 return {...b,interactionModeV877,interactionStrengthV877,
  interactionSectorV877:validFocus?(i.focusSlot!*2)%6:-1,
  interactionLyricPulseV877:lyricPulse};
}

/** Add small bounded offsets to the V876 caller-owned scratch. Never allocates.
 * This function does not change the fixed V815 layout or draw more meshes.
 */
export function applyCrowdInteractionMotionV877(index:number,person:CrowdLayoutPersonV876,
 cue:Partial<CrowdInteractionCueV877>,out:CrowdMotionScratchV876):void{
 const strength=cue.interactionStrengthV877??0,phase=cue.phase??0;
 if(!cue.active||cue.interactionModeV877==='none'||!cue.interactionModeV877||
  !Number.isInteger(index)||index<0||index>=CROWD_MAX_V815||
  !finite(strength,phase,person.x,person.phase,person.scale)||strength<=0||
  !finite(out.horizontal,out.bob,out.tilt,out.armAccent,out.wavePhase))return;
 const mode=cue.interactionModeV877,gain=clamp(strength),sector=Math.floor(index/12)%6;
 const focus=cue.interactionSectorV877??-1;
 const distance=focus>=0?Math.min(Math.abs(sector-focus),6-Math.abs(sector-focus)):0;
 const sectorGain=focus>=0?Math.max(.30,1-distance*.22):1;
 const pulse=Math.max(0,Math.sin(phase*(mode==='drop-cheer'?4.7:2.65)-sector*.91+person.phase*.18));
 const alternating=(sector%2===0?1:-1);
 const lyric=clamp(cue.interactionLyricPulseV877??0);
 const activity=(mode==='singalong'||mode==='rap-response')?lyric:Math.max(.15,pulse);
 const response=gain*sectorGain*activity;
 const direction=mode==='performer-follow'?alternating:Math.sin(phase*1.6+sector*.62);
 out.horizontal=clamp(out.horizontal+.010*response*direction,-.085,.085);
 out.bob=clamp(out.bob+.013*response*pulse,-.075,.075);
 out.tilt=clamp(out.tilt+.016*response*direction,-.09,.09);
 out.armAccent=clamp(out.armAccent+response*(mode==='singalong'?.075:mode==='rap-response'?.06:.047),0,.35);
 out.wavePhase=clamp(out.wavePhase+response*(mode==='finale-wave'?.15:.095)*alternating,-.55,.55);
}
