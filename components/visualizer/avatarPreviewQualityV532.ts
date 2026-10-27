/** V532 – three high-value human-checkable GLB animation preview comparisons.
 * Deliberately never claims that animation content equality implies visual
 * quality; a user can approve only after seeing both actual 3D previews.
 */
export const PREVIEW_QUALITY_CLIPS_V532 = ["Idle_Groove", "Dance_RapTwoStep", "Dance_ClubGroove"] as const;
export type PreviewModeV532 = "original" | "installed";
export type PreviewClipV532 = {name:string;index:number};
export function previewChecksV532(clips:ReadonlyArray<{name:string;index:number}>):PreviewClipV532[] {
  return PREVIEW_QUALITY_CLIPS_V532.flatMap(name => {
    const matched=clips.find(c=>c.name===name && Number.isInteger(c.index) && c.index>=0);
    return matched ? [{name,index:matched.index}] : [];
  });
}
export function reviewKeyV532(itemId:string,clipName:string):string {
  return `${itemId}:${clipName}`;
}
