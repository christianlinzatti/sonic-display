import type {ConcertScoreV1134} from './concertScoreV1134';
import type {MusicalEvidence} from './musicalEvidence';
import {musicalDirection} from './musicalEvidence';
export type DancePhrase={block:number;step:number;bars:4|8;phase:'seed'|'develop'|'contrast'|'resolve';role:'lead'|'mirror'|'ripple'|'together';slot:number;delay:number;gain:number;clip:string|null;measured:boolean;weight:number;snap:number;flow:number};
const bound=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const hash=(s:string)=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
const CONTRAST:Record<string,readonly string[]>={
 neon:['Dance_HeelToe','Dance_RobotGroove','Dance_PivotStep'],cinema:['Dance_CrossStep','Dance_FluidArc','Dance_TurnPhrase'],
 groove:['Dance_DiagonalStep','Dance_JazzRebound','Dance_PivotStep'],festival:['Dance_SideGlide','Dance_FrontmanDrive','Dance_TurnPhrase'],
};
/** Four/eight bars share one motif and one resolution. Existing song memory and dialogue keep clip ownership. */
export function planDancePhrase(input:{cue:ConcertScoreV1134;beat:number;slot:number;count:number;clip:string|null;available:ReadonlySet<string>;evidence?:MusicalEvidence}):DancePhrase|null{
 const {cue}=input;
 if(!Number.isFinite(input.beat)||input.beat<0||cue.reading||cue.lyricFocus||cue.act==='breathe'||cue.act==='build')return null;
 const count=Math.max(1,Math.min(4,Math.round(input.count)||1)),slot=Math.max(0,Math.min(count-1,Math.round(input.slot)||0));
 const style=cue.production?.id??'groove',bars:4|8=style==='festival'||style==='cinema'?8:4;
 const length=bars*4,block=Math.floor(input.beat/length),within=input.beat%length,step=Math.min(3,Math.floor(within/(length/4)));
 const phase=(['seed','develop','contrast','resolve'] as const)[step],signal=musicalDirection(input.evidence);
 if(signal.quiet)return null;
 const returnVisit=Math.max(1,Math.floor(cue.chorusVisit)||1);
 const distance=returnVisit%2===0?(cue.leader-slot+count)%count:(slot-cue.leader+count)%count;
 const role:DancePhrase['role']=cue.interaction==='unison'||phase==='resolve'?'together':slot===cue.leader?'lead':cue.interaction==='answer'?'ripple':'mirror';
 const delay=role==='ripple'?distance*.5:0;
 const pool=CONTRAST[style]??CONTRAST.groove,seed=hash(cue.showTakeSeed??cue.sourceKey);
 const motif=cue.memory?.clip??cue.production?.motif??input.clip;
 let clip=input.clip;
 if(!cue.memory&&!cue.dialogue){
  const driven=signal.measured&&signal.weight>.25?'Dance_HeelToe':signal.measured&&signal.snap>.25?'Dance_RobotGroove':null;
  const wanted=step===0||step===3?motif:driven??pool[(seed+block+returnVisit-1+(step===2?1:0))%pool.length];
  if(wanted&&input.available.has(wanted))clip=wanted;
 }
 // Four-beat local waves, with a quiet pickup and a clear, shared resolution.
 const arc=.5-.5*Math.cos(Math.PI*bound(within/length));
 return {block,step,bars,phase,role,slot,delay,clip,measured:signal.measured,
  gain:(role==='lead'?1:role==='together'?.95:.74)*(.72+arc*.28),
  weight:signal.weight,snap:signal.snap,flow:signal.flow};
}
/** Small bounded accents. Legs/hips remain entirely under authored clips and contact IK. */
export function dancePhrasePose(phrase:DancePhrase|null|undefined,beat:number){
 const zero={chestX:0,chestY:0,chestZ:0,armX:0,armZ:0,headX:0};
 if(!phrase||!Number.isFinite(beat))return zero;
 const phase=((beat-phrase.delay)%4+4)%4,wave=Math.sin(phase*Math.PI/2),hit=Math.exp(-phase*5);
 const mirror=phrase.role==='mirror'&&phrase.slot%2?-1:1;
 const finish=phrase.phase==='resolve'?Math.cos(phase*Math.PI/2)*.009:0;
 return {chestX:phrase.measured?phrase.weight*.022:hit*.006,
  chestY:wave*.012*mirror*phrase.gain,chestZ:wave*.012*phrase.flow*phrase.gain,
  armX:phrase.snap*.032+finish,armZ:wave*.018*(.25+phrase.flow)*mirror*phrase.gain,
  headX:phrase.snap*.014};
}
