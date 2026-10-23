const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const engine=read('services/settings/unifiedBackup.ts');
const ui=read('components/UnifiedSettingsBackup.tsx');
const panel=read('components/SettingsPanel.tsx');
const pkg=require('../package.json');
const checks=[
 pkg.version==='0.1.0-v248',pkg.scripts['verify:offline'].includes('test:unified-backup'),
 engine.includes('createUnifiedBackup'),engine.includes('parseUnifiedBackup'),engine.includes('previewUnifiedBackup'),engine.includes('applyUnifiedBackup'),
 engine.includes('MAX_BACKUP_BYTES'),engine.includes('Object.create(null)'),engine.includes('groupForBackupKey'),
 engine.includes('token|secret|password|authorization|cookie|credential|oauth|session'),
 engine.includes('sonic-display:light-timeline-v172:'),engine.includes('sonic-display:v181:genre-corrections'),
 engine.includes('sonic-display:lighting-preset-library-v178'),engine.includes('sonic-display-ui-preferences-v1'),
 engine.includes('sonic-display:v165:pi-profile'),engine.includes('sonic-display-choreographies-v95'),
 engine.includes('options.overwrite || store.getItem(key)===null'),engine.includes('prior=new Map'),engine.includes('store.removeItem(key)'),
 ui.includes('Import-Vorschau'),ui.includes('Konflikte ersetzen'),ui.includes('window.confirm'),ui.includes('URL.revokeObjectURL'),
 ui.includes('Ausgewählte Einstellungen wiederherstellen'),ui.includes('JSON-Sicherung importieren'),
 panel.includes('<UnifiedSettingsBackup />'),
 read('V184-UNIFIED-SETTINGS-BACKUP.md').includes('nicht verschlüsselt')];
checks.forEach((ok,i)=>assert.ok(ok,'V184 check '+(i+1)));
console.log(`V184 Unified Backup: ${checks.length} Prüfungen bestanden`);
