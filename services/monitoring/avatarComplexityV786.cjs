'use strict';
/** V786: offline, deterministic GLB complexity inspection. No GPU timing/GLB decoding
 * is inferred from byte counts. Caller owns the bytes, no network or file access. */
const crypto = require('node:crypto');
const FORMAT = 'sonic-avatar-complexity-v786';
const MAX_BYTES = 256 * 1024 * 1024;
const indexModes = new Set([4, 5, 6]);
const safe = (n) => Number.isSafeInteger(n) && n >= 0;
const arr = (v) => Array.isArray(v) ? v : [];
function invariant(value, text) { if (!value) throw Error('GLB ungueltig: ' + text); }
function objectAt(list, index, label) { invariant(safe(index) && index < arr(list).length, label + ' Index'); return list[index]; }
function parseGlbV786(bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  invariant(buf.length >= 20 && buf.length <= MAX_BYTES, 'Groesse');
  invariant(buf.readUInt32LE(0) === 0x46546c67, 'Magic');
  invariant(buf.readUInt32LE(4) === 2, 'Nur GLB 2.0');
  invariant(buf.readUInt32LE(8) === buf.length, 'Dateilaenge');
  let position = 12, jsonChunk = null, binChunk = null, chunks = 0;
  while (position < buf.length) {
    invariant(position + 8 <= buf.length, 'Chunk-Header');
    const size = buf.readUInt32LE(position), type = buf.readUInt32LE(position + 4);
    position += 8;
    invariant(size % 4 === 0 && position + size <= buf.length, 'Chunk-Laenge');
    if (type === 0x4e4f534a) { invariant(chunks === 0 && !jsonChunk, 'JSON an erster Stelle'); jsonChunk = buf.subarray(position, position + size); }
    if (type === 0x004e4942) { invariant(jsonChunk && !binChunk, 'BIN nach JSON'); binChunk = buf.subarray(position, position + size); }
    position += size;
    chunks++;
  }
  invariant(jsonChunk, 'JSON-Chunk fehlt');
  let gltf;
  try { gltf = JSON.parse(jsonChunk.toString('utf8').replace(/\0+$/g, '').trim()); }
  catch { throw Error('GLB ungueltig: JSON'); }
  invariant(gltf && typeof gltf === 'object' && gltf.asset?.version?.startsWith('2.'), 'glTF 2.0 asset');
  invariant(arr(gltf.buffers).length <= 1, 'Nur eingebettete GLB-Buffers unterstuetzt');
  if (gltf.buffers?.length) invariant(binChunk && binChunk.length >= gltf.buffers[0].byteLength && safe(gltf.buffers[0].byteLength), 'BIN Laenge');
  return {gltf, bin: binChunk ?? Buffer.alloc(0), bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex')};
}
function imageDimensions(mime, bytes) {
  if (!bytes) return null;
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    const w = bytes.readUInt32BE(16), h = bytes.readUInt32BE(20);
    return w > 0 && h > 0 ? [w,h,'PNG'] : null;
  }
  if (bytes.length > 12 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let at=2;
    while(at+4<bytes.length){if(bytes[at]!==0xff){at++;continue;}let marker=bytes[at+1];at+=2;
      if(marker===0xd8||marker===0xd9||marker===0x01||marker>=0xd0&&marker<=0xd7)continue;
      if(at+2>bytes.length)break;const len=bytes.readUInt16BE(at);
      if(len<2||at+len>bytes.length)break;
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&len>=7)
        return [bytes.readUInt16BE(at+5),bytes.readUInt16BE(at+3),'JPEG'];
      at+=len;
    }
  }
  if (bytes.length>=28 && bytes.subarray(0,12).equals(Buffer.from([0xab,0x4b,0x54,0x58,0x20,0x32,0x30,0xbb,0x0d,0x0a,0x1a,0x0a])))
    return [bytes.readUInt32LE(20),bytes.readUInt32LE(24),'KTX2'];
  return null;
}
function profileGlbV786(input, fileName='avatar.glb') {
  const {gltf,bin,bytes,sha256}=parseGlbV786(input);
  const scenes=arr(gltf.scenes),nodes=arr(gltf.nodes),meshes=arr(gltf.meshes),accessors=arr(gltf.accessors),views=arr(gltf.bufferViews);
  const images=arr(gltf.images),skins=arr(gltf.skins),animations=arr(gltf.animations),materials=arr(gltf.materials),textures=arr(gltf.textures);
  invariant(scenes.length>0, 'Keine Szenen');
  const sceneIndex=gltf.scene===undefined?0:gltf.scene;
  const scene=objectAt(scenes,sceneIndex,'Default scene');
  const visitCounts = new Map(), ancestors=new Set();
  let drawnNodes=0, bonesUsed=new Set(), skinnedInstances=0;
  function visit(idx, depth) {
    invariant(depth<=10000 && drawnNodes<250000,'Zyklischer/zu grosser Nodegraph');
    const node=objectAt(nodes,idx,'Node');
    invariant(!ancestors.has(idx),'Nodegraph-Zyklus');
    ancestors.add(idx);drawnNodes++;
    if(node.mesh!==undefined){objectAt(meshes,node.mesh,'Mesh');visitCounts.set(node.mesh,(visitCounts.get(node.mesh)||0)+1);}
    if(node.skin!==undefined){const skin=objectAt(skins,node.skin,'Skin');invariant(node.mesh!==undefined,'Skin ohne Mesh');skinnedInstances++;
      for(const joint of arr(skin.joints)){objectAt(nodes,joint,'Joint');bonesUsed.add(joint);}}
    for(const child of arr(node.children))visit(child,depth+1);
    ancestors.delete(idx);
  }
  for(const root of arr(scene.nodes))visit(root,0);
  invariant(drawnNodes>0,'Leere Standard-Szene');
  let indexedPrimitives=0,nonIndexedPrimitives=0,compressedPrimitives=0,drawCalls=0,triangles=0,vertices=0;
  const hotspots=[];const usedMaterials=new Set(),usedTextures=new Set();
  const usesExtension=(key)=>arr(gltf.extensionsUsed).includes(key);
  for(const [meshIndex,instances] of visitCounts){
    const mesh=meshes[meshIndex];let meshTriangles=0,meshVerts=0,meshPrimitives=0;
    const targetNames=new Set();
    for(const p of arr(mesh.primitives)){
      invariant(p && typeof p==='object','Primitive');
      const mode=p.mode??4;
      invariant(mode>=0&&mode<=6,'Primitive mode');
      const pos=p.attributes?.POSITION;
      invariant(pos!==undefined,'Position accessor fehlt');
      const positionAcc=objectAt(accessors,pos,'Position');invariant(safe(positionAcc.count),'Vertexanzahl');
      const elementCount=p.indices===undefined?positionAcc.count:objectAt(accessors,p.indices,'Index accessor').count;
      invariant(safe(elementCount),'Indexanzahl');
      let count=0;
      if(mode===4){count=Math.floor(elementCount/3);if(elementCount%3!==0)throw Error('GLB ungueltig: Triangle-Elementanzahl');}
      else if(mode===5||mode===6)count=Math.max(0,elementCount-2);
      meshTriangles+=count;meshVerts+=positionAcc.count;meshPrimitives++;
      if(p.indices===undefined)nonIndexedPrimitives+=instances;else indexedPrimitives+=instances;
      if(p.extensions?.KHR_draco_mesh_compression||p.extensions?.EXT_meshopt_compression)compressedPrimitives+=instances;
      if(p.material!==undefined)usedMaterials.add(p.material);
      const targets=arr(p.targets);for(const target of targets){for(const idx of Object.values(target))objectAt(accessors,idx,'Morph accessor');}
      const names=arr(mesh.extras?.targetNames);
      for(let i=0;i<targets.length;i++)targetNames.add(names[i]||`Target_${i}`);
    }
    triangles+=meshTriangles*instances;vertices+=meshVerts*instances;drawCalls+=meshPrimitives*instances;
    hotspots.push({name:typeof mesh.name==='string'?mesh.name:`Mesh_${meshIndex}`,meshIndex,instances,primitives:meshPrimitives,
      trianglesPerInstance:meshTriangles,sceneTriangles:meshTriangles*instances,verticesPerInstance:meshVerts,
      morphTargets:targetNames.size,morphNames:[...targetNames].slice(0,64),estimatedDrawCalls:meshPrimitives*instances});
  }
  hotspots.sort((a,b)=>b.sceneTriangles-a.sceneTriangles||b.estimatedDrawCalls-a.estimatedDrawCalls);
  for(const i of usedMaterials){const material=objectAt(materials,i,'Material');
    const pbr=material.pbrMetallicRoughness||{};
    const refs=[pbr.baseColorTexture,pbr.metallicRoughnessTexture,material.normalTexture,material.occlusionTexture,material.emissiveTexture];
    for(const ref of refs)if(ref?.index!==undefined)usedTextures.add(ref.index);
    for(const k of ['KHR_materials_clearcoat','KHR_materials_sheen','KHR_materials_transmission','KHR_materials_specular','KHR_materials_anisotropy']){
      const ext=material.extensions?.[k];if(ext)for(const val of Object.values(ext))if(val&&typeof val==='object'&&'index' in val)usedTextures.add(val.index);
    }
  }
  const usedImages=new Set();
  for(const t of usedTextures){const texture=objectAt(textures,t,'Texture');
    if(texture.source!==undefined)usedImages.add(texture.source);
    for(const key of ['KHR_texture_basisu','EXT_texture_webp','MSFT_texture_dds'])if(texture.extensions?.[key]?.source!==undefined)usedImages.add(texture.extensions[key].source);
  }
  let gpuApproxBytes=0,unknownTextures=0;
  const textureDetails=[];
  for(const i of usedImages){
    const pic=objectAt(images,i,'Image');let encoded=null;
    if(pic.bufferView!==undefined){const view=objectAt(views,pic.bufferView,'Image bufferView');
      invariant((view.buffer??0)===0&&safe(view.byteOffset??0)&&safe(view.byteLength)&&(view.byteOffset??0)+view.byteLength<=bin.length,'Image BufferView');
      encoded=bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
    }
    const dim=imageDimensions(pic.mimeType,encoded);
    const memory=dim && dim[2]!=='KTX2' ? dim[0]*dim[1]*4*4/3 : null;
    if(memory!==null&&Number.isFinite(memory))gpuApproxBytes+=memory;else unknownTextures++;
    textureDetails.push({image:i,name:pic.name||pic.uri||`Image_${i}`,width:dim?.[0]??null,height:dim?.[1]??null,encoding:dim?.[2]??pic.mimeType??'unknown',
      embeddedBytes:encoded?.length??null,estimatedRgba8MipBytes:memory===null?null:Math.round(memory)});
  }
  textureDetails.sort((a,b)=>(b.estimatedRgba8MipBytes??0)-(a.estimatedRgba8MipBytes??0));
  const clips=animations.map((clip,i)=>{
    const samplers=arr(clip.samplers),channels=arr(clip.channels);
    let duration=0;for(const sampler of samplers){const acc=objectAt(accessors,sampler.input,'Animation time accessor');
      const max=arr(acc.max)[0];if(typeof max==='number'&&Number.isFinite(max))duration=Math.max(duration,max);}
    for(const channel of channels){objectAt(samplers,channel.sampler,'Animation sampler');objectAt(nodes,channel.target?.node,'Animation target node');}
    return {name:clip.name||`Animation_${i}`,channels:channels.length,samplers:samplers.length,durationSec:duration||null};
  });
  const morphNames = [...new Set(hotspots.flatMap(x=>x.morphNames))];
  const mouthNames=morphNames.filter(x=>/mouth|jaw|viseme|open|vowel|aa|phoneme/i.test(x));
  const risks=[];
  if(triangles>90000)risks.push({severity:'review',type:'geometry',message:`${triangles} Dreiecke je Avatar: Geometrie-LOD pruefen (Richtwert, keine FPS-Aussage)`});
  if(drawCalls>16)risks.push({severity:'review',type:'draw-calls',message:`${drawCalls} Material/Primitive-Zeichenvorgaenge je Avatar: Material-Slots und Meshes pruefen`});
  if(bonesUsed.size>110)risks.push({severity:'review',type:'rig',message:`${bonesUsed.size} aktive Skin-Joints: Bone-LOD ohne Verlust von Lip-Sync/Footwork untersuchen`});
  if(gpuApproxBytes>48*1024*1024)risks.push({severity:'review',type:'textures',message:'Unkomprimierte RGBA8-Mip-Schaetzung ueber 48 MiB; Kompression/Downscaling begutachten'});
  if(unknownTextures>0)risks.push({severity:'info',type:'uncertainty',message:`${unknownTextures} verwendete Bilder ohne sichere RGBA8-Schaetzung; keine vollstaendige VRAM-Summe`});
  if(mouthNames.length===0)risks.push({severity:'info',type:'lip',message:'Kein benanntes Mouth/Jaw/Viseme-Morph-Ziel erkannt; Lip-Sync-Rig manuell pruefen'});
  if(!clips.length)risks.push({severity:'info',type:'animation',message:'Keine Animationsclips im GLB; externe Motion-Dateien separat analysieren'});
  if(hotspots.some(h=>h.morphTargets>24))risks.push({severity:'review',type:'morph',message:'Ein Mesh hat mehr als 24 Morph-Targets; aktiv genutzte Targets und GPU-Limits pruefen'});
  if(usesExtension('KHR_draco_mesh_compression'))risks.push({severity:'info',type:'compression',message:'Draco-Kompression vorhanden: Dateigroesse ist kein Mass fuer GPU-Renderkosten'});
  if(usesExtension('EXT_meshopt_compression'))risks.push({severity:'info',type:'compression',message:'Meshopt-Kompression vorhanden: Dateigroesse ist kein Mass fuer GPU-Renderkosten'});
  return {format:FORMAT,version:1,fileName:String(fileName).split(/[\\/]/).pop(),sha256,sourceBytes:bytes,
    scene:{index:sceneIndex,name:scene.name||`Scene_${sceneIndex}`,nodeOccurrences:drawnNodes,meshOccurrences:[...visitCounts.values()].reduce((s,n)=>s+n,0),
      meshDefinitions:visitCounts.size,triangles,vertexReferences:vertices,estimatedMeshDrawCalls:drawCalls,
      indexedPrimitiveOccurrences:indexedPrimitives,nonIndexedPrimitiveOccurrences:nonIndexedPrimitives,compressedPrimitiveOccurrences:compressedPrimitives,
      skinnedMeshOccurrences:skinnedInstances,skinDefinitions:skins.length,usedSkinJoints:bonesUsed.size},
    resources:{materialDefinitions:materials.length,usedMaterialCount:usedMaterials.size,textureDefinitions:textures.length,usedTextureCount:usedTextures.size,
      usedImageCount:usedImages.size,estimatedRgba8MipBytes:Math.round(gpuApproxBytes),unknownTextureEstimates:unknownTextures},
    animations:{clips:clips.length,channels:clips.reduce((s,c)=>s+c.channels,0),details:clips},
    morph:{maxTargetsPerMesh:Math.max(0,...hotspots.map(x=>x.morphTargets)),namedTargets:morphNames,mouthCandidates:mouthNames},
    hotspots,textures:textureDetails,risks,
    scope:['Default-GLB-Szene (nicht alle optionalen Szenen)','Gezielte Geometriedaten je sichtbarer Mesh-Instanz, keine GPU-Messung',
      'Draw Calls sind nur Mesh-Primitiven-Schaetzung ohne reale Renderer-/Material-Passes',
      'Textur-RGBA8-Mip-Wert ist ein Szenario, kein gemessener VRAM-Verbrauch; komprimierte/externe Texturen unbekannt',
      'Mehrere Avatare koennen Geometrien und Texturen teilen; CPU/GPU-Kosten skalieren nicht linear']};
}
function matchConcertBenchmarkV786(profiles, benchmark){
  const warnings=[];
  if(!benchmark||benchmark.format!=='sonic-concert-benchmark-v777'||benchmark.version!==1)warnings.push('Kein V777-Renderbericht');
  if(benchmark?.environment?.softwareRenderer!==false||!benchmark?.environment?.renderer)warnings.push('Kein bestaetigtes GPU-Rendering');
  const expected=[...new Set(profiles.map(p=>p.sha256))].sort();
  const actual=[...new Set(arr(benchmark?.assets?.hashes))].sort();
  if(!expected.length||JSON.stringify(expected)!==JSON.stringify(actual)||arr(benchmark?.assets?.hashes).some(h=>!(/^[0-9a-f]{64}$/.test(h))))warnings.push('GLB-Hashes stimmen nicht ueberein');
  if(benchmark?.config?.fixtureId!=='v777-stages-glb-dance-lips-lyrics-fx-v1')warnings.push('Fixture nicht vergleichbar');
  const expectedIds=['cyberpunk','rock','galaxy'].flatMap(stage=>[2,4].map(n=>`${stage}-${n}glb`));
  const scenes=arr(benchmark?.scenes);const ids=scenes.map(s=>s?.id);
  if(scenes.length!==6||new Set(ids).size!==6||expectedIds.some(id=>!ids.includes(id)))warnings.push('Sechs Konzertfaelle fehlen');
  if(scenes.some(s=>!Number.isFinite(s?.fps)||s.fps<=0||!Number.isFinite(s?.p95Ms)||s.p95Ms<=0||!Number.isFinite(s?.avgCalls)||s.avgCalls<=0||!Number.isFinite(s?.avgTriangles)||s.avgTriangles<0||!safe(s?.frames)||s.frames<30))warnings.push('Messwerte ungueltig');
  return warnings.length?{status:'blocked',warnings,scenes:[]}:{status:'measured',warnings:[],environment:benchmark.environment,
    config:benchmark.config,scenes:scenes.map(s=>({id:s.id,fps:s.fps,p95Ms:s.p95Ms,avgCalls:s.avgCalls,avgTriangles:s.avgTriangles}))};
}
module.exports={FORMAT,MAX_BYTES,parseGlbV786,imageDimensions,profileGlbV786,matchConcertBenchmarkV786};
