"use client";
import { useEffect,useState } from "react";
import { getAvatarModel } from "@/components/visualizer/avatarModels";
import type { AvatarModel } from "@/components/visualizer/avatarModels";
export function useAvatarModel(id:string):AvatarModel {const [remote,setRemote]=useState<AvatarModel|null>(null);useEffect(()=>{let active=true;setRemote(null);if(!id.startsWith("local:"))return;fetch("/api/avatars",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(active)setRemote((data?.models||[]).find((m:AvatarModel)=>m.id===id)||null);}).catch(()=>{});return()=>{active=false;};},[id]);return remote?.id===id?remote:getAvatarModel(id);}
