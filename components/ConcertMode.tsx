'use client';
import {useMusic} from '@/context/MusicContext';
import {ConcertSceneryControls} from './ConcertSceneryControls';
import {useEffect,useRef,useState} from 'react';
import {readConcertSession,saveConcertSession,restoreConcertCrew,type ConcertPreferences,type ConcertSession} from '@/lib/concertSession';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {UiPreferences} from '@/types/music';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {readGroupV326,writeGroupV326,layoutV326} from './visualizer/multiAvatarStageDirectorV326';
import {CREW_IDS} from './visualizer/sonicCrewDirector';
import {setConcertPresentation,useConcertPresentation} from './concertPresentation';
export function ConcertMode(){
 const [options,setOptions]=useState(false),optionsButton=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const {track}=useMusic();
 const active=useConcertPresentation(),{preferences,updatePreferences}=useUiPreferences(),crew=useCrewSettings();
 const [saved]=useState<{current:ConcertSession|null}>(()=>({current:readConcertSession()}));
 const exit=()=>{
  const previous=saved.current;
  if(previous){
   const restore:Record<string,unknown>={};for(const key of Object.keys(previous.owned) as (keyof ConcertPreferences)[])if(preferences[key]===previous.owned[key])restore[key]=previous.preferences[key];
   updatePreferences(restore as Partial<UiPreferences>);
   writeCrewSettings(restoreConcertCrew(crew,previous.crew));
   if(previous.ownedGroup&&JSON.stringify(readGroupV326())===JSON.stringify(previous.ownedGroup))writeGroupV326(previous.group);
  }
  setOptions(false);saved.current=null;saveConcertSession(null);setConcertPresentation(false);
 };
 const latestExit=useRef(exit);latestExit.current=exit;
 useEffect(()=>{
  if(!active)return;
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();if(options){setOptions(false);optionsButton.current?.focus();}else latestExit.current();}};
  window.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);};
 },[active,options]);
 useEffect(()=>{if(options)panel.current?.querySelector<HTMLInputElement>('input')?.focus();},[options]);
 useEffect(()=>{if(active&&crew.scenery===undefined&&crew.enabled&&crew.mode==='adaptive')writeCrewSettings({...crew,scenery:true});},[active,crew]);
 const enter=()=>{
  const group=readGroupV326();
  const owned:ConcertPreferences={visualizerMode:'avatar',lyricsVisible:true,lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',avatarModelId:CREW_IDS.some(id=>id===preferences.avatarModelId)?preferences.avatarModelId:'sonic-neon-pulse'};
  const before:Partial<UiPreferences>={};for(const key of Object.keys(owned) as (keyof ConcertPreferences)[])(before as Record<string,unknown>)[key]=preferences[key];
  saved.current={version:1,preferences:before as ConcertPreferences,owned,crew:{enabled:crew.enabled,mode:crew.mode,poseAware:crew.poseAware,stagecraft:crew.stagecraft,showPlans:crew.showPlans,scenery:crew.scenery},group};
  if(!group.songSync&&!group.trackId){const count=group.enabled?group.count:3;const next=writeGroupV326({...group,enabled:true,count,modelIds:group.enabled?group.modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-chrome-beat',''],cues:[{id:'concert-auto',at:0,formation:'wide',focus:-1,drop:false,transition:1,positions:layoutV326('wide',count)}]});saved.current.ownedGroup=next;}
  saveConcertSession(saved.current);updatePreferences(owned);writeCrewSettings({...crew,enabled:true,mode:'adaptive',poseAware:true,stagecraft:true,showPlans:crew.showPlans!==false,scenery:crew.scenery!==false});setConcertPresentation(true);
 };
 if(!active)return <button type="button" className="concert-mode-toggle" aria-pressed={false} onClick={enter}>Konzertmodus starten</button>;
 return <div className="concert-toolbar">
  <div className="concert-toolbar-buttons"><button type="button" className="concert-mode-toggle" aria-pressed={true} onClick={exit}>Konzertmodus verlassen</button><button type="button" ref={optionsButton} aria-expanded={options} aria-controls="concert-show-options" onClick={()=>setOptions(value=>!value)}>Show steuern</button></div>
  {track&&<div className="concert-track-title" aria-label="Aktueller Titel">{track.title}<span> · {track.artist}</span></div>}
  {options&&<div ref={panel} id="concert-show-options" role="dialog" aria-modal="false" aria-label="Konzertshow steuern"><ConcertSceneryControls/><p>Escape schließt die Steuerung. Ein weiteres Escape beendet den Konzertmodus.</p></div>}
 </div>;
}
