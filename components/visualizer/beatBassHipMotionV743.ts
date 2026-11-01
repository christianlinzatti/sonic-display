/** V743 – Beat & Bass Motion. Stateful, bounded additive shaping on top of the
 * already blended V735/V738 pose. Real inputs come from AudioAnalysisContext.
 * No synthetic beat is generated for the live stage and no GLB/foot bones are edited.
 */
import type {HipDanceChannelsV735,HipDanceModeV735} from './hipDanceV735';

export type BeatBassSettingsV743={enabled:boolean;strength:number;kick:number;bass:number;sensitivity:number};
export const DEFAULT_BEAT_BASS_V743:Readonly<BeatBassSettingsV743>={enabled:true,strength:55,kick:75,bass:60,sensitivity:50};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const bound=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
const percent=(v:unknown,fallback:number)=>finite(v)?Math.round(bound(v,0,100)):fallback;
export function normalizeBeatBassV743(raw:Partial<BeatBassSettingsV743>|null|undefined):BeatBassSettingsV743{
 return {enabled:raw?.enabled===undefined?DEFAULT_BEAT_BASS_V743.enabled:raw.enabled===true,
   strength:percent(raw?.strength,55),kick:percent(raw?.kick,75),
   bass:percent(raw?.bass,60),sensitivity:percent(raw?.sensitivity,50)};
}
export type BeatBassStateV743={kickEnvelope:number;bassEnvelope:number;lastSeconds:number|null;trackId:string|null};
export const createBeatBassStateV743=():BeatBassStateV743=>({kickEnvelope:0,bassEnvelope:0,lastSeconds:null,trackId:null});
export function resetBeatBassV743(s:BeatBassStateV743):void{
 s.kickEnvelope=0;s.bassEnvelope=0;s.lastSeconds=null;s.trackId=null;
}
export type BeatBassInputV743={pose:HipDanceChannelsV735;mode:HipDanceModeV735;
 settings?:Partial<BeatBassSettingsV743>|null;seconds:number;delta:number;trackId?:string|null;
 /** Normalized V738 effective intensity; zero forbids any V743 overlay. */
 poseStrength?:number;
 bpm?:number|null;genre?:string|null;section?:string|null;
 /** 0–1 audio analyzer outputs (non-finite/missing inputs are silent). */
 kick?:number|null;beat?:number|null;bass?:number|null;attack?:number|null;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean;
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft?:boolean;plantedRight?:boolean;
};
export type BeatBassOutputV743={pose:HipDanceChannelsV735;active:boolean;kickEnvelope:number;bassEnvelope:number};
const signal=(x:unknown)=>finite(x)?bound(x,0,1):0;
const smooth=(from:number,to:number,dt:number,attack:number,release:number)=>{
 const tau=to>from?attack:release;
 return bound(from+(to-from)*(1-Math.exp(-dt/tau)),0,1);
};
/** Additive motion is applied AFTER V738 crossfades and BEFORE V740 body/foot IK.
 * Fixed authored clips or manually controlled shows never enter this layer.
 */
