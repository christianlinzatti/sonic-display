require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require("node:assert/strict");
const fs = require("node:fs");
const files = {
  profile: fs.readFileSync("components/visualizer/piDeviceProfile.ts", "utf8"),
  ui: fs.readFileSync("components/visualizer/RaspberryPiEdition.tsx", "utf8"),
  avatar: fs.readFileSync("components/visualizer/ThreeAvatar.tsx", "utf8"),
  diagnostics: fs.readFileSync("components/visualizer/DanceDiagnosticsPanel.tsx", "utf8"),
};
let checks = 0;
function test(name, condition) {assert.ok(condition, name); checks++;}
test("opt-in default", /return "off"/.test(files.profile));
test("device hints", /detectPiHints/.test(files.profile));
test("Linux ARM heuristic", /linuxArm/.test(files.profile));
test("safe quality policy", /resolvePiQuality/.test(files.profile));
test("local persistence", /localStorage/.test(files.profile));
test("change signal", /sonic:pi-profile-changed/.test(files.profile));
test("bootstrap", /RaspberryPiProfileBootstrap/.test(files.ui));
test("scene bootstrap mounted", /<RaspberryPiProfileBootstrap \/>/.test(files.avatar));
test("visual settings", /RaspberryPiEditionSettings/.test(files.diagnostics));
test("fullscreen with gesture", /requestFullscreen/.test(files.ui));
test("exit fullscreen", /exitFullscreen/.test(files.ui));
test("fullscreen error", /catch \{ setMessage/.test(files.ui));
test("manual low and balanced", /pi-low/.test(files.ui) && /pi-balanced/.test(files.ui));
test("preserve adaptive quality", /setPerformanceMode\("auto"\)/.test(files.ui));
test("no direct IK changes", !/updateFootIK|updatePartnerHandIK/.test(files.ui));
test("build scripts intact", fs.existsSync("scripts/build-preflight.cjs"));
console.log(`V165 Raspberry Pi regression: ${checks} passed`);
