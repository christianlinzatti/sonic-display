/** Test-only React/JSX declarations for isolated V881 UI type checking.
 * Never load these in the production tsconfig. */
declare module 'react' {
 export type CSSProperties={ [property:string]:string|number|undefined };
 export function useState<T>(initial:T|(()=>T)):[T,(next:T|((previous:T)=>T))=>void];
 export function useMemo<T>(cb:()=>T,deps:readonly unknown[]):T;
 export function useRef<T>(initial:T):{current:T};
 export function useRef<T>(initial:T|null):{current:T|null};
 export function useEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
 export function useCallback<T extends (...args:any[])=>any>(callback:T,deps:readonly unknown[]):T;
 /** Supplement for read-only V826 quality subscriptions used by V901. Test-only. */
 export function useSyncExternalStore<T>(subscribe:(notify:()=>void)=>()=>void,getSnapshot:()=>T,getServerSnapshot?:()=>T):T;
}
declare namespace JSX {interface IntrinsicElements {[tag:string]:{[property:string]:any;children?:any}}}
