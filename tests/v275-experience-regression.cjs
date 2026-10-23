const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const kiosk=read('components/TouchKioskControls.tsx'),host=read('components/SonicDisplay.tsx'),css=read('app/globals.css'),pkg=JSON.parse(read('package.json'));
assert.match(kiosk,/EXPERIENCE_KEY/);assert.match(kiosk,/setExperience2/);assert.match(kiosk,/Experience 2\.0/);assert.match(kiosk,/aria-pressed=\{kiosk.experience2\}/);
assert.match(host,/sonic-experience-v275/);assert.match(host,/experience-v275-label/);assert.match(host,/role="progressbar"/);
assert.match(css,/sonic-experience-v275\.touch-kiosk-split/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/touch-action:manipulation/);
assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 275, 'Projektversion muss >= V275 sein');assert.match(pkg.scripts['verify:offline'],/test:v275/);
console.log('V275 Experience 2.0 integration PASS');
