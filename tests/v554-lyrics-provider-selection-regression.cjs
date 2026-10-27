'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('./typescript-loader.cjs');
const {load} = require('./helpers/ts-loader-v404.cjs');
const {chooseBestLyricsV554: choose, lyricsTimingV554: timing} = load('services/lyrics/selectionV554');

function lyrics(provider, quality, count=2) {
  return {provider, synced:quality!=='plain', plainText:quality==='plain'?'plain':null,
    lines:Array.from({length:count},(_,i)=>({startMs:quality==='plain'?0:i*1000, endMs:quality==='plain'?null:(i+1)*1000,
      text:`Line ${i}`, ...(quality==='word'?{words:[{text:'Line',startMs:i*1000,endMs:i*1000+500}]}:{})}))};
}
const word = lyrics('lrclib','word');
const line = lyrics('spotify','line',50);
const plain = lyrics('genius','plain',99);
assert.equal(timing(word).quality,'word');
assert.equal(timing(line).quality,'line');
assert.equal(timing(plain).quality,'plain');
assert.equal(choose([line,plain,word]),word,'real word timing outranks more lines, regardless of source order');
assert.equal(choose([plain,line]),line,'line timing outranks unsynced text');
assert.equal(choose([plain]),plain,'plain text is last-resort fallback');
assert.equal(choose([null,undefined]),null);
assert.equal(choose([line,lyrics('lrclib','line',60)]).provider,'lrclib','more timed lines wins within same tier');
assert.equal(choose([lyrics('spotify','line'),lyrics('lrclib','line')]).provider,'spotify','tie uses stable provider order');
const invalidWord={...word, lines:[{startMs:1000,endMs:2000,text:'Hallo',words:[
  {text:'Bad',startMs:NaN,endMs:null},{text:'Wrong',startMs:999,endMs:1200},
  {text:'Impossible',startMs:1800,endMs:1700}]}]};
assert.equal(timing(invalidWord).quality,'line','invalid word markers do not count');
assert.equal(choose([invalidWord,line]),line,'malformed word timing must not outrank good line timing');
assert.equal(timing({...word,lines:[{startMs:0,endMs:null,text:'Hi',words:[{text:'Hi',startMs:0,endMs:null}]}]}).quality,'word');

function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};}
function mockedServer(mocks){
  const source=fs.readFileSync('services/lyrics/server.ts','utf8');
  const out=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const mod={exports:{}};
  const entries={
    '@/services/lyrics/providers/lrclib':{lookupLrclibLyrics:mocks.lrclib},
    '@/services/lyrics/providers/lyricsOvh':{lookupLyricsOvh:mocks.ovh},
    '@/services/lyrics/providers/genius':{lookupGeniusLyrics:mocks.genius},
    '@/services/lyrics/providers/spotifyColorLyrics':{lookupSpotifyColorLyrics:mocks.spotify},
    '@/services/lyrics/selectionV554':{chooseBestLyricsV554:choose},
  };
  new Function('module','exports','require',out)(mod,mod.exports,(name)=>{
    assert(name in entries,`Unexpected server dependency: ${name}`);return entries[name];
  });
  return mod.exports;
}
async function main(){
  const old=process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED;
  try {
    const requests=[];const wait={spotify:deferred(),lrclib:deferred(),ovh:deferred(),genius:deferred()};
    const server=mockedServer({
      spotify:(...args)=>{requests.push(['spotify',...args]);return wait.spotify.promise;},
      lrclib:(...args)=>{requests.push(['lrclib',...args]);return wait.lrclib.promise;},
      ovh:(...args)=>{requests.push(['ovh',...args]);return wait.ovh.promise;},
      genius:(...args)=>{requests.push(['genius',...args]);return wait.genius.promise;},
    });
    const query={title:'Track',artist:'Artist',album:'Album',duration:185,trackId:'a'.repeat(22),albumId:'b'.repeat(22)};
    process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED='true';
    let finished=false;
    const running=server.findLyrics(query,'authorized-token').then(x=>{finished=true;return x});
    assert.deepEqual(requests.map(x=>x[0]),['spotify','lrclib','ovh','genius'],'all enabled sources queried concurrently');
    assert.deepEqual(requests[0].slice(1),[query.trackId,query.albumId,'authorized-token']);
    wait.spotify.resolve(line);wait.ovh.resolve(plain);wait.genius.reject(Error('Genius API unavailable'));
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(finished,false,'early line response must not preempt pending word lyrics');
    wait.lrclib.resolve(word);
    assert.equal(await running,word,'delayed word-timed LRCLIB outranks early line-timed Spotify');
    assert.equal(finished,true);

    process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED='false';
    const noSpotify=mockedServer({
      spotify:()=>{throw Error('Spotify must be disabled')},
      lrclib:async()=>line,ovh:async()=>plain,genius:async()=>null,
    });
    assert.equal(await noSpotify.findLyrics(query,'authorized-token'),line,'line fallback without Spotify');
    assert.equal(await noSpotify.findLyrics(query),line,'line fallback without token');
    const noResults=mockedServer({
      spotify:()=>{throw Error('unused')},lrclib:async()=>{throw Error('rate-limited')},
      ovh:async()=>null,genius:async()=>{throw Error('unavailable')},
    });
    assert.equal(await noResults.findLyrics(query),null,'provider errors are isolated');
  } finally {
    if(old===undefined)delete process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED;
    else process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED=old;
  }
  console.log('PASS V554: parallel provider lookup, delayed word priority, line/text fallback, stable selection, invalid timestamps, error isolation, Spotify opt-in');
}
main().catch(e=>{console.error(e);process.exitCode=1});
