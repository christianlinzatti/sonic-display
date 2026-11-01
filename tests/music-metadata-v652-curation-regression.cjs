'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveArtistIdentityV652:identity,mergeGenresV652:genres,rankStagePhotosV652:rank,stagePhotoSceneV652:scene}=load('services/musicMetadata/curationV652');
const a='cc197bad-dc9c-440d-a5b5-d52ba2e14234',b='10000000-0000-0000-0000-000000000002';
assert.deepEqual(identity({mbid:a},{mbid:a.toUpperCase()}),{mbid:a,status:'verified',source:'musicbrainz'});
assert.deepEqual(identity({mbid:a},{mbid:b}),{mbid:null,status:'conflict',source:null});
assert.equal(identity(null,{mbid:a}).status,'provisional');
assert.equal(identity(null,{mbid:'not-a-mbid'}).status,'unresolved');
assert.deepEqual(genres('Alternative Rock',['alternative   rock','Rock','rock','unknown','Hardtekk']),['Alternative Rock','Rock','Hardtekk']);
assert.equal(scene('invalid'),'balanced');
const normalize=load('services/musicMetadata/normalizeV651');
assert.equal(normalize.normalizeLastfmTrackV651({track:{name:'Yellow',artist:{name:'Other Band'}}},'Yellow','Coldplay'),null,'identical song title from a different artist must be ignored');
assert.equal(normalize.normalizeLastfmTrackV651({track:{name:'Yellow',artist:'Coldplay'}},'Yellow','Coldplay').durationMs,null);
const photos=[
 {url:'https://i.scdn.co/image/portrait',source:'spotify',title:'Official portrait',width:1000,height:1200},
 {url:'https://upload.wikimedia.org/live.jpg',page:'https://commons.wikimedia.org/wiki/File:live',source:'commons',title:'Coldplay live concert',width:1600,height:900,credit:'Author · CC BY'},
 {url:'https://farm1.staticflickr.com/8/12345_abcd_z.jpg',page:'https://www.flickr.com/photos/owner/12345',source:'flickr',title:'Coldplay stage concert',width:1600,height:1000,credit:'Photographer · CC BY'},
 {url:'https://farm1.staticflickr.com/8/12345_abcd_m.jpg',page:'https://www.flickr.com/photos/owner/12345',source:'flickr',title:'Coldplay live',width:640,height:400,credit:'Photographer · CC BY'},
 {url:'https://fanart.test/1.jpg',source:'theaudiodb',title:'Band',width:1920,height:1080},
 {url:'http://unsafe.example/2.jpg',source:'commons'},
 ];
const balanced=rank(photos,'balanced'),live=rank(photos,'photos'),lyrics=rank(photos,'lyrics');
assert.equal(balanced.length,4,'duplicate Flickr resolutions and HTTP images are removed');
assert.equal(balanced.filter(p=>p.source==='flickr').length,1);
assert.equal(lyrics[0].source,'spotify','promotional portrait is suitable behind lyrics');
assert.equal(live[0].source,'commons','licensed wide concert shot leads photo-focus scenes');
assert(live.find(p=>p.source==='flickr').credit.includes('CC BY'),'attribution must survive');
assert.equal(rank(photos,'photos')[0].url,live[0].url,'stable output');
assert(!rank(photos).some(p=>p.url.startsWith('http:')));
assert.equal(rank([], 'photos').length,0);
const rootScene=fs.readFileSync('components/visualizer/StageContentScreenV330.tsx','utf8');
const stageApi=fs.readFileSync('app/api/stage-content/artist/route.ts','utf8');
const metadata=fs.readFileSync('lib/musicMetadataV651.ts','utf8');
const stageContract=fs.readFileSync('services/stageContent/stageContentV330.ts','utf8');
assert(stageApi.includes("rankStagePhotosV652(candidates,'lyrics')")&&stageApi.includes("rankStagePhotosV652(candidates,'photos')"));
assert(rootScene.includes('imageSelections?.[focusedScene]'),'stage must use scene-aware image order');
assert(rootScene.includes('photoChoreography.active?photoChoreography.cue'),'manual V350 photo/lyrics priorities must override automatic ranking');
const stage=load('services/stageContent/stageContentV330');
const safeStage=stage.normalizeStageResponseV330('photos',{images:['https://example.org/a.jpg','https://example.org/b.jpg'],selections:{lyrics:['https://example.org/b.jpg','https://evil.test/foreign.jpg'],photos:['http://evil.test/insecure.jpg','https://example.org/a.jpg']}});
assert.deepEqual(safeStage.imageSelections.lyrics,['https://example.org/b.jpg']);
assert.deepEqual(safeStage.imageSelections.photos,['https://example.org/a.jpg']);
assert(stageContract.includes('imageSelections=')&&stageContract.includes('unique.includes(url)'),'untrusted client input must only reorder actual validated images');
assert(metadata.includes("identity.status==='verified'")&&metadata.includes('identityStatus:identity.status'));
console.log('PASS V652 metadata curation: identity conflict isolation, source and genre preferences, photo ranking, image dedup and stage integration');
