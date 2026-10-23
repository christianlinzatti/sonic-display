const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
const cache={};function load(name){if(cache[name])return cache[name].exports;const filename=`components/visualizer/${name}.ts`;const js=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const module={exports:{}};cache[name]=module;vm.runInNewContext(js,{module,exports:module.exports,require:(path)=>load(path.replace('./','')),window:undefined,Event:class{}});return module.exports;}
const p=load('motionLayerPresets');const d=load('motionDebugControls');
assert.equal(p.genreForTrack('German rap'), 'deutschrap');assert.equal(p.genreForTrack('Hardtekk'), 'hardtekk');assert.equal(p.genreForTrack('Trap'), 'trap');
assert.equal(p.choosePreset(p.BUILTIN_MOTION_PRESETS,'Hardstyle').id,'built-in-hardstyle');
assert.equal(p.choosePreset(p.BUILTIN_MOTION_PRESETS,'Classical'),null);
const preset=p.normalizePreset({id:'custom-1',name:'Test',genre:'deutschrap',weights:{head:2,torso:1,arms:1,legs:1,expression:1,physics:1}});assert.equal(preset.weights.head,1.5);
assert.equal(p.normalizePreset({id:'bad',name:'Test',genre:'any',weights:{}}),null);
const imported=p.parsePresetImport(JSON.stringify([{...preset}]));assert.equal(imported.length,1);
d.configureMotionAutoPresets(p.BUILTIN_MOTION_PRESETS,true);d.applyMotionPresetForGenre('Hardtekk');for(let i=0;i<30;i++)d.updateMotionPresetMorph(.1);assert.equal(d.getRuntimeMotionSettings().weights.legs,1.4);
d.configureMotionAutoPresets(p.BUILTIN_MOTION_PRESETS,false);d.applyMotionPresetForGenre('Deutschrap');assert.equal(d.getRuntimeMotionSettings().weights.legs,1.4);
console.log('PASS V119 preset validation, import, genre matching, auto-application and opt-out');
