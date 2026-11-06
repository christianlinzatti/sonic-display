const base=require('./playwright.production.cjs');
const path=require('node:path');
module.exports={...base,use:{...base.use,trace:'off'},testDir:'../tests/soak',projects:base.projects.slice(0,1),
 outputDir:path.resolve(__dirname,'../reports/playwright-soak/results'),
 reporter:[['list'],['json',{outputFile:path.resolve(__dirname,'../reports/playwright-soak/results.json')}],['html',{outputFolder:path.resolve(__dirname,'../reports/playwright-soak/html'),open:'never'}]],
};
