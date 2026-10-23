// Syntax checks alone do not detect duplicate named imports: SWC/Webpack does.
// Check both so a repeated import fails before Next.js performs its production build.
const fs=require('node:fs'); const path=require('node:path');
const ts=require('./typescript-loader.cjs');
let count=0, errors=[];
function walk(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if(['node_modules','.next','.git'].includes(entry.name))continue;
    const f=path.join(dir,entry.name);
    if(entry.isDirectory()) { walk(f); continue; }
    if(!/\.tsx?$/.test(f)||f.endsWith('.d.ts'))continue;
    count++;
    const source=ts.createSourceFile(f,fs.readFileSync(f,'utf8'),ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    for(const d of source.parseDiagnostics) errors.push(`${f}:${source.getLineAndCharacterOfPosition(d.start||0).line+1} ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
    // SWC/Next.js requires the directive prologue before every import/declaration.
    // TypeScript's parser by itself accepts a misplaced directive, so reject it here.
    source.statements.forEach((statement, index) => {
      if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) return;
      if (!['use client', 'use server'].includes(statement.expression.text)) return;
      if (index !== 0) {
        const line = source.getLineAndCharacterOfPosition(statement.getStart(source)).line + 1;
        errors.push(`${f}:${line} "${statement.expression.text}" directive must appear before all imports and other statements`);
      }
    });
    const imported=new Map();
    for(const statement of source.statements) {
      if(!ts.isImportDeclaration(statement)||!statement.importClause)continue;
      const clause=statement.importClause;
      const names=[];
      if(clause.name)names.push(clause.name);
      if(clause.namedBindings) {
        if(ts.isNamespaceImport(clause.namedBindings))names.push(clause.namedBindings.name);
        else for(const spec of clause.namedBindings.elements)names.push(spec.name);
      }
      for(const name of names) {
        const line=source.getLineAndCharacterOfPosition(name.getStart(source)).line+1;
        const previous=imported.get(name.text);
        if(previous!==undefined)errors.push(`${f}:${line} duplicate imported identifier '${name.text}' (first at line ${previous})`);
        else imported.set(name.text,line);
      }
    }
  }
}
walk(path.resolve(process.env.SONIC_SOURCE_SCAN_ROOT || path.resolve(__dirname,'..')));
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS syntax/import bindings: ${count} TS/TSX source files`);
