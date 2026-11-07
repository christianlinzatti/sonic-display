/** V1059 · Advanced LED Wall 4.0.
 * A deterministic, opt-in LED panorama around the 360° arena. The show plan is
 * an authored timeline; only observed audio features control the equalizer.
 * This module is pure and never controls real devices, audio or a camera.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowCueV1040,ArenaShowPlanV1040} from './arena360ShowDesignerV1040';

export type LedWallPatternV1059='auto'|'equalizer'|'geometry'|'orbit'|'pulse';
export type LedWallLookV1059=Exclude<LedWallPatternV1059,'auto'>;
export type LedWallPixelV1059={column:number;row:number;columns:number;rows:number;x:number;y:number;z:number;angle:number};
export type LedWallCueV1059={active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'planned';
 chapter:number;look:LedWallLookV1059;gain:number;colorA:string;colorB:string;fade:number};
export type LedWallAudioV1059={bass?:number|null;mids?:number|null;highs?:number|null;beat?:boolean;beatStrength?:number|null};
const clamp=(n:unknown,lo:number,hi:number,fallback=lo):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;
const off=(reason:LedWallCueV1059['reason']='disabled'):LedWallCueV1059=>({active:false,reason,
 chapter:-1,look:'equalizer',gain:0,fade:0,colorA:'#3d88dd',colorB:'#8e69e2'});
const LOOKS:readonly LedWallLookV1059[]=['orbit','equalizer','geometry','pulse','orbit','equalizer','pulse'];
const PALETTES={
 rap:[['#379ddd','#aa69d6'],['#397ac7','#dd72aa']],
 hard:[['#22cbec','#855df1'],['#328cf8','#dd62d5']],
 rock:[['#eb994b','#e46473'],['#ffc569','#b85ea3']],
 pop:[['#53cbd9','#d886e7'],['#72c99f','#cd8be2']],
} as const;
/** A single instanced open LED belt; caps are independent of music intensity. */
export function createLedWallPixelsV1059(tier:'low'|'balanced'|'high'='balanced'):LedWallPixelV1059[]{
 if(tier==='low')return [];
 const columns=tier==='high'?64:48,rows=tier==='high'?4:3;
 const pixels:LedWallPixelV1059[]=[];
 for(let column=0;column<columns;column++){
  const angle=Math.PI*2*column/columns;
  for(let row=0;row<rows;row++){
   pixels.push({column,row,columns,rows,angle,
    x:Math.cos(angle)*5.18,y:-1.62+row*.42,z:Math.sin(angle)*5.18});
  }
 }
 return pixels;
}
export function planLedWallV1059(input:{enabled:boolean;stageIsArena:boolean;playing:boolean;
 reducedMotion:boolean;reactive?:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 plan?:ArenaShowPlanV1040|null;show?:ArenaShowCueV1040|null;
 strength?:number|null;pattern?:LedWallPatternV1059|null}):LedWallCueV1059{
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 const {trackId,progressMs,durationMs}=input;
 if(!trackId?.trim()||!Number.isFinite(progressMs)||!Number.isFinite(durationMs)||
  (durationMs??0)<30000||(progressMs??-1)<0||(progressMs??0)>(durationMs??0))return off('clock');
 const plan=normalizeArenaShowPlanV1040(input.plan),show=input.show;
 if(!plan||!show?.active||!Number.isInteger(show.segmentIndex)||
  show.segmentIndex<0||show.segmentIndex>=plan.segments.length||
  !Number.isFinite(show.intensity)||show.intensity<=0||
  !Number.isFinite(show.fade)||show.fade<=0)return off('show');
 const chapter=show.segmentIndex,segment=plan.segments[chapter],progress=(progressMs??0)/(durationMs??1);
 if(show.scene!==segment.scene||progress<segment.start-1e-8||progress>segment.end+1e-8)return off('show');
 const strength=clamp(input.strength,0,80,55)/100;
 if(strength<=0)return off();
 const pattern=input.pattern;
 const look=pattern&&pattern!=='auto'&&(['equalizer','geometry','orbit','pulse'] as string[]).includes(pattern)
  ?pattern:LOOKS[chapter];
 const [colorA,colorB]=PALETTES[plan.genre][chapter%2];
 const gain=clamp(.68*strength*clamp(show.intensity/100,0,1)*clamp(show.fade,0,1)*
  (input.performanceTier==='balanced'?.7:1),0,.55,0);
 if(gain<.005)return off('show');
 return {active:true,reason:'planned',chapter,look,gain,colorA,colorB,fade:clamp(show.fade,0,1)};
}
/** Per-pixel brightness. Static spatial pattern + observed playback/audio only. */
export function sampleLedWallPixelV1059(pixel:LedWallPixelV1059,cue:LedWallCueV1059,
 audio:LedWallAudioV1059,timeSeconds:number):number{
 if(!cue.active||!Number.isFinite(timeSeconds)||!Number.isFinite(pixel.column)||!Number.isFinite(pixel.row)||
  pixel.rows<=0||pixel.columns<=0)return 0;
 const bass=clamp(audio.bass,0,1),mids=clamp(audio.mids,0,1),highs=clamp(audio.highs,0,1);
 const beat=audio.beat===true?clamp(audio.beatStrength,0,1):0;
 const t=clamp(timeSeconds,0,900,0),x=pixel.column/pixel.columns,y=(pixel.row+.5)/pixel.rows;
 let value:number;
 switch(cue.look){
  case 'equalizer': {
   const channel=pixel.column%6;
   const amp=channel<2?bass:channel<4?mids:highs;
   const threshold=.18+.77*amp;
   value=y<=threshold?.74+.18*amp:.045;
   break;
  }
  case 'geometry': {
   const diagonal=Math.abs(Math.sin((x*8+y*3)*Math.PI+t*.46));
   value=.09+.78*Math.pow(diagonal,4);
   break;
  }
  case 'orbit': {
   const wave=Math.sin(x*Math.PI*4-t*1.35+y*1.5);
   value=.17+.53*(.5+.5*wave);
   break;
  }
  case 'pulse': {
   // No invented downbeats: the moving wave is subtle; real beat is bounded.
   const wave=.5+.5*Math.sin(x*Math.PI*8+t*1.25-y*2);
   value=.12+.48*wave+.12*beat;
   break;
  }
 }
 return clamp(value*clamp(cue.gain,0,.55)*(1+.12*beat),0,.55,0);
}
