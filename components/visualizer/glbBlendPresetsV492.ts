/** V492: validated, model-scoped, opt-in GLB blend presets.
 * No GLB modification. All loaded data is untrusted (including localStorage). */
import {isPreviewBlendTrackV491,previewBlendWeightV491,type PreviewBlendRegionV491} from './glbMotionBlendPreviewV491';

export const GLB_BLEND_PRESETS_KEY_V492='sonic-display-glb-blend-presets-v492';
export const GLB_BLEND_CHANGE_V492='sonic-glb-blend-presets-changed-v492';
export const GLB_BLEND_PRESET_LIMIT_V492=40;
export type BlendGenreV492='all'|'rap'|'hard';
export type BlendClipReferenceV492={id:string;name:string};
export type GlbBlendPresetV492={
  version:1;id:string;name:string;modelUrl:string;animationUrl:string;
  base:BlendClipReferenceV492;overlay:BlendClipReferenceV492;
  region:PreviewBlendRegionV491;weight:number;genre:BlendGenreV492;autoEnabled:boolean;
};
export type BlendClipInfoV492={id:string;name:string;duration:number;tracks:readonly {name:string}[]};
const obj=(x:unknown):x is Record<string,unknown>=>typeof x==='object'&&x!==null&&!Array.isArray(x);
const str=(x:unknown,max:number)=>typeof x==='string'&&x.length>0&&x.length<=max;
export const scopedBlendPresetsV492=(all:readonly GlbBlendPresetV492[],modelUrl:string,animationUrl='')=>
  all.filter(p=>p.modelUrl===modelUrl&&p.animationUrl===animationUrl);

export function validBlendPresetV492(value:unknown):value is GlbBlendPresetV492{
  if(!obj(value)||value.version!==1||!str(value.id,100)||!str(value.name,60)||!str(value.modelUrl,2048)
    ||typeof value.animationUrl!=='string'||value.animationUrl.length>2048
    ||!obj(value.base)||!obj(value.overlay)
    ||!str(value.base.id,100)||!str(value.base.name,250)
    ||!str(value.overlay.id,100)||!str(value.overlay.name,250)
    ||!(/^(embedded|external):\d+$/.test(value.base.id as string))
    ||!(/^(embedded|external):\d+$/.test(value.overlay.id as string))
    ||value.base.id===value.overlay.id||value.base.name===value.overlay.name
    ||!(value.region==='arms'||value.region==='upper')
    ||typeof value.weight!=='number'||!Number.isFinite(value.weight)||value.weight<=0||value.weight>.5
    ||!(value.genre==='all'||value.genre==='rap'||value.genre==='hard')||typeof value.autoEnabled!=='boolean')return false;
  return true;
}
/** Never import code/assets; only a tightly bounded JSON settings document. */
export function parseBlendPresetsV492(json:string):GlbBlendPresetV492[]{
  if(json.length>128_000)throw new Error('Preset-Datei zu groß (maximal 128 KB).');
  let value:unknown;
  try{value=JSON.parse(json);}catch{throw new Error('Ungültiges JSON.');}
  if(!obj(value)||value.format!=='sonic-glb-blends-v492'||value.version!==1||!Array.isArray(value.presets)
    ||value.presets.length>GLB_BLEND_PRESET_LIMIT_V492)throw new Error('Ungültiges Preset-Format oder zu viele Einträge.');
  if(!value.presets.every(validBlendPresetV492))throw new Error('Mindestens ein GLB-Preset ist ungültig.');
  const seen=new Set<string>();
  return value.presets.filter((p:GlbBlendPresetV492)=>!seen.has(p.id)&&!!seen.add(p.id));
}
export function serializeBlendPresetsV492(presets:readonly GlbBlendPresetV492[]):string{
  const valid=presets.filter(validBlendPresetV492).slice(0,GLB_BLEND_PRESET_LIMIT_V492);
  return JSON.stringify({format:'sonic-glb-blends-v492',version:1,presets:valid},null,2);
}
export function readBlendPresetsV492():GlbBlendPresetV492[]{
  if(typeof window==='undefined')return [];
  try{return parseBlendPresetsV492(localStorage.getItem(GLB_BLEND_PRESETS_KEY_V492)??'');}catch{return [];}
}
export function writeBlendPresetsV492(presets:readonly GlbBlendPresetV492[]):void{
  if(typeof window==='undefined')return;
  localStorage.setItem(GLB_BLEND_PRESETS_KEY_V492,serializeBlendPresetsV492(presets));
  window.dispatchEvent(new Event(GLB_BLEND_CHANGE_V492));
}
export function mergeBlendPresetsV492(current:readonly GlbBlendPresetV492[],incoming:readonly GlbBlendPresetV492[]):GlbBlendPresetV492[]{
  const merged=new Map(current.filter(validBlendPresetV492).map(p=>[p.id,p]));
  for(const entry of incoming.filter(validBlendPresetV492))merged.set(entry.id,entry);
  if(merged.size>GLB_BLEND_PRESET_LIMIT_V492)throw new Error(`Maximal ${GLB_BLEND_PRESET_LIMIT_V492} Presets erlaubt.`);
  return [...merged.values()];
}
/** Both stable ID *and* original clip name must match. No index-only fallback
 * (e.g. after inserting a new imported animation). */
