/** V200 – explainable, deterministic composer over installed motions. No external AI model. */
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import type {TimelinePhase} from "./musicStructureTimeline";
import {readGenreDanceSettings,scoreGenreMotion} from "./genreSpecificDanceIntelligence";
import type {EvolutionStep} from "./smartChoreographyEvolution";
export type ChoreographerInput={avatarId:string;genre:string;bpm?:number;energy:number;phase:TimelinePhase;seed:number;maxSteps?:number};
export type ChoreographySuggestion={steps:EvolutionStep[];reason:string;score:number;totalBars:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const genreMatch=(tag:string,genre:string)=>!tag||!genre||tag.toLowerCase()===genre.toLowerCase();
export function scoreDanceMotion(m:InstalledCharacterMotion,input:ChoreographerInput):number{
 if(m.avatarId!==input.avatarId)return -1;
 const bpm=Number.isFinite(input.bpm)?clamp(input.bpm!,50,240):undefined;
 if(bpm!==undefined&&(bpm<m.bpmMin||bpm>m.bpmMax))return -1;
 const section=m.section==="any"?1:m.section===input.phase?5:-3;
 const genre=m.genre?genreMatch(m.genre,input.genre)?4:-5:1;
 const name=m.name.toLowerCase();
 const energy=clamp(input.energy,0,1);
 const energetic=/kick|jump|hard|power|stomp|gabber/.test(name);
 const calm=/idle|slow|sway|ambient|relax/.test(name);
 const intensity=energetic?energy*3:calm?(1-energy)*3:1;
 const settings=readGenreDanceSettings();
 const genreBoost=settings.enabled?scoreGenreMotion(m,settings.override==="auto"?input.genre:settings.override,input.phase,energy,bpm,settings.strength):0;
 return section+genre+intensity+genreBoost;
}
const hash=(s:string)=>{let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0;};
/** Pure function: same library, inputs and seed always yield same result. */
export function composeDanceSequence(motions:InstalledCharacterMotion[],input:ChoreographerInput):ChoreographySuggestion{
 const maxSteps=Math.round(clamp(input.maxSteps??5,1,12));
 const choices=motions.filter(m=>m.avatarId===input.avatarId).map(m=>({m,score:scoreDanceMotion(m,input)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.m.id.localeCompare(b.m.id)).slice(0,24);
 if(!choices.length)return {steps:[],reason:"Keine kompatible Motion für Avatar, Genre und BPM verfügbar.",score:0,totalBars:0};
 const target=Math.min(maxSteps,choices.length===1?1:Math.max(2,Math.min(choices.length*2,maxSteps)));
 const seed=hash(`${input.avatarId}|${input.genre}|${input.phase}|${input.seed}`);
 const steps:EvolutionStep[]=[];let totalScore=0;let previous="";
 for(let i=0;i<target;i++){
  const candidates=choices.filter(x=>x.m.id!==previous);
  const pool=candidates.length?candidates:choices;
  // Rotate within well-scored candidates, favor good scores, avoid immediate repetition.
  const top=pool.filter(x=>x.score>=pool[0].score-4).slice(0,Math.min(6,pool.length));
  const idx=(seed+i*7+Math.floor(i*i/2))%top.length;
  const selected=top[idx]; previous=selected.m.id;totalScore+=selected.score;
  const base=input.phase==="drop"?2:input.phase==="build"?2:4;
  const bars=Math.round(clamp(base+(i%3===2?1:0)+(input.energy<0.3?1:0),1,16));
  steps.push({motionId:selected.m.id,bars});
 }
 return {steps,score:Math.round(totalScore/steps.length*10)/10,totalBars:steps.reduce((s,x)=>s+x.bars,0),reason:`${choices.length} kompatible Motions; Phase ${input.phase}, Genre ${input.genre||"beliebig"}, ${Number.isFinite(input.bpm)?input.bpm+" BPM":"BPM unbekannt"}; keine direkt aufeinanderfolgenden Wiederholungen.`};
}
