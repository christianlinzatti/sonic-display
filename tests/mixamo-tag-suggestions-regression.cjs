'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {suggestMixamoMotionTags,applyMixamoTagSuggestions}=load('components/visualizer/mixamoTagSuggestions');
const {libraryMotionEligibleV536}=load('components/visualizer/genreAwareMotionDirectorV536');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

const expect=[
 ['Mixamo Rap Groove', 'deutschrap','rap'],
 ['Mixamo Hip-Hop Bounce','deutschrap','rap'],
 ['Mixamo Hakken Footwork','hardtekk','energetic'],
 ['Mixamo Jumpstyle Stomp','hardstyle','energetic'],
 ['Rawstyle-mixamo.glb','hardstyle','energetic'],
 ['Breakdance-Mixamo','deutschrap','rap'],
];
for(const [name,genre,category] of expect){
 const suggestion=suggestMixamoMotionTags(name);
 assert.equal(suggestion?.genre,genre,name);
 assert.equal(suggestion?.category,category,name);
}
for(const name of [
 'Random rap dance','Groove-mixamo.glb','Mixamo Shuffle','Mixamo Stomp',
 'Mixamo Rap Jumpstyle','Mixamo Hakken Hardstyle','Mixamo Footwork Swagger',
 'Mixamo', '', 'rapid-mixamo.glb',
]) assert.equal(suggestMixamoMotionTags(name),null,'ambiguous or weak name: '+name);

const record=(id,name,opts={})=>({
 id,avatarId:'avatar-one',name,url:'/animations/'+id+'.glb',genre:'',
 bpmMin:0,bpmMax:300,section:'any',addedAt:1,category:'other',...opts,
});
const source=[
 record('rap','Mixamo Rap Groove',{category:'dance',bpmMin:77,bpmMax:145,section:'hook'}),
 record('tekk','Mixamo Hakken Footwork'),
 record('style','Mixamo Jumpstyle',{genre:'rock',category:'gesture'}),
 record('ambiguous','Mixamo Hakken Hardstyle'),
 record('other-avatar','Mixamo Rap',{avatarId:'avatar-two'}),
 record('normal','Ordinary Rap'),
];
const untouched=JSON.parse(JSON.stringify(source));
const result=applyMixamoTagSuggestions(source,'avatar-one');
assert.equal(result.changed,2);
assert.equal(result.motions[0].genre,'deutschrap');
assert.equal(result.motions[0].category,'dance','manual category stays');
assert.equal(result.motions[0].bpmMin,77,'BPM is never inferred');
assert.equal(result.motions[0].bpmMax,145,'BPM max stays');
assert.equal(result.motions[0].section,'hook','manual song section stays');
assert.equal(result.motions[1].genre,'hardtekk');
assert.equal(result.motions[1].category,'energetic','default inferred category may improve');
assert.equal(result.motions[2].genre,'rock','manual genre never overwritten');
assert.equal(result.motions[3].genre,'','ambiguous remains untagged');
assert.equal(result.motions[4].genre,'','other avatar remains untouched');
assert.equal(result.motions[5].genre,'','ordinary motions remain unchanged');
assert.deepEqual(source,untouched,'input array and objects are never mutated');
assert.equal(applyMixamoTagSuggestions(result.motions,'avatar-one').changed,0,'idempotent');

const libraryCandidate=(record,source='library')=>({
 name:record.id,label:record.name,duration:2,trackCount:24,
 source,category:record.category,taggedGenre:record.genre,
 bpmMin:record.bpmMin,bpmMax:record.bpmMax,assignedSection:record.section
});
assert.equal(libraryMotionEligibleV536(libraryCandidate(result.motions[0]),
 {bpm:110,genre:'deutschrap',section:'hook'}),true);
assert.equal(libraryMotionEligibleV536(libraryCandidate(result.motions[0]),
 {bpm:160,genre:'deutschrap',section:'hook'}),false);
assert.equal(libraryMotionEligibleV536(libraryCandidate(result.motions[0]),
 {bpm:110,genre:'hardtekk',section:'hook'}),false);
assert.equal(libraryMotionEligibleV536(libraryCandidate(result.motions[1]),
 {bpm:160,genre:'hardtekk',section:'drop'}),true);
assert.equal(libraryMotionEligibleV536(libraryCandidate(result.motions[1]),
 {bpm:160,genre:'hardstyle',section:'drop'}),false);

const ui=read('components/CharacterMotionLibraryPanel.tsx');
assert.match(ui,/applyMixamoTagSuggestions\(latest\.motions,avatar\)/);
assert.match(ui,/saveCharacterMotionStore\(\{\.\.\.latest,motions:updated\.motions\}\)/);
assert.match(ui,/Mixamo-Genre-Vorschläge übernehmen/);
assert.match(ui,/mixamoSuggestions\.length===0/);
assert.match(ui,/Genre-Zuordnung/);
console.log('PASS Mixamo opt-in automatic genre suggestions, conservative matching and manual metadata preservation');
