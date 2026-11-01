// Check both the actual buffer geometry and the live stage integration.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('./typescript-loader.cjs');
const base = path.join(__dirname, '..');
const geometryFile = fs.readFileSync(path.join(base, 'components/visualizer/stages/galaxyStarfieldV766.ts'), 'utf8');
const stage = fs.readFileSync(path.join(base, 'components/visualizer/stages/index.tsx'), 'utf8');
const transpiled = ts.transpileModule(geometryFile, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
// Real Three.js when installed; a small attribute-only stub keeps source regressions
// runnable in restricted offline CI (it does not simulate a WebGL renderer).
let three, offlineStub = false;
try { three = require('three'); }
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  offlineStub = true;
  three = {
    Color: class { constructor(hex) {this.r=parseInt(hex.slice(1,3),16)/255;this.g=parseInt(hex.slice(3,5),16)/255;this.b=parseInt(hex.slice(5,7),16)/255;} },
    Float32BufferAttribute: class {constructor(array,itemSize){this.array=new Float32Array(array);this.itemSize=itemSize;this.count=array.length/itemSize;}getX(index){return this.array[index*this.itemSize];}},
    BufferGeometry: class {constructor(){this.attributes={};}setAttribute(name,attribute){this.attributes[name]=attribute;}getAttribute(name){return this.attributes[name];}computeBoundingSphere(){this.boundingSphere={radius:12};}dispose(){this.disposed=true;}},
  };
}
const api = {exports: {}};
new Function('require', 'module', 'exports', transpiled)(id => id === 'three' ? three : require(id), api, api.exports);
const {createGalaxyStarfieldV766} = api.exports;
for (const n of [75, 210]) {
  const geometry = createGalaxyStarfieldV766(n);
  assert.equal(geometry.getAttribute('position').count, n);
  assert.equal(geometry.getAttribute('color').count, n);
  assert.equal(geometry.getAttribute('starSize').count, n);
  assert.ok(geometry.boundingSphere && geometry.boundingSphere.radius > 0);
  for (const attr of Object.values(geometry.attributes)) {
    for (const value of attr.array) assert.ok(Number.isFinite(value), 'finite GPU buffer data');
  }
  assert.ok(Math.abs(geometry.getAttribute('starSize').getX(0) - 0.045) < 1e-6);
  assert.ok(Math.abs(geometry.getAttribute('starSize').getX(1) - 0.02) < 1e-6);
  geometry.dispose();
}
assert.match(stage, /<GalaxyStarfieldV766\s*\/>/);
assert.match(stage, /<points geometry=\{geometry\}/);
assert.match(stage, /useEffect\(\(\) => \(\) => geometry\.dispose\(\), \[geometry\]\)/);
assert.match(stage, /tier === "low" \? 75 : 210/);
assert.doesNotMatch(stage.slice(stage.indexOf('function GalaxyStage'), stage.indexOf('function WhiteStudioStage')), /Array\.from\(\{ length: count \}/);
console.log('V766: verified 75/210 stars, color/size buffers, single point cloud and cleanup' + (offlineStub ? ' (Three.js mock; GPU rendering not exercised).' : '.'));
