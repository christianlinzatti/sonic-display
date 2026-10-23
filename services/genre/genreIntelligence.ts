import { GENRE_ALIASES, normalizeGenreText, musicGenreFamily, type MusicGenre } from "@/config/musicGenres";

export type GenreEvidence = {name:string;count:number};
export type GenreFusion = {primary:MusicGenre;secondary:MusicGenre;secondaryWeight:number};
export type GenreInference = {fusion:GenreFusion|null;genre:MusicGenre|null;confidence:number;matchedTag:string|null;reason:string;source:"track"|"artist"|null;candidates:{genre:MusicGenre;score:number}[]};
// V469: one shared registry for the automatic detector, manual selector and visual director.
const GENRE_TAGS: Readonly<Record<MusicGenre,readonly string[]>> = GENRE_ALIASES;
const normalized = normalizeGenreText;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const wordMatch=(token:string,term:string)=>term.length>=4 && (` ${token} `).includes(` ${term} `);
/** Deterministic explanation; confidence is a heuristic score, not a calibrated probability.
 * Last.fm tags are noisy. Longer exact tags have priority over their broad parent genre. */
export function inferMusicGenre(tags:GenreEvidence[],title:string,artist:string,source:"track"|"artist"|null,bpm?:number|null):GenreInference{
 const scores=new Map<MusicGenre,number>();const matched=new Map<MusicGenre,string>();const evidence=new Map<MusicGenre,Set<string>>();const tagCounts=new Map<MusicGenre,number>();
 const add=(g:MusicGenre,n:number,tag:string,trustForFusion=true,count=0)=>{scores.set(g,(scores.get(g)??0)+n);if(!matched.has(g))matched.set(g,tag);
  if(trustForFusion&&tag!=="BPM-Hinweis"&&tag!=="Titel/Interpret") {if(!evidence.has(g))evidence.set(g,new Set());evidence.get(g)!.add(normalized(tag));tagCounts.set(g,(tagCounts.get(g)??0)+count);}};
 for(const tag of tags.slice(0,40)){
  const token=normalized(tag.name);const count=Number.isFinite(tag.count)?Math.max(0,tag.count):0;
  const candidates=(Object.entries(GENRE_TAGS) as [MusicGenre,readonly string[]][]).map(([g,terms])=>{
   const exact=terms.some(term=>normalized(term)===token);
   const contained=!exact&&terms.some(term=>wordMatch(token,normalized(term)));
   return {g,exact,contained};
  }).filter(c=>c.exact||c.contained);
  // A precise tag such as 'hard techno' must beat its broader 'techno' component.
  const exactPresent=candidates.some(c=>c.exact);
  for(const entry of candidates){
   if(exactPresent&&!entry.exact)continue; // prevent parent accumulating twice from one subgenre tag
   const base=entry.exact?38+(musicGenreFamily(entry.g)!==entry.g?12:0):exactPresent?5:15;
   add(entry.g,base+Math.min(18,Math.log2(count+1)*3),tag.name,count>0,count);
  }
 }
 const titleText=normalized(`${title} ${artist}`);
 // Track/artist names are weak evidence; avoid inferring genres from arbitrary names.
 for(const genre of ["hardtekk","hardstyle","hardtechno","schranz","deutschrap"] as MusicGenre[]){
  if(new RegExp(`(^|[^a-z])${genre}([^a-z]|$)`).test(titleText))add(genre,10,"Titel/Interpret");
 }
 // BPM only reinforces a genre already supported by metadata. It never determines one alone.
 if(bpm!==null&&bpm!==undefined&&Number.isFinite(bpm)&&bpm>=50&&bpm<=240){
  if(bpm>=160&&bpm<=205){if(scores.has("hardtekk"))add("hardtekk",7,"BPM-Hinweis");if(scores.has("hardstyle"))add("hardstyle",5,"BPM-Hinweis");if(scores.has("hardcore"))add("hardcore",5,"BPM-Hinweis");if(scores.has("dnb"))add("dnb",5,"BPM-Hinweis");}
  else if(bpm>=135&&bpm<160){if(scores.has("hardstyle"))add("hardstyle",4,"BPM-Hinweis");if(scores.has("techno"))add("techno",4,"BPM-Hinweis");if(scores.has("hardtechno"))add("hardtechno",4,"BPM-Hinweis");}
  else if(bpm>205&&scores.has("uptempo"))add("uptempo",6,"BPM-Hinweis");
 }
 const candidates=[...scores.entries()].map(([genre,score])=>({genre,score})).sort((a,b)=>b.score-a.score||a.genre.localeCompare(b.genre));
 const best=candidates[0];if(!best)return {genre:null,fusion:null,confidence:0,matchedTag:null,reason:"Keine eindeutigen Genre-Hinweise",source,candidates};
 const margin=best.score-(candidates[1]?.score??0);
 const confidence=clamp(Math.round(25+best.score*.48+Math.min(18,margin*.25)-(source==="artist"?12:0)),15,95);
 // Fusion requires two independent metadata signals of comparable strength.
 // One general parent tag alongside a more specific subgenre is NOT a second style.
 const second=candidates.slice(1).find(candidate=>{
   const family=musicGenreFamily(best.genre);
   if(candidate.genre===family||best.genre===musicGenreFamily(candidate.genre))return false;
   if(candidate.score<30||candidate.score<best.score*.52)return false;
   if((tagCounts.get(candidate.genre)??0)<Math.max(3,(tagCounts.get(best.genre)??0)*.2))return false;
   const a=evidence.get(best.genre),b=evidence.get(candidate.genre);
   return !!a?.size&&!!b?.size&&[...a].some(x=>![...b].includes(x));
 });
 const fusion:GenreFusion|null=second?{
   primary:best.genre,secondary:second.genre,
   secondaryWeight:Math.round(clamp(second.score/(best.score+second.score),.2,.42)*100)/100,
 }:null;
 return {genre:best.genre,fusion,confidence,matchedTag:matched.get(best.genre)??null,
  reason:`${source==="artist"?"Artist-Tags":"Track-Tags"}: ${matched.get(best.genre)??"Metadaten"}; Abstand ${Math.round(margin)}${fusion?` · Fusion ${fusion.primary} + ${fusion.secondary}`:""}`,
  source,candidates};
}
