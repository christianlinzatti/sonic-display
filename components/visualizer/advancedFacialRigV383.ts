import {FACIAL_CHANNELS_V370,type FacialChannelV370,type FacialProfileV370} from './facialRigStudioV370';

/** Serializable scan summary: safe to render or export, without Three.js objects or UUIDs. */
export type FacialTargetInfoV383 = {
  id:string; name:string; meshName:string;
  suggestion:FacialChannelV370|null; confidence:string;
};
export type FacialRigDiagnosticV383 = {
  coverage:number; identified:number; total:number; active:number;
  channels:Record<FacialChannelV370,{status:'ready'|'manual'|'disabled'|'missing'|'invalid';targets:string[]}>;
  warnings:string[];
};
const allowed=new Set<string>(FACIAL_CHANNELS_V370);
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const safeObject=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);

export function diagnoseFacialRigV383(targets:FacialTargetInfoV383[],jawBone:boolean,profile:FacialProfileV370={}):FacialRigDiagnosticV383 {
  const channels={} as FacialRigDiagnosticV383['channels'];
  const warnings:string[]=[];
  const ids=new Set(targets.map(t=>t.id));
  let active=0;
  for(const c of FACIAL_CHANNELS_V370){
    const selected=profile.mapping?.[c];
    let picked:FacialTargetInfoV383[]=[];
    let status:FacialRigDiagnosticV383['channels'][FacialChannelV370]['status']='missing';
    if(selected==='none')status='disabled';
    else if(selected!==undefined){
      if(ids.has(selected)){status='manual';picked=targets.filter(t=>t.id===selected);}
      else {status='invalid';warnings.push(`Veraltete Zuordnung für ${c}: ${selected}`);}
    } else {
      picked=targets.filter(t=>t.suggestion===c);
      if(picked.length)status='ready';
    }
    if(picked.length)active++;
    channels[c]={status,targets:picked.map(t=>t.id)};
  }
  // A jaw bone can animate mouth opening even when morph targets are absent.
  const coverage=active+((jawBone&&channels.jaw.status==='missing')?1:0);
  if(!targets.length)warnings.push('Keine Blendshapes gefunden – geprüft wird nur ein eventuell vorhandener Kieferknochen.');
  if(!targets.some(t=>t.suggestion==='lipsClosed')&&channels.lipsClosed.status==='missing')warnings.push('Kein Lippenverschluss erkannt: M/B/P benötigen eine manuelle Zuordnung.');
  if(!targets.some(t=>t.suggestion==='blink')&&channels.blink.status==='missing')warnings.push('Kein Blink-Morph erkannt: Augenanimation ist möglicherweise eingeschränkt.');
  const byTarget=new Map<string,string[]>();
  for(const c of FACIAL_CHANNELS_V370)for(const id of channels[c].targets){
    byTarget.set(id,[...(byTarget.get(id)??[]),c]);
  }
  for(const [id,usedBy] of byTarget)if(usedBy.length>1)warnings.push(`Blendshape ${id} wird mehreren Kanälen zugeordnet: ${usedBy.join(', ')}.`);
  return {coverage:Math.round(coverage/FACIAL_CHANNELS_V370.length*100),identified:targets.filter(t=>t.suggestion).length,total:targets.length,active,channels,warnings};
}

/** Conservative one-click starting calibration, without changing valid user mappings. */
export function suggestSafeFacialProfileV383(targets:FacialTargetInfoV383[],profile:FacialProfileV370={}):FacialProfileV370 {
  const ids=new Set(targets.map(t=>t.id));
  const mapping={...profile.mapping};
  for(const c of FACIAL_CHANNELS_V370){
    const existing=mapping[c];
    if(existing&&existing!=='none'&&!ids.has(existing))delete mapping[c];
  }
  const defaults:Partial<Record<FacialChannelV370,number>>={jaw:.90,wide:.90,round:.90,lipsClosed:1.05,smile:.7,brow:.7,blink:1,cheek:.7,squint:.65};
  const gains={...defaults,...profile.gains};
  for(const c of FACIAL_CHANNELS_V370){
    const value=gains[c];
    if(typeof value==='number')gains[c]=clamp(Number.isFinite(value)?value:1,0,2);
  }
  return {mapping,gains};
}

/** Portable profile is bound to morph names/mesh IDs, not mutable Three UUIDs. */
export function exportFacialProfileV383(profile:FacialProfileV370):string {
  return JSON.stringify({format:'sonic-facial-rig-v383',version:1,mapping:profile.mapping??{},gains:profile.gains??{}},null,2);
}
export function importFacialProfileV383(text:string,targets:FacialTargetInfoV383[]):{profile:FacialProfileV370;warnings:string[]} {
  if(typeof text!=='string'||text.length>65536)throw new Error('Profil ist zu groß.');
  let raw:unknown;
  try{raw=JSON.parse(text);}catch{throw new Error('Ungültiges JSON.');}
  if(!safeObject(raw)||raw.format!=='sonic-facial-rig-v383'||raw.version!==1)throw new Error('Unbekanntes Gesichtsprofil-Format.');
  if(raw.mapping!==undefined&&!safeObject(raw.mapping))throw new Error('Ungültige Morph-Zuordnungen.');
  if(raw.gains!==undefined&&!safeObject(raw.gains))throw new Error('Ungültige Kanal-Intensitäten.');
  const mapping:FacialProfileV370['mapping']={};
  const gains:FacialProfileV370['gains']={};
  const warnings:string[]=[];
  const known=new Set(targets.map(t=>t.id));
  for(const [key,value] of Object.entries((raw.mapping??{}) as Record<string,unknown>)){
    if(!allowed.has(key))throw new Error(`Unbekannter Gesichts-Kanal: ${key}`);
    if(typeof value!=='string'||value.length>256)throw new Error(`Ungültige Zuordnung für ${key}`);
    if(value!=='none'&&!known.has(value)){
      warnings.push(`Morph ${value} fehlt im aktuellen Avatar: ${key} wurde auf Automatik gesetzt.`);
      continue;
    }
    mapping[key as FacialChannelV370]=value;
  }
  for(const [key,value] of Object.entries((raw.gains??{}) as Record<string,unknown>)){
    if(!allowed.has(key))throw new Error(`Unbekannter Gesichts-Kanal: ${key}`);
    if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>2)throw new Error(`Ungültige Intensität für ${key}`);
    gains[key as FacialChannelV370]=value;
  }
  return {profile:{mapping,gains},warnings};
}
