import {normalizeFxTimelineV823} from './visualFxTimelineV823';
import type {FxTimelineCueV823} from './visualFxTimelineV823';
/** V810 – one musical authority for V811/V812 effects. Pure, seek-stable, no clock. */
export type ConcertFxQualityV810='performance'|'balanced'|'ultra';
export type ConcertFxGenreV810='rap'|'hardtekk'|'hardstyle'|'rock'|'pop'|'neutral';
export type ConcertFxSectionV810='intro'|'verse'|'hook'|'build'|'drop'|'break'|'finale';
export interface ConcertFxSettingsV810 {
  enabled:boolean;intensity:number;quality:ConcertFxQualityV810;
  lasers:boolean;ribbons:boolean;ledWall:boolean;protectLyrics:boolean;
  ledExperienceV821:boolean;ledEqualizerV821:boolean;ledGeometryV821:boolean;ledDropVisualsV821:boolean;
  ledLookV821:'auto'|'equalizer'|'geometry'|'waves'|'tunnel';ledIntensityV821:number;
  ledExperienceV842:boolean;ledDepthStrengthV842:number;ledDepthStyleV842:'auto'|'geometry'|'tunnel';ledLightSyncV842:boolean;
  ledMotifsV870:boolean;ledMotifStrengthV870:number;ledMotifStyleV870:'auto'|'equalizer'|'prism'|'shockwave';ledCameraProtectionV870:boolean;
  ledCreativeV886:boolean;ledCreativeStrengthV886:number;
  ledCreativeStyleV886:'auto'|'skyline'|'kaleidoscope'|'chevrons'|'vortex';
  ledCreativeMotionV886:'calm'|'balanced'|'dynamic';ledCreativeCameraGuardV886:boolean;
  bassImpactV991:boolean;bassImpactStrengthV991:number;
  bassImpactStyleV991:'ripple'|'shockwave'|'subtle';bassImpactParticlesV991:boolean;
  livingLedWallV990:boolean;livingLedStrengthV990:number;
  livingLedStyleV990:'auto'|'city'|'matrix'|'arena'|'prism';
  livingLedMotionV990:'calm'|'balanced'|'energetic';livingLedCameraGuardV990:boolean;
  lyricsProjection:boolean;rhymeAccents:boolean;projectionSurface:'wall'|'floor';
  cinematicLyricsV873:boolean;cinematicLyricsStrengthV873:number;hookProjectionSizeV873:number;lyricsCameraGuardV873:boolean;
  atmosphericFx:boolean;floorHaze:boolean;lightShafts:boolean;
  virtualCrowd:boolean;crowdPhones:boolean;crowdIntensity:number;crowdDensity:'sparse'|'balanced'|'arena';
  crowdExperienceV874:boolean;crowdArmWaveV874:boolean;crowdPhoneWaveV874:boolean;
  smartFestivalAtmosphereV875:boolean;festivalCrowdWavesV875:boolean;festivalWristbandsV875:boolean;festivalAtmosphereStrengthV875:number;festivalAtmosphereStyleV875:'subtle'|'balanced'|'immersive';
  crowdChoreographyV876:boolean;crowdSectorSyncV876:boolean;crowdChoreographyStrengthV876:number;crowdChoreographyStyleV876:'natural'|'concert'|'festival';
  crowdInteractionV877:boolean;crowdCallResponseV877:boolean;crowdFollowPerformerV877:boolean;crowdDanceEchoV877:boolean;crowdInteractionStrengthV877:number;crowdInteractionStyleV877:'subtle'|'balanced'|'lively';
  crowdEmotionDirectorV878:boolean;crowdEmotionWavesV878:boolean;crowdEmotionContrastV878:boolean;crowdEmotionStrengthV878:number;crowdEmotionStyleV878:'cinematic'|'balanced'|'responsive';
  crowdCameraHarmonyV879:boolean;crowdCameraStrengthV879:number;crowdLyricsGuardV879:boolean;
  livingAudienceV973:boolean;livingWavesV973:boolean;livingIndividualV973:boolean;
  livingStrengthV973:number;livingQualityV973:'eco'|'balanced'|'cinematic';
  crowdPerformerPriorityV879:boolean;crowdTransitionSofteningV879:boolean;
  crowdCameraStyleV879:'cinematic'|'balanced'|'festival';
  smartConcertExperienceV880:boolean;smartConcertStrengthV880:number;smartConcertContrastV880:boolean;
  smartConcertHeroRotationV880:boolean;smartConcertPerformerGuardV880:boolean;
  smartConcertStyleV880:'cinematic'|'balanced'|'festival';
  reactiveParticles:boolean;particleSparks:boolean;particleShards:boolean;particleConfetti:boolean;particleEnergyRings:boolean;
  particleIntensity:number;particleDensity:'subtle'|'balanced'|'epic';
  kineticStage:boolean;kineticIntensity:number;foamCannon:boolean;foamIntensity:number;foamSide:'both'|'left'|'right';
  immersiveFxV1028:boolean;immersiveFxStrengthV1028:number;
  aiVisualDirectorV1029:boolean;aiVisualDirectorStrengthV1029:number;
  intelligentAtmosphereV1030:boolean;atmosphereStrengthV1030:number;
  festivalFxV844:boolean;festivalIntensityV844:number;festivalStyleV844:'balanced'|'festival';
  festivalCoordinationV871:boolean;festivalClarityV871:number;
  festivalCo2V844:boolean;festivalSparksV844:boolean;festivalConfettiV844:boolean;
  festivalStrobeV844:boolean;festivalStrobeIntensityV844:number;festivalStrobeRateV844:0.5|1|2;
  festivalSoapBubblesV8441:boolean;festivalBubblesIntensityV8441:number;
  festivalBubbleStyleV8441:'soft'|'floating'|'festival';
  intelligentTransitionsV849:boolean;transitionStrengthV849:number;transitionModeV849:'smooth'|'cinematic'|'festival';
  festivalDirectorV850:boolean;festivalDirectorStrengthV850:number;festivalDirectorStyleV850:'cinematic'|'balanced'|'festival';
  festivalFullStageFlashV8441:boolean;festivalFlashIntensityV8441:number;
  festivalFlashRateV8441:0.5|1|2;
  festivalPaperStreamersV846:boolean;festivalStreamerIntensityV846:number;
  festivalStreamerStyleV846:'classic'|'spiral'|'festival';
  festivalMetallicRainV847:boolean;festivalSparkWheelsV847:boolean;
  festivalFinaleIntensityV847:number;festivalMetallicPaletteV847:'gold'|'silver'|'mixed';
  foamExperienceV843:boolean;foamRealismV843:number;foamStyleV843:'natural'|'soft'|'festival';foamLandingV843:boolean;
  spectralVisuals:boolean;spectralBassWaves:boolean;spectralFrequencyRings:boolean;spectralGeometry:boolean;spectralIntensity:number;
  sceneTransitions:boolean;transitionWipes:boolean;transitionGlitch:boolean;transitionDissolve:boolean;
  transitionIntensity:number;transitionStyle:'auto'|'wipe'|'glitch'|'dissolve';
  vocalFx:boolean;vocalLeadAura:boolean;vocalFeatureAura:boolean;vocalAdlibs:boolean;vocalAdlibWords:boolean;vocalFxIntensity:number;
  beatAccentV822:boolean;beatAccentIntensityV822:number;
  beatAccentSensitivityV822:'conservative'|'balanced'|'responsive';
  beatAccentKickV822:boolean;beatAccentSnareV822:boolean;beatAccentBassV822:boolean;beatAccentPeaksV822:boolean;
  timelineEnabledV823:boolean;timelineCuesV823:FxTimelineCueV823[];
  smartShowV824:boolean;smartShowIntensityV824:number;smartShowModeV824:'cinematic'|'balanced'|'festival';
  cameraAwareV834:boolean;cameraStrengthV834:number;
  professionalLightingV841:boolean;lightingStrengthV841:number;lightingStyleV841:'cinematic'|'balanced'|'festival';
  perfOptimizerV825:boolean;perfModeV825:'balanced'|'fps'|'quality';perfSensitivityV825:number;
  qualityDashboardV826:boolean;concertQualityDirectorV980:boolean;concertQualityModeV980:'visual'|'balanced'|'performance';concertQualityPiV980:boolean;concertQualityRecoveryV980:boolean;autoQualityV827:boolean;autoResponseV827:'gentle'|'balanced'|'responsive';
  concertExperienceV828:boolean;experienceIntensityV828:number;experienceStyleV828:'cinematic'|'dynamic'|'festival';concertCrownV828:boolean;
  palette:'genre'|'custom';primary:string;secondary:string;
}
export const DEFAULT_CONCERT_FX_V810:Readonly<ConcertFxSettingsV810>={
  enabled:true,intensity:68,quality:'balanced',lasers:true,ribbons:true,ledWall:true,
  protectLyrics:true,
  ledExperienceV821:true,ledEqualizerV821:true,ledGeometryV821:true,ledDropVisualsV821:true,
  ledLookV821:'auto',ledIntensityV821:75,
  ledExperienceV842:true,ledDepthStrengthV842:65,ledDepthStyleV842:'auto',ledLightSyncV842:true,
  ledMotifsV870:true,ledMotifStrengthV870:60,ledMotifStyleV870:'auto',ledCameraProtectionV870:true,
  ledCreativeV886:true,ledCreativeStrengthV886:55,ledCreativeStyleV886:'auto',
  ledCreativeMotionV886:'balanced',ledCreativeCameraGuardV886:true,
  bassImpactV991:false,bassImpactStrengthV991:65,bassImpactStyleV991:'ripple',bassImpactParticlesV991:true,
  livingLedWallV990:false,livingLedStrengthV990:65,livingLedStyleV990:'auto',
  livingLedMotionV990:'balanced',livingLedCameraGuardV990:true,
  lyricsProjection:true,rhymeAccents:true,projectionSurface:'wall',
  cinematicLyricsV873:true,cinematicLyricsStrengthV873:65,hookProjectionSizeV873:60,lyricsCameraGuardV873:true,
  atmosphericFx:true,floorHaze:true,lightShafts:true,
  virtualCrowd:true,crowdPhones:true,crowdIntensity:65,crowdDensity:'balanced',
  crowdExperienceV874:true,crowdArmWaveV874:true,crowdPhoneWaveV874:true,
  smartFestivalAtmosphereV875:true,festivalCrowdWavesV875:true,festivalWristbandsV875:true,festivalAtmosphereStrengthV875:65,festivalAtmosphereStyleV875:'balanced',
  crowdChoreographyV876:true,crowdSectorSyncV876:true,crowdChoreographyStrengthV876:65,crowdChoreographyStyleV876:'concert',
  crowdInteractionV877:true,crowdCallResponseV877:true,crowdFollowPerformerV877:true,crowdDanceEchoV877:true,crowdInteractionStrengthV877:65,crowdInteractionStyleV877:'balanced',
  crowdEmotionDirectorV878:true,crowdEmotionWavesV878:true,crowdEmotionContrastV878:true,crowdEmotionStrengthV878:65,crowdEmotionStyleV878:'balanced',
  crowdCameraHarmonyV879:true,crowdCameraStrengthV879:70,crowdLyricsGuardV879:true,
  livingAudienceV973:true,livingWavesV973:true,livingIndividualV973:true,
  livingStrengthV973:65,livingQualityV973:'balanced',
  crowdPerformerPriorityV879:true,crowdTransitionSofteningV879:true,crowdCameraStyleV879:'balanced',
  smartConcertExperienceV880:true,smartConcertStrengthV880:65,smartConcertContrastV880:true,
  smartConcertHeroRotationV880:true,smartConcertPerformerGuardV880:true,smartConcertStyleV880:'balanced',
  reactiveParticles:true,particleSparks:true,particleShards:true,particleConfetti:true,particleEnergyRings:true,
  particleIntensity:65,particleDensity:'balanced',
  kineticStage:true,kineticIntensity:65,foamCannon:true,foamIntensity:65,foamSide:'both',
  immersiveFxV1028:true,immersiveFxStrengthV1028:65,
  aiVisualDirectorV1029:true,aiVisualDirectorStrengthV1029:70,
  intelligentAtmosphereV1030:true,atmosphereStrengthV1030:65,
  festivalFxV844:true,festivalIntensityV844:65,festivalStyleV844:'balanced',
  festivalCoordinationV871:true,festivalClarityV871:70,
  festivalCo2V844:true,festivalSparksV844:true,festivalConfettiV844:true,
  festivalStrobeV844:false,festivalStrobeIntensityV844:25,festivalStrobeRateV844:1,
  festivalSoapBubblesV8441:true,festivalBubblesIntensityV8441:60,festivalBubbleStyleV8441:'floating',
  festivalFullStageFlashV8441:false,festivalFlashIntensityV8441:20,festivalFlashRateV8441:0.5,
  intelligentTransitionsV849:true,transitionStrengthV849:65,transitionModeV849:'smooth',
  festivalDirectorV850:true,festivalDirectorStrengthV850:65,festivalDirectorStyleV850:'balanced',
  festivalPaperStreamersV846:true,festivalStreamerIntensityV846:65,festivalStreamerStyleV846:'spiral',
  festivalMetallicRainV847:true,festivalSparkWheelsV847:true,
  festivalFinaleIntensityV847:65,festivalMetallicPaletteV847:'mixed',
  foamExperienceV843:true,foamRealismV843:65,foamStyleV843:'natural',foamLandingV843:true,
  spectralVisuals:true,spectralBassWaves:true,spectralFrequencyRings:true,spectralGeometry:true,spectralIntensity:65,
  sceneTransitions:true,transitionWipes:true,transitionGlitch:true,transitionDissolve:true,
  transitionIntensity:65,transitionStyle:'auto',
  vocalFx:true,vocalLeadAura:true,vocalFeatureAura:true,vocalAdlibs:true,vocalAdlibWords:true,vocalFxIntensity:60,
  beatAccentV822:true,beatAccentIntensityV822:65,beatAccentSensitivityV822:'balanced',
  beatAccentKickV822:true,beatAccentSnareV822:true,beatAccentBassV822:true,beatAccentPeaksV822:true,
  timelineEnabledV823:true,timelineCuesV823:[],
  smartShowV824:true,smartShowIntensityV824:65,smartShowModeV824:'balanced',
  cameraAwareV834:true,cameraStrengthV834:65,
  professionalLightingV841:true,lightingStrengthV841:65,lightingStyleV841:'balanced',
  perfOptimizerV825:true,perfModeV825:'balanced',perfSensitivityV825:65,
  qualityDashboardV826:true,concertQualityDirectorV980:false,concertQualityModeV980:'balanced',concertQualityPiV980:false,concertQualityRecoveryV980:true,autoQualityV827:true,autoResponseV827:'balanced',
  concertExperienceV828:true,experienceIntensityV828:66,experienceStyleV828:'dynamic',concertCrownV828:true,
  palette:'genre',primary:'#40e5ff',secondary:'#ef4ad8',
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo=0,hi=1)=>Math.min(hi,Math.max(lo,n));
const color=(s:unknown,fallback:string)=>typeof s==='string'&&/^#[0-9a-fA-F]{6}$/.test(s)?s:fallback;
export function normalizeConcertFxV810(raw?:Partial<ConcertFxSettingsV810>|null):ConcertFxSettingsV810 {
 const d=DEFAULT_CONCERT_FX_V810;
 return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:d.enabled,
 intensity:finite(raw?.intensity)?Math.round(clamp(raw.intensity,0,100)):d.intensity,
 quality:raw?.quality==='performance'||raw?.quality==='ultra'||raw?.quality==='balanced'?raw.quality:d.quality,
 lasers:typeof raw?.lasers==='boolean'?raw.lasers:d.lasers,
 ribbons:typeof raw?.ribbons==='boolean'?raw.ribbons:d.ribbons,
 ledWall:typeof raw?.ledWall==='boolean'?raw.ledWall:d.ledWall,
 ledExperienceV821:typeof raw?.ledExperienceV821==='boolean'?raw.ledExperienceV821:d.ledExperienceV821,
 ledEqualizerV821:typeof raw?.ledEqualizerV821==='boolean'?raw.ledEqualizerV821:d.ledEqualizerV821,
 ledGeometryV821:typeof raw?.ledGeometryV821==='boolean'?raw.ledGeometryV821:d.ledGeometryV821,
 ledDropVisualsV821:typeof raw?.ledDropVisualsV821==='boolean'?raw.ledDropVisualsV821:d.ledDropVisualsV821,
 ledLookV821:['auto','equalizer','geometry','waves','tunnel'].includes(raw?.ledLookV821??'')?raw!.ledLookV821!:d.ledLookV821,
 ledIntensityV821:finite(raw?.ledIntensityV821)?Math.round(clamp(raw.ledIntensityV821,0,100)):d.ledIntensityV821,
 ledExperienceV842:typeof raw?.ledExperienceV842==='boolean'?raw.ledExperienceV842:d.ledExperienceV842,
 ledDepthStrengthV842:finite(raw?.ledDepthStrengthV842)?Math.round(clamp(raw.ledDepthStrengthV842,0,100)):d.ledDepthStrengthV842,
 ledDepthStyleV842:raw?.ledDepthStyleV842==='geometry'||raw?.ledDepthStyleV842==='tunnel'?raw.ledDepthStyleV842:'auto',
 ledLightSyncV842:typeof raw?.ledLightSyncV842==='boolean'?raw.ledLightSyncV842:d.ledLightSyncV842,
 ledMotifsV870:typeof raw?.ledMotifsV870==='boolean'?raw.ledMotifsV870:d.ledMotifsV870,
 ledMotifStrengthV870:finite(raw?.ledMotifStrengthV870)?Math.round(clamp(raw.ledMotifStrengthV870,0,100)):d.ledMotifStrengthV870,
 ledMotifStyleV870:raw?.ledMotifStyleV870==='equalizer'||raw?.ledMotifStyleV870==='prism'||raw?.ledMotifStyleV870==='shockwave'?raw.ledMotifStyleV870:'auto',
 ledCameraProtectionV870:typeof raw?.ledCameraProtectionV870==='boolean'?raw.ledCameraProtectionV870:d.ledCameraProtectionV870,
 ledCreativeV886:typeof raw?.ledCreativeV886==='boolean'?raw.ledCreativeV886:d.ledCreativeV886,
 ledCreativeStrengthV886:finite(raw?.ledCreativeStrengthV886)?Math.round(clamp(raw.ledCreativeStrengthV886,0,100)):d.ledCreativeStrengthV886,
 ledCreativeStyleV886:raw?.ledCreativeStyleV886==='skyline'||raw?.ledCreativeStyleV886==='kaleidoscope'||
  raw?.ledCreativeStyleV886==='chevrons'||raw?.ledCreativeStyleV886==='vortex'?raw.ledCreativeStyleV886:'auto',
 ledCreativeMotionV886:raw?.ledCreativeMotionV886==='calm'||raw?.ledCreativeMotionV886==='dynamic'?raw.ledCreativeMotionV886:'balanced',
 ledCreativeCameraGuardV886:typeof raw?.ledCreativeCameraGuardV886==='boolean'?raw.ledCreativeCameraGuardV886:d.ledCreativeCameraGuardV886,
 bassImpactV991:typeof raw?.bassImpactV991==='boolean'?raw.bassImpactV991:d.bassImpactV991,
 bassImpactStrengthV991:finite(raw?.bassImpactStrengthV991)?Math.round(clamp(raw.bassImpactStrengthV991,0,100)):d.bassImpactStrengthV991,
 bassImpactStyleV991:raw?.bassImpactStyleV991==='shockwave'||raw?.bassImpactStyleV991==='subtle'?raw.bassImpactStyleV991:'ripple',
 bassImpactParticlesV991:typeof raw?.bassImpactParticlesV991==='boolean'?raw.bassImpactParticlesV991:d.bassImpactParticlesV991,
 livingLedWallV990:typeof raw?.livingLedWallV990==='boolean'?raw.livingLedWallV990:d.livingLedWallV990,
 livingLedStrengthV990:finite(raw?.livingLedStrengthV990)?Math.round(clamp(raw.livingLedStrengthV990,0,100)):d.livingLedStrengthV990,
 livingLedStyleV990:['auto','city','matrix','arena','prism'].includes(raw?.livingLedStyleV990??'')?raw!.livingLedStyleV990!:d.livingLedStyleV990,
 livingLedMotionV990:['calm','balanced','energetic'].includes(raw?.livingLedMotionV990??'')?raw!.livingLedMotionV990!:d.livingLedMotionV990,
 livingLedCameraGuardV990:typeof raw?.livingLedCameraGuardV990==='boolean'?raw.livingLedCameraGuardV990:d.livingLedCameraGuardV990,
 protectLyrics:typeof raw?.protectLyrics==='boolean'?raw.protectLyrics:d.protectLyrics,
 lyricsProjection:typeof raw?.lyricsProjection==='boolean'?raw.lyricsProjection:d.lyricsProjection,
 rhymeAccents:typeof raw?.rhymeAccents==='boolean'?raw.rhymeAccents:d.rhymeAccents,
 projectionSurface:raw?.projectionSurface==='floor'?'floor':'wall',
 cinematicLyricsV873:typeof raw?.cinematicLyricsV873==='boolean'?raw.cinematicLyricsV873:d.cinematicLyricsV873,
 cinematicLyricsStrengthV873:finite(raw?.cinematicLyricsStrengthV873)?Math.round(clamp(raw.cinematicLyricsStrengthV873,0,100)):d.cinematicLyricsStrengthV873,
 hookProjectionSizeV873:finite(raw?.hookProjectionSizeV873)?Math.round(clamp(raw.hookProjectionSizeV873,0,100)):d.hookProjectionSizeV873,
 lyricsCameraGuardV873:typeof raw?.lyricsCameraGuardV873==='boolean'?raw.lyricsCameraGuardV873:d.lyricsCameraGuardV873,
 atmosphericFx:typeof raw?.atmosphericFx==='boolean'?raw.atmosphericFx:d.atmosphericFx,
 floorHaze:typeof raw?.floorHaze==='boolean'?raw.floorHaze:d.floorHaze,
 lightShafts:typeof raw?.lightShafts==='boolean'?raw.lightShafts:d.lightShafts,
 virtualCrowd:typeof raw?.virtualCrowd==='boolean'?raw.virtualCrowd:d.virtualCrowd,
 crowdPhones:typeof raw?.crowdPhones==='boolean'?raw.crowdPhones:d.crowdPhones,
 crowdIntensity:finite(raw?.crowdIntensity)?Math.round(clamp(raw.crowdIntensity,0,100)):d.crowdIntensity,
 crowdDensity:raw?.crowdDensity==='sparse'||raw?.crowdDensity==='arena'?raw.crowdDensity:'balanced',
 crowdExperienceV874:typeof raw?.crowdExperienceV874==='boolean'?raw.crowdExperienceV874:d.crowdExperienceV874,
 crowdArmWaveV874:typeof raw?.crowdArmWaveV874==='boolean'?raw.crowdArmWaveV874:d.crowdArmWaveV874,
 crowdPhoneWaveV874:typeof raw?.crowdPhoneWaveV874==='boolean'?raw.crowdPhoneWaveV874:d.crowdPhoneWaveV874,
 smartFestivalAtmosphereV875:typeof raw?.smartFestivalAtmosphereV875==='boolean'?raw.smartFestivalAtmosphereV875:d.smartFestivalAtmosphereV875,
 festivalCrowdWavesV875:typeof raw?.festivalCrowdWavesV875==='boolean'?raw.festivalCrowdWavesV875:d.festivalCrowdWavesV875,
 festivalWristbandsV875:typeof raw?.festivalWristbandsV875==='boolean'?raw.festivalWristbandsV875:d.festivalWristbandsV875,
 festivalAtmosphereStrengthV875:finite(raw?.festivalAtmosphereStrengthV875)?Math.round(clamp(raw.festivalAtmosphereStrengthV875,0,100)):d.festivalAtmosphereStrengthV875,
 festivalAtmosphereStyleV875:raw?.festivalAtmosphereStyleV875==='subtle'||raw?.festivalAtmosphereStyleV875==='immersive'?raw.festivalAtmosphereStyleV875:'balanced',
 crowdChoreographyV876:typeof raw?.crowdChoreographyV876==='boolean'?raw.crowdChoreographyV876:d.crowdChoreographyV876,
 crowdSectorSyncV876:typeof raw?.crowdSectorSyncV876==='boolean'?raw.crowdSectorSyncV876:d.crowdSectorSyncV876,
 crowdChoreographyStrengthV876:finite(raw?.crowdChoreographyStrengthV876)?Math.round(clamp(raw.crowdChoreographyStrengthV876,0,100)):d.crowdChoreographyStrengthV876,
 crowdChoreographyStyleV876:raw?.crowdChoreographyStyleV876==='natural'||raw?.crowdChoreographyStyleV876==='festival'?raw.crowdChoreographyStyleV876:'concert',
 crowdInteractionV877:typeof raw?.crowdInteractionV877==='boolean'?raw.crowdInteractionV877:d.crowdInteractionV877,
 crowdCallResponseV877:typeof raw?.crowdCallResponseV877==='boolean'?raw.crowdCallResponseV877:d.crowdCallResponseV877,
 crowdFollowPerformerV877:typeof raw?.crowdFollowPerformerV877==='boolean'?raw.crowdFollowPerformerV877:d.crowdFollowPerformerV877,
 crowdDanceEchoV877:typeof raw?.crowdDanceEchoV877==='boolean'?raw.crowdDanceEchoV877:d.crowdDanceEchoV877,
 crowdInteractionStrengthV877:finite(raw?.crowdInteractionStrengthV877)?Math.round(clamp(raw.crowdInteractionStrengthV877,0,100)):d.crowdInteractionStrengthV877,
 crowdInteractionStyleV877:raw?.crowdInteractionStyleV877==='subtle'||raw?.crowdInteractionStyleV877==='lively'?raw.crowdInteractionStyleV877:'balanced',
 crowdEmotionDirectorV878:typeof raw?.crowdEmotionDirectorV878==='boolean'?raw.crowdEmotionDirectorV878:d.crowdEmotionDirectorV878,
 crowdEmotionWavesV878:typeof raw?.crowdEmotionWavesV878==='boolean'?raw.crowdEmotionWavesV878:d.crowdEmotionWavesV878,
 crowdEmotionContrastV878:typeof raw?.crowdEmotionContrastV878==='boolean'?raw.crowdEmotionContrastV878:d.crowdEmotionContrastV878,
 crowdEmotionStrengthV878:finite(raw?.crowdEmotionStrengthV878)?Math.round(clamp(raw.crowdEmotionStrengthV878,0,100)):d.crowdEmotionStrengthV878,
 crowdEmotionStyleV878:raw?.crowdEmotionStyleV878==='cinematic'||raw?.crowdEmotionStyleV878==='responsive'?raw.crowdEmotionStyleV878:'balanced',
 crowdCameraHarmonyV879:typeof raw?.crowdCameraHarmonyV879==='boolean'?raw.crowdCameraHarmonyV879:d.crowdCameraHarmonyV879,
 crowdCameraStrengthV879:finite(raw?.crowdCameraStrengthV879)?Math.round(clamp(raw.crowdCameraStrengthV879,0,100)):d.crowdCameraStrengthV879,
 crowdLyricsGuardV879:typeof raw?.crowdLyricsGuardV879==='boolean'?raw.crowdLyricsGuardV879:d.crowdLyricsGuardV879,
 livingAudienceV973:typeof raw?.livingAudienceV973==='boolean'?raw.livingAudienceV973:d.livingAudienceV973,
 livingWavesV973:typeof raw?.livingWavesV973==='boolean'?raw.livingWavesV973:d.livingWavesV973,
 livingIndividualV973:typeof raw?.livingIndividualV973==='boolean'?raw.livingIndividualV973:d.livingIndividualV973,
 livingStrengthV973:finite(raw?.livingStrengthV973)?Math.round(clamp(raw.livingStrengthV973,0,100)):d.livingStrengthV973,
 livingQualityV973:raw?.livingQualityV973==='eco'||raw?.livingQualityV973==='cinematic'?raw.livingQualityV973:'balanced',
 crowdPerformerPriorityV879:typeof raw?.crowdPerformerPriorityV879==='boolean'?raw.crowdPerformerPriorityV879:d.crowdPerformerPriorityV879,
 crowdTransitionSofteningV879:typeof raw?.crowdTransitionSofteningV879==='boolean'?raw.crowdTransitionSofteningV879:d.crowdTransitionSofteningV879,
 crowdCameraStyleV879:raw?.crowdCameraStyleV879==='cinematic'||raw?.crowdCameraStyleV879==='festival'?raw.crowdCameraStyleV879:'balanced',
 smartConcertExperienceV880:typeof raw?.smartConcertExperienceV880==='boolean'?raw.smartConcertExperienceV880:d.smartConcertExperienceV880,
 smartConcertStrengthV880:finite(raw?.smartConcertStrengthV880)?Math.round(clamp(raw.smartConcertStrengthV880,0,100)):d.smartConcertStrengthV880,
 smartConcertContrastV880:typeof raw?.smartConcertContrastV880==='boolean'?raw.smartConcertContrastV880:d.smartConcertContrastV880,
 smartConcertHeroRotationV880:typeof raw?.smartConcertHeroRotationV880==='boolean'?raw.smartConcertHeroRotationV880:d.smartConcertHeroRotationV880,
 smartConcertPerformerGuardV880:typeof raw?.smartConcertPerformerGuardV880==='boolean'?raw.smartConcertPerformerGuardV880:d.smartConcertPerformerGuardV880,
 smartConcertStyleV880:raw?.smartConcertStyleV880==='cinematic'||raw?.smartConcertStyleV880==='festival'?raw.smartConcertStyleV880:'balanced',
 reactiveParticles:typeof raw?.reactiveParticles==='boolean'?raw.reactiveParticles:d.reactiveParticles,
 particleSparks:typeof raw?.particleSparks==='boolean'?raw.particleSparks:d.particleSparks,
 particleShards:typeof raw?.particleShards==='boolean'?raw.particleShards:d.particleShards,
 particleConfetti:typeof raw?.particleConfetti==='boolean'?raw.particleConfetti:d.particleConfetti,
 particleEnergyRings:typeof raw?.particleEnergyRings==='boolean'?raw.particleEnergyRings:d.particleEnergyRings,
 particleIntensity:finite(raw?.particleIntensity)?Math.round(clamp(raw.particleIntensity,0,100)):d.particleIntensity,
 particleDensity:raw?.particleDensity==='subtle'||raw?.particleDensity==='epic'?raw.particleDensity:'balanced',
 kineticStage:typeof raw?.kineticStage==='boolean'?raw.kineticStage:d.kineticStage,
 kineticIntensity:finite(raw?.kineticIntensity)?Math.round(clamp(raw.kineticIntensity,0,100)):d.kineticIntensity,
 foamCannon:typeof raw?.foamCannon==='boolean'?raw.foamCannon:d.foamCannon,
 foamIntensity:finite(raw?.foamIntensity)?Math.round(clamp(raw.foamIntensity,0,100)):d.foamIntensity,
 foamSide:raw?.foamSide==='left'||raw?.foamSide==='right'?raw.foamSide:'both',
 immersiveFxV1028:typeof raw?.immersiveFxV1028==='boolean'?raw.immersiveFxV1028:d.immersiveFxV1028,
 immersiveFxStrengthV1028:finite(raw?.immersiveFxStrengthV1028)?Math.round(clamp(raw.immersiveFxStrengthV1028,0,100)):d.immersiveFxStrengthV1028,
 aiVisualDirectorV1029:typeof raw?.aiVisualDirectorV1029==='boolean'?raw.aiVisualDirectorV1029:d.aiVisualDirectorV1029,
 aiVisualDirectorStrengthV1029:finite(raw?.aiVisualDirectorStrengthV1029)?Math.round(clamp(raw.aiVisualDirectorStrengthV1029,0,100)):d.aiVisualDirectorStrengthV1029,
 intelligentAtmosphereV1030:typeof raw?.intelligentAtmosphereV1030==='boolean'?raw.intelligentAtmosphereV1030:d.intelligentAtmosphereV1030,
 atmosphereStrengthV1030:finite(raw?.atmosphereStrengthV1030)?Math.round(clamp(raw.atmosphereStrengthV1030,0,100)):d.atmosphereStrengthV1030,
 festivalFxV844:typeof raw?.festivalFxV844==='boolean'?raw.festivalFxV844:d.festivalFxV844,
 festivalCoordinationV871:typeof raw?.festivalCoordinationV871==='boolean'?raw.festivalCoordinationV871:d.festivalCoordinationV871,
 festivalClarityV871:finite(raw?.festivalClarityV871)?Math.round(clamp(raw.festivalClarityV871,0,100)):d.festivalClarityV871,
 festivalIntensityV844:finite(raw?.festivalIntensityV844)?Math.round(clamp(raw.festivalIntensityV844,0,100)):d.festivalIntensityV844,
 festivalStyleV844:raw?.festivalStyleV844==='festival'?'festival':'balanced',
 festivalCo2V844:typeof raw?.festivalCo2V844==='boolean'?raw.festivalCo2V844:d.festivalCo2V844,
 festivalSparksV844:typeof raw?.festivalSparksV844==='boolean'?raw.festivalSparksV844:d.festivalSparksV844,
 festivalConfettiV844:typeof raw?.festivalConfettiV844==='boolean'?raw.festivalConfettiV844:d.festivalConfettiV844,
 festivalStrobeV844:typeof raw?.festivalStrobeV844==='boolean'?raw.festivalStrobeV844:d.festivalStrobeV844,
 festivalStrobeIntensityV844:finite(raw?.festivalStrobeIntensityV844)?Math.round(clamp(raw.festivalStrobeIntensityV844,0,50)):d.festivalStrobeIntensityV844,
 festivalStrobeRateV844:raw?.festivalStrobeRateV844===.5||raw?.festivalStrobeRateV844===2?raw.festivalStrobeRateV844:1,
 festivalSoapBubblesV8441:typeof raw?.festivalSoapBubblesV8441==='boolean'?raw.festivalSoapBubblesV8441:d.festivalSoapBubblesV8441,
 festivalBubblesIntensityV8441:finite(raw?.festivalBubblesIntensityV8441)?Math.round(clamp(raw.festivalBubblesIntensityV8441,0,100)):d.festivalBubblesIntensityV8441,
 festivalBubbleStyleV8441:raw?.festivalBubbleStyleV8441==='soft'||raw?.festivalBubbleStyleV8441==='festival'?raw.festivalBubbleStyleV8441:'floating',
 festivalFullStageFlashV8441:typeof raw?.festivalFullStageFlashV8441==='boolean'?raw.festivalFullStageFlashV8441:d.festivalFullStageFlashV8441,
 festivalFlashIntensityV8441:finite(raw?.festivalFlashIntensityV8441)?Math.round(clamp(raw.festivalFlashIntensityV8441,0,35)):d.festivalFlashIntensityV8441,
 festivalFlashRateV8441:raw?.festivalFlashRateV8441===1||raw?.festivalFlashRateV8441===2?raw.festivalFlashRateV8441:.5,
 intelligentTransitionsV849:typeof raw?.intelligentTransitionsV849==='boolean'?raw.intelligentTransitionsV849:d.intelligentTransitionsV849,
 transitionStrengthV849:finite(raw?.transitionStrengthV849)?Math.round(clamp(raw.transitionStrengthV849,0,100)):d.transitionStrengthV849,
 transitionModeV849:raw?.transitionModeV849==='cinematic'||raw?.transitionModeV849==='festival'?raw.transitionModeV849:'smooth',
 festivalDirectorV850:typeof raw?.festivalDirectorV850==='boolean'?raw.festivalDirectorV850:d.festivalDirectorV850,
 festivalDirectorStrengthV850:finite(raw?.festivalDirectorStrengthV850)?Math.round(clamp(raw.festivalDirectorStrengthV850,0,100)):d.festivalDirectorStrengthV850,
 festivalDirectorStyleV850:raw?.festivalDirectorStyleV850==='cinematic'||raw?.festivalDirectorStyleV850==='festival'?raw.festivalDirectorStyleV850:'balanced',
 festivalPaperStreamersV846:typeof raw?.festivalPaperStreamersV846==='boolean'?raw.festivalPaperStreamersV846:d.festivalPaperStreamersV846,
 festivalStreamerIntensityV846:finite(raw?.festivalStreamerIntensityV846)?Math.round(clamp(raw.festivalStreamerIntensityV846,0,100)):d.festivalStreamerIntensityV846,
 festivalStreamerStyleV846:raw?.festivalStreamerStyleV846==='classic'||raw?.festivalStreamerStyleV846==='festival'?raw.festivalStreamerStyleV846:'spiral',
 festivalMetallicRainV847:typeof raw?.festivalMetallicRainV847==='boolean'?raw.festivalMetallicRainV847:d.festivalMetallicRainV847,
 festivalSparkWheelsV847:typeof raw?.festivalSparkWheelsV847==='boolean'?raw.festivalSparkWheelsV847:d.festivalSparkWheelsV847,
 festivalFinaleIntensityV847:finite(raw?.festivalFinaleIntensityV847)?Math.round(clamp(raw.festivalFinaleIntensityV847,0,100)):d.festivalFinaleIntensityV847,
 festivalMetallicPaletteV847:raw?.festivalMetallicPaletteV847==='gold'||raw?.festivalMetallicPaletteV847==='silver'?raw.festivalMetallicPaletteV847:'mixed',
 foamExperienceV843:typeof raw?.foamExperienceV843==='boolean'?raw.foamExperienceV843:d.foamExperienceV843,
 foamRealismV843:finite(raw?.foamRealismV843)?Math.round(clamp(raw.foamRealismV843,0,100)):d.foamRealismV843,
 foamStyleV843:raw?.foamStyleV843==='soft'||raw?.foamStyleV843==='festival'?raw.foamStyleV843:'natural',
 foamLandingV843:typeof raw?.foamLandingV843==='boolean'?raw.foamLandingV843:d.foamLandingV843,
 spectralVisuals:typeof raw?.spectralVisuals==='boolean'?raw.spectralVisuals:d.spectralVisuals,
 spectralBassWaves:typeof raw?.spectralBassWaves==='boolean'?raw.spectralBassWaves:d.spectralBassWaves,
 spectralFrequencyRings:typeof raw?.spectralFrequencyRings==='boolean'?raw.spectralFrequencyRings:d.spectralFrequencyRings,
 spectralGeometry:typeof raw?.spectralGeometry==='boolean'?raw.spectralGeometry:d.spectralGeometry,
 spectralIntensity:finite(raw?.spectralIntensity)?Math.round(clamp(raw.spectralIntensity,0,100)):d.spectralIntensity,
 sceneTransitions:typeof raw?.sceneTransitions==='boolean'?raw.sceneTransitions:d.sceneTransitions,
 transitionWipes:typeof raw?.transitionWipes==='boolean'?raw.transitionWipes:d.transitionWipes,
 transitionGlitch:typeof raw?.transitionGlitch==='boolean'?raw.transitionGlitch:d.transitionGlitch,
 transitionDissolve:typeof raw?.transitionDissolve==='boolean'?raw.transitionDissolve:d.transitionDissolve,
 transitionIntensity:finite(raw?.transitionIntensity)?Math.round(clamp(raw.transitionIntensity,0,100)):d.transitionIntensity,
 transitionStyle:raw?.transitionStyle==='wipe'||raw?.transitionStyle==='glitch'||raw?.transitionStyle==='dissolve'?raw.transitionStyle:'auto',
 vocalFx:typeof raw?.vocalFx==='boolean'?raw.vocalFx:d.vocalFx,
 vocalLeadAura:typeof raw?.vocalLeadAura==='boolean'?raw.vocalLeadAura:d.vocalLeadAura,
 vocalFeatureAura:typeof raw?.vocalFeatureAura==='boolean'?raw.vocalFeatureAura:d.vocalFeatureAura,
 vocalAdlibs:typeof raw?.vocalAdlibs==='boolean'?raw.vocalAdlibs:d.vocalAdlibs,
 vocalAdlibWords:typeof raw?.vocalAdlibWords==='boolean'?raw.vocalAdlibWords:d.vocalAdlibWords,
 vocalFxIntensity:finite(raw?.vocalFxIntensity)?Math.round(clamp(raw.vocalFxIntensity,0,100)):d.vocalFxIntensity,
 beatAccentV822:typeof raw?.beatAccentV822==='boolean'?raw.beatAccentV822:d.beatAccentV822,
 beatAccentIntensityV822:finite(raw?.beatAccentIntensityV822)?Math.round(clamp(raw.beatAccentIntensityV822,0,100)):d.beatAccentIntensityV822,
 beatAccentSensitivityV822:raw?.beatAccentSensitivityV822==='conservative'||raw?.beatAccentSensitivityV822==='responsive'?raw.beatAccentSensitivityV822:'balanced',
 beatAccentKickV822:typeof raw?.beatAccentKickV822==='boolean'?raw.beatAccentKickV822:d.beatAccentKickV822,
 beatAccentSnareV822:typeof raw?.beatAccentSnareV822==='boolean'?raw.beatAccentSnareV822:d.beatAccentSnareV822,
 beatAccentBassV822:typeof raw?.beatAccentBassV822==='boolean'?raw.beatAccentBassV822:d.beatAccentBassV822,
 beatAccentPeaksV822:typeof raw?.beatAccentPeaksV822==='boolean'?raw.beatAccentPeaksV822:d.beatAccentPeaksV822,
 timelineEnabledV823:typeof raw?.timelineEnabledV823==='boolean'?raw.timelineEnabledV823:d.timelineEnabledV823,
 timelineCuesV823:normalizeFxTimelineV823(raw?.timelineCuesV823),
 smartShowV824:typeof raw?.smartShowV824==='boolean'?raw.smartShowV824:d.smartShowV824,
 smartShowIntensityV824:finite(raw?.smartShowIntensityV824)?Math.round(clamp(raw.smartShowIntensityV824,0,100)):d.smartShowIntensityV824,
 smartShowModeV824:raw?.smartShowModeV824==='cinematic'||raw?.smartShowModeV824==='festival'?raw.smartShowModeV824:'balanced',
 cameraAwareV834:typeof raw?.cameraAwareV834==='boolean'?raw.cameraAwareV834:d.cameraAwareV834,
 cameraStrengthV834:finite(raw?.cameraStrengthV834)?Math.round(clamp(raw.cameraStrengthV834,0,100)):d.cameraStrengthV834,
 professionalLightingV841:typeof raw?.professionalLightingV841==='boolean'?raw.professionalLightingV841:d.professionalLightingV841,
 lightingStrengthV841:finite(raw?.lightingStrengthV841)?Math.round(clamp(raw.lightingStrengthV841,0,100)):d.lightingStrengthV841,
 lightingStyleV841:raw?.lightingStyleV841==='cinematic'||raw?.lightingStyleV841==='festival'?raw.lightingStyleV841:'balanced',
 perfOptimizerV825:typeof raw?.perfOptimizerV825==='boolean'?raw.perfOptimizerV825:d.perfOptimizerV825,
 perfModeV825:raw?.perfModeV825==='fps'||raw?.perfModeV825==='quality'?raw.perfModeV825:'balanced',
 perfSensitivityV825:finite(raw?.perfSensitivityV825)?Math.round(clamp(raw.perfSensitivityV825,0,100)):d.perfSensitivityV825,
 qualityDashboardV826:typeof raw?.qualityDashboardV826==='boolean'?raw.qualityDashboardV826:d.qualityDashboardV826,
 concertQualityDirectorV980:typeof raw?.concertQualityDirectorV980==='boolean'?raw.concertQualityDirectorV980:d.concertQualityDirectorV980,
 concertQualityModeV980:raw?.concertQualityModeV980==='visual'||raw?.concertQualityModeV980==='performance'?raw.concertQualityModeV980:'balanced',
 concertQualityPiV980:typeof raw?.concertQualityPiV980==='boolean'?raw.concertQualityPiV980:d.concertQualityPiV980,
 concertQualityRecoveryV980:typeof raw?.concertQualityRecoveryV980==='boolean'?raw.concertQualityRecoveryV980:d.concertQualityRecoveryV980,
 autoQualityV827:typeof raw?.autoQualityV827==='boolean'?raw.autoQualityV827:d.autoQualityV827,
 autoResponseV827:raw?.autoResponseV827==='gentle'||raw?.autoResponseV827==='responsive'?raw.autoResponseV827:'balanced',
 concertExperienceV828:typeof raw?.concertExperienceV828==='boolean'?raw.concertExperienceV828:d.concertExperienceV828,
 concertCrownV828:typeof raw?.concertCrownV828==='boolean'?raw.concertCrownV828:d.concertCrownV828,
 experienceIntensityV828:finite(raw?.experienceIntensityV828)?Math.round(clamp(raw.experienceIntensityV828,0,100)):d.experienceIntensityV828,
 experienceStyleV828:raw?.experienceStyleV828==='cinematic'||raw?.experienceStyleV828==='festival'?raw.experienceStyleV828:'dynamic',
 palette:raw?.palette==='custom'?'custom':'genre',primary:color(raw?.primary,d.primary),secondary:color(raw?.secondary,d.secondary)};
}
export function concertFxGenreV810(raw:string|null|undefined):ConcertFxGenreV810 {
 const name=(raw??'').toLowerCase();
 if(/hardtekk|viennatek|\btekk\b/.test(name))return 'hardtekk';
 if(/hardstyle|rawstyle|hardcore/.test(name))return 'hardstyle';
 if(/rap|hip[ -]?hop|trap|drill/.test(name))return 'rap';
 if(/rock|metal|industrial|ndh/.test(name))return 'rock';
 if(/pop/.test(name))return 'pop';
 return 'neutral';
}
export const CONCERT_FX_PALETTES_V810:Record<ConcertFxGenreV810,{primary:string;secondary:string}>= {
 rap:{primary:'#35b5d8',secondary:'#8d3bd2'},hardtekk:{primary:'#23fff1',secondary:'#f326b8'},
 hardstyle:{primary:'#ff742c',secondary:'#fa2b85'},rock:{primary:'#ffb553',secondary:'#ec352f'},
 pop:{primary:'#94d7ff',secondary:'#fa7fd8'},neutral:{primary:'#75a8ff',secondary:'#a284ea'}
};
export interface ConcertFxInputV810 {
 settings?:Partial<ConcertFxSettingsV810>|null;genre:string|null|undefined;
 section:ConcertFxSectionV810;progressMs:number;startMs:number;endMs:number;
 active:boolean;verified:boolean;playing:boolean;reactive:boolean;reducedMotion:boolean;
 authored:boolean;blackout:boolean;lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 tier:'low'|'balanced'|'high';energy:number;kick:number;bass:number;mids:number;highs:number;
 ledBudget:number;laserBudget:number;
}
export interface ConcertFxCueV810 {
 active:boolean;genre:ConcertFxGenreV810;section:ConcertFxSectionV810;
 laserOpacity:number;ribbonGain:number;ledGain:number;ledStyle:0|1|2|3|4;
 phase:number; bass:number;mids:number;highs:number;primary:string;secondary:string;
 reason:'off'|'unverified'|'guarded'|'music';
}
const off=(genre:ConcertFxGenreV810,section:ConcertFxSectionV810,reason:ConcertFxCueV810['reason'],p:{primary:string;secondary:string}):ConcertFxCueV810=>({
 active:false,genre,section,laserOpacity:0,ribbonGain:0,ledGain:0,ledStyle:0,phase:0,
 bass:0,mids:0,highs:0,primary:p.primary,secondary:p.secondary,reason});
