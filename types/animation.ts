import type { AudioMetrics } from "./audio";
import type { MusicGenre } from "@/config/musicGenres";
export type { MusicGenre } from "@/config/musicGenres";
export { GENRES } from "@/config/musicGenres";
export type AnimationFrame = { genre: MusicGenre; beat: number; bass: number; mids: number; highs: number; isPlaying: boolean; trackId: string | null };
export type MusicAnimationControllerProps = { frame: AnimationFrame; onGenreChange: (genre: MusicGenre) => void };
