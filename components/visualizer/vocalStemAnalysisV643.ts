/** V643: OFFLINE features from USER-SUPPLIED, PRE-ISOLATED vocal audio only.
 * No Spotify PCM access, source separation, speech transcription, speaker detection
 * or phoneme alignment. Does not change live lip sync; it is a V644 research input.
 * Every assertion of vocal provenance is explicitly supplied by the user.
 */
export const VOCAL_STEM_HOP_MS_V643 = 80;
export const VOCAL_STEM_MAX_MS_V643 = 720_000;
export const VOCAL_STEM_MAX_POINTS_V643 = 9_000;
export type VocalStemPointV643 = [number, number, number]; // normalized RMS, onset, periodicity, integers 0..100
export type VocalStemSlotV643 = 0|1|2|3;
export interface VocalStemPhraseV643 { startMs:number;endMs:number;peak:number; }
export interface VocalStemDocumentV643 {
 version:1;source:'user-declared-isolated-vocal';trackId:string;slot:VocalStemSlotV643;
 durationMs:number;hopMs:80;points:VocalStemPointV643[];
 phrases:VocalStemPhraseV643[];
 stats:{activityPercent:number;periodicPercent:number;peakPercent:number;clippingPercent:number;};
}
export interface VocalStemBundleV643 {format:'sonic-v643-local-vocal-features';version:1;trackId:string;durationMs:number;stems:VocalStemDocumentV643[];}
const clamp=(n:number,min=0,max=1)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const percent=(n:number)=>Math.round(clamp(n)*100);
const slotValid=(n:unknown):n is VocalStemSlotV643=>Number.isInteger(n)&&typeof n==='number'&&n>=0&&n<4;
const integer=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isInteger(n)&&n>=min&&n<=max;
const phraseValid=(p:VocalStemPhraseV643,durationMs:number)=>p&&integer(p.startMs,0,durationMs)&&integer(p.endMs,0,durationMs)&&p.endMs>p.startMs&&integer(p.peak,0,100);

/** Validate imported/exported curves before any read or future lip-sync use. */
export function normalizeVocalStemV643(raw:VocalStemDocumentV643|null|undefined,trackId:string,durationMs?:number):VocalStemDocumentV643|null{
 if(!raw||raw.version!==1||raw.source!=='user-declared-isolated-vocal'||!trackId||raw.trackId!==trackId||!slotValid(raw.slot)||
 !integer(raw.durationMs,2000,VOCAL_STEM_MAX_MS_V643)||raw.hopMs!==VOCAL_STEM_HOP_MS_V643||
 (durationMs!==undefined&&(!Number.isFinite(durationMs)||Math.abs(raw.durationMs-durationMs)>3500))||
 !Array.isArray(raw.points)||raw.points.length<25||raw.points.length>VOCAL_STEM_MAX_POINTS_V643||
 Math.abs(raw.points.length-Math.floor(raw.durationMs/raw.hopMs))>1||
 raw.points.some(p=>!Array.isArray(p)||p.length!==3||p.some(n=>!integer(n,0,100)))||
 !Array.isArray(raw.phrases)||raw.phrases.length>3000||raw.phrases.some(p=>!phraseValid(p,raw.durationMs))||
 raw.phrases.some((p,i)=>i>0&&p.startMs<raw.phrases[i-1].endMs)||
 !raw.stats||!integer(raw.stats.activityPercent,0,100)||!integer(raw.stats.periodicPercent,0,100)||
 !integer(raw.stats.peakPercent,0,100)||!integer(raw.stats.clippingPercent,0,100)||
 Object.keys(raw.stats).length!==4)return null;
 return raw;
}
export function normalizeVocalStemBundleV643(raw:VocalStemBundleV643|null|undefined,trackId:string,durationMs?:number):VocalStemBundleV643|null{
 if(!raw||raw.format!=='sonic-v643-local-vocal-features'||raw.version!==1||raw.trackId!==trackId||
 !integer(raw.durationMs,2000,VOCAL_STEM_MAX_MS_V643)||(durationMs!==undefined&&Math.abs(durationMs-raw.durationMs)>3500)||
 !Array.isArray(raw.stems)||raw.stems.length<1||raw.stems.length>4)return null;
 const slots=new Set<number>();
 for(const stem of raw.stems){
  if(!normalizeVocalStemV643(stem,trackId,raw.durationMs)||slots.has(stem.slot))return null;
  slots.add(stem.slot);
 }
 return raw;
}

/** Works on AudioBuffer channels without generating another song-sized mono copy.
 * Fast, low-resolution autocorrelation is a *periodicity proxy*, not pitch,
 * voicing certainty, singer identity, syllable timing, or phoneme recognition.
 */
