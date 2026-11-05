/** V882 – lightweight opt-in bridge from V881 to the existing R3F stage.
 * Semantic updates notify React only on genuine cue changes; the Three renderer
 * reads the latest immutable snapshot in its existing useFrame loop.
 * Nothing here creates audio analysis, singer assignments or manual cue changes. */
export type ConcertLookV882 = 'none'|'cinema'|'neon'|'arena'|'aurora';
export type ConcertManualV882 = 'shockwave'|'sweep'|'confetti'|null;
import type {ConcertMomentKindV883} from './intelligentConcertMomentsV883';
import {normalizeAtmosphereV885,type AtmospherePlanV885,type AtmosphereSettingsV885} from './dynamicConcertAtmosphereV885';
import {normalizeCinematicFogV887,type CinematicFogSettingsV887} from './cinematicFogDirectorV887';
import {normalizeLaserShowV888,type LaserShowSettingsV888} from './laserShowDirectorV888';
import {normalizeParticleV889,type ParticleSettingsV889} from './advancedParticleDirectorV889';
import {normalizeSpotlightV890,type SpotlightSettingsV890} from './professionalSpotlightShowV890';
import {normalizePyroV891,type PyroSettingsV891} from './virtualPyrotechnicsV891';
import {normalizeEpicDropV892,type EpicDropSettingsV892,type EpicDropPlanV892} from './epicDropExperienceV892';
import {normalizeArenaCrowdV893,type ArenaCrowdSettingsV893,type ArenaCrowdPlanV893} from './arenaCrowdAtmosphereV893';
import {normalizeDirectorV895,type DirectorSettingsV895,type DirectorPlanV895} from './aiConcertDirectorV895';
import {normalizeEnergyV896,type EnergySettingsV896} from './musicalEnergyIntelligenceV896';
import {normalizeCinematicCameraV897,type CinematicCameraSettingsV897} from './cinematicCameraDirectorV897';
import {normalizeCinemaV992,type CinemaSettingsV992} from './cinematicCameraDirectorV992';
import {normalizeDanceCameraV898,type DanceCameraSettingsV898} from './danceCameraCoordinationV898';
import {normalizeDanceShowV899,type DanceShowSettingsV899} from './advancedDanceShowDirectorV899';
import {normalizeChoreographyV993,type ChoreographySettingsV993} from './aiChoreographyDirectorV993';
import {normalizeVocalV994,type VocalSettingsV994} from './vocalPerformanceIntelligenceV994';
import {normalizeDuetV995,type DuetSettingsV995} from './duetEnsembleDirectorV995';
import {normalizeCrowdExperienceV996,type CrowdExperienceSettingsV996} from './virtualCrowdExperienceV996';
import {validateFlowV997,type FlowHandoverV997} from './continuousConcertFlowV997';
import {normalizeUltimateV900,type UltimateSettingsV900,type UltimatePlanV900} from './ultimateConcertExperienceV900';
import {normalizeGenreStageV894,type GenreStageSettingsV894,type GenreStagePlanV894} from './ultimateGenreStageV894';
import {DEFAULT_CINEMATIC_TRANSITIONS_V884,normalizeCinematicTransitionsV884,
 sampleCinematicTransitionV884,type CinematicTransitionsPlanV884,
 type CinematicTransitionSettingsV884} from './cinematicConcertTransitionsV884';
