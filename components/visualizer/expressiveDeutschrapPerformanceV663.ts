/**
 * V663 – Expressive Deutschrap Performance.
 * Micro-coordinates an already VERIFIED V581 word, V645 phrase motif, V574
 * authored eye cue and V582/V618 supported body. Never detects a singer,
 * phoneme, beat, section or emotion. No mouth, pelvis, foot or animation writes.
 * Optional and track-bound; disabled by default to preserve previous shows.
 */
export type DeutschrapPerformanceModeV663='off'|'subtle'|'stage';
export type DeutschrapPerformanceCueV663=Readonly<{
 active:boolean; source:'verified-word'|'none'; section:'verse'|'hook';
 headPitch:number;headYaw:number;eyePitch:number;eyeYaw:number;
 leftShoulderRoll:number;rightShoulderRoll:number;
 leftArmPitch:number;rightArmPitch:number;
}>;
export const DEUTSCHRAP_PERFORMANCE_OFF_V663:DeutschrapPerformanceCueV663=Object.freeze({
 active:false,source:'none',section:'verse',headPitch:0,headYaw:0,eyePitch:0,eyeYaw:0,
 leftShoulderRoll:0,rightShoulderRoll:0,leftArmPitch:0,rightArmPitch:0,
});
const clamp=(v:number,low=0,high=1)=>Number.isFinite(v)?Math.max(low,Math.min(high,v)):low;
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const VALID_MODES:readonly DeutschrapPerformanceModeV663[]=['off','subtle','stage'];
let selection:{trackId:string;mode:DeutschrapPerformanceModeV663}|null=null;
/** In-memory mode, never exported, persisted or inherited by the next song. */
export function setDeutschrapPerformanceModeV663(trackId:string,mode:DeutschrapPerformanceModeV663):boolean{
 if(typeof trackId!=='string'||!trackId.trim()||trackId.length>250||!VALID_MODES.includes(mode))return false;
 selection=mode==='off'?null:{trackId,mode};return true;
}
export function getDeutschrapPerformanceModeV663(trackId:string):DeutschrapPerformanceModeV663{
 return selection?.trackId===trackId?selection.mode:'off';
}
export function clearDeutschrapPerformanceModeV663():void{selection=null;}
/** Light settings shell calls this even while the full settings panel is closed. */
export function clearDeutschrapPerformanceOnTrackChangeV663(trackId:string):void{
 if(selection&&selection.trackId!==trackId)selection=null;
}

