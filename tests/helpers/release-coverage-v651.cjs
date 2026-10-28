"use strict";
const assert = require("node:assert/strict");
const scripts = require("../../package.json").scripts;
function isInReleaseGate(target, root="prebuild") {
  const visited = new Set();
  function visit(name) {
    if (visited.has(name)) return false;
    visited.add(name);
    if (name === target) return true;
    const command = scripts[name] || "";
    for (const match of command.matchAll(/\bnpm\s+run\s+([\w:-]+)/g)) {
      if (visit(match[1])) return true;
    }
    // Legacy runner explicitly processes all test commands from verify:offline.
    if (command.includes("node scripts/run-regression-suite-v404.cjs") && visit("verify:offline")) return true;
    return false;
  }
  return visit(root);
}
function assertIncluded(script) {
  assert(scripts[script], `Unknown regression script ${script}`);
  assert(isInReleaseGate(script), `${script} must be reachable from prebuild`);
}
module.exports = {isInReleaseGate,assertIncluded};
