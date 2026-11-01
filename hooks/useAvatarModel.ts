"use client";
import {useEffect,useState} from 'react';
import {getAvatarModel,type AvatarModel} from '@/components/visualizer/avatarModels';
import {loadAvatarCatalogV733,subscribeAvatarCatalogV733} from '@/services/avatarCatalogV733';
export function useAvatarModel(id:string):AvatarModel{
 const [remote,setRemote]=useState<AvatarModel|null>(null);
 useEffect(()=>{let active=true,version=0;const load=()=>{const attempt=++version;void loadAvatarCatalogV733().then(models=>{if(active&&attempt===version)setRemote(models.find(m=>m.id===id)??null);}).catch(()=>{});};setRemote(null);const unsubscribe=subscribeAvatarCatalogV733(load);load();return()=>{active=false;unsubscribe();};},[id]);
 return remote?.id===id?remote:getAvatarModel(id);
}
