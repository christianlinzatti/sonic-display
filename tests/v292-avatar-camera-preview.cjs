const fs=require("node:fs"),assert=require("node:assert/strict");
const studio=fs.readFileSync("components/visualizer/CameraPresetStudioV290.tsx","utf8");
const view=fs.readFileSync("components/visualizer/CameraLivePreviewV291.tsx","utf8");
for(const needle of ["/api/avatars","avatarOptions","previewAvatar","avatarUrl={previewAvatar?.url}","setAvatarId","no-store"])assert.ok(studio.includes(needle),needle);
for(const needle of ["useGLTF(url)","cloneSkinnedScene(scene)","<Suspense", "PreviewErrorBoundary", "<NeutralAvatar />", "new Box3()", "avatarLabel"])assert.ok(view.includes(needle),needle);
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(292);
console.log("V292 installed-avatar camera preview regression passed");
