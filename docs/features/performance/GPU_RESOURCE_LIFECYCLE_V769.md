# V769 - GPU Resource Lifecycle Optimization

Private GLTFLoader loads now release geometries, materials, textures (including
shader uniform textures) and skeletons in finally, including error and late
completion paths. Shared useGLTF resources must never be disposed by this helper.
SkeletonUtils instances release only their own skeletons. Existing composer
and pass cleanup continues to own render targets.

See `components/visualizer/privateGltfLifecycleV769.ts` and
`tests/v769-private-gltf-lifecycle-regression.cjs`.

Run `npm run test:v769`, `npm run verify:v769:static`, `npm run typecheck`,
and `npm run build`. Run `npm run test:v767:browser` on an actual WebGL browser
before interpreting renderer.info metrics as evidence for/against a GPU leak.
