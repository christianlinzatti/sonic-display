'use strict';
/** Dependency-free source check: usable before npm ci on Windows and Linux.
 * Follow the registered light layers into the final governor and sole LAN look
 * call. This checks the route, rather than requiring one historical local name.
 */
function withoutComments(source){
 return source.replace(/(['"`])(?:\\[\s\S]|(?!\1)[^\\])*?\1|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,
  text=>text.startsWith('/')?'':text).replace(/\s+/g,'');
}
function hasFinalGoveeGovernor(source){
 if(typeof source!=='string')return false;
 const text=withoutComments(source);
 const layers=[
  ['showLookV1042','applyGoveeShowV1042(syncedLookV1027,previous,'],
  ['roomLookV1096','applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,'],
  ['coordinatedLookV1154','applyConcertLightV1154(roomLookV1096,coordinationDecisionV1154,'],
  ['ensembleLook','ensembleLightLook(coordinatedLookV1154,getEnsembleLight(),{'],
 ];
 let last=-1,expected='';
 for(const [name,call] of layers){
  const declared=text.indexOf(`const${name}=`);
  if(declared<0)continue;
  if(declared<=last||!text.startsWith(`const${name}=${call}`,declared))return false;
  // Each registered overlay must retain its preceding registered layer.
  if(name==='roomLookV1096'&&expected!=='showLookV1042'||name==='coordinatedLookV1154'&&expected!=='roomLookV1096'||name==='ensembleLook'&&expected!=='coordinatedLookV1154')return false;
  last=declared;expected=name;
 }
 if(!expected)return false;
 const governor=`constfinalLook=governConcertLookV961(previous,${expected},{`;
 const at=text.indexOf(governor),end=text.indexOf('}).look;',at);
 const dispatch="awaitgoveeBridgeRequestV909(config,'/command','POST',{ip,action:'look',value:finalLook});";
 const send=text.indexOf(dispatch);
 return at>last&&end>at&&send>end&&
  (text.match(/governConcertLookV961\(/g)||[]).length===1&&
  (text.match(/goveeBridgeRequestV909\(config,'\/command','POST'/g)||[]).length===1&&
  text.slice(end,send).includes('if(!loadGoveeConfigV909().autoSync)break;');
}
module.exports={hasFinalGoveeGovernor};
