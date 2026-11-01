'use strict';
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const vars=['MUSICBRAINZ_ENABLED','THEAUDIODB_ENABLED','THEAUDIODB_API_KEY','LASTFM_API_KEY','FLICKR_API_KEY','STAGE_FLICKR_ENABLED'];
const saved=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
const originalFetch=global.fetch;
const requests=[];
(async()=>{
  Object.assign(process.env,{MUSICBRAINZ_ENABLED:'false',THEAUDIODB_ENABLED:'true',THEAUDIODB_API_KEY:'123',LASTFM_API_KEY:'private-lastfm-test-key',FLICKR_API_KEY:'private-flickr-test-key',STAGE_FLICKR_ENABLED:'true'});
  global.fetch=async input=>{
    const uri=new URL(String(input));requests.push(uri);
    let body={};
    if(uri.hostname==='ws.audioscrobbler.com'){
      const method=uri.searchParams.get('method');
      if(method==='artist.getInfo')body={artist:{name:'Coldplay',mbid:'cc197bad-dc9c-440d-a5b5-d52ba2e14234',stats:{listeners:'1234',playcount:'3456'},tags:{tag:[{name:'alternative rock'}]},similar:{artist:[{name:'Muse'}]},bio:{summary:'<p>Live band bio</p>'}}};
      if(method==='track.getInfo')body={track:{name:'Yellow',listeners:'27',duration:'201000',toptags:{tag:[{name:'rock'}]}}};
      if(method==='album.getInfo')body={album:{name:'Parachutes',releasedate:'10 Jul 2000',wiki:{summary:'debut album'}}};
    }else if(uri.hostname==='www.flickr.com')body={stat:'ok',photos:{photo:[{id:'321',owner:'account',ownername:'Photographer',title:'Coldplay live',license:'4',url_m:'https://farm.test/321.jpg'}]}};
    else if(uri.hostname==='www.theaudiodb.com'){
      if(uri.pathname.endsWith('artist-mb.php'))body={artists:[{strArtist:'Coldplay',strGenre:'Pop Rock',strBiographyDE:'Eine Band.',strArtistThumb:'https://fanart.test/artist.jpg'}]};
      if(uri.pathname.endsWith('searchtrack.php'))body={track:[{strTrack:'Yellow',strAlbum:'Parachutes',intDuration:'240000',strGenre:'Alternative Rock'}]};
      if(uri.pathname.endsWith('searchalbum.php'))body={album:[{strAlbum:'Parachutes',intYearReleased:'2000'}]};
    }else throw Error(`Unexpected external host: ${uri.hostname}`);
    return {ok:true,status:200,json:async()=>body};
  };
  const service=load('lib/musicMetadataV651');
  assert.equal(requests.length,0,'import must make no HTTP requests');
  const a=await service.readMusicMetadataV651('Coldplay','Yellow','Parachutes');
  assert.equal(a.artist.mbid,'cc197bad-dc9c-440d-a5b5-d52ba2e14234');
  assert.equal(a.artist.biography,'Eine Band.');
  assert(a.artist.genre.includes('Pop Rock'));assert(a.artist.similar.includes('Muse'));
  assert.equal(a.track.durationMs,240000);assert.equal(a.album.releaseDate,'2000');
  assert.equal(a.artist.photos.length,2);assert.equal(a.providers.flickr,'ok');
  assert.equal(a.providers.musicbrainz,'disabled');
  assert(requests.length===7,`Expected 7 API requests, got ${requests.length}`);
  for(const req of requests)assert(['https:'].includes(req.protocol));
  assert(!JSON.stringify(a).includes('private-lastfm-test-key'));
  assert(!JSON.stringify(a).includes('private-flickr-test-key'));
  await service.readMusicMetadataV651('Coldplay','Yellow','Parachutes');
  assert.equal(requests.length,7,'repeat requests must reuse cache');
  delete process.env.LASTFM_API_KEY;delete process.env.FLICKR_API_KEY;
  const noKeys=await service.readMusicMetadataV651('Other Artist');
  assert.equal(noKeys.providers.lastfm,'disabled');assert.equal(noKeys.providers.flickr,'disabled');
  process.env.LASTFM_API_KEY='private-lastfm-test-key';
  process.env.THEAUDIODB_ENABLED='false';
  const oldCount=requests.length;
  const disabled=await service.readMusicMetadataV651('Not A Band');
  assert.equal(disabled.providers.theaudiodb,'disabled');
  assert(requests.slice(oldCount).every(u=>u.hostname!=='www.theaudiodb.com'),'disabled TheAudioDB must make no requests even when a Last.fm MBID exists');
  console.log('PASS V651 provider orchestration: mocked 4-service calls, no secrets at import, caching, fallbacks, missing keys and no browser key exposure');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
  global.fetch=originalFetch;
  for(const k of vars){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];}
});
