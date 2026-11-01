import type {LastFmEventV706} from './lastfm-history-v706';

import {explorerEventsV729,explorerKeyV729,buildExplorerProfileV729,type ExplorerSelectionV729} from './lastfm-explorer-v729';

import {parseFavoritesV730,selectionKeyV730} from './lastfm-explorer-v730';

export function albumsV731(events:readonly LastFmEventV706[]){

 const groups=new Map<string,{key:string;artist:string;album:string;events:LastFmEventV706[]}>();

 for(const e of explorerEventsV729(events)){

  if(!e.album?.trim()||explorerKeyV729(e.album)==='album unbekannt')continue;

  const key=JSON.stringify([explorerKeyV729(e.artist),explorerKeyV729(e.album)]);

  const group=groups.get(key)??{key,artist:e.artist,album:e.album,events:[]};group.events.push(e);groups.set(key,group);

 }

 return [...groups.values()].sort((a,b)=>b.events.length-a.events.length||a.key.localeCompare(b.key));

}

export function albumProfileV731(album:ReturnType<typeof albumsV731>[number]){return buildExplorerProfileV729(album.events,{artist:album.artist});}

export function rediscoverV731(events:readonly LastFmEventV706[],kind:'artist'|'song',days:number,minPlays:number,now=new Date()){

 if(!Number.isInteger(days)||days<1||days>36500||!Number.isInteger(minPlays)||minPlays<1||minPlays>1000000)throw Error('Ungueltige Filterwerte.');

 const groups=new Map<string,{selection:ExplorerSelectionV729;plays:number;last:string}>();

 for(const e of explorerEventsV729(events,now)){const selection={artist:e.artist,...(kind==='song'?{title:e.title}:{})},key=selectionKeyV730(selection);const group=groups.get(key)??{selection,plays:0,last:e.playedAt};group.plays++;group.last=e.playedAt;groups.set(key,group);}

 const day=(d:Date)=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;

 return [...groups.values()].map(g=>({...g,gapDays:day(now)-day(new Date(g.last))})).filter(g=>g.plays>=minPlays&&g.gapDays>=days).sort((a,b)=>b.gapDays-a.gapDays||b.plays-a.plays||selectionKeyV730(a.selection).localeCompare(selectionKeyV730(b.selection)));

}

export function exportFavoritesV731(favorites:readonly ExplorerSelectionV729[]){return JSON.stringify({format:'sonic-favorites-v731',version:1,favorites:parseFavoritesV730(JSON.stringify(favorites))},null,2);}

export function importFavoritesV731(raw:string,current:readonly ExplorerSelectionV729[]){

 if(raw.length>200000)throw Error('Backup zu gross.');

 let value;try{value=JSON.parse(raw);}catch{throw Error('Backup ist kein gültiges JSON.');}if(!value||value.format!=='sonic-favorites-v731'||value.version!==1)throw Error('Unbekanntes Backupformat.');

 const incoming=parseFavoritesV730(JSON.stringify(value.favorites));

 const result=parseFavoritesV730(JSON.stringify(current));const keys=new Set(result.map(selectionKeyV730));

 for(const s of incoming){const key=selectionKeyV730(s);if(!keys.has(key)){keys.add(key);result.push(s);}}

 if(result.length>100)throw Error('Zusammen mehr als 100 Favoriten.');return result;

}