export function sampleBeatBassV743(s:BeatBassStateV743,input:BeatBassInputV743):BeatBassOutputV743{
 const settings=normalizeBeatBassV743(input.settings);
 const valid=finite(input.seconds)&&input.seconds>=0&&finite(input.delta)&&input.delta>=0;
 const poseStrength=input.poseStrength===undefined?1:finite(input.poseStrength)?bound(input.poseStrength,0,1):0;
 const allowed=poseStrength>0&&settings.enabled&&settings.strength>0&&settings.kick+settings.bass>0&&
  input.playing&&!input.reducedMotion&&!input.manualPriority&&valid&&
  input.mode!=='off'&&input.mode!=='auto';
 if(!allowed){resetBeatBassV743(s);return {pose:{...input.pose},active:false,kickEnvelope:0,bassEnvelope:0};}
 const track=input.trackId??'';
 if(s.trackId!==null&&s.trackId!==track || s.lastSeconds!==null&&
    (input.seconds<s.lastSeconds-.18||input.seconds-s.lastSeconds>2.5))resetBeatBassV743(s);
 s.trackId=track;s.lastSeconds=input.seconds;
 // Avoid frame hitches injecting impulses. Calm after silence rather than
 // assuming a tempo implies a recorded kick. Inputs are not synthesized.
 const dt=bound(input.delta,0,.1);
 const sensitivity=.65+settings.sensitivity/100*.75;
 const kick=bound(Math.max(signal(input.kick),signal(input.beat)*.45,signal(input.attack)*.35)*sensitivity,0,1);
 const bass=bound(signal(input.bass)*sensitivity,0,1);
 s.kickEnvelope=smooth(s.kickEnvelope,kick,dt,.035,.16);
 s.bassEnvelope=smooth(s.bassEnvelope,bass,dt,.12,.32);
 const genre=(input.genre??'').toLowerCase();
 const hardtekk=/hardtekk|tekk/.test(genre),hardstyle=/hardstyle/.test(genre);
 const rap=/rap|hip.?hop|trap|drill/.test(genre);
 const rock=/rock|metal/.test(genre);
 const kickGenre=hardtekk?1.1:hardstyle?1.2:rap?.7:rock?.8:1;
 const bassGenre=hardtekk?1.1:hardstyle?.8:rap?1.07:rock?.7:1;
 const section=(input.section??'').toLowerCase();
 const passage=/intro|outro|quiet|bridge|break|interlude/.test(section)?.42:/hook|chorus|drop|climax/.test(section)?1:.78;
 const gain=settings.strength/100*passage*poseStrength;
 const accent=bound(s.kickEnvelope*settings.kick/100*kickGenre*gain,0,.8);
 const groove=bound(s.bassEnvelope*settings.bass/100*bassGenre*gain,0,.8);
 const grounded=input.footIKEnabled&&input.contactKnown;
 const planted=!!input.plantedLeft||!!input.plantedRight;
 const support=planted?.55:1;
 const translation=grounded?(planted?.4:1):0;
 // Use the song clock only as a smooth directional carrier. The measured
 // kick/bass envelopes define the real reaction (a BPM alone never triggers it).
 const bpm=finite(input.bpm)&&input.bpm>0?bound(input.bpm,65,190):120;
 const phase=((input.seconds%86400)*bpm/60%2)*Math.PI*2;
 let roll=0,pitch=0,lateral=0,vertical=0;
 if(input.mode==='Hip_Bounce'){
   // Strong kick => deeper *downward* bounce; never lift the planted foot.
   pitch=.015*accent*support;
   vertical=-.009*accent*translation;
   roll=.008*groove*Math.sin(phase*.5)*support;
 }else if(input.mode==='Hip_Circle'){
   roll=.017*groove*Math.cos(phase*.5)*support;
   pitch=.015*groove*Math.sin(phase*.5)*support+.005*accent*support;
   lateral=.005*groove*Math.cos(phase*.5)*translation;
   vertical=-.004*accent*translation;
 }else if(input.mode==='Hip_Sway'){
   roll=.023*groove*Math.sin(phase*.5)*support;
   lateral=.006*groove*Math.sin(phase*.5)*translation;
   pitch=.005*accent*support;
   vertical=-.003*accent*translation;
 }
 const base=input.pose;
 const baseRoll=finite(base.hipRoll)?base.hipRoll:0;
 const basePitch=finite(base.hipPitch)?base.hipPitch:0;
 const baseLateral=finite(base.hipLateral)?base.hipLateral:0;
 const baseVertical=finite(base.hipVertical)?base.hipVertical:0;
 // Limits cover TOTAL post-V738 pose; never accumulate offsets frame-to-frame.
 const hipRoll=bound(baseRoll+roll,-.12,.12);
 const hipPitch=bound(basePitch+pitch,-.1,.1);
 const hipLateral=grounded?bound(baseLateral+lateral,-.018,.018):0;
 const hipVertical=grounded?bound(baseVertical+vertical,-.022,.016):0;
 const dr=hipRoll-baseRoll,dp=hipPitch-basePitch;
 const pose:HipDanceChannelsV735={...base,hipRoll,hipPitch,hipLateral,hipVertical,
  spineCounter:bound((finite(base.spineCounter)?base.spineCounter:0)-dr*.65,-.12,.12),
  kneeCounter:bound((finite(base.kneeCounter)?base.kneeCounter:0)-dp*.35,-.1,.1),
  ankleCounter:planted?0:bound((finite(base.ankleCounter)?base.ankleCounter:0)-dp*.22,-.1,.1)};
 return {pose,active:accent>.0001||groove>.0001,kickEnvelope:s.kickEnvelope,bassEnvelope:s.bassEnvelope};
}
