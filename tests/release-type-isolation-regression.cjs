'use strict';
/** Run on every release, even before TypeScript executes. Test-only ambient declarations
 * must not shadow project-wide real types when the root TypeScript configuration includes all source files.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const tsconfig=JSON.parse(fs.readFileSync(path.join(root,'tsconfig.json'),'utf8'));
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.equal(tsconfig.compilerOptions.strict,true,'Production TypeScript strict mode required');
assert.equal(tsconfig.compilerOptions.forceConsistentCasingInFileNames,true,'Enforce consistent casing');
const excluded=new Set(tsconfig.exclude||[]);
const ambientModules=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
 const full=path.join(dir,ent.name);
 if(ent.isDirectory())walk(full);
 else if(ent.isFile()&&ent.name.endsWith('.d.ts')){
  const content=fs.readFileSync(full,'utf8');
  for(const [,moduleName] of content.matchAll(/declare\s+module\s+["'](@\/[^"']+)["']/g)){
   const rel=path.relative(root,full).split(path.sep).join('/');
   const target=path.join(root,moduleName.slice(2));
   // Only guard declarations that shadow an actual production module.
   if(!['.ts','.tsx','.d.ts'].some(ext=>fs.existsSync(target+ext)))continue;
   ambientModules.push(rel);
   assert(excluded.has(rel)||[...excluded].some(rule=>rule.endsWith('/**/*')&&rel.startsWith(rule.slice(0,-4))),
    `Test ambient declaration shadows ${moduleName} in production: ${rel}. Exclude it from root tsconfig.`);
  }
 }
}}
walk(path.join(root,'tests'));
assert(ambientModules.length>0,'Missing test shadowing fixtures (guard must not be a no-op)');
assert(pkg.scripts['check:release']?.includes('npm run typecheck'),'Release gate requires full application typecheck');
assert(pkg.scripts.prebuild?.includes('npm run check:release'),'Production build must run release gate automatically');
assert(pkg.scripts['check:release']?.includes('test:module-case'),'Release gate must include case collision protection');
console.log(`PASS release type isolation: ${ambientModules.length} test-only ambient type declarations excluded; build gate active`);
