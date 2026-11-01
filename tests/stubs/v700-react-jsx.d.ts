/** Test-only declarations. Never include in the application tsconfig. */
declare module 'react' {
 export function useState<T>(initial:T|(()=>T)):[T,(next:T|((previous:T)=>T))=>void];
 export function useMemo<T>(fn:()=>T,deps:readonly unknown[]):T;
}
declare namespace JSX {interface IntrinsicElements {[name:string]:{[attribute:string]:any;children?:any}}}
