/** Pure, deterministic presentation policy; does not change any performance settings. */
export type DashboardInput = {fps:number|null;framesSampled:number;slowFrames:number;active:boolean;quality:number;motionSamples:number;schedulerTier:"normal"|"constrained"|"critical"|"disabled";animationTier:"high"|"balanced"|"low"};
export function deriveMotionDashboardStatus(input:DashboardInput) {
  const slowPercent = input.framesSampled > 0 ? Math.max(0,Math.min(100,input.slowFrames/input.framesSampled*100)) : null;
  if (!input.active || input.fps == null || !Number.isFinite(input.fps))
    return {label:"Keine Live-Messung",explanation:"Visualizer starten, um aktuelle Frame-Daten zu sehen.",slowPercent:null};
  if (input.schedulerTier === "critical" || input.fps < 25 || (slowPercent !== null && slowPercent > 30))
    return {label:"Hohe Last",explanation:"Grafikdetails prüfen; Beat, IK und Clip-Wiedergabe bleiben ungedrosselt.",slowPercent};
  if (input.schedulerTier === "constrained" || input.fps < 45 || (slowPercent !== null && slowPercent > 10))
    return {label:"Erhöhte Last",explanation:"Nichtkritische Motion-Nebenberechnungen können seltener laufen.",slowPercent};
  if (input.motionSamples > 0 && input.quality < 65)
    return {label:"Motion-Hinweis",explanation:"Die heuristische Bewegungsqualität weist auf mögliche Artefakte hin.",slowPercent};
  return {label:"Stabil",explanation:"Keine auffällige Last in den zuletzt gemeldeten Stichproben.",slowPercent};
}
