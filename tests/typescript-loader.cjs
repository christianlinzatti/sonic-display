'use strict';
// Reuse the project's TypeScript version on Windows, macOS and Linux.
// An optional explicit override helps in unusual offline test environments.
if (process.env.TYPESCRIPT_PATH) {
  module.exports = require(process.env.TYPESCRIPT_PATH);
} else {
  try {
    module.exports = require('typescript');
  } catch (error) {
    if (error?.code !== 'MODULE_NOT_FOUND' || !error.message?.includes("'typescript'")) {
      throw error;
    }
    throw new Error('TypeScript is not installed. Run npm install (or npm ci if a lockfile exists) before running the tests.', {cause:error});
  }
}
