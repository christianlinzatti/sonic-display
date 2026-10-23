import type {AudioFeatures} from '@/types/audio';

export type DanceFxTierV468 = 'low'|'balanced'|'high';
export type DanceFxEnvelopeV468 = {elapsed:number;lastKick:number;beatHeld:boolean;lastKickLevel:number;pulse:number;glitch:number;blur:number;anticipation:number};
export const initialDanceFxEnvelopeV468 = ():DanceFxEnvelopeV468 => ({elapsed:0,lastKick:-10,beatHeld:false,lastKickLevel:0,pulse:0,glitch:0,blur:0,anticipation:0});
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
/** Causal, bounded envelope: kick prediction is a NEXT-BEAT hint, not a claimed song-drop detector. */
export function advanceDanceFxEnvelopeV468(previous:DanceFxEnvelopeV468,audio:AudioFeatures,delta:number,opts:{playing:boolean;reducedMotion:boolean;strength:number;tier:DanceFxTierV468;drop?:boolean}):DanceFxEnvelopeV468 {
 const dt=Math.max(0,Math.min(.1,Number.isFinite(delta)?delta:0));
 const elapsed=previous.elapsed+dt;
 const active=opts.playing&&!opts.reducedMotion&&opts.tier!=='low'&&opts.strength>0;
 const beat=Boolean(audio.beat);
 const kick=Math.max(clamp(audio.kickAccentIntensity??0),clamp(audio.kick),clamp(audio.beatStrength));
 const drop=opts.drop===true&&kick>.32;
 const beatEdge=beat&&!previous.beatHeld;
 const kickEdge=audio.kickAccent==='strong'&&kick>.78&&previous.lastKickLevel<=.78;
 const fired=active&&(beatEdge||kickEdge)&&kick>.25&&elapsed-previous.lastKick>=.24;
 const scaled=clamp(opts.strength/100)*(opts.tier==='balanced'?.46:1);
 const decay=(v:number,speed:number)=>Math.max(0,v*Math.exp(-dt*speed));
 const pulse=active?Math.min(.65,Math.max(decay(previous.pulse,12),fired?scaled*(drop?.58:.4)+kick*.14*scaled:0)):0;
 const glitch=active?Math.min(.23,Math.max(decay(previous.glitch,21),fired&&kick>.68?scaled*(drop?.2:.11):0)):0;
 const blur=active&&opts.tier==='high'?Math.min(.4,Math.max(decay(previous.blur,9),fired?scaled*.28:0)):0;
 const anticipation=active?clamp(audio.kickAnticipation??0)*scaled*.22:0;
 return {elapsed,lastKick:fired?elapsed:previous.lastKick,beatHeld:beat,lastKickLevel:kick,pulse,glitch,blur,anticipation};
}
