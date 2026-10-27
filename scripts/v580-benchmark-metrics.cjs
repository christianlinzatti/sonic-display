'use strict';
/** Pure V580 postprocessor, receives only sampled browser frames from REAL CDP run. */
function summarizeFrames(samples, options={}){
 if(!Array.isArray(samples)||samples.length<60||samples.some(x=>!Number.isFinite(x)||x<=0))
   return {status:'insufficient-data',frames:Array.isArray(samples)?samples.length:0};
 const sorted=[...samples].sort((a,b)=>a-b);
 const quantile=q=>sorted[Math.min(sorted.length-1,Math.ceil(q*sorted.length)-1)];
 const durationMs=samples.reduce((a,b)=>a+b,0);
 const fps=samples.length*1000/durationMs;
 const budget=1000/(Number.isFinite(options.targetFps)&&options.targetFps>0?options.targetFps:30);
 return {status:'measured',frames:samples.length,durationSeconds:Math.round(durationMs/1000*100)/100,
  averageFps:Math.round(fps*100)/100,medianFrameMs:Math.round(quantile(.5)*100)/100,
  p95FrameMs:Math.round(quantile(.95)*100)/100,p99FrameMs:Math.round(quantile(.99)*100)/100,
  maxFrameMs:Math.round(sorted[sorted.length-1]*100)/100,
  aboveBudgetPercent:Math.round(samples.filter(ms=>ms>budget).length/samples.length*10000)/100,
  longFrameCount:samples.filter(ms=>ms>100).length,
  // rAF is display/frame pacing, NOT validated GPU render time.
  meaning:'Browser rAF frame pacing only; not GPU frame time or lip-sync accuracy'};
}
module.exports={summarizeFrames};
