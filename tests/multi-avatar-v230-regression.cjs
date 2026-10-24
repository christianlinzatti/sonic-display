require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path');
const root = path.resolve(__dirname,'..'); const source = p => fs.readFileSync(path.join(root,p),'utf8');
const director = source('components/visualizer/multiAvatarChoreography.ts');
const stage = source('components/visualizer/ThreeAvatar.tsx');
const panel = source('components/visualizer/MultiAvatarChoreographyPanel.tsx');
const checks = [
 ['lead/background roles', director.includes('lead-solo') && director.includes('partner-solo')],
 ['drop-wide formation', director.includes('isDrop ? "wide"')],
 ['diagonal formation', director.includes('"diagonal"')],
 ['partner delayed gesture', stage.includes('choreography?.partnerDelayBeats')],
 ['safe partner distance', stage.includes('separatePartners(leadTarget, partnerTarget, 1.35)')],
 ['smooth formation', stage.includes('formationApproach(group.position.x')],
 ['drop cue change', stage.includes('cue.dropAccent !== lastDrop.current')],
 ['config preserved', director.includes('sonic.multiAvatarChoreography.v206')],
 ['panel', panel.includes('V230 – Multi-Avatar Dance Director 2.0')],
 ['version', require('../package.json').version.endsWith('v248')],
];for (const [name,ok] of checks){assert.ok(ok,name);console.log('PASS',name)}
