/** V849 – Intelligent Concert Transitions 5.0.
 * The V791 verified scene seam remains the only timing authority. The same
 * seek-stable cue governs camera easing, stage lighting, LED/laser crossfade and
 * existing festival accent suppression. Never creates cuts, flashes, render passes
 * or inferred beats; all gains are <=1 and authored controls retain priority.
 */
import type {SceneTransitionCueV791} from './seamlessSceneTransitionsV791';
import type {ConcertFxSettingsV810} from './concertFxStudioV810';
export type TransitionModeV849='smooth'|'cinematic'|'festival';
export type CoordinatedConcertTransitionV849={
  active:boolean;reason:'verified-seam'|'disabled'|'unverified'|'protected';
  seam:SceneTransitionCueV791|null|undefined;
  sceneIndex:number;edge:'entry'|'exit'|'off';proximity:number;
  cameraRate:number;lightingRate:number;ledGain:number;laserGain:number;
  festivalGain:number;overlayGain:number;
};
export interface ConcertTransitionInputV849{
  seam:SceneTransitionCueV791|null|undefined;
  settings?:Partial<ConcertFxSettingsV810>|null;
  trackId:string;progressMs:number;playing:boolean;reactive:boolean;
  reducedMotion:boolean;manualCamera:boolean;manualLighting:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;castCount:number;
  tier:'low'|'balanced'|'high';section:string;budget:number;
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function planIntelligentConcertTransitionV849(i:ConcertTransitionInputV849):CoordinatedConcertTransitionV849{
 const s=i.settings;
 const inactive=(reason:CoordinatedConcertTransitionV849['reason']):CoordinatedConcertTransitionV849=>({
   active:false,reason,seam:i.seam,sceneIndex:-1,edge:'off',proximity:0,
   cameraRate:1,lightingRate:1,ledGain:1,laserGain:1,festivalGain:1,overlayGain:1,
 });
 if(s?.intelligentTransitionsV849===false||s?.enabled===false)return inactive('disabled');
 if(!i.playing||!i.reactive||i.reducedMotion||i.tier==='low')return inactive('protected');
 const t=i.seam;
 if(!t?.active||t.kind==='off'||t.edge==='off'||
   !i.trackId||i.trackId.length>180||!finite(i.progressMs)||i.progressMs<0||
   !Number.isInteger(t.sceneIndex)||t.sceneIndex<0||t.sceneIndex>10000||
   !finite(t.proximity)||t.proximity<=0||t.proximity>1||
   !finite(t.cameraRate)||t.cameraRate<=0||t.cameraRate>1||
   !finite(t.lightingRate)||t.lightingRate<=0||t.lightingRate>1||
   !Number.isInteger(i.castCount)||i.castCount<1||i.castCount>4||
   !['intro','verse','hook','build','drop','break','finale'].includes(i.section)||
   !finite(i.budget)||i.budget<=0||i.budget>1)return inactive('unverified');
 if(i.manualCamera&&i.manualLighting)return inactive('protected');
 const strength=finite(s?.transitionStrengthV849)?clamp((s!.transitionStrengthV849!)/100):.62;
 const mode:TransitionModeV849=s?.transitionModeV849==='cinematic'||s?.transitionModeV849==='festival'?s.transitionModeV849:'smooth';
 if(strength<=0)return inactive('disabled');
 // V791 proximity fades to zero at the outside of the seam, so the whole scene
 // resumes its unmodified base lighting/LED/camera without a temporal jump.
 const seamWeight=smooth(t.proximity)*strength*clamp(i.budget)*
   (i.tier==='balanced'?.68:1)*(i.lyricsProtected?.48:1)*
   (i.vocalFocus?.58:1)*(i.castCount>=3?.74:1);
 if(seamWeight<.0005)return inactive('protected');
 const mood=mode==='festival'?.86:mode==='cinematic'?.76:.63;
 const sectionGain=i.section==='drop'||i.section==='finale'?.84:
   i.section==='hook'?.69:i.section==='build'?.60:.50;
 const weight=seamWeight*mood*sectionGain;
 const ledGain=clamp(1-.20*weight);
 const laserGain=clamp(1-.24*weight);
 const festivalGain=clamp(1-.30*weight);
 const overlayGain=clamp(1-.12*weight);
 // These are rates, not camera poses. Existing camera smoothing and V351 lyric
 // composition remain authoritative. Never accelerate past V791's chosen rate.
 const cameraRate=i.manualCamera?1:Math.max(.40,t.cameraRate*(1-.16*weight));
 const lightingRate=i.manualLighting?1:Math.max(.40,t.lightingRate*(1-.14*weight));
 const seam:SceneTransitionCueV791={...t,cameraRate:Math.min(1,cameraRate),
   lightingRate:Math.min(1,lightingRate)};
 return {active:true,reason:'verified-seam',seam,sceneIndex:t.sceneIndex,edge:t.edge,
   proximity:t.proximity,cameraRate:seam.cameraRate,lightingRate:seam.lightingRate,
   ledGain:i.manualLighting?1:ledGain,laserGain:i.manualLighting?1:laserGain,
   festivalGain:i.manualLighting?1:festivalGain,overlayGain:i.manualLighting?1:overlayGain};
}
/** Multiply only existing visuals, never resurrect zero-alpha, manually-disabled FX. */
export function applyConcertTransitionGainV849(value:number,gain:number):number{
 return finite(value)&&value>0&&finite(gain)&&gain>=0&&gain<=1?value*gain:0;
}
