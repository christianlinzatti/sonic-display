/** V755 Smart Quality Auto-Tuning: strictly opt-in, measured, bounded and reversible.
 * Pure controller. Receives only existing ~1Hz V466 measurement windows; no new
 * render loop, timers, GPU queries, avatar changes or persistent user settings.
 */
export interface QualityProbeV755 {
  at:number;metricsAt?:number|null;fps:number|null;frameMs:number|null;
  p95FrameMs:number|null;samples:number;qualityTier:string;
  renderWidthPx?:number|null;renderHeightPx?:number|null;
  avatars:readonly {slot:number;loaded?:boolean}[];
}
export type VisualStatusV755='ok'|'attention'|'critical'|'unavailable';
export interface TuneInputV755 {
  enabled:boolean;playing:boolean;reducedMotion:boolean;avatarStage:boolean;
  trackId:string;expectedAvatars:number;visual:VisualStatusV755;
  probe:QualityProbeV755;now:number;
}
export type TuneStateV755 = {
  level:0|1|2|3;bad:number;good:number;
  sampleAt:number;lastAt:number;changedAt:number;trackId:string;environment:string;
  visual:VisualStatusV755;
  reason:'off'|'waiting'|'stable'|'slow'|'recovering';
};
export const INITIAL_TUNE_V755:Readonly<TuneStateV755>={
  level:0,bad:0,good:0,sampleAt:0,lastAt:0,changedAt:0,trackId:'',
  environment:'',visual:'unavailable',reason:'off',
};
export const TUNE_TTL_MS_V755=3500;
export const TUNE_MIN_HOLD_MS_V755=8000;
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const whole=(n:unknown)=>finite(n)&&Number.isSafeInteger(n);
function validSample(input:TuneInputV755):boolean {
  const p=input.probe;
  if(!input.enabled||!input.playing||input.reducedMotion||!input.avatarStage||
    !input.trackId.trim()||!whole(input.now)||input.now<=0||
    !Number.isInteger(input.expectedAvatars)||input.expectedAvatars<1||input.expectedAvatars>4||
    !whole(p.at)||p.at<=0||p.at>input.now+500||input.now-p.at>TUNE_TTL_MS_V755||
    !whole(p.metricsAt)||!(p.metricsAt! > 0)||p.metricsAt! > p.at+500||p.at-p.metricsAt! > 2500||
    !finite(p.fps)||p.fps<=0||p.fps>240||!finite(p.frameMs)||p.frameMs<=0||p.frameMs>1000||
    !finite(p.p95FrameMs)||p.p95FrameMs<=0||p.p95FrameMs>2000||
    p.p95FrameMs<p.frameMs*.60||!whole(p.samples)||p.samples<10||
    !whole(p.renderWidthPx)||p.renderWidthPx! <= 0||
    !whole(p.renderHeightPx)||p.renderHeightPx! <= 0||
    !['low','balanced','high'].includes(p.qualityTier)||
    !Array.isArray(p.avatars)||p.avatars.length!==input.expectedAvatars||
    new Set(p.avatars.map(a=>a.slot)).size!==p.avatars.length||
    p.avatars.some(a=>!Number.isInteger(a.slot)||a.slot<0||a.slot>=input.expectedAvatars||a.loaded!==true))return false;
  return true;
}
const env=(p:QualityProbeV755)=>`${p.qualityTier}:${p.renderWidthPx}x${p.renderHeightPx}:${p.avatars.length}`;
/** Reset immediately on stale/disabled/missing evidence. Distinct metric timestamps
 * and monotonic probe times prohibit replayed samples and accidental fast ramps. */
