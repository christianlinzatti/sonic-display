import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { metadata, validate } from '../scripts/avatar-lod-pipeline.mjs';
const dir=mkdtempSync(join(tmpdir(),'sonic-lod-'));
try{
 const obj={asset:{version:'2.0'},accessors:[{count:300}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],animations:[{channels:[{},{}]}],skins:[{}]};
 const bytes=Buffer.from(JSON.stringify(obj));const size=Math.ceil(bytes.length/4)*4;const b=Buffer.alloc(20+size,32);
 b.writeUInt32LE(0x46546c67,0);b.writeUInt32LE(2,4);b.writeUInt32LE(b.length,8);b.writeUInt32LE(size,12);b.writeUInt32LE(0x4e4f534a,16);bytes.copy(b,20);
 const file=join(dir,'test.glb');writeFileSync(file,b);const m=metadata(file);
 assert.equal(m.triangles,100);assert.equal(m.animations,1);assert.equal(m.animationChannels,2);assert.equal(m.skins,1);
 validate(m,{...m,triangles:50});
 assert.throws(()=>validate(m,{...m,skins:0}),/skins changed/);
 assert.throws(()=>validate(m,{...m,animationChannels:0}),/animationChannels changed/);
 assert.throws(()=>validate(m,{...m,triangles:0}),/triangles removed/);
 const corrupt=join(dir,'bad.glb');writeFileSync(corrupt,Buffer.from('bad'));assert.throws(()=>metadata(corrupt),/Invalid GLB/);
 console.log('LOD pipeline regression: 9 checks passed');
}finally{rmSync(dir,{recursive:true,force:true})}
