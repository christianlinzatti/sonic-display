'use strict';
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const a='cc197bad-dc9c-440d-a5b5-d52ba2e14234',b='10000000-0000-0000-0000-000000000002';
const variables=['MUSICBRAINZ_ENABLED','LASTFM_API_KEY','THEAUDIODB_ENABLED','THEAUDIODB_API_KEY','FLICKR_API_KEY'];
const before=Object.fromEntries(variables.map(key=>[key,process.env[key]]));
const originalFetch=global.fetch;
(async()=>{
 Object.assign(process.env,{MUSICBRAINZ_ENABLED:'true',LASTFM_API_KEY:'fixture-key',THEAUDIODB_ENABLED:'true',THEAUDIODB_API_KEY:'123'});
 delete process.env.FLICKR_API_KEY;
 const requests=[];
 global.fetch=async input=>{
  const url=new URL(String(input));requests.push(url);
  let payload={};
  if(url.hostname==='musicbrainz.org'){
   if(url.pathname.endsWith('/artist/'))payload={artists:[{id:a,name:'Coldplay',country:'GB'}]};
   else throw Error('A conflicting artist ID must never be followed up with recording/release-group queries');
  }else if(url.hostname==='ws.audioscrobbler.com'){
   payload={artist:{name:'Coldplay',mbid:b,stats:{listeners:'25'},tags:{tag:[{name:'Rock'}]},bio:{summary:'Band bio'}}};
  }else if(url.hostname==='www.theaudiodb.com'){
   if(url.pathname.endsWith('search.php'))payload={artists:[{strArtist:'Coldplay',strGenre:'Rock'}]};
   else throw Error('A conflicting artist ID must not be used for artist-mb.php');
  }else throw Error('Unexpected URL: '+url);
  return {ok:true,status:200,json:async()=>payload};
 };
 const service=load('lib/musicMetadataV651');
 const result=await service.readMusicMetadataV651('Coldplay','Yellow','Parachutes');
 assert.equal(result.artist.identityStatus,'conflict');
 assert.equal(result.artist.mbid,null);
 assert.equal(result.artist.country,'GB');
 assert.deepEqual(result.artist.genre,['Rock']);
 assert.equal(result.artist.fieldSources.country,'musicbrainz');
 assert.equal(result.artist.fieldSources.listeners,'lastfm');
 assert(!requests.some(u=>u.pathname.endsWith('artist-mb.php')));
 assert(!requests.some(u=>u.pathname.endsWith('/recording/')||u.pathname.endsWith('/release-group/')));
 assert.equal(result.track?.mbid,null);assert.equal(result.album?.mbid,null);
 assert(!JSON.stringify(result).includes('fixture-key'));
 console.log('PASS V652 identity integration: conflicting MBIDs quarantine linked lookups, field provenance, safe fallback and no key leaks');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
 global.fetch=originalFetch;
 for(const key of variables){if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];}
});
