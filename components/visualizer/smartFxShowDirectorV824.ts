/** V824 – deterministic, bounded musical FX orchestration.
 * Shapes existing V810–V823 effects only. V604/V761 remain the sole act authority.
 * No WebGL allocations, new beats, clock, cameras, blackout or manual overrides.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxGenreV810} from './concertFxStudioV810';
import type {FxTimelineResultV823,FxTimelineLaneV823,FxTimelineLedLookV823} from './visualFxTimelineV823';

export type SmartFxShowModeV824='cinematic'|'balanced'|'festival';
export type SmartFxShowGainsV824=Record<FxTimelineLaneV823,number>;
export interface SmartFxShowCueV824 {
  active:boolean; reason:'off'|'unverified'|'music';
  gains:SmartFxShowGainsV824;ledLook:FxTimelineLedLookV823;
  sceneLabel:string;variation:number;
}
const neutral=():SmartFxShowGainsV824=>({laser:1,led:1,particles:1,foam:1,transition:1});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(x:number,min=0,max=1)=>Math.max(min,Math.min(max,x));
const profiles={
 intro:[.48,.73,.44,.42,.68],verse:[.50,.83,.46,.40,.72],
 hook:[.91,1.12,.93,.83,.95],build:[.68,.99,.66,.52,.90],
 drop:[1.16,1.17,1.16,1.18,1.06],break:[.36,.60,.38,.35,.62],
 finale:[1.09,1.14,1.12,1.09,1.08],
} as const;
const labels={intro:'Auftakt',verse:'Verse',hook:'Hook',build:'Spannungsaufbau',drop:'Drop',break:'Break',finale:'Finale'};
const hash=(s:string)=>{let h=2166136261;for(let k=0;k<s.length;k++){h=Math.imul(h^s.charCodeAt(k),16777619)}return h>>>0;};
export function planSmartFxShowDirectorV824(i:{
 settings?:Partial<ConcertFxSettingsV810>|null; fx:ConcertFxCueV810;
 trackId:string;startMs:number;endMs:number;progressMs:number;
 tier:'low'|'balanced'|'high';lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
}):SmartFxShowCueV824 {
 const s=i.settings;
 const off=(reason:SmartFxShowCueV824['reason']):SmartFxShowCueV824=>({active:false,reason,gains:neutral(),ledLook:'auto',sceneLabel:'Inaktiv',variation:0});
 if(s?.smartShowV824===false||s?.smartShowIntensityV824===0||s?.enabled===false)return off('off');
 if(i.fx.reason!=='music'||!i.fx.active||!i.trackId||i.tier==='low'||
  !finite(i.progressMs)||!finite(i.startMs)||!finite(i.endMs)||
  i.endMs<=i.startMs||i.progressMs<i.startMs||i.progressMs>=i.endMs||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4)return off('unverified');
 const intensity=finite(s?.smartShowIntensityV824)?clamp(s!.smartShowIntensityV824!/100):.65;
 const mode:SmartFxShowModeV824=s?.smartShowModeV824==='cinematic'||s?.smartShowModeV824==='festival'?s.smartShowModeV824:'balanced';
 const section=i.fx.section;
 const base=profiles[section];
 const genre:ConcertFxGenreV810=i.fx.genre;
 const festival=mode==='festival'?1.12:mode==='cinematic'?.83:1;
 const aggressive=genre==='hardtekk'||genre==='hardstyle'?1.06:genre==='rock'?1.01:genre==='rap'?.89:.94;
 const variation=hash(i.trackId+':'+i.startMs)%3;
 // Progress is the actual verified act clock; no new metronome or beat inference.
 const progress=clamp((i.progressMs-i.startMs)/(i.endMs-i.startMs));
 const swell=section==='build'?(.72+.34*progress):section==='drop'?(1.04-.10*progress):1;
 const dynamics=clamp(i.fx.bass*.55+i.fx.mids*.25+i.fx.highs*.20);
 const audio=.91+.09*dynamics;
 const protect=i.lyricsProtected?.72:1;
 const faces=i.vocalFocus?.78:1;
 const group=i.groupCount>=4?.78:i.groupCount===3?.88:1;
 const safeguard=protect*faces*group;
 const laneNames:readonly FxTimelineLaneV823[]=['laser','led','particles','foam','transition'];
 const gains=neutral();
 laneNames.forEach((lane,index)=>{
   const variationFactor=lane==='led'?1:1+((variation-1)*.045);
   // Low-energy sections stay restrained; manual timeline cues override these below.
   const desired=base[index]*festival*aggressive*swell*audio*variationFactor;
   const decorated=desired>1?1+(desired-1)*safeguard:desired;
   gains[lane]=Math.round(clamp(1+(decorated-1)*intensity,.30,1.20)*1e6)/1e6;
 });
 // An explicit fixed LED look in V821 is a user choice, not a recommendation.
 let ledLook:FxTimelineLedLookV823='auto';
 if(s?.ledLookV821===undefined||s.ledLookV821==='auto'){
   if(section==='verse'||section==='break'||section==='intro')ledLook=genre==='rap'?'waves':'equalizer';
   else if(section==='build')ledLook='waves';
   else if(section==='drop'||section==='finale')ledLook=genre==='hardtekk'||genre==='hardstyle'?'tunnel':'geometry';
   else if(section==='hook')ledLook=variation===0?'waves':'geometry';
 }
 return {active:true,reason:'music',gains,ledLook,sceneLabel:labels[section],variation};
}
/** An authored cue has final authority on its own lane, including mute.
 * The stage still applies V823 on top of the resulting gain and retains V810 hard caps.
 */
export function mergeSmartFxWithTimelineV824(smart:SmartFxShowCueV824,authored:FxTimelineResultV823):{
 gains:SmartFxShowGainsV824;ledLook:FxTimelineLedLookV823;
}{
 const result=neutral();
 (['laser','led','particles','foam','transition'] as const).forEach(lane=>{
  const a=authored[lane];
  const manuallyControlled=finite(a?.boost)&&a.boost>0||finite(a?.mute)&&a.mute>0;
  result[lane]=manuallyControlled?1:smart.active?clamp(smart.gains[lane],.3,1.2):1;
 });
 return {gains:result,ledLook:authored.led.ledLook!=='auto'?authored.led.ledLook:smart.active?smart.ledLook:'auto'};
}
