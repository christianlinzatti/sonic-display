'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
function transpile(file,deps={}){
 const o=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!o.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error),`syntax ${file}`);
 const module={exports:{}};new Function('module','exports','require',o.outputText)(module,module.exports,id=>{if(!Object.hasOwn(deps,id))throw Error(`Unexpected import ${id}`);return deps[id];});return module.exports;
}
const artist=transpile('lib/artist-discovery-v360.ts');
const music=transpile('lib/music-discovery-v361.ts',{'@/lib/artist-discovery-v360':artist});
const radar=transpile('lib/release-radar-v362.ts',{'@/lib/artist-discovery-v360':artist,'@/lib/music-discovery-v361':music});
const notify=transpile('lib/release-notifications-v363.ts',{'@/lib/artist-discovery-v360':artist,'@/lib/release-radar-v362':radar});
const IDs=['2takcwOaAZWiXQijPHIx7B','74ASZWbe4lXaubB36ztrGX','0TnOYISbd1XYRBk9myaseg','4n0l0pgtmttZZCQG2AfY1c'];
const now=Date.parse('2026-10-19T13:00:00Z');
const sample=(id,day='2026-10-15')=>({id,title:'Release '+id,artists:['Demo'],releaseDate:day,releasePrecision:'day',coverUrl:'https://i.scdn.co/image/demo',spotifyUrl:'https://open.spotify.com/album/'+id,artistId:IDs[2],artistName:'Demo',daysOld:2,group:'single'});
let s=notify.freshNotificationStateV363();
assert.equal(s.enabled,true);assert.equal(notify.shouldCheckReleasesV363(s,now),true);
assert.equal(notify.RELEASE_SCAN_PAGES_V363,2);assert.equal(notify.RELEASE_CHECK_INTERVAL_V363,21600000);
let result=notify.applyReleaseScanV363(s,[sample(IDs[0]),sample(IDs[0]),sample(IDs[1],'2026-08-01')],now,[],IDs[2]);
assert.equal(result.added,1);s=result.state;assert.equal(s.knownIds.length,1);assert.equal(s.alerts.length,1);
assert.equal(s.nextCursor,IDs[2]);assert.equal(notify.countUnreadReleasesV363(s),1);
assert.equal(notify.shouldCheckReleasesV363(s,now+1000),false);
assert.equal(notify.shouldCheckReleasesV363(s,now+21600000),true);
result=notify.applyReleaseScanV363(s,[sample(IDs[0]),sample(IDs[3])],now+3600000,[],null);
assert.equal(result.added,1);s=result.state;assert.equal(s.alerts.length,2);
assert.equal(notify.applyReleaseScanV363(s,[sample(IDs[0]),sample(IDs[3])],now+7200000,[],null).added,0);
let seen=notify.applyReleaseScanV363(s,[sample(IDs[1],'2026-10-16')],now+7200000,[IDs[1]],null);
assert.equal(seen.added,0);assert(s.knownIds.length<=notify.RELEASE_KNOWN_MAX_V363);
assert.equal(notify.readReleaseAlertV363(s,IDs[0]).alerts.filter(a=>a.read).length,1);
assert.equal(notify.countUnreadReleasesV363(notify.readReleaseAlertV363(s,'all')),0);
let parsed=notify.parseNotificationStateV363(JSON.parse(JSON.stringify(s)));
assert.equal(parsed.alerts.length,2);assert.equal(parsed.alerts[0].release.id,IDs[0]);
assert.equal(notify.parseNotificationStateV363({version:777,alerts:[{release:sample(IDs[0])}]}).alerts.length,0);
assert.equal(notify.parseNotificationStateV363({...s,nextCursor:'../bad'}).nextCursor,null);
assert.equal(notify.parseNotificationStateV363({...s,enabled:false}).enabled,false);
assert.equal(notify.shouldCheckReleasesV363({...s,enabled:false},now+99999999),false);
assert.equal(notify.shouldCheckReleasesV363({...s,retryAfter:now+100000000},now+21600000),false); // cooldown after a retry is active
const corrupt={...s,alerts:[{release:{...sample(IDs[1]),spotifyUrl:'javascript:bad',coverUrl:'http://unsafe.example/x'},discoveredAt:0,read:false},{release:{...sample(IDs[0]),id:'../../evil'},read:false}]};
parsed=notify.parseNotificationStateV363(corrupt);
assert.equal(parsed.alerts[0].release.spotifyUrl,'https://open.spotify.com/album/'+IDs[1]);
assert.equal(parsed.alerts[0].release.coverUrl,null);
assert.equal(parsed.alerts.length,1);
assert.equal(notify.applyReleaseScanV363(s,[sample(IDs[0],'2026-10-19'),sample(IDs[0],'2026-10-19')],now,[],null).added,0); // known already
let next=notify.applyReleaseScanV363(notify.freshNotificationStateV363(),[sample(IDs[0],'2026-09-25')],now,[],null);
assert.equal(next.added,0);assert.equal(next.state.knownIds.length,1); // older than 14d but still within 30d
next=notify.applyReleaseScanV363(notify.freshNotificationStateV363(),[sample(IDs[0],'2026-10-20')],now,[],null);
assert.equal(next.added,0);assert.equal(next.state.knownIds.length,0); // never announce future releases
next=notify.applyReleaseScanV363(notify.freshNotificationStateV363(),[sample(IDs[0])],now,[],null,true);
assert(next.state.retryAfter>now);
assert(!notify.shouldCheckReleasesV363(next.state,now+1000));
const react=fs.readFileSync('components/ReleaseNotificationsV363.tsx','utf8');
for(const expected of ['scan(true)','shouldCheckReleasesV363','AbortController','localStorage','aria-modal="true"','RELEASE_SCAN_PAGES_V363','Release-Benachrichtigungen','sonic:release-radar-open-v363','RADAR_SEEN_KEY_V362','Spotify','fetch(`/api/spotify/release-radar?','readReleaseAlertV363'])assert(react.includes(expected),'Missing '+expected);
assert(!react.includes('new Notification(')&&!react.includes('serviceWorker.register(')&&!react.includes('Bearer '));
const main=fs.readFileSync('components/SonicDisplay.tsx','utf8');assert.equal((main.match(/<ReleaseNotificationsV363\/>/g)||[]).length,2);
const old=fs.readFileSync('components/ReleaseRadarV362.tsx','utf8');assert(old.includes('sonic:release-radar-open-v363'));assert(old.includes('sonic:radar-seen-changed-v362'));
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(363);assert(require('../package.json').scripts['verify:offline'].includes('test:v363'));
console.log('V363 Smart Release Notifications regression passed');
