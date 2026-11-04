/** V881 Live FX Deck. Uses *only* verified V763 stage intervals for automatic
 * visuals. Manual cues are explicitly user-triggered; there is no beat detector,
 * singer inference, audio processing, camera control or strobe. Pure & testable. */
export type LiveFxLookV881='none'|'cinema'|'neon'|'arena'|'aurora';
export type LiveFxManualV881='shockwave'|'sweep'|'confetti';
export type LiveFxStyleV881='auto'|'rap'|'hardtekk'|'rock'|'pop';
export interface LiveFxSettingsV881 {
 enabled:boolean; auto:boolean; intensity:number; style:LiveFxStyleV881; showHud:boolean;
}
export const LIVE_FX_KEY_V881='sonic-live-fx-deck-v881';
export const DEFAULT_LIVE_FX_V881:Readonly<LiveFxSettingsV881>={
 enabled:true,auto:true,intensity:55,style:'auto',showHud:true,
};
export interface LiveFxSceneV881 {
 index:number;startMs:number;endMs:number;section:string;intent:string;
}
export interface LiveFxTimelineV881 {
 trackId:string;durationMs:number;source:string;scenes:ReadonlyArray<LiveFxSceneV881>;
}
export interface LiveFxTriggerV881 {
 id:number;trackId:string;startMs:number;kind:LiveFxManualV881;
}
export interface LiveFxCueV881 {
 active:boolean;look:LiveFxLookV881;manual:LiveFxManualV881|null;
 manualId:number;sceneIndex:number;section:string;sceneSource:'verified'|'unavailable';
 intensity:number;manualProgress:number;
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const styles:readonly LiveFxStyleV881[]=['auto','rap','hardtekk','rock','pop'];
export function normalizeLiveFxSettingsV881(raw:unknown):LiveFxSettingsV881{
 const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<LiveFxSettingsV881>:{};
 return {
  enabled:typeof value.enabled==='boolean'?value.enabled:true,
  auto:typeof value.auto==='boolean'?value.auto:true,
  intensity:finite(value.intensity)?Math.round(clamp(value.intensity,0,100)):55,
  style:styles.includes(value.style as LiveFxStyleV881)?value.style as LiveFxStyleV881:'auto',
  showHud:typeof value.showHud==='boolean'?value.showHud:true,
 };
}
export function resolveLiveFxStyleV881(style:LiveFxStyleV881,genre:string):Exclude<LiveFxStyleV881,'auto'>{
 if(style!=='auto')return style;
 if(/hardtekk|hardstyle|hardcore|gabber|techno|rave/i.test(genre))return 'hardtekk';
 if(/deutschrock|rock|metal|industrial|ndh/i.test(genre))return 'rock';
 if(/deutschrap|hip[ -]?hop|rap|trap|drill|grime/i.test(genre))return 'rap';
 return 'pop';
}
export function selectLiveFxLookV881(scene:Pick<LiveFxSceneV881,'section'|'intent'>,style:Exclude<LiveFxStyleV881,'auto'>):LiveFxLookV881{
 // Quiet scenes remain quiet, even in a high-energy genre.
 if(scene.intent==='portrait'||scene.intent==='dialogue'||scene.intent==='breath'||scene.section==='break')return 'cinema';
 if(style==='hardtekk')return 'neon';
 if(style==='rock')return 'arena';
 if(style==='rap')return scene.section==='verse'?'cinema':scene.intent==='rise'?'neon':'arena';
 return scene.intent==='rise'||scene.section==='build'?'aurora':'arena';
}
/** Protect against stale, cross-track, incomplete or malformed scene data. */
export function verifiedLiveFxScenesV881(timeline:LiveFxTimelineV881|null|undefined,
 trackId:string,durationMs:number):readonly LiveFxSceneV881[] {
 if(!timeline||!trackId||timeline.trackId!==trackId||timeline.source!=='verified-v604'||
  !finite(durationMs)||durationMs<10000||durationMs>1800000||
  timeline.durationMs!==durationMs||!Array.isArray(timeline.scenes)||
  timeline.scenes.length<1||timeline.scenes.length>480)return [];
 let end=0;
 for(let i=0;i<timeline.scenes.length;i++){
  const s=timeline.scenes[i];
  if(s.index!==i||!finite(s.startMs)||!finite(s.endMs)||s.startMs<end||
   s.endMs<=s.startMs||s.endMs>durationMs||typeof s.section!=='string'||
   typeof s.intent!=='string')return [];
  end=s.endMs;
 }
 return timeline.scenes;
}
export function planLiveFxCueV881(input:{
 settings:LiveFxSettingsV881;trackId:string;genre:string;durationMs:number;
 progressMs:number;playing:boolean;reducedMotion:boolean;
 timeline?:LiveFxTimelineV881|null;trigger?:LiveFxTriggerV881|null;
}):LiveFxCueV881 {
 const off:LiveFxCueV881={active:false,look:'none',manual:null,manualId:0,
  sceneIndex:-1,section:'',sceneSource:'unavailable',intensity:0,manualProgress:0};
 const {settings,trackId,durationMs,progressMs,playing,reducedMotion}=input;
 if(!settings.enabled||!finite(settings.intensity)||settings.intensity<=0||
  settings.intensity>100||!playing||reducedMotion||!trackId||
  !finite(durationMs)||!finite(progressMs)||durationMs<=0||progressMs<0||
  progressMs>durationMs+1500)return off;
 const scenes=verifiedLiveFxScenesV881(input.timeline,trackId,durationMs);
 const scene=scenes.find(s=>s.startMs<=progressMs&&progressMs<s.endMs);
 const style=resolveLiveFxStyleV881(settings.style,input.genre);
 const look=settings.auto&&scene?selectLiveFxLookV881(scene,style):'none';
 const t=input.trigger;
 const manual= t&&t.trackId===trackId&&Number.isInteger(t.id)&&t.id>0&&
   finite(t.startMs)&&t.startMs>=0&&t.startMs<=durationMs&&
   ['shockwave','sweep','confetti'].includes(t.kind)&&
   progressMs>=t.startMs&&progressMs<t.startMs+6000?t.kind:null;
 const intensity=clamp(settings.intensity/100,0,1);
 return {active:look!=='none'||manual!==null,look,manual,manualId:manual?t!.id:0,
  sceneIndex:scene?.index??-1,section:scene?.section??'',
  sceneSource:scene?'verified':'unavailable',intensity,
  manualProgress:manual?clamp((progressMs-t!.startMs)/6000,0,1):0};
}
/** A portable, honest *visual suggestion* sheet, not an authored stage timeline. */
export function exportLiveFxSheetV881(input:{trackId:string;durationMs:number;genre:string;
 timeline:LiveFxTimelineV881|null|undefined;settings:LiveFxSettingsV881}):string|null {
 const scenes=verifiedLiveFxScenesV881(input.timeline,input.trackId,input.durationMs);
 if(!scenes.length)return null;
 const style=resolveLiveFxStyleV881(input.settings.style,input.genre);
 return JSON.stringify({schema:'sonic-live-fx-v881',version:1,
  source:'verified-v604-concert-timeline',note:'Visuelle Vorschläge – kein Audio-, Kamera- oder Beatnachweis.',
  trackId:input.trackId,durationMs:input.durationMs,
  settings:normalizeLiveFxSettingsV881(input.settings),scenes:scenes.map(s=>({
   index:s.index,startMs:s.startMs,endMs:s.endMs,section:s.section,intent:s.intent,
   look:selectLiveFxLookV881(s,style),
  }))},null,2);
}

/** Clear manual accents after a genuine seek or a track switch. Small playback
 * corrections (< 650 ms) are tolerated to avoid spurious resets on Spotify polls. */
export function resetManualLiveFxOnSeekV881(previous:{trackId:string;progressMs:number}|null,
 current:{trackId:string;progressMs:number}):boolean {
 if(!previous)return false;
 if(previous.trackId!==current.trackId||!finite(previous.progressMs)||
  !finite(current.progressMs))return true;
 return current.progressMs<previous.progressMs-650||current.progressMs-previous.progressMs>5000;
}
