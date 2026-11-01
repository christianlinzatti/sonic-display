/** V793 — evidence-bound light choreography for the EXISTING stage rig.
 * Shares V761's verified scene/act and playback clock; never infers beats,
 * performers, or adds a lamp, shadow map, render pass or animation timer.
 */
export type LightPatternV793='rest'|'portrait'|'fan'|'cross'|'rise'|'wave';
export interface LightChoreographyCueV793 {
  readonly active:boolean;readonly sceneIndex:number;readonly pattern:LightPatternV793;
  readonly sweep:number;readonly tilt:number;readonly beamGain:number;
  readonly chase:number;readonly depth:number;
}
export const LIGHT_CHOREOGRAPHY_OFF_V793:Readonly<LightChoreographyCueV793>=Object.freeze({
  active:false,sceneIndex:-1,pattern:'rest',sweep:0,tilt:0,beamGain:1,chase:0,depth:0,
});
export interface LightChoreographyInputV793 {
  trackId:string;durationMs:number;positionMs:number;
  playing:boolean;reactive:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  authored:boolean;blackout:boolean;lyricsProtected:boolean;vocalFocus:boolean;
  genre?:string|null;energy:number;kick:number;
  scene?:{active:boolean;reason:string;sceneIndex:number;actIndex:number;intent:string|null;blend:number}|null;
  narrative?:{plan:{source:string;trackId:string;durationMs:number;acts:readonly {
    index:number;startMs:number;endMs:number;section:string;
  }[]};cue:{active:boolean;source:string;act:number}}|null;
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
const round=(x:number)=>Math.round(x*100000)/100000;
/** Fail closed when the soundtrack or V604/V761 evidence is not coherent. */
export function planAdvancedLightChoreographyV793(input:LightChoreographyInputV793):LightChoreographyCueV793 {
  const n=input.narrative,s=input.scene;
  if(!input.playing||!input.reactive||input.reducedMotion||input.tier==='low'||
    input.authored||input.blackout||!n||!s?.active||s.reason!=='verified-act'||
    !input.trackId||!finite(input.durationMs)||input.durationMs<=0||
    !finite(input.positionMs)||input.positionMs<0||input.positionMs>=input.durationMs||
    !finite(input.energy)||input.energy<0||input.energy>1||
    !finite(input.kick)||input.kick<0||input.kick>1||
    !Number.isInteger(s.sceneIndex)||s.sceneIndex<0||s.sceneIndex>500||
    !Number.isInteger(s.actIndex)||s.actIndex<0||!finite(s.blend)||s.blend<=0||s.blend>1||
    !n.cue.active||n.cue.source!=='verified-v600'||n.plan.source!=='verified-v600'||
    n.plan.trackId!==input.trackId||n.plan.durationMs!==input.durationMs||
    n.cue.act!==s.actIndex||s.actIndex>=n.plan.acts.length)return LIGHT_CHOREOGRAPHY_OFF_V793;
  const a=n.plan.acts[s.actIndex];
  if(!a||a.index!==s.actIndex||!finite(a.startMs)||!finite(a.endMs)||
    a.endMs-a.startMs<2600||input.positionMs<a.startMs||input.positionMs>=a.endMs)return LIGHT_CHOREOGRAPHY_OFF_V793;
  const kind=a.section;
  // A readable dialogue/verse gets gentle portrait lighting, not a rave chase.
  const validIntents:Record<string,readonly string[]>={
    verse:['portrait','dialogue','ensemble'],hook:['wide','ensemble','dialogue'],
    build:['rise','portrait','wide'],drop:['pulse','wide','ensemble'],
    break:['breath','wide','portrait'],
  };
  if(!validIntents[kind]?.includes(s.intent??''))return LIGHT_CHOREOGRAPHY_OFF_V793;
  const isHard=/hardstyle|hardtekk|hardtek|rawstyle/i.test(input.genre??'');
  const isRock=/rock|metal|industrial|ndh/i.test(input.genre??'');
  const energy=clamp(input.energy),kick=clamp(input.kick);
  const genreScale=isHard?1:isRock?.82:/pop/i.test(input.genre??'')?.57:.68;
  const sectionScale=kind==='drop'?1:kind==='hook'?.80:kind==='build'?.60:
    kind==='break'?.17:.35;
  const lyricsScale=input.lyricsProtected?.22:1;
  const focusScale=input.vocalFocus?.36:1;
  const tierScale=input.tier==='balanced'?.52:1;
  const amount=s.blend*sectionScale*genreScale*lyricsScale*focusScale*tierScale;
  // Slow continuous movement driven by *playback time*, not a fabricated beat-grid.
  // Only an actual energy + kick sample may increase the motion amplitude.
  const movement=kind==='break'?0:clamp((.35+.40*energy+.25*kick)*amount,0,.8);
  const t=input.positionMs/((isHard?1120:isRock?1560:2070));
  const direction=(s.sceneIndex%2===0?1:-1);
  const wave=Math.sin(t+direction*s.sceneIndex*.71);
  const pattern:LightPatternV793=kind==='break'?'rest':s.intent==='portrait'||s.intent==='dialogue'?'portrait':
    kind==='build'?'rise':kind==='drop'?'cross':kind==='hook'?'fan':'wave';
  // Small steering offsets are applied AFTER the existing validated singer focus.
  // No strobe or abrupt beam changes; envelope s.blend fades at scene borders.
  const sweep=round(clamp(direction*wave*movement*(pattern==='portrait'?.28:1)*.74,-.52,.52));
  const tilt=round(clamp(Math.cos(t*.71+s.sceneIndex*.39)*movement*.22,-.16,.16));
  const actualKick=kick>.28&&energy>.25?kick*energy:0;
  const beamGain=round(clamp(1+actualKick*amount*.055,1,1.055));
  // A graded, asymmetric chase for the already-instanced backdrop. Never flash.
  const chase=round(t+s.sceneIndex*.72);
  const depth=round(clamp(amount*(.40+.60*energy),0,.7));
  return {active:true,sceneIndex:s.sceneIndex,pattern,sweep,tilt,beamGain,chase,depth};
}
