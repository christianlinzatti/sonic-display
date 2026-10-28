declare module "@/types/music" {
  export interface UiPreferences {
    stageTheme: "classic"|"neon"|"festival"|"minimal"|"cyberpunk"|"vaporwave"|"galaxy"|"white"|"rock";
    stageReactive:boolean;stageLightStrength:number;
    avatarVocalCameraV369?:"off"|"auto"|"performance";
    avatarVocalCameraStrengthV369?:number;rapCameraEnabledV429?:boolean;
    lyricsFontSize:number;lyricsFocusMode:boolean;lyricsImmersiveEnabled:boolean;
    multiAvatarMode?:"solo"|"sync"|"mirror"|"duet";
    avatarDancePreset:"auto"|"hardstyle"|"techno"|"rock-metal"|"robot"|"ambient"|"freestyle";
    avatarLipSyncEnabled:boolean;concertDetailEnabledV555?:boolean;concertDetailStrengthV555?:number;
    reducedMotion:boolean;
  }
}
