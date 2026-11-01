import type {VocalTimeLibraryV496} from '../../components/visualizer/vocalTimeDirectorV496';
import type {VocalAssignmentV385} from '../../components/visualizer/manualVocalCastingV385';
import type {RapDuetAssignmentV416} from '../../components/visualizer/rapDuetStudioV416';
export type Prefs={vocalTimeSegmentsV496?:VocalTimeLibraryV496;vocalTimeEnabledV496?:boolean;
 avatarVocalAssignmentsV385?:Record<string,VocalAssignmentV385[]>;rapDuetAssignmentsV416?:Record<string,RapDuetAssignmentV416[]>};
export declare function useUiPreferences():{preferences:Prefs;updatePreferences:(partial:Partial<Prefs>)=>void};
