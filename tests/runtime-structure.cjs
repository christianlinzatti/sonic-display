'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const manifest=require('../package.json');
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','.next','.git'].includes(e.name))continue;const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(/\.(tsx?|jsx?)$/.test(e.name)&&!e.name.endsWith('.d.ts'))files.push(f);}}
walk(root);
let checks=0;const errors=[];
function check(condition,description){checks++;if(!condition)errors.push(description);}
check(fs.existsSync(path.join(root,'app/page.tsx')),'app/page.tsx missing');
check(fs.existsSync(path.join(root,'app/layout.tsx')),'app/layout.tsx missing');
check(Boolean(manifest.scripts?.dev&&manifest.scripts?.build&&manifest.scripts?.typecheck),'Core npm scripts missing');
for(const f of files){
 const s=fs.readFileSync(f,'utf8');const rel=path.relative(root,f);
 if(/^\s*['"]use client['"];?/m.test(s)) {
   const first=s.replace(/^\uFEFF/,'').replace(/^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/,'').trimStart();
   check(/^['"]use client['"]\s*;?/.test(first),`Client directive not first statement: ${rel}`);
 }
 // Check only statically resolvable relative imports. Extensionless imports may use index files.
 const rx=/(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\()\s*['"](\.{1,2}\/[^'"]+)['"]/g;
 for(const m of s.matchAll(rx)){
   const target=path.resolve(path.dirname(f),m[1]);
   check(['','.ts','.tsx','.js','.jsx','.json','.mjs','.cjs','/index.ts','/index.tsx','/index.js'].some(e=>fs.existsSync(target+e)),`Unresolved relative import ${m[1]} in ${rel}`);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS runtime-structure: ${checks} checks across ${files.length} source files`);
