/** EffectComposer only owns its internal buffers. Added Pass instances own other
 * render targets, shader materials and fullscreen-quad resources themselves.
 * Call this on every effect/quality switch, while the scene is still mounted.
 */
import {settleOwnedResourcesV833} from './resourceCleanupV833';

export function disposeDancePostProcessingV654(
  composer: {dispose():void},
  passes: ReadonlyArray<{dispose?:()=>void}>,
): void {
  // Each pass owns its own render targets, shader materials and fullscreen quad.
  // Do not let one faulty pass prevent cleanup of the remaining effects and composer.
  const resources=passes.filter((pass):pass is {dispose:()=>void}=>typeof pass.dispose==='function');
  settleOwnedResourcesV833([...resources,composer]);
}
