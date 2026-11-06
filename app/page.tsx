import {AlexaArtistControlV1007} from "@/components/AlexaArtistControlV1007";
import {GoveeMusicSyncV909} from "@/components/GoveeMusicSyncV909";
import {MusicProvider} from "@/context/MusicContext";
import {AudioAnalysisProvider} from "@/context/AudioAnalysisContext";
import {VisualizerProvider} from "@/context/VisualizerContext";
import {SonicDisplay} from "@/components/SonicDisplay";
import {LiveMoodProviderV678} from "@/components/LiveMoodProviderV678";
import {SmartConcertLookControllerV677} from "@/components/SmartConcertLookControllerV677";
export default function Home(){return <MusicProvider><AlexaArtistControlV1007/><AudioAnalysisProvider><VisualizerProvider><LiveMoodProviderV678><SmartConcertLookControllerV677/><GoveeMusicSyncV909/><SonicDisplay/></LiveMoodProviderV678></VisualizerProvider></AudioAnalysisProvider></MusicProvider>;}
