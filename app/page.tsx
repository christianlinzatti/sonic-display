import {MusicProvider} from "@/context/MusicContext";
import {AudioAnalysisProvider} from "@/context/AudioAnalysisContext";
import {VisualizerProvider} from "@/context/VisualizerContext";
import {SonicDisplay} from "@/components/SonicDisplay";
import {LiveMoodProviderV678} from "@/components/LiveMoodProviderV678";
import {SmartConcertLookControllerV677} from "@/components/SmartConcertLookControllerV677";
export default function Home(){return <MusicProvider><AudioAnalysisProvider><VisualizerProvider><LiveMoodProviderV678><SmartConcertLookControllerV677/><SonicDisplay/></LiveMoodProviderV678></VisualizerProvider></AudioAnalysisProvider></MusicProvider>;}
