const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('components/CharacterMotionBatchInstaller.tsx'),api=read('app/api/avatars/models/install/route.ts'),settings=read('components/SettingsPanel.tsx'),manifest=JSON.parse(read('package.json'));
const checks=[
['V188 package',()=>assert.match(manifest.version,/^0\.1\.0-v\d+$/)],
['client component',()=>assert.match(ui,/^"use client";/)],
['batch characters',()=>assert.match(ui,/multiple accept="\.glb/)],
['character preview',()=>assert.match(ui,/<AvatarPreview3D/)],
['motion assignments',()=>assert.match(ui,/Ziel-Avatar/)],
['existing motion replacement consent',()=>assert.match(ui,/model.animationUrl&&!replace/)],
['avoid duplicate target assignments',()=>assert.match(ui,/assignments.has\(item.target\)/)],
['preserve status per file',()=>assert.match(ui,/error:error instanceof Error/)],
['blob upload',()=>assert.match(ui,/@vercel\/blob\/client/)],
['local motion upload',()=>assert.match(ui,/avatars\/animations\/import/)],
['persistent assignment',()=>assert.match(ui,/avatars\/animations\/install/)],
['persistent character metadata',()=>assert.match(ui,/avatars\/config/)],
['settings integration',()=>assert.match(settings,/<CharacterMotionBatchInstaller/)],
['admin required',()=>assert.match(api,/isAdmin\(\)/)],
['same-origin enforced',()=>assert.match(api,/sameOrigin\(req\)/)],
['dev-mode local-only',()=>assert.match(api,/NODE_ENV !== "development"/)],
['blob mode local disable',()=>assert.match(api,/\|\| useBlob/)],
['file size limit',()=>assert.match(api,/35 \* 1024 \* 1024/)],
['glb signature',()=>assert.match(api,/"glTF"/)],
['glb version validation',()=>assert.match(api,/getUint32\(4,true\)!==2/)],
['filename sanitized',()=>assert.match(api,/replace\(\/\[\^a-zA-Z0-9_-\]/)],
['unique filenames',()=>assert.match(api,/randomUUID\(\)/)],
['metadata saved',()=>assert.match(api,/writeAvatarConfig\(metadata\)/)],
['object URL lifecycle',()=>assert.match(ui,/URL.revokeObjectURL/)],
['documentation',()=>assert.ok(fs.existsSync(path.join(root,'V188-CHARACTER-MOTION-BATCH-INSTALLER.md')))],
];for(const [name,fn] of checks){try{fn();console.log('PASS',name);}catch(e){console.error('FAIL',name,e.message);process.exitCode=1;}}
console.log(`${checks.length} checks`);
