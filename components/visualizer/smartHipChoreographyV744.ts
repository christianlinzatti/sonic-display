/** V744 Smart Choreography 3.0 – song-clock-driven, genre-aware hip phrase
 * variation. This only selects existing V735 procedural modes; it never
 * touches bones, root transforms, GLB actions, foot contacts, or the IK solver.
 */
import type {HipDanceModeV735, HipDanceSettingsV735} from './hipDanceV735';
import type {HipStudioSettingsV738} from './hipMotionStudioV738';
import type {GenreHipOutputV742} from './genreHipIntelligenceV742';

export type ChoreographySectionV744='intro'|'verse'|'hook'|'build'|'drop'|'break'|'outro';
export type SmartHipSettingsV744={enabled:boolean;variety:number;dynamics:number;phraseBeats:8|16};
export const DEFAULT_SMART_HIP_V744:Readonly<SmartHipSettingsV744>={enabled:true,variety:75,dynamics:65,phraseBeats:8};
type HipClip=Exclude<HipDanceModeV735,'off'|'auto'>;
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
const percentage=(n:unknown,fallback:number)=>finite(n)?Math.round(clamp(n,0,100)):fallback;
export function normalizeSmartHipV744(raw:Partial<SmartHipSettingsV744>|null|undefined):SmartHipSettingsV744{
 return {enabled:raw?.enabled===undefined?true:raw.enabled===true,
  variety:percentage(raw?.variety,75),dynamics:percentage(raw?.dynamics,65),
  phraseBeats:raw?.phraseBeats===16?16:8};
}
export function classifyHipSectionV744(raw:string|null|undefined):ChoreographySectionV744{
 const s=(raw??'').trim().toLowerCase();
 if(/outro|ending|finale|end\b/.test(s))return 'outro';
 if(/build|riser|buildup|pre.?drop|steigerung|pre.?chorus/.test(s))return 'build';
 if(/drop|climax|peak/.test(s))return 'drop';
 if(/hook|chorus|refrain/.test(s))return 'hook';
 if(/intro|opening/.test(s))return 'intro';
 if(/bridge|break|quiet|interlude|pause|instrumental/.test(s))return 'break';
 return 'verse';
}
/** Three-way weighted pools leave room for style identity and non-repeating
 * adjacent phrases. The order intentionally supplies the calm/default motif. */
const POOLS:Record<string,Record<ChoreographySectionV744,readonly HipClip[]>>={
 deutschrap:{intro:['Hip_Sway','Hip_Circle','Hip_Bounce'],verse:['Hip_Sway','Hip_Circle','Hip_Bounce'],hook:['Hip_Circle','Hip_Sway','Hip_Bounce'],build:['Hip_Sway','Hip_Circle','Hip_Bounce'],drop:['Hip_Bounce','Hip_Sway','Hip_Circle'],break:['Hip_Sway','Hip_Circle','Hip_Bounce'],outro:['Hip_Sway','Hip_Circle','Hip_Bounce']},
 hardtekk:{intro:['Hip_Sway','Hip_Circle','Hip_Bounce'],verse:['Hip_Circle','Hip_Bounce','Hip_Sway'],hook:['Hip_Bounce','Hip_Circle','Hip_Sway'],build:['Hip_Circle','Hip_Bounce','Hip_Sway'],drop:['Hip_Bounce','Hip_Circle','Hip_Sway'],break:['Hip_Sway','Hip_Circle','Hip_Bounce'],outro:['Hip_Sway','Hip_Circle','Hip_Bounce']},
 hardstyle:{intro:['Hip_Sway','Hip_Bounce','Hip_Circle'],verse:['Hip_Bounce','Hip_Sway','Hip_Circle'],hook:['Hip_Bounce','Hip_Circle','Hip_Sway'],build:['Hip_Bounce','Hip_Sway','Hip_Circle'],drop:['Hip_Bounce','Hip_Circle','Hip_Sway'],break:['Hip_Sway','Hip_Bounce','Hip_Circle'],outro:['Hip_Sway','Hip_Circle','Hip_Bounce']},
 rock:{intro:['Hip_Sway','Hip_Bounce','Hip_Circle'],verse:['Hip_Sway','Hip_Bounce','Hip_Circle'],hook:['Hip_Sway','Hip_Bounce','Hip_Circle'],build:['Hip_Sway','Hip_Bounce','Hip_Circle'],drop:['Hip_Bounce','Hip_Sway','Hip_Circle'],break:['Hip_Sway','Hip_Circle','Hip_Bounce'],outro:['Hip_Sway','Hip_Bounce','Hip_Circle']},
 pop:{intro:['Hip_Sway','Hip_Circle','Hip_Bounce'],verse:['Hip_Sway','Hip_Circle','Hip_Bounce'],hook:['Hip_Circle','Hip_Sway','Hip_Bounce'],build:['Hip_Circle','Hip_Bounce','Hip_Sway'],drop:['Hip_Bounce','Hip_Circle','Hip_Sway'],break:['Hip_Sway','Hip_Circle','Hip_Bounce'],outro:['Hip_Sway','Hip_Circle','Hip_Bounce']},
};
const SECTION_ENERGY:Record<ChoreographySectionV744,number>={intro:.42,verse:.76,hook:1.05,build:.77,drop:1.14,break:.4,outro:.4};
/** FNV-1a with a fixed seed; identical track/phrase always gets the same
 * candidate, and no Math.random() / elapsed-frame dependency is involved. */