/** Conservative, stateless planner. The rig reuses its existing render loop. */
export function planDeutschrapPerformanceV663(input:{
 trackId:string;avatarSlot:number;timeMs:number;playing:boolean;rap:boolean;
 mode:DeutschrapPerformanceModeV663;reducedMotion:boolean;authoredPriority:boolean;
 tier:'low'|'balanced'|'high';section?:string|null;strength:number;energy:number;
 word:{active:boolean;source:'verified-timed-word'|'none';wordStartMs:number;headPitch:number;jawAttackRate:number};
 phrase:{active:boolean;source:'verified-word'|'none';motif:string};
 eye:{mode:'off'|'audience'|'partner';yaw:number;pitch:number;weight:number};
 body:{active:boolean;source:'verified-v581-word'|'none';leftShoulderRoll:number;rightShoulderRoll:number};
 supported:{active:boolean;source:'verified-word-and-ik'|'none';leftArmPitch:number;rightArmPitch:number};
}):DeutschrapPerformanceCueV663{
 const {word,phrase,eye,body,supported}=input;
 if(!VALID_MODES.includes(input.mode)||input.mode==='off'||!input.playing||!input.rap||
    input.reducedMotion||input.authoredPriority||input.tier==='low'||
    !input.trackId||input.trackId.length>250||!Number.isInteger(input.avatarSlot)||
    input.avatarSlot<0||input.avatarSlot>3||!Number.isFinite(input.timeMs)||
    !Number.isFinite(input.strength)||input.strength<=0||input.strength>100||
    !Number.isFinite(input.energy)||input.energy<0||input.energy>1||
    !word?.active||word.source!=='verified-timed-word'||
    !Number.isFinite(word.wordStartMs)||word.wordStartMs<0||
    input.timeMs<word.wordStartMs||input.timeMs>=word.wordStartMs+520||
    !Number.isFinite(word.headPitch)||word.headPitch>=0||word.headPitch<-.02501||
    !Number.isFinite(word.jawAttackRate)||word.jawAttackRate<=1||word.jawAttackRate>1.106||
    !phrase?.active||phrase.source!=='verified-word'||
    !['address','emphasis','exchange','settle'].includes(phrase.motif))
   return DEUTSCHRAP_PERFORMANCE_OFF_V663;
 const phraseMs=input.timeMs-word.wordStartMs;
 const pulse=ease(phraseMs/110)*ease((520-phraseMs)/160);
 const intensity=clamp(-word.headPitch/.025)*clamp((word.jawAttackRate-1)/.105)*
     clamp(input.strength/100)*(.7+.3*input.energy)*pulse*
     (input.mode==='subtle'?.48:.90)*(input.tier==='balanced'?.7:1);
 if(intensity<.00003)return DEUTSCHRAP_PERFORMANCE_OFF_V663;
 const hook=['hook','chorus','drop'].includes((input.section??'').toLowerCase());
 const section=hook?'hook':'verse';
 const gain=intensity*(hook?1.2:.78);
 // A motif remains stable for the existing V645 phrase (~7s), NOT each word.
 const style=phrase.motif==='emphasis'?1:phrase.motif==='exchange'?.8:
     phrase.motif==='address'?.7:.43;
 const side=input.avatarSlot%2?-1:1;
 const hasEye=(eye?.mode==='partner'||eye?.mode==='audience')&&
     Number.isFinite(eye.yaw)&&Number.isFinite(eye.pitch)&&
     Number.isFinite(eye.weight)&&eye.weight>0&&eye.weight<=1;
 const glance=hasEye?gain*eye.weight:0;
 const gazeSide=hasEye&&eye.mode==='partner'?Math.sign(eye.yaw):0;
 // Only an existing V582 chest cue may prompt shoulders. No new locomotion.
 const shoulders=!!body?.active&&body.source==='verified-v581-word'&&
     Number.isFinite(body.leftShoulderRoll)&&Number.isFinite(body.rightShoulderRoll)&&
     Math.abs(body.leftShoulderRoll)<=.00901&&Math.abs(body.rightShoulderRoll)<=.00901;
 // Arms require actual V618 IK-supported stance, never guess foot contact.
 const arms=!!supported?.active&&supported.source==='verified-word-and-ik'&&
     Number.isFinite(supported.leftArmPitch)&&Number.isFinite(supported.rightArmPitch)&&
     supported.leftArmPitch>=0&&supported.leftArmPitch<=.00351&&
     supported.rightArmPitch>=0&&supported.rightArmPitch<=.00351;
 return {active:true,source:'verified-word',section,
  headPitch:clamp(-.0042*style*gain,-.0042,0),
  headYaw:clamp((gazeSide||side*.25)*.0035*glance,-.0035,.0035),
  eyePitch:clamp(-.0018*glance,-.0018,0),
  eyeYaw:clamp(gazeSide*.0026*glance,-.0026,.0026),
  leftShoulderRoll:shoulders?clamp(-side*.0038*style*gain,-.0038,.0038):0,
  rightShoulderRoll:shoulders?clamp(side*.0038*style*gain,-.0038,.0038):0,
  leftArmPitch:arms?clamp((phrase.motif==='exchange'?.25:1)*.0016*gain,0,.0016):0,
  rightArmPitch:arms?clamp((phrase.motif==='exchange'?1:.25)*.0016*gain,0,.0016):0,
 };
}
