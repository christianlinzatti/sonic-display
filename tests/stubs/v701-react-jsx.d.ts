/** V701 isolated test-only JSX declarations. Never loaded by production tsconfig. */
declare module 'react' {
 export type ReactNode=any;
 export function useState<T>(initial:T|(()=>T)):[T,(next:T|((previous:T)=>T))=>void];
 export function useMemo<T>(cb:()=>T,deps:readonly unknown[]):T;
 export function useRef<T>(initial:T):{current:T};
 export function useEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
}
declare namespace JSX {interface IntrinsicElements {[tag:string]:{[property:string]:any;children?:any}}}
