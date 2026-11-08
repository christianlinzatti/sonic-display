/** Pure checks for screenshots and responsive browser layout (V1105).
 * No browser, network, telemetry or hardware dependency.
 */
export interface ViewportAuditV1105 {
  viewportWidth: number;
  scrollWidth: number;
  dialogLeft: number;
  dialogRight: number;
  dialogWidth: number;
  searchVisible: boolean;
  headingVisible: boolean;
}
export interface ViewportAuditResultV1105 {
  passed: boolean;
  reasons: string[];
  overflowPx: number;
}
export function auditViewportV1105(data: ViewportAuditV1105): ViewportAuditResultV1105 {
  const reasons: string[] = [];
  const values=[data.viewportWidth,data.scrollWidth,data.dialogLeft,data.dialogRight,data.dialogWidth];
  if(values.some(x=>!Number.isFinite(x))||data.viewportWidth<=0||data.dialogWidth<=0){
    return {passed:false,reasons:['invalid dimensions'],overflowPx:0};
  }
  const overflowPx=Math.max(0,data.scrollWidth-data.viewportWidth);
  if(overflowPx>2)reasons.push('horizontal page overflow');
  if(data.dialogLeft < -2||data.dialogRight > data.viewportWidth+2)reasons.push('dialog outside viewport');
  if(data.dialogRight<=data.dialogLeft||Math.abs(data.dialogRight-data.dialogLeft-data.dialogWidth)>3)reasons.push('dialog geometry inconsistent');
  if(!data.searchVisible)reasons.push('settings search not visible');
  if(!data.headingVisible)reasons.push('settings heading not visible');
  return {passed:reasons.length===0,reasons,overflowPx};
}
