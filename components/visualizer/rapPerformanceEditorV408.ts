/** V408 – user-tunable gain layer for the *existing*, word-validated V407 performance.
 * Ratios are bounded. The editor cannot turn on disabled vocals, fabricate beats,
 * replace a choreography or interfere with singer-role authorization. */
export interface RapPerformanceEditorSettingsV408 {
  enabled: boolean;
  head: number;
  gestures: number;
  verse: number;
  hook: number;
  kick: number;
  snare: number;
  lipSync: number;
}

export const DEFAULT_RAP_PERFORMANCE_V408: Readonly<RapPerformanceEditorSettingsV408> = Object.freeze({
  enabled:false, head:100, gestures:100, verse:100, hook:100, kick:100, snare:100, lipSync:100,
});
export type RapPerformanceEditorGainV408=Exclude<keyof RapPerformanceEditorSettingsV408,"enabled">;
export const RAP_EDITOR_GAIN_KEYS_V408: ReadonlyArray<RapPerformanceEditorGainV408> = [
  "head","gestures","verse","hook","kick","snare","lipSync",
];
export function rapEditorGainV408(
  settings:RapPerformanceEditorSettingsV408|null|undefined,key:RapPerformanceEditorGainV408,
):number {
  if(settings?.enabled!==true) return 1;
  const value=settings[key];
  if(typeof value!=="number"||!Number.isFinite(value))return 1;
  return Math.min(1.5,Math.max(0,value/100));
}

/** The V408 lip slider multiplies rather than overwrites the existing V367
 * mouth-strength control; disabling V408 preserves the original value. */
export function rapLipStrengthV408(base:number,settings:RapPerformanceEditorSettingsV408|null|undefined):number {
  const safe=Number.isFinite(base)?Math.min(150,Math.max(0,base)):90;
  return Math.min(150,Math.max(0,safe*rapEditorGainV408(settings,"lipSync")));
}

export function normalizeRapEditorV408(
  input: Partial<RapPerformanceEditorSettingsV408>|null|undefined,
):RapPerformanceEditorSettingsV408 {
  const result={...DEFAULT_RAP_PERFORMANCE_V408,enabled:input?.enabled===true};
  for(const key of RAP_EDITOR_GAIN_KEYS_V408){
    const v=input?.[key];
    result[key]=typeof v==="number"&&Number.isFinite(v)?Math.max(0,Math.min(150,Math.round(v))):100;
  }
  return result;
}
