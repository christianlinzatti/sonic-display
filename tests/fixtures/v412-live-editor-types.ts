// Compile with tsc --strict --noEmit --skipLibCheck --target ES2022 --moduleResolution node
import { normalizeRapEditorV408, type RapPerformanceEditorSettingsV408 } from '../../components/visualizer/rapPerformanceEditorV408';
const optionalSettings:RapPerformanceEditorSettingsV408|undefined=undefined;
const rapLiveEditorV412=normalizeRapEditorV408(optionalSettings);
const gain=1.12;
const live:RapPerformanceEditorSettingsV408={...rapLiveEditorV412,enabled:true,
  head:(rapLiveEditorV412.enabled?rapLiveEditorV412.head:100)*gain,
  gestures:(rapLiveEditorV412.enabled?rapLiveEditorV412.gestures:100)*gain,
};
const context:{editorV408?:RapPerformanceEditorSettingsV408}={editorV408:live};
void context;
