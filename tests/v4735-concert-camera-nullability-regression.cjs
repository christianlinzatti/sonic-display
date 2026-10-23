// V473.5: The camera prop rejects null even if individual cue planners can return null.
// Test the actual initializer using the TypeScript strict typechecker without
// requiring the Next/React dependency tree to be installed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('./typescript-loader.cjs');
const root = path.resolve(__dirname, '..');
const sourceFile = path.join(root, 'components/visualizer/VisualizerStage.tsx');
const source = ts.createSourceFile(sourceFile, fs.readFileSync(sourceFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const assignments=[];
const visit=(node)=>{
  if (ts.isPropertyAssignment(node) && node.name.getText(source)==='concertCameraCueV454')
    assignments.push(node.initializer.getText(source));
  ts.forEachChild(node, visit);
};
visit(source);
assert.equal(assignments.length,1, 'Expected one concertCameraCueV454 prop');
const initializer=assignments[0];
// Explicitly refuse a non-null assertion, `as any` or a cast hiding a real mismatch.
assert(!/\bas\s+(?:any|unknown)\b|!\s*$/.test(initializer), 'Do not suppress cue nullability checks');
const virtualPath=path.join(root,'tests','__v4735_camera_type_contract__.ts');
const code=`
  type SmartShowCueV446 = { id:string };
  declare const featureDirectionV460: {cameraCue:SmartShowCueV446|null};
  declare const ultimateShowV456: {active:boolean;cameraCue:SmartShowCueV446|null};
  declare const smartShowCueV446:SmartShowCueV446|null;
  const input:SmartShowCueV446|undefined=${initializer};
  void input;
`;
const opts={strict:true,noEmit:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,types:[]};
const host=ts.createCompilerHost(opts);
const originalGet=host.getSourceFile.bind(host);
const originalExists=host.fileExists.bind(host);
host.fileExists=(name)=>path.normalize(name)===path.normalize(virtualPath)||originalExists(name);
host.getSourceFile=(name,languageVersion,onError,shouldCreateNewSourceFile)=>
  path.normalize(name)===path.normalize(virtualPath)
    ?ts.createSourceFile(name,code,languageVersion,true)
    :originalGet(name,languageVersion,onError,shouldCreateNewSourceFile);
const program=ts.createProgram([virtualPath],opts,host);
const errors=ts.getPreEmitDiagnostics(program);
assert.deepEqual(errors,[],errors.map(e=>ts.flattenDiagnosticMessageText(e.messageText,'\n')).join('\n'));
console.log('PASS V473.5: live concert camera prop accepts nullable planners via undefined normalization (strict TypeScript)');
