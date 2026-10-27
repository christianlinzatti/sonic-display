'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import type {StageEnvironmentId} from './stages';
import type {DuetPreviewModelV563} from './realDuetPreviewV563';
import type {ConcertDetailSettingsV555} from './concertDetailEffectsV555';
const StagePreviewModal=dynamic(()=>import('./StagePreviewModal').then(m=>m.StagePreviewModal),{ssr:false});

export function ConcertDetailPreviewLauncherV556({stageId,onSelect,reactive,lightStrength,reducedMotion,concertDetails,avatarModelUrl,duetModelsV563}:{
  stageId:StageEnvironmentId;onSelect:(id:StageEnvironmentId)=>void;reactive:boolean;
  lightStrength:number;reducedMotion:boolean;concertDetails:ConcertDetailSettingsV555;avatarModelUrl?:string|null;duetModelsV563?:readonly DuetPreviewModelV563[];
}){
  const [open,setOpen]=useState(false);
  return <>
    <button type="button" data-v571-preview-open="true" onClick={()=>setOpen(true)} aria-label="3D-Bühneneffekte und echte GLB-Lip-Sync-Nahaufnahme vergleichen">
      3D-Effekte & Rap-GLB-Bewegungen ansehen · V564
    </button>
    {open&&<StagePreviewModal stageId={stageId} selectedStageId={stageId} onSelect={onSelect}
      onClose={()=>setOpen(false)} reactive={reactive} lightStrength={lightStrength}
      reducedMotion={reducedMotion} concertDetailsV555={concertDetails} avatarModelUrl={avatarModelUrl} duetModelsV563={duetModelsV563}/>}
  </>;
}
