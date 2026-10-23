'use strict';
/** Offline-safe V403 production readiness check. Never prints .env contents or auth tokens. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ts=require('../tests/typescript-loader.cjs');
const packageJson=require('../package.json');
const strict=process.argv.includes('--strict');
const extensions=['','.ts','.tsx','.mts','.cts','.js','.jsx','.mjs','.cjs','.json','.css','.svg','.glb','.png','.jpg','.jpeg','.webp','.woff','.woff2'];
const seen=new Set();let files=0,imports=0;const missing=[];
function exists(modulePath){
 for(const ext of extensions)if(fs.existsSync(modulePath+ext)&&fs.statSync(modulePath+ext).isFile())return true;
 for(const ext of extensions.slice(1))if(fs.existsSync(path.join(modulePath,'index'+ext)))return true;
 return false;
}
function scan(file){
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 function localImport(spec){
   if(!spec.startsWith('@/')&&!spec.startsWith('./')&&!spec.startsWith('../'))return;
   imports++;
   const target=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(file),spec);
   if(!exists(target))missing.push(`${path.relative(root,file)} -> ${spec}`);
 }
 function visit(node){
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))localImport(node.moduleSpecifier.text);
  if(ts.isCallExpression(node)&&node.arguments.length&&ts.isStringLiteral(node.arguments[0])&&
     (node.expression.kind===ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression)&&node.expression.text==='require')))
      localImport(node.arguments[0].text);
  ts.forEachChild(node,visit);
 }
 visit(source);
}
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   if(['node_modules','.next','.git'].includes(entry.name))continue;
   const absolute=path.join(dir,entry.name);
   if(entry.isDirectory())walk(absolute);
   else if(/\.tsx?$/.test(entry.name)&&!entry.name.endsWith('.d.ts')){files++;scan(absolute);}
 }
}
walk(root);
const required=['package.json','tsconfig.json'];
const hasNextConfig=['next.config.ts','next.config.mjs','next.config.js'].some(p=>fs.existsSync(path.join(root,p)));
const missingRequired=required.filter(p=>!fs.existsSync(path.join(root,p)));
if(!hasNextConfig)missingRequired.push('next.config.[ts|mjs|js]');
const manifests=Object.keys({...packageJson.dependencies,...packageJson.devDependencies});
const missingDeps=manifests.filter(p=>{try{require.resolve(p+'/package.json',{paths:[root]});return false;}catch{return true;}});
const lock=fs.existsSync(path.join(root,'package-lock.json'));
const results={version:403,sourceFiles:files,localImports:imports,unresolvedImports:missing.length,
  requiredFilesMissing:missingRequired,dependenciesAvailable:manifests.length-missingDeps.length,
  dependenciesTotal:manifests.length,lockfilePresent:lock};
console.log('V403 Production Doctor — offline static inspection');
console.log(JSON.stringify(results,null,2));
if(missing.length)console.error('UNRESOLVED source imports:\n'+missing.slice(0,30).join('\n')+(missing.length>30?`\n... (${missing.length-30} more)`:''));
if(missingRequired.length)console.error('Required project files are missing: '+missingRequired.join(', '));
if(!lock)console.warn('NOTE: package-lock.json not included. Run npm install to create a local lockfile.');
if(missingDeps.length)console.warn(`BLOCKED: ${missingDeps.length} npm packages absent. Install npm dependencies before running npm run verify.`);
if(missing.length||missingRequired.length||!packageJson.scripts.build||!packageJson.scripts.typecheck)process.exitCode=1;
else if(strict&&(!lock||missingDeps.length))process.exitCode=2;
else console.log('PASS static production checks (not a Next.js build or browser runtime test).');
