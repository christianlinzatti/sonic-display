import { composeChoreography, type ComposerGenre } from "./choreographyComposer";
import {MUSIC_GENRES, resolveMusicGenre, type MusicGenre} from "@/config/musicGenres";
import type {GenreFusion} from "@/services/genre/genreIntelligence";

export type AdaptiveMode = "live" | "timeline";
export type AdaptiveStyle = "auto" | MusicGenre;
export type AdaptiveProfile = {genre:ComposerGenre; label:string; bpm:number; energy:number; variation:number; aggression:number; motionStyle:"smooth"|"balanced"|"sharp"; description:string};
const BASE_PROFILES: Record<"deutschrap"|"hardstyle"|"hardtekk"|"techno"|"hiphop"|"pop"|"ambient",AdaptiveProfile> = {
 deutschrap:{genre:"deutschrap",label:"Deutschrap / Trap",bpm:90,energy:.56,variation:.42,aggression:.3,motionStyle:"smooth",description:"Head-Nod, Bounce, Verse/Hook-Grooves; vermeidet permanente Drops"},
 hardstyle:{genre:"hardstyle",label:"Hardstyle",bpm:150,energy:.94,variation:.72,aggression:.85,motionStyle:"sharp",description:"Kicks, kräftige Bewegungen und Drop-Akzente"},
 hardtekk:{genre:"hardtekk",label:"Hardtekk",bpm:170,energy:.96,variation:.86,aggression:.9,motionStyle:"sharp",description:"Schnelle Wechsel, Kick-Akzente und federnde Bewegungen"},
 techno:{genre:"techno",label:"Techno",bpm:130,energy:.73,variation:.48,aggression:.55,motionStyle:"balanced",description:"Konstanter Groove mit rhythmischen Variationen"},
 hiphop:{genre:"hiphop",label:"Hip-Hop",bpm:95,energy:.61,variation:.53,aggression:.4,motionStyle:"smooth",description:"Halftime, Groove und Head-Nod"},
 pop:{genre:"pop",label:"Pop",bpm:120,energy:.65,variation:.6,aggression:.35,motionStyle:"balanced",description:"Gleichmäßige, melodische Übergänge"},
 ambient:{genre:"ambient",label:"Ambient",bpm:80,energy:.25,variation:.25,aggression:.1,motionStyle:"smooth",description:"Ruhige, weiche Bewegungen"}
};
/** V469: distinct beat/gesture flavors; choreography still uses installed GLB clips only. */
export const PROFILES: Record<MusicGenre,AdaptiveProfile> = {
 ...BASE_PROFILES,
 rock:{...BASE_PROFILES.pop,genre:'pop',label:'Rock',bpm:115,energy:.84,variation:.65,aggression:.7,motionStyle:'sharp',description:'Körperbetonte Refrains und Headbang-Akzente'},
 trap:{...BASE_PROFILES.hiphop,genre:'hiphop',label:'Trap',bpm:140,energy:.72,variation:.49,aggression:.54,motionStyle:'sharp',description:'Halftime-Bounce und 808-Kicks'},
 drill:{...BASE_PROFILES.hiphop,genre:'hiphop',label:'Drill',bpm:143,energy:.77,variation:.45,aggression:.66,motionStyle:'sharp',description:'Kurze harte Akzente mit stabiler Verse-Bewegung'},
 boombap:{...BASE_PROFILES.deutschrap,genre:'deutschrap',label:'Boom Bap',bpm:92,energy:.51,variation:.36,aggression:.22,motionStyle:'smooth',description:'Oldschool-Head-Nod und entspannter Groove'},
 hardtechno:{...BASE_PROFILES.techno,genre:'techno',label:'Hard Techno',bpm:150,energy:.9,variation:.71,aggression:.82,motionStyle:'sharp',description:'Schnelle Kick-Grooves und harte Step-Akzente'},
 schranz:{...BASE_PROFILES.techno,genre:'techno',label:'Schranz',bpm:155,energy:.91,variation:.6,aggression:.86,motionStyle:'sharp',description:'Konstante industrielle Kick-Patterns'},
 rawstyle:{...BASE_PROFILES.hardstyle,genre:'hardstyle',label:'Rawstyle',bpm:155,energy:.97,variation:.77,aggression:.96,motionStyle:'sharp',description:'Explosive Kicks und abrupte, aber flüssige Übergänge'},
 hardcore:{...BASE_PROFILES.hardstyle,genre:'hardstyle',label:'Hardcore / Gabber',bpm:180,energy:.97,variation:.75,aggression:.92,motionStyle:'sharp',description:'Gabber-/Hakken-Groove mit schnellen Beinarbeiten'},
 uptempo:{...BASE_PROFILES.hardtekk,genre:'hardtekk',label:'Uptempo Hardcore',bpm:210,energy:.99,variation:.8,aggression:.98,motionStyle:'sharp',description:'Sehr schnelle Kick-Pulse und kurze Bewegungsakzente'},
 house:{...BASE_PROFILES.techno,genre:'techno',label:'House',bpm:124,energy:.63,variation:.5,aggression:.34,motionStyle:'smooth',description:'Wiederkehrender Four-on-the-Floor-Groove'},
 trance:{...BASE_PROFILES.techno,genre:'techno',label:'Trance',bpm:138,energy:.72,variation:.54,aggression:.38,motionStyle:'smooth',description:'Lange Builds und schwebende Bewegungen'},
 psytrance:{...BASE_PROFILES.techno,genre:'techno',label:'Psytrance',bpm:145,energy:.84,variation:.71,aggression:.62,motionStyle:'balanced',description:'Schnelle Basslinien und psychedelische Bewegung'},
 dnb:{...BASE_PROFILES.techno,genre:'techno',label:'Drum & Bass',bpm:174,energy:.84,variation:.68,aggression:.61,motionStyle:'sharp',description:'Doppelzeitige Steps und Breakbeat-Akzente'},
 dubstep:{...BASE_PROFILES.techno,genre:'techno',label:'Dubstep',bpm:140,energy:.8,variation:.64,aggression:.73,motionStyle:'sharp',description:'Halftime-Beat und Drop-Kontraste'},
 synthwave:{...BASE_PROFILES.techno,genre:'techno',label:'Synthwave',bpm:110,energy:.5,variation:.42,aggression:.2,motionStyle:'smooth',description:'Retro-Groove und ruhige Übergänge'},
 reggaeton:{...BASE_PROFILES.pop,genre:'pop',label:'Reggaeton',bpm:96,energy:.73,variation:.57,aggression:.42,motionStyle:'balanced',description:'Dembow-Rhythmus und Hüft-Groove'},
 metal:{...BASE_PROFILES.pop,genre:'pop',label:'Metal',bpm:145,energy:.91,variation:.67,aggression:.81,motionStyle:'sharp',description:'Headbang, Power-Posen und klare Refrains'},
 rnb:{...BASE_PROFILES.hiphop,genre:'hiphop',label:'R&B / Soul',bpm:88,energy:.47,variation:.38,aggression:.18,motionStyle:'smooth',description:'Vokalfokus und sanftes Sway'},
 jazz:{...BASE_PROFILES.ambient,genre:'ambient',label:'Jazz',bpm:110,energy:.38,variation:.55,aggression:.16,motionStyle:'smooth',description:'Natürlicher Swing und leichte Variationen'},
 classical:{...BASE_PROFILES.ambient,genre:'ambient',label:'Klassik',bpm:100,energy:.28,variation:.25,aggression:.1,motionStyle:'smooth',description:'Zurückhaltende Bühnenbewegungen ohne Drop-Fokus'},
 poprock:{...BASE_PROFILES.pop,label:'Pop-Rock',bpm:124,energy:.73,variation:.64,aggression:.48,motionStyle:'balanced',description:'Melodische Strophen, markante Rock-Refrains'},
 indierock:{...BASE_PROFILES.pop,label:'Indie-Rock',bpm:113,energy:.61,variation:.55,aggression:.36,motionStyle:'smooth',description:'Natürliche Band-Grooves und leichte Schwünge'},
 alternativerock:{...BASE_PROFILES.pop,label:'Alternative Rock',bpm:125,energy:.81,variation:.69,aggression:.68,motionStyle:'sharp',description:'Gitarren-Power und dynamische Refrains'},
 punkrock:{...BASE_PROFILES.pop,label:'Punk-Rock',bpm:172,energy:.91,variation:.72,aggression:.84,motionStyle:'sharp',description:'Schnelle Stomp- und Jump-Akzente'},
 indiepop:{...BASE_PROFILES.pop,label:'Indie-Pop',bpm:105,energy:.49,variation:.5,aggression:.2,motionStyle:'smooth',description:'Warmer weicher Groove und luftig leichte Vocals'},
 electropop:{...BASE_PROFILES.pop,label:'Electro-Pop',bpm:119,energy:.67,variation:.61,aggression:.4,motionStyle:'balanced',description:'Beatgenaue Synth- und Neon-Grooves'},
 dancepop:{...BASE_PROFILES.pop,label:'Dance-Pop',bpm:125,energy:.79,variation:.7,aggression:.51,motionStyle:'balanced',description:'Refrain-Choreografien und Tanzrhythmus'},
};
export function normalizeDanceGenre(raw?:string|null, override:AdaptiveStyle="auto"):MusicGenre {
 if(override!=="auto" && MUSIC_GENRES[override])return override;
 return resolveMusicGenre(raw) ?? "pop";
}
export function resolveAdaptiveProfile(raw:string|null|undefined,override:AdaptiveStyle="auto",energy?:number,bpm?:number|null,fusion?:GenreFusion|null) {
 const style=normalizeDanceGenre(raw,override);
 const primary=PROFILES[style];
 const secondary=override==="auto"&&fusion?.primary===style&&fusion.secondary!==style&&Number.isFinite(fusion.secondaryWeight)?PROFILES[fusion.secondary]:null;
 const w=secondary?Math.max(0,Math.min(.45,fusion!.secondaryWeight)):0;
 const mix=(a:number,b:number)=>a*(1-w)+b*w;
 const base=secondary?{...primary,label:`${primary.label} + ${secondary.label}`,
  energy:mix(primary.energy,secondary.energy),variation:mix(primary.variation,secondary.variation),aggression:mix(primary.aggression,secondary.aggression),
  bpm:Math.round(mix(primary.bpm,secondary.bpm)),description:`${primary.description} / ${secondary.description}`}:primary;
 const measuredEnergy=Number.isFinite(energy)?Math.max(0,Math.min(1,energy!)):base.energy;
 // Blend short-term energy conservatively to avoid wild changes on every transient.
 const mixed=.7*base.energy+.3*measuredEnergy;
 const measuredBpm=bpm&&Number.isFinite(bpm)&&bpm>=40&&bpm<=240?bpm:base.bpm;
 return {...base,energy:Math.round(mixed*100)/100,bpm:measuredBpm};
}
export function generateAdaptiveChoreography(clips:string[],profile:AdaptiveProfile,seed=42,bars=16) {
 return composeChoreography(clips,{genre:profile.genre,bpm:profile.bpm,bars,energy:profile.energy,variation:profile.variation,seed,dropEveryBars:profile.genre==="deutschrap"||profile.genre==="hiphop"?16:8,useEnergyDynamics:true});
}
