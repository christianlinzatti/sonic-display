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
 return {plan,message:started+' Konzertphase '+plan.scene+' ausgewählt; Lichtfarben sind weiterhin nur Vorschau.'};
}
