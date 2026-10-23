'use strict';
/** Minimal dependency-free TypeScript runtime loader for deterministic pure module tests.
 * transpileModule is NOT a substitute for 'npm run typecheck'.
 */
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('../typescript-loader.cjs');
const root=path.resolve(__dirname,'../..');
const loaded=new Map();
function load(relative) {
  const noExt=path.resolve(root,relative);
  const full=fs.existsSync(noExt)&&fs.statSync(noExt).isFile()?noExt:noExt+'.ts';
  if(!full.startsWith(root+path.sep)||!fs.existsSync(full))throw Error(`Missing source: ${relative}`);
  if(loaded.has(full))return loaded.get(full).exports;
  const result=ts.transpileModule(fs.readFileSync(full,'utf8'),{
    fileName:full,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
  });
  const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length)throw Error(`Cannot transpile ${relative}: ${errors.map(d=>d.messageText).join('; ')}`);
  const mod=new Module(full,module);mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));
  loaded.set(full,mod);
  const nativeRequire=mod.require.bind(mod);
  mod.require=(id)=>id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?
    load(path.relative(root,path.resolve(path.dirname(full),id))):nativeRequire(id);
  mod._compile(result.outputText,full);
  return mod.exports;
}
module.exports={load};
