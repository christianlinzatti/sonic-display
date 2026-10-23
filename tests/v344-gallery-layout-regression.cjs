const fs=require('node:fs');const assert=require('node:assert/strict');const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const mod=fs.readFileSync('services/stageContent/galleryLayoutV344.ts','utf8');
const compiled=ts.transpileModule(mod,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m={exports:{}};new Function('module','exports',compiled)(m,m.exports);const v=m.exports;
assert.deepEqual(v.sanitizeFrameV344(null),v.DEFAULT_FRAME_V344);
assert.deepEqual(v.sanitizeFrameV344({width:300,height:0,x:90,y:-5,zoom:3,cropX:150,cropY:-3}),{width:100,height:20,x:0,y:0,zoom:2,cropX:100,cropY:0});
assert.equal(v.layoutRatioV344(1.78),'wide');assert.equal(v.layoutRatioV344(1),'square');assert.equal(v.layoutRatioV344(.75),'portrait');
assert.equal(v.layoutRatioV344(NaN),'wide');
assert.equal(v.sanitizeLayoutsV344({wide:{width:60,x:90}}).wide.x,40);
assert.equal(v.readGalleryLayoutsV344().square.zoom,1);
for(const [filename,sections] of Object.entries({
 'components/visualizer/GalleryLayoutEditorV344.tsx':['createPortal','onPointerDown','setPointerCapture','onPointerMove','ArrowLeft','ArrowRight','saveGalleryPresetV344','deleteGalleryPresetV344','cropX','cropY','resetGalleryFrameV344'],
 'components/visualizer/StageImageGalleryV338.tsx':['GALLERY_LAYOUT_EVENT_V344','frameStyle','layoutRatioV344','...frameStyle'],
 'components/visualizer/GalleryPreviewEditorV343.tsx':['GalleryLayoutEditorV344','surfaceRef={surfaceRef}'],
 'app/globals.css':['sonic-gallery-layout-overlay-v344','sonic-gallery-layout-handle-v344','--sonic-gallery-zoom-v344']
})) {const s=fs.readFileSync(filename,'utf8');for(const token of sections)assert(s.includes(token),`${filename} missing ${token}`);}
assert(!/qr.code|bandsintown/i.test(fs.readFileSync('components/visualizer/GalleryLayoutEditorV344.tsx','utf8')));
assert.ok(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 350);
console.log('V344 gallery layout regression passed');
