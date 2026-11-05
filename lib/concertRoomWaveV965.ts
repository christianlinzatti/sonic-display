/** V965 – song-verified room-wide light wave. All timing comes from actual
 * V318 track analysis, NEVER from a guessed beat or a separate hardware loop.
 * No storage/network/React effects, strobe, power commands, or color overrides.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {ConcertSceneV958} from '@/lib/ultimateConcertRoadmapV958';

export type ConcertRoomWaveOptionsV965={enabled:boolean;playing:boolean;
 savedShowActive?:boolean;authoredStageActive?:boolean;reducedMotion?:boolean};
export type ConcertRoomWavePlanV965={active:boolean;progressMs:number;sectionStartMs:number;
 sectionDurationMs:number;depth:number;periodMs:number;phase:'hook'|'drop'|null;reason:string};
const inactive=(reason:string):ConcertRoomWavePlanV965=>({active:false,progressMs:0,
 sectionStartMs:0,sectionDurationMs:0,depth:0,periodMs:0,phase:null,reason});
const clamp=(value:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,value));
const smooth=(x:number)=>{const v=clamp(x,0,1);return v*v*(3-2*v);};

/** Only verified hook/drop intervals can trigger the slow lamp-to-lamp wave.
 * The previous Govee/group look is the HARD brightness ceiling. */
export function planConcertRoomWaveV965(scene:ConcertSceneV958|null|undefined,
 analysis:TrackAnalysisV318|null|undefined,trackId:string,sectionIndex:number,
 progressMs:number,options:ConcertRoomWaveOptionsV965):ConcertRoomWavePlanV965{
 if(!options?.enabled||!options.playing)return inactive('V965 deaktiviert oder pausiert');
 if(options.savedShowActive||options.authoredStageActive||scene?.timelineOverride)
  return inactive('Manuelle Bühne oder gespeicherte Lichtshow hat Vorrang');
 if(!scene?.verified||!analysis||!trackId||analysis.trackId!==trackId||
  !Number.isInteger(sectionIndex)||sectionIndex<0||sectionIndex>=analysis.sections.length||
  !Number.isFinite(progressMs)||progressMs<0||!Number.isFinite(analysis.durationMs)||analysis.durationMs<=0)
  return inactive('Keine verifizierte Trackposition');
 const section=analysis.sections[sectionIndex];
 if(!section||!Number.isFinite(section.startMs)||!Number.isFinite(section.durationMs)||
  !Number.isFinite(section.confidence)||section.confidence<.75||section.startMs<0||
  section.durationMs<1200||section.startMs+section.durationMs>analysis.durationMs+1000||
  progressMs<section.startMs||progressMs>=section.startMs+section.durationMs||
  (section.label!=='hook'&&section.label!=='drop')||scene.phase!==section.label)
  return inactive('Kein bestätigter Hook-/Drop-Abschnitt');
 const hard=/hardtekk|hardstyle|rawstyle/i.test(scene.genre);
 const rap=/deutschrap|hip.?hop|rap/i.test(scene.genre);
 // Not a flash: at most one slow rolling crest every 2.8–4.8 seconds.
 const periodMs=hard?2800:rap?4400:3600;
 const depth=(hard?.10:rap?.065:.08)*(options.reducedMotion?.35:1);
 return {active:true,progressMs,sectionStartMs:section.startMs,
  sectionDurationMs:section.durationMs,depth,periodMs,phase:section.label,
  reason:'Bestätigter '+section.label+' mit langsamer räumlicher Lichtwelle'};
}

export function dimConcertRoomWaveLookV965(look:GoveeLookV909,
 plan:ConcertRoomWavePlanV965,index:number,count:number):GoveeLookV909{
 if(!plan.active||!Number.isInteger(index)||!Number.isInteger(count)||
  count<2||count>32||index<0||index>=count||
  !Number.isFinite(look.brightness)||look.brightness<0||look.brightness>100||
  !Number.isFinite(plan.depth)||plan.depth<0||plan.depth>.12||
  !Number.isFinite(plan.periodMs)||plan.periodMs<2500||
  !Number.isFinite(plan.progressMs)||!Number.isFinite(plan.sectionStartMs)||
  !Number.isFinite(plan.sectionDurationMs)||plan.sectionDurationMs<=0)return look;
 const elapsed=plan.progressMs-plan.sectionStartMs;
 if(elapsed<0||elapsed>=plan.sectionDurationMs)return look;
 const fade=smooth(elapsed/650)*smooth((plan.sectionDurationMs-elapsed)/850);
 const angle=2*Math.PI*(elapsed/plan.periodMs-index/count);
 const attenuation=plan.depth*fade*(.5+.5*Math.cos(angle));
 const next=Math.min(look.brightness,Math.round(look.brightness*(1-attenuation)));
 return next===look.brightness?look:{...look,brightness:next};
}