function hash(s:string):number{
 let h=2166136261;
 for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;
 return h;
}
export type SmartHipStateV744={lastTrack:string|null;lastSeconds:number|null;
 phraseKey:string|null;lastMode:HipClip|null;previousMode:HipClip|null;chosen:HipClip|null};
export function createSmartHipStateV744():SmartHipStateV744{
 return {lastTrack:null,lastSeconds:null,phraseKey:null,lastMode:null,previousMode:null,chosen:null};
}
export function resetSmartHipV744(s:SmartHipStateV744):void{
 s.lastTrack=null;s.lastSeconds=null;s.phraseKey=null;s.lastMode=null;s.previousMode=null;s.chosen=null;
}
export type SmartHipInputV744={settings?:Partial<SmartHipSettingsV744>|null;
 plan:GenreHipOutputV742;originalHip:HipDanceSettingsV735;
 seconds:number;bpm?:number|null;section?:string|null;trackId?:string|null;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean};
export type SmartHipOutputV744={hip:HipDanceSettingsV735;studio:HipStudioSettingsV738;
 active:boolean;mode:HipDanceModeV735;section:ChoreographySectionV744;phrase:number};
export function directSmartHipV744(s:SmartHipStateV744,input:SmartHipInputV744):SmartHipOutputV744{
 const cfg=normalizeSmartHipV744(input.settings);
 const section=classifyHipSectionV744(input.section);
 const unchanged=():SmartHipOutputV744=>({hip:input.plan.hip,studio:input.plan.studio,
   active:false,mode:input.plan.hip.mode,section,phrase:0});
 const allowed=cfg.enabled&&input.plan.active&&input.originalHip.mode==='auto'&&
   input.originalHip.strength>0&&input.playing&&!input.reducedMotion&&!input.manualPriority&&
   finite(input.seconds)&&input.seconds>=0;
 if(!allowed){resetSmartHipV744(s);return unchanged();}
 const style=input.plan.style;
 if(!style||!POOLS[style]){resetSmartHipV744(s);return unchanged();}
 const track=input.trackId??'';
 if(s.lastTrack!==null&&s.lastTrack!==track ||
   s.lastSeconds!==null&&(input.seconds<s.lastSeconds-.18||input.seconds-s.lastSeconds>2.5))resetSmartHipV744(s);
 s.lastTrack=track;s.lastSeconds=input.seconds;
 const bpm=finite(input.bpm)&&input.bpm>0?clamp(input.bpm,65,190):120;
 // Bounding the clock avoids integer precision loss on malformed timestamps.
 const phrase=Math.floor(((input.seconds%86400)*bpm/60)/cfg.phraseBeats);
 const key=`${style}:${section}:${phrase}:${cfg.phraseBeats}:${cfg.variety}`;
 if(s.phraseKey!==key){
   const pool=POOLS[style][section];
   const seed=hash(`${track}:${key}`);
   // Low variety favours the genre/section signature; higher variety increases
   // access to both alternatives without changing every animation frame.
   let slot=cfg.variety===0?0:seed%100<Math.round(100-cfg.variety*.7)?0:1+(Math.floor(seed/101)%2);
   let selected=pool[slot];
   if(cfg.variety>0&&s.lastMode===selected){
     const options=pool.filter(m=>m!==s.lastMode);
     selected=options[(seed>>>11)%options.length];
   }
   s.previousMode=s.lastMode;s.lastMode=selected;s.chosen=selected;s.phraseKey=key;
 }
 const mode=s.chosen??input.plan.mode as HipClip;
 const dynamic=cfg.dynamics/100;
 // In build-ups we gently ramp emphasis over each phrase, while a section
 // change remains C1-smooth through the existing V738 transition mixer.
 const phraseProgress=(((input.seconds%86400)*bpm/60)/cfg.phraseBeats)%1;
 const passage=section==='build'?(SECTION_ENERGY.build+.3*phraseProgress):SECTION_ENERGY[section];
 const scale=1+dynamic*(passage-1)*.32;
 const hipStrength=clamp(Math.round(input.plan.hip.strength*scale),0,100);
 const clipKey=mode==='Hip_Sway'?'swayStrength':mode==='Hip_Circle'?'circleStrength':'bounceStrength';
 const studio={...input.plan.studio,[clipKey]:clamp(Math.round(input.plan.studio[clipKey]*scale),0,150)};
 return {hip:{...input.plan.hip,mode,strength:hipStrength},studio,active:true,mode,section,phrase};
}
