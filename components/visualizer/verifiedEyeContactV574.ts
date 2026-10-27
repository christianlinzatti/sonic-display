/** V574: tiny eye-bone glances, ONLY for verified V528 manually authored cast.
 * No inference from credits. Eye rotations overlay the GLB's animated rotation.
 */
import type {ConcertSceneV528} from './cinematicConcertCoordinationV528';
export type EyeCueV574=Readonly<{mode:'off'|'audience'|'partner';yaw:number;pitch:number;weight:number}>;
export const EYE_OFF_V574:EyeCueV574=Object.freeze({mode:'off',yaw:0,pitch:0,weight:0});
const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function planVerifiedEyeContactV574(input:{scene?:ConcertSceneV528|null;trackId:string;slot:number;
 timeMs:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;enabled:boolean;tier:'low'|'balanced'|'high'}):EyeCueV574{
 const {scene,trackId,timeMs,slot}=input;
 if(!input.enabled||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !scene?.active||!trackId.trim()||scene.trackId!==trackId||!Number.isFinite(timeMs)||
    !Number.isFinite(scene.cueStartMs)||!Number.isFinite(scene.cueEndMs)||
    scene.cueStartMs<0||timeMs<scene.cueStartMs||timeMs>=scene.cueEndMs||scene.cueEndMs<=scene.cueStartMs||
    !Number.isInteger(scene.count)||scene.count<2||scene.count>4||!Number.isInteger(slot)||slot<0||slot>=scene.count||
    !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=scene.count||
    !Array.isArray(scene.singingSlots)||!scene.singingSlots.length||
    !scene.singingSlots.includes(scene.leadSlot)||scene.singingSlots.some((s,i)=>scene.singingSlots.indexOf(s)!==i)||
    scene.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=scene.count)||
    (scene.handoffFrom!==null&&(!Number.isInteger(scene.handoffFrom)||scene.handoffFrom<0||scene.handoffFrom>=scene.count)))return EYE_OFF_V574;
 const gain=(input.tier==='balanced'?.55:1)*smooth((timeMs-scene.cueStartMs)/320)*
    smooth((scene.cueEndMs-timeMs)/300)*Math.min(.8,Math.max(0,scene.strength));
 if(gain<.001)return EYE_OFF_V574;
 // Singers address the audience; listeners momentarily glance to assigned lead.
 if(scene.singingSlots.includes(slot))return {mode:'audience',yaw:0,pitch:-.012*gain,weight:gain};
 return {mode:'partner',yaw:Math.max(-.065,Math.min(.065,(scene.leadSlot-slot)*.032*gain)),pitch:0,weight:gain};
}
