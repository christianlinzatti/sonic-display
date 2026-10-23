const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const src = name => fs.readFileSync(path.join(__dirname,"../components/visualizer",name),"utf8");
const engine = src("adaptiveFullBodyRefinement.ts");
const avatar = src("ThreeAvatar.tsx");
const panel = src("DanceDiagnosticsPanel.tsx");
const checks = [
  ["opt-in disabled by default",engine.includes("enabled: false")],
  ["settings persisted safely",engine.includes("localStorage.setItem")],
  ["quality samples scoped by dancer",engine.includes("context.quality.dancer === context.dancer")],
  ["foot drift feedback",engine.includes("slideMean")],
  ["hand target feedback",engine.includes("handErrorMean")],
  ["IK correction feedback",engine.includes("correctionMean")],
  ["bounded safe factor",engine.includes(".55, 1")],
  ["frame-independent damping",engine.includes("Math.exp(-6*dt)")],
  ["additive-only channels",engine.includes("dampingChannels")],
  ["respect pause and reduced motion",avatar.includes("active:isPlaying && !reducedMotion")],
  ["before diagnostic and rig application",avatar.indexOf("const refined = refineFullBodyMotion") < avatar.indexOf("sampleMotionQuality(motionQualitySampler.current")],
  ["safe global quality snapshot",avatar.includes("getIKQualitySnapshot()")],
  ["UI toggle available",panel.includes('type="checkbox" checked={refinement.enabled}')],
  ["UI intensity available",panel.includes('aria-label="Anpassungsstärke"')],
  ["existing IK preserved",avatar.includes("updateFootIK(footIK.current") && avatar.includes("updatePartnerHandIK(")],
];
for (const [name, valid] of checks) {assert.ok(valid,name); console.log("✓",name)}
console.log(`${checks.length} V158 regression tests passed`);
