from pathlib import Path
r=Path('/mnt/data/work_v759')
def change(name,a,b,count=1):
 p=r/name;s=p.read_text();n=s.count(a);assert n>=count,(name,a,n);p.write_text(s.replace(a,b,count))
change('components/visualizer/GltfDancerAvatarV492.tsx', 'import {createNaturalDanceStateV758,directNaturalDanceV758} from "./naturalDanceMotionV758";', 'import {createNaturalDanceStateV758,directNaturalDanceV758} from "./naturalDanceMotionV758";\nimport {createDanceVarietyStateV759,stepDanceVarietyV759} from "./intelligentDanceVarietyV759";')
change('components/visualizer/GltfDancerAvatarV492.tsx','const genreDanceV666=useRef(newGenreDanceStateV666());','const genreDanceV666=useRef(newGenreDanceStateV666());\n  const varietyStateV759=useRef(createDanceVarietyStateV759());')
change('components/visualizer/GltfDancerAvatarV492.tsx','    // V684: slow, phrase-based variety', '''    // V759 varies only EXISTING expressive rig scalars at musical phrase boundaries.
    // It never replaces GLB clips or touches feet, hips, root, lip sync or IK.
    const varietyV759=stepDanceVarietyV759(varietyStateV759.current,genreV666Result.motion,{
      settings:groovePreferences.avatarDanceVarietyV759,trackId:track?.id,modelId:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,bpm:audio.bpm,genre,section:showCue?.enabled?showCue.section:performance.section,
      slot:workloadSlot,playing:isPlaying,reducedMotion,
      manualPriority:avatarMotionMode==='choreography'||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||!!clipChoiceV328||!!phraseChoiceV329,
      quality:getActivePerformanceTier(),qualityGain:propsLipSyncV367?.qualityDanceGainV750??1,
    });
    varietyStateV759.current=varietyV759.state;
    // V684: slow, phrase-based variety''')
change('components/visualizer/GltfDancerAvatarV492.tsx','refineNaturalDanceRigV684(genreV666Result.motion,{','refineNaturalDanceRigV684(varietyV759.motion,{')
change('components/visualizer/AvatarEditor.tsx', 'import {createHipStudioStateV738,resetHipStudioV738,sampleHipStudioV738,type HipStudioSettingsV738} from \'./hipMotionStudioV738\';', 'import {createHipStudioStateV738,resetHipStudioV738,sampleHipStudioV738,type HipStudioSettingsV738} from \'./hipMotionStudioV738\';\nimport {createDanceVarietyStateV759,stepDanceVarietyV759,type DanceVarietySettingsV759} from \'./intelligentDanceVarietyV759\';')
change('components/visualizer/AvatarEditor.tsx', 'naturalBodyV740, naturalDanceV758, gluteV741', 'naturalBodyV740, naturalDanceV758, varietyV759, gluteV741')
change('components/visualizer/AvatarEditor.tsx', 'naturalDanceV758:Partial<NaturalDanceSettingsV758>|undefined;', 'naturalDanceV758:Partial<NaturalDanceSettingsV758>|undefined;\n  varietyV759:Partial<DanceVarietySettingsV759>|undefined;')
change('components/visualizer/AvatarEditor.tsx', 'const danceStateV758=useRef(createNaturalDanceStateV758());','const danceStateV758=useRef(createNaturalDanceStateV758());\n  const varietyStateV759=useRef(createDanceVarietyStateV759());')
change('components/visualizer/AvatarEditor.tsx', '    applyAvatarRigMotion(targets,blendNaturalBodyV740(blendHipDanceV735(neutral,naturalV758.hip),naturalV758.body),delta);', '''    const previewMotionV758=blendNaturalBodyV740(blendHipDanceV735(neutral,naturalV758.hip),naturalV758.body);
    // V759 preview uses a simulated clock / selected section (no inferred singer or clip).
    const previewVarietyV759=stepDanceVarietyV759(varietyStateV759.current,previewMotionV758,{
      settings:varietyV759,trackId:url,modelId:url,seconds:elapsed.current,
      delta,bpm:hipBpm,section:hipSection,genre:hipGenre,slot:previewSlotV745,
      playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip,quality:'high',
    });
    varietyStateV759.current=previewVarietyV759.state;
    applyAvatarRigMotion(targets,previewVarietyV759.motion,delta);''')