export interface ConcertSyncSettingsV882 { stage:boolean; lights:boolean; dance:boolean }
export const CONCERT_SYNC_KEY_V882='sonic-concert-sync-v882';
export const DEFAULT_CONCERT_SYNC_V882:Readonly<ConcertSyncSettingsV882>={stage:true,lights:true,dance:true};
export function normalizeConcertSyncV882(raw:unknown):ConcertSyncSettingsV882 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ConcertSyncSettingsV882>:{};
 return {stage:typeof s.stage==='boolean'?s.stage:true,
  lights:typeof s.lights==='boolean'?s.lights:true,
  dance:typeof s.dance==='boolean'?s.dance:true};
}
export interface ConcertStageSignalV882 {
 trackId:string; durationMs:number; playing:boolean; reducedMotion:boolean;
 enabled:boolean; intensity:number; sceneSource:'verified'|'unavailable';
 section:string; look:ConcertLookV882; sceneStartMs:number;
 manual:ConcertManualV882; manualId:number; manualStartMs:number;
 sync:ConcertSyncSettingsV882;
 /** V883: verified, selected visual moment (not an inferred audio event). */
 momentKind?:ConcertMomentKindV883|null; momentStartMs?:number; momentWeight?:number;
 /** V884: verified, immutable storyboard; sampled against the R3F playback clock. */
 transitionPlan?:CinematicTransitionsPlanV884|null;
 transitionSettings?:CinematicTransitionSettingsV884;
 transitionSeekBlockedUntilMs?:number;
 /** V885: verified atmospheric storyboard, controlled by the same stage clock. */
 atmospherePlan?:AtmospherePlanV885|null;atmosphereSettings?:AtmosphereSettingsV885;
 atmosphereSeekBlockedUntilMs?:number;
 /** V887: reuse V885 verified storyboard and existing V814 fog meshes. */
 fogSettingsV887?:CinematicFogSettingsV887;
 /** V888: single material, storyboard-authorized virtual laser graphics. */
 laserSettingsV888?:LaserShowSettingsV888;
 /** V889: reuse already allocated particle emitters; no independent FX authority. */
 particleSettingsV889?:ParticleSettingsV889;
 /** V890: Existing V308 spotlight / cone choreography only. */
 spotlightSettingsV890?:SpotlightSettingsV890;
 /** V891: optional song-scoped V604 virtual-only pyro; disabled by default. */
 pyroSettingsV891?:PyroSettingsV891;
 /** V892: selected V883 verified drop/finale moments, no inferred beats. */
 epicSettingsV892?:EpicDropSettingsV892;epicPlanV892?:EpicDropPlanV892|null;
 /** V893: read-only modifiers of already enabled V815 virtual crowd instances. */
 arenaSettingsV893?:ArenaCrowdSettingsV893;arenaPlanV893?:ArenaCrowdPlanV893|null;
 /** V900: one immutable full-song visual score and its automatic channel settings. */
 ultimateSettingsV900?:UltimateSettingsV900;ultimatePlanV900?:UltimatePlanV900|null;
 /** V899: scene-bound dance spacing and coordinated camera pace. */
 danceShowSettingsV899?:DanceShowSettingsV899;
 /** V993: optional verified-scene upper-body choreography, no clip/IK replacement. */
 choreographySettingsV993?:ChoreographySettingsV993;
 /** V994: song-bound, opt-in verified-word vocal microphrasing. */
 vocalSettingsV994?:VocalSettingsV994;
 /** V995: verified vocal-cast only, opt-in upper-body duet/hook overlays. */
 duetSettingsV995?:DuetSettingsV995;
 /** V996: opt-in, verified-scenes-only virtual audience response. */
 crowdSettingsV996?:CrowdExperienceSettingsV996;
 /** V997: observed song-bound, opt-in visual-only transition. */
 flowCueV997?:FlowHandoverV997|null;
 /** V898: coordinates only visible stage-root groups with the ONE camera. */
 danceCameraSettingsV898?:DanceCameraSettingsV898;
 /** V897: single-camera, evidence-gated cinematography on the verified V895 scene plan. */
 cameraSettingsV897?:CinematicCameraSettingsV897;
 /** V992: optional post-V897 micro-composition of the same verified camera. */
 cameraSettingsV992?:CinemaSettingsV992;
 /** V896: measured live audio gain sensitivity. No fake musical events. */
 energySettingsV896?:EnergySettingsV896;
 /** V895: single verified full-song coordinated direction; never overrides manual authoring. */
 directorSettingsV895?:DirectorSettingsV895;directorPlanV895?:DirectorPlanV895|null;
 /** V894: verified, decorative genre architecture. Stage presets remain user-owned. */
 genreStageSettingsV894?:GenreStageSettingsV894;genreStagePlanV894?:GenreStagePlanV894|null;
}
export const OFF_CONCERT_SIGNAL_V882:Readonly<ConcertStageSignalV882>=Object.freeze({
 trackId:'',durationMs:0,playing:false,reducedMotion:false,enabled:false,intensity:0,
 sceneSource:'unavailable',section:'',look:'none',sceneStartMs:-1,
 manual:null,manualId:0,manualStartMs:-1,sync:DEFAULT_CONCERT_SYNC_V882,
});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const looks:readonly ConcertLookV882[]=['none','cinema','neon','arena','aurora'];
const manualKinds:readonly Exclude<ConcertManualV882,null>[]=['shockwave','sweep','confetti'];
const momentKinds:readonly ConcertMomentKindV883[]=['rise','hook','drop','finale'];
let snapshot:Readonly<ConcertStageSignalV882>=OFF_CONCERT_SIGNAL_V882;
const subscribers=new Set<()=>void>();
export function readConcertStageSyncV882():Readonly<ConcertStageSignalV882>{return snapshot;}
export function subscribeConcertStageSyncV882(listener:()=>void):()=>void {
 subscribers.add(listener);return ()=>{subscribers.delete(listener);};
}
/** Sanitise at the boundary; keep snapshots referentially stable across playback ticks. */
export function publishConcertStageSyncV882(input:ConcertStageSignalV882|null):void {
 let next:Readonly<ConcertStageSignalV882>=OFF_CONCERT_SIGNAL_V882;
 if(input&&typeof input.trackId==='string'&&input.trackId.length>0&&input.trackId.length<=160&&
   finite(input.durationMs)&&input.durationMs>=10000&&input.durationMs<=1800000){
  const active=input.playing===true&&input.enabled===true&&input.reducedMotion!==true&&
   finite(input.intensity)&&input.intensity>0;
  const source=input.sceneSource==='verified'?'verified':'unavailable';
  const look=active&&source==='verified'&&looks.includes(input.look)?input.look:'none';
  const manual=active&&manualKinds.includes(input.manual as Exclude<ConcertManualV882,null>)&&
   Number.isInteger(input.manualId)&&input.manualId>0&&finite(input.manualStartMs)&&
   input.manualStartMs>=0&&input.manualStartMs<=input.durationMs?input.manual:null;
  const validMoment=active&&source==='verified'&&momentKinds.includes(input.momentKind as ConcertMomentKindV883)&&
   finite(input.momentStartMs)&&input.momentStartMs>=0&&input.momentStartMs<input.durationMs&&
   finite(input.sceneStartMs)&&input.sceneStartMs<=input.momentStartMs&&
   finite(input.momentWeight)&&input.momentWeight>=0&&input.momentWeight<=1;
  next={trackId:input.trackId,durationMs:input.durationMs,playing:active,reducedMotion:input.reducedMotion===true,
   enabled:active,intensity:active?clamp(input.intensity,0,1):0,sceneSource:source,
   section:source==='verified'&&typeof input.section==='string'?input.section.slice(0,32):'',look,
   sceneStartMs:source==='verified'&&finite(input.sceneStartMs)&&input.sceneStartMs>=0&&
    input.sceneStartMs<input.durationMs?input.sceneStartMs:-1,
   manual,manualId:manual?input.manualId:0,manualStartMs:manual?input.manualStartMs:-1,
   sync:normalizeConcertSyncV882(input.sync),
   momentKind:validMoment?input.momentKind:null,
   momentStartMs:validMoment?input.momentStartMs:-1,
   momentWeight:validMoment?input.momentWeight:0,
   transitionPlan:active&&source==='verified'&&input.transitionPlan?.source==='verified-v604'&&
    input.transitionPlan.trackId===input.trackId&&input.transitionPlan.durationMs===input.durationMs
    ?input.transitionPlan:null,
   transitionSettings:normalizeCinematicTransitionsV884(input.transitionSettings),
   transitionSeekBlockedUntilMs:active&&finite(input.transitionSeekBlockedUntilMs)?
    clamp(input.transitionSeekBlockedUntilMs,0,input.durationMs+3000):0,
   atmospherePlan:active&&source==='verified'&&input.atmospherePlan?.source==='verified-v604'&&
    input.atmospherePlan.trackId===input.trackId&&input.atmospherePlan.durationMs===input.durationMs?input.atmospherePlan:null,
   atmosphereSettings:normalizeAtmosphereV885(input.atmosphereSettings),
   fogSettingsV887:normalizeCinematicFogV887(input.fogSettingsV887),
   laserSettingsV888:normalizeLaserShowV888(input.laserSettingsV888),
   particleSettingsV889:normalizeParticleV889(input.particleSettingsV889),
   spotlightSettingsV890:normalizeSpotlightV890(input.spotlightSettingsV890),
   pyroSettingsV891:normalizePyroV891(input.pyroSettingsV891),
   epicSettingsV892:normalizeEpicDropV892(input.epicSettingsV892),
   arenaSettingsV893:normalizeArenaCrowdV893(input.arenaSettingsV893),
   genreStageSettingsV894:normalizeGenreStageV894(input.genreStageSettingsV894),
   directorSettingsV895:normalizeDirectorV895(input.directorSettingsV895),
   energySettingsV896:normalizeEnergyV896(input.energySettingsV896),
   cameraSettingsV897:normalizeCinematicCameraV897(input.cameraSettingsV897),
   cameraSettingsV992:normalizeCinemaV992(input.cameraSettingsV992),
   danceCameraSettingsV898:normalizeDanceCameraV898(input.danceCameraSettingsV898),
   danceShowSettingsV899:normalizeDanceShowV899(input.danceShowSettingsV899),
   choreographySettingsV993:normalizeChoreographyV993(input.choreographySettingsV993),
   vocalSettingsV994:normalizeVocalV994(input.vocalSettingsV994),
   duetSettingsV995:normalizeDuetV995(input.duetSettingsV995),
   crowdSettingsV996:normalizeCrowdExperienceV996(input.crowdSettingsV996),
   flowCueV997:active?validateFlowV997(input.flowCueV997,input.trackId):null,
   ultimateSettingsV900:normalizeUltimateV900(input.ultimateSettingsV900),
   ultimatePlanV900:active&&source==='verified'&&input.ultimatePlanV900?.source==='verified-v604'&&
    input.ultimatePlanV900.trackId===input.trackId&&input.ultimatePlanV900.durationMs===input.durationMs
    ?input.ultimatePlanV900:null,
   directorPlanV895:active&&source==='verified'&&input.directorPlanV895?.source==='verified-v604'&&
    input.directorPlanV895.trackId===input.trackId&&input.directorPlanV895.durationMs===input.durationMs
    ?input.directorPlanV895:null,
   genreStagePlanV894:active&&source==='verified'&&input.genreStagePlanV894?.source==='verified-v604'&&
    input.genreStagePlanV894.trackId===input.trackId&&input.genreStagePlanV894.durationMs===input.durationMs
    ?input.genreStagePlanV894:null,
   arenaPlanV893:active&&source==='verified'&&input.arenaPlanV893?.source==='verified-v604'&&
    input.arenaPlanV893.trackId===input.trackId&&input.arenaPlanV893.durationMs===input.durationMs
    ?input.arenaPlanV893:null,
   epicPlanV892:active&&source==='verified'&&input.epicPlanV892?.source==='verified-v604'&&
    input.epicPlanV892.trackId===input.trackId&&input.epicPlanV892.durationMs===input.durationMs
    ?input.epicPlanV892:null,
   atmosphereSeekBlockedUntilMs:active&&finite(input.atmosphereSeekBlockedUntilMs)?
    clamp(input.atmosphereSeekBlockedUntilMs,0,input.durationMs+3000):0};
 }
 if(snapshot===next)return;
 if(snapshot.trackId===next.trackId&&snapshot.durationMs===next.durationMs&&
  snapshot.playing===next.playing&&snapshot.enabled===next.enabled&&
  snapshot.reducedMotion===next.reducedMotion&&snapshot.intensity===next.intensity&&
  snapshot.sceneSource===next.sceneSource&&snapshot.section===next.section&&
  snapshot.look===next.look&&snapshot.sceneStartMs===next.sceneStartMs&&
  snapshot.manual===next.manual&&snapshot.manualId===next.manualId&&
  snapshot.manualStartMs===next.manualStartMs&&
  snapshot.momentKind===next.momentKind&&snapshot.momentStartMs===next.momentStartMs&&
  snapshot.momentWeight===next.momentWeight&&
  snapshot.transitionPlan===next.transitionPlan&&
  snapshot.transitionSeekBlockedUntilMs===next.transitionSeekBlockedUntilMs&&
  snapshot.transitionSettings?.enabled===next.transitionSettings?.enabled&&
  snapshot.transitionSettings?.style===next.transitionSettings?.style&&
  snapshot.transitionSettings?.camera===next.transitionSettings?.camera&&
  snapshot.transitionSettings?.lights===next.transitionSettings?.lights&&
  snapshot.transitionSettings?.visual===next.transitionSettings?.visual&&
  snapshot.atmospherePlan===next.atmospherePlan&&
  snapshot.atmosphereSeekBlockedUntilMs===next.atmosphereSeekBlockedUntilMs&&
  snapshot.atmosphereSettings?.enabled===next.atmosphereSettings?.enabled&&
  snapshot.atmosphereSettings?.palette===next.atmosphereSettings?.palette&&
  snapshot.atmosphereSettings?.pace===next.atmosphereSettings?.pace&&
  snapshot.atmosphereSettings?.intensity===next.atmosphereSettings?.intensity&&
  snapshot.atmosphereSettings?.lights===next.atmosphereSettings?.lights&&
  snapshot.atmosphereSettings?.environment===next.atmosphereSettings?.environment&&
  snapshot.atmosphereSettings?.haze===next.atmosphereSettings?.haze&&
  snapshot.atmosphereSettings?.overlay===next.atmosphereSettings?.overlay&&
  snapshot.fogSettingsV887?.enabled===next.fogSettingsV887?.enabled&&
  snapshot.fogSettingsV887?.mood===next.fogSettingsV887?.mood&&
  snapshot.fogSettingsV887?.motion===next.fogSettingsV887?.motion&&
  snapshot.fogSettingsV887?.intensity===next.fogSettingsV887?.intensity&&
  snapshot.fogSettingsV887?.floor===next.fogSettingsV887?.floor&&
  snapshot.fogSettingsV887?.shafts===next.fogSettingsV887?.shafts&&
  snapshot.fogSettingsV887?.protectLyrics===next.fogSettingsV887?.protectLyrics&&
  snapshot.laserSettingsV888?.enabled===next.laserSettingsV888?.enabled&&
  snapshot.laserSettingsV888?.pattern===next.laserSettingsV888?.pattern&&
  snapshot.laserSettingsV888?.motion===next.laserSettingsV888?.motion&&
  snapshot.laserSettingsV888?.intensity===next.laserSettingsV888?.intensity&&
  snapshot.laserSettingsV888?.protectLyrics===next.laserSettingsV888?.protectLyrics&&
  snapshot.laserSettingsV888?.useScenePalette===next.laserSettingsV888?.useScenePalette&&
  snapshot.particleSettingsV889?.enabled===next.particleSettingsV889?.enabled&&
  snapshot.particleSettingsV889?.mode===next.particleSettingsV889?.mode&&
  snapshot.particleSettingsV889?.mood===next.particleSettingsV889?.mood&&
  snapshot.particleSettingsV889?.focus===next.particleSettingsV889?.focus&&
  snapshot.particleSettingsV889?.intensity===next.particleSettingsV889?.intensity&&
  snapshot.particleSettingsV889?.protectLyrics===next.particleSettingsV889?.protectLyrics&&
  snapshot.particleSettingsV889?.bubbles===next.particleSettingsV889?.bubbles&&
  snapshot.particleSettingsV889?.foam===next.particleSettingsV889?.foam&&
  snapshot.particleSettingsV889?.streamers===next.particleSettingsV889?.streamers&&
  snapshot.particleSettingsV889?.confetti===next.particleSettingsV889?.confetti&&
  snapshot.spotlightSettingsV890?.enabled===next.spotlightSettingsV890?.enabled&&
  snapshot.spotlightSettingsV890?.style===next.spotlightSettingsV890?.style&&
  snapshot.spotlightSettingsV890?.mood===next.spotlightSettingsV890?.mood&&
  snapshot.spotlightSettingsV890?.intensity===next.spotlightSettingsV890?.intensity&&
  snapshot.spotlightSettingsV890?.followArtists===next.spotlightSettingsV890?.followArtists&&
  snapshot.spotlightSettingsV890?.protectLyrics===next.spotlightSettingsV890?.protectLyrics&&
  snapshot.spotlightSettingsV890?.softTransitions===next.spotlightSettingsV890?.softTransitions&&
  snapshot.pyroSettingsV891?.enabled===next.pyroSettingsV891?.enabled&&
  snapshot.pyroSettingsV891?.style===next.pyroSettingsV891?.style&&
  snapshot.pyroSettingsV891?.mode===next.pyroSettingsV891?.mode&&
  snapshot.pyroSettingsV891?.intensity===next.pyroSettingsV891?.intensity&&
  snapshot.pyroSettingsV891?.protectLyrics===next.pyroSettingsV891?.protectLyrics&&
  snapshot.pyroSettingsV891?.flames===next.pyroSettingsV891?.flames&&
  snapshot.pyroSettingsV891?.jets===next.pyroSettingsV891?.jets&&
  snapshot.pyroSettingsV891?.sparks===next.pyroSettingsV891?.sparks&&
  snapshot.ultimatePlanV900===next.ultimatePlanV900&&
  snapshot.ultimateSettingsV900?.enabled===next.ultimateSettingsV900?.enabled&&
  snapshot.ultimateSettingsV900?.style===next.ultimateSettingsV900?.style&&
  snapshot.ultimateSettingsV900?.intensity===next.ultimateSettingsV900?.intensity&&
  snapshot.ultimateSettingsV900?.protectLyrics===next.ultimateSettingsV900?.protectLyrics&&
  snapshot.ultimateSettingsV900?.smoothTransitions===next.ultimateSettingsV900?.smoothTransitions&&
  snapshot.ultimateSettingsV900?.contrast===next.ultimateSettingsV900?.contrast&&
  snapshot.ultimateSettingsV900?.energyResponse===next.ultimateSettingsV900?.energyResponse&&
  snapshot.ultimateSettingsV900?.camera===next.ultimateSettingsV900?.camera&&
  snapshot.ultimateSettingsV900?.dance===next.ultimateSettingsV900?.dance&&
  snapshot.ultimateSettingsV900?.lights===next.ultimateSettingsV900?.lights&&
  snapshot.ultimateSettingsV900?.led===next.ultimateSettingsV900?.led&&
  snapshot.ultimateSettingsV900?.stage===next.ultimateSettingsV900?.stage&&
  snapshot.flowCueV997?.fromTrackId===next.flowCueV997?.fromTrackId&&
  snapshot.flowCueV997?.toTrackId===next.flowCueV997?.toTrackId&&
  snapshot.flowCueV997?.startedAtMs===next.flowCueV997?.startedAtMs&&
  snapshot.flowCueV997?.durationMs===next.flowCueV997?.durationMs&&
  snapshot.flowCueV997?.style===next.flowCueV997?.style&&
  snapshot.flowCueV997?.intensity===next.flowCueV997?.intensity&&
  snapshot.crowdSettingsV996?.enabled===next.crowdSettingsV996?.enabled&&
  snapshot.crowdSettingsV996?.style===next.crowdSettingsV996?.style&&
  snapshot.crowdSettingsV996?.intensity===next.crowdSettingsV996?.intensity&&
  snapshot.crowdSettingsV996?.glowsticks===next.crowdSettingsV996?.glowsticks&&
  snapshot.crowdSettingsV996?.waves===next.crowdSettingsV996?.waves&&
  snapshot.crowdSettingsV996?.reactions===next.crowdSettingsV996?.reactions&&
  snapshot.crowdSettingsV996?.protectLyrics===next.crowdSettingsV996?.protectLyrics&&
  snapshot.duetSettingsV995?.enabled===next.duetSettingsV995?.enabled&&
  snapshot.duetSettingsV995?.style===next.duetSettingsV995?.style&&
  snapshot.duetSettingsV995?.intensity===next.duetSettingsV995?.intensity&&
  snapshot.duetSettingsV995?.partnerGaze===next.duetSettingsV995?.partnerGaze&&
  snapshot.duetSettingsV995?.handoffGestures===next.duetSettingsV995?.handoffGestures&&
  snapshot.duetSettingsV995?.sharedHooks===next.duetSettingsV995?.sharedHooks&&
  snapshot.duetSettingsV995?.protectLyrics===next.duetSettingsV995?.protectLyrics&&
  snapshot.vocalSettingsV994?.enabled===next.vocalSettingsV994?.enabled&&
  snapshot.vocalSettingsV994?.style===next.vocalSettingsV994?.style&&
  snapshot.vocalSettingsV994?.intensity===next.vocalSettingsV994?.intensity&&
  snapshot.vocalSettingsV994?.mouthTiming===next.vocalSettingsV994?.mouthTiming&&
  snapshot.vocalSettingsV994?.phraseExpression===next.vocalSettingsV994?.phraseExpression&&
  snapshot.vocalSettingsV994?.headAccents===next.vocalSettingsV994?.headAccents&&
  snapshot.choreographySettingsV993?.enabled===next.choreographySettingsV993?.enabled&&
  snapshot.choreographySettingsV993?.style===next.choreographySettingsV993?.style&&
  snapshot.choreographySettingsV993?.intensity===next.choreographySettingsV993?.intensity&&
  snapshot.choreographySettingsV993?.ensembleSync===next.choreographySettingsV993?.ensembleSync&&
  snapshot.choreographySettingsV993?.smoothTransitions===next.choreographySettingsV993?.smoothTransitions&&
  snapshot.choreographySettingsV993?.energyAccents===next.choreographySettingsV993?.energyAccents&&
  snapshot.choreographySettingsV993?.protectLyrics===next.choreographySettingsV993?.protectLyrics&&
  snapshot.choreographySettingsV993?.protectFootwork===next.choreographySettingsV993?.protectFootwork&&
  snapshot.danceShowSettingsV899?.enabled===next.danceShowSettingsV899?.enabled&&
  snapshot.danceShowSettingsV899?.style===next.danceShowSettingsV899?.style&&
  snapshot.danceShowSettingsV899?.intensity===next.danceShowSettingsV899?.intensity&&
  snapshot.danceShowSettingsV899?.formations===next.danceShowSettingsV899?.formations&&
  snapshot.danceShowSettingsV899?.transitions===next.danceShowSettingsV899?.transitions&&
  snapshot.danceShowSettingsV899?.cameraSync===next.danceShowSettingsV899?.cameraSync&&
  snapshot.danceShowSettingsV899?.energyResponse===next.danceShowSettingsV899?.energyResponse&&
  snapshot.danceShowSettingsV899?.protectLyrics===next.danceShowSettingsV899?.protectLyrics&&
  snapshot.danceShowSettingsV899?.protectFootwork===next.danceShowSettingsV899?.protectFootwork&&
  snapshot.danceCameraSettingsV898?.enabled===next.danceCameraSettingsV898?.enabled&&
  snapshot.danceCameraSettingsV898?.style===next.danceCameraSettingsV898?.style&&
  snapshot.danceCameraSettingsV898?.mode===next.danceCameraSettingsV898?.mode&&
  snapshot.danceCameraSettingsV898?.intensity===next.danceCameraSettingsV898?.intensity&&
  snapshot.danceCameraSettingsV898?.solo===next.danceCameraSettingsV898?.solo&&
  snapshot.danceCameraSettingsV898?.duet===next.danceCameraSettingsV898?.duet&&
  snapshot.danceCameraSettingsV898?.ensemble===next.danceCameraSettingsV898?.ensemble&&
  snapshot.danceCameraSettingsV898?.motionFollow===next.danceCameraSettingsV898?.motionFollow&&
  snapshot.danceCameraSettingsV898?.protectLyrics===next.danceCameraSettingsV898?.protectLyrics&&
  snapshot.danceCameraSettingsV898?.protectDuets===next.danceCameraSettingsV898?.protectDuets&&
  snapshot.cameraSettingsV992?.enabled===next.cameraSettingsV992?.enabled&&
  snapshot.cameraSettingsV992?.mode===next.cameraSettingsV992?.mode&&
  snapshot.cameraSettingsV992?.intensity===next.cameraSettingsV992?.intensity&&
  snapshot.cameraSettingsV992?.accents===next.cameraSettingsV992?.accents&&
  snapshot.cameraSettingsV992?.protectLyrics===next.cameraSettingsV992?.protectLyrics&&
  snapshot.cameraSettingsV992?.protectDuets===next.cameraSettingsV992?.protectDuets&&
  snapshot.cameraSettingsV897?.enabled===next.cameraSettingsV897?.enabled&&
  snapshot.cameraSettingsV897?.style===next.cameraSettingsV897?.style&&
  snapshot.cameraSettingsV897?.preference===next.cameraSettingsV897?.preference&&
  snapshot.cameraSettingsV897?.intensity===next.cameraSettingsV897?.intensity&&
  snapshot.cameraSettingsV897?.protectLyrics===next.cameraSettingsV897?.protectLyrics&&
  snapshot.cameraSettingsV897?.protectDuets===next.cameraSettingsV897?.protectDuets&&
  snapshot.cameraSettingsV897?.portrait===next.cameraSettingsV897?.portrait&&
  snapshot.cameraSettingsV897?.orbit===next.cameraSettingsV897?.orbit&&
  snapshot.cameraSettingsV897?.dolly===next.cameraSettingsV897?.dolly&&
  snapshot.cameraSettingsV897?.crane===next.cameraSettingsV897?.crane&&
  snapshot.cameraSettingsV897?.wide===next.cameraSettingsV897?.wide&&
  snapshot.energySettingsV896?.enabled===next.energySettingsV896?.enabled&&
  snapshot.energySettingsV896?.style===next.energySettingsV896?.style&&
  snapshot.energySettingsV896?.sensitivity===next.energySettingsV896?.sensitivity&&
  snapshot.energySettingsV896?.protectLyrics===next.energySettingsV896?.protectLyrics&&
  snapshot.energySettingsV896?.dynamics===next.energySettingsV896?.dynamics&&
  snapshot.energySettingsV896?.bass===next.energySettingsV896?.bass&&
  snapshot.energySettingsV896?.camera===next.energySettingsV896?.camera&&
  snapshot.energySettingsV896?.dance===next.energySettingsV896?.dance&&
  snapshot.energySettingsV896?.lights===next.energySettingsV896?.lights&&
  snapshot.energySettingsV896?.led===next.energySettingsV896?.led&&
  snapshot.directorPlanV895===next.directorPlanV895&&
  snapshot.directorSettingsV895?.enabled===next.directorSettingsV895?.enabled&&
  snapshot.directorSettingsV895?.style===next.directorSettingsV895?.style&&
  snapshot.directorSettingsV895?.intensity===next.directorSettingsV895?.intensity&&
  snapshot.directorSettingsV895?.protectLyrics===next.directorSettingsV895?.protectLyrics&&
  snapshot.directorSettingsV895?.camera===next.directorSettingsV895?.camera&&
  snapshot.directorSettingsV895?.dance===next.directorSettingsV895?.dance&&
  snapshot.directorSettingsV895?.lights===next.directorSettingsV895?.lights&&
  snapshot.directorSettingsV895?.led===next.directorSettingsV895?.led&&
  snapshot.directorSettingsV895?.stage===next.directorSettingsV895?.stage&&
  snapshot.genreStagePlanV894===next.genreStagePlanV894&&
  snapshot.genreStageSettingsV894?.enabled===next.genreStageSettingsV894?.enabled&&
  snapshot.genreStageSettingsV894?.look===next.genreStageSettingsV894?.look&&
  snapshot.genreStageSettingsV894?.intensity===next.genreStageSettingsV894?.intensity&&
  snapshot.genreStageSettingsV894?.pace===next.genreStageSettingsV894?.pace&&
  snapshot.genreStageSettingsV894?.architecture===next.genreStageSettingsV894?.architecture&&
  snapshot.genreStageSettingsV894?.lightTint===next.genreStageSettingsV894?.lightTint&&
  snapshot.genreStageSettingsV894?.protectLyrics===next.genreStageSettingsV894?.protectLyrics&&
  snapshot.arenaPlanV893===next.arenaPlanV893&&
  snapshot.arenaSettingsV893?.enabled===next.arenaSettingsV893?.enabled&&
  snapshot.arenaSettingsV893?.style===next.arenaSettingsV893?.style&&
  snapshot.arenaSettingsV893?.intensity===next.arenaSettingsV893?.intensity&&
  snapshot.arenaSettingsV893?.phones===next.arenaSettingsV893?.phones&&
  snapshot.arenaSettingsV893?.waves===next.arenaSettingsV893?.waves&&
  snapshot.arenaSettingsV893?.silhouettes===next.arenaSettingsV893?.silhouettes&&
  snapshot.arenaSettingsV893?.protectLyrics===next.arenaSettingsV893?.protectLyrics&&
  snapshot.epicPlanV892===next.epicPlanV892&&
  snapshot.epicSettingsV892?.enabled===next.epicSettingsV892?.enabled&&
  snapshot.epicSettingsV892?.style===next.epicSettingsV892?.style&&
  snapshot.epicSettingsV892?.intensity===next.epicSettingsV892?.intensity&&
  snapshot.epicSettingsV892?.protectLyrics===next.epicSettingsV892?.protectLyrics&&
  snapshot.epicSettingsV892?.stage===next.epicSettingsV892?.stage&&
  snapshot.epicSettingsV892?.led===next.epicSettingsV892?.led&&
  snapshot.epicSettingsV892?.laser===next.epicSettingsV892?.laser&&
  snapshot.epicSettingsV892?.spotlight===next.epicSettingsV892?.spotlight&&
  snapshot.epicSettingsV892?.pyro===next.epicSettingsV892?.pyro&&
  snapshot.epicSettingsV892?.dance===next.epicSettingsV892?.dance&&
  snapshot.epicSettingsV892?.camera===next.epicSettingsV892?.camera&&
  snapshot.sync.stage===next.sync.stage&&
  snapshot.sync.lights===next.sync.lights&&snapshot.sync.dance===next.sync.dance)return;
 snapshot=next;
 subscribers.forEach(fn=>fn());
}
export interface ConcertStageSampleV882 {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';manualLighting?:boolean;blackout?:boolean;
 manualDance?:boolean;lyricsProtected?:boolean;
}
export interface ConcertStageCueV882 {
 ringOpacity:number;ringScale:number;confettiOpacity:number;confettiProgress:number;
 beamGain:number;beamOffset:number;danceGain:number;look:ConcertLookV882;
}
export const OFF_CONCERT_STAGE_V882:Readonly<ConcertStageCueV882>={
 ringOpacity:0,ringScale:1,confettiOpacity:0,confettiProgress:0,
 beamGain:1,beamOffset:0,danceGain:1,look:'none',
};
/** No strobe, no new lights, no forced camera, and no changes to authored dance.
 * Important: caller's playback clock is authoritative for seeking and pauses. */