export function resolvePresetPreviewV492<T extends BlendClipInfoV492>(preset:GlbBlendPresetV492,clips:readonly T[]):
  {base:T;overlay:T;weight:number;trackNames:string[]}|null{
  const base=clips.find(c=>c.id===preset.base.id&&c.name===preset.base.name);
  const overlay=clips.find(c=>c.id===preset.overlay.id&&c.name===preset.overlay.name);
  if(!base||!overlay||base===overlay||base.name===overlay.name||!Number.isFinite(overlay.duration)||overlay.duration<=0)return null;
  const trackNames=overlay.tracks.map(t=>t.name).filter(n=>isPreviewBlendTrackV491(n,preset.region));
  const weight=previewBlendWeightV491(preset.weight);
  return trackNames.length&&weight>0?{base,overlay,weight,trackNames}:null;
}
export function matchesBlendGenreV492(tag:BlendGenreV492,genre:string|null|undefined):boolean{
  return tag==='all'||(tag==='rap'&&/rap|hip.?hop|trap|drill/i.test(genre??''))||
    (tag==='hard'&&/hardstyle|hardtekk|hardcore|gabber/i.test(genre??''));
}
/** Live data requires exact unique clip names, model scope, and a matching
 * playing primary clip. No override of dance-director primary animation. */
export function chooseLiveBlendPresetV492<T extends {name:string;duration:number;tracks:readonly {name:string}[]}>(
  presets:readonly GlbBlendPresetV492[],clips:readonly T[],modelUrl:string,animationUrl:string,
  selectedClipName:string|null|undefined,genre:string|null|undefined
):{preset:GlbBlendPresetV492;overlay:T;trackNames:string[]}|null{
  if(!selectedClipName)return null;
  for(const preset of presets){
    if(!preset.autoEnabled||preset.modelUrl!==modelUrl||preset.animationUrl!==animationUrl
      ||!matchesBlendGenreV492(preset.genre,genre))continue;
    // Strict mapping: embedded and external indices must still denote same named clips.
    const baseIndex=Number(preset.base.id.split(':')[1]);
    const overlayIndex=Number(preset.overlay.id.split(':')[1]);
    const embedded=clips.filter(c=>!c.name.startsWith('Imported: ')&&!c.name.startsWith('Library:'));
    const external=clips.filter(c=>c.name.startsWith('Imported: '));
    const resolve=(ref:BlendClipReferenceV492,index:number)=>{
      const group=ref.id.startsWith('embedded:')?embedded:external;
      const clip=group[index];
      const runtimeName=ref.id.startsWith('external:')?`Imported: ${ref.name}`:ref.name;
      return clip?.name===runtimeName&&clips.filter(c=>c.name===runtimeName).length===1?clip:null;
    };
    const base=resolve(preset.base,baseIndex),overlay=resolve(preset.overlay,overlayIndex);
    if(!base||!overlay||base===overlay||base.name!==selectedClipName||!Number.isFinite(overlay.duration)||overlay.duration<=0)continue;
    const trackNames=overlay.tracks.map(t=>t.name).filter(n=>isPreviewBlendTrackV491(n,preset.region));
    if(trackNames.length>0)return {preset,overlay,trackNames};
  }
  return null;
}
