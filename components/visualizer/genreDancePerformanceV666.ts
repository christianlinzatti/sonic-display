/** V666.1 – automatic genre expression on existing additive GLB rig overlays.
 * Existing installed GLB clips are chosen by V536; this layer does not generate
 * animation clips, root translations, foot contacts or phonemes.
 */
import type {AvatarRigMotion} from './avatarRigController';

export type DanceStyleV666 = 'auto'|'deutschrap'|'hardstyle'|'hardtekk'|'rock'|'pop';
export type ResolvedDanceStyleV666 = Exclude<DanceStyleV666,'auto'>;
export type GenreDanceSettingsV666 = {enabled:boolean;strength:number;style:DanceStyleV666};
export const GENRE_DANCE_SETTINGS_KEY_V666='sonic-genre-dance-performance-v666';
export const GENRE_DANCE_SETTINGS_EVENT_V666='sonic:genre-dance-performance-v666';
export const DEFAULT_GENRE_DANCE_SETTINGS_V666:GenreDanceSettingsV666={enabled:true,strength:65,style:'auto'};
const styles:readonly DanceStyleV666[]=['auto','deutschrap','hardstyle','hardtekk','rock','pop'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function normalizeGenreDanceSettingsV666(value:unknown):GenreDanceSettingsV666{
 const v=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<GenreDanceSettingsV666>:{};
 // Missing (legacy/new-device) settings enable the conservative automatic genre mode.
 // An explicitly stored false always wins; corrupt explicit flags fail closed.
 return {enabled:Object.prototype.hasOwnProperty.call(v,'enabled')?v.enabled===true:DEFAULT_GENRE_DANCE_SETTINGS_V666.enabled,
  strength:finite(v.strength)?Math.round(clamp(v.strength,0,100)):65,
  style:typeof v.style==='string'&&styles.includes(v.style as DanceStyleV666)?v.style as DanceStyleV666:'auto'};
}
let cached:GenreDanceSettingsV666|null=null;
export function readGenreDanceSettingsV666():GenreDanceSettingsV666{
 if(cached)return cached;
 if(typeof window==='undefined')return {...DEFAULT_GENRE_DANCE_SETTINGS_V666};
 try{cached=normalizeGenreDanceSettingsV666(JSON.parse(window.localStorage.getItem(GENRE_DANCE_SETTINGS_KEY_V666)||'null'));}
 catch{cached={...DEFAULT_GENRE_DANCE_SETTINGS_V666};}
 return cached;
}
export function refreshGenreDanceSettingsV666(){cached=null;return readGenreDanceSettingsV666();}
export function writeGenreDanceSettingsV666(value:unknown):boolean{
 const next=normalizeGenreDanceSettingsV666(value);
 if(typeof window==='undefined')return false;
 try{window.localStorage.setItem(GENRE_DANCE_SETTINGS_KEY_V666,JSON.stringify(next));}
 catch{return false;}
 cached=next;
 try{window.dispatchEvent(new Event(GENRE_DANCE_SETTINGS_EVENT_V666));}catch{/* saved */}
 return true;
}
/** Explicit genre source only. Unrecognized / missing tags bypass this feature. */
export function resolveGenreDanceStyleV666(raw:string|null|undefined):ResolvedDanceStyleV666|null{
 const g=(raw??'').trim().toLowerCase().replace(/[\s_-]/g,'');
 if(!g)return null;
 if(/hardtekk|hardtek|tekk|tekno/.test(g))return 'hardtekk';
 if(/hardstyle|rawstyle|jumpstyle|hardcore|uptempo|gabber/.test(g))return 'hardstyle';
 if(/deutschrap|germanrap|hiphop|hip-hop|trap|drill|boombap|rap/.test(g))return 'deutschrap';
 if(/rock|metal|punk/.test(g))return 'rock';
 if(/pop/.test(g))return 'pop';
 return null;
}
export type GenreDanceStateV666={trackId:string;modelId:string;style:ResolvedDanceStyleV666|null;lastSeconds:number;blend:number};
export const newGenreDanceStateV666=():GenreDanceStateV666=>({trackId:'',modelId:'',style:null,lastSeconds:-1,blend:0});
export type GenreDanceInputV666={settings:GenreDanceSettingsV666;trackId?:string|null;modelId:string;
 genre?:string|null;section?:string|null;seconds:number;delta:number;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;quality:string;energy?:number|null;kick?:number|null;snare?:number|null;
 footContactKnown:boolean;plantedLeft:boolean;plantedRight:boolean};
const CHANNELS=['headNod','shoulderRoll','chestPulse','armSwing','spineSway','hipSway','followThrough',
 'headLag','leftArmAccent','rightArmAccent','torsoTwist','counterArm'] as const;
type Channel=typeof CHANNELS[number];
type Gains=Partial<Record<Channel,number>>;
/** Each genre changes *different* existing expressive channels, never mouth, leg or foot control. */
const GAINS:Record<ResolvedDanceStyleV666,Gains>={
 deutschrap:{headNod:1.15,shoulderRoll:1.13,armSwing:1.11,chestPulse:1.07,spineSway:.96,hipSway:1.04},
 hardstyle:{headNod:1.08,shoulderRoll:1.10,chestPulse:1.16,armSwing:1.07,hipSway:.88,followThrough:.92},
 hardtekk:{headNod:1.04,shoulderRoll:1.07,chestPulse:1.12,armSwing:1.08,hipSway:1.10,spineSway:1.07},
 rock:{headNod:1.16,shoulderRoll:1.13,chestPulse:1.06,armSwing:1.09,hipSway:.94,headLag:1.10},
 pop:{headNod:.94,shoulderRoll:1.04,chestPulse:1.06,armSwing:1.11,hipSway:1.13,spineSway:1.12,followThrough:1.09},
};
const sectionType=(name:string|null|undefined)=>{
 const v=(name??'').toLowerCase();
 if(/intro|outro|break|bridge|quiet|pause|interlude/.test(v))return 'quiet';
 if(/drop|climax|peak/.test(v))return 'drop';
 if(/hook|chorus|refrain/.test(v))return 'hook';
 return 'verse';
};
/** Deterministic, bounded: only scales existing channels by at most 16%.
 * Existing foot contact & V665 grounding, manual keyframes and singer actions win.
 * No unconfirmed genre -> no invented choreography. */
export function stepGenreDanceV666<T extends AvatarRigMotion>(state:GenreDanceStateV666,base:T,input:GenreDanceInputV666):{
 state:GenreDanceStateV666;motion:T;active:boolean;style:ResolvedDanceStyleV666|null}{
 const bypass=()=>({state:newGenreDanceStateV666(),motion:base,active:false,style:null});
 const p=input;
 const style=p.settings.style==='auto'?resolveGenreDanceStyleV666(p.genre):
  styles.includes(p.settings.style)?p.settings.style as ResolvedDanceStyleV666:null;
 if(!p.settings.enabled||!finite(p.settings.strength)||p.settings.strength<=0||!style||
  !p.trackId?.trim()||!p.modelId?.trim()||!p.playing||p.reducedMotion||p.manualPriority||
  p.quality==='low'||!finite(p.seconds)||p.seconds<0||!finite(p.delta)||p.delta<=0||p.delta>.15||
  !CHANNELS.every(k=>base[k]===undefined||finite(base[k]))||
  !finite(p.energy??0)||!finite(p.kick??0)||!finite(p.snare??0))return bypass();
 const changed=state.trackId!==p.trackId||state.modelId!==p.modelId||state.style!==style||
  state.lastSeconds<0||p.seconds<state.lastSeconds-.08||p.seconds-state.lastSeconds>.4;
 const prev=changed?newGenreDanceStateV666():state;
 const blend=clamp(prev.blend+(1-prev.blend)*(1-Math.exp(-p.delta/.34)),0,1);
 const energy=clamp(p.energy??.5,0,1),kick=clamp(p.kick??0,0,1),snare=clamp(p.snare??0,0,1);
 const section=sectionType(p.section);
 // Quiet passages should be restrained, drops/hook allow slightly stronger style.
 const passage=section==='quiet'?.32:section==='verse'?.78:section==='hook'?.95:1;
 const intensity=clamp(p.settings.strength/100,0,1)*blend*passage*(.7+.3*energy);
 const accents=style==='deutschrap'?.5+.5*snare:style==='hardstyle'||style==='hardtekk'?.5+.5*kick:.75+.25*Math.max(kick,snare);
 const nextState:GenreDanceStateV666={trackId:p.trackId,modelId:p.modelId,style,lastSeconds:p.seconds,blend};
 const factors=GAINS[style];
 // Stable contact: do not exaggerate hip sways while either foot is planted.
 const hipSafe=p.footContactKnown&&!p.plantedLeft&&!p.plantedRight;
 const motion={...base} as T;
 for(const key of CHANNELS){
  const value=base[key],target=factors[key];
  if(value===undefined||target===undefined)continue;
  const movement=key==='hipSway'&&!hipSafe?Math.min(1,target):target;
  const gain=clamp(1+(movement-1)*intensity*accents,.84,1.16);
  // Indexed channel write is safe: the declared keys are numeric rig channels only.
  (motion as Record<Channel,number|undefined>)[key]=value*gain;
 }
 return {state:nextState,motion,active:true,style};
}
