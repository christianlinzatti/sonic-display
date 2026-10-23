import type { AvatarExpressionState } from "./avatarExpressionEngine";
import type { PerformanceSection } from "./performanceDirector";

export type EmotionV233State = { jaw:number; brow:number; eyeNarrow:number; headTilt:number; gazeYaw:number; gazePitch:number };
export const createEmotionV233State = (): EmotionV233State => ({jaw:0,brow:0,eyeNarrow:0,headTilt:0,gazeYaw:0,gazePitch:0});
const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(x)?x:0));
/** Lightweight, allocation-free, bounded emotional response with independent per-avatar state. */
export function updateEmotionV233(state:EmotionV233State, expression:AvatarExpressionState, section:PerformanceSection, genre:string|null|undefined, seconds:number, delta:number, playing:boolean, reducedMotion:boolean):EmotionV233State {
  const active=playing&&!reducedMotion;
  const key=(genre??'').toLowerCase();
  const hard=/hardstyle|hardtekk|hardcore/.test(key);
  const rap=/rap|hip.?hop|trap|drill/.test(key);
  const phrase=section==='drop'?1:section==='chorus'?0.75:section==='verse'?0.55:section==='break'?0.17:0.32;
  const amount=active?phrase:0;
  const targetJaw=active?clamp(expression.jaw*(hard?1.22:0.85)+expression.smile*0.08*phrase,0,0.28):0;
  const targetBrow=active?clamp(expression.brow*(hard?1.10:0.85)+phrase*0.035, -0.16,0.36):0;
  const targetEye=active?clamp(expression.eyeNarrow*(hard?1.12:0.75),0,0.65):0;
  const targetTilt=active?clamp(expression.headTilt+(rap?0.025:0.012)*Math.sin(seconds*1.1)*phrase,-0.12,0.12):0;
  const targetYaw=active?clamp(Math.sin(seconds*(rap?0.65:0.43))*0.055*amount,-0.055,0.055):0;
  const targetPitch=active?clamp(Math.sin(seconds*0.71+1.5)*0.024*amount,-0.024,0.024):0;
  const blend=1-Math.exp(-clamp(delta,0,0.12)*(active?7:10));
  state.jaw+= (targetJaw-state.jaw)*blend;
  state.brow+= (targetBrow-state.brow)*blend;
  state.eyeNarrow+= (targetEye-state.eyeNarrow)*blend;
  state.headTilt+= (targetTilt-state.headTilt)*blend;
  state.gazeYaw+= (targetYaw-state.gazeYaw)*blend;
  state.gazePitch+= (targetPitch-state.gazePitch)*blend;
  return state;
}
