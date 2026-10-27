/** V533 – bounded, opt-in additions to the existing motion library.
 * Pure policy, no DOM, file access or upload side effects.
 * An avatar may have many stored motion clips, but only one active override.
 */
export const MAX_MOTION_CLIPS_PER_GLB_V533=64;

export function planAdditionalMotionClipsV533(names:readonly string[],selected:number,importAll:boolean):number[] {
 if(!Number.isInteger(selected)||selected<0||selected>=names.length)throw Error('Ungültige Clip-Auswahl');
 if(!names.length)throw Error('Keine Clips vorhanden');
 if(importAll&&names.length>MAX_MOTION_CLIPS_PER_GLB_V533)
   throw Error(`Maximal ${MAX_MOTION_CLIPS_PER_GLB_V533} Clips pro GLB-Datei`);
 const indices=importAll?names.map((_,index)=>index):[selected];
 for(const index of indices){if(!names[index]?.trim())throw Error(`Clip ${index+1} ohne Namen`);}
 return indices;
}

export function validateMotionAssignmentV533(appendOnly:boolean,alreadyAssignedInBatch:boolean,
 hasActiveMotion:boolean,replaceActiveMotion:boolean):string|null {
 if(appendOnly)return null; // library-only imports never activate or overwrite a preset
 if(alreadyAssignedInBatch)return 'Pro Avatar kann nur eine aktive Motion gleichzeitig installiert werden';
 if(hasActiveMotion&&!replaceActiveMotion)return 'Vorhandene aktive Motion: Ersetzen erst bestätigen';
 return null;
}

export function explainAdditionalMotionQualityV533(warnings:number,analyzedTracks:number):string {
 if(analyzedTracks<=0)return 'Kein verwertbarer Animationskanal: GLB erneut überprüfen';
 if(warnings>0)return `${warnings} technische Hinweise: Bewegung zusätzlich in der 3D-Vorschau kontrollieren`;
 return 'Keine technischen Auffälligkeiten in den geprüften Daten. Die 3D-Sichtprüfung bleibt erforderlich';
}
