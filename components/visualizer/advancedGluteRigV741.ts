/** V741: optional glute deformation for EXISTING weighted bones or named morph targets.
 * Does not modify a GLB, create skin weights, or change the pelvis / IK chain.
 * All discovery is performed once when a GLB instance changes, never each frame.
 */
import type {Object3D} from 'three';
import type {HipDanceChannelsV735, HipDanceModeV735} from './hipDanceV735';

export type GluteSettingsV741={enabled:boolean;strength:number;left:number;right:number;driver:'auto'|'morph'|'bone'};
export const DEFAULT_GLUTE_V741:Readonly<GluteSettingsV741>=Object.freeze({enabled:false,strength:35,left:100,right:100,driver:'auto'});
const safe=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
export function normalizeGluteSettingsV741(value:Partial<GluteSettingsV741>|null|undefined):GluteSettingsV741{
 const pct=(n:unknown,defaultValue:number)=>safe(n)?Math.round(clamp(n,0,100)):defaultValue;
 return {enabled:typeof value?.enabled==='boolean'?value.enabled:false,
   strength:pct(value?.strength,35),left:pct(value?.left,100),right:pct(value?.right,100),
   driver:value?.driver==='bone'||value?.driver==='morph'?value.driver:'auto'};
}
export type GluteInputV741={pose:HipDanceChannelsV735;mode:HipDanceModeV735;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean;settings?:Partial<GluteSettingsV741>|null};
export type GluteChannelsV741={left:number;right:number};
export function sampleGluteV741(input:GluteInputV741):GluteChannelsV741{
 const s=normalizeGluteSettingsV741(input.settings);
 if(!s.enabled||!s.strength||!input.playing||input.reducedMotion||input.manualPriority||input.mode==='off')return {left:0,right:0};
 const {hipPitch,hipRoll,hipLateral,hipVertical}=input.pose;
 if(!safe(hipPitch)||!safe(hipRoll)||!safe(hipLateral)||!safe(hipVertical))return {left:0,right:0};
 const sway=clamp((hipRoll*.65+hipLateral*1.4)/.085,-1,1);
 const bounce=clamp(-hipVertical/.022,0,1);
 const envelope=clamp(Math.max(Math.abs(hipRoll)/.10,Math.abs(hipPitch)/.10,
   Math.abs(hipLateral)/.018,Math.abs(hipVertical)/.02),0,1);
 if(envelope<1e-7)return {left:0,right:0};
 // Nonnegative blendshape weights; opposing emphasis permits independent halves.
 // Single-axial bones use the same values, scaled to a conservative angular limit.
 const amplitude=.24*(s.strength/100);
 return {left:clamp(amplitude*(.30*envelope+.45*Math.max(0,sway)+.28*bounce)*(s.left/100),0,.24),
   right:clamp(amplitude*(.30*envelope+.45*Math.max(0,-sway)+.28*bounce)*(s.right/100),0,.24)};
}

type AttributeV741={count:number;getX(index:number):number;getY(index:number):number;getZ(index:number):number;getW(index:number):number};
type GluteMeshV741=Object3D & {isMesh?:boolean;isSkinnedMesh?:boolean;
 morphTargetDictionary?:Record<string,number>;morphTargetInfluences?:number[];
 skeleton?:{bones:Object3D[]};geometry?:{attributes?:{skinIndex?:AttributeV741;skinWeight?:AttributeV741};
 morphAttributes?:{position?:Array<{count:number}>}}};
type GluteBoneV741=Object3D & {isBone?:boolean};
type GluteTargetV741={kind:'morph';mesh:GluteMeshV741;index:number;name:string}|
 {kind:'bone';bone:GluteBoneV741;name:string};
export type GluteRigV741={morphs:{left:GluteTargetV741[];right:GluteTargetV741[]};
 bones:{left:GluteTargetV741[];right:GluteTargetV741[]};
 unweighted:string[];available:boolean;warnings:string[]};
