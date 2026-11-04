/** Test-only contextual event types; loaded solely by isolated V916 UI check.
 * NEVER include this stub in the production TypeScript project.
 */
declare namespace JSX {
 interface IntrinsicElements {
  input: {onChange?:(event:{target:HTMLInputElement})=>void;[prop:string]:any};
  select: {onChange?:(event:{target:HTMLSelectElement})=>void;[prop:string]:any};
 }
}
