/**
 * V546 – limited, deterministic, spelled-word articulation on the existing 3D face.
 * This is NOT recovered phonemes, acoustic alignment or automatic singer assignment.
 * V384/V415 consonant contacts, V420 edited words, V423 audio mouth and all
 * manually directed facial animation retain priority over this optional layer.
 */
import type {FacialPoseV369} from './facialPerformanceV369';
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const smooth=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const normalize=(v:string)=>v.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const spelling=(v:string)=>v.toLocaleLowerCase('de-DE').replace(/^[^\p{L}]+/gu,'');
const isBilabial=(v:string)=>/^[bmp]/u.test(spelling(v));
const firstVowel=(v:string)=>spelling(v).match(/[aeiouäöü]/u)?.[0]??'';

export type RapArticulationKindV546='bilabial-onset'|'word-bridge'|'phrase-accent'|'none';
export type RapArticulationResultV546<T>={frame:T;active:boolean;kind:RapArticulationKindV546;
  /** A grapheme cue, never a measured phoneme. */source:'written-word'|'none'};

/** No persistent state; pauses, seeks and changes in singer assignment cannot leak a prior word. */
export function refineAdvancedRapArticulationV546<T extends {face:FacialPoseV369}>(
 base:T,options:DeutschrapFaceOptionsV538,
):RapArticulationResultV546<T>{
 const off:RapArticulationResultV546<T>={frame:base,active:false,kind:'none',source:'none'};
 if(!options.enabled||!options.playing||!options.rap||!options.verifiedWord||
    !options.roleAllowed||options.manualPriority||options.manualSilent||options.preserveAudioMouth||
    options.reducedMotion||!options.lyrics?.synced||!options.activeWord||
    !Number.isFinite(options.effectiveTimeMs)||options.effectiveTimeMs<0||
    !Number.isFinite(options.intensity)||options.intensity<=0)return off;
 const mark=rapLipWordAtV415(options.lyrics,options.effectiveTimeMs);
 if(!mark||normalize(mark.word.text)!==normalize(options.activeWord))return off;
 if(options.editedWords?.some(w=>w.startMs===mark.start&&normalize(w.text)===normalize(mark.word.text)))return off;
 const duration=mark.end-mark.start;
 // Longer words and line-only lyrics are deliberately not treated as syllable timing.
 if(duration<95||duration>650)return off;
 if(!Object.values(base.face).every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1))return off;
 const elapsed=options.effectiveTimeMs-mark.start;
 const phase=clamp(elapsed/duration);
 const gain=clamp(options.intensity/100);
 const face={...base.face};
 let kind:RapArticulationKindV546='none';

 // For a *written* B/P/M onset, briefly support an existing closure if necessary.
 // The authored V384/V415 seal wins (max); the new cue never lowers it.
 if(isBilabial(mark.word.text)){
   const onsetMs=Math.max(30,Math.min(78,duration*.27));
   const onset=1-smooth(elapsed/onsetMs);
   const extraSeal=Math.min(.55,gain*.55)*onset;
   if(extraSeal>.004&&extraSeal>face.lipsClosed){
     face.lipsClosed=clamp(extraSeal);
     face.jaw=clamp(Math.min(face.jaw*(1-extraSeal*.76),1-face.lipsClosed*.985));
     face.wide=clamp(face.wide*(1-extraSeal*.30));
     face.round=clamp(face.round*(1-extraSeal*.25));
     kind='bilabial-onset';
   }
 }

 // A restrained VISUAL coarticulation near the END of a timed word. Never
 // bridge over a gap or anticipate the following B/P/M closure.
 const nearNext=mark.next&&mark.nextGap>=0&&mark.nextGap<=90&&
   !isBilabial(mark.next.text)&&!isBilabial(mark.word.text)&&duration<=480;
 if(nearNext&&mark.next){
   const vowel=firstVowel(mark.next.text);
   const round=/[oöuü]/u.test(vowel)?1:0;
   const wide=/[aeiä]/u.test(vowel)?1:0;
   const bridge=smooth((phase-.68)/.32)*gain*.055*(1-face.lipsClosed);
   if(vowel&&bridge>.00001){
     face.round=clamp(face.round*(1-bridge)+round*bridge);
     face.wide=clamp((face.wide*(1-bridge)+wide*bridge)*(1-face.round*.04*bridge));
     kind='word-bridge';
   }
 }
 // Small punctuation emphasis on the EXISTING word, never a separate vocal cue.
 if(kind==='none'&&/[!?]$/.test(mark.word.text)&&phase>.52){
   const accent=smooth((phase-.52)/.25)*smooth((1-phase)/.12)*gain*.008;
   if(accent>.00001){
     face.brow=clamp(face.brow+accent);
     face.cheek=clamp(face.cheek+accent*.55);
     kind='phrase-accent';
   }
 }
 if(kind==='none')return off;
 // Do not change V384/V415 closure, or blink/smile/emotion authored by other rigs.
 face.lipsClosed=Math.max(base.face.lipsClosed,face.lipsClosed);
 face.jaw=Math.min(face.jaw,1-face.lipsClosed*.985);
 return {frame:{...base,face},active:true,kind,source:'written-word'};
}
