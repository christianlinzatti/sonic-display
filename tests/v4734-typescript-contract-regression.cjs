// Ensure production tsc never pulls the ambient one-off V414 test module into
// the application. That module masks the real '@/types/music' exports and
// cascades into dozens of misleading TS2305/TS7006 diagnostics.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('./typescript-loader.cjs');
const root = path.resolve(__dirname, '..');
const projectFile = path.join(root, 'tsconfig.json');
const config = ts.readConfigFile(projectFile, ts.sys.readFile);
assert.equal(config.error, undefined, ts.flattenDiagnosticMessageText(config.error?.messageText ?? '', '\n'));
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
assert.deepEqual(options.errors, [], options.errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
const productionFiles = new Set(options.fileNames.map(name => path.normalize(name)));
assert(!productionFiles.has(path.join(root, 'tests', 'v414-music-types.d.ts')),
  'The ambient V414 test stub must not be a root file in production TypeScript!');
assert(productionFiles.has(path.join(root,'types','music.ts')),'Production types/music.ts must be included');
const music = path.join(root,'types','music.ts');
for(const importer of ['components/ArtistDiscoveryV360.tsx','components/visualizer/registry.tsx','hooks/usePlaybackPolling.ts']) {
  const result = ts.resolveModuleName('@/types/music',path.join(root,importer),options.options,ts.sys);
  assert.equal(path.normalize(result.resolvedModule?.resolvedFileName ?? ''), music,
    `Wrong resolved music types for ${importer}`);
}
const musicAst = ts.createSourceFile(music,fs.readFileSync(music,'utf8'),ts.ScriptTarget.Latest,true);
const musicTypes = new Set(musicAst.statements.filter(ts.isInterfaceDeclaration).map(n=>n.name.text));
for(const symbol of ['Track','UiPreferences','Lyrics','MusicState','MusicContextValue','MusicSource','CurrentTrackResponse'])
  assert(musicTypes.has(symbol),`Expected exported application type ${symbol}`);
const camera = fs.readFileSync(path.join(root,'components/visualizer/StageCameraDirectorV289.tsx'),'utf8');
for(const name of ['newRapCameraHoldV429','planRapCameraV429','advanceRapCameraHoldV429','composeRapCameraV429'])
  assert(new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from "\\./cinematicRapCameraV429"`).test(camera),`Missing V429 camera import ${name}`);
const avatar = fs.readFileSync(path.join(root,'components/visualizer/ThreeAvatar.tsx'),'utf8');
for(const name of ['featureSpotlightV460','featureInteractionV460'])
  assert(new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from "\\./intelligentFeaturePerformanceV460"`).test(avatar),`Missing V460 import ${name}`);
const stage = fs.readFileSync(path.join(root,'components/visualizer/VisualizerStage.tsx'),'utf8');
assert(stage.indexOf('const attentionV456=')>0 && stage.indexOf('const attentionV456=')<stage.indexOf('const experienceCueV396='),
  'V456 attention must be planned before it is used in the experience director');
const preview = fs.readFileSync(path.join(root,'components/visualizer/RapCameraTransitionPreviewPanelV434.tsx'),'utf8');
assert(preview.includes('lyricsProtected:preferences.lyricsVisible??true,bpm,settings:original,'),
  'The camera quality input requires the preview settings');
for (const filename of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VocalRigV368.tsx']) {
  const code=fs.readFileSync(path.join(root,filename),'utf8');
  assert(!/\w+\.rapSyllableTrackIdV420===\w+\.rapSyllableDocumentV420\?\.trackId/.test(code),
    `Nullable V420 document dereferenced without narrowing in ${filename}`);
}
console.log('PASS V473.4: production music types, camera V429/V460 imports, V456 initialization order, V434/V420 safety');
