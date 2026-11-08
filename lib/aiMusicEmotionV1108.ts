/** V1108 foundation · conservative interpretation of *measured*, local microphone energy.
 * This is NOT a semantic analysis of feelings, song sections, lyrics or audio files.
 * No network, persistence, device commands, timers or external AI in this module.
 */
import type {AudioFeatures} from '../types/audio';
export type MusicMoodHintV1108='none'|'calm'|'atmospheric'|'focused'|'euphoric'|'intense';
export type MeasuredMusicMoodV1108={mood:Exclude<MusicMoodHintV1108,'none'>;confidence:number;energy:number;reason:string;source:'local-microphone'};
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1;
const round=(value:number)=>Math.round(value*100)/100;
/** Confidence is a bounded *heuristic*, never evidence that the track feels a certain way. */
export function estimateMeasuredMoodV1108(audio:Pick<AudioFeatures,'volume'|'bass'|'mids'|'highs'|'energyEnvelope'|'beatStrength'|'attack'>|null|undefined,
 context:{microphoneActive:boolean;playing:boolean;reducedMotion:boolean}):MeasuredMusicMoodV1108|null{
 if(!audio||!context.microphoneActive||!context.playing||context.reducedMotion)return null;
 if(![audio.volume,audio.bass,audio.mids,audio.highs,audio.energyEnvelope,audio.beatStrength,audio.attack].every(valid))return null;
 const energy=round(.46*audio.energyEnvelope+.24*audio.volume+.2*audio.bass+.1*audio.beatStrength);
 // Silent and near-silent microphone frames are not meaningful observations.
 if(audio.volume<.04||audio.energyEnvelope<.045)return null;
 const bright=audio.highs>audio.bass+.22;
 const aggressive=energy>.70&&audio.bass>.48;
 const energetic=energy>.53&&audio.beatStrength>.35;
 const calm=energy<.30&&audio.attack<.35;
 const mood:MeasuredMusicMoodV1108['mood']=aggressive?'intense':energetic?(bright?'euphoric':'intense'):
   calm?'calm':bright?'euphoric':audio.attack<.26?'atmospheric':'focused';
 const confidence=round(Math.min(.78,Math.max(.25,.32+Math.min(audio.volume,.7)*.36+Math.abs(energy-.45)*.21)));
 return {mood,energy,confidence,source:'local-microphone',reason:'Heuristische Schätzung aus lokal gemessener Lautstärke, Frequenzverteilung und Impulsen. Keine echte Emotionserkennung.'};
}
export function isMusicMoodHintV1108(v:unknown):v is MusicMoodHintV1108{
 return v==='none'||v==='calm'||v==='atmospheric'||v==='focused'||v==='euphoric'||v==='intense';
}

/** V1108 · session-only 20-second observation, deliberately opt-in.
 * Audio is reduced to bounded, normalized analysis features in RAM. Never store
 * raw microphone audio, track IDs, lyrics or device identifiers.
 */
export type EnergyTrendV1108='rising'|'falling'|'steady';
export type EmotionSampleV1108={atMs:number;volume:number;bass:number;mids:number;highs:number;energyEnvelope:number;beatStrength:number;attack:number};
export type MusicEmotionSessionV1108={samples:ReadonlyArray<EmotionSampleV1108>;lastAtMs:number;trackKey:string};
export type MusicEmotionReadingV1108=MeasuredMusicMoodV1108&{
 trend:EnergyTrendV1108;stability:number;beatClarity:number;sampleCount:number;
 durationMs:number;peakEnergy:number;ready:boolean;
};
export type SuggestedDirectionV1108={style:'cinematic'|'festival'|'intimate'|'surprise';contrast:number;surprise:number;mood:MusicMoodHintV1108};
const WINDOW_MS=20000,MIN_INTERVAL_MS=250,MAX_GAP_MS=4000;
const signalFields=['volume','bass','mids','highs','energyEnvelope','beatStrength','attack'] as const;
const safeSignal=(audio:Partial<Pick<AudioFeatures,typeof signalFields[number]>>|null|undefined):audio is Pick<AudioFeatures,typeof signalFields[number]>=>
 !!audio&&signalFields.every(key=>valid(audio[key]));
const signalContext=(context:{microphoneActive:boolean;playing:boolean;reducedMotion:boolean})=>
 context.microphoneActive&&context.playing&&!context.reducedMotion;
const mean=(v:readonly number[])=>v.reduce((sum,x)=>sum+x,0)/Math.max(1,v.length);
const energyOf=(sample:EmotionSampleV1108)=>.46*sample.energyEnvelope+.24*sample.volume+.2*sample.bass+.1*sample.beatStrength;
export function createMusicEmotionSessionV1108():MusicEmotionSessionV1108{
 return {samples:[],lastAtMs:-1,trackKey:''};
}
/** A gap, silence, invalid sample, pause or track switch discards the prior buffer.
 * Sampling is bounded to four observations per second and 81 entries maximum.
 */
