/** V1093 · Genre Show Intelligence.
 * Opt-in, deterministic, song-scoped dramaturgy for Deutschrap, Hardtekk,
 * Deutschrock and Pop. Uses only already active virtual stage light batches;
 * a song chapter is a design hint, never evidence of a beat or drop.
 */
import type {AudioFeatures} from '../types/audio';
export type GenreShowFamilyV1093='deutschrap'|'hardtekk'|'deutschrock'|'pop';
export type GenreShowModeV1093='auto'|GenreShowFamilyV1093;
export type GenreShowChannelV1093='led'|'laser'|'crowd';
export type GenreShowSceneV1093='intro'|'verse'|'build'|'hook'|'break'|'finale';
export type GenreShowStateV1093={
 trackId:string;lastProgressMs:number;family:GenreShowFamilyV1093|null;
 ledGain:number;laserGain:number;crowdGain:number;
 beatHeld:boolean;lastAccentMs:number;accent:number;
};
export const INITIAL_GENRE_SHOW_V1093:Readonly<GenreShowStateV1093>=Object.freeze({
 trackId:'',lastProgressMs:-1,family:null,ledGain:1,laserGain:1,crowdGain:1,
 beatHeld:false,lastAccentMs:-90000,accent:0,
});
export type GenreShowResultV1093={state:GenreShowStateV1093;active:boolean;
 reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'audio'|'genre'|'priming'|'smoothed';
 accentDetected:boolean};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const finite=(v:unknown,min:number,max:number):v is number=>
 typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const GENRES:ReadonlyArray<GenreShowFamilyV1093>=['deutschrap','hardtekk','deutschrock','pop'];
