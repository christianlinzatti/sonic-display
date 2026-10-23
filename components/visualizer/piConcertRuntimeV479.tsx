'use client';
import {useSyncExternalStore} from 'react';
import {advancePiConcertBudgetV479,initialPiConcertBudgetV479,
 type PiConcertBudgetV479,type PiConcertSampleV479} from '@/services/monitoring/piConcertBudgetV479';
import type {PiHints,PiProfile} from './piDeviceProfile';
import {detectPiHints} from './piDeviceProfile';
import {getRenderMetricsSnapshot} from './renderDiagnostics';
import {recordConcertDiagnosticsV480} from './concertDiagnosticsRuntimeV480';

const defaults=initialPiConcertBudgetV479('off',detectPiHints(''));
let budget:PiConcertBudgetV479=defaults;
let visibleBudget:PiConcertBudgetV479=defaults;
const subscribers=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{subscribers.add(fn);return()=>{subscribers.delete(fn);};};
function publish(next:PiConcertBudgetV479){
 // Rendering components rerender only on actual effects-level changes,
 // not every one-second sample or status counter update.
 const visibleChanged=budget.enabled!==next.enabled||budget.level!==next.level||budget.profile!==next.profile;
 budget=next;
 if(visibleChanged){visibleBudget=next;for(const fn of subscribers)fn();}
}
export function configurePiConcertV479(profile:PiProfile,hints:PiHints){
 if(profile===budget.profile&&budget.enabled===initialPiConcertBudgetV479(profile,hints).enabled)return;
 publish(initialPiConcertBudgetV479(profile,hints));
}
export function samplePiConcertV479(sample:PiConcertSampleV479){
 const before=budget;
 const after=advancePiConcertBudgetV479(before,sample);
 publish(after);
 // V480 piggybacks on this existing measured sample; invalid/paused/hidden
 // windows are ignored by the bounded session-only diagnostics store.
 recordConcertDiagnosticsV480({sample,render:getRenderMetricsSnapshot(),before,after});
}
export function usePiConcertBudgetV479(){return useSyncExternalStore(subscribe,()=>visibleBudget,()=>defaults);}
export function readPiConcertBudgetV479(){return budget;}
