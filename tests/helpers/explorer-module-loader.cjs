'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('../typescript-loader.cjs');
module.exports=function createLoader(extraGlobals={}){
 const cache=new Map(),root=path.resolve(__dirname,'../..');
 function load(file){
  const absolute=path.resolve(root,file);if(cache.has(absolute))return cache.get(absolute).exports;
  const module={exports:{}};cache.set(absolute,module);
  const result=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
  if(result.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error))throw Error('Syntax error in '+file);
  const resolve=(id)=>{
   if(id.startsWith('@/'))return load(id.slice(2)+(id.includes('/components/')?'.tsx':'.ts'));
   if(id.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(absolute),id))+'.ts');
   return require(id);
  };
  vm.runInNewContext(result.outputText,{module,exports:module.exports,require:resolve,Date,Map,Set,JSON,URL,Blob,encodeURIComponent,...extraGlobals},{filename:absolute});
  return module.exports;
 }
 return load;
};
