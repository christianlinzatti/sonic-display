/**
 * V503 – Intelligent Concert Performance 6.0.
 * Deterministic, low-amplitude body and facial *overlay* for already aligned rap
 * words. The V368/372/374 clock is authoritative; this module detects neither
 * phonemes nor singers or drum hits. It never modifies clips, foot IK, roots,
 * mouth positions, authored animation, or manual facial previews.
 */
import type {FacialPoseV369} from './facialPerformanceV369';
import type {VocalStageCueV371} from './vocalStageExpressionV371';

export type ConcertPerformanceTierV503='low'|'balanced'|'high';
export type ConcertPerformanceSectionV503='verse'|'hook'|'build'|'drop'|'break';
export type ConcertPerformanceV503={
  active:boolean; evidence:'aligned-word'|'none';
  headPitch:number;headTilt:number;chestLean:number;leftArm:number;rightArm:number;
  brow:number;cheek:number;
};
export type ConcertPerformanceInputV503={
  trackId?:string|null;progressMs:number;playing:boolean;reducedMotion:boolean;
  enabled:boolean;bodyEnabled:boolean;gesturesEnabled:boolean;faceEnabled:boolean;
  manualBodyPriority:boolean;manualFacePriority:boolean;
  genre?:string|null;section?:string|null;slot:number;tier:ConcertPerformanceTierV503;
  /** V372 verified word confidence, NOT estimated line-time confidence. */
  wordVerified:boolean;rap:boolean;focus:number;rapidWord:boolean;
  /** Existing optional V385/V496 cast; absence is not singer recognition. */
  assignedSingers?:readonly number[];beat:number;energy:number;
};
const unit=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const round=(n:number)=>Math.round(n*100000)/100000;
const silent=():ConcertPerformanceV503=>({active:false,evidence:'none',headPitch:0,headTilt:0,chestLean:0,leftArm:0,rightArm:0,brow:0,cheek:0});
/** All outputs are absolute targets (not integrated offsets), so seeks/replays
 * cannot build up drift. The long, smooth phrase sway avoids one gesture per
 * rapid lyric syllable and backs off during instrumental breaks.
 */
export function planIntelligentConcertPerformanceV503(input:ConcertPerformanceInputV503):ConcertPerformanceV503{
  if(!input.trackId||!input.playing||!input.enabled||input.reducedMotion||
    !input.wordVerified||!input.rap||!Number.isFinite(input.progressMs)||input.progressMs<0||
    !Number.isInteger(input.slot)||input.slot<0||input.slot>7||
    (!input.bodyEnabled&&!input.faceEnabled)||
    (input.manualBodyPriority&&input.manualFacePriority)||
    (input.assignedSingers?.length&&!input.assignedSingers.includes(input.slot)))return silent();
  const genre=(input.genre??'').toLowerCase();
  if(!/rap|hip.?hop|trap|drill|grime|boom.?bap/.test(genre))return silent();
  const section:ConcertPerformanceSectionV503=
    input.section==='hook'||input.section==='build'||input.section==='drop'||input.section==='break'
      ?input.section:'verse';
  if(section==='break')return silent();
  const tier=input.tier==='low'?.25:input.tier==='balanced'?.64:1;
  const sectionGain=section==='hook'?1:section==='drop'?.88:section==='build'?.70:.72;
  // Only a small amount of the existing, *possibly estimated* energy is used.
  const energy=.77+.15*unit(input.energy)+.08*unit(input.beat);
  const rapid=input.rapidWord?.44:1; // short rap tokens: NO machine-gun head/arms
  const strength=unit(input.focus)*sectionGain*energy*tier*rapid;
  if(strength<=0)return silent();
  const phase=2*Math.PI*((input.progressMs%1980)/1980+input.slot*.13);
  const sway=Math.sin(phase),counter=Math.sin(phase+Math.PI/2);
  const body=input.bodyEnabled&&!input.manualBodyPriority;
  const arms=body&&input.gesturesEnabled;
  const face=input.faceEnabled&&!input.manualFacePriority;
  const side=input.slot%2===0?1:-1;
  return {active:true,evidence:'aligned-word',
    headPitch:body?round(clamp(-.014*strength*(.62+.38*counter),-.015,.015)):0,
    headTilt:body?round(clamp(side*.010*strength*sway,-.011,.011)):0,
    chestLean:body?round(clamp(-.013*strength*sway,-.014,.014)):0,
    leftArm:arms?round(clamp(-side*.026*strength*(.5+.5*counter),-.028,.028)):0,
    rightArm:arms?round(clamp(side*.026*strength*(.5-.5*counter),-.028,.028)):0,
    brow:face?round(clamp(.045*strength*(.75+.25*counter),0,.045)):0,
    cheek:face?round(clamp(.032*strength*(.75+.25*sway),0,.032)):0};
}
/** V371 already blends overlays; V503 may not change voice, eyes or mouth. */
export function composeConcertStageV503<T extends VocalStageCueV371>(
  base:T,plan:ConcertPerformanceV503,
):T{
  if(!plan.active)return base;
  return {...base,
    headPitch:clamp(base.headPitch+plan.headPitch,-.18,.18),
    headTilt:clamp(base.headTilt+plan.headTilt,-.12,.12),
    chestLean:clamp(base.chestLean+plan.chestLean,-.12,.12),
    leftArm:clamp(base.leftArm+plan.leftArm,-.25,.25),
    rightArm:clamp(base.rightArm+plan.rightArm,-.25,.25)};
}
/** Preserve all nine original channels except optional subtle brow/cheek.
 * In particular bilabial B/P/M closure, jaw, lips and blink are untouched.
 */
export function composeConcertFaceV503<T extends {face:FacialPoseV369}>(
  base:T,plan:ConcertPerformanceV503,
):T{
  if(!plan.active||(!plan.brow&&!plan.cheek))return base;
  return {...base,face:{...base.face,
    brow:unit(base.face.brow+plan.brow),
    cheek:unit(base.face.cheek+plan.cheek)}};
}
