const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.ok(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 269, 'Projektversion muss >= V269 sein');
const svc=read('services/monitoring/smartDeviceAutoSelectionV269.ts');const ui=read('components/DevicePerformanceProfilesV267.tsx');
for(const t of ['function selectDeviceProfile','validProfile(p)','p.fingerprint===fingerprint','already-active','b.score-a.score']) assert.ok(svc.includes(t),t);
for(const t of ['selectDeviceProfile(profiles,fingerprint','setPreview(autoSuggestion.profile)','Empfohlenes Profil prüfen','keine automatische Änderung','Noch kein Profil mit exakt passender Gerätekennung']) assert.ok(ui.includes(t),t);
assert.ok(!svc.includes('setPerformanceMode('));
assert.ok(ui.includes('function apply(){if(!preview||preview.fingerprint!==fingerprint)return;'));
console.log('V269 smart device auto selection regression OK');
