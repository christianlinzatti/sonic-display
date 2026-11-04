/** V916 – Offline, deterministic Govee concert preset library.
 * Presets generate editable V912 shows for selected private-LAN lights only.
 * No bridge credentials, network requests, power commands or RGBIC segment claims.
 */
import {isGoveeLanIpV909, type GoveeColorV909} from '@/lib/goveeLanV909';
import {GOVEE_PHASES_V912,hexToGoveeColorV912,normalizeGoveeCueV912,replaceGoveeShowCueV912,
 type GoveeShowCueV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';
import type {GoveePhaseV911,GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {GoveeTransitionCurveV914,GoveeMotionStyleV914} from '@/lib/goveeTransitionsV914';

export const GOVEE_PRESET_FAVORITES_KEY_V916='sonic-display:govee-preset-favorites-v916';
export const GOVEE_PRESET_FAVORITES_EVENT_V916='sonic-display:govee-preset-favorites-changed-v916';
export type GoveePresetGenreV916='deutschrap'|'hardtekk'|'hardstyle'|'deutschrock';
export type GoveePresetV916={
 id:string;genre:GoveePresetGenreV916;name:string;description:string;
 palette:Readonly<{wall:string;rhythm:string;neon:string;ambient:string;hook:string;drop:string}>;
 brightnessScale:number;fadeMs:number;curve:GoveeTransitionCurveV914;motion:GoveeMotionStyleV914;
};
/** Two deliberately different, nonflashing looks per genre, with four roles. */
export const GOVEE_PRESETS_V916:readonly GoveePresetV916[]=[
 {id:'rap_nachtstadt',genre:'deutschrap',name:'Deutschrap · Nachtstadt',description:'Dunkles Rot, Violett und kühles Neon für filmische Rap-Verse.',
  palette:{wall:'#75182f',rhythm:'#5521a6',neon:'#2574bc',ambient:'#a34e38',hook:'#c42a73',drop:'#da3851'},brightnessScale:.84,fadeMs:5400,curve:'cinematic',motion:'steady'},
 {id:'rap_goldene_hook',genre:'deutschrap',name:'Deutschrap · Goldene Hook',description:'Warme Bernsteinfarben mit kräftigen Magenta-Akzenten in der Hook.',
  palette:{wall:'#963e2b',rhythm:'#842b68',neon:'#c66b36',ambient:'#cf8757',hook:'#efae4f',drop:'#d64183'},brightnessScale:.91,fadeMs:4200,curve:'smooth',motion:'steady'},
 {id:'tekk_neon_rave',genre:'hardtekk',name:'Hardtekk · Neon Rave',description:'Elektrisches Cyan, Violett und Pink mit deutlichen Drop-Akzenten.',
  palette:{wall:'#254dca',rhythm:'#b027d8',neon:'#00c5db',ambient:'#693fb4',hook:'#d529ad',drop:'#18dcf4'},brightnessScale:1,fadeMs:2400,curve:'ease-out',motion:'steady'},
 {id:'tekk_industrial_rush',genre:'hardtekk',name:'Hardtekk · Industrial Rush',description:'Kühles Stahlblau und aggressives Rot, ohne schnelle Blitzfolgen.',
  palette:{wall:'#263c87',rhythm:'#bd2f59',neon:'#536ee9',ambient:'#652f5f',hook:'#e94755',drop:'#ee376b'},brightnessScale:.98,fadeMs:2600,curve:'ease-out',motion:'steady'},
 {id:'hardstyle_euphoric',genre:'hardstyle',name:'Hardstyle · Euphoric Sky',description:'Große Blau-Cyan-Flächen und warme, aufsteigende Hook-Farben.',
  palette:{wall:'#2864d9',rhythm:'#a33de6',neon:'#35c6ec',ambient:'#5168a1',hook:'#b571fa',drop:'#18e0e6'},brightnessScale:.93,fadeMs:3600,curve:'sine',motion:'steady'},
 {id:'hardstyle_raw_arena',genre:'hardstyle',name:'Hardstyle · Raw Arena',description:'Dunkles Violett und Rot für einen druckvollen Arena-Look.',
  palette:{wall:'#492889',rhythm:'#b61b64',neon:'#8351e8',ambient:'#703e61',hook:'#d63c99',drop:'#ef326b'},brightnessScale:1,fadeMs:2400,curve:'ease-out',motion:'steady'},
 {id:'rock_rote_arena',genre:'deutschrock',name:'Deutschrock · Rote Arena',description:'Rote Bühnenflächen, warmes Orange und kraftvolle Refrains.',
  palette:{wall:'#9f3021',rhythm:'#8a213e',neon:'#c84c1a',ambient:'#ac5c36',hook:'#eb702c',drop:'#ee5425'},brightnessScale:.92,fadeMs:3800,curve:'smooth',motion:'steady'},
 {id:'rock_stahlblau',genre:'deutschrock',name:'Deutschrock · Stahl & Glut',description:'Industrial-Blau, tiefes Rot und glühende Orange-Akzente.',
  palette:{wall:'#344773',rhythm:'#842b45',neon:'#4369ae',ambient:'#894a36',hook:'#ba5739',drop:'#e45e36'},brightnessScale:.87,fadeMs:5200,curve:'cinematic',motion:'steady'},
];
export type GoveePresetTargetV916={ip:string;role:GoveeRoleV911};
const ROLES:readonly GoveeRoleV911[]=['wall','rhythm','neon','ambient'];
const phaseBrightness:Record<GoveePhaseV911,number>={ambient:34,verse:49,hook:80,build:68,drop:97,break:28};
const roleBrightness:Record<GoveeRoleV911,number>={wall:1,rhythm:.93,neon:.98,ambient:.73};
const cap=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(value)?value:min));
function mixColor(a:GoveeColorV909,b:GoveeColorV909,t:number):GoveeColorV909{
 const blend=cap(t,0,1);
 return {r:Math.round(a.r+(b.r-a.r)*blend),g:Math.round(a.g+(b.g-a.g)*blend),b:Math.round(a.b+(b.b-a.b)*blend)};
}
export function getGoveePresetV916(id:string):GoveePresetV916|undefined{
 return GOVEE_PRESETS_V916.find(p=>p.id===id);
}
export function recommendGoveePresetIdV916(genre:string):string{
 const text=String(genre??'').toLowerCase();
 if(/hardtekk|hardtek|tekk|tekno/.test(text))return 'tekk_neon_rave';
 if(/hardstyle|rawstyle|hardcore/.test(text))return 'hardstyle_euphoric';
 if(/deutschrock|rock|metal|industrial|ndh/.test(text))return 'rock_rote_arena';
 return 'rap_nachtstadt';
}
/** One complete V912 cue for one phase/role. All output uses whole-device RGB. */
export function getGoveePresetCueV916(id:string,role:GoveeRoleV911,phase:GoveePhaseV911):GoveeShowCueV912|null{
 const preset=getGoveePresetV916(id);
 if(!preset||!ROLES.includes(role)||!GOVEE_PHASES_V912.includes(phase))return null;
 const palette=preset.palette;
 const base=hexToGoveeColorV912(palette[role]);
 const focus=hexToGoveeColorV912(phase==='drop'?palette.drop:phase==='hook'?palette.hook:phase==='build'?palette.neon:palette[role]);
 const emphasis=phase==='drop'?.67:phase==='hook'?.55:phase==='build'?.26:0;
 const color=mixColor(base,focus,emphasis);
 const brightness=Math.round(cap(phaseBrightness[phase]*roleBrightness[role]*preset.brightnessScale,20,100));
 const fadeMs=phase==='drop'?Math.max(1400,Math.round(preset.fadeMs*.67)):phase==='build'?Math.min(12000,Math.round(preset.fadeMs*1.35)):preset.fadeMs;
 const curveV914=phase==='build'?'cinematic':phase==='drop'?'ease-out':preset.curve;
 const motionV914=phase==='ambient'||phase==='break'?'breath':phase==='build'?'lift':preset.motion;
 return normalizeGoveeCueV912({color,brightness,fadeMs,curveV914,motionV914});
}
/** Replace cues only for explicitly selected, private IPv4 lamps. Never mutates the show. */
export function applyGoveePresetToShowV916(show:GoveeShowV912,presetId:string,targets:readonly GoveePresetTargetV916[],
 scope:'phase'|'all',phase:GoveePhaseV911):GoveeShowV912{
 if(!getGoveePresetV916(presetId)||!['phase','all'].includes(scope)||!GOVEE_PHASES_V912.includes(phase))return show;
 let result=show;
 const visited=new Set<string>();
 for(const target of targets.slice(0,32)){
  if(!isGoveeLanIpV909(target.ip)||!ROLES.includes(target.role)||visited.has(target.ip))continue;
  visited.add(target.ip);
  for(const section of scope==='all'?GOVEE_PHASES_V912:[phase]){
   const cue=getGoveePresetCueV916(presetId,target.role,section);
   if(cue)result=replaceGoveeShowCueV912(result,target.ip,section,cue);
  }
 }
 return result;
}
/** A preset becomes a regular editable V912 show; never installed silently. */
export function createGoveePresetShowV916(presetId:string,targets:readonly GoveePresetTargetV916[],id:string,now:number):GoveeShowV912|null{
 const preset=getGoveePresetV916(presetId);
 if(!preset||typeof id!=='string'||!/^[a-zA-Z0-9_-]{4,72}$/.test(id)||!Number.isFinite(now)||now<0||now>4102444800000)return null;
 const show:GoveeShowV912={schema:'govee-light-show-v912',id,name:preset.name.slice(0,48),createdAt:now,updatedAt:now,cues:{}};
 const next=applyGoveePresetToShowV916(show,presetId,targets,'all','ambient');
 return Object.keys(next.cues).length>0?next:null;
}
export function normalizeGoveePresetFavoritesV916(raw:unknown):string[]{
 if(!Array.isArray(raw))return [];
 const seen=new Set<string>();const favorites:string[]=[];
 for(const item of raw.slice(0,32)){
  if(typeof item==='string'&&getGoveePresetV916(item)&&!seen.has(item)){
   seen.add(item);favorites.push(item);
  }
  if(favorites.length>=GOVEE_PRESETS_V916.length)break;
 }
 return favorites;
}
export function loadGoveePresetFavoritesV916():string[]{
 if(typeof window==='undefined')return [];
 try{return normalizeGoveePresetFavoritesV916(JSON.parse(localStorage.getItem(GOVEE_PRESET_FAVORITES_KEY_V916)||'[]'));}
 catch{return [];}
}
export function saveGoveePresetFavoritesV916(ids:readonly string[]):string[]{
 const safe=normalizeGoveePresetFavoritesV916(ids);
 localStorage.setItem(GOVEE_PRESET_FAVORITES_KEY_V916,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_PRESET_FAVORITES_EVENT_V916));
 return safe;
}
