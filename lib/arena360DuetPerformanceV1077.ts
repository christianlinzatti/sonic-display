/** V1077 – Duet Performance 3.0.
 * Optional upper-body interplay for an already user-assigned, track-bound
 * singer cast AND a previously approved word-timed V1023 rap gesture.
 * Cannot allocate singer roles, start clips, edit lips/IK or invent new vocals.
 */
import type {RapGestureV1062,RapPhrasingInputV1062} from './advancedRapPerformanceV1062';

export type DuetModeV1077='duet'|'reply'|'hook'|'handoff';
export type DuetCastV1077={
 active:boolean;lineIndex:number;singingSlots:readonly number[];
 leadSlot:number;count:number;startMs:number;endMs:number;
 handoffFrom:number|null;phase:number;source?:string;
 style?:'solo'|'reply'|'duet'|'hook'|null;
 role?:'lead'|'feature'|'hook'|null;
 partnerSlot?:number|null;emphasis?:number;
};
export type DuetInputV1077=RapPhrasingInputV1062 & {
 slot:number;count:number;casting?:DuetCastV1077|null;
};
const valid=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
const clamp=(value:number,low:number,high:number)=>Math.max(low,Math.min(high,value));
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};

/** All changes stay inside the existing V515 smoothed, additive upper-body cue. */
export function refineDuetPerformanceV1077<T extends RapGestureV1062>(base:T,input:DuetInputV1077):T{
 const cast=input.casting;
 if(!input.enabled||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !valid(input.strength)||input.strength<=0||input.strength>80||
    !input.trackId?.trim()||!input.lyrics?.synced||
    !valid(input.effectiveTimeMs)||input.effectiveTimeMs<0||
    !Number.isInteger(input.count)||input.count<2||input.count>4||
    !Number.isInteger(input.slot)||input.slot<0||input.slot>=input.count||
    !cast?.active||cast.count!==input.count||!Number.isInteger(cast.lineIndex)||cast.lineIndex<0||
    !Number.isInteger(cast.leadSlot)||cast.leadSlot<0||cast.leadSlot>=input.count||
    !Array.isArray(cast.singingSlots)||cast.singingSlots.length===0||cast.singingSlots.length>input.count||
    !cast.singingSlots.every(slot=>Number.isInteger(slot)&&slot>=0&&slot<input.count)||
    new Set(cast.singingSlots).size!==cast.singingSlots.length||
    !cast.singingSlots.includes(input.slot)||
    !valid(cast.startMs)||!valid(cast.endMs)||cast.startMs<0||
    cast.endMs<=cast.startMs||cast.endMs-cast.startMs>15000||
    input.effectiveTimeMs<cast.startMs||input.effectiveTimeMs>=cast.endMs||
    !valid(cast.phase)||cast.phase<0||cast.phase>1||
    (cast.handoffFrom!==null&&(!Number.isInteger(cast.handoffFrom)||cast.handoffFrom<0||cast.handoffFrom>=input.count))||
    (cast.partnerSlot!=null&&(!Number.isInteger(cast.partnerSlot)||cast.partnerSlot<0||cast.partnerSlot>=input.count||cast.partnerSlot===cast.leadSlot))||
    (cast.emphasis!==undefined&&(!valid(cast.emphasis)||cast.emphasis<0||cast.emphasis>1))||
    !base.active||base.evidence!=='timed-word'||!base.accent.active||
    base.accent.source!=='word'||base.accent.confidence!=='lyrics-word'||
    !Number.isInteger(base.accent.lineIndex)||base.accent.lineIndex!==cast.lineIndex||
    !Number.isInteger(base.accent.wordIndex)||base.accent.wordIndex<0||base.accent.wordIndex>=120||
    !valid(base.accent.head)||base.accent.head<0||base.accent.head>.055||
    !valid(base.accent.chest)||base.accent.chest<0||base.accent.chest>.09||
    !valid(base.accent.arms)||base.accent.arms<0||base.accent.arms>.11)return base;

 // A solo assignment cannot acquire a partner by switching on V1077.
 let mode:DuetModeV1077;
 if(cast.style==='duet'&&cast.singingSlots.length>=2)mode='duet';
 else if(cast.style==='hook'||cast.role==='hook'){
  if(cast.singingSlots.length<2)return base;
  mode='hook';
 }else if(cast.style==='reply'&&cast.partnerSlot!=null)mode='reply';
 else if(cast.handoffFrom!==null&&cast.handoffFrom!==input.slot)mode='handoff';
 else return base;
 if(mode==='reply'&&cast.singingSlots.length!==1)return base;
 if(mode==='duet'&&cast.partnerSlot==null)return base;

 const line=input.lyrics.lines[base.accent.lineIndex];
 const words=line?.words;
 const word=words?.[base.accent.wordIndex];
 const next=words?.[base.accent.wordIndex+1];
 if(!valid(line?.startMs)||!word?.text?.trim()||!valid(word.startMs)||word.startMs<line.startMs)return base;
 const wordEnd=Math.min(
   valid(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,
   valid(next?.startMs)&&next.startMs>word.startMs?next.startMs:Infinity,
   valid(line.endMs)&&line.endMs>word.startMs?line.endMs:Infinity,
   cast.endMs,word.startMs+1300);
 const duration=wordEnd-word.startMs;
 if(!valid(wordEnd)||duration<80||duration>1300||
    input.effectiveTimeMs<word.startMs||input.effectiveTimeMs>=wordEnd)return base;
 // Keep transitions on actual user-supplied word boundaries, without a new clock.
 const t=(input.effectiveTimeMs-word.startMs)/duration;
 const envelope=smooth(t/.25)*smooth((1-t)/.28);
 const strength=clamp(input.strength/80,0,1)*
   (input.tier==='balanced'?.65:1)*(cast.emphasis??.75)*envelope;
 if(strength<=0)return base;
 const handoff=smooth(cast.phase);
 // Alternating lead/partner emphasis adds conversation, not identical dancing.
 const isLead=input.slot===cast.leadSlot;
 const alternating=((base.accent.wordIndex+base.accent.lineIndex)%2===0);
 const weight=mode==='duet'?strength*(isLead?.9:.75)*(.88+(alternating?.12:0)):
   mode==='hook'?strength*(input.slot%2===0?.82:.72):
   mode==='reply'?strength*(isLead?1:.74)*(.5+.5*handoff):
   strength*(.5+.5*handoff);
 const profile=mode==='duet'?{head:.065,chest:.065,arms:isLead?.07:-.045}:
   mode==='hook'?{head:.065,chest:.08,arms:.085}:
   {head:.095,chest:.07,arms:.055};
 const a=base.accent;
 // Never overwrite explicit performer roles, cast, timing, or authored animations.
 // The side channel selects existing left/right arm emphasis, not a new gesture.
 const oldSide=(a as typeof a & {side?:number}).side;
 const otherSlot=input.slot===cast.leadSlot?cast.partnerSlot:cast.leadSlot;
 const inward=otherSlot!=null&&otherSlot!==input.slot?
   (input.slot<otherSlot?1:-1):null;
 const side=valid(oldSide)&&Math.abs(oldSide)<=1&&inward!==null&&mode!=='hook'?
   clamp(oldSide*(1-.12*weight)+inward*.12*weight,-1,1):oldSide;
 return {...base,accent:{...a,
  head:clamp(a.head*(1+profile.head*weight),0,.055),
  chest:clamp(a.chest*(1+profile.chest*weight),0,.09),
  arms:clamp(a.arms*(1+profile.arms*weight),0,.11),
  ...(side===undefined?{}:{side}),
 }} as T;
}
