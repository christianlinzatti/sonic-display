'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {hasFinalGoveeGovernor:valid}=require('../lib/goveeSenderInvariant.cjs');
const source=fs.readFileSync(path.join(__dirname,'../components/GoveeMusicSyncV909.tsx'),'utf8');
assert(valid(source),'Current ensemble route must keep the last governor and single LAN sender');
assert(valid(source.replace(/\n/g,'\r\n')),'Windows line endings');
const ensemble=source.slice(source.indexOf('      const ensembleLook='),source.indexOf('      const finalLook='));
const legacy=source.replace(ensemble,'').replace('governConcertLookV961(previous,ensembleLook,','governConcertLookV961(previous,coordinatedLookV1154,').replace('ensembleLook!==coordinatedLookV1154','false');
assert(valid(legacy),'Pre-ensemble coordination route remains supported');
for(const [name,mutated] of [
 ['skipping the ensemble layer',source.replace('governConcertLookV961(previous,ensembleLook,','governConcertLookV961(previous,coordinatedLookV1154,')],
 ['skipping coordination',source.replace('ensembleLightLook(coordinatedLookV1154,','ensembleLightLook(roomLookV1096,')],
 ['sending an ungoverned look',source.replace("action:'look',value:finalLook","action:'look',value:ensembleLook")],
 ['removing the auto-sync recheck',source.replace('if(!loadGoveeConfigV909().autoSync)break;','')],
 ['duplicate LAN commands',source.replace("await goveeBridgeRequestV909(config,'/command','POST',{ip,action:'look',value:finalLook});", "await goveeBridgeRequestV909(config,'/command','POST',{ip,action:'look',value:finalLook});\nawait goveeBridgeRequestV909(config,'/command','POST',{ip,action:'look',value:finalLook});")],
 ['governor only mentioned in a comment',source.replace('const finalLook=governConcertLookV961(previous,ensembleLook,{','/* const finalLook=governConcertLookV961(previous,ensembleLook,{ */ const finalLook=other(previous,ensembleLook,{')],
])assert(!valid(mutated),name+' must fail');
assert(!valid(null));
console.log('PASS Govee sender invariant: current/legacy routes, CRLF, skipped layers, ungoverned/duplicate sends, auto-sync recheck and comments');
