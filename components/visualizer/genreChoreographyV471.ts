/** V471: deterministic, section-aware choreography for Rap, Rock and Pop.
 * Scene director uses genre metadata + optional V470 fusion; never guesses a singer
 * or a vocal timestamp from Spotify metadata or bass alone. */
import type {GenreFusion} from '@/services/genre/genreIntelligence';
import {resolveMusicGenre,type MusicGenre} from '@/config/musicGenres';
import type {ChoreographyMove} from './advancedDanceChoreography';

export type GenreMotionFamilyV471='rap'|'rock'|'pop'|'other';
export type MusicalSectionV471='intro'|'verse'|'chorus'|'hook'|'drop'|'build'|'break'|'outro';
export type GenreMotionCueV471={
  family:GenreMotionFamilyV471; label:string; moves:ChoreographyMove[];
  head:number; arms:number; hips:number; legs:number; pose:number;
  weight:number; reason:string;
};
type MotionCharacterV471={family:GenreMotionFamilyV471; verse:ChoreographyMove[]; hook:ChoreographyMove[]; break:ChoreographyMove[]; head:number;arms:number;hips:number;legs:number;pose:number};
const rapVerse:ChoreographyMove[]=['groove','flow','side-step'];
const rapHook:ChoreographyMove[]=['groove','drop-hit','side-step'];
const rockVerse:ChoreographyMove[]=['groove','side-step','flow'];
const rockHook:ChoreographyMove[]=['headbang-arms','drop-hit','groove'];
const popVerse:ChoreographyMove[]=['side-step','flow','groove'];
const popHook:ChoreographyMove[]=['side-step','groove','drop-hit'];
const rap:MotionCharacterV471={family:'rap',verse:rapVerse,hook:rapHook,break:['flow','groove'],head:1.30,arms:1.35,hips:1.05,legs:.66,pose:1.15};
const rock:MotionCharacterV471={family:'rock',verse:rockVerse,hook:rockHook,break:['groove','flow'],head:1.40,arms:1.18,hips:.72,legs:1.04,pose:1.28};
const pop:MotionCharacterV471={family:'pop',verse:popVerse,hook:popHook,break:['flow','side-step'],head:.82,arms:1.2,hips:1.18,legs:1.16,pose:1.05};
const styles:Partial<Record<MusicGenre,MotionCharacterV471>>={
  deutschrap:rap,hiphop:rap,trap:{...rap,head:1.18,arms:1.24,hips:1.12},
  drill:{...rap,head:1.13,arms:1.22,hips:.94,legs:.86},
  boombap:{...rap,head:1.48,arms:1.12,hips:1.12},rnb:{...rap,head:.86,arms:.96,hips:1.15},
  rock,poprock:{...rock,head:1.15,arms:1.2,legs:1.12},
  indierock:{...rock,head:1.03,arms:1.04,hips:1.04,hook:['groove','side-step','headbang-arms']},
  alternativerock:rock,punkrock:{...rock,head:1.45,arms:1.27,legs:1.23},
  metal:{...rock,head:1.5,arms:1.12,hips:.7},
  pop,indiepop:{...pop,arms:1.06,hips:1.2},
  electropop:{...pop,verse:['robot-locks','side-step','flow'],hook:['side-step','robot-locks','drop-hit']},
  dancepop:{...pop,arms:1.25,hips:1.2,legs:1.23},
};
const safe=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const canon=(raw?:string|null)=>resolveMusicGenre(raw??'')??null;
const mergeMoves=(main:ChoreographyMove[],secondary:ChoreographyMove[],w:number):ChoreographyMove[]=>{
  // Primary always remains dominant. Secondary contributes one distinct phrase option.
  if(w<.15)return main.slice();
  const result=main.slice();
  const candidate=secondary.find(m=>!result.includes(m));
  if(candidate)result.splice(Math.min(result.length,2),0,candidate);
  return result;
};
export function resolveGenreMotionV471(input:{genre?:string|null;fusion?:GenreFusion|null;section?:MusicalSectionV471|null;playing?:boolean;reducedMotion?:boolean;energy?:number;beat?:number;authored?:boolean}):GenreMotionCueV471|null{
 const id=canon(input.genre);
 if(!id)return null;
 const primary=styles[id];
 if(!primary)return null; // All other genres retain their previous movement engines.
 const fusion=input.fusion;
 const accepted=!!fusion&&fusion.primary===id&&fusion.secondary!==id&&styles[fusion.secondary]!=null&&Number.isFinite(fusion.secondaryWeight)&&fusion.secondaryWeight>=.15&&fusion.secondaryWeight<=.45;
 const secondary=accepted?styles[fusion!.secondary]!:null;
 const w=secondary?safe(fusion!.secondaryWeight,0,.45):0;
 const mix=(a:number,b:number)=>a*(1-w)+b*w;
 const section=input.section??'verse';
 const calm=section==='break'||section==='intro'||section==='outro';
 const peak=section==='hook'||section==='chorus'||section==='drop';
 const first=calm?primary.break:peak?primary.hook:primary.verse;
 const second=secondary?(calm?secondary.break:peak?secondary.hook:secondary.verse):[];
 const weight= input.playing===false||input.reducedMotion===true?0:(input.authored?.38:1)* (calm?.53:peak?1:.79) * (.76+.24*safe(input.energy??.5,0,1));
 const accents=peak?1.15:calm?.62:1;
 return {
  family:primary.family,label:secondary?`${id} + ${fusion!.secondary}`:id,
  moves:mergeMoves(first,second,w),head:mix(primary.head,secondary?.head??primary.head)*accents,
  arms:mix(primary.arms,secondary?.arms??primary.arms)*accents,
  hips:mix(primary.hips,secondary?.hips??primary.hips),legs:mix(primary.legs,secondary?.legs??primary.legs),
  pose:mix(primary.pose,secondary?.pose??primary.pose)*accents,
  weight:safe(weight,0,1),reason:`${id}${secondary?` + ${fusion!.secondary}`:''} · ${section} · ${calm?'ruhig':peak?'Hook/Drop':'Verse'}`
 };
}
