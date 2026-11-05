"use strict";
// Forward-compatible release gate assertion for historical regressions.
// New versions may prepend more tests; the current prebuild must still finish
// by executing check:fast, which runs the complete TypeScript quality gate.
const assert = require("node:assert/strict");

function assertModernPrebuildQualityGate(scripts, minimumVersion = 865) {
  assert(scripts && typeof scripts === "object", "package scripts must exist");
  const prebuild = scripts.prebuild;
  assert(typeof prebuild === "string" && prebuild.length > 0, "prebuild must not be empty");
  const commands = prebuild.split(/\s*&&\s*/).map(s => s.trim());
  assert(commands.every(Boolean), "prebuild has an empty command");
  assert.equal(commands.at(-1), "npm run check:fast", "prebuild must end in check:fast");
  const versions = [];
  for (const command of commands.slice(0, -1)) {
    if (command === 'npm run test:react-act-compat') {
      assert.equal(scripts['test:react-act-compat'], 'node tests/react-act-compat-regression.cjs',
        'React act compatibility test must be the registered regression script');
      continue;
    }
    const match = /^npm run test:v(\d+)(?::(?:types|ui-types|api))?$/.exec(command);
    assert(match, `Unexpected or bypassing prebuild command: ${command}`);
    if (command.endsWith(':api')) {
      assert(typeof scripts[`test:v${match[1]}:api`] === 'string',
        'API prebuild test must be a registered script');
    }
    if (!/:(?:types|ui-types|api)$/.test(command)) versions.push(Number(match[1]));
  }
  assert(versions.length > 0, "No version regression tests in prebuild");
  assert(versions[0] >= minimumVersion, `Prebuild must test at least V${minimumVersion} first`);
  // The V908 release baseline is first for historical compatibility; later
  // Govee-era suites are appended as validated contiguous blocks.
  // These three known grouping transitions are intentional, not skipped tests.
  const allowedGroupTransitions = new Set(['908:928', '928:929', '916:921']);
  assert(versions.every((v, i) => i === 0 || v <= versions[i - 1] ||
    allowedGroupTransitions.has(versions[i - 1] + ':' + v)),
    "Prebuild versions must run newest to oldest apart from validated compatibility groups");
  assert.equal(new Set(versions).size, versions.length,
    "Prebuild must not silently repeat version regression groups");
  assert(/(?:^|&&\s*)npm run typecheck(?:\s*&&|$)/.test(scripts["check:fast"] || ""),
    "check:fast must run the complete production TypeScript check");
  assert((scripts["check:release"] || "").includes("npm run typecheck"),
    "Release gate must retain production TypeScript check");
  return commands;
}
module.exports = { assertModernPrebuildQualityGate };
