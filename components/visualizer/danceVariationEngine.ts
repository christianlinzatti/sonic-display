/** V201: deterministic variation planning for existing GLB motions. No synthesized animation data. */
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import type {ChoreographerInput,ChoreographySuggestion} from "./aiDanceChoreographer";
import {scoreDanceMotion} from "./aiDanceChoreographer";
import type {EvolutionStep} from "./smartChoreographyEvolution";
export type VariationOptions={diversity:number; intensity:number;phraseBars:number;avoidRecent:number};
export type VariationPlan=ChoreographySuggestion & {explanation:string[];variationLevel:number};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
function rand(seed:number){let state=(seed>>>0)||1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};}
/** Avoid immediate repeats and short ABA loops when alternatives exist. */
export function composeVariedDanceSequence(motions:InstalledCharacterMotion[],input:ChoreographerInput,options:Partial<VariationOptions>={}):VariationPlan {
 const diversity=clamp(options.diversity??0.7,0,1),intensity=clamp(options.intensity??input.energy,0,1);
 const phraseBars=Math.round(clamp(options.phraseBars??16,4,64));const avoidRecent=Math.round(clamp(options.avoidRecent??2,1,4));
 const count=Math.round(clamp(input.maxSteps??5,1,12));
 const random=rand((input.seed*2654435761+input.avatarId.length*97+input.phase.length*53)>>>0);
 const candidates=motions.filter(m=>m.avatarId===input.avatarId).map(m=>({m,score:scoreDanceMotion(m,{...input,energy:intensity})})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.m.id.localeCompare(b.m.id)).slice(0,24);
 if(!candidates.length)return {steps:[],score:0,totalBars:0,reason:"Keine passende installierte Motion.",explanation:[],variationLevel:diversity};
 const target=Math.min(count,Math.max(1,candidates.length*3));
 const history:string[]=[];const steps:EvolutionStep[]=[];const explanation:string[]=[];let score=0;
 for(let i=0;i<target;i++){
  const forbidden=new Set(history.slice(-avoidRecent));
  let pool=candidates.filter(c=>!forbidden.has(c.m.id));
  if(!pool.length)pool=candidates.filter(c=>c.m.id!==history[history.length-1]);
  if(!pool.length)pool=candidates;
  const best=Math.max(...pool.map(c=>c.score));
  const weighted=pool.map(c=>({c,w:Math.pow(Math.max(0.2,1+c.score-best),Math.max(0.5,3.5-diversity*3))}));
  const total=weighted.reduce((a,b)=>a+b.w,0);let pick=random()*total;
  const chosen=weighted.find(entry=>(pick-=entry.w)<=0)?.c??weighted[weighted.length-1].c;
  history.push(chosen.m.id);score+=chosen.score;
  const remaining=phraseBars-steps.reduce((sum,s)=>sum+s.bars,0);
  if(remaining<=0)break;
  const desired=Math.round(clamp((input.phase==="drop"?2:4)+(intensity<0.4?2:0)+(random()<diversity*0.5?-1:0),1,8));
  const bars=Math.min(16,remaining,Math.max(1, i===target-1?remaining:desired));
  steps.push({motionId:chosen.m.id,bars});
  explanation.push(`${chosen.m.name}: ${bars} Takte; Motion-Score ${chosen.score.toFixed(1)}; Variation ${Math.round(diversity*100)}%`);
 }
 return {steps,totalBars:steps.reduce((s,x)=>s+x.bars,0),score:Math.round(score/Math.max(1,steps.length)*10)/10,reason:`V201: ${steps.length} unterschiedliche Sequenzpositionen, Intensität ${Math.round(intensity*100)}%, ${phraseBars} Takte geplant.`,explanation,variationLevel:diversity};
}
