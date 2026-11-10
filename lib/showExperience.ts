import {TASTE_MOTIFS} from './showTaste';
export type ShowExperience={track:string;motifs:string[];shots:number[]};
export type ShowHistory=readonly ShowExperience[];
const motifSet=new Set<string>(TASTE_MOTIFS);
/** Bounded local observations. No lyrics, audio, titles or timestamps are retained. */
export function normalizeShowHistory(value:unknown):ShowExperience[]{
 if(!Array.isArray(value))return [];
 const seen=new Set<string>();
 return value.slice(0,24).flatMap(item=>{
  if(!item||typeof item!=='object'||typeof item.track!=='string'||!item.track||item.track.length>160||seen.has(item.track))return [];
  seen.add(item.track);
  const motifs=Array.isArray(item.motifs)?[...new Set<string>(item.motifs.filter((m:unknown)=>typeof m==='string'&&motifSet.has(m)))].slice(0,6):[];
  const shots=Array.isArray(item.shots)?[...new Set<number>(item.shots.filter((n:unknown)=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<4))].slice(0,4):[];
  return motifs.length||shots.length?[{track:item.track,motifs,shots}]:[];
 });
}
export function rememberShow(history:ShowHistory|undefined,track:string,entry:{motif?:string;shot?:number}):ShowExperience[]{
 const clean=normalizeShowHistory(history),old=clean.find(row=>row.track===track);
 return normalizeShowHistory([{track,motifs:[...(old?.motifs??[]),...(entry.motif?[entry.motif]:[])],shots:[...(old?.shots??[]),...(entry.shot===undefined?[]:[entry.shot])]},...clean.filter(row=>row.track!==track)]);
}
/** The current song never penalizes itself, keeping seeks and the finale coherent. */
export function experiencePenalty(history:ShowHistory|undefined,track:string,motif:string){
 return (history??[]).filter(row=>row.track!==track).slice(0,8).reduce((sum,row,i)=>sum+(row.motifs.includes(motif)?(8-i)/8:0),0)*.36;
}
export function chooseShowShot(history:ShowHistory|undefined,track:string){
 let hash=0;for(const c of track)hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;
 // Preserve the existing composition until the first actual camera experience.
 if(!(history??[]).some(row=>row.track!==track&&row.shots.length))return 0;
 let best=Infinity,selected=0;
 for(let shot=0;shot<4;shot++){
  const usage=(history??[]).filter(row=>row.track!==track).slice(0,8).reduce((n,row,i)=>n+(row.shots.includes(shot)?(8-i)/8:0),0);
  const rank=usage+((shot+4-hash%4)%4)*.05;
  if(rank<best){best=rank;selected=shot;}
 }
 return selected;
}