change('components/visualizer/AvatarEditor.tsx', 'naturalDanceV758={preferences.avatarNaturalDanceV758}', 'naturalDanceV758={preferences.avatarNaturalDanceV758} varietyV759={preferences.avatarDanceVarietyV759}')
change('components/SettingsPanel.tsx','import {DEFAULT_NATURAL_DANCE_V758,normalizeNaturalDanceV758} from "@/components/visualizer/naturalDanceMotionV758";', 'import {DEFAULT_NATURAL_DANCE_V758,normalizeNaturalDanceV758} from "@/components/visualizer/naturalDanceMotionV758";\nimport {DEFAULT_DANCE_VARIETY_V759,normalizeDanceVarietyV759} from "@/components/visualizer/intelligentDanceVarietyV759";')
change('components/SettingsPanel.tsx','const naturalDanceV758=normalizeNaturalDanceV758(preferences.avatarNaturalDanceV758);','const naturalDanceV758=normalizeNaturalDanceV758(preferences.avatarNaturalDanceV758);\n  const danceVarietyV759=normalizeDanceVarietyV759(preferences.avatarDanceVarietyV759);')
change('components/SettingsPanel.tsx','          <fieldset><legend>Advanced Hip & Glute Rig · V741</legend>', '''          <fieldset><legend>Intelligent Dance Variety · V759</legend>
            <label><input type="checkbox" checked={danceVarietyV759.enabled} onChange={e=>updatePreferences({avatarDanceVarietyV759:{...danceVarietyV759,enabled:e.target.checked}})}/> Automatische Phrasenvariationen aktivieren</label>
            {([['strength','Gesamtstärke'],['variety','Motivwechsel'],['transition','Weiche Übergänge']] as const).map(([key,label])=><label key={key}>{label} ({danceVarietyV759[key]} %)<input type="range" min="0" max="100" step="5" value={danceVarietyV759[key]} onChange={e=>updatePreferences({avatarDanceVarietyV759:{...danceVarietyV759,[key]:Number(e.target.value)}})}/></label>)}
            <label>Phrasenlänge <select value={danceVarietyV759.phraseBeats} onChange={e=>updatePreferences({avatarDanceVarietyV759:{...danceVarietyV759,phraseBeats:Number(e.target.value) as 4|8|16}})}><option value="4">4 Beats</option><option value="8">8 Beats</option><option value="16">16 Beats</option></select></label>
            <small>V759 variiert nur vorhandene Bewegungen bei Verse, Hook und Drop. Kein automatisches Austauschen von GLB-Clips; manuelle Timelines, Sängersteuerung und Foot-IK bleiben geschützt. Avatar-Vorschau mit simulierten Takten.</small>
            <button type="button" onClick={()=>updatePreferences({avatarDanceVarietyV759:{...DEFAULT_DANCE_VARIETY_V759}})}>V759 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Advanced Hip & Glute Rig · V741</legend>''')
change('context/UiPreferencesContext.tsx','avatarNaturalDanceV758:{enabled:true,strength:65,balance:75,followThrough:65,transition:70},','avatarNaturalDanceV758:{enabled:true,strength:65,balance:75,followThrough:65,transition:70},avatarDanceVarietyV759:{enabled:true,strength:65,variety:75,phraseBeats:8,transition:65},')
change('types/music.ts','avatarNaturalDanceV758?: import("@/components/visualizer/naturalDanceMotionV758").NaturalDanceSettingsV758;', 'avatarNaturalDanceV758?: import("@/components/visualizer/naturalDanceMotionV758").NaturalDanceSettingsV758;\n  avatarDanceVarietyV759?: import("@/components/visualizer/intelligentDanceVarietyV759").DanceVarietySettingsV759;')
