'use client';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {useVisualizer} from '@/context/VisualizerContext';
import {useMusic} from '@/context/MusicContext';
import {advanceLiveMoodV678,EMPTY_LIVE_MOOD_V678,type LiveMoodStateV678,type LiveMoodV678} from '@/lib/live-mood-v678';

type LiveMoodContextV678={mood:LiveMoodV678|null;sampleCount:number;measuring:boolean;enabled:boolean;};
const Context=createContext<LiveMoodContextV678>({mood:null,sampleCount:0,measuring:false,enabled:false});
/** This provider explicitly ignores estimated Spotify pulses. No stored audio, raw microphone
 * samples, history or third-party requests. Stops on pause, disconnect, permission loss and off. */
export function LiveMoodProviderV678({children}:{children:ReactNode}){
 const {track,isPlaying,connected}=useMusic();
 const {audio,audioActive,preferences}=useVisualizer();
 const enabled=preferences.liveMoodEnabledV678===true;
 const measuring=enabled&&audioActive&&connected&&isPlaying&&Boolean(track?.id);
 const [state,setState]=useState<LiveMoodStateV678>(EMPTY_LIVE_MOOD_V678);
 useEffect(()=>{
  if(!measuring){setState((previous:LiveMoodStateV678)=>previous.mood||previous.samples.length?{...EMPTY_LIVE_MOOD_V678}:previous);return;}
  setState((previous:LiveMoodStateV678)=>advanceLiveMoodV678(previous,track?.id??'',Date.now(),{
   volume:audio.volume??0,energyEnvelope:audio.energyEnvelope??0,bass:audio.bass??0,
   highs:audio.highs??0,beatStrength:audio.beatStrength??0,attack:audio.attack??0,
  },true));
 },[measuring,track?.id,audio]);
 // Do not expose a previous track's classification on the first render after a song switch.
 const sameTrack=state.trackId===track?.id;
 const value=useMemo(()=>({mood:measuring&&sameTrack?state.mood:null,
  sampleCount:measuring&&sameTrack?state.samples.length:0,measuring,enabled}),
  [state.mood,state.samples.length,sameTrack,measuring,enabled]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLiveMoodV678(){return useContext(Context);}
