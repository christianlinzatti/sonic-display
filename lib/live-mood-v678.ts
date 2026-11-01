/** V678. Acoustic energy / texture heuristics from *measured microphone* data only.
 * No Spotify audio-features API, speech emotion inference or psychological assessment.
 * Deterministic, bounded and deliberately conservative; lyrics/camera/timelines stay outside this API. */
export type LiveMoodV678='calm'|'atmospheric'|'driving'|'intense';
export type MoodSampleV678={volume:number;energyEnvelope:number;bass:number;highs:number;beatStrength:number;attack:number};
export type TimedMoodSampleV678=MoodSampleV678&{atMs:number};
export type LiveMoodStateV678={trackId:string;samples:TimedMoodSampleV678[];mood:LiveMoodV678|null;candidate:LiveMoodV678|null;streak:number;changedAtMs:number};
export const EMPTY_LIVE_MOOD_V678:LiveMoodStateV678={trackId:'',samples:[],mood:null,candidate:null,streak:0,changedAtMs:0};
const clamp=(x:number,lo=0,hi=1)=>Number.isFinite(x)?Math.max(lo,Math.min(hi,x)):lo;
export function safeMoodSampleV678(s:MoodSampleV678):MoodSampleV678{
 return {volume:clamp(s.volume),energyEnvelope:clamp(s.energyEnvelope),bass:clamp(s.bass),highs:clamp(s.highs),beatStrength:clamp(s.beatStrength),attack:clamp(s.attack)};
}
export function classifyAcousticMoodV678(samples:ReadonlyArray<MoodSampleV678>):LiveMoodV678|null{
 if(samples.length<8)return null;
 let volume=0,energy=0,bass=0,highs=0,beats=0,attack=0;
 for(const input of samples){const s=safeMoodSampleV678(input);volume+=s.volume;energy+=s.energyEnvelope;bass+=s.bass;highs+=s.highs;beats+=s.beatStrength;attack+=s.attack;}
 const n=samples.length;volume/=n;energy/=n;bass/=n;highs/=n;beats/=n;attack/=n;
 // A permitted microphone that hears only silence is not evidence of a calm song.
 if(volume<.025&&energy<.04)return null;
 const drive=volume*.48+energy*.52;
 // Texture != emotion: 'atmospheric' means less percussive, 'intense' means high acoustic impact.
 if(drive<.205&&beats<.25)return 'calm';
 if(drive>=.52&&(bass*.4+beats*.4+attack*.2)>.43)return 'intense';
 if(drive>=.335||beats>.48)return 'driving';
 if(highs>volume*.95||beats<.25)return 'atmospheric';
 return 'calm';
}
/** 4s bounded window; rejects out-of-order frames and clears stale evidence (>2s).
 * Mood changes only after 5 consecutive candidate windows and at least 1.5s since last change. */
export function advanceLiveMoodV678(state:LiveMoodStateV678,trackId:string,atMs:number,sample:MoodSampleV678,available:boolean):LiveMoodStateV678{
 if(!available||!trackId||!Number.isFinite(atMs))return {...EMPTY_LIVE_MOOD_V678};
 if(state.trackId===trackId&&state.samples.length&&atMs<=state.samples[state.samples.length-1].atMs)return state;
 const fresh=state.trackId===trackId&&state.samples.length>0&&atMs-state.samples[state.samples.length-1].atMs<=2000;
 const prev=fresh?state:{...EMPTY_LIVE_MOOD_V678,trackId};
 if(fresh&&atMs<=prev.samples[prev.samples.length-1].atMs)return prev;
 const samples=[...prev.samples.filter(s=>atMs-s.atMs<=4000).slice(-39),{...safeMoodSampleV678(sample),atMs}];
 const classified=classifyAcousticMoodV678(samples);
 if(!classified)return {...prev,samples,mood:null,candidate:null,streak:0};
 if(classified===prev.mood)return {...prev,samples,candidate:null,streak:0};
 const streak=prev.candidate===classified?prev.streak+1:1;
 if(streak>=5&&(prev.changedAtMs===0||atMs-prev.changedAtMs>=1500))return {trackId,samples,mood:classified,candidate:null,streak:0,changedAtMs:atMs};
 return {...prev,samples,candidate:classified,streak};
}
export const MOOD_LABELS_V678:Record<LiveMoodV678,{label:string;description:string}>={
 calm:{label:'Ruhig',description:'Geringe gemessene Lautheit und wenig Schlagimpulse'},
 atmospheric:{label:'Atmosphärisch',description:'Weichere, weniger perkussive Klangstruktur'},
 driving:{label:'Treibend',description:'Mehr Energie oder deutliches Rhythmusmuster'},
 intense:{label:'Druckvoll',description:'Hohe Energie und kräftige Schlagimpulse'},
};
export type MoodStageCueV678={lightDelta:number;danceFactor:number;aggressionDelta:number;atmosphere:'soft'|'floating'|'pulse'|'impact'};
/** Subtle relative modulation only: +-8 light percentage points, <=8% dance intensity.
 * No scene/theme, camera, lyric, vocal assignment or manual preference writes. */
export function moodStageCueV678(mood:LiveMoodV678|null,strength:number,active:boolean):MoodStageCueV678{
 const zero:MoodStageCueV678={lightDelta:0,danceFactor:1,aggressionDelta:0,atmosphere:'soft'};
 if(!active||!mood)return zero;
 const gain=clamp(strength,0,100)/100;
 const cues:Record<LiveMoodV678,[number,number,number,MoodStageCueV678['atmosphere']]>= {
  calm:[-8,-.07,-.06,'soft'],atmospheric:[-3,-.025,-.02,'floating'],driving:[4,.04,.025,'pulse'],intense:[8,.08,.045,'impact']
 };
 const [light,dance,aggression,atmosphere]=cues[mood];
 return {lightDelta:Math.round(light*gain),danceFactor:1+dance*gain,aggressionDelta:aggression*gain,atmosphere};
}
export function modulateMoodLightV678(base:number,cue:MoodStageCueV678):number{return cue.lightDelta===0?base:Math.round(clamp(base+cue.lightDelta,0,100));}
export function modulateMoodDanceV678(base:number,cue:MoodStageCueV678):number{return cue.danceFactor===1?base:Math.max(0,Math.min(1.5,base*cue.danceFactor));}
