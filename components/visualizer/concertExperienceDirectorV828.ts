/** V828 – concert-wide musical scene composition, with no additional clock or renderer.
 * Every scene inherits the verified V604/V761 act through the V810 gate. The V823
 * manual FX timeline, V821 fixed LED look and V825 performance budgets win.
 * This deliberately does NOT synthesize beats, predicts drops or direct cameras.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxSectionV810} from './concertFxStudioV810';
import type {FxTimelineLaneV823,FxTimelineResultV823,FxTimelineLedLookV823} from './visualFxTimelineV823';

export type ConcertExperienceStyleV828='cinematic'|'dynamic'|'festival';
export type ConcertExperienceMomentV828='anticipation'|'focus'|'expansion'|'release'|'recovery';
export type ConcertExperienceGainsV828=Record<FxTimelineLaneV823,number>;
export interface ConcertExperienceCueV828 {
 active:boolean;reason:'off'|'unverified'|'music';
 moment:ConcertExperienceMomentV828;label:string;signature:number;
 gains:ConcertExperienceGainsV828;ledLook:FxTimelineLedLookV823;
 backgroundAccent:number;architectureMotion:number; // Existing stage uniforms, no new objects.
 crownCount:number;crownOpacity:number;crownPulse:number;phase:number;primary:string;secondary:string;
}
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const lanes=['laser','led','particles','foam','transition'] as const;
const neutral=():ConcertExperienceGainsV828=>({laser:1,led:1,particles:1,foam:1,transition:1});
const hash=(str:string)=>{let h=2166136261;for(let n=0;n<str.length;n++)h=Math.imul(h^str.charCodeAt(n),16777619);h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return (h^(h>>>16))>>>0};
const sectionMoments:Record<ConcertFxSectionV810,ConcertExperienceMomentV828>={
 intro:'anticipation',verse:'focus',hook:'expansion',build:'anticipation',drop:'release',break:'recovery',finale:'release',
};
const labels:Record<ConcertFxSectionV810,string>={
 intro:'Cinematic Opening',verse:'Performer Focus',hook:'Wide Stage Reveal',
 build:'Rising Tension',drop:'Festival Impact',break:'Quiet Contrast',finale:'Final Concert Climax',
};
const off=(reason:ConcertExperienceCueV828['reason']):ConcertExperienceCueV828=>({
 active:false,reason,moment:'recovery',label:'Inaktiv',signature:0,gains:neutral(),
 ledLook:'auto',backgroundAccent:0,architectureMotion:0,
 crownCount:0,crownOpacity:0,crownPulse:0,phase:0,primary:'#ffffff',secondary:'#ffffff',
});

export const EXPERIENCE_OFF_V828:ConcertExperienceCueV828=off('off');
export function planConcertExperienceV828(i:{
 settings?:Partial<ConcertFxSettingsV810>|null;fx:ConcertFxCueV810;
 authored:FxTimelineResultV823;trackId:string;startMs:number;endMs:number;progressMs:number;
 tier:'low'|'balanced'|'high';lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
}):ConcertExperienceCueV828 {
 const s=i.settings;
 if(s?.concertExperienceV828===false||s?.experienceIntensityV828===0||s?.enabled===false)return off('off');
 if(i.fx.reason!=='music'||!i.fx.active||!i.trackId||i.tier==='low'||
    !finite(i.progressMs)||!finite(i.startMs)||!finite(i.endMs)||i.endMs<=i.startMs||
    i.progressMs<i.startMs||i.progressMs>=i.endMs||!Number.isInteger(i.groupCount)||
    i.groupCount<1||i.groupCount>4)return off('unverified');
 const section=i.fx.section;
 const rawStrength=finite(s?.experienceIntensityV828)?clamp(s!.experienceIntensityV828!/100):.66;
 const style:ConcertExperienceStyleV828=s?.experienceStyleV828==='cinematic'||s?.experienceStyleV828==='festival'?s.experienceStyleV828:'dynamic';
 const progress=clamp((i.progressMs-i.startMs)/(i.endMs-i.startMs));
 const phase=section==='build'?(.55+.45*progress):section==='drop'?(.82+.18*(1-progress)):
   section==='finale'?(.80+.20*progress):1;
 const signature=hash(`${i.trackId}:${i.startMs}:${section}`)%4;
 const bass=clamp(finite(i.fx.bass)?i.fx.bass:0);
 const mids=clamp(finite(i.fx.mids)?i.fx.mids:0);
 const highs=clamp(finite(i.fx.highs)?i.fx.highs:0);
 const energy=clamp(bass*.50+mids*.30+highs*.20);
 const dramatic=style==='festival'?1.10:style==='cinematic'?.78:1;
 const crowd=i.groupCount>=4?.75:i.groupCount===3?.86:1;
 const legibility=(i.lyricsProtected?.63:1)*(i.vocalFocus?.69:1)*crowd;
 const intensity=rawStrength*(i.tier==='balanced'?.72:1)*dramatic;
 const moment=sectionMoments[section];
 // Each verified section receives its own stable visual signature. The deliberate
 // negative space during verse/break makes subsequent hooks/drops read as larger.
 const base:Record<ConcertFxSectionV810,[number,number,number,number,number]>={
  intro:[.80,.95,.77,.65,.86],verse:[.70,1.02,.74,.58,.88],
  hook:[1.07,1.10,1.04,.92,1.03],build:[.82,1.07,.84,.70,1.01],
  drop:[1.12,1.10,1.12,1.10,1.05],break:[.67,.80,.66,.56,.76],
  finale:[1.10,1.12,1.11,1.10,1.09],
 };
 const gains=neutral();
 for(let index=0;index<lanes.length;index++){
   const lane=lanes[index];
   // Alternate dominant supporting effects across consecutive segments without
   // turning on a manually disabled effect or overriding an authored timeline cue.
   const lead=(signature+index)%4===0?1.08:(signature+index)%4===2?.94:1;
   const preferred=i.fx.genre==='rap'&&lane==='foam'?.86:
     (i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle')&&lane==='laser'?1.04:
     i.fx.genre==='rock'&&lane==='led'?1.04:1;
   const desired=base[section][index]*lead*preferred*phase*(.94+.06*energy);
   const raw=1+(desired-1)*intensity*(desired>1?legibility:1);
   const authored=i.authored[lane];
   gains[lane]=authored&&(authored.boost>.001||authored.mute>.001)?1:
     Math.round(clamp(raw,.55,1.16)*1e6)/1e6;
 }
 const userLed=s?.ledLookV821;
 const allowAutoLed=(userLed===undefined||userLed==='auto')&&i.authored.led.ledLook==='auto';
 let ledLook:FxTimelineLedLookV823='auto';
 if(allowAutoLed){
   if(section==='verse'||section==='break'||section==='intro')ledLook=i.fx.genre==='rap'?'waves':'equalizer';
   else if(section==='build')ledLook=signature%2?'geometry':'waves';
   else if(section==='drop'||section==='finale')ledLook=i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle'?'tunnel':signature%2?'geometry':'equalizer';
   else if(section==='hook')ledLook=signature%2?'geometry':'waves';
 }
 const accentSection=section==='drop'||section==='finale'?.14:section==='hook'?.10:section==='build'?.08:section==='verse'?.035:.025;
 const backgroundAccent=clamp(accentSection*intensity*(i.lyricsProtected?.6:1)*(i.vocalFocus?.65:1)*crowd,0,.14);
 const architectureMotion=clamp((section==='drop'||section==='finale'?.13:section==='hook'?.09:section==='build'?.06:.025)*
   intensity*legibility,0,.13);
 // One lightweight instanced architectural light-crown behind the central
 // singer lane. Disable on authored LED cues, explicit LED disable, low tier,
 // reduced motion (enforced by V810) or when the song is in a quiet section.
 const ledAuthored=i.authored.led.boost>.001||i.authored.led.mute>.001;
 const crownAllowed=s?.concertCrownV828!==false&&s?.ledWall!==false&&!ledAuthored;
 const crownLevel=section==='drop'||section==='finale'?1:section==='hook'?.80:section==='build'?.35:0;
 const crownCount=crownAllowed&&crownLevel>0?Math.min(12,Math.floor((i.tier==='balanced'?6:12)*
   crownLevel*clamp(.45+.55*intensity)*legibility)):0;
 const crownOpacity=crownCount>0?clamp(.22*crownLevel*intensity*legibility,0,.24):0;
 const crownPulse=crownCount>0?clamp(.03+.12*bass+.05*progress,0,.20):0;
 return {active:true,reason:'music',moment,label:labels[section],signature,gains,ledLook,
   backgroundAccent,architectureMotion,crownCount,crownOpacity,crownPulse,
   phase:i.fx.phase,primary:i.fx.primary,secondary:i.fx.secondary};
}
