import {isProductionId,type ProductionId} from './showProduction';
export type ProgrammeItem={track:string;title:string;style:ProductionId};
export function parseProgramme(text:string):ProgrammeItem[]{
 const seen=new Set<string>();return text.split('\n').slice(0,40).flatMap(line=>{const [track,title,style]=line.split('|').map(s=>s.trim());if(!track||track.length>160||seen.has(track))return [];seen.add(track);return [{track,title:(title||track).slice(0,100),style:isProductionId(style)?style:'groove'}];});
}
export function programmeStyle(index:number,count:number):ProductionId{return index===0?'cinema':index===count-1?'festival':index===Math.floor(count/2)?'cinema':'groove';}
export function calibrationSuggestion(samples:readonly number[]){const valid=samples.filter(n=>Number.isFinite(n)&&n>=0&&n<=1);if(valid.length<30||Math.max(...valid)<.03)return null;const sorted=[...valid].sort((a,b)=>a-b);return Number(Math.max(.5,Math.min(2,.9/Math.max(.1,sorted[Math.floor(sorted.length*.75)]))).toFixed(2));}
