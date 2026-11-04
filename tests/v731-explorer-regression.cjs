'use strict';process.env.TZ='Europe/Vienna';
const assert=require('node:assert/strict'),createLoader=require('./helpers/explorer-module-loader.cjs');
const load=createLoader(),c=load('lib/lastfm-explorer-v731.ts');let count=0;function test(name,fn){try{fn();count++;}catch(e){e.message=name+': '+e.message;throw e;}}
const ev=(artist,album,title,playedAt)=>({artist,album,title,playedAt,url:null,cover:null});
const events=[ev('A','First','One','2024-01-01T12:00:00Z'),ev('A','First','One','2024-02-01T12:00:00Z'),ev('A','First Deluxe','One','2025-01-01T12:00:00Z'),ev('B','First','Two','2024-03-01T12:00:00Z'),ev('A','Album unbekannt','Missing','2024-04-01T12:00:00Z')];const before=JSON.stringify(events);
test('album versions and artists separated',()=>assert.equal(c.albumsV731(events).length,3));
test('album ranking',()=>assert.equal(c.albumsV731(events)[0].events.length,2));
test('album details scoped',()=>{const p=c.albumProfileV731(c.albumsV731(events)[0]);assert.equal(p.plays,2);assert.equal(p.topSongs[0].plays,2);assert.equal(p.years[0][0],2024);assert.equal(p.history[0].playedAt,'2024-02-01T12:00:00Z');});
test('unknown and empty albums excluded',()=>assert.equal(c.albumsV731([ev('A','','T','2024-01-01T00:00:00Z')]).length,0));
test('unicode album normalization',()=>assert.equal(c.albumsV731([events[0],ev('Ａ',' FIRST ','Other','2024-02-02T00:00:00Z')]).length,1));
const now=new Date('2025-04-01T12:00:00Z');
test('minimum plays',()=>assert.equal(c.rediscoverV731(events,'song',90,3,now).length,1));
test('calendar threshold inclusive',()=>{const rows=c.rediscoverV731(events,'song',90,3,now);assert.equal(rows[0].gapDays,90);assert.equal(rows[0].plays,3);});
test('threshold excludes recent',()=>assert.equal(c.rediscoverV731(events,'song',91,3,now).length,0));
test('artists aggregate songs',()=>assert.equal(c.rediscoverV731(events,'artist',90,4,now)[0].plays,4));
test('future ignored',()=>assert.equal(c.rediscoverV731([ev('A','X','T','2099-01-01T00:00:00Z')],'song',1,1,now).length,0));
for(const [d,n] of [[0,1],[1,0],[NaN,1],[1.5,2],[36501,1]])test('invalid thresholds '+d+' '+n,()=>assert.throws(()=>c.rediscoverV731(events,'song',d,n,now)));
test('input unchanged',()=>assert.equal(JSON.stringify(events),before));
const backup=c.exportFavoritesV731([{artist:'A'},{artist:'B',title:'Two'}]);
test('backup roundtrip',()=>assert.equal(c.importFavoritesV731(backup,[]).length,2));
test('additive merge and canonical dedupe',()=>assert.equal(c.importFavoritesV731(backup,[{artist:' a '},{artist:'C'}]).length,3));
for(const raw of ['bad','null','{}','{"format":"sonic-favorites-v731","version":2,"favorites":[]}','{"format":"sonic-favorites-v731","version":1,"favorites":[null]}','x'.repeat(200001)])test('invalid backup rejected '+raw.slice(0,15),()=>assert.throws(()=>c.importFavoritesV731(raw,[])));
test('merge capacity',()=>assert.throws(()=>c.importFavoritesV731(backup,Array.from({length:100},(_,i)=>({artist:'artist'+i})))));
test('failed import does not mutate current',()=>{const current=[{artist:'C'}];assert.throws(()=>c.importFavoritesV731('bad',current));assert.equal(current.length,1);});
async function ui(){globalThis.IS_REACT_ACT_ENVIRONMENT=true;const React=require('react'),{create}=require('react-test-renderer'),{act}=React;let data='[{"artist":"Existing"}]',fail=false;const blobs=[];
const uiLoad=createLoader({window:{localStorage:{getItem:()=>data,setItem:(k,v)=>{if(fail)throw Error('quota');data=v;}},setTimeout:f=>f()},document:{createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}},URL:{createObjectURL:b=>{blobs.push(b);return 'blob:x';},revokeObjectURL(){}}});
const Tools=uiLoad('components/LastFmExplorerToolsV730.tsx').LastFmExplorerToolsV730,Plus=uiLoad('components/LastFmExplorerPlusV731.tsx').LastFmExplorerPlusV731;let view;const button=name=>view.root.findAllByType('button').find(b=>b.props.children===name);const click=async name=>{const b=button(name);assert(b&&!b.props.disabled,name);await act(async()=>b.props.onClick());};
await act(async()=>{view=create(React.createElement(Tools,{account:'test',events,selection:null,profile:null,range:{from:'',to:''},rangeError:null,onSelect(){}}));});
await click('Favoriten-Backup herunterladen');test('UI exports valid JSON',()=>assert.equal(blobs.length,1));

const exported=await blobs[0].text();test('exported JSON roundtrip',()=>assert.equal(c.importFavoritesV731(exported,[])[0].artist,'Existing'));
await act(async()=>view.root.findByType('textarea').props.onChange({target:{value:backup}}));await click('Import prüfen');test('preview does not write',()=>assert.equal(JSON.parse(data).length,1));await click('Favoriten zusammenführen');test('UI import merges',()=>assert.equal(JSON.parse(data).length,3));
await act(async()=>view.root.findByType('textarea').props.onChange({target:{value:'bad'}}));await click('Import prüfen');test('bad input cannot apply',()=>assert(!button('Favoriten zusammenführen')));
await act(async()=>view.root.findByType('textarea').props.onChange({target:{value:c.exportFavoritesV731([{artist:'New'}])}}));await click('Import prüfen');fail=true;await click('Favoriten zusammenführen');test('storage error preserves previous favorites',()=>assert.equal(JSON.parse(data).length,3));await act(async()=>view.unmount());
await act(async()=>{view=create(React.createElement(Plus,{events,onSelect(){}}));});const albumButton=view.root.findAllByType('button').find(b=>Array.isArray(b.props.children)&&b.props.children[0]==='First');assert(albumButton);await act(async()=>albumButton.props.onClick());test('album detail opens',()=>assert(view.root.findAllByProps({'aria-label':'Albumprofil'}).length));await click('Albumprofil schließen');test('album detail closes',()=>assert.equal(view.root.findAllByProps({'aria-label':'Albumprofil'}).length,0));await act(async()=>view.unmount());console.log('PASS V731: '+count+' core and React interaction checks');}
ui().catch(e=>{console.error(e);process.exitCode=1;});
