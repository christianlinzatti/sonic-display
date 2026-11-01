/** TEST-ONLY JSX/React declarations: avoid claiming full React/Next app types. */
declare module 'react' {
 export function useEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
 export function useRef<T>(initial:T):{current:T};
 export function useState<T>(initial:T|(()=>T)):[T,(next:T|((previous:T)=>T))=>void];
}
declare namespace JSX {
 interface IntrinsicElements {
  [elementName:string]:{children?:any;[attribute:string]:any};
 }
}
declare module '*.css' {}
