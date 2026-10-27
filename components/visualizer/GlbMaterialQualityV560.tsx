"use client";
import {useEffect} from 'react';
import {useAdaptivePerformance} from './adaptivePerformance';
import type {PortraitMaterialSessionV560} from './applyGlbPortraitMaterialsV560';

/** Small subscriber isolates tier-driven material changes from the heavy GLB
 * animation/choreography component. No own render loop or GPU allocations.
 */
export function GlbMaterialQualityV560({session,enabled,strength}:{
  session:PortraitMaterialSessionV560;enabled:boolean;strength:number;
}){
  const {tier}=useAdaptivePerformance();
  useEffect(()=>{session.apply(enabled,strength,tier==='low');},[session,enabled,strength,tier]);
  return null;
}
