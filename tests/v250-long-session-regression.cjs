const assert=require("node:assert/strict"); const fs=require("node:fs");const path=require("node:path");const root=path.join(__dirname,"..");const read=f=>fs.readFileSync(path.join(root,f),"utf8");
assert.match(require("../package.json").version,/^0\.1\.0-v(25[0-9]|26[0-2])$/);
const store=read("services/monitoring/longSessionMetrics.ts");
assert.match(store,/MAX_SESSION_SAMPLES = 720/);assert.match(store,/samples.splice/);assert.match(store,/pauseSession/);assert.match(store,/heapGrowthMiBPerHour/);
assert.match(read("hooks/useLongSessionMonitoring.ts"),/setInterval\(sample, 5000\)/);
assert.match(read("components/SonicDisplay.tsx"),/useLongSessionMonitoring\(connected && isPlaying\)/);
assert.match(read("components/SettingsPanel.tsx"),/LongSessionMonitoringPanel/);
console.log("V250 long-session regression: OK");
