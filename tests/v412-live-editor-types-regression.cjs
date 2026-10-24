require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const base=load('components/visualizer/rapPerformanceEditorV408');
const file=fs.readFileSync(path.resolve(__dirname,'../components/visualizer/ThreeAvatar.tsx'),'utf8');
assert(file.includes('import { normalizeRapEditorV408 } from "./rapPerformanceEditorV408";'),'explicit normalization import');
assert(file.includes('const rapLiveEditorV412=normalizeRapEditorV408(groovePreferences.rapPerformanceEditorV408);'),'normalize optional source before composing typed context');
assert(file.includes('editorV408:rapLiveEnabledV412?{...rapLiveEditorV412,enabled:true,'),'V412 live editor spreads complete settings');
assert(file.includes('rapLiveEditorV412.enabled?rapLiveEditorV412.head:100'),'disabled V408 head defaults to unity');
assert(file.includes('rapLiveEditorV412.enabled?rapLiveEditorV412.gestures:100'),'disabled V408 gestures default to unity');
for(const input of [undefined,null,{enabled:false},{enabled:true,head:140},{enabled:true,verse:undefined,hook:undefined}]){
  const editor=base.normalizeRapEditorV408(input);
  const live={...editor,enabled:true,head:(editor.enabled?editor.head:100)*.75,gestures:(editor.enabled?editor.gestures:100)*.75};
  for(const key of ['head','gestures','verse','hook','kick','snare','lipSync'])assert(Number.isFinite(live[key]),`${key} must always be a number`);
  assert.equal(live.enabled,true);
}
console.log('PASS V412 editor type fix: complete normalized V408 settings with safe live Verse/Hook gains');
