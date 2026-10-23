/** V387: one synchronized, bounded show cue; pure logic, no beat fabrication or audio capture. */
import type { StageSection } from './stageDirectorV287';
export type ConcertShowModeV387 = 'off' | 'balanced' | 'festival';
export type ConcertShowMomentV387 = 'break' | 'build' | 'verse' | 'hook' | 'drop';
export type ConcertShowCueV387 = {active:boolean;moment:ConcertShowMomentV387;intensity:number;lightGain:number;
 beamGain:number;hazeGain:number;sweepGain:number;danceGain:number;cameraPull:number;dropPulse:number;};
export type ConcertShowStateV387 = {trackId:string;lastMs:number;moment:ConcertShowMomentV387;sinceMs:number;cue:ConcertShowCueV387};
export type ConcertShowInputV387 = {trackId?:string;progressMs:number;playing:boolean;reducedMotion?:boolean;
 mode?:ConcertShowModeV387;strength?:number;section?:StageSection;genre?:string|null;energy?:number;beat?:number;
 manualPriority?:boolean;};
const clamp=(n:number,min=0,max=1)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
export const SILENT_CONCERT_SHOW_V387:ConcertShowCueV387=Object.freeze({active:false,moment:'verse',intensity:0,
 lightGain:1,beamGain:1,hazeGain:1,sweepGain:1,danceGain:1,cameraPull:0,dropPulse:0});
export function initialConcertShowV387():ConcertShowStateV387{return {trackId:'',lastMs:-1,moment:'verse',sinceMs:0,cue:SILENT_CONCERT_SHOW_V387};}
const ease=(t:number)=>{const a=clamp(t);return a*a*(3-2*a);};
export function advanceConcertShowV387(prev:ConcertShowStateV387,input:ConcertShowInputV387):ConcertShowStateV387{
 const ms=Math.max(0,Number.isFinite(input.progressMs)?input.progressMs:0),trackId=input.trackId??'';
 const mode=input.mode??'off';
 const section=input.section??'verse';
 const wanted:ConcertShowMomentV387=section==='break'?'break':section==='build'?'build':section==='drop'?'drop':section==='hook'?'hook':'verse';
 const reset=trackId!==prev.trackId||ms<prev.lastMs-350||ms>prev.lastMs+10000;
 const moment=reset?wanted:prev.moment!==wanted&&ms-prev.sinceMs>=280?wanted:prev.moment;
 const sinceMs=reset||moment!==prev.moment?ms:prev.sinceMs;
 const base:ConcertShowStateV387={trackId,lastMs:ms,moment,sinceMs,cue:{...SILENT_CONCERT_SHOW_V387,moment}};
 if(mode==='off'||!input.playing||input.reducedMotion||input.manualPriority||!trackId||!(input.strength??65))return base;
 const energy=clamp(input.energy??0),beat=clamp(input.beat??0);
 const power=clamp((input.strength??65)/100)*(mode==='balanced'?.70:1);
 const electronic=/hardstyle|hardtekk|techno|rave|hardcore/i.test(input.genre??'');
 const momentLevel:Record<ConcertShowMomentV387,number>={break:.16,verse:.34,build:.54,hook:.60,drop:.85};
 // Respect the known song section; strong kicks alone cannot invent a drop.
 const pulse=moment==='drop'?Math.min(.22,beat*.22):0;
 const transition=ease((ms-sinceMs)/(moment==='drop'?420:720));
 const drive=power*transition*momentLevel[moment]*(.55+.45*energy);
 const extra=(mode==='festival'&&electronic?1.16:1);
 const emphasis=clamp(drive*extra+pulse*power,0,.95);
 const lightGain=clamp(1+(moment==='break'?-.10:1)*emphasis*.21,.88,1.25);
 const beamGain=clamp(1+emphasis*(moment==='drop'?.35:.22),1,1.35);
 const hazeGain=clamp(1+emphasis*(moment==='build'?.34:.22),1,1.28);
 const sweepGain=clamp(1+emphasis*(moment==='build'?.30:.18),1,1.29);
 const danceGain=clamp(1+(moment==='break'?-.08:.14)*emphasis,.9,1.13);
 const cameraPull=clamp((moment==='drop'?.16:moment==='build'?.10:moment==='break'?.07:-.035)*emphasis,-.04,.16);
 return {...base,cue:{active:true,moment,intensity:emphasis,lightGain,beamGain,hazeGain,sweepGain,danceGain,cameraPull,dropPulse:pulse*power}};
}
export function composeConcertShowCameraV387<T extends {x:number;y:number;z:number;fov:number;targetY:number}>(pose:T,cue:ConcertShowCueV387|undefined,
 {automatic=false,lyricsProtected=false,authored=false}:{automatic?:boolean;lyricsProtected?:boolean;authored?:boolean}={}):T{
 if(!cue?.active||!automatic||authored||lyricsProtected)return pose;
 const factor=cue.cameraPull;
 return {...pose,z:clamp(pose.z*(1+factor),-50,50),fov:clamp(pose.fov+factor*7,26,58)};
}
