/** V1000 – Immersive 1.0 coordination of *existing* verified decorative lanes.
 * No timeline creation, hardware authority, audio analysis, or new renderer.
 * All output gains are reduction-only. Manual/unsupported states are neutral.
 */
export const IMMERSIVE_KEY_V1000='sonic.v1000.immersive-director';
export type ImmersiveStyleV1000='cinematic'|'festival'|'vocal';
export type ImmersiveSettingsV1000=Readonly<{enabled:boolean;style:ImmersiveStyleV1000;intensity:number;protectLyrics:boolean}>;
export const DEFAULT_IMMERSIVE_V1000:ImmersiveSettingsV1000=Object.freeze({enabled:false,style:'cinematic',intensity:60,protectLyrics:true});
export type ImmersiveLaneV1000='led'|'bass'|'crowd';
export type ImmersiveGainsV1000=Readonly<Record<ImmersiveLaneV1000,number>>;
export type ImmersiveReasonV1000='disabled'|'unverified'|'blocked'|'unknown-section'|'active';
export type ImmersiveCueV1000=Readonly<{active:boolean;reason:ImmersiveReasonV1000;section:string;gains:ImmersiveGainsV1000;focus:string}>;
const neutral=Object.freeze({led:1,bass:1,crowd:1});
export const IMMERSIVE_OFF_V1000:ImmersiveCueV1000=Object.freeze({active:false,reason:'disabled',section:'',gains:neutral,focus:'Automatik aus'});
const styles:readonly ImmersiveStyleV1000[]=['cinematic','festival','vocal'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const idOk=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=160;
export function normalizeImmersiveV1000(raw:unknown):ImmersiveSettingsV1000 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ImmersiveSettingsV1000>:{};
 return {enabled:v.enabled===true,style:styles.includes(v.style as ImmersiveStyleV1000)?v.style as ImmersiveStyleV1000:'cinematic',
  intensity:finite(v.intensity)?Math.round(clamp(v.intensity,0,100)):60,protectLyrics:v.protectLyrics!==false};
}
export type ImmersiveContextV1000=Readonly<{
 trackId:string;stageTrackId:string;durationMs:number;sceneStartMs:number;section:string;
 verified:boolean;playing:boolean;autoEnabled:boolean;reducedMotion:boolean;
 manual:boolean;blackout:boolean;seekBlocked:boolean;lyricsProtected:boolean;vocalFocus:boolean;
 momentKind?:string|null;settings?:ImmersiveSettingsV1000;
}>;
const phases:Record<string,{led:number;bass:number;crowd:number;focus:string}>={
 intro:{led:.80,bass:.55,crowd:.62,focus:'Bühne aufbauen'},
 verse:{led:.72,bass:.67,crowd:.45,focus:'Stimme und Künstler'},
 hook:{led:.94,bass:.94,crowd:.88,focus:'Gemeinsame Hook'},
 build:{led:.88,bass:.72,crowd:.76,focus:'Spannung erhöhen'},
 drop:{led:1,bass:1,crowd:1,focus:'Bestätigter Höhepunkt'},
 break:{led:.65,bass:.48,crowd:.42,focus:'Atmosphärische Ruhe'},
 finale:{led:1,bass:1,crowd:1,focus:'Finale'},
 outro:{led:.74,bass:.52,crowd:.60,focus:'Ausklang'},
};
function sectionOf(raw:string,moment?:string|null){
 const s=raw.toLowerCase().trim().replace(/[_\s]+/g,'-');
 if(s==='intro'||s==='outro'||s==='verse'||s==='hook'||s==='drop'||s==='break'||s==='finale'||s==='build')return s;
 if(s==='chorus'||s==='refrain')return 'hook';
 if(s==='bridge')return 'break';
 if(s==='build-up'||s==='buildup')return 'build';
 // Moment labels must come from verified V883 cues. No prediction from metadata.
 if(moment==='finale'||moment==='drop'||moment==='hook')return moment;
 return '';
}
/** Render-frame pure planner: fail neutral on unconfirmed or unsafe context.
 * Never raises an existing lane; V999 performance factors still multiply afterwards.
 */
export function planImmersiveV1000(c:ImmersiveContextV1000):ImmersiveCueV1000 {
 const s=normalizeImmersiveV1000(c.settings);
 if(!s.enabled||s.intensity<=0)return IMMERSIVE_OFF_V1000;
 const off=(reason:ImmersiveReasonV1000):ImmersiveCueV1000=>({active:false,reason,section:'',gains:neutral,focus:'Keine automatische Anpassung'});
 if(!idOk(c.trackId)||c.stageTrackId!==c.trackId||!c.verified||
   !finite(c.durationMs)||c.durationMs<10000||c.durationMs>1800000||
   !finite(c.sceneStartMs)||c.sceneStartMs<0||c.sceneStartMs>=c.durationMs)return off('unverified');
 if(!c.playing||!c.autoEnabled||c.reducedMotion||c.manual||c.blackout||c.seekBlocked)return off('blocked');
 const phase=sectionOf(c.section,c.momentKind);
 const b=phases[phase];if(!b)return off('unknown-section');
 const style=c.vocalFocus||s.style==='vocal'?'vocal':s.style;
 const boost=style==='festival'?{led:1,bass:1,crowd:1}:style==='vocal'?{led:.85,bass:.78,crowd:.68}:{led:.93,bass:.85,crowd:.85};
 const lyric=s.protectLyrics&&c.lyricsProtected?{led:.72,bass:.62,crowd:.55}:{led:1,bass:1,crowd:1};
 const target={led:Math.min(1,b.led*boost.led*lyric.led),bass:Math.min(1,b.bass*boost.bass*lyric.bass),
  crowd:Math.min(1,b.crowd*boost.crowd*lyric.crowd)};
 const strength=s.intensity/100;
 const gains={led:clamp(1-(1-target.led)*strength,0,1),bass:clamp(1-(1-target.bass)*strength,0,1),
  crowd:clamp(1-(1-target.crowd)*strength,0,1)};
 return {active:true,reason:'active',section:phase,focus:b.focus,gains};
}
