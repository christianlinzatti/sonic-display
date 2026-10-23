import type {Lyrics} from "@/types/music";
import type {RapSyllableCueV419} from "./rapSyllableArticulationV419";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";
import {normalizeRapMouthDocumentV420,rapWordKeyV420,type RapMouthDocumentV420} from "./rapSyllableKeyframesV420";

/** V423 uses explicitly provided decoded LOCAL audio. Features are not phoneme transcription. */
export type RapAudioPointV423=[number,number,number]; // energy, spectral brightness proxy, onset, integer 0..100
export interface RapAudioDocumentV423 {
  version:1;trackId:string;durationMs:number;hopMs:number;
  points:RapAudioPointV423[];
}
export interface RapAudioOptionsV423 {
  rapAudioEnabledV423?:boolean;
  rapAudioStrengthV423?:number; // 0..100
  rapAudioOffsetMsV423?:number; // local file alignment offset +/-1000
  rapAudioTrackIdV423?:string;
  rapAudioDocumentV423?:RapAudioDocumentV423|null;
  rapSyllableEditsEnabledV420?:boolean;
  rapSyllableDocumentV420?:RapMouthDocumentV420|null;
  reducedMotion?:boolean;
  lipStrength?:number;
}
const clamp=(n:number,min=0,max=1)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const validDocumentsV423=new WeakMap<object,string>();
export function normalizeRapAudioDocumentV423(trackId:string,raw:RapAudioDocumentV423|null|undefined,durationMs?:number):RapAudioDocumentV423|null{
  if(!trackId||raw?.version!==1||raw.trackId!==trackId||!Array.isArray(raw.points)||raw.points.length<2||raw.points.length>12000||
    !Number.isFinite(raw.durationMs)||raw.durationMs<2000||raw.durationMs>720000||!Number.isInteger(raw.hopMs)||raw.hopMs<40||raw.hopMs>200||
    (raw.points.length>Math.ceil(raw.durationMs/raw.hopMs)+2||raw.points.length<Math.floor(raw.durationMs/raw.hopMs)-2)||
    (durationMs!==undefined&&(!Number.isFinite(durationMs)||Math.abs(durationMs-raw.durationMs)>3500)))return null;
  // A whole-track scan on every animation frame is expensive. Validate once per
  // persistent document object; changing the document identity invalidates cache.
  if(validDocumentsV423.get(raw)===trackId)return raw;
  if(raw.points.some(p=>!Array.isArray(p)||p.length!==3||p.some(x=>!Number.isInteger(x)||x<0||x>100)))return null;
  validDocumentsV423.set(raw,trackId);
  return raw;
}
/** Browser AudioBuffer channel data can be resampled by indexing without storing or uploading it. */
export function analyzeLocalRapAudioV423(samples:Float32Array,sampleRate:number,trackId:string):RapAudioDocumentV423|null{
  if(!trackId||!Number.isFinite(sampleRate)||sampleRate<8000||sampleRate>192000||samples.length>sampleRate*720||samples.length<sampleRate*2)return null;
  const durationMs=Math.round(samples.length/sampleRate*1000);
  const hopMs=80;
  const count=Math.min(12000,Math.floor(durationMs/hopMs));
  const stride=Math.max(1,Math.round(sampleRate/12000));
  const windowSize=Math.min(768,Math.round(sampleRate*.024/stride));
  const energies:number[]=[],brightnesses:number[]=[];
  for(let i=0;i<count;i++){
    const center=Math.floor((i+.5)*hopMs*sampleRate/1000);
    const start=Math.max(0,center-Math.floor(windowSize*stride/2));
    let square=0,delta=0,previous=0,used=0;
    for(let j=0;j<windowSize;j++){
      const x=clamp(samples[start+j*stride]??0,-1,1);
      square+=x*x;
      if(j)delta+=(x-previous)*(x-previous);
      previous=x;used++;
    }
    const rms=Math.sqrt(square/Math.max(1,used));
    energies.push(rms);
    // First difference is a coarse mix brightness estimate, NOT a measured formant.
    brightnesses.push(Math.sqrt(delta/Math.max(1,used-1))/(rms*2+1e-5));
  }
  // Robust normalization for differing local-file loudness: dynamic percentile.
  const sorted=energies.slice().sort((a,b)=>a-b);
  const reference=Math.max(.007,sorted[Math.floor((sorted.length-1)*.88)]??.007);
  const points:RapAudioPointV423[]=energies.map((rms,i)=>{
    const energy=clamp(rms/reference);
    const bright=clamp((brightnesses[i]-.09)/.62);
    const prev=energies[Math.max(0,i-1)];
    const onset=clamp((rms-prev)/reference*4);
    return [Math.round(energy*100),Math.round(bright*100),Math.round(onset*100)];
  });
  return normalizeRapAudioDocumentV423(trackId,{version:1,trackId,durationMs,hopMs,points});
}
export function sampleRapAudioV423(document:RapAudioDocumentV423|null|undefined,ms:number){
  if(!document||!Number.isFinite(ms)||ms<0||ms>=document.durationMs)return null;
  const pos=ms/document.hopMs;
  const i=Math.min(document.points.length-1,Math.floor(pos));
  const a=document.points[i],b=document.points[Math.min(document.points.length-1,i+1)];
  if(!a||!b)return null;
  const t=clamp(pos-i);
  return {energy:clamp((a[0]*(1-t)+b[0]*t)/100),
    brightness:clamp((a[1]*(1-t)+b[1]*t)/100),
    onset:clamp((a[2]*(1-t)+b[2]*t)/100)};
}
/** A SMALL additive face refinement: the word/rap role, manual keys and B/P/M seals always win. */
export function applyRapAudioV423(lyrics:Lyrics|null,cue:RapSyllableCueV419,playing:boolean,options:RapAudioOptionsV423={}):RapSyllableCueV419{
  if(!playing||!lyrics?.synced||options.rapAudioEnabledV423!==true||options.reducedMotion||options.lipStrength===0||
    cue.vocal.style!=="rap"||cue.confidence!=="word"||!cue.rapSyllableV419.active||
    !options.rapAudioTrackIdV423||options.rapAudioTrackIdV423!==options.rapAudioDocumentV423?.trackId)return cue;
  const document=options.rapAudioDocumentV423;
  if(!normalizeRapAudioDocumentV423(options.rapAudioTrackIdV423,document))return cue;
  const mouthTime=cue.rapSyllableV419.mouthTimeMs;
  const word=rapLipWordAtV415(lyrics,mouthTime);
  if(!word||rapWordKeyV420(word.word.text)!==rapWordKeyV420(cue.rapSyllableV419.word??""))return cue;
  // Saved V420 mouth keys are authored intent, never overridden by an inferred audio mix.
  if(options.rapSyllableEditsEnabledV420&&options.rapSyllableDocumentV420?.trackId===options.rapAudioTrackIdV423){
    const manual=normalizeRapMouthDocumentV420(options.rapAudioTrackIdV423,options.rapSyllableDocumentV420);
    if(manual.edits.some(e=>e.startMs===word.start&&e.text===rapWordKeyV420(word.word.text)))return cue;
  }
  const strength=clamp(options.rapAudioStrengthV423??45,0,100)/100;
  if(strength<=0)return cue;
  const offset=clamp(options.rapAudioOffsetMsV423??0,-1000,1000);
  const sample=sampleRapAudioV423(document,mouthTime+offset);
  if(!sample)return cue;
  const seal=clamp(cue.face.lipsClosed);
  const mix=strength*.22*(1-seal*.98);
  const energyGate=clamp((sample.energy-.075)/.925);
  const targetJaw=clamp(cue.face.jaw*(.70+.40*energyGate)+.10*sample.onset);
  const jaw=clamp(cue.face.jaw*(1-mix)+targetJaw*mix,0,1-seal*.985);
  const round=clamp((cue.face.round*(1-mix)+(.60*(1-sample.brightness))*mix))*(1-seal*.25);
  const wide=clamp((cue.face.wide*(1-mix)+(.65*sample.brightness)*mix)*(1-round*.22))*(1-seal*.3);
  return {...cue,face:{...cue.face,jaw,round:clamp(round),wide:clamp(wide)}};
}
