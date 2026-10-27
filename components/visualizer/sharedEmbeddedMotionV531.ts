/** V531 – exact-content motion sharing for GLB 2.0.
 * A full, installed source GLB remains the canonical shared animation pack.
 * Other imported characters may omit identical animation bytes, provided the
 * source URL is permanently linked in server-side avatar metadata.
 * Never mutates the user's original File and never assumes name equality alone.
 */
export type MotionIdentityV531 = { fingerprint: string; rigFingerprint: string; clips: number };
type Dict = Record<string, any>;
const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
const align4 = (size:number) => (size+3)&~3;
const componentBytes: Record<number,number> = {5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const elementCount: Record<string,number> = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
export type ParsedGlbV531 = {json:Dict; bin:Uint8Array};
export function parseGlbV531(arrayBuffer: ArrayBuffer): ParsedGlbV531 {
  const bytes = new Uint8Array(arrayBuffer);
  if(bytes.length < 28 || bytes.length > 35*1024*1024)throw Error('GLB-Größe ungültig');
  const view=new DataView(arrayBuffer);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.length)
    throw Error('Kein gültiger GLB-2.0-Container');
  const jsonSize=view.getUint32(12,true);
  if(view.getUint32(16,true)!==0x4e4f534a||jsonSize<=0||jsonSize>8*1024*1024||20+jsonSize+8>bytes.length)
    throw Error('Ungültiger JSON-Chunk');
  const json=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jsonSize)).trim()) as Dict;
  if(json.asset?.version!=='2.0'||!Array.isArray(json.buffers)||json.buffers.length!==1||
    (json.buffers[0]?.uri!==undefined)||20+jsonSize+8>bytes.length)
    throw Error('Nur selbstständige GLB-2.0-Dateien mit einem eingebetteten Puffer werden unterstützt');
  const binHeader=20+jsonSize;
  if(view.getUint32(binHeader+4,true)!==0x004e4942)throw Error('Fehlender BIN-Chunk');
  const binSize=view.getUint32(binHeader,true);
  if(binHeader+8+binSize!==bytes.length||json.buffers[0].byteLength>binSize)throw Error('Fehlerhafte BIN-Länge');
  return {json,bin:bytes.subarray(binHeader+8,binHeader+8+binSize)};
}
function accessorBytes(glb:ParsedGlbV531,index:number):Uint8Array {
  const a=glb.json.accessors?.[index];const bv=glb.json.bufferViews?.[a?.bufferView];
  if(!a||!bv||a.sparse||bv.byteStride||bv.buffer!==0)throw Error('Sparse/interleaved Animationsdaten werden nicht kompaktiert');
  const size=(componentBytes[a.componentType]??0)*(elementCount[a.type]??0)*a.count;
  const offset=(bv.byteOffset??0)+(a.byteOffset??0);
  if(!Number.isSafeInteger(size)||size<=0||offset<0||offset+size>glb.bin.length||
    (a.byteOffset??0)+size>bv.byteLength)throw Error('Ungültige Accessor-Daten');
  return glb.bin.subarray(offset,offset+size);
}
function metadata(glb:ParsedGlbV531){
 const {json}=glb; if(!Array.isArray(json.animations)||!json.animations.length)throw Error('Keine eingebetteten Animationen');
 const joints=(json.skins??[]).flatMap((s:Dict)=>s.joints??[]);
 if(!joints.length)throw Error('Ohne Skelett ist eine sichere gemeinsame Motion-Nutzung nicht möglich');
 const nodes=json.nodes??[];const jointSet=new Set<number>(joints);
 // Compare exact source rest pose, hierarchy, and animation target names; no heuristic re-use.
 const rig=joints.map((i:number)=>({name:nodes[i]?.name??'',translation:nodes[i]?.translation??[0,0,0],
   rotation:nodes[i]?.rotation??[0,0,0,1],scale:nodes[i]?.scale??[1,1,1],
   children:(nodes[i]?.children??[]).filter((c:number)=>jointSet.has(c)).map((c:number)=>nodes[c]?.name??'')}));
 const animationMeta=json.animations.map((anim:Dict)=>({name:anim.name??'',channels:(anim.channels??[]).map((c:Dict)=>({
   node:nodes[c.target?.node]?.name??'',path:c.target?.path??'',sampler:c.sampler})),
   samplers:(anim.samplers??[]).map((s:Dict)=>({interpolation:s.interpolation??'LINEAR',
     input:json.accessors[s.input]&&{count:json.accessors[s.input].count,type:json.accessors[s.input].type,componentType:json.accessors[s.input].componentType},
     output:json.accessors[s.output]&&{count:json.accessors[s.output].count,type:json.accessors[s.output].type,componentType:json.accessors[s.output].componentType}}))}));
 if(json.animations.some((a:Dict)=>!(a.channels?.length)||!(a.samplers?.length)))throw Error('Leere Animationskanäle');
 return {rig,animationMeta};
}
export async function inspectSharedMotionV531(file:Pick<File,'arrayBuffer'>):Promise<MotionIdentityV531> {
 const glb=parseGlbV531(await file.arrayBuffer());
 const {rig,animationMeta}=metadata(glb);
 const rigFingerprint=hex(await crypto.subtle.digest('SHA-256',encoder.encode(JSON.stringify(rig))));
 const chunks:Uint8Array[]=[encoder.encode(JSON.stringify(animationMeta))];
 for(const animation of glb.json.animations){
   for(const sampler of animation.samplers){
     chunks.push(accessorBytes(glb,sampler.input),accessorBytes(glb,sampler.output));
   }
 }
 const len=chunks.reduce((sum,b)=>sum+b.length,0);
 if(len>70*1024*1024)throw Error('Animationsdaten sind für die kompakte Prüfung zu groß');
 const combined=new Uint8Array(len);let cursor=0;
 for(const chunk of chunks){combined.set(chunk,cursor);cursor+=chunk.length;}
 const fingerprint=hex(await crypto.subtle.digest('SHA-256',combined));
 return {fingerprint,rigFingerprint,clips:glb.json.animations.length};
}
/** Returns a new GLB only when every removed bufferView is strictly animation-only.
 * Other bufferView/accessor indices are remapped and GLB 4-byte alignment maintained.
 */
