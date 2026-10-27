import type { Lyrics } from '@/types/music';
import type { ConcertSceneV528 } from './cinematicConcertCoordinationV528';

/** V555: all cues are derived from verified playback/authoring data, never guessed singer identities. */
export type ConcertDetailSettingsV555 = {
  enabled: boolean; gobo: boolean; pixelWall: boolean; floorFog: boolean;
  duetArc: boolean; adlibEcho: boolean; hookProjection: boolean; rhymeAccent: boolean;
  strength: number; avatarLight?:boolean; avatarLightStrength?:number; portraitLight?:boolean; portraitWarmth?:number; beatPortraitLight?:boolean; beatPortraitStrength?:number; cinematicFaceLightV566?:boolean; cinematicFaceStrengthV566?:number;
};
export const DEFAULT_CONCERT_DETAILS_V555: Readonly<ConcertDetailSettingsV555> = Object.freeze({
  enabled:true,gobo:true,pixelWall:true,floorFog:true,duetArc:true,
  adlibEcho:true,hookProjection:true,rhymeAccent:true,strength:45,avatarLight:true,avatarLightStrength:55,portraitLight:true,portraitWarmth:52,beatPortraitLight:true,beatPortraitStrength:45,cinematicFaceLightV566:true,cinematicFaceStrengthV566:50,
});
export type ConcertDetailsCueV555 = {
  hook:boolean; density:number; backdropOpacity:number; projectedWord:string;
  /** V578: stable shader pattern per verified current lyric line, not a new GPU pass. */
  pattern?:0|1|2;
  adlib:string;adlibOpacity:number;rhymeWord:string;rhymeColor:string|null;
  arcSlots:[number,number]|null;arcOpacity:number;
};
const clamp=(x:number,min=0,max=1)=>Number.isFinite(x)?Math.min(max,Math.max(min,x)):min;
const token=(x:string)=>x.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'').toLocaleLowerCase('de');
export function rhymeAccentV555(lyrics:Lyrics|null|undefined,index:number):{word:string;color:string}|null{
  if(!lyrics||index<1||index>=lyrics.lines.length)return null;
  const last=(text:string)=>token(text.trim().split(/\s+/).pop()??'');
  const current=last(lyrics.lines[index].text);
  if(current.length<4)return null;
  // Conservative graphic echo, *not* phonetic rhyme detection.
  for(let i=Math.max(0,index-4);i<index;i++){
    const other=last(lyrics.lines[i].text);
    if(other.length>=4&&current!==other&&current.slice(-3)===other.slice(-3)){
      const colors=['#83e4ff','#f29cfd','#ffd481'];
      const hash=[...current.slice(-3)].reduce((n,c)=>n+c.charCodeAt(0),0);
      return {word:current,color:colors[hash%colors.length]};
    }
  }
  return null;
}
export function splitRhymeEndV555(text:string,word:string):{before:string;match:string;after:string}|null{
  if(!word)return null;
  const match=text.match(/^(.*?)([\p{L}\p{N}]+)([^\p{L}\p{N}]*)$/u);
  if(!match||token(match[2])!==word)return null;
  return {before:match[1],match:match[2],after:match[3]};
}
export function planConcertDetailsV555(input:{
  lyrics?:Lyrics|null;progressMs:number;activeIndex:number;playing:boolean;reducedMotion:boolean;
  section?:string|null;scene?:ConcertSceneV528|null;count?:number;
  settings?:Partial<ConcertDetailSettingsV555>;
}):ConcertDetailsCueV555{
  const off:ConcertDetailsCueV555={hook:false,density:0,backdropOpacity:0,projectedWord:'',adlib:'',adlibOpacity:0,
    rhymeWord:'',rhymeColor:null,arcSlots:null,arcOpacity:0};
  const {lyrics,progressMs:now,activeIndex:index,playing,reducedMotion}=input;
  const opts={...DEFAULT_CONCERT_DETAILS_V555,...input.settings};
  if(!opts.enabled||!playing||!Number.isFinite(now)||index<0)return off;
  const line=lyrics?.lines[index];
  if(!line||!line.text?.trim()||!Number.isFinite(line.startMs)||now<line.startMs)return off;
  const end=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
    lyrics?.lines[index+1]?.startMs??Infinity,line.startMs+14000);
  if(now>=end)return off;
  const elapsed=now-line.startMs;
  const envelope=clamp(elapsed/250)*clamp((end-now)/350);
  const duration=Math.max(100,end-line.startMs);
  const density=clamp((line.text.trim().split(/\s+/).length/duration)*500,0,1);
  const hook=input.section==='hook'||input.scene?.active===true&&input.scene.focus==='ensemble';
  const intensity=clamp(opts.strength/100)*envelope;
  const words=line.words?.filter(w=>Number.isFinite(w.startMs)&&w.startMs<=now&&(w.endMs??w.startMs+450)>now)??[];
  // A decorative, short hook token; not a new caption or replacement for primary lyrics.
  const currentWord=words[0]?.text??line.text.trim().split(/\s+/)[0]??'';
  const projectedWord=opts.hookProjection&&hook&&!reducedMotion&&density<.8?
    token(currentWord).slice(0,18).toLocaleUpperCase('de'):'';
  // Explicit markup in lyrics: [adlib:Hey] or (Hey) / (Yeah). No unsourced adlibs.
  const marker=line.text.match(/\[adlib:([^\]\n]{1,24})\]/i)||line.text.match(/\((hey|yeah|yo|uh|ey|ah)\)/i);
  const adlib=opts.adlibEcho&&!reducedMotion&&marker&&elapsed<1100?marker[1].trim().slice(0,24):'';
  const scene=input.scene;
  const n=input.count??scene?.count??1;
  const arcSlots: [number,number]|null=opts.duetArc&&!reducedMotion&&scene?.active&&scene.handoffFrom!==null&&
    scene.handoffFrom!==scene.leadSlot&&scene.count===n&&n>=2&&
    scene.handoffFrom>=0&&scene.handoffFrom<n&&scene.leadSlot>=0&&scene.leadSlot<n&&
    now-scene.cueStartMs<950 ? [scene.handoffFrom,scene.leadSlot] : null;
  const rhyme=opts.rhymeAccent?rhymeAccentV555(lyrics,index):null;
  return {
    pattern:(index%3) as 0|1|2,
    hook,density,backdropOpacity:intensity*(density>.7?.35:1),projectedWord,adlib:adlib??'',
    adlibOpacity:adlib?intensity*(1-clamp(elapsed/1100)):0,
    rhymeWord:rhyme?.word??'',rhymeColor:rhyme?.color??null,
    arcSlots,arcOpacity:arcSlots?intensity*clamp((950-(now-scene!.cueStartMs))/400):0,
  };
}