/** Identify semantic side, not broad left/right hip bones or generic glute strength. */
export function gluteSideV741(name:string):'left'|'right'|null{
 const text=name.replace(/[^a-z0-9]/gi,'').toLowerCase();
 if(!/(glute|buttock|buttcheek)/.test(text))return null;
 if(/(left|^lglute|^lbuttock|^lbuttcheek|glutel$|buttockl$|buttcheekl$)/.test(text))return 'left';
 if(/(right|^rglute|^rbuttock|^rbuttcheek|gluter$|buttockr$|buttcheekr$)/.test(text))return 'right';
 return null;
}
/** Validate *actual* mesh weights. A named bone with no weighted vertices is
 * not a supported deformation channel. Shared geometries remain unmodified.
 */
function hasBoneWeightsV741(root:Object3D,bone:Object3D):boolean{
 let weighted=false;
 root.traverse((node)=>{
  if(weighted)return;
  const mesh=node as GluteMeshV741;
  if(!mesh.isSkinnedMesh||!mesh.skeleton||!mesh.geometry?.attributes)return;
  const indices=mesh.skeleton.bones.map((item,index)=>item===bone?index:-1).filter(index=>index>=0);
  if(!indices.length)return;
  const index=mesh.geometry.attributes.skinIndex,weight=mesh.geometry.attributes.skinWeight;
  if(!index||!weight||!safe(index.count)||index.count!==weight.count)return;
  for(let vertex=0;vertex<index.count&&!weighted;vertex++){
   for(const component of ['getX','getY','getZ','getW'] as const){
    if(indices.includes(index[component](vertex))&&weight[component](vertex)>0.0001){weighted=true;break;}
   }
  }
 });
 return weighted;
}
export function collectGluteRigV741(root:Object3D):GluteRigV741{
 const morphs:{left:GluteTargetV741[];right:GluteTargetV741[]}={left:[],right:[]};
 const bones:{left:GluteTargetV741[];right:GluteTargetV741[]}={left:[],right:[]};
 const unweighted:string[]=[];
 const invalidMorphs:string[]=[];
 root.traverse(node=>{
  const bone=node as GluteBoneV741,mesh=node as GluteMeshV741;
  const boneSide=bone.isBone?gluteSideV741(node.name):null;
  if(boneSide){
   if(hasBoneWeightsV741(root,bone))bones[boneSide].push({kind:'bone',bone,name:bone.name});
   else unweighted.push(bone.name);
  }
  if(!mesh.isMesh||!mesh.morphTargetDictionary||!mesh.morphTargetInfluences) return;
  const seen=new Set<number>();
  for(const [name,index] of Object.entries(mesh.morphTargetDictionary)){
   const side=gluteSideV741(name);
   if(side&&Number.isInteger(index)&&index>=0&&index<mesh.morphTargetInfluences.length&&!seen.has(index)){
    const shape=mesh.geometry?.morphAttributes?.position?.[index];
    if(!shape||!safe(shape.count)||shape.count<1){invalidMorphs.push(`${mesh.name}:${name}`);continue;}
    morphs[side].push({kind:'morph',mesh,index,name});seen.add(index);
   }
  }
 });
 const has=(side:'left'|'right')=>morphs[side].length>0||bones[side].length>0;
 const warnings:string[]=[];
 if(!has('left'))warnings.push('Links fehlt ein gewichteter Glute-Knochen oder ein Glute-Morph-Target.');
 if(!has('right'))warnings.push('Rechts fehlt ein gewichteter Glute-Knochen oder ein Glute-Morph-Target.');
 if(unweighted.length)warnings.push(`Gefundene Knochen ohne nachgewiesene Skin-Weights: ${unweighted.join(', ')}.`);
 if(invalidMorphs.length)warnings.push(`Morph-Namen ohne Positions-Shape: ${invalidMorphs.join(', ')}.`);
 return {morphs,bones,unweighted,available:has('left')||has('right'),warnings};
}
export function supportsGluteDriverV741(rig:GluteRigV741,driver:GluteSettingsV741['driver']):boolean{
 const has=(side:'left'|'right')=>driver==='auto'?(rig.morphs[side].length>0||rig.bones[side].length>0):
  driver==='morph'?rig.morphs[side].length>0:rig.bones[side].length>0;
 return has('left')&&has('right');
}
export function describeGluteRigV741(rig:GluteRigV741,driver:GluteSettingsV741['driver']='auto'):string{
 const summary=(side:'left'|'right')=>rig.morphs[side].length?`Morph ${rig.morphs[side].map(m=>m.name).join('/')}`:
  rig.bones[side].length?`Skin-Bone ${rig.bones[side].map(b=>b.name).join('/')}`:'nicht vorhanden';
 const missing=(side:'left'|'right')=>driver==='morph'?rig.morphs[side].length===0:
   driver==='bone'?rig.bones[side].length===0:rig.morphs[side].length===0&&rig.bones[side].length===0;
 const driverWarning=missing('left')||missing('right')?`Gewählter Treiber (${driver}) nicht für beide Seiten verfügbar.`:'';
 return `Gesäßverformung: links ${summary('left')}, rechts ${summary('right')}. ${driverWarning} ${rig.warnings.join(' ')}`.trim();
}
export type GluteOverlayV741={values:WeakMap<object,{offset:number;written:number}>};
export const createGluteOverlayV741=():GluteOverlayV741=>({values:new WeakMap()});
/** Only deltas applied, independent of existing author clip weights.
 * When the animation mixer rewrites a channel, the overlay is re-applied once;
 * static rigs do not accumulate rotation or morph influence.
 */
