const path = require('node:path');
const base = require('./playwright.production.cjs');
const report = path.resolve(__dirname, '../reports/playwright-avatars');
module.exports = {
  ...base,
  testMatch: ['sonic-stage-avatars.spec.cjs','sonic-crew-show.spec.cjs'],
  outputDir: path.join(report, 'test-results'),
  reporter: [['list'], ['json', { outputFile: path.join(report, 'results.json') }], ['html', { outputFolder: path.join(report, 'html'), open: 'never' }]],
};
