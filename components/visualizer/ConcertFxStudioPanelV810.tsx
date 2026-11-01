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
import {planReactiveParticlesV816} from './reactiveParticlePlannerV816';
import {planFoamCannonV817} from './foamCannonPlannerV817';
import {planFestivalSpecialFxV844} from './festivalSpecialFxPlannerV844';
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
 return <fieldset><legend>V810–V850 · Concert FX Studio 2.0</legend>
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
  <label className="setting-check"><input type="checkbox" checked={s.atmosphericFx} onChange={e=>patch({atmosphericFx:e.target.checked})}/> V814 · Atmosphärische Konzert-Effekte</label>
  <label className="setting-check"><input type="checkbox" checked={s.floorHaze} onChange={e=>patch({floorHaze:e.target.checked})}/> V814 · Animierte Bodennebel-Bänke</label>
  <label className="setting-check"><input type="checkbox" checked={s.lightShafts} onChange={e=>patch({lightShafts:e.target.checked})}/> V814 · Dezente Lichtkegel hinter den Performern</label>
  <label className="setting-check"><input type="checkbox" checked={s.virtualCrowd} onChange={e=>patch({virtualCrowd:e.target.checked})}/> V815 · Virtuelles Konzertpublikum</label>
  <label className="setting-check"><input type="checkbox" checked={s.crowdPhones} disabled={!s.virtualCrowd} onChange={e=>patch({crowdPhones:e.target.checked})}/> V815 · Leuchtende Handydisplays</label>
  <label>V815 · Publikumsreaktion ({s.crowdIntensity} %)<input type="range" min="0" max="100" step="5" disabled={!s.virtualCrowd} value={s.crowdIntensity} onChange={e=>patch({crowdIntensity:+e.target.value})}/></label>
  <label>V815 · Publikumsdichte<select value={s.crowdDensity} disabled={!s.virtualCrowd} onChange={e=>patch({crowdDensity:e.target.value as ConcertFxSettingsV810['crowdDensity']})}>
   <option value="sparse">Klein – 40 %</option><option value="balanced">Mittel – 70 %</option><option value="arena">Arena – 100 %</option></select></label>
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
