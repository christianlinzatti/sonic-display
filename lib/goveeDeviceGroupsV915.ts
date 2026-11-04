/** V915 – local-only, explicit Govee device groups for live concert control.
 * Groups never contain bridge credentials; each lamp has one group at most.
 * Neither this module nor previews communicate with a physical device.
 */
import {isGoveeLanIpV909,type GoveeLookV909,type GoveeRoleSelectionV911} from '@/lib/goveeLanV909';

export const GOVEE_GROUPS_KEY_V915='sonic-display:govee-device-groups-v915';
export const GOVEE_GROUPS_EVENT_V915='sonic-display:govee-groups-changed-v915';
export type GoveeGroupModeV915='unison'|'individual';
export type GoveeGroupV915={id:string;name:string;members:string[];mode:GoveeGroupModeV915;role:GoveeRoleSelectionV911;brightnessPercent:number};
export type GoveeGroupLibraryV915={schema:'govee-device-groups-v915';enabled:boolean;groups:GoveeGroupV915[]};
export const EMPTY_GOVEE_GROUPS_V915:GoveeGroupLibraryV915={schema:'govee-device-groups-v915',enabled:false,groups:[]};
const roleOptions=['auto','wall','rhythm','neon','ambient'];
const record=(value:unknown):Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
const validId=(value:unknown):value is string=>typeof value==='string'&&/^[a-zA-Z0-9_-]{4,72}$/.test(value);
const clamp=(value:unknown,defaultValue:number,min:number,max:number):number=>typeof value==='number'&&Number.isFinite(value)?Math.round(Math.min(max,Math.max(min,value))):defaultValue;
/** Even imported groups cannot contain duplicates, overlapping device memberships or non-private IPs. */
export function normalizeGoveeGroupsV915(raw:unknown):GoveeGroupLibraryV915{
 const obj=record(raw);
 if(obj.schema!=='govee-device-groups-v915')return {...EMPTY_GOVEE_GROUPS_V915,groups:[]};
 const rows=Array.isArray(obj.groups)?obj.groups.slice(0,24):[];
 const groups:GoveeGroupV915[]=[];
 const assigned=new Set<string>();const identifiers=new Set<string>();
 for(const row of rows){
  const item=record(row);
  if(!validId(item.id)||identifiers.has(item.id)||typeof item.name!=='string'||!item.name.trim())continue;
  identifiers.add(item.id);
  const members:string[]=[];
  for(const ip of Array.isArray(item.members)?item.members.slice(0,64):[]){
   if(typeof ip==='string'&&isGoveeLanIpV909(ip)&&!assigned.has(ip)){
    assigned.add(ip);members.push(ip);if(members.length>=32)break;
   }
  }
  groups.push({id:item.id,name:item.name.trim().slice(0,48),members,
   mode:item.mode==='unison'?'unison':'individual',
   role:typeof item.role==='string'&&roleOptions.includes(item.role)?item.role as GoveeRoleSelectionV911:'auto',
   brightnessPercent:clamp(item.brightnessPercent,100,10,100)});
  if(groups.length>=12)break;
 }
 return {schema:'govee-device-groups-v915',enabled:obj.enabled===true,groups};
}
export function loadGoveeGroupsV915():GoveeGroupLibraryV915{
 if(typeof window==='undefined')return {...EMPTY_GOVEE_GROUPS_V915,groups:[]};
 try{return normalizeGoveeGroupsV915(JSON.parse(localStorage.getItem(GOVEE_GROUPS_KEY_V915)||'null'));}
 catch{return {...EMPTY_GOVEE_GROUPS_V915,groups:[]};}
}
export function saveGoveeGroupsV915(raw:GoveeGroupLibraryV915):GoveeGroupLibraryV915{
 if(raw.groups.length>12)throw Error('Maximal 12 Govee-Gruppen erlaubt.');
 const normalized=normalizeGoveeGroupsV915(raw);
 if(normalized.groups.length!==raw.groups.length)throw Error('Ungültige Gruppen oder doppelte Gruppenkennungen.');
 localStorage.setItem(GOVEE_GROUPS_KEY_V915,JSON.stringify(normalized));
 window.dispatchEvent(new Event(GOVEE_GROUPS_EVENT_V915));
 return normalized;
}
/** Reassign a lamp instead of letting two different groups issue contradictory commands. */
export function assignGoveeGroupMemberV915(library:GoveeGroupLibraryV915,groupId:string,ip:string,checked:boolean):GoveeGroupLibraryV915{
 if(!isGoveeLanIpV909(ip)||!library.groups.some(group=>group.id===groupId))return library;
 return {...library,groups:library.groups.map(group=>{
  if(group.id===groupId)return {...group,members:checked?[...new Set([...group.members,ip])]:group.members.filter(item=>item!==ip)};
  return checked&&group.members.includes(ip)?{...group,members:group.members.filter(item=>item!==ip)}:group;
 })};
}
/** Only enabled grouping, and only for selected devices, can affect the live show. */
export function findActiveGoveeGroupV915(library:GoveeGroupLibraryV915,ip:string,selectedIps:readonly string[]):GoveeGroupV915|undefined{
 return library.enabled&&selectedIps.includes(ip)?library.groups.find(group=>group.members.includes(ip)):undefined;
}
/** Unison groups use the first *selected* member as source of the shared cue. */
export function getGoveeGroupSourceIpV915(group:GoveeGroupV915|undefined,ip:string,selectedIps:readonly string[]):string{
 return group?.mode==='unison'?(group.members.find(member=>selectedIps.includes(member))??ip):ip;
}
/** A group is a dimmer, never a brightness amplifier; no power or flash commands. */
export function applyGoveeGroupBrightnessV915(look:GoveeLookV909,group:GoveeGroupV915|undefined,masterBrightness:number):GoveeLookV909{
 if(!group)return look;
 const master=clamp(masterBrightness,65,1,100);
 return {color:{...look.color},brightness:Math.max(1,Math.min(master,Math.round(look.brightness*group.brightnessPercent/100)))};
}
