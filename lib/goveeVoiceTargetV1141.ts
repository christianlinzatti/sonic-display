/** V1141: bounded voice targets; never accept a raw device IP or arbitrary group identifier. */
export type GoveeVoiceRoleV1141='wall'|'rhythm'|'neon'|'ambient';
export type GoveeVoiceTargetV1141={fixtureNumber:number}|{groupRole:GoveeVoiceRoleV1141};
const ROLES:readonly GoveeVoiceRoleV1141[]=['wall','rhythm','neon','ambient'];
export function validGoveeVoiceTargetV1141(value:unknown):value is GoveeVoiceTargetV1141{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const v=value as Record<string,unknown>,keys=Object.keys(v);
 return keys.length===1&&(
  (keys[0]==='fixtureNumber'&&Number.isSafeInteger(v.fixtureNumber)&&
   typeof v.fixtureNumber==='number'&&v.fixtureNumber>=1&&v.fixtureNumber<=4)||
  (keys[0]==='groupRole'&&typeof v.groupRole==='string'&&ROLES.includes(v.groupRole as GoveeVoiceRoleV1141)));
}
export function resolveGoveeVoiceIpsV1141(target:GoveeVoiceTargetV1141,selected:readonly string[],
 deviceRoles:Record<string,string>,groups:{enabled:boolean;groups:readonly {role:string;members:readonly string[]}[]}):string[]{
 if(!validGoveeVoiceTargetV1141(target)||selected.length>32||selected.length===0)return [];
 if('fixtureNumber' in target)return selected[target.fixtureNumber-1]?[selected[target.fixtureNumber-1]]:[];
 const matching=groups.enabled?groups.groups.filter(g=>g.role===target.groupRole):[];
 // If a configured group owns the role, respect its explicit membership.
 if(matching.length)return selected.filter(ip=>matching.some(g=>g.members.includes(ip)));
 return selected.filter(ip=>deviceRoles[ip]===target.groupRole);
}
