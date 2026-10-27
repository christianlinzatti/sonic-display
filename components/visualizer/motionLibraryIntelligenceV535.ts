/** V535 – conservative and reusable metadata policy for an extensible motion library.
 * Identical names are not evidence of duplicate keyframe data.
 */
export const MOTION_CATEGORIES_V535 = ['idle','rap','dance','energetic','gesture','locomotion','other'] as const;
export type MotionCategoryV535 = typeof MOTION_CATEGORIES_V535[number];
export const MOTION_CATEGORY_LABELS_V535:Record<MotionCategoryV535,string> = {
  idle:'Idle / ruhige Bewegung',rap:'Rap / Performance',dance:'Tanz / Groove',
  energetic:'Drops / energetisch',gesture:'Gestik / Oberkörper',
  locomotion:'Schritte / Fortbewegung',other:'Sonstige / nicht erkannt',
};
export type LibraryMotionV535 = {
  id:string;avatarId:string;name:string;url:string;addedAt:number;
  category?:MotionCategoryV535;favorite?:boolean;fingerprint?:string;
};

/** Only high-confidence naming patterns are mapped; unknown clips remain editable. */
export function suggestMotionCategoryV535(name:string):MotionCategoryV535 {
  const normalized=name.replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase().replace(/[_\-.]+/g,' ');
  if(/\b(idle|rest|breath|standby|neutral)\b/.test(normalized))return 'idle';
  if(/\b(rap|flow|mc|verse|freestyle|vocal|emcee)\b/.test(normalized))return 'rap';
  if(/\b(drop|hardstyle|hardtekk|jumpstyle|jump|stomp|punch|kick)\b/.test(normalized))return 'energetic';
  if(/\b(walk|walking|run|running|step forward|step back|locomotion|strafe)\b/.test(normalized))return 'locomotion';
  if(/\b(dance)\b/.test(normalized))return 'dance';
  if(/\b(gesture|point|wave|nod|clap|shrug|salute|body roll|head nod|arm|arms|shoulder|shoulders|hand|hands|greeting)\b/.test(normalized))return 'gesture';
  if(/\b(dance|groove|shuffle|two step|sway|bounce|club|move|hip hop|hip circle)\b/.test(normalized))return 'dance';
  return 'other';
}
export function validMotionFingerprintV535(value:unknown):value is string {
  return typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
}
export function validMotionCategoryV535(value:unknown):value is MotionCategoryV535 {
  return typeof value==='string'&&(MOTION_CATEGORIES_V535 as readonly string[]).includes(value);
}
export function duplicateInAvatarV535<T extends LibraryMotionV535>(motions:readonly T[],avatarId:string,fingerprint:string|undefined):T|undefined {
  if(!validMotionFingerprintV535(fingerprint))return undefined;
  return motions.find(m=>m.avatarId===avatarId&&m.fingerprint===fingerprint);
}
export function filterMotionsV535<T extends LibraryMotionV535>(motions:readonly T[],opts:{avatarId:string;search:string;category?:MotionCategoryV535|'all';favoritesOnly?:boolean}):T[] {
  const query=opts.search.trim().toLocaleLowerCase();
  return motions.filter(m=>m.avatarId===opts.avatarId&&
    (!opts.favoritesOnly||m.favorite===true)&&
    (!opts.category||opts.category==='all'||(m.category??suggestMotionCategoryV535(m.name))===opts.category)&&
    (!query||[m.name,m.category??suggestMotionCategoryV535(m.name)].some(s=>s.toLocaleLowerCase().includes(query))))
    .sort((a,b)=>Number(b.favorite===true)-Number(a.favorite===true)||b.addedAt-a.addedAt||a.id.localeCompare(b.id));
}
export function countKnownDuplicatesV535(motions:readonly LibraryMotionV535[],avatarId:string):number {
  const known=new Set<string>();let duplicateCount=0;
  for(const motion of motions){
    if(motion.avatarId!==avatarId||!validMotionFingerprintV535(motion.fingerprint))continue;
    if(known.has(motion.fingerprint))duplicateCount++;else known.add(motion.fingerprint);
  }
  return duplicateCount;
}

/** SHA-256 over actual animated track paths, interpolation, times and values.
 * Excludes artist names, file names, GLB meshes and materials. A hash match is
 * only used within one avatar, never treated as proof of compatible rigging.
 * Limit data to protect low-memory displays from pathological huge clips.
 */
export async function fingerprintAnimationClipV535(clip:{tracks:readonly {name:string;times:ArrayLike<number>;values:ArrayLike<number>;getInterpolation?:()=>number}[]}):Promise<string|undefined>{
  if(!clip.tracks.length||clip.tracks.length>400)return undefined;
  let values=0;
  for(const track of clip.tracks){
    if(!track.name||!track.times.length||!track.values.length)return undefined;
    // Unknown custom interpolation cannot be safely equated with linear.
    if(typeof track.getInterpolation!=='function'||!Number.isFinite(track.getInterpolation()))return undefined;
    values+=track.times.length+track.values.length;
    if(values>600000)return undefined;
  }
  if(typeof crypto==='undefined'||!crypto.subtle?.digest)return undefined;
  const tracks=clip.tracks.map(track=>({
    path:track.name,interpolation:track.getInterpolation!(),
    times:Array.from(track.times),values:Array.from(track.values),
  })).sort((a,b)=>a.path.localeCompare(b.path)||a.interpolation-b.interpolation||a.times.length-b.times.length);
  if(tracks.some(t=>t.times.some(v=>!Number.isFinite(v))||t.values.some(v=>!Number.isFinite(v))))return undefined;
  const encoded=new TextEncoder().encode(JSON.stringify(tracks));
  const digest=await crypto.subtle.digest('SHA-256',encoded);
  return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
}
