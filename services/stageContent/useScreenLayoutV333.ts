'use client';
import {useEffect,useState} from 'react';
import {readLayoutV333,SCREEN_LAYOUT_EVENT_V333,SCREEN_LAYOUT_KEY_V333} from './layoutV333';
export function useScreenLayoutV333(){
 const [layout,setLayout]=useState(readLayoutV333);
 useEffect(()=>{
  const reload=()=>setLayout(readLayoutV333());
  const storage=(event:StorageEvent)=>{if(event.key===SCREEN_LAYOUT_KEY_V333)reload();};
  reload();window.addEventListener(SCREEN_LAYOUT_EVENT_V333,reload);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(SCREEN_LAYOUT_EVENT_V333,reload);window.removeEventListener('storage',storage);};
 },[]);
 return layout;
}
