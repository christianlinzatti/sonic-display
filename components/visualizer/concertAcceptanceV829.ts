/** V829 – real concert acceptance evidence, never a simulated GPU/visual pass.
 * A live, verified, nearly entire uninterrupted song is required for each genre ×
 * configured performer count. Reviewer decisions remain explicitly manual.
 * This module has no timers, browser globals, persistence or renderer ownership.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
import type {ConcertFxSectionV810} from './concertFxStudioV810';
export const ACCEPTANCE_GENRES_V829=['rap','hardtekk','rock'] as const;
export const ACCEPTANCE_COUNTS_V829=[1,2,4] as const;
export const ACCEPTANCE_REVIEWS_V829=['lyrics','lipSync','camera','choreography','stageFx','transitions'] as const;
export type AcceptanceGenreV829=typeof ACCEPTANCE_GENRES_V829[number];
export type AcceptanceCountV829=typeof ACCEPTANCE_COUNTS_V829[number];
export type AcceptanceReviewV829=typeof ACCEPTANCE_REVIEWS_V829[number];
export type AcceptanceDecisionV829='pending'|'pass'|'fail';
export type AcceptanceKeyV829=`${AcceptanceGenreV829}:${AcceptanceCountV829}`;
export type AcceptanceReviewsV829=Record<AcceptanceReviewV829,AcceptanceDecisionV829>;
export interface AcceptanceCaseV829 {
  genre:AcceptanceGenreV829;count:AcceptanceCountV829;trackId:string;tier:'low'|'balanced'|'high';
  durationMs:number;firstMs:number;lastMs:number;windows:number;sampledSeconds:number;
  frames:number;weightedMs:number;slowFrames:number;maxP95Ms:number;sumCalls:number;
  maxParticles:number;maxFoam:number;maxFxPressure:number;sections:ConcertFxSectionV810[];
  fullSong:boolean;invalidated:boolean;reviews:AcceptanceReviewsV829;
}
export interface AcceptanceStoreV829 {
  active:AcceptanceKeyV829|null;cases:Partial<Record<AcceptanceKeyV829,AcceptanceCaseV829>>;
  notice:string;
}
export const acceptanceKeyV829=(genre:AcceptanceGenreV829,count:AcceptanceCountV829):AcceptanceKeyV829=>`${genre}:${count}`;
const defaultReviews=():AcceptanceReviewsV829=>({lyrics:'pending',lipSync:'pending',camera:'pending',
 choreography:'pending',stageFx:'pending',transitions:'pending'});
export const newAcceptanceCaseV829=(genre:AcceptanceGenreV829,count:AcceptanceCountV829):AcceptanceCaseV829=>({
 genre,count,trackId:'',tier:'low',durationMs:0,firstMs:-1,lastMs:-1,windows:0,sampledSeconds:0,
 frames:0,weightedMs:0,slowFrames:0,maxP95Ms:0,sumCalls:0,maxParticles:0,maxFoam:0,
 maxFxPressure:0,sections:[],fullSong:false,invalidated:false,reviews:defaultReviews(),
});
export const createAcceptanceStoreV829=():AcceptanceStoreV829=>({active:null,cases:{},notice:'Keine Gesamtabnahme gestartet.'});
const validNumber=(v:number)=>Number.isFinite(v)&&v>=0;
const validGenre=(v:string):v is AcceptanceGenreV829=>(ACCEPTANCE_GENRES_V829 as readonly string[]).includes(v);
const validCount=(v:number):v is AcceptanceCountV829=>(ACCEPTANCE_COUNTS_V829 as readonly number[]).includes(v);
const validSection=(v:string):v is ConcertFxSectionV810=>
 ['intro','verse','hook','build','drop','break','finale'].includes(v);
let state:AcceptanceStoreV829=createAcceptanceStoreV829();
const listeners=new Set<()=>void>();
const emit=()=>{for(const listener of listeners)listener();};
export const subscribeAcceptanceV829=(callback:()=>void)=>{listeners.add(callback);return ()=>{listeners.delete(callback);};};
export const getAcceptanceV829=()=>state;
export const EMPTY_ACCEPTANCE_V829:Readonly<AcceptanceStoreV829>=createAcceptanceStoreV829();
export const getAcceptanceServerV829=()=>EMPTY_ACCEPTANCE_V829;
export function beginAcceptanceV829(genre:AcceptanceGenreV829,count:AcceptanceCountV829):void {
 if(!validGenre(genre)||!validCount(count))return;
 const key=acceptanceKeyV829(genre,count);
 state={active:key,cases:{...state.cases,[key]:newAcceptanceCaseV829(genre,count)},
  notice:`${genre} / ${count} Performer: Song am Anfang starten. Verifizierte Abschnitte erforderlich.`};emit();
}
export function endAcceptanceV829():void {
 state={...state,active:null,notice:'Aufzeichnung gestoppt. Vorhandene Messungen bleiben sichtbar.'};emit();
}
export function clearAcceptanceV829():void {state=createAcceptanceStoreV829();emit();}
export function markAcceptanceReviewV829(genre:AcceptanceGenreV829,count:AcceptanceCountV829,
 field:AcceptanceReviewV829,decision:AcceptanceDecisionV829):void {
 const key=acceptanceKeyV829(genre,count),existing=state.cases[key];
 if(!existing||!ACCEPTANCE_REVIEWS_V829.includes(field)||!['pending','pass','fail'].includes(decision))return;
 state={...state,cases:{...state.cases,[key]:{...existing,reviews:{...existing.reviews,[field]:decision}}}};
 emit();
}
export interface AcceptanceFrameV829 {
 snapshot:ConcertQualitySnapshotV826;genre:string;count:number;trackId:string;
 progressMs:number;durationMs:number;section:string;liveShow:boolean;
}
/** Called ONLY at the existing ~0.5 second V826 telemetry publication boundary. */
export function recordAcceptanceV829(i:AcceptanceFrameV829):void {
 const key=state.active;if(!key)return;
 const c=state.cases[key];if(!c||c.invalidated||c.fullSong)return;
 const s=i.snapshot;
 if(!i.liveShow||!s.available||!s.playing||!s.verified||s.sampleCount<6||
   !i.trackId?.trim()||!validNumber(i.progressMs)||!validNumber(i.durationMs)||i.durationMs<45000||
   i.progressMs>i.durationMs||!validNumber(s.frameMs)||s.frameMs<=0||!validNumber(s.fps)||s.fps<=0||
   !Number.isFinite(s.p95FrameMs)||s.p95FrameMs<=0||
   i.genre!==c.genre||i.count!==c.count||!validSection(i.section))return;
 const sampleSeconds=s.sampleCount*s.frameMs/1000;
 if(sampleSeconds<.1||sampleSeconds>2)return;
 if(!c.trackId){
  // A complete-song verdict is impossible if the capture starts in the middle.
  if(i.progressMs>Math.min(12000,i.durationMs*.08))return;
 }else if(c.trackId!==i.trackId||c.tier!==s.performanceTier||c.durationMs!==i.durationMs||
  i.progressMs<c.lastMs-1000||i.progressMs-c.lastMs>6000){
  state={...state,active:null,cases:{...state.cases,[key]:{...c,invalidated:true}},
    notice:'Song, Profil oder Abspielposition geändert / Messlücke erkannt. Durchlauf erneut starten.'};emit();return;
 }
 const frames=c.frames+s.sampleCount;
 const sampledSeconds=c.sampledSeconds+sampleSeconds;
 const firstMs=c.firstMs<0?i.progressMs:c.firstMs;
 const lastMs=i.progressMs;
 const sections=c.sections.includes(i.section)?c.sections:[...c.sections,i.section];
 // Coverage must include the beginning and near-end, and account for >= 78% of
 // the track duration in actual render-loop samples. No instant synthetic pass.
 const fullSong=lastMs>=i.durationMs-Math.max(7000,i.durationMs*.035)&&
  firstMs<=Math.min(12000,i.durationMs*.08)&&
  sampledSeconds>=i.durationMs/1000*.78&&sections.length>=2;
 const next:AcceptanceCaseV829={...c,trackId:i.trackId,tier:s.performanceTier,
  durationMs:i.durationMs,firstMs,lastMs,windows:c.windows+1,sampledSeconds,frames,
  weightedMs:c.weightedMs+s.frameMs*s.sampleCount,
  slowFrames:c.slowFrames+s.slowFrameShare*s.sampleCount,
  maxP95Ms:Math.max(c.maxP95Ms,s.p95FrameMs),sumCalls:c.sumCalls+s.rendererCalls,
  maxParticles:Math.max(c.maxParticles,s.counts.sparks+s.counts.shards+s.counts.confetti+s.counts.energyRings),
  maxFoam:Math.max(c.maxFoam,s.counts.foamBubbles+s.counts.foamMist),
  maxFxPressure:Math.max(c.maxFxPressure,s.pressure),sections,fullSong};
 state={...state,active:fullSong?null:key,cases:{...state.cases,[key]:next},
  notice:fullSong?'Song vollständig gemessen. Jetzt visuelle Prüfpunkte manuell bewerten.':
   `Live-Durchlauf: ${Math.floor(lastMs/1000)} / ${Math.floor(i.durationMs/1000)} s · ${sections.length} bestätigte Abschnitte.`};
 emit();
}
export const acceptanceFrameMsV829=(c:AcceptanceCaseV829):number=>c.frames>0?c.weightedMs/c.frames:0;
export const acceptanceFpsV829=(c:AcceptanceCaseV829):number=>c.sampledSeconds>0?c.frames/c.sampledSeconds:0;
export const acceptanceSlowShareV829=(c:AcceptanceCaseV829):number=>c.frames>0?c.slowFrames/c.frames:0;
export type AcceptanceVerdictV829='not-recorded'|'incomplete'|'review'|'failed'|'passed';
export function acceptanceVerdictV829(c?:AcceptanceCaseV829):AcceptanceVerdictV829 {
 if(!c)return 'not-recorded';
 if(c.invalidated)return 'failed';
 if(ACCEPTANCE_REVIEWS_V829.some(key=>c.reviews[key]==='fail'))return 'failed';
 if(!c.fullSong)return 'incomplete';
 if(acceptanceSlowShareV829(c)>.30||acceptanceFpsV829(c)<(c.tier==='low'?24:48))return 'failed';
 if(ACCEPTANCE_REVIEWS_V829.some(key=>c.reviews[key]!=='pass'))return 'review';
 return 'passed';
}
export function acceptanceReportV829(s:AcceptanceStoreV829){
 const rows=ACCEPTANCE_GENRES_V829.flatMap(genre=>ACCEPTANCE_COUNTS_V829.map(count=>{
  const c=s.cases[acceptanceKeyV829(genre,count)];
  return {genre,count,status:acceptanceVerdictV829(c),trackId:c?.trackId??null,
    tier:c?.trackId?c.tier:null,fullSong:c?.fullSong??false,
    sections:c?.sections??[],elapsedSeconds:c?Math.round(c.sampledSeconds*10)/10:null,
    fps:c?.frames?Math.round(acceptanceFpsV829(c)*10)/10:null,
    frameMs:c?.frames?Math.round(acceptanceFrameMsV829(c)*10)/10:null,
    worstWindowP95Ms:c?.frames?Math.round(c.maxP95Ms*10)/10:null,
    slowFrameShare:c?.frames?Math.round(acceptanceSlowShareV829(c)*1000)/1000:null,
    maxParticles:c?.trackId?c.maxParticles:null,maxFoam:c?.trackId?c.maxFoam:null,
    reviews:c?.reviews??defaultReviews()};
 }));
 const comparable=ACCEPTANCE_GENRES_V829.map(genre=>{
  const measured=ACCEPTANCE_COUNTS_V829.map(count=>s.cases[acceptanceKeyV829(genre,count)]).filter((c):c is AcceptanceCaseV829=>!!c&&c.fullSong);
  const consistent=measured.length===3&&new Set(measured.map(c=>`${c.trackId}|${c.tier}|${c.durationMs}`)).size===1;
  return {genre,comparable:consistent,reason:consistent?'Gleicher Song, Profil und Songdauer (Auflösung und GLB-Komplexität manuell prüfen)':'3 vollständige Messungen mit gleichem Song, Qualitätsprofil und Songdauer fehlen'};
 });
 return {version:'V829',type:'real-live-render-loop-plus-manual-visual-review',
   disclaimer:'Keine GPU-Zeitmessung, kein automatisch bestätigter GLB-Import, keine automatisierte Prüfung der Lyrics- oder Lippensynchronität.',
   rows,comparable,allPassed:rows.every(row=>row.status==='passed')&&comparable.every(item=>item.comparable)};
}
