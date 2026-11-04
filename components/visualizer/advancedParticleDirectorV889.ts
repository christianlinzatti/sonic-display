/** V889 – Advanced Particle FX. One reduction-only artistic pass over existing
 * V816/V817/V844/V846/V847 cues, AFTER V823/V825, V871 and V880 protections.
 * This module never spawns instances, triggers a real device, infers audio beats,
 * changes authored FX lanes, or enables an effect that the existing cue disabled.
 */
import type {AtmospherePlanV885,AtmosphereSceneV885} from './dynamicConcertAtmosphereV885';
import type {ReactiveParticleCueV816} from './reactiveParticlePlannerV816';
import type {FoamCannonCueV817} from './foamCannonPlannerV817';
import type {SoapBubbleCueV8441} from './festivalBubblesFlashPlannerV8441';
import type {PaperStreamersCueV846} from './festivalPaperStreamersPlannerV846';
import type {FestivalCueV844} from './festivalSpecialFxPlannerV844';
import type {FestivalFinaleCueV847} from './festivalFinalePlannerV847';

export type ParticleMoodV889='auto'|'noir'|'electric'|'arena'|'dream';
export type ParticleModeV889='balanced'|'cinematic'|'festival';
export type ParticleHeroV889='none'|'bubbles'|'foam'|'streamers'|'confetti';
export type ParticleFocusV889='auto'|Exclude<ParticleHeroV889,'none'>;
export interface ParticleSettingsV889 {
 enabled:boolean;mode:ParticleModeV889;mood:ParticleMoodV889;focus:ParticleFocusV889;
 intensity:number;protectLyrics:boolean;
 bubbles:boolean;foam:boolean;streamers:boolean;confetti:boolean;
}
export const PARTICLE_STORAGE_KEY_V889='sonic-advanced-particle-director-v889';
export const DEFAULT_PARTICLE_V889:Readonly<ParticleSettingsV889>={
 enabled:true,mode:'cinematic',mood:'auto',focus:'auto',intensity:75,protectLyrics:true,
 bubbles:true,foam:true,streamers:true,confetti:true,
};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const modes:readonly ParticleModeV889[]=['balanced','cinematic','festival'];
const moods:readonly ParticleMoodV889[]=['auto','noir','electric','arena','dream'];
const focuses:readonly ParticleFocusV889[]=['auto','bubbles','foam','streamers','confetti'];
export function normalizeParticleV889(raw:unknown):ParticleSettingsV889 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ParticleSettingsV889>:{};
 return {
  enabled:typeof s.enabled==='boolean'?s.enabled:true,
  mode:modes.includes(s.mode as ParticleModeV889)?s.mode as ParticleModeV889:'cinematic',
  mood:moods.includes(s.mood as ParticleMoodV889)?s.mood as ParticleMoodV889:'auto',
  focus:focuses.includes(s.focus as ParticleFocusV889)?s.focus as ParticleFocusV889:'auto',
  intensity:finite(s.intensity)?Math.round(clamp(s.intensity,0,100)):75,
  protectLyrics:typeof s.protectLyrics==='boolean'?s.protectLyrics:true,
  bubbles:typeof s.bubbles==='boolean'?s.bubbles:true,
  foam:typeof s.foam==='boolean'?s.foam:true,
  streamers:typeof s.streamers==='boolean'?s.streamers:true,
  confetti:typeof s.confetti==='boolean'?s.confetti:true,
 };
}
export function selectParticleMoodV889(genre:string,selected:ParticleMoodV889='auto'):Exclude<ParticleMoodV889,'auto'> {
 if(selected!=='auto')return selected;
 const g=genre.toLowerCase();
 if(/hardtekk|hardstyle|hardcore|techno/.test(g))return 'electric';
 if(/deutschrap|hip.?hop|\brap\b|trap/.test(g))return 'noir';
 if(/rock|metal|ndh|industrial|punk/.test(g))return 'arena';
 return 'dream';
}
/** Recommendations are NOT new triggers: only already authorized particles can be foregrounded. */
export function suggestedParticleHeroV889(section:string,genre:string,settings:ParticleSettingsV889):ParticleHeroV889 {
 if(settings.focus!=='auto')return settings.focus;
 const mood=selectParticleMoodV889(genre,settings.mood);
 if(section==='intro'||section==='verse'||section==='break')return 'bubbles';
 if(section==='build')return mood==='electric'?'foam':'streamers';
 if(section==='drop')return mood==='electric'?'foam':'confetti';
 if(section==='hook')return mood==='arena'?'confetti':mood==='dream'?'bubbles':'streamers';
 if(section==='finale'||section==='outro')return 'confetti';
 return 'none';
}
function activeScene(plan:AtmospherePlanV885,pos:number):AtmosphereSceneV885|null {
 let lo=0,hi=plan.scenes.length-1;
 while(lo<=hi){const mid=(lo+hi)>>>1,s=plan.scenes[mid];
  if(pos<s.startMs)hi=mid-1;else if(pos>=s.endMs)lo=mid+1;else return s;
 }
 return null;
}
export type ParticleReasonV889='disabled'|'protected'|'unverified'|'no-particles'|'mixed';
export interface ParticleInputV889 {
 settings:ParticleSettingsV889;plan?:AtmospherePlanV885|null;
 trackId:string;durationMs:number;positionMs:number;genre:string;
 playing:boolean;autoEnabled:boolean;reducedMotion:boolean;seekBlocked?:boolean;
 blackout?:boolean;manualLighting?:boolean;manualFx?:boolean;
 lyricsProtected?:boolean;vocalFocus?:boolean;groupCount:number;
 tier:'low'|'balanced'|'high';authoredLanes?:readonly string[];
 particles:ReactiveParticleCueV816;foam:FoamCannonCueV817;
 bubbles:SoapBubbleCueV8441;streamers:PaperStreamersCueV846;
 festival:FestivalCueV844;finale:FestivalFinaleCueV847;
}
export interface ParticleResultV889 {
 reason:ParticleReasonV889;hero:ParticleHeroV889;section:string;
 particles:ReactiveParticleCueV816;foam:FoamCannonCueV817;
 bubbles:SoapBubbleCueV8441;streamers:PaperStreamersCueV846;
 festival:FestivalCueV844;finale:FestivalFinaleCueV847;
}
/** Preserve every existing cue verbatim for disabled/unverified/protected input. */
export function directParticlesV889(i:ParticleInputV889):ParticleResultV889 {
 const passthrough=(reason:ParticleReasonV889):ParticleResultV889=>({reason,hero:'none',section:'',
  particles:i.particles,foam:i.foam,bubbles:i.bubbles,streamers:i.streamers,
  festival:i.festival,finale:i.finale});
 const s=i.settings;
 if(!s.enabled||!i.autoEnabled||s.intensity<=0)return passthrough('disabled');
 if(!i.playing||i.reducedMotion||i.seekBlocked||i.blackout||i.manualLighting||i.manualFx||
   i.tier==='low'||!Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
   (s.protectLyrics&&i.lyricsProtected))return passthrough('protected');
 if(!finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
   !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
   !i.plan||i.plan.source!=='verified-v604'||i.plan.trackId!==i.trackId||
   i.plan.durationMs!==i.durationMs)return passthrough('unverified');
 const scene=activeScene(i.plan,i.positionMs);
 if(!scene)return passthrough('unverified');
 const lockedParticles=i.authoredLanes?.includes('particles')??false;
 const lockedFoam=i.authoredLanes?.includes('foam')??false;
 const available:ParticleHeroV889[]=[];
 if(s.bubbles&&!lockedParticles&&i.bubbles.active&&i.bubbles.count>=2)available.push('bubbles');
 if(s.foam&&!lockedFoam&&i.foam.active&&i.foam.bubbles>=2&&i.foam.mist>=2)available.push('foam');
 if(s.streamers&&!lockedParticles&&i.streamers.active&&i.streamers.count>=3)available.push('streamers');
 if(s.confetti&&!lockedParticles&&((i.particles.active&&i.particles.confetti>=1)||
  (i.festival.active&&i.festival.confettiGain>0)||
  (i.finale.active&&i.finale.rainCount>=3)))available.push('confetti');
 if(!available.length)return passthrough('no-particles');
 const wanted=suggestedParticleHeroV889(scene.section,i.genre,s);
 // If the desired effect is not already active, prioritize an AVAILABLE one.
 const fallback:readonly ParticleHeroV889[]=scene.section==='drop'||scene.section==='finale'?[
  'confetti','foam','streamers','bubbles']:['bubbles','streamers','foam','confetti'];
 const hero=available.includes(wanted)?wanted:fallback.find(a=>available.includes(a))??'none';
 const strength=clamp(s.intensity/100);
 // Smoother fluctuations rather than short alpha flashes. Always <= 1.
 const tide=.91+.09*Math.pow(Math.sin(i.positionMs/1000*.42),2);
 const clarity=s.mode==='cinematic'?.74:s.mode==='festival'?.36:.55;
 const lyricGain=i.lyricsProtected?.64:i.vocalFocus?.78:1;
 const crowdGain=i.groupCount>=3?.86:1;
 const quality=i.tier==='balanced'?.82:1;
 const secondary=clamp((1-strength*clarity)*tide*lyricGain*crowdGain*quality);
 const primary=clamp((1-strength*.12)*tide*lyricGain*crowdGain*quality);
 const gain=(kind:ParticleHeroV889)=>hero===kind?primary:secondary;
 const amount=(n:number,g:number)=>Math.max(0,Math.floor(Math.max(0,n)*g));
 const dim=(n:number,g:number)=>Math.max(0,n*g);
 const b=s.bubbles&&!lockedParticles&&i.bubbles.active?gain('bubbles'):1;
 const f=s.foam&&!lockedFoam&&i.foam.active?gain('foam'):1;
 const r=s.streamers&&!lockedParticles&&i.streamers.active?gain('streamers'):1;
 const c=s.confetti&&!lockedParticles?gain('confetti'):1;
 // Preserve the existing source ceilings, particle budgets and manual V823 lanes.
 const bubbles=b===1?i.bubbles:{...i.bubbles,count:amount(i.bubbles.count,b),
  opacity:dim(i.bubbles.opacity,b),riseSpeed:i.bubbles.riseSpeed*(s.mode==='cinematic'?.86:1)};
 const foam=f===1?i.foam:{...i.foam,bubbles:amount(i.foam.bubbles,f),mist:amount(i.foam.mist,f),
  opacity:dim(i.foam.opacity,f),power:dim(i.foam.power,f),
  experienceV843:i.foam.experienceV843?.active?{...i.foam.experienceV843,
   arc:i.foam.experienceV843.arc*(s.mode==='cinematic'?.92:1),
   flutter:i.foam.experienceV843.flutter*(s.mode==='festival'?1:.82)}:i.foam.experienceV843};
 const streamers=r===1?i.streamers:{...i.streamers,count:amount(i.streamers.count,r),
  opacity:dim(i.streamers.opacity,r),
  fallSpeed:i.streamers.fallSpeed*(s.mode==='cinematic'?.82:1),
  curl:i.streamers.curl*(s.mode==='festival'?1:.88)};
 const particles=c===1?i.particles:{...i.particles,
  confetti:amount(i.particles.confetti,c),confettiOpacity:dim(i.particles.confettiOpacity,c)};
 const festival=c===1?i.festival:{...i.festival,confettiGain:dim(i.festival.confettiGain,c)};
 const finale=c===1?i.finale:{...i.finale,rainCount:amount(i.finale.rainCount,c),
  rainOpacity:dim(i.finale.rainOpacity,c),fallSpeed:i.finale.fallSpeed*(s.mode==='cinematic'?.87:1)};
 return {reason:'mixed',hero,section:scene.section,particles,foam,bubbles,streamers,festival,finale};
}
export function exportParticlePlanV889(plan:AtmospherePlanV885|null|undefined,settings:ParticleSettingsV889,
 genre:string):string|null {
 if(!plan||plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 const s=normalizeParticleV889(settings);
 return JSON.stringify({schema:'sonic-particle-director-v889',version:1,trackId:plan.trackId,
  durationMs:plan.durationMs,source:plan.source,settings:s,
  note:'Nur Prioritätsvorschläge. Rendering erfolgt ausschließlich für bereits autorisierte vorhandene Effekte; keine garantierten Einsätze.',
  scenes:plan.scenes.map(x=>({startMs:x.startMs,endMs:x.endMs,section:x.section,
   priority:suggestedParticleHeroV889(x.section,genre,s)}))},null,2);
}
