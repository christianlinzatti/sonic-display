/** V1039 · Holographic Laser Architecture.
 * Pure, deterministic, bounded stage geometry planning. Visual-only WebGL:
 * never emit hardware laser/pyro commands, network requests or new camera shots.
 * Uses observed energy and pre-existing song sections; never invents drops.
 */
import {normalizeArenaSectionV1034} from './arena360ShowV1034';

export type HologramPatternV1039='auto'|'tunnel'|'spiral'|'halo';
export type HologramGenreV1039='rap'|'hard'|'rock'|'pop';
export type ArenaHologramCueV1039={pattern:Exclude<HologramPatternV1039,'auto'>;genre:HologramGenreV1039;
 beam:number;portal:number;speed:number;radius:number;phase:number;primary:string;secondary:string};
export type HologramFixtureV1039={angle:number;index:number;radius:number;phase:number};
export type LaserArchFixtureV1039={index:number;angle:number;phase:number};
const TAU=Math.PI*2;
const clamp=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
export function resolveHologramGenreV1039(genre?:string|null):HologramGenreV1039 {
 const g=(genre||'').toLowerCase();
 if(/hardtekk|hardstyle|hardcore|techno|rave|edm|electro/.test(g))return 'hard';
 if(/rock|metal|ndh|industrial|punk/.test(g))return 'rock';
 if(/rap|hip.?hop|trap|drill|grime/.test(g))return 'rap';
 return 'pop';
}
const PALETTES:Record<HologramGenreV1039,{primary:string;secondary:string;motion:number}>={
 rap:{primary:'#6ebeff',secondary:'#b46fff',motion:.54},
 hard:{primary:'#17faff',secondary:'#f540d8',motion:1},
 rock:{primary:'#ff9f4b',secondary:'#ff434f',motion:.72},
 pop:{primary:'#74e8e7',secondary:'#ff9fd7',motion:.48},
};
export function hologramFixtureCountV1039(tier:'low'|'balanced'|'high') {return tier==='low'?3:tier==='balanced'?6:9;}
export function laserArchitectureCountV1039(tier:'low'|'balanced'|'high') {return tier==='low'?4:tier==='balanced'?8:12;}
export function createHologramFixturesV1039(tier:'low'|'balanced'|'high'):HologramFixtureV1039[]{
 const n=hologramFixtureCountV1039(tier);
 return Array.from({length:n},(_,index)=>({index,angle:TAU*(index+.5)/n,radius:3.57+(index%2)*.14,phase:index*1.31}));
}
export function createLaserArchitectureV1039(tier:'low'|'balanced'|'high'):LaserArchFixtureV1039[]{
 const n=laserArchitectureCountV1039(tier);
 return Array.from({length:n},(_,index)=>({index,angle:TAU*(index+.5)/n,phase:index*.71}));
}
export function planArenaHolographyV1039(opts:{enabled:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;genre?:string|null;section?:string|null;energy?:number|null;strength?:number;
 pattern?:HologramPatternV1039}):ArenaHologramCueV1039 {
 const genre=resolveHologramGenreV1039(opts.genre),palette=PALETTES[genre];
 const section=normalizeArenaSectionV1034(opts.section);
 const pattern:Exclude<HologramPatternV1039,'auto'>=opts.pattern&&opts.pattern!=='auto'&&
  ['tunnel','spiral','halo'].includes(opts.pattern)?opts.pattern:
  section==='build'?'spiral':section==='drop'?'tunnel':section==='hook'?'halo':'halo';
 const amount=clamp(opts.strength??65,0,100)/100;
 const active=opts.enabled&&opts.playing&&!opts.reducedMotion&&opts.reactive&&amount>0;
 const energy=clamp(opts.energy??0,0,1);
 const sectionBoost=section==='drop'?.23:section==='hook'?.16:section==='build'?.10:section==='break'?.02:.06;
 const visibility=active?clamp(amount*(.15+.43*energy+sectionBoost),0,.65):0;
 return {pattern,genre,beam:clamp(visibility*.72,0,.44),portal:clamp(visibility,0,.65),
  speed:active?clamp((.16+.32*energy)*palette.motion*amount,0,.6):0,
  radius:clamp(1.2+.30*energy,1.2,1.5),phase:energy,
  primary:palette.primary,secondary:palette.secondary};
}
export function sampleHologramPortalV1039(f:HologramFixtureV1039,time:number,cue:ArenaHologramCueV1039){
 const t=clamp(time,0,1e8),turn=t*cue.speed;
 const spin=cue.pattern==='spiral'?turn*.34:cue.pattern==='tunnel'?turn*.09:0;
 const wave=Math.sin(turn*1.2+f.phase);
 return {x:Math.cos(f.angle+spin)*f.radius,z:Math.sin(f.angle+spin)*f.radius,
  y:1.25+.13*wave,rotY:-f.angle-spin,rotZ:.18*wave,
  size:.82+cue.portal*.35,light:clamp(.04+cue.portal*(.48+.20*wave),.04,.49)};
}
export function sampleLaserArchitectureV1039(f:LaserArchFixtureV1039,time:number,cue:ArenaHologramCueV1039){
 const t=clamp(time,0,1e8),spin=t*cue.speed;
 const a=f.angle,b=cue.pattern==='spiral'?a+spin*.76:cue.pattern==='tunnel'?a+Math.sin(spin+f.phase)*.18:a;
 // Truss-origin lasers terminate in air above and around the stage center.
 const origin={x:Math.cos(a)*4.00,y:2.60,z:Math.sin(a)*4.00};
 const end={x:Math.cos(b)*cue.radius,z:Math.sin(b)*cue.radius,
  y:cue.pattern==='tunnel'?1.17+f.index%3*.33:cue.pattern==='spiral'?1.30+.65*Math.sin(a+spin):2.04};
 return {origin,end,light:clamp(cue.beam*(.75+.25*Math.sin(f.phase+spin)),0,.44)};
}
