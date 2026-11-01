/** V797 – Multi-Vocal Spotlight Director.
 * A single non-authoring plan from V528's already VERIFIED, song-bound vocal cast.
 * Does not infer a singer from feature credits, lyrics content, genre or audio.
 * Existing V517 avatar motion / V528 camera / V557 lights remain the owners.
 */
export type VocalSceneEvidenceV797 = Readonly<{
 active:boolean;trackId:string;cueStartMs:number;cueEndMs:number;
 count:number;focus:'none'|'lead'|'handoff'|'ensemble'|'drop';
 leadSlot:number;singingSlots:readonly number[];handoffFrom:number|null;strength:number;
}>;
export type MultiVocalModeV797='off'|'solo'|'handoff'|'duet'|'ensemble';
export type MultiVocalSpotlightCueV797=Readonly<{
 active:boolean;trackId:string;mode:MultiVocalModeV797;
 leadSlot:number;partnerSlot:number|null;activeSlots:readonly number[];
 intensity:number;cameraWeight:number;keyGain:number;fillGain:number;
 lightingActive:boolean;cameraActive:boolean;
}>;
export const VOCAL_SPOTLIGHT_OFF_V797:MultiVocalSpotlightCueV797=Object.freeze({
 active:false,trackId:'',mode:'off',leadSlot:-1,partnerSlot:null,
 activeSlots:[],intensity:0,cameraWeight:0,keyGain:1,fillGain:1,
 lightingActive:false,cameraActive:false,
});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const r=(n:number)=>Math.round(n*100000)/100000;
/** All speaker slots must be individually validated for the current visible cast. */
export function planMultiVocalSpotlightV797(input:{
 scene:VocalSceneEvidenceV797|null|undefined;
 trackId:string;progressMs:number;playing:boolean;enabled:boolean;
 count:number;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 lyricsProtected:boolean;manualCamera:boolean;manualLighting:boolean;
}):MultiVocalSpotlightCueV797{
 const s=input.scene,now=input.progressMs;
 if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    !s?.active||!input.trackId||input.trackId.length>180||s.trackId!==input.trackId||
    !Number.isInteger(input.count)||input.count<2||input.count>4||s.count!==input.count||
    !finite(now)||!finite(s.cueStartMs)||!finite(s.cueEndMs)||
    s.cueStartMs<0||s.cueEndMs<=s.cueStartMs||now<s.cueStartMs||now>=s.cueEndMs||
    !finite(s.strength)||s.strength<=0||s.strength>.8||
    !Number.isInteger(s.leadSlot)||s.leadSlot<0||s.leadSlot>=s.count||
    !Array.isArray(s.singingSlots)||!s.singingSlots.length||s.singingSlots.length>s.count||
    s.singingSlots.some(n=>!Number.isInteger(n)||n<0||n>=s.count)||
    new Set(s.singingSlots).size!==s.singingSlots.length||!s.singingSlots.includes(s.leadSlot)||
    s.handoffFrom!==null&&(!Number.isInteger(s.handoffFrom)||s.handoffFrom<0||
      s.handoffFrom>=s.count||s.handoffFrom===s.leadSlot)||
    !['lead','handoff','ensemble'].includes(s.focus))return VOCAL_SPOTLIGHT_OFF_V797;
 const ensemble=s.focus==='ensemble'&&s.singingSlots.length>2;
 const handoff=s.focus==='handoff'&&s.handoffFrom!==null;
 const duet=!ensemble&&!handoff&&s.singingSlots.length===2;
 const mode:MultiVocalModeV797=ensemble?'ensemble':handoff?'handoff':duet?'duet':'solo';
 const partner=handoff?s.handoffFrom:duet?s.singingSlots.find(n=>n!==s.leadSlot)??null:null;
 const activeSlots=mode==='ensemble'?[...s.singingSlots]:partner!==null?[s.leadSlot,partner]:[s.leadSlot];
 // V528 has already smoothed boundaries. Do not brighten again with a kick envelope.
 const intensity=r(clamp(s.strength*(input.tier==='balanced'?.65:1),0,.8));
 const cameraActive=!input.manualCamera&&intensity>0&&!input.lyricsProtected;
 const lightingActive=!input.manualLighting&&intensity>0;
 // Deliberately small: these multiply existing key/fill only; never override floor/beam/blackout.
 const keyGain=lightingActive?r(clamp(1+intensity*(mode==='solo'?.025:.018),1,1.02)):1;
 const fillGain=lightingActive?r(clamp(1+intensity*(mode==='duet'||mode==='ensemble'?.05:.027),1,1.04)):1;
 return {active:true,trackId:s.trackId,mode,leadSlot:s.leadSlot,partnerSlot:partner,
  activeSlots,intensity,cameraWeight:cameraActive?r(intensity*.32):0,
  keyGain,fillGain,cameraActive,lightingActive};
}
/** Framing finish: never invent world-space performer anchors, no camera cuts.
 * The existing V528/V540 camera has already done the main performer tracking.
 * Missing/invisible anchors or a protected camera mean the pose stays unchanged.
 */
export function composeMultiVocalSpotlightCameraV797<T extends {z:number;fov:number}>(
 pose:T,cue:MultiVocalSpotlightCueV797|undefined,
 anchors:readonly {slot:number;visible:boolean;x:number;y:number;z:number}[],
 options:{automatic:boolean;authored:boolean;lyricsProtected:boolean;reducedMotion:boolean}
):T{
 if(!cue?.cameraActive||!options.automatic||options.authored||options.lyricsProtected||
    options.reducedMotion||!finite(pose.z)||!finite(pose.fov)||!Array.isArray(anchors)||
    cue.activeSlots.some(slot=>!anchors.some(a=>a.slot===slot&&a.visible&&
      finite(a.x)&&finite(a.y)&&finite(a.z))))return pose;
 const w=clamp(cue.cameraWeight,0,.256);
 const wide=cue.mode==='duet'||cue.mode==='ensemble'||cue.mode==='handoff';
 return {...pose,z:Math.max(2.5,pose.z+(wide?.10:-.025)*w),
   fov:clamp(pose.fov+(wide?.65:-.15)*w,30,72)};
}
