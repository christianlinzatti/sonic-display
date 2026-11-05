/** V977 – Smart Concert Storytelling.
 * Pure, deterministic dramaturgy for confirmed V318 sections on the existing
 * virtual stage. No predictive drops, camera edits, new renderer loop, device
 * writes, storage, audio capture, timers, network requests or new mesh types.
 * V975/V976 can be applied first; all authored cues remain authoritative.
 */
import type {ConcertSceneV958,ConcertSettingsV958,ConcertPhaseV958,ConcertFxV955} from '@/lib/ultimateConcertRoadmapV958';

export type ConcertStoryBeatV977='opening'|'journey'|'rising'|'crest'|'breather'|'finale'|'off';
export interface ConcertStoryInputV977 {
 scene:ConcertSceneV958|null;settings:ConcertSettingsV958;
 positionMs:number;durationMs:number;sectionStartMs:number;sectionDurationMs:number;
 sectionIndex:number;sectionConfidence:number;hookOrdinal:number;
 playing:boolean;authoredStage:boolean;savedShowActive?:boolean;
 lowPerformance:boolean;reducedMotion:boolean;lyricsVisible:boolean;
}
export interface ConcertStoryResultV977 {
 scene:ConcertSceneV958|null;active:boolean;beat:ConcertStoryBeatV977;
 gain:number;accent:boolean;reason:string;
}
const phases:readonly ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const off=(scene:ConcertSceneV958|null,reason:string):ConcertStoryResultV977=>({
 scene,active:false,beat:'off',gain:1,accent:false,reason,
});

/** The playhead and current confirmed section are the only timing authority.
 * A verified outro close to the actual end is necessary for the finale cue.
 * Edges ease back to the underlying V976/V975 scene to prevent hard jumps.
 */
export function applyConcertStorytellingV977(i:ConcertStoryInputV977):ConcertStoryResultV977 {
 const s=i.scene,t=i.settings;
 if(!s||!t.enabled||!t.virtualFx||!t.storytellingV977||!i.playing||!s.verified||
  s.timelineOverride||i.authoredStage||i.savedShowActive||i.lowPerformance||i.reducedMotion||
  !phases.includes(s.phase)||!finite(i.positionMs)||!finite(i.durationMs)||
  !finite(i.sectionStartMs)||!finite(i.sectionDurationMs)||!finite(i.sectionConfidence)||
  !Number.isInteger(i.sectionIndex)||i.sectionIndex<0||i.sectionIndex>159||
  !Number.isInteger(i.hookOrdinal)||i.hookOrdinal<0||i.hookOrdinal>160||
  i.sectionConfidence<.5||i.sectionConfidence>1||i.durationMs<10000||i.durationMs>1800000||
  i.sectionStartMs<0||i.sectionDurationMs<1000||
  i.sectionStartMs+i.sectionDurationMs>i.durationMs+1000||
  i.positionMs<i.sectionStartMs||i.positionMs>=Math.min(i.durationMs,i.sectionStartMs+i.sectionDurationMs)||
  !finite(t.storytellingStrengthV977)||t.storytellingStrengthV977<=0||
  !finite(s.intensity)||s.intensity<0||s.intensity>1||
  !finite(s.spotlight)||s.spotlight<0||s.spotlight>1||
  !finite(s.lightGain)||s.lightGain<0||s.lightGain>1.3||
  !Array.isArray(s.effects)||s.effects.length>3||
  !Array.isArray(s.palette)||s.palette.length!==2||
  !s.palette.every(v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v))){
  return off(s,'Nur echte, bestätigte automatische Songabschnitte mit gültigen Werten');
 }
 const progress=clamp(i.positionMs/i.durationMs,0,1);
 const local=clamp((i.positionMs-i.sectionStartMs)/i.sectionDurationMs,0,1);
 const elapsed=i.positionMs-i.sectionStartMs,remaining=i.sectionStartMs+i.sectionDurationMs-i.positionMs;
 const edgeMs=Math.min(1800,i.sectionDurationMs*.22);
 const envelope=smooth(elapsed/edgeMs)*smooth(remaining/edgeMs);
 const finalOutro=s.phase==='outro'&&s.finale&&progress>=.86;
 const beat:ConcertStoryBeatV977=finalOutro?'finale':s.phase==='break'?'breather':
  s.phase==='build'?'rising':(s.phase==='drop'||s.phase==='hook')?'crest':
  progress<.16?'opening':'journey';
 // Chapter pacing is a gentle whole-track shape; never claims to know future sections.
 const arc=-.035*(1-smooth(progress/.18))+.035*smooth((progress-.37)/.43)-
  (s.phase==='outro'?.04*smooth((progress-.85)/.15):0);
 const byPhase:Record<ConcertPhaseV958,number>={
  verse:-.025,hook:.05,build:.027,drop:.065,break:-.08,outro:-.045,
 };
 // Repeated *confirmed* hooks get a slightly different emphasis without new FX.
 const repeat=s.phase==='hook'&&i.hookOrdinal>0?
  ((i.hookOrdinal%3)-1)*.009:0;
 const climb=s.phase==='build'?(.045*(2*smooth(local)-1)):0;
 const finale=finalOutro ? .055*smooth(local) : 0;
 const mode=t.storytellingModeV977==='subtle' ? .52 : t.storytellingModeV977==='festival' ? 1.12 : .83;
 const strength=clamp(t.storytellingStrengthV977,0,100)/100;
 const lyricsCap=i.lyricsVisible ? .55 : 1;
 const gain=clamp(1+(arc+(byPhase[s.phase]+repeat+climb+finale)*envelope)*mode*strength*lyricsCap,.88,1.12);
 const intensity=clamp(s.intensity*gain,.12,.97);
 const spotlight=clamp(s.spotlight*(1+(gain-1)*.3),.1,1);
 const lightGain=clamp(s.lightGain*(1+(gain-1)*.2),.3,1.1);
 // An existing low-cost sweep becomes a brief, non-flashing visual accent.
 // No new effect types, no confetti unless the underlying verified scene chose it.
 const eligible=(s.phase==='hook'&&i.hookOrdinal>1&&i.hookOrdinal%2===0)||
  (s.phase==='drop'&&i.sectionIndex%2===0)||finalOutro;
 const accentEffect:ConcertFxV955=s.phase==='hook'&&s.effects.includes('sweep')?'fog':'sweep';
 const accent=Boolean(t.storytellingAccentsV977&&t.storytellingModeV977!=='subtle'&&
  !t.compactFxV960&&!i.lyricsVisible&&eligible&&local>=.40&&local<=.65&&
  s.effects.length<3&&!s.effects.includes(accentEffect));
 const effects:ConcertFxV955[]=accent?[...s.effects,accentEffect]:s.effects;
 return {scene:{...s,intensity,spotlight,lightGain,effects},active:true,beat,gain,accent,
  reason:`V977: bestätigter ${s.phase}-Abschnitt, virtuelle ${beat}-Dramaturgie`};
}
