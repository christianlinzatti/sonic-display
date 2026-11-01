/** V742: deterministic genre/section choreographer for the *existing* V735/V738
 * procedural hip layer. No new GLB clips, skin weights or foot transforms.
 * Explicit movement selections and the caller's manual/show priority ALWAYS win.
 */
import {resolveGenreDanceStyleV666, type DanceStyleV666, type ResolvedDanceStyleV666} from './genreDancePerformanceV666';
import {normalizeHipDanceV735, type HipDanceModeV735, type HipDanceSettingsV735} from './hipDanceV735';
import {normalizeHipStudioV738, type HipStudioSettingsV738} from './hipMotionStudioV738';

export type GenreHipSettingsV742={enabled:boolean;style:DanceStyleV666;strength:number};
export const DEFAULT_GENRE_HIP_V742:Readonly<GenreHipSettingsV742>={enabled:true,style:'auto',strength:60};
export const GENRE_HIP_STYLES_V742:readonly DanceStyleV666[]=['auto','deutschrap','hardtekk','hardstyle','rock','pop'];
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function normalizeGenreHipV742(raw:Partial<GenreHipSettingsV742>|null|undefined):GenreHipSettingsV742{
 return {
  enabled:raw?.enabled===undefined?DEFAULT_GENRE_HIP_V742.enabled:raw.enabled===true,
  style:GENRE_HIP_STYLES_V742.includes(raw?.style as DanceStyleV666)?raw!.style!:'auto',
  strength:finite(raw?.strength)?Math.round(clamp(raw.strength,0,100)):DEFAULT_GENRE_HIP_V742.strength,
 };
}
export type GenreHipSectionV742='quiet'|'verse'|'hook'|'drop';
export function classifyGenreHipSectionV742(raw:string|null|undefined):GenreHipSectionV742{
 const section=(raw??'').toLowerCase();
 if(/intro|outro|break|bridge|quiet|interlude|pause/.test(section))return 'quiet';
 if(/drop|climax|peak|build.?drop/.test(section))return 'drop';
 if(/hook|chorus|refrain/.test(section))return 'hook';
 return 'verse';
}
type HipClip=Exclude<HipDanceModeV735,'off'|'auto'>;
type Sequence=readonly HipClip[];
/** Distinct patterns: rap grooves, hardtekk circles/pulses, hardstyle bounce,
 * rock weight-shifts and pop figure-eights. No randomness, no runaway BPM. */
const PATTERNS:Record<ResolvedDanceStyleV666,Record<GenreHipSectionV742,Sequence>>={
 deutschrap:{quiet:['Hip_Sway'],verse:['Hip_Sway','Hip_Sway','Hip_Circle'],hook:['Hip_Circle','Hip_Sway'],drop:['Hip_Bounce','Hip_Sway']},
 hardtekk:{quiet:['Hip_Sway'],verse:['Hip_Circle','Hip_Bounce'],hook:['Hip_Bounce','Hip_Circle','Hip_Bounce'],drop:['Hip_Bounce','Hip_Circle']},
 hardstyle:{quiet:['Hip_Sway'],verse:['Hip_Bounce','Hip_Sway'],hook:['Hip_Bounce','Hip_Bounce','Hip_Circle'],drop:['Hip_Bounce']},
 rock:{quiet:['Hip_Sway'],verse:['Hip_Sway','Hip_Sway','Hip_Bounce'],hook:['Hip_Sway','Hip_Bounce'],drop:['Hip_Bounce','Hip_Sway']},
 pop:{quiet:['Hip_Sway'],verse:['Hip_Sway','Hip_Circle'],hook:['Hip_Circle','Hip_Sway','Hip_Bounce'],drop:['Hip_Bounce','Hip_Circle']},
};
const MIX:Record<ResolvedDanceStyleV666,Record<HipClip,number>>={
 deutschrap:{Hip_Sway:1.08,Hip_Circle:.92,Hip_Bounce:.76},
 hardtekk:{Hip_Sway:.86,Hip_Circle:1.12,Hip_Bounce:1.1},
 hardstyle:{Hip_Sway:.78,Hip_Circle:.9,Hip_Bounce:1.15},
 rock:{Hip_Sway:1.1,Hip_Circle:.76,Hip_Bounce:.86},
 pop:{Hip_Sway:1.05,Hip_Circle:1.1,Hip_Bounce:.92},
};
export type GenreHipInputV742={config?:Partial<GenreHipSettingsV742>|null;
 hip:HipDanceSettingsV735;studio?:Partial<HipStudioSettingsV738>|null;
 genre?:string|null;section?:string|null;seconds:number;bpm?:number|null;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean};
export type GenreHipOutputV742={hip:HipDanceSettingsV735;studio:HipStudioSettingsV738;
 active:boolean;style:ResolvedDanceStyleV666|null;section:GenreHipSectionV742;
 mode:HipDanceModeV735};
/** Only automate when the user explicitly left the hip selector on 'auto'.
 * Existing transition controller crossfades between these phrase selections.
 * The user-set per-clip gains remain authoritative; we merely scale modestly.
 */
export function directGenreHipV742(input:GenreHipInputV742):GenreHipOutputV742{
 const hip=normalizeHipDanceV735(input.hip),studio=normalizeHipStudioV738(input.studio);
 const config=normalizeGenreHipV742(input.config),section=classifyGenreHipSectionV742(input.section);
 const unchanged=():GenreHipOutputV742=>({hip,studio,active:false,style:null,section,mode:hip.mode});
 if(!config.enabled||config.strength===0||hip.mode!=='auto'||!input.playing||input.reducedMotion||input.manualPriority||
   !finite(input.seconds)||input.seconds<0||hip.strength===0)return unchanged();
 const style=config.style==='auto'?resolveGenreDanceStyleV666(input.genre):config.style;
 if(!style)return unchanged();
 // Eight-beat phrases; modulo prevents overflow on extreme but finite timers.
 const bpm=finite(input.bpm)&&input.bpm>0?clamp(input.bpm,65,190):120;
 const phrase=Math.floor(((input.seconds%86400)*bpm/60)/8);
 const sequence=PATTERNS[style][section];
 const mode=sequence[phrase%sequence.length];
 const t=config.strength/100;
 const passage=section==='quiet'?.48:section==='verse'?.86:section==='hook'?1:1.06;
 const hipStrength=clamp(Math.round(hip.strength*(1+t*(passage-1))),0,100);
 const scale=(k:HipClip,original:number)=>Math.round(clamp(original*(1+(MIX[style][k]-1)*t),0,150));
 return {active:true,style,section,mode,
  hip:{...hip,mode,strength:hipStrength},
  studio:{...studio,swayStrength:scale('Hip_Sway',studio.swayStrength),
   circleStrength:scale('Hip_Circle',studio.circleStrength),bounceStrength:scale('Hip_Bounce',studio.bounceStrength)}};
}
