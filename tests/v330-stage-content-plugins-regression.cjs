require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
function read(f){return fs.readFileSync(path.join(root,f),'utf8');}
const cache=new Map();
function moduleTS(rel){
  const key=path.normalize(rel);if(cache.has(key))return cache.get(key);
  const source=read(key),code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const m={exports:{}};cache.set(key,m.exports);
  const from=path.dirname(key);const customRequire=name=>{
    if(name.startsWith('./')||name.startsWith('../'))return moduleTS(path.normalize(path.join(from,name)+'.ts'));
    throw Error('Unexpected require '+name);
  };
  vm.runInNewContext(`(function(module,exports,require){${code}\n})`,{console,URL})(m,m.exports,customRequire);
  return m.exports;
}
(async()=>{
  const config=moduleTS('services/stageContent/stageContentV330.ts');
  const colors=moduleTS('services/stageContent/paletteV330.ts');
  const providers=moduleTS('services/stageContent/providersV330.ts');
  const defaults=config.sanitizeStageSettingsV330(null);
  assert.equal(defaults.enabled,false);assert.equal(defaults.sources.canvas,true);assert.equal(defaults.sources.concerts,false);assert.equal(defaults.endpoints.photos,'/api/stage-content/artist?artist={artist}');
  const unsafe=config.sanitizeStageSettingsV330({enabled:true,rotationSeconds:-9,screenScale:999,position:'bad',sources:{concerts:true},endpoints:{text:'https://example.com/private',photos:'/api/photo?artist={artist}',concerts:'//attacker'}});
  assert.equal(unsafe.rotationSeconds,5);assert.equal(unsafe.screenScale,2);assert.equal(unsafe.position,'behind');
  assert.equal(unsafe.endpoints.text,'');assert.equal(unsafe.endpoints.concerts,'');assert.equal(unsafe.endpoints.photos,'/api/photo?artist={artist}');
  assert.equal(config.validStageEndpointV330('/api/../../secret'),'');
  assert.equal(config.validStageEndpointV330('/api/test?x=javascript:alert(1)'),'');
  assert.equal(config.buildStageEndpointV330('/api/p?artist={artist}&track={trackId}&title={title}',{id:'id23',title:'Guten Morgen',artist:'A & B'}),'/api/p?artist=A%20%26%20B&track=id23&title=Guten%20Morgen');
  assert.equal(config.safeStageMediaV330('javascript:alert(1)'),undefined);
  assert.equal(config.safeStageMediaV330('http://remote-server.org/file.mp4'),undefined);
  assert.equal(config.normalizeStageResponseV330('text',{bio:'Bio in German',title:'Künstler'}).text,'Bio in German');
  assert.equal(config.normalizeStageResponseV330('text',{}),null);
  assert.equal(config.normalizeStageResponseV330('photos',{imageUrl:'https://example.com/portrait.webp'}).kind,'image');
  assert.equal(config.normalizeStageResponseV330('photos',{imageUrl:'javascript:alert(1)'}),null);
  const events=config.normalizeStageResponseV330('concerts',{events:[{date:'2026-12-12',name:'Live',venue:'Arena',city:'Wien'}, {date:'',name:'invalid'}]});
  assert.equal(events.events.length,1);assert.equal(events.events[0].title,'Live');
  assert.equal(config.selectStageSlidesV330([{source:'cover',kind:'image',url:'https://example.com',title:'cover'}],5).source,'cover');
  assert.equal(config.selectStageSlidesV330([],1),null);
  assert.equal(colors.analyzeStagePixelsV330([255,15,35,255,252,15,35,255]).primary.startsWith('#'),true);
  assert.equal(colors.analyzeStagePixelsV330([0,0,0,0]),null);
  const script=read('components/visualizer/StageContentScreenV330.tsx');
  for(const word of ['<Html','<video','playing','reducedMotion','source','concerts','onError'])assert.ok(script.includes(word),word);
  const wiring=read('components/visualizer/VisualizerStage.tsx');
  assert.ok(wiring.includes('useStageContentV330(track)'));assert.ok(wiring.includes('stageScreenV330='));assert.ok(wiring.includes('musicPalette??stagePalette'));
  assert.ok(read('components/visualizer/ThreeAvatar.tsx').includes('<StageContentScreenV330'));
  assert.ok(read('components/SettingsPanel.tsx').includes('<StageContentPluginSettingsV330'));
  const route=read('app/api/canvas/route.ts');
  assert.ok(route.includes('getValidSession'));assert.ok(route.includes('canvaz-cache/v1/tracks'));assert.ok(route.includes('setSessionCookie'));
  assert.ok(!route.includes('getValidSpotifyToken'));assert.ok(read('app/api/stage-content/artist/route.ts').includes('getValidSession'));
  let requests=[];
  global.fetch=async (url)=>{requests.push(url);if(url.startsWith('/api/canvas'))return {ok:true,json:async()=>({canvasUrl:'https://cdn.example.com/clip.mp4'})};return {ok:true,json:async()=>({text:'Biographie'})};};
  // vm sandbox exposes its own globalThis; provide fetch to the module wrapper.
  const compiled=ts.transpileModule(read('services/stageContent/providersV330.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};
  const getRequire=n=>n==='./stageContentV330'?config: (()=>{throw Error(n)})();
  vm.runInNewContext(`(function(module,exports,require,fetch){${compiled}\n})`,{console,URL})(mod,mod.exports,getRequire,global.fetch);
  const populated=config.sanitizeStageSettingsV330({enabled:true,sources:{canvas:true,cover:true,text:true},endpoints:{text:'/api/artist?artist={artist}'}});
  const results=await mod.exports.loadStageSlidesV330({id:'1234567890123456789012',title:'Song',artist:'Artist',albumCoverUrl:'https://img.example.com/a.jpg'},populated,new AbortController().signal);
  assert.equal(results.length,3);assert.equal(results[0].source,'canvas');assert.equal(results[1].source,'cover');assert.equal(results[2].source,'text');
  assert.equal(requests[0],'/api/canvas?trackId=1234567890123456789012');
  assert.equal(requests[1],'/api/artist?artist=Artist');
  const empty=await mod.exports.loadStageSlidesV330({id:'',title:'',artist:'',albumCoverUrl:null},defaults,new AbortController().signal);
  assert.equal(empty.length,0);
  assert.ok(['0.1.0-v330','0.1.0-v331','0.1.0-v331','0.1.0-v332','0.1.0-v333','0.1.0-v334','0.1.0-v335','0.1.0-v336','0.1.0-v337','0.1.0-v338','0.1.0-v339','0.1.0-v340','0.1.0-v341','0.1.0-v342','0.1.0-v343','0.1.0-v346','0.1.0-v347','0.1.0-v349','0.1.0-v350','0.1.0-v351','0.1.0-v352','0.1.0-v353','0.1.0-v354','0.1.0-v355','0.1.0-v356','0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(require('../package.json').version));
  console.log('V330 stage content plugin regression passed');
})().catch(e=>{console.error(e);process.exit(1);});
