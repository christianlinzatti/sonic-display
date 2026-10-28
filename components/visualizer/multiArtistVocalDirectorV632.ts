/**
 * V632: track-bound, user-edited vocalist roles for two to four performers.
 * No automatic singer recognition. The recorded song is not separated into stems.
 * Pure and seek-safe. Reuses an existing V385/V416/V496 cue; no render loop.
 */
export type AuthoredVocalSceneV632=Readonly<{
 active:boolean;leadSlot:number;singingSlots:readonly number[];handoffFrom:number|null;
 phase:number;startMs:number;endMs:number;count:number;
}>;
export type VocalDirectorSlotV632='lead'|'duet'|'backing'|'listener';
export type VocalDirectorV632=Readonly<{
 active:boolean;trackId:string;count:number;leadSlot:number;singingSlots:readonly number[];
 role:readonly VocalDirectorSlotV632[];mouthGains:readonly number[];
 scene:'solo'|'duet'|'hook'|'adlib'|'reply'|'manual';
 handoffFrom:number|null;phase:number;startMs:number;endMs:number;
}>;
const off=():VocalDirectorV632=>({active:false,trackId:'',count:0,leadSlot:-1,
 singingSlots:[],role:[],mouthGains:[],scene:'manual',handoffFrom:null,phase:1,startMs:0,endMs:0});
const clamp=(x:number)=>Number.isFinite(x)?Math.max(0,Math.min(1,x)):0;
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
/** Editorial cue with explicit source identification. Neither artist names nor lyrics
 * are sufficient to authorize an assigned singer. */
export function planMultiArtistVocalV632(input:{
 trackId:string;cueTrackId:string;timeMs:number;playing:boolean;enabled:boolean;
 reducedMotion?:boolean;manualStage?:boolean;count:number;cue:AuthoredVocalSceneV632|null|undefined;
 /** V416 style or V496 base style; adlib=true only for explicit extra singer slots. */
 scene?:'solo'|'duet'|'hook'|'adlib'|'reply'|'manual';
}):VocalDirectorV632{
 const cue=input.cue,n=input.count,t=input.timeMs;
 if(!cue?.active||!input.enabled||!input.playing||input.manualStage||
    !input.trackId||input.trackId!==input.cueTrackId||
    !Number.isInteger(n)||n<2||n>4||cue.count!==n||
    !Number.isFinite(t)||t<0||!Number.isSafeInteger(cue.startMs)||
    !Number.isSafeInteger(cue.endMs)||cue.startMs<0||cue.endMs<=cue.startMs||
    t<cue.startMs||t>=cue.endMs||!Number.isInteger(cue.leadSlot)||
    cue.leadSlot<0||cue.leadSlot>=n||!Array.isArray(cue.singingSlots)||
    !cue.singingSlots.length||cue.singingSlots.length>n||
    !cue.singingSlots.every(i=>Number.isInteger(i)&&i>=0&&i<n)||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||
    !cue.singingSlots.includes(cue.leadSlot))return off();
 const scene=input.scene??'manual';
 if(!['solo','duet','hook','adlib','reply','manual'].includes(scene))return off();
 // Never reuse a stale outgoing role on a seek or a different song.
 const handoff=Number.isInteger(cue.handoffFrom)&&cue.handoffFrom!==cue.leadSlot&&
   (cue.handoffFrom as number)>=0&&(cue.handoffFrom as number)<n&&t-cue.startMs<900?cue.handoffFrom:null;
 const phase=handoff===null?1:clamp(cue.phase);
 const roles:VocalDirectorSlotV632[]=Array.from({length:n},(_,slot)=>
   !cue.singingSlots.includes(slot)?'listener':slot===cue.leadSlot?'lead':
   scene==='adlib'?'backing':'duet');
 const mouthGains=roles.map((r)=>{
   if(r==='listener')return 0;
   if(r==='backing')return .62;
   if(r==='duet')return scene==='hook'?.82:.87;
   // Do not silence a real word onset: handoff softening is capped at 8%.
   return handoff!==null&&!input.reducedMotion ? .92+.08*smooth(phase) : 1;
 });
 return {active:true,trackId:input.trackId,count:n,leadSlot:cue.leadSlot,
  singingSlots:[...cue.singingSlots],role:roles,mouthGains,scene,
  handoffFrom:input.reducedMotion?null:handoff,phase,startMs:cue.startMs,endMs:cue.endMs};
}
/** Only V632-owned automatic jaw/open/round targets. Existing authored GLB
 * clips/morph targets, B/P/M seals, manual syllables and audio-mouth sources win.
 * For non-vocal artists: remove automatic mouth movement, not their dance clips. */
export function multiArtistMouthTargetV632(plan:VocalDirectorV632|null|undefined,
 slot:number,channel:string,target:number,protectedSource=false):number{
 if(protectedSource||!plan?.active||!Number.isInteger(slot)||slot<0||slot>=plan.count||
    (channel!=='jaw'&&channel!=='wide'&&channel!=='round')||
    !Number.isFinite(target)||target<0||target>1)return target;
 return target*plan.mouthGains[slot];
}
