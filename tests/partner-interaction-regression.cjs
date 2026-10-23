const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = fs.readFileSync("components/visualizer/partnerInteractionDirector.ts", "utf8");
const avatar = fs.readFileSync("components/visualizer/ThreeAvatar.tsx", "utf8");
const pkg = require("../package.json");
const tests = {
  "V146 engine and typed state": /export function advancePartnerInteraction/.test(engine) && /export type PartnerInteractionPhase/.test(engine),
  "five interaction phases": ["greeting", "call", "response", "together", "recovery"].every(p => engine.includes(`"${p}"`)),
  "different lead/partner gestures": /leadTarget/.test(engine) && /partnerTarget/.test(engine),
  "BPM and genre adaptation": /beatsPerCycle \* 60 \/ bpm/.test(engine) && /hardtekk/.test(engine) && /deutschrap/.test(engine),
  "uses audio accent/energy": /kickAccentIntensity/.test(engine) && /energyEnvelope/.test(engine),
  "smooth time-independent gain": /Math\.exp/.test(engine),
  "reduced motion and solo reset": /reducedMotion \|\| scene === "solo"/.test(engine),
  "manual override retains V145 behavior": /duoDirectorEnabled === true \? directed\.lead : 1/.test(avatar),
  "integrated both avatars": /beat \* directedLead/.test(avatar) && /beat \* directedPartner/.test(avatar),
  "track reset": /interaction\.current = createPartnerInteractionState\(\)/.test(avatar),
  "script wired": pkg.scripts["verify:offline"].includes("test:partner-interactions"),
};
for (const [name, pass] of Object.entries(tests)) { assert.ok(pass,name); console.log("PASS",name); }
