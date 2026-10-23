// Prefer the project-local TypeScript installation (Windows, macOS, Linux).
// The global fallback enables this offline build sandbox to run source tests.
if (process.env.TYPESCRIPT_PATH) {
  module.exports = require(process.env.TYPESCRIPT_PATH);
} else {
  try { module.exports = require('typescript'); }
  catch (error) {
    if (error && error.code !== 'MODULE_NOT_FOUND') throw error;
    module.exports = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
  }
}
