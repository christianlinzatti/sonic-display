/**
 * V510 – Expressive Rap Performance 7.0.
 * Word-confirmed, stateless performance accents for GLB bodies, procedural bodies
 * and facial rigs. NEVER identifies vocalists, extrapolates timestamps, synthesizes
 * phonemes, mutates clips, replaces lip/jaw closure or changes partner gaze/IK.
 * The V372/V415 effective lyric clock is authoritative.
 */
import type {Lyrics} from '@/types/music';
import {rapLipWordAtV415} from './rapLipPrecisionV415';
import type {FacialPoseV369} from './facialPerformanceV369';
import type {VocalStageCueV371} from './vocalStageExpressionV371';
export type RapExpressionTierV510='low'|'balanced'|'high';
export type RapExpressionV510={
  active:boolean; evidence:'timed-word'|'none';
  headPitch:number; headTilt:number; chestLean:number;
  leftArm:number; rightArm:number;
  brow:number; cheek:number; squint:number;
};
export type RapExpressionInputV510={
  trackId?:string|null;lyrics:Lyrics|null|undefined;
  progressMs:number;effectiveTimeMs:number;
  playing:boolean;enabled:boolean;reducedMotion:boolean;
  genre?:string|null;section?:string|null;slot:number;castCount:number;tier:RapExpressionTierV510;
  verifiedWord:boolean;rap:boolean;activeWord?:string|null;
  rapid:boolean;joinedWords:boolean;focus:number;
  bodyEnabled:boolean;faceEnabled:boolean;gesturesEnabled:boolean;
  manualBodyPriority:boolean;manualFacePriority:boolean;
  /** Optional *same-track, authored* V385/V416 singer evidence only. */
  assignedSingers?:readonly number[];
  /** When matching V496 vocal-time segments are authored, require current slot's segment. */
  authoredRoleAllowed?:boolean;
};
const limit=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const unit=(n:number)=>limit(n,0,1);
const smooth=(n:number)=>{const x=unit(n);return x*x*(3-2*x);};
const round=(n:number)=>Math.round(n*100000)/100000;
const clean=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const quiet=():RapExpressionV510=>({active:false,evidence:'none',headPitch:0,headTilt:0,chestLean:0,leftArm:0,rightArm:0,brow:0,cheek:0,squint:0});
/** Source word must match the already verified V372 word. No line-only guesses. */
export function planExpressiveRapV510(input:RapExpressionInputV510):RapExpressionV510{
  if(!input.trackId||!input.playing||!input.enabled||input.reducedMotion||
    !input.verifiedWord||!input.rap||!input.lyrics?.synced||
    !Number.isFinite(input.progressMs)||input.progressMs<0||
    !Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
    !Number.isInteger(input.castCount)||input.castCount<1||input.castCount>4||
    !Number.isInteger(input.slot)||input.slot<0||input.slot>=input.castCount||
    (!input.bodyEnabled&&!input.faceEnabled)||
    (input.manualBodyPriority&&input.manualFacePriority)||
    input.authoredRoleAllowed===false||
    (input.assignedSingers?.length&&!input.assignedSingers.includes(input.slot))||
    (input.castCount>1 && input.authoredRoleAllowed!==true &&
      !input.assignedSingers?.includes(input.slot))||
    !/rap|hip.?hop|trap|drill|grime|boom.?bap/.test((input.genre??'').toLowerCase())||
    input.section==='break')return quiet();
  const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
  if(!mark||!input.activeWord||clean(mark.word.text)!==clean(input.activeWord))return quiet();
  const duration=mark.end-mark.start;
  if(duration<=0||!Number.isFinite(duration))return quiet();
  // Long phrase rhythm (2.24s), not a twitch for every short rap syllable.
  // Verified marker still gates every frame; no accented movement in gaps.
  const entrance=smooth((input.effectiveTimeMs-mark.start)/Math.min(90,Math.max(24,duration*.25)));
  const release=smooth((mark.end-input.effectiveTimeMs)/Math.min(100,Math.max(26,duration*.30)));
  const envelope=entrance*release;
  const phrasePhase=(input.progressMs%2240)/2240*Math.PI*2+input.slot*.27;
  const wave=Math.sin(phrasePhase),counter=Math.cos(phrasePhase);
  const tier=input.tier==='low'?.24:input.tier==='balanced'?.60:1;
  const section=input.section==='hook'?1:input.section==='drop'?.85:input.section==='build'?.62:.72;
  const rapid=input.rapid?.42:1;
  const joined=input.joinedWords?.88:1;
  const amount=unit(input.focus)*envelope*tier*section*rapid*joined;
  if(amount<=0)return quiet();
  const body=input.bodyEnabled&&!input.manualBodyPriority;
  const arms=body&&input.gesturesEnabled;
  const face=input.faceEnabled&&!input.manualFacePriority;
  const side=input.slot%2===0?1:-1;
  return {active:true,evidence:'timed-word',
    headPitch:body?round(limit(-.017*amount*(.78+.22*counter),-.018,.018)):0,
    headTilt:body?round(limit(side*.011*amount*wave,-.012,.012)):0,
    chestLean:body?round(limit(-.011*amount*wave,-.012,.012)):0,
    leftArm:arms?round(limit(-side*.019*amount*(.5+.5*counter),-.020,.020)):0,
    rightArm:arms?round(limit(side*.019*amount*(.5-.5*counter),-.020,.020)):0,
    brow:face?round(limit(.038*amount*(.78+.22*counter),0,.038)):0,
    cheek:face?round(limit(.027*amount*(.70+.30*wave),0,.027)):0,
    squint:face?round(limit(.013*amount*(.8+.2*counter),0,.013)):0};
}
/** Stage may only gain safe body accents. No head yaw, eyes, roots or clips. */
export function composeExpressiveRapStageV510<T extends VocalStageCueV371>(base:T,p:RapExpressionV510):T{
  if(!p.active)return base;
  return {...base,
    headPitch:limit(base.headPitch+p.headPitch,-.18,.18),
    headTilt:limit(base.headTilt+p.headTilt,-.12,.12),
    chestLean:limit(base.chestLean+p.chestLean,-.12,.12),
    leftArm:limit(base.leftArm+p.leftArm,-.25,.25),
    rightArm:limit(base.rightArm+p.rightArm,-.25,.25)};
}
/** Only expression morphs change: never lipsClosed, jaw, wide, round, blink or smile. */
export function composeExpressiveRapFaceV510<T extends {face:FacialPoseV369}>(base:T,p:RapExpressionV510):T{
  if(!p.active||(!p.brow&&!p.cheek&&!p.squint))return base;
  return {...base,face:{...base.face,brow:unit(base.face.brow+p.brow),
    cheek:unit(base.face.cheek+p.cheek),squint:unit(base.face.squint+p.squint)}};
}
