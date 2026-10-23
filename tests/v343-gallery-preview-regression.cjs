const assert=require('node:assert/strict');const fs=require('node:fs');
const source=fs.readFileSync('components/visualizer/GalleryPreviewEditorV343.tsx','utf8');
for(const fragment of ['StageImageGalleryV338','/api/stage-content/artist?artist=','safeStageMediaV330','AbortController','aria-live','targetAspectRatio','saveGalleryV338','onSubmit','credits={credits}','playing={!paused}'])assert(source.includes(fragment),'Missing preview behavior: '+fragment);
assert(!/qr.code|bandsintown/i.test(source));
const settings=fs.readFileSync('components/visualizer/StageContentPluginSettingsV330.tsx','utf8');assert(settings.includes('<GalleryPreviewEditorV343/>'));
assert.match(fs.readFileSync('app/globals.css','utf8'),/sonic-preview-surface-v343/);
assert.ok(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 350);
console.log('V343 gallery preview regression passed');
