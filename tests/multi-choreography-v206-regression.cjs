require('./helpers/threeAvatarSourcesV492.cjs').install();
const fs=require('fs'),assert=require('assert');
const root=require('path').resolve(__dirname,'..');
const read=p=>fs.readFileSync(require('path').join(root,p),'utf8');
const mod=read('components/visualizer/multiAvatarChoreography.ts');
const panel=read('components/visualizer/MultiAvatarChoreographyPanel.tsx');
const scene=read('components/visualizer/ThreeAvatar.tsx');
const settings=read('components/SettingsPanel.tsx');
const checks=[
 ['shared state',/initialMultiAvatarState/.test(mod)],
 ['default off',/enabled: false/.test(mod)],
 ['bounded BPM',/clamp\(finite\(audio.bpm,120\),55,240\)/.test(mod)],
 ['pause freeze',/if\(!playing \|\| reducedMotion/.test(mod)],
 ['shared bar clock',/4\*settings.barsPerPart/.test(mod)],
 ['alternating',/pattern === "alternating"/.test(mod)],
 ['call and response',/pattern === "call-response"/.test(mod)],
 ['unison',/"unison"/.test(mod)],
 ['drop join',/isDrop/.test(mod)],
 ['lead and partner gain',/leadGain/.test(mod)&&/partnerGain/.test(mod)],
 ['storage event',/window.dispatchEvent/.test(mod)],
 ['storage guard',/try \{/.test(mod)&&/catch/.test(mod)],
 ['sanitize fields',/sanitizeMultiAvatarSettings/.test(mod)],
 ['panel mounted',/MultiAvatarChoreographyPanel/.test(settings)],
 ['UI checkbox',/checkbox/.test(panel)],
 ['UI pattern',/call-response/.test(panel)],
 ['UI bar duration',/barsPerPart/.test(panel)],
 ['UI dropout',/dropTogether/.test(panel)],
 ['live director',/function MultiAvatarDirectorTick/.test(scene)],
 ['live formation re-use',/FormationDancers props=/.test(scene)],
 ['role gain integrated',/choreography\?\.leadGain/.test(scene)],
 ['previous automation precedence',/!multiEnabled && props.duoDirectorEnabled/.test(scene)],
 ['track reset',/props.track\?\.id/.test(scene)],
 ['doc',/V206/.test(read('V206-MULTI-AVATAR-CHOREOGRAPHY.md'))]
];
for(const [name,ok] of checks){assert.ok(ok,`FAIL: ${name}`);console.log('✓',name)}
console.log(`${checks.length} V206 checks passed`);
