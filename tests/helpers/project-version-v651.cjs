"use strict";
const assert=require("node:assert/strict");
/** Versions are monotonic; a historic regression remains valid in every later release. */
function assertProjectVersionAtLeast(minVersion) {
  const version=require("../../package.json").version;
  const match=/^0\.1\.0-v(\d+)$/.exec(version);
  assert(match,`Unexpected Sonic Display version: ${version}`);
  assert(Number(match[1])>=minVersion,`V${minVersion} test requires release V${minVersion} or newer; found ${version}`);
}
module.exports={assertProjectVersionAtLeast};
