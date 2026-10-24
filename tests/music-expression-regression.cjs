require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root,"components/visualizer/musicAwareDanceExpression.ts"), "utf8");
const avatar = fs.readFileSync(path.join(root,"components/visualizer/ThreeAvatar.tsx"), "utf8");
assert.match(avatar,/computeMusicAwareDanceExpression\(beatFlowData.current/);
assert.match(avatar,/musicExpression.headNod/);
assert.match(avatar,/musicExpression.expressionJaw/);
let ts;
try { ts = require("typescript"); } catch {try {ts = require("/opt/node22/lib/node_modules/typescript");}catch{}}
if (!ts) {console.log("Integration assertions pass; behavior tests unavailable without TypeScript compiler"); process.exit(0);}
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};new Function("module","exports","require",js)(mod,mod.exports,require);
const calculate=mod.exports.computeMusicAwareDanceExpression;
const base={kickOnset:.8,snareOnset:.7,groove:.6,accent:.5,transitionBoost:.2,confidence:.7};
const rap=calculate({...base,style:"rap-halftime"},true,false,1);
const hard=calculate({...base,style:"hard-kick"},true,false,1);
assert(rap.shoulderRoll>hard.shoulderRoll);
assert(hard.armSwing>rap.armSwing);
assert(rap.headNod<0);
assert.equal(calculate({...base,style:"rap-halftime"},false,false).headNod,0);
assert.equal(calculate({...base,style:"rap-halftime"},true,true).armSwing,0);
const invalid=calculate({...base,style:"steady",kickOnset:NaN,snareOnset:Infinity},true,false,Infinity);
assert(Object.values(invalid).every(Number.isFinite));
console.log("Music-aware expression: 6 behavior assertions + 3 integration assertions passed");
