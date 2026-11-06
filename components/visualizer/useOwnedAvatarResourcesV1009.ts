'use client';
import {useEffect,useMemo} from 'react';
import type {Object3D} from 'three';
import {ownAvatarResourcesV1009} from './ownedAvatarResourcesV1009';
export function useOwnedAvatarResourcesV1009(model:Object3D){
 const owned=useMemo(()=>ownAvatarResourcesV1009(model),[model]);
 useEffect(()=>()=>owned.dispose(),[owned]);
}
