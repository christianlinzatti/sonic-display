'use client';
import {useEffect,useRef} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {UiPreferences} from '@/types/music';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {readGroupV326,writeGroupV326,layoutV326,type GroupStudioV326} from './visualizer/multiAvatarStageDirectorV326';
import {CREW_IDS,type CrewSettings} from './visualizer/sonicCrewDirector';
import {setConcertPresentation,useConcertPresentation} from './concertPresentation';
export function ConcertMode(){
 const active=useConcertPresentation(),{preferences,updatePreferences}=useUiPreferences(),crew=useCrewSettings();
 const saved=useRef<{preferences:Partial<UiPreferences>;owned:Partial<UiPreferences>;crew:CrewSettings;group:GroupStudioV326;ownedGroup?:GroupStudioV326}|null>(null);
 const exit=()=>{
  const previous=saved.current;
  if(previous){
   const restore:Record<string,unknown>={};for(const key of Object.keys(previous.owned) as (keyof UiPreferences)[])if(preferences[key]===previous.owned[key])restore[key]=previous.preferences[key];
   updatePreferences(restore as Partial<UiPreferences>);
   writeCrewSettings({...crew,enabled:previous.crew.enabled,mode:previous.crew.mode,poseAware:previous.crew.poseAware,stagecraft:previous.crew.stagecraft});
   if(previous.ownedGroup&&JSON.stringify(readGroupV326())===JSON.stringify(previous.ownedGroup))writeGroupV326(previous.group);
  }
  saved.current=null;setConcertPresentation(false);
 };
 useEffect(()=>{
  if(!active)return;
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();exit();}};
  window.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);};
 });
 const enter=()=>{
  const group=readGroupV326();
  const owned:Partial<UiPreferences>={visualizerMode:'avatar',lyricsVisible:true,lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',avatarModelId:CREW_IDS.some(id=>id===preferences.avatarModelId)?preferences.avatarModelId:'sonic-neon-pulse'};
  const before:Partial<UiPreferences>={};for(const key of Object.keys(owned) as (keyof UiPreferences)[])(before as Record<string,unknown>)[key]=preferences[key];
  saved.current={preferences:before,owned,crew,group};
  if(!group.songSync&&!group.trackId){const count=group.enabled?group.count:3;const next=writeGroupV326({...group,enabled:true,count,modelIds:group.enabled?group.modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-chrome-beat',''],cues:[{id:'concert-auto',at:0,formation:'wide',focus:-1,drop:false,transition:1,positions:layoutV326('wide',count)}]});saved.current.ownedGroup=next;}
  updatePreferences(owned);writeCrewSettings({...crew,enabled:true,mode:'adaptive',poseAware:true,stagecraft:true});setConcertPresentation(true);
 };
 return <button type="button" className="concert-mode-toggle" aria-pressed={active} onClick={active?exit:enter}>{active?'Konzertmodus verlassen':'Konzertmodus starten'}</button>;
}
