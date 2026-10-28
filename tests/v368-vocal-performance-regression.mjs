import './helpers/threeAvatarSourcesV492.cjs';
import { install as installThreeAvatarCompatV492 } from './helpers/threeAvatarSourcesV492.cjs';
installThreeAvatarCompatV492();
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolveVocalPerformanceV368 as cue} from '../components/visualizer/vocalPerformanceV368.ts';
const lyrics={synced:true,provider:'spotify',plainText:null,lines:[
  {startMs:1000,endMs:3200,text:'Bam booom und Meer',words:[
    {text:'Bam',startMs:1000,endMs:1290},
    {text:'booom',startMs:1370,endMs:1850},
    {text:'und',startMs:1900,endMs:2150},
    {text:'Meer',startMs:2300,endMs:3130}]},
  {startMs:3600,endMs:4700,text:'♪'},
  {startMs:5000,endMs:8500,text:'So lange halte ich den Ton'},
  {startMs:9000,endMs:10000,text:'[Instrumental]'},
]};
const v=(ms,opts={},playing=true)=>cue(lyrics,ms,playing,{genre:'Deutschrap',...opts});
assert.equal(v(200).jaw,0,'before first word is silent');
assert.equal(v(1050).confidence,'word');
assert.ok(v(1050).lipsClosed>0,'labial consonant closes lips at word onset');
assert.equal(v(1350).jaw,0,'gaps between words must be silent');
assert.equal(v(1350).activeWord,null);
assert.ok(v(1610).round>v(1610).wide,'round vowel targets differ from open/bright');
assert.equal(v(2150).jaw,0,'word end');
assert.equal(v(3350).jaw,0,'between lines');
assert.equal(v(4000).jaw,0,'music note is non-vocal');
assert.equal(v(5200).confidence,'line','only timed lines are approximated');
assert.ok(v(5200).jaw>0);
assert.equal(v(9400).jaw,0,'instrumental is silent');
assert.equal(v(10300).jaw,0);
assert.equal(v(1550).style,'rap','fast lyrics/genre infer rap');
assert.equal(v(1550,{style:'singing'}).style,'singing','override inferred rap');
assert.equal(v(1550,{style:'rap',expression:0}).brow,0,'expression slider honored');
assert.equal(v(1550,{style:'rap',expression:0}).smile,0);
assert.equal(v(1550,{},false).jaw,0,'paused playback silent');
assert.equal(cue({...lyrics,synced:false},1550,true).jaw,0,'unsynced text never invents timing');
assert.ok(v(1600,{mode:'hybrid',mids:1}).jaw>=v(1600,{mode:'hybrid',mids:0}).jaw);
assert.deepEqual(v(1600),v(1600),'cue deterministic for multiple avatars');
assert.ok(Number.isFinite(v(1600,{mids:Infinity}).jaw),'invalid audio values clamped');
assert.equal(v(1520,{style:'singing',expression:60}).confidence,'word');
for (const name of ['components/visualizer/VocalRigV368.tsx','components/visualizer/ThreeAvatar.tsx','components/KineticLyrics.tsx','components/SettingsPanel.tsx','components/visualizer/VisualizerStage.tsx'])assert.ok(readFileSync(name,'utf8').length>100,name);
const stage=readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const dancers=readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
const rig=readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
assert.match(stage,/style:rapPerformanceCueV437\.active.*avatarVocalStyleV368/);
assert.match(dancers,/VocalRigV368 model=\{model\}/);
assert.match(rig,/resolveVocalPerformanceQualityV374/);
assert.match(readFileSync('components/visualizer/vocalPerformanceDirectorV372.ts','utf8'),/resolveVocalPerformanceV368/);
for (const target of ['lipsClosed','smile','brow','blink'])assert.ok(rig.includes(target),'extra face channel '+target);
assert.match(rig,/inf\[morph.index\]-morph.delta/,'source morph preserved');
assert.match(rig,/useEffect\(\(\)=>\(\)=>\{/,'cleanup on unmount');
assert.match(readFileSync('components/KineticLyrics.tsx','utf8'),/lyrics-v368-progress/);
console.log('PASS V368 performance engine, rest states, multi-avatar integration and karaoke');
