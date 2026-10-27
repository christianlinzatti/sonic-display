'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {previewChecksV532,reviewKeyV532,PREVIEW_QUALITY_CLIPS_V532}=load('components/visualizer/avatarPreviewQualityV532');
const {stripDuplicateAnimationsV531,parseGlbV531,inspectSharedMotionV531,sameSharedMotionV531}=load('components/visualizer/sharedEmbeddedMotionV531');
const files=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function accessorInfo(glb,index){
  const a=glb.json.accessors[index],view=glb.json.bufferViews[a.bufferView];
  assert(a&&!a.sparse&&!view.byteStride&&a.componentType===5126,'expected noninterleaved f32 animation');
  const elements={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
  assert(elements);
  const start=(view.byteOffset||0)+(a.byteOffset||0),bytes=elements*a.count*4;
  assert(start>=0&&start+bytes<=glb.bin.length);
  const data=glb.bin.subarray(start,start+bytes);
  return {data, type:a.type, count:a.count, components:elements};
}
function sourceClipSignature(glb,clipName){
  const clip=glb.json.animations.find(a=>a.name===clipName);
  assert(clip,`missing ${clipName}`);
  const samples=clip.channels.map(ch=>{
    const sm=clip.samplers[ch.sampler];
    assert(['LINEAR','STEP'].includes(sm.interpolation||'LINEAR'));
    const input=accessorInfo(glb,sm.input),output=accessorInfo(glb,sm.output);
    const name=glb.json.nodes[ch.target.node]?.name;
    assert(name && (ch.target.path==='rotation'||ch.target.path==='scale'||ch.target.path==='translation'));
    return [name,ch.target.path,sm.interpolation||'LINEAR',input.type,input.count,hash(input.data),output.type,output.count,hash(output.data)];
  });
  return {name:clipName,channels:samples.length,checksum:hash(JSON.stringify(samples))};
}
(async()=>{
  assert.deepEqual(PREVIEW_QUALITY_CLIPS_V532,['Idle_Groove','Dance_RapTwoStep','Dance_ClubGroove']);
  assert.equal(previewChecksV532([{name:'Dance_ClubGroove',index:4},{name:'Idle_Groove',index:17},{name:'Dance_RapTwoStep',index:8}]).map(c=>c.index).join(','),'17,8,4');
  assert.equal(previewChecksV532([{name:'Something_Else',index:0}]).length,0);
  assert.equal(previewChecksV532([{name:'Idle_Groove',index:-1}]).length,0);
  assert.notEqual(reviewKeyV532('nova','Idle_Groove'),reviewKeyV532('rae','Idle_Groove'));
  const samples=[];
  for (const filename of files){
    const p=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',filename);
    if(!fs.existsSync(p)) continue;
    const raw=fs.readFileSync(p),source=parseGlbV531(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length));
    const compact=parseGlbV531(stripDuplicateAnimationsV531(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length)).buffer);
    assert.equal(compact.json.animations,undefined,'shared asset must have no duplicated clips');
    const index=previewChecksV532(source.json.animations.map((clip,i)=>({name:clip.name,index:i})));
    assert.equal(index.length,3);
    const results=index.map(clip=>{
      const sign=sourceClipSignature(source,clip.name);
      assert.equal(sign.channels,165,`${filename} ${clip.name}: missing tracks`);
      for(const channel of source.json.animations[clip.index].channels){
        const target=source.json.nodes[channel.target.node].name;
        const dest=compact.json.nodes.filter(n=>n.name===target);
        assert.equal(dest.length,1,`${filename}: ambiguous/missing animation target ${target}`);
      }
      return sign;
    });
    const identity=await inspectSharedMotionV531(new File([raw],filename));
    samples.push({filename,identity,results});
    console.log('V532',filename,results.map(x=>`${x.name}: ${x.channels} target tracks`).join(', '));
  }
  if(samples.length){
    assert.equal(samples.length,5,'All five fixtures must be available for full comparison');
    for (const sample of samples){
      assert(sameSharedMotionV531(samples[0].identity,sample.identity),`${sample.filename}: shared rig/motions differ`);
      assert.deepEqual(sample.results,samples[0].results,`${sample.filename}: 3-clip source animation values differ`);
    }
    console.log('V532 numeric parity: 5 avatars x 3 clips = 15 shared clip checks; 2,475 track bindings');
  } else console.log('V532 GLB fixtures not present; fixture-only assertions skipped');
  const root=path.join(__dirname,'..');
  const installer=fs.readFileSync(path.join(root,'components/CharacterMotionBatchInstaller.tsx'),'utf8');
  const preview=fs.readFileSync(path.join(root,'components/visualizer/AvatarPreview3D.tsx'),'utf8');
  for (const marker of ['previewChecksV532','showOriginalV531','installedSharedUrl','qualityCompleteV532','acceptedClipsV532','playedModesV532','onPreviewPlaybackV532','Beide Ansichten geprüft'])assert(installer.includes(marker),`Missing UI marker ${marker}`);
  assert(installer.includes('disabled={!both}'),'a clip cannot be approved without playing both modes');
  assert(installer.includes('const [shareMotionsV531,setShareMotionsV531]=useState(false)'),'compaction must remain opt-in');
  assert(preview.includes('if (!playing) onPreviewPlaybackV532?.()'),'do not auto-mark a 3D playback pass');
  assert(preview.includes('selectedEmbeddedClipIndex'),'clip index must be selectable');
  assert(preview.includes('readyForSelectedV532')&&preview.includes('setPlaying(false)'),'A/B requires loaded requested clip and a fresh Play');
  console.log('PASS V532 3-clip A/B quality workflow + all available original/shared GLB binding tests');
})().catch(e=>{console.error(e);process.exitCode=1;});
