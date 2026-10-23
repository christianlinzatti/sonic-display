/** Local audio analysis only: does not imply access to the Spotify stream. */
import { sanitizeTimeline, type MotionTimeline, type TimelineSegment } from "./motionTimelineEngine";
import type { ComposerGenre } from "./choreographyComposer";
export type AnalyzedSection = "intro" | "verse" | "hook" | "build" | "drop" | "breakdown" | "outro";
export type MusicSection = { start:number; end:number; kind:AnalyzedSection; energy:number; onsetDensity:number };
export type StructureAnalysis = { duration:number; bpm:number; frames:number; sections:MusicSection[]; energy:number[]; warnings:string[] };
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));
const mean=(arr:number[])=>arr.reduce((s,x)=>s+x,0)/(arr.length||1);
/** Pure analyzer for sampled mono PCM. Computes 0.5 s RMS, spectral-free transient proxy,
 * and heuristic sections. BPM estimation is deliberately labelled approximate. */
export function analyzePcm(samples:Float32Array, sampleRate:number, preferredBpm?:number):StructureAnalysis {
 if(!samples.length||sampleRate<=0) return {duration:0,bpm:preferredBpm||120,frames:0,sections:[],energy:[],warnings:["Keine Audioproben vorhanden."]};
 const stride=Math.max(1,Math.floor(sampleRate*.5)), energy:number[]=[], onset:number[]=[];
 for(let i=0;i<samples.length;i+=stride){let sum=0;const end=Math.min(samples.length,i+stride);for(let j=i;j<end;j+=4)sum+=samples[j]*samples[j];energy.push(Math.sqrt(sum/Math.ceil((end-i)/4)));}
 const sorted=[...energy].sort((a,b)=>a-b),reference=sorted[Math.floor(sorted.length*.95)]||1;
 for(let i=0;i<energy.length;i++)energy[i]=clamp(energy[i]/reference);
 for(let i=0;i<energy.length;i++)onset.push(Math.max(0,energy[i]-(energy[i-1]??energy[i])));
 const warnings=["Abschnittsgrenzen sind heuristisch und keine garantierte Erkennung von Refrain oder Drop."];
 // Analyze 2-second windows, then merge neighbouring classifications.
 const duration=samples.length/sampleRate;let bpm=preferredBpm&&preferredBpm>=40&&preferredBpm<=240?preferredBpm:0;
 if(!bpm){let best=0,bestScore=-Infinity;const baseline=mean(onset);for(let candidate=70;candidate<=180;candidate++){const lag=120/candidate;let score=0;for(let k=Math.ceil(lag);k<onset.length;k++)score+=(onset[k]-baseline)*(onset[k-Math.round(lag)]-baseline);if(score>bestScore){bestScore=score;best=candidate;}}bpm=best||120;warnings.push("BPM sind geschätzt; Half-/Double-Time bei Rap und Hardstyle möglich.");}
 const sections:MusicSection[]=[]; const overall=mean(energy);const block=4;
 for(let i=0;i<energy.length;i+=block){const en=mean(energy.slice(i,i+block));const trans=mean(onset.slice(i,i+block));const prev=mean(energy.slice(Math.max(0,i-block*2),i)); const start=i*.5;const end=Math.min(duration,(i+block)*.5);
 let kind:AnalyzedSection=en<.18?"breakdown":en>Math.max(.63,overall+.14)&&trans>.06?"drop":en>overall+.13?"hook":en>prev+.16&&i>0?"build":"verse";
 if(i===0)kind="intro";if(end>=duration&&duration>8)kind="outro";
 const last=sections[sections.length-1];if(last&&last.kind===kind){last.end=end;last.energy=(last.energy+en)/2;last.onsetDensity=(last.onsetDensity+trans)/2;}else sections.push({start,end,kind,energy:clamp(en),onsetDensity:clamp(trans)});
 }
 return {duration,bpm,frames:energy.length,sections,energy,warnings};
}
function rankClip(clip:string,genre:ComposerGenre,section:MusicSection){const n=clip.toLowerCase();let score=0;const energetic=/jump|stomp|kick|hard|rave|dance|fast/i.test(n);const mellow=/idle|nod|head|groove|sway|slow|walk/i.test(n);if(section.kind==="drop"||section.kind==="hook")score+=energetic?3:0;else score+=mellow?3:0;if(genre==="deutschrap"||genre==="hiphop")score+=/rap|head|nod|groove|bounce|hip|step|trap/i.test(n)?5:0;return score;}
export function composeAnalyzedTimeline(analysis:StructureAnalysis, clips:string[], genre:ComposerGenre):MotionTimeline {
 const available=[...new Set(clips.filter(Boolean))];const segments:TimelineSegment[]=[];
 analysis.sections.forEach((part,i)=>{if(!available.length)return;const clip=[...available].sort((a,b)=>rankClip(b,genre,part)-rankClip(a,genre,part))[0];const duration=Math.max(.1,part.end-part.start);const fade=Math.min(.35,duration*.2);segments.push({id:`v109-${i}`,clip,track:0,start:part.start,duration,fadeIn:i===0?0:fade,fadeOut:i===analysis.sections.length-1?0:fade,speed:clamp(analysis.bpm/(genre==="deutschrap"?95:125),.65,1.6),curve:"smooth",keys:[]});
 if((part.kind==="hook"||part.kind==="drop")&&available.length>1){const accent=available.find(n=>n!==clip)!;segments.push({id:`v109-accent-${i}`,clip:accent,track:1,start:part.start,duration:Math.min(duration,60/analysis.bpm*2),fadeIn:.1,fadeOut:.2,speed:1,curve:"smooth",keys:[{at:0,value:clamp(part.energy*.5)}]});}
 });
 return sanitizeTimeline({name:`V109 Music Structure · ${genre}`,bpm:analysis.bpm,loop:false,snap:true,segments:segments.slice(0,100)});
}
