#!/usr/bin/env node
/** V125: local, non-destructive multi-file GLB generation. Does NOT create embedded LOD nodes. */
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

export function metadata(file) {
  const b = readFileSync(file);
  if (b.length < 20 || b.readUInt32LE(0) !== 0x46546c67 || b.readUInt32LE(4) !== 2 || b.readUInt32LE(8) !== b.length || b.readUInt32LE(16) !== 0x4e4f534a) throw Error(`Invalid GLB: ${file}`);
  const size=b.readUInt32LE(12);
  if (size > b.length-20) throw Error('Invalid GLB JSON size');
  const json=JSON.parse(b.subarray(20,20+size).toString('utf8').trimEnd());
  if(json.asset?.version !== '2.0') throw Error('Unsupported glTF version');
  const a=k=>Array.isArray(json[k])?json[k]:[];
  let triangles=0;
  for(const mesh of a('meshes'))for(const p of mesh.primitives??[]){
    const count=a('accessors')[p.indices??p.attributes?.POSITION]?.count??0;
    triangles+=(p.mode??4)===4?Math.floor(count/3):[5,6].includes(p.mode)?Math.max(0,count-2):0;
  }
  return {bytes:b.length,triangles,animations:a('animations').length,animationChannels:a('animations').reduce((n,x)=>n+(x.channels?.length??0),0),skins:a('skins').length,meshes:a('meshes').length,morphTargetPrimitives:a('meshes').reduce((n,m)=>n+(m.primitives??[]).filter(p=>p.targets?.length).length,0)};
}
export function validate(original, candidate) {
  for(const key of ['animations','animationChannels','skins','morphTargetPrimitives']){
    if(candidate[key]!==original[key])throw Error(`${key} changed: ${original[key]} -> ${candidate[key]}`);
  }
  if(candidate.triangles<=0 && original.triangles>0)throw Error('All triangles removed');
}
const invoked=process.argv[1] && resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname);
if(invoked){
  const [inputArg,outputArg]=process.argv.slice(2);
  if(!inputArg||!outputArg||extname(inputArg).toLowerCase()!=='.glb'){
    console.error('Usage: npm run avatar:lod -- input.glb output-directory');process.exit(2);
  }
  const input=resolve(inputArg),out=resolve(outputArg);
  if(!existsSync(input)||!statSync(input).isFile()||out===input||out.startsWith(input+'/')){console.error('Input not found or output conflicts with source');process.exit(2)}
  if(existsSync(out)){console.error('Output directory already exists; refusing to overwrite');process.exit(2)}
  const cli=resolve('node_modules/@gltf-transform/cli/bin/cli.js');
  if(!existsSync(cli)){console.error('Install @gltf-transform/cli as a dev dependency to generate files');process.exit(2)}
  const original=metadata(input);
  // These are separate GLB variants. Existing V123 LOD node selection requires a combined, appropriately rigged model.
  const profiles=[{name:'LOD0',ratio:1},{name:'LOD1',ratio:0.65},{name:'LOD2',ratio:0.35}];
  mkdirSync(out,{recursive:false});
  const generated=[];
  try{
    for(const profile of profiles){
      const file=join(out,`${basename(input,'.glb')}_${profile.name}.glb`);
      const args=profile.ratio===1?['copy',input,file]:['simplify',input,file,'--ratio',String(profile.ratio),'--error','0.001'];
      const run=spawnSync(process.execPath,[cli,...args],{stdio:'pipe',encoding:'utf8',maxBuffer:1024*1024*4});
      if(run.status!==0)throw Error(`${profile.name} generation failed: ${(run.stderr||run.stdout||'unknown error').slice(-800)}`);
      const result=metadata(file);validate(original,result);
      generated.push({...profile,file:basename(file),...result,bytesSaved:original.bytes-result.bytes,triangleReduction:original.triangles?1-result.triangles/original.triangles:0});
    }
    const manifest={schemaVersion:1,source:basename(input),sourceStats:original,variants:generated,notes:['Separate GLB files; not embedded LOD nodes.','Check animations, deformations, materials and foot placement visually before replacing the avatar.','File size and triangle reductions depend on actual geometry and animation constraints.']};
    writeFileSync(join(out,'lod-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify(manifest,null,2));
  }catch(e){rmSync(out,{recursive:true,force:true});console.error(e.message);process.exit(1)}
}
