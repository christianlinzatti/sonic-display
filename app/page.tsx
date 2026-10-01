import {MusicProvider} from "@/context/MusicContext";
import {AudioAnalysisProvider} from "@/context/AudioAnalysisContext";
import {SonicDisplay} from "@/components/SonicDisplay";
export default function Home(){return <MusicProvider><AudioAnalysisProvider><SonicDisplay/></AudioAnalysisProvider></MusicProvider>;}
