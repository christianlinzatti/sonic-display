/** Isolated V588 typecheck only. The real app uses the installed React types. */
declare module 'react' {
  export function useEffect(effect:()=>void | (()=>void), deps?:readonly unknown[]):void;
  export function useRef<T>(initial:T):{current:T};
  export function useState<T>(initial:T):[T,(next:T|((prev:T)=>T))=>void];
}
