import type {Lyrics} from "@/types/music";
import {rapLipWordAtV415,type RapLipPrecisionCueV415} from "./rapLipPrecisionV415";

/** A visually useful GRAPHEME estimate, not transcription, forced alignment or real phoneme timestamps. */
export interface RapSyllableOptionsV419 {
  rapSyllableEnabledV419?:boolean;
  rapSyllableStrengthV419?:number; // 0..100
  rapSyllableSmoothnessV419?:number; // 0..100
  reducedMotion?:boolean;
  lipStrength?:number; // honor existing global Lip-Sync off switch
}
export type RapSyllableDiagnosticV419={
  active:boolean;
  source:"grapheme-estimate"|"none";
  word:string|null;
  estimatedSyllables:number;
  sampledSyllables:number;
  index:number;
  nucleus:string|null;
  phase:number;
  mouthTimeMs:number;
};
export type RapSyllableCueV419=RapLipPrecisionCueV415&{rapSyllableV419:RapSyllableDiagnosticV419};
const clamp=(n:number,a=0,b=1)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const nuclei=(text:string):string[]=>{
  // Diphthongs and long vowel groups count as ONE graphic nucleus. No fake phoneme timestamps.
  const clean=text.toLocaleLowerCase("de-DE").replace(/[^a-zäöüß]/gu,"");
  return clean.match(/[aeiouyäöü]+/gu)??[];
};
const vowelPose=(group:string):{jaw:number;wide:number;round:number}=>{
  if(/[oöuü]/u.test(group))return {jaw:.46,wide:.08,round:.86};
  if(/[eiä]/u.test(group))return {jaw:.48,wide:.82,round:.08};
  if(/[a]/u.test(group))return {jaw:.75,wide:.45,round:.08};
  return {jaw:.48,wide:.3,round:.2};
};
/** Stateless and seek-safe; body, camera, beat and vocalist assignment remain untouched. */
export function refineRapSyllablesV419(
  lyrics:Lyrics|null,cue:RapLipPrecisionCueV415,playing:boolean,options:RapSyllableOptionsV419={}
):RapSyllableCueV419 {
  const off=():RapSyllableCueV419=>({...cue,rapSyllableV419:{active:false,source:"none",word:null,
    estimatedSyllables:0,sampledSyllables:0,index:-1,nucleus:null,phase:0,
    mouthTimeMs:Number.isFinite(cue.rapLipV415.mouthTimeMs)?cue.rapLipV415.mouthTimeMs:0}});
  if(options.rapSyllableEnabledV419!==true||!playing||options.reducedMotion||(options.lipStrength!==undefined&&options.lipStrength<=0)||!lyrics?.synced||
    cue.confidence!=="word"||cue.vocal.style!=="rap"||!Number.isFinite(cue.rapLipV415.mouthTimeMs))return off();
  // V415 diagnostics fall back to its effective time if V415 itself is disabled.
  const time=cue.rapLipV415.active?cue.rapLipV415.mouthTimeMs:cue.effectiveTimeMs;
  const mark=rapLipWordAtV415(lyrics,time);
  if(!mark||cue.vocal.activeWord?.trim()!==mark.word.text.trim())return off();
  const groups=nuclei(mark.word.text);
  if(!groups.length)return off();
  const strength=clamp(options.rapSyllableStrengthV419??65,0,100)/100;
  if(strength<=0)return off();
  const smoothness=clamp(options.rapSyllableSmoothnessV419??70,0,100)/100;
  const duration=mark.end-mark.start;
  if(duration<=0)return off();
  // At most one distinct pulse per ~95 ms. Extremely rapid words get simplified,
  // rather than creating implausibly fast mouth oscillations.
  const samples=Math.min(groups.length,Math.max(1,Math.floor(duration/95)));
  const pos=clamp((time-mark.start)/duration,0,1-1e-8)*samples;
  const index=Math.min(samples-1,Math.floor(pos));
  const phase=pos-index;
  const groupIndex=Math.min(groups.length-1,Math.floor((index+.5)*groups.length/samples));
  const nextIndex=Math.min(samples-1,index+1);
  const nextGroupIndex=Math.min(groups.length-1,Math.floor((nextIndex+.5)*groups.length/samples));
  const current=vowelPose(groups[groupIndex]);
  const next=vowelPose(groups[nextGroupIndex]);
  const blend=nextIndex===index?0:smooth((phase-(.5-.28*smoothness))/(.24+.52*smoothness));
  const pose={jaw:current.jaw*(1-blend)+next.jaw*blend,
    wide:current.wide*(1-blend)+next.wide*blend,
    round:current.round*(1-blend)+next.round*blend};
  // Subtle per-nucleus shaping. A high smoothing value reduces the internal dip.
  const pulse=.5+.5*Math.sin(Math.PI*phase);
  const envelope=1-(1-pulse)*(.38*(1-smoothness));
  const gain=strength*(.35+.65*envelope);
  const base=cue.face;
  // Preserve V384/V405/V415 B/P/M seals (and backing-vocal mutes downstream).
  const seal=clamp(base.lipsClosed);
  const articulationGain=gain*(1-seal*.96);
  const jaw=clamp(base.jaw*(1-.22*articulationGain)+pose.jaw*.22*articulationGain,0,1-seal*.985);
  const round=clamp(base.round*(1-.56*articulationGain)+pose.round*.56*articulationGain)*(1-seal*.25);
  const wide=clamp(base.wide*(1-.56*articulationGain)+pose.wide*.56*articulationGain)*(1-seal*.3)*(1-round*.22);
  return {...cue,face:{...base,jaw,wide:clamp(wide),round:clamp(round)},
    rapSyllableV419:{active:true,source:"grapheme-estimate",word:mark.word.text,
      estimatedSyllables:groups.length,sampledSyllables:samples,index,nucleus:groups[groupIndex],
      phase,mouthTimeMs:time}};
}
