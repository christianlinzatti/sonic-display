import { sanitizeTimeline, type MotionTimeline, type TimelineSegment } from "./motionTimelineEngine";

export type ComposerGenre = "hardstyle" | "hardtekk" | "techno" | "hiphop" | "deutschrap" | "pop" | "ambient" | "auto";
export type ComposerSection = "intro" | "build" | "drop" | "breakdown" | "outro";
export type ComposerOptions = { bpm:number; genre:ComposerGenre; bars:number; energy:number; seed:number; variation:number; dropEveryBars:number; useEnergyDynamics:boolean };
export type SectionMarker = { section:ComposerSection; bar:number; seconds:number; energy:number };
export type ComposerResult = { timeline:MotionTimeline; markers:SectionMarker[]; warnings:string[] };
const clampValue=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(x)?x:min));
function seeded(seed:number){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function genreScore(name:string, genre:ComposerGenre) {
 const n=name.toLowerCase();
 const keywords:Record<string,string[]>={hardstyle:["hardstyle","kick","stomp","jump","shuffle","rave"],hardtekk:["tekk","hard","jump","bounce","rave"],techno:["techno","rave","shuffle","groove"],hiphop:["hip","bounce","groove","step"],deutschrap:["rap","hip","bounce","groove","head","nod","step","trap"],pop:["dance","pop","groove","step"],ambient:["idle","slow","sway","breath"]};
 return (keywords[genre]??["dance","groove"]).reduce((score,k)=>score+(n.includes(k)?3:0),0);
}
export function composeChoreography(availableClips:string[], options:ComposerOptions):ComposerResult {
 const clips=Array.from(new Set(availableClips.filter(c=>typeof c==="string"&&c.trim()).map(c=>c.trim()))).slice(0,200);
 const bpm=clampValue(options.bpm,40,240), bars=Math.round(clampValue(options.bars,4,64));
 const beat=60/bpm, barLength=beat*4, random=seeded(Math.round(options.seed)||1);
 const energy=clampValue(options.energy,0,1), variation=clampValue(options.variation,0,1);
 const dropEvery=Math.round(clampValue(options.dropEveryBars,4,32));
 const warnings:string[]=[];
 if (!clips.length) {warnings.push("Keine Animationsclips im aktuellen Avatar gefunden. Bitte einen animierten GLB-Avatar laden.");return {timeline:sanitizeTimeline({name:"Composer · keine Clips",loop:true,bpm,segments:[]}),markers:[],warnings};}
 if(clips.length===1)warnings.push("Nur ein Clip verfügbar: Tanzwechsel verwenden denselben Clip.");
 const ranked=[...clips].sort((a,b)=>genreScore(b,options.genre)-genreScore(a,options.genre));
 const segmentList:TimelineSegment[]=[];const markers:SectionMarker[]=[];
 const sec=(bar:number):ComposerSection=>{if(bar===0)return "intro";if(bar>=bars-2)return "outro";if(bar%dropEvery===0)return "drop";if(bar%dropEvery===dropEvery-2)return "build";if(bar%dropEvery===dropEvery-1)return "breakdown";return "build";};
 for(let bar=0;bar<bars;bar++) {
  const section=sec(bar), targetEnergy=options.useEnergyDynamics?clampValue(energy+({intro:-.3,build:0,drop:.35,breakdown:-.45,outro:-.3}[section]),0,1):energy;
  if(bar===0||markers.at(-1)?.section!==section)markers.push({section,bar,seconds:Math.round(bar*barLength*1000)/1000,energy:targetEnergy});
  const preferred=targetEnergy>.65?ranked.filter(c=>!/idle|slow|rest/i.test(c)):targetEnergy<.25?ranked.filter(c=>/idle|slow|sway|groove/i.test(c)):ranked;
  const candidates=preferred.length?preferred:ranked;
  const choiceIndex=Math.min(candidates.length-1,Math.floor(random()*Math.min(candidates.length,Math.max(1,Math.round(1+variation*(candidates.length-1))))));
  const clip=candidates[choiceIndex];const start=Math.round(bar*barLength*1000)/1000;const duration=Math.round(barLength*1000)/1000;
  const fade=Math.min(duration*.4, Math.max(.06,beat*(.12+variation*.25)));
  segmentList.push({id:`composer-${bar}-main`,clip,track:0,start,duration,fadeIn:bar===0?0:fade,fadeOut:bar===bars-1?0:fade,speed:Math.round(clampValue((bpm/120)*(.85+targetEnergy*.3),.5,2)*100)/100,curve:"smooth",keys:[]});
  if(section==="drop" && clips.length>1){const overlay=ranked.find(x=>x!==clip)??clips[0];segmentList.push({id:`composer-${bar}-accent`,clip:overlay,track:1,start,duration:Math.min(duration,beat*2),fadeIn:.05,fadeOut:Math.min(.25,beat*.3),speed:1,curve:"smooth",keys:[{at:0,value:clampValue(.25+targetEnergy*.35,0,1)}]});}
 }
 return {timeline:sanitizeTimeline({name:`AI Composer · ${options.genre} · ${bpm} BPM`,loop:true,bpm,snap:true,segments:segmentList.slice(0,40)}),markers,warnings};
}
