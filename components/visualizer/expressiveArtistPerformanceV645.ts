/**
 * V645 — small, evidence-bound performer micro-expressions.
 *
 * Not emotion, voice, phoneme or singer recognition. The V581 word/cast cue and
 * V574 authored eye contact are the ONLY sources. No new dance animations,
 * timers, bones, resources, effects or render loop. V618 owns safe arm motion.
 * The output is additive to EXISTING rig overlays; never owns mouth or blinks.
 */
type VerifiedWordV645={active:boolean;source:'verified-timed-word'|'none';wordStartMs:number;headPitch:number;jawAttackRate:number};
type AuthoredEyeV645={mode:'off'|'partner'|'audience';yaw:number;pitch:number;weight:number};
type SupportedUpperBodyV645={active:boolean;source:'verified-word-and-ik'|'none';leftArmPitch:number;rightArmPitch:number};

export type ArtistMotifV645='none'|'address'|'emphasis'|'exchange'|'settle';
export type ExpressiveArtistCueV645=Readonly<{
 active:boolean;source:'verified-word'|'none';motif:ArtistMotifV645;
 brow:number;cheek:number;squint:number;
 headPitch:number;headYaw:number;eyePitch:number;eyeYaw:number;
 leftArmPitch:number;rightArmPitch:number;
}>;
export const EXPRESSIVE_ARTIST_OFF_V645:ExpressiveArtistCueV645=Object.freeze({
 active:false,source:'none',motif:'none',brow:0,cheek:0,squint:0,
 headPitch:0,headYaw:0,eyePitch:0,eyeYaw:0,leftArmPitch:0,rightArmPitch:0,
});
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?(n===0?0:Math.max(lo,Math.min(hi,n))):lo;
function seed(trackId:string):number{
 let h=2166136261;
 for(let i=0;i<Math.min(120,trackId.length);i++)h=Math.imul(h^trackId.charCodeAt(i),16777619);
 return h>>>0;
}
const MOTIFS:readonly Exclude<ArtistMotifV645,'none'>[]=['address','emphasis','exchange','settle'];
/** Phrase motif is held over ~7s segments, not switched at every word/frame. */
export function artistMotifV645(trackId:string,wordStartMs:number,slot:number):ArtistMotifV645{
 if(typeof trackId!=='string'||!trackId.trim()||trackId.length>250||!Number.isFinite(wordStartMs)||wordStartMs<0||
    !Number.isInteger(slot)||slot<0||slot>3)return 'none';
 return MOTIFS[(seed(trackId)+Math.floor(wordStartMs/7000)+slot)%MOTIFS.length];
}

export function planExpressiveArtistV645(input:{
 trackId:string;avatarSlot:number;effectiveTimeMs:number;
 playing:boolean;reducedMotion:boolean;authoredPriority:boolean;
 tier:'low'|'balanced'|'high';strength:number;energy:number;
 word:VerifiedWordV645;eye:AuthoredEyeV645;body:SupportedUpperBodyV645;
}):ExpressiveArtistCueV645{
 const w=input.word;
 // The pre-validated V581 cue already requires verified WORD + appropriate singer.
 // Never turn an ambiguous Spotify artist credit or unsynced line into a cue.
 if(!w?.active||w.source!=='verified-timed-word'||!input.playing||input.reducedMotion||
    input.authoredPriority||input.tier==='low'||!Number.isFinite(input.effectiveTimeMs)||
    !Number.isFinite(w.wordStartMs)||w.wordStartMs<0||
    input.effectiveTimeMs<w.wordStartMs||input.effectiveTimeMs>=w.wordStartMs+520||
    !Number.isFinite(w.headPitch)||w.headPitch>=0||w.headPitch<-.02501||
    !Number.isFinite(w.jawAttackRate)||w.jawAttackRate<=1||w.jawAttackRate>1.106||
    !Number.isFinite(input.strength)||input.strength<=0||input.strength>100||
    !Number.isFinite(input.energy)||input.energy<0||input.energy>1)return EXPRESSIVE_ARTIST_OFF_V645;
 const motif=artistMotifV645(input.trackId,w.wordStartMs,input.avatarSlot);
 if(motif==='none')return EXPRESSIVE_ARTIST_OFF_V645;
 const gain=clamp(-w.headPitch/.025,0,1)*clamp((w.jawAttackRate-1)/.105,0,1)*
    clamp(input.strength/100,0,1)*(.7+.3*input.energy)*
    (input.tier==='balanced'?.55:1);
 if(gain<.00005)return EXPRESSIVE_ARTIST_OFF_V645;
 const facing=input.avatarSlot%2?-1:1;
 const style=motif==='emphasis'?1:motif==='address'?.8:motif==='exchange'?.7:.5;
 // Eye movements need the existing, manually authored V574 cue. When no eye
 // bones exist these outputs simply have nowhere to render.
 const verifiedEyes=(input.eye?.mode==='partner'||input.eye?.mode==='audience')&&
    Number.isFinite(input.eye.yaw)&&Number.isFinite(input.eye.pitch)&&
    Number.isFinite(input.eye.weight)&&input.eye.weight>0&&input.eye.weight<=1;
 const gazeGain=verifiedEyes?gain*input.eye.weight:0;
 const gazeSide=verifiedEyes&&input.eye?.mode==='partner'?Math.sign(input.eye.yaw):0;
 // Arm motion only if V618 has already confirmed V492 foot contact. No new IK.
 const supported=input.body?.active&&input.body.source==='verified-word-and-ik'&&
    Number.isFinite(input.body.leftArmPitch)&&Number.isFinite(input.body.rightArmPitch)&&
    input.body.leftArmPitch>=0&&input.body.leftArmPitch<=.00351&&
    input.body.rightArmPitch>=0&&input.body.rightArmPitch<=.00351;
 const armGain=supported?gain*style:0;
 return {active:true,source:'verified-word',motif,
  brow:clamp((motif==='emphasis'?.014:.008)*gain,0,.014),
  cheek:clamp((motif==='address'?.012:.007)*gain,0,.012),
  squint:clamp((motif==='exchange'?.008:.004)*gain,0,.008),
  headPitch:clamp(-.006*style*gain,-.006,0),
  headYaw:clamp((gazeSide||facing*.35)*.004*gazeGain,-.004,.004),
  eyePitch:clamp(-.002*gazeGain,-.002,0),
  eyeYaw:clamp(gazeSide*.003*gazeGain,-.003,.003),
  leftArmPitch:clamp(armGain*(motif==='exchange'?.35:1)*.0018,0,.0018),
  rightArmPitch:clamp(armGain*(motif==='exchange'?1:.35)*.0018,0,.0018),
 };
}

/** Add only non-mouth expression channels; do not touch lip seal or blink. */
export function addExpressiveArtistFaceV645<T extends {face:{brow:number;cheek:number;squint:number}}>(
 frame:T,cue:ExpressiveArtistCueV645):T{
 if(!cue.active)return frame;
 return {...frame,face:{...frame.face,
  brow:clamp(frame.face.brow+cue.brow,0,1),
  cheek:clamp(frame.face.cheek+cue.cheek,0,1),
  squint:clamp(frame.face.squint+cue.squint,0,1),
 }};
}
