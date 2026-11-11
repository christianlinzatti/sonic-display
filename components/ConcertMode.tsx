'use client';
import {useEffect,useRef,useState} from 'react';
import {readConcertSession,saveConcertSession,restoreConcertCrew,type ConcertPreferences,type ConcertSession} from '@/lib/concertSession';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {UiPreferences} from '@/types/music';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {readGroupV326,writeGroupV326,layoutV326} from './visualizer/multiAvatarStageDirectorV326';
import {CREW_IDS} from './visualizer/sonicCrewDirector';
import {setConcertPresentation,useConcertPresentation} from './concertPresentation';
export function ConcertMode(){
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
  saved.current=null;saveConcertSession(null);setConcertPresentation(false);
 };
 const latestExit=useRef(exit);latestExit.current=exit;
 useEffect(()=>{
  if(!active)return;
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();latestExit.current();}};
  window.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);};
 },[active]);
 const enter=()=>{
  const group=readGroupV326();
  const owned:ConcertPreferences={visualizerMode:'avatar',lyricsVisible:true,lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',avatarModelId:CREW_IDS.some(id=>id===preferences.avatarModelId)?preferences.avatarModelId:'sonic-neon-pulse'};
  const before:Partial<UiPreferences>={};for(const key of Object.keys(owned) as (keyof ConcertPreferences)[])(before as Record<string,unknown>)[key]=preferences[key];
  saved.current={version:1,preferences:before as ConcertPreferences,owned,crew:{enabled:crew.enabled,mode:crew.mode,poseAware:crew.poseAware,stagecraft:crew.stagecraft},group};
  if(!group.songSync&&!group.trackId){const count=group.enabled?group.count:3;const next=writeGroupV326({...group,enabled:true,count,modelIds:group.enabled?group.modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-chrome-beat',''],cues:[{id:'concert-auto',at:0,formation:'wide',focus:-1,drop:false,transition:1,positions:layoutV326('wide',count)}]});saved.current.ownedGroup=next;}
  saveConcertSession(saved.current);updatePreferences(owned);writeCrewSettings({...crew,enabled:true,mode:'adaptive',poseAware:true,stagecraft:true});setConcertPresentation(true);
 };
 return <button type="button" className="concert-mode-toggle" aria-pressed={active} onClick={active?exit:enter}>{active?'Konzertmodus verlassen':'Konzertmodus starten'}</button>;
}