export function planConcertStageV882(signal:Readonly<ConcertStageSignalV882>,
 sample:ConcertStageSampleV882):ConcertStageCueV882 {
 if(!signal.enabled||!signal.playing||signal.reducedMotion||!sample.playing||sample.reducedMotion||
  !signal.trackId||signal.trackId!==sample.trackId||signal.durationMs!==sample.durationMs||
  !finite(sample.positionMs)||sample.positionMs<0||sample.positionMs>sample.durationMs+1500||
  sample.blackout||signal.intensity<=0)return {...OFF_CONCERT_STAGE_V882};
 const amount=clamp(signal.intensity,0,1);
 const scene=signal.sceneSource==='verified'&&signal.sceneStartMs>=0&&
   sample.positionMs>=signal.sceneStartMs;
 const look=scene?signal.look:'none';
 const delta=sample.positionMs-signal.manualStartMs;
 const manual=signal.manual&&signal.manualId>0&&delta>=0&&delta<6000?signal.manual:null;
 const momentAge=sample.positionMs-(signal.momentStartMs??-1);
 const moment=scene&&signal.momentKind&&finite(signal.momentStartMs)&&
   signal.momentStartMs>=signal.sceneStartMs&&finite(signal.momentWeight)&&
   signal.momentWeight>0&&momentAge>=0&&momentAge<5200&&!manual?signal.momentKind:null;
 const momentLevel=moment?amount*clamp(signal.momentWeight??0,0,1):0;
 const transition=scene?sampleCinematicTransitionV884({
  plan:signal.transitionPlan,trackId:sample.trackId,durationMs:sample.durationMs,
  positionMs:sample.positionMs,playing:sample.playing,reducedMotion:sample.reducedMotion,
  settings:signal.transitionSettings??DEFAULT_CINEMATIC_TRANSITIONS_V884,
  autoEnabled:signal.enabled,seekBlocked:sample.positionMs<(signal.transitionSeekBlockedUntilMs??0),
  manualCamera:true,manualLighting:sample.manualLighting,lyricsProtected:sample.lyricsProtected,
  blackout:sample.blackout,tier:sample.tier,manualFx:!!manual,
 }):null;
 const stageOn=signal.sync.stage&&sample.tier!=='low';
 const lightsOn=signal.sync.lights&&sample.tier!=='low'&&!sample.manualLighting&&
   !sample.lyricsProtected;
 const danceOn=signal.sync.dance&&sample.tier!=='low'&&!sample.manualDance;
 let ringOpacity=0,ringScale=1,confettiOpacity=0,confettiProgress=0,beamGain=1,beamOffset=0,danceGain=1;
 if(stageOn){
  // One gently fading ring at a verified drop boundary; never infer an audio beat.
  const sectionAge=sample.positionMs-signal.sceneStartMs;
  const automaticRing=scene&&signal.section==='drop'&&sectionAge>=0&&sectionAge<1700;
  if(automaticRing){const p=sectionAge/1700;ringOpacity=.2*amount*(1-p);ringScale=.8+p*2.1;}
  if(manual==='shockwave'&&delta<2300){const p=delta/2300;
   ringOpacity=Math.max(ringOpacity,.46*amount*(1-p));ringScale=.65+p*3.0;
  }
  if(manual==='confetti'&&delta<4200){confettiProgress=delta/4200;
   confettiOpacity=.82*amount*Math.min(1,(4200-delta)/1100);
  }
  // V883 – rare 3D accents from selected verified scene entries.
  if(moment==='drop'&&momentAge<2100){const p=momentAge/2100;
   ringOpacity=Math.max(ringOpacity,.24*momentLevel*(1-p));ringScale=.82+p*2.5;
  }
  if(moment==='hook'&&momentAge<2400){const p=momentAge/2400;
   ringOpacity=Math.max(ringOpacity,.11*momentLevel*(1-p));ringScale=1+p*1.8;
  }
  if(moment==='finale'&&momentAge<5100){const p=momentAge/5100;
   confettiProgress=p;confettiOpacity=.56*momentLevel*Math.min(1,(1-p)*3);
   if(momentAge<2000){const q=momentAge/2000;
    ringOpacity=Math.max(ringOpacity,.13*momentLevel*(1-q));ringScale=1+q*2.2;}
  }
 }
 if(lightsOn){
  if(look==='neon'||look==='arena'||look==='aurora')beamGain+=.09*amount;
  if(manual==='sweep'&&delta<3300){const p=delta/3300;
   beamGain+=.21*amount*(1-p);
   beamOffset=Math.sin(p*Math.PI*2)*1.1*amount*(1-p);
  }
  if(manual==='shockwave'&&delta<1400)beamGain+=.12*amount*(1-delta/1400);
  if(moment==='rise'&&momentAge<3800)beamGain+=.06*momentLevel*(momentAge/3800);
  if(moment==='hook'&&momentAge<3300){const p=momentAge/3300;
   beamGain+=.08*momentLevel*(1-p);beamOffset+=Math.sin(p*Math.PI)*.45*momentLevel;}
  if(moment==='drop'&&momentAge<2200)beamGain+=.10*momentLevel*(1-momentAge/2200);
  if(moment==='finale'&&momentAge<5100){const p=momentAge/5100;
   beamGain+=.12*momentLevel*(1-p);beamOffset+=Math.sin(p*Math.PI)*.55*momentLevel;}
  if(transition?.active){
   beamGain*=transition.lightGain;
   beamOffset+=transition.lightOffset;
  }
  beamGain=clamp(beamGain,.9,1.3);
 }
 if(danceOn){
  if(scene&&(signal.section==='hook'||signal.section==='drop'))danceGain+=.045*amount;
  if(manual==='sweep'&&delta<3300)danceGain+=.045*amount*(1-delta/3300);
  if(manual==='shockwave'&&delta<1200)danceGain+=.065*amount*(1-delta/1200);
  if(moment&&(moment==='hook'||moment==='drop'||moment==='finale'))
   danceGain+=.025*momentLevel*(1-Math.min(1,momentAge/4400));
  danceGain=Math.min(1.12,danceGain);
 }
 return {ringOpacity,ringScale,confettiOpacity,confettiProgress,beamGain,beamOffset,danceGain,look};
}