function reset(reason:GenreShowResultV1093['reason']):GenreShowResultV1093{
 return {state:{...INITIAL_GENRE_SHOW_V1093},active:false,reason,accentDetected:false};
}
/** No artist metadata inference: only an explicit genre string or an opted-in mode. */
export function resolveGenreShowFamilyV1093(genre:string|null|undefined,mode:GenreShowModeV1093):GenreShowFamilyV1093|null{
 if(!['auto',...GENRES].includes(mode))return null;
 if(mode!=='auto')return mode;
 const text=typeof genre==='string'?genre.toLowerCase().trim().slice(0,120):'';
 if(/(deutsch\s*rap|german\s*(rap|hip.?hop)|deutsch\s*hip.?hop|rap\s*de)/i.test(text))return 'deutschrap';
 if(/(hardtekk|hard\s*tekk|hardstyle|rawstyle|hardcore\s*techno)/i.test(text))return 'hardtekk';
 if(/(deutsch\s*rock|ndh|neue\s*deutsche\s*h[aä]rte|industrial\s*(rock|metal))/i.test(text))return 'deutschrock';
 if(/(pop|synth.?pop|dance.?pop|deutsch\s*pop)/i.test(text))return 'pop';
 return null;
}
const PROFILES:Record<GenreShowFamilyV1093,Record<GenreShowSceneV1093,readonly [number,number,number]>>={
 deutschrap:{intro:[.62,.60,.73],verse:[.70,.64,.78],build:[.83,.85,.79],hook:[.92,.85,.88],break:[.58,.57,.70],finale:[.91,.87,.93]},
 hardtekk:{intro:[.70,.70,.69],verse:[.84,.84,.73],build:[.92,.94,.78],hook:[.98,.98,.88],break:[.66,.68,.65],finale:[.97,.97,.87]},
 deutschrock:{intro:[.73,.63,.82],verse:[.81,.70,.87],build:[.89,.80,.90],hook:[.95,.85,.98],break:[.67,.57,.78],finale:[.98,.89,.99]},
 pop:{intro:[.80,.71,.75],verse:[.84,.73,.80],build:[.90,.81,.84],hook:[.95,.86,.94],break:[.73,.66,.73],finale:[.97,.82,.96]},
};
function resolveScene(section:string|null|undefined,energy:number):GenreShowSceneV1093{
 const s=String(section??'').toLowerCase().slice(0,45);
 // 'hook', 'drop', etc. are ONLY style hints. Never fabricate a trigger.
 const scene:GenreShowSceneV1093=
  /^(intro|opening|start)$/.test(s)?'intro':
  /^(build|buildup|prechorus|pre-chorus|riser|steigerung)$/.test(s)?'build':
  /^(hook|chorus|refrain|drop)$/.test(s)?'hook':
  /^(bridge|break|interlude|pause|instrumental)$/.test(s)?'break':
  /^(outro|finale|end|ending)$/.test(s)?'finale':'verse';
 // Measured quietness only dims; planned hooks cannot override calm audio.
 return energy<.23&&scene!=='intro'?'break':scene;
}
export function stepGenreShowV1093(previous:GenreShowStateV1093,input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 performanceTier:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs:number;durationMs:number;deltaSeconds:number;
 strength:number;genre?:string|null;mode:GenreShowModeV1093;sectionHint?:string|null;
 audio:Pick<AudioFeatures,'energyEnvelope'|'bass'|'beat'|'beatStrength'|'attack'>;
}):GenreShowResultV1093{
 if(!input.enabled||!input.reactive||input.strength===0)return reset('disabled');
 if(!input.playing)return reset('paused');
 if(input.reducedMotion)return reset('motion');
 if(!input.performanceTier||input.performanceTier==='low')return reset('quality');
 if(typeof input.trackId!=='string'||!input.trackId||input.trackId.length>160||
  !finite(input.progressMs,0,1800000)||!finite(input.durationMs,10000,1800000)||
  input.progressMs>input.durationMs||!finite(input.deltaSeconds,0,.2)||
  !finite(input.strength,0,80))return reset('clock');
 const family=resolveGenreShowFamilyV1093(input.genre,input.mode);
 if(!family)return reset('genre');
 const a=input.audio;
 if(!a||!finite(a.energyEnvelope,0,1)||!finite(a.bass,0,1)||
  !finite(a.beatStrength,0,1)||!finite(a.attack,0,1)||typeof a.beat!=='boolean')return reset('audio');
 const ms=input.progressMs;
 if(previous.trackId!==input.trackId||previous.family!==family||previous.lastProgressMs<0||
  ms<previous.lastProgressMs-250||ms-previous.lastProgressMs>12000){
  return {state:{...INITIAL_GENRE_SHOW_V1093,trackId:input.trackId, family,
    lastProgressMs:ms,beatHeld:a.beat},active:true,reason:'priming',accentDetected:false};
 }
 const dt=clamp(input.deltaSeconds,0,.1),t=input.strength/80;
 const scene=resolveScene(input.sectionHint,a.energyEnvelope);
 const profile=PROFILES[family][scene];
 // Even a verified rising beat is just a subdued optical accent. No drop cue.
 const accentDetected=a.beat&&!previous.beatHeld&&a.beatStrength>=.76&&a.attack>=.68&&
  a.energyEnvelope>=.55&&a.bass>=.38&&ms-previous.lastAccentMs>=400;
 const accent=clamp(accentDetected?.16:previous.accent*Math.exp(-dt/.4),0,.16);
 const energyFactor=a.energyEnvelope<.30?.96:1;
 const slow=family==='deutschrap'?1.65:family==='deutschrock'?1.5:family==='pop'?1.25:.82;
 const fast=family==='hardtekk'?.18:family==='pop'?.46:.36;
 const target=(p:number)=>clamp(1-t*(1-p*energyFactor)+accent*.18*t,.55,1);
 const smooth=(prev:number,next:number)=>clamp(prev+(next-prev)*(1-Math.exp(-dt/(next>prev?fast:slow))),.55,1);
 return {state:{trackId:input.trackId,lastProgressMs:ms,family,
  ledGain:smooth(previous.ledGain,target(profile[0])),
  laserGain:smooth(previous.laserGain,target(profile[1])),
  crowdGain:smooth(previous.crowdGain,target(profile[2])),
  beatHeld:a.beat,lastAccentMs:accentDetected?ms:previous.lastAccentMs,accent},
  active:true,reason:'smoothed',accentDetected};
}
export function sampleGenreShowGainV1093(state:GenreShowStateV1093|undefined,channel:GenreShowChannelV1093):number{
 if(!state||!state.family)return 1;
 const v=channel==='led'?state.ledGain:channel==='laser'?state.laserGain:state.crowdGain;
 return Number.isFinite(v)?clamp(v,.55,1):1;
}
