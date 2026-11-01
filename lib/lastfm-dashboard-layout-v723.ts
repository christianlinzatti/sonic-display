/** V723 – Account-scoped, versioned dashboard configuration. No history writes. */
import {canonicalLastFmUsernameV706,validLastFmUsernameV706} from './lastfm-history-v706';

export const V723_LAYOUT_PREFIX='sonic-display:lastfm:insights-layout:v723:';
export const V723_LAYOUT_VERSION=1;
export const V723_WIDGET_IDS=['metrics','shortcuts','records','activity','trends','discoveries'] as const;
export type V723WidgetId=typeof V723_WIDGET_IDS[number];
export type V723WidgetSize='half'|'full';
export type V723Widget={id:V723WidgetId;enabled:boolean;size:V723WidgetSize};
export type V723Layout=V723Widget[];
export type V723Store={getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void};
export const V723_WIDGET_TITLES:Record<V723WidgetId,string>={
 metrics:'Archivkennzahlen',shortcuts:'Schnellzugriffe',records:'Hörrekorde',activity:'Monatsübersicht',
 trends:'Künstlerentwicklungen',discoveries:'Neue Künstler im Archiv'
};
export function defaultDashboardLayoutV723():V723Layout{return [
 {id:'metrics',enabled:true,size:'full'},
 {id:'shortcuts',enabled:true,size:'full'},
 {id:'records',enabled:true,size:'half'},
 {id:'activity',enabled:true,size:'half'},
 {id:'trends',enabled:true,size:'half'},
 {id:'discoveries',enabled:true,size:'half'}
];}
export function dashboardLayoutKeyV723(account:string):string|null{
 if(!validLastFmUsernameV706(account))return null;
 return V723_LAYOUT_PREFIX+encodeURIComponent(canonicalLastFmUsernameV706(account));
}
/** Treat all parsed values as untrusted. Unsupported versions reset safely; omitted widgets are appended. */
export function parseDashboardLayoutV723(raw:unknown):V723Layout|null{
 try{
  const value=typeof raw==='string'?JSON.parse(raw):raw;
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  if(value.version!==V723_LAYOUT_VERSION||!Array.isArray(value.widgets)||value.widgets.length===0||value.widgets.length>V723_WIDGET_IDS.length)return null;
  const defaults=defaultDashboardLayoutV723(),seen=new Set<string>(),result:V723Layout=[];
  for(const w of value.widgets){
   if(!w||typeof w!=='object'||Array.isArray(w)||typeof w.id!=='string'||!V723_WIDGET_IDS.some(x=>x===w.id)||seen.has(w.id)||typeof w.enabled!=='boolean'||(w.size!=='half'&&w.size!=='full'))return null;
   seen.add(w.id);result.push({id:w.id as V723WidgetId,enabled:w.enabled,size:w.size});
  }
  for(const entry of defaults)if(!seen.has(entry.id))result.push(entry);
  if(result.length===0||!result.some(w=>w.enabled))return null;
  return result;
 }catch{return null;}
}
export function serializeDashboardLayoutV723(layout:readonly V723Widget[]):string{
 const normalized=parseDashboardLayoutV723({version:V723_LAYOUT_VERSION,widgets:layout});
 if(!normalized)throw new Error('Ungültiges Dashboard-Layout');
 return JSON.stringify({version:V723_LAYOUT_VERSION,widgets:normalized});
}
export function readDashboardLayoutV723(store:Pick<V723Store,'getItem'>,account:string):{layout:V723Layout;error:string|null}{
 const key=dashboardLayoutKeyV723(account);
 if(!key)return {layout:defaultDashboardLayoutV723(),error:'Kein gültiges Last.fm-Konto für die Layoutspeicherung.'};
 try{
  const raw=store.getItem(key);
  if(raw===null)return {layout:defaultDashboardLayoutV723(),error:null};
  if(raw.length>16000)return {layout:defaultDashboardLayoutV723(),error:'Gespeichertes Layout ist zu groß. Standardansicht geladen.'};
  const parsed=parseDashboardLayoutV723(raw);
  return parsed?{layout:parsed,error:null}:{layout:defaultDashboardLayoutV723(),error:'Gespeichertes Layout ist ungültig. Standardansicht geladen.'};
 }catch{return {layout:defaultDashboardLayoutV723(),error:'Browserspeicher nicht verfügbar. Änderungen bleiben nur in dieser Ansicht.'};}
}
export function moveDashboardWidgetV723(layout:readonly V723Widget[],id:V723WidgetId,direction:-1|1):V723Layout{
 const next=layout.map(w=>({...w})),from=next.findIndex(w=>w.id===id),to=from+direction;
 if(from<0||to<0||to>=next.length)return next;
 [next[from],next[to]]=[next[to],next[from]];return next;
}
export function reorderDashboardWidgetV723(layout:readonly V723Widget[],fromId:V723WidgetId,toId:V723WidgetId):V723Layout{
 const next=layout.map(w=>({...w})),from=next.findIndex(w=>w.id===fromId),to=next.findIndex(w=>w.id===toId);
 if(from<0||to<0||from===to)return next;
 const [moving]=next.splice(from,1);next.splice(to,0,moving);return next;
}
export function resizeDashboardWidgetV723(layout:readonly V723Widget[],id:V723WidgetId):V723Layout{
 return layout.map(w=>w.id===id?{...w,size:w.size==='half'?'full':'half'}:{...w});
}
export function toggleDashboardWidgetV723(layout:readonly V723Widget[],id:V723WidgetId):V723Layout{
 if(layout.find(w=>w.id===id)?.enabled&&layout.filter(w=>w.enabled).length<=1)return layout.map(w=>({...w}));
 return layout.map(w=>w.id===id?{...w,enabled:!w.enabled}:{...w});
}
export function writeDashboardLayoutV723(store:Pick<V723Store,'setItem'>,account:string,layout:readonly V723Widget[]):boolean{
 const key=dashboardLayoutKeyV723(account);if(!key)return false;
 try{store.setItem(key,serializeDashboardLayoutV723(layout));return true;}catch{return false;}
}
export function clearDashboardLayoutV723(store:Pick<V723Store,'removeItem'>,account:string):boolean{
 const key=dashboardLayoutKeyV723(account);if(!key)return false;
 try{store.removeItem(key);return true;}catch{return false;}
}
