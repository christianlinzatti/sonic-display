"use client";
import {useState} from 'react';
import {ConcertBenchmarkPanelV827} from './ConcertBenchmarkPanelV827';
import {RealGlbBenchmarkPanelV832} from './RealGlbBenchmarkPanelV832';
import {ConcertAcceptancePanelV829} from './ConcertAcceptancePanelV829';
import {ConcertQualityDashboardV826} from './ConcertQualityDashboardV826';
import {VisualFxTimelineEditorV823} from './VisualFxTimelineEditorV823';
import {planConcertExperienceV828} from './concertExperienceDirectorV828';
import {evaluateFxTimelineV823} from './visualFxTimelineV823';
import {planSmartFxShowDirectorV824} from './smartFxShowDirectorV824';
import {planFxPerformanceV825} from './concertFxPerformanceOptimizerV825';
import {applyCameraAwarePerformanceV834} from './cameraAwarePerformanceV834';
import {CONCERT_FX_PALETTES_V810,normalizeConcertFxV810,planConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxGenreV810,ConcertFxSectionV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import {planVirtualConcertCrowdV815} from './virtualConcertCrowdPlannerV815';
import {planIntelligentAudienceV874} from './intelligentAudienceExperienceV874';
import {planSmartFestivalAtmosphereV875} from './smartFestivalAtmosphereV875';
import {planDynamicFestivalCrowdChoreographyV876} from './dynamicFestivalCrowdChoreographyV876';
import {planIntelligentCrowdInteractionV877} from './intelligentCrowdInteractionV877';
import {planSmartAudienceEmotionV878} from './smartAudienceEmotionDirectorV878';
import {planCrowdCameraStageHarmonyV879} from './crowdCameraStageHarmonyV879';
import {planLivingAudienceV973} from './livingAudienceDirectorV973';
import {planSmartConcertExperienceV880} from './smartConcertExperienceV880';
import {planReactiveParticlesV816} from './reactiveParticlePlannerV816';
import {planFoamCannonV817} from './foamCannonPlannerV817';
import {planFestivalSpecialFxV844} from './festivalSpecialFxPlannerV844';
import {coordinateFestivalFxV871} from './festivalFxCoordinationV871';
import {planSoapBubblesV8441,planFullStageFlashV8441} from './festivalBubblesFlashPlannerV8441';
import {planPaperStreamersV846} from './festivalPaperStreamersPlannerV846';
import {planFestivalFinaleV847} from './festivalFinalePlannerV847';
import {planSmartFestivalShowV850} from './smartFestivalShowDirectorV850';
import {planFoamExperienceV843} from './foamExperiencePlannerV843';
import {planKineticStageV817} from './kineticStagePlannerV817';
import {planSpectralMusicV818} from './spectralMusicPlannerV818';
import {planCinematicTransitionV819} from './cinematicTransitionPlannerV819';
import {planLedWallExperienceV821} from './ledWallExperiencePlannerV821';
import {planLedWallExperienceV842} from './ledWallExperiencePlannerV842';
import {planLedWallCreativeV886,LED_CREATIVE_NAMES_V886} from './ledWallCreativeDirectorV886';
import {planBeatAccentDirectorV822} from './beatAccentDirectorV822';
import {planVocalAdlibFxV820} from './vocalAdlibFxPlannerV820';
const genres: {value:ConcertFxGenreV810;label:string}[]=[
 {value:'rap',label:'Deutschrap'}, {value:'hardtekk',label:'Hardtekk'},
 {value:'hardstyle',label:'Hardstyle'}, {value:'rock',label:'Deutschrock / NDH'},
 {value:'pop',label:'Pop'}];
const sections:ConcertFxSectionV810[]=['intro','verse','hook','build','drop','break','finale'];
/** An explicitly SIMULATED offline preview. Live scenes are verified by V604/V761. */
export function ConcertFxStudioV810({value,onChange}:{value?:Partial<ConcertFxSettingsV810>|null;
 onChange:(next:ConcertFxSettingsV810)=>void}){
 const s=normalizeConcertFxV810(value);
 const [genre,setGenre]=useState<ConcertFxGenreV810>('hardtekk');
 const [section,setSection]=useState<ConcertFxSectionV810>('drop');
 const patch=(v:Partial<ConcertFxSettingsV810>)=>onChange({...s,...v});
 const preview=planConcertFxV810({settings:s,genre,section,progressMs:5000,startMs:0,endMs:10000,
  active:true,verified:true,playing:true,reactive:true,reducedMotion:false,
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:1,
  tier:'high',energy:.86,kick:.92,bass:.85,mids:.56,highs:.64,ledBudget:1,laserBudget:1});
 const smartPreviewV824=planSmartFxShowDirectorV824({settings:s,fx:preview,trackId:'demo',
  startMs:0,endMs:10000,progressMs:5000,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1});
 const experiencePreviewV828=planConcertExperienceV828({settings:s,fx:preview,trackId:'demo',
   authored:evaluateFxTimelineV823({cues:[],enabled:false,trackId:'demo',durationMs:10000,
    progressMs:5000,verified:true,playing:true,reducedMotion:false}),
   startMs:0,endMs:10000,progressMs:5000,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1});
 const perfPreviewV825=planFxPerformanceV825({settings:s,fx:preview,tier:'high',pressure:.65,
  lyricsProtected:false,vocalFocus:false,groupCount:2});
 const cameraPreviewV834=planFxPerformanceV825({settings:s,fx:preview,tier:'high',pressure:.65,lyricsProtected:false,vocalFocus:false,groupCount:2});
 const cameraSummaryV834=applyCameraAwarePerformanceV834(cameraPreviewV834,{settings:s,fx:preview,intent:'portrait',verifiedCamera:true,manualCamera:false,groupCount:2});
 const palette=s.palette==='custom'?{primary:s.primary,secondary:s.secondary}:CONCERT_FX_PALETTES_V810[genre];
 const crowdPreview=planVirtualConcertCrowdV815({fx:preview,settings:s,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,energy:.86,kick:.92,crowdBudget:1});
 const audienceV874=planIntelligentAudienceV874({base:crowdPreview,fx:preview,settings:s,
   tier:'high',lyricsProtected:false,vocalFocus:false,reducedMotion:false,energy:.86,kick:.92});
 const atmosphereV875=planSmartFestivalAtmosphereV875({base:audienceV874,fx:preview,settings:s,
   energy:.86,kick:.92,tier:'high',playing:true,manualLighting:false,blackout:false,
   lyricsProtected:false,vocalFocus:false,reducedMotion:false});
 const choreographyV876=planDynamicFestivalCrowdChoreographyV876({base:atmosphereV875,fx:preview,
   settings:s,energy:.86,kick:.92,tier:'high',playing:true,manualLighting:false,
   blackout:false,lyricsProtected:false,vocalFocus:false,reducedMotion:false});
 const interactionV877=planIntelligentCrowdInteractionV877({base:choreographyV876,
   fx:preview,settings:s,energy:.86,kick:.92,tier:'high',playing:true,
   manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   reducedMotion:false,groupCount:2,focusSlot:0,focusVerified:true,
   lyrics:undefined,lyricsVisible:false,progressMs:5000});
 const emotionV878=planSmartAudienceEmotionV878({base:interactionV877,fx:preview,settings:s,
   previous:null,trackId:'preview',positionMs:5000,energy:.86,kick:.92,
   playing:true,manualLighting:false,blackout:false,reducedMotion:false,
   lyricsProtected:false,vocalFocus:false,tier:'high'});
 const harmonyPreviewV879=planCrowdCameraStageHarmonyV879({base:emotionV878.cue,settings:s,
   verifiedCamera:true,cameraIntent:'portrait',manualCamera:false,
   lyricsVisible:true,lyricsProtected:false,vocalFocus:true,performerVerified:true,
   groupCount:2,transitionActive:true,transitionProximity:.7,playing:true,
   blackout:false,manualLighting:false,reducedMotion:false,tier:'high'});
 const livingPreviewV973=planLivingAudienceV973({base:harmonyPreviewV879,fx:preview,settings:s,
   positionMs:5000,playing:true,manualLighting:false,manualCamera:false,blackout:false,
   reducedMotion:false,lyricsProtected:false,vocalFocus:false,groupCount:2,
   energy:.86,kick:.92,tier:'high'});
 const concertPreviewV880=planSmartConcertExperienceV880({
   settings:s,fx:preview,previous:null,trackId:'preview',positionMs:5000,durationMs:10000,
   energy:.86,kick:.92,cameraVerified:true,cameraIntent:'wide',manualCamera:false,
   lyricsProtected:false,vocalFocus:false,groupCount:2,transitionActive:false,
   playing:true,blackout:false,reducedMotion:false,manualLighting:false,tier:'high'}).cue;
 const particlePreview=planReactiveParticlesV816({fx:preview,settings:s,tier:'high',lyricsProtected:false,
  vocalFocus:false,groupCount:1,energy:.86,kick:.92,bass:.85,highs:.64,particleBudget:1});
 const foamPreview=planFoamCannonV817({fx:preview,settings:s,tier:'high',lyricsProtected:false,
  vocalFocus:false,groupCount:1,energy:.86,kick:.92,foamBudget:1});
 const foamMotionPreviewV843=planFoamExperienceV843({cue:foamPreview,fx:preview,settings:s,
   tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1});
 const kineticPreview=planKineticStageV817({fx:preview,settings:s,tier:'high',lyricsProtected:false,
  vocalFocus:false,groupCount:1,energy:.86,kick:.92,architectureBudget:1});
 const spectralPreview=planSpectralMusicV818({fx:preview,settings:s,tier:'high',lyricsProtected:false,
  vocalFocus:false,groupCount:1,energy:.86,bass:.85,mids:.56,highs:.64,spectralBudget:1});
 const cinematicPreview=planCinematicTransitionV819({fx:preview,settings:s,transition:{active:true,kind:'intra-act',
  sceneIndex:1,edge:'exit',proximity:.92,cameraRate:.74,lightingRate:.77},playing:true,reducedMotion:false,
  manualCamera:false,manualLighting:false,lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',budget:1});
 const vocalPreview=planVocalAdlibFxV820({fx:preview,settings:s,trackId:'preview',vocalTrackId:'preview',
  segments:[{startMs:0,endMs:10000,leadSlot:0,partnerSlot:1,style:'solo',strength:85,roleV547:'verse'},
   {startMs:3000,endMs:7000,leadSlot:1,partnerSlot:0,style:'solo',strength:90,roleV547:'adlib'}],
  vocalEnabled:true,progressMs:5000,playing:true,reducedMotion:false,groupCount:2,tier:'high',budget:1,
  lyricsProtected:false,vocalFocus:false,manualCamera:false,manualLighting:false,lyricsVisible:false});
 const beatPreview=planBeatAccentDirectorV822({fx:preview,settings:s,tier:'high',budget:1,
  beatStrength:.83,kickOnset:.92,kickBand:.81,snareBand:.90,bass:.86,energy:.88,
  attack:.85,lyricsProtected:false,vocalFocus:false,groupCount:1});
 const wallPreview=planLedWallExperienceV821({fx:preview,settings:s,tier:'high',budget:1,
  lyricsProtected:false,vocalFocus:false,groupCount:1});
 const depthPreviewV842=planLedWallExperienceV842({fx:preview,wall:wallPreview,settings:s,
   section,playing:true,reducedMotion:false,tier:'high',budget:1,timelineGain:1,
   manualLed:false,manualLighting:false,blackout:false,lyricsProtected:false,
   vocalFocus:false,groupCount:1});
 const creativePreviewV886=planLedWallCreativeV886({fx:preview,wall:wallPreview,settings:s,
   section,playing:true,reducedMotion:false,tier:'high',budget:1,timelineGain:1,
   manualLed:false,manualLighting:false,blackout:false,lyricsProtected:false,
   lyricsVisible:false,vocalFocus:false,cameraCloseup:false,manualCamera:false,groupCount:1});
 const festivalPreviewV844=planFestivalSpecialFxV844({fx:preview,settings:s,playing:true,
   reducedMotion:false,manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   groupCount:1,tier:'high',energy:.86,kick:.92,particleBudget:1,foamBudget:1,timelineGain:1,performanceGain:1});
 const bubblePreviewV8441=planSoapBubblesV8441({fx:preview,settings:s,playing:true,
   reducedMotion:false,manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   groupCount:1,tier:'high',energy:.86,kick:.92,budget:1,timelineGain:1,performanceGain:1,
   moment:festivalPreviewV844.moment});
 const flashPreviewV8441=planFullStageFlashV8441({fx:preview,settings:s,playing:true,
   reducedMotion:false,manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   groupCount:1,tier:'high',energy:.86,kick:.92,budget:1,timelineGain:1,performanceGain:1,
   moment:festivalPreviewV844.moment});
 const streamerPreviewV846=planPaperStreamersV846({fx:preview,settings:s,playing:true,
   reducedMotion:false,manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   groupCount:1,tier:'high',energy:.86,kick:.92,budget:1,timelineGain:1,performanceGain:1,
   moment:festivalPreviewV844.moment});
 const finalePreviewV847=planFestivalFinaleV847({fx:preview,settings:s,playing:true,
   reducedMotion:false,manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,
   groupCount:1,tier:'high',energy:.86,kick:.92,budget:1,timelineGain:1,performanceGain:1,
   moment:festivalPreviewV844.moment});
 const showPreviewV850=planSmartFestivalShowV850({settings:s,fx:preview,
   trackId:'demo-v850',actIndex:2,actStartMs:0,actEndMs:10000,progressMs:5000,
   playing:true,reactive:true,reducedMotion:false,manualLighting:false,
   blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:1,
   tier:'high',budget:1});
 const coordinationPreviewV871=coordinateFestivalFxV871({settings:s,fx:preview,
   festival:festivalPreviewV844,foam:foamPreview,bubbles:bubblePreviewV8441,
   streamers:streamerPreviewV846,finale:finalePreviewV847,flash:flashPreviewV8441,
   playing:true,reducedMotion:false,blackout:false,manualLighting:false,
   lyricsProtected:false,vocalFocus:false,cameraCloseup:false,groupCount:1,tier:'high',
   authoredLanes:[]});
 return <fieldset><legend>V810–V871 · Concert FX Studio 4.0</legend>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V850 · Smart Festival Show Director 4.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.festivalDirectorV850}
     onChange={e=>patch({festivalDirectorV850:e.target.checked})}/>
     Automatische Show-Dramaturgie nach bestätigten Songabschnitten</label>
   <label>Dramaturgie-Stärke ({s.festivalDirectorStrengthV850} %)
     <input type="range" min="0" max="100" step="5" value={s.festivalDirectorStrengthV850}
       disabled={!s.festivalDirectorV850}
       onChange={e=>patch({festivalDirectorStrengthV850:+e.target.value})}/></label>
   <label>Inszenierungsstil <select value={s.festivalDirectorStyleV850}
     disabled={!s.festivalDirectorV850}
     onChange={e=>patch({festivalDirectorStyleV850:e.target.value as ConcertFxSettingsV810['festivalDirectorStyleV850']})}>
     <option value="cinematic">Filmisch</option><option value="balanced">Ausgewogen</option>
     <option value="festival">Festival</option></select></label>
   <small>Simulierte Vorschau: {showPreviewV850.active?`${showPreviewV850.sceneLabel} · Fokus ${showPreviewV850.focus} · Laser ${Math.round(showPreviewV850.gains.laser*100)} % · LED ${Math.round(showPreviewV850.gains.led*100)} % · Festival-FX ${Math.round(showPreviewV850.gains.festival*100)} %`:'inaktiv'}.
     V850 erzeugt keine neuen Musikabschnitte, Kameraschnitte, Tanzbewegungen oder Flash-Impulse.
     V848/V849, manuelle Timelines, Lyrics-Schutz, Blackout und das Performance-Budget behalten Vorrang.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V849 · Intelligent Concert Transitions 5.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.intelligentTransitionsV849}
     onChange={e=>patch({intelligentTransitionsV849:e.target.checked})}/>
     Kamera, Licht, LED und Festival-FX an verifizierten Szenenübergängen koordinieren</label>
   <label>Übergangsstärke ({s.transitionStrengthV849} %)
     <input type="range" min="0" max="100" step="5" value={s.transitionStrengthV849}
       disabled={!s.intelligentTransitionsV849}
       onChange={e=>patch({transitionStrengthV849:+e.target.value})}/></label>
   <label>Übergangsstil <select value={s.transitionModeV849}
     disabled={!s.intelligentTransitionsV849}
     onChange={e=>patch({transitionModeV849:e.target.value as ConcertFxSettingsV810['transitionModeV849']})}>
     <option value="smooth">Sanft</option><option value="cinematic">Filmisch</option>
     <option value="festival">Festival</option></select></label>
   <small>Die gemeinsame Regie verwendet nur bestätigte V791-Szenengrenzen. An diesen
     Grenzen werden Kamerafahrten und Licht sanft synchronisiert; LED, Laser und
     Spezialeffekte werden kurz zurückgenommen. Manuelle Timelines, reduzierte
     Bewegung, Lyrics-Schutz und Performance-Grenzen bleiben vorrangig.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V844 · Festival Special FX 3.0 + Strobolicht</legend>
   <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
    <legend>V871 · Festival FX 4.0 – intelligente Koordination</legend>
    <label className="setting-check"><input type="checkbox" checked={s.festivalCoordinationV871}
      disabled={!s.festivalFxV844} onChange={e=>patch({festivalCoordinationV871:e.target.checked})}/>
      Automatische Abstimmung von CO₂, Schaum, Seifenblasen und Luftschlangen</label>
    <label>Sichtschutz für Performer ({s.festivalClarityV871} %)
      <input type="range" min="0" max="100" step="5" value={s.festivalClarityV871}
        disabled={!s.festivalFxV844||!s.festivalCoordinationV871}
        onChange={e=>patch({festivalClarityV871:+e.target.value})}/></label>
    <small>Simulierte Vorschau: Schwerpunkt {coordinationPreviewV871.hero} · Effekt-Dichte
      {` ${Math.round(coordinationPreviewV871.coverageBefore*100)} → ${Math.round(coordinationPreviewV871.coverageAfter*100)} %`}.
      Die Dichte ist ein normierter Planungswert, keine gemessene Bildschirmabdeckung.
      Bereits ausgeschaltete Effekte, manuelle Effektspuren und explizit aktivierte Blitze bleiben unverändert;
      nur zugelassene automatische Effekte werden gedimmt.</small>
   </fieldset>
   <label className="setting-check"><input type="checkbox" checked={s.festivalFxV844} onChange={e=>patch({festivalFxV844:e.target.checked})}/> Automatische, koordinierte Festival-Effekte</label>
   <label>Stil <select value={s.festivalStyleV844} disabled={!s.festivalFxV844} onChange={e=>patch({festivalStyleV844:e.target.value as ConcertFxSettingsV810['festivalStyleV844']})}>
     <option value="balanced">Ausgewogen</option><option value="festival">Festival / Hardtekk</option>
   </select></label>
   <label>Intensität ({s.festivalIntensityV844} %)<input type="range" min="0" max="100" step="5" value={s.festivalIntensityV844} disabled={!s.festivalFxV844} onChange={e=>patch({festivalIntensityV844:+e.target.value})}/></label>
   <label className="setting-check"><input type="checkbox" checked={s.festivalCo2V844} disabled={!s.festivalFxV844} onChange={e=>patch({festivalCo2V844:e.target.checked})}/> Virtuelle CO₂-Jets (seitliche Nebelfontänen)</label>
   <label className="setting-check"><input type="checkbox" checked={s.festivalSparksV844} disabled={!s.festivalFxV844} onChange={e=>patch({festivalSparksV844:e.target.checked})}/> Funkenfontänen über vorhandene Partikel</label>
   <label className="setting-check"><input type="checkbox" checked={s.festivalConfettiV844} disabled={!s.festivalFxV844} onChange={e=>patch({festivalConfettiV844:e.target.checked})}/> Konfettikanonen über vorhandene Partikel</label>
   <label className="setting-check"><input type="checkbox" checked={s.festivalStrobeV844} disabled={!s.festivalFxV844} onChange={e=>patch({festivalStrobeV844:e.target.checked})}/> Strobolicht ausdrücklich einschalten (Standard: AUS)</label>
   <label>Stroboskop-Frequenz <select value={s.festivalStrobeRateV844} disabled={!s.festivalFxV844||!s.festivalStrobeV844} onChange={e=>patch({festivalStrobeRateV844:Number(e.target.value) as ConcertFxSettingsV810['festivalStrobeRateV844']})}>
     <option value="0.5">0,5 Hz</option><option value="1">1 Hz</option><option value="2">2 Hz (Maximum)</option>
   </select></label>
   <label>Strobo-Intensität ({s.festivalStrobeIntensityV844} % von max. 50 %)<input type="range" min="0" max="50" step="5" value={s.festivalStrobeIntensityV844} disabled={!s.festivalFxV844||!s.festivalStrobeV844} onChange={e=>patch({festivalStrobeIntensityV844:+e.target.value})}/></label>
   <small>Vorschau (simuliert): {festivalPreviewV844.active?`${festivalPreviewV844.moment} · CO₂ ${festivalPreviewV844.co2Count} · Strobo ${festivalPreviewV844.strobeGain>0?'Impuls':'aus'}`:'keine Festival-Aktion'}. Ein dominanter Effekt je Musikfenster; keine gleichzeitige Vollauslastung. Strobo ist standardmäßig aus, ausschließlich ein begrenzter Effekt am vorhandenen Bodenlicht, maximal 2 Hz und 45 ms pro Impuls. Trotz Begrenzung nicht für alle fotosensiblen Personen sicher. Bei reduzierter Bewegung, manueller Lichtregie oder Lyrics-Fokus aus. Vollbildblitze sind nur über den separaten V844.1-Opt-in möglich.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V844.1 · Seifenblasen und Full-Stage-Flash</legend>
   <label className="setting-check"><input type="checkbox" checked={s.festivalSoapBubblesV8441}
     disabled={!s.festivalFxV844} onChange={e=>patch({festivalSoapBubblesV8441:e.target.checked})}/>
     Seifenblasen auf der Bühne (separat von der Schaumkanone)</label>
   <label>Seifenblasen-Intensität ({s.festivalBubblesIntensityV8441} %)
     <input type="range" min="0" max="100" step="5" value={s.festivalBubblesIntensityV8441}
     disabled={!s.festivalFxV844||!s.festivalSoapBubblesV8441}
     onChange={e=>patch({festivalBubblesIntensityV8441:+e.target.value})}/></label>
   <label>Seifenblasen-Stil <select value={s.festivalBubbleStyleV8441}
     disabled={!s.festivalFxV844||!s.festivalSoapBubblesV8441}
     onChange={e=>patch({festivalBubbleStyleV8441:e.target.value as ConcertFxSettingsV810['festivalBubbleStyleV8441']})}>
     <option value="soft">Sanft</option><option value="floating">Schwebend</option>
     <option value="festival">Festival</option></select></label>
   <small>Bis zu 64 leichte GPU-Instanzen; die Anzahl wird bei mehreren Avataren, Lyrics-Fokus und wenig Leistung automatisch reduziert. Vorschau: {bubblePreviewV8441.count} Seifenblasen (simuliert).</small>
   <label className="setting-check"><input type="checkbox" checked={s.festivalFullStageFlashV8441}
     disabled={!s.festivalFxV844}
     onChange={e=>patch({festivalFullStageFlashV8441:e.target.checked})}/>
     Full-Stage-Flash ausdrücklich aktivieren (standardmäßig AUS)</label>
   <label>Flash-Helligkeit ({s.festivalFlashIntensityV8441} %; begrenzt)
     <input type="range" min="0" max="35" step="5" value={s.festivalFlashIntensityV8441}
     disabled={!s.festivalFxV844||!s.festivalFullStageFlashV8441}
     onChange={e=>patch({festivalFlashIntensityV8441:+e.target.value})}/></label>
   <label>Maximale Flash-Frequenz <select value={s.festivalFlashRateV8441}
     disabled={!s.festivalFxV844||!s.festivalFullStageFlashV8441}
     onChange={e=>patch({festivalFlashRateV8441:Number(e.target.value) as ConcertFxSettingsV810['festivalFlashRateV8441']})}>
     <option value="0.5">0,5 Hz</option><option value="1">1 Hz</option><option value="2">2 Hz</option></select></label>
   <small>Vorschau (nur Text, KEINE Blitze): {flashPreviewV8441.active?'Wäre jetzt aktiv':'Momentan aus'}.
     Der Flash betrifft ausschließlich das 3D-Bühnenbild, nicht die Bedienelemente.
     Höchstens 35 ms, 2 Impulse/s und 16 % Deckkraft. Bei reduzierter Bewegung,
     Lyrics-/Gesangsfokus, manuellen Licht-Cues und niedriger Performance deaktiviert.
     Bei aktiviertem Full-Stage-Flash wird das Boden-Strobo nicht zusätzlich ausgelöst.
     Achtung: Auch begrenzte Blitze können bei Fotosensibilität problematisch sein.
   </small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V846 · Papier-Luftschlangen</legend>
   <label className="setting-check"><input type="checkbox" checked={s.festivalPaperStreamersV846}
     disabled={!s.festivalFxV844} onChange={e=>patch({festivalPaperStreamersV846:e.target.checked})}/>
     Papier-Luftschlangen aus seitlichen Bühnenkanonen</label>
   <label>Luftschlangen-Intensität ({s.festivalStreamerIntensityV846} %)
     <input type="range" min="0" max="100" step="5" value={s.festivalStreamerIntensityV846}
     disabled={!s.festivalFxV844||!s.festivalPaperStreamersV846}
     onChange={e=>patch({festivalStreamerIntensityV846:+e.target.value})}/></label>
   <label>Luftschlangen-Stil <select value={s.festivalStreamerStyleV846}
     disabled={!s.festivalFxV844||!s.festivalPaperStreamersV846}
     onChange={e=>patch({festivalStreamerStyleV846:e.target.value as ConcertFxSettingsV810['festivalStreamerStyleV846']})}>
     <option value="classic">Klassisch</option><option value="spiral">Spiral</option>
     <option value="festival">Festival</option></select></label>
   <small>Bis zu 56 leichte Papierstreifen als begrenzte GPU-Instanzen; bevorzugt bei Hook, Drop und Finale. CO₂ hat Vorrang, Konfetti/Funken dämpfen nur die Dichte. Vorschau: {streamerPreviewV846.active?`${streamerPreviewV846.count} Luftschlangen · Falltempo ${Math.round(streamerPreviewV846.fallSpeed*100)} %`:'derzeit aus'}.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V847 · Metallic-Konfetti und virtuelle Funkenräder</legend>
   <label className="setting-check"><input type="checkbox" checked={s.festivalMetallicRainV847}
     disabled={!s.festivalFxV844} onChange={e=>patch({festivalMetallicRainV847:e.target.checked})}/>
     Metallic-Konfetti-Regen (bei Konfetti-Fenstern)</label>
   <label className="setting-check"><input type="checkbox" checked={s.festivalSparkWheelsV847}
     disabled={!s.festivalFxV844} onChange={e=>patch({festivalSparkWheelsV847:e.target.checked})}/>
     Virtuelle Funkenräder (bei Funken-Fenstern)</label>
   <label>Finale-FX-Intensität ({s.festivalFinaleIntensityV847} %)
     <input type="range" min="0" max="100" step="5" value={s.festivalFinaleIntensityV847}
     disabled={!s.festivalFxV844||(!s.festivalMetallicRainV847&&!s.festivalSparkWheelsV847)}
     onChange={e=>patch({festivalFinaleIntensityV847:+e.target.value})}/></label>
   <label>Metallischer Farbstil <select value={s.festivalMetallicPaletteV847}
     disabled={!s.festivalFxV844||!s.festivalMetallicRainV847}
     onChange={e=>patch({festivalMetallicPaletteV847:e.target.value as ConcertFxSettingsV810['festivalMetallicPaletteV847']})}>
     <option value="mixed">Gold + Silber</option><option value="gold">Gold</option>
     <option value="silver">Silber</option></select></label>
   <small>Simulierte Vorschau: {finalePreviewV847.active?
     `${finalePreviewV847.moment==='metallic-rain'?'Metallic-Regen':'Funkenrad'} · Regen ${finalePreviewV847.rainCount} · Funken ${finalePreviewV847.wheelCount}`:
     'im gewählten Abschnitt gerade inaktiv'}. Maximal 80 Konfettistücke ODER 32 Funken, niemals beide zugleich. Keine echte Pyrotechnik, keine zusätzlichen Bühnenlichter oder Vollbildblitze. Reduzierte Bewegung, manuelle Lichtvorgaben, Blackouts und Gerätebudgets haben Vorrang.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V824 · Smart FX Show Director</legend>
   <label className="setting-check"><input type="checkbox" checked={s.smartShowV824}
    onChange={e=>patch({smartShowV824:e.target.checked})}/> Automatische FX-Dramaturgie nach bestätigten Songabschnitten</label>
   <label>Regiestil <select disabled={!s.smartShowV824} value={s.smartShowModeV824} onChange={e=>patch({smartShowModeV824:e.target.value as ConcertFxSettingsV810['smartShowModeV824']})}>
    <option value="cinematic">Cinematic – ruhig und filmisch</option>
    <option value="balanced">Balanced – vielseitig</option>
    <option value="festival">Festival – große Drops und Finalen</option>
   </select></label>
   <label>Regie-Intensität ({s.smartShowIntensityV824} %)<input type="range" min="0" max="100" step="5"
    disabled={!s.smartShowV824} value={s.smartShowIntensityV824} onChange={e=>patch({smartShowIntensityV824:+e.target.value})}/></label>
   <small>Simulierte {section}-Vorschau: {smartPreviewV824.active?`${smartPreviewV824.sceneLabel} · Laser ${Math.round(smartPreviewV824.gains.laser*100)} % · LED ${Math.round(smartPreviewV824.gains.led*100)} % · Partikel ${Math.round(smartPreviewV824.gains.particles*100)} % · Schaum ${Math.round(smartPreviewV824.gains.foam*100)} %`:'inaktiv'}. Die manuelle V823-Timeline gewinnt spurweise. Pausen, manuelle Lichtregie, Blackout, Lyrics-Schutz und Gerätegrenzen sind unantastbar. Keine neuen Kameraschnitte oder vorhergesagten Drops.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V825 · Concert FX Performance Optimizer</legend>
   <label className="setting-check"><input type="checkbox" checked={s.perfOptimizerV825}
    onChange={e=>patch({perfOptimizerV825:e.target.checked})}/> Adaptive Verteilung des FX-Leistungsbudgets</label>
   <label>Priorität <select disabled={!s.perfOptimizerV825} value={s.perfModeV825}
    onChange={e=>patch({perfModeV825:e.target.value as ConcertFxSettingsV810['perfModeV825']})}>
    <option value="balanced">Ausgewogen – Performance und Optik</option>
    <option value="fps">Flüssige Wiedergabe bevorzugen</option>
    <option value="quality">Visuelle Qualität bevorzugen</option>
   </select></label>
   <label>Empfindlichkeit ({s.perfSensitivityV825} %)<input type="range" min="0" max="100" step="5"
    disabled={!s.perfOptimizerV825} value={s.perfSensitivityV825}
    onChange={e=>patch({perfSensitivityV825:+e.target.value})}/></label>
   <small>Simulierter Lastfall (kein GPU-Messwert): {perfPreviewV825.throttled.length?
    perfPreviewV825.throttled.map(lane=>`${lane} ${Math.round(perfPreviewV825.gains[lane]*100)} %`).join(' · '):
    'alle FX ohne Drosselung'}. Laufzeitregelung nutzt reale Frame-Abstände (keine GPU-Zeitmessung),
    reagiert verzögert auf anhaltende Last und stellt Effekte langsam wieder her.
    Bestehende Lyrics-, Kamera-, Geräte- und manuelle FX-Schutzregeln bleiben aktiv.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V834 · Adaptive Performance Intelligence 3.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.cameraAwareV834}
    onChange={e=>patch({cameraAwareV834:e.target.checked})}/> Kamerabewusste Ressourcenverteilung aktivieren</label>
   <label>Stärke ({s.cameraStrengthV834} %)<input type="range" min="0" max="100" step="5"
    disabled={!s.cameraAwareV834||!s.perfOptimizerV825} value={s.cameraStrengthV834}
    onChange={e=>patch({cameraStrengthV834:+e.target.value})}/></label>
   <small>Simulierte Porträtansicht bei hoher Last: {cameraSummaryV834.applied?
     `${cameraSummaryV834.reduced.join(', ')} gedämpft · ${cameraSummaryV834.relativeCostSaved.toFixed(2)} relative Kosten gespart`:
     'keine zusätzliche Drosselung'}. Nur bestätigte V761-Kameraabsichten (keine echte Sichtbarkeitsmessung),
     bei manueller Kameraführung keine V834-Umschichtung. Drops und Totalen bleiben bei der V825-Regelung.
     V823-Timeline-Cues, Lyrics, Blackouts und Gerätegrenzen behalten Vorrang.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V826 · Concert Quality Dashboard 2.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.qualityDashboardV826}
    onChange={e=>patch({qualityDashboardV826:e.target.checked})}/> Live-Messung von FPS, Framezeiten und Effektbudgets aktivieren</label>
   <ConcertQualityDashboardV826 enabled={s.qualityDashboardV826}/>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V980 · Concert Quality & Performance Director</legend>
   <label className="setting-check"><input type="checkbox" checked={s.concertQualityDirectorV980}
    onChange={e=>patch({concertQualityDirectorV980:e.target.checked})}/> Intelligente Konzertqualität mit echten FPS-Messfenstern regeln</label>
   <label>Priorität <select value={s.concertQualityModeV980} disabled={!s.concertQualityDirectorV980}
    onChange={e=>patch({concertQualityModeV980:e.target.value as ConcertFxSettingsV810['concertQualityModeV980']})}>
    <option value="visual">Visuelle Qualität länger erhalten</option>
    <option value="balanced">Ausgewogen</option>
    <option value="performance">Flüssigkeit priorisieren</option>
   </select></label>
   <label className="setting-check"><input type="checkbox" checked={s.concertQualityRecoveryV980}
    disabled={!s.concertQualityDirectorV980} onChange={e=>patch({concertQualityRecoveryV980:e.target.checked})}/>
    Dekorative Effekte bei stabiler Bildrate langsam wiederherstellen</label>
   <label className="setting-check"><input type="checkbox" checked={s.concertQualityPiV980}
    disabled={!s.concertQualityDirectorV980} onChange={e=>patch({concertQualityPiV980:e.target.checked})}/>
    Raspberry-Pi-/Sparprofil: FPS-Diagnose einschalten (30-FPS-Ziel; bereits gesperrte FX bleiben aus)</label>
   <small>V980 ersetzt bei Aktivierung die V827-Zusatzregelung; V825 verwaltet weiterhin das eigentliche Effektbudget. Nur nach mehreren echten und gültigen V826-Messfenstern, nur bei bestätigter laufender Songshow. Ausschalten, pausieren, Songwechsel oder fehlende Messungen entfernen automatische Zusatzdrosselung. Im Pi-Sparprofil bleiben V810-FX auch bei aktivem V980 gesperrt; V980 kann dort Last erkennen, aber keine FPS-Verbesserung garantieren. Keine Änderung an Kamera, Avataren, Lyrics, Govee oder Alexa.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V827 · Automatic Concert Quality Tuning</legend>
   <label className="setting-check"><input type="checkbox" checked={s.autoQualityV827}
    onChange={e=>patch({autoQualityV827:e.target.checked})}/> Qualitätsautomatik auf Basis echter Frame-Messfenster</label>
   <label>Reaktionsgeschwindigkeit <select disabled={!s.autoQualityV827||!s.perfOptimizerV825} value={s.autoResponseV827}
    onChange={e=>patch({autoResponseV827:e.target.value as ConcertFxSettingsV810['autoResponseV827']})}>
    <option value="gentle">Sanft – Qualität länger erhalten</option>
    <option value="balanced">Ausgewogen</option>
    <option value="responsive">Schnell – FPS priorisieren</option>
   </select></label>
   <small>V827 ergänzt V825 ausschließlich bei wiederholt erhöhten Framezeiten. Pausen, unbestätigte Songs, ausgeschalteter V825-Optimizer oder Test-Vorschauen lösen keine automatische Änderung aus. Messgröße ist Framezeit, keine GPU-Auslastung.</small>
   <ConcertBenchmarkPanelV827 enabled={s.qualityDashboardV826}/>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V832 · Real GLB Concert Benchmark 2.0</legend>
   <RealGlbBenchmarkPanelV832 enabled={s.qualityDashboardV826}/>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V828 · Concert Experience 4.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.concertExperienceV828}
     onChange={e=>patch({concertExperienceV828:e.target.checked})}/> Abwechslungsreiche, zusammenhängende Konzert-Höhepunkte</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.concertExperienceV828}
     checked={s.concertCrownV828} onChange={e=>patch({concertCrownV828:e.target.checked})}/>
     Seitliche LED-Lichtkrone für Hook, Build, Drop und Finale</label>
   <label>Show-Charakter <select disabled={!s.concertExperienceV828} value={s.experienceStyleV828}
     onChange={e=>patch({experienceStyleV828:e.target.value as ConcertFxSettingsV810['experienceStyleV828']})}>
     <option value="cinematic">Cinematic – filmische Kontraste</option>
     <option value="dynamic">Dynamic – abwechslungsreiche Show</option>
     <option value="festival">Festival – große Hooks, Drops und Finale</option>
   </select></label>
   <label>Show-Intensität ({s.experienceIntensityV828} %)<input type="range" min="0" max="100" step="5"
     disabled={!s.concertExperienceV828} value={s.experienceIntensityV828}
     onChange={e=>patch({experienceIntensityV828:+e.target.value})}/></label>
   <small>Simulierte {section}-Vorschau: {experiencePreviewV828.active?
     `${experiencePreviewV828.label} · Motiv ${experiencePreviewV828.signature+1}/4 · ${experiencePreviewV828.moment} · LED ${Math.round(experiencePreviewV828.gains.led*100)} % · Laser ${Math.round(experiencePreviewV828.gains.laser*100)} % · Schaum ${Math.round(experiencePreviewV828.gains.foam*100)} %`:'inaktiv'}.
    Songabschnitte müssen durch V604/V761 bestätigt sein. V823-Timeline, feste LED-Looks, manuelle Beleuchtung, Lyrics, Performer und V825-FPS-Budgets behalten Vorrang. Keine neuen Kameraschnitte.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V829 · Ultimate Concert Experience – Gesamtabnahme</legend>
   <ConcertAcceptancePanelV829 enabled={s.qualityDashboardV826}/>
  </fieldset>
  <VisualFxTimelineEditorV823 value={s} onChange={onChange}/>
  <label className="setting-check"><input type="checkbox" checked={s.enabled} onChange={e=>patch({enabled:e.target.checked})}/> Konzert-FX aktivieren (nur bei verifizierter Songregie)</label>
  <label>FX-Intensität ({s.intensity} %)<input type="range" min="0" max="100" step="5" value={s.intensity} onChange={e=>patch({intensity:+e.target.value})}/></label>
  <label>Effektqualität<select value={s.quality} onChange={e=>patch({quality:e.target.value as ConcertFxSettingsV810['quality']})}>
   <option value="performance">Performance – geringer GPU-Aufwand</option>
   <option value="balanced">Balanced – ausgewogen</option><option value="ultra">Ultra – stärkere Effekte</option>
  </select></label>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V841 · Professional Lighting Show 5.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.professionalLightingV841}
    onChange={e=>patch({professionalLightingV841:e.target.checked})}/>
    Konzertlicht-Choreografie aus bestätigten Songabschnitten aktivieren</label>
   <label>Stärke ({s.lightingStrengthV841} %)<input type="range" min="0" max="100" step="5"
    disabled={!s.professionalLightingV841} value={s.lightingStrengthV841}
    onChange={e=>patch({lightingStrengthV841:+e.target.value})}/></label>
   <label>Charakter <select disabled={!s.professionalLightingV841} value={s.lightingStyleV841}
    onChange={e=>patch({lightingStyleV841:e.target.value as ConcertFxSettingsV810['lightingStyleV841']})}>
    <option value="cinematic">Cinematic – ruhige Lichtdramaturgie</option>
    <option value="balanced">Balanced – kontrollierte Bewegung</option>
    <option value="festival">Festival – stärkere Drop-Fächer</option>
   </select></label>
   <small>Verwendet vorhandene Spotlights, einen Boden-Gobo und den Laser-Backdrop. Nur mit
    bestätigter V604/V761/V793-Regie; manuelle Cues, Blackouts, Lyrics-Fokus und Effektbudgets
    haben Vorrang. Keine zusätzlichen Lichtquellen, Schatten oder Stroboskop-Effekte.</small>
  </fieldset>
  <label className="setting-check"><input type="checkbox" checked={s.lasers} onChange={e=>patch({lasers:e.target.checked})}/> V811 · Laser Matrix</label>
  <label className="setting-check"><input type="checkbox" checked={s.ribbons} onChange={e=>patch({ribbons:e.target.checked})}/> V811 · Geschwungene Lichtbänder</label>
  <label className="setting-check"><input type="checkbox" checked={s.ledWall} onChange={e=>patch({ledWall:e.target.checked})}/> V812 · Frequenzreaktive LED-Wand</label>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V821 · LED Wall Experience 2.0</legend>
   <label className="setting-check"><input type="checkbox" disabled={!s.ledWall} checked={s.ledExperienceV821} onChange={e=>patch({ledExperienceV821:e.target.checked})}/> Animierte LED-Wand 2.0 aktivieren</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.ledExperienceV821||!s.ledWall} checked={s.ledEqualizerV821} onChange={e=>patch({ledEqualizerV821:e.target.checked})}/> Dynamische Frequenz-Equalizer (Verse)</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.ledExperienceV821||!s.ledWall} checked={s.ledGeometryV821} onChange={e=>patch({ledGeometryV821:e.target.checked})}/> Geometrische Muster (Hooks)</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.ledExperienceV821||!s.ledWall} checked={s.ledDropVisualsV821} onChange={e=>patch({ledDropVisualsV821:e.target.checked})}/> Lichttunnel und Bassringe für Drops / Finale</label>
   <label>LED-Look <select value={s.ledLookV821} disabled={!s.ledWall||!s.ledExperienceV821} onChange={e=>patch({ledLookV821:e.target.value as ConcertFxSettingsV810['ledLookV821']})}>
    <option value="auto">Automatisch nach Songabschnitt</option>
    <option value="equalizer">Equalizer</option><option value="geometry">Geometrie</option>
    <option value="waves">Audiowellen</option><option value="tunnel">Lichttunnel</option>
   </select></label>
   <label>LED-Intensität ({s.ledIntensityV821} %)<input type="range" min="0" max="100" step="5" value={s.ledIntensityV821} disabled={!s.ledWall||!s.ledExperienceV821} onChange={e=>patch({ledIntensityV821:+e.target.value})}/></label>
   <small>Vorschau: {wallPreview.active?`${['Aus','Equalizer','Geometrie','Audiowellen','Lichttunnel'][wallPreview.look]} · ${Math.round(wallPreview.power*100)} %`:'LED Experience aus'} · Abschnitt {section}. Nur auf bestätigten Songabschnitten; keine Vollbildblitze. Das bestehende LED-Mesh bleibt erhalten.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V842 · LED Wall Experience 3.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.ledExperienceV842}
    disabled={!s.enabled||!s.ledWall||!s.ledExperienceV821}
    onChange={e=>patch({ledExperienceV842:e.target.checked})}/> Perspektivischer LED-Tunnel und Geometrie 3.0</label>
   <label>Look <select value={s.ledDepthStyleV842}
    disabled={!s.ledExperienceV842||!s.ledWall||!s.ledExperienceV821}
    onChange={e=>patch({ledDepthStyleV842:e.target.value as ConcertFxSettingsV810['ledDepthStyleV842']})}>
    <option value="auto">Automatisch – Verse/Hook/Build/Drop</option>
    <option value="geometry">Geometrische Architektur</option>
    <option value="tunnel">Perspektivischer Tunnel</option>
   </select></label>
   <label>Zusätzliche Tiefe ({s.ledDepthStrengthV842} %)<input type="range" min="0" max="100" step="5"
    value={s.ledDepthStrengthV842} disabled={!s.ledExperienceV842||!s.ledWall||!s.ledExperienceV821}
    onChange={e=>patch({ledDepthStrengthV842:+e.target.value})}/></label>
   <label className="setting-check"><input type="checkbox" checked={s.ledLightSyncV842}
    disabled={!s.ledExperienceV842||!s.ledWall||!s.ledExperienceV821}
    onChange={e=>patch({ledLightSyncV842:e.target.checked})}/> Mit verifizierter V841-Lichtchoreografie koppeln</label>
   <small>Simulierte LED-Vorschau: {depthPreviewV842.active?
    `${depthPreviewV842.mode===2?'Tiefentunnel':'Geometrie'} · ${Math.round(depthPreviewV842.power*100)} % Zusatzleistung`:
    depthPreviewV842.reason==='protected'?'manuelle LED-Vorgabe hat Vorrang':'aus'}.
    Bildräumliche Tiefe ist eine Shader-Illusion; keine echte 3D-Geometrie. Der bestehende
    LED-Shader behält die maximale Transparenz und schützt die Performer-Mitte.
    Mit manueller LED-Timeline, festem V821-Look, Pausen, Blackout oder Reduced Motion inaktiv.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V870 · LED Wall – neue Muster und Drop-Reaktionen</legend>
   <label className="setting-check"><input type="checkbox" checked={s.ledMotifsV870}
    disabled={!s.ledWall||!s.ledExperienceV821||!s.ledExperienceV842}
    onChange={e=>patch({ledMotifsV870:e.target.checked})}/> Dynamische Equalizer, Prismengeometrie und Bassringe</label>
   <label>Muster <select value={s.ledMotifStyleV870}
    disabled={!s.ledMotifsV870||!s.ledWall||!s.ledExperienceV842}
    onChange={e=>patch({ledMotifStyleV870:e.target.value as ConcertFxSettingsV810['ledMotifStyleV870']})}>
    <option value="auto">Automatisch nach Songabschnitt</option>
    <option value="equalizer">Equalizer-Säulen</option><option value="prism">Prismen-Geometrie</option>
    <option value="shockwave">Bass-Schockwellen (nur Drop/Finale)</option>
   </select></label>
   <label>Zusätzliche Musterstärke ({s.ledMotifStrengthV870} %)
    <input type="range" min="0" max="100" step="5" value={s.ledMotifStrengthV870}
     disabled={!s.ledMotifsV870||!s.ledWall||!s.ledExperienceV842}
     onChange={e=>patch({ledMotifStrengthV870:+e.target.value})}/></label>
   <label className="setting-check"><input type="checkbox" checked={s.ledCameraProtectionV870}
    onChange={e=>patch({ledCameraProtectionV870:e.target.checked})}/> LED-Wand bei Kamera-Nahaufnahmen sanfter darstellen</label>
   <small>Genre- und abschnittsabhängige Vorschau (simuliert): {s.ledMotifsV870?
    (s.ledMotifStyleV870==='auto'?(section==='drop'||section==='finale'?'Bass-Schockwellen':
      section==='hook'||section==='build'?'Prismengeometrie':'Equalizer-Säulen'):s.ledMotifStyleV870):'Aus'}.
    Bestehende LED-Fläche ohne zusätzliche Draw-Calls. Manuelle LED-Spuren, feste V821/V842-Looks,
    verifizierte Musikabschnitte, Reduced Motion, Blackout, Lyrics und Low-Tier behalten Vorrang.
    Kein Vollbildblitz, keine zusätzliche Lichtquelle.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V886 · LED Wall Creative Director</legend>
   <label className="setting-check"><input type="checkbox" checked={s.ledCreativeV886}
    disabled={!s.ledWall||!s.ledExperienceV821}
    onChange={e=>patch({ledCreativeV886:e.target.checked})}/> Vier neue LED-Looks auf der vorhandenen Wand aktivieren</label>
   <label>Animation <select value={s.ledCreativeStyleV886}
    disabled={!s.ledCreativeV886||!s.ledWall||!s.ledExperienceV821}
    onChange={e=>patch({ledCreativeStyleV886:e.target.value as ConcertFxSettingsV810['ledCreativeStyleV886']})}>
    <option value="auto">Automatisch – Verse / Hook / Build / Drop</option>
    <option value="skyline">Skyline Equalizer – dynamische Frequenzsäulen</option>
    <option value="kaleidoscope">Kaleidoskop – rotierende Facetten</option>
    <option value="chevrons">Kinetic Chevrons – laufende Winkel</option>
    <option value="vortex">Drop Vortex – spiralförmiger Tunnel (nur Drop/Finale)</option>
   </select></label>
   <label>Stärke ({s.ledCreativeStrengthV886} %)<input type="range" min="0" max="100" step="5"
    value={s.ledCreativeStrengthV886} disabled={!s.ledCreativeV886||!s.ledWall}
    onChange={e=>patch({ledCreativeStrengthV886:+e.target.value})}/></label>
   <label>Animationsgeschwindigkeit <select value={s.ledCreativeMotionV886}
    disabled={!s.ledCreativeV886||!s.ledWall}
    onChange={e=>patch({ledCreativeMotionV886:e.target.value as ConcertFxSettingsV810['ledCreativeMotionV886']})}>
    <option value="calm">Ruhig</option><option value="balanced">Ausgewogen</option>
    <option value="dynamic">Dynamisch</option>
   </select></label>
   <label className="setting-check"><input type="checkbox" checked={s.ledCreativeCameraGuardV886}
    disabled={!s.ledCreativeV886}
    onChange={e=>patch({ledCreativeCameraGuardV886:e.target.checked})}/>
    Bei Kamera-Nahaufnahmen und manueller Kamera abdunkeln</label>
   <small>Live-Vorschau aus simuliertem Songabschnitt „{section}": {creativePreviewV886.active?
    `${LED_CREATIVE_NAMES_V886[creativePreviewV886.mode]} · Stärke ${Math.round(creativePreviewV886.power*1000)/10} %`:
    creativePreviewV886.reason==='protected'?'manuelle Vorgaben haben Vorrang':'aus'}.
    Eine zusätzliche, sehr schwache Shader-Schicht ohne neues LED-Mesh, Textur oder GPU-Pass.
    Keine erfundenen Drops, keine Stroboskop-Blitze; Song-Timeline, Lyrics, Pausen,
    manuelle Licht-/LED-Spuren und Reduced Motion haben Vorrang.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V822 · Advanced Beat Accent Director</legend>
   <label className="setting-check"><input type="checkbox" checked={s.beatAccentV822} onChange={e=>patch({beatAccentV822:e.target.checked})}/> Gemessene Beat-Akzente auf FX verteilen</label>
   <label>Intensität ({s.beatAccentIntensityV822} %)<input type="range" min="0" max="100" step="5" disabled={!s.beatAccentV822} value={s.beatAccentIntensityV822} onChange={e=>patch({beatAccentIntensityV822:+e.target.value})}/></label>
   <label>Erkennungsschwelle <select disabled={!s.beatAccentV822} value={s.beatAccentSensitivityV822} onChange={e=>patch({beatAccentSensitivityV822:e.target.value as ConcertFxSettingsV810['beatAccentSensitivityV822']})}>
    <option value="conservative">Konservativ (weniger Fehlauslöser)</option><option value="balanced">Balanced</option><option value="responsive">Reaktionsfreudig</option>
   </select></label>
   <label className="setting-check"><input type="checkbox" disabled={!s.beatAccentV822} checked={s.beatAccentKickV822} onChange={e=>patch({beatAccentKickV822:e.target.checked})}/> Kick-artige Transienten</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.beatAccentV822} checked={s.beatAccentSnareV822} onChange={e=>patch({beatAccentSnareV822:e.target.checked})}/> Snare-artige Transienten (Frequenzheuristik)</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.beatAccentV822} checked={s.beatAccentBassV822} onChange={e=>patch({beatAccentBassV822:e.target.checked})}/> Kontinuierlicher Bass</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.beatAccentV822} checked={s.beatAccentPeaksV822} onChange={e=>patch({beatAccentPeaksV822:e.target.checked})}/> Peaks nur bei bestätigter Hook / Drop / Finale</label>
   <small>Simulation: Kick {Math.round(beatPreview.kick*100)} % · Snare-artig {Math.round(beatPreview.snareLike*100)} % · Bass {Math.round(beatPreview.bass*100)} % · Peak {Math.round(beatPreview.peak*100)} %. Mikrofon-Spektralwerte identifizieren keine Instrumente zuverlässig; ohne gemessenen Transienten keine neuen Kick-/Snare-Impulse. Bestehende FX-Schalter, Budget und Sicherheitsregeln bleiben maßgeblich.</small>
  </fieldset>
  <label className="setting-check"><input type="checkbox" checked={s.lyricsProjection} onChange={e=>patch({lyricsProjection:e.target.checked})}/> V813 · Wörter aus synchronisierten Lyrics projizieren</label>
  <label className="setting-check"><input type="checkbox" checked={s.rhymeAccents} onChange={e=>patch({rhymeAccents:e.target.checked})}/> V813 · Wort- und Reim-Endakzente bei vorhandenen Wort-Zeitmarken</label>
  <label>V813 · Projektionsfläche<select value={s.projectionSurface} onChange={e=>patch({projectionSurface:e.target.value as 'wall'|'floor'})}>
    <option value="wall">Bühnenrückwand (hinter den Performern)</option><option value="floor">Bühnenboden</option></select></label>
  <fieldset className="fx-studio-v873"><legend>V873 · Cinematic Lyrics 10.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.cinematicLyricsV873} onChange={e=>patch({cinematicLyricsV873:e.target.checked})}/> Cinematic Hook-Projektion auf bestehender Lyrics-Fläche</label>
   <label>Projektions-Akzent ({s.cinematicLyricsStrengthV873} %)<input type="range" min="0" max="100" step="5" disabled={!s.cinematicLyricsV873||!s.lyricsProjection} value={s.cinematicLyricsStrengthV873} onChange={e=>patch({cinematicLyricsStrengthV873:+e.target.value})}/></label>
   <label>Hook-Größe ({s.hookProjectionSizeV873} %)<input type="range" min="0" max="100" step="5" disabled={!s.cinematicLyricsV873||!s.lyricsProjection} value={s.hookProjectionSizeV873} onChange={e=>patch({hookProjectionSizeV873:+e.target.value})}/></label>
   <label className="setting-check"><input type="checkbox" checked={s.lyricsCameraGuardV873} onChange={e=>patch({lyricsCameraGuardV873:e.target.checked})}/> Bei Nahaufnahmen / dichten Lyrics dimmen</label>
   <small>Nur bestätigte Wort- und Hook-Zeitmarken. Keine zusätzlichen Textobjekte, Phoneme, Trigger oder Kamerawechsel. Die lesbaren Lyrics bleiben vorn; die Projektion erfordert weiterhin den V813-Schalter.</small>
  </fieldset>
  <label className="setting-check"><input type="checkbox" checked={s.atmosphericFx} onChange={e=>patch({atmosphericFx:e.target.checked})}/> V814 · Atmosphärische Konzert-Effekte</label>
  <label className="setting-check"><input type="checkbox" checked={s.floorHaze} onChange={e=>patch({floorHaze:e.target.checked})}/> V814 · Animierte Bodennebel-Bänke</label>
  <label className="setting-check"><input type="checkbox" checked={s.lightShafts} onChange={e=>patch({lightShafts:e.target.checked})}/> V814 · Dezente Lichtkegel hinter den Performern</label>
  <label className="setting-check"><input type="checkbox" checked={s.virtualCrowd} onChange={e=>patch({virtualCrowd:e.target.checked})}/> V815 · Virtuelles Konzertpublikum</label>
  <label className="setting-check"><input type="checkbox" checked={s.crowdPhones} disabled={!s.virtualCrowd} onChange={e=>patch({crowdPhones:e.target.checked})}/> V815 · Leuchtende Handydisplays</label>
  <label>V815 · Publikumsreaktion ({s.crowdIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.virtualCrowd} value={s.crowdIntensity} onChange={e=>patch({crowdIntensity:+e.target.value})}/></label>
  <label>V815 · Publikumsdichte<select value={s.crowdDensity} disabled={!s.virtualCrowd} onChange={e=>patch({crowdDensity:e.target.value as ConcertFxSettingsV810['crowdDensity']})}>
   <option value="sparse">Klein – 40 %</option><option value="balanced">Mittel – 70 %</option><option value="arena">Arena – 100 %</option></select></label>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
    <legend>V973 · Living Audience 3.0</legend>
    <label className="setting-check"><input type="checkbox" checked={s.livingAudienceV973}
      disabled={!s.virtualCrowd} onChange={e=>patch({livingAudienceV973:e.target.checked})}/>
      Lebendiges Publikum – individuelle Bewegungen je Songabschnitt</label>
    <label className="setting-check"><input type="checkbox" checked={s.livingWavesV973}
      disabled={!s.virtualCrowd||!s.livingAudienceV973}
      onChange={e=>patch({livingWavesV973:e.target.checked})}/>
      Räumliche Publikumswellen über die sechs bestehenden Sektoren</label>
    <label className="setting-check"><input type="checkbox" checked={s.livingIndividualV973}
      disabled={!s.virtualCrowd||!s.livingAudienceV973}
      onChange={e=>patch({livingIndividualV973:e.target.checked})}/>
      Leichte individuelle Kopf-, Arm- und Körperbewegungen</label>
    <label>Bewegungsintensität ({s.livingStrengthV973} %)
      <input type="range" min="0" max="100" step="5" value={s.livingStrengthV973}
        disabled={!s.virtualCrowd||!s.livingAudienceV973}
        onChange={e=>patch({livingStrengthV973:+e.target.value})}/></label>
    <label>Publikumsbudget <select value={s.livingQualityV973}
      disabled={!s.virtualCrowd||!s.livingAudienceV973}
      onChange={e=>patch({livingQualityV973:e.target.value as ConcertFxSettingsV810['livingQualityV973']})}>
      <option value="eco">Eco · maximal 24 Personen (Raspberry Pi)</option>
      <option value="balanced">Balanced · maximal 48 Personen</option>
      <option value="cinematic">Cinematic · maximal 72 Personen</option>
    </select></label>
    <small>Simulierte Vorschau: {livingPreviewV973.livingActiveV973?
      `${livingPreviewV973.livingModeV973} · ${Math.round(livingPreviewV973.livingStrengthV973*100)} % · ${livingPreviewV973.count} Personen`:'deaktiviert'}.
      Wirkt nur auf bereits freigegebenes V815-Publikum. Manuelle Kameras/Lichtspuren, Blackout,
      reduzierte Bewegung und der bestehende Performance-Governor behalten Vorrang.
      Kein zweiter Renderloop, kein Mikrofon oder zusätzliches Govee-Kommando.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V874 · Intelligent Audience Experience 2.0</legend>
    <label className="setting-check"><input type="checkbox" checked={s.crowdExperienceV874} disabled={!s.virtualCrowd} onChange={e=>patch({crowdExperienceV874:e.target.checked})}/> Automatische Reaktionen auf Hooks, Drops und Genre</label>
    <label className="setting-check"><input type="checkbox" checked={s.crowdArmWaveV874} disabled={!s.virtualCrowd||!s.crowdExperienceV874} onChange={e=>patch({crowdArmWaveV874:e.target.checked})}/> Synchrone Armbewegungen und Publikumswellen</label>
    <label className="setting-check"><input type="checkbox" checked={s.crowdPhoneWaveV874} disabled={!s.virtualCrowd||!s.crowdPhones||!s.crowdExperienceV874} onChange={e=>patch({crowdPhoneWaveV874:e.target.checked})}/> Rhythmische Handylicht-Wellen</label>
    <span style={{fontSize:12,opacity:.75}}>Simulierte Vorschau · Stil {audienceV874.style} · Armbewegung {Math.round(audienceV874.armLift*100)} % · Handylicht {Math.round(audienceV874.phoneWave*100)} %</span>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
    <legend>V875 · Smart Festival Atmosphere 3.0</legend>
    <label className="setting-check"><input type="checkbox" checked={s.smartFestivalAtmosphereV875}
      disabled={!s.virtualCrowd||!s.crowdExperienceV874}
      onChange={e=>patch({smartFestivalAtmosphereV875:e.target.checked})}/>
      Automatische Festival-Stimmungen nach Musikabschnitt</label>
    <label className="setting-check"><input type="checkbox" checked={s.festivalCrowdWavesV875}
      disabled={!s.smartFestivalAtmosphereV875||!s.crowdArmWaveV874||!s.virtualCrowd}
      onChange={e=>patch({festivalCrowdWavesV875:e.target.checked})}/>
      La-Ola- und Festival-Wellen im Publikum</label>
    <label className="setting-check"><input type="checkbox" checked={s.festivalWristbandsV875}
      disabled={!s.smartFestivalAtmosphereV875||!s.virtualCrowd}
      onChange={e=>patch({festivalWristbandsV875:e.target.checked})}/>
      Synchronisierte virtuelle LED-Armbänder</label>
    <label>Festival-Stimmung ({s.festivalAtmosphereStrengthV875} %)
      <input type="range" min="0" max="100" step="5" value={s.festivalAtmosphereStrengthV875}
       disabled={!s.smartFestivalAtmosphereV875||!s.virtualCrowd}
       onChange={e=>patch({festivalAtmosphereStrengthV875:+e.target.value})}/></label>
    <label>Festival-Stil <select value={s.festivalAtmosphereStyleV875}
       disabled={!s.smartFestivalAtmosphereV875||!s.virtualCrowd}
       onChange={e=>patch({festivalAtmosphereStyleV875:e.target.value as ConcertFxSettingsV810['festivalAtmosphereStyleV875']})}>
      <option value="subtle">Dezent</option><option value="balanced">Ausgewogen</option>
      <option value="immersive">Immersives Festival</option></select></label>
    <small>Simulierte Vorschau: {atmosphereV875.festivalMood} · Welle {Math.round(atmosphereV875.festivalWave*100)} % · LED-Bänder {Math.round(atmosphereV875.wristbandGlow*100)} %. Kein Strobo oder Vollbildblitz. Blackout, manuelle Regie, Lyrics und FPS haben Vorrang.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V876 · Dynamic Festival Crowd Choreography</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdChoreographyV876}
     disabled={!s.virtualCrowd||!s.crowdExperienceV874||!s.smartFestivalAtmosphereV875}
     onChange={e=>patch({crowdChoreographyV876:e.target.checked})}/> Natürliche Publikums-Choreografien automatisch steuern</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdSectorSyncV876}
     disabled={!s.crowdChoreographyV876||!s.virtualCrowd}
     onChange={e=>patch({crowdSectorSyncV876:e.target.checked})}/> Sechs Publikumssektoren synchronisieren</label>
   <label>Bewegungsstärke ({s.crowdChoreographyStrengthV876} %)
     <input type="range" min="0" max="100" step="5" value={s.crowdChoreographyStrengthV876}
      disabled={!s.crowdChoreographyV876||!s.virtualCrowd}
      onChange={e=>patch({crowdChoreographyStrengthV876:+e.target.value})}/></label>
   <label>Choreografie-Stil <select value={s.crowdChoreographyStyleV876}
      disabled={!s.crowdChoreographyV876||!s.virtualCrowd}
      onChange={e=>patch({crowdChoreographyStyleV876:e.target.value as ConcertFxSettingsV810['crowdChoreographyStyleV876']})}>
     <option value="natural">Natürlich</option><option value="concert">Konzert</option>
     <option value="festival">Festival / Rave</option></select></label>
   <small>Simulierte Vorschau: {choreographyV876.choreographyMode} · Reaktionsstärke {Math.round(choreographyV876.choreographyStrength*100)} % · Sektorsynchronisation {choreographyV876.choreographySectorSync?'an':'aus'}. Keine neuen Meshes oder Lichtquellen; Lyrics, Blackout, manuelle Regie und Performance-Limits gehen vor.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V877 · Intelligent Crowd Interaction 4.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdInteractionV877}
    disabled={!s.virtualCrowd||!s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876}
    onChange={e=>patch({crowdInteractionV877:e.target.checked})}/> Publikum interaktiv auf Songmomente reagieren lassen</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdCallResponseV877}
    disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdCallResponseV877:e.target.checked})}/>
    Mitsing- und Rap-Antworten (nur synchronisierte Lyrics)</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdFollowPerformerV877}
    disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdFollowPerformerV877:e.target.checked})}/>
    Geprüftem Lead-Performer-Fokus folgen</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdDanceEchoV877}
    disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdDanceEchoV877:e.target.checked})}/>
    Rhythmische Ensemble-Echos</label>
   <label>Interaktionsstärke ({s.crowdInteractionStrengthV877} %)
    <input type="range" min="0" max="100" step="5" value={s.crowdInteractionStrengthV877}
     disabled={!s.crowdInteractionV877} onChange={e=>patch({crowdInteractionStrengthV877:+e.target.value})}/></label>
   <label>Interaktionsstil <select value={s.crowdInteractionStyleV877}
    disabled={!s.crowdInteractionV877}
    onChange={e=>patch({crowdInteractionStyleV877:e.target.value as ConcertFxSettingsV810['crowdInteractionStyleV877']})}>
    <option value="subtle">Dezent</option><option value="balanced">Ausgewogen</option>
    <option value="lively">Lebendig</option></select></label>
   <small>Simulierte Vorschau: {interactionV877.interactionModeV877} · Stärke {Math.round(interactionV877.interactionStrengthV877*100)} %. Echte Rap-/Mitsingreaktionen benötigen gültige Lyrics-Zeitmarken. Es werden keine Tänzer-Posen erkannt. Vorhandenes Publikum, Blackout, manuelle Show und FPS-Limit behalten Vorrang.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V878 · Smart Audience Emotion &amp; Energy Director</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdEmotionDirectorV878}
    disabled={!s.virtualCrowd||!s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876}
    onChange={e=>patch({crowdEmotionDirectorV878:e.target.checked})}/>
    Intelligenten Spannungsbogen für das Publikum aktivieren</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdEmotionWavesV878}
    disabled={!s.crowdEmotionDirectorV878||!s.crowdArmWaveV874}
    onChange={e=>patch({crowdEmotionWavesV878:e.target.checked})}/>
    Sanfte Wellenbewegungen bei Stimmungswechseln</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdEmotionContrastV878}
    disabled={!s.crowdEmotionDirectorV878}
    onChange={e=>patch({crowdEmotionContrastV878:e.target.checked})}/>
    Ruhige Momente und große Höhepunkte stärker voneinander abheben</label>
   <label>Emotionale Intensität ({s.crowdEmotionStrengthV878} %)
    <input type="range" min="0" max="100" step="5" value={s.crowdEmotionStrengthV878}
     disabled={!s.crowdEmotionDirectorV878}
     onChange={e=>patch({crowdEmotionStrengthV878:+e.target.value})}/></label>
   <label>Reaktionsgeschwindigkeit <select value={s.crowdEmotionStyleV878}
     disabled={!s.crowdEmotionDirectorV878}
     onChange={e=>patch({crowdEmotionStyleV878:e.target.value as ConcertFxSettingsV810['crowdEmotionStyleV878']})}>
     <option value="cinematic">Cinematisch / weich</option><option value="balanced">Ausgewogen</option>
     <option value="responsive">Direkt / lebendig</option></select></label>
   <small>Simulierte Vorschau: {emotionV878.cue.emotionMoodV878} · Energie {Math.round(emotionV878.cue.emotionEnergyV878*100)} %.
    Stimmungswechsel folgen überprüften Songabschnitten, mit Hysterese und Glättung über die Songposition.
    Kein Audio-KI-Emotionsdetektor: die Regie verwendet vorhandene Musikdaten und reaktiviert keine deaktivierten Effekte.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V879 · Intelligent Crowd Camera &amp; Stage Harmony</legend>
   <label className="setting-check"><input type="checkbox" checked={s.crowdCameraHarmonyV879}
    disabled={!s.virtualCrowd||!s.crowdEmotionDirectorV878}
    onChange={e=>patch({crowdCameraHarmonyV879:e.target.checked})}/>
    Publikum und Kameraperspektiven automatisch abstimmen</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdLyricsGuardV879}
    disabled={!s.crowdCameraHarmonyV879}
    onChange={e=>patch({crowdLyricsGuardV879:e.target.checked})}/>
    Bei sichtbaren Lyrics Armbewegungen und Lichtakzente zurücknehmen</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdPerformerPriorityV879}
    disabled={!s.crowdCameraHarmonyV879}
    onChange={e=>patch({crowdPerformerPriorityV879:e.target.checked})}/>
    Sänger und Lead-Performer bei Nahaufnahmen priorisieren</label>
   <label className="setting-check"><input type="checkbox" checked={s.crowdTransitionSofteningV879}
    disabled={!s.crowdCameraHarmonyV879}
    onChange={e=>patch({crowdTransitionSofteningV879:e.target.checked})}/>
    Publikumsreaktionen bei verifizierten Kameraübergängen abmildern</label>
   <label>Schutzintensität ({s.crowdCameraStrengthV879} %)
    <input type="range" min="0" max="100" step="5" value={s.crowdCameraStrengthV879}
     disabled={!s.crowdCameraHarmonyV879}
     onChange={e=>patch({crowdCameraStrengthV879:+e.target.value})}/></label>
   <label>Filmstil <select value={s.crowdCameraStyleV879}
     disabled={!s.crowdCameraHarmonyV879}
     onChange={e=>patch({crowdCameraStyleV879:e.target.value as ConcertFxSettingsV810['crowdCameraStyleV879']})}>
     <option value="cinematic">Cinematisch</option><option value="balanced">Ausgewogen</option>
     <option value="festival">Festival / dynamisch</option></select></label>
   <small>Simulierte Nahaufnahme mit Lyrics: {harmonyPreviewV879.harmonyModeV879} ·
    Publikums-Gain {Math.round(harmonyPreviewV879.harmonyGainV879*100)} %.
    Die Regie verwendet nur vorhandene, verifizierte Kamera-Hinweise und vorhandene
    Publikumsinstanzen. Keine pixelgenaue Verdeckungsprüfung oder neuen Kameras.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}>
   <legend>V880 · Smart Concert Experience 5.0</legend>
   <label className="setting-check"><input type="checkbox" checked={s.smartConcertExperienceV880}
     onChange={e=>patch({smartConcertExperienceV880:e.target.checked})}/>
     Zusammenhängende Konzertdramaturgie über den ganzen Song</label>
   <label className="setting-check"><input type="checkbox" checked={s.smartConcertContrastV880}
     disabled={!s.smartConcertExperienceV880}
     onChange={e=>patch({smartConcertContrastV880:e.target.checked})}/>
     Bewusste Ruhephasen und Kontraste zwischen Hook, Verse und Drop</label>
   <label className="setting-check"><input type="checkbox" checked={s.smartConcertHeroRotationV880}
     disabled={!s.smartConcertExperienceV880}
     onChange={e=>patch({smartConcertHeroRotationV880:e.target.checked})}/>
     Visuelle Höhepunkte zwischen Publikum, LED-Wand und Festival-FX abwechseln</label>
   <label className="setting-check"><input type="checkbox" checked={s.smartConcertPerformerGuardV880}
     disabled={!s.smartConcertExperienceV880}
     onChange={e=>patch({smartConcertPerformerGuardV880:e.target.checked})}/>
     Lyrics und Sänger bei verifizierten Nahaufnahmen schützen</label>
   <label>Show-Dramaturgie ({s.smartConcertStrengthV880} %)
    <input type="range" min="0" max="100" step="5" value={s.smartConcertStrengthV880}
     disabled={!s.smartConcertExperienceV880}
     onChange={e=>patch({smartConcertStrengthV880:+e.target.value})}/></label>
   <label>Show-Stil <select value={s.smartConcertStyleV880}
     disabled={!s.smartConcertExperienceV880}
     onChange={e=>patch({smartConcertStyleV880:e.target.value as ConcertFxSettingsV810['smartConcertStyleV880']})}>
     <option value="cinematic">Cinematisch</option><option value="balanced">Ausgewogen</option>
     <option value="festival">Festival / Energie</option></select></label>
   <small>Simulierte Vorschau: {concertPreviewV880.role} · Schwerpunkt {concertPreviewV880.hero} ·
     LED {Math.round(concertPreviewV880.gains.led*100)} % · Publikum {Math.round(concertPreviewV880.gains.crowd*100)} %.
     Vorhandene Kameras und Tänzer bleiben eigenständig gesteuert; V880 stimmt nur die
     freigegebenen Bühneneffekte mit dem Songverlauf ab.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V816 · Reactive Particle Studio</legend>
    <label className="setting-check"><input type="checkbox" checked={s.reactiveParticles} onChange={e=>patch({reactiveParticles:e.target.checked})}/> Musiksynchrone Partikel aktivieren</label>
    <label className="setting-check"><input type="checkbox" checked={s.particleSparks} disabled={!s.reactiveParticles} onChange={e=>patch({particleSparks:e.target.checked})}/> Seitliche Funken</label>
    <label className="setting-check"><input type="checkbox" checked={s.particleShards} disabled={!s.reactiveParticles} onChange={e=>patch({particleShards:e.target.checked})}/> Digitale Splitter</label>
    <label className="setting-check"><input type="checkbox" checked={s.particleConfetti} disabled={!s.reactiveParticles} onChange={e=>patch({particleConfetti:e.target.checked})}/> Konfetti bei Hooks und Finalen</label>
    <label className="setting-check"><input type="checkbox" checked={s.particleEnergyRings} disabled={!s.reactiveParticles} onChange={e=>patch({particleEnergyRings:e.target.checked})}/> Energie-Ringe</label>
    <label>Partikel-Intensität ({s.particleIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.reactiveParticles} value={s.particleIntensity} onChange={e=>patch({particleIntensity:+e.target.value})}/></label>
    <label>Partikel-Dichte<select value={s.particleDensity} disabled={!s.reactiveParticles} onChange={e=>patch({particleDensity:e.target.value as ConcertFxSettingsV810['particleDensity']})}>
       <option value="subtle">Dezent</option><option value="balanced">Ausgewogen</option><option value="epic">Episch</option>
    </select></label>
    <small>Simulation: {particlePreview.active?`${particlePreview.sparks} Funken · ${particlePreview.shards} Splitter · ${particlePreview.confetti} Konfetti · ${particlePreview.rings} Ringe`:'Effekte aus'} – reelle Mengen hängen von Gerät, Songabschnitt und Audioanalyse ab.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V817 · Kinetic Stage & virtuelle Schaumkanone</legend>
    <label className="setting-check"><input type="checkbox" checked={s.kineticStage} onChange={e=>patch({kineticStage:e.target.checked})}/> Bewegliche LED-Säulen aktivieren</label>
    <label>Architektur-Intensität ({s.kineticIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.kineticStage} value={s.kineticIntensity} onChange={e=>patch({kineticIntensity:+e.target.value})}/></label>
    <label className="setting-check"><input type="checkbox" checked={s.foamCannon} onChange={e=>patch({foamCannon:e.target.checked})}/> Schaumkanone aktivieren (virtueller 3D-Effekt)</label>
    <label>Schaumstoß-Intensität ({s.foamIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.foamCannon} value={s.foamIntensity} onChange={e=>patch({foamIntensity:+e.target.value})}/></label>
    <label>Schaumkanonen-Position<select value={s.foamSide} disabled={!s.foamCannon} onChange={e=>patch({foamSide:e.target.value as ConcertFxSettingsV810['foamSide']})}>
      <option value="both">Links + rechts</option><option value="left">Nur links</option><option value="right">Nur rechts</option>
    </select></label>
    <div className="setting-group"><strong>V843 · Foam Cannon Experience 2.0</strong>
      <label className="setting-check"><input type="checkbox" checked={s.foamExperienceV843} disabled={!s.foamCannon} onChange={e=>patch({foamExperienceV843:e.target.checked})}/> Natürliche Schaumstrahlen und Flugbahnen</label>
      <label>Bewegungsrealismus ({s.foamRealismV843} %)<input type="range" min="0" max="100" step="5" disabled={!s.foamCannon||!s.foamExperienceV843} value={s.foamRealismV843} onChange={e=>patch({foamRealismV843:+e.target.value})}/></label>
      <label>Stil<select value={s.foamStyleV843} disabled={!s.foamCannon||!s.foamExperienceV843} onChange={e=>patch({foamStyleV843:e.target.value as ConcertFxSettingsV810['foamStyleV843']})}>
        <option value="natural">Natürlich</option><option value="soft">Sanft</option><option value="festival">Festival / Hardtekk</option>
      </select></label>
      <label className="setting-check"><input type="checkbox" checked={s.foamLandingV843} disabled={!s.foamCannon||!s.foamExperienceV843} onChange={e=>patch({foamLandingV843:e.target.checked})}/> Weiches Absinken und kurzzeitiger Schaum am Bühnenrand</label>
      <small>Geometrie-Vorschau: {foamMotionPreviewV843.active?`aktiv · Bogen ${Math.round(foamMotionPreviewV843.arc*100)} % · Verwirbelung ${Math.round(foamMotionPreviewV843.flutter*100)} %`:'aus'}. Dieselben V817-Instanzen; keine dauerhafte Ansammlung und keine echte Fluid-Simulation. Sicherheits- und Performance-Limits bleiben erhalten.</small>
    </div>
    <small>Simulation: {kineticPreview.active?`${kineticPreview.columns} bewegte LED-Säulen`:'LED-Säulen aus'} · {foamPreview.active?`${foamPreview.bubbles+foamPreview.mist} Schaum-Instanzen`:'Schaumkanone aus'}. Die Show benötigt bestätigte Songabschnitte und echte Audio-Akzente; kein automatischer Dauerstrahl.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V820 · Vocal & Adlib FX Studio</legend>
   <label className="setting-check"><input type="checkbox" checked={s.vocalFx} onChange={e=>patch({vocalFx:e.target.checked})}/> V820 · Vocal-FX für ausdrücklich zugewiesene Rapper aktivieren</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.vocalFx} checked={s.vocalLeadAura} onChange={e=>patch({vocalLeadAura:e.target.checked})}/> Lead-Rapper: dezente seitliche Aura</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.vocalFx} checked={s.vocalFeatureAura} onChange={e=>patch({vocalFeatureAura:e.target.checked})}/> Feature-Rapper: kontrastierende Lichtstruktur</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.vocalFx} checked={s.vocalAdlibs} onChange={e=>patch({vocalAdlibs:e.target.checked})}/> Bestätigte Adlibs: seitlicher Wortimpuls</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.vocalFx||!s.vocalAdlibs} checked={s.vocalAdlibWords} onChange={e=>patch({vocalAdlibWords:e.target.checked})}/> Adlib-Wörter nur bei expliziter Markierung und Wort-Zeitmarke</label>
   <label>Vocal-FX-Intensität ({s.vocalFxIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.vocalFx} value={s.vocalFxIntensity} onChange={e=>patch({vocalFxIntensity:+e.target.value})}/></label>
   <small>Simulierte Vorschau: {vocalPreview.active?`Lead ${vocalPreview.leadSlot+1} · Adlib ${vocalPreview.adlibSlot===null?'aus':vocalPreview.adlibSlot+1} · ${Math.round(vocalPreview.leadOpacity*100)} % Aura`:'Vocal-FX aus'}. Live werden ausschließlich gespeicherte V496-Vocal-Segmente für die aktuelle Song-ID verwendet. Keine automatische Stimmerkennung. Ohne explizite Adlib-Timings kein Adlib-Effekt; Text benötigt zusätzlich synchrone Wort-Zeitmarken und [vocal:adlib:Slot]-Markierung. Kameraschnitt und Licht-Timeline bleiben unverändert.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V819 · Cinematic Scene Transition FX</legend>
   <label className="setting-check"><input type="checkbox" checked={s.sceneTransitions} onChange={e=>patch({sceneTransitions:e.target.checked})}/> Filmische Szenenübergänge bei bestätigten V791-Szenenwechseln</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.sceneTransitions} checked={s.transitionWipes} onChange={e=>patch({transitionWipes:e.target.checked})}/> Licht-Wipes</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.sceneTransitions} checked={s.transitionGlitch} onChange={e=>patch({transitionGlitch:e.target.checked})}/> Digitale Glitch-Streifen</label>
   <label className="setting-check"><input type="checkbox" disabled={!s.sceneTransitions} checked={s.transitionDissolve} onChange={e=>patch({transitionDissolve:e.target.checked})}/> Weiche Lichtblenden</label>
   <label>Übergangsstil<select value={s.transitionStyle} disabled={!s.sceneTransitions} onChange={e=>patch({transitionStyle:e.target.value as ConcertFxSettingsV810['transitionStyle']})}>
    <option value="auto">Automatisch nach Genre</option><option value="wipe">Licht-Wipe</option><option value="glitch">Glitch</option><option value="dissolve">Lichtblende</option>
   </select></label>
   <label>Übergangsintensität ({s.transitionIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.sceneTransitions} value={s.transitionIntensity} onChange={e=>patch({transitionIntensity:+e.target.value})}/></label>
   <small>Simulation: {cinematicPreview.active?`${cinematicPreview.style} · ${Math.round(cinematicPreview.opacity*100)} % Bühnenflügel-Transparenz`:'Übergang aus'}. Kein zusätzlicher Kameraschnitt: V791 behält die Kontrolle über Kamera und Licht. Keine Vollbildblitze; echte Übergänge nur an verifizierten Szenengrenzen.</small>
  </fieldset>
  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V818 · Spectral Music Visuals</legend>
    <label className="setting-check"><input type="checkbox" checked={s.spectralVisuals} onChange={e=>patch({spectralVisuals:e.target.checked})}/> 3D-Spektralvisualisierung aktivieren</label>
    <label className="setting-check"><input type="checkbox" disabled={!s.spectralVisuals} checked={s.spectralBassWaves} onChange={e=>patch({spectralBassWaves:e.target.checked})}/> Basswellen auf den Bühnenflügeln</label>
    <label className="setting-check"><input type="checkbox" disabled={!s.spectralVisuals} checked={s.spectralFrequencyRings} onChange={e=>patch({spectralFrequencyRings:e.target.checked})}/> Frequenzringe (Mitten / Höhen)</label>
    <label className="setting-check"><input type="checkbox" disabled={!s.spectralVisuals} checked={s.spectralGeometry} onChange={e=>patch({spectralGeometry:e.target.checked})}/> 3D-Frequenzsäulen</label>
    <label>Spektral-Intensität ({s.spectralIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.spectralVisuals} value={s.spectralIntensity} onChange={e=>patch({spectralIntensity:+e.target.value})}/></label>
    <small>Simulierte Vorschau: {spectralPreview.active?`${spectralPreview.waves} Basswellen · ${spectralPreview.rings} Frequenzringe · ${spectralPreview.prisms} 3D-Säulen`:'Spektral-FX aus'}. In der Show kommen nur gemessene Frequenzanteile zur Anwendung.</small>
  </fieldset>
  <label className="setting-check"><input type="checkbox" checked={s.protectLyrics} onChange={e=>patch({protectLyrics:e.target.checked})}/> Lyrics und Gesichter vor visuellen Effekten schützen</label>
  <label>Farbwelt<select value={s.palette} onChange={e=>patch({palette:e.target.value as ConcertFxSettingsV810['palette']})}>
   <option value="genre">Automatisch nach Genre</option><option value="custom">Eigene Farben</option></select></label>
  {s.palette==='custom'&&<div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
   <label>Laserfarbe A <input aria-label="Laserfarbe A" type="color" value={s.primary} onChange={e=>patch({primary:e.target.value})}/></label>
   <label>Laserfarbe B <input aria-label="Laserfarbe B" type="color" value={s.secondary} onChange={e=>patch({secondary:e.target.value})}/></label>
  </div>}
  <strong>Effektvorschau (Simulation)</strong>
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
   <label>Genre<select aria-label="FX-Vorschau Genre" value={genre} onChange={e=>setGenre(e.target.value as ConcertFxGenreV810)}>
    {genres.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}
   </select></label>
   <label>Songabschnitt<select aria-label="FX-Vorschau Abschnitt" value={section} onChange={e=>setSection(e.target.value as ConcertFxSectionV810)}>
    {sections.map(sec=><option key={sec} value={sec}>{sec}</option>)}
   </select></label>
  </div>
  <div aria-label="Schematische Konzert-FX-Vorschau" role="img" style={{height:150,position:'relative',overflow:'hidden',borderRadius:12,
    border:'1px solid #555',background:`radial-gradient(ellipse at center bottom, ${palette.primary}20, #080b17 66%)`}}>
    {Array.from({length:18},(_,i)=>{const level=(preview.ledGain+wallPreview.power)*(wallPreview.look===2?.55:1)*(.28+.72*Math.abs(Math.sin(i*.7+preview.bass*2)));
      return <span key={'led'+i} style={{position:'absolute',left:`${7+i*4.9}%`,bottom:'17%',width:'2.7%',height:`${10+60*level}%`,background:palette.primary,opacity:.20+level*.6,borderRadius:3}}/>;})}
    {wallPreview.active&&wallPreview.look===2&&[0,1,2,3].map(i=><span key={'led-poly'+i} style={{position:'absolute',
      left:`${i<2?9+i*7:67+(i-2)*7}%`,top:`${18+(i%2)*12}%`,width:36+(i%2)*22,height:36+(i%2)*22,
      border:`1.5px solid ${i%2?palette.secondary:palette.primary}`,transform:`rotate(${i*30}deg)`,
      opacity:Math.min(.78,wallPreview.power*2.7),boxShadow:`0 0 9px ${palette.primary}`}}/>)}
    {wallPreview.active&&wallPreview.look===4&&[0,1,2].map(i=><span key={'led-tunnel'+i} style={{position:'absolute',
      left:`${17+i*9}%`,top:`${12+i*11}%`,width:`${66-i*18}%`,height:`${77-i*22}%`,
      border:`${1+i*.4}px solid ${i%2?palette.secondary:palette.primary}`,
      borderRadius:12,opacity:Math.min(.76,wallPreview.power*2.4)}}/>)}
    {wallPreview.active&&wallPreview.look===3&&[0,1,2].map(i=><span key={'led-wave'+i} style={{position:'absolute',
      left:0,right:0,top:`${23+i*24}%`,height:5,borderTop:`2px solid ${i%2?palette.primary:palette.secondary}`,
      transform:`skewY(${i%2?8:-8}deg)`,opacity:Math.min(.75,wallPreview.power*2.4)}}/>)}
    {preview.laserOpacity>0&&Array.from({length:8},(_,i)=><span key={'beam'+i} style={{position:'absolute',bottom:'8%',left:i<4?'4%':'96%',
      width:'1.5px',height:'122%',transformOrigin:'bottom',transform:`rotate(${(i<4?-1:1)*(15+(i%4)*13)}deg)`,background:palette.secondary,
      boxShadow:`0 0 ${4+preview.laserOpacity*100}px ${palette.secondary}`,opacity:Math.min(.85,.24+preview.laserOpacity*3)}}/>)}
    {crowdPreview.active&&Array.from({length:Math.min(24,Math.ceil(crowdPreview.count/3))},(_,i)=>{
     const side=i%2===0?0:1;const column=Math.floor(i/2)%12;
     return <span key={'crowd'+i} style={{position:'absolute',bottom:`${(i%3)*2}%`,left:`${side?65+column*2.9:4+column*2.9}%`,
       width:7,height:11,background:'#151d35',borderRadius:'60% 60% 25% 25%',opacity:.85,
       boxShadow:i%5===0&&crowdPreview.phoneOpacity>0?`3px -9px 2px ${palette.primary}`:'none'}}/>;
    })}
    {particlePreview.active&&Array.from({length:Math.min(18,Math.ceil(particlePreview.sparks/4))},(_,i)=>{
     const side=i%2===0?0:1;const col=Math.floor(i/2);
     return <span key={'spark'+i} style={{position:'absolute',left:`${side?75+col*1.7:6+col*1.7}%`,
       bottom:`${14+(i*31)%65}%`,width:2,height:3+(i%4)*3,
       background:palette.primary,transform:`rotate(${(i%3)*24}deg)`,
       boxShadow:`0 0 5px ${palette.primary}`,opacity:.28+particlePreview.sparkOpacity}}/>;
    })}
    {particlePreview.rings>0&&[0,1].map(i=><span key={'ring'+i} style={{position:'absolute',
      left:i?'78%':'8%',bottom:'30%',width:28,height:28,border:`2px solid ${palette.secondary}`,
      borderRadius:'100%',opacity:particlePreview.ringOpacity,boxShadow:`0 0 10px ${palette.secondary}`}}/>)}
    {kineticPreview.active&&Array.from({length:Math.min(kineticPreview.columns,12)},(_,i)=>{
      const side=i%2===0?0:1;const row=Math.floor(i/2);
      return <span key={'pillar'+i} style={{position:'absolute',bottom:'14%',left:`${side?65+row*4:32-row*4}%`,
        width:5,height:28+(row%3)*12+kineticPreview.lift*12,background:row%2?palette.secondary:palette.primary,
        borderRadius:2,opacity:kineticPreview.opacity,boxShadow:`0 0 6px ${palette.primary}`}}/>;
    })}
    {foamPreview.active&&Array.from({length:28},(_,i)=>{
      const left=i%2===0;const sideAllowed=foamPreview.side==='both'||foamPreview.side===(left?'left':'right');
      const lifetime=((i*37)%29)/29;
      return sideAllowed?<span key={'foam'+i} style={{position:'absolute',
        bottom:`${12+lifetime*55-lifetime*lifetime*30}%`,
        left:`${left?12-lifetime*7:88+lifetime*7}%`,width:3+(i%4)*2,height:3+(i%4)*2,
        borderRadius:'50%',background:'#effaff',opacity:foamPreview.opacity*.95,
        boxShadow:'0 0 4px #c6f4ff'}}/>:null;
    })}
    {spectralPreview.active&&Array.from({length:Math.min(14,Math.ceil(spectralPreview.prisms/3))},(_,i)=>{
      const left=i%2===0;const band=i%3===0?spectralPreview.bass:i%3===1?spectralPreview.mids:spectralPreview.highs;
      return <span key={'spectral'+i} style={{position:'absolute',bottom:'15%',
        left:`${left?5+Math.floor(i/2)*2:94-Math.floor(i/2)*2}%`,width:3,height:4+band*38,
        background:i%3===2?palette.secondary:palette.primary,opacity:spectralPreview.prismOpacity*2,
        boxShadow:`0 0 5px ${palette.primary}`}}/>;
    })}
    <div style={{position:'absolute',bottom:0,left:'39%',width:'22%',height:'59%',background:'#0a0d19',borderRadius:'48% 48% 0 0',opacity:.95}}/>
    <span style={{position:'absolute',left:12,top:10,fontSize:12,color:'#e4eaff'}}>Preview · {preview.reason==='music'?section.toUpperCase():'FX AUS'}</span>
  </div>
  <small>Die schematische Vorschau zeigt V810–V812, die V821-LED-Looks und eine stark vereinfachte V815-Publikumsanordnung; V816–V822 sind schematisch simuliert, nicht mit echten Messdaten. V813 benötigt reale synchronisierte Lyrics; V814 wird auf der Live-3D-Bühne gerendert. Reimähnliche Endungen sind nur heuristische visuelle Akzente, keine verifizierte Reimanalyse. Die Vorschau nutzt simulierte Audiosignale, nicht Spotify oder Mikrofon. In der echten Show starten Effekte nur bei verifizierten Abschnitten. Pausen, gespeicherte Licht-Timelines, Blackouts, Reduced Motion und Low-Tier haben Vorrang. Die Qualität wird durch die bestehende Geräte-Performance-Stufe zusätzlich begrenzt. Keine echten Laser oder Stroboskopblitze.</small>
 </fieldset>;
}
