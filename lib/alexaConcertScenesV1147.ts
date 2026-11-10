/** V1147 – deterministic, side-effect-free concert scene planning.
 * This module does not send hardware commands, change Spotify or grant consent.
 * The caller must authenticate the Alexa message and verify V1145/V1143 opt-ins.
 */
export const CONCERT_SCENES_V1147=['calm','intense','finale'] as const;
export type ConcertSceneV1147=typeof CONCERT_SCENES_V1147[number];
export type ConcertGenreV1147='deutschrap'|'hardtekk'|'deutschrock'|'other';
export type ConcertScenePlanV1147=Readonly<{
 scene:ConcertSceneV1147;genre:ConcertGenreV1147;
 stageIntensity:number;lightColor:Readonly<{r:number;g:number;b:number}>;
 brightnessCap:number;rotationAllowed:boolean;goveeAllowed:boolean;
}>;
const COLORS:Record<ConcertGenreV1147,readonly [number,number,number]>={
 deutschrap:[70,35,130],hardtekk:[185,35,180],
 deutschrock:[225,100,35],other:[70,105,180]
};
const INTENSITY:Record<ConcertSceneV1147,number>={calm:25,intense:75,finale:95};
const CAP:Record<ConcertSceneV1147,number>={calm:30,intense:65,finale:75};
export function planConcertSceneV1147(input:{
 scene:ConcertSceneV1147;genre:ConcertGenreV1147;
 showConsent:boolean;goveeConsent:boolean;musicSyncConsent:boolean;
 reducedMotion:boolean;masterBrightness:number;
}):ConcertScenePlanV1147{
 if(!CONCERT_SCENES_V1147.includes(input.scene))throw Error('Unbekannte Konzertszene.');
 if(!Object.prototype.hasOwnProperty.call(COLORS,input.genre))throw Error('Unbekanntes Genre.');
 if(!input.showConsent)throw Error('Alexa-Konzertfreigabe erforderlich.');
 if(!Number.isFinite(input.masterBrightness)||input.masterBrightness<0||input.masterBrightness>100)
  throw Error('Ungültige Helligkeitsgrenze.');
 const [r,g,b]=COLORS[input.genre];
 return {
  scene:input.scene,genre:input.genre,
  stageIntensity:input.reducedMotion?Math.min(INTENSITY[input.scene],40):INTENSITY[input.scene],
  lightColor:{r,g,b},brightnessCap:Math.min(CAP[input.scene],input.masterBrightness),
  rotationAllowed:!input.reducedMotion,
  goveeAllowed:input.goveeConsent&&input.musicSyncConsent
 };
}

/** Maps an authenticated scene request to existing reversible V1145 show controls.
 * Only the concert-show-start transition is requested here; no direct hardware writes.
 * Scene colors remain previews until the visual director supports owned scene overrides.
 */
export function activateConcertSceneV1147(
 input:Parameters<typeof planConcertSceneV1147>[0],
 startShow:()=>string
):{plan:ConcertScenePlanV1147;message:string}{
 const plan=planConcertSceneV1147(input);
 const started=startShow();
 // V1145 may report an already running show; do not claim a new phase was applied.
 const alreadyRunning=started.includes('bereits gestartet');
 return {plan,message:started+(alreadyRunning?' Die bestehende Show wurde nicht verändert.':' Konzertphase '+plan.scene+' als Vorschau berechnet.')+' Szenenfarben und Intensität werden nicht an Bühne oder Lampen übertragen.'};
}

/** Virtual-only interpolation for a future scene director.
 * No timers, DOM, storage, Govee commands or mutation of live show settings.
 * Reduced motion uses a single settled frame, never a rotating transition.
 */
export function interpolateConcertSceneV1147(
 from:ConcertScenePlanV1147,to:ConcertScenePlanV1147,progress:number,
 reducedMotion:boolean
):Readonly<{stageIntensity:number;brightnessCap:number;lightColor:Readonly<{r:number;g:number;b:number}>;rotationAllowed:boolean}>{
 if(!Number.isFinite(progress))throw Error('Ungültiger Übergangsfortschritt.');
 const t=reducedMotion?1:Math.max(0,Math.min(1,progress));
 const mix=(a:number,b:number)=>Math.round(a+(b-a)*t);
 return {
  stageIntensity:mix(from.stageIntensity,to.stageIntensity),
  brightnessCap:mix(from.brightnessCap,to.brightnessCap),
  lightColor:{r:mix(from.lightColor.r,to.lightColor.r),g:mix(from.lightColor.g,to.lightColor.g),b:mix(from.lightColor.b,to.lightColor.b)},
  rotationAllowed:!reducedMotion&&from.rotationAllowed&&to.rotationAllowed
 };
}

/** A virtual stage cue for the V958 director; intentionally excludes hardwareSync.
 * The existing concert renderer consumes these settings through its normal event.
 * Applying/restoring storage is handled separately by the caller.
 */
export function virtualStageCueV1147(plan:ConcertScenePlanV1147):Readonly<{
 strength:number;energyArcStrengthV975:number;atmosphereStrengthV978:number;
 transitionStrengthV976:number;liveShowStrengthV979:number;
 voiceMoodV968:'cool'|'warm'|'neon';hardwareSync:false
}>{
 const strength=Math.max(0,Math.min(100,Math.round(plan.stageIntensity)));
 return {
  strength,energyArcStrengthV975:strength,atmosphereStrengthV978:strength,
  transitionStrengthV976:strength,liveShowStrengthV979:strength,
  voiceMoodV968:plan.genre==='deutschrock'?'warm':plan.genre==='hardtekk'?'neon':'cool',
  hardwareSync:false
 };
}
