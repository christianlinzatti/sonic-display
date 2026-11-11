import type {ConcertScoreV1134} from './concertScoreV1134';
import type {ConcertTier} from './concertStageShow';
export type AtmosphereMotif='aurora'|'prism'|'stars'|'halo';
export type AtmospherePlan={active:boolean;scene:string;motif:AtmosphereMotif;weights:[number,number,number,number];amount:number;floor:boolean;floorGain:number;moving:boolean;still:boolean;spread:number};
const motifs:AtmosphereMotif[]=['aurora','prism','stars','halo'];
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const base={cinema:0,groove:3,neon:1,festival:2};
/** One shared scene for the room and floor. No extra clocks, bursts or musical predictions. */
export function planConcertAtmosphere(input:{cue:ConcertScoreV1134;active:boolean;enabled:boolean;playing:boolean;reducedMotion:boolean;tier:ConcertTier;floorAllowed:boolean;scale:number}):AtmospherePlan{
 const {cue}=input,protectedText=cue.reading||cue.lyricFocus;
 const opening=cue.staging==='opening',quiet=protectedText||cue.act==='breathe';
 const start=base[cue.production?.id??'cinema'];
 const visit=Math.max(1,Math.min(8,Math.floor(cue.chorusVisit)||1));
 const index=cue.act==='finale'?start:cue.act==='lift'?(start+visit)%4:cue.staging==='instrumental'?(start+2)%4:cue.act==='build'?1:start;
 const scene=protectedText?'text':cue.act==='finale'?'reprise':cue.act==='lift'?'refrain':cue.act==='build'?'suspense':cue.staging==='instrumental'?'instrumental':opening?'opening':'verse';
 const active=input.active&&input.enabled&&clamp(input.scale)>0;
 const moving=active&&input.playing&&!input.reducedMotion&&!quiet&&input.tier!=='low';
 const weights:[number,number,number,number]=[0,0,0,0];weights[index]=1;
 // The finale recalls the opening motif with a second, slowly blended halo.
 if(scene==='reprise'){weights[index]=.7;weights[(start+3)%4]+=.3;}
 const gain=protectedText?0:opening?.15:quiet?.12:scene==='suspense'?.16+clamp(cue.anticipationProgress)*.12:scene==='refrain'?.48+Math.min(3,visit)*.06:scene==='reprise'?.72:scene==='instrumental'?.5:.30;
 const amount=active?clamp(input.scale)*gain*(input.reducedMotion?.18:input.tier==='low'?.55:input.tier==='balanced'?.7:1)*(input.playing?1:.3):0;
 const floor=active&&input.floorAllowed&&moving&&scene!=='suspense';
 return {active,scene,motif:motifs[index],weights,amount,floor,floorGain:floor?amount*.42:0,moving,still:input.reducedMotion||quiet||input.tier==='low',spread:quiet?.25:scene==='suspense'?.35+clamp(cue.anticipationProgress)*.35:scene==='refrain'||scene==='reprise'?1:.6};
}
