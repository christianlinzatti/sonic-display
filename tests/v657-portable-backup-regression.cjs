'use strict';
/** V657 archive round-trip, corruption/traversal rejection and device-path remapping. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const api=load('services/settings/portableArchiveV657');
const {createUnifiedBackup,parseUnifiedBackup,previewUnifiedBackup,applyUnifiedBackup}=load('services/settings/unifiedBackup');
const data=new Map([
 ['sonic.character.motion.library.v190',JSON.stringify({files:['/animations/flow.glb'],model:'local:artist.glb'})],
 ['sonic-display-glb-blend-presets-v492',JSON.stringify({presets:[{modelId:'local:artist.glb'}]})],
 ['sonic-camera-presets-v290',JSON.stringify([{id:'wide'}])],
 ['sonic-show-timeline-v354',JSON.stringify([{time:10}])],
 ['spotify-token','THIS-MUST-NEVER-APPEAR']]);
const store={get length(){return data.size},key(i){return [...data.keys()][i]??null},getItem(key){return data.get(key)??null},setItem(key,v){data.set(key,v)},removeItem(key){data.delete(key)}};
const backup=createUnifiedBackup(store);
const modelBytes=Buffer.alloc(1024);modelBytes.write('glTF',0,'ascii');modelBytes.writeUInt32LE(2,4);modelBytes.writeUInt32LE(1024,8);
const motionBytes=Buffer.from(modelBytes);motionBytes[64]=55;
async function manifest(assets){return {format:'sonic-display-portable-v657',version:1,createdAt:'2026-10-28T00:00:00Z',settings:backup,settingsSha256:await api.sha256TextV657(JSON.stringify(backup)),avatarConfig:{'artist.glb':{label:'Artist',animationUrl:'/animations/flow.glb'}},avatarConfigSha256:await api.sha256TextV657(JSON.stringify({'artist.glb':{label:'Artist',animationUrl:'/animations/flow.glb'}})),assets,unresolved:['blob:transient']}}
async function main(){
 assert.equal(Object.keys(backup.entries).length,4);
 assert(!JSON.stringify(backup).includes('THIS-MUST-NEVER-APPEAR'));
 const assets=[{path:'assets/00001.glb',kind:'models',filename:'artist.glb',url:'/avatars/artist.glb',size:1024,sha256:await api.sha256BlobV657(new Blob([modelBytes]))},{path:'assets/00002.glb',kind:'animations',filename:'flow.glb',url:'/animations/flow.glb',size:1024,sha256:await api.sha256BlobV657(new Blob([motionBytes]))}];
 const blobs=new Map([[assets[0].path,new Blob([modelBytes])],[assets[1].path,new Blob([motionBytes])]]);
 const tar=api.createPortableTarV657(await manifest(assets),blobs);
 assert.equal(tar.size%512,0);
 const result=await api.readPortableTarV657(new File([tar],'backup.tar'));
 assert.equal(result.assets.size,2);
 assert.equal(result.manifest.unresolved[0],'blob:transient');
 assert.deepEqual([...result.assets.keys()],assets.map(a=>a.path));
 assert.equal(await api.sha256BlobV657(result.assets.get(assets[0].path)),assets[0].sha256);
 const mapping={'/avatars/artist.glb':'https://example.test/restored.glb','/animations/flow.glb':'/animations/restored.glb','local:artist.glb':'local:restored.glb'};
 const mapped=api.remapSettingsV657(result.manifest.settings,mapping);
 assert.equal(JSON.parse(mapped.entries['sonic.character.motion.library.v190']).model,'local:restored.glb');
 assert.equal(JSON.parse(mapped.entries['sonic.character.motion.library.v190']).files[0],'/animations/restored.glb');
 assert.equal(JSON.parse(mapped.entries['sonic-display-glb-blend-presets-v492']).presets[0].modelId,'local:restored.glb');
 for(const k of Object.keys(mapped.entries))data.delete(k);
 assert.equal(applyUnifiedBackup(previewUnifiedBackup(mapped,store),store,{overwrite:false,groups:['avatar','timeline']}),4);
 const broken=Buffer.from(await tar.arrayBuffer());
 let firstAssetHeader=-1;
 for(let i=512;i<broken.length;i+=512){if(broken.toString('ascii',i,i+16)==='assets/00001.glb'){firstAssetHeader=i;break;}}
 assert(firstAssetHeader>=512&&firstAssetHeader%512===0);
 const firstAssetPayload=firstAssetHeader+512;
 broken[firstAssetPayload+64]^=255;
 await assert.rejects(api.readPortableTarV657(new File([broken],'corrupt.tar')),/SHA-256/);
 await assert.rejects(api.readPortableTarV657(new File([tar.slice(0,-1024)],'truncated.tar')),/unvollständig|Archivgröße|Trunkiert|TAR/);
 await assert.rejects(api.readPortableTarV657(new File([tar.slice(0,-512)],'one-footer-block.tar')),/TAR-Abschluss/);
 await assert.rejects(api.readPortableTarV657(new File([tar,new Uint8Array(512)],'extra-block.tar')),/TAR-Abschluss/);
 const maliciousFooter=Buffer.from(await tar.arrayBuffer());maliciousFooter[maliciousFooter.length-1]=97;
 await assert.rejects(api.readPortableTarV657(new File([maliciousFooter],'nonzero-footer.tar')),/TAR-Abschluss/);
 assert.throws(()=>api.validatePortableManifestV657({...result.manifest,assets:[{...assets[0],path:'../evil.glb'}]}),/Ungültiger Dateieintrag/);
 assert.throws(()=>api.validatePortableManifestV657({...result.manifest,assets:[assets[0],assets[0]]}),/Doppelte Archivdatei/);
 assert.throws(()=>api.validatePortableManifestV657({...result.manifest,assets:[{...assets[0],size:101*1024*1024}]}),/Ungültiger Dateieintrag/);
 assert.equal(api.validAssetNameV657('../test.glb'),false);
 assert.equal(api.validAssetNameV657('test.glb'),true);
 const ui=fs.readFileSync('components/PortableBackupV657.tsx','utf8');
 for(const s of ['readPortableTarV657','sha256BlobV657','previewUnifiedBackup','applyUnifiedBackup','window.confirm','upload(','restore-metadata','unresolved','remapSettingsV657'])assert(ui.includes(s),s);
 const apiList=fs.readFileSync('app/api/portable-backup/assets/route.ts','utf8');
 const apiFetch=fs.readFileSync('app/api/portable-backup/asset/route.ts','utf8');
 for(const s of ['isAdmin','readAvatarConfig'])assert(apiList.includes(s));
 for(const s of ['isAdmin','listPortableAssetsV657'])assert(apiFetch.includes(s));
 assert.throws(()=>api.validatePortableManifestV657({...result.manifest,assets:[{...assets[0],kind:'previews',filename:'preview.glb'}]}),/Ungültiger Dateieintrag/);
 assert.throws(()=>api.validatePortableManifestV657({...result.manifest,assets:[{...assets[0],kind:'models',filename:'model.gltf',path:'assets/00001.gltf'}]}),/Ungültiger Dateieintrag/);
 assert.throws(()=>api.validatePortableManifestV657({...result.manifest,assets:[{...assets[0],filename:'fake.png'}]}),/Ungültiger Dateieintrag/);
 const assetsSource=fs.readFileSync('lib/portableBackupAssetsV657.ts','utf8');
 assert(assetsSource.includes('\\.glb$')||assetsSource.includes('\\.glb'), 'standalone GLB only for portable model and motion export');
 const uploadSource=fs.readFileSync('components/PortableBackupV657.tsx','utf8');
 assert(uploadSource.includes("'image/png'"));
 assert(uploadSource.includes('contentType:mime'),'Blob image uploads must send the permitted image MIME type');
 const local=fs.readFileSync('app/api/portable-backup/import-file/route.ts','utf8');
 for(const s of ['sameOrigin','isAdmin','NODE_ENV','"wx"',"flag:'wx'"]){if(s==='"wx"')continue;assert(local.includes(s),s);}
 console.log('PASS V657 portable backup: TAR roundtrip, SHA-256, corrupted payload, path/size/duplicate rejection, four settings groups, remapping, guarded import/export');
}
main().catch(e=>{console.error(e);process.exitCode=1});
