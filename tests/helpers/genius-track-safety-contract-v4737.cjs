// Inspect the real track-scoped Genius data access independently of JSX spelling.
'use strict';
const assert=require('node:assert/strict');
const ts=require('../typescript-loader.cjs');
const path=require('node:path');
function assertGeniusTrackSafetyContract(text) {
 const source=ts.createSourceFile('GeniusSongInsightsV447.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const matches=[];
 const visit=node=>{if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='data')matches.push(node.initializer?.getText(source));ts.forEachChild(node,visit);};visit(source);
 assert.equal(matches.length,1,'Expected exactly one Genius data initializer');
 const expression=matches[0];
 assert(expression?.includes('result') && expression.includes('track.id') && expression.includes('result.data'), 'Genius data must be bound to current track');
 assert(/result\s*(?:!==?\s*null|\?\.id)/.test(expression), 'Genius response must be null guarded');
 assert(!/\bas\s+(?:any|unknown)\b/.test(expression),'Do not hide nullability behind unsafe casts');
 const opts={strict:true,noEmit:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,types:[]};
 const virtual=path.resolve(__dirname,'../__v4737_genius_type_contract__.ts');
 const code=`type Insight={songTitle:string};declare const result:{id:string;data:Insight|null}|null;declare const track:{id:string};const data:Insight|null=${expression};void data;`;
 const host=ts.createCompilerHost(opts);const originalSource=host.getSourceFile.bind(host);const originalExists=host.fileExists.bind(host);
 host.fileExists=name=>path.normalize(name)===path.normalize(virtual)||originalExists(name);
 host.getSourceFile=(name,version,onError,makeNew)=>path.normalize(name)===path.normalize(virtual)?ts.createSourceFile(name,code,version,true):originalSource(name,version,onError,makeNew);
 const issues=ts.getPreEmitDiagnostics(ts.createProgram([virtual],opts,host));
 assert.deepEqual(issues,[],issues.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n'));
 return expression;
}
module.exports={assertGeniusTrackSafetyContract};
