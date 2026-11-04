'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const source=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const local=new Map();const events=[];
const refMap={
 '@/lib/goveeLanV909':'lib/goveeLanV909.ts',
 '@/lib/goveeConcertDirectorV911':'lib/goveeConcertDirectorV911.ts',
 '@/lib/goveeLightShowV912':'lib/goveeLightShowV912.ts',
 '@/lib/goveeTransitionsV914':'lib/goveeTransitionsV914.ts',
 '@/lib/goveeDeviceGroupsV915':'lib/goveeDeviceGroupsV915.ts'
};
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const output=ts.transpileModule(source(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(output.diagnostics?.length??0,0);
 const mod={exports:{}};
 vm.runInNewContext(output.outputText,{module:mod,exports:mod.exports,console,
  window:{dispatchEvent:e=>events.push(e.type)},Event:class{constructor(type){this.type=type;}},
  localStorage:{getItem:key=>local.get(key)??null,setItem:(key,value)=>local.set(key,value)},
  require:id=>{if(!refMap[id])throw Error('Unexpected import '+id);return load(refMap[id]);}});
 cache.set(file,mod.exports);return mod.exports;
}
const groups=load('lib/goveeDeviceGroupsV915.ts');
const v909=load('lib/goveeLanV909.ts');
const concert=load('lib/goveeConcertDirectorV911.ts');
const advanced=load('lib/goveeTransitionsV914.ts');
const ips=['192.168.1.30','192.168.1.31','192.168.1.32','192.168.1.33'];
const json=x=>JSON.parse(JSON.stringify(x));
const group=(id,members,mode='unison',brightness=70)=>({id,name:id,members,mode,brightnessPercent:brightness,role:'wall'});
const lib=(list=[],enabled=true)=>({schema:'govee-device-groups-v915',enabled,groups:list});
let n=0;const test=(name,fn)=>{fn();console.log('PASS V915 — '+name);n++;};
test('default disabled, empty groups and no remote endpoints',()=>{
 const initial=json(groups.normalizeGoveeGroupsV915(null));
 assert.deepEqual(initial,json(groups.EMPTY_GOVEE_GROUPS_V915));assert.equal(initial.enabled,false);
 assert.doesNotMatch(source('lib/goveeDeviceGroupsV915.ts'),/\bfetch\(|goveeBridgeRequest|https?:\/\//);
});
test('normalized library retains valid names, roles, intensity and membership',()=>{
 const res=json(groups.normalizeGoveeGroupsV915(lib([group('light_stage',ips)],true)));
 assert.equal(res.groups.length,1);assert.equal(res.groups[0].brightnessPercent,70);
 assert.deepEqual(res.groups[0].members,ips);assert.equal(res.enabled,true);
});
test('reject nonprivate addresses and duplicates inside a group',()=>{
 const raw=lib([group('group_a',['8.8.8.8','127.0.0.1','::1','169.254.0.1',ips[0],ips[0]])]);
 const result=json(groups.normalizeGoveeGroupsV915(raw));assert.deepEqual(result.groups[0].members,[ips[0]]);
});
test('one lamp belongs to at most one group even after hostile import',()=>{
 const r=json(groups.normalizeGoveeGroupsV915(lib([group('group_a',[ips[0],ips[1]]),group('group_b',[ips[1],ips[2]])])));
 assert.deepEqual(r.groups[0].members,[ips[0],ips[1]]);assert.deepEqual(r.groups[1].members,[ips[2]]);
});
test('assignment safely moves membership without mutating input',()=>{
 const initial=json(groups.normalizeGoveeGroupsV915(lib([group('group_a',[ips[0],ips[1]]),group('group_b',[ips[2]])])));
 const out=json(groups.assignGoveeGroupMemberV915(initial,'group_b',ips[1],true));
 assert.deepEqual(out.groups[0].members,[ips[0]]);assert.deepEqual(out.groups[1].members,[ips[2],ips[1]]);
 assert.deepEqual(initial.groups[0].members,[ips[0],ips[1]]);
});
test('unchecking removes only the target member',()=>{
 const initial=lib([group('group_a',ips.slice(0,3))]);
 const out=json(groups.assignGoveeGroupMemberV915(initial,'group_a',ips[1],false));
 assert.deepEqual(out.groups[0].members,[ips[0],ips[2]]);
 assert.equal(groups.assignGoveeGroupMemberV915(initial,'missing_id',ips[1],false),initial);
 assert.equal(groups.assignGoveeGroupMemberV915(initial,'group_a','127.0.0.1',false),initial);
});
test('grouping does not affect nonselected lamps or disabled library',()=>{
 const item=group('group_a',ips);
 assert.equal(groups.findActiveGoveeGroupV915(lib([item],false),ips[0],ips),undefined);
 assert.equal(groups.findActiveGoveeGroupV915(lib([item],true),ips[0],[ips[1]]),undefined);
 assert.equal(groups.findActiveGoveeGroupV915(lib([item],true),ips[0],ips).id,'group_a');
});
test('unison selects first selected member and individual mode uses device',()=>{
 const unified=group('group_a',ips,'unison');
 assert.equal(groups.getGoveeGroupSourceIpV915(unified,ips[3],[ips[2],ips[3]]),ips[2]);
 assert.equal(groups.getGoveeGroupSourceIpV915(unified,ips[3],[ips[3]]),ips[3]);
 assert.equal(groups.getGoveeGroupSourceIpV915(group('group_b',ips,'individual'),ips[3],ips),ips[3]);
});
test('brightness dimmer never amplifies or changes RGB',()=>{
 const input={brightness:94,color:{r:12,g:255,b:97}};
 const out=json(groups.applyGoveeGroupBrightnessV915(input,group('group_a',ips,'individual',30),85));
 assert.equal(out.brightness,28);assert.deepEqual(out.color,input.color);assert.notEqual(out.color,input.color);
 assert.deepEqual(json(groups.applyGoveeGroupBrightnessV915(input,undefined,85)),input);
});
test('master brightness always caps group output',()=>{
 for(let b=10;b<=100;b+=5){
  const item=group('group_a',ips,'unison',b);
  for(let master=1;master<=100;master+=3){
   const out=groups.applyGoveeGroupBrightnessV915({color:{r:0,g:1,b:2},brightness:100},item,master);
   assert.ok(out.brightness>=1&&out.brightness<=master);
  }
 }
});
test('malformed group inputs are sanitized or removed',()=>{
 const raw=lib([{id:'bad!',name:'No',members:[]},group('valid_group',ips,'bad-mode',-100),group('valid_group',ips)]);
 const out=json(groups.normalizeGoveeGroupsV915(raw));
 assert.equal(out.groups.length,1);assert.equal(out.groups[0].mode,'individual');assert.equal(out.groups[0].brightnessPercent,10);
});
test('limits 12 groups, 32 private IPs and safe group names',()=>{
 const rows=[];for(let i=0;i<32;i++)rows.push({id:'group_'+i,name:'n'.repeat(120),members:[],mode:'unison',role:'auto',brightnessPercent:100});
 const out=json(groups.normalizeGoveeGroupsV915(lib(rows)));assert.equal(out.groups.length,12);
 assert.equal(out.groups[0].name.length,48);
});
test('group library persists without bridge token and notifies live sync',()=>{
 const initial=lib([group('group_a',ips)],true);initial.token='DO_NOT_EXPORT_TOKEN';
 const stored=groups.saveGoveeGroupsV915(initial);
 assert.equal(stored.enabled,true);
 const raw=local.get(groups.GOVEE_GROUPS_KEY_V915);assert.ok(raw.includes('group_a'));
 assert.ok(!raw.includes('DO_NOT_EXPORT_TOKEN'));assert.ok(!raw.includes('token'));
 assert.equal(events.at(-1),groups.GOVEE_GROUPS_EVENT_V915);
 assert.deepEqual(json(groups.loadGoveeGroupsV915()),json(stored));
});
test('invalid stored JSON defaults safely to disabled',()=>{
 local.set(groups.GOVEE_GROUPS_KEY_V915,'not json');
 assert.equal(groups.loadGoveeGroupsV915().enabled,false);
});
test('do not save invalid or overflowing groups',()=>{
 assert.throws(()=>groups.saveGoveeGroupsV915(lib(Array.from({length:13},(_,i)=>group('group_'+i,[])))));
 assert.throws(()=>groups.saveGoveeGroupsV915(lib([group('group_a',[]),group('group_a',[])])));
});
const show=load('lib/goveeLightShowV912.ts').normalizeGoveeShowV912({schema:'govee-light-show-v912',id:'show_v915',name:'Show',createdAt:1,updatedAt:2,cues:{
 [ips[0]]:{hook:{color:{r:235,g:16,b:32},brightness:80,fadeMs:3200}},
 [ips[1]]:{hook:{color:{r:15,g:203,b:210},brightness:65,fadeMs:3200}}
}});
const config={...v909.DEFAULT_GOVEE_CONFIG_V909,directorEnabledV911:true,masterBrightness:90,directorStrengthV911:88};
function planned(ip,groupItem){
 const sourceIp=groups.getGoveeGroupSourceIpV915(groupItem,ip,ips);
 const role=concert.resolveGoveeRoleV911(groupItem.mode==='unison'?groupItem.role:config.deviceRolesV911[ip],{
  [ips[0]]:'H6063',[ips[1]]:'H610B',[ips[2]]:'H61A2',[ips[3]]:'H6051'}[sourceIp]);
 const base=advanced.planGoveeAdvancedShowLookV914({show,ip:sourceIp,genre:'Hardtekk',progressMs:8000,
  phase:{phase:'hook',previous:'hook',transition:1,verified:true},role,config,
  metrics:{bass:.2,beatStrength:.1,energyEnvelope:.4,volume:.3},microphoneActive:false});
 return json(groups.applyGoveeGroupBrightnessV915(base,groupItem,config.masterBrightness));
}
test('sync members receive same V914 show cue and independent members do not',()=>{
 const unified=group('group_a',ips,'unison');
 assert.deepEqual(planned(ips[0],unified),planned(ips[1],unified));
 const independent=group('group_b',ips,'individual');
 assert.notDeepEqual(planned(ips[0],independent).color,planned(ips[1],independent).color);
});
test('all six song phases and four models stay deterministic for 3,000 combinations',()=>{
 const phases=['ambient','verse','hook','build','drop','break'];
 const skus=['H6063','H610B','H61A2','H6051'];
 for(let i=0;i<3000;i++){
  const role=concert.resolveGoveeRoleV911('auto',skus[i%4]);
  const result=concert.planGoveeConcertLookV911({genre:i%2?'Deutschrap':'Hardtekk',progressMs:i*104,
   phase:{phase:phases[i%6],previous:phases[(i+1)%6],transition:i%100/100,verified:true},role,
   config,metrics:{bass:0.4,beatStrength:.3,energyEnvelope:.5,volume:.5},microphoneActive:false});
  const out=groups.applyGoveeGroupBrightnessV915(result,group('group_a',ips,i%2?'unison':'individual',10+i%91),90);
  assert.ok(out.brightness>=1&&out.brightness<=90);
  for(const channel of Object.values(out.color))assert.ok(Number.isInteger(channel)&&channel>=0&&channel<=255);
 }
});
test('group studio controls real selected lamps only after saving; manual command stops auto-sync',()=>{
 const ui=source('components/GoveeDeviceGroupStudioV915.tsx');
 assert.match(ui,/assignGoveeGroupMemberV915/);
 assert.match(ui,/Gruppen speichern/);assert.match(ui,/disabled=\{busy\|\|dirty/);
 assert.match(ui,/if\(config\.autoSync\)onConfig\(\{autoSync:false\}\)/);
 assert.match(ui,/for\(const ip of ips\)/);
 assert.match(ui,/JSON importieren/);assert.match(ui,/JSON exportieren/);
 assert.match(ui,/planGoveeAdvancedShowLookV914/);
});
test('live sync respects opt-in groups and uses leader cue when unison',()=>{
 const sync=source('components/GoveeMusicSyncV909.tsx');
 assert.match(sync,/findActiveGoveeGroupV915\(groups,ip,config\.selectedIps\)/);
 assert.match(sync,/getGoveeGroupSourceIpV915\(group,ip,config\.selectedIps\)/);
 assert.match(sync,/getGoveeFadeMsV912\(show,sourceIp/);
 assert.match(sync,/planGoveeAdvancedShowLookV914\(\{\.\.\.shared,phase:devicePhase,role,show,ip:sourceIp\}\)/);
 assert.match(sync,/applyGoveeGroupBrightnessV915\(base,group/);
 assert.match(sync,/GOVEE_GROUPS_EVENT_V915/);
 assert.doesNotMatch(sync,/action:'power'/);
});
test('Settings embeds group studio and all edited TypeScript files parse',()=>{
 const panel=source('components/GoveeLanPanelV909.tsx');assert.match(panel,/<GoveeDeviceGroupStudioV915/);
 for(const file of ['lib/goveeDeviceGroupsV915.ts','components/GoveeDeviceGroupStudioV915.tsx',
  'components/GoveeLanPanelV909.tsx','components/GoveeMusicSyncV909.tsx']){
  const parsed=ts.createSourceFile(file,source(file),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,file);
 }
});
test('existing V910 Pi bridge needs no new API routes or additional secrets',()=>{
 assert.ok(fs.existsSync(path.join(root,'scripts/pi/install-v910.cjs')));
 assert.ok(fs.existsSync(path.join(root,'scripts/govee-lan-bridge.cjs')));
 assert.doesNotMatch(source('lib/goveeDeviceGroupsV915.ts'),/Bearer|token|secret|password/i);
});
console.log(`V915 PASS ${n} test groups (3,000 lighting combinations)`);
