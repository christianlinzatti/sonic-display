/** V850 – Smart Festival Show Director 4.0.
 * Pure, deterministic and seek-stable. V604/V761/V810 own verified acts;
 * V824/V828 shape the original cues; V850 only reduces their automatic lanes.
 * No inferred song sections, camera cuts, dance clips, flashes, renders or timers.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxSectionV810} from './concertFxStudioV810';
import type {FxTimelineLaneV823} from './visualFxTimelineV823';
export type FestivalFocusV850='rest'|'vocals'|'led'|'laser'|'particles';
export type FestivalShowStyleV850='cinematic'|'balanced'|'festival';
export type FestivalShowGainsV850=Record<FxTimelineLaneV823,number>&{festival:number;ambience:number};
export type FestivalShowCueV850={
 active:boolean;reason:'disabled'|'unverified'|'protected'|'music';
 section:ConcertFxSectionV810;focus:FestivalFocusV850;variation:0|1|2;
 sceneLabel:string;gains:FestivalShowGainsV850;blend:number;
};
export interface FestivalShowInputV850{
 settings:Partial<ConcertFxSettingsV810>|null|undefined;fx:ConcertFxCueV810;
 trackId:string;actIndex:number;actStartMs:number;actEndMs:number;progressMs:number;
 playing:boolean;reactive:boolean;reducedMotion:boolean;manualLighting:boolean;
 blackout:boolean;lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 tier:'low'|'balanced'|'high';budget:number;
 authoredLanes?:readonly FxTimelineLaneV823[];
}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
const round=(n:number)=>Math.round(n*1000000)/1000000;
const names:Record<ConcertFxSectionV810,string>={intro:'Auftakt',verse:'Strophe',hook:'Hook',build:'Spannungsaufbau',drop:'Drop',break:'Ruhepunkt',finale:'Finale'};
const lanes:readonly FxTimelineLaneV823[]=['laser','led','particles','foam','transition'];
const neutral=():FestivalShowGainsV850=>({laser:1,led:1,particles:1,foam:1,transition:1,festival:1,ambience:1});
const sectionBase:Record<ConcertFxSectionV810,FestivalShowGainsV850>={
 intro:{laser:.70,led:.82,particles:.64,foam:.58,transition:.86,festival:.52,ambience:.80},
 verse:{laser:.61,led:.82,particles:.52,foam:.60,transition:.90,festival:.40,ambience:.78},
 hook:{laser:.91,led:.94,particles:.83,foam:.74,transition:.96,festival:.86,ambience:.94},
 build:{laser:.82,led:.85,particles:.69,foam:.58,transition:.92,festival:.66,ambience:.87},
 drop:{laser:1,led:1,particles:.96,foam:.90,transition:1,festival:1,ambience:1},
 break:{laser:.49,led:.65,particles:.41,foam:.45,transition:.80,festival:.28,ambience:.78},
 finale:{laser:1,led:1,particles:.96,foam:.89,transition:.98,festival:1,ambience:.98},
};
function seed(trackId:string):number{
 let h=2166136261;
 for(let i=0;i<trackId.length;i++)h=Math.imul(h^trackId.charCodeAt(i),16777619);
 return h>>>0;
}
/** A song's verified act index rotates the emphasis; repeated motifs need not repeat. */
export function focusForActV850(trackId:string,actIndex:number,section:ConcertFxSectionV810):{
 focus:FestivalFocusV850;variation:0|1|2;
}{
 const variation=((seed(trackId)+actIndex)%3) as 0|1|2;
 if(section==='break'||section==='intro')return {variation,focus:'rest'};
 if(section==='verse')return {variation,focus:'vocals'};
 if(section==='build')return {variation,focus:variation===1?'led':'laser'};
 if(section==='hook')return {variation,focus:variation===0?'led':variation===1?'laser':'vocals'};
 return {variation,focus:variation===0?'led':variation===1?'laser':'particles'};
}
export function planSmartFestivalShowV850(i:FestivalShowInputV850):FestivalShowCueV850{
 const off=(reason:FestivalShowCueV850['reason']):FestivalShowCueV850=>({
  active:false,reason,section:i.fx.section,focus:'rest',variation:0,
  sceneLabel:'Unverändert',blend:0,gains:neutral(),
 });
 if(i.settings?.festivalDirectorV850===false||i.settings?.enabled===false||
   i.settings?.festivalDirectorStrengthV850===0)return off('disabled');
 if(!i.playing||!i.reactive||i.reducedMotion||i.manualLighting||i.blackout||i.tier==='low')return off('protected');
 if(i.fx.reason!=='music'||!i.fx.active||!i.trackId||i.trackId.length>180||
  !Number.isInteger(i.actIndex)||i.actIndex<0||i.actIndex>9999||
  ![i.actStartMs,i.actEndMs,i.progressMs,i.budget].every(finite)||
  i.actStartMs<0||i.actEndMs-i.actStartMs<1200||
  i.progressMs<i.actStartMs||i.progressMs>=i.actEndMs||i.budget<=0||i.budget>1||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  !Object.prototype.hasOwnProperty.call(sectionBase,i.fx.section))return off('unverified');
 const s=i.settings;
 const intensity=finite(s?.festivalDirectorStrengthV850)?clamp(s!.festivalDirectorStrengthV850!/100):.65;
 const style:FestivalShowStyleV850=s?.festivalDirectorStyleV850==='cinematic'||s?.festivalDirectorStyleV850==='festival'?s.festivalDirectorStyleV850:'balanced';
 if(!intensity)return off('disabled');
 const section=i.fx.section;
 const {focus,variation}=focusForActV850(i.trackId,i.actIndex,section);
 // A stable verified act clock: fade to neutral at BOTH boundaries, including seeks.
 const edge=Math.min(i.progressMs-i.actStartMs,i.actEndMs-i.progressMs);
 const fade=smooth(edge/Math.min(1350,(i.actEndMs-i.actStartMs)*.22));
 // Give the build-up a rising intensity and let the drop settle naturally.
 const p=clamp((i.progressMs-i.actStartMs)/(i.actEndMs-i.actStartMs));
 const shape=section==='build'?.66+.34*smooth(p):section==='drop'?.95-.12*smooth(p):1;
 const audience=i.groupCount>=3?.82:1;
 const readability=(i.lyricsProtected?.56:1)*(i.vocalFocus?.70:1);
 const blend=round(intensity*fade*shape*i.budget*(i.tier==='balanced'?.72:1)*audience);
 const gains=neutral(),profile=sectionBase[section];
 for(const lane of [...lanes,'festival','ambience'] as const){
  if(lanes.includes(lane as FxTimelineLaneV823)&&i.authoredLanes?.includes(lane as FxTimelineLaneV823))continue;
  let target=profile[lane];
  // Alternate ONE visual foreground. Never brighten the foreground above its
  // original level or suppress ALL of the other effects simultaneously.
  if((section==='hook'||section==='drop'||section==='finale'||section==='build')&&focus!=='rest'){
   if(focus==='led'&&lane==='laser')target*=.81;
   if(focus==='laser'&&lane==='led')target*=.83;
   if(focus==='particles'&&(lane==='led'||lane==='laser'))target*=.88;
   if(focus==='vocals'&&(lane==='laser'||lane==='festival'))target*=.75;
  }
  const styleWeight=style==='festival'?.73:style==='cinematic'?1.16:1;
  const suppress=clamp((1-clamp(target))*styleWeight);
  let gain=1-suppress*blend;
  // Lyrics/vocals only further REDUCE decorative visual noise;
  // they never change avatar motion or the lyric display itself.
  if(lane==='laser'||lane==='festival'||lane==='particles')gain*=1-(1-readability)*blend*.34;
  gains[lane]=round(clamp(gain));
 }
 return {active:blend>.0005,reason:blend>.0005?'music':'protected',section,focus,variation,
  sceneLabel:`${names[section]} · ${focus}`,blend,gains};
}
/** Authored lanes always retain their original V823 result; this helper never boosts. */
export function dimFestivalLaneV850(value:number,gain:number,manual:boolean):number{
 if(!finite(value)||value<=0)return 0;
 return manual?value:finite(gain)&&gain>=0&&gain<=1?value*gain:0;
}
