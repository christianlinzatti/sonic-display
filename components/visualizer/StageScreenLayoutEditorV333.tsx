'use client';
import {useEffect,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import {DEFAULT_SCREEN_LAYOUT_V333,readLayoutV333,saveLayoutV333,SCREEN_LAYOUT_EVENT_V333,type ScreenLayoutV333,type ContentScreenV333,type ScreenSourceV333,type PushPolicyV333} from '@/services/stageContent/layoutV333';
const sources:{value:ScreenSourceV333;label:string}[]=[
 {value:'rotation',label:'Alle aktiven Quellen'}, {value:'canvas',label:'Spotify Canvas'},
 {value:'cover',label:'Albumcover'},{value:'text',label:'API-Text'},
 {value:'photos',label:'Künstlerfotos'},{value:'concerts',label:'Konzerte'}
];
const pushOptions:{value:PushPolicyV333;label:string}[]=[
 {value:'immediate',label:'Sofort einblenden'}, {value:'next',label:'Beim nächsten Wechsel'},
 {value:'off',label:'Nicht auf dieser Fläche'}
];
const fixed=(v:number)=>Math.round(v*10)/10;
export function StageScreenLayoutEditorV333(){
 const [layout,setLayout]=useState(readLayoutV333);
 const [active,setActive]=useState('main');
 const pointer=useRef<{id:string;rect:DOMRect}|null>(null);
 useEffect(()=>{const refresh=()=>setLayout(readLayoutV333());window.addEventListener(SCREEN_LAYOUT_EVENT_V333,refresh);return()=>window.removeEventListener(SCREEN_LAYOUT_EVENT_V333,refresh);},[]);
 const commit=(value:ScreenLayoutV333)=>setLayout(saveLayoutV333(value));
 const modify=(id:string,patch:Partial<ContentScreenV333>)=>commit({...layout,screens:layout.screens.map(s=>s.id===id?{...s,...patch}:s)});
 const selected=layout.screens.find(s=>s.id===active)??layout.screens[0];
 const add=()=>{
  if(layout.screens.length>=5)return;
  const id=`custom-${Date.now().toString(36)}`;
  commit({...layout,screens:[...layout.screens,{id,label:`Leinwand ${layout.screens.length+1}`,enabled:true,source:'rotation',x:0,y:1,z:-3,scale:.65,yaw:0,push:'off'}]});
  setActive(id);
 };
 const move=(event:PointerEvent<HTMLElement>)=>{
  const drag=pointer.current;if(!drag)return;
  const x=((event.clientX-drag.rect.left)/drag.rect.width-.5)*12;
  const y=(1-(event.clientY-drag.rect.top)/drag.rect.height)*4-.4;
  modify(drag.id,{x:fixed(Math.max(-6,Math.min(6,x))),y:fixed(Math.max(-.4,Math.min(3.6,y)))});
 };
 return <fieldset className="stage-content-config-v330" style={{marginTop:16}}>
  <legend>V333 – Visual Stage Content Composer</legend>
  <p>Bis zu fünf Leinwände einzeln konfigurieren. Den markierten Bildschirm in der Bühnenübersicht mit Maus oder Touch verschieben; die genaue Tiefe und Drehung unten einstellen.</p>
  <label className="setting-check"><input type="checkbox" checked={layout.enabled} onChange={e=>commit({...layout,enabled:e.target.checked})}/> <strong>Mehrfach-Leinwand-Layout aktivieren</strong></label>
  <div onPointerMove={move} onPointerUp={()=>pointer.current=null} onPointerCancel={()=>pointer.current=null}
   style={{position:'relative',width:'100%',maxWidth:560,aspectRatio:'12 / 5',touchAction:'none',border:'1px solid #546579',borderRadius:10,
   background:'linear-gradient(180deg,#111e32,#1e3049)',overflow:'hidden'}} aria-label="Bühnenübersicht für Leinwandpositionen">
   <div style={{position:'absolute',bottom:7,left:'38%',width:'24%',textAlign:'center',opacity:.55,fontSize:12}}>AVATARE</div>
   {layout.screens.map(screen=><button type="button" key={screen.id} aria-label={`${screen.label} auswählen und verschieben`}
      onPointerDown={e=>{e.stopPropagation();setActive(screen.id);pointer.current={id:screen.id,rect:e.currentTarget.parentElement!.getBoundingClientRect()};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{if(pointer.current?.id===screen.id)move(e);}}
      onPointerUp={()=>pointer.current=null}
      onClick={()=>setActive(screen.id)}
      style={{position:'absolute',left:`${(screen.x+6)/12*100}%`,top:`${(1-(screen.y+.4)/4)*100}%`,transform:'translate(-50%,-50%)',
       width:Math.max(40,screen.scale*86),height:Math.max(26,screen.scale*50),fontSize:11,overflow:'hidden',
       border:active===screen.id?'2px solid #5eead4':'1px solid #8aa2b4',borderRadius:5,
       background:screen.enabled?'#2e536a':'#30333d',color:'#fff',cursor:'grab',opacity:screen.enabled?1:.6}}
     >{screen.label}</button>)}
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:9}}>
   {layout.screens.map(s=><button type="button" key={s.id} aria-pressed={active===s.id} onClick={()=>setActive(s.id)}>{s.label}</button>)}
   <button type="button" onClick={add} disabled={layout.screens.length>=5}>+ Leinwand</button>
  </div>
  {selected&&<fieldset style={{marginTop:12}}><legend>{selected.label} · Einstellungen</legend>
   <label className="setting-check"><input type="checkbox" checked={selected.enabled} onChange={e=>modify(selected.id,{enabled:e.target.checked})}/> Leinwand eingeschaltet</label>
   <label>Name<input type="text" maxLength={45} value={selected.label} onChange={e=>modify(selected.id,{label:e.target.value})}/></label>
   <label>Inhaltsquelle<select value={selected.source} onChange={e=>modify(selected.id,{source:e.target.value as ScreenSourceV333})}>{sources.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
   <label>Push-Nachricht<select value={selected.push} onChange={e=>modify(selected.id,{push:e.target.value as PushPolicyV333})}>{pushOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
   {([['x','Horizontal',-6,6,.1],['y','Höhe',-.4,3.6,.1],['z','Tiefe',-7,-.6,.1],['scale','Größe',.25,1.8,.05],['yaw','Drehung',-.8,.8,.05]] as const).map(([field,label,min,max,step])=><label key={field}>{label} ({selected[field].toFixed(2)})<input type="range" min={min} max={max} step={step} value={selected[field]} onChange={e=>modify(selected.id,{[field]:Number(e.target.value)})}/></label>)}
   <button type="button" disabled={layout.screens.length===1} onClick={()=>{commit({...layout,screens:layout.screens.filter(s=>s.id!==selected.id)});setActive(layout.screens.find(s=>s.id!==selected.id)?.id??'');}}>Leinwand entfernen</button>
  </fieldset>}
  <button type="button" style={{marginTop:10}} onClick={()=>{commit({...DEFAULT_SCREEN_LAYOUT_V333,screens:DEFAULT_SCREEN_LAYOUT_V333.screens.map(s=>({...s}))});setActive('main');}}>Standardlayout wiederherstellen</button>
  <small>Die Bildschirmpositionen werden lokal gespeichert. API-Quellen werden weiterhin oben in den Stage Content Plugins konfiguriert. Bei deaktiviertem Layout bleibt die einzelne V330-Leinwand erhalten.</small>
 </fieldset>;
}
