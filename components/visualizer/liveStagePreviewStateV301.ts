/** Share only the existing stage canvas. No additional WebGL renderer is created. */
export const LIVE_STAGE_CANVAS_EVENT = "sonic-live-stage-canvas-v301";
let stageCanvas: HTMLCanvasElement | null = null;
export function registerLiveStageCanvas(canvas: HTMLCanvasElement | null) {
  stageCanvas = canvas;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(LIVE_STAGE_CANVAS_EVENT));
}
export function currentLiveStageCanvas(): HTMLCanvasElement | null { return stageCanvas; }
export const LIVE_STAGE_MAX_FPS = 8;