export function stripDuplicateAnimationsV531(source:ArrayBuffer):Uint8Array {
 const glb=parseGlbV531(source); const j=glb.json;
 // Material-only emissive-strength extension has no binary offsets or accessors.
 // Unknown extensions might reference stripped bufferViews: refuse optimizations.
 const safeExtensions=new Set(['KHR_materials_emissive_strength']);
 if([...(j.extensionsUsed??[]),...(j.extensionsRequired??[])].some((id:string)=>!safeExtensions.has(id)))
   throw Error('GLB-Erweiterung kann nicht sicher kompaktiert werden');
 if(!Array.isArray(j.animations)||!j.animations.length)throw Error('Keine Animationen zum Auslagern');
 const animationAccessors=new Set<number>();
 for(const a of j.animations)for(const s of a.samplers??[]) {
   accessorBytes(glb,s.input);accessorBytes(glb,s.output);
   animationAccessors.add(s.input);animationAccessors.add(s.output);
 }
 const meshAccessors=new Set<number>();
 for(const mesh of j.meshes??[])for(const p of mesh.primitives??[]){
   Object.values(p.attributes??{}).forEach(x=>meshAccessors.add(x as number));
   if(p.indices!==undefined)meshAccessors.add(p.indices);
   for(const target of p.targets??[])Object.values(target).forEach(x=>meshAccessors.add(x as number));
 }
 for(const s of j.skins??[])if(s.inverseBindMatrices!==undefined)meshAccessors.add(s.inverseBindMatrices);
 const keepAccessor=new Set<number>((j.accessors??[]).map((_:unknown,i:number)=>i).filter((i:number)=>!animationAccessors.has(i)||meshAccessors.has(i)));
 const keepView=new Set<number>();
 const keepBV=(n:unknown)=>{if(typeof n==='number')keepView.add(n);};
 for(const index of keepAccessor){const a=j.accessors[index];keepBV(a.bufferView);keepBV(a.sparse?.indices?.bufferView);keepBV(a.sparse?.values?.bufferView);}
 for(const im of j.images??[])keepBV(im.bufferView);
 // Sparse mesh accessors are retained with their sparse bufferViews remapped.
 const keepViews=[...keepView].sort((a,b)=>a-b);
 const viewMap=new Map(keepViews.map((i,k)=>[i,k]));
 const accIds=[...keepAccessor].sort((a,b)=>a-b);
 const accMap=new Map(accIds.map((i,k)=>[i,k]));
 const mapAccessor=(i:number)=>{if(!accMap.has(i))throw Error('Nicht aufgelöster Mesh-Accessor');return accMap.get(i);};
 const viewChunks:Uint8Array[]=[];let byteOffset=0;
 const views=keepViews.map(index=>{
   const old=j.bufferViews[index];if(!old||old.buffer!==0)throw Error('Unbekannter BufferView');
   const start=old.byteOffset??0;const length=old.byteLength;
   if(!Number.isInteger(start)||!Number.isInteger(length)||start<0||length<1||start+length>glb.bin.length)
     throw Error('Ungültige BufferView-Länge');
   const padded=new Uint8Array(align4(length));padded.set(glb.bin.subarray(start,start+length));viewChunks.push(padded);
   const updated={...old,byteOffset,buffer:0};byteOffset+=padded.length;return updated;
 });
 const accessors=accIds.map(i=>{const a=j.accessors[i];return {...a,
   ...(a.bufferView!==undefined?{bufferView:viewMap.get(a.bufferView)}:{}),
   ...(a.sparse?{sparse:{...a.sparse,
     indices:{...a.sparse.indices,bufferView:viewMap.get(a.sparse.indices.bufferView)},
     values:{...a.sparse.values,bufferView:viewMap.get(a.sparse.values.bufferView)}}}:{})};});
 const meshes=(j.meshes??[]).map((mesh:Dict)=>({...mesh,primitives:(mesh.primitives??[]).map((p:Dict)=>({...p,
   attributes:Object.fromEntries(Object.entries(p.attributes??{}).map(([name,i])=>[name,mapAccessor(i as number)])),
   ...(p.indices!==undefined?{indices:mapAccessor(p.indices)}:{}),
   ...(p.targets?{targets:p.targets.map((target:Dict)=>Object.fromEntries(Object.entries(target).map(([name,i])=>[name,mapAccessor(i as number)])))}:{})}))}));
 const skins=(j.skins??[]).map((s:Dict)=>s.inverseBindMatrices!==undefined?{...s,inverseBindMatrices:mapAccessor(s.inverseBindMatrices)}:s);
 const images=(j.images??[]).map((im:Dict)=>im.bufferView!==undefined?{...im,bufferView:viewMap.get(im.bufferView)}:im);
 const compact={...j,animations:undefined,accessors,bufferViews:views,meshes,skins,images,buffers:[{...j.buffers[0],byteLength:byteOffset}]};
 const jsonRaw=encoder.encode(JSON.stringify(compact));const jsonLen=align4(jsonRaw.length);
 const result=new Uint8Array(12+8+jsonLen+8+byteOffset);const dv=new DataView(result.buffer);
 dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,result.length,true);
 dv.setUint32(12,jsonLen,true);dv.setUint32(16,0x4e4f534a,true);
 result.fill(32,20,20+jsonLen);result.set(jsonRaw,20);
 dv.setUint32(20+jsonLen,byteOffset,true);dv.setUint32(24+jsonLen,0x004e4942,true);
 let next=28+jsonLen;for(const chunk of viewChunks){result.set(chunk,next);next+=chunk.length;}
 parseGlbV531(result.buffer); // final structural integrity
 return result;
}
export const sameSharedMotionV531=(a:MotionIdentityV531,b:MotionIdentityV531):boolean=>
 a.clips===b.clips&&a.rigFingerprint===b.rigFingerprint&&a.fingerprint===b.fingerprint;
