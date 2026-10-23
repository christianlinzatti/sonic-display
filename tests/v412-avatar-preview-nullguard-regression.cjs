'use strict';
// Regression: a nullable external GLTF motion must be guarded on both accesses.
// Test the real memo callback using strict TypeScript type checking, independently
// of React/Three declarations, so this catches TS18047 even in offline CI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '..', 'components/visualizer/RapRealAvatarPreviewV409.tsx'), 'utf8');
const start = source.indexOf('  const clip=useMemo(()=>{');
const end = source.indexOf('\n  useEffect(()=>{', start);
assert(start !== -1 && end > start, 'locate the original clip selection');
const callback = source.slice(start, end);
assert(callback.includes('external?.clips[0]'), 'nullable clip collection must use optional chaining');
const fixture = `
  export {};
  declare function useMemo<T>(callback:()=>T,deps:unknown[]):T;
  type Clip = {name:string;duration:number};
  type Motion = {kind:'installed'|'embedded'; url?:string;index?:number}|null;
  declare const timeline:readonly unknown[]|undefined;
  declare const motion:Motion;
  declare const animations:Clip[];
  declare const external:{url:string;clips:Clip[]}|null;
  ${callback}
  const selected:Clip|null = clip;
`;
const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-v412-nullguard-'));
try {
  const file = path.join(folder, 'strict-nullguard.ts');
  fs.writeFileSync(file, fixture);
  const program = ts.createProgram([file], {
    strict:true, noEmit:true, skipLibCheck:true,
    target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS,
    types:[],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const errors = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText,'\n')), [], 'strict TS checks of actual clip selection');
  // A negative-control compile must reproduce the original TS18047 failure.
  const unsafeFixture = fixture.replace('external?.clips[0]', 'external.clips[0]');
  assert.notEqual(unsafeFixture, fixture, 'the regression probe must mutate the actual access');
  fs.writeFileSync(file, unsafeFixture);
  const unsafeProgram = ts.createProgram([file], {
    strict:true, noEmit:true, skipLibCheck:true,
    target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS,
    types:[],
  });
  assert(ts.getPreEmitDiagnostics(unsafeProgram).some(d => d.code === 18047), 'unfixed code must reproduce TS18047');
  console.log('PASS V412 nullguard: strict TS check of actual clip selection; original TS18047 reproduced');
} finally {
  fs.rmSync(folder,{recursive:true,force:true});
}
