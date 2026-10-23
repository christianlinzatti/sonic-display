#!/usr/bin/env node
// Optional offline optimizer; requires `npm install -D @gltf-transform/cli`.
// Never overwrites the input. glTF Transform retains skinned meshes and animation tracks,
// but visual verification and comparison are required for each avatar.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
const [input, output] = process.argv.slice(2);
if (!input || !output || path.extname(input).toLowerCase() !== '.glb' || path.extname(output).toLowerCase() !== '.glb') {
  console.error('Usage: npm run avatar:optimize -- source.glb optimized.glb'); process.exit(2);
}
if (!existsSync(input) || !statSync(input).isFile()) { console.error('Input GLB not found'); process.exit(2); }
if (path.resolve(input) === path.resolve(output) || (existsSync(output) && realpathSync(input) === realpathSync(output))) {
  console.error('Refusing to overwrite input'); process.exit(2);
}
if (existsSync(output)) { console.error('Output already exists; choose a new path'); process.exit(2); }
const cli = path.resolve('node_modules/@gltf-transform/cli/bin/cli.js');
if (!existsSync(cli)) { console.error('Install optional dependency: npm install --save-dev @gltf-transform/cli'); process.exit(2); }
const result = spawnSync(process.execPath,[cli,'optimize',path.resolve(input),path.resolve(output)],{stdio:'inherit'});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
