/** V911 – deterministic, low-frequency Govee concert cues, using only verified V318 song sections.
 * The official LAN protocol changes whole-device color/brightness, not RGBIC segments.
 * No device power commands, flashes, inferred hooks, or arbitrary network I/O here.
 */
import type {AudioFeatures} from '@/types/audio';
import type {TrackAnalysisV318,SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {GoveeConfigV909,GoveeColorV909,GoveeLookV909,GoveeRoleSelectionV911} from '@/lib/goveeLanV909';

export type GoveeRoleV911='wall'|'rhythm'|'neon'|'ambient';
export type GoveePhaseV911=SongSectionV318|'ambient';
export type GoveePhaseCueV911={phase:GoveePhaseV911;previous:GoveePhaseV911;transition:number;verified:boolean};

const clip=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const color=(r:number,g:number,b:number):GoveeColorV909=>({r,g,b});
const rgbMix=(a:GoveeColorV909,b:GoveeColorV909,t:number):GoveeColorV909=>({
 r:Math.round(a.r+(b.r-a.r)*t),g:Math.round(a.g+(b.g-a.g)*t),b:Math.round(a.b+(b.b-a.b)*t)});
const phasing=new Set<string>(['verse','hook','build','drop','break']);
const hasPhase=(s:unknown):s is SongSectionV318=>typeof s==='string'&&phasing.has(s);

/** Use only labeled, high-confidence sections within the *current* track. */
export function resolveGoveePhaseV911(analysis:TrackAnalysisV318|null|undefined,trackId:string,progressMs:number,fadeMs=3200):GoveePhaseCueV911{
 const ambient:GoveePhaseCueV911={phase:'ambient',previous:'ambient',transition:1,verified:false};
 if(!analysis||!trackId||analysis.trackId!==trackId||!Number.isFinite(progressMs)||progressMs<0||progressMs>=analysis.durationMs)return ambient;
 const sections=analysis.sections;
 let index=-1;
 for(let i=0;i<sections.length;i++){
  if(sections[i].startMs>progressMs)break;
  if(progressMs<sections[i].startMs+sections[i].durationMs)index=i; // newest active marker wins
 }
 if(index<0)return ambient;
 const current=sections[index];
 if(!hasPhase(current.label)||current.confidence<0.5)return ambient;
 const before=sections[index-1];
 const previous:GoveePhaseV911=before&&hasPhase(before.label)&&before.confidence>=0.5&&
  before.startMs+before.durationMs>=current.startMs-50 ?before.label:'ambient';
 const elapsed=progressMs-current.startMs;const transitionMs=clip(fadeMs,1200,12000);
 // 3.2s fade-in at each verified section boundary. No unconfirmed high-energy cue.
 return {phase:current.label,previous:elapsed<transitionMs?previous:current.label,
  transition:clip(elapsed/transitionMs,0,1),verified:true};
}

/** User override wins; otherwise device-specific roles for the four known models. */
export function resolveGoveeRoleV911(selection:GoveeRoleSelectionV911|undefined,sku?:string):GoveeRoleV911{
 if(selection&&selection!=='auto'&&['wall','rhythm','neon','ambient'].includes(selection))return selection;
 switch(String(sku??'').trim().toUpperCase()){
  case 'H6063':return 'wall';
  case 'H610B':return 'rhythm';
  case 'H61A2':return 'neon';
  case 'H6051':return 'ambient';
  default:return 'ambient';
 }
}

type Palette={primary:GoveeColorV909;secondary:GoveeColorV909;accent:GoveeColorV909;cool:GoveeColorV909;warm:GoveeColorV909};
function paletteFor(genre:string):Palette{
 const g=genre.toLowerCase();
 if(/hardtekk|hardtek|hardstyle|rawstyle|hardcore|techno/.test(g))return {
  primary:color(13,75,171),secondary:color(102,17,173),accent:color(214,28,163),cool:color(0,155,212),warm:color(135,42,153)};
 if(/deutschrock|rock|metal|industrial|ndh/.test(g))return {
  primary:color(153,34,12),secondary:color(126,10,23),accent:color(255,99,16),cool:color(95,27,56),warm:color(184,67,22)};
 if(/rap|hip.hop|trap|drill|grime/.test(g))return {
  primary:color(116,12,25),secondary:color(76,17,114),accent:color(162,28,86),cool:color(48,31,121),warm:color(118,46,47)};
 return {primary:color(38,73,160),secondary:color(111,45,157),accent:color(190,68,142),cool:color(20,130,164),warm:color(157,73,77)};
}
const brightnessLevels:Record<GoveePhaseV911,Record<GoveeRoleV911,number>>={
 ambient:{wall:.55,rhythm:.46,neon:.52,ambient:.38},
 verse:{wall:.62,rhythm:.50,neon:.57,ambient:.41},
 hook:{wall:.81,rhythm:.76,neon:.79,ambient:.56},
 build:{wall:.70,rhythm:.65,neon:.68,ambient:.49},
 drop:{wall:.89,rhythm:.86,neon:.87,ambient:.60},
 break:{wall:.40,rhythm:.32,neon:.38,ambient:.31},
};
const colorKeys:Record<GoveePhaseV911,Record<GoveeRoleV911,keyof Palette>>={
 ambient:{wall:'primary',rhythm:'secondary',neon:'cool',ambient:'warm'},
 verse:{wall:'primary',rhythm:'secondary',neon:'cool',ambient:'warm'},
 hook:{wall:'secondary',rhythm:'accent',neon:'primary',ambient:'warm'},
 build:{wall:'secondary',rhythm:'cool',neon:'accent',ambient:'warm'},
 drop:{wall:'accent',rhythm:'cool',neon:'secondary',ambient:'primary'},
 break:{wall:'primary',rhythm:'secondary',neon:'cool',ambient:'warm'},
};
export function planGoveeConcertLookV911(x:{genre:string;progressMs:number;phase:GoveePhaseCueV911;role:GoveeRoleV911;
 metrics:Pick<AudioFeatures,'bass'|'beatStrength'|'energyEnvelope'|'volume'>;microphoneActive:boolean;config:GoveeConfigV909}):GoveeLookV909{
 const p=paletteFor(x.genre);const phase=brightnessLevels[x.phase.phase]?x.phase.phase:'ambient';
 const previous=brightnessLevels[x.phase.previous]?x.phase.previous:'ambient';
 // Smoothstep prevents a sharp change at phase boundary.
 const blend=clip(x.phase.transition,0,1);const t=blend*blend*(3-2*blend);
 const strength=clip(x.config.directorStrengthV911/100,0,1);
 const phaseBase=rgbMix(p[colorKeys[previous][x.role]],p[colorKeys[phase][x.role]],t);
 const base=rgbMix(p[colorKeys.ambient[x.role]],phaseBase,strength);
 const gradual=.06*(.5+.5*Math.sin(Math.max(0,x.progressMs)/8500+(x.role==='rhythm'?1.4:0)))*strength;
 const tint=rgbMix(base,p.secondary,gradual);
 const env=clip(x.metrics.energyEnvelope||x.metrics.volume,0,1);
 const beat=x.microphoneActive?clip(.7*x.metrics.bass+.3*x.metrics.beatStrength,0,1):0;
 const roleResponse={wall:.035,rhythm:.125,neon:.062,ambient:.010}[x.role];
 const phaseLevel=brightnessLevels[previous][x.role]*(1-t)+brightnessLevels[phase][x.role]*t;
 const level=brightnessLevels.ambient[x.role]*(1-strength)+phaseLevel*strength;
 const modulation=(.88+.12*env)+beat*roleResponse*strength;
 const brightness=Math.round(clip(x.config.masterBrightness*level*modulation,20,Math.max(20,Math.min(100,x.config.masterBrightness+12))));
 return {color:tint,brightness};
}

/** Avoid sudden changes, even when the microphone measures a very loud kick. */
export function easeGoveeLookV911(previous:GoveeLookV909|undefined,next:GoveeLookV909):GoveeLookV909{
 if(!previous)return next;
 const limit=(a:number,b:number,d:number)=>Math.round(a+clip(b-a,-d,d));
 return {brightness:limit(previous.brightness,next.brightness,7),color:{
  r:limit(previous.color.r,next.color.r,24),g:limit(previous.color.g,next.color.g,24),b:limit(previous.color.b,next.color.b,24)}};
}
export function changedGoveeLookV911(previous:GoveeLookV909|undefined,next:GoveeLookV909):boolean{
 return !previous||Math.abs(previous.brightness-next.brightness)>=2||
  Math.abs(previous.color.r-next.color.r)>=5||Math.abs(previous.color.g-next.color.g)>=5||Math.abs(previous.color.b-next.color.b)>=5;
}
