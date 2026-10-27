import type {ConcertSceneV528} from './cinematicConcertCoordinationV528';
import type {ConcertLipSongV561} from './concertLipPreviewV561';
import {concertLipSongClockV561,concertLipTimingV561} from './concertLipPreviewV561';
export type DuetPreviewPartV563='handoff'|'hook';
export type VerifiedPreviewCueV563=Readonly<{active:boolean;role:'lead'|'feature'|'hook'|null;leadSlot:number;singingSlots:readonly number[];handoffFrom:number|null;startMs:number;endMs:number;count:number}>;
export type DuetPreviewRoleV563=Readonly<{leadSlot:number|null;singingSlots:readonly number[];handoffFrom:number|null;cueStartMs:number;cueEndMs:number;source:'demo'|'authored'|'none';progressMs:number;description:string}>;
export type DuetPreviewModelV563=Readonly<{id:string;label:string;url:string|null}>;
export const isPreviewGlbUrlV563=(url:unknown):url is string=>typeof url==='string' && /^(?:\/(?!\/)|https?:\/\/)[^\s]*\.(?:glb|gltf)(?:\?[^\s]*)?$/i.test(url);
export function selectDuetModelsV563(primary:string|null|undefined,partner:string|null|undefined,requested:boolean,tier:'low'|'balanced'|'high'):{useReal:boolean;reason:string}{
 if(!requested)return {useReal:false,reason:'Demofiguren ausgewählt'};
 if(tier==='low')return {useReal:false,reason:'Pi/Low-Tier: ressourcenschonende Demofiguren statt zwei GLBs'};
 if(!isPreviewGlbUrlV563(primary))return {useReal:false,reason:'Erster Avatar hat kein verfügbares GLB'};
 if(!isPreviewGlbUrlV563(partner))return {useReal:false,reason:'Zweiten GLB-Avatar in der Vorschau auswählen'};
 return {useReal:true,reason:'Zwei getrennte GLB-Instanzen; keine Änderung an Originaldateien'};
}
const inactive=(progressMs=0,description='Keine bestätigte Zuordnung'):DuetPreviewRoleV563=>({leadSlot:null,singingSlots:[],handoffFrom:null,cueStartMs:0,cueEndMs:0,source:'none',progressMs,description});
/** Only explicit synthetic demo cues or V385 track-authored assignments may name the singer. */
export function planRealDuetPreviewV563(input:{
 part:DuetPreviewPartV563;elapsedSeconds:number;mode:'off'|'rap'|'singing'|'song';playing:boolean;reducedMotion:boolean;
 song?:ConcertLipSongV561|null;manualEnabled?:boolean;authoredCue?:VerifiedPreviewCueV563|null;authoredTrackId?:string|null;nowMs?:number;
}):DuetPreviewRoleV563{
 if(!input.playing||input.reducedMotion||input.mode==='off')return inactive(0,'Vorschau pausiert oder Lip-Sync ausgeschaltet');
 if(input.mode==='song'){
   const song=input.song;
   if(!song?.trackId||!song.connected||concertLipTimingV561(song.lyrics)==='none')return inactive(0,'Kein aktueller Song mit synchronisierten Lyrics');
   const clock=concertLipSongClockV561(song,input.nowMs??Date.now());
   if(!clock.playing)return inactive(clock.progressMs,'Spotify pausiert oder Wiedergabezeit veraltet');
   if(!input.manualEnabled)return inactive(clock.progressMs,'Keine aktivierten manuellen Sängerzuordnungen für diesen Song');
   const cue=input.authoredCue;
   if(!cue?.active||input.authoredTrackId!==song.trackId||cue.count!==2||
       !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>1||
       ![cue.startMs,cue.endMs].every(Number.isFinite)||cue.startMs<0||cue.endMs<=cue.startMs||
       clock.progressMs<cue.startMs||clock.progressMs>=cue.endMs||
       !['lead','feature','hook'].includes(cue.role??'')||
       !Array.isArray(cue.singingSlots)||cue.singingSlots.length<1||
       !cue.singingSlots.includes(cue.leadSlot)||
       !cue.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<2)||new Set(cue.singingSlots).size!==cue.singingSlots.length||
       (cue.role==='hook'&&cue.singingSlots.length!==2)||
       (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>1||cue.handoffFrom===cue.leadSlot)))
       return inactive(clock.progressMs,'An dieser Stelle keine bestätigte Sängerzuordnung');
   return {leadSlot:cue.leadSlot,singingSlots:cue.singingSlots,handoffFrom:cue.handoffFrom,
     cueStartMs:cue.startMs,cueEndMs:cue.endMs,source:'authored',progressMs:clock.progressMs,
     description:`Manuell zugeordnet: ${cue.role==='hook'?'beide Sänger':`Avatar ${cue.leadSlot+1}`}`};
 }
 if(!Number.isFinite(input.elapsedSeconds))return inactive();
 const ms=((Math.max(0,input.elapsedSeconds)*1000)%8400+8400)%8400;
 if(input.part==='hook')return {leadSlot:0,singingSlots:[0,1],handoffFrom:null,cueStartMs:0,cueEndMs:8400,source:'demo',progressMs:ms,description:'Simulierter gemeinsamer Hook – keine Sängerdetektion'};
 // Clearly authored synthetic cue: verse A, A->B, verse B, B->A.
 const lead=ms<3200?0:ms<6900?1:0;
 const change=ms>=3200&&ms<3900?0:ms>=6900&&ms<7600?1:null;
 const start=lead===1?3200:ms>=6900?6900:0;
 return {leadSlot:lead,singingSlots:[lead],handoffFrom:change,cueStartMs:start,cueEndMs:lead===1?6900:ms>=6900?8400:3200,
   source:'demo',progressMs:ms,description:`Simulierter Sängerwechsel – Avatar ${lead+1}`};
}
/** Existing key/fill rig consumes the same verified visual cast, no extra lights. */
export function sceneForRealDuetV563(role:DuetPreviewRoleV563,trackId:string|null|undefined):ConcertSceneV528|null{
 if(role.leadSlot===null||!trackId?.trim()||role.singingSlots.length<1)return null;
 return {active:true,trackId,cueStartMs:role.cueStartMs,cueEndMs:role.cueEndMs,count:2,
   focus:role.singingSlots.length===2?'ensemble':role.handoffFrom!==null?'handoff':'lead',
   leadSlot:role.leadSlot,singingSlots:role.singingSlots,handoffFrom:role.handoffFrom,strength:.55,
   lyricMotionGain:1,readingBoost:1,plateBoost:0};
}
