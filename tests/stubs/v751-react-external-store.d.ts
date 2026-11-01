/** Test-only React hook declaration; do not include in production tsconfig. */
declare module 'react' {
  export function useSyncExternalStore<T>(subscribe:(listener:()=>void)=>()=>void,getSnapshot:()=>T,getServerSnapshot?:()=>T):T;
}
