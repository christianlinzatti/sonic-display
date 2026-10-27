/** V610 – Genre-Specific Concert Experience 6.0.
 * A fail-closed, verified-act-only direction layer for existing automatic motion,
 * one camera and two lighting rigs. Never infers sections, vocals, tempo or beats.
 * No timers, shaders, new lights or GPU allocations.
 */
import type {NarrativeCueV604,NarrativePlanV604} from './fullSongConcertDramaturgyV604';
export type GenreConcertV610='deutschrap'|'hardstyle'|'hardtekk';
export type GenreConcertInputV610={
 narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
 trackId:string;durationMs:number;positionMs:number;section:string;genre?:string|null;
 energy:number;kick:number;playing:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
};
export type GenreConcertCueV610={
 active:boolean;genre:GenreConcertV610|null;section:string;reason:'verified-genre-act'|'protected';
 dance:number;cameraDrift:number;cameraFov:number;cameraRate:number;
 key:number;fill:number;beam:number;spot:number;haze:number;sweep:number;
};
const neutral:GenreConcertCueV610={active:false,genre:null,section:'none',reason:'protected',
 dance:1,cameraDrift:1,cameraFov:0,cameraRate:1,key:1,fill:1,beam:1,spot:1,haze:1,sweep:1};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const round=(v:number)=>Math.round(v*100000)/100000;
export function resolveConcertGenreV610(value?:string|null):GenreConcertV610|null{
 if(typeof value!=='string')return null;
 const g=value.toLowerCase().trim().replace(/[_-]+/g,' ');
 if(/hard\s?tekk|hard\s?tekno|\btekk\b|\bhardtek\b/.test(g))return 'hardtekk';
 if(/hard\s?style|rawstyle|rawphoric/.test(g))return 'hardstyle';
 if(/deutsch\s?rap|german\s?rap|german\s?hip\s?hop/.test(g))return 'deutschrap';
 return null;
}
export function planGenreConcertV610(input:GenreConcertInputV610):GenreConcertCueV610{
 const plan=input.narrative?.plan,cue=input.narrative?.cue;
 const genre=resolveConcertGenreV610(input.genre);
 if(!plan||!cue||!cue.active||cue.source!=='verified-v600'||plan.source!=='verified-v600'||
   !input.playing||input.reducedMotion||input.tier==='low'||!genre||genre!==plan.genre||
   !input.trackId||input.trackId!==plan.trackId||!Number.isFinite(input.durationMs)||
   plan.durationMs!==input.durationMs||!Number.isFinite(input.positionMs)||input.positionMs<0||
   input.positionMs>=input.durationMs||!Number.isFinite(input.energy)||!Number.isFinite(input.kick)||
   input.energy<0||input.energy>1||input.kick<0||input.kick>1||
   !Number.isFinite(cue.transition)||cue.transition<0||cue.transition>1||
   !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length)return neutral;
 const act=plan.acts[cue.act];
 if(!act||act.index!==cue.act||act.chapter!==cue.chapter||act.motif!==cue.motif||
   act.repetition!==cue.repetition||act.section!==input.section||
   input.positionMs<act.startMs||input.positionMs>=act.endMs||act.endMs<=act.startMs)return neutral;
 // A labelled drop alone is not evidence of an audible drop.
 const supportedDrop=act.section==='drop'&&input.energy>=.34&&input.kick>=.17;
 const power=cue.transition*(input.tier==='high'?1:.56)*(input.lyricsProtected?.42:1);
 let dance=0,drift=0,fov=0,rate=0,key=0,fill=0,beam=0,spot=0,haze=0,sweep=0;
 if(genre==='deutschrap'){
   if(act.section==='verse'){
     // Vocal clarity: expressive performer with steady portrait and visible text.
     dance=-.06;drift=-.018;fov=-.24;rate=-.035;key=.026;fill=.02;beam=-.08;spot=.014;haze=-.09;sweep=-.11;
   }else if(act.section==='hook'){
     const together=act.repetition%2===0;
     dance=together?.035:.012;drift=together?.025:-.014;fov=together?.3:-.16;
     rate=together?.025:-.02;key=.016;fill=.014;beam=together?.04:.012;spot=together?.012:.047;haze=-.05;sweep=.018;
   }else if(act.section==='build'){
     dance=.012;drift=.009;fov=.12;rate=.015;beam=.018;spot=.018;haze=-.02;
   }else if(act.section==='break'){
     dance=-.08;drift=-.026;fov=.16;rate=-.06;beam=-.09;spot=-.045;haze=-.10;sweep=-.13;
   }
 }else if(genre==='hardstyle'){
   if(supportedDrop){
     const drive=input.energy*input.kick;
     dance=.13*drive;drift=.09*drive;fov=.8*drive;rate=.12*drive;
     key=.022*drive;fill=.018*drive;beam=.115*drive;spot=.07*drive;haze=-.012;sweep=.10*drive;
   }else if(act.section==='hook'){
     dance=.035;drift=.032;fov=.28;rate=.045;beam=.042;spot=.022;sweep=.035;haze=-.035;
   }else if(act.section==='build'){
     const build=input.energy;dance=.028*build;drift=.04*build;fov=.22*build;rate=.035*build;
     beam=.05*build;spot=.03*build;sweep=.03*build;haze=-.02;
   }else if(act.section==='verse'||act.section==='break'){
     dance=-.038;drift=-.012;fov=.1;rate=-.035;beam=-.08;spot=-.03;haze=-.07;sweep=-.085;
   }
 }else if(genre==='hardtekk'){
   if(supportedDrop){
     const drive=input.energy*input.kick;
     dance=.16*drive;drift=.12*drive;fov=.65*drive;rate=.14*drive;
     key=.016*drive;fill=.017*drive;beam=.10*drive;spot=.05*drive;haze=-.02;sweep=.12*drive;
   }else if(act.section==='hook'){
     dance=.048;drift=.04;fov=.32;rate=.055;beam=.046;spot=.022;sweep=.052;haze=-.04;
   }else if(act.section==='build'){
     dance=.026*input.energy;drift=.045*input.energy;fov=.19;rate=.035;
     beam=.04*input.energy;spot=.025*input.energy;sweep=.04*input.energy;
   }else if(act.section==='verse'||act.section==='break'){
     dance=-.035;drift=-.018;fov=.1;rate=-.025;beam=-.07;spot=-.025;haze=-.065;sweep=-.075;
   }
 }
 // A quiet/unconfirmed drop produces NO new positive drop accent.
 // No automatic lane can override an explicitly authored camera, dance or light cue.
 if(act.section==='drop'&&!supportedDrop){dance=0;drift=0;fov=0;rate=0;key=0;fill=0;beam=0;spot=0;haze=0;sweep=0;}
 const light=(v:number,lo:number,hi:number)=>round(clamp(1+v*power,lo,hi));
 return {active:true,genre,section:act.section,reason:'verified-genre-act',
   dance:input.manualDance?1:light(dance,.88,1.14),
   cameraDrift:input.manualCamera?1:light(drift,.96,1.10),
   cameraFov:input.manualCamera?0:round(clamp(fov*power,-.4,.8)),
   cameraRate:input.manualCamera?1:light(rate,.94,1.14),
   key:input.manualLighting?1:light(key,.98,1.04),fill:input.manualLighting?1:light(fill,.98,1.04),
   beam:input.manualLighting?1:light(beam,.88,1.12),spot:input.manualLighting?1:light(spot,.92,1.10),
   haze:input.manualLighting?1:light(haze,.85,1),sweep:input.manualLighting?1:light(sweep,.84,1.12)};
}
