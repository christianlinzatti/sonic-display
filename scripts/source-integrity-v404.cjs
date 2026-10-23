'use strict';
/** Check Windows/macOS/Linux portable module paths before Webpack or TypeScript compile.
 * Checks both physical module-name collisions and *import spelling* (including directory casing).
 * Can be imported by self-tests without running the command-line scanner.
 */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('../tests/typescript-loader.cjs');
const SOURCE_EXTS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];
const ASSET_EXTS = ['.json', '.css', '.svg', '.glb', '.gltf', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2'];
const EXTENSIONS = [...SOURCE_EXTS, ...ASSET_EXTS];
const IGNORED = new Set(['node_modules', '.next', '.git', '.vercel', 'dist', 'build', 'out', 'coverage']);
function collectFiles(root) {
  const found=[];
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      if(entry.isSymbolicLink())continue;
      const full=path.join(dir,entry.name);
      if(entry.isDirectory()&&!IGNORED.has(entry.name))walk(full);
      else if(entry.isFile()&&SOURCE_EXTS.includes(path.extname(entry.name)))found.push(full);
    }
  }
  walk(root);return found;
}
function exactFile(root,candidate) {
  const relative=path.relative(root,candidate);
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))return false;
  let current=root;
  for(const segment of relative.split(path.sep)) {
    if(!segment || segment==='.')continue;
    if(!fs.existsSync(current)||!fs.statSync(current).isDirectory())return false;
    if(!fs.readdirSync(current).includes(segment))return false;
    current=path.join(current,segment);
  }
  return fs.existsSync(current)&&fs.statSync(current).isFile();
}
function insensitiveFile(root,candidate) {
  const relative=path.relative(root,candidate);
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))return false;
  let current=root;
  for(const segment of relative.split(path.sep)) {
    if(!segment || segment==='.')continue;
    if(!fs.existsSync(current)||!fs.statSync(current).isDirectory())return false;
    const entry=fs.readdirSync(current).find(name=>name.toLowerCase()===segment.toLowerCase());
    if(!entry)return false;
    current=path.join(current,entry);
  }
  return fs.existsSync(current)&&fs.statSync(current).isFile();
}
function resolveLocal(root,requester,spec) {
  const base=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(requester),spec);
  const ext=path.extname(base);
  const candidates=EXTENSIONS.includes(ext) ? [base] : [base,...EXTENSIONS.map(e=>base+e),...EXTENSIONS.map(e=>path.join(base,'index'+e))];
  if(ext==='.js'||ext==='.jsx'||ext==='.mjs'||ext==='.cjs'){
    // TS permits emitted .js import specifiers that resolve to .ts / .tsx in source.
    for(const sourceExt of SOURCE_EXTS)candidates.push(base.slice(0,-ext.length)+sourceExt);
  }
  if(candidates.some(file=>exactFile(root,file)))return null;
  // Distinguish a misspelt case from a genuinely missing file.
  const caseOnly=candidates.find(file=>insensitiveFile(root,file));
  return caseOnly?'case-mismatch':'unresolved';
}
function specifiers(file) {
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,
    file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const items=[];
  function add(v){if(v&&(v.startsWith('@/')||v.startsWith('./')||v.startsWith('../')))items.push(v);}
  function visit(node){
    if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))add(node.moduleSpecifier.text);
    if(ts.isCallExpression(node)&&node.arguments.length&&ts.isStringLiteral(node.arguments[0])&&
       (node.expression.kind===ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression)&&node.expression.text==='require')))add(node.arguments[0].text);
    ts.forEachChild(node,visit);
  }
  visit(source);return items;
}
function checkSourceIntegrity(root,options={}) {
  root=path.resolve(root);
  const files=collectFiles(root),problems=[],moduleNames=new Map();let imports=0;
  for(const file of files) {
    const rel=path.relative(root,file).split(path.sep).join('/');
    // TS/TSX and casing-only differences collide on some operating systems.
    const key=rel.replace(/\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/i,'').toLowerCase();
    if(moduleNames.has(key))problems.push({kind:'module-collision',file:rel,detail:moduleNames.get(key)});
    else moduleNames.set(key,rel);
    if(options.onlyModules)continue;
    for(const spec of specifiers(file)) {
      imports++;
      const issue=resolveLocal(root,file,spec);
      if(issue)problems.push({kind:issue,file:rel,detail:spec});
    }
  }
  return {files:files.length,imports,problems};
}
if(require.main===module) {
  const root=path.resolve(__dirname,'..');
  const result=checkSourceIntegrity(root);
  for(const item of result.problems.slice(0,70))console.error(`FAIL ${item.kind}: ${item.file} -> ${item.detail}`);
  if(result.problems.length>70)console.error(`... and ${result.problems.length-70} further issues`);
  if(result.problems.length)process.exitCode=1;
  else console.log(`PASS V404 source integrity: ${result.files} source files, ${result.imports} local imports; no case mismatches, missing imports or ambiguous modules`);
}
module.exports={checkSourceIntegrity,resolveLocal,exactFile};
