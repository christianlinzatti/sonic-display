/** V315: apply user-approved, per-field proposals with conflict-aware session undo. */
import {readShowQualitySettingsV310,writeShowQualitySettingsV310} from './smartShowQualityV310';
import {refreshDanceQualitySettings,writeDanceQualitySettings} from './danceQualityV307';
import {refreshDancePerformanceV311,writeDancePerformanceV311} from './advancedDancePerformanceV311';
import {improvementFieldEnabledV315,improvementValueV315,withImprovementValueV315,
  type ImprovementFieldV315,type ImprovementSettingsV315,type ImprovementSuggestionV315} from './danceImprovementAssistantV315';
export type ImprovementUndoV315={fields:ImprovementFieldV315[];before:ImprovementSettingsV315;after:ImprovementSettingsV315};
export type ImprovementApplyResultV315={ok:boolean;reason:string;undo:ImprovementUndoV315|null};
export function readImprovementSettingsV315():ImprovementSettingsV315{
  return {quality:readShowQualitySettingsV310(),dance:refreshDanceQualitySettings(),performance:refreshDancePerformanceV311()};
}
function writeChanges(before:ImprovementSettingsV315,after:ImprovementSettingsV315){
  if(JSON.stringify(before.quality)!==JSON.stringify(after.quality))writeShowQualitySettingsV310(after.quality);
  if(JSON.stringify(before.dance)!==JSON.stringify(after.dance))writeDanceQualitySettings(after.dance);
  if(JSON.stringify(before.performance)!==JSON.stringify(after.performance))writeDancePerformanceV311(after.performance);
}
export function applyImprovementSuggestionsV315(items:ImprovementSuggestionV315[]):ImprovementApplyResultV315{
  if(!items.length)return {ok:false,reason:'Keine Änderung ausgewählt.',undo:null};
  const before=readImprovementSettingsV315();
  const paths=new Set<ImprovementFieldV315>();
  for(const item of items){
    if(paths.has(item.field)||!improvementFieldEnabledV315(before,item.field)||improvementValueV315(before,item.field)!==item.before)
      return {ok:false,reason:'Einstellungen wurden seit der Vorschau verändert. Bitte die Analyse aktualisieren.',undo:null};
    paths.add(item.field);
  }
  let after=before;
  for(const item of items)after=withImprovementValueV315(after,item.field,item.after);
  if(items.every(item=>improvementValueV315(before,item.field)===improvementValueV315(after,item.field)))
    return {ok:false,reason:'Alle ausgewählten Regler haben bereits den vorgeschlagenen Wert.',undo:null};
  writeChanges(before,after);
  return {ok:true,reason:`${items.length} Änderung(en) übernommen.`,undo:{fields:[...paths],before,after}};
}
export function undoImprovementSuggestionsV315(undo:ImprovementUndoV315):{restored:number;skipped:number}{
  const current=readImprovementSettingsV315();let next=current;let restored=0,skipped=0;
  for(const field of undo.fields){
    // Respect any edits made after applying the suggestions, including edits in another tab.
    if(improvementValueV315(current,field)!==improvementValueV315(undo.after,field)){skipped++;continue;}
    next=withImprovementValueV315(next,field,improvementValueV315(undo.before,field));restored++;
  }
  writeChanges(current,next);
  return {restored,skipped};
}
