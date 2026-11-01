/** V762 scenic overlays, opt-in and exclusively driven by verified V761/V604 music structure. */
import type {CinematicCueV761} from './cinematicConcertDirectorV761';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
export interface DynamicStageLightingSettingsV762 {enabled:boolean;strength:number;gobos:boolean;ledWall:boolean;spotlights:boolean;floorHaze:boolean;protectLyrics:boolean;}
/** Compat alias for the existing optional API surface in types/music and registry. */
export type StageLightingSettingsV762=DynamicStageLightingSettingsV762;
export const DEFAULT_DYNAMIC_STAGE_LIGHTING_V762:DynamicStageLightingSettingsV762={enabled:false,strength:60,gobos:true,ledWall:true,spotlights:true,floorHaze:true,protectLyrics:true};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function normalizeDynamicStageLightingV762(raw?:Partial<DynamicStageLightingSettingsV762>|null):DynamicStageLightingSettingsV762{
 const d=DEFAULT_DYNAMIC_STAGE_LIGHTING_V762;
 return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:d.enabled,strength:finite(raw?.strength)?clamp(raw.strength,0,100):d.strength,
 gobos:typeof raw?.gobos==='boolean'?raw.gobos:d.gobos,ledWall:typeof raw?.ledWall==='boolean'?raw.ledWall:d.ledWall,
 spotlights:typeof raw?.spotlights==='boolean'?raw.spotlights:d.spotlights,floorHaze:typeof raw?.floorHaze==='boolean'?raw.floorHaze:d.floorHaze,
 protectLyrics:typeof raw?.protectLyrics==='boolean'?raw.protectLyrics:d.protectLyrics};}
export type ScenicGenreV762='rap'|'hardstyle'|'hardtekk'|'rock'|'pop'|'neutral';
export type ScenicLightingCueV762={active:boolean;genre:ScenicGenreV762;goboPattern:0|1|2|3;goboOpacity:number;goboPhase:number;
 ledGain:number;ledPattern:0|1|2|3;beamGain:number;beamOffset:number;hazeGain:number;reason:'verified-v761'|'off'};
export const SCENIC_LIGHTING_OFF_V762:ScenicLightingCueV762={active:false,genre:'neutral',goboPattern:0,goboOpacity:0,goboPhase:0,ledGain:1,ledPattern:0,beamGain:1,beamOffset:0,hazeGain:1,reason:'off'};
export function classifyScenicGenreV762(raw:string|null|undefined):ScenicGenreV762{
 const v=(raw??'').toLowerCase();if(/hardtekk|tekk/.test(v))return 'hardtekk';if(/hardstyle|rawstyle|hardcore/.test(v))return 'hardstyle';
 if(/rap|hip.hop|trap|drill/.test(v))return 'rap';if(/rock|metal|industrial|ndh/.test(v))return 'rock';
 if(/pop/.test(v))return 'pop';return 'neutral';}
export interface ScenicLightingInputV762{
 settings?:Partial<DynamicStageLightingSettingsV762>|null;scene:CinematicCueV761|null|undefined;
 narrative:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null|undefined;trackId:string|null|undefined;
 progressMs:number;genre:string|null|undefined;playing:boolean;reactive:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';authored:boolean;blackout:boolean;lyricsProtected:boolean;visualsEnabled:boolean;
 ledBudget:number;hazeBudget:number;energy:number;kick:number;
}
export function planDynamicStageLightingV762(input:ScenicLightingInputV762):ScenicLightingCueV762{
 const s=normalizeDynamicStageLightingV762(input.settings),scene=input.scene,n=input.narrative;
 if(!s.enabled||s.strength<=0||!input.playing||!input.reactive||input.reducedMotion||input.tier==='low'||
 input.authored||input.blackout||!input.visualsEnabled||!n||n.plan.source!=='verified-v600'||
 n.cue.source!=='verified-v600'||!n.cue.active||!scene?.active||scene.reason!=='verified-act'||
 scene.blend<=0||!input.trackId||input.trackId!==n.plan.trackId||!finite(input.progressMs)||
 input.progressMs<0||input.progressMs>=n.plan.durationMs||scene.actIndex!==n.cue.act||
 !finite(input.ledBudget)||!finite(input.hazeBudget))return SCENIC_LIGHTING_OFF_V762;
 const act=n.plan.acts[scene.actIndex];if(!act||input.progressMs<act.startMs||input.progressMs>=act.endMs)return SCENIC_LIGHTING_OFF_V762;
 const genre=classifyScenicGenreV762(input.genre), power=s.strength/100*clamp(scene.blend,0,1)*(input.tier==='balanced'?.55:1);
 const protect=input.lyricsProtected&&s.protectLyrics,decoration=protect?.35:1,energy=clamp(finite(input.energy)?input.energy:0,0,1),kick=clamp(finite(input.kick)?input.kick:0,0,1);
 const drop=act.section==='drop',hook=act.section==='hook',breakSection=act.section==='break';
 const patterns:Record<ScenicGenreV762,0|1|2|3>={rap:1,hardstyle:2,hardtekk:3,rock:3,pop:0,neutral:0};
 const variety=(scene.sceneIndex+scene.repetition)%4;
 const goboOpacity=s.gobos?clamp((.085+.050*(drop?1:hook?.7:.3)+.020*energy)*power*decoration*(breakSection?.36:1),0,.15):0;
 const ledGain=s.ledWall?1+clamp((.025+.065*(drop?kick:hook?energy:.2))*power*decoration,0,.10)*clamp(input.ledBudget,0,1):1;
 const beamGain=s.spotlights?1+clamp((.025+.07*(drop?kick:hook?.65:energy*.4))*power*decoration,0,.10):1;
 const beamOffset=s.spotlights&&!protect?clamp(Math.sin((scene.sceneIndex+1)*2.1)*.25*power,-.25,.25):0;
 const hazeGain=s.floorHaze?1+clamp((breakSection?.04:drop?.14:.06)*power*decoration,0,.14)*clamp(input.hazeBudget,0,1):1;
 return {active:true,genre,goboPattern:((patterns[genre]+variety)%4) as 0|1|2|3,goboOpacity,
 goboPhase:(input.progressMs/1000)*(genre==='hardtekk'?1.1:genre==='hardstyle'?.72:genre==='rock'?.28:.46)+scene.sceneIndex*1.618,
 ledGain,ledPattern:((patterns[genre]+scene.sceneIndex)%4) as 0|1|2|3,beamGain,beamOffset,hazeGain,reason:'verified-v761'};
}
