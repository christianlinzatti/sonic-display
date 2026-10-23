"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { registerLiveStageCanvas } from "./liveStagePreviewStateV301";
/** Register the existing R3F output; this component draws nothing. */
export function LiveStageCanvasBridgeV301() {
  const canvas = useThree(s => s.gl.domElement);
  useEffect(() => {
    registerLiveStageCanvas(canvas);
    return () => registerLiveStageCanvas(null);
  }, [canvas]);
  return null;
}
