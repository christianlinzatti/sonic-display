/** V669 – Universal Automatic Concert Show Director.
 * A bounded, evidence-aware genre profile for the existing V502/V654 automatic lanes.
 * No new audio analysis, song-section inference, visual renderer, timers, persistence,
 * singer attribution, camera cut or stage asset load. Manual lanes always win.
 */
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';

export type UniversalShowStyleV669='rap'|'rock'|'metal'|'pop'|'hard-dance'|'electronic'|'acoustic'|'neutral';
export type UniversalShowEvidenceV669='verified-section'|'ambient-contour'|'off';
export interface UniversalShowCueV669 {
  active:boolean;style:UniversalShowStyleV669;evidence:UniversalShowEvidenceV669;
  chapter:string;motif:string;dance:number;camera:number;lighting:number;
  reason:string;
}
export interface UniversalShowInputV669 {
  trackId:string;durationMs:number;progressMs:number;playing:boolean;
  enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;
  genre:string|null|undefined;energy:number;lyricsProtected:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  narrative:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const smooth=(value:number)=>{const x=clamp(value,0,1);return x*x*(3-2*x);};
const rounded=(value:number)=>Math.round(value*10000)/10000;
const styles:Record<UniversalShowStyleV669,{dance:number;camera:number;light:number}>={
  rap:{dance:.028,camera:.015,light:.021},
  rock:{dance:.032,camera:.013,light:.026},
  metal:{dance:.038,camera:.012,light:.032},
  pop:{dance:.027,camera:.021,light:.023},
  'hard-dance':{dance:.037,camera:.015,light:.036},
  electronic:{dance:.024,camera:.013,light:.026},
  acoustic:{dance:.013,camera:.010,light:.012},
  neutral:{dance:.012,camera:.009,light:.014},
};
/** Recognizes only explicit genre metadata, never artist/title words or inferred vocals. */
export function universalShowStyleV669(genre:string|null|undefined):UniversalShowStyleV669{
  const g=(genre??'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
  if(!g)return 'neutral';
  if(/^(deutschrap|hiphop|hip hop|rap|trap|drill|boombap|boom bap|rnb|r&b|soul)$/.test(g))return 'rap';
  if(/^(metal|industrial metal|ndh|neue deutsche härte|neue deutsche haerte|industrial rock)$/.test(g))return 'metal';
  if(/^(rock|deutschrock|hard rock|poprock|pop rock|indierock|indie rock|alternativerock|alternative rock|punkrock|punk rock)$/.test(g))return 'rock';
  if(/^(pop|indiepop|indie pop|electropop|electro pop|dancepop|dance pop|reggaeton|schlager)$/.test(g))return 'pop';
  if(/^(hardstyle|hardtekk|rawstyle|hardcore|uptempo|gabber|jumpstyle)$/.test(g))return 'hard-dance';
  if(/^(techno|hardtechno|hard techno|schranz|house|trance|psytrance|dnb|drum & bass|dubstep|synthwave|edm|electronic)$/.test(g))return 'electronic';
  if(/^(ambient|jazz|classical|klassik|ballad|ballade|acoustic|folk)$/.test(g))return 'acoustic';
  return 'neutral';
}
const off=(style:UniversalShowStyleV669):UniversalShowCueV669=>({
  active:false,style,evidence:'off',chapter:'unknown',motif:'none',dance:1,camera:1,lighting:1,
  reason:'Keine aktive automatische Bühnenregie',
});
/** A verified act is accepted only when the current V604 cue and V600 plan agree.
 * Without evidence we permit only a smooth whole-track contour, NEVER a fake hook/drop.
 */
export function planUniversalConcertV669(input:UniversalShowInputV669):UniversalShowCueV669{
  const style=universalShowStyleV669(input.genre);
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||!input.trackId||
    !Number.isFinite(input.durationMs)||input.durationMs<=0||!Number.isFinite(input.progressMs)||
    input.progressMs<0||input.progressMs>=input.durationMs)return off(style);
  const profile=styles[style];
  const plan=input.narrative?.plan,cue=input.narrative?.cue;
  const act=plan?.acts?.[cue?.act??-1];
  const verified=Boolean(plan&&cue&&act&&plan.source==='verified-v600'&&
    cue.active&&cue.source==='verified-v600'&&plan.trackId===input.trackId&&
    plan.durationMs===input.durationMs&&cue.act===act.index&&
    cue.chapter===act.chapter&&cue.motif===act.motif&&
    input.progressMs>=act.startMs&&input.progressMs<act.endMs&&
    Number.isFinite(cue.transition)&&cue.transition>=0&&cue.transition<=1);
  const progress=clamp(input.progressMs/input.durationMs,0,1);
  // The fallback has no discrete, periodically repeating cues and no section labels.
  const contour=smooth(Math.min(1,progress/.14))*smooth(Math.min(1,(1-progress)/.12));
  const signal=Number.isFinite(input.energy)?clamp(input.energy,0,1):0;
  const drive=verified?clamp(cue!.transition,0,1)*
    (act!.chapter==='respite'?-.62:act!.chapter==='payoff'?.86:act!.chapter==='rise'?.60:.32):
    (signal-.35)*.30*contour;
  const gain=input.tier==='balanced'?.65:1;
  const protect=input.lyricsProtected?.45:1;
  const intensity=drive*gain*protect;
  const scale=(bias:number,manual:boolean)=>manual?1:rounded(clamp(1+intensity*bias,.96,1.04));
  return {active:true,style,evidence:verified?'verified-section':'ambient-contour',
    chapter:verified?act!.chapter:'unconfirmed',motif:verified?act!.motif:'none',
    dance:scale(profile.dance,input.manualDance),camera:scale(profile.camera,input.manualCamera),
    lighting:scale(profile.light,input.manualLighting),
    reason:verified?`Verifizierter Abschnitt: ${act!.chapter} / ${act!.motif}`:
      'Zurückhaltende Songkontur; Songabschnitte nicht bestätigt'};
}
/** Apply only to V502 automatic gain lanes; never overwrite manual decisions or lyrics. */
export function coordinateUniversalConcertV669(base:ConcertDynamicsV502,cue:UniversalShowCueV669):ConcertDynamicsV502{
  if(!cue.active||!base.active)return base;
  return {...base,dance:rounded(clamp(base.dance*cue.dance,.88,1.12)),
    camera:rounded(clamp(base.camera*cue.camera,.88,1.12)),
    lighting:rounded(clamp(base.lighting*cue.lighting,.88,1.12))};
}
