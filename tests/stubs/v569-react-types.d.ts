declare module 'react' {
 export function useSyncExternalStore<T>(subscribe:(onChange:()=>void)=>(()=>void), getSnapshot:()=>T, getServerSnapshot?:()=>T):T;
}