export function advanceQualityTuneV755(previous:TuneStateV755,input:TuneInputV755):TuneStateV755 {
  if(!validSample(input))return {...INITIAL_TUNE_V755,
    reason:input.enabled?'waiting':'off'};
  const p=input.probe;
  const environment=env(p);
  if(previous.trackId!==input.trackId||previous.environment!==environment||
     p.at-previous.lastAt>4000){
    return {...INITIAL_TUNE_V755,trackId:input.trackId,environment,
      sampleAt:p.metricsAt!,lastAt:p.at,changedAt:p.at,
      visual:input.visual,reason:'waiting'};
  }
  if(p.at<=previous.lastAt||p.metricsAt! <= previous.sampleAt)return previous;
  // Measurements are already real 1Hz windows. A bad result must recur.
  const slow=(p.fps! < 48&&p.p95FrameMs! > 22.5)||p.fps! < 40||p.p95FrameMs! > 31;
  const good=p.fps! >= 56&&p.p95FrameMs! <= 20&&p.frameMs! <= 19.5;
  const bad=slow?Math.min(5,previous.bad+1):0;
  const stable=good?Math.min(8,previous.good+1):0;
  let level=previous.level;
  let changedAt=previous.changedAt;
  let reason:TuneStateV755['reason']=slow?'slow':level?'recovering':'stable';
  if(slow&&bad>=3&&p.at-changedAt>=3000&&level<3){
    level=(level+1) as TuneStateV755['level'];changedAt=p.at;reason='slow';
    return {level,bad:0,good:0,sampleAt:p.metricsAt!,lastAt:p.at,changedAt,
      trackId:input.trackId,environment,visual:input.visual,reason};
  }
  if(good&&stable>=5&&level>0&&p.at-changedAt>=TUNE_MIN_HOLD_MS_V755){
    level=(level-1) as TuneStateV755['level'];changedAt=p.at;
    return {level,bad:0,good:0,sampleAt:p.metricsAt!,lastAt:p.at,changedAt,
      trackId:input.trackId,environment,visual:input.visual,reason:level?'recovering':'stable'};
  }
  return {level,bad,good:stable,sampleAt:p.metricsAt!,lastAt:p.at,changedAt,
    trackId:input.trackId,environment,visual:input.visual,reason};
}
export interface TuneFactorsV755 {
 active:boolean;level:0|1|2|3; camera:number;lighting:number;
 dance:number;vocal:number;lyricsAccent:number; visualGuard:boolean;
}
export const NEUTRAL_TUNE_FACTORS_V755:Readonly<TuneFactorsV755>={
 active:false,level:0,camera:1,lighting:1,dance:1,vocal:1,lyricsAccent:1,visualGuard:false,
};
/** These multipliers affect only V750's automatic *additive* profiles.
 * At max level, camera and light accents attenuate before body motion. */
export function effectiveQualityTuneV755(state:TuneStateV755,input:Pick<TuneInputV755,
 'enabled'|'playing'|'reducedMotion'|'avatarStage'|'trackId'|'now'>):TuneFactorsV755 {
 if(!input.enabled||!input.playing||input.reducedMotion||!input.avatarStage||
    !input.trackId||state.trackId!==input.trackId||state.lastAt<=0||
    !finite(input.now)||input.now<state.lastAt-500||input.now-state.lastAt>TUNE_TTL_MS_V755)
     return {...NEUTRAL_TUNE_FACTORS_V755};
 const visualGuard=state.visual==='critical'||state.visual==='attention';
 const level=state.level;
 const camera=Math.max(.52,1-.15*level-(visualGuard?.07:0));
 const lighting=Math.max(.46,1-.17*level-(visualGuard?.05:0));
 return {active:level>0||visualGuard,level,camera,lighting,
   dance:Math.max(.78,1-.065*level),vocal:Math.max(.94,1-.02*level),
   lyricsAccent:Math.max(.64,1-.11*level),visualGuard};
}
/** Never turn a disabled effect on. Never raise a user's manually set strength. */
export function applyTuneMultiplierV755(base:number,amount:number):number{
 if(!finite(base)||!finite(amount))return 0;
 return Math.round(Math.max(0,Math.min(1,base))*Math.max(0,Math.min(1,amount))*10000)/10000;
}