export function analyzeIsolatedVocalStemV643(channels:readonly Float32Array[],sampleRate:number,trackId:string,slot:VocalStemSlotV643,expectedMs?:number):VocalStemDocumentV643|null{
 if(!trackId||trackId.length>250||!slotValid(slot)||!Number.isFinite(sampleRate)||sampleRate<8000||sampleRate>192000||
 !channels.length||channels.length>2||channels.some(c=>!(c instanceof Float32Array))||
 !channels[0]||channels[0].length<sampleRate*2||channels[0].length>sampleRate*720||
 channels.some(c=>c.length!==channels[0].length)||channels.reduce((n,c)=>n+c.byteLength,0)>256*1024*1024)return null;
 const durationMs=Math.round(channels[0].length/sampleRate*1000),count=Math.floor(durationMs/VOCAL_STEM_HOP_MS_V643);
 if(count<25||count>VOCAL_STEM_MAX_POINTS_V643||(expectedMs!==undefined&&(!Number.isFinite(expectedMs)||Math.abs(expectedMs-durationMs)>3500)))return null;
 const stride=Math.max(1,Math.round(sampleRate/8000));
 const frameSize=Math.max(80,Math.round(sampleRate*.024/stride));
 const lagRate=sampleRate/stride;
 const minLag=Math.max(8,Math.floor(lagRate/450)),maxLag=Math.min(frameSize-18,Math.ceil(lagRate/85));
 const rmsValues:number[]=[],periodicValues:number[]=[],clippings:number[]=[];
 // Keep individual channel energy: summing opposite-phase stereo waveforms
 // could cancel real vocals and manufacture silent regions in the report.
 const frames=channels.map(()=>new Float32Array(frameSize));
 for(let i=0;i<count;i++){
  const center=Math.floor((i+.5)*VOCAL_STEM_HOP_MS_V643*sampleRate/1000);
  const start=Math.max(0,Math.min(channels[0].length-1-(frameSize-1)*stride,center-Math.floor(frameSize*stride/2)));
  const channelEnergy=channels.map(()=>0);
  let energy=0,clip=0;
  for(let j=0;j<frameSize;j++){
   const idx=start+j*stride;
   for(let k=0;k<channels.length;k++){
    const raw=channels[k][idx];
    if(!Number.isFinite(raw))return null;
    const v=clamp(raw,-1,1);
    frames[k][j]=v;
    channelEnergy[k]+=v*v;
    energy+=v*v/channels.length;
    if(Math.abs(v)>=.995)clip++;
   }
  }
  // Periodicity is measured from the stronger channel, not a potentially
  // phase-cancelled sum. This remains a proxy, not a measured voice pitch.
  const frame=frames[channelEnergy[1]>channelEnergy[0]?1:0];
  const rms=Math.sqrt(energy/frameSize);
  rmsValues.push(rms);clippings.push(clip/(frameSize*channels.length));
  let best=0;
  if(rms>.004){
   // Lag sweep is intentionally sparse and bounded to avoid blocking the UI.
   for(let lag=minLag;lag<=maxLag;lag+=2){
    let ab=0,aa=0,bb=0;
    for(let j=0;j<frameSize-lag;j+=2){const a=frame[j],b=frame[j+lag];ab+=a*b;aa+=a*a;bb+=b*b;}
    if(aa>.00001&&bb>.00001)best=Math.max(best,Math.max(0,ab/Math.sqrt(aa*bb)));
   }
  }
  periodicValues.push(best);
 }
 const sorted=rmsValues.slice().sort((a,b)=>a-b);
 const q=(p:number)=>sorted[Math.floor((sorted.length-1)*p)]??0;
 const reference=Math.max(.012,q(.9));
 const floor=q(.12);
 const points:VocalStemPointV643[]=rmsValues.map((rms,i)=>[
  percent(rms/reference),percent(Math.max(0,rms-(rmsValues[Math.max(0,i-1)]??0))/reference*3.4),percent(periodicValues[i])
 ]);
 const active=points.map(p=>p[0]>=Math.max(13,percent(floor/reference*2.5)));
 const phrases:VocalStemPhraseV643[]=[];
 let from=-1,peak=0,lastActive=-1;
 for(let i=0;i<=points.length;i++){
  if(i<points.length&&active[i]){if(from<0)from=i;lastActive=i;peak=Math.max(peak,points[i][0]);}
  // Bridge short gaps, avoiding fake syllable-level segmentation.
  if(from>=0&&(i===points.length||i-lastActive>4)){
   const end=Math.min(durationMs,(lastActive+1)*VOCAL_STEM_HOP_MS_V643);
   if(end-from*VOCAL_STEM_HOP_MS_V643>=240&&phrases.length<3000)phrases.push({startMs:from*VOCAL_STEM_HOP_MS_V643,endMs:end,peak});
   from=-1;peak=0;
  }
 }
 const result:VocalStemDocumentV643={version:1,source:'user-declared-isolated-vocal',trackId,slot,durationMs,hopMs:80,points,phrases,
  stats:{activityPercent:percent(active.filter(Boolean).length/points.length),periodicPercent:percent(points.filter((p,i)=>active[i]&&p[2]>=50).length/points.length),
   peakPercent:percent(Math.max(...rmsValues)),clippingPercent:percent(clippings.reduce((a,b)=>a+b,0)/clippings.length)}};
 return normalizeVocalStemV643(result,trackId,expectedMs);
}
export function sampleVocalStemV643(stem:VocalStemDocumentV643|null|undefined,ms:number){
 if(!stem||!Number.isFinite(ms)||ms<0||ms>=stem.durationMs)return null;
 const at=Math.min(stem.points.length-1,Math.floor(ms/stem.hopMs)),p=stem.points[at];
 if(!p)return null;
 return {energy:p[0]/100,onset:p[1]/100,periodicity:p[2]/100,possibleVocal:stem.phrases.some(q=>q.startMs<=ms&&ms<q.endMs)};
}
export function bundleVocalStemsV643(stems:readonly VocalStemDocumentV643[],trackId:string,durationMs:number):VocalStemBundleV643|null{
 const output={format:'sonic-v643-local-vocal-features' as const,version:1 as const,trackId,durationMs,stems:[...stems].sort((a,b)=>a.slot-b.slot)};
 return normalizeVocalStemBundleV643(output,trackId,durationMs);
}