export function planConcertFxV810(i:ConcertFxInputV810):ConcertFxCueV810 {
 const s=normalizeConcertFxV810(i.settings),genre=concertFxGenreV810(i.genre);
 const p=s.palette==='custom'?{primary:s.primary,secondary:s.secondary}:CONCERT_FX_PALETTES_V810[genre];
 if(!s.enabled||s.intensity<=0||!i.playing||!i.reactive||i.reducedMotion)return off(genre,i.section,'off',p);
 if(!i.active||!i.verified||!finite(i.progressMs)||!finite(i.startMs)||!finite(i.endMs)||
 i.startMs>=i.endMs||i.progressMs<i.startMs||i.progressMs>=i.endMs)return off(genre,i.section,'unverified',p);
 if(i.authored||i.blackout||i.groupCount<1||i.groupCount>4||i.tier==='low'||
 ![i.energy,i.kick,i.bass,i.mids,i.highs,i.ledBudget,i.laserBudget].every(finite))
 return off(genre,i.section,'guarded',p);
 const q=s.quality==='performance'?.36:s.quality==='balanced'?.65:1;
 const cap=i.tier==='balanced'?.55:1;
 const protect=s.protectLyrics&&i.lyricsProtected?.38:1;
 const face=i.vocalFocus?.62:1;
 const crowd=i.groupCount===4?.60:i.groupCount===3?.78:1;
 const envelope=Math.min(1,(i.progressMs-i.startMs)/850,(i.endMs-i.progressMs)/950);
 const smooth=clamp(envelope);const fade=smooth*smooth*(3-2*smooth);
 const mood=genre==='hardtekk'||genre==='hardstyle'?1:genre==='rock'?.85:genre==='rap'?.57:.48;
 const part=i.section==='drop'?1:i.section==='build'?.65:i.section==='hook'?.56:i.section==='finale'?.82:i.section==='break'?.08:i.section==='verse'?.18:.12;
 const audio=clamp(i.energy*.48+i.kick*.37+i.bass*.15);
 const gain=s.intensity/100*q*cap*protect*face*crowd*fade;
 const power=part*(.40+.60*audio)*gain;
 const peakPower=i.laserBudget>0&&part>=.5?power*clamp(i.laserBudget):0;
 const laserPower=s.quality!=='performance'&&s.lasers?peakPower:0;
 const ribbonPower=s.quality!=='performance'&&s.ribbons?peakPower:0;
 const ledPower=s.ledWall?clamp((.28+part*.55)*gain*clamp(i.ledBudget)):0;
 const style:Record<ConcertFxGenreV810,0|1|2|3|4>={rap:1,hardtekk:3,hardstyle:3,rock:4,pop:2,neutral:0};
 return {active:laserPower>.001||ribbonPower>.001||ledPower>.001||((s.lyricsProjection||s.atmosphericFx||s.virtualCrowd||s.reactiveParticles||s.kineticStage||s.foamCannon||s.spectralVisuals||s.sceneTransitions||s.vocalFx)&&gain>.001),genre,section:i.section,
 laserOpacity:clamp(laserPower*mood*.24+ribbonPower*.09,0,.20),ribbonGain:clamp(ribbonPower*.65,0,.35),
 ledGain:clamp(ledPower,0,.6),ledStyle:style[genre],phase:i.progressMs/1000,
 bass:clamp(i.bass),mids:clamp(i.mids),highs:clamp(i.highs),primary:p.primary,secondary:p.secondary,
 reason:'music'};
}
