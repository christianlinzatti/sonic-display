'use strict';
const assert=require('node:assert/strict'),THREE=require('three');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {ownAvatarResourcesV1009}=load('components/visualizer/ownedAvatarResourcesV1009');
const image={width:1,height:1},texture=new THREE.Texture(image),geometry=new THREE.BoxGeometry(),material=new THREE.MeshStandardMaterial({map:texture});
const source=new THREE.Group();source.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,[material,material]));
let originals=0;for(const resource of [texture,geometry,material])resource.addEventListener('dispose',()=>originals++);
for(let cycle=0;cycle<40;cycle++){
 const model=source.clone();const owned=ownAvatarResourcesV1009(model),a=model.children[0],b=model.children[1];
 assert.notEqual(a.geometry,geometry);assert.notEqual(a.material,material);assert.notEqual(a.material.map,texture);
 assert.equal(a.material.map.source,texture.source);assert.equal(a.material.map.image,image);
 assert.equal(a.geometry,b.geometry);assert.equal(a.material,b.material[0]);assert.equal(b.material[0],b.material[1]);
 let released=0;
 for(const resource of [a.geometry,a.material,a.material.map]){const cleanup=event=>{released++;event.target.removeEventListener('dispose',cleanup);};resource.addEventListener('dispose',cleanup);}
 owned.dispose();owned.dispose();assert.equal(released,3);assert.equal(originals,0);
 assert.equal(source.children[0].geometry,geometry);assert.equal(source.children[0].material,material);
 assert.equal(texture.source.data,image,'cache-owned image remains available');
}
console.log('PASS V1009: 40 private avatar resource lifecycles, renderer listener release, within-instance reuse and untouched cached source/images');
