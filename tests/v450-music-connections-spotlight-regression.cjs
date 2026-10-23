'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planMusicConnectionSpotlightV450}=load('services/genius/musicConnectionsSpotlightV450');
const {buildGeniusMusicDiscoveryV449}=load('services/genius/musicDiscoveryV449');
const fixture={id:51,title:'Rap Feature',url:'https://genius.com/Rap-feature-lyrics',
 song_relationships:[{relationship_type:'samples',songs:[{title:'Soul Sample',url:'https://genius.com/Soul-sample-lyrics',primary_artist:{name:'Soul Singer'}}]},
 {relationship_type:'remixed_by',songs:[{title:'Club Remix',url:'https://genius.com/Club-remix-lyrics'}]}],
 producer_artists:[{name:'Beat Producer',url:'https://genius.com/artists/Beat-producer'}],
 featured_artists:[{name:'Feature Artist',url:'https://genius.com/artists/Feature-artist'}]};
const discoveries=buildGeniusMusicDiscoveryV449(fixture);
assert.equal(discoveries.length,4);
const plan=(time,playing=true,items=discoveries)=>planMusicConnectionSpotlightV450(items,'Rap Feature',time,playing);
assert.equal(plan(0),null);
assert.equal(plan(24999),null);
assert.equal(plan(25000,false),null);
assert.equal(plan(25000,true,[]),null);
assert.equal(plan(Number.NaN),null);
assert.equal(plan(Infinity),null);
assert.equal(plan(-500),null);
const sample=plan(25000);
assert.equal(sample.kind,'related-song');
assert.equal(sample.heading,'MUSIKVERBINDUNG');
assert.equal(sample.relation,'Sample-Quelle');
assert.equal(sample.sourceTitle,'Rap Feature');
assert.equal(sample.targetTitle,'Soul Sample');
assert.equal(sample.targetArtist,'Soul Singer');
assert.equal(sample.geniusUrl,'https://genius.com/Soul-sample-lyrics');
assert.equal(plan(34999).id,sample.id);
assert.equal(plan(35000),null);
assert.equal(plan(80000),null);
assert.equal(plan(81000).targetTitle,'Club Remix');
assert.equal(plan(137000).kind,'producer');
assert.equal(plan(137000).heading,'PRODUCER SPOTLIGHT');
assert.equal(plan(193000).heading,'FEATURE SPOTLIGHT');
assert.equal(plan(249000).targetTitle,'Soul Sample');
assert.equal(plan(193000,false),null);
assert.equal(plan(81000).id,plan(81000).id); // deterministic after seeking
assert.equal(plan(25000,true,[{...discoveries[0],geniusUrl:'https://genius.com.evil.invalid/foo'}]),null);
assert.equal(plan(25000,true,[{...discoveries[0],spotifyQuery:'x'.repeat(100)}]),null);
assert.equal(plan(25000,true,[{...discoveries[0],geniusUrl:'https://user:pass@genius.com/safe'}]),null);
assert.equal(plan(25000,true,[{...discoveries[0],geniusUrl:'http://genius.com/safe'}]),null);
assert.equal(plan(25000,true,[{...discoveries[0],title:''}]),null);
assert.equal(plan(25000,true,discoveries).spotifyQuery,discoveries[0].spotifyQuery);
const ui=fs.readFileSync('components/GeniusMusicConnectionsV450.tsx','utf8');
assert(ui.includes('planMusicConnectionSpotlightV450('));
assert(ui.includes('MUSIC_DISCOVERY_SEARCH_EVENT_V449'));
assert(ui.includes('rel="noopener noreferrer"'));
assert(ui.includes('aria-live="off"'));
assert(ui.includes('data-reduced-motion'));
assert(ui.includes('className="genius-music-spotlight-v450-nodes"'));
assert(!ui.includes('position:fixed')&&!ui.includes('z-index:100'));
const source=fs.readFileSync('components/GeniusSongInsightsV447.tsx','utf8');
assert(source.includes('connectionSpotlightEnabled&&data?.discoveries?.length'));
assert(source.includes('{connectionSpotlight}{discovery}'));
assert(source.includes('controller.abort()'));
const page=fs.readFileSync('components/SonicDisplay.tsx','utf8');
assert(page.includes('connectionSpotlightEnabled={preferences.geniusSpotlightEnabledV450??true}'));
assert(fs.readFileSync('components/SettingsPanel.tsx','utf8').includes('V450 · Animierte Musikverbindungen'));
assert(fs.readFileSync('context/UiPreferencesContext.tsx','utf8').includes('geniusSpotlightEnabledV450:true'));
assert(fs.readFileSync('types/music.ts','utf8').includes('geniusSpotlightEnabledV450?:boolean'));
const css=fs.readFileSync('app/globals.css','utf8');
assert(css.includes('genius-music-spotlight-v450'));assert(css.includes('@media(prefers-reduced-motion:reduce)'));
assert(css.includes('.genius-music-spotlight-v450[data-reduced-motion="true"]'));
assert(!fs.existsSync('app/api/genius/spotlight/route.ts')); // no new API key, network endpoint, or token exposure
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=450);
console.log('PASS V450: timed grounded source graph, producers/features, safe URLs, Spotify search action, user controls, reduced motion and non-overlay UI');
