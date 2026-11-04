/** V886: isolated UI-test supplemental React API. NEVER imported by production. */
declare module 'react' {
 export function useSyncExternalStore<T>(subscribe:(notify:()=>void)=>()=>void,
  getSnapshot:()=>T,getServerSnapshot?:()=>T):T;
}