export function collectMusicEmotionSampleV1108(session:MusicEmotionSessionV1108,
 audio:Partial<Pick<AudioFeatures,typeof signalFields[number]>>|null|undefined,
 context:{microphoneActive:boolean;playing:boolean;reducedMotion:boolean},atMs:number,trackKey:string):MusicEmotionSessionV1108{
 if(!signalContext(context)||!safeSignal(audio)||!Number.isFinite(atMs)||atMs<0||
  typeof trackKey!=='string'||trackKey.length===0||trackKey.length>160||
  audio.volume<.04||audio.energyEnvelope<.045)return createMusicEmotionSessionV1108();
 const previous=session.samples.length>0&&session.trackKey===trackKey&&atMs>session.lastAtMs&&
   atMs-session.lastAtMs<=MAX_GAP_MS?session:createMusicEmotionSessionV1108();
 if(previous.samples.length&&atMs-previous.lastAtMs<MIN_INTERVAL_MS)return previous;
 const sample:EmotionSampleV1108={atMs,volume:audio.volume,bass:audio.bass,mids:audio.mids,
  highs:audio.highs,energyEnvelope:audio.energyEnvelope,beatStrength:audio.beatStrength,attack:audio.attack};
 return {trackKey,lastAtMs:atMs,samples:[...previous.samples.filter(s=>atMs-s.atMs<=WINDOW_MS),sample].slice(-81)};
}
/** A reading is available after several seconds of signal, not from one transient
 * kick. Confidence describes consistency of measurements, NOT emotional truth.
 */
export function readMusicEmotionV1108(session:MusicEmotionSessionV1108):MusicEmotionReadingV1108|null{
 const values=session.samples;
 const durationMs=values.length?values[values.length-1].atMs-values[0].atMs:0;
 if(values.length<12||durationMs<3500||durationMs>WINDOW_MS+MIN_INTERVAL_MS)return null;
 if(values.some(s=>!safeSignal(s)))return null;
 const n=Math.max(3,Math.floor(values.length/3));
 const recent=values.slice(-n),early=values.slice(0,n);
 const avg=Object.fromEntries(signalFields.map(key=>[key,mean(values.map(s=>s[key]))])) as
  unknown as Pick<AudioFeatures,typeof signalFields[number]>;
 const single=estimateMeasuredMoodV1108(avg,{microphoneActive:true,playing:true,reducedMotion:false});
 if(!single)return null;
 const energies=values.map(energyOf);
 const firstEnergy=mean(early.map(energyOf)),lastEnergy=mean(recent.map(energyOf));
 const delta=lastEnergy-firstEnergy;
 const trend:EnergyTrendV1108=delta>.12?'rising':delta<-.12?'falling':'steady';
 const avgEnergy=mean(energies);
 const variance=mean(energies.map(x=>(x-avgEnergy)**2));
 const stability=round(Math.max(0,Math.min(1,1-Math.sqrt(variance)*2.25)));
 const beatClarity=round(mean(values.map(x=>x.beatStrength)));
 const confidence=round(Math.min(.85,single.confidence*.55+stability*.22+
  beatClarity*.12+Math.min(1,durationMs/12000)*.11));
 const ready=confidence>=.52&&durationMs>=4500&&values.length>=16;
 return {...single,energy:round(avgEnergy),confidence,stability,beatClarity,trend,
  sampleCount:values.length,durationMs,peakEnergy:round(Math.max(...energies)),ready,
  reason:'Lokal über mehrere Sekunden gemessene Energie, Frequenzen und Impulse. Stimmung nur geschätzt; keine tatsächliche Song- oder Emotionserkennung.'};
}
/** An explicit user click may adopt this *suggestion*, without executing any
 * stage cue, recording or cloud request. All settings remain within V1107 caps.
 */
export function suggestCreativeDirectionV1108(reading:MusicEmotionReadingV1108|null):SuggestedDirectionV1108|null{
 if(!reading||!reading.ready||reading.source!=='local-microphone'||
  !isMusicMoodHintV1108(reading.mood)||!valid(reading.energy)||!valid(reading.confidence)||
  !valid(reading.stability)||!valid(reading.beatClarity)||!valid(reading.peakEnergy)||
  !Number.isInteger(reading.sampleCount)||reading.sampleCount<16||
  !Number.isFinite(reading.durationMs)||reading.durationMs<4500||reading.durationMs>WINDOW_MS+MIN_INTERVAL_MS||
  !['rising','falling','steady'].includes(reading.trend))return null;
 const intense=reading.mood==='intense'||reading.mood==='euphoric';
 const style:SuggestedDirectionV1108['style']=reading.trend==='rising'&&intense?'festival':
  reading.trend==='falling'&&reading.mood==='calm'?'intimate':
  intense?'surprise':'cinematic';
 const contrast=Math.min(80,Math.max(0,Math.round((32+reading.peakEnergy*45+(reading.trend==='rising'?12:0))/5)*5));
 const surprise=Math.min(70,Math.max(0,Math.round((18+reading.beatClarity*36+(intense?9:0))/5)*5));
 return {style,contrast,surprise,mood:reading.mood};
}
