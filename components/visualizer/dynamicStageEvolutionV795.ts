/** V795 — Dynamic Stage Evolution.
 * Changes the existing V789 instanced portal geometry and V635 LED stage depth.
 * Uses only the verified V790 storyboard clock; does not create scenes, infer
 * song sections, alter the selected theme or override authored lighting.
 */
import type {ShowPlanV790,ShowCueV790,ShowSceneV790} from './cinematicShowDirectorV790';

export type StageEvolutionModeV795='off'|'intimate'|'opening'|'rising'|'arena'|'climax'|'breath'|'finale';
export type StageEvolutionCueV795={
  active:boolean;trackId:string;durationMs:number;sceneIndex:number;
  sceneStartMs:number;sceneEndMs:number;mode:StageEvolutionModeV795;
  /** Additional architectural span and roof lift; no new mesh or stage theme. */
  spread:number;lift:number;depth:number;ledMorph:number;ambientMix:number;floorMix:number;
};
export type StageEvolutionInputV795={
  trackId:string;durationMs:number;positionMs:number;playing:boolean;enabled:boolean;
  reducedMotion:boolean;tier:'low'|'balanced'|'high';strength:number;
  lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
  show:ShowCueV790;
};
export const STAGE_EVOLUTION_OFF_V795:Readonly<StageEvolutionCueV795>=Object.freeze({
  active:false,trackId:'',durationMs:0,sceneIndex:-1,sceneStartMs:0,sceneEndMs:0,
  mode:'off',spread:0,lift:0,depth:0,ledMorph:0,ambientMix:0,floorMix:0,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const round=(x:number)=>Math.round(x*100000)/100000;

function modeFor(scene:ShowSceneV790,plan:ShowPlanV790):StageEvolutionModeV795{
  if(scene.moment==='breath'||scene.section==='break')return 'breath';
  if(scene.moment==='anticipate'&&scene.section==='build')return 'rising';
  if(scene.role==='main-peak'&&scene.moment==='payoff')return 'climax';
  if(scene.moment==='resolve'&&scene.index===plan.scenes.length-1)return 'finale';
  if(scene.section==='drop'||scene.section==='hook')return 'arena';
  if(scene.moment==='establish')return 'intimate';
  return 'opening';
}

/** Fails closed for unverified scenes, stale playback or manual/inactive show.
 * Deterministic at every timestamp including repeated hooks, seeks and replays.
 * The geometry rests on scene boundaries; no implicit sections or scene gaps.
 */
export function sampleDynamicStageEvolutionV795(plan:ShowPlanV790,input:StageEvolutionInputV795):StageEvolutionCueV795{
  const off={...STAGE_EVOLUTION_OFF_V795};
  const c=input.show;
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    plan.source!=='verified-storyboard'||!plan.trackId||input.trackId!==plan.trackId||
    !finite(plan.durationMs)||plan.durationMs<=0||input.durationMs!==plan.durationMs||
    !finite(input.positionMs)||input.positionMs<0||input.positionMs>=plan.durationMs||
    !finite(input.strength)||input.strength<=0||
    !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
    !c||!c.active||c.reason!=='verified-show'||!Number.isInteger(c.sceneIndex)||
    !finite(c.blend)||c.blend<=0||c.blend>1)return off;
  const s=plan.scenes[c.sceneIndex];
  if(!s||s.index!==c.sceneIndex||s.actIndex!==c.actIndex||s.intent!==c.intent||
    s.moment!==c.moment||!finite(s.startMs)||!finite(s.endMs)||
    s.endMs<=s.startMs||s.startMs<0||s.endMs>plan.durationMs||
    input.positionMs<s.startMs||input.positionMs>=s.endMs)return off;
  const mode=modeFor(s,plan);
  const magnitude:Record<StageEvolutionModeV795,number>={off:0,
    intimate:.14,opening:.30,rising:.68,arena:.78,climax:1,breath:.055,finale:.64,
  };
  const duration=s.endMs-s.startMs;
  const edge=Math.min(2200,duration*.20);
  const fade=Math.min(smooth((input.positionMs-s.startMs)/Math.max(1,edge)),
    smooth((s.endMs-input.positionMs)/Math.max(1,edge)));
  // All strengths are only geometric depth/scale, with tight lyric and four-avatar caps.
  const guard=(input.tier==='balanced'?.55:1)*
    (input.lyricsProtected?.48:1)*(input.vocalFocus?.70:1)*
    (input.groupCount===4?.64:input.groupCount===3?.78:1);
  const power=clamp(magnitude[mode]*fade*c.blend*clamp(input.strength/100)*guard);
  return {active:power>.0001,trackId:plan.trackId,durationMs:plan.durationMs,
    sceneIndex:s.index,sceneStartMs:s.startMs,sceneEndMs:s.endMs,mode,
    spread:round(clamp(power*.23,0,.23)),lift:round(clamp(power*.30,0,.30)),
    depth:round(clamp(power*.16,0,.16)),ledMorph:round(clamp(power*.17,0,.17)),
    ambientMix:round(clamp(power*.024,0,.024)),floorMix:round(clamp(power*.028,0,.028))};
}

/** The V789 fixture silhouettes stay behind the performers and lyrics.
 * No matrix allocations are required: renderer applies these values to a
 * reused Object3D before setMatrixAt on the same instanced mesh.
 */
export function positionStageEvolutionBarV795(
  position:{set:(x:number,y:number,z:number)=>unknown},
  x:number,y:number,z:number,spread:number,lift:number,depth:number,
):void{
  const safeSpread=clamp(finite(spread)?spread:0,0,.23);
  const safeLift=clamp(finite(lift)?lift:0,0,.30);
  const safeDepth=clamp(finite(depth)?depth:0,0,.16);
  const upper=y>1.35;
  position.set(x*(1+safeSpread),
    y+(upper?safeLift:(y<0?-safeLift*.10:safeLift*.10)),
    Math.min(-3.10,z-safeDepth));
}
