/** V724 – Local, account-scoped, validated dashboard presets. No archive/API mutations. */
import {canonicalLastFmUsernameV706,validLastFmUsernameV706} from './lastfm-history-v706';
import {
 defaultDashboardLayoutV723,parseDashboardLayoutV723,readDashboardLayoutV723,
 type V723Layout,type V723Store,type V723WidgetId
} from './lastfm-dashboard-layout-v723';

export const V724_PRESETS_VERSION=1;
export const V724_PRESETS_PREFIX='sonic-display:lastfm:insights-presets:v724:';
export const V724_MAX_PRESETS=16;
export const V724_MAX_STORED_LENGTH=64000;
export const V724_BUILTIN_IDS=['personal','concert','history','discoveries','statistics'] as const;
export type V724Preset={id:string;name:string;layout:V723Layout};
export type V724PresetState={version:1;activeId:string;presets:V724Preset[]};
export type V724ReadResult={state:V724PresetState;warning:string|null;migrated:boolean};
const builtinNames:Record<typeof V724_BUILTIN_IDS[number],string>={
 personal:'Mein Dashboard',concert:'Konzert',history:'Musikgeschichte',discoveries:'Entdeckungen',statistics:'Statistiken'
};
const builtinIds=new Set<string>(V724_BUILTIN_IDS);
const clone=(layout:readonly {id:V723WidgetId;enabled:boolean;size:'half'|'full'}[]):V723Layout=>layout.map(w=>({...w}));
const norm=(layout:unknown):V723Layout|null=>parseDashboardLayoutV723({version:1,widgets:layout});
function styleLayout(order:readonly V723WidgetId[],enabled:readonly V723WidgetId[],full:readonly V723WidgetId[]):V723Layout{
 const defaults=defaultDashboardLayoutV723();
 const ids=[...order,...defaults.map(w=>w.id).filter(id=>!order.includes(id))];
 return ids.map(id=>({id,enabled:enabled.includes(id),size:full.includes(id)?'full':'half'}));
}
export function builtInDashboardPresetV724(id:typeof V724_BUILTIN_IDS[number]):V724Preset{
 let layout:V723Layout;
 switch(id){
 case 'concert':layout=styleLayout(['shortcuts','metrics','trends','activity'],['shortcuts','metrics','trends','activity'],['shortcuts','metrics']);break;
 case 'history':layout=styleLayout(['activity','records','metrics','shortcuts'],['activity','records','metrics','shortcuts'],['activity','records','metrics','shortcuts']);break;
 case 'discoveries':layout=styleLayout(['discoveries','trends','metrics','shortcuts'],['discoveries','trends','metrics','shortcuts'],['discoveries','trends','shortcuts']);break;
 case 'statistics':layout=styleLayout(['metrics','records','activity','trends','shortcuts'],['metrics','records','activity','trends','shortcuts'],['metrics','shortcuts']);break;
 default:layout=defaultDashboardLayoutV723();
 }
 return {id,name:builtinNames[id],layout};
}
export function defaultDashboardPresetsV724(legacyLayout?:readonly {id:V723WidgetId;enabled:boolean;size:'half'|'full'}[]):V724PresetState{
 const presets=V724_BUILTIN_IDS.map(builtInDashboardPresetV724);
 const parsed=legacyLayout?norm(legacyLayout):null;
 if(parsed)presets[0]={...presets[0],layout:parsed};
 return {version:V724_PRESETS_VERSION,activeId:'personal',presets};
}
export function dashboardPresetsKeyV724(account:string):string|null{
 if(!validLastFmUsernameV706(account))return null;
 return V724_PRESETS_PREFIX+encodeURIComponent(canonicalLastFmUsernameV706(account));
}
export function validPresetNameV724(input:unknown):input is string{
 return typeof input==='string'&&input.length>=1&&input.length<=40&&input.trim()===input&&input.trim().length>0&&!/[\u0000-\u001f\u007f<>]/.test(input);
}
function validId(id:unknown):id is string{return typeof id==='string'&&/^[a-z][a-z0-9-]{0,47}$/.test(id);}
/** Reject corrupt, duplicate, missing built-ins, stale, oversize and empty-visible layouts. */
export function parseDashboardPresetsV724(raw:unknown):V724PresetState|null{
 try{
  const value=typeof raw==='string'?JSON.parse(raw):raw;
  if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==1||!Array.isArray(value.presets)||value.presets.length<V724_BUILTIN_IDS.length||value.presets.length>V724_MAX_PRESETS||typeof value.activeId!=='string')return null;
  const ids=new Set<string>(),names=new Set<string>(),presets:V724Preset[]=[];
  for(const item of value.presets){
   if(!item||typeof item!=='object'||Array.isArray(item)||!validId(item.id)||ids.has(item.id)||!validPresetNameV724(item.name)||names.has(item.name.toLocaleLowerCase('de'))||!Array.isArray(item.layout)||item.layout.length!==6)return null;
   if(builtinIds.has(item.id)&&item.name!==builtinNames[item.id as typeof V724_BUILTIN_IDS[number]])return null;
   const layout=norm(item.layout);if(!layout||layout.length!==6||layout.some((w,i)=>w.id!==item.layout[i].id))return null;
   ids.add(item.id);names.add(item.name.toLocaleLowerCase('de'));presets.push({id:item.id,name:item.name,layout});
  }
  if(V724_BUILTIN_IDS.some(id=>!ids.has(id))||!ids.has(value.activeId))return null;
  return {version:1,activeId:value.activeId,presets};
 }catch{return null;}
}
export function serializeDashboardPresetsV724(value:V724PresetState):string{
 const parsed=parseDashboardPresetsV724(value);if(!parsed)throw new Error('Ungültige Dashboard-Presets');
 const raw=JSON.stringify(parsed);if(raw.length>V724_MAX_STORED_LENGTH)throw new Error('Zu viele gespeicherte Daten');
 return raw;
}
/** On first V724 read, import the existing V723 personal layout without modifying its key. */
export function readDashboardPresetsV724(store:Pick<V723Store,'getItem'>,account:string):V724ReadResult{
 const key=dashboardPresetsKeyV724(account);
 if(!key)return {state:defaultDashboardPresetsV724(),warning:'Kein gültiges Last.fm-Konto für Presets.',migrated:false};
 try{
  const raw=store.getItem(key);
  if(raw!==null){
   if(raw.length>V724_MAX_STORED_LENGTH)return {state:defaultDashboardPresetsV724(),warning:'Gespeicherte Presets sind zu groß. Standardansicht geladen.',migrated:false};
   const parsed=parseDashboardPresetsV724(raw);
   return parsed?{state:parsed,warning:null,migrated:false}:{state:defaultDashboardPresetsV724(),warning:'Gespeicherte Presets sind ungültig. Standardansicht geladen.',migrated:false};
  }
  const legacy=readDashboardLayoutV723(store,account);
  // Only a valid legacy snapshot triggers migration; default still loads normally.
  const migrated=legacy.error===null&&!!store.getItem('sonic-display:lastfm:insights-layout:v723:'+encodeURIComponent(canonicalLastFmUsernameV706(account)));
  return {state:defaultDashboardPresetsV724(migrated?legacy.layout:undefined),warning:legacy.error,migrated};
 }catch{return {state:defaultDashboardPresetsV724(),warning:'Browserspeicher nicht verfügbar. Änderungen bleiben nur in dieser Ansicht.',migrated:false};}
}
export function writeDashboardPresetsV724(store:Pick<V723Store,'setItem'>,account:string,value:V724PresetState):boolean{
 const key=dashboardPresetsKeyV724(account);if(!key)return false;
 try{store.setItem(key,serializeDashboardPresetsV724(value));return true;}catch{return false;}
}
export function activeDashboardPresetV724(value:V724PresetState):V724Preset{
 return value.presets.find(item=>item.id===value.activeId)??value.presets[0]??builtInDashboardPresetV724('personal');
}
export function selectDashboardPresetV724(value:V724PresetState,id:string):V724PresetState{
 return value.presets.some(p=>p.id===id)?{...value,activeId:id}:value;
}
export function updateActiveDashboardLayoutV724(value:V724PresetState,layout:V723Layout):V724PresetState{
 const valid=norm(layout);if(!valid||layout.length!==6)return value;
 return {...value,presets:value.presets.map(p=>p.id===value.activeId?{...p,layout:valid}:p)};
}
export function resetActiveDashboardPresetV724(value:V724PresetState):V724PresetState{
 const current=activeDashboardPresetV724(value);
 // Built-ins reset to their factory layout; custom presets reset to the standard V723 layout.
 const layout=builtinIds.has(current.id)?builtInDashboardPresetV724(current.id as typeof V724_BUILTIN_IDS[number]).layout:defaultDashboardLayoutV723();
 return updateActiveDashboardLayoutV724(value,layout);
}
export function createDashboardPresetV724(value:V724PresetState,name:string):V724PresetState|null{
 if(!validPresetNameV724(name)||value.presets.length>=V724_MAX_PRESETS||value.presets.some(p=>p.name.toLocaleLowerCase('de')===name.toLocaleLowerCase('de')))return null;
 const used=new Set(value.presets.map(p=>p.id));let id='custom-1';for(let n=1;n<=V724_MAX_PRESETS+1;n++){if(!used.has(`custom-${n}`)){id=`custom-${n}`;break;}}
 return {...value,activeId:id,presets:[...value.presets,{id,name,layout:clone(activeDashboardPresetV724(value).layout)}]};
}
export function renameDashboardPresetV724(value:V724PresetState,id:string,name:string):V724PresetState|null{
 if(builtinIds.has(id)||!value.presets.some(p=>p.id===id)||!validPresetNameV724(name)||value.presets.some(p=>p.id!==id&&p.name.toLocaleLowerCase('de')===name.toLocaleLowerCase('de')))return null;
 return {...value,presets:value.presets.map(p=>p.id===id?{...p,name}:p)};
}
export function deleteDashboardPresetV724(value:V724PresetState,id:string):V724PresetState|null{
 if(builtinIds.has(id)||!value.presets.some(p=>p.id===id))return null;
 return {...value,activeId:value.activeId===id?'personal':value.activeId,presets:value.presets.filter(p=>p.id!==id)};
}
export function isBuiltInDashboardPresetV724(id:string):boolean{return builtinIds.has(id);}
