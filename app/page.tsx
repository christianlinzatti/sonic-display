import {MusicProvider} from "@/context/MusicContext";
import {AudioAnalysisProvider} from "@/context/AudioAnalysisContext";
import {VisualizerProvider} from "@/context/VisualizerContext";
import {SonicDisplay} from "@/components/SonicDisplay";
export default function Home(){return <MusicProvider><AudioAnalysisProvider><VisualizerProvider><SonicDisplay/></VisualizerProvider></AudioAnalysisProvider></MusicProvider>;}
