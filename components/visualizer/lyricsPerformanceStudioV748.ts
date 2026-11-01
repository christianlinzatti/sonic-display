export type LyricLineV748 = {startMs:number;endMs:number|null;text:string;words?:Array<{text:string;startMs:number;endMs:number|null}>};
/** Mirror the conservative V477 timestamp checks without importing the full UI type graph. */
function verifiedLyricWordsV748(line:LyricLineV748, nextLineStart?:number):boolean {
  const words=line.words;
  if(!words?.length||!Number.isFinite(line.startMs))return false;
  const end=line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:
    nextLineStart!=null&&Number.isFinite(nextLineStart)&&nextLineStart>line.startMs?nextLineStart:undefined;
  let previous=line.startMs;
  for(const [i,word] of words.entries()){
    if(!word.text?.trim()||!Number.isFinite(word.startMs)||word.startMs<previous||
      (end!=null&&word.startMs>=end)||
      (word.endMs!=null&&(!Number.isFinite(word.endMs)||word.endMs<=word.startMs||(end!=null&&word.endMs>end)))||
      (i+1<words.length&&word.endMs!=null&&word.endMs>words[i+1].startMs))return false;
    previous=word.startMs;
  }
  return true;
}

/** V748 is presentation-only. It never guesses timestamps, alters lyrics text or camera poses. */
export interface LyricsPerformanceSettingsV748 {
  enabled: boolean;
  strength: number;
  readability: number;
  wordAccent: number;
  hookAccent: number;
}
export const DEFAULT_LYRICS_PERFORMANCE_V748: LyricsPerformanceSettingsV748 = {
  enabled: true, strength: 60, readability: 75, wordAccent: 60, hookAccent: 55,
};
const clamp = (n:number,min:number,max:number) => Number.isFinite(n) ? Math.max(min,Math.min(max,n)):min;
const smooth = (x:number) => {const n=clamp(x,0,1);return n*n*(3-2*n);};
export function normalizeLyricsPerformanceV748(value?:Partial<LyricsPerformanceSettingsV748>|null):LyricsPerformanceSettingsV748 {
  const v=value??{};
  return {enabled:typeof v.enabled==='boolean'?v.enabled:true,
    strength:clamp(v.strength??60,0,100),readability:clamp(v.readability??75,0,100),
    wordAccent:clamp(v.wordAccent??60,0,100),hookAccent:clamp(v.hookAccent??55,0,100)};
}
export type LyricsSectionV748 = 'intro'|'verse'|'hook'|'build'|'drop'|'break'|'outro'|'unknown';
export type LyricsPerformancePlanV748 = {
  enabled:boolean; active:boolean; verifiedWords:boolean; section:LyricsSectionV748; hook:boolean;
  plateOpacity:number; max3DWidth:number; maxWidthCh:number;
  outlineBonus:number; hookGlow:number; wordGlow:number; safety:'normal'|'crowded'|'dense'|'camera-focus';
};
export function planLyricsPerformanceV748(input:{
  line?:LyricLineV748|null;nextLineStart?:number;progressMs:number;playing:boolean;
  synchronized:boolean;reducedMotion:boolean;wordHighlight:boolean;
  immersive:boolean;avatarCount:number;section?:string;cameraFocus?:boolean;
  existingPlateOpacity?:number;existing3DWidth?:number;existingWidthCh?:number;
  settings?:Partial<LyricsPerformanceSettingsV748>|null;
}):LyricsPerformancePlanV748 {
  const s=normalizeLyricsPerformanceV748(input.settings);
  const text=input.line?.text??'';
  const density=[...text].length;
  const crowded=input.immersive && input.avatarCount>=3;
  const dense=density>(input.immersive?55:85);
  const focus=!!input.cameraFocus && input.immersive;
  const safety=focus?'camera-focus':crowded?'crowded':dense?'dense':'normal';
  const section:LyricsSectionV748 = ['intro','verse','hook','build','drop','break','outro'].includes(input.section??'')
    ? input.section as LyricsSectionV748 : 'unknown';
  const line=input.line;
  const ends=[line?.endMs,input.nextLineStart].filter((n):n is number=>typeof n==='number'&&Number.isFinite(n)&&!!line&&n>line.startMs);
  const end=line ? ends.length?Math.min(...ends):line.startMs+8000 : 0;
  const active=!!(s.enabled && line && text.trim() && input.synchronized && input.playing &&
    Number.isFinite(input.progressMs) && Number.isFinite(line.startMs) &&
    input.progressMs>=line.startMs && input.progressMs<end);
  const verifiedWords=!!(active && input.wordHighlight && line && verifiedLyricWordsV748(line,input.nextLineStart));
  const hook=!!(active && (section==='hook'||section==='drop'));
  const gain=s.strength/100;
  const reading=s.enabled?s.readability/100:0;
  const plateFloor=input.immersive ? .72 + reading*(focus?.20:crowded?.16:dense?.14:.08) : .10+reading*(dense?.17:.08);
  const widthLimit=input.immersive ? focus?2.05:crowded?2.12:dense?2.20:2.65 : 2.7;
  const widthChars=focus?36:crowded?38:dense?44:64;
  const glowActive=active && !input.reducedMotion && gain>0;
  const wordGlow=glowActive && verifiedWords ? clamp(gain*s.wordAccent/100*(focus?.45:1),0,1)*.065 : 0;
  const hookGlow=glowActive && hook ? clamp(gain*s.hookAccent/100*(focus?.45:.9),0,1)*.065 : 0;
  return {enabled:s.enabled,active,verifiedWords,section,hook,safety,
    plateOpacity:clamp(Math.max(clamp(input.existingPlateOpacity??0,0,1),s.enabled?plateFloor:0),0,.98),
    max3DWidth:Math.min(clamp(input.existing3DWidth??2.7,.8,3.4),s.enabled?widthLimit:3.4),
    maxWidthCh:Math.min(clamp(input.existingWidthCh??64,20,90),s.enabled?widthChars:90),
    outlineBonus:input.reducedMotion?0:reading*(focus?.007:.004),hookGlow,wordGlow};
}
/** Envelope for a genuinely timed word only. A paused or unsynchronized track never pulses. */
export function lyricWordAccentV748(input:{line:LyricLineV748;nextLineStart?:number;wordIndex:number;
  progressMs:number;playing:boolean;reducedMotion:boolean;plan:LyricsPerformancePlanV748;}):number {
  const {plan,line,wordIndex,progressMs}=input;
  if(!plan.active||!plan.verifiedWords||input.reducedMotion||!input.playing||
    !Number.isFinite(progressMs)||!Number.isInteger(wordIndex)||wordIndex<0)return 0;
  const w=line.words?.[wordIndex];if(!w)return 0;
  const ends=[w.endMs,line.words?.[wordIndex+1]?.startMs,line.endMs,input.nextLineStart]
    .filter((n):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>w.startMs);
  if(!ends.length)return 0;
  const end=Math.min(...ends);
  if(progressMs<w.startMs||progressMs>=end)return 0;
  const attack=Math.max(15,Math.min(85,(end-w.startMs)*.3));
  const release=Math.max(25,Math.min(110,(end-w.startMs)*.4));
  return smooth((progressMs-w.startMs)/attack)*smooth((end-progressMs)/release);
}
