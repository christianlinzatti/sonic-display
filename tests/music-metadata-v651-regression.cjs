'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('services/musicMetadata/normalizeV651');
const mbid='cc197bad-dc9c-440d-a5b5-d52ba2e14234';
assert.equal(m.normalizeMusicBrainzArtistV651({artists:[{name:'Other',id:mbid},{name:'Coldplay',id:mbid,country:'GB','life-span':{begin:'1997'}}]},'Coldplay').mbid,mbid);
assert.equal(m.normalizeMusicBrainzArtistV651({artists:[{name:'Coldplay Tribute',id:mbid}]},'Coldplay'),null);
assert.equal(m.normalizeMusicBrainzArtistV651({artists:[{name:'Coldplay',id:'not-a-uuid'}]},'Coldplay'),null);
assert.equal(m.normalizeMusicBrainzArtistV651({artists:[{name:'Coldplay',id:mbid},{name:'Coldplay',id:'00000000-0000-0000-0000-000000000001'}]},'Coldplay'),null,'ambiguous artist IDs must not be guessed');
assert.equal(m.normalizeMusicBrainzReleaseGroupV651({'release-groups':[{id:mbid,title:'Parachutes','first-release-date':'2000-07-10'}]},'Parachutes').releaseDate,'2000-07-10');
assert.equal(m.normalizeMusicBrainzReleaseGroupV651({'release-groups':[{id:mbid,title:'Tribute to Parachutes'}]},'Parachutes'),null);
assert.equal(m.normalizeMusicBrainzRecordingV651({recordings:[{id:mbid,title:'Yellow',length:270000,isrcs:['USAA10000001','bad']}]},'Yellow').isrcs.length,1);
const a=m.normalizeAudioDbArtistV651({artists:[{strArtist:'coldplay',strGenre:'Alternative Rock',strBiographyDE:'<b>Deutsche Biografie</b> &amp; mehr',strArtistThumb:'http://example.test/a.jpg',strArtistFanart:'https://images.test/one.jpg',idArtist:'123'}]},'Coldplay');
assert.equal(a.genre,'Alternative Rock');assert.equal(a.biography,'Deutsche Biografie & mehr');assert.equal(a.photos.length,1);
assert.equal(m.normalizeAudioDbArtistV651({artists:[{strArtist:'Coldplay Tribute'}]},'Coldplay'),null);
const lf=m.normalizeLastfmArtistV651({artist:{name:'Coldplay',mbid,stats:{listeners:'12345',playcount:'867'},tags:{tag:[{name:'Alternative rock'},{name:'britpop'}]},similar:{artist:[{name:'Muse'},{name:'Snow Patrol'}]},bio:{summary:'<p>Bio <a href="x">weiter</a></p>'}}},'coldplay');
assert.equal(lf.listeners,12345);assert.deepEqual(lf.similar,['Muse','Snow Patrol']);assert(!lf.biography.includes('<'));
const tr=m.normalizeLastfmTrackV651({track:{name:'Yellow',listeners:'75',toptags:{tag:{name:'rock'}}}},'Yellow');assert.deepEqual(tr.genre,['rock']);
const photos=m.normalizeFlickrPhotosV651({photos:{photo:[
 {id:'123',owner:'owner',ownername:'Photographer',license:'4',title:'Coldplay concert',url_z:'https://farm.test/c.jpg'},
 {id:'124',owner:'owner',license:'0',title:'Coldplay photo',url_z:'https://farm.test/u.jpg'},
 {id:'125',owner:'owner',license:'5',title:'Unrelated band',url_z:'https://farm.test/wrong.jpg'},
 {id:'126',owner:'owner',license:'9',title:'Coldplay photo',url_m:'https://farm.test/cc0.jpg'},
 {id:'127',owner:'owner',license:'4',title:'Coldplay image',url_z:'http://farm.test/http.jpg'},
 ]}},'Coldplay');
assert.equal(photos.length,2);assert(photos[0].credit.includes('CC BY'));assert(photos[0].credit.includes('flickr.com/photos/'));
assert.equal(m.normalizeFlickrPhotosV651({photos:{photo:[{id:'1',owner:'x',license:'0',title:'Coldplay'}]}},'Coldplay').length,0);
assert.equal(m.httpsV651('javascript:alert(1)'),null);
const service=fs.readFileSync('lib/musicMetadataV651.ts','utf8');
const endpoint=fs.readFileSync('app/api/music-metadata/route.ts','utf8');
const artist=fs.readFileSync('app/api/stage-content/artist/route.ts','utf8');
const bio=fs.readFileSync('app/api/stage-content/bio/route.ts','utf8');
const ui=fs.readFileSync('components/visualizer/GalleryPreviewEditorV343.tsx','utf8');
assert(service.includes('nextMusicBrainzCall=Date.now()+1100'));
assert(service.includes('THEAUDIODB_API_KEY')&&service.includes("||'123'"));
assert(service.includes('FLICKR_API_KEY')&&service.includes("license:'4,5,9,10'"));
assert(service.includes('LASTFM_API_KEY')&&service.includes('track.getInfo')&&service.includes('album.getInfo'));
assert(service.includes('musicBrainzQueue=work.then'));
assert(endpoint.includes('getValidSession()')&&endpoint.includes("'Cache-Control','private, no-store'"));
assert(artist.includes('readMusicMetadataV651')&&artist.includes("STAGE_THEAUDIODB_PHOTOS_ENABLED"));
assert(bio.includes('readMusicMetadataV651')&&bio.includes('normalizeWikipediaV335'));
assert(ui.includes('/api/music-metadata?')&&ui.includes('metadata.artist.similar'));
assert(!service.includes('NEXT_PUBLIC_')&&!endpoint.includes('process.env.'));
console.log('PASS V651 music metadata: 4 providers, strict artist matching, licenses/attribution, safe urls, OAuth gate, key isolation, integration');
