/** V739 pure per-avatar GLB clip availability check, without a silent fallback. */
export const HIP_GLB_NAMES_V739=['Hip_Sway','Hip_Circle','Hip_Bounce'] as const;
export type HipGlbClipNameV739=typeof HIP_GLB_NAMES_V739[number];
export const isHipGlbClipV739=(s:string):s is HipGlbClipNameV739=>
 (HIP_GLB_NAMES_V739 as readonly string[]).includes(s);
export type ClipAvailabilityV739={kind:'none'|'glb'|'procedural'|'missing'|'loading';
 clip:string|null;message:string|null};

/** Missing authored clips are NEVER silently represented as installed.
 * A procedural option has its own explicit selector value.
 */
export function resolveClipAvailabilityV739(selection:string,loadedNames:readonly string[],ready:boolean):ClipAvailabilityV739{
 if(!selection)return {kind:'none',clip:null,message:null};
 if(selection.startsWith('procedural:')){
  const name=selection.slice('procedural:'.length);
  if(!isHipGlbClipV739(name))return {kind:'missing',clip:null,message:'Unbekannte prozedurale Bewegung.'};
  return {kind:'procedural',clip:name,message:`${name} wird prozedural berechnet. Für diesen Avatar ist damit kein gleichnamiger GLB-Clip installiert.`};
 }
 if(!selection.startsWith('glb:'))return {kind:'missing',clip:null,message:'Unbekannte Animationsauswahl.'};
 const name=selection.slice('glb:'.length);
 if(!ready)return {kind:'loading',clip:null,message:'Prüfe die GLB-Animationen des ausgewählten Avatars …'};
 if(!loadedNames.includes(name))return {kind:'missing',clip:null,
  message:`⚠ GLB-Clip „${name}“ ist bei diesem Avatar nicht vorhanden. Es wird kein anderer Clip automatisch abgespielt. Wähle die prozedurale Variante oder installiere eine passende Motion-GLB.`};
 return {kind:'glb',clip:name,message:null};
}

