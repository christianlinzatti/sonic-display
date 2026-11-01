'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const pkg=JSON.parse(read('package.json'));
const projectVersion=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]);
assert(Number.isSafeInteger(projectVersion) && projectVersion>=793,'V793 remains supported on later versions');
const lightingTest=read('tests/v793-advanced-light-choreographer-regression.cjs');
assert(lightingTest.includes('compatibleVersion>=793'),'V793 minimum-version gate retained');
assert(!/compatibleVersion\s*<=\s*845/.test(lightingTest),'V793 must not impose outdated maximum version');
const config=JSON.parse(read('vercel.json'));
assert.deepEqual(config.crons,[{path:'/api/cron/release-push',schedule:'0 8 * * *'}]);
assert(fs.existsSync(path.join(root,'app/api/cron/release-push/route.ts')));
for(const {schedule} of config.crons){
 const parts=schedule.match(/^(\d{1,2}) (\d{1,2}) \* \* \*$/);
 assert(parts,`Hobby schedule must be daily, got ${schedule}`);
 assert(Number(parts[1])<60 && Number(parts[2])<24);
}
const pushTest=read('tests/v365-web-push-regression.cjs');
assert(pushTest.includes('Vercel Hobby cron jobs may run at most once per day'),'V365 protects daily cron plan');
const cronRoute=read('app/api/cron/release-push/route.ts');
for(const needle of ['isSafeCronSecret(process.env.CRON_SECRET','cronLock','selectFreshPushReleases','sendNotification'])assert(cronRoute.includes(needle),`Cron security/workflow retained: ${needle}`);
console.log('PASS V865.6: future-compatible V793 version gate and single daily UTC Vercel Hobby cron with auth/lock retained');
