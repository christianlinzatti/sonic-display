/** Shared V527 scene semantics; visual spotlight is not a vocalist ID. */
export type EnsembleFocusV527='none'|'lead'|'handoff'|'ensemble'|'drop';
export type EnsembleSceneV527='off'|'verse'|'feature'|'handoff'|'hook'|'drop';
export const cinematicFocusV527=(scene:EnsembleSceneV527):EnsembleFocusV527=>
 scene==='handoff'?'handoff':scene==='hook'?'ensemble':scene==='drop'?'drop':scene==='off'?'none':'lead';
