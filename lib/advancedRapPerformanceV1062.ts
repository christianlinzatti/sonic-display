/** V1062 – Advanced Rap Performance 7.0.
 * Additive phrasing of existing verified word gestures and vocal facial cues.
 * Never infers speakers, words, visemes, gestures, or a new clock from audio.
 */
type RapEvidenceV1062={synced:boolean;lines:readonly {startMs:number;endMs?:number|null;words?:readonly {text:string;startMs:number;endMs?:number|null}[]}[]};
export type RapMouthEvidenceV1062={active:boolean;source:string;wordStartMs:number;wordEndMs:number;onset:number;release:number};
export type RapMouthContextV1062={playing:boolean;rap:boolean;verifiedSinger:boolean;manualPriority:boolean;protectedMouth:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';effectiveTimeMs:number};
export type RapGestureV1062={active:boolean;evidence:string;accent:{active:boolean;source:string;confidence:string;lineIndex:number;wordIndex:number;head:number;chest:number;arms:number}};

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export type RapPhrasingInputV1062={
 enabled:boolean;strength:number;trackId?:string|null;
 lyrics?:RapEvidenceV1062|null;effectiveTimeMs:number;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 tier:'low'|'balanced'|'high';section?:string|null;
};
/** V1023 already checked word timing, lyrics sync, singer casting and no manual override. */
export function refineRapGestureV1062<T extends RapGestureV1062>(base:T,p:RapPhrasingInputV1062):T{
 if(!base.active||base.evidence!=='timed-word'||!base.accent.active||
  base.accent.source!=='word'||base.accent.confidence!=='lyrics-word'||
  !p.enabled||!p.playing||p.reducedMotion||p.manualPriority||p.tier==='low'||
  !finite(p.strength)||p.strength<=0||!p.trackId?.trim()||!p.lyrics?.synced||
  !finite(p.effectiveTimeMs)||p.effectiveTimeMs<0||
  !finite(base.accent.head)||!finite(base.accent.chest)||!finite(base.accent.arms))return base;
 const line=p.lyrics.lines[base.accent.lineIndex];
 const index=base.accent.wordIndex,word=line?.words?.[index];
 if(!word?.text?.trim()||!finite(word.startMs)||!finite(line.startMs)||
  !Number.isInteger(index)||index<0||index>=120)return base;
 const next=line.words?.[index+1];
 const end=Math.min(finite(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,
  finite(next?.startMs)&&next.startMs>word.startMs?next.startMs:Infinity,
  finite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
  word.startMs+1300);
 const duration=end-word.startMs;
 if(duration<80||duration>1300||p.effectiveTimeMs<word.startMs||p.effectiveTimeMs>=end)return base;
 const progress=(p.effectiveTimeMs-word.startMs)/duration;
 const envelope=smooth(progress/.22)*smooth((1-progress)/.24);
 const amount=clamp(p.strength,0,80)/100*envelope*(p.tier==='balanced'?.65:1);
 const dense=duration<260;
 const inHook=/hook|chorus|drop|finale/i.test(p.section??'');
 // Compact fast-rap wrists; more readable head accents on expressive words.
 const headGain=1+amount*(inHook?.065:.045);
 const chestGain=1+amount*(inHook?.075:.042);
 const armGain=1+amount*(dense?-.065:inHook?.065:.025);
 const a=base.accent;
 return {...base,accent:{...a,
  head:clamp(a.head*headGain,0,.055),
  chest:clamp(a.chest*chestGain,0,.09),
  arms:clamp(a.arms*armGain,0,.11)}} as T;
}

function verifiedWindow(cue:RapMouthEvidenceV1062,ctx:RapMouthContextV1062,
 enabled:boolean,strength:number):number|null{
 if(!enabled||!finite(strength)||strength<=0||!cue.active||cue.source!=='verified-timed-word'||
  !ctx.playing||!ctx.rap||!ctx.verifiedSinger||ctx.manualPriority||ctx.protectedMouth||
  ctx.reducedMotion||ctx.tier==='low'||!finite(ctx.effectiveTimeMs)||
  !finite(cue.wordStartMs)||!finite(cue.wordEndMs)||
  !finite(cue.onset)||!finite(cue.release)||cue.wordEndMs-cue.wordStartMs<80||cue.wordEndMs-cue.wordStartMs>1300||
  ctx.effectiveTimeMs<cue.wordStartMs||ctx.effectiveTimeMs>=cue.wordEndMs)return null;
 const progress=(ctx.effectiveTimeMs-cue.wordStartMs)/(cue.wordEndMs-cue.wordStartMs);
 return clamp(strength,0,80)/100*(ctx.tier==='balanced'?.65:1)*
  smooth(progress/.25)*smooth((1-progress)/.25);
}
/** Small additional response-rate envelope; no new jaw/viseme target and no lip seal override. */
export function rapMouthRateV1062(cue:RapMouthEvidenceV1062,ctx:RapMouthContextV1062,
 channel:string,current:number,target:number,enabled:boolean,strength:number):number{
 const gate=verifiedWindow(cue,ctx,enabled,strength);
 if(gate===null||!finite(current)||!finite(target)||Math.abs(current-target)<.00001||
  !['jaw','round','wide'].includes(channel))return 1;
 return clamp(1+(target>current?clamp(cue.onset,0,1)*.072:-clamp(cue.release,0,1)*.048)*gate,.95,1.075);
}
/** Optional tiny brow/cheek/squint expression only; leaves mouth and blink untouched. */
export function rapFaceAccentV1062(base:number,cue:RapMouthEvidenceV1062,ctx:RapMouthContextV1062,
 channel:string,enabled:boolean,strength:number):number{
 const gate=verifiedWindow(cue,ctx,enabled,strength);
 if(gate===null||!finite(base)||!['brow','cheek','squint'].includes(channel))return base;
 const accent=channel==='brow'?.027:channel==='cheek'?.018:.014;
 return clamp(base+accent*gate*clamp(cue.onset,0,1),0,1);
}
