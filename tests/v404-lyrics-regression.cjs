'use strict';
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {parseSpotifyColorLyrics,colorLyricsUrl}=load('services/lyrics/providers/spotifyColorLyrics');
const {resolveVocalCueV367}=load('components/visualizer/vocalLipSyncV367');
const id='0VjIjW4GlUZAMYd2vXMi3b';
assert.equal(colorLyricsUrl('../escape'),null,'invalid Spotify IDs rejected');
assert(colorLyricsUrl(id,id).includes(`/album/${id}/track/${id}`));
const parsed=parseSpotifyColorLyrics({lyrics:{syncType:'LINE_SYNCED',lines:[
  {startTimeMs:'3000',words:'Zweite Zeile'},
  {startTimeMs:'1000',words:'Hallo Welt'},
  {startTimeMs:'invalid',words:'Do not accept'},
  {startTimeMs:'4000',words:'♪'},
]}});
assert(parsed&&parsed.synced);
assert.deepEqual(parsed.lines.map(l=>l.startMs),[1000,3000]);
assert.deepEqual(parsed.lines.map(l=>l.endMs),[3000,null]);
assert.equal(resolveVocalCueV367(parsed,500,true).jaw,0,'intro has no mouth movement');
assert.equal(resolveVocalCueV367(parsed,2500,false).jaw,0,'paused lyrics silent');
assert.equal(resolveVocalCueV367(parsed,3500,true).confidence,'line','line timestamps must not claim word accuracy');
const plain=parseSpotifyColorLyrics({lyrics:{syncType:'UNSYNCED',lines:[{words:'Hallo'},{words:'Welt'}]}});
assert(plain&&!plain.synced);
assert.equal(plain.plainText,'Hallo\nWelt');
assert.equal(resolveVocalCueV367(plain,100,true).jaw,0,'unsynced text must not drive the mouth');
for(const invalid of [{},{lyrics:{lines:[]}}, {lyrics:{syncType:'LINE_SYNCED',lines:[{startTimeMs:'oops',words:'no'}]}}]) {
  assert.equal(parseSpotifyColorLyrics(invalid),null);
}
const precise={synced:true,lines:[{startMs:1000,endMs:2400,text:'Boom ja',words:[
  {startMs:1000,endMs:1350,text:'Boom'}, {startMs:1700,endMs:2100,text:'ja'}
]}]};
assert.equal(resolveVocalCueV367(precise,1200,true).confidence,'word');
assert.equal(resolveVocalCueV367(precise,1500,true).jaw,0,'word-level gaps remain silent');
assert.equal(resolveVocalCueV367(precise,2200,true).jaw,0,'word-level endings silent');
console.log('PASS V404 lyrics QA: Spotify validation, sorted timestamps, unsynced, gaps, pause and confidence');
