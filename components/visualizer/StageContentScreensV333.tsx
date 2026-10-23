'use client';
import type {GenreVisualCueV352} from "@/services/stageContent/genreVisualDirectorV352";
import type {VisualFxCueV353} from "@/services/stageContent/visualEffectsStudioV353";
import {useEffect,useRef,useState} from 'react';
import type {ContentScreenV333} from '@/services/stageContent/layoutV333';
import {pickScreenSlideV333} from '@/services/stageContent/layoutV333';
import type {StageContentV330,StageContentSettingsV330} from '@/services/stageContent/stageContentV330';
import {composeStagePanelsV351,type SmartStageCueV351} from '@/services/stageContent/smartStageCompositionV351';
import {StageContentScreenV330} from './StageContentScreenV330';
import {useSchedulerV334} from "@/services/stageContent/useSchedulerV334";
import {chooseScheduledV334,type SectionV334} from "@/services/stageContent/schedulerV334";
export function StageContentScreensV333({screens,slides,push,index,settings,playing,reducedMotion,albumCoverUrl,section,beatAccent,genre,lyricsActive=false,lyricsSide=null,composition,genreCue,fxCue}:{
 screens:ContentScreenV333[];slides:StageContentV330[];push:StageContentV330|null;index:number;
 settings:StageContentSettingsV330;playing:boolean;reducedMotion:boolean;albumCoverUrl:string|null;section?:string;beatAccent?:number;genre?:string;lyricsActive?:boolean;lyricsSide?:'left'|'right'|null;composition?:SmartStageCueV351;genreCue?:GenreVisualCueV352;fxCue?:VisualFxCueV353;
}){
 const [rotationSerial,setRotationSerial]=useState(0);
 const scheduler=useSchedulerV334();
 const [seconds,setSeconds]=useState(0);
 useEffect(()=>{const start=Date.now();const timer=window.setInterval(()=>setSeconds(Math.floor((Date.now()-start)/1000)),1000);return()=>window.clearInterval(timer);},[]);
 const pushSerial=useRef(Number.POSITIVE_INFINITY);
 const lastPush=useRef<StageContentV330|null>(null);
 // A deferred notification waits for the *next* rotation step, not the current slide.
 if(push!==lastPush.current){lastPush.current=push;pushSerial.current=push?rotationSerial:Number.POSITIVE_INFINITY;}
 useEffect(()=>{
  // Advance the deferred-push opportunity even with only one normal slide.
  const timer=window.setInterval(()=>setRotationSerial(v=>v+1),Math.max(5,settings.rotationSeconds)*1000);
  return()=>window.clearInterval(timer);
 },[settings.rotationSeconds]);
 const composedScreens=composition?composeStagePanelsV351(screens,composition):screens;
 return <>{composedScreens.filter(s=>s.enabled).map(screen=><StageContentScreenV330 key={screen.id}
  screen={screen} content={(() => {
  const immediate=push&&push.kind==='text'&&(screen.push==='immediate'||(screen.push==='next'&&rotationSerial>pushSerial.current));
  if(immediate)return push;
  if(scheduler.enabled)return chooseScheduledV334(screen,slides,scheduler,(section==='hook'||section==='drop'||section==='build'||section==='break'?section:'verse'),seconds);
  return pickScreenSlideV333(screen,slides,index,push,rotationSerial,pushSerial.current);
 })()} settings={settings}
  playing={playing} reducedMotion={reducedMotion} albumCoverUrl={albumCoverUrl} section={section} beatAccent={beatAccent} genre={genre} lyricsActive={lyricsActive} lyricsSide={lyricsSide} composition={composition} genreCue={genreCue} fxCue={fxCue}/>)}</>;
}
