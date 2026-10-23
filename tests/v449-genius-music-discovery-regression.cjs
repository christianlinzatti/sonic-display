'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 buildGeniusMusicDiscoveryV449,safeDiscoveryGeniusUrlV449,
 rotatingGeniusDiscoveryV449,musicDiscoverySearchQueryV449,MUSIC_DISCOVERY_SEARCH_EVENT_V449,
}=load('services/genius/musicDiscoveryV449');
const {parseGeniusSongV447}=load('services/genius/songInsightsV447');
const source={id:4411,title:'Ein Feature Song',url:'https://genius.com/Kunstler-feature-song-lyrics',
 primary_artist:{name:'Künstler Eins'},
 producer_artists:[{name:'Beatmacher A',url:'https://genius.com/artists/Beatmacher-a'},{name:'Beatmacher A',url:'https://genius.com/artists/Beatmacher-a'},{name:'Beatmacher B'}],
 featured_artists:[{name:'Künstler Zwei',url:'https://genius.com/artists/Kunstler-zwei'}],
 song_relationships:[
  {relationship_type:'samples',songs:[
   {id:77,title:'Soul Original',primary_artist:{name:'Soul Sänger'},url:'https://genius.com/Soul-original-lyrics'},
   {id:77,title:'Soul Original',primary_artist:{name:'Soul Sänger'},url:'https://genius.com/Soul-original-lyrics'},
   {title:'Angriff',url:'https://genius.com.evil.test/attack'},
   {title:'Javascript',url:'javascript:alert(1)'},
  ]},
  {relationship_type:'remixed_by',songs:[{title:'Remix Song',url:'https://genius.com/Remix-song-lyrics'}]},
  {relationship_type:'nonsense',songs:[{title:'Falsch',url:'https://genius.com/falsch'}]},
 ],
};
assert.equal(safeDiscoveryGeniusUrlV449('https://genius.com/real'),'https://genius.com/real');
for(const candidate of ['http://genius.com/real','https://genius.com.evil.test/x','javascript:alert(1)','https://other.net/real','https://user:secret@genius.com/foo',''])assert.equal(safeDiscoveryGeniusUrlV449(candidate),null);
const found=buildGeniusMusicDiscoveryV449(source);
assert.equal(found.length,5); // two verified songs + two producers + featured artist
assert.equal(found[0].kind,'related-song');
assert.equal(found[0].reason,'Sample-Quelle');
assert.equal(found[0].title,'Soul Original');
assert.equal(found[0].artist,'Soul Sänger');
assert.equal(found[1].reason,'Remix deines Songs');
assert.equal(found[2].kind,'producer');
assert.equal(found[2].spotifyQuery,'Beatmacher A');
assert.equal(found[3].geniusUrl,source.url); // missing producer profile URL => safe song credit link
assert.equal(found[4].kind,'featured-artist');
assert(!found.some(i=>i.title==='Angriff'||i.title==='Falsch'||i.title==='Javascript'));
assert(found.every(i=>i.geniusUrl.startsWith('https://genius.com/')));
assert(found.every(i=>i.spotifyQuery.length>=2 && i.spotifyQuery.length<=70));
assert.equal(rotatingGeniusDiscoveryV449(found,0,true),null);
assert.equal(rotatingGeniusDiscoveryV449(found,12000,false),null);
assert.equal(rotatingGeniusDiscoveryV449(found,12000,true)?.id,found[0].id);
assert.equal(rotatingGeniusDiscoveryV449(found,54000,true)?.id,found[1].id);
assert.equal(rotatingGeniusDiscoveryV449(found,Number.NaN,true),null);
assert.equal(rotatingGeniusDiscoveryV449([],54000,true),null);
assert.equal(musicDiscoverySearchQueryV449('  Soul Original Soul Sänger '),'Soul Original Soul Sänger');
assert.equal(musicDiscoverySearchQueryV449('x'),null);
assert.equal(musicDiscoverySearchQueryV449(15),null);
assert.equal(musicDiscoverySearchQueryV449('a'.repeat(350)),null);
assert.equal(musicDiscoverySearchQueryV449('a'.repeat(160))?.length,70);
assert.equal(MUSIC_DISCOVERY_SEARCH_EVENT_V449,'sonic:music-discovery-search-v449');
const realParsed=parseGeniusSongV447(source);
assert(realParsed?.discoveries?.length===5); // comes through the original API response, no second Genius request
assert.equal(parseGeniusSongV447({...source,url:'https://evil.test/track'}),null);
assert.deepEqual(buildGeniusMusicDiscoveryV449({...source,url:'https://evil.test/track'}),[]);
assert.deepEqual(buildGeniusMusicDiscoveryV449({...source,producer_artists:[],featured_artists:[],song_relationships:[]}),[]);
const many=buildGeniusMusicDiscoveryV449({...source,song_relationships:[{relationship_type:'samples',songs:Array.from({length:20},(_,i)=>({title:`Track ${i}`,url:`https://genius.com/track-${i}`}))}]});
assert(many.length<=11);assert.equal(many.filter(x=>x.kind==='related-song').length,6);
const ui=fs.readFileSync('components/GeniusMusicDiscoveryV449.tsx','utf8');
assert(ui.includes('<details className="genius-discovery-v449"'));
assert(ui.includes('MUSIC_DISCOVERY_SEARCH_EVENT_V449'));
assert(ui.includes('rel="noopener noreferrer"'));
assert(ui.includes('data-reduced-motion'));
const existing=fs.readFileSync('components/GeniusSongInsightsV447.tsx','utf8');
assert(existing.includes('discoveryEnabled&&data?.discoveries?.length'));
require('./helpers/genius-track-safety-contract-v4737.cjs').assertGeniusTrackSafetyContract(existing);
assert(existing.includes('controller.abort()'));
assert(existing.includes('planCinematicInsightV448('));
const spotify=fs.readFileSync('components/MusicDiscoveryV361.tsx','utf8');
assert(spotify.includes('window.addEventListener(MUSIC_DISCOVERY_SEARCH_EVENT_V449,handler)'));
assert(spotify.includes('setMode("search")'));
assert(spotify.includes('setTerm(query)'));
const page=fs.readFileSync('components/SonicDisplay.tsx','utf8');
assert(page.includes('discoveryEnabled={preferences.geniusDiscoveryEnabledV449??true}'));
assert(fs.readFileSync('components/SettingsPanel.tsx','utf8').includes('V449 · Genius Music Discovery'));
assert(fs.readFileSync('context/UiPreferencesContext.tsx','utf8').includes('geniusDiscoveryEnabledV449:true'));
const css=fs.readFileSync('app/globals.css','utf8');assert(css.includes('genius-discovery-v449'));assert(css.includes('.genius-discovery-v449[data-reduced-motion="true"]'));
const route=fs.readFileSync('app/api/genius/insights/route.ts','utf8');
assert(route.includes('getValidSession()') && route.includes('GENIUS_ACCESS_TOKEN') && route.includes('parseGeniusSongV447('));
assert(!fs.existsSync('app/api/genius/discovery/route.ts')); // reuse existing secure API and response cache
assert(/^0\.1\.0-v(?:44[9]|4[5-9][0-9]|[5-9][0-9]{2})$/.test(require('../package.json').version));
console.log('PASS V449: verified Genius relationships, producer/feature credits, deduplication/limits, safe links, grounded search bridge, original API caching, settings, accessible UI, no unverified artist identification');
