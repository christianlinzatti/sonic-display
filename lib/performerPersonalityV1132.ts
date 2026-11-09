import {musicFamilyV1129} from './musicPerformanceV1129';
import type {StoryCueV1131} from './concertStoryV1131';
export type ExpressionV1132='subtle'|'balanced'|'bold';
export type PersonaV1132={label:string;head:number;shoulders:number;arms:number;flow:number;phase:number;preferred:string};
const PROFILES:Record<string,PersonaV1132>={
 'sonic-neon-pulse':{label:'Präziser Taktgeber',head:.75,shoulders:.65,arms:.8,flow:.25,phase:0,preferred:'Dance_Techno'},
 'sonic-festival-nova':{label:'Verspielte Frontfrau',head:1,shoulders:.9,arms:1.2,flow:.8,phase:.4,preferred:'Dance_Disco'},
 'sonic-chrome-beat':{label:'Mechanischer Popper',head:.65,shoulders:1.1,arms:.85,flow:.12,phase:.8,preferred:'Dance_Robot'},
 'sonic-ember-rock':{label:'Kraftvoller Rocker',head:1.2,shoulders:1.1,arms:1.1,flow:.2,phase:1.2,preferred:'Dance_RockDrive'},
 'sonic-luna-flow':{label:'Fließende Träumerin',head:.6,shoulders:.7,arms:1,flow:1.2,phase:1.6,preferred:'Dance_LiquidWave'},
 'sonic-sol-groove':{label:'Warmer Groove',head:.9,shoulders:1.2,arms:.95,flow:.9,phase:2,preferred:'Dance_LatinSway'},
 'sonic-velvet-jazz':{label:'Eleganter Improvisator',head:.7,shoulders:.8,arms:.75,flow:1,phase:2.4,preferred:'Dance_JazzSwing'},
 'sonic-atlas-prism':{label:'Präziser Bühnenarchitekt',head:.6,shoulders:1,arms:1.15,flow:.35,phase:2.8,preferred:'Dance_PopLock'},
 'sonic-aurora-synth':{label:'Weite Synth-Wellen',head:.8,shoulders:.75,arms:1.2,flow:1.1,phase:3.2,preferred:'Dance_Ripple'},
 'sonic-rio-carnival':{label:'Lebendige Rhythmustänzerin',head:1.1,shoulders:1.25,arms:1.15,flow:.85,phase:3.6,preferred:'Dance_AfroPulse'},
 'sonic-quantum-bass':{label:'Druckvoller Bass-Roboter',head:.85,shoulders:1.25,arms:1,flow:.15,phase:4,preferred:'Dance_Stomp'},
};
const FALLBACK:PersonaV1132={label:'Ausgewogener Performer',head:1,shoulders:1,arms:1,flow:.5,phase:0,preferred:'Dance_Groove'};
export function performerPersonaV1132(modelId:string):PersonaV1132{return PROFILES[modelId]??FALLBACK;}
export function expressionGainV1132(value?:ExpressionV1132){return value==='subtle'?.55:value==='bold'?1.25:1;}
export const SEQUENCE_LABELS_V1132=['Groove & Schritte','Kontrast & Akzent','Signatur & Antwort'] as const;
const POOLS:Record<string,readonly string[]>={
 hard:['Dance_Techno','Dance_SideGlide','Dance_FestivalBounce','Dance_HeelToe'],
 electronic:['Dance_House','Dance_PivotStep','Dance_Techno','Dance_DiagonalStep'],
 urban:['Dance_HipHop','Dance_HeelToe','Dance_Robot','Dance_SideGlide'],
 latin:['Dance_LatinSway','Dance_DiagonalStep','Dance_Disco','Dance_PivotStep'],
 afro:['Dance_AfroPulse','Dance_SideGlide','Dance_HipHop','Dance_HeelToe'],
 jazz:['Dance_JazzSwing','Dance_HeelToe','Dance_Groove','Dance_PivotStep'],
 rock:['Dance_RockDrive','Dance_DiagonalStep','Dance_FestivalBounce','Dance_SideGlide'],
 classical:['Dance_Waltz','Dance_PivotStep','Dance_LiquidWave','Dance_Groove'],
 ambient:['Dance_LiquidWave','Dance_Groove','Dance_Waltz','Dance_PivotStep'],
 pop:['Dance_Disco','Dance_SideGlide','Dance_House','Dance_DiagonalStep'],
 global:['Dance_Groove','Dance_DiagonalStep','Dance_House','Dance_PivotStep'],
};
/** Plan phrase-length combinations from existing clips; no skeleton or clip data changes. */
export function performanceSequenceV1132(input:{genre?:string|null;trackId:string;modelId:string;cue:StoryCueV1131;
 available:ReadonlySet<string>;recent:readonly string[];slot:number;count:number;fallback:string|null}){
 const cue=input.cue,shared=input.count>1&&(cue.interaction==='unison'||cue.interaction==='answer');
 let seed=0;for(const c of input.trackId)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 const block=Math.floor(cue.phrase/4),sequence=(seed+block+Math.max(0,cue.chorusVisit-1))%3;
 const label=SEQUENCE_LABELS_V1132[sequence];
 if(cue.act==='breathe'||cue.act==='build'||cue.act==='story'&&cue.lyricDensity>.7)return {clip:input.fallback,label:'Raum für den Song',step:0};
 const family=musicFamilyV1129(input.genre),pool=POOLS[family]??POOLS.global;
 const index=(cue.phrase%4+sequence+(shared?0:input.slot))%pool.length;
 const persona=performerPersonaV1132(input.modelId);
 const signature=!shared&&sequence===2&&cue.phrase%4===2?persona.preferred:null;
 // Shared plans use only the common library so mixed casts cannot diverge.
 const common=['Dance_Groove','Dance_Techno','Dance_House','Dance_HipHop','Dance_Disco','Dance_Shuffle','Dance_Robot','Dance_FestivalBounce','Dance_SideGlide','Dance_DiagonalStep','Dance_HeelToe','Dance_PivotStep'];
 const candidates=[signature,pool[index],input.fallback,...pool.slice(index+1),...pool.slice(0,index)].filter((name):name is string=>!!name&&input.available.has(name)&&(!shared||common.includes(name)));
 // The phase is shared. Individual performers additionally avoid their last clip.
 const refrainStep=shared&&cue.act==='lift'&&input.fallback&&/^Dance_(SideGlide|DiagonalStep|HeelToe|PivotStep)$/.test(input.fallback)&&input.available.has(input.fallback);
 const candidate=refrainStep?input.fallback:shared?candidates[0]:candidates.find(name=>name!==input.recent[0])??candidates[0];
 return {clip:candidate??input.fallback,label,step:cue.phrase%4+1};
}
/** Continuous correction only for a continuing clip. Never reverse the song clock. */
export function approachCrewOffsetV1132(previous:number,target:number,deltaSeconds:number,bpm:number):number{
 if(!Number.isFinite(previous)||!Number.isFinite(target))return Number.isFinite(target)?target:0;
 const dt=Number.isFinite(deltaSeconds)?Math.max(0,Math.min(.5,deltaSeconds)):0;
 const tempo=Number.isFinite(bpm)?Math.max(55,Math.min(210,bpm)):120;
 const maxChange=Math.min(.6,tempo/120)*dt;
 return previous+Math.max(-maxChange,Math.min(maxChange,target-previous));
}
