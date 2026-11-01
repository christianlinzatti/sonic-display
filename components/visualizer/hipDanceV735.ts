/** V735 — three procedural, rig-only hip movements.  This is deliberately NOT
 * a skinned-mesh deformation or an authored AnimationClip stored in the GLB.
 * The original foot IK still runs after the additive rig pass.
 */
import type { AvatarRigMotion } from './avatarRigController';

export type HipDanceModeV735 = 'off' | 'auto' | 'Hip_Sway' | 'Hip_Circle' | 'Hip_Bounce';
export type HipDanceSettingsV735 = { mode: HipDanceModeV735; strength: number; speed: number };
export const DEFAULT_HIP_DANCE_V735: HipDanceSettingsV735 = {mode:'auto',strength:45,speed:100};
export const HIP_DANCE_MODES_V735:readonly HipDanceModeV735[]=['off','auto','Hip_Sway','Hip_Circle','Hip_Bounce'];
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
export function normalizeHipDanceV735(input:Partial<HipDanceSettingsV735>|null|undefined):HipDanceSettingsV735 {
 return {mode:HIP_DANCE_MODES_V735.includes(input?.mode as HipDanceModeV735)?input!.mode!:DEFAULT_HIP_DANCE_V735.mode,
  strength:finite(input?.strength)?Math.round(clamp(input.strength,0,100)):DEFAULT_HIP_DANCE_V735.strength,
  speed:finite(input?.speed)?Math.round(clamp(input.speed,50,200)):DEFAULT_HIP_DANCE_V735.speed};
}
export type HipDanceChannelsV735=Pick<AvatarRigMotion,'hipPitch'|'hipRoll'|'hipLateral'|'hipVertical'> & {
 spineCounter:number;kneeCounter:number;ankleCounter:number;
};
const ZERO:Readonly<HipDanceChannelsV735>=Object.freeze({hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,spineCounter:0,kneeCounter:0,ankleCounter:0});
export type HipDanceInputV735={settings:HipDanceSettingsV735;seconds:number;bpm?:number|null;
 genre?:string|null;section?:string|null;playing:boolean;reducedMotion:boolean;
 /** Manual animation, timeline, sequence, etc. always wins. */
 manualPriority?:boolean;beat?:number;energy?:number;
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft?:boolean;plantedRight?:boolean};

export function resolveHipDanceModeV735(input:HipDanceInputV735):HipDanceModeV735 {
 if(input.settings.mode!=='auto')return input.settings.mode;
 const genre=(input.genre??'').toLowerCase();
 // Long phrases alternate movement without frame-to-frame stochastic jumps.
 // A corrupted BPM must not poison the automatic selector; taking the clock
 // modulo one day prevents multiplication overflow in unusually long sessions.
 const bpm=finite(input.bpm)?clamp(input.bpm,65,190):120;
 const seconds=finite(input.seconds)?Math.max(0,input.seconds)%86400:0;
 const phrase=Math.floor(seconds*bpm/960);
 if(/hardstyle|hardtekk|hardcore|tekk/.test(genre))return phrase%3===0?'Hip_Circle':'Hip_Bounce';
 if(/rap|hip.?hop|trap|drill/.test(genre))return phrase%3===1?'Hip_Circle':'Hip_Sway';
 return (['Hip_Sway','Hip_Circle','Hip_Bounce'] as const)[phrase%3];
}

/** Each channel is a small fraction of the avatar's leg length (translations)
 * or an angular offset in radians. No foot transforms are introduced during
 * stance: the existing V492 foot IK is solely responsible for planted ankles.
 */
export function sampleHipDanceV735(input:HipDanceInputV735):HipDanceChannelsV735 {
 const {settings}=input;
 if(!input.playing||input.reducedMotion||input.manualPriority||settings.mode==='off'||
  !finite(input.seconds)||input.seconds<0||!finite(settings.strength)||!finite(settings.speed)||
  settings.strength<=0)return {...ZERO};
 const mode=resolveHipDanceModeV735(input);
 const strength=clamp(settings.strength/100,0,1);
 const speed=clamp(settings.speed/100,.5,2);
 const bpm=finite(input.bpm)?clamp(input.bpm,65,190):120;
 // Bound the phase before multiplying by 2π: even a very large finite seek
 // timestamp must never produce Infinity/NaN in the animation channels.
 const beatCycles=((input.seconds%86400)*bpm/60*speed)%4;
 const beatPhase=beatCycles*Math.PI*2;
 const phrase=(input.section??'').toLowerCase();
 const passage=/intro|outro|break|quiet|bridge/.test(phrase)?.44:/hook|drop|chorus/.test(phrase)?1:.76;
 const energy=finite(input.energy)?clamp(input.energy,0,1):.5;
 const amp=strength*passage*(.75+.25*energy);
 const planted=!!input.plantedLeft||!!input.plantedRight;
 const grounded=input.footIKEnabled&&input.contactKnown;
 // Reduce rotation and displacement for planted-foot support. If IK is absent,
 // rotation remains usable but ALL pelvis translation is suppressed.
 const support=planted?.58:1;
 const travel=grounded?(planted?.45:.7):0;
 let roll=0,pitch=0,lateral=0,vertical=0;
 if(mode==='Hip_Sway'){
   const sway=Math.sin(beatPhase*.5);
   roll=.105*sway; lateral=.022*sway;
   pitch=.018*Math.cos(beatPhase*.5);
 }else if(mode==='Hip_Circle'){
   // Small tilted elliptical loop, deliberately not a giant root rotation.
   roll=.09*Math.cos(beatPhase*.5);
   pitch=.078*Math.sin(beatPhase*.5);
   lateral=.018*Math.cos(beatPhase*.5);
   vertical=.012*Math.sin(beatPhase*.5);
 }else if(mode==='Hip_Bounce'){
   // Smooth downward pulse; never drive a pelvis above its baseline.
   const rhythmic=(1-Math.cos(beatPhase))*.5;
   const beat=finite(input.beat)?clamp(input.beat,0,1):0;
   const pulse=clamp(.8*rhythmic+.2*beat,0,1);
   vertical=-.025*pulse;
   pitch=.035*pulse;
 }
 roll=clamp(roll*amp*support,-.12,.12);
 pitch=clamp(pitch*amp*support,-.1,.1);
 lateral=clamp(lateral*amp*travel,-.018,.018);
 vertical=clamp(vertical*amp*travel,-.022,.016);
 return {hipPitch:pitch,hipRoll:roll,hipLateral:lateral,hipVertical:vertical,
  spineCounter:-roll*.65,kneeCounter:-pitch*.35,
  ankleCounter:planted?0:-pitch*.22};
}

/** Add bounded channels to the existing rig overlay instead of changing clips. */
export function blendHipDanceV735<T extends AvatarRigMotion>(base:T,pose:HipDanceChannelsV735):T {
 return {...base,hipPitch:pose.hipPitch,hipRoll:pose.hipRoll,
  hipLateral:pose.hipLateral,hipVertical:pose.hipVertical,
  spineSway:base.spineSway+pose.spineCounter,
  kneeFollow:(base.kneeFollow??0)+pose.kneeCounter,
  footStep:base.footStep+pose.ankleCounter};
}
