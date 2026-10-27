/** V578: typography-only safety for dense and long lyric lines.
 * Never changes displayed text, song time, word progress, ordering or singer roles.
 */
import type {LyricLine} from '@/types/music';
export type LyricReadabilityV578=Readonly<{mode:'default'|'dense'|'very-dense';maxWidthCh:number;
 plateOpacity:number;glowGain:number}>;
export function planLyricReadabilityV578(input:{line?:LyricLine|null;immersive:boolean;reducedMotion:boolean;
 playing:boolean;avatarCount:number}):LyricReadabilityV578{
 const text=input.line?.text??'';
 const length=[...text.replace(/\[[^\]]*\]/gu,'').trim()].length;
 const dense=length>76||length>50&&input.immersive;
 const veryDense=length>120||length>85&&input.immersive;
 const mode=veryDense?'very-dense':dense?'dense':'default';
 return {mode,maxWidthCh:veryDense?42:dense?48:56,
   plateOpacity:mode==='default'?0:input.immersive?.14:.09,
   glowGain:mode==='default'?1:(input.reducedMotion||!input.playing)?.5:.7};
}