export function applyGluteRigV741(rig:GluteRigV741, overlay:GluteOverlayV741,
 values:GluteChannelsV741,settings:Partial<GluteSettingsV741>|null|undefined,delta:number):void{
 const s=normalizeGluteSettingsV741(settings);
 const smooth=clamp(safe(delta)?delta*10:0,0,1);
 const fullySupported=supportsGluteDriverV741(rig,s.driver);
 for(const side of ['left','right'] as const){
  const useMorphs=s.driver!=='bone'&&rig.morphs[side].length>0;
  const useBones=!useMorphs&&s.driver!=='morph'&&rig.bones[side].length>0;
  // Always visit *both* channels to decay old overlays on driver changes.
  for(const target of [...rig.morphs[side],...rig.bones[side]]){
   const selected=fullySupported&&(target.kind==='morph'?useMorphs:useBones);
   const signal=selected&&s.enabled&&safe(values[side])?clamp(values[side],0,.24):0;
   const magnitude=target.kind==='bone'?signal*.24*(side==='left'?1:-1):signal;
   const node=target.kind==='bone'?target.bone:target.mesh;
   const prior=overlay.values.get(target.kind==='bone'?node:
     // Distinct channel key for meshes containing multiple morph targets.
     morphKeyV741(target.mesh,target.index))??{offset:0,written:NaN};
   const key=target.kind==='bone'?node:morphKeyV741(target.mesh,target.index);
   const raw=target.kind==='bone'?target.bone.rotation.x:
     target.mesh.morphTargetInfluences?.[target.index];
   if(!safe(raw))continue;
   const next=prior.offset+(magnitude-prior.offset)*smooth;
   const reset=Number.isFinite(prior.written)&&Math.abs(raw-prior.written)>1e-6;
   const change=reset?next:next-prior.offset;
   const written=target.kind==='bone'?clamp(raw+change,-Math.PI,Math.PI):clamp(raw+change,0,1);
   if(target.kind==='bone')target.bone.rotation.x=written;
   else if(target.mesh.morphTargetInfluences)target.mesh.morphTargetInfluences[target.index]=written;
   overlay.values.set(key,{offset:next,written});
  }
 }
}
const meshKeysV741=new WeakMap<object,Map<number,object>>();
function morphKeyV741(mesh:object,index:number):object{
 let keys=meshKeysV741.get(mesh);if(!keys){keys=new Map();meshKeysV741.set(mesh,keys);}
 let key=keys.get(index);if(!key){key={};keys.set(index,key);}return key;
}
