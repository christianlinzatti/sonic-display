/** V976 – Intelligent Concert Transitions.
 * Deterministic cross-section choreography for the EXISTING virtual stage and
 * automatic V354 camera cue. No extra render loop, network access, timers,
 * Spotify control, physical Govee control, new meshes, or speculative sections.
 * V318 and V960 supply contiguous high-confidence current/previous scenes.
 */
import type {ConcertSceneV958,ConcertSettingsV958,ConcertPhaseV958,ConcertFxV955} from '@/lib/ultimateConcertRoadmapV958';

export type TransitionStyleV976='gentle'|'balanced'|'dramatic';
export type TransitionKindV976='verse-to-hook'|'build-to-drop'|'into-break'|'into-outro'|'section-change'|'off';
export interface ConcertTransitionInputV976 {
 scene:ConcertSceneV958|null;previous:ConcertSceneV958|null;settings:ConcertSettingsV958;
 elapsedMs:number;sectionDurationMs:number;playing:boolean;authoredStage:boolean;
 savedShowActive?:boolean;lowPerformance:boolean;reducedMotion:boolean;lyricsVisible:boolean;
}
export interface ConcertTransitionResultV976 {
 scene:ConcertSceneV958|null;active:boolean;blend:number;durationMs:number;
 kind:TransitionKindV976;cameraHandoff:boolean;reason:string;
}
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const phases:readonly ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const gentleFx:ReadonlySet<ConcertFxV955>=new Set(['beams','fog','sweep']);
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const color=(a:string,b:string,t:number)=>{
 if(!/^#[0-9a-f]{6}$/i.test(a)||!/^#[0-9a-f]{6}$/i.test(b))return b;
 const mixed=[0,2,4].map(offset=>{
  const left=parseInt(a.slice(offset+1,offset+3),16),right=parseInt(b.slice(offset+1,offset+3),16);
  return Math.round(lerp(left,right,t)).toString(16).padStart(2,'0');
 });
 return `#${mixed.join('')}`;
};
const inactive=(scene:ConcertSceneV958|null,reason:string):ConcertTransitionResultV976=>({
 scene,active:false,blend:1,durationMs:0,kind:'off',cameraHandoff:false,reason,
});
function kindOf(before:ConcertPhaseV958,after:ConcertPhaseV958):TransitionKindV976 {
 if(before==='verse'&&after==='hook')return 'verse-to-hook';
 if(before==='build'&&after==='drop')return 'build-to-drop';
 if(after==='break')return 'into-break';
 if(after==='outro')return 'into-outro';
 return 'section-change';
}
/** Only virtual automatic scenes change; stage choreography and confirmed section labels remain. */
export function applyIntelligentConcertTransitionV976(i:ConcertTransitionInputV976):ConcertTransitionResultV976 {
 const {scene:s,previous:p,settings:t}=i;
 if(!s||!p||!t.enabled||!t.virtualFx||!t.intelligentTransitionsV976||!i.playing||
  !s.verified||!p.verified||s.timelineOverride||p.timelineOverride||i.authoredStage||i.savedShowActive||
  i.lowPerformance||i.reducedMotion||s.phase===p.phase||!phases.includes(s.phase)||!phases.includes(p.phase)||
  !finite(i.elapsedMs)||!finite(i.sectionDurationMs)||i.elapsedMs<0||i.sectionDurationMs<700||
  !finite(t.transitionStrengthV976)||t.transitionStrengthV976<=0||
  !finite(s.intensity)||!finite(p.intensity)||!finite(s.lightGain)||!finite(p.lightGain)||
  !finite(s.spotlight)||!finite(p.spotlight)||
  [s.intensity,p.intensity,s.spotlight,p.spotlight].some(v=>v<0||v>1)||
  [s.lightGain,p.lightGain].some(v=>v<0||v>1.3)||
  !Array.isArray(s.palette)||!Array.isArray(p.palette)||!Array.isArray(s.effects)||!Array.isArray(p.effects)){
  return inactive(s,'Keine sichere automatische virtuelle Übergangssequenz');
 }
 const kind=kindOf(p.phase,s.phase);
 // Playhead-stable; no reliance on wall clock, frame rate, or accumulated state.
 const pace=t.transitionStyleV976==='gentle'?1.34:t.transitionStyleV976==='dramatic'?.82:1;
 const base=kind==='build-to-drop'?1050:kind==='verse-to-hook'?1900:
  kind==='into-break'?2600:kind==='into-outro'?2900:1650;
 const durationMs=Math.max(400,Math.min(Math.round(base*pace),
  Math.round(i.sectionDurationMs*.45),i.lyricsVisible?1700:3200));
 if(i.elapsedMs>=durationMs)return inactive(s,'Übergang abgeschlossen');
 const blend=smooth(i.elapsedMs/durationMs);
 const strength=clamp(t.transitionStrengthV976,0,100)/100;
 const mix=1-(1-blend)*strength;
 // Keep spotlight within the existing lyric-friendly bounds, never amplify a flash.
 const brightness=clamp(lerp(p.intensity,s.intensity,mix),.12,.97);
 const spotlight=clamp(lerp(p.spotlight,s.spotlight,mix),.1,1);
 const lightGain=clamp(lerp(p.lightGain,s.lightGain,mix),.3,1.1);
 const palette:[string,string]=[color(p.palette[0],s.palette[0],mix),color(p.palette[1],s.palette[1],mix)];
 // New high-energy FX enter after the visual crossfade, never before it.
 // Existing V958 renderer applies bounded intensity to beams, fog and LED wall.
 const effects:ConcertFxV955[]=s.effects.filter(effect=>
  mix>=.8||gentleFx.has(effect)||p.effects.includes(effect));
 const handoff=Boolean(t.cameraHandoffsV976&&p.camera!==s.camera&&mix<.65);
 const camera=handoff?p.camera:s.camera;
 return {scene:{...s,camera,palette,intensity:brightness,spotlight,lightGain,effects,
  transition:Math.min(s.transition,mix)},active:true,blend:mix,durationMs,kind,
  cameraHandoff:handoff,reason:`V976: bestätigter ${p.phase} → ${s.phase} Übergang (nur virtuell)`};
}
