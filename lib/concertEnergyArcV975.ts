/** V975 – Adaptive Concert Energy Arc.
 * Only the existing verified virtual concert scene changes. No invented song
 * structure, no Govee/Alexa commands, timers, camera cuts or added meshes.
 * Pure, bounded and seek-stable: given the same verified V318 section and
 * playback position, it renders the same value on Windows and Raspberry Pi.
 */
import type {ConcertSceneV958,ConcertSettingsV958,ConcertPhaseV958} from '@/lib/ultimateConcertRoadmapV958';

export type ArcModeV975='subtle'|'balanced'|'cinematic';
export interface ConcertEnergyArcInputV975 {
 scene:ConcertSceneV958|null;settings:ConcertSettingsV958;
 positionMs:number;durationMs:number;sectionStartMs:number;sectionDurationMs:number;
 sectionIndex:number;playing:boolean;authoredStage:boolean;lowPerformance:boolean;
 reducedMotion:boolean;lyricsVisible:boolean;savedShowActive?:boolean;
}
export interface ConcertEnergyArcResultV975 {
 scene:ConcertSceneV958|null;active:boolean;gain:number;
 trajectory:'rest'|'lift'|'crest'|'release'|'off';
 reason:string;
}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const phases:readonly ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const off=(scene:ConcertSceneV958|null,reason:string):ConcertEnergyArcResultV975=>({
 scene,active:false,gain:1,trajectory:'off',reason});
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
/** Existing V318 position/section is authoritative; never fabricate an upcoming drop. */
export function applyConcertEnergyArcV975(i:ConcertEnergyArcInputV975):ConcertEnergyArcResultV975 {
 const s=i.scene,settings=i.settings;
 if(!s||!settings.enabled||!settings.virtualFx||!settings.energyArcV975||
  !i.playing||!s.verified||s.timelineOverride||i.authoredStage||i.savedShowActive||
  i.lowPerformance||i.reducedMotion||!phases.includes(s.phase)||
  !finite(settings.energyArcStrengthV975)||settings.energyArcStrengthV975<=0||
  !finite(i.positionMs)||!finite(i.durationMs)||!finite(i.sectionStartMs)||
  !finite(i.sectionDurationMs)||!Number.isInteger(i.sectionIndex)||i.sectionIndex<0||
  i.durationMs<10000||i.durationMs>1800000||i.sectionStartMs<0||
  i.sectionStartMs>=i.durationMs||i.sectionDurationMs<1000||
  i.sectionStartMs+i.sectionDurationMs>i.durationMs+1000||
  i.positionMs<i.sectionStartMs||i.positionMs>=Math.min(i.durationMs,i.sectionStartMs+i.sectionDurationMs)||
  !finite(s.intensity)||s.intensity<0||s.intensity>1||
  !finite(s.spotlight)||s.spotlight<0||s.spotlight>1||
  !finite(s.lightGain)||s.lightGain<0||s.lightGain>1.3){
  return off(s,'Nicht verfügbar: nur bestätigte virtuelle Abschnitte ohne manuellen Eingriff');
 }
 const position=clamp(i.positionMs/i.durationMs,0,1);
 const local=clamp((i.positionMs-i.sectionStartMs)/i.sectionDurationMs,0,1);
 // Opening and closing movements can breathe without claiming knowledge of
 // future sections. Every shape uses actual current phase and current time.
 const arrangement=.92+.075*smooth(clamp(position/.16,0,1))-
  .045*smooth(clamp((position-.86)/.14,0,1));
 const phaseShape:Record<ConcertPhaseV958,number>={
  verse:-.075,hook:.065,build:.02,drop:.10,break:-.13,outro:-.10};
 let delta=phaseShape[s.phase];
 if(s.phase==='build')delta+=.045*(2*smooth(local)-1);
 if(s.phase==='drop')delta+=.025*(1-smooth(local));
 if(s.phase==='outro')delta-=.04*smooth(local);
 if(s.phase==='verse')delta+=.015*Math.sin((i.sectionIndex+1)*1.9+local*Math.PI*2);
 // A slow section-local envelope adds subtle motion without flashing/rapid changes.
 const breathing=.014*Math.sin(local*Math.PI*2)*Math.sin(local*Math.PI);
 const mode=settings.energyArcModeV975==='subtle'?.46:settings.energyArcModeV975==='cinematic'?1.1:.76;
 const strength=clamp(settings.energyArcStrengthV975,0,100)/100;
 // Conservative Pi mode and readable lyrics only lower intensity swings.
 const safety=(i.lyricsVisible?.5:1);
 const gain=clamp(1+(delta+breathing+arrangement-1)*mode*strength*safety,.87,1.12);
 const intensity=clamp(s.intensity*gain,.12,.97);
 const spotlight=clamp(s.spotlight*(1+(gain-1)*.34),.1,1);
 const lightGain=clamp(s.lightGain*(1+(gain-1)*.20),.3,1.1);
 const trajectory=s.phase==='break'||s.phase==='outro'?'rest':
  s.phase==='build'?'lift':s.phase==='hook'||s.phase==='drop'?'crest':'release';
 return {scene:{...s,intensity,spotlight,lightGain},active:true,gain,trajectory,
  reason:'V975: überprüfter Songabschnitt, virtuelle Konzert-Energiekurve'};
}
